"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { matchIntent } from "@/lib/chatbot";
import { getNextSession, type TimetableSession } from "@/lib/schedule";

type Message = { id: number; from: "bot" | "user"; text: string; link?: { href: string; label: string } };

let nextId = 1;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId++, from: "bot", text: "Hi! I'm the CS 1.1 assistant. Ask me about your next class, your group, announcements, or your attendance." },
  ]);
  const [input, setInput] = useState("");
  const [session, setSession] = useState<{ admissionNo: string | null; role: string } | null>(null);
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setSession(data.session));

    fetch("/api/timetable")
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => setSessions(data.sessions || []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function addBotMessage(text: string, link?: { href: string; label: string }) {
    setMessages((prev) => [...prev, { id: nextId++, from: "bot", text, link }]);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: nextId++, from: "user", text }]);
    setInput("");
    setThinking(true);

    const intent = matchIntent(text);

    try {
      switch (intent) {
        case "greeting":
          addBotMessage("Hey there! What would you like to know?");
          break;

        case "thanks":
          addBotMessage("Anytime! Let me know if you need anything else.");
          break;

        case "next_class": {
          const next = getNextSession(sessions, new Date());
          if (!next) {
            addBotMessage("I couldn't find an upcoming class in the timetable.");
          } else {
            const when = next.offset === 0 ? "today" : next.offset === 1 ? "tomorrow" : `on ${next.dayName}`;
            addBotMessage(
              `Your next class is ${next.session.unit} ${when} at ${next.session.time} (${next.session.venue}, ${next.session.mode}) with ${next.session.lecturer}.`
            );
          }
          break;
        }

        case "timetable":
          addBotMessage("You can see the full weekly timetable here:", { href: "/timetable", label: "View Timetable" });
          break;

        case "my_group": {
          if (!session?.admissionNo) {
            addBotMessage("Log in first, and I can tell you your group.");
            break;
          }
          const res = await fetch("/api/groups");
          if (!res.ok) {
            addBotMessage("I couldn't check that right now. Try the Groups page directly.", { href: "/groups", label: "Go to Groups" });
            break;
          }
          const data = await res.json();
          if (data.yourGroupId) {
            addBotMessage(`You're in Group ${String(data.yourGroupId).padStart(2, "0")}.`, { href: "/groups", label: "View Groups" });
          } else if (data.pendingRequestGroupId) {
            addBotMessage(`You have a pending request to join Group ${String(data.pendingRequestGroupId).padStart(2, "0")}.`);
          } else {
            addBotMessage("You're not in a group yet. Head to the Groups page to request one.", { href: "/groups", label: "Join a Group" });
          }
          break;
        }

        case "join_group":
          addBotMessage(
            "Open a group on the Groups page and tap 'Request to Join' — the class rep will approve or reject it.",
            { href: "/groups", label: "Go to Groups" }
          );
          break;

        case "announcements": {
          const res = await fetch("/api/announcements");
          if (!res.ok) {
            addBotMessage("I couldn't load announcements right now.", { href: "/announcements", label: "View Announcements" });
            break;
          }
          const data = await res.json();
          const urgent = data.announcements.find((a: any) => a.category === "Urgent");
          if (urgent) {
            addBotMessage(`Urgent: ${urgent.title} — ${urgent.excerpt}`, { href: "/announcements", label: "See All" });
          } else if (data.announcements.length > 0) {
            const latest = data.announcements[0];
            addBotMessage(`Latest: ${latest.title} (${latest.date}) — ${latest.excerpt}`, { href: "/announcements", label: "See All" });
          } else {
            addBotMessage("No announcements posted yet.");
          }
          break;
        }

        case "my_attendance": {
          if (!session?.admissionNo) {
            addBotMessage("Log in first, and I can check your attendance.");
            break;
          }
          const res = await fetch("/api/attendance/me");
          if (!res.ok) {
            addBotMessage("I couldn't check that right now.", { href: "/attendance", label: "Go to Attendance" });
            break;
          }
          const data = await res.json();
          const present = data.classDays.filter((d: any) => d.status === "present").length;
          const absent = data.classDays.filter((d: any) => d.status === "absent").length;
          const notMarked = data.classDays.filter((d: any) => !d.status).length;
          addBotMessage(
            `So far this month: ${present} present, ${absent} absent, ${notMarked} not yet marked.`,
            { href: "/attendance", label: "View Calendar" }
          );
          break;
        }

        case "reset_password":
          addBotMessage(
            "You can reset it yourself using your admission number and the phone number on your roster.",
            { href: "/forgot-password", label: "Reset Password" }
          );
          break;

        case "resources":
          addBotMessage("Lecture notes, slides and past papers are organized by unit here:", { href: "/resources", label: "Go to Resources" });
          break;

        case "contact":
          addBotMessage("Here's how to reach the class rep and assistant:", { href: "/contact", label: "Go to Contact" });
          break;

        default:
          addBotMessage(
            "I'm not sure about that one yet. Try asking about your next class, your group, announcements, attendance, or resetting your password — or contact the class rep directly.",
            { href: "/contact", label: "Contact Class Rep" }
          );
      }
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between bg-navy px-4 py-3">
            <p className="font-serif text-sm font-semibold text-white">CS 1.1 Assistant</p>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white" aria-label="Close chat">
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`mb-2 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.from === "user" ? "bg-navy text-white" : "bg-gray-100 text-navy"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.link && (
                    <Link href={m.link.href} className="mt-1 inline-block text-xs font-semibold text-gold underline">
                      {m.link.label} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="mb-2 flex justify-start">
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-gold px-3 py-2 text-sm font-semibold text-white">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chat assistant"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-2xl text-gold shadow-lg transition hover:opacity-90"
      >
        {open ? "\u00d7" : "\ud83d\udcac"}
      </button>
    </div>
  );
}
