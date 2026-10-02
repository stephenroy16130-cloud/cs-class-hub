import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "session";
const secretKey = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret");

export type SessionPayload = {
  userId: number;
  role: "admin" | "assistant" | "student";
  name: string;
  admissionNo: string | null;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function isStaff(role: string): boolean {
  return role === "admin" || role === "assistant";
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
