import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-dark">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">
          Welcome
        </p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight text-white md:text-5xl">
          Computer Science 1.1 &ndash; Class Hub
        </h1>
        <p className="mt-4 max-w-xl text-white/80">
          Your central destination for timetables, announcements, resources, and class coordination.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/timetable"
            className="rounded-md bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            View Timetable
          </Link>
          <Link
            href="/announcements"
            className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Latest Announcements
          </Link>
          <Link
            href="/groups"
            className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Join Discussion Groups
          </Link>
        </div>
      </div>
    </section>
  );
}
