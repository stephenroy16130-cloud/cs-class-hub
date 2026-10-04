import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { sql } from "@vercel/postgres";
import { getRpId } from "@/lib/webauthnConfig";

export async function POST(req: NextRequest) {
  const { identifier } = await req.json();
  if (!identifier) {
    return NextResponse.json({ error: "Admission number or email is required." }, { status: 400 });
  }

  const normalized = String(identifier).trim();
  const userResult = await sql`
    SELECT id FROM users WHERE admission_no = ${normalized.toUpperCase()} OR email = ${normalized.toLowerCase()}
  `;
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const credsResult = await sql`SELECT credential_id FROM webauthn_credentials WHERE user_id = ${user.id}`;
  if (credsResult.rows.length === 0) {
    return NextResponse.json({ error: "No passkey set up for this account yet." }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID: getRpId(),
    allowCredentials: credsResult.rows.map((c) => ({ id: c.credential_id })),
    userVerification: "required",
  });

  await sql`DELETE FROM webauthn_challenges WHERE user_id = ${user.id} AND purpose = 'login'`;
  await sql`
    INSERT INTO webauthn_challenges (user_id, challenge, purpose)
    VALUES (${user.id}, ${options.challenge}, 'login')
  `;

  return NextResponse.json({ options, userId: user.id });
}
