import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { unit, title, type, url } = await req.json();
  if (!unit || !title || !type || !url) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await sql`
    INSERT INTO resources (unit, title, type, url, posted_by)
    VALUES (${unit}, ${title}, ${type}, ${url}, ${session.userId})
  `;

  return NextResponse.json({ success: true });
}
