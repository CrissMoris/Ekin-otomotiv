import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { connection } from "next/server";
import { nowDisplay, nowStamp } from "./format";
import { isAllowedPhotoId, removePhotos, toPhoto } from "./photos";
import type { Inquiry, Photo, Vehicle, VehicleFilters, VehicleInput, VehicleStatus } from "./types";
import * as db from "./repository";
import type { InquiryFormData } from "./validation";

/**
 * Tüm veri işlemleri burada. Araçlar ve talepler MongoDB'de, fotoğraflar Cloudinary'de tutulur. Sayfalar ve API uçları yalnızca bu dosyadaki fonksiyonları kullanır.
 */

/** Kullanıcıya gösterilebilir hata (Türkçe mesajlı). */
export class StoreError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "StoreError";
  }
}

const norm = (s: string) => s.trim().toLocaleLowerCase("tr");
const notFound = () => new StoreError("Araç bulunamadı. Silinmiş olabilir.", 404);
const invalidRecord = () => new StoreError("Bu aracın kaydında hatalı bilgi var; yönetim panelindeki uyarıya bakın.", 409);
const conflict = () => new StoreError("Bu araç siz düzenlerken başka bir yerde güncellendi. Sayfayı yenileyip tekrar deneyin.", 409);

// ---------------------------------------------------------------------------
// Okuma
// ---------------------------------------------------------------------------

/** Herkese açık sayfalar için önbellekli liste (en fazla 1 dakikada bir veritabanından okunur). */
async function cachedVehicles(): Promise<Vehicle[]> {
  "use cache";
  cacheTag("araclar");
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  return (await db.listVehicles()).vehicles;
}

function refreshPublicCache() {
  revalidateTag("araclar", { expire: 0 });
}

export async function getPublishedVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  await connection();
  const list = (await cachedVehicles()).filter((v) => {
    if (v.status !== "yayinda") return false;
    if (filters.make && norm(v.make) !== norm(filters.make)) return false;
    if (filters.minPrice && v.price < filters.minPrice) return false;
    if (filters.maxPrice && v.price > filters.maxPrice) return false;
    if (filters.minYear && v.year < filters.minYear) return false;
    if (filters.maxYear && v.year > filters.maxYear) return false;
    return true;
  });
  const sorters: Record<string, (a: Vehicle, b: Vehicle) => number> = {
    "fiyat-artan": (a, b) => a.price - b.price,
    "fiyat-azalan": (a, b) => b.price - a.price,
    "km-artan": (a, b) => a.mileage - b.mileage,
  };
  return list.sort(sorters[filters.sort ?? ""] ?? ((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function getPublishedVehicle(id: string): Promise<Vehicle | null> {
  return (await getPublishedVehicles()).find((v) => v.id === id) ?? null;
}

export async function getMakes(): Promise<string[]> {
  const makes = new Set((await getPublishedVehicles()).map((v) => v.make));
  return [...makes].sort((a, b) => a.localeCompare(b, "tr"));
}

/** Yönetim paneli: her zaman güncel (önbelleksiz) veri. */
export async function getAllVehicles(): Promise<{ vehicles: Vehicle[]; issues: string[] }> {
  await connection();
  const result = await db.listVehicles();
  return {
    vehicles: result.vehicles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    issues: result.issues,
  };
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  return (await getAllVehicles()).vehicles.find((v) => v.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Yazma (yalnızca yönetici API uçlarından çağrılır)
// ---------------------------------------------------------------------------

function newVehicleId(existing: Set<string>): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id: string;
  do {
    id = "EKN-" + Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
  } while (existing.has(id));
  return id;
}

function buildPhotos(ids: string[]): Photo[] {
  return [...new Set(ids)].map((id) => {
    const photo = isAllowedPhotoId(id) ? toPhoto(id) : null;
    if (!photo) throw new StoreError("Fotoğraflardan biri geçersiz. Lütfen fotoğrafları yeniden seçin.");
    return photo;
  });
}

function fromInput(input: VehicleInput) {
  const { photoIds, ...fields } = input;
  return { ...fields, photos: buildPhotos(photoIds) };
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const now = nowStamp();
  const fields = fromInput(input);
  const vehicle = await db.insertVehicle((taken) => ({ ...fields, id: newVehicleId(taken), createdAt: now, updatedAt: now }));
  refreshPublicCache();
  return vehicle;
}

export async function updateVehicle(id: string, input: VehicleInput, expectedUpdatedAt?: string): Promise<Vehicle> {
  const fields = fromInput(input);
  const result = await db.updateVehicle(id, (previous) => {
    if (expectedUpdatedAt && previous.updatedAt !== expectedUpdatedAt) throw conflict();
    return { ...previous, ...fields, updatedAt: nowStamp() };
  });
  if (result === "missing") throw notFound();
  if (result === "invalid") throw invalidRecord();
  if (result === "conflict") throw conflict();
  refreshPublicCache();
  const kept = new Set(result.updated.photos.map((p) => p.id));
  await removePhotos(result.previous.photos.map((p) => p.id).filter((p) => !kept.has(p)));
  return result.updated;
}

export async function setVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
  const current = await getVehicle(id);
  if (!current) throw notFound();
  if (status === "yayinda" && current.photos.length === 0) {
    throw new StoreError("Fotoğrafı olmayan bir araç yayına alınamaz. Önce fotoğraf ekleyin.");
  }
  return updateVehicle(id, { ...current, status, photoIds: current.photos.map((p) => p.id) }, current.updatedAt);
}

export async function deleteVehicle(id: string): Promise<void> {
  const result = await db.deleteVehicle(id);
  if (result === "missing") throw notFound();
  refreshPublicCache();
  await removePhotos(result); // önce kayıt silinir, sitede kırık ilan kalmaz
}

// ---------------------------------------------------------------------------
// Talepler
// ---------------------------------------------------------------------------

/** Talebi kaydeder. Aynı gönderim anahtarıyla gelen ikinci istek yeni kayıt oluşturmaz. */
export async function addInquiry(data: InquiryFormData, submissionKey: string, lang: "tr" | "en" | "ar" = "tr"): Promise<string> {
  let vehicleSummary: string | null = null;
  if (data.vehicleId) {
    const vehicle = await getPublishedVehicle(data.vehicleId);
    if (!vehicle) throw new StoreError("Bu araç artık yayında değil. Lütfen başka bir araç seçin veya bizi arayın.", 404);
    vehicleSummary = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
  }
  const inquiry: Inquiry = {
    id: `TLP-${randomUUID().slice(0, 8).toUpperCase()}`,
    date: nowDisplay(),
    vehicleSummary,
    ...data,
    formLang: lang === "tr" ? undefined : lang,
  };
  return db.addInquiry({ inquiry, submissionKey, status: "Yeni" });
}

export async function listInquiries(): Promise<Inquiry[]> {
  await connection();
  return db.listInquiries();
}
