import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import ResourcesClient from "@/components/ResourcesClient";

export default async function ResourcesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  return <ResourcesClient isAdmin={session?.role === "admin"} />;
}
