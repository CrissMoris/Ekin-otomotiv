// Tarayıcı tarafında kullanılan küçük yardımcılar.

/** Rastgele anahtar üretir. crypto.randomUUID yalnızca güvenli bağlamda (https/localhost) var; yedek yol mevcut. */
export function randomKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface ApiResult<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: (T & { message?: string; fieldErrors?: Record<string, string> }) | null;
  networkError: boolean;
}

/** fetch + JSON çözümleme; ağ hatalarını ve JSON olmayan yanıtları güvenle ele alır. */
export async function callApi<T = Record<string, unknown>>(
  url: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<ApiResult<T>> {
  const { json, ...rest } = init;
  try {
    const res = await fetch(url, {
      ...rest,
      headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok && data?.ok !== false, status: res.status, data, networkError: false };
  } catch {
    return { ok: false, status: 0, data: null, networkError: true };
  }
}

export const NETWORK_ERROR_MESSAGE =
  "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.";
export const GENERIC_ERROR_MESSAGE = "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
