import ClassListClient from "@/components/ClassListClient";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export default async function ClassListPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  return <ClassListClient isAdmin={session?.role === "admin"} />;
}
