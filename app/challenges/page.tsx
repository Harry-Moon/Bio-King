export default function ChallengesPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Défis</h1>
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Défis en cours</h2>
          <p className="text-muted-foreground">
            Participez à des défis pour améliorer vos performances et débloquer
            des récompenses.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold">Défi quotidien</h3>
            <p className="text-sm text-muted-foreground">
              Complétez vos objectifs quotidiens
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold">Défi hebdomadaire</h3>
            <p className="text-sm text-muted-foreground">
              Atteignez vos objectifs de la semaine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
