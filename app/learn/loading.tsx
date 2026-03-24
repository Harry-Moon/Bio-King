export default function LearnLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-10 w-40 rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-80 rounded bg-muted" />
      </div>
      <div className="h-10 w-full rounded-lg bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-card">
            <div className="h-40 bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
