"use client";

import React from "react";
import { useMemo, useState } from "react";
import { resources, resourceUnits } from "@/lib/data";

const typeStyles: Record<string, string> = {
  Notes: "bg-blue-50 text-blue-700 border-blue-200",
  Slides: "bg-purple-50 text-purple-700 border-purple-200",
  "Past Paper": "bg-amber-50 text-amber-700 border-amber-200",
  Textbook: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Link: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function ResourcesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (query.trim() === "") return resources;
    const q = query.trim().toLowerCase();
    return resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Materials</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Resources</h1>
      <p className="mt-2 text-gray-600">Lecture notes, slides, past papers and reading lists, by unit.</p>

      <input
        type="text"
        placeholder="Search resources..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-6 w-full max-w-sm rounded-md border border-gray-300 px-4 py-2 text-sm"
      />

      <div className="mt-8 flex flex-col gap-10">
        {resourceUnits.map((unit) => {
          const unitResources = filtered.filter((r) => r.unit === unit);
          if (query.trim() !== "" && unitResources.length === 0) return null;

          return (
            <div key={unit}>
              <h2 className="font-serif text-xl font-semibold text-navy">{unit}</h2>
              {unitResources.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">No resources uploaded yet.</p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {unitResources.map((r) => {
                    const cardClass = "flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm transition hover:border-gold hover:bg-gold-light";
                    const badgeClass = "rounded-full border px-2 py-0.5 text-xs font-semibold " + typeStyles[r.type];
                    return React.createElement(
                      "a",
                      { key: r.id, href: r.url, target: "_blank", rel: "noopener noreferrer", className: cardClass },
                      React.createElement("span", { className: "font-medium text-navy" }, r.title),
                      React.createElement("span", { className: badgeClass }, r.type)
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

