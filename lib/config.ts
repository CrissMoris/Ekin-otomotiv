import "server-only";
import { createHash } from "node:crypto";

/**
 * Ortam değişkenleri tek yerden okunur.
 *  - Araçlar ve talepler Google Sheets'te, fotoğraflar Cloudinary'de tutulur.
 *  - Ayarlar eksikse site açık bir Türkçe hata mesajı gösterir.
 */

/**
 * Ortam değişkenini okur: baştaki/sondaki boşlukları ve yanlışlıkla eklenmiş tırnakları temizler
 * (ör. Vercel'e .env dosyasındaki gibi "..." ile yapıştırılmış değerler).
 */
export function env(name: string): string | undefined {
  let v = process.env[name]?.trim();
  if (v && v.length >= 2 && (v[0] === '"' || v[0] === "'") && v.at(-1) === v[0]) v = v.slice(1, -1).trim();
  return v || undefined;
}

export const SHEETS_VARS = ["GOOGLE_SHEET_ID", "GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"] as const;

export function sheetsConfig() {
  // Tam Sheets adresi yapıştırılmışsa yalnızca /d/ ile /edit arasındaki kod alınır.
  const rawId = env("GOOGLE_SHEET_ID");
  const sheetId = rawId?.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? rawId;
  const clientEmail = env("GOOGLE_CLIENT_EMAIL");
  const privateKey = env("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n").replace(/\r/g, "").trim();
  if (!sheetId || !clientEmail || !privateKey) return null;
  return { sheetId, clientEmail, privateKey };
}

/** Eksik Google Sheets değişkenlerinin adları (değerleri değil). */
export function missingSheetsVars(): string[] {
  return SHEETS_VARS.filter((name) => !env(name));
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
 * Oturum çerezini imzalayan anahtar. SESSION_SECRET verilmezse PIN ile Google özel anahtarından türetilir.
 * Canlı ortamda SESSION_SECRET tanımlanması önerilir.
 */
export function getSessionSecret(): string | null {
  const configured = env("SESSION_SECRET");
  if (configured && configured.length >= 32) return configured;
  const pin = getAdminPin();
  if (!pin) return null;
  const extra = sheetsConfig()?.privateKey ?? "ekin-otomotiv";
  return createHash("sha256").update(`ekin-oturum:${pin}:${extra}`).digest("hex");
}
