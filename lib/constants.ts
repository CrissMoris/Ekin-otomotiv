import type { FuelType, InquiryType, Transmission, VehicleStatus } from "./types";

export const SITE_NAME = "Ekin Otomotiv";
export const SAHIBINDEN_URL = "https://ekinotomotiv77.sahibinden.com/";

/** İletişim bilgileri. E-posta boş bırakılırsa sitede gösterilmez. */
export const CONTACT = {
  legalName: "Ekin Otomotiv",
  phone: "0531 504 95 71",
  phoneHref: "tel:+905315049571",
  email: "",
  address: "Sanayi, Kirazlı / Yalova",
  hours: "Pazartesi – Cumartesi 09:00 – 19:00",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  benzin: "Benzin",
  dizel: "Dizel",
  lpg: "LPG",
  "benzin-lpg": "Benzin & LPG",
  hibrit: "Hibrit",
  elektrik: "Elektrik",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manuel: "Manuel",
  otomatik: "Otomatik",
  "yari-otomatik": "Yarı Otomatik",
};

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  yayinda: "Yayında",
  taslak: "Taslak",
};

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  "satin-alma": "Satın alma",
  takas: "Takas",
  "arac-satis": "Aracımı satmak istiyorum",
  bilgi: "Bilgi talebi",
};

export const FUEL_TYPES = Object.keys(FUEL_LABELS) as FuelType[];
export const TRANSMISSIONS = Object.keys(TRANSMISSION_LABELS) as Transmission[];
export const INQUIRY_TYPES = Object.keys(INQUIRY_TYPE_LABELS) as InquiryType[];

export const MAX_PHOTOS_PER_VEHICLE = 15;
