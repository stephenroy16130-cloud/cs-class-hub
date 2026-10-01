import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !session.admissionNo) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await sql`
    SELECT status, COUNT(*) as count FROM attendance_records
    WHERE admission_no = ${session.admissionNo}
    GROUP BY status
  `;

  let present = 0;
  let absent = 0;
  for (const row of result.rows) {
    if (row.status === "present") present = Number(row.count);
    if (row.status === "absent") absent = Number(row.count);
  }

  const total = present + absent;
  const percentage = total > 0 ? Math.round((present / total) * 100) : null;

  return NextResponse.json({ present, absent, total, percentage });
}
