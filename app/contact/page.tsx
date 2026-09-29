const faqs = [
  { q: "How do I find my group?", a: "Go to the Groups page and search by your admission number or name." },
  { q: "Where can I get lecture notes?", a: "Visit the Resources page and browse by unit." },
  { q: "How do I report a timetable clash?", a: "Contact the class representative directly using the details below." },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Get in Touch</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Contact</h1>
      <p className="mt-2 text-gray-600">How to reach your class representative and assistant.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy font-serif text-xl text-gold">
            SO
          </div>
          <p className="mt-3 font-serif text-lg font-semibold text-navy">Stephen</p>
          <p className="text-sm text-gray-500">Class President</p>
          <a href="https://wa.me/254700000000" className="mt-2 inline-block text-sm font-semibold text-navy hover:text-gold">
            WhatsApp &rarr;
          </a>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy font-serif text-xl text-gold">
            AS
          </div>
          <p className="mt-3 font-serif text-lg font-semibold text-navy">Assistant Name</p>
          <p className="text-sm text-gray-500">Class Assistant</p>
          <a href="https://wa.me/254700000000" className="mt-2 inline-block text-sm font-semibold text-navy hover:text-gold">
            WhatsApp &rarr;
          </a>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-navy">Frequently Asked Questions</h2>
        <div className="mt-4 flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-lg border border-gray-200 p-4">
              <summary className="cursor-pointer font-medium text-navy">{f.q}</summary>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
