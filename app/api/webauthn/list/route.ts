import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await sql`
    SELECT id, device_label, created_at FROM webauthn_credentials
    WHERE user_id = ${session.userId}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({
    passkeys: result.rows.map((r) => ({
      id: r.id,
      deviceLabel: r.device_label || "Unknown device",
      createdAt: r.created_at,
    })),
  });
}
