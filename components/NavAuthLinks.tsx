"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  session: { name: string; role: "admin" | "student" } | null;
};

export default function NavAuthLinks({ session }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm font-medium text-navy transition hover:text-gold">
          Log In
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-gray-500 sm:inline">Hi, {session.name.split(" ")[0]}</span>
      {session.role === "admin" && (
        <Link href="/admin" className="text-sm font-medium text-navy transition hover:text-gold">
          Admin
        </Link>
      )}
      <Link href="/class-list" className="text-sm font-medium text-navy transition hover:text-gold">
        Class List
      </Link>
      <button
        onClick={handleLogout}
        className="rounded-md border border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
      >
        Log Out
      </button>
    </div>
  );
}
