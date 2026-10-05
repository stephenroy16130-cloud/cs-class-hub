import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import GroupChatPage from "@/components/GroupChatPage";

export default async function ChatPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/login");
  }

  return <GroupChatPage groupId={Number(groupId)} userId={session.userId} userName={session.name} />;
}
