# Marketplace de Biohacking - Documentation

## Vue d'ensemble

La Marketplace Intervention est une page dynamique permettant aux utilisateurs de construire leur protocole de longévité personnalisé en sélectionnant des produits et services de biohacking adaptés à leurs résultats de test SystemAge.

## Structure des fichiers

```
app/marketplace/
  └── page.tsx                    # Page principale Marketplace

components/marketplace/
  ├── hero-card.tsx              # Grande carte pour services premium
  ├── product-card.tsx           # Petite carte pour suppléments
  └── protocol-sidebar.tsx       # Sidebar récapitulatif protocole

lib/
  ├── types/
  │   └── marketplace.ts         # Types TypeScript pour produits
  └── data/
      └── marketplace-products.ts # Données produits (à migrer vers Supabase)
```

## Types de produits

### BioProduct

```typescript
interface BioProduct {
  id: string;
  name: string;
  category: ProductCategory;
  type: 'supplement' | 'service' | 'protocol' | 'therapy';
  price: number;
  description: string;
  detailedDescription?: string; // Pour HeroCard
  image: string;
  isHero: boolean; // true = HeroCard, false = ProductCard
  badge?: ProductBadge;
  featuredData?: FeaturedData;
  tags: ProductTag[]; // Pour recommandations intelligentes
  isActive: boolean;
}
```

### Tags pour recommandations intelligentes

Les tags permettent de faire correspondre les produits aux systèmes corporels de l'utilisateur :

```typescript
interface ProductTag {
  name: string;
  visible: boolean; // Si false, utilisé uniquement pour le matching
  systemTargets?: string[]; // Systèmes corporels ciblés
  biomarkerTargets?: string[]; // Biomarqueurs ciblés
  ageRange?: { min?: number; max?: number };
  agingStageTargets?: ('Prime' | 'Plateau' | 'Accelerated')[];
}
```

## Fonctionnalités

### 1. Filtrage par catégorie

Les utilisateurs peuvent filtrer les produits par catégorie :
- Tous
- Inflammation (Priorité) - Badge orange
- Métabolisme
- Neurodégénérescence
- Cardiovasculaire
- Digestif
- Cognitif

### 2. Recommandations intelligentes

Le système calcule un score de recommandation pour chaque produit basé sur :
- Les systèmes corporels en retard (ageDifference > 5)
- Les systèmes en stage "Accelerated"
- Les tags du produit correspondant aux systèmes de l'utilisateur

Les produits sont automatiquement triés par score de recommandation.

### 3. Protocole utilisateur

La sidebar droite affiche :
- **Couverture Systémique** : Barres de progression pour chaque système
- **Sélection** : Liste des produits ajoutés avec possibilité de retirer
- **Total estimé** : Prix total du protocole
- **Actions** : Valider le protocole, télécharger pour médecin

### 4. Types de cartes

#### HeroCard
- Grande bannière pour services premium (ex: Session TPE)
- Badge "ACTION REQUISE" si nécessaire
- Description détaillée
- Bouton "Réserver Session"

#### ProductCard
- Petite carte pour suppléments
- Badge "DELTA" avec valeur (ex: "+10 ANS DELTA")
- Description courte
- Bouton "Ajouter"

## Ajout de nouveaux produits

### Méthode actuelle (mock data)

Éditer `lib/data/marketplace-products.ts` :

```typescript
{
  id: 'nouveau-produit-001',
  name: 'Nom du Produit',
  category: 'inflammation',
  type: 'supplement',
  price: 50,
  description: 'Description courte',
  image: 'https://...',
  isHero: false,
  tags: [
    {
      name: 'inflammation',
      visible: true,
      systemTargets: ['Inflammatory Regulation'],
    },
  ],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

### Migration future vers Supabase

Créer une table `marketplace_products` avec les colonnes correspondantes aux types TypeScript.

## Intégration avec le Dashboard

La Marketplace charge automatiquement :
- Le rapport le plus récent de l'utilisateur (si pas de reportId)
- Les systèmes corporels pour calculer les recommandations
- La couverture systémique basée sur les produits sélectionnés

## Design

- **Thème Dark** : Fond #05070A (via CSS variables)
- **Couleur primaire** : Vert émeraude (#10b981 / green-500)
- **Couleur alerte** : Orange (#f97316 / orange-500)
- **Responsive** : Sidebar devient pleine largeur sur mobile

## Prochaines étapes

1. ✅ Structure de base et composants
2. ✅ Système de tags et recommandations
3. ⏳ Migration vers Supabase
4. ⏳ Interface admin pour gérer les produits
5. ⏳ Système de points BK (BioKing Points)
6. ⏳ Validation et checkout du protocole
7. ⏳ Export PDF pour médecin
