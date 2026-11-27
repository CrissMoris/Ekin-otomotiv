import { NextResponse, type NextRequest } from "next/server";
import { CONTACT } from "@/lib/constants";
import { t, type Lang } from "@/lib/i18n";
import { dataErrorResponse, isSameOrigin, jsonError, readJson } from "@/lib/http";
import { checkLimit, LIMITS, tooManyRequests } from "@/lib/rate-limit";
import { addInquiry, StoreError } from "@/lib/store";
import { validateInquiry } from "@/lib/validation";

const MIN_FILL_MS = 2500; // formu bundan daha hızlı gönderen istekler büyük olasılıkla bottur

/** Herkese açık talep formu ucu. Başarı yanıtı yalnızca kayıt gerçekten tamamlandıktan sonra döner. */
export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const lang: Lang = body?.lang === "ar" || body?.lang === "en" ? body.lang : "tr";
  const m = t(lang).api;

  if (request.headers.get("origin") && !isSameOrigin(request)) {
    return jsonError(403, m.origin);
  }
  if (!body) return jsonError(400, m.badForm);

  // Basit bot korumaları
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return jsonError(400, m.botCheck);
  }
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || startedAt <= 0 || Date.now() - startedAt < MIN_FILL_MS) {
    return jsonError(400, m.tooFast);
  }
  const submissionKey = typeof body.submissionKey === "string" ? body.submissionKey : "";
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(submissionKey)) {
    return jsonError(400, m.botCheck);
  }

  const check = validateInquiry(body, lang);
  if (!check.ok) {
    return jsonError(422, m.checkFields, check.errors);
  }

  // Aynı kişiden kısa sürede çok sayıda talep gelmesini engeller (10 dakikada en fazla 5).
  const limit = checkLimit(request, LIMITS.inquiry);
  if (!limit.ok) {
    return tooManyRequests(
      limit.retryAfter,
      `${m.rateLimited} ${CONTACT.phone}`,
    );
  }

  try {
    const inquiryId = await addInquiry(check.data, submissionKey, lang);
    return NextResponse.json({ ok: true, inquiryId }, { status: 201 });
  } catch (error) {
    if (error instanceof StoreError) return error.status === 404 ? jsonError(404, m.vehicleGone) : dataErrorResponse(error);
    console.error("Talep kaydedilemedi:", error);
    return jsonError(
      503,
      `${m.saveFailed} ${CONTACT.phone}`,
    );
  }
}
