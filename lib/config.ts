import "server-only";
import { createHash } from "node:crypto";

/**
 * Ortam değişkenleri tek yerden okunur.
 *  - Araçlar ve talepler MongoDB'de, fotoğraflar Cloudinary'de tutulur.
 *  - Ayarlar eksikse site açık bir Türkçe hata mesajı gösterir.
 */

/**
 * Ortam değişkenini okur: baştaki/sondaki boşlukları ve yanlışlıkla eklenmiş tırnakları temizler
 * (ör. Vercel'e .env dosyasındaki gibi "..." ile yapıştırılmış değerler).
 */
function env(name: string): string | undefined {
  let v = process.env[name]?.trim();
  if (v && v.length >= 2 && (v[0] === '"' || v[0] === "'") && v.at(-1) === v[0]) v = v.slice(1, -1).trim();
  return v || undefined;
}

/** MongoDB ayarları (araçlar ve talepler). */
export function mongoConfig() {
  const uri = env("MONGODB_URI")?.replace(/^MONGODB_URI=/, "");
  if (!uri) return null;
  return { uri, dbName: env("MONGODB_DB") || "ekin-otomotiv" };
}

export function cloudinaryConfig() {
  // Cloudinary panelindeki tek satırlık "API environment variable" da kabul edilir:
  // CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
  const fromUrl = env("CLOUDINARY_URL")?.replace(/^CLOUDINARY_URL=/, "").match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#\s]+)/);
  const cloudName = env("CLOUDINARY_CLOUD_NAME") || fromUrl?.[3];
  const apiKey = env("CLOUDINARY_API_KEY") || fromUrl?.[1];
  const apiSecret = env("CLOUDINARY_API_SECRET") || fromUrl?.[2];
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret, folder: "ekin-otomotiv" };
}

/** Sitenin canlı adresi (SEO, site haritası ve paylaşım önizlemeleri için). */
export function siteUrl(): string {
  const url = env("SITE_URL") || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return (url || "http://localhost:3000").replace(/\/$/, "");
}

/** Yönetici PIN'i yalnızca ortam değişkeninden okunur (kodda veya GitHub'da tutulmaz). */
export function getAdminPin(): string | null {
  return env("ADMIN_PASSWORD") ?? null;
}

/**
 * Oturum çerezini imzalayan anahtar. SESSION_SECRET verilmezse PIN ile MongoDB bağlantı adresinden türetilir.
 * Canlı ortamda SESSION_SECRET tanımlanması önerilir.
 */
export function getSessionSecret(): string | null {
  const configured = env("SESSION_SECRET");
  if (configured && configured.length >= 32) return configured;
  const pin = getAdminPin();
  if (!pin) return null;
  const extra = mongoConfig()?.uri ?? "ekin-otomotiv";
  return createHash("sha256").update(`ekin-oturum:${pin}:${extra}`).digest("hex");
}
