// Ekin Otomotiv — bağlantı testi (yalnızca OKUR, hiçbir veriyi değiştirmez).
// Kullanım: npm run baglanti-testi
// .env.local dosyasındaki Google Sheets ve Cloudinary ayarlarını kontrol eder.
// Gizli anahtarlar ekrana YAZDIRILMAZ.
import { readFileSync, existsSync } from "node:fs";
import { createSign } from "node:crypto";

const VEHICLE_HEADERS = ["İlan No", "Durum", "Marka", "Model", "Model Yılı", "Kilometre", "Yakıt", "Vites", "Fiyat", "Açıklama", "Fotoğraflar", "Sahibinden Linki", "Eklenme Tarihi", "Güncelleme Tarihi"];
const INQUIRY_HEADERS = ["Talep No", "Tarih", "İlan No", "Araç", "Talep Türü", "Ad Soyad", "Telefon", "E-posta", "Mesaj", "Durum", "Gönderim Anahtarı"];

let failed = 0;
const ok = (msg) => console.log(`  ✔ ${msg}`);
const bad = (msg, hint) => {
  failed++;
  console.log(`  ✘ ${msg}${hint ? `\n      → ${hint}` : ""}`);
};
const info = (msg) => console.log(`  • ${msg}`);

function loadEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  const text = readFileSync(file, "utf8").replace(/^﻿/, "");
  const re = /^\s*([A-Z0-9_]+)\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^\n#]*)/gm;
  for (const m of text.matchAll(re)) {
    let v = m[2].trim();
    if (v.startsWith('"')) v = v.slice(1, -1).replace(/\\n/g, "\n");
    else if (v.startsWith("'")) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const env = { ...loadEnv(".env"), ...loadEnv(".env.local") };
const get = (k) => (env[k] ?? process.env[k] ?? "").trim();

console.log("\nEkin Otomotiv — bağlantı testi (salt okunur)\n");

// ---------- Genel ----------
console.log("Genel ayarlar");
const pin = get("ADMIN_PASSWORD");
if (/^\d{4,12}$/.test(pin)) ok("ADMIN_PASSWORD (PIN) tanımlı");
else bad("ADMIN_PASSWORD eksik ya da yalnızca rakam değil");
if (get("SESSION_SECRET").length >= 32) ok("SESSION_SECRET tanımlı (32+ karakter)");
else bad("SESSION_SECRET eksik ya da 32 karakterden kısa");
if (get("SITE_URL")) info(`SITE_URL: ${get("SITE_URL")}`);
else info("SITE_URL boş (Vercel'de alan adı belli olunca girilebilir)");

// ---------- Google Sheets ----------
console.log("\nGoogle Sheets");
let sheetId = get("GOOGLE_SHEET_ID");
const urlMatch = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
if (urlMatch) {
  sheetId = urlMatch[1];
  info(`GOOGLE_SHEET_ID tam adres olarak girilmiş; kod otomatik ayıklandı: ${sheetId}`);
}
const email = get("GOOGLE_CLIENT_EMAIL");
const key = get("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

async function checkSheets() {
  if (!sheetId) return bad("GOOGLE_SHEET_ID boş");
  if (!email) return bad("GOOGLE_CLIENT_EMAIL boş");
  if (!email.endsWith(".iam.gserviceaccount.com")) return bad("GOOGLE_CLIENT_EMAIL bir servis hesabı adresi değil", "…@….iam.gserviceaccount.com ile bitmeli");
  if (!key.includes("BEGIN PRIVATE KEY")) return bad("GOOGLE_PRIVATE_KEY boş ya da eksik");
  ok(`Servis hesabı: ${email}`);

  const now = Math.floor(Date.now() / 1000);
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({ iss: email, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 })}`;
  let sig;
  try {
    sig = createSign("RSA-SHA256").update(unsigned).sign(key, "base64url");
  } catch {
    return bad("GOOGLE_PRIVATE_KEY okunamadı", "Anahtarı JSON dosyasından eksiksiz, tırnak içinde ve \\n karakterleriyle kopyalayın");
  }
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  }).catch(() => null);
  if (!tokenRes) return bad("Google'a ulaşılamadı", "İnternet bağlantısını kontrol edin");
  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    return bad(`Google girişi başarısız (${tokenRes.status})`, /invalid_grant|account not found/i.test(t) ? "E-posta ile özel anahtar aynı JSON dosyasından olmalı; anahtar silinmiş olabilir" : "İnternet bağlantısını ve anahtarı kontrol edin");
  }
  ok("Google hesabına giriş başarılı");
  const token = (await tokenRes.json()).access_token;
  const api = (p) => fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${p}`, { headers: { Authorization: `Bearer ${token}` } });

  const meta = await api("?fields=properties.title,sheets.properties.title");
  if (meta.status === 403) {
    const t = await meta.text();
    if (/has not been used|is disabled|SERVICE_DISABLED/i.test(t)) return bad("Google Sheets API bu projede etkin değil", "Google Cloud Console → API'ler ve Hizmetler → Kitaplık → Google Sheets API → Etkinleştir");
    return bad("Sheets dosyasına erişim izni yok", `Sheets'te Paylaş → ${email} adresini “Düzenleyici” olarak ekleyin`);
  }
  if (meta.status === 404) return bad("Sheets dosyası bulunamadı", "GOOGLE_SHEET_ID değerini kontrol edin");
  if (!meta.ok) return bad(`Sheets yanıt vermedi (${meta.status})`);
  const m = await meta.json();
  ok(`Dosya açıldı: “${m.properties?.title ?? sheetId}”`);
  const tabs = (m.sheets ?? []).map((s) => s.properties.title);

  for (const [tab, headers] of [["Araclar", VEHICLE_HEADERS], ["Talepler", INQUIRY_HEADERS]]) {
    if (!tabs.includes(tab)) {
      bad(`“${tab}” sekmesi yok`, `Mevcut sekmeler: ${tabs.join(", ")}. kurulum/google-sheets-sablonu.xlsx dosyasını içe aktarın ya da sekmeyi bu adla oluşturun`);
      continue;
    }
    const r = await api(`/values/${encodeURIComponent(tab)}?majorDimension=ROWS`);
    const rows = ((await r.json()).values ?? []).filter((row) => row.some((c) => String(c).trim()));
    const head = (rows[0] ?? []).map((h) => String(h).trim());
    const missing = headers.filter((h) => !head.includes(h));
    if (!rows.length) bad(`“${tab}” sekmesi boş`, "İlk satıra başlıkları ekleyin (şablondaki gibi)");
    else if (missing.length) bad(`“${tab}” sekmesinde eksik başlık: ${missing.join(", ")}`, "Başlıkları şablondakiyle birebir aynı yazın");
    else ok(`“${tab}” sekmesi ve başlıklar doğru — ${rows.length - 1} kayıt`);
  }
}

