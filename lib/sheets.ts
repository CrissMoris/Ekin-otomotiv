import "server-only";
import { createSign } from "node:crypto";
import { missingSheetsVars, sheetsConfig } from "./config";
import { DataSourceError } from "./data-error";

/**
 * Google Sheets API ile konuşan küçük istemci (ek paket gerektirmez).
 * Kimlik doğrulama: servis hesabı → imzalı JWT → kısa ömürlü erişim anahtarı.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_URL = "https://sheets.googleapis.com/v4/spreadsheets";

export class SheetsError extends DataSourceError {
  constructor(message: string) {
    super(message);
    this.name = "SheetsError";
  }
}

let cachedToken: { value: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const cfg = requireConfig();
  const now = Math.floor(Date.now() / 1000);
  const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: cfg.clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  let signature: string;
  try {
    signature = createSign("RSA-SHA256").update(unsigned).sign(cfg.privateKey, "base64url");
  } catch {
    throw new SheetsError("GOOGLE_PRIVATE_KEY okunamadı. Anahtarı JSON dosyasından eksiksiz kopyaladığınızdan emin olun.");
  }
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Google token hatası:", res.status, await res.text().catch(() => ""));
    throw new SheetsError("Google hesabına bağlanılamadı. Servis hesabı bilgilerini (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY) kontrol edin.");
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

function requireConfig() {
  const cfg = sheetsConfig();
  if (!cfg) {
    throw new SheetsError(
      `Google Sheets ayarları eksik: ${missingSheetsVars().join(", ")}. ` +
        "Vercel'de Settings → Environment Variables bölümüne ekleyip yeniden yayınlayın (Redeploy).",
    );
  }
  return cfg;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { sheetId } = requireConfig();
  const res = await fetch(`${API_URL}/${sheetId}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Google Sheets hatası:", res.status, path, body.slice(0, 500));
    if (res.status === 403) throw new SheetsError("Google Sheets dosyasına erişim izni yok. Dosyayı servis hesabının e-posta adresiyle “Düzenleyici” olarak paylaşın.");
    if (res.status === 404) throw new SheetsError("Google Sheets dosyası bulunamadı. GOOGLE_SHEET_ID değerini kontrol edin.");
    if (res.status === 400 && body.includes("Unable to parse range")) throw new SheetsError("Sheets dosyasında gerekli sayfa (sekme) bulunamadı. “Araclar” ve “Talepler” sekmelerinin olduğundan emin olun.");
    if (res.status === 429) throw new SheetsError("Google Sheets şu anda çok yoğun. Lütfen biraz sonra tekrar deneyin.");
    throw new SheetsError("Google Sheets ile iletişimde bir hata oluştu. Lütfen tekrar deneyin.");
  }
  return (await res.json()) as T;
}

export type Cell = string | number;

/** Bir sekmenin tüm satırlarını, ekranda göründüğü haliyle okur. */
export async function readSheet(tab: string): Promise<string[][]> {
  const range = encodeURIComponent(`${tab}!A1:AZ`);
  const data = await call<{ values?: Cell[][] }>(`/values/${range}?valueRenderOption=FORMATTED_VALUE`);
  return (data.values ?? []).map((row) => row.map((v) => String(v ?? "")));
}

/** Sekmenin sonuna satır ekler. RAW: girilen metin formül olarak çalıştırılmaz. */
export async function appendRow(tab: string, row: Cell[]): Promise<void> {
  const range = encodeURIComponent(`${tab}!A1`);
  await call(`/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [row] }),
  });
}

/** Belirli bir satırı (1'den başlayan satır numarası) baştan sona yazar. */
export async function updateRow(tab: string, rowNumber: number, row: Cell[]): Promise<void> {
  const range = encodeURIComponent(`${tab}!A${rowNumber}:${columnLetter(row.length - 1)}${rowNumber}`);
  await call(`/values/${range}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [row] }) });
}

const tabIds = new Map<string, number>();

/** Bir satırı tamamen siler (alttaki satırlar yukarı kayar). */
export async function deleteRow(tab: string, rowNumber: number): Promise<void> {
  if (!tabIds.has(tab)) {
    const info = await call<{ sheets: { properties: { sheetId: number; title: string } }[] }>(
      "?fields=sheets.properties(sheetId,title)",
    );
    for (const s of info.sheets) tabIds.set(s.properties.title, s.properties.sheetId);
  }
  const sheetId = tabIds.get(tab);
  if (sheetId === undefined) throw new SheetsError(`Sheets dosyasında “${tab}” sekmesi bulunamadı.`);
  await call(":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [
        { deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber } } },
      ],
    }),
  });
}

function columnLetter(index: number): string {
  let s = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** Başlık satırına göre sütun konumlarını bulur (büyük/küçük harf ve boşluk farkını yok sayar). */
export function headerIndex(headerRow: string[], required: readonly string[], tab: string): Map<string, number> {
  const norm = (s: string) => s.trim().toLocaleLowerCase("tr");
  const map = new Map<string, number>();
  headerRow.forEach((h, i) => map.set(norm(h), i));
  const missing = required.filter((h) => !map.has(norm(h)));
  if (missing.length) {
    throw new SheetsError(`“${tab}” sekmesinin ilk satırında şu başlıklar eksik: ${missing.join(", ")}`);
  }
  return new Map(required.map((h) => [h, map.get(norm(h))!]));
}

/** İsteğe bağlı başlıkların (varsa) sütun konumları. */
export function optionalIndex(headerRow: string[], optional: readonly string[]): Map<string, number> {
  const norm = (h: string) => h.trim().toLocaleLowerCase("tr");
  const map = new Map<string, number>();
  headerRow.forEach((h, i) => map.set(norm(h), i));
  return new Map(optional.filter((h) => map.has(norm(h))).map((h) => [h, map.get(norm(h))!]));
}
