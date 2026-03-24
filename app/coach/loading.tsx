export default function CoachLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
      <div>
        <div className="h-9 w-32 rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-96 rounded bg-muted" />
      </div>
      <div className="flex h-[60vh] flex-col rounded-xl border bg-card">
        <div className="flex-1 space-y-4 p-6">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="h-16 w-3/4 rounded-lg bg-muted" />
          </div>
          <div className="flex justify-end gap-3">
            <div className="h-12 w-1/2 rounded-lg bg-muted" />
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="h-20 w-2/3 rounded-lg bg-muted" />
          </div>
        </div>
        <div className="border-t p-4">
          <div className="h-10 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
