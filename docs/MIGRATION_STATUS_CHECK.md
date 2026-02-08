# Vérification du Statut des Migrations

## Comment vérifier si les migrations ont été appliquées

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Accéder au SQL Editor** dans Supabase Dashboard
2. **Exécuter cette requête** pour vérifier les tables créées :

```sql
-- Vérifier l'existence des nouvelles tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'marketplace_products',
    'user_protocols'
  )
ORDER BY table_name;
```

**Résultat attendu** : Les deux tables doivent apparaître.

3. **Vérifier les contraintes CHECK** :

```sql
-- Vérifier les contraintes de validation
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name
FROM pg_constraint
WHERE contype = 'c'
  AND conname LIKE 'check_%'
ORDER BY table_name, constraint_name;
```

**Résultat attendu** : Vous devriez voir des contraintes comme :
- `check_positive_chronological_age`
- `check_positive_system_age`
- `check_body_positive_system_age`
- `check_positive_price`
- etc.

4. **Vérifier les index de performance** :

```sql
-- Vérifier les index créés
SELECT 
  indexname,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Résultat attendu** : Plusieurs index doivent être présents, notamment :
- `idx_reports_user_date`
- `idx_body_systems_report_age_diff`
- `idx_marketplace_products_category_active`
- etc.

5. **Vérifier les politiques RLS DELETE** :

```sql
-- Vérifier les politiques DELETE
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE policyname LIKE '%delete%'
ORDER BY tablename, policyname;
```

**Résultat attendu** : Des politiques DELETE pour :
- `systemage_reports`
- `chat_conversations`
- `action_plans`
- `user_protocols`

### Option 2 : Via l'Application (Test fonctionnel)

1. **Tester la création d'un produit marketplace** :
   - Aller sur `/admin/catalog`
   - Créer un nouveau produit
   - Vérifier qu'il s'affiche dans la liste

2. **Tester l'upload d'un rapport** :
   - Aller sur `/upload`
   - Uploader un PDF SystemAge
   - Vérifier que l'extraction fonctionne
   - Vérifier que les données apparaissent dans `/dashboard`

### Option 3 : Script de Vérification Automatique

Créer un fichier `scripts/check-migrations.ts` :

```typescript
import { supabaseAdmin } from '@/lib/supabase';

async function checkMigrations() {
  console.log('🔍 Vérification des migrations...\n');

  // 1. Vérifier marketplace_products
  const { data: marketplaceTable, error: mktError } = await supabaseAdmin
    .from('marketplace_products')
    .select('id')
    .limit(1);
  
  if (mktError && mktError.code === '42P01') {
    console.log('❌ Table marketplace_products n\'existe pas');
  } else {
    console.log('✅ Table marketplace_products existe');
  }

  // 2. Vérifier user_protocols
  const { data: protocolsTable, error: protError } = await supabaseAdmin
    .from('user_protocols')
    .select('id')
    .limit(1);
  
  if (protError && protError.code === '42P01') {
    console.log('❌ Table user_protocols n\'existe pas');
  } else {
    console.log('✅ Table user_protocols existe');
  }

  // 3. Vérifier les contraintes CHECK
  const { data: constraints, error: constError } = await supabaseAdmin.rpc(
    'exec_sql',
    { query: `
      SELECT conname 
      FROM pg_constraint 
      WHERE contype = 'c' 
        AND conname LIKE 'check_positive_chronological_age'
    ` }
  );
  
  if (constraints && constraints.length > 0) {
    console.log('✅ Contraintes CHECK présentes');
  } else {
    console.log('❌ Contraintes CHECK manquantes');
  }

  console.log('\n✅ Vérification terminée');
}

checkMigrations();
```

## Indicateurs de Succès

✅ **Migration réussie si** :
- Les tables `marketplace_products` et `user_protocols` existent
- Les contraintes CHECK sont présentes
- Les index de performance sont créés
- Les politiques RLS DELETE sont en place
- Les commentaires sur les tables sont présents

❌ **Migration échouée si** :
- Erreur "relation does not exist" lors de l'accès aux tables
- Contraintes CHECK manquantes
- Index manquants
- Erreurs lors de l'exécution du script `apply_new_migrations.sql`

## Prochaines Étapes

Si la migration n'a pas été appliquée :

1. **Exécuter le script** `supabase/migrations/apply_new_migrations.sql` dans le SQL Editor
2. **Vérifier les erreurs** dans les logs Supabase
3. **Corriger les données existantes** si nécessaire (valeurs NULL ou invalides)
4. **Réexécuter** le script si nécessaire

Si la migration a été appliquée :

✅ **Vous pouvez continuer le développement** sur :
- L'intégration marketplace avec Supabase (remplacer le mock store)
- La gestion des protocoles utilisateur
- Les fonctionnalités admin avancées
