// Hem tarayıcıda (anında geri bildirim) hem sunucuda (asıl güvenlik kontrolü) kullanılan doğrulama kuralları.
import { FUEL_TYPES, INQUIRY_TYPES, MAX_PHOTOS_PER_VEHICLE, TRANSMISSIONS } from "./constants";
import { t, type Lang } from "./i18n";
import type { FuelType, InquiryType, Transmission, VehicleExtras, VehicleInput, VehicleStatus } from "./types";
import {
  BODY_PART_KEYS,
  BODY_TYPES,
  DRIVETRAINS,
  FEATURE_KEYS,
  HEAVY_DAMAGE_LABELS,
  PART_STATE_KEYS,
  TRADE_LABELS,
  type BodyPart,
  type Inspection,
  type PartState,
} from "./vehicle-specs";

export type FieldErrors = Record<string, string>;
type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const clean = (v: unknown): string => asString(v).replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------------------
// Talep formu
// ---------------------------------------------------------------------------

export interface InquiryFormData {
  fullName: string;
  phone: string;
  email: string | null;
  type: InquiryType;
  message: string | null;
  vehicleId: string | null;
}

/** Telefonu 10 haneye indirger (5XX XXX XX XX). Geçersizse null. */
function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[2-5]/.test(digits)) return null;
  return digits;
}

function formatPhone(tenDigits: string): string {
  const d = tenDigits;
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}][\p{L} .'-]*$/u;

export function validateInquiry(input: Record<string, unknown>, lang: Lang = "tr"): ValidationResult<InquiryFormData> {
  const errors: FieldErrors = {};
  const m = t(lang).validation;

  const fullName = clean(input.fullName);
  if (!fullName) errors.fullName = m.fullNameRequired;
  else if (fullName.length < 3) errors.fullName = m.fullNameMin;
  else if (fullName.length > 80) errors.fullName = m.fullNameMax;
  else if (!NAME_RE.test(fullName)) errors.fullName = m.fullNameLetters;

  const phoneRaw = clean(input.phone);
  const phone = normalizePhone(phoneRaw);
  if (!phoneRaw) errors.phone = m.phoneRequired;
  else if (!phone) errors.phone = m.phoneInvalid;

  const email = clean(input.email);
  if (email && (email.length > 120 || !EMAIL_RE.test(email))) {
    errors.email = m.emailInvalid;
  }

  const type = asString(input.type) as InquiryType;
  if (!INQUIRY_TYPES.includes(type)) errors.type = m.typeRequired;

  const message = asString(input.message).trim();
  if (message.length > 1000) errors.message = m.messageMax;

  const vehicleId = clean(input.vehicleId);
  if (vehicleId && !/^[A-Za-z0-9-]{2,30}$/.test(vehicleId)) errors.vehicleId = m.vehicleInvalid;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      fullName,
      phone: formatPhone(phone!),
      email: email || null,
      type,
      message: message || null,
      vehicleId: vehicleId || null,
    },
  };
}

function isSahibindenUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "sahibinden.com" || url.hostname.endsWith(".sahibinden.com"));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Araç formu (yönetim paneli)
// ---------------------------------------------------------------------------

function toInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isSafeInteger(v)) return v;
  if (typeof v === "string") {
    const digits = v.replace(/\D/g, "");
    if (!digits) return null;
    const n = Number(digits);
    return Number.isSafeInteger(n) ? n : null;
  }
  return null;
}

/** İsteğe bağlı ek bilgiler: yalnızca tanımlı seçenekler kabul edilir, boş bırakılabilir. */
function validateExtras(input: Record<string, unknown>, errors: FieldErrors): VehicleExtras {
  const oneOf = <T extends string>(v: unknown, allowed: readonly T[], field: string, message: string): T | "" => {
    const value = asString(v);
    if (!value) return "";
    if (allowed.includes(value as T)) return value as T;
    errors[field] = message;
    return "";
  };
  const optionalInt = (v: unknown, max: number, field: string, message: string): number | null => {
    if (v === null || v === undefined || (typeof v === "string" && !v.trim())) return null;
    const n = toInt(v);
    if (n === null || n > max) {
      errors[field] = message;
      return null;
    }
    return n;
  };

  const color = clean(input.color);
  if (color.length > 30) errors.color = "Renk en fazla 30 karakter olabilir.";

  const inspection: Inspection = {};
  const rawInspection = input.inspection && typeof input.inspection === "object" ? (input.inspection as Record<string, unknown>) : {};
  for (const [part, state] of Object.entries(rawInspection)) {
    if (BODY_PART_KEYS.includes(part as BodyPart) && PART_STATE_KEYS.includes(state as PartState)) {
      inspection[part as BodyPart] = state as PartState;
    } else if (state) {
      errors.inspection = "Ekspertiz bilgisi geçersiz.";
    }
  }

  const rawFeatures = Array.isArray(input.features) ? input.features : [];
  if (!rawFeatures.every((f) => typeof f === "string" && FEATURE_KEYS.includes(f))) errors.features = "Özellik bilgisi geçersiz.";
  const features = FEATURE_KEYS.filter((k) => rawFeatures.includes(k));

  return {
    bodyType: oneOf(input.bodyType, BODY_TYPES, "bodyType", "Kasa tipini listeden seçin."),
    color,
    engineCc: optionalInt(input.engineCc, 10_000, "engineCc", "Motor hacmini cc olarak girin (örn. 1598)."),
    enginePower: optionalInt(input.enginePower, 2_000, "enginePower", "Motor gücünü hp olarak girin (örn. 120)."),
    drivetrain: oneOf(input.drivetrain, DRIVETRAINS, "drivetrain", "Çekiş türünü listeden seçin."),
    trade: oneOf(input.trade, Object.keys(TRADE_LABELS) as (keyof typeof TRADE_LABELS)[], "trade", "Takas seçeneğini listeden seçin."),
    heavyDamage: oneOf(input.heavyDamage, Object.keys(HEAVY_DAMAGE_LABELS) as (keyof typeof HEAVY_DAMAGE_LABELS)[], "heavyDamage", "Ağır hasar kaydını listeden seçin."),
    tramer: optionalInt(input.tramer, 100_000_000, "tramer", "Tramer tutarını TL olarak girin (kayıt yoksa 0)."),
    inspection,
    features,
  };
}

