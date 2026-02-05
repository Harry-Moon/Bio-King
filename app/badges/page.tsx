export default function BadgesPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Badges</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Collection de badges</h2>
        <p className="text-muted-foreground">
          Débloquez des badges en accomplissant des objectifs et en relevant des
          défis.
        </p>
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold">Catégories de badges</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="font-medium">Débutant</p>
              <p className="text-sm text-muted-foreground">0/5 débloqués</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-medium">Intermédiaire</p>
              <p className="text-sm text-muted-foreground">0/8 débloqués</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-medium">Expert</p>
              <p className="text-sm text-muted-foreground">0/12 débloqués</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
