import Link from "next/link";

const offerings = [
  { label: "Timetable", desc: "The definitive schedule, always current.", href: "/timetable" },
  { label: "Announcements", desc: "Official communications from your Class Representative.", href: "/announcements" },
  { label: "Resources", desc: "Lecture notes, slides, past papers and unit materials.", href: "/resources" },
  { label: "Groups", desc: "Discussion group allocations and coordination.", href: "/groups" },
  { label: "Class List", desc: "The official register of enrolled students.", href: "/class-list" },
  { label: "Contact", desc: "How to reach your Class Representative and Assistant.", href: "/contact" },
];

const values = [
  { title: "Excellence", desc: "We pursue First Class Honours not as a slogan, but as a standard." },
  { title: "Unity", desc: "We are 240 individuals, but we are one community. We rise by lifting one another." },
  { title: "Integrity", desc: "Transparency and accountability guide every decision we make." },
  { title: "Resilience", desc: "We adapt, we persevere, and we finish what we start." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy to-navy-dark">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">About This Hub</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-white md:text-5xl">
            Computer Science 1.1
          </h1>
          <p className="mt-4 text-lg italic text-white/80">
            &ldquo;It always seems impossible until it is done.&rdquo; &mdash; Nelson Mandela
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">Our Story</p>
        <h2 className="mt-1 font-serif text-3xl font-bold text-navy">Why This Exists</h2>
        <p className="mt-6 text-gray-700">
          Welcome to the Computer Science 1.1 Class Hub, a centralised digital space built to serve, connect, and empower our cohort of 240 students.
        </p>
        <p className="mt-4 text-gray-700">
          This platform was born out of necessity. As our class grew, so did the complexity of managing timetables, announcements, group allocations, contributions, and resources across scattered WhatsApp threads and word-of-mouth communication. Information was getting lost. Deadlines were being missed. And the sheer logistics of coordinating two hundred and forty individuals demanded a better solution.
        </p>
        <p className="mt-4 font-serif text-xl font-semibold text-navy">This hub is that solution.</p>
      </section>

      <section className="bg-mist py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Our Mission</p>
          <p className="mt-4 font-serif text-2xl font-medium leading-relaxed text-navy">
            To foster academic excellence, seamless communication, and a unified community by providing a reliable, accessible, and transparent digital platform for every member of Computer Science 1.1.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-gold">What You&apos;ll Find Here</p>
        <h2 className="mt-1 text-center font-serif text-3xl font-bold text-navy">A Hub for Everything</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {offerings.map((o) => (
            <Link
              key={o.label}
              href={o.href}
              className="rounded-lg border border-gray-200 p-5 transition hover:border-gold hover:shadow-md"
            >
              <p className="font-serif text-lg font-semibold text-navy">{o.label}</p>
              <p className="mt-1 text-sm text-gray-600">{o.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-navy py-16">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-gold">Our Leadership</p>
          <h2 className="mt-1 text-center font-serif text-3xl font-bold text-white">Serving the Class</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-white/5 p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold font-serif text-xl text-navy">
                SR
              </div>
              <p className="mt-4 font-serif text-lg font-semibold text-white">Stephen Roy</p>
              <p className="text-sm text-gold">Class Representative</p>
              <p className="mt-3 text-sm italic text-white/70">
                &ldquo;I do not take this role lightly. My commitment to your welfare and academic success is absolute. All the best @all&rdquo;
              </p>
            </div>

            <div className="rounded-lg bg-white/5 p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold font-serif text-xl text-navy">
                VC
              </div>
              <p className="mt-4 font-serif text-lg font-semibold text-white">Virginia Chemutai</p>
              <p className="text-sm text-gold">Assistant Class Representative</p>
              <p className="mt-3 text-sm italic text-white/70">
                &ldquo;Serving with integrity, diligence, and dedication.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-gold">Our Values</p>
        <h2 className="mt-1 text-center font-serif text-3xl font-bold text-navy">What We Stand For</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-lg border border-gold-light bg-gold-light/30 p-5">
              <p className="font-serif text-lg font-semibold text-navy">{v.title}</p>
              <p className="mt-2 text-sm text-gray-700">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gold-light/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">A Word of Encouragement</p>
          <p className="mt-4 text-gray-700">
            University is not a leisurely stroll, it is a crucible that refines us. There will be days when the weight feels insurmountable. But you are not alone. This hub exists to remind you that you belong to a community that cares, that supports, and that will not let you fall.
          </p>
          <p className="mt-4 font-serif text-xl font-semibold text-navy">
            Let us defy the odds. Let us finish strong. Let us make this semester legendary.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">Contact</p>
        <h2 className="mt-1 font-serif text-3xl font-bold text-navy">Get in Touch</h2>
        <p className="mt-3 text-gray-600">For inquiries, clarifications, or urgent matters:</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://wa.me/254105557854"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            WhatsApp Stephen (Class Rep)
          </a>
          <a
            href="https://wa.me/254142618626"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
          >
            WhatsApp Virginia (Assistant)
          </a>
        </div>
      </section>
    </div>
  );
}
