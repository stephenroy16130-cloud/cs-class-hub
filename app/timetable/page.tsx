import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import TimetableGrid from "@/components/TimetableGrid";

export default async function TimetablePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  return <TimetableGrid isAdmin={session?.role === "admin"} />;
}
