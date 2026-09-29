"use client";

import { useMemo, useState } from "react";
import { timetable, timetableNote, timetableLastUpdated, type ClassSession } from "@/lib/data";
import { colorForUnit } from "@/lib/colors";

const days: ClassSession["day"][] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableGrid() {
  const allUnits = useMemo(
    () => Array.from(new Set(timetable.map((s) => s.unit))).sort(),
    []
  );

  const [unitFilter, setUnitFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");

  const filtered = timetable.filter(
    (s) =>
      (unitFilter === "All" || s.unit === unitFilter) &&
      (modeFilter === "All" || s.mode === modeFilter)
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Schedule</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Weekly Timetable</h1>
          <p className="mt-1 text-sm text-gray-500">Last updated: {timetableLastUpdated}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden self-start rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Download as PDF
        </button>
      </div>

      <div className="print:hidden mb-8 flex flex-wrap gap-3">
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-navy"
        >
          <option value="All">All Units</option>
          {allUnits.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-navy"
        >
          <option value="All">All Modes</option>
          <option value="In-Person">In-Person</option>
          <option value="Online">Online</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {days.map((day) => {
          const sessions = filtered
            .filter((s) => s.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div key={day} className="rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 bg-navy px-3 py-2 text-center text-sm font-semibold text-white">
                {day}
              </div>
              <div className="flex flex-col gap-2 p-2">
                {sessions.length === 0 && (
                  <p className="py-4 text-center text-xs text-gray-400">No classes</p>
                )}
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`rounded-md border p-2 text-xs ${colorForUnit(s.unit, allUnits)}`}
                  >
                    <p className="font-semibold">{s.unit}</p>
                    <p>{s.time}</p>
                    <p>{s.lecturer}</p>
                    <p>{s.venue} &middot; {s.mode}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-gold-light bg-gold-light/40 p-4 text-sm text-navy">
        <p className="font-semibold">Notes</p>
        <p className="mt-1 text-gray-700">{timetableNote}</p>
      </div>
    </section>
  );
}
