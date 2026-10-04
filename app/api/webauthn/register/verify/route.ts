import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";
import { getRpId, getOrigin } from "@/lib/webauthnConfig";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { response, deviceLabel } = await req.json();

  const challengeResult = await sql`
    SELECT challenge FROM webauthn_challenges
    WHERE user_id = ${session.userId} AND purpose = 'register'
    ORDER BY created_at DESC LIMIT 1
  `;
  const expectedChallenge = challengeResult.rows[0]?.challenge;
  if (!expectedChallenge) {
    return NextResponse.json({ error: "No pending registration. Try again." }, { status: 400 });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpId(),
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Could not verify this device." }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;

    await sql`
      INSERT INTO webauthn_credentials (user_id, credential_id, public_key, counter, device_label)
      VALUES (
        ${session.userId},
        ${credential.id},
        ${Buffer.from(credential.publicKey).toString("base64")},
        ${credential.counter},
        ${deviceLabel || "This device"}
      )
    `;

    await sql`DELETE FROM webauthn_challenges WHERE user_id = ${session.userId} AND purpose = 'register'`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WebAuthn registration error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 400 });
  }
}