export function validateVehicle(input: Record<string, unknown>): ValidationResult<VehicleInput> {
  const errors: FieldErrors = {};
  const maxYear = new Date().getFullYear() + 1;

  const make = clean(input.make);
  if (!make) errors.make = "Marka zorunludur.";
  else if (make.length > 40) errors.make = "Marka en fazla 40 karakter olabilir.";

  const model = clean(input.model);
  if (!model) errors.model = "Model zorunludur.";
  else if (model.length > 60) errors.model = "Model en fazla 60 karakter olabilir.";

  const year = toInt(input.year);
  if (year === null) errors.year = "Model yılı zorunludur.";
  else if (year < 1950 || year > maxYear) errors.year = `Model yılı 1950 ile ${maxYear} arasında olmalıdır.`;

  const mileage = toInt(input.mileage);
  if (mileage === null) errors.mileage = "Kilometre zorunludur.";
  else if (mileage > 2_000_000) errors.mileage = "Kilometre değeri çok yüksek görünüyor.";

  const fuel = asString(input.fuel) as FuelType;
  if (!FUEL_TYPES.includes(fuel)) errors.fuel = "Yakıt türünü seçin.";

  const transmission = asString(input.transmission) as Transmission;
  if (!TRANSMISSIONS.includes(transmission)) errors.transmission = "Vites türünü seçin.";

  const price = toInt(input.price);
  if (price === null) errors.price = "Fiyat zorunludur.";
  else if (price < 1000) errors.price = "Fiyat en az 1.000 ₺ olmalıdır.";
  else if (price > 1_000_000_000) errors.price = "Fiyat değeri çok yüksek görünüyor.";

  const description = asString(input.description).trim();
  if (description.length > 3000) errors.description = "Açıklama en fazla 3000 karakter olabilir.";

  const sahibindenUrl = clean(input.sahibindenUrl);
  if (sahibindenUrl && !isSahibindenUrl(sahibindenUrl)) {
    errors.sahibindenUrl = "Geçerli bir sahibinden.com ilan bağlantısı girin (https://www.sahibinden.com/ilan/...).";
  }

  const status = asString(input.status) as VehicleStatus;
  if (status !== "yayinda" && status !== "taslak") errors.status = "Yayın durumunu seçin.";

  const photoIds = Array.isArray(input.photoIds) ? input.photoIds : [];
  if (!photoIds.every((p) => typeof p === "string" && p.length > 0 && p.length < 500)) {
    errors.photos = "Fotoğraf bilgisi geçersiz.";
  } else if (photoIds.length > MAX_PHOTOS_PER_VEHICLE) {
    errors.photos = `En fazla ${MAX_PHOTOS_PER_VEHICLE} fotoğraf ekleyebilirsiniz.`;
  } else if (status === "yayinda" && photoIds.length === 0) {
    errors.photos = "Yayına alınacak araç için en az bir fotoğraf ekleyin.";
  }

  const extras = validateExtras(input, errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      ...extras,
      make,
      model,
      year: year!,
      mileage: mileage!,
      fuel,
      transmission,
      price: price!,
      description,
      sahibindenUrl,
      status,
      photoIds: photoIds as string[],
    },
  };
}

/** Hata nesnesinden tek bir alanı çıkarır (kullanıcı alanı düzelttiğinde). */
export function withoutError(errors: FieldErrors, field: string): FieldErrors {
  const next = { ...errors };
  delete next[field];
  return next;
}
