# BioKing

Application Next.js 14+ avec TypeScript, Tailwind CSS et shadcn/ui pour la gestion de données biologiques.

## Technologies

- **Framework**: Next.js 14+ (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Composants**: shadcn/ui
- **Linting**: ESLint + Prettier
- **Icônes**: Lucide React

## Structure du projet

```
BioKing/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Page tableau de bord
│   ├── data/              # Page gestion des données
│   ├── reports/           # Page rapports
│   ├── challenges/        # Page défis
│   ├── badges/            # Page badges
│   ├── profile/           # Page profil
│   ├── settings/          # Page paramètres
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx           # Page d'accueil (redirige vers /dashboard)
│   └── globals.css        # Styles globaux
├── components/
│   └── layout/            # Composants de layout
│       ├── app-layout.tsx # Layout principal de l'app
│       ├── sidebar.tsx    # Sidebar desktop
│       └── mobile-nav.tsx # Navigation mobile (bottom nav)
├── lib/
│   ├── utils.ts           # Utilitaires (cn pour shadcn/ui)
│   └── config.ts          # Configuration typée de l'app
└── public/                # Ressources statiques

```

## Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

1. Copiez le fichier `.env.example` en `.env.local`:

```bash
cp .env.example .env.local
```

2. Configurez les variables d'environnement dans `.env.local`

### Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de production

```bash
npm run build
npm start
```

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Crée un build de production
- `npm start` - Lance le serveur de production
- `npm run lint` - Exécute ESLint
- `npm run format` - Formate le code avec Prettier

## Layout responsive

L'application utilise un layout responsive avec :

- **Desktop (≥768px)** : Sidebar fixe à gauche
- **Mobile (<768px)** : Navigation en bas de l'écran (bottom nav)

## Pages disponibles

- `/dashboard` - Tableau de bord principal
- `/data` - Gestion des données biologiques
- `/reports` - Génération de rapports
- `/challenges` - Défis et objectifs
- `/badges` - Collection de badges
- `/profile` - Profil utilisateur
- `/settings` - Paramètres de l'application

## Configuration future

### Supabase (à venir)

Les placeholders pour Supabase sont déjà présents dans `.env.example` et `lib/config.ts`.

Pour intégrer Supabase :

1. Installez les dépendances :

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

2. Configurez les variables d'environnement Supabase dans `.env.local`

3. Initialisez le client Supabase dans votre application

## Configuration ESLint et Prettier

Le projet est configuré avec ESLint et Prettier pour assurer la qualité du code.

- `.eslintrc.json` - Configuration ESLint
- `.prettierrc` - Configuration Prettier

## Personnalisation

### Thème

Les couleurs du thème peuvent être modifiées dans :

- `app/globals.css` (variables CSS)
- `tailwind.config.ts` (configuration Tailwind)

### Navigation

Pour modifier les éléments de navigation, éditez :

- `components/layout/sidebar.tsx` (navigation desktop)
- `components/layout/mobile-nav.tsx` (navigation mobile)

## Licence

Privé
