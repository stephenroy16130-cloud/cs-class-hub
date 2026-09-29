import Link from "next/link";
import { announcements } from "@/lib/data";

export default function AnnouncementsPreview() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Stay Informed</p>
          <h2 className="mt-1 font-serif text-3xl font-bold text-navy">Latest Announcements</h2>
        </div>
        <Link href="/announcements" className="hidden text-sm font-semibold text-navy hover:text-gold sm:block">
          View All Announcements &rarr;
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-200 p-5 transition hover:shadow-md">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-gold-light px-2 py-0.5 font-semibold text-navy">{a.category}</span>
              <span className="text-gray-400">{a.date}</span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-navy">{a.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{a.excerpt}</p>
          </div>
        ))}
      </div>

      <Link href="/announcements" className="mt-6 block text-sm font-semibold text-navy hover:text-gold sm:hidden">
        View All Announcements &rarr;
      </Link>
    </section>
  );
}
