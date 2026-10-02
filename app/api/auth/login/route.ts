import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { withRetry } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { identifier, password, rememberMe } = await req.json();

  if (!identifier || !password) {
    return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
  }

  const normalized = String(identifier).trim();

  let user;
  try {
    const result = await withRetry(() => sql`
      SELECT id, role, name, password_hash, admission_no FROM users
      WHERE admission_no = ${normalized.toUpperCase()} OR email = ${normalized.toLowerCase()}
      LIMIT 1
    `);
    user = result.rows[0];
  } catch {
    return NextResponse.json(
      { error: "The database didn't respond in time. Please try again in a moment." },
      { status: 503 }
    );
  }

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
  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
  if (rememberMe) {
    cookieOptions.maxAge = 60 * 60 * 24 * 30;
  }
  response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);

  return response;
}
