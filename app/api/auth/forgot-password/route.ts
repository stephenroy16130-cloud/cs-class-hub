import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

export async function POST(req: NextRequest) {
  const { admissionNo, contact, newPassword } = await req.json();

  if (!admissionNo || !contact || !newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Admission number, phone number, and a new password (6+ characters) are required." },
      { status: 400 }
    );
  }

  const normalizedAdmission = String(admissionNo).trim().toUpperCase();

  const rosterResult = await sql`SELECT contact FROM roster WHERE admission_no = ${normalizedAdmission}`;
  const rosterEntry = rosterResult.rows[0];

  if (!rosterEntry || !rosterEntry.contact) {
    return NextResponse.json(
      { error: "We couldn't verify those details. Contact the class rep for help." },
      { status: 404 }
    );
  }

  if (normalizePhone(rosterEntry.contact) !== normalizePhone(contact)) {
    return NextResponse.json(
      { error: "We couldn't verify those details. Contact the class rep for help." },
      { status: 404 }
    );
  }

  const userResult = await sql`SELECT id FROM users WHERE admission_no = ${normalizedAdmission}`;
  if (userResult.rows.length === 0) {
    return NextResponse.json(
      { error: "No account exists for this admission number yet. Try signing up instead." },
      { status: 404 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE admission_no = ${normalizedAdmission}`;

  return NextResponse.json({ success: true });
}
