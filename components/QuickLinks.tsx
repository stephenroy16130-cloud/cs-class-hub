import Link from "next/link";
import { quickLinks } from "@/lib/data";

export default function QuickLinks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-8 text-center font-serif text-3xl font-bold text-navy">Quick Links</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-5 text-center text-sm font-medium text-navy transition hover:border-gold hover:bg-gold-light"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
