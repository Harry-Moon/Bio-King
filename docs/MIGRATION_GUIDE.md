# Guide de Migration : Système de Rôles et Migration des Données

## Vue d'ensemble

Ce guide explique comment appliquer les migrations pour :
1. ✅ Ajouter le système de rôles utilisateur (admin/user)
2. ✅ Supprimer la table legacy `catalog_items`
3. ✅ Migrer les données mockup vers `marketplace_products`

---

## Étape 1 : Appliquer les Migrations SQL

### Option A : Via Supabase SQL Editor (Recommandé)

1. **Ouvrir le SQL Editor** dans votre dashboard Supabase
2. **Exécuter dans l'ordre** :

#### Migration 010 : Système de rôles
```sql
-- Copier-coller le contenu de supabase/migrations/010_add_user_roles.sql
```
- ✅ Ajoute la colonne `role` à `profiles`
- ✅ Met à jour `harry@citizenvitae.com` en admin
- ✅ Crée les policies RLS pour les admins

#### Migration 011 : Supprimer catalog_items
```sql
-- Copier-coller le contenu de supabase/migrations/011_remove_catalog_items.sql
```
- ✅ Vérifie qu'il n'y a pas de données
- ✅ Supprime la table `catalog_items`

#### Migration 012 : Migrer les données mockup
```sql
-- Copier-coller le contenu de supabase/migrations/012_migrate_mockup_data.sql
```
- ✅ Insère les 6 produits de démonstration dans `marketplace_products`

### Option B : Via CLI Supabase (si configuré)

```bash
supabase migration up
```

---

## Étape 2 : Vérification

### Vérifier le système de rôles

```sql
-- Vérifier que harry@citizenvitae.com est admin
SELECT id, email, role 
FROM profiles 
WHERE email = 'harry@citizenvitae.com';
-- Résultat attendu : role = 'admin'
```

### Vérifier les produits migrés

```sql
-- Vérifier les produits dans marketplace_products
SELECT id, name, category, type, is_active 
FROM marketplace_products 
ORDER BY created_at;
-- Résultat attendu : 6 produits
```

### Vérifier que catalog_items n'existe plus

```sql
-- Vérifier que la table n'existe plus
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'catalog_items';
-- Résultat attendu : 0 lignes
```

---

## Étape 3 : Tester l'Application

### 1. Tester l'accès admin

1. Se connecter avec `harry@citizenvitae.com`
2. Vérifier que le bouton "Admin" apparaît dans la sidebar
3. Accéder à `/admin/catalog` et `/admin/users`

### 2. Tester la gestion des rôles

1. Aller sur `/admin/users`
2. Vérifier que la colonne "Role" est visible
3. Changer le rôle d'un utilisateur via le Select
4. Vérifier que le changement est sauvegardé

### 3. Tester les produits marketplace

1. Aller sur `/marketplace`
2. Vérifier que les 6 produits apparaissent
3. Vérifier que les produits Hero s'affichent correctement
4. Tester la recherche et les filtres

### 4. Tester l'admin catalog

1. Aller sur `/admin/catalog`
2. Vérifier que les produits sont chargés depuis Supabase
3. Créer un nouveau produit
4. Modifier un produit existant
5. Vérifier que les changements sont persistés

---

## Changements de Code Effectués

### 1. Système de Rôles

**Fichiers modifiés** :
- ✅ `lib/utils/admin.ts` : Utilise maintenant la DB au lieu d'une liste hardcodée
- ✅ `components/auth/use-profile.tsx` : Nouveau hook pour charger le profil avec le rôle
- ✅ `components/layout/sidebar.tsx` : Utilise `useProfile` et `isAdminSync`
- ✅ `app/api/admin/users/route.ts` : Inclut les profils avec les rôles
- ✅ `app/api/admin/users/[userId]/role/route.ts` : Nouvelle route pour mettre à jour les rôles
- ✅ `app/admin/users/page.tsx` : Interface pour gérer les rôles

**Nouvelles fonctionnalités** :
- Les admins peuvent maintenant changer les rôles depuis `/admin/users`
- Le système vérifie les rôles en base de données (plus de hardcode)
- Policies RLS basées sur les rôles

### 2. Migration des Données Mockup

**Fichiers modifiés** :
- ✅ `lib/data/admin-products.ts` : Utilise maintenant Supabase (fonctions async)
- ✅ `lib/data/marketplace-products-db.ts` : Nouveau fichier avec les fonctions Supabase
- ✅ `app/admin/catalog/page.tsx` : Utilise les fonctions async
- ✅ `app/marketplace/page.tsx` : Charge les produits depuis Supabase
- ✅ `app/marketplace/[id]/page.tsx` : Charge le produit depuis Supabase

**Changements** :
- Toutes les fonctions sont maintenant `async`
- Les produits sont chargés depuis `marketplace_products` en DB
- Plus de mock store en mémoire

---

## Points d'Attention

### ⚠️ Breaking Changes

1. **Fonctions async** : `getAllProducts()` est maintenant async
   - Ancien : `const products = getAllProducts();`
   - Nouveau : `const products = await getAllProducts();`

2. **Chargement des produits** : Les produits doivent être chargés dans un `useEffect`
   - Voir `app/admin/catalog/page.tsx` pour un exemple

### ✅ Compatibilité

- Les types TypeScript restent identiques (`BioProduct`)
- L'interface utilisateur reste la même
- Les données mockup sont préservées (migrées en DB)

---

## Prochaines Étapes

1. ✅ Appliquer les migrations SQL dans Supabase
2. ✅ Tester l'accès admin avec `harry@citizenvitae.com`
3. ✅ Vérifier que les produits apparaissent dans la marketplace
4. ✅ Tester la création/modification de produits depuis l'admin
5. ✅ Tester la gestion des rôles depuis `/admin/users`

---

## Dépannage

### Erreur : "role column does not exist"
- **Solution** : Exécuter `010_add_user_roles.sql` dans Supabase SQL Editor

### Erreur : "catalog_items does not exist" lors de la suppression
- **Solution** : C'est normal si la table n'existe pas. La migration vérifie avant de supprimer.

### Les produits n'apparaissent pas dans la marketplace
- **Vérifier** : Que la migration `012_migrate_mockup_data.sql` a été exécutée
- **Vérifier** : Que `is_active = true` pour les produits

### L'utilisateur harry@citizenvitae.com n'est pas admin
- **Vérifier** : Que la migration `010_add_user_roles.sql` a été exécutée
- **Vérifier** : Que l'email correspond exactement (case-sensitive)

---

## Support

En cas de problème, vérifier :
1. Les logs dans la console du navigateur
2. Les logs Supabase (Logs > API ou Logs > Postgres)
3. Les erreurs dans le SQL Editor de Supabase
