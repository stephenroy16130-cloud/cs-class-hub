import type { NextRequest } from "next/server";

function getHostHeader(req: NextRequest): string {
  const raw = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost";
  return raw.split(",")[0].trim();
}

function isAllowedHost(hostname: string): boolean {
  const configured = process.env.NEXT_PUBLIC_RP_ID;
  return (
    hostname === "localhost" ||
    hostname.endsWith(".vercel.app") ||
    (!!configured && hostname === configured)
  );
}

export function getRpId(req: NextRequest): string {
  const hostname = getHostHeader(req).split(":")[0];
  if (isAllowedHost(hostname)) return hostname;
  return process.env.NEXT_PUBLIC_RP_ID || "localhost";
}

export function getOrigin(req: NextRequest): string {
  const hostHeader = getHostHeader(req);
  const hostname = hostHeader.split(":")[0];
  if (!isAllowedHost(hostname)) {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim() || (hostname === "localhost" ? "http" : "https");
  return `${proto}://${hostHeader}`;
}
