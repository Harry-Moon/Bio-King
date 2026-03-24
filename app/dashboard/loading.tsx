export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="h-10 w-48 rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-72 rounded bg-muted" />
        </div>
        <div className="h-20 w-48 rounded-xl bg-muted" />
      </div>

      <div className="rounded-xl border bg-card p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-48 rounded-xl bg-muted lg:col-span-1" />
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <div className="h-28 rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
          </div>
        </div>
      </div>

      <div className="h-80 rounded-xl border bg-muted" />
      <div className="h-64 rounded-xl border bg-muted" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  );
}
