import "server-only";
import type { AnyBulkWriteOperation, Collection, Document } from "mongodb";
import { FUEL_TYPES, INQUIRY_TYPES, TRANSMISSIONS } from "../constants";
import { isDuplicateKey, withMongo } from "../mongo";
import { toPhoto } from "../photos";
import type { FuelType, Inquiry, InquiryType, Photo, Transmission, Vehicle, VehicleExtras } from "../types";
import {
  BODY_PART_KEYS,
  BODY_TYPES,
  DRIVETRAINS,
  FEATURE_KEYS,
  HEAVY_DAMAGE_LABELS,
  PART_STATE_KEYS,
  TRADE_LABELS,
  type Inspection,
} from "../vehicle-specs";
import type { DataBackend, InquiryRecord, VehicleList } from "./types";

/**
 * MongoDB saklama katmanı: "vehicles" ve "inquiries" koleksiyonları.
 * Fotoğraflar Cloudinary'de kalır; kayıtta yalnızca kimlikleri (photoIds) tutulur.
 */

interface VehicleDoc extends Omit<Vehicle, "id" | "photos"> {
  _id: string; // İlan No
  photoIds: string[];
}

interface InquiryDoc {
  _id: string; // Talep No
  createdAt: Date;
  date: string; // "25.11.2026 10:30"
  vehicleId: string | null;
  vehicleSummary: string | null;
  type: InquiryType;
  formLang: "ar" | "en" | null;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: string;
  submissionKey: string;
}

const run = <T,>(fn: Parameters<typeof withMongo<VehicleDoc, InquiryDoc, T>>[0]) => withMongo<VehicleDoc, InquiryDoc, T>(fn);

// ---------------------------------------------------------------------------
// Kayıt <-> Araç dönüşümü
// ---------------------------------------------------------------------------

