export default function DataPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Données</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Gestion des données biologiques
        </h2>
        <p className="text-muted-foreground">
          Cette section contiendra vos données biologiques, mesures et
          observations.
        </p>
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Fonctionnalités à venir :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Import et export de données</li>
            <li>Visualisations graphiques</li>
            <li>Filtres et recherche avancée</li>
            <li>Historique des mesures</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
