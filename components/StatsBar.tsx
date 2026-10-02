"use client";

import { useEffect, useState } from "react";
import { siteStats } from "@/lib/data";
import { getUpcomingSessions, type TimetableSession } from "@/lib/schedule";

const WEEK_END_DAY = 5; // Friday

export default function StatsBar() {
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/timetable")
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => {
        const sessions: TimetableSession[] = data.sessions || [];
        const now = new Date();
        const all = getUpcomingSessions(sessions, now, 50);
        const remainingThisWeek = all.filter((s) => {
          const targetWeekday = (now.getDay() + s.offset) % 7;
          return s.offset <= 6 - now.getDay() && targetWeekday >= 1 && targetWeekday <= WEEK_END_DAY;
        });
        setUpcomingCount(remainingThisWeek.length);
      })
      .catch(() => setUpcomingCount(null));
  }, []);

  const stats = [
    { label: "Total Students", value: siteStats.totalStudents },
    { label: "Active Groups", value: siteStats.activeGroups },
    { label: "Upcoming Classes", value: upcomingCount ?? "..." },
  ];

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-gray-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 py-6 text-center">
            <span className="font-serif text-3xl font-bold text-navy">{s.value}</span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