function vehicleToDoc(v: Vehicle): VehicleDoc {
  const { id, photos, ...rest } = v;
  return { _id: id, ...rest, photoIds: photos.map((p) => p.id) };
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const int = (v: unknown): number | null => {
  const n = typeof v === "string" && /^\d+$/.test(v.trim()) ? Number(v) : v;
  return typeof n === "number" && Number.isSafeInteger(n) && n >= 0 ? n : null;
};
const oneOf = <T extends string>(v: unknown, keys: readonly T[]): T | "" => (keys.includes(v as T) ? (v as T) : "");

/**
 * Kayıt elle (ör. Atlas panelinden) değiştirilmiş olabileceği için her alan kontrol edilir.
 * Zorunlu alanlardan biri bozuksa araç gösterilmez ve yönetim panelinde uyarı çıkar.
 */
function docToVehicle(d: Record<string, unknown>): Vehicle | string {
  const id = str(d._id).trim();
  if (!id) return "İlan No boş olan bir kayıt var";
  const make = str(d.make).trim();
  const model = str(d.model).trim();
  const year = int(d.year);
  const mileage = int(d.mileage);
  const price = int(d.price);
  const fuel = oneOf<FuelType>(d.fuel, FUEL_TYPES);
  const transmission = oneOf<Transmission>(d.transmission, TRANSMISSIONS);
  const problems = [
    !make && "Marka",
    !model && "Model",
    year === null && "Model Yılı",
    mileage === null && "Kilometre",
    price === null && "Fiyat",
    !fuel && "Yakıt",
    !transmission && "Vites",
  ].filter(Boolean);
  if (problems.length) return `${id}: ${problems.join(", ")} hatalı veya boş`;

  const rawInspection = d.inspection && typeof d.inspection === "object" ? (d.inspection as Record<string, unknown>) : {};
  const inspection: Inspection = {};
  for (const part of BODY_PART_KEYS) {
    const state = oneOf(rawInspection[part], PART_STATE_KEYS);
    if (state) inspection[part] = state;
  }
  const extras: VehicleExtras = {
    bodyType: oneOf(d.bodyType, BODY_TYPES),
    color: str(d.color).slice(0, 30),
    engineCc: int(d.engineCc),
    enginePower: int(d.enginePower),
    drivetrain: oneOf(d.drivetrain, DRIVETRAINS),
    trade: oneOf(d.trade, Object.keys(TRADE_LABELS) as (keyof typeof TRADE_LABELS)[]),
    heavyDamage: oneOf(d.heavyDamage, Object.keys(HEAVY_DAMAGE_LABELS) as (keyof typeof HEAVY_DAMAGE_LABELS)[]),
    tramer: int(d.tramer),
    inspection,
    features: Array.isArray(d.features) ? d.features.filter((f): f is string => FEATURE_KEYS.includes(f as string)) : [],
  };
  const photoIds = Array.isArray(d.photoIds) ? d.photoIds.filter((p): p is string => typeof p === "string") : [];
  return {
    ...extras,
    id,
    status: d.status === "yayinda" ? "yayinda" : "taslak",
    make,
    model,
    year: year!,
    mileage: mileage!,
    fuel: fuel as FuelType,
    transmission: transmission as Transmission,
    price: price!,
    description: str(d.description),
    photos: photoIds.map(toPhoto).filter((p): p is Photo => p !== null),
    sahibindenUrl: str(d.sahibindenUrl),
    createdAt: str(d.createdAt),
    updatedAt: str(d.updatedAt),
  };
}

function inquiryToDoc({ inquiry, submissionKey, status }: InquiryRecord, createdAt: Date): InquiryDoc {
  return {
    _id: inquiry.id,
    createdAt,
    date: inquiry.date,
    vehicleId: inquiry.vehicleId,
    vehicleSummary: inquiry.vehicleSummary,
    type: inquiry.type,
    formLang: inquiry.formLang ?? null,
    fullName: inquiry.fullName,
    phone: inquiry.phone,
    email: inquiry.email,
    message: inquiry.message,
    status,
    submissionKey,
  };
}

function docToInquiry(d: InquiryDoc): Inquiry {
  return {
    id: str(d._id),
    date: str(d.date),
    vehicleId: str(d.vehicleId) || null,
    vehicleSummary: str(d.vehicleSummary) || null,
    type: oneOf(d.type, INQUIRY_TYPES) || "bilgi",
    formLang: d.formLang === "ar" || d.formLang === "en" ? d.formLang : undefined,
    fullName: str(d.fullName),
    phone: str(d.phone),
    email: str(d.email) || null,
    message: str(d.message) || null,
  };
}

/** "25.11.2026 10:30" (İstanbul saati) → Date. Tanınmazsa null. */
function parseDisplayDate(text: string): Date | null {
  const m = text.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return null;
  const date = new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4] ?? "00"}:${m[5] ?? "00"}:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ---------------------------------------------------------------------------
// Arayüz
// ---------------------------------------------------------------------------

export const mongoBackend: DataBackend = {
  kind: "mongo",

  listVehicles: () =>
    run(async ({ vehicles }): Promise<VehicleList> => {
      const result: VehicleList = { vehicles: [], issues: [] };
      for (const doc of await vehicles.find({}).toArray()) {
        const v = docToVehicle(doc as unknown as Record<string, unknown>);
        if (typeof v === "string") result.issues.push(v);
        else result.vehicles.push(v);
      }
      return result;
    }),

  insertVehicle: (build) =>
    run(async ({ vehicles }) => {
      const taken = new Set((await vehicles.distinct("_id")).map(String));
      for (let attempt = 0; ; attempt++) {
        const vehicle = build(taken);
        try {
          await vehicles.insertOne(vehicleToDoc(vehicle));
          return vehicle;
        } catch (error) {
          // Aynı anda aynı ilan numarası üretildiyse (çok düşük ihtimal) yeni numarayla tekrar denenir.
          if (!isDuplicateKey(error) || attempt >= 2) throw error;
          taken.add(vehicle.id);
        }
      }
    }),

  updateVehicle: (id, build) =>
    run(async ({ vehicles }) => {
      const doc = await vehicles.findOne({ _id: id });
      if (!doc) return "missing";
      const previous = docToVehicle(doc as unknown as Record<string, unknown>);
      if (typeof previous === "string") return "invalid";
      const updated = build(previous);
      // Kayıt bu arada başka bir yerde değiştiyse üzerine yazılmaz.
      const res = await vehicles.replaceOne({ _id: id, updatedAt: previous.updatedAt }, vehicleToDoc(updated));
      if (res.matchedCount === 0) return (await vehicles.countDocuments({ _id: id })) ? "conflict" : "missing";
      return { previous, updated };
    }),

  deleteVehicle: (id) =>
    run(async ({ vehicles }) => {
      const doc = await vehicles.findOneAndDelete({ _id: id });
      if (!doc) return "missing";
      return Array.isArray(doc.photoIds) ? doc.photoIds.filter((p): p is string => typeof p === "string") : [];
    }),

  addInquiry: (record) =>
    run(async ({ inquiries }) => {
      try {
        await inquiries.insertOne(inquiryToDoc(record, new Date()));
        return record.inquiry.id;
      } catch (error) {
        if (!isDuplicateKey(error)) throw error;
        const existing = await inquiries.findOne({ submissionKey: record.submissionKey }, { projection: { _id: 1 } });
        if (!existing) throw error;
        return existing._id;
      }
    }),

  listInquiries: () =>
    run(async ({ inquiries }) => (await inquiries.find({}).sort({ createdAt: -1, _id: -1 }).toArray()).map(docToInquiry)),

  listInquiryRecords: () =>
    run(async ({ inquiries }) =>
      (await inquiries.find({}).sort({ createdAt: 1 }).toArray()).map((d) => ({
        inquiry: docToInquiry(d),
        submissionKey: str(d.submissionKey),
        status: str(d.status) || "Yeni",
      })),
    ),
};

