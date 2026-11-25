import { NextResponse, type NextRequest } from "next/server";
import { uploadSignature } from "@/lib/cloudinary";
import { jsonError, requireAdmin } from "@/lib/http";
import { checkLimit, LIMITS, tooManyRequests } from "@/lib/rate-limit";

/**
 * Fotoğraf yükleme imzası (yalnızca yönetici).
 * Fotoğraf tarayıcıdan doğrudan Cloudinary'ye yüklenir; dosya bu sunucudan geçmez.
 */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const limit = checkLimit(request, LIMITS.upload);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const signed = uploadSignature();
  if (!signed) return jsonError(503, "Fotoğraf yükleme için Cloudinary ayarları (CLOUDINARY_URL) tanımlanmamış.");
  return NextResponse.json({ ok: true, ...signed });
}
