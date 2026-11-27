import "server-only";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Basit hız sınırlayıcı (kayan pencere). Aynı kişiden kısa sürede gelen çok sayıda isteği reddeder;
 * böylece art arda tıklamalar veya otomatik denemeler sunucuyu ve veritabanını yormaz.
 *
 * Not: Sayaçlar sunucu belleğinde tutulur. Vercel'de her sunucu örneği kendi sayacını tutar; bu yüzden
 * sınır yaklaşık değerdir ama kötüye kullanımı büyük ölçüde engeller.
 */

const hits = new Map<string, number[]>();

interface Limit {
  name: string;
  max: number;
  windowMs: number;
}

export const LIMITS = {
  inquiry: { name: "talep", max: 5, windowMs: 10 * 60_000 }, // 10 dakikada 5 talep
  login: { name: "giris", max: 5, windowMs: 15 * 60_000 }, // 15 dakikada 5 hatalı PIN
  admin: { name: "yonetim", max: 60, windowMs: 60_000 }, // dakikada 60 yönetim işlemi
  upload: { name: "gorsel", max: 40, windowMs: 60_000 }, // dakikada 40 fotoğraf
} satisfies Record<string, Limit>;

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "yerel";
}

function cleanup(now: number) {
  if (hits.size < 5000) return;
  for (const [key, list] of hits) if (list[list.length - 1] < now - 60 * 60_000) hits.delete(key);
}

/** Sayacı kontrol eder; `count` false ise yalnızca kontrol eder, saymaz (ör. yalnızca hatalı girişleri saymak için). */
export function checkLimit(request: NextRequest, limit: Limit, count = true): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  cleanup(now);
  const key = `${limit.name}:${clientIp(request)}`;
  const recent = (hits.get(key) ?? []).filter((t) => t > now - limit.windowMs);
  if (recent.length >= limit.max) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((recent[0] + limit.windowMs - now) / 1000) };
  }
  if (count) recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfter: 0 };
}

export function recordHit(request: NextRequest, limit: Limit) {
  const key = `${limit.name}:${clientIp(request)}`;
  hits.set(key, [...(hits.get(key) ?? []), Date.now()]);
}

export function resetLimit(request: NextRequest, limit: Limit) {
  hits.delete(`${limit.name}:${clientIp(request)}`);
}

export function tooManyRequests(retryAfter: number, message?: string) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return NextResponse.json(
    { ok: false, message: message ?? `Çok fazla istek gönderildi. Lütfen ${minutes} dakika sonra tekrar deneyin.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
