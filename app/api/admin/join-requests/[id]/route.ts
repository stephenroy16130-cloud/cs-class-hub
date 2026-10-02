import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json();

  const reqRow = await sql`SELECT * FROM join_requests WHERE id = ${id} AND status = 'pending'`;
  const requestRow = reqRow.rows[0];
  if (!requestRow) {
    return NextResponse.json({ error: "Request not found or already handled." }, { status: 404 });
  }

  if (action === "approve") {
    await sql`UPDATE users SET group_id = ${requestRow.requested_group_id} WHERE id = ${requestRow.user_id}`;
    await sql`UPDATE join_requests SET status = 'approved' WHERE id = ${id}`;
  } else if (action === "reject") {
    await sql`UPDATE join_requests SET status = 'rejected' WHERE id = ${id}`;
  } else {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

