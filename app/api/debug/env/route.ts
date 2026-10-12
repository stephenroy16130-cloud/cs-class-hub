import { NextRequest, NextResponse } from "next/server";
import { getRpId, getOrigin } from "@/lib/webauthnConfig";

export async function GET(req: NextRequest) {
  return NextResponse.json({ rpId: getRpId(req), origin: getOrigin(req) });
}
