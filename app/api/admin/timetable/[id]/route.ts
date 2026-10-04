
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { sendPushToAllStudents } from "@/lib/push";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { day, time, unit, lecturer, venue, mode } = await req.json();

  try {
    await withRetry(() => sql`
      UPDATE timetable_sessions
      SET day = ${day}, time = ${time}, unit = ${unit}, lecturer = ${lecturer}, venue = ${venue}, mode = ${mode}
      WHERE id = ${id}
    `);

    const title = "Timetable updated";
    const body = `${unit} on ${day} has been updated — now at ${time} (${mode}, ${venue}).`;

    await sql`
      INSERT INTO notifications (user_id, type, title, body)
      SELECT id, 'timetable', ${title}, ${body} FROM users WHERE role = 'student'
    `;

    sendPushToAllStudents(title, body, "/timetable").catch(() => { });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "The database didn't respond in time. Please try again in a moment." },
      { status: 503 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  try {
    // fetch the session details before deleting so we can describe it in the notification
    const existing = await sql`SELECT unit, day, time FROM timetable_sessions WHERE id = ${id}`;
    await withRetry(() => sql`DELETE FROM timetable_sessions WHERE id = ${id}`);

    if (existing.rows.length > 0) {
      const { unit, day, time } = existing.rows[0];
      const title = "Timetable updated";
      const body = `${unit} on ${day} at ${time} has been removed from the timetable.`;

      await sql`
        INSERT INTO notifications (user_id, type, title, body)
        SELECT id, 'timetable', ${title}, ${body} FROM users WHERE role = 'student'
      `;

      sendPushToAllStudents(title, body, "/timetable").catch(() => { });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "The database didn't respond in time. Please try again in a moment." },
      { status: 503 }
    );
  }
}


