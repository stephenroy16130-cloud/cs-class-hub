"use client";

import { useEffect, useRef, useState } from "react";

type Message = { id: number; userId: number; senderName: string; body: string; time: string };

export default function GroupChat({ groupId, currentUserId }: { groupId: number; currentUserId: number | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/groups/${groupId}/messages`);
    if (res.ok) {
      setMessages((await res.json()).messages);
      setError("");
    } else {
      const data = await res.json();
      setError(data.error || "Could not load chat.");
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await fetch(`/api/groups/${groupId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    load();
  }

  if (error) {
    return <p className="mt-3 text-xs text-gray-400">{error}</p>;
  }

  return (
    <div className="mt-3 rounded-lg border border-gray-200">
      <div className="max-h-64 overflow-y-auto p-3">
        {messages.length === 0 && <p className="text-xs text-gray-400">No messages yet. Say hello!</p>}
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 flex ${m.userId === currentUserId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-1.5 text-xs ${m.userId === currentUserId ? "bg-navy text-white" : "bg-gray-100 text-navy"}`}>
              {m.userId !== currentUserId && <p className="mb-0.5 font-semibold text-gold">{m.senderName}</p>}
              <p>{m.body}</p>
              <p className="mt-0.5 text-[10px] opacity-60">{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your group..."
          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
        />
        <button type="submit" className="rounded-md bg-gold px-3 py-1 text-xs font-semibold text-white">
          Send
        </button>
      </form>
    </div>
  );
}
