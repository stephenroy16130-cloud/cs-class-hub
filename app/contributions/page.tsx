const contributors = [
  { name: "Group 01", status: "Paid" },
  { name: "Group 02", status: "Paid" },
  { name: "Group 03", status: "Pending" },
  { name: "Group 04", status: "Paid" },
  { name: "Group 05", status: "Not Paid" },
];

const totalCollected = 18000;
const target = 24000;
const percent = Math.round((totalCollected / target) * 100);

export default function ContributionsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Class Fund</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Contributions</h1>
      <p className="mt-2 text-gray-600">Transparent tracking of class funds.</p>

      <div className="mt-8 rounded-lg border border-gray-200 p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-2xl font-bold text-navy">KES {totalCollected.toLocaleString()}</span>
          <span className="text-sm text-gray-500">of KES {target.toLocaleString()} target</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-500">{percent}% collected</p>
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-navy">Contributors</h2>
        <div className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {contributors.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-navy">{c.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  c.status === "Paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : c.status === "Pending"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Only names and payment status are shown. Amounts and transaction codes are kept private.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-gold-light bg-gold-light/40 p-6">
        <h2 className="font-serif text-lg font-semibold text-navy">How to Contribute</h2>
        <p className="mt-2 text-sm text-gray-700">MPESA Paybill: <span className="font-semibold">000000</span></p>
        <p className="text-sm text-gray-700">Account Name: <span className="font-semibold">CS 1.1 Class Fund</span></p>
        <p className="mt-3 text-sm text-gray-600">
          Having an issue with your contribution? <a href="/contact" className="font-semibold text-navy hover:text-gold">Contact the class rep &rarr;</a>
        </p>
      </div>
    </section>
  );
}
