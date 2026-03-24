-- Migration 013: Marquer les migrations existantes comme appliquées
-- Ce script synchronise la table supabase_migrations.schema_migrations
-- avec les migrations qui ont déjà été appliquées manuellement

-- ============================================
-- 1. Créer le schéma supabase_migrations s'il n'existe pas
-- ============================================
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

-- ============================================
-- 2. Créer la table schema_migrations si elle n'existe pas
-- Structure minimale utilisée par Supabase CLI (version et name uniquement)
-- ============================================
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- ============================================
-- 3. Marquer les migrations 001-009 comme appliquées
-- ============================================
-- Ces migrations ont été appliquées manuellement via SQL Editor
-- On les marque comme appliquées pour que Supabase CLI ne les réapplique pas

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES 
  ('001', 'create_systemage_schema'),
  ('002', 'create_users_and_profiles'),
  ('003', 'add_original_filename'),
  ('004', 'add_aging_speed_to_body_systems'),
  ('005', 'create_marketplace_products'),
  ('006', 'add_validation_constraints'),
  ('007', 'add_performance_indexes'),
  ('008', 'create_user_protocols'),
  ('009', 'add_delete_policies_and_comments')
ON CONFLICT (version) DO NOTHING;

-- ============================================
-- 4. Vérification
-- ============================================
-- Afficher les migrations marquées comme appliquées
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version;
