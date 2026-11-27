import "server-only";
import { FUEL_LABELS, FUEL_TYPES, INQUIRY_TYPE_LABELS, TRANSMISSIONS, TRANSMISSION_LABELS } from "../constants";
import { toPhoto } from "../photos";
import { appendRow, deleteRow, headerIndex, optionalIndex, readSheet, SheetsError, updateRow, type Cell } from "../sheets";
import type { FuelType, Inquiry, InquiryType, Photo, Transmission, Vehicle, VehicleStatus } from "../types";
import {
  BODY_TYPE_LABELS,
  DRIVETRAIN_LABELS,
  featuresFromText,
  featuresToText,
  HEAVY_DAMAGE_LABELS,
  inspectionFromText,
  inspectionToText,
  matchLabel,
  TRADE_LABELS,
} from "../vehicle-specs";
import type { DataBackend, InquiryRecord, VehicleList } from "./types";

/**
 * Google Sheets saklama katmanı: araçlar "Araclar", talepler "Talepler" sekmesinde tutulur.
 * MONGODB_URI tanımlı değilse site bu katmanla çalışır; MongoDB'ye veri aktarımında da kaynak olarak okunur.
 */

const VEHICLES_TAB = "Araclar";
const INQUIRIES_TAB = "Talepler";

const VEHICLE_HEADERS = [
  "İlan No", "Durum", "Marka", "Model", "Model Yılı", "Kilometre", "Yakıt", "Vites", "Fiyat",
  "Açıklama", "Fotoğraflar", "Sahibinden Linki", "Eklenme Tarihi", "Güncelleme Tarihi",
] as const;

/**
 * İsteğe bağlı sütunlar (ek bilgiler, ekspertiz, donanım). Eski dosyalarda yoksa araç yine okunur;
 * panelden ilk kayıtta başlık satırının sonuna otomatik eklenir (mevcut veriler değişmez).
 */
const VEHICLE_OPTIONAL_HEADERS = [
  "Kasa Tipi", "Renk", "Motor Hacmi", "Motor Gücü", "Çekiş", "Takas", "Ağır Hasar Kaydı", "Tramer", "Ekspertiz", "Özellikler",
] as const;
type OptionalHeader = (typeof VEHICLE_OPTIONAL_HEADERS)[number];

const INQUIRY_HEADERS = [
  "Talep No", "Tarih", "İlan No", "Araç", "Talep Türü", "Ad Soyad", "Telefon", "E-posta", "Mesaj", "Durum", "Gönderim Anahtarı",
] as const;

// ---------------------------------------------------------------------------
// Satır <-> Araç dönüşümü
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

function rowToVehicle(row: string[], col: Map<string, number>, opt: Map<string, number>): Vehicle | string {
  const get = (h: (typeof VEHICLE_HEADERS)[number]) => (row[col.get(h)!] ?? "").trim();
  const getOpt = (h: OptionalHeader) => (opt.has(h) ? (row[opt.get(h)!] ?? "").trim() : "");
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
    bodyType: matchLabel(getOpt("Kasa Tipi"), BODY_TYPE_LABELS),
    color: getOpt("Renk").slice(0, 30),
    engineCc: toInt(getOpt("Motor Hacmi")),
    enginePower: toInt(getOpt("Motor Gücü")),
    drivetrain: matchLabel(getOpt("Çekiş"), DRIVETRAIN_LABELS),
    trade: matchLabel(getOpt("Takas"), TRADE_LABELS) || yesNo(getOpt("Takas"), "evet", "hayir"),
    heavyDamage: matchLabel(getOpt("Ağır Hasar Kaydı"), HEAVY_DAMAGE_LABELS) || yesNo(getOpt("Ağır Hasar Kaydı"), "var", "yok"),
    tramer: toInt(getOpt("Tramer")),
    inspection: inspectionFromText(getOpt("Ekspertiz")),
    features: featuresFromText(getOpt("Özellikler")),
  };
}

/** Sheets'e elle "Evet/Hayır" yazılmışsa da tanır. */
function yesNo<T extends string>(value: string, yes: T, no: T): T | "" {
  const v = norm(value);
  if (["evet", "var", "uygun"].includes(v)) return yes;
  if (["hayır", "hayir", "yok", "uygun değil"].includes(v)) return no;
  return "";
}

