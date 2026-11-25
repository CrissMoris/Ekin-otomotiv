// Hem tarayıcıda (anında geri bildirim) hem sunucuda (asıl güvenlik kontrolü) kullanılan doğrulama kuralları.
import { FUEL_TYPES, INQUIRY_TYPES, MAX_PHOTOS_PER_VEHICLE, TRANSMISSIONS } from "./constants";
import type { FuelType, InquiryType, Transmission, VehicleInput, VehicleStatus } from "./types";

export type FieldErrors = Record<string, string>;
export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

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
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[2-5]/.test(digits)) return null;
  return digits;
}

export function formatPhone(tenDigits: string): string {
  const d = tenDigits;
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}][\p{L} .'-]*$/u;

export function validateInquiry(input: Record<string, unknown>): ValidationResult<InquiryFormData> {
  const errors: FieldErrors = {};

  const fullName = clean(input.fullName);
  if (!fullName) errors.fullName = "Ad soyad alanı zorunludur.";
  else if (fullName.length < 3) errors.fullName = "Ad soyad en az 3 karakter olmalıdır.";
  else if (fullName.length > 80) errors.fullName = "Ad soyad en fazla 80 karakter olabilir.";
  else if (!NAME_RE.test(fullName)) errors.fullName = "Ad soyad yalnızca harf içermelidir.";

  const phoneRaw = clean(input.phone);
  const phone = normalizePhone(phoneRaw);
  if (!phoneRaw) errors.phone = "Telefon numarası zorunludur.";
  else if (!phone) errors.phone = "Geçerli bir telefon numarası girin (örn. 05321234567).";

  const email = clean(input.email);
  if (email && (email.length > 120 || !EMAIL_RE.test(email))) {
    errors.email = "Geçerli bir e-posta adresi girin.";
  }

  const type = asString(input.type) as InquiryType;
  if (!INQUIRY_TYPES.includes(type)) errors.type = "Lütfen talep türünü seçin.";

  const message = asString(input.message).trim();
  if (message.length > 1000) errors.message = "Mesaj en fazla 1000 karakter olabilir.";

  const vehicleId = clean(input.vehicleId);
  if (vehicleId && !/^[A-Za-z0-9-]{2,30}$/.test(vehicleId)) errors.vehicleId = "Araç bilgisi geçersiz.";

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

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
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
