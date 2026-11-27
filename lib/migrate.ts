import "server-only";
import { revalidateTag } from "next/cache";
import { importRecords } from "./backends/mongo";
import { sheetsBackend } from "./backends/sheets";
import { mongoConfig, sheetsConfig } from "./config";
import { DataSourceError } from "./data-error";

/** Aktarım ancak hem MongoDB hem de Google Sheets ayarları tanımlıyken yapılabilir. */
export function canMigrate(): boolean {
  return Boolean(mongoConfig() && sheetsConfig());
}

/**
 * Google Sheets'teki araçları ve talepleri MongoDB'ye kopyalar.
 * Sheets yalnızca okunur, hiçbir değişiklik yapılmaz. MongoDB'de zaten bulunan kayıtlar atlanır,
 * bu yüzden işlem güvenle tekrar çalıştırılabilir.
 */
export async function migrateSheetsToMongo() {
  if (!canMigrate()) {
    throw new DataSourceError("Aktarım için hem MONGODB_URI hem de Google Sheets ayarları tanımlı olmalı.");
  }
  const [{ vehicles, issues }, inquiries] = await Promise.all([sheetsBackend.listVehicles(), sheetsBackend.listInquiryRecords()]);
  const result = await importRecords({ vehicles, inquiries });
  revalidateTag("araclar", { expire: 0 });
  return { ...result, issues };
}
