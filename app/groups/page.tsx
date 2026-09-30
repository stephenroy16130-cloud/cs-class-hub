import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import GroupsClient from "@/components/GroupsClient";

export default async function GroupsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  return <GroupsClient role={session?.role ?? "student"} />;
}
