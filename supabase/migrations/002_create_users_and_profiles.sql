-- Migration pour créer les utilisateurs Harry et Ben
-- À exécuter dans Supabase SQL Editor

-- 1. Créer les utilisateurs dans auth.users
-- Note: Les mots de passe doivent être changés après la première connexion
-- Mot de passe par défaut: BioKing2026!

-- Créer Harry
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::uuid, -- UUID pour Harry
  'harrybenkemoun@gmail.com',
  crypt('BioKing2026!', gen_salt('bf')), -- Mot de passe hashé
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Harry"}'::jsonb,
  false,
  'authenticated'
);

-- Créer Ben
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002'::uuid, -- UUID pour Ben
  'ben@bioking.com',
  crypt('BioKing2026!', gen_salt('bf')), -- Mot de passe hashé
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Ben"}'::jsonb,
  false,
  'authenticated'
);

-- 2. Créer/Mettre à jour la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  chronological_age NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activer RLS sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies pour profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Créer les profils pour Harry et Ben
INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'harrybenkemoun@gmail.com',
    'Harry',
    'Benkemoun',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'ben@bioking.com',
    'Ben',
    'Smith',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Fonction pour mettre à jour updated_at sur profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON public.profiles;
CREATE TRIGGER update_profiles_updated_at_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- 9. Vérifier que tout est correct
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('harrybenkemoun@gmail.com', 'ben@bioking.com');
