-- Script pour appliquer les migrations finales (010-012)
-- À exécuter dans Supabase SQL Editor après apply_new_migrations.sql

-- ============================================
-- Migration 010: Système de rôles utilisateur
-- ============================================
\i supabase/migrations/010_add_user_roles.sql

-- ============================================
-- Migration 011: Supprimer catalog_items (legacy)
-- ============================================
\i supabase/migrations/011_remove_catalog_items.sql

-- ============================================
-- Migration 012: Migrer les données mockup
-- ============================================
\i supabase/migrations/012_migrate_mockup_data.sql

-- Note: Si vous êtes dans le SQL Editor de Supabase, exécutez chaque fichier séparément
-- car \i n'est pas supporté. Exécutez dans l'ordre :
-- 1. 010_add_user_roles.sql
-- 2. 011_remove_catalog_items.sql  
-- 3. 012_migrate_mockup_data.sql
