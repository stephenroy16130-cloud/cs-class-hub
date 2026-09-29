import Link from "next/link";

const links = [
  { href: "/timetable", label: "Timetable" },
  { href: "/announcements", label: "Announcements" },
  { href: "/resources", label: "Resources" },
  { href: "/groups", label: "Groups" },
  { href: "/contributions", label: "Contributions" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy font-serif text-lg text-gold">
            CS
          </span>
          <span className="font-serif text-lg font-semibold leading-tight text-navy">
            CS 1.1 <span className="block text-[10px] font-sans tracking-widest text-gold">CLASS HUB</span>
          </span>
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-navy md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-gold">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/timetable"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          View Timetable
        </Link>
      </div>
    </header>
  );
}
