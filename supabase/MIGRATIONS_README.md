# Guide des Migrations Supabase - BioKing

Ce document décrit les migrations SQL créées pour améliorer la structure de la base de données BioKing.

## 📋 Ordre d'exécution des migrations

Les migrations doivent être appliquées dans l'ordre suivant :

1. ✅ `001_create_systemage_schema.sql` - Schéma de base (déjà appliqué)
2. ✅ `002_create_users_and_profiles.sql` - Utilisateurs et profils (déjà appliqué)
3. ✅ `003_add_original_filename.sql` - Nom de fichier original (déjà appliqué)
4. ✅ `004_add_aging_speed_to_body_systems.sql` - Vitesse de vieillissement (déjà appliqué)
5. 🆕 `005_create_marketplace_products.sql` - **NOUVELLE** Table marketplace_products
6. 🆕 `006_add_validation_constraints.sql` - **NOUVELLE** Contraintes de validation
7. 🆕 `007_add_performance_indexes.sql` - **NOUVELLE** Index de performance
8. 🆕 `008_create_user_protocols.sql` - **NOUVELLE** Table user_protocols
9. 🆕 `009_add_delete_policies_and_comments.sql` - **NOUVELLE** Politiques DELETE et documentation

## 🚀 Application des migrations

### ⚠️ IMPORTANT: Si vous avez déjà appliqué les migrations 001-004

Si vous obtenez l'erreur `relation "systemage_reports" already exists`, cela signifie que les migrations 001-004 ont déjà été appliquées. Dans ce cas, utilisez le script `apply_new_migrations.sql` qui applique uniquement les nouvelles migrations (005-009) avec des vérifications d'existence.

### Option 1: Script tout-en-un (recommandé si migrations 001-004 déjà appliquées)

1. Allez dans votre projet Supabase
2. Ouvrez le **SQL Editor**
3. Copiez-collez le contenu de `apply_new_migrations.sql`
4. Exécutez le script

Ce script vérifie l'existence avant de créer et peut être exécuté plusieurs fois sans erreur.

### Option 2: Via Supabase CLI (si migrations pas encore appliquées)

```bash
# Appliquer toutes les migrations en attente
supabase db push

# Ou appliquer une migration spécifique
supabase migration up
```

### Option 3: Via Supabase Dashboard (migrations individuelles)

1. Allez dans votre projet Supabase
2. Ouvrez le **SQL Editor**
3. Copiez-collez le contenu de chaque fichier de migration dans l'ordre (005, 006, 007, 008, 009)
4. Exécutez chaque migration une par une

## 📊 Détails des nouvelles migrations

### Migration 005: `create_marketplace_products`

**Objectif**: Créer la table `marketplace_products` alignée avec le type TypeScript `BioProduct`.

**Changements**:

- Nouvelle table `marketplace_products` avec tous les champs nécessaires
- Support JSONB pour `badge`, `featured_data`, et `tags`
- Index optimisés pour les recherches fréquentes
- RLS activé avec politique de lecture publique pour les produits actifs

**Impact**: Cette table remplacera progressivement le mock `lib/data/admin-products.ts`.

### Migration 006: `add_validation_constraints`

**Objectif**: Garantir l'intégrité des données avec des contraintes CHECK.

**Changements**:

- Validation des âges positifs (`chronological_age`, `system_age`)
- Validation des prix positifs ou nuls
- Validation des champs obligatoires non vides
- Validation des plages de valeurs (percentile_rank 0-100, etc.)

**Impact**: Empêche l'insertion de données invalides en base.

### Migration 007: `add_performance_indexes`

**Objectif**: Optimiser les performances pour 100-1000 utilisateurs.

**Changements**:

- Index composites pour les recherches fréquentes
- Index partiels sur les produits actifs uniquement
- Index GIN pour les recherches dans les arrays JSONB

**Impact**: Améliore significativement les temps de réponse des requêtes.

### Migration 008: `create_user_protocols`

**Objectif**: Créer la table pour stocker les protocoles utilisateur de la marketplace.

**Changements**:

- Nouvelle table `user_protocols` avec support JSONB pour les items
- RLS complet avec politiques CRUD pour les utilisateurs
- Contraintes de validation (prix positif, semaine valide)

**Impact**: Permet de persister les protocoles utilisateur au lieu de les garder en mémoire.

### Migration 009: `add_delete_policies_and_comments`

**Objectif**: Compléter les politiques RLS et ajouter la documentation.

**Changements**:

- Politiques DELETE manquantes pour toutes les tables
- Commentaires de documentation sur toutes les colonnes importantes

**Impact**: Sécurité complète et meilleure compréhension du schéma.

## 🔄 Migration des données depuis le mock

Pour migrer les données du mock `lib/data/admin-products.ts` vers `marketplace_products`:

```sql
-- Exemple de script de migration (à adapter selon vos données)
INSERT INTO marketplace_products (
  id, name, category, type, description, image, price, currency,
  billing_model, display_type, is_hero, tags, primary_system,
  secondary_systems, clinical_references, is_active, created_at, updated_at
)
SELECT
  id::uuid,
  name,
  category,
  type,
  description,
  image,
  price,
  COALESCE(currency, 'EUR'),
  billing_model,
  COALESCE(display_type, CASE WHEN is_hero THEN 'hero' ELSE 'grid' END),
  is_hero,
  tags::jsonb,
  primary_system,
  secondary_systems,
  clinical_references,
  is_active,
  created_at,
  updated_at
FROM (
  -- Vos données mock ici
  VALUES
    ('product-1', 'Product Name', 'inflammation', 'supplement', 'Description', 'https://...', 50, 'EUR', 'one-time', 'grid', false, '[]'::jsonb, 'Inflammation', ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW())
) AS mock_data(id, name, category, type, description, image, price, currency, billing_model, display_type, is_hero, tags, primary_system, secondary_systems, clinical_references, is_active, created_at, updated_at);
```

## ⚠️ Notes importantes

1. **Backup**: Toujours faire un backup de la base avant d'appliquer les migrations
2. **Test**: Tester les migrations sur un environnement de staging d'abord
3. **Ordre**: Respecter strictement l'ordre des migrations
4. **RLS**: Les politiques RLS peuvent nécessiter des ajustements selon vos besoins spécifiques

## 📝 Prochaines étapes

Après avoir appliqué les migrations :

1. **Migrer le code**: Modifier `lib/data/admin-products.ts` pour utiliser Supabase au lieu du mock
2. **Tester**: Vérifier que toutes les fonctionnalités fonctionnent avec la nouvelle structure
3. **Migrer les données**: Transférer les données existantes du mock vers `marketplace_products`
4. **Supprimer le mock**: Une fois tout validé, supprimer le code mock

## 🔍 Vérification post-migration

Pour vérifier que tout est correct :

```sql
-- Vérifier que la table marketplace_products existe
SELECT COUNT(*) FROM marketplace_products;

-- Vérifier les contraintes
SELECT conname, contype FROM pg_constraint
WHERE conrelid = 'marketplace_products'::regclass;

-- Vérifier les index
SELECT indexname FROM pg_indexes
WHERE tablename = 'marketplace_products';

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'marketplace_products';
```
