import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { userId, groupId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (groupId !== null && groupId !== undefined) {
    const pendingCheck = await sql`
      SELECT id FROM join_requests WHERE user_id = ${userId} AND status = 'pending'
    `;
    if (pendingCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "This student has a pending join request. Approve or reject it first." },
        { status: 409 }
      );
    }
  }

  await sql`UPDATE users SET group_id = ${groupId ?? null} WHERE id = ${userId}`;

  return NextResponse.json({ success: true });
}
