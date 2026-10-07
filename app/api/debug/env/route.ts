import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    rpId: process.env.NEXT_PUBLIC_RP_ID || "(not set)",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "(not set)",
  });
}
