import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { name, contact } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  await sql`UPDATE roster SET name = ${name}, contact = ${contact || null} WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  const rosterResult = await sql`SELECT admission_no FROM roster WHERE id = ${id}`;
  const admissionNo = rosterResult.rows[0]?.admission_no;

  let accountDeleted = false;

  if (admissionNo) {
    const userResult = await sql`SELECT id FROM users WHERE admission_no = ${admissionNo}`;
    const userId = userResult.rows[0]?.id;

    if (userId) {
      await sql`DELETE FROM join_requests WHERE user_id = ${userId}`;
      await sql`DELETE FROM group_messages WHERE user_id = ${userId}`;
      await sql`DELETE FROM notifications WHERE user_id = ${userId}`;
      await sql`DELETE FROM push_subscriptions WHERE user_id = ${userId}`;
      await sql`DELETE FROM webauthn_credentials WHERE user_id = ${userId}`;
      await sql`DELETE FROM webauthn_challenges WHERE user_id = ${userId}`;
      await sql`DELETE FROM attendance_records WHERE admission_no = ${admissionNo}`;
      await sql`DELETE FROM users WHERE id = ${userId}`;
      accountDeleted = true;
    }
  }

  await sql`DELETE FROM roster WHERE id = ${id}`;

  return NextResponse.json({ success: true, accountDeleted });
}
