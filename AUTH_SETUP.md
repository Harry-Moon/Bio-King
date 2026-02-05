# 🔐 Configuration de l'Authentification

## ✅ Ce qui a été fait

L'authentification Supabase est maintenant **complètement intégrée** !

### Fonctionnalités

- ✅ Login avec email/mot de passe
- ✅ Protection des routes avec middleware
- ✅ Menu utilisateur dans la sidebar
- ✅ Déconnexion
- ✅ Redirection automatique
- ✅ Profils utilisateurs

### Utilisateurs créés

Deux utilisateurs de test ont été préparés :

1. **Harry**
   - Email : `harrybenkemoun@gmail.com`
   - Mot de passe : `BioKing2026!`

2. **Ben**
   - Email : `ben@bioking.com`
   - Mot de passe : `BioKing2026!`

---

## 🚀 Configuration (À FAIRE MAINTENANT)

### Étape 1 : Exécuter le script SQL

1. Aller sur : https://supabase.com/dashboard/project/robatgbjqamuqazjbbtk/sql/new

2. Copier **TOUT** le contenu du fichier :
   `supabase/migrations/002_create_users_and_profiles.sql`

3. Coller dans l'éditeur SQL

4. Cliquer **"Run"**

**Ce que fait le script :**

- Crée les utilisateurs Harry et Ben dans `auth.users`
- Crée la table `profiles` si elle n'existe pas
- Configure les policies RLS
- Crée les profils associés
- Ajoute un trigger pour créer automatiquement les profils

---

### Étape 2 : Vérifier que tout fonctionne

Après avoir exécuté le script SQL, vérifier :

```sql
-- Vérifier les utilisateurs
SELECT id, email, created_at
FROM auth.users
WHERE email IN ('harrybenkemoun@gmail.com', 'ben@bioking.com');

-- Vérifier les profils
SELECT * FROM public.profiles;
```

Vous devriez voir 2 utilisateurs et 2 profils.

---

## 🧪 Test de l'authentification

### 1. Démarrer l'application

```bash
npm run dev
```

### 2. Aller sur http://localhost:3000

Vous serez **automatiquement redirigé** vers `/login`

### 3. Se connecter avec Harry

- Email : `harrybenkemoun@gmail.com`
- Mot de passe : `BioKing2026!`

### 4. Vous êtes maintenant connecté !

Vous verrez :

- ✅ Votre email dans la sidebar (en bas)
- ✅ Menu utilisateur avec déconnexion
- ✅ Accès à toutes les pages

### 5. Uploader un rapport

1. Aller sur `/upload`
2. Uploader un PDF SystemAge
3. Le rapport sera **associé à votre compte** !

---

## 🔒 Sécurité

### Protection des routes

Toutes les pages (sauf `/login`) sont **protégées** :

- Utilisateur non connecté → Redirigé vers `/login`
- Utilisateur connecté sur `/login` → Redirigé vers `/dashboard`

### Row Level Security (RLS)

Chaque utilisateur ne peut voir/modifier **que ses propres données** :

- ✅ Ses rapports SystemAge
- ✅ Son profil
- ✅ Ses conversations chat (futur)
- ✅ Ses plans d'action (futur)

---

## 📊 Données liées à l'utilisateur

Maintenant que l'auth est active, **toutes les données sont liées à l'utilisateur** :

### Rapports SystemAge

```sql
SELECT
  r.id,
  r.pdf_url,
  r.overall_system_age,
  r.chronological_age,
  p.first_name,
  p.last_name
FROM systemage_reports r
JOIN profiles p ON r.user_id = p.id
WHERE r.user_id = '550e8400-e29b-41d4-a716-446655440001'; -- Harry
```

### Dashboard

Le dashboard affiche maintenant **uniquement les rapports de l'utilisateur connecté**.

---

## 🛠️ Structure des fichiers

### Nouveau fichiers créés

```
lib/auth/
├── auth-helpers.ts          # Helpers serveur (getSession, requireAuth)
└── supabase-client.ts       # Client pour composants React

components/auth/
├── auth-provider.tsx        # Context Provider pour l'auth
└── user-menu.tsx            # Menu utilisateur dans sidebar

app/login/
└── page.tsx                 # Page de connexion

middleware.ts                # Protection des routes Next.js

supabase/migrations/
└── 002_create_users_and_profiles.sql  # Script SQL
```

### Fichiers modifiés

- `app/layout.tsx` : Ajout du AuthProvider
- `app/page.tsx` : Redirection selon l'auth
- `app/upload/page.tsx` : Utilise le vrai userId
- `components/layout/app-layout.tsx` : Gère les pages publiques/privées
- `components/layout/sidebar.tsx` : Affiche le UserMenu

---

## 🔑 Changer le mot de passe

### Option 1 : Via Supabase Dashboard

1. Aller sur : https://supabase.com/dashboard/project/robatgbjqamuqazjbbtk/auth/users
2. Cliquer sur l'utilisateur
3. "Reset Password"

### Option 2 : Via SQL

```sql
UPDATE auth.users
SET encrypted_password = crypt('NouveauMotDePasse', gen_salt('bf'))
WHERE email = 'harrybenkemoun@gmail.com';
```

---

## ➕ Ajouter un nouvel utilisateur

### Via SQL

```sql
-- 1. Créer l'utilisateur
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  role
)
VALUES (
  gen_random_uuid(),
  'nouvel@email.com',
  crypt('MotDePasse123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Prénom"}'::jsonb,
  'authenticated'
);

-- 2. Le profil sera créé automatiquement par le trigger !
```

### Via l'app (futur)

Une page `/signup` sera ajoutée en Phase 2+ pour permettre l'inscription directe.

---

## 🐛 Problèmes fréquents

### Erreur : "Invalid login credentials"

**Cause** : Script SQL pas exécuté ou utilisateur pas créé

**Solution** :

1. Vérifier que le script SQL a bien été exécuté
2. Vérifier les users : `SELECT * FROM auth.users;`

### Erreur : "No rows returned"

**Cause** : Profil pas créé

**Solution** :

```sql
-- Créer le profil manuellement
INSERT INTO public.profiles (id, email, first_name)
SELECT id, email, split_part(email, '@', 1)
FROM auth.users
WHERE email = 'harrybenkemoun@gmail.com';
```

### Redirection infinie

**Cause** : Middleware ou AuthProvider mal configuré

**Solution** : Vérifier que `middleware.ts` et `app/layout.tsx` sont corrects

---

## 🎯 Prochaines étapes

Avec l'auth en place, vous pouvez maintenant :

1. ✅ **Uploader des rapports** liés à votre compte
2. ✅ **Voir vos données** uniquement
3. ✅ **Tester avec plusieurs utilisateurs**
4. 🔜 Ajouter une page `/signup` pour inscription
5. 🔜 Ajouter la récupération de mot de passe
6. 🔜 Profil utilisateur éditable
7. 🔜 Avatar personnalisé

---

## ✅ Checklist finale

- [ ] Script SQL exécuté dans Supabase
- [ ] Vérification : 2 utilisateurs créés
- [ ] Vérification : 2 profils créés
- [ ] Test : Connexion avec Harry réussie
- [ ] Test : Upload de rapport avec userId correct
- [ ] Test : Dashboard affiche les rapports de l'utilisateur
- [ ] Test : Déconnexion fonctionne

---

**Créé avec 🔐 pour BioKing**

Authentification complète et sécurisée avec Supabase Auth !
