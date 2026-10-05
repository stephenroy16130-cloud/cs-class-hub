"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useInstallPrompt } from "@/lib/useInstallPrompt";
import { isStaff } from "@/lib/auth";
import { useClickOutside } from "@/lib/useClickOutside";

type Session = { userId: number; role: "admin" | "assistant" | "student"; name: string; admissionNo: string | null } | null;

export default function AccountMenu() {
  const [session, setSession] = useState<Session>(null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);
  const { canInstall, install } = useInstallPrompt();
  const menuRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  async function loadSession() {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setSession(data.session);
    }
  }

  async function loadAvatar() {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      setAvatarData(data.avatarData);
    }
  }

  useEffect(() => {
    loadSession();
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      setBioSupported(true);
    }
  }, []);

  useEffect(() => {
    if (session) loadAvatar();
  }, [session]);

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function handleInstall() {
    await install();
    setOpen(false);
  }

  if (!session) return null;

  const initials = session.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={menuRef} className="fixed bottom-5 left-5 z-50">
      {open && (
        <div className="mb-3 w-56 rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-navy">{session.name}</p>
            <p className="text-xs capitalize text-gray-400">{session.role}</p>
          </div>
          <nav className="flex flex-col py-1 text-sm">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="px-4 py-2 text-navy hover:bg-gold-light">
              Dashboard
            </Link>
            <Link href="/profile" onClick={() => setOpen(false)} className="px-4 py-2 text-navy hover:bg-gold-light">
              Edit Profile
            </Link>
            {isStaff(session.role) && (
              <Link href="/admin" onClick={() => setOpen(false)} className="px-4 py-2 text-navy hover:bg-gold-light">
                Admin Panel
              </Link>
            )}
            <Link href="/class-list" onClick={() => setOpen(false)} className="px-4 py-2 text-navy hover:bg-gold-light">
              Class List
            </Link>
            {bioSupported && (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 border-t border-gray-100 px-4 py-2 text-navy hover:bg-gold-light"
              >
                <span>Set Up Fingerprint / Face</span>
              </Link>
            )}
            {canInstall && (
              <button onClick={handleInstall} className="flex items-center gap-2 border-t border-gray-100 px-4 py-2 text-left text-navy hover:bg-gold-light">
                <span>Install App</span>
                <span className="rounded-full bg-gold-light px-1.5 py-0.5 text-[10px] font-semibold text-gold">NEW</span>
              </button>
            )}
            <button onClick={handleLogout} className="border-t border-gray-100 px-4 py-2 text-left text-red-600 hover:bg-red-50">
              Log Out
            </button>
          </nav>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-md hover:shadow-lg"
      >
        {avatarData ? (
          <img src={avatarData} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-gold">
            {initials}
          </span>
        )}
        <span className="hidden text-sm font-medium text-navy sm:block">{session.name.split(" ")[0]}</span>
      </button>
    </div>
  );
}
