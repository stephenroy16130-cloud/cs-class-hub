"use client";

import { useEffect, useState } from "react";
import { maskAdmissionNo } from "@/lib/mask";

type RosterEntry = { id: number; admission_no: string; name: string; contact: string | null };

export default function ClassListClient({ isAdmin }: { isAdmin: boolean }) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAdmissionNo, setNewAdmissionNo] = useState("");
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/roster");
    if (res.ok) setRoster((await res.json()).roster);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admissionNo: newAdmissionNo, name: newName, contact: newContact }),
    });
    const result = await res.json();
    if (!res.ok) {
      setMessage(result.error || "Something went wrong.");
      return;
    }
    setNewAdmissionNo("");
    setNewName("");
    setNewContact("");
    setShowAdd(false);
    load();
  }

  async function removeStudent(id: number) {
    if (!confirm("Remove this student from the class list?")) return;
    await fetch(`/api/admin/roster/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = roster.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.admission_no.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Roster</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Class List</h1>
          <p className="mt-2 text-gray-600">{roster.length} students enrolled</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {showAdd ? "Cancel" : "+ Add Student"}
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={addStudent} className="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Admission Number (e.g. IN13/00510/26)"
            required
            value={newAdmissionNo}
            onChange={(e) => setNewAdmissionNo(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Full Name"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Contact (optional)"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button type="submit" className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
            Add to Class List
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Search by name or admission number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-6 w-full max-w-sm rounded-md border border-gray-300 px-4 py-2 text-sm"
      />

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-navy">{r.name}</p>
                <p className="text-xs text-gray-400">{maskAdmissionNo(r.admission_no)}</p>
              </div>
              <div className="flex items-center gap-4">
                {r.contact && <span className="text-gray-500">{r.contact}</span>}
                {isAdmin && (
                  <button
                    onClick={() => removeStudent(r.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
