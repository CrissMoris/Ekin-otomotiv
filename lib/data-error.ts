/**
 * Veritabanına (MongoDB) ulaşılamadığında fırlatılır.
 * Mesaj Türkçedir ve yalnızca ayar adlarını içerir (gizli değerleri asla).
 */
export class DataSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataSourceError";
  }
}
