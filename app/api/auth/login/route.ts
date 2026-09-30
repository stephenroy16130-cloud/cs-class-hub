import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
  }

  const normalized = String(identifier).trim();

  const result = await sql`
    SELECT id, role, name, password_hash, admission_no FROM users
    WHERE admission_no = ${normalized.toUpperCase()} OR email = ${normalized.toLowerCase()}
    LIMIT 1
  `;

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    admissionNo: user.admission_no,
  });

  const response = NextResponse.json({ success: true, role: user.role, name: user.name });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