/** Yalnızca olmayan kayıtları ekler; eklenen kayıt sayısını döner. Çakışan (zaten var olan) kayıtlar atlanır. */
async function upsertNew<T extends Document>(collection: Collection<T>, ops: AnyBulkWriteOperation<T>[]): Promise<number> {
  try {
    return (await collection.bulkWrite(ops, { ordered: false })).upsertedCount;
  } catch (error) {
    const e = error as { name?: string; result?: { upsertedCount?: number }; writeErrors?: { code?: number }[] | { code?: number } };
    const writeErrors = Array.isArray(e.writeErrors) ? e.writeErrors : e.writeErrors ? [e.writeErrors] : [];
    if (e.name === "MongoBulkWriteError" && writeErrors.length > 0 && writeErrors.every((w) => w.code === 11000)) {
      return e.result?.upsertedCount ?? 0;
    }
    throw error;
  }
}

/**
 * Google Sheets'ten okunan kayıtları MongoDB'ye ekler. Aynı numaralı kayıt zaten varsa dokunulmaz,
 * bu yüzden güvenle tekrar çalıştırılabilir. Kaynak (Sheets) hiçbir şekilde değiştirilmez.
 */
export function importRecords(source: { vehicles: Vehicle[]; inquiries: InquiryRecord[] }) {
  return run(async ({ vehicles, inquiries }) => {
    let vehiclesAdded = 0;
    let inquiriesAdded = 0;
    if (source.vehicles.length) {
      vehiclesAdded = await upsertNew(
        vehicles,
        source.vehicles.map((v) => {
          const { _id, ...doc } = vehicleToDoc(v);
          return { updateOne: { filter: { _id }, update: { $setOnInsert: doc }, upsert: true } };
        }),
      );
    }
    if (source.inquiries.length) {
      // Sheets'teki sıra korunur; tarihi okunamayan talepler öncekinin hemen ardına yerleştirilir.
      let last = new Date("2020-01-01T00:00:00Z").getTime();
      inquiriesAdded = await upsertNew(
        inquiries,
        source.inquiries.map((r) => {
          const parsed = parseDisplayDate(r.inquiry.date)?.getTime();
          last = parsed && parsed > last ? parsed : last + 1;
          const { _id, ...doc } = inquiryToDoc(r, new Date(last));
          return { updateOne: { filter: { _id }, update: { $setOnInsert: doc }, upsert: true } };
        }),
      );
    }
    return {
      vehiclesAdded,
      vehiclesSkipped: source.vehicles.length - vehiclesAdded,
      inquiriesAdded,
      inquiriesSkipped: source.inquiries.length - inquiriesAdded,
    };
  });
}
