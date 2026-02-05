# Instructions de développement

## Guide de démarrage

L'application Next.js 14+ BioKing est maintenant configurée et prête à l'emploi.

### Serveur de développement

Le serveur est actuellement en cours d'exécution sur **http://localhost:3000**

Pour démarrer/arrêter le serveur :

```bash
# Démarrer
npm run dev

# Le serveur sera disponible sur http://localhost:3000
```

### Pages disponibles

Toutes les pages suivantes sont accessibles et fonctionnelles :

- http://localhost:3000 → Redirige vers `/dashboard`
- http://localhost:3000/dashboard
- http://localhost:3000/data
- http://localhost:3000/reports
- http://localhost:3000/challenges
- http://localhost:3000/badges
- http://localhost:3000/profile
- http://localhost:3000/settings

### Ajouter des composants shadcn/ui

Pour ajouter des composants shadcn/ui à votre projet :

```bash
# Exemple : ajouter un bouton
npx shadcn-ui@latest add button

# Exemple : ajouter une carte
npx shadcn-ui@latest add card

# Exemple : ajouter un formulaire
npx shadcn-ui@latest add form

# Liste complète des composants disponibles
npx shadcn-ui@latest add
```

Les composants seront automatiquement installés dans `components/ui/`.

### Structure du layout

#### Desktop (≥768px)

- Sidebar fixe sur la gauche avec navigation complète
- Zone de contenu principale scrollable

#### Mobile (<768px)

- Pas de sidebar
- Navigation en bas de l'écran (bottom nav) avec 5 liens principaux
- Zone de contenu principale scrollable

### Prochaines étapes suggérées

1. **Intégration Supabase**
   - Installer : `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
   - Configurer les variables d'environnement dans `.env.local`
   - Les placeholders sont déjà en place dans `lib/config.ts`

2. **Ajouter des composants UI**
   - Utilisez shadcn/ui pour ajouter des composants selon vos besoins
   - Exemples : button, card, dialog, dropdown-menu, form, input, etc.

3. **Authentification**
   - Intégrer Supabase Auth ou NextAuth.js
   - Les placeholders sont déjà dans `.env.example`

4. **Développer les pages**
   - Remplacer les placeholders par du contenu réel
   - Ajouter la logique métier spécifique

5. **Thème sombre**
   - Les variables CSS sont déjà configurées
   - Il suffit d'ajouter un toggle pour basculer la classe `dark` sur l'élément `<html>`

### Configuration environnement

Fichiers de configuration :

- `.env.local` → Variables d'environnement locales (déjà créé)
- `.env.example` → Template avec tous les placeholders
- `lib/config.ts` → Configuration typée centralisée

### Qualité du code

```bash
# Linter
npm run lint

# Formatter
npm run format

# Build de production (pour tester)
npm run build
```

### Problèmes connus

#### Watchpack Error (EMFILE: too many open files)

C'est un problème courant sur macOS. Cela n'affecte pas le fonctionnement de l'application.

Pour le résoudre (optionnel) :

```bash
# Augmenter la limite de fichiers ouverts
ulimit -n 10000
```

## Support

Pour toute question ou problème, consultez :

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation shadcn/ui](https://ui.shadcn.com)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
