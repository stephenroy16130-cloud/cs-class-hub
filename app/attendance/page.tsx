import AttendanceCalendar from "@/components/AttendanceCalendar";

export default function AttendancePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Your Record</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Attendance</h1>
      <p className="mt-2 text-gray-600">
        Shows your attendance on days with in-person classes only.
      </p>
      <AttendanceCalendar />
    </section>
  );
}
