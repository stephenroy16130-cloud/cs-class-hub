"use client";

import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

type Props = {
  session: { name: string; role: "admin" | "student" } | null;
};

export default function NavAuthLinks({ session }: Props) {
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
      <NotificationBell />
    </div>
  );
}
