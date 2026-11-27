import { NextResponse, type NextRequest } from "next/server";
import { dataErrorResponse, requireAdmin } from "@/lib/http";
import { migrateSheetsToMongo } from "@/lib/migrate";

/** Google Sheets'teki kayıtları MongoDB'ye kopyalar (yalnızca yönetici; Sheets değişmez). */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ ok: true, result: await migrateSheetsToMongo() });
  } catch (error) {
    return dataErrorResponse(error);
  }
}