function vehicleToRow(v: Vehicle, col: Map<string, number>, opt: Map<string, number>, base: string[] = []): Cell[] {
  const width = Math.max(base.length, ...col.values(), ...opt.values()) + 1;
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
  const setOpt = (h: OptionalHeader, value: Cell) => {
    if (opt.has(h)) row[opt.get(h)!] = value;
  };
  setOpt("Kasa Tipi", v.bodyType ? BODY_TYPE_LABELS[v.bodyType].tr : "");
  setOpt("Renk", v.color);
  setOpt("Motor Hacmi", v.engineCc ?? "");
  setOpt("Motor Gücü", v.enginePower ?? "");
  setOpt("Çekiş", v.drivetrain ? DRIVETRAIN_LABELS[v.drivetrain].tr : "");
  setOpt("Takas", v.trade ? TRADE_LABELS[v.trade].tr : "");
  setOpt("Ağır Hasar Kaydı", v.heavyDamage ? HEAVY_DAMAGE_LABELS[v.heavyDamage].tr : "");
  setOpt("Tramer", v.tramer ?? "");
  setOpt("Ekspertiz", inspectionToText(v.inspection));
  setOpt("Özellikler", featuresToText(v.features));
  return row;
}

interface SheetVehicles {
  vehicles: Vehicle[];
  issues: string[]; // okunamayan satırlar (yönetim panelinde uyarı olarak gösterilir)
  rows: string[][];
  col: Map<string, number>;
  opt: Map<string, number>;
}

async function readSheetVehicles(): Promise<SheetVehicles> {
  const rows = await readSheet(VEHICLES_TAB);
  if (rows.length === 0) throw new SheetsError("“Araclar” sekmesi boş. İlk satıra başlıkları ekleyin.");
  const col = headerIndex(rows[0], VEHICLE_HEADERS, VEHICLES_TAB);
  const opt = optionalIndex(rows[0], VEHICLE_OPTIONAL_HEADERS);
  const vehicles: Vehicle[] = [];
  const issues: string[] = [];
  rows.slice(1).forEach((row, i) => {
    if (row.every((c) => !c.trim())) return; // boş satır
    const result = rowToVehicle(row, col, opt);
    if (typeof result === "string") issues.push(`Satır ${i + 2}: ${result}`);
    else vehicles.push(result);
  });
  return { vehicles, issues, rows, col, opt };
}

/**
 * Eksik isteğe bağlı başlıkları "Araclar" sekmesinin ilk satırının sonuna ekler (yalnızca başlık satırı yazılır).
 * Tüm başlıklar zaten varsa hiçbir şey yapmaz.
 */
async function ensureOptionalColumns(data: SheetVehicles): Promise<Map<string, number>> {
  const missing = VEHICLE_OPTIONAL_HEADERS.filter((h) => !data.opt.has(h));
  if (missing.length === 0) return data.opt;
  const header: string[] = [...data.rows[0]];
  while (header.length && !header[header.length - 1].trim()) header.pop();
  const opt = new Map(data.opt);
  for (const h of missing) {
    opt.set(h, header.length);
    header.push(h);
  }
  await updateRow(VEHICLES_TAB, 1, header);
  data.rows[0] = header;
  data.opt = opt;
  return opt;
}


/** Aracın satırını bulur (her işlemden hemen önce taze okunur). */
async function locate(id: string) {
  const data = await readSheetVehicles();
  const index = data.rows.findIndex((r, i) => i > 0 && (r[data.col.get("İlan No")!] ?? "").trim() === id);
  if (index < 0) return "missing" as const;
  const vehicle = data.vehicles.find((v) => v.id === id);
  if (!vehicle) return "invalid" as const;
  return { data, rowNumber: index + 1, row: data.rows[index], vehicle };
}

/** Türkçe dışındaki formlardan gelen talepler "Talep Türü" sütununda işaretlenir. */
const FORM_SUFFIX = { ar: " (Arapça form)", en: " (İngilizce form)" } as const;
const formLangOf = (label: string) =>
  (Object.keys(FORM_SUFFIX) as (keyof typeof FORM_SUFFIX)[]).find((l) => label.endsWith(FORM_SUFFIX[l]));

