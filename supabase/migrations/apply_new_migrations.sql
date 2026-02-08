-- Script pour appliquer uniquement les nouvelles migrations (005-009)
-- À exécuter dans Supabase SQL Editor
-- Ce script vérifie l'existence avant de créer pour éviter les erreurs

-- ============================================
-- Migration 005: marketplace_products
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'marketplace_products') THEN
    CREATE TABLE marketplace_products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      
      -- Informations de base
      name TEXT NOT NULL,
      category TEXT CHECK (category IN ('all', 'inflammation', 'metabolism', 'neurodegeneration', 'cardiovascular', 'digestive', 'cognitive', 'immune', 'metabolic')) NOT NULL,
      type TEXT CHECK (type IN ('supplement', 'service', 'protocol', 'therapy')) NOT NULL,
      
      -- Description
      description TEXT NOT NULL,
      detailed_description TEXT,
      
      -- Image
      image TEXT NOT NULL,
      
      -- Pricing
      price NUMERIC NOT NULL,
      currency TEXT DEFAULT 'EUR',
      billing_model TEXT CHECK (billing_model IN ('one-time', 'monthly', 'yearly', 'per-session')),
      
      -- Display
      is_hero BOOLEAN DEFAULT false,
      display_type TEXT CHECK (display_type IN ('hero', 'grid')),
      
      -- Badge et featured data (JSONB pour flexibilité)
      badge JSONB,
      featured_data JSONB,
      
      -- Tags (JSONB pour ProductTag[])
      tags JSONB DEFAULT '[]'::jsonb,
      
      -- Systèmes biologiques
      primary_system TEXT,
      secondary_systems TEXT[],
      
      -- Références cliniques
      clinical_references TEXT[],
      
      -- Liens externes
      external_link TEXT,
      
      -- État
      is_active BOOLEAN DEFAULT true,
      
      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Index pour performance
    CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
    CREATE INDEX idx_marketplace_products_type ON marketplace_products(type);
    CREATE INDEX idx_marketplace_products_active ON marketplace_products(is_active) WHERE is_active = true;
    CREATE INDEX idx_marketplace_products_primary_system ON marketplace_products(primary_system);
    CREATE INDEX idx_marketplace_products_secondary_systems ON marketplace_products USING GIN(secondary_systems);
    CREATE INDEX idx_marketplace_products_tags ON marketplace_products USING GIN(tags);
    CREATE INDEX idx_marketplace_products_display_type ON marketplace_products(display_type);

    -- RLS
    ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;

    -- Policy: Lecture publique pour les produits actifs
    CREATE POLICY "Marketplace products are viewable by everyone"
      ON marketplace_products FOR SELECT
      USING (is_active = true);

    -- Trigger pour updated_at
    CREATE TRIGGER update_marketplace_products_updated_at
      BEFORE UPDATE ON marketplace_products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Commentaires
    COMMENT ON TABLE marketplace_products IS 'Produits et services de la marketplace BioKing';
  END IF;
END $$;

-- ============================================
-- Migration 006: Contraintes de validation
-- ============================================

-- Nettoyer les données existantes avant d'ajouter les contraintes
-- Corriger les valeurs invalides dans systemage_reports
UPDATE systemage_reports
SET chronological_age = 25
WHERE chronological_age IS NULL OR chronological_age <= 0;

UPDATE systemage_reports
SET overall_system_age = chronological_age
WHERE overall_system_age IS NULL OR overall_system_age <= 0;

UPDATE systemage_reports
SET aging_rate = 1.0
WHERE aging_rate IS NULL OR aging_rate <= 0;

UPDATE systemage_reports
SET overall_bionoise = 0
WHERE overall_bionoise IS NULL OR overall_bionoise < 0;

UPDATE systemage_reports
SET extraction_confidence = NULL
WHERE extraction_confidence IS NOT NULL AND (extraction_confidence < 0 OR extraction_confidence > 100);

