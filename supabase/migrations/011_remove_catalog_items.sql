-- Migration 011: Supprimer la table catalog_items (legacy)
-- Cette table n'est plus utilisée, marketplace_products la remplace

-- ============================================
-- 1. Vérifier qu'il n'y a pas de données
-- ============================================
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  -- Compter les lignes dans catalog_items
  SELECT COUNT(*) INTO row_count
  FROM catalog_items;
  
  IF row_count > 0 THEN
    RAISE WARNING 'La table catalog_items contient % lignes. Migration annulée pour sécurité.', row_count;
    RAISE EXCEPTION 'Des données existent dans catalog_items. Migration annulée.';
  END IF;
END $$;

-- ============================================
-- 2. Supprimer les contraintes qui référencent catalog_items
-- ============================================
-- Supprimer les contraintes CHECK sur catalog_items
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_catalog_positive_price'
  ) THEN
    ALTER TABLE catalog_items DROP CONSTRAINT check_catalog_positive_price;
  END IF;
END $$;

-- ============================================
-- 3. Supprimer les références dans action_plans.recommended_items
-- ============================================
-- Note: action_plans.recommended_items est un JSONB avec des UUIDs
-- On ne peut pas créer de foreign key, donc on laisse tel quel
-- Les UUIDs invalides seront simplement ignorés lors des requêtes

-- ============================================
-- 4. Supprimer la table catalog_items
-- ============================================
DROP TABLE IF EXISTS catalog_items CASCADE;

-- ============================================
-- 5. Commentaire pour documentation
-- ============================================
-- La table catalog_items a été supprimée car remplacée par marketplace_products
-- Les anciennes références dans action_plans.recommended_items peuvent contenir
-- des UUIDs de catalog_items qui ne seront plus valides, mais cela n'affecte
-- pas le fonctionnement (les requêtes filtreront simplement ces UUIDs invalides)