async function readInquiryRows() {
  const rows = await readSheet(INQUIRIES_TAB);
  if (rows.length === 0) throw new SheetsError("“Talepler” sekmesi boş. İlk satıra başlıkları ekleyin.");
  const col = headerIndex(rows[0], INQUIRY_HEADERS, INQUIRIES_TAB);
  return { rows, col };
}

export const sheetsBackend: DataBackend = {
  kind: "sheets",

  async listVehicles(): Promise<VehicleList> {
    const { vehicles, issues } = await readSheetVehicles();
    return { vehicles, issues };
  },

  async insertVehicle(build) {
    const data = await readSheetVehicles();
    const taken = new Set(data.rows.slice(1).map((r) => (r[data.col.get("İlan No")!] ?? "").trim()));
    const vehicle = build(taken);
    const opt = await ensureOptionalColumns(data);
    await appendRow(VEHICLES_TAB, vehicleToRow(vehicle, data.col, opt));
    return vehicle;
  },

  async updateVehicle(id, build) {
    const found = await locate(id);
    if (typeof found === "string") return found;
    const updated = build(found.vehicle);
    const opt = await ensureOptionalColumns(found.data);
    await updateRow(VEHICLES_TAB, found.rowNumber, vehicleToRow(updated, found.data.col, opt, found.row));
    return { previous: found.vehicle, updated };
  },

  async deleteVehicle(id) {
    const found = await locate(id);
    if (typeof found === "string") return found;
    await deleteRow(VEHICLES_TAB, found.rowNumber);
    return found.vehicle.photos.map((p) => p.id);
  },

  async addInquiry({ inquiry, submissionKey, status }) {
    const { rows, col } = await readInquiryRows();
    const keyCol = col.get("Gönderim Anahtarı")!;
    const duplicate = rows.find((r) => r[keyCol] === submissionKey);
    if (duplicate) return duplicate[col.get("Talep No")!];

    const row: Cell[] = Array.from({ length: Math.max(...col.values()) + 1 }, () => "");
    const values: Record<(typeof INQUIRY_HEADERS)[number], Cell> = {
      "Talep No": inquiry.id,
      Tarih: inquiry.date,
      "İlan No": inquiry.vehicleId ?? "",
      Araç: inquiry.vehicleSummary ?? "",
      "Talep Türü": INQUIRY_TYPE_LABELS[inquiry.type] + (inquiry.formLang ? FORM_SUFFIX[inquiry.formLang] : ""),
      "Ad Soyad": inquiry.fullName,
      Telefon: inquiry.phone,
      "E-posta": inquiry.email ?? "",
      Mesaj: inquiry.message ?? "",
      Durum: status,
      "Gönderim Anahtarı": submissionKey,
    };
    for (const [h, v] of Object.entries(values)) row[col.get(h)!] = v;
    await appendRow(INQUIRIES_TAB, row);
    return inquiry.id;
  },

  async listInquiries() {
    return (await sheetsBackend.listInquiryRecords()).map((r) => r.inquiry).reverse();
  },

  async listInquiryRecords(): Promise<InquiryRecord[]> {
    const rows = await readSheet(INQUIRIES_TAB);
    if (rows.length === 0) return [];
    const col = headerIndex(rows[0], INQUIRY_HEADERS, INQUIRIES_TAB);
    const get = (r: string[], h: (typeof INQUIRY_HEADERS)[number]) => (r[col.get(h)!] ?? "").trim();
    return rows
      .slice(1)
      .filter((r) => get(r, "Talep No"))
      .map((r) => {
        const inquiry: Inquiry = {
          id: get(r, "Talep No"),
          date: get(r, "Tarih"),
          vehicleId: get(r, "İlan No") || null,
          vehicleSummary: get(r, "Araç") || null,
          type: (Object.entries(INQUIRY_TYPE_LABELS).find(
            ([, l]) => l === get(r, "Talep Türü").replace(/ \((Arapça|İngilizce) form\)$/, ""),
          )?.[0] ?? "bilgi") as InquiryType,
          formLang: formLangOf(get(r, "Talep Türü")),
          fullName: get(r, "Ad Soyad"),
          phone: get(r, "Telefon"),
          email: get(r, "E-posta") || null,
          message: get(r, "Mesaj") || null,
        };
        return { inquiry, submissionKey: get(r, "Gönderim Anahtarı"), status: get(r, "Durum") || "Yeni" };
      });
  },
};
