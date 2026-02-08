-- Migration 014: Corriger la récursion infinie dans les policies RLS de profiles
-- Le problème : Les policies lisent depuis profiles pour vérifier le rôle admin,
-- ce qui déclenche à nouveau les policies et crée une boucle infinie.

-- ============================================
-- 1. Créer une fonction helper SECURITY DEFINER pour vérifier le rôle admin
-- Cette fonction contourne RLS car elle est SECURITY DEFINER
-- ============================================
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Commentaire pour documentation
COMMENT ON FUNCTION public.is_user_admin(UUID) IS 'Vérifie si un utilisateur est admin. Contourne RLS pour éviter la récursion.';

-- ============================================
-- 2. Supprimer les anciennes policies problématiques
-- ============================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;

-- ============================================
-- 3. Recréer les policies en utilisant la fonction helper
-- ============================================

-- Policy SELECT : Les utilisateurs peuvent voir leur propre profil OU les admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR public.is_user_admin(auth.uid())
  );

-- Policy UPDATE : Les utilisateurs peuvent mettre à jour leur propre profil OU les admins peuvent mettre à jour tous les profils
CREATE POLICY "Admins can update user roles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR public.is_user_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_user_admin(auth.uid())
  );

-- ============================================
-- 4. Vérification
-- ============================================
-- Afficher les policies existantes pour profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
