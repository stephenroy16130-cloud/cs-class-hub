import AdminGroupsPanel from "@/components/AdminGroupsPanel";

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Admin</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Admin Panel</h1>
      <p className="mt-2 text-gray-600">Manage group membership and join requests.</p>

      <div className="mt-4"><a href="/admin/attendance" className="text-sm font-semibold text-navy hover:text-gold">Go to Attendance &rarr;</a></div>
      <AdminGroupsPanel />
    </section>
  );
}

