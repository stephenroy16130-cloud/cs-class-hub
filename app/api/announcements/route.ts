import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await sql`
    SELECT id, title, category, excerpt, created_at
    FROM announcements
    ORDER BY created_at DESC
  `;

  return NextResponse.json({
    announcements: result.rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      excerpt: r.excerpt,
      date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    })),
  });
}
