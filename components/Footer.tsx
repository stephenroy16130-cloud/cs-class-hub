import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl">Computer Science 1.1</p>
          <p className="mt-2 text-sm text-white/70">
            To foster academic excellence, unity, and mutual support.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-gold">Quick Links</p>
          <ul className="space-y-1 text-white/80">
            <li><Link href="/timetable" className="hover:text-gold">Timetable</Link></li>
            <li><Link href="/announcements" className="hover:text-gold">Announcements</Link></li>
            <li><Link href="/resources" className="hover:text-gold">Resources</Link></li>
            <li><Link href="/groups" className="hover:text-gold">Groups</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-gold">Contact</p>
          <p className="text-white/80">Class Representative</p>
          <Link href="/contact" className="text-white/80 hover:text-gold">Get in touch &rarr;</Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        &copy; {new Date().getFullYear()} Computer Science 1.1. All rights reserved.
      </div>
    </footer>
  );
}
