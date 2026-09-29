export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Who We Are</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">About CS 1.1</h1>

      <p className="mt-6 text-gray-700">
        Computer Science 1.1 is a cohort of 240 students at Kisii University, IN 13,
        studying together through the Bachelor of Science in Computer Science programme.
      </p>

      <div className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-navy">Leadership Team</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>Stephen &mdash; Class President</li>
          <li>Assistant Name &mdash; Class Assistant</li>
          <li>24 Group Leaders across Groups 01&ndash;24</li>
        </ul>
      </div>

      <div className="mt-8 rounded-lg border border-gold-light bg-gold-light/40 p-6">
        <h2 className="font-serif text-lg font-semibold text-navy">Mission Statement</h2>
        <p className="mt-2 text-gray-700">
          To foster academic excellence, unity, and mutual support.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-navy">History</h2>
        <p className="mt-2 text-gray-700">
          The class was formed at the start of the 2026/2027 academic year, with groups
          reallocated in September 2026 following student transfers and new admissions.
        </p>
      </div>
    </section>
  );
}
