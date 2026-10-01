import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";
import { getInPersonSessionForDate, toDateKey } from "@/lib/attendance";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const today = new Date();
  const todaySession = await getInPersonSessionForDate(today);
  if (todaySession) {
    const todayKey = toDateKey(today);
    const existing = await sql`
      SELECT id FROM notifications
      WHERE user_id = ${session.userId} AND type = 'class_today' AND created_at::date = ${todayKey}
    `;
    if (existing.rows.length === 0) {
      await sql`
        INSERT INTO notifications (user_id, type, title, body)
        VALUES (${session.userId}, 'class_today', 'You have class today', ${`${todaySession.unit} at ${todaySession.time}, in-person.`})
      `;
    }
  }

  const result = await sql`
    SELECT id, type, title, body, read, created_at
    FROM notifications
    WHERE user_id = ${session.userId}
    ORDER BY created_at DESC
    LIMIT 30
  `;

  const unreadCount = result.rows.filter((r) => !r.read).length;

  return NextResponse.json({
    notifications: result.rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      read: r.read,
      time: new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    })),
    unreadCount,
  });
}

