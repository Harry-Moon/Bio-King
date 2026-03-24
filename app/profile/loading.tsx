export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-5 w-32 rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border bg-muted" />
        ))}
      </div>
      <div className="h-20 rounded-xl border bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  );
}
