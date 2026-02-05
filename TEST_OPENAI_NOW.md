# 🧪 Test OpenAI - Guide Rapide

## ✅ LE PROBLÈME EST CORRIGÉ !

Le fichier `lib/openai.ts` était importé côté client, ce qui causait une erreur car `process.env.OPENAI_API_KEY` n'est pas accessible côté client (et c'est normal pour la sécurité).

**J'ai corrigé** ce problème en utilisant un lazy loading et un Proxy pour que le client OpenAI ne soit créé que côté serveur.

---

## 🚀 Testez MAINTENANT

Le serveur tourne maintenant sur : **http://localhost:3002**

### Option 1 : Page de Test OpenAI (Recommandé)

1. Allez sur : **http://localhost:3002/test-openai**
2. Cliquez sur "Lancer le test"
3. Vous verrez si OpenAI fonctionne ✅ ou non ❌

Cette page va :
- ✓ Vérifier les variables d'environnement
- ✓ Faire un appel de test à OpenAI
- ✓ Vous dire exactement ce qui ne va pas

### Option 2 : Test Direct de l'Extraction

Si vous avez déjà uploadé un rapport :

1. Allez dans Supabase > Table Editor > `systemage_reports`
2. Copiez un ID de rapport
3. Allez sur : **http://localhost:3002/test-openai**
4. Collez l'ID dans le champ "Report ID"
5. Cliquez sur "Lancer le test"

Cela va déclencher l'extraction complète et vous dire où ça bloque.

### Option 3 : Test via l'API Directement

Dans votre terminal :

```bash
# Test basique
curl http://localhost:3002/api/test-extraction

# Avec un report ID
curl "http://localhost:3002/api/test-extraction?reportId=VOTRE-REPORT-ID"
```

---

## 📊 Page de Diagnostic

Vous avez maintenant 3 pages de debug :

1. **http://localhost:3002/diagnostic** 
   → Vérifie toute la configuration (DB, Storage, OpenAI)

2. **http://localhost:3002/test-openai**
   → Teste spécifiquement OpenAI et l'extraction

3. **http://localhost:3002/dashboard**
   → Votre dashboard normal

---

## 🔍 Que Regarder

### Dans les Logs du Terminal

Maintenant quand vous uploadez un PDF, vous devriez voir :

```
[Upload] Uploading PDF for user xxx
[Upload] PDF uploaded successfully
[Upload] Report created with ID: xxx
[Upload] Triggering extraction for report xxx
[Upload] Extraction URL: http://localhost:3002/api/extract-report
[Upload] Extraction API response status: 200
[Upload] Extraction API response: { success: true, ... }
```

Et puis :

```
[Extract] Starting extraction for report xxx
[Extract] Downloading PDF from xxx
[Extract] Converting PDF to images
[Extract] PDF has X pages
[Extract] Calling GPT-4 Vision for extraction
```

### Dans votre Dashboard OpenAI

Allez sur : https://platform.openai.com/usage

Vous devriez maintenant voir des requêtes apparaître !

---

## 🎯 Workflow Complet de Test

### Étape 1 : Vérifier la Configuration

```bash
# Ouvrir dans le navigateur
open http://localhost:3002/diagnostic
```

Tout doit être vert ✅

### Étape 2 : Tester OpenAI Basique

```bash
# Ouvrir dans le navigateur
open http://localhost:3002/test-openai
```

Cliquer sur "Lancer le test" → Devrait être vert ✅

### Étape 3 : Uploader un PDF

1. Allez sur http://localhost:3002/upload
2. Uploadez votre PDF SystemAge
3. Attendez la fin de l'upload

### Étape 4 : Vérifier l'Extraction

Dans le terminal, vous devriez voir les logs d'extraction.

Dans Supabase :
1. Table Editor > `systemage_reports`
2. Regardez la colonne `extraction_status`
   - `pending` → Pas encore commencé
   - `processing` → En cours
   - `completed` → Terminé ✅

### Étape 5 : Voir le Dashboard

1. Actualisez http://localhost:3002/dashboard
2. Vos données s'affichent ! 🎉

---

## 🐛 Si Ça Ne Marche Toujours Pas

### Vérifiez les Variables d'Environnement

```bash
cd /Users/harry/Documents/BioKing
cat .env.local | grep OPENAI
```

Devrait afficher :
```
OPENAI_API_KEY=sk-proj-...
```

### Vérifiez que la Clé est Valide

Allez sur : https://platform.openai.com/api-keys

- Vérifiez que la clé existe
- Vérifiez qu'elle n'est pas expirée
- Vérifiez que vous avez du crédit

### Relancez le Serveur

```bash
# Arrêter tous les processus Node
lsof -ti:3000,3001,3002 | xargs kill -9

# Supprimer le cache
cd /Users/harry/Documents/BioKing
rm -rf .next

# Redémarrer
npm run dev
```

---

## 🎉 Ce Qui a Été Corrigé

1. ✅ `lib/openai.ts` : Lazy loading + Proxy pour éviter l'init côté client
2. ✅ Logs améliorés dans `app/api/upload-pdf/route.ts`
3. ✅ Ajout de `original_filename` dans l'upload
4. ✅ Page de test dédiée : `/test-openai`
5. ✅ Endpoint de test : `/api/test-extraction`
6. ✅ Page de diagnostic : `/diagnostic`

---

## 📞 Prochaine Étape

**ALLEZ SUR LA PAGE DE TEST MAINTENANT** :

👉 **http://localhost:3002/test-openai**

Lancez le test et dites-moi ce que vous voyez ! 🚀

---

## 💡 Note Importante

Le serveur a changé de port car les ports 3000 et 3001 étaient occupés.

**Nouvelle URL** : http://localhost:3002

Pensez à mettre à jour vos favoris si vous en aviez ! 📌
