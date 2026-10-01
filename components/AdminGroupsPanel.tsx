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
type Group = {
  id: number;
  members: Member[];
  leaderAdmissionNo: string | null;
  leaderName: string | null;
  whatsappLink: string | null;
};

export default function AdminGroupsPanel() {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassigned, setUnassigned] = useState<Member[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [leaderInput, setLeaderInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }

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

  async function handleRequest(id: number, action: "approve" | "reject", studentName: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/join-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = {};
      }

      if (!res.ok) {
        showToast("error", result.error || "That didn't work. Please try again.");
        return;
      }

      showToast("success", action === "approve" ? `${studentName}'s request was approved.` : `${studentName}'s request was rejected.`);
      await loadAll();
    } catch {
      showToast("error", "Could not reach the server. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function assignMember(userId: number, groupId: number | null) {
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/groups/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, groupId }),
      });
      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = {};
      }
      if (!res.ok) {
        showToast("error", result.error || "That didn't work.");
        return;
      }
      await loadAll();
    } catch {
      showToast("error", "Could not reach the server. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  function startEditing(g: Group) {
    setEditingGroup(g.id);
    setLeaderInput(g.leaderAdmissionNo || "");
    setWhatsappInput(g.whatsappLink || "");
  }

  async function saveGroupInfo(groupId: number) {
    setSavingInfo(true);
    try {
      await fetch("/api/admin/groups/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          leaderAdmissionNo: leaderInput.trim() || null,
          whatsappLink: whatsappInput.trim() || null,
        }),
      });
      setEditingGroup(null);
      showToast("success", "Group info updated.");
      await loadAll();
    } finally {
      setSavingInfo(false);
    }
  }

  const pendingUserIds = new Set(pending.map((r) => r.user_id));

  return (
    <div className="mt-8 flex flex-col gap-10">
      {toast && (
        <div
          className={`fixed right-5 top-20 z-50 rounded-md px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.text}
        </div>
      )}

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
                    onClick={() => handleRequest(r.id, "approve", r.name)}
                    disabled={busyId === r.id}
                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {busyId === r.id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleRequest(r.id, "reject", r.name)}
                    disabled={busyId === r.id}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 disabled:opacity-50"
                  >
                    {busyId === r.id ? "..." : "Reject"}
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
            {unassigned.map((m) => {
              const hasPending = pendingUserIds.has(m.id);
              return (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm">
                  <span className="text-navy">{m.name} <span className="text-gray-400">({m.admissionNo})</span></span>
                  {hasPending ? (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      Pending approval above
                    </span>
                  ) : (
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl font-semibold text-navy">All Groups</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-serif font-semibold text-navy">Group {String(g.id).padStart(2, "0")}</p>
                <button
                  onClick={() => (editingGroup === g.id ? setEditingGroup(null) : startEditing(g))}
                  className="text-xs font-semibold text-navy hover:text-gold"
                >
                  {editingGroup === g.id ? "Cancel" : "Edit Leader / Link"}
                </button>
              </div>

              {editingGroup === g.id ? (
                <div className="mt-2 flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Leader admission no. (e.g. IN13/00744/26)"
                    value={leaderInput}
                    onChange={(e) => setLeaderInput(e.target.value)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp group link"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => saveGroupInfo(g.id)}
                    disabled={savingInfo}
                    className="rounded-md bg-navy px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {savingInfo ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {g.leaderName ? `Leader: ${g.leaderName}` : "No leader set"}
                  {g.whatsappLink ? " \u00b7 WhatsApp link set" : ""}
                </p>
              )}

              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {g.members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <span className="text-navy">
                      {m.name}
                      {g.leaderAdmissionNo === m.admissionNo && (
                        <span className="ml-1 text-xs text-gold">(Leader)</span>
                      )}
                    </span>
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
