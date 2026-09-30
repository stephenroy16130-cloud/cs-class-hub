"use client";

import { useEffect, useState } from "react";

type ClassDay = { date: string; unit: string; status: "present" | "absent" | null };

export default function AttendanceCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [classDays, setClassDays] = useState<ClassDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const monthParam = `${year}-${String(month + 1).padStart(2, "0")}`;
    fetch(`/api/attendance/me?month=${monthParam}`)
      .then((res) => res.json())
      .then((data) => setClassDays(data.classDays || []))
      .finally(() => setLoading(false));
  }, [year, month]);

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
  const presentCount = classDays.filter((c) => c.status === "present").length;
  const absentCount = classDays.filter((c) => c.status === "absent").length;

  return (
    <div className="mt-8">
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
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Present ({presentCount})</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500" /> Absent ({absentCount})</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-gray-100 border border-gray-300" /> Not yet marked</span>
      </div>

      {loading && <p className="mt-3 text-xs text-gray-400">Loading...</p>}
    </div>
  );
}
