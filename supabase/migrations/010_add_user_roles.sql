-- Migration 010: Ajouter le système de rôles utilisateur
-- Ajoute une colonne role à profiles et configure les admins

-- ============================================
-- 1. Ajouter la colonne role à profiles
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN role TEXT DEFAULT 'user' 
    CHECK (role IN ('user', 'admin', 'moderator'));
    
    -- Index pour les recherches par rôle
    CREATE INDEX idx_profiles_role ON profiles(role) WHERE role != 'user';
    
    -- Commentaire
    COMMENT ON COLUMN profiles.role IS 'Rôle utilisateur: user (par défaut), admin (accès complet), moderator (modération)';
  END IF;
END $$;

-- ============================================
-- 2. Mettre à jour harry@citizenvitae.com en admin
-- ============================================
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'harry@citizenvitae.com';

-- Mettre à jour aussi harrybenkemoun@gmail.com si présent
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'harrybenkemoun@gmail.com';

-- ============================================
-- 3. Fonction helper pour vérifier si un utilisateur est admin
-- ============================================
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Policies RLS pour les admins (marketplace_products)
-- ============================================
DO $$
BEGIN
  -- Policy pour INSERT (admins uniquement)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'marketplace_products' 
      AND policyname = 'Admins can insert marketplace products'
  ) THEN
    CREATE POLICY "Admins can insert marketplace products"
      ON marketplace_products FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  -- Policy pour UPDATE (admins uniquement)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'marketplace_products' 
      AND policyname = 'Admins can update marketplace products'
  ) THEN
    CREATE POLICY "Admins can update marketplace products"
      ON marketplace_products FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  -- Policy pour DELETE (admins uniquement)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'marketplace_products' 
      AND policyname = 'Admins can delete marketplace products'
  ) THEN
    CREATE POLICY "Admins can delete marketplace products"
      ON marketplace_products FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================
-- 5. Policy pour que les admins puissent voir tous les produits (même inactifs)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'marketplace_products' 
      AND policyname = 'Admins can view all marketplace products'
  ) THEN
    CREATE POLICY "Admins can view all marketplace products"
      ON marketplace_products FOR SELECT
      USING (
        is_active = true 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================
-- 6. Policy pour que les admins puissent gérer les profils (changer les rôles)
-- ============================================
DO $$
BEGIN
  -- Policy UPDATE pour les admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Admins can update user roles'
  ) THEN
    CREATE POLICY "Admins can update user roles"
      ON profiles FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;

  -- Policy SELECT pour que les admins voient tous les profils
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON profiles FOR SELECT
      USING (
        auth.uid() = id 
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;
