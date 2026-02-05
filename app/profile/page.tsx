export default function ProfilePage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Profil</h1>
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Informations personnelles
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom</p>
              <p className="text-lg">Non configuré</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">Non configuré</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Membre depuis
              </p>
              <p className="text-lg">Janvier 2026</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Statistiques</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Défis complétés</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Badges obtenus</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Données ajoutées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
