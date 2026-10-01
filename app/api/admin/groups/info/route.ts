import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { groupId, leaderAdmissionNo, whatsappLink } = await req.json();
  if (!groupId) {
    return NextResponse.json({ error: "groupId is required." }, { status: 400 });
  }

  await sql`
    INSERT INTO group_info (group_id, leader_admission_no, whatsapp_link, updated_at)
    VALUES (${groupId}, ${leaderAdmissionNo || null}, ${whatsappLink || null}, now())
    ON CONFLICT (group_id)
    DO UPDATE SET
      leader_admission_no = ${leaderAdmissionNo || null},
      whatsapp_link = ${whatsappLink || null},
      updated_at = now()
  `;

  return NextResponse.json({ success: true });
}
