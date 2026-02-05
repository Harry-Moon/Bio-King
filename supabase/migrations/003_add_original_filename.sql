-- Ajouter la colonne original_filename à la table systemage_reports
ALTER TABLE systemage_reports
ADD COLUMN original_filename TEXT;

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN systemage_reports.original_filename IS 'Nom original du fichier PDF uploadé par l''utilisateur';
