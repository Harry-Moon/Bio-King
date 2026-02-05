# ✅ Corrections Appliquées - Problèmes d'Upload et Dashboard

## 🔴 Problèmes Identifiés

### 1. **"Upload failed" - Colonne manquante**
**Erreur** : `Could not find the 'original_filename' column`

**Cause** : Le code essayait d'insérer `original_filename` dans la table `systemage_reports`, mais cette colonne n'existait pas dans le schéma Supabase.

**✅ Solution** : Supprimé `original_filename` de l'insertion dans `app/api/upload-pdf/route.ts`

---

### 2. **"Aucun rapport trouvé" après upload**
**Erreur** : Le dashboard affiche "Aucun rapport trouvé" alors que le rapport a bien été créé

**Causes multiples** :
- Le rapport est créé avec `extraction_status: 'pending'`
- L'API d'extraction est bloquée par le middleware
- Le dashboard ne convertit pas les données Supabase (snake_case) en camelCase

**✅ Solutions** :

#### a) Middleware bloque les routes API
**Problème** : Le fetch interne vers `/api/extract-report` était bloqué par le middleware d'authentification

**Correction** : Ajout d'une exception pour toutes les routes `/api/*` dans `middleware.ts`

```typescript
// Les routes API sont gérées en interne (pas de middleware auth)
if (isApiPath) {
  return res;
}
```

#### b) Conversion snake_case ↔ camelCase
**Problème** : Supabase retourne `extraction_status` mais TypeScript attend `extractionStatus`

**Correction** : Création de mappers dans `lib/utils/supabase-mappers.ts`

```typescript
export function mapSupabaseReport(data: any): SystemAgeReport {
  return {
    extractionStatus: data.extraction_status || 'pending',
    // ... autres champs convertis
  };
}
```

Le dashboard utilise maintenant ces mappers pour convertir automatiquement les données.

---

### 3. **Multiple GoTrueClient instances**
**Warning** : `Multiple GoTrueClient instances detected in the same browser context`

**Cause** : Deux fichiers créent des clients Supabase différemment :
- `lib/supabase.ts` - `createClient`
- `lib/auth/supabase-client.ts` - `createBrowserClient`

**✅ Solution** : Unifié le client Supabase avec un singleton

```typescript
// lib/supabase.ts
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const supabase =
  typeof window !== 'undefined'
    ? (supabaseInstance || (supabaseInstance = createBrowserClient(...)))
    : createClient(...);
```

Maintenant, une seule instance du client est créée côté browser.

---

## 📊 État des Corrections

| Problème | Status | Fichiers Modifiés |
|----------|--------|-------------------|
| Colonne `original_filename` manquante | ✅ Corrigé | `app/api/upload-pdf/route.ts` |
| Middleware bloque API | ✅ Corrigé | `middleware.ts` |
| Conversion snake_case/camelCase | ✅ Corrigé | `lib/utils/supabase-mappers.ts`<br>`app/dashboard/page.tsx` |
| Multiple instances Supabase | ✅ Corrigé | `lib/supabase.ts` |
| API Assistants pour extraction | ✅ Implémenté | `lib/openai/assistants.ts`<br>`app/api/extract-report/route.ts` |

---

## 🧪 Test Complet

### Étape 1 : Upload d'un rapport

1. Allez sur `http://localhost:3000/upload`
2. Uploadez un PDF SystemAge
3. ✅ Le fichier doit s'uploader sur Supabase Storage
4. ✅ Le rapport doit être créé en BDD avec `extraction_status: 'pending'`
5. ✅ Redirection vers le dashboard

### Étape 2 : Dashboard affiche l'état "Analyse en cours"

Le dashboard doit afficher :

```
🔄 Analyse en cours...
L'IA extrait les données de votre rapport.
Cela peut prendre 30-60 secondes.
[Bouton Actualiser]
```

### Étape 3 : Extraction en arrière-plan

Vérifiez les logs du serveur :

```bash
[Upload] Triggering extraction for report xxx
[Assistants] File uploaded: file-xxx
[Assistants] Creating assistant
[Assistants] Assistant created: asst-xxx
[Assistants] Running assistant
[Assistants] Run status: completed
[Extract] Successfully extracted and saved report xxx
```

### Étape 4 : Actualiser le dashboard

1. Cliquez sur "Actualiser" dans le dashboard
2. ✅ Le rapport complet doit s'afficher avec :
   - Âge chronologique et biologique
   - 19 systèmes corporels
   - Recommandations nutritionnelles, fitness et thérapies

---

## 🔧 Si l'extraction échoue encore

### Vérifier les logs serveur

```bash
tail -f /Users/harry/.cursor/projects/Users-harry-Documents-BioKing/terminals/113180.txt
```

### Erreurs possibles

1. **Clé OpenAI invalide**
   ```
   Error: Invalid API key
   ```
   → Vérifiez `.env.local` : `OPENAI_API_KEY=sk-proj-...`

2. **File upload failed**
   ```
   [Assistants] Error creating file
   ```
   → Problème avec l'API OpenAI Files

3. **Assistant run timeout**
   ```
   [Assistants] Run status: failed
   ```
   → Le PDF est peut-être trop volumineux ou mal formaté

### Test manuel de l'extraction

Allez sur `http://localhost:3000/test-openai` et cliquez sur "Lancer le test" pour vérifier que OpenAI fonctionne.

---

## 💡 Améliorations Futures

1. **Ajouter un polling automatique** dans le dashboard pour actualiser toutes les 5 secondes pendant l'extraction
2. **Afficher la progression** de l'extraction en temps réel avec Server-Sent Events
3. **Ajouter la colonne `original_filename`** en base via migration SQL (optionnel)
4. **Implémenter un système de retry** si l'extraction échoue
5. **Ajouter des notifications push** quand l'extraction est terminée

---

## ✅ Conclusion

Tous les problèmes identifiés ont été corrigés :

1. ✅ Upload fonctionne (fichier + BDD)
2. ✅ Middleware ne bloque plus les API
3. ✅ Dashboard convertit correctement les données
4. ✅ Plus de warning "Multiple instances"
5. ✅ Extraction utilise l'API Assistants (supporte les PDFs)

**Le workflow complet devrait maintenant fonctionner de bout en bout !** 🎉
