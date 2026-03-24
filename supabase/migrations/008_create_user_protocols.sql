-- Migration 008: Créer la table user_protocols pour stocker les protocoles utilisateur de la marketplace

CREATE TABLE user_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Items du protocole (JSONB pour ProtocolItem[])
  -- Format: [{productId, product, quantity?, frequency, addedAt}]
  items JSONB DEFAULT '[]'::jsonb NOT NULL,
  
  -- Prix total calculé
  total_price NUMERIC DEFAULT 0 NOT NULL,
  
  -- Couverture systémique (JSONB pour SystemCoverage[])
  -- Format: [{systemName, coverage, priority}]
  system_coverage JSONB DEFAULT '[]'::jsonb,
  
  -- Numéro de semaine (optionnel)
  week_number INTEGER,
  
  -- Statut du protocole
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
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

-- Trigger pour updated_at
CREATE TRIGGER update_user_protocols_updated_at
  BEFORE UPDATE ON user_protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Contraintes de validation
ALTER TABLE user_protocols
  ADD CONSTRAINT check_positive_total_price
  CHECK (total_price >= 0);

ALTER TABLE user_protocols
  ADD CONSTRAINT check_valid_week_number
  CHECK (week_number IS NULL OR (week_number >= 1 AND week_number <= 52));

-- Commentaires pour documentation
COMMENT ON TABLE user_protocols IS 'Protocoles personnalisés des utilisateurs dans la marketplace';
COMMENT ON COLUMN user_protocols.items IS 'Array JSON des items du protocole: [{productId, product, quantity?, frequency, addedAt}]';
COMMENT ON COLUMN user_protocols.system_coverage IS 'Couverture systémique: [{systemName, coverage (0-100), priority}]';
COMMENT ON COLUMN user_protocols.status IS 'Statut: draft (en cours), active (validé), completed (terminé), archived (archivé)';
