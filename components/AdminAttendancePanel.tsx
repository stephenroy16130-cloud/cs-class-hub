"use client";

import { useEffect, useState } from "react";

type Student = { admissionNo: string; name: string; status: "present" | "absent" | null };

export default function AdminAttendancePanel() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [unit, setUnit] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, "present" | "absent">>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/attendance?date=${date}`);
      const data = await res.json();
      setUnit(data.unit);
      setTime(data.time);
      setStudents(data.students || []);
      const initial: Record<string, "present" | "absent"> = {};
      for (const s of data.students || []) {
        initial[s.admissionNo] = s.status || "present";
      }
      setStatuses(initial);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [date]);

  function setAll(status: "present" | "absent") {
    const next: Record<string, "present" | "absent"> = {};
    for (const s of students) next[s.admissionNo] = status;
    setStatuses(next);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const records = students.map((s) => ({ admissionNo: s.admissionNo, status: statuses[s.admissionNo] || "present" }));
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, unit, records }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || "Something went wrong.");
      } else {
        setMessage(`Saved attendance for ${result.count} students.`);
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(query.toLowerCase())
  );

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
          <p className="text-xs text-gray-400">{students.length} students on the class list</p>

          <div className="mt-3 flex gap-2">
            <button onClick={() => setAll("present")} className="rounded-md border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700">
              Mark All Present
            </button>
            <button onClick={() => setAll("absent")} className="rounded-md border border-red-600 px-3 py-1 text-xs font-semibold text-red-700">
              Mark All Absent
            </button>
          </div>

          <div className="mt-4 max-h-[500px] overflow-y-auto rounded-lg border border-gray-200">
            {filtered.map((s) => (
              <div key={s.admissionNo} className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-sm last:border-b-0">
                <span className="text-navy">
                  {s.name} <span className="text-gray-400">({s.admissionNo})</span>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setStatuses((prev) => ({ ...prev, [s.admissionNo]: "present" }))}
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      statuses[s.admissionNo] === "present" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setStatuses((prev) => ({ ...prev, [s.admissionNo]: "absent" }))}
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      statuses[s.admissionNo] === "absent" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>

          {message && <p className="mt-3 text-sm text-navy">{message}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="mt-4 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </>
      )}
    </div>
  );
}
