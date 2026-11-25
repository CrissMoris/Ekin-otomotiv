import { NextResponse, type NextRequest } from "next/server";
import { dataErrorResponse, jsonError, readJson, requireAdmin } from "@/lib/http";
import { createVehicle } from "@/lib/store";
import { validateVehicle } from "@/lib/validation";

/** Yeni araç ekler (yalnızca yönetici). */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (!body) return jsonError(400, "Gönderilen veri okunamadı.");
  const check = validateVehicle(body);
  if (!check.ok) return jsonError(422, "Lütfen işaretli alanları kontrol edin.", check.errors);
  try {
    return NextResponse.json({ ok: true, vehicle: await createVehicle(check.data) }, { status: 201 });
  } catch (error) {
    return dataErrorResponse(error);
  }
}
