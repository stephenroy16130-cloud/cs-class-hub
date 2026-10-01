import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.role === "admin";

  const studentLinks = [
    { href: "/groups", label: "My Group", desc: "See your group, chat, or request to join one" },
    { href: "/attendance", label: "My Attendance", desc: "View your attendance calendar" },
    { href: "/announcements", label: "Announcements", desc: "Catch up on the latest updates" },
    { href: "/timetable", label: "Timetable", desc: "Check this week's classes" },
    { href: "/resources", label: "Resources", desc: "Notes, slides and past papers" },
    { href: "/class-list", label: "Class List", desc: "Find a classmate's contact" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Panel", desc: "Manage groups and join requests" },
    { href: "/admin/attendance", label: "Record Attendance", desc: "Mark today's in-person session" },
    { href: "/announcements", label: "Announcements", desc: "Post or remove announcements" },
    { href: "/resources", label: "Resources", desc: "Add or remove class materials" },
    { href: "/class-list", label: "Class List", desc: "Add, remove, or reset student access" },
    { href: "/groups", label: "Groups", desc: "View and chat with any group" },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">
        {isAdmin ? "Admin Dashboard" : "Your Dashboard"}
      </p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">
        Welcome back, {session.name.split(" ")[0]}
      </h1>
      <p className="mt-2 text-gray-600">
        {isAdmin ? "Here's what you can manage today." : "Here's what's waiting for you."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-gray-200 p-5 transition hover:border-gold hover:shadow-md"
          >
            <p className="font-serif text-lg font-semibold text-navy">{l.label}</p>
            <p className="mt-1 text-sm text-gray-500">{l.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
