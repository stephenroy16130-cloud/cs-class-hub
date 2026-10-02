import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { verifySessionToken, isStaff } from "@/lib/auth";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { admissionNo } = await req.json();
  if (!admissionNo) {
    return NextResponse.json({ error: "admissionNo is required." }, { status: 400 });
  }

  const normalized = String(admissionNo).trim().toUpperCase();
  const userResult = await sql`SELECT id FROM users WHERE admission_no = ${normalized}`;
  if (userResult.rows.length === 0) {
    return NextResponse.json({ error: "No account found for that admission number." }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE admission_no = ${normalized}`;

  return NextResponse.json({ success: true, tempPassword });
}

