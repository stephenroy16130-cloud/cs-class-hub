"use client";

import { useEffect, useMemo, useState } from "react";
import { colorForUnit } from "@/lib/colors";
import { timetableNote, timetableLastUpdated } from "@/lib/data";
import jsPDF from "jspdf";

type Session = {
  id: number;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  time: string;
  unit: string;
  lecturer: string;
  venue: string;
  mode: "In-Person" | "Online";
};

const days: Session["day"][] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const emptyForm = { day: "Monday" as Session["day"], time: "", unit: "", lecturer: "", venue: "", mode: "In-Person" as Session["mode"] };

export default function TimetableGrid({ isAdmin }: { isAdmin: boolean }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitFilter, setUnitFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/timetable");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // keep previous data on a transient network error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const allUnits = useMemo(() => Array.from(new Set(sessions.map((s) => s.unit))).sort(), [sessions]);

  const filtered = sessions.filter(
    (s) => (unitFilter === "All" || s.unit === unitFilter) && (modeFilter === "All" || s.mode === modeFilter)
  );

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function startEdit(s: Session) {
    setEditingId(s.id);
    setForm({ day: s.day, time: s.time, unit: s.unit, lecturer: s.lecturer, venue: s.venue, mode: s.mode });
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/timetable/${editingId}` : "/api/admin/timetable";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = {};
      }

      if (!res.ok) {
        setMessage(result.error || "Something went wrong. Please try again.");
        return;
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch {
      setMessage("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CS 1.1 - Weekly Timetable", 14, 16);
    doc.setFontSize(10);
    doc.text(`Last updated: ${timetableLastUpdated}`, 14, 23);

    let y = 34;
    for (const day of days) {
      const daySessions = sessions.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
      doc.setFontSize(12);
      doc.setFont("", "bold");
      doc.text(day, 14, y);
      y += 6;
      doc.setFont("", "normal");
      doc.setFontSize(10);
      if (daySessions.length === 0) {
        doc.text("No classes", 18, y);
        y += 6;
      }
      for (const s of daySessions) {
        doc.text(`${s.time} - ${s.unit} (${s.lecturer}, ${s.venue}, ${s.mode})`, 18, y);
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }
      y += 4;
    }

    doc.save("cs-1.1-timetable.pdf");
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this class session?")) return;
    await fetch(`/api/admin/timetable/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Schedule</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Weekly Timetable</h1>
          <p className="mt-1 text-sm text-gray-500">Last updated: {timetableLastUpdated}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={startAdd}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + Add Session
            </button>
          )}
          <button
            onClick={downloadPdf}
            className="print:hidden rounded-md border border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
          >
            Download as PDF
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
          <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as Session["day"] })} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input
            type="text"
            placeholder="Time (e.g. 9:00 AM - 11:00 AM)"
            required
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Unit"
            required
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Lecturer"
            required
            value={form.lecturer}
            onChange={(e) => setForm({ ...form, lecturer: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Venue"
            required
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as Session["mode"] })} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="In-Person">In-Person</option>
            <option value="Online">Online</option>
          </select>
          {message && <p className="text-sm text-red-600 sm:col-span-2">{message}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Session"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="print:hidden mb-8 flex flex-wrap gap-3">
        <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-navy">
          <option value="All">All Units</option>
          {allUnits.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-navy">
          <option value="All">All Modes</option>
          <option value="In-Person">In-Person</option>
          <option value="Online">Online</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {days.map((day) => {
            const daySessions = filtered.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={day} className="rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 bg-navy px-3 py-2 text-center text-sm font-semibold text-white">
                  {day}
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {daySessions.length === 0 && <p className="py-4 text-center text-xs text-gray-400">No classes</p>}
                  {daySessions.map((s) => (
                    <div key={s.id} className={`rounded-md border p-2 text-xs ${colorForUnit(s.unit, allUnits)}`}>
                      <p className="font-semibold">{s.unit}</p>
                      <p>{s.time}</p>
                      <p>{s.lecturer}</p>
                      <p>{s.venue} &middot; {s.mode}</p>
                      {isAdmin && (
                        <div className="print:hidden mt-1 flex gap-2">
                          <button onClick={() => startEdit(s)} className="text-[10px] font-semibold underline">Edit</button>
                          <button onClick={() => handleDelete(s.id)} className="text-[10px] font-semibold text-red-700 underline">Delete</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-gold-light bg-gold-light/40 p-4 text-sm text-navy">
        <p className="font-semibold">Notes</p>
        <p className="mt-1 text-gray-700">{timetableNote}</p>
      </div>
    </section>
  );
}

