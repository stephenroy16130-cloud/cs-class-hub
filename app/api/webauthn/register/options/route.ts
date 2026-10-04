import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";
import { getRpId } from "@/lib/webauthnConfig";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const existing = await sql`SELECT credential_id FROM webauthn_credentials WHERE user_id = ${session.userId}`;

  const options = await generateRegistrationOptions({
    rpName: "CS 1.1 Class Hub",
    rpID: getRpId(),
    userID: new TextEncoder().encode(String(session.userId)),
    userName: session.admissionNo || session.name,
    userDisplayName: session.name,
    attestationType: "none",
    excludeCredentials: existing.rows.map((c) => ({ id: c.credential_id })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
  });

  await sql`DELETE FROM webauthn_challenges WHERE user_id = ${session.userId} AND purpose = 'register'`;
  await sql`
    INSERT INTO webauthn_challenges (user_id, challenge, purpose)
    VALUES (${session.userId}, ${options.challenge}, 'register')
  `;

  return NextResponse.json(options);
}
