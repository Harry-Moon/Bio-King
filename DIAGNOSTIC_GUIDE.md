# 🔧 Guide de Diagnostic BioKing

## Problème Actuel

Vous rencontrez une erreur 406 sur le dashboard. Cette erreur indique que quelque chose bloque mais nous n'avons pas assez de détails.

## ✅ Solution : Page de Diagnostic

J'ai créé une **page de diagnostic complète** qui va vérifier automatiquement toute votre configuration.

### 📍 Comment Accéder

1. Allez sur : **http://localhost:3000/diagnostic**
2. Ou cliquez sur **"🔧 Diagnostic"** dans la sidebar (en bas)

### 🔍 Ce Que Le Diagnostic Vérifie

La page va tester automatiquement :

#### 1. Variables d'Environnement

- ✅ `NEXT_PUBLIC_SUPABASE_URL` : Présente ?
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Présente ?
- ✅ `SUPABASE_SERVICE_ROLE_KEY` : Présente ?
- ✅ `OPENAI_API_KEY` : Présente ?

#### 2. Supabase

- ✅ Connexion à la base de données
- ✅ Table `systemage_reports` existe
- ✅ Table `body_systems` existe
- ✅ Table `recommendations` existe
- ✅ Table `profiles` existe
- ✅ Bucket `systemage-reports` existe dans Storage

#### 3. OpenAI

- ✅ Connexion à l'API OpenAI
- ✅ Modèle GPT-4o disponible et fonctionnel

---

## 🎯 Après Le Diagnostic

Une fois sur la page de diagnostic, vous verrez **exactement** ce qui manque avec des instructions précises pour chaque problème.

### Si Tout Est Vert ✅

Super ! Votre configuration est correcte. Le problème vient d'ailleurs (peut-être pas de rapports uploadés encore).

### Si Du Rouge Apparaît ❌

La page vous dira **exactement quoi faire**. Par exemple :

- ❌ **OpenAI API Key manquante**
  → Ajouter dans `.env.local`
- ❌ **Table `systemage_reports` n'existe pas**
  → Exécuter le script `001_create_systemage_schema.sql` dans Supabase
- ❌ **Table `profiles` n'existe pas**
  → Exécuter le script `002_create_users_and_profiles.sql` dans Supabase
- ❌ **Bucket `systemage-reports` n'existe pas**
  → Créer le bucket (PUBLIC) dans Supabase Storage

---

## 📋 Checklist Rapide

Avant d'aller plus loin, vérifiez que vous avez bien fait ces étapes :

### Étape 1 : Configuration Supabase

1. [ ] Créé un projet Supabase
2. [ ] Ajouté les variables dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### Étape 2 : Scripts SQL

Dans Supabase > SQL Editor :

1. [ ] Exécuté `supabase/migrations/001_create_systemage_schema.sql`
   - Crée les tables : `systemage_reports`, `body_systems`, `recommendations`, etc.
   - Active RLS
   - Crée les indexes

2. [ ] Exécuté `supabase/migrations/002_create_users_and_profiles.sql`
   - Crée la table `profiles`
   - Crée les utilisateurs de test (Harry & Ben)
   - Configure les triggers

### Étape 3 : Storage

Dans Supabase > Storage :

1. [ ] Créé le bucket `systemage-reports`
2. [ ] Configuré le bucket en **PUBLIC**
3. [ ] Autorisé les uploads (.pdf uniquement si possible)

### Étape 4 : OpenAI

1. [ ] Créé un compte OpenAI
2. [ ] Généré une API Key
3. [ ] Ajouté la clé dans `.env.local` :

```env
OPENAI_API_KEY=sk-...votre-cle...
```

### Étape 5 : Redémarrage

Après toute modification de `.env.local` :

```bash
# Arrêter le serveur (Ctrl+C)
# Supprimer le cache
rm -rf .next

# Redémarrer
npm run dev
```

---

## 🚨 Erreurs Fréquentes

### Erreur : "Cannot coerce the result to a single JSON object"

**Cause** : Aucun rapport dans la base de données

**Solution** : C'est normal ! Uploadez votre premier rapport via `/upload`

### Erreur : "Table 'systemage_reports' does not exist"

**Cause** : Le script SQL n'a pas été exécuté

**Solution** : Allez dans Supabase > SQL Editor et exécutez `001_create_systemage_schema.sql`

### Erreur : "Invalid API Key" (OpenAI)

**Cause** : Clé OpenAI manquante ou invalide

**Solution** :

1. Vérifiez que `OPENAI_API_KEY` est dans `.env.local`
2. Vérifiez que la clé commence par `sk-`
3. Vérifiez que votre compte OpenAI a du crédit

### Erreur : "Bucket not found"

**Cause** : Le bucket `systemage-reports` n'existe pas

**Solution** :

1. Allez dans Supabase > Storage
2. Cliquez sur "New bucket"
3. Nom : `systemage-reports`
4. Cochez "Public bucket"
5. Créez

---

## 🧪 Test Complet du Flow

Une fois tout en vert sur `/diagnostic`, testez le flow complet :

1. **Connexion** : `/login`
   - Email : `harrybenkemoun@gmail.com`
   - Password : `BioKing2026!`

2. **Dashboard** : `/dashboard`
   - Devrait afficher "Aucun rapport trouvé" (normal)

3. **Upload** : `/upload`
   - Uploadez un PDF SystemAge de test
   - Attendez 30-60 secondes

4. **Vérification dans Supabase** :
   - Allez dans Table Editor > `systemage_reports`
   - Vous devriez voir un nouveau rapport
   - Status : `processing` puis `completed`

5. **Retour Dashboard** : `/dashboard`
   - Actualisez la page
   - Vos données s'affichent ! 🎉

---

## 💡 Besoin d'Aide ?

La page de diagnostic vous donne des informations en temps réel. Utilisez le bouton "Actualiser" pour revérifier après chaque modification.

Si tout est vert mais que ça ne marche toujours pas, c'est probablement parce que vous n'avez pas encore uploadé de rapport !

---

## 📊 API de Santé (Pour Les Développeurs)

Vous pouvez aussi tester l'API directement :

```bash
curl http://localhost:3000/api/health
```

Retourne un JSON avec tous les checks :

```json
{
  "status": "healthy" | "degraded" | "error",
  "checks": {
    "environment": { ... },
    "supabase": { ... },
    "openai": { ... }
  }
}
```

---

## 🎯 Prochaines Étapes

1. **Maintenant** : Allez sur `/diagnostic`
2. **Corrigez** ce qui est rouge
3. **Actualisez** jusqu'à ce que tout soit vert
4. **Uploadez** votre premier rapport
5. **Profitez** de votre dashboard ! 🚀
