import Link from "next/link";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import NavAuthLinks from "@/components/NavAuthLinks";
import MobileMenu from "@/components/MobileMenu";

const links = [
  { href: "/timetable", label: "Timetable" },
  { href: "/announcements", label: "Announcements" },
  { href: "/resources", label: "Resources" },
  { href: "/groups", label: "Groups" },
  { href: "/attendance", label: "Attendance" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  const sessionForClient = session ? { name: session.name, role: session.role } : null;

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

        <div className="hidden md:block">
          <NavAuthLinks session={sessionForClient} />
        </div>

        <MobileMenu links={links} session={sessionForClient} />
      </div>
    </header>
  );
}

