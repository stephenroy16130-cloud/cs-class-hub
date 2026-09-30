import { NextRequest, NextResponse } from "next/server";

// TEMPORARILY DISABLED — login requirement paused while sorting out the
// Neon/Vercel environment variable connection for local development.
// To re-enable: restore the version that checks verifySessionToken and
// redirects to /login (see chat history / git log for the previous version).

export async function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login|signup).*)"],
};
