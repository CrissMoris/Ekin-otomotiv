import type { Inquiry, Vehicle } from "../types";

/** Okunabilen araçlar ve okunamayan kayıtlar (yönetim panelinde uyarı olarak gösterilir). */
export interface VehicleList {
  vehicles: Vehicle[];
  issues: string[];
}

/** Bir talep ve yalnızca saklama katmanının bildiği ek alanlar. */
export interface InquiryRecord {
  inquiry: Inquiry;
  submissionKey: string; // aynı formun iki kez gönderilmesini önler
  status: string; // "Yeni"
}

export type UpdateResult = { previous: Vehicle; updated: Vehicle } | "missing" | "invalid" | "conflict";

/**
 * Veri saklama katmanı. Google Sheets ve MongoDB aynı arayüzü uygular;
 * sitenin geri kalanı yalnızca lib/store.ts üzerinden çalışır.
 */
export interface DataBackend {
  readonly kind: "sheets" | "mongo";
  listVehicles(): Promise<VehicleList>;
  /** `build`, kullanılmış ilan numaralarını alıp yeni aracı üretir. */
  insertVehicle(build: (takenIds: Set<string>) => Vehicle): Promise<Vehicle>;
  /** `build` önceki kaydı alıp yenisini üretir; hata fırlatarak işlemi durdurabilir. */
  updateVehicle(id: string, build: (previous: Vehicle) => Vehicle): Promise<UpdateResult>;
  /** Silinen aracın fotoğraf kimliklerini döner. */
  deleteVehicle(id: string): Promise<string[] | "missing" | "invalid">;
  /** Aynı gönderim anahtarıyla daha önce kayıt varsa onun numarasını döner. */
  addInquiry(record: InquiryRecord): Promise<string>;
  /** En yeni talep en üstte. */
  listInquiries(): Promise<Inquiry[]>;
  /** Tüm talepler, ek alanlarıyla (yalnızca veri aktarımında kullanılır). */
  listInquiryRecords(): Promise<InquiryRecord[]>;
}
