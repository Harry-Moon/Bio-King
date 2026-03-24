# Dépannage connexion BioKing sur Lovable

Si vous ne parvenez pas à vous connecter sur l’application déployée sur [Lovable](https://lovable.dev/projects/3a5a94c2-88a6-4f63-9f80-c5bfc68379ce), voici les causes les plus fréquentes et comment les corriger.

---

## 1. Variables d'environnement sur Lovable

Les variables `.env` locales ne sont pas envoyées à Lovable. Elles doivent être définies dans le projet Lovable.

### À faire
1. Ouvrir le projet Lovable
2. Aller dans **Settings** (ou **Project Settings**) → **Environment Variables**
3. Ajouter :

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase (ex: `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme (anon/public) Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (pour les opérations admin) |

4. Redéployer l’application après modification des variables

Sans ces variables, l’app ne peut pas joindre Supabase et la connexion échoue.

---

## 2. URLs autorisées dans Supabase

Supabase exige que l’URL de votre app soit dans la configuration Auth.

### À faire
1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard) → projet **Bio King DEV**
2. **Authentication** → **URL Configuration**
3. Renseigner :
   - **Site URL** : URL publique Lovable (ex: `https://votre-app.lovable.app`)
   - **Redirect URLs** : ajouter la même URL + éventuellement `http://localhost:3000/**` pour les tests locaux

4. Sauvegarder

Sans cela, Supabase peut bloquer les redirections après authentification.

---

## 3. Compte utilisateur existant

L’utilisateur doit exister dans Supabase.

### Option A : Utilisateurs créés via script
Les utilisateurs de la migration `002_create_users_and_profiles.sql` sont créés avec :
- `harrybenkemoun@gmail.com` / `BioKing2026!`
- `ben@bioking.com` / `BioKing2026!`

Vérifier dans **Supabase** → **Authentication** → **Users** que ces comptes existent.

### Option B : Inscription via l’app
1. Utiliser la page **Créer un compte** (`/signup`)
2. Vérifier l’email si la confirmation est activée dans Supabase

---

## 4. Vérifications rapides

### En local
```bash
# Dans .env.local (vérifier que les valeurs sont correctes)
NEXT_PUBLIC_SUPABASE_URL=https://robatgbjqamuqazjbbtk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Sur Lovable
- Les variables sont-elles bien définies ?
- L’URL Lovable est-elle dans les Redirect URLs de Supabase ?
- Avez-vous redéployé après modification des variables ?
- Quelle erreur exacte apparaît lors de la connexion ?

---

## 5. Erreurs fréquentes Supabase Auth

| Message | Cause possible | Action |
|--------|----------------|--------|
| "Invalid login credentials" | Email ou mot de passe incorrect | Vérifier les identifiants |
| "Email not confirmed" | Confirmation d’email activée | Vérifier la boîte mail ou désactiver la confirmation dans Supabase |
| "Auth session missing!" | Session / cookies mal gérés | Vérifier les URLs (Site URL, Redirect URLs) |
| Erreur réseau / timeout | Mauvais `NEXT_PUBLIC_SUPABASE_URL` | Vérifier les variables d’environnement Lovable |

---

## 6. Résumé

1. Renseigner `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Lovable.
2. Ajouter l’URL Lovable dans **Authentication** → **URL Configuration** de Supabase.
3. Confirmer que le compte existe dans **Authentication** → **Users**.
4. Redéployer l’app après modification des variables.

En cas de blocage, indiquer : l’URL Lovable, le message d’erreur exact et, si possible, une capture d’écran.
