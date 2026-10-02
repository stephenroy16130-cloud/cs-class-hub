"use client";

import { useEffect, useState } from "react";
import { toLocalDateKey } from "@/lib/date";

type Student = { admissionNo: string; name: string; status: "present" | "absent" | null };

export default function AdminAttendancePanel() {
  const [date, setDate] = useState(toLocalDateKey(new Date()));
  const [unit, setUnit] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingFor, setSavingFor] = useState<string | null>(null);
  const [savedFor, setSavedFor] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${date}`);
      const data = await res.json();
      setUnit(data.unit);
      setTime(data.time);
      setStudents(data.students || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [date]);

  async function saveOne(admissionNo: string, status: "present" | "absent") {
    if (!unit) return;
    setSavingFor(admissionNo);
    try {
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, unit, records: [{ admissionNo, status }] }),
      });
      setStudents((prev) => prev.map((s) => (s.admissionNo === admissionNo ? { ...s, status } : s)));
      setSavedFor(admissionNo);
      setTimeout(() => setSavedFor((cur) => (cur === admissionNo ? null : cur)), 1500);
    } finally {
      setSavingFor(null);
    }
  }

  async function markAll(status: "present" | "absent") {
    if (!unit) return;
    setBulkSaving(true);
    try {
      const records = students.map((s) => ({ admissionNo: s.admissionNo, status }));
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, unit, records }),
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
        <button
          onClick={load}
          className="rounded-md border border-navy px-3 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
        >
          Refresh
        </button>
        <input
          type="text"
          placeholder="Search student..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Loading...</p>
      ) : !unit ? (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No in-person class scheduled on this day.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-600">
            In-person session: <span className="font-semibold text-navy">{unit}</span> &middot; {time}
          </p>
          <p className="text-xs text-gray-400">
            {students.length} on the class list &middot; {presentCount} present &middot; {absentCount} absent &middot; {unmarkedCount} unmarked
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Click a button to save that student instantly. Click the other button anytime to correct a mistake.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => markAll("present")}
              disabled={bulkSaving}
              className="rounded-md border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-50"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll("absent")}
              disabled={bulkSaving}
              className="rounded-md border border-red-600 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-50"
            >
              Mark All Absent
            </button>
          </div>

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
  );
}


