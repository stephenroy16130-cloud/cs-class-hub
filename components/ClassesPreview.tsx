import Link from "next/link";
import { timetable } from "@/lib/data";

export default function ClassesPreview() {
  const preview = timetable.slice(0, 3);

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
          {preview.map((c, i) => (
            <div
              key={c.id}
              className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                i !== preview.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-navy">{c.unit}</p>
                <p className="text-sm text-gray-500">{c.lecturer} &middot; {c.venue}</p>
              </div>
              <div className="text-sm text-gray-600">
                {c.day}, {c.time}
              </div>
            </div>
          ))}
        </div>

        <Link href="/timetable" className="mt-6 block text-sm font-semibold text-navy hover:text-gold sm:hidden">
          View Full Timetable &rarr;
        </Link>
      </div>
    </section>
  );
}
