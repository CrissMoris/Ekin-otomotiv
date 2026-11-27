// Tarayıcı tarafı fotoğraf işlemleri (yönetim paneli).
import { callApi, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "../client-utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function checkSelectedFile(file: File): string | null {
  if (file.type && !ACCEPTED.includes(file.type)) return `"${file.name}" bir fotoğraf dosyası değil.`;
  if (file.size > 40 * 1024 * 1024) return `"${file.name}" çok büyük (en fazla 40 MB).`;
  return null;
}

// Her yüklenen fotoğrafın sol altına hafif saydam logo eklenir.
const WATERMARK_URL = "/marka/logo-beyaz.png";
let watermark: Promise<ImageBitmap | null> | null = null;

function loadWatermark(): Promise<ImageBitmap | null> {
  watermark ??= fetch(WATERMARK_URL)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error("logo"))))
    .then((blob) => createImageBitmap(blob))
    .catch(() => {
      watermark = null; // logo yüklenemezse fotoğraf logosuz yüklenir, bir sonraki denemede tekrar denenir
      return null;
    });
  return watermark;
}

/**
 * Logoyu sol alta, yarı saydam koyu gri bir zemin üzerine çizer (açık renkli fotoğraflarda da okunur).
 * Araç listesindeki 4:3 kırpılmış küçük görsellerde de görünsün diye fotoğrafın ortasındaki 4:3'lük alanın
 * sol alt köşesine yerleştirilir.
 */
function drawWatermark(ctx: CanvasRenderingContext2D, logo: ImageBitmap, width: number, height: number) {
  const safeW = Math.min(width, (height * 4) / 3);
  const safeH = Math.min(height, (width * 3) / 4);
  const left = (width - safeW) / 2;
  const bottom = (height - safeH) / 2;
  const logoW = Math.max(64, safeW * 0.1);
  const logoH = (logoW * logo.height) / logo.width;
  const pad = safeW * 0.03;
  const boxPad = logoW * 0.12;
  const x = left + pad + boxPad;
  const y = height - bottom - pad - boxPad - logoH;
  ctx.save();
  ctx.fillStyle = "rgba(40, 42, 45, 0.45)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x - boxPad, y - boxPad, logoW + boxPad * 2, logoH + boxPad * 2, boxPad * 0.9);
  } else {
    ctx.rect(x - boxPad, y - boxPad, logoW + boxPad * 2, logoH + boxPad * 2);
  }
  ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.drawImage(logo, x, y, logoW, logoH);
  ctx.restore();
}

/**
 * Fotoğrafı yüklemeden önce tarayıcıda küçültür (uzun kenar en fazla 1920 px, JPEG %85) ve logoyu ekler.
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
    const logo = await loadWatermark();
    if (logo) drawWatermark(ctx, logo, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("toBlob");
    return blob;
  } finally {
    bitmap.close();
  }
}

type UploadResult = { ok: true; id: string } | { ok: false; message: string };

/** Fotoğrafı yükler ve veritabanına yazılacak kimliğini döner. */
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
