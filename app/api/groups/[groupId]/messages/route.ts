import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";
import { withRetry } from "@/lib/db";

async function checkAccess(req: NextRequest, groupId: number) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return { session: null, allowed: false };

  if (isStaff(session.role)) return { session, allowed: true };

  const userResult = await withRetry(() => sql`SELECT group_id FROM users WHERE id = ${session.userId}`);
  const allowed = userResult.rows[0]?.group_id === groupId;
  return { session, allowed };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const gid = Number(groupId);
  const { session, allowed } = await checkAccess(req, gid);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!allowed) return NextResponse.json({ error: "You are not a member of this group." }, { status: 403 });

  const result = await withRetry(() => sql`
    SELECT id, user_id, sender_name, body, created_at
    FROM group_messages
    WHERE group_id = ${gid}
    ORDER BY created_at ASC
    LIMIT 200
  `);

  return NextResponse.json({
    messages: result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      senderName: r.sender_name,
      body: r.body,
      time: new Date(r.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const gid = Number(groupId);
  const { session, allowed } = await checkAccess(req, gid);
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!allowed) return NextResponse.json({ error: "You are not a member of this group." }, { status: 403 });

  const { body } = await req.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }

  const displayName = isStaff(session.role) ? "Admin" : session.name;

  await withRetry(() => sql`
    INSERT INTO group_messages (group_id, user_id, sender_name, body)
    VALUES (${gid}, ${session.userId}, ${displayName}, ${body.trim()})
  `);

  return NextResponse.json({ success: true });
}

