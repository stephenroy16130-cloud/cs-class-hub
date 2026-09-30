"use client";

import { useEffect, useState } from "react";

type PendingRequest = {
  id: number;
  user_id: number;
  name: string;
  admission_no: string;
  requested_group_id: number;
  current_group_id: number | null;
};

type Member = { id: number; name: string; admissionNo: string };
type Group = { id: number; members: Member[] };

export default function AdminGroupsPanel() {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassigned, setUnassigned] = useState<Member[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function loadAll() {
    const [reqRes, groupsRes] = await Promise.all([
      fetch("/api/admin/join-requests"),
      fetch("/api/groups"),
    ]);
    if (reqRes.ok) setPending((await reqRes.json()).requests);
    if (groupsRes.ok) {
      const data = await groupsRes.json();
      setGroups(data.groups);
      setUnassigned(data.unassigned);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleRequest(id: number, action: "approve" | "reject") {
    setBusyId(id);
    try {
      await fetch(`/api/admin/join-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await loadAll();
    } finally {
      setBusyId(null);
    }
  }

  async function assignMember(userId: number, groupId: number | null) {
    setBusyId(userId);
    try {
      await fetch("/api/admin/groups/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, groupId }),
      });
      await loadAll();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-10">
      <div>
        <h2 className="font-serif text-xl font-semibold text-navy">
          Pending Join Requests {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">No pending requests.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-navy">{r.name}</span>{" "}
                  <span className="text-gray-400">({r.admission_no})</span>
                  <span className="ml-2 text-gray-600">
                    wants to join Group {String(r.requested_group_id).padStart(2, "0")}
                    {r.current_group_id ? ` (currently in Group ${String(r.current_group_id).padStart(2, "0")})` : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(r.id, "approve")}
                    disabled={busyId === r.id}
                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRequest(r.id, "reject")}
                    disabled={busyId === r.id}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {unassigned.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-navy">Unassigned Students</h2>
          <div className="mt-3 flex flex-col gap-2">
            {unassigned.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm">
                <span className="text-navy">{m.name} <span className="text-gray-400">({m.admissionNo})</span></span>
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && assignMember(m.id, Number(e.target.value))}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                >
                  <option value="" disabled>Assign to group...</option>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>Group {String(n).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl font-semibold text-navy">All Groups</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg border border-gray-200 p-4">
              <p className="font-serif font-semibold text-navy">Group {String(g.id).padStart(2, "0")}</p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {g.members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <span className="text-navy">{m.name}</span>
                    <button
                      onClick={() => assignMember(m.id, null)}
                      disabled={busyId === m.id}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {g.members.length === 0 && <li className="text-xs text-gray-400">Empty</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
