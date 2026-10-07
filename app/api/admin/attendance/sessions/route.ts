import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, isStaff } from "@/lib/auth";
import { getInPersonSessionsForDate } from "@/lib/attendance";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "date is required." }, { status: 400 });
  }

  const date = new Date(dateParam + "T00:00:00");
  const sessions = await getInPersonSessionsForDate(date);

  return NextResponse.json({ sessions });
}
