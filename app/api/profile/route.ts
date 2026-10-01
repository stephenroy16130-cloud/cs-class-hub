import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await sql`SELECT name, role, avatar_data FROM users WHERE id = ${session.userId}`;
  const user = result.rows[0];

  return NextResponse.json({
    name: user?.name || session.name,
    role: user?.role || session.role,
    avatarData: user?.avatar_data || null,
  });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { avatarData } = await req.json();

  if (avatarData && avatarData.length > 300000) {
    return NextResponse.json({ error: "Image is too large. Try a smaller photo." }, { status: 400 });
  }

  await sql`UPDATE users SET avatar_data = ${avatarData || null} WHERE id = ${session.userId}`;

  return NextResponse.json({ success: true });
}
