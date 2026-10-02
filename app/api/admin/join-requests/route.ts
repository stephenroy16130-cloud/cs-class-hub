import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const result = await sql`
    SELECT jr.id, jr.requested_group_id, jr.created_at,
           u.id AS user_id, u.name, u.admission_no, u.group_id AS current_group_id
    FROM join_requests jr
    JOIN users u ON u.id = jr.user_id
    WHERE jr.status = 'pending'
    ORDER BY jr.created_at ASC
  `;

  return NextResponse.json({ requests: result.rows });
}

