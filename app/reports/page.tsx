export default function ReportsPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Rapports</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Génération de rapports</h2>
        <p className="text-muted-foreground">
          Créez et consultez des rapports détaillés sur vos données biologiques.
        </p>
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Types de rapports disponibles :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Rapports hebdomadaires</li>
            <li>Rapports mensuels</li>
            <li>Rapports personnalisés</li>
            <li>Export PDF et Excel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
