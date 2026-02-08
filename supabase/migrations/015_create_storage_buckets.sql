-- Migration: Création des buckets Storage pour avatars et images produits
-- Date: 2026-02-06
-- Description: Crée les buckets user-avatars et product-covers avec leurs politiques RLS

-- ============================================================================
-- BUCKET: user-avatars
-- ============================================================================
-- Bucket pour les avatars des utilisateurs
-- - Lecture publique (pour afficher les avatars)
-- - Écriture uniquement par le propriétaire (auth.uid() = owner)
-- - Suppression uniquement par le propriétaire

-- Créer le bucket (si n'existe pas déjà)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true, -- Public pour permettre l'affichage des avatars
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Politique: Lecture publique (tout le monde peut voir les avatars)
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- Politique: Écriture uniquement par le propriétaire
-- Le chemin doit être au format: {user_id}/avatar.{ext}
-- Utilise split_part pour extraire le premier segment du chemin (user_id)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Politique: Mise à jour uniquement par le propriétaire
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Politique: Suppression uniquement par le propriétaire
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- ============================================================================
-- BUCKET: product-covers
-- ============================================================================
-- Bucket pour les images de couverture des produits marketplace
-- - Lecture publique (pour afficher les produits)
-- - Écriture uniquement par les admins
-- - Suppression uniquement par les admins

-- Créer le bucket (si n'existe pas déjà)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-covers',
  'product-covers',
  true, -- Public pour permettre l'affichage des produits
  10485760, -- 10MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Fonction helper pour vérifier si l'utilisateur est admin (réutilise la fonction existante)
-- Note: On utilise la fonction is_user_admin créée dans la migration 014

-- Politique: Lecture publique (tout le monde peut voir les images produits)
CREATE POLICY "Public product cover access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-covers');

-- Politique: Écriture uniquement par les admins
CREATE POLICY "Admins can upload product covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-covers'
  AND public.is_user_admin(auth.uid())
);

-- Politique: Mise à jour uniquement par les admins
CREATE POLICY "Admins can update product covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-covers'
  AND public.is_user_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'product-covers'
  AND public.is_user_admin(auth.uid())
);

-- Politique: Suppression uniquement par les admins
CREATE POLICY "Admins can delete product covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-covers'
  AND public.is_user_admin(auth.uid())
);

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Afficher les buckets créés
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('user-avatars', 'product-covers')
ORDER BY id;

-- Afficher les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND (policyname LIKE '%avatar%' OR policyname LIKE '%product cover%')
ORDER BY policyname;
