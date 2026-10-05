"use client";

import { useEffect, useMemo, useState } from "react";
import { resourceUnits } from "@/lib/data";

type Resource = { id: number; unit: string; title: string; type: string; url: string };

const typeStyles: Record<string, string> = {
  Notes: "bg-blue-50 text-blue-700 border-blue-200",
  Slides: "bg-purple-50 text-purple-700 border-purple-200",
  "Past Paper": "bg-amber-50 text-amber-700 border-amber-200",
  Textbook: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Assignment: "bg-orange-50 text-orange-700 border-orange-200",
  Link: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function ResourcesClient({ isAdmin }: { isAdmin: boolean }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [unit, setUnit] = useState(resourceUnits[0]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Notes");
  const [url, setUrl] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/resources");
    if (res.ok) setResources((await res.json()).resources);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unit, title, type, url }),
    });
    setTitle("");
    setUrl("");
    setShowAdd(false);
    load();
  }

  async function deleteResource(id: number) {
    if (!confirm("Delete this resource?")) return;
    await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = useMemo(() => {
    if (query.trim() === "") return resources;
    const q = query.trim().toLowerCase();
    return resources.filter((r) => r.title.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q));
  }, [resources, query]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Materials</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Resources</h1>
          <p className="mt-2 text-gray-600">Lecture notes, slides, past papers and reading lists, by unit.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {showAdd ? "Cancel" : "+ Add Resource"}
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={addResource} className="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            {resourceUnits.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="Notes">Notes</option>
            <option value="Slides">Slides</option>
            <option value="Past Paper">Past Paper</option>
            <option value="Textbook">Textbook</option>
            <option value="Assignment">Assignment</option>
            <option value="Link">Link</option>
          </select>
          <input
            type="url"
            placeholder="https://..."
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
            Add Resource
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Search resources..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-6 w-full max-w-sm rounded-md border border-gray-300 px-4 py-2 text-sm"
      />

      <div className="mt-8 flex flex-col gap-10">
        {loading && <p className="text-sm text-gray-400">Loading...</p>}
        {!loading && resourceUnits.map((u) => {
          const unitResources = filtered.filter((r) => r.unit === u);
          if (query.trim() !== "" && unitResources.length === 0) return null;

          return (
            <div key={u}>
              <h2 className="font-serif text-xl font-semibold text-navy">{u}</h2>
              {unitResources.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">No resources uploaded yet.</p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {unitResources.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm transition hover:border-gold hover:bg-gold-light">
                      <span className="font-medium text-navy">{r.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${typeStyles[r.type]}`}>
                          {r.type}
                        </span>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md bg-navy px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                        >
                          Open
                        </a>
                        {isAdmin && (
                          <button onClick={() => deleteResource(r.id)} className="text-xs font-semibold text-red-600 hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

