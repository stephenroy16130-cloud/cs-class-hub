"use client";

import { useEffect, useState } from "react";

type Notification = { id: number; type: string; title: string; body: string | null; read: boolean; time: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  async function handleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} aria-label="Notifications" className="relative rounded-full p-2 hover:bg-gray-100">
        <svg className="h-5 w-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-sm font-semibold text-navy">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-gray-400">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="border-b border-gray-50 px-4 py-3 text-sm last:border-b-0">
                <p className="font-medium text-navy">{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>}
                <p className="mt-1 text-[10px] text-gray-400">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
