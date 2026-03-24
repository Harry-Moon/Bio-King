export default function DataLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-10 w-48 rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-80 rounded bg-muted" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 rounded bg-muted" />
              <div className="h-5 w-16 rounded bg-muted" />
            </div>
            <div className="mt-3 h-4 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
