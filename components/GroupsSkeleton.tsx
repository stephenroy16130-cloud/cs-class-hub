export default function GroupsSkeleton() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="h-4 w-24 animate-pulse rounded bg-gold-light" />
      <div className="mt-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-4 w-64 animate-pulse rounded bg-gray-100" />

      <div className="mt-6 h-10 w-full max-w-sm animate-pulse rounded-md bg-gray-100" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" style={{ animationDelay: `${i * 80}ms` }} />
              <div className="h-4 w-4 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold" />
        <span className="ml-2 text-xs text-gray-400">Waking up the database, this can take a few seconds...</span>
      </div>
    </section>
  );
}
