"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { maskAdmissionNo } from "@/lib/mask";
import GroupChat from "@/components/GroupChat";
import GroupsSkeleton from "@/components/GroupsSkeleton";type Member = { id: number; name: string; admissionNo: string };
type Group = {
  id: number;
  members: Member[];
  leaderAdmissionNo: string | null;
  leaderName: string | null;
  whatsappLink: string | null;
};

type GroupsData = {
  groups: Group[];
  unassigned: Member[];
  yourGroupId: number | null;
  pendingRequestGroupId: number | null;
};

export default function GroupsClient({ role, userId }: { role: "admin" | "student"; userId: number | null }) {
  const [data, setData] = useState<GroupsData | null>(null);
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const [requesting, setRequesting] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) setData(await res.json());
    } catch {
      // network error on load; leave previous data in place
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function requestJoin(groupId: number) {
    setRequesting(groupId);
    setMessage("");
    try {
      const res = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = {};
      }

      if (!res.ok) {
        setMessage(result.error || "The server didn't respond properly. Please try again in a moment.");
      } else {
        setMessage("Request sent. Waiting for admin approval.");
        load();
      }
    } catch {
      setMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setRequesting(null);
    }
  }

  if (!data) {
    return <GroupsSkeleton />;
  }

  const matchingGroupId = query.trim()
    ? data.groups.find((g) =>
        g.members.some(
          (m) =>
            m.admissionNo.toLowerCase().includes(query.toLowerCase()) ||
            m.name.toLowerCase().includes(query.toLowerCase())
        )
      )?.id ?? null
    : null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Coordination</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Groups</h1>
          <p className="mt-2 text-gray-600">
            {data.groups.length} groups &middot;{" "}
            {data.groups.reduce((n, g) => n + g.members.length, 0)} members registered
          </p>
        </div>
        {role === "admin" && (
          <Link href="/admin" className="text-sm font-semibold text-navy hover:text-gold">
            Manage in Admin Panel &rarr;
          </Link>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by name or admission number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-6 w-full max-w-sm rounded-md border border-gray-300 px-4 py-2 text-sm"
      />

      {message && <p className="mt-3 text-sm text-navy">{message}</p>}

      {data.yourGroupId && (
        <p className="mt-4 text-sm text-emerald-700">
          You are currently in Group {String(data.yourGroupId).padStart(2, "0")}.
        </p>
      )}
      {data.pendingRequestGroupId && (
        <p className="mt-2 text-sm text-amber-700">
          You have a pending request to join Group {String(data.pendingRequestGroupId).padStart(2, "0")}.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {data.groups.map((g) => {
          const isOpen = openGroup === g.id || matchingGroupId === g.id;
          const isYours = data.yourGroupId === g.id;
          const isPending = data.pendingRequestGroupId === g.id;

          return (
            <div key={g.id} className="rounded-lg border border-gray-200">
              <button
                onClick={() => setOpenGroup(isOpen ? null : g.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p className="font-serif text-lg font-semibold text-navy">
                    Group {String(g.id).padStart(2, "0")}
                    {isYours && <span className="ml-2 text-xs font-normal text-emerald-600">(Your group)</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {g.members.length} members{g.leaderName ? ` \u00b7 Leader: ${g.leaderName}` : ""}
                  </p>
                </div>
                <span className="text-gray-400">{isOpen ? "-" : "+"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-200 px-5 py-3">
                  {g.whatsappLink && (
                    <a
                      href={g.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-3 inline-block rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Join WhatsApp Group
                    </a>
                  )}
                  <ul className="divide-y divide-gray-100 text-sm">
                    {g.members.map((m) => (
                      <li key={m.id} className="flex items-center justify-between py-2">
                        <span className="text-navy">
                          {m.name}
                          {g.leaderAdmissionNo === m.admissionNo && (
                            <span className="ml-1 text-xs text-gold">(Leader)</span>
                          )}
                        </span>
                        <span className="text-xs text-gray-400">{maskAdmissionNo(m.admissionNo)}</span>
                      </li>
                    ))}
                    {g.members.length === 0 && (
                      <li className="py-2 text-xs text-gray-400">No members yet.</li>
                    )}
                  </ul>

                  {role === "student" && !isYours && (
                    <button
                      onClick={() => requestJoin(g.id)}
                      disabled={requesting === g.id || isPending}
                      className="mt-3 w-full rounded-md border border-navy py-1.5 text-xs font-semibold text-navy transition hover:bg-navy hover:text-white disabled:opacity-50"
                    >
                      {isPending ? "Request Pending" : requesting === g.id ? "Sending..." : "Request to Join"}
                    </button>
                  )}

                  {(isYours || role === "admin") && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Group Chat</p>
                      <GroupChat groupId={g.id} currentUserId={userId} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}



