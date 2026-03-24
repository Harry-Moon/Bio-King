export default function CatalogLoading() {
  return (
    <div className="flex h-full gap-6 animate-pulse">
      <div className="w-64 flex-shrink-0 space-y-4">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="flex-1 space-y-6">
        <div>
          <div className="h-10 w-56 rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-96 rounded bg-muted" />
        </div>
        <div className="h-10 rounded-lg bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
