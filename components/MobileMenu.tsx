"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavLink = { href: string; label: string };
type Session = { name: string; role: "admin" | "assistant" | "student" } | null;

export default function MobileMenu({ links, session }: { links: NavLink[]; session: Session }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="relative flex h-9 w-9 flex-col items-center justify-center gap-1.5"
      >
        <span className={`h-0.5 w-6 rounded-full bg-navy transition-all duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`h-0.5 w-6 rounded-full bg-navy transition-all duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
        <span className={`h-0.5 w-6 rounded-full bg-navy transition-all duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      <div
        className={`fixed inset-x-0 top-[57px] z-40 overflow-hidden border-b border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {links.map((l) => {
            const isActive = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-medium transition ${
                  isActive ? "bg-gold-light text-navy" : "text-navy hover:bg-gold-light"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          <div className="my-2 border-t border-gray-100" />

          {session ? (
            <>
              <span className="px-3 py-1 text-xs text-gray-400">Signed in as {session.name}</span>
              {session.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-3 text-sm font-medium transition ${
                    pathname.startsWith("/admin") ? "bg-gold-light text-navy" : "text-navy hover:bg-gold-light"
                  }`}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/class-list"
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-medium transition ${
                  pathname.startsWith("/class-list") ? "bg-gold-light text-navy" : "text-navy hover:bg-gold-light"
                }`}
              >
                Class List
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 rounded-md bg-navy px-3 py-3 text-left text-sm font-semibold text-white"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-navy transition hover:bg-gold-light"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-md bg-gold px-3 py-3 text-center text-sm font-semibold text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