// ---------- Cloudinary ----------
async function checkCloudinary() {
  console.log("\nCloudinary");
  let cloud = get("CLOUDINARY_CLOUD_NAME");
  let apiKey = get("CLOUDINARY_API_KEY");
  let secret = get("CLOUDINARY_API_SECRET");
  const url = get("CLOUDINARY_URL").match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/);
  if (url) {
    cloud ||= url[3];
    apiKey ||= url[1];
    secret ||= url[2];
    info("CLOUDINARY_URL satırı bulundu");
  }
  if (!cloud || !apiKey || !secret) return bad("Cloudinary bilgileri eksik", "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET doldurulmalı");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/usage`, {
    headers: { Authorization: "Basic " + Buffer.from(`${apiKey}:${secret}`).toString("base64") },
  }).catch(() => null);
  if (!res) return bad("Cloudinary'ye ulaşılamadı", "İnternet bağlantısını kontrol edin");
  if (res.status === 401) return bad("Cloudinary API Key / API Secret hatalı");
  if (res.status === 404) return bad("Cloudinary cloud name bulunamadı", "Kontrol panelindeki “Cloud name” değerini girin");
  if (!res.ok) return bad(`Cloudinary yanıt vermedi (${res.status})`);
  const u = await res.json();
  ok(`Cloudinary bağlantısı başarılı (cloud: ${cloud}, plan: ${u.plan ?? "?"})`);
  if (u.credits?.limit) info(`Kullanım: ${u.credits.usage ?? 0} / ${u.credits.limit} kredi (%${(u.credits.used_percent ?? 0).toFixed(1)})`);
}

await checkSheets().catch((e) => bad("Sheets testi beklenmedik şekilde durdu", e.message));
await checkCloudinary().catch((e) => bad("Cloudinary testi beklenmedik şekilde durdu", e.message));

console.log(failed ? `\n${failed} sorun bulundu. Yukarıdaki → işaretli önerilere bakın.\n` : "\nHer şey hazır. “npm run dev” ile siteyi açıp yönetim panelinden ilk aracı ekleyebilirsiniz.\n");
process.exit(failed ? 1 : 0);
