import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const usersResult = await sql`
    SELECT id, name, admission_no, group_id FROM users
    WHERE role = 'student'
    ORDER BY group_id NULLS LAST, name
  `;

  const infoResult = await sql`SELECT group_id, leader_admission_no, whatsapp_link FROM group_info`;
  const infoByGroup = new Map(infoResult.rows.map((r) => [r.group_id, r]));

  const groupsMap = new Map();
  for (let i = 1; i <= 24; i++) {
    const info = infoByGroup.get(i);
    groupsMap.set(i, {
      id: i,
      members: [] as any[],
      leaderAdmissionNo: info?.leader_admission_no ?? null,
      whatsappLink: info?.whatsapp_link ?? null,
    });
  }
  const unassigned: any[] = [];

  for (const row of usersResult.rows) {
    const member = { id: row.id, name: row.name, admissionNo: row.admission_no };
    if (row.group_id && groupsMap.has(row.group_id)) {
      groupsMap.get(row.group_id).members.push(member);
    } else {
      unassigned.push(member);
    }
  }

  for (const group of groupsMap.values()) {
    if (group.leaderAdmissionNo) {
      const leader = group.members.find((m: any) => m.admissionNo === group.leaderAdmissionNo);
      group.leaderName = leader ? leader.name : null;
    } else {
      group.leaderName = null;
    }
  }

  const you = usersResult.rows.find((r) => r.id === session.userId);

  const pendingResult = await sql`
    SELECT requested_group_id FROM join_requests
    WHERE user_id = ${session.userId} AND status = 'pending'
    LIMIT 1
  `;
  const pendingRequestGroupId = pendingResult.rows[0]?.requested_group_id ?? null;

  return NextResponse.json({
    groups: Array.from(groupsMap.values()),
    unassigned,
    yourGroupId: you ? you.group_id : null,
    pendingRequestGroupId,
  });
}
