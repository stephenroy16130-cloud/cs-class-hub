import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await sql`SELECT id, admission_no, name, contact FROM roster ORDER BY name`;
  return NextResponse.json({ roster: result.rows });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { admissionNo, name, contact } = await req.json();
  if (!admissionNo || !name) {
    return NextResponse.json({ error: "Admission number and name are required." }, { status: 400 });
  }

  const normalized = String(admissionNo).trim().toUpperCase();

  const existing = await sql`SELECT id FROM roster WHERE admission_no = ${normalized}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "That admission number is already on the roster." }, { status: 409 });
  }

  await sql`
    INSERT INTO roster (admission_no, name, contact, added_by)
    VALUES (${normalized}, ${name}, ${contact || null}, ${session.userId})
  `;

  return NextResponse.json({ success: true });
}

