-- Migration 009: Ajouter les politiques DELETE manquantes et commentaires de documentation

-- ============================================
-- POLITIQUES DELETE
-- ============================================

-- systemage_reports: Les utilisateurs peuvent supprimer leurs propres rapports
CREATE POLICY "Users can delete their own reports"
  ON systemage_reports FOR DELETE
  USING (auth.uid() = user_id);

-- body_systems: Suppression via CASCADE depuis systemage_reports
-- Pas besoin de policy DELETE explicite car CASCADE gère cela

-- recommendations: Suppression via CASCADE depuis systemage_reports
-- Pas besoin de policy DELETE explicite car CASCADE gère cela

-- chat_conversations: Les utilisateurs peuvent supprimer leurs propres conversations
CREATE POLICY "Users can delete their own conversations"
  ON chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- chat_messages: Suppression via CASCADE depuis chat_conversations
-- Pas besoin de policy DELETE explicite car CASCADE gère cela

-- action_plans: Les utilisateurs peuvent supprimer leurs propres plans
CREATE POLICY "Users can delete their own action plans"
  ON action_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COMMENTAIRES DE DOCUMENTATION
-- ============================================

-- Table systemage_reports
COMMENT ON TABLE systemage_reports IS 'Rapports SystemAge principaux uploadés par les utilisateurs';
COMMENT ON COLUMN systemage_reports.chronological_age IS 'Âge chronologique de l''utilisateur';
COMMENT ON COLUMN systemage_reports.overall_system_age IS 'Âge systémique global calculé';
COMMENT ON COLUMN systemage_reports.aging_rate IS 'Taux de vieillissement (ratio entre system_age et chronological_age)';
COMMENT ON COLUMN systemage_reports.aging_stage IS 'Stade de vieillissement: Prime (<25.8), Plateau (25.8-42.1), Accelerated (>42.1)';
COMMENT ON COLUMN systemage_reports.extraction_status IS 'État de l''extraction des données depuis le PDF';
COMMENT ON COLUMN systemage_reports.raw_extraction_data IS 'Données brutes extraites du PDF (JSON)';

-- Table body_systems
COMMENT ON TABLE body_systems IS 'Les 19 systèmes corporels analysés par rapport SystemAge';
COMMENT ON COLUMN body_systems.system_name IS 'Nom du système biologique (ex: Inflammation, Metabolism)';
COMMENT ON COLUMN body_systems.system_age IS 'Âge calculé pour ce système spécifique';
COMMENT ON COLUMN body_systems.age_difference IS 'Différence entre system_age et chronological_age';
COMMENT ON COLUMN body_systems.aging_speed IS 'Vitesse de vieillissement du système (ratio, ex: 1.04x)';
COMMENT ON COLUMN body_systems.percentile_rank IS 'Rang percentile par rapport à la population (0-100)';

-- Table recommendations
COMMENT ON TABLE recommendations IS 'Recommandations personnalisées générées à partir des rapports';
COMMENT ON COLUMN recommendations.type IS 'Type de recommandation: nutritional, fitness, ou therapy';
COMMENT ON COLUMN recommendations.target_systems IS 'Array des systèmes biologiques ciblés par cette recommandation';

-- Table catalog_items
COMMENT ON TABLE catalog_items IS 'Catalogue général de produits/services/articles (legacy, utiliser marketplace_products)';
COMMENT ON COLUMN catalog_items.type IS 'Type: product, service, article, ou protocol';
COMMENT ON COLUMN catalog_items.target_systems IS 'Array des systèmes biologiques ciblés';

-- Table chat_conversations
COMMENT ON TABLE chat_conversations IS 'Conversations avec l''assistant IA';
COMMENT ON COLUMN chat_conversations.title IS 'Titre de la conversation (généré automatiquement ou défini par l''utilisateur)';

-- Table chat_messages
COMMENT ON TABLE chat_messages IS 'Messages individuels dans les conversations IA';
COMMENT ON COLUMN chat_messages.role IS 'Rôle: user (utilisateur), assistant (IA), ou system (système)';
COMMENT ON COLUMN chat_messages.metadata IS 'Métadonnées additionnelles (JSON)';

-- Table action_plans
COMMENT ON TABLE action_plans IS 'Plans d''action personnalisés créés pour les utilisateurs';
COMMENT ON COLUMN action_plans.recommended_items IS 'Array d''UUIDs référençant catalog_items ou marketplace_products';
COMMENT ON COLUMN action_plans.status IS 'Statut: active, completed, ou archived';

-- Table profiles
COMMENT ON TABLE profiles IS 'Profils utilisateurs étendus (complément de auth.users)';
COMMENT ON COLUMN profiles.chronological_age IS 'Âge chronologique stocké dans le profil (peut différer du rapport)';
