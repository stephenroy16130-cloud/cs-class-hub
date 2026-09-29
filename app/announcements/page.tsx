"use client";

import { useMemo, useState } from "react";
import { announcements, type Announcement } from "@/lib/data";

const categories: Array<Announcement["category"] | "All"> = [
  "All",
  "Urgent",
  "Academic",
  "Administrative",
  "Social",
];

const categoryStyles: Record<Announcement["category"], string> = {
  Urgent: "bg-red-50 text-red-700 border-red-200",
  Academic: "bg-blue-50 text-blue-700 border-blue-200",
  Administrative: "bg-amber-50 text-amber-700 border-amber-200",
  Social: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PAGE_SIZE = 3;

export default function AnnouncementsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesCategory = category === "All" || a.category === category;
      const matchesQuery =
        query.trim() === "" ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Stay Informed</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Announcements</h1>
      <p className="mt-2 text-gray-600">All official communications, in one place.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search announcements..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                category === c
                  ? "border-navy bg-navy text-white"
                  : "border-gray-300 text-gray-600 hover:border-navy hover:text-navy"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No announcements match your search.</p>
        )}
        {visible.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-200 p-5 transition hover:shadow-md">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className={`rounded-full border px-2 py-0.5 font-semibold ${categoryStyles[a.category]}`}>
                {a.category}
              </span>
              <span className="text-gray-400">{a.date}</span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-navy">{a.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{a.excerpt}</p>
          </div>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-6 w-full rounded-md border border-navy py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
        >
          Load More
        </button>
      )}
    </section>
  );
}
