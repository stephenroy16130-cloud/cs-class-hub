import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";
import { getInPersonSessionForDate } from "@/lib/attendance";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "date is required (YYYY-MM-DD)." }, { status: 400 });
  }

  const date = new Date(dateParam + "T00:00:00");
  const inPerson = await getInPersonSessionForDate(date);

  if (!inPerson) {
    return NextResponse.json({ unit: null, time: null, students: [] });
  }

  try {
    const rosterResult = await sql`
      SELECT r.admission_no, r.name, ar.status
      FROM roster r
      LEFT JOIN attendance_records ar ON ar.admission_no = r.admission_no AND ar.class_date = ${dateParam}
      ORDER BY r.name
    `;

    return NextResponse.json({
      unit: inPerson.unit,
      time: inPerson.time,
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

  const { date, unit, records } = await req.json();
  if (!date || !unit || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "date, unit and records are required." }, { status: 400 });
  }

  const admissionNos = records.map((r: any) => r.admissionNo);
  const statuses = records.map((r: any) => r.status);

  try {
    await sql.query(
      `INSERT INTO attendance_records (admission_no, class_date, unit, status, marked_by)
       SELECT a, $3::date, $4::text, s, $5::int
       FROM UNNEST($1::text[], $2::text[]) AS t(a, s)
       ON CONFLICT (admission_no, class_date)
       DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by, unit = EXCLUDED.unit`,
      [admissionNos, statuses, date, unit, session.userId]
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

