import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { connection } from "next/server";
import { deleteImage, imageUrl, isCloudinaryId } from "./cloudinary";
import { FUEL_LABELS, FUEL_TYPES, INQUIRY_TYPE_LABELS, TRANSMISSIONS, TRANSMISSION_LABELS } from "./constants";
import { nowDisplay, nowStamp } from "./format";
import { appendRow, deleteRow, headerIndex, readSheet, SheetsError, updateRow, type Cell } from "./sheets";
import type { FuelType, Inquiry, InquiryType, Photo, Transmission, Vehicle, VehicleFilters, VehicleInput, VehicleStatus } from "./types";
import type { InquiryFormData } from "./validation";

/**
 * Tüm veri işlemleri burada: araçlar ve talepler Google Sheets'te, fotoğraflar Cloudinary'de tutulur.
 * Sayfalar ve API uçları yalnızca bu dosyadaki fonksiyonları kullanır.
 */

/** Kullanıcıya gösterilebilir hata (Türkçe mesajlı). */
export class StoreError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "StoreError";
  }
}

const VEHICLES_TAB = "Araclar";
const INQUIRIES_TAB = "Talepler";

export const VEHICLE_HEADERS = [
  "İlan No", "Durum", "Marka", "Model", "Model Yılı", "Kilometre", "Yakıt", "Vites", "Fiyat",
  "Açıklama", "Fotoğraflar", "Sahibinden Linki", "Eklenme Tarihi", "Güncelleme Tarihi",
] as const;

export const INQUIRY_HEADERS = [
  "Talep No", "Tarih", "İlan No", "Araç", "Talep Türü", "Ad Soyad", "Telefon", "E-posta", "Mesaj", "Durum", "Gönderim Anahtarı",
] as const;

// ---------------------------------------------------------------------------
// Fotoğraflar
// ---------------------------------------------------------------------------

/** Sheets'teki fotoğraf değerinden (kimlik veya adres) gösterim adreslerini üretir. */
export function toPhoto(id: string): Photo | null {
  if (/^https:\/\/\S+$/.test(id)) return { id, url: id, thumb: id };
  const large = imageUrl(id, "large");
  const thumb = imageUrl(id, "thumb");
  return large && thumb ? { id, url: large, thumb } : null;
}

function isAllowedPhotoId(id: string): boolean {
  if (/^https:\/\/\S+$/.test(id)) return true;
  return isCloudinaryId(id);
}

async function removePhotos(ids: string[]) {
  for (const id of ids) {
    try {
      if (isCloudinaryId(id)) await deleteImage(id);
    } catch (error) {
      console.error("Fotoğraf silinemedi (kayıt etkilenmedi):", id, error);
    }
  }
}

// ---------------------------------------------------------------------------
// Sheets satırı <-> Araç dönüşümü
// ---------------------------------------------------------------------------

const norm = (s: string) => s.trim().toLocaleLowerCase("tr");
const toInt = (s: string) => {
  const n = Number(s.replace(/\D/g, ""));
  return s.replace(/\D/g, "") && Number.isSafeInteger(n) ? n : null;
};
function matchOption<T extends string>(value: string, keys: readonly T[], labels: Record<T, string>): T | null {
  const v = norm(value);
  return keys.find((k) => norm(k) === v || norm(labels[k]) === v) ?? null;
}

function rowToVehicle(row: string[], col: Map<string, number>): Vehicle | string {
  const get = (h: (typeof VEHICLE_HEADERS)[number]) => (row[col.get(h)!] ?? "").trim();
  const id = get("İlan No");
  if (!id) return "İlan No boş";
  const year = toInt(get("Model Yılı"));
  const mileage = toInt(get("Kilometre"));
  const price = toInt(get("Fiyat"));
  const fuel = matchOption<FuelType>(get("Yakıt"), FUEL_TYPES, FUEL_LABELS);
  const transmission = matchOption<Transmission>(get("Vites"), TRANSMISSIONS, TRANSMISSION_LABELS);
  const problems = [
    !get("Marka") && "Marka",
    !get("Model") && "Model",
    year === null && "Model Yılı",
    mileage === null && "Kilometre",
    price === null && "Fiyat",
    !fuel && "Yakıt",
    !transmission && "Vites",
  ].filter(Boolean);
  if (problems.length) return `${id}: ${problems.join(", ")} hatalı veya boş`;
  const status: VehicleStatus = ["yayında", "yayinda", "evet", "aktif"].includes(norm(get("Durum"))) ? "yayinda" : "taslak";
  const photos = get("Fotoğraflar")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(toPhoto)
    .filter((p): p is Photo => p !== null);
  return {
    id,
    status,
    make: get("Marka"),
    model: get("Model"),
    year: year!,
    mileage: mileage!,
    fuel: fuel!,
    transmission: transmission!,
    price: price!,
    description: get("Açıklama"),
    photos,
    sahibindenUrl: get("Sahibinden Linki"),
    createdAt: get("Eklenme Tarihi"),
    updatedAt: get("Güncelleme Tarihi"),
  };
}

