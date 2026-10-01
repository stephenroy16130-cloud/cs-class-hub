import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";
import { getInPersonSessionForDate } from "@/lib/attendance";
import { notifyUser } from "@/lib/notify";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
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
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { date, unit, records } = await req.json();
  if (!date || !unit || !Array.isArray(records)) {
    return NextResponse.json({ error: "date, unit and records are required." }, { status: 400 });
  }

  for (const r of records) {
    await sql`
      INSERT INTO attendance_records (admission_no, class_date, unit, status, marked_by)
      VALUES (${r.admissionNo}, ${date}, ${unit}, ${r.status}, ${session.userId})
      ON CONFLICT (admission_no, class_date)
      DO UPDATE SET status = ${r.status}, marked_by = ${session.userId}, unit = ${unit}
    `;

    const userResult = await sql`SELECT id FROM users WHERE admission_no = ${r.admissionNo}`;
    const studentUserId = userResult.rows[0]?.id;
    if (studentUserId) {
      await notifyUser(
        studentUserId,
        "attendance",
        "Your attendance has been recorded",
        `Marked ${r.status} for ${unit} on ${date}.`
      );
    }
  }

  return NextResponse.json({ success: true, count: records.length });
}

