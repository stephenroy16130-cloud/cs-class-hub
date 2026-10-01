import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { groupId } = await req.json();
  if (!groupId || groupId < 1 || groupId > 24) {
    return NextResponse.json({ error: "Invalid group." }, { status: 400 });
  }

  try {
    const existing = await sql`
      SELECT id FROM join_requests WHERE user_id = ${session.userId} AND status = 'pending'
    `;
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "You already have a pending request." }, { status: 409 });
    }

    await sql`
      INSERT INTO join_requests (user_id, requested_group_id)
      VALUES (${session.userId}, ${groupId})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("join-requests error:", err);
    return NextResponse.json(
      { error: "The database didn't respond in time. Please try again in a moment." },
      { status: 503 }
    );
  }
}
