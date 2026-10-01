"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

export default function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden gap-6 text-sm font-medium md:flex">
      {links.map((l) => {
        const isActive = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative pb-1 transition hover:text-gold ${
              isActive ? "text-gold" : "text-navy"
            }`}
          >
            {l.label}
            {isActive && <span className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-gold" />}
          </Link>
        );
      })}
    </nav>
  );
}
