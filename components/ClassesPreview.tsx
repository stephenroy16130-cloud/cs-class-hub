"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUpcomingSessions } from "@/lib/schedule";

export default function ClassesPreview() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const upcoming = getUpcomingSessions(now, 3);

  return (
    <section className="bg-mist py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold">What&apos;s Next</p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-navy">Upcoming Classes</h2>
          </div>
          <Link href="/timetable" className="hidden text-sm font-semibold text-navy hover:text-gold sm:block">
            View Full Timetable &rarr;
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {upcoming.map((u, i) => {
            const whenLabel = u.offset === 0 ? "Today" : u.offset === 1 ? "Tomorrow" : u.dayName;
            return (
              <div
                key={`${u.session.id}-${u.offset}`}
                className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  i !== upcoming.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div>
                  <p className="font-semibold text-navy">{u.session.unit}</p>
                  <p className="text-sm text-gray-500">{u.session.lecturer} &middot; {u.session.venue}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {whenLabel}, {u.session.time}
                </div>
              </div>
            );
          })}
          {upcoming.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-gray-400">No upcoming classes found.</p>
          )}
        </div>

        <Link href="/timetable" className="mt-6 block text-sm font-semibold text-navy hover:text-gold sm:hidden">
          View Full Timetable &rarr;
        </Link>
      </div>
    </section>
  );
}
