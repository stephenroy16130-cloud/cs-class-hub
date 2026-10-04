export function getRpId(): string {
  return process.env.NEXT_PUBLIC_RP_ID || "localhost";
}

export function getOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
