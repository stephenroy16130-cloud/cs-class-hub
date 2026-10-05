"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Message = { id: number; userId: number; senderName: string; body: string; time: string };

export default function GroupChatPage({ groupId, userId, userName }: { groupId: number; userId: number; userName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`);
      if (res.ok) {
        setMessages((await res.json()).messages);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Could not load chat.");
      }
    } catch {
      // keep previous state on a transient network blip
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [groupId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      load();
    } catch {
      setError("Message may not have sent. Check your connection.");
    }
  }

  if (error && messages.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-gray-500">{error}</p>
        <Link href="/groups" className="mt-4 inline-block text-sm font-semibold text-navy hover:text-gold">
          &larr; Back to Groups
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col px-4 py-6">
      <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <Link href="/groups" className="text-xs text-gray-400 hover:text-navy">&larr; Back to Groups</Link>
          <h1 className="font-serif text-xl font-bold text-navy">
            Group {String(groupId).padStart(2, "0")} Chat
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 p-4">
        {loading && <p className="text-xs text-gray-400">Loading...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-gray-400">No messages yet. Say hello!</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`mb-3 flex ${m.userId === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${m.userId === userId ? "bg-navy text-white" : "bg-gray-100 text-navy"}`}>
              <p className="mb-0.5 text-xs font-semibold text-gold">{m.userId === userId ? "You" : m.senderName}</p>
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] opacity-60">{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your group..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-sm"
        />
        <button type="submit" className="rounded-md bg-gold px-5 py-3 text-sm font-semibold text-white">
          Send
        </button>
      </form>
    </section>
  );
}
