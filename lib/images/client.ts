// Tarayıcı tarafı fotoğraf işlemleri (yönetim paneli).
import { callApi, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "../client-utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function checkSelectedFile(file: File): string | null {
  if (file.type && !ACCEPTED.includes(file.type)) return `"${file.name}" bir fotoğraf dosyası değil.`;
  if (file.size > 40 * 1024 * 1024) return `"${file.name}" çok büyük (en fazla 40 MB).`;
  return null;
}

/**
 * Fotoğrafı yüklemeden önce tarayıcıda küçültür (uzun kenar en fazla 1920 px, JPEG %85).
 * Telefon fotoğrafları ~5–10 MB'tan ~400 KB'a iner: yükleme hızlanır, Cloudinary kotası korunur.
 */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("toBlob");
    return blob;
  } finally {
    bitmap.close();
  }
}

type UploadResult = { ok: true; id: string } | { ok: false; message: string };

/** Fotoğrafı yükler ve Sheets'e yazılacak kimliğini döner. */
export async function uploadPhoto(file: File): Promise<UploadResult> {
  let blob: Blob;
  try {
    blob = await shrink(file);
  } catch {
    return { ok: false, message: `"${file.name}" okunamadı. Farklı bir fotoğraf deneyin.` };
  }

  const sign = await callApi<{ uploadUrl?: string; fields?: Record<string, string> }>(
    "/api/admin/gorsel",
    { method: "POST", json: {} },
  );
  if (!sign.ok || !sign.data?.uploadUrl) {
    return { ok: false, message: sign.networkError ? NETWORK_ERROR_MESSAGE : (sign.data?.message ?? GENERIC_ERROR_MESSAGE) };
  }

  const form = new FormData();
  form.append("file", blob, "foto.jpg");

  // Cloudinary: dosya doğrudan Cloudinary'ye gider, sunucumuzdan geçmez.
  for (const [k, v] of Object.entries(sign.data.fields ?? {})) form.append(k, String(v));
  try {
    const res = await fetch(sign.data.uploadUrl, { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as { public_id?: string; error?: { message?: string } } | null;
    if (res.ok && data?.public_id) return { ok: true, id: data.public_id };
    console.error("Cloudinary yükleme hatası:", data?.error?.message);
    return { ok: false, message: "Fotoğraf Cloudinary'ye yüklenemedi. Lütfen tekrar deneyin." };
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
}
