import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

export async function POST(req: NextRequest) {
  const { admissionNo, contact, password } = await req.json();

  if (!admissionNo || !contact || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Admission number, phone number, and a password of at least 6 characters are required." },
      { status: 400 }
    );
  }

  const normalized = String(admissionNo).trim().toUpperCase();

  const rosterResult = await sql`SELECT name, contact FROM roster WHERE admission_no = ${normalized}`;
  const rosterEntry = rosterResult.rows[0];

  if (!rosterEntry) {
    return NextResponse.json(
      { error: "That admission number was not found on the class roster." },
      { status: 404 }
    );
  }

  if (!rosterEntry.contact || normalizePhone(rosterEntry.contact) !== normalizePhone(contact)) {
    return NextResponse.json(
      { error: "That phone number doesn't match our records for this admission number. Contact the class rep if this is a mistake." },
      { status: 403 }
    );
  }

  const existing = await sql`SELECT id FROM users WHERE admission_no = ${normalized}`;
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "An account already exists for this admission number." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await sql`
    INSERT INTO users (role, admission_no, name, password_hash)
    VALUES ('student', ${normalized}, ${rosterEntry.name}, ${passwordHash})
  `;

  return NextResponse.json({ success: true, name: rosterEntry.name });
}