-- Corriger les valeurs invalides dans body_systems
UPDATE body_systems
SET system_age = 25
WHERE system_age IS NULL OR system_age <= 0;

UPDATE body_systems
SET bionoise = 0
WHERE bionoise IS NOT NULL AND bionoise < 0;

UPDATE body_systems
SET percentile_rank = NULL
WHERE percentile_rank IS NOT NULL AND (percentile_rank < 0 OR percentile_rank > 100);

UPDATE body_systems
SET aging_speed = 1.0
WHERE aging_speed IS NOT NULL AND aging_speed <= 0;

-- Corriger les valeurs invalides dans marketplace_products
UPDATE marketplace_products
SET price = 0
WHERE price IS NULL OR price < 0;

UPDATE marketplace_products
SET name = 'Unnamed Product'
WHERE name IS NULL OR LENGTH(TRIM(name)) = 0;

UPDATE marketplace_products
SET description = 'No description'
WHERE description IS NULL OR LENGTH(TRIM(description)) = 0;

UPDATE marketplace_products
SET image = 'https://via.placeholder.com/400'
WHERE image IS NULL OR LENGTH(TRIM(image)) = 0;

-- systemage_reports
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_positive_chronological_age') THEN
    ALTER TABLE systemage_reports ADD CONSTRAINT check_positive_chronological_age CHECK (chronological_age > 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_positive_system_age') THEN
    ALTER TABLE systemage_reports ADD CONSTRAINT check_positive_system_age CHECK (overall_system_age > 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_positive_aging_rate') THEN
    ALTER TABLE systemage_reports ADD CONSTRAINT check_positive_aging_rate CHECK (aging_rate > 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_positive_bionoise') THEN
    ALTER TABLE systemage_reports ADD CONSTRAINT check_positive_bionoise CHECK (overall_bionoise IS NULL OR overall_bionoise >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_extraction_confidence_range') THEN
    ALTER TABLE systemage_reports ADD CONSTRAINT check_extraction_confidence_range CHECK (extraction_confidence IS NULL OR (extraction_confidence >= 0 AND extraction_confidence <= 100));
  END IF;
END $$;

-- body_systems
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_body_positive_system_age') THEN
    ALTER TABLE body_systems ADD CONSTRAINT check_body_positive_system_age CHECK (system_age > 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_body_positive_bionoise') THEN
    ALTER TABLE body_systems ADD CONSTRAINT check_body_positive_bionoise CHECK (bionoise IS NULL OR bionoise >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_percentile_rank_range') THEN
    ALTER TABLE body_systems ADD CONSTRAINT check_percentile_rank_range CHECK (percentile_rank IS NULL OR (percentile_rank >= 0 AND percentile_rank <= 100));
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_positive_aging_speed') THEN
    ALTER TABLE body_systems ADD CONSTRAINT check_positive_aging_speed CHECK (aging_speed IS NULL OR aging_speed > 0);
  END IF;
END $$;

-- marketplace_products
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_positive_price') THEN
    ALTER TABLE marketplace_products ADD CONSTRAINT check_positive_price CHECK (price >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_name_not_empty') THEN
    ALTER TABLE marketplace_products ADD CONSTRAINT check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_description_not_empty') THEN
    ALTER TABLE marketplace_products ADD CONSTRAINT check_description_not_empty CHECK (LENGTH(TRIM(description)) > 0);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_image_not_empty') THEN
    ALTER TABLE marketplace_products ADD CONSTRAINT check_image_not_empty CHECK (LENGTH(TRIM(image)) > 0);
  END IF;
END $$;

-- catalog_items
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'check_catalog_positive_price') THEN
    ALTER TABLE catalog_items ADD CONSTRAINT check_catalog_positive_price CHECK (price IS NULL OR price >= 0);
  END IF;
END $$;

-- ============================================
-- Migration 007: Index de performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reports_user_date ON systemage_reports(user_id, upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_systems_report_age_diff ON body_systems(report_id, age_difference DESC);
CREATE INDEX IF NOT EXISTS idx_body_systems_name_stage ON body_systems(system_name, aging_stage);
CREATE INDEX IF NOT EXISTS idx_recommendations_type_report ON recommendations(type, report_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_date ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_date ON chat_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_plans_user_status ON action_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_active ON marketplace_products(category, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_type_active ON marketplace_products(type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- ============================================
-- Migration 008: user_protocols
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_protocols') THEN
    CREATE TABLE user_protocols (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      
      -- Items du protocole (JSONB pour ProtocolItem[])
      items JSONB DEFAULT '[]'::jsonb NOT NULL,
      
      -- Prix total calculé
      total_price NUMERIC DEFAULT 0 NOT NULL,
      
      -- Couverture systémique (JSONB pour SystemCoverage[])
      system_coverage JSONB DEFAULT '[]'::jsonb,
      
      -- Numéro de semaine (optionnel)
      week_number INTEGER,
      
      -- Statut du protocole
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
      
      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Index
    CREATE INDEX idx_user_protocols_user ON user_protocols(user_id);
    CREATE INDEX idx_user_protocols_status ON user_protocols(status);
    CREATE INDEX idx_user_protocols_user_status ON user_protocols(user_id, status);
    CREATE INDEX idx_user_protocols_items ON user_protocols USING GIN(items);

    -- RLS
    ALTER TABLE user_protocols ENABLE ROW LEVEL SECURITY;

    -- Policies
    CREATE POLICY "Users can view their own protocols"
      ON user_protocols FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own protocols"
      ON user_protocols FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own protocols"
      ON user_protocols FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own protocols"
      ON user_protocols FOR DELETE
      USING (auth.uid() = user_id);

    -- Trigger
    CREATE TRIGGER update_user_protocols_updated_at
      BEFORE UPDATE ON user_protocols
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Contraintes
    ALTER TABLE user_protocols ADD CONSTRAINT check_positive_total_price CHECK (total_price >= 0);
    ALTER TABLE user_protocols ADD CONSTRAINT check_valid_week_number CHECK (week_number IS NULL OR (week_number >= 1 AND week_number <= 52));
  END IF;
END $$;

-- ============================================
-- Migration 009: Politiques DELETE et commentaires
-- ============================================

-- Politiques DELETE
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete their own reports' AND tablename = 'systemage_reports') THEN
    CREATE POLICY "Users can delete their own reports"
      ON systemage_reports FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete their own conversations' AND tablename = 'chat_conversations') THEN
    CREATE POLICY "Users can delete their own conversations"
      ON chat_conversations FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete their own action plans' AND tablename = 'action_plans') THEN
    CREATE POLICY "Users can delete their own action plans"
      ON action_plans FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Commentaires (peuvent être exécutés plusieurs fois sans problème)
COMMENT ON TABLE systemage_reports IS 'Rapports SystemAge principaux uploadés par les utilisateurs';
COMMENT ON COLUMN systemage_reports.chronological_age IS 'Âge chronologique de l''utilisateur';
COMMENT ON COLUMN systemage_reports.overall_system_age IS 'Âge systémique global calculé';
COMMENT ON COLUMN systemage_reports.aging_rate IS 'Taux de vieillissement (ratio entre system_age et chronological_age)';
COMMENT ON COLUMN systemage_reports.aging_stage IS 'Stade de vieillissement: Prime (<25.8), Plateau (25.8-42.1), Accelerated (>42.1)';
COMMENT ON COLUMN systemage_reports.extraction_status IS 'État de l''extraction des données depuis le PDF';
COMMENT ON COLUMN systemage_reports.raw_extraction_data IS 'Données brutes extraites du PDF (JSON)';

COMMENT ON TABLE body_systems IS 'Les 19 systèmes corporels analysés par rapport SystemAge';
COMMENT ON COLUMN body_systems.system_name IS 'Nom du système biologique (ex: Inflammation, Metabolism)';
COMMENT ON COLUMN body_systems.system_age IS 'Âge calculé pour ce système spécifique';
COMMENT ON COLUMN body_systems.age_difference IS 'Différence entre system_age et chronological_age';
COMMENT ON COLUMN body_systems.aging_speed IS 'Vitesse de vieillissement du système (ratio, ex: 1.04x)';
COMMENT ON COLUMN body_systems.percentile_rank IS 'Rang percentile par rapport à la population (0-100)';

COMMENT ON TABLE recommendations IS 'Recommandations personnalisées générées à partir des rapports';
COMMENT ON COLUMN recommendations.type IS 'Type de recommandation: nutritional, fitness, ou therapy';
COMMENT ON COLUMN recommendations.target_systems IS 'Array des systèmes biologiques ciblés par cette recommandation';

COMMENT ON TABLE catalog_items IS 'Catalogue général de produits/services/articles (legacy, utiliser marketplace_products)';
COMMENT ON COLUMN catalog_items.type IS 'Type: product, service, article, ou protocol';
COMMENT ON COLUMN catalog_items.target_systems IS 'Array des systèmes biologiques ciblés';

COMMENT ON TABLE chat_conversations IS 'Conversations avec l''assistant IA';
COMMENT ON COLUMN chat_conversations.title IS 'Titre de la conversation (généré automatiquement ou défini par l''utilisateur)';

COMMENT ON TABLE chat_messages IS 'Messages individuels dans les conversations IA';
COMMENT ON COLUMN chat_messages.role IS 'Rôle: user (utilisateur), assistant (IA), ou system (système)';
COMMENT ON COLUMN chat_messages.metadata IS 'Métadonnées additionnelles (JSON)';

COMMENT ON TABLE action_plans IS 'Plans d''action personnalisés créés pour les utilisateurs';
COMMENT ON COLUMN action_plans.recommended_items IS 'Array d''UUIDs référençant catalog_items ou marketplace_products';
COMMENT ON COLUMN action_plans.status IS 'Statut: active, completed, ou archived';

COMMENT ON TABLE profiles IS 'Profils utilisateurs étendus (complément de auth.users)';
COMMENT ON COLUMN profiles.chronological_age IS 'Âge chronologique stocké dans le profil (peut différer du rapport)';

COMMENT ON TABLE marketplace_products IS 'Produits et services de la marketplace BioKing';
COMMENT ON COLUMN marketplace_products.category IS 'Catégorie du produit (inflammation, metabolism, etc.)';
COMMENT ON COLUMN marketplace_products.type IS 'Type de produit (supplement, service, protocol, therapy)';
COMMENT ON COLUMN marketplace_products.display_type IS 'Format d''affichage: hero (HeroCard) ou grid (ProductCard)';
COMMENT ON COLUMN marketplace_products.badge IS 'Badge affiché sur le produit (JSON: {type, text, value?, priority?})';
COMMENT ON COLUMN marketplace_products.featured_data IS 'Données featured (JSON: {ageDelta?, clinicalStandard?, recommendedFor?, doctorRequired?})';
COMMENT ON COLUMN marketplace_products.tags IS 'Tags pour recommandation intelligente (JSON array: [{name, visible, systemTargets?, ...}])';
COMMENT ON COLUMN marketplace_products.is_hero IS 'DEPRECATED: utiliser display_type à la place';

COMMENT ON TABLE user_protocols IS 'Protocoles personnalisés des utilisateurs dans la marketplace';
COMMENT ON COLUMN user_protocols.items IS 'Array JSON des items du protocole: [{productId, product, quantity?, frequency, addedAt}]';
COMMENT ON COLUMN user_protocols.system_coverage IS 'Couverture systémique: [{systemName, coverage (0-100), priority}]';
COMMENT ON COLUMN user_protocols.status IS 'Statut: draft (en cours), active (validé), completed (terminé), archived (archivé)';
