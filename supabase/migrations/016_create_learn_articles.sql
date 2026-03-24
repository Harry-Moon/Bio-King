-- Migration 016: Créer la table learn_articles pour l'espace d'apprentissage
-- Articles par thématiques, niveau et temps de lecture

CREATE TABLE IF NOT EXISTS learn_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Informations de base
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,

  -- Contenu
  content TEXT,
  content_type TEXT CHECK (content_type IN ('article', 'protocol', 'clinical_study')) NOT NULL DEFAULT 'article',

  -- Métadonnées
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
  themes TEXT[] DEFAULT '{}',

  -- Image de couverture
  cover_image TEXT,

  -- Engagement (optionnel, pour affichage)
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,

  -- Publication
  published_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Ordre d'affichage
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_learn_articles_content_type ON learn_articles(content_type);
CREATE INDEX IF NOT EXISTS idx_learn_articles_level ON learn_articles(level);
CREATE INDEX IF NOT EXISTS idx_learn_articles_themes ON learn_articles USING GIN(themes);
CREATE INDEX IF NOT EXISTS idx_learn_articles_active ON learn_articles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_learn_articles_published ON learn_articles(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_learn_articles_sort ON learn_articles(sort_order, created_at DESC);

-- RLS
ALTER TABLE learn_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique pour les articles actifs, admins voient tout
DROP POLICY IF EXISTS "Learn articles viewable by public when active, admins see all" ON learn_articles;
CREATE POLICY "Learn articles viewable by public when active, admins see all"
  ON learn_articles FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins peuvent insérer des articles
DROP POLICY IF EXISTS "Admins can insert learn articles" ON learn_articles;
CREATE POLICY "Admins can insert learn articles"
  ON learn_articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins peuvent mettre à jour des articles
DROP POLICY IF EXISTS "Admins can update learn articles" ON learn_articles;
CREATE POLICY "Admins can update learn articles"
  ON learn_articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins peuvent supprimer des articles
DROP POLICY IF EXISTS "Admins can delete learn articles" ON learn_articles;
CREATE POLICY "Admins can delete learn articles"
  ON learn_articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_learn_articles_updated_at ON learn_articles;
CREATE TRIGGER update_learn_articles_updated_at
  BEFORE UPDATE ON learn_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE learn_articles IS 'Articles de l''espace d''apprentissage BioKing';
COMMENT ON COLUMN learn_articles.content_type IS 'Type: article, protocol, clinical_study';
COMMENT ON COLUMN learn_articles.level IS 'Niveau: beginner, intermediate, advanced';
COMMENT ON COLUMN learn_articles.themes IS 'Thématiques (tags): Energie, Longévité, Nutrition, etc.';
