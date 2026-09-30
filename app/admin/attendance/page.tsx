import AdminAttendancePanel from "@/components/AdminAttendancePanel";

export default function AdminAttendancePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Admin</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Record Attendance</h1>
      <AdminAttendancePanel />
    </section>
  );
}
