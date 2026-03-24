export default function ArticlesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-10 w-48 rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-80 rounded bg-muted" />
      </div>
      <div className="h-10 rounded-lg bg-muted" />
      <div className="rounded-xl border bg-card">
        <div className="space-y-1 p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
