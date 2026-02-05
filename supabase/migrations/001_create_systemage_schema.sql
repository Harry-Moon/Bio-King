-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des rapports SystemAge principaux
CREATE TABLE systemage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Scores globaux
  chronological_age NUMERIC NOT NULL,
  overall_system_age NUMERIC NOT NULL,
  aging_rate NUMERIC NOT NULL,
  aging_stage TEXT CHECK (aging_stage IN ('Prime', 'Plateau', 'Accelerated')) NOT NULL,
  overall_bionoise NUMERIC,
  
  -- État extraction
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extraction_confidence NUMERIC,
  raw_extraction_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des 19 systèmes corporels par rapport
CREATE TABLE body_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES systemage_reports(id) ON DELETE CASCADE NOT NULL,
  system_name TEXT NOT NULL,
  system_age NUMERIC NOT NULL,
  bionoise NUMERIC,
  age_difference NUMERIC NOT NULL,
  aging_stage TEXT CHECK (aging_stage IN ('Prime', 'Plateau', 'Accelerated')) NOT NULL,
  percentile_rank NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des recommandations extraites
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES systemage_reports(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('nutritional', 'fitness', 'therapy')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_systems TEXT[],
  clinical_benefits TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table du catalogue (produits, services, articles, protocoles)
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('product', 'service', 'article', 'protocol')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  price NUMERIC,
  external_link TEXT,
  tags TEXT[],
  target_systems TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des conversations chat IA
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des messages de chat
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des plans d'action personnalisés
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES systemage_reports(id),
  title TEXT NOT NULL,
  description TEXT,
  target_systems TEXT[],
  recommended_items UUID[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_reports_user ON systemage_reports(user_id);
CREATE INDEX idx_reports_status ON systemage_reports(extraction_status);
CREATE INDEX idx_body_systems_report ON body_systems(report_id);
CREATE INDEX idx_recommendations_report ON recommendations(report_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_catalog_tags ON catalog_items USING GIN(tags);
CREATE INDEX idx_catalog_systems ON catalog_items USING GIN(target_systems);
CREATE INDEX idx_action_plans_user ON action_plans(user_id);

-- Row Level Security (RLS)
ALTER TABLE systemage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Policies pour systemage_reports
CREATE POLICY "Users can view their own reports"
  ON systemage_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON systemage_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON systemage_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies pour body_systems
CREATE POLICY "Users can view their own body systems"
  ON body_systems FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM systemage_reports
      WHERE systemage_reports.id = body_systems.report_id
      AND systemage_reports.user_id = auth.uid()
    )
  );

-- Policies pour recommendations
CREATE POLICY "Users can view their own recommendations"
  ON recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM systemage_reports
      WHERE systemage_reports.id = recommendations.report_id
      AND systemage_reports.user_id = auth.uid()
    )
  );

-- Policies pour chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour chat_messages
CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- Policies pour action_plans
CREATE POLICY "Users can view their own action plans"
  ON action_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own action plans"
  ON action_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own action plans"
  ON action_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Catalog items sont publics en lecture
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog items are viewable by everyone"
  ON catalog_items FOR SELECT
  USING (is_active = true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_systemage_reports_updated_at
  BEFORE UPDATE ON systemage_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_items_updated_at
  BEFORE UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
