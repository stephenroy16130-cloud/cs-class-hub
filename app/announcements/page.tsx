import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import AnnouncementsClient from "@/components/AnnouncementsClient";

export default async function AnnouncementsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  return <AnnouncementsClient isAdmin={session?.role === "admin"} />;
}
