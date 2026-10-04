import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";
import { withRetry } from "@/lib/db";
import { sendPushToAllStudents } from "@/lib/push";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { day, time, unit, lecturer, venue, mode } = await req.json();
  if (!day || !time || !unit || !lecturer || !venue || !mode) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  try {
    await withRetry(() => sql`
      INSERT INTO timetable_sessions (day, time, unit, lecturer, venue, mode)
      VALUES (${day}, ${time}, ${unit}, ${lecturer}, ${venue}, ${mode})
    `);

    const title = "Timetable updated";
    const body = `${unit} has been added on ${day} at ${time} (${mode}).`;

    // in-app notifications for all students
    await sql`
      INSERT INTO notifications (user_id, type, title, body)
      SELECT id, 'timetable', ${title}, ${body} FROM users WHERE role = 'student'
    `;

    // device push (non-blocking)
    sendPushToAllStudents(title, body, "/timetable").catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "The database didn't respond in time. Please try again in a moment." },
      { status: 503 }
    );
  }
}


