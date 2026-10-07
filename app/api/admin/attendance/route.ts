import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  const sessionIdParam = req.nextUrl.searchParams.get("sessionId");
  if (!dateParam || !sessionIdParam) {
    return NextResponse.json({ error: "date and sessionId are required." }, { status: 400 });
  }

  const sessionRow = await sql`SELECT unit, time FROM timetable_sessions WHERE id = ${sessionIdParam}`;
  const sessionInfo = sessionRow.rows[0];
  if (!sessionInfo) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  try {
    const rosterResult = await sql`
      SELECT r.admission_no, r.name, ar.status
      FROM roster r
      LEFT JOIN attendance_records ar
        ON ar.admission_no = r.admission_no
        AND ar.class_date = ${dateParam}
        AND ar.session_id = ${sessionIdParam}
      ORDER BY r.name
    `;

    return NextResponse.json({
      unit: sessionInfo.unit,
      time: sessionInfo.time,
      students: rosterResult.rows.map((r) => ({
        admissionNo: r.admission_no,
        name: r.name,
        status: r.status || null,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "The database didn't respond in time. Please try again in a moment." },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { date, sessionId, unit, records } = await req.json();
  if (!date || !sessionId || !unit || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "date, sessionId, unit and records are required." }, { status: 400 });
  }

  const admissionNos = records.map((r: any) => r.admissionNo);
  const statuses = records.map((r: any) => r.status);

  try {
    await sql.query(
      `INSERT INTO attendance_records (admission_no, class_date, unit, status, marked_by, session_id)
       SELECT a, $3::date, $4::text, s, $5::int, $6::int
       FROM UNNEST($1::text[], $2::text[]) AS t(a, s)
       ON CONFLICT (admission_no, class_date, COALESCE(session_id, 0))
       DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by, unit = EXCLUDED.unit`,
      [admissionNos, statuses, date, unit, session.userId, sessionId]
    );

    const usersResult = await sql.query(
      `SELECT id, admission_no FROM users WHERE admission_no = ANY($1::text[])`,
      [admissionNos]
    );

    if (usersResult.rows.length > 0) {
      const statusByAdmission = new Map(records.map((r: any) => [r.admissionNo, r.status]));
      const userIds: number[] = [];
      const titles: string[] = [];
      const bodies: string[] = [];

      for (const u of usersResult.rows) {
        userIds.push(u.id);
        titles.push("Your attendance has been recorded");
        bodies.push(`Marked ${statusByAdmission.get(u.admission_no)} for ${unit} on ${date}.`);
      }

      await sql.query(
        `INSERT INTO notifications (user_id, type, title, body)
         SELECT uid, 'attendance', t, b
         FROM UNNEST($1::int[], $2::text[], $3::text[]) AS n(uid, t, b)`,
        [userIds, titles, bodies]
      );
    }

    return NextResponse.json({ success: true, count: records.length });
  } catch (err) {
    console.error("bulk attendance save error:", err);
    return NextResponse.json(
      { error: "The database didn't respond in time. Please try again." },
      { status: 503 }
    );
  }
}
