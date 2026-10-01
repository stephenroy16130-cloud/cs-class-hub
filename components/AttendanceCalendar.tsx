"use client";

import { useEffect, useState } from "react";

type ClassDay = { date: string; unit: string; status: "present" | "absent" | null };
type Summary = { present: number; absent: number; total: number; percentage: number | null };

export default function AttendanceCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [classDays, setClassDays] = useState<ClassDay[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMonth() {
    setLoading(true);
    const monthParam = `${year}-${String(month + 1).padStart(2, "0")}`;
    const res = await fetch(`/api/attendance/me?month=${monthParam}`);
    if (res.ok) {
      const data = await res.json();
      setClassDays(data.classDays || []);
    }
    setLoading(false);
  }

  async function loadSummary() {
    const res = await fetch("/api/attendance/summary");
    if (res.ok) setSummary(await res.json());
  }

  useEffect(() => {
    loadMonth();
  }, [year, month]);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (ClassDay | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const match = classDays.find((cd) => cd.date === dateKey);
    cells.push(match || { date: dateKey, unit: "", status: undefined as any });
  }

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); } else { setMonth((m) => m - 1); }
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); } else { setMonth((m) => m + 1); }
  }

  const monthLabel = firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="mt-8">
      {summary && summary.total > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">Overall Attendance</p>
            <p className={`font-serif text-2xl font-bold ${
              (summary.percentage ?? 0) >= 75 ? "text-emerald-600" : (summary.percentage ?? 0) >= 50 ? "text-amber-600" : "text-red-600"
            }`}>
              {summary.percentage}%
            </p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${
                (summary.percentage ?? 0) >= 75 ? "bg-emerald-500" : (summary.percentage ?? 0) >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Present {summary.present} of {summary.total} recorded in-person sessions ({summary.absent} absent)
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-md border border-gray-300 px-3 py-1 text-sm">&larr;</button>
        <h2 className="font-serif text-lg font-semibold text-navy">{monthLabel}</h2>
        <button onClick={nextMonth} className="rounded-md border border-gray-300 px-3 py-1 text-sm">&rarr;</button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const dayNum = Number(cell.date.slice(-2));
          const isClassDay = cell.unit !== "";
          const colorClass =
            cell.status === "present"
              ? "bg-emerald-500 text-white"
              : cell.status === "absent"
              ? "bg-red-500 text-white"
              : isClassDay
              ? "bg-gray-100 text-gray-500"
              : "text-gray-300";

          return (
            <div
              key={i}
              title={isClassDay ? `${cell.unit} - ${cell.status || "not yet marked"}` : ""}
              className={`flex aspect-square items-center justify-center rounded-md text-xs font-medium ${colorClass}`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Present</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500" /> Absent</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-gray-100 border border-gray-300" /> Not yet marked</span>
      </div>

      {loading && <p className="mt-3 text-xs text-gray-400">Loading...</p>}
    </div>
  );
}
