-- Migration 005: Créer la table marketplace_products alignée avec BioProduct
-- Cette table remplace le mock admin-products.ts pour la marketplace

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
  is_hero BOOLEAN DEFAULT false, -- DEPRECATED: utiliser display_type
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

-- Policy: Seuls les admins peuvent modifier (via service role)
-- Note: Les admins utiliseront le service role key, donc pas de policy INSERT/UPDATE/DELETE ici
-- La sécurité sera gérée au niveau de l'API avec vérification admin

-- Trigger pour updated_at
CREATE TRIGGER update_marketplace_products_updated_at
  BEFORE UPDATE ON marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour documentation
COMMENT ON TABLE marketplace_products IS 'Produits et services de la marketplace BioKing';
COMMENT ON COLUMN marketplace_products.category IS 'Catégorie du produit (inflammation, metabolism, etc.)';
COMMENT ON COLUMN marketplace_products.type IS 'Type de produit (supplement, service, protocol, therapy)';
COMMENT ON COLUMN marketplace_products.display_type IS 'Format d''affichage: hero (HeroCard) ou grid (ProductCard)';
COMMENT ON COLUMN marketplace_products.badge IS 'Badge affiché sur le produit (JSON: {type, text, value?, priority?})';
COMMENT ON COLUMN marketplace_products.featured_data IS 'Données featured (JSON: {ageDelta?, clinicalStandard?, recommendedFor?, doctorRequired?})';
COMMENT ON COLUMN marketplace_products.tags IS 'Tags pour recommandation intelligente (JSON array: [{name, visible, systemTargets?, ...}])';
COMMENT ON COLUMN marketplace_products.is_hero IS 'DEPRECATED: utiliser display_type à la place';
