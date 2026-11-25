import "server-only";
import { createHash } from "node:crypto";
import { cloudinaryConfig } from "./config";

/**
 * Cloudinary: fotoğraflar tarayıcıdan doğrudan Cloudinary'ye yüklenir (sunucu yalnızca imza üretir),
 * Sheets'e yalnızca fotoğrafın kimliği (public_id) yazılır.
 */

const API_BASE = "https://api.cloudinary.com/v1_1";
const DELIVERY_BASE = "https://res.cloudinary.com";

/** Cloudinary imza kuralı: parametreler alfabetik sıralanır, "a=1&b=2" + gizli anahtar → SHA-1. */
export function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

/** Tarayıcının tek bir fotoğrafı yükleyebilmesi için gereken imzalı alanlar. */
export function uploadSignature() {
  const cfg = cloudinaryConfig();
  if (!cfg) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: cfg.folder, timestamp };
  return {
    uploadUrl: `${API_BASE}/${cfg.cloudName}/image/upload`,
    fields: { ...params, api_key: cfg.apiKey, signature: signParams(params, cfg.apiSecret) },
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  const cfg = cloudinaryConfig();
  if (!cfg) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    api_key: cfg.apiKey,
    signature: signParams(params, cfg.apiSecret),
  });
  const res = await fetch(`${API_BASE}/${cfg.cloudName}/image/destroy`, { method: "POST", body, cache: "no-store" });
  if (!res.ok) throw new Error(`Cloudinary silme hatası: ${res.status}`);
}

export function isCloudinaryId(id: string): boolean {
  const cfg = cloudinaryConfig();
  return Boolean(cfg && id.startsWith(`${cfg.folder}/`) && /^[\w\-/.]+$/.test(id));
}

/** Kimlikten, boyutlandırılmış ve otomatik formatlı görsel adresi üretir. */
export function imageUrl(publicId: string, size: "large" | "thumb"): string | null {
  const cfg = cloudinaryConfig();
  if (!cfg) return null;
  const t = size === "large" ? "c_limit,w_1600,f_auto,q_auto" : "c_fill,w_640,h_480,f_auto,q_auto";
  return `${DELIVERY_BASE}/${cfg.cloudName}/image/upload/${t}/${publicId}`;
}
