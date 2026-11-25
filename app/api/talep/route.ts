import { NextResponse, type NextRequest } from "next/server";
import { CONTACT } from "@/lib/constants";
import { dataErrorResponse, isSameOrigin, jsonError, readJson } from "@/lib/http";
import { checkLimit, LIMITS, tooManyRequests } from "@/lib/rate-limit";
import { addInquiry, StoreError } from "@/lib/store";
import { validateInquiry } from "@/lib/validation";

const MIN_FILL_MS = 2500; // formu bundan daha hızlı gönderen istekler büyük olasılıkla bottur

/** Herkese açık talep formu ucu. Başarı yanıtı yalnızca kayıt gerçekten tamamlandıktan sonra döner. */
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") && !isSameOrigin(request)) {
    return jsonError(403, "İstek kaynağı doğrulanamadı.");
  }

  const body = await readJson(request);
  if (!body) return jsonError(400, "Form verisi okunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");

  // Basit bot korumaları
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return jsonError(400, "Gönderim doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
  }
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || startedAt <= 0 || Date.now() - startedAt < MIN_FILL_MS) {
    return jsonError(400, "Form çok hızlı gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin.");
  }
  const submissionKey = typeof body.submissionKey === "string" ? body.submissionKey : "";
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(submissionKey)) {
    return jsonError(400, "Gönderim doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
  }

  const check = validateInquiry(body);
  if (!check.ok) {
    return jsonError(422, "Lütfen işaretli alanları kontrol edin.", check.errors);
  }

  // Aynı kişiden kısa sürede çok sayıda talep gelmesini engeller (10 dakikada en fazla 5).
  const limit = checkLimit(request, LIMITS.inquiry);
  if (!limit.ok) {
    return tooManyRequests(
      limit.retryAfter,
      `Kısa sürede çok fazla talep gönderdiniz. Lütfen biraz sonra tekrar deneyin veya bizi arayın: ${CONTACT.phone}`,
    );
  }

  try {
    const inquiryId = await addInquiry(check.data, submissionKey);
    return NextResponse.json({ ok: true, inquiryId }, { status: 201 });
  } catch (error) {
    if (error instanceof StoreError) return dataErrorResponse(error);
    console.error("Talep kaydedilemedi:", error);
    return jsonError(
      503,
      `Talebiniz şu anda kaydedilemedi. Lütfen birkaç dakika sonra tekrar deneyin veya bizi arayın: ${CONTACT.phone}`,
    );
  }
}
