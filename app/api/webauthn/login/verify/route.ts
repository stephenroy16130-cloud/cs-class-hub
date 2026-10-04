import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { sql } from "@vercel/postgres";
import { getRpId, getOrigin } from "@/lib/webauthnConfig";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { userId, response } = await req.json();
  if (!userId || !response) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const challengeResult = await sql`
    SELECT challenge FROM webauthn_challenges
    WHERE user_id = ${userId} AND purpose = 'login'
    ORDER BY created_at DESC LIMIT 1
  `;
  const expectedChallenge = challengeResult.rows[0]?.challenge;
  if (!expectedChallenge) {
    return NextResponse.json({ error: "No pending login. Try again." }, { status: 400 });
  }

  const credResult = await sql`
    SELECT credential_id, public_key, counter FROM webauthn_credentials
    WHERE user_id = ${userId} AND credential_id = ${response.id}
  `;
  const cred = credResult.rows[0];
  if (!cred) {
    return NextResponse.json({ error: "Unrecognized device." }, { status: 400 });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpId(),
      credential: {
        id: cred.credential_id,
        publicKey: new Uint8Array(Buffer.from(cred.public_key, "base64")),
        counter: Number(cred.counter),
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Verification failed." }, { status: 400 });
    }

    await sql`
      UPDATE webauthn_credentials SET counter = ${verification.authenticationInfo.newCounter}
      WHERE credential_id = ${response.id}
    `;
    await sql`DELETE FROM webauthn_challenges WHERE user_id = ${userId} AND purpose = 'login'`;

    const userResult = await sql`SELECT id, role, name, admission_no FROM users WHERE id = ${userId}`;
    const user = userResult.rows[0];

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      admissionNo: user.admission_no,
    });

    const res = NextResponse.json({ success: true, role: user.role, name: user.name });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err) {
    console.error("WebAuthn login error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 400 });
  }
}
