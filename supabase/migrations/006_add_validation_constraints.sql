-- Migration 006: Ajouter les contraintes de validation pour garantir l'intégrité des données

-- Contraintes pour systemage_reports
ALTER TABLE systemage_reports
  ADD CONSTRAINT check_positive_chronological_age
  CHECK (chronological_age > 0);

ALTER TABLE systemage_reports
  ADD CONSTRAINT check_positive_system_age
  CHECK (overall_system_age > 0);

ALTER TABLE systemage_reports
  ADD CONSTRAINT check_positive_aging_rate
  CHECK (aging_rate > 0);

ALTER TABLE systemage_reports
  ADD CONSTRAINT check_positive_bionoise
  CHECK (overall_bionoise IS NULL OR overall_bionoise >= 0);

ALTER TABLE systemage_reports
  ADD CONSTRAINT check_extraction_confidence_range
  CHECK (extraction_confidence IS NULL OR (extraction_confidence >= 0 AND extraction_confidence <= 100));

-- Contraintes pour body_systems
ALTER TABLE body_systems
  ADD CONSTRAINT check_positive_system_age
  CHECK (system_age > 0);

ALTER TABLE body_systems
  ADD CONSTRAINT check_positive_bionoise
  CHECK (bionoise IS NULL OR bionoise >= 0);

ALTER TABLE body_systems
  ADD CONSTRAINT check_percentile_rank_range
  CHECK (percentile_rank IS NULL OR (percentile_rank >= 0 AND percentile_rank <= 100));

ALTER TABLE body_systems
  ADD CONSTRAINT check_positive_aging_speed
  CHECK (aging_speed IS NULL OR aging_speed > 0);

-- Contraintes pour marketplace_products
ALTER TABLE marketplace_products
  ADD CONSTRAINT check_positive_price
  CHECK (price >= 0);

ALTER TABLE marketplace_products
  ADD CONSTRAINT check_name_not_empty
  CHECK (LENGTH(TRIM(name)) > 0);

ALTER TABLE marketplace_products
  ADD CONSTRAINT check_description_not_empty
  CHECK (LENGTH(TRIM(description)) > 0);

ALTER TABLE marketplace_products
  ADD CONSTRAINT check_image_not_empty
  CHECK (LENGTH(TRIM(image)) > 0);

-- Contraintes pour catalog_items (si utilisé)
ALTER TABLE catalog_items
  ADD CONSTRAINT check_catalog_positive_price
  CHECK (price IS NULL OR price >= 0);

-- Commentaires pour documentation
COMMENT ON CONSTRAINT check_positive_chronological_age ON systemage_reports IS 'L''âge chronologique doit être positif';
COMMENT ON CONSTRAINT check_positive_system_age ON systemage_reports IS 'L''âge systémique doit être positif';
COMMENT ON CONSTRAINT check_positive_price ON marketplace_products IS 'Le prix doit être positif ou nul';
