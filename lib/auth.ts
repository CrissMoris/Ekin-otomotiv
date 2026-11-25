import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getAdminPin, getSessionSecret } from "./config";

/**
 * Tek PIN ile yönetici oturumu.
 * PIN sunucuda kontrol edilir; başarılı girişte HMAC ile imzalanmış, JavaScript'in okuyamadığı
 * (httpOnly) bir çerez verilir. Her yönetici sayfası ve API ucu bu çerezi ayrıca doğrular.
 */

export const SESSION_COOKIE = "ekin_admin";
export const SESSION_HOURS = 8;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // Uzunluk farkından bilgi sızmaması için önce özetleri karşılaştırırız.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPin(input: string): "ok" | "wrong" | "not-configured" {
  const expected = getAdminPin();
  if (!expected) return "not-configured";
  return safeEqual(input, expected) ? "ok" : "wrong";
}

export function createSessionToken(): { token: string; maxAge: number } | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const maxAge = SESSION_HOURS * 60 * 60;
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const payload = `v1.${expires}`;
  return { token: `${payload}.${sign(payload, secret)}`, maxAge };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const payload = `${parts[0]}.${parts[1]}`;
  if (!safeEqual(parts[2], sign(payload, secret))) return false;
  const expires = Number(parts[1]);
  return Number.isFinite(expires) && expires > Math.floor(Date.now() / 1000);
}

/** Sunucu bileşenlerinde oturum kontrolü (çerezleri okuduğu için istek anında çalışır). */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  await connection(); // süre kontrolü (Date.now) yalnızca gerçek istek anında yapılabilir
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
