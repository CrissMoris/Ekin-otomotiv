import { NextResponse, type NextRequest } from "next/server";
import { checkPin, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { checkLimit, LIMITS, recordHit, resetLimit, tooManyRequests } from "@/lib/rate-limit";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Yönetici girişi: PIN sunucuda kontrol edilir; 15 dakikada 5 hatalı denemeden sonra geçici olarak kilitlenir. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError(403, "İstek kaynağı doğrulanamadı.");

  const limit = checkLimit(request, LIMITS.login, false);
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, "Çok fazla hatalı deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.");
  }

  const body = await readJson(request);
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  if (!pin) return jsonError(400, "Lütfen PIN'i giriniz.");

  const result = checkPin(pin);
  if (result === "not-configured") {
    return jsonError(503, "Yönetici PIN'i sunucuda tanımlanmamış (ADMIN_PASSWORD).");
  }
  if (result === "wrong") {
    recordHit(request, LIMITS.login);
    await delay(600); // deneme-yanılmayı yavaşlatır
    return jsonError(401, "PIN hatalı.");
  }

  const session = createSessionToken();
  if (!session) return jsonError(503, "Oturum anahtarı oluşturulamadı.");
  resetLimit(request, LIMITS.login);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.maxAge));
  return response;
}
