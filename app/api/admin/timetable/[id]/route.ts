import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { day, time, unit, lecturer, venue, mode } = await req.json();

  await sql`
    UPDATE timetable_sessions
    SET day = ${day}, time = ${time}, unit = ${unit}, lecturer = ${lecturer}, venue = ${venue}, mode = ${mode}
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await sql`DELETE FROM timetable_sessions WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}
