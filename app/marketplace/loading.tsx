export default function MarketplaceLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-10 w-56 rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-96 rounded bg-muted" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-28 flex-shrink-0 rounded-full bg-muted"
          />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full h-64 rounded-xl bg-muted" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  );
}
