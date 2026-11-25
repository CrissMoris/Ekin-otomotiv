import "server-only";
import { createHash } from "node:crypto";

/**
 * Ortam değişkenleri tek yerden okunur.
 *  - Araçlar ve talepler Google Sheets'te, fotoğraflar Cloudinary'de tutulur.
 *  - Ayarlar eksikse site açık bir Türkçe hata mesajı gösterir.
 */

export function sheetsConfig() {
  // Tam Sheets adresi yapıştırılmışsa yalnızca /d/ ile /edit arasındaki kod alınır.
  const rawId = process.env.GOOGLE_SHEET_ID?.trim();
  const sheetId = rawId?.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? rawId;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!sheetId || !clientEmail || !privateKey) return null;
  return { sheetId, clientEmail, privateKey };
}

export function cloudinaryConfig() {
  // Cloudinary panelindeki tek satırlık "API environment variable" da kabul edilir:
  // CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
  const fromUrl = process.env.CLOUDINARY_URL?.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || fromUrl?.[3];
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || fromUrl?.[1];
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || fromUrl?.[2];
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret, folder: "ekin-otomotiv" };
}

/** Sitenin canlı adresi (SEO, site haritası ve paylaşım önizlemeleri için). */
export function siteUrl(): string {
  const url = process.env.SITE_URL?.trim() || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return (url || "http://localhost:3000").replace(/\/$/, "");
}

/** Yönetici PIN'i yalnızca ortam değişkeninden okunur (kodda veya GitHub'da tutulmaz). */
export function getAdminPin(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

/**
 * Oturum çerezini imzalayan anahtar. SESSION_SECRET verilmezse PIN ile Google özel anahtarından türetilir.
 * Canlı ortamda SESSION_SECRET tanımlanması önerilir.
 */
export function getSessionSecret(): string | null {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  const pin = getAdminPin();
  if (!pin) return null;
  const extra = sheetsConfig()?.privateKey ?? "ekin-otomotiv";
  return createHash("sha256").update(`ekin-oturum:${pin}:${extra}`).digest("hex");
}
