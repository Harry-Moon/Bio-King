export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Paramètres</h1>
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Préférences générales</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Langue</p>
                <p className="text-sm text-muted-foreground">
                  Choisissez votre langue préférée
                </p>
              </div>
              <p className="text-muted-foreground">Français</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thème</p>
                <p className="text-sm text-muted-foreground">
                  Mode clair ou sombre
                </p>
              </div>
              <p className="text-muted-foreground">Clair</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-muted-foreground">
                  Recevoir des mises à jour par email
                </p>
              </div>
              <p className="text-muted-foreground">Activées</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rappels</p>
                <p className="text-sm text-muted-foreground">
                  Rappels pour vos défis et objectifs
                </p>
              </div>
              <p className="text-muted-foreground">Activés</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Confidentialité</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profil public</p>
                <p className="text-sm text-muted-foreground">
                  Rendre votre profil visible aux autres
                </p>
              </div>
              <p className="text-muted-foreground">Désactivé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
