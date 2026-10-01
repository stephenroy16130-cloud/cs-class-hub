import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { day, time, unit, lecturer, venue, mode } = await req.json();
  if (!day || !time || !unit || !lecturer || !venue || !mode) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await sql`
    INSERT INTO timetable_sessions (day, time, unit, lecturer, venue, mode)
    VALUES (${day}, ${time}, ${unit}, ${lecturer}, ${venue}, ${mode})
  `;

  return NextResponse.json({ success: true });
}
