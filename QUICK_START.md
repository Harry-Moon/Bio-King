# 🚀 Démarrage Rapide - Phase 1

## ⚡ 5 Minutes pour commencer

### 1. Ajouter votre clé OpenAI

Éditer `.env.local` :

```bash
OPENAI_API_KEY=sk-...votre-clé...
```

### 2. Créer le bucket Supabase Storage

1. Aller sur https://supabase.com/dashboard/project/[VOTRE_PROJET]/storage/buckets
2. Cliquer "New bucket"
3. Nom : `systemage-reports`
4. Public : ✅ OUI
5. Cliquer "Create bucket"

### 3. Exécuter le script SQL

1. Aller sur https://supabase.com/dashboard/project/[VOTRE_PROJET]/sql/new
2. Copier tout le contenu de `supabase/migrations/001_create_systemage_schema.sql`
3. Coller et cliquer "Run"

### 4. Démarrer l'application

```bash
npm run dev
```

### 5. Tester !

1. Ouvrir http://localhost:3000/upload
2. Uploader votre PDF SystemAge
3. Attendre 30-60 secondes
4. Voir votre dashboard !

## 🎯 URLs importantes

- **Upload** : http://localhost:3000/upload
- **Dashboard** : http://localhost:3000/dashboard
- **API Upload** : http://localhost:3000/api/upload-pdf
- **API Extract** : http://localhost:3000/api/extract-report

## 📝 Notes

- Le PDF d'exemple est à la racine : `SystemAge Report.pdf`
- L'extraction prend 30-60 secondes (GPT-4 Vision)
- Le dashboard se rafraîchit automatiquement
- Budget OpenAI : ~0.01-0.02€ par rapport

## ❓ Problème ?

**Extraction bloquée sur "pending" ?**
→ Vérifier la clé OpenAI dans `.env.local`

**Erreur 404 sur le PDF ?**
→ Vérifier que le bucket `systemage-reports` est PUBLIC

**Dashboard vide ?**
→ Attendre que l'extraction soit complétée (status = "completed")

## 🎉 C'est tout !

Vous avez maintenant un système d'extraction automatique de rapports biologiques fonctionnel !
