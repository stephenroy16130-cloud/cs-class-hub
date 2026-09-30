export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-navy font-serif text-xl text-gold">
        CS
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-gold" />
      </div>

      <div className="text-center">
        <p className="font-serif text-lg font-semibold text-navy">CS 1.1 Class Hub</p>
        <p className="mt-1 text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
