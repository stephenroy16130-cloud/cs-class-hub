"use client";

import { useMemo, useState } from "react";
import { groups } from "@/lib/groups";
import { maskAdmissionNo } from "@/lib/mask";

export default function GroupsPage() {
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<number | null>(null);

  const matchingGroupId = useMemo(() => {
    if (query.trim() === "") return null;
    const q = query.trim().toLowerCase();
    const found = groups.find((g) =>
      g.members.some(
        (m) =>
          m.admissionNo.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q)
      )
    );
    return found ? found.id : null;
  }, [query]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Coordination</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Groups</h1>
      <p className="mt-2 text-gray-600">
        {groups.length} groups &middot; {groups.reduce((n, g) => n + g.members.length, 0)} students
      </p>

      <input
        type="text"
        placeholder="Search by name or admission number..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim() !== "") setOpenGroup(matchingGroupId);
        }}
        className="mt-6 w-full max-w-sm rounded-md border border-gray-300 px-4 py-2 text-sm"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {groups.map((g) => {
          const isOpen = openGroup === g.id || matchingGroupId === g.id;
          return (
            <div key={g.id} className="rounded-lg border border-gray-200">
              <button
                onClick={() => setOpenGroup(isOpen ? null : g.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p className="font-serif text-lg font-semibold text-navy">Group {String(g.id).padStart(2, "0")}</p>
                  <p className="text-xs text-gray-500">{g.members.length} members</p>
                </div>
                <span className="text-gray-400">{isOpen ? "-" : "+"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-200 px-5 py-3">
                  <ul className="divide-y divide-gray-100 text-sm">
                    {g.members.map((m) => (
                      <li key={m.classNo} className="flex items-center justify-between py-2">
                        <span className="text-navy">{m.name}</span>
                        <span className="text-xs text-gray-400">{maskAdmissionNo(m.admissionNo)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