function vehicleToRow(v: Vehicle, col: Map<string, number>, base: string[] = []): Cell[] {
  const width = Math.max(base.length, ...col.values()) + 1;
  const row: Cell[] = Array.from({ length: width }, (_, i) => base[i] ?? "");
  const set = (h: (typeof VEHICLE_HEADERS)[number], value: Cell) => (row[col.get(h)!] = value);
  set("İlan No", v.id);
  set("Durum", v.status === "yayinda" ? "Yayında" : "Taslak");
  set("Marka", v.make);
  set("Model", v.model);
  set("Model Yılı", v.year);
  set("Kilometre", v.mileage);
  set("Yakıt", FUEL_LABELS[v.fuel]);
  set("Vites", TRANSMISSION_LABELS[v.transmission]);
  set("Fiyat", v.price);
  set("Açıklama", v.description);
  set("Fotoğraflar", v.photos.map((p) => p.id).join(", "));
  set("Sahibinden Linki", v.sahibindenUrl);
  set("Eklenme Tarihi", v.createdAt);
  set("Güncelleme Tarihi", v.updatedAt);
  return row;
}

interface SheetVehicles {
  vehicles: Vehicle[];
  issues: string[]; // okunamayan satırlar (yönetim panelinde uyarı olarak gösterilir)
  rows: string[][];
  col: Map<string, number>;
}

async function readSheetVehicles(): Promise<SheetVehicles> {
  const rows = await readSheet(VEHICLES_TAB);
  if (rows.length === 0) throw new SheetsError("“Araclar” sekmesi boş. İlk satıra başlıkları ekleyin.");
  const col = headerIndex(rows[0], VEHICLE_HEADERS, VEHICLES_TAB);
  const vehicles: Vehicle[] = [];
  const issues: string[] = [];
  rows.slice(1).forEach((row, i) => {
    if (row.every((c) => !c.trim())) return; // boş satır
    const result = rowToVehicle(row, col);
    if (typeof result === "string") issues.push(`Satır ${i + 2}: ${result}`);
    else vehicles.push(result);
  });
  return { vehicles, issues, rows, col };
}

// ---------------------------------------------------------------------------
// Okuma
// ---------------------------------------------------------------------------

/** Herkese açık sayfalar için önbellekli liste (en fazla 1 dakikada bir Sheets'ten okunur). */
async function cachedVehicles(): Promise<Vehicle[]> {
  "use cache";
  cacheTag("araclar");
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  return (await readSheetVehicles()).vehicles;
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
  const result = await readSheetVehicles();
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

/** Sheets'te aracın satırını bulur (her işlemden hemen önce taze okunur). */
async function locate(id: string) {
  const data = await readSheetVehicles();
  const index = data.rows.findIndex((r, i) => i > 0 && (r[data.col.get("İlan No")!] ?? "").trim() === id);
  if (index < 0) throw new StoreError("Araç bulunamadı. Silinmiş olabilir.", 404);
  const vehicle = data.vehicles.find((v) => v.id === id);
  if (!vehicle) throw new StoreError("Bu aracın Sheets satırında hatalı bilgi var; önce Sheets'te düzeltin.", 409);
  return { data, rowNumber: index + 1, row: data.rows[index], vehicle };
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const now = nowStamp();
  const data = await readSheetVehicles();
  const ids = new Set(data.rows.slice(1).map((r) => (r[data.col.get("İlan No")!] ?? "").trim()));
  const vehicle: Vehicle = { ...fromInput(input), id: newVehicleId(ids), createdAt: now, updatedAt: now };
  await appendRow(VEHICLES_TAB, vehicleToRow(vehicle, data.col));
  refreshPublicCache();
  return vehicle;
}

export async function updateVehicle(id: string, input: VehicleInput, expectedUpdatedAt?: string): Promise<Vehicle> {
  const conflict = new StoreError("Bu araç siz düzenlerken başka bir yerde güncellendi. Sayfayı yenileyip tekrar deneyin.", 409);
  const found = await locate(id);
  const previous = found.vehicle;
  if (expectedUpdatedAt && previous.updatedAt !== expectedUpdatedAt) throw conflict;
  const updated: Vehicle = { ...previous, ...fromInput(input), updatedAt: nowStamp() };
  await updateRow(VEHICLES_TAB, found.rowNumber, vehicleToRow(updated, found.data.col, found.row));
  refreshPublicCache();
  const kept = new Set(updated.photos.map((p) => p.id));
  await removePhotos(previous.photos.map((p) => p.id).filter((p) => !kept.has(p)));
  return updated;
}

export async function setVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
  const current = await getVehicle(id);
  if (!current) throw new StoreError("Araç bulunamadı. Silinmiş olabilir.", 404);
  if (status === "yayinda" && current.photos.length === 0) {
    throw new StoreError("Fotoğrafı olmayan bir araç yayına alınamaz. Önce fotoğraf ekleyin.");
  }
  return updateVehicle(
    id,
    { ...current, status, photoIds: current.photos.map((p) => p.id) },
    current.updatedAt,
  );
}

