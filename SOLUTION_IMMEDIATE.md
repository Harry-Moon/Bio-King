# 🎯 Solution Immédiate - Page de Diagnostic

## ✅ Ce Que J'ai Créé

### 1. Page de Diagnostic Complète

**URL** : http://localhost:3000/diagnostic

Cette page vérifie automatiquement **toute votre configuration** :

#### ✓ Variables d'Environnement
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY

#### ✓ Base de Données Supabase
- Connexion à Supabase
- Table `systemage_reports`
- Table `body_systems`
- Table `recommendations`
- Table `profiles`
- Bucket `systemage-reports` (Storage)

#### ✓ OpenAI API
- Connexion à l'API
- Modèle GPT-4o disponible

### 2. API de Santé

**Endpoint** : http://localhost:3000/api/health

Retourne un JSON avec tous les checks. Vous pouvez aussi le tester en ligne de commande :

```bash
curl http://localhost:3000/api/health | json_pp
```

### 3. Navigation Mise à Jour

Le lien "🔧 Diagnostic" apparaît maintenant dans la sidebar (en bas de la liste).

---

## 🚀 Action Immédiate

### Étape 1 : Allez sur la page de diagnostic

1. Ouvrez : **http://localhost:3000/diagnostic**
2. Attendez le chargement
3. Prenez une capture d'écran ou notez ce qui est rouge ❌

### Étape 2 : Suivez les Actions Recommandées

La page vous dira **exactement** quoi faire pour chaque problème.

---

## 🔍 Analyse des Logs

J'ai analysé vos logs et **les uploads fonctionnent !** :

```
[Upload] Uploading PDF for user c2ad6dd9-d291-4041-a674-f78c5664ba07: SystemAge Report .pdf
[Upload] PDF uploaded successfully
[Upload] Report created with ID: 647dede5-932e-4b4d-98f8-b5b30f78088b
[Upload] Triggering extraction for report 647dede5-932e-4b4d-98f8-b5b30f78088b
POST /api/upload-pdf 200 in 2269ms  ✅
```

**Ce qui fonctionne** :
- ✅ Authentification
- ✅ Upload de fichiers
- ✅ Sauvegarde dans Supabase Storage
- ✅ Création de rapports dans la DB
- ✅ Déclenchement de l'extraction

**Ce qui manque probablement** :
- ❓ Configuration OpenAI (clé API)
- ❓ L'extraction ne se termine pas
- ❓ Ou l'extraction fonctionne mais vous n'actualisez pas

---

## 🐛 Débogage de l'Extraction

L'extraction est déclenchée de manière asynchrone. Pour voir si elle fonctionne :

### Option 1 : Vérifier dans Supabase directement

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Ouvrez votre projet
3. Allez dans **Table Editor**
4. Ouvrez la table `systemage_reports`
5. Regardez la colonne `extraction_status` :
   - `pending` = Pas encore commencé
   - `processing` = En cours
   - `completed` = Terminé ✅
   - `failed` = Erreur ❌

### Option 2 : Regarder les Logs du Terminal

Les logs de l'extraction apparaissent dans votre terminal où `npm run dev` tourne :

```
[Extract] Starting extraction for report xxx
[Extract] Downloading PDF from xxx
[Extract] Converting PDF to images
[Extract] PDF has X pages
[Extract] Calling GPT-4 Vision for extraction
```

Si vous ne voyez pas ces logs **après "Triggering extraction"**, c'est que l'extraction ne démarre pas.

---

## ⚡ Tests Rapides

### Test 1 : Configuration

```bash
# Vérifiez vos variables d'environnement
cat .env.local
```

Vous devriez voir :
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

### Test 2 : Diagnostic API

```bash
curl http://localhost:3000/api/health
```

Devrait retourner `"status": "healthy"`

### Test 3 : Base de Données

Dans Supabase SQL Editor :

```sql
-- Vérifier les rapports uploadés
SELECT id, original_filename, extraction_status, created_at
FROM systemage_reports
ORDER BY created_at DESC
LIMIT 5;

-- Vérifier s'il y a des systèmes extraits
SELECT COUNT(*) FROM body_systems;

-- Vérifier s'il y a des recommandations
SELECT COUNT(*) FROM recommendations;
```

---

## 🎯 Scénarios Possibles

### Scénario A : Tout est vert sur /diagnostic mais le dashboard est vide

**Cause** : Vous n'avez pas encore uploadé de rapport, ou l'extraction n'est pas terminée.

**Solution** :
1. Allez sur `/upload`
2. Uploadez un PDF
3. Attendez 60 secondes
4. Actualisez le dashboard (`F5`)

### Scénario B : Extraction bloquée sur "processing"

**Cause** : OpenAI prend du temps ou il y a une erreur.

**Solution** :
1. Vérifiez les logs du terminal
2. Vérifiez votre crédit OpenAI
3. Attendez 2-3 minutes (l'extraction peut prendre du temps)

### Scénario C : OpenAI en rouge sur /diagnostic

**Cause** : Clé API manquante ou invalide.

**Solution** :
1. Vérifiez `.env.local`
2. Obtenez une clé sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Ajoutez `OPENAI_API_KEY=sk-...`
4. Redémarrez le serveur :
```bash
# Ctrl+C pour arrêter
rm -rf .next
npm run dev
```

### Scénario D : Tables en rouge sur /diagnostic

**Cause** : Scripts SQL non exécutés.

**Solution** :
1. Allez sur Supabase > SQL Editor
2. Copiez le contenu de `supabase/migrations/001_create_systemage_schema.sql`
3. Exécutez (Run)
4. Répétez avec `002_create_users_and_profiles.sql`
5. Actualisez `/diagnostic`

---

## 📊 État Actuel du Système

D'après les logs, votre système est **partiellement fonctionnel** :

| Composant | État | Détails |
|-----------|------|---------|
| Next.js | ✅ | Tourne sur port 3000 |
| Authentification | ✅ | Login fonctionne |
| Upload | ✅ | Fichiers uploadés avec succès |
| Supabase Storage | ✅ | PDFs sauvegardés |
| Database Write | ✅ | Rapports créés |
| Extraction | ❓ | Déclenchée mais statut inconnu |
| OpenAI | ❓ | À vérifier sur /diagnostic |
| Dashboard | ❌ | Erreur 406 (aucun rapport trouvé) |

---

## 🔧 Prochaines Étapes

1. **MAINTENANT** : Allez sur **/diagnostic**
2. Prenez note de tout ce qui est rouge
3. Suivez les instructions données
4. Revenez me dire ce que vous voyez
5. On corrige ensemble ce qui manque

---

## 💬 Questions à Me Poser

Après avoir consulté `/diagnostic`, dites-moi :

1. Quelles cases sont rouges ❌ ?
2. Avez-vous exécuté les scripts SQL ?
3. Avez-vous une clé OpenAI valide ?
4. Y a-t-il des rapports dans la table `systemage_reports` de Supabase ?
5. Quel est le statut d'extraction de ces rapports (`pending`, `processing`, `completed`) ?

Avec ces infos, je pourrai vous aider précisément ! 🚀
