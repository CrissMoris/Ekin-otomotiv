// Uygulama genelinde kullanılan veri tipleri.

export type FuelType = "benzin" | "dizel" | "lpg" | "benzin-lpg" | "hibrit" | "elektrik";
export type Transmission = "manuel" | "otomatik" | "yari-otomatik";
export type VehicleStatus = "yayinda" | "taslak";
export type InquiryType = "satin-alma" | "takas" | "arac-satis" | "bilgi";

/** Bir fotoğraf: `id` Sheets'te saklanan değerdir (Cloudinary kimliği ya da https adresi). */
export interface Photo {
  id: string;
  url: string; // büyük görsel
  thumb: string; // kart / küçük görsel
}

export interface Vehicle {
  id: string; // İlan No — değişmez
  status: VehicleStatus;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel: FuelType;
  transmission: Transmission;
  price: number; // TL
  description: string;
  photos: Photo[]; // ilk fotoğraf kapak fotoğrafıdır
  sahibindenUrl: string; // isteğe bağlı ilan bağlantısı
  createdAt: string; // "2026-11-25 10:30:15" (İstanbul saati)
  updatedAt: string;
}

/** Yönetim panelinden gelen araç verisi. */
export interface VehicleInput {
  status: VehicleStatus;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel: FuelType;
  transmission: Transmission;
  price: number;
  description: string;
  sahibindenUrl: string;
  photoIds: string[];
}

export interface Inquiry {
  id: string;
  date: string; // "25.11.2026 10:30"
  vehicleId: string | null;
  vehicleSummary: string | null;
  type: InquiryType;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
}

export interface VehicleFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  sort?: "yeni" | "fiyat-artan" | "fiyat-azalan" | "km-artan";
}