export async function deleteVehicle(id: string): Promise<void> {
  const found = await locate(id);
  const removed = found.vehicle;
  await deleteRow(VEHICLES_TAB, found.rowNumber);
  refreshPublicCache();
  await removePhotos(removed.photos.map((p) => p.id)); // önce kayıt silinir, sitede kırık ilan kalmaz
}

// ---------------------------------------------------------------------------
// Talepler
// ---------------------------------------------------------------------------

/** Talebi kaydeder. Aynı gönderim anahtarıyla gelen ikinci istek yeni kayıt oluşturmaz. */
export async function addInquiry(data: InquiryFormData, submissionKey: string): Promise<string> {
  let vehicleSummary: string | null = null;
  if (data.vehicleId) {
    const vehicle = await getPublishedVehicle(data.vehicleId);
    if (!vehicle) throw new StoreError("Bu araç artık yayında değil. Lütfen başka bir araç seçin veya bizi arayın.", 404);
    vehicleSummary = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
  }
  const inquiry: Inquiry = { id: `TLP-${randomUUID().slice(0, 8).toUpperCase()}`, date: nowDisplay(), vehicleSummary, ...data };

  const rows = await readSheet(INQUIRIES_TAB);
  if (rows.length === 0) throw new SheetsError("“Talepler” sekmesi boş. İlk satıra başlıkları ekleyin.");
  const col = headerIndex(rows[0], INQUIRY_HEADERS, INQUIRIES_TAB);
  const keyCol = col.get("Gönderim Anahtarı")!;
  const duplicate = rows.find((r) => r[keyCol] === submissionKey);
  if (duplicate) return duplicate[col.get("Talep No")!];

  const row: Cell[] = Array.from({ length: Math.max(...col.values()) + 1 }, () => "");
  const values: Record<(typeof INQUIRY_HEADERS)[number], Cell> = {
    "Talep No": inquiry.id,
    Tarih: inquiry.date,
    "İlan No": inquiry.vehicleId ?? "",
    Araç: inquiry.vehicleSummary ?? "",
    "Talep Türü": INQUIRY_TYPE_LABELS[inquiry.type],
    "Ad Soyad": inquiry.fullName,
    Telefon: inquiry.phone,
    "E-posta": inquiry.email ?? "",
    Mesaj: inquiry.message ?? "",
    Durum: "Yeni",
    "Gönderim Anahtarı": submissionKey,
  };
  for (const [h, v] of Object.entries(values)) row[col.get(h)!] = v;
  await appendRow(INQUIRIES_TAB, row);
  return inquiry.id;
}

export async function listInquiries(): Promise<Inquiry[]> {
  await connection();
  const rows = await readSheet(INQUIRIES_TAB);
  if (rows.length === 0) return [];
  const col = headerIndex(rows[0], INQUIRY_HEADERS, INQUIRIES_TAB);
  const get = (r: string[], h: (typeof INQUIRY_HEADERS)[number]) => (r[col.get(h)!] ?? "").trim();
  return rows
    .slice(1)
    .filter((r) => get(r, "Talep No"))
    .map((r) => ({
      id: get(r, "Talep No"),
      date: get(r, "Tarih"),
      vehicleId: get(r, "İlan No") || null,
      vehicleSummary: get(r, "Araç") || null,
      type: (Object.entries(INQUIRY_TYPE_LABELS).find(([, l]) => l === get(r, "Talep Türü"))?.[0] ?? "bilgi") as InquiryType,
      fullName: get(r, "Ad Soyad"),
      phone: get(r, "Telefon"),
      email: get(r, "E-posta") || null,
      message: get(r, "Mesaj") || null,
    }))
    .reverse();
}
