"use client";

import { useEffect, useState } from "react";
import { toLocalDateKey } from "@/lib/date";

type SessionOption = { id: number; unit: string; time: string };
type Student = { admissionNo: string; name: string; status: "present" | "absent" | null };

export default function AdminAttendancePanel() {
  const [date, setDate] = useState(toLocalDateKey(new Date()));
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [unit, setUnit] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingFor, setSavingFor] = useState<string | null>(null);
  const [savedFor, setSavedFor] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  async function loadSessions() {
    setLoadingSessions(true);
    setSelectedSessionId(null);
    try {
      const res = await fetch(`/api/admin/attendance/sessions?date=${date}`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, [date]);

  async function openSession(sessionId: number) {
    setSelectedSessionId(sessionId);
    setLoadingRoster(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${date}&sessionId=${sessionId}`);
      const data = await res.json();
      setUnit(data.unit);
      setTime(data.time);
      setStudents(data.students || []);
    } finally {
      setLoadingRoster(false);
    }
  }

  function closeSession() {
    setSelectedSessionId(null);
    setStudents([]);
  }

  async function saveOne(admissionNo: string, status: "present" | "absent") {
    if (!unit || !selectedSessionId) return;
    setSavingFor(admissionNo);
    try {
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, sessionId: selectedSessionId, unit, records: [{ admissionNo, status }] }),
      });
      setStudents((prev) => prev.map((s) => (s.admissionNo === admissionNo ? { ...s, status } : s)));
      setSavedFor(admissionNo);
      setTimeout(() => setSavedFor((cur) => (cur === admissionNo ? null : cur)), 1500);
    } finally {
      setSavingFor(null);
    }
  }

  async function markAll(status: "present" | "absent") {
    if (!unit || !selectedSessionId) return;
    setBulkSaving(true);
    try {
      const records = students.map((s) => ({ admissionNo: s.admissionNo, status }));
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, sessionId: selectedSessionId, unit, records }),
      });
      setStudents((prev) => prev.map((s) => ({ ...s, status })));
    } finally {
      setBulkSaving(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(query.toLowerCase())
  );

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const unmarkedCount = students.length - presentCount - absentCount;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button onClick={loadSessions} className="rounded-md border border-navy px-3 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white">
          Refresh
        </button>
      </div>

      {loadingSessions ? (
        <p className="mt-6 text-sm text-gray-400">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No in-person classes scheduled on this day.
        </p>
      ) : selectedSessionId === null ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-gray-600">
            {sessions.length > 1
              ? `${sessions.length} in-person sessions today. Pick one to mark:`
              : "Select the session to mark:"}
          </p>
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => openSession(s.id)}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm transition hover:border-gold hover:bg-gold-light"
              >
                <span className="font-semibold text-navy">{s.unit}</span>
                <span className="text-gray-500">{s.time}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Marking: <span className="font-semibold text-navy">{unit}</span> &middot; {time}
              </p>
              {!loadingRoster && (
                <p className="text-xs text-gray-400">
                  {students.length} on the class list &middot; {presentCount} present &middot; {absentCount} absent &middot; {unmarkedCount} unmarked
                </p>
              )}
            </div>
            <button onClick={closeSession} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              Close
            </button>
          </div>

          {loadingRoster ? (
            <p className="mt-6 text-sm text-gray-400">Loading roster...</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search student..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
              />

              <div className="mt-3 flex gap-2">
                <button onClick={() => markAll("present")} disabled={bulkSaving} className="rounded-md border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-50">
                  Mark All Present
                </button>
                <button onClick={() => markAll("absent")} disabled={bulkSaving} className="rounded-md border border-red-600 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-50">
                  Mark All Absent
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Each button saves instantly. Reopen this session anytime from the list above to make corrections.
              </p>

              <div className="mt-4 max-h-[500px] overflow-y-auto rounded-lg border border-gray-200">
                {filtered.map((s) => (
                  <div key={s.admissionNo} className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-sm last:border-b-0">
                    <span className="text-navy">
                      {s.name} <span className="text-gray-400">({s.admissionNo})</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {savedFor === s.admissionNo && <span className="mr-1 text-xs text-emerald-600">Saved &#10003;</span>}
                      <button
                        onClick={() => saveOne(s.admissionNo, "present")}
                        disabled={savingFor === s.admissionNo}
                        className={`rounded-md px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
                          s.status === "present" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {savingFor === s.admissionNo ? "..." : "Present"}
                      </button>
                      <button
                        onClick={() => saveOne(s.admissionNo, "absent")}
                        disabled={savingFor === s.admissionNo}
                        className={`rounded-md px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
                          s.status === "absent" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {savingFor === s.admissionNo ? "..." : "Absent"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
