import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { checkLimit, LIMITS, tooManyRequests } from "./rate-limit";
import { SheetsError } from "./sheets";
import { StoreError } from "./store";
import type { FieldErrors } from "./validation";

export function jsonError(status: number, message: string, fieldErrors?: FieldErrors) {
  return NextResponse.json({ ok: false, message, fieldErrors }, { status });
}

/** İsteğin sitenin kendisinden gelip gelmediğini kontrol eder (siteler arası istek sahteciliğine karşı). */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Tüm yönetici API uçlarının başında çağrılır.
 * Yetkisizse hazır bir hata yanıtı, yetkiliyse null döner.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return jsonError(401, "Bu işlem için yönetici girişi yapmanız gerekiyor.");
  }
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return jsonError(403, "İstek kaynağı doğrulanamadı.");
  }
  const limit = checkLimit(request, LIMITS.admin);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);
  return null;
}

/** Veri katmanı hatalarını Türkçe, kullanıcıya gösterilebilir yanıtlara çevirir. */
export function dataErrorResponse(error: unknown): NextResponse {
  if (error instanceof StoreError) return jsonError(error.status, error.message);
  if (error instanceof SheetsError) return jsonError(503, error.message);
  console.error("Beklenmeyen veri hatası:", error);
  return jsonError(500, "İşlem tamamlanamadı. Beklenmeyen bir hata oluştu; lütfen tekrar deneyin.");
}


export async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}
