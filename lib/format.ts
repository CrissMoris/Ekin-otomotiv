const priceFormatter = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat("tr-TR");

export const formatPrice = (value: number) => priceFormatter.format(value);
export const formatNumber = (value: number) => numberFormatter.format(value);
export const formatKm = (value: number) => `${numberFormatter.format(value)} km`;

/** İstanbul saatine göre tarih parçaları. */
function istanbulParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return p as Record<"year" | "month" | "day" | "hour" | "minute" | "second", string>;
}

/** Sheets'e yazılan sıralanabilir zaman damgası: "2026-11-25 10:30:15" */
export function nowStamp(): string {
  const p = istanbulParts();
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

/** Talepler sekmesi için okunaklı tarih: "25.11.2026 10:30" */
export function nowDisplay(): string {
  const p = istanbulParts();
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}`;
}

/** "2026-11-25 10:30:15" → "25.11.2026 10:30" (biçim tanınmazsa olduğu gibi döner) */
export function formatStamp(stamp: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(stamp);
  return m ? `${m[3]}.${m[2]}.${m[1]} ${m[4]}:${m[5]}` : stamp;
}

/** "1.250.000 ₺" gibi serbest metinden tam sayı çıkarır. Rakam yoksa null. */
export function parseInteger(input: string): number | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}
