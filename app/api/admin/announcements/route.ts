import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken, isStaff } from "@/lib/auth";
import { notifyAllStudents } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { title, category, excerpt } = await req.json();
  if (!title || !category || !excerpt) {
    return NextResponse.json({ error: "Title, category and excerpt are required." }, { status: 400 });
  }

  await sql`
    INSERT INTO announcements (title, category, excerpt, posted_by)
    VALUES (${title}, ${category}, ${excerpt}, ${session.userId})
  `;

  await notifyAllStudents("announcement", `New announcement: ${title}`, excerpt);

  return NextResponse.json({ success: true });
}

