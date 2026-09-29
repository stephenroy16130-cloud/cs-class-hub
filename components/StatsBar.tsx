import { siteStats } from "@/lib/data";

export default function StatsBar() {
  const stats = [
    { label: "Total Students", value: siteStats.totalStudents },
    { label: "Active Groups", value: siteStats.activeGroups },
    { label: "Upcoming Classes", value: siteStats.upcomingClassesCount },
  ];

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-gray-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 py-6 text-center">
            <span className="font-serif text-3xl font-bold text-navy">{s.value}</span>
            <span className="text-sm text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
