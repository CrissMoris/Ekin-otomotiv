import { NextResponse, type NextRequest } from "next/server";
import { dataErrorResponse, jsonError, readJson, requireAdmin } from "@/lib/http";
import { deleteVehicle, setVehicleStatus, updateVehicle } from "@/lib/store";
import { validateVehicle } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

/** Aracın tüm bilgilerini günceller. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  if (!body) return jsonError(400, "Gönderilen veri okunamadı.");
  const check = validateVehicle(body);
  if (!check.ok) return jsonError(422, "Lütfen işaretli alanları kontrol edin.", check.errors);
  const expected = typeof body.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : undefined;
  try {
    return NextResponse.json({ ok: true, vehicle: await updateVehicle(id, check.data, expected) });
  } catch (error) {
    return dataErrorResponse(error);
  }
}

/** Yalnızca yayın durumunu değiştirir: { status: "yayinda" | "taslak" } */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const status = (await readJson(request))?.status;
  if (status !== "yayinda" && status !== "taslak") return jsonError(422, "Geçersiz yayın durumu.");
  try {
    return NextResponse.json({ ok: true, vehicle: await setVehicleStatus(id, status) });
  } catch (error) {
    return dataErrorResponse(error);
  }
}

/** Aracı ve fotoğraflarını siler. */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    await deleteVehicle(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return dataErrorResponse(error);
  }
}
