-- Migration 007: Ajouter les index manquants pour optimiser les recherches fréquentes

-- Index pour systemage_reports (recherches par utilisateur et date)
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON systemage_reports(user_id, upload_date DESC);

-- Index pour body_systems (recherches par report et tri par différence d'âge)
CREATE INDEX IF NOT EXISTS idx_body_systems_report_age_diff ON body_systems(report_id, age_difference DESC);

-- Index pour body_systems (recherches par système et stage)
CREATE INDEX IF NOT EXISTS idx_body_systems_name_stage ON body_systems(system_name, aging_stage);

-- Index pour recommendations (recherches par type et report)
CREATE INDEX IF NOT EXISTS idx_recommendations_type_report ON recommendations(type, report_id);

-- Index pour chat_messages (recherches par conversation et date)
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_date ON chat_messages(conversation_id, created_at DESC);

-- Index pour chat_conversations (recherches par utilisateur et date)
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_date ON chat_conversations(user_id, updated_at DESC);

-- Index pour action_plans (recherches par utilisateur et statut)
CREATE INDEX IF NOT EXISTS idx_action_plans_user_status ON action_plans(user_id, status);

-- Index pour marketplace_products (recherches combinées fréquentes)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_active ON marketplace_products(category, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_type_active ON marketplace_products(type, is_active) WHERE is_active = true;

-- Index pour profiles (recherches par email)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- Commentaires pour documentation
COMMENT ON INDEX idx_reports_user_date IS 'Optimise les requêtes de récupération des rapports d''un utilisateur triés par date';
COMMENT ON INDEX idx_body_systems_report_age_diff IS 'Optimise les requêtes de systèmes corporels triés par différence d''âge';
COMMENT ON INDEX idx_marketplace_products_category_active IS 'Optimise les recherches de produits par catégorie (produits actifs uniquement)';
