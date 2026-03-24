# Documentation Technico-Fonctionnelle : Flow d'Extraction et Visualisation des Rapports SystemAge

## Vue d'ensemble

Ce document décrit le processus complet d'extraction et de visualisation des données depuis un rapport PDF SystemAge jusqu'à leur affichage dans l'interface utilisateur BioKing.

---

## 1. Architecture Générale

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend  │────▶│  Upload API  │────▶│ Supabase    │────▶│  Extract API │
│   (Upload)  │     │  /upload-pdf │     │  Storage    │     │ /extract-... │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Dashboard  │◀────│  Supabase   │◀────│ Validation  │◀────│   OpenAI     │
│  (Visualize)│     │  Database   │     │  & Mapping  │     │  Assistants  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

---

## 2. Phase 1 : Upload du PDF

### 2.1 Point d'entrée : Page `/upload`

**Fichier** : `app/upload/page.tsx`

**Fonctionnalités** :

- Interface drag-and-drop pour sélectionner un fichier PDF
- Validation côté client (type PDF, taille max 50MB)
- Affichage de l'état d'upload (idle, uploading, success, error)

**Composants utilisés** :

- `react-dropzone` pour la gestion du drag-and-drop
- `useAuth` pour récupérer l'utilisateur connecté

### 2.2 API Route : `/api/upload-pdf`

**Fichier** : `app/api/upload-pdf/route.ts`

**Processus détaillé** :

1. **Réception du fichier**

   ```typescript
   const formData = await request.formData();
   const file = formData.get('file') as File;
   const userId = formData.get('userId') as string;
   ```

2. **Validations**
   - Vérification du type de fichier (doit être PDF)
   - Vérification de la taille (max 50MB)
   - Vérification de la présence du userId

3. **Upload vers Supabase Storage**

   ```typescript
   const filePath = `${userId}/${uniqueFilename}`;
   await supabaseAdmin.storage
     .from('systemage-reports')
     .upload(filePath, buffer, {
       contentType: 'application/pdf',
       upsert: false,
     });
   ```

   - Le fichier est stocké dans le bucket `systemage-reports`
   - Structure : `{userId}/{timestamp}-{originalFilename}.pdf`

4. **Création de l'entrée dans la base de données**

   ```typescript
   await supabaseAdmin.from('systemage_reports').insert({
     user_id: userId,
     pdf_url: pdfUrl,
     chronological_age: 0, // Temporaire, sera rempli par l'extraction
     overall_system_age: 0,
     aging_rate: 0,
     aging_stage: 'Plateau',
     overall_bionoise: 0,
     extraction_status: 'pending', // ⚠️ Statut initial
   });
   ```

5. **Déclenchement asynchrone de l'extraction**
   ```typescript
   fetch('/api/extract-report', {
     method: 'POST',
     body: JSON.stringify({
       reportId: report.id,
       pdfUrl: pdfUrl,
       userId: userId,
     }),
   });
   ```

   - L'appel est **non-bloquant** (ne bloque pas la réponse à l'utilisateur)
   - L'extraction se fait en arrière-plan

**Réponse API** :

```json
{
  "success": true,
  "reportId": "uuid-du-rapport",
  "pdfUrl": "https://...",
  "message": "PDF uploaded successfully. Extraction started."
}
```

---

## 3. Phase 2 : Extraction des Données avec OpenAI

### 3.1 API Route : `/api/extract-report`

**Fichier** : `app/api/extract-report/route.ts`

**Processus détaillé** :

#### Étape 1 : Mise à jour du statut

```typescript
await supabaseAdmin
  .from('systemage_reports')
  .update({ extraction_status: 'processing' })
  .eq('id', reportId);
```

#### Étape 2 : Téléchargement du PDF depuis Storage

```typescript
const pdfBuffer = await downloadPdf(pdfUrl);
```

- Utilise `lib/utils/pdf.ts` pour télécharger le fichier depuis Supabase Storage
- Retourne un `Buffer` Node.js

#### Étape 3 : Extraction avec OpenAI Assistants API

**Fichier** : `lib/openai/assistants.ts`

**Processus OpenAI** :

1. **Upload du fichier vers OpenAI**

   ```typescript
   const pdfFile = new File([uint8Array], 'report.pdf', {
     type: 'application/pdf',
   });
   const file = await openai.files.create({
     file: pdfFile,
     purpose: 'assistants',
   });
   ```

2. **Création d'un Assistant temporaire**

   ```typescript
   const assistant = await openai.beta.assistants.create({
     name: 'SystemAge Report Extractor',
     instructions: `You are a specialized medical data extraction AI...`,
     model: 'gpt-4o',
     tools: [{ type: 'file_search' }],
   });
   ```

   - Modèle utilisé : **GPT-4o** (optimisé pour la vision et l'analyse de documents)
   - L'assistant est configuré pour extraire uniquement des données JSON

3. **Création d'un Thread avec le PDF**

   ```typescript
   const thread = await openai.beta.threads.create({
     messages: [
       {
         role: 'user',
         content: SYSTEMAGE_EXTRACTION_PROMPT,
         attachments: [
           {
             file_id: file.id,
             tools: [{ type: 'file_search' }],
           },
         ],
       },
     ],
   });
   ```

   - Le prompt d'extraction (`SYSTEMAGE_EXTRACTION_PROMPT`) est fourni dans `lib/prompts/extraction.ts`
   - Le PDF est attaché au thread via `file_id`

4. **Exécution de l'assistant**

   ```typescript
   const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
     assistant_id: assistant.id,
   });
   ```

   - `createAndPoll` attend la fin de l'exécution automatiquement
   - L'assistant lit le PDF, extrait les données selon le prompt

5. **Récupération de la réponse JSON**

   ````typescript
   const messages = await openai.beta.threads.messages.list(thread.id);
   const assistantMessage = messages.data.find(
     (msg) => msg.role === 'assistant'
   );
   let responseText = content.text.value;

   // Nettoyage des balises markdown si présentes
   if (responseText.includes('```json')) {
     const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
     responseText = jsonMatch[1].trim();
   }

   const extractedData: ExtractedSystemAgeData = JSON.parse(responseText);
   ````

6. **Nettoyage des ressources**
   ```typescript
   await openai.beta.assistants.delete(assistant.id);
   await openai.files.delete(file.id);
   ```

#### Étape 4 : Normalisation des données

**Données extraites par OpenAI** :

```typescript
interface ExtractedSystemAgeData {
  chronologicalAge: number;
  overallSystemAge: number;
  agingRate: number;
  agingStage: 'Prime' | 'Plateau' | 'Accelerated';
  overallBioNoise: number | null;
  bodySystems: Array<{
    systemName: string;
    systemAge: number;
    bioNoise: number | null;
    ageDifference: number;
    agingStage: 'Prime' | 'Plateau' | 'Accelerated';
    agingSpeed: number | null;
    percentileRank: number | null;
  }>;
  recommendations: {
    nutritional: Array<{...}>;
    fitness: Array<{...}>;
    therapy: Array<{...}>;
  };
  topAgingFactors: Array<{...}>;
}
```

**Normalisations effectuées** :

- Uniformisation des noms de systèmes (ex: "Blood Sugar and Insulin Control" → "Blood Sugar & Insulin Control")
- Calcul automatique de `ageDifference` si manquant : `systemAge - chronologicalAge`
- Inférence de `agingStage` si manquant :
  - `ageDifference < 0` → `'Prime'`
  - `ageDifference <= 3` → `'Plateau'`
  - `ageDifference > 3` → `'Accelerated'`
- Normalisation des valeurs numériques (conversion en Number, gestion des null)

#### Étape 5 : Validation des données

**Fichier** : `lib/validations/systemage.ts`

**Validations effectuées** :

- Vérification de la présence des 19 systèmes corporels obligatoires
- Vérification des plages de valeurs réalistes :
  - `chronologicalAge` : 0-150 ans
  - `systemAge` : 0-150 ans
  - `agingRate` : 0.5-2.0
- Vérification de la cohérence des calculs (`ageDifference = systemAge - chronologicalAge`)
- Vérification de la présence d'au moins quelques recommandations

**Calcul de la confiance** :

```typescript
const confidence = calculateExtractionConfidence(validatedData);
```

- Score de 0-100% basé sur :
  - Nombre de systèmes extraits (19 = 100%)
  - Présence de recommandations
  - Cohérence des valeurs numériques
  - Complétude des champs

#### Étape 6 : Sauvegarde dans Supabase

**3 tables mises à jour** :

1. **`systemage_reports`** (mise à jour)

   ```typescript
   await supabaseAdmin
     .from('systemage_reports')
     .update({
       chronological_age: validatedData.chronologicalAge,
       overall_system_age: validatedData.overallSystemAge,
       aging_rate: validatedData.agingRate,
       aging_stage: validatedData.agingStage,
       overall_bionoise: validatedData.overallBioNoise,
       extraction_status: 'completed', // ✅ Statut final
       extraction_confidence: confidence,
       raw_extraction_data: normalizedData, // JSON brut sauvegardé
     })
     .eq('id', reportId);
   ```

2. **`body_systems`** (insertion des 19 systèmes)

   ```typescript
   const bodySystems = validatedData.bodySystems.map((system) => ({
     report_id: reportId,
     system_name: system.systemName,
     system_age: system.systemAge,
     bionoise: system.bioNoise,
     age_difference: system.ageDifference,
     aging_stage: system.agingStage,
     aging_speed: system.agingSpeed ?? null,
     percentile_rank: system.percentileRank || null,
   }));

   await supabaseAdmin.from('body_systems').insert(bodySystems);
   ```

3. **`recommendations`** (insertion des recommandations)

   ```typescript
   const recommendations = [
     ...validatedData.recommendations.nutritional.map((rec) => ({
       report_id: reportId,
       type: 'nutritional',
       title: rec.title,
       description: rec.description,
       target_systems: rec.targetSystems,
       clinical_benefits: rec.clinicalBenefits,
     })),
     // ... fitness et therapy
   ];

   await supabaseAdmin.from('recommendations').insert(recommendations);
   ```

**Gestion des erreurs** :

- En cas d'erreur, le statut est mis à `'failed'`
- L'erreur est sauvegardée dans `raw_extraction_data`
- L'utilisateur peut réessayer l'extraction

---

## 4. Phase 3 : Visualisation dans le Dashboard

### 4.1 Point d'entrée : Page `/dashboard`

**Fichier** : `app/dashboard/page.tsx`

**Processus de chargement** :

#### Étape 1 : Récupération du rapport

```typescript
// Si reportId dans l'URL, charger ce rapport spécifique
// Sinon, charger le plus récent de l'utilisateur
const { data: reports } = await supabase
  .from('systemage_reports')
  .select('*')
  .eq('user_id', user.id)
  .order('upload_date', { ascending: false })
  .limit(1);
```

#### Étape 2 : Mapping des données Supabase → TypeScript

**Fichier** : `lib/utils/supabase-mappers.ts`

**Conversion snake_case → camelCase** :

```typescript
export function mapSupabaseReport(data: any): SystemAgeReport {
  return {
    id: data.id,
    userId: data.user_id, // snake_case → camelCase
    pdfUrl: data.pdf_url,
    uploadDate: new Date(data.upload_date),
    chronologicalAge: data.chronological_age,
    overallSystemAge: data.overall_system_age,
    agingRate: data.aging_rate,
    agingStage: data.aging_stage,
    // ...
  };
}
```

#### Étape 3 : Chargement des systèmes corporels et recommandations

```typescript
const [systemsResult, recsResult] = await Promise.all([
  supabase
    .from('body_systems')
    .select('*')
    .eq('report_id', reportId)
    .order('age_difference', { ascending: false }),
  supabase.from('recommendations').select('*').eq('report_id', reportId),
]);

const systems = systemsResult.data.map(mapSupabaseBodySystem);
const recommendations = recsResult.data.map(mapSupabaseRecommendation);
```

### 4.2 Composants de Visualisation

#### 4.2.1 Hero Card - Score Global

**Composant** : `components/dashboard/system-gauge.tsx`

**Affichage** :

- Score global d'âge systémique vs âge chronologique
- Jauge circulaire avec indicateur visuel
- Badge de stade de vieillissement (Prime/Plateau/Accelerated)
- Taux de vieillissement (`agingRate`)

#### 4.2.2 Cartes des Systèmes Corporels

**Composant** : `components/dashboard/system-card.tsx`

**Affichage pour chaque système** :

- Nom du système
- Âge du système vs âge chronologique
- Différence d'âge (`ageDifference`)
- Stade de vieillissement avec code couleur :
  - 🟢 **Prime** : système plus jeune que l'âge chronologique
  - 🟡 **Plateau** : système stable (±3 ans)
  - 🔴 **Accelerated** : système vieillissant rapidement (>3 ans)
- Vitesse de vieillissement (`agingSpeed`)
- Rang percentile (`percentileRank`)

**Tri** : Par `age_difference` décroissant (systèmes les plus problématiques en premier)

#### 4.2.3 Graphique de Comparaison

**Composant** : `components/dashboard/system-comparison-chart.tsx`

**Visualisation** :

- Graphique en barres comparant les 19 systèmes
- Axe X : Systèmes corporels
- Axe Y : Âge du système
- Ligne de référence : âge chronologique
- Code couleur selon le stade de vieillissement

#### 4.2.4 Courbe d'Entropie

**Composant** : `components/dashboard/entropy-curve.tsx`

**Visualisation** :

- Courbe montrant la relation entre âge chronologique et âge systémique
- Zones colorées pour les différents stades
- Point marquant la position actuelle de l'utilisateur

#### 4.2.5 Recommandations Personnalisées

**Composant** : `components/dashboard/recommendation-card.tsx`

**Affichage par type** :

- **Nutritional** : Suppléments, aliments recommandés
- **Fitness** : Exercices et activités physiques
- **Therapy** : Interventions thérapeutiques

**Pour chaque recommandation** :

- Titre
- Description détaillée
- Systèmes ciblés (badges)
- Bénéfices cliniques

#### 4.2.6 Top Aging Factors

**Affichage** :

- Liste des systèmes vieillissant le plus rapidement
- Raison du vieillissement accéléré
- Priorisation visuelle

#### 4.2.7 Informations du Dernier Upload

**Composant** : `components/dashboard/last-upload-info.tsx`

**Affichage** :

- Date du dernier upload
- Statut d'extraction (`pending`, `processing`, `completed`, `failed`)
- Score de confiance de l'extraction
- Bouton pour uploader un nouveau rapport

---

## 5. Gestion des États d'Extraction

### 5.1 Statuts possibles

| Statut       | Description                             | Action utilisateur                         |
| ------------ | --------------------------------------- | ------------------------------------------ |
| `pending`    | Upload réussi, extraction en attente    | Attendre ou vérifier les logs              |
| `processing` | Extraction en cours avec OpenAI         | Attendre (peut prendre 30-60 secondes)     |
| `completed`  | Extraction réussie, données disponibles | Consulter le dashboard                     |
| `failed`     | Erreur lors de l'extraction             | Réessayer l'upload ou contacter le support |

### 5.2 Polling du statut (optionnel)

**Route GET** : `/api/extract-report?reportId=xxx`

```typescript
const { data } = await fetch(`/api/extract-report?reportId=${reportId}`);
// Retourne : { reportId, status, confidence }
```

---

## 6. Structure des Données

### 6.1 Table `systemage_reports`

```sql
CREATE TABLE systemage_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pdf_url TEXT NOT NULL,
  chronological_age NUMERIC NOT NULL,
  overall_system_age NUMERIC NOT NULL,
  aging_rate NUMERIC NOT NULL,
  aging_stage TEXT CHECK (aging_stage IN ('Prime', 'Plateau', 'Accelerated')),
  overall_bionoise NUMERIC,
  extraction_status TEXT DEFAULT 'pending',
  extraction_confidence NUMERIC,
  raw_extraction_data JSONB, -- Données brutes extraites par OpenAI
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Table `body_systems`

```sql
CREATE TABLE body_systems (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES systemage_reports(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL,
  system_age NUMERIC NOT NULL,
  bionoise NUMERIC,
  age_difference NUMERIC NOT NULL,
  aging_stage TEXT CHECK (aging_stage IN ('Prime', 'Plateau', 'Accelerated')),
  aging_speed NUMERIC,
  percentile_rank NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Les 19 systèmes obligatoires** :

1. Auditory System
2. Muscular System
3. Blood Sugar & Insulin Control
4. Neurodegeneration
5. Skeletal System
6. Reproductive System
7. Cardiac System
8. Respiratory System
9. Digestive System
10. Urinary System
11. Hepatic System
12. Blood and Vascular System
13. Immune System
14. Metabolism
15. Oncogenesis
16. Tissue Regeneration
17. Fibrogenesis and Fibrosis
18. Inflammatory Regulation
19. Brain Health and Cognition

### 6.3 Table `recommendations`

```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES systemage_reports(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('nutritional', 'fitness', 'therapy')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_systems TEXT[] NOT NULL,
  clinical_benefits TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Prompt d'Extraction OpenAI

**Fichier** : `lib/prompts/extraction.ts`

**Structure du prompt** :

- Instructions précises sur le format JSON attendu
- Liste exhaustive des 19 systèmes à extraire
- Règles de calcul (ex: `ageDifference = systemAge - chronologicalAge`)
- Contraintes de qualité (valeurs réalistes, pas de 0 pour les valeurs manquantes)
- Format de sortie strict (JSON pur, pas de markdown)

**Points critiques** :

- Le prompt insiste sur l'extraction de **TOUS** les 19 systèmes
- Format JSON strict (pas de markdown, pas d'explications)
- Gestion des valeurs manquantes (utiliser `null`, pas `0`)

---

## 8. Sécurité et Performance

### 8.1 Sécurité

- **Authentification** : Seuls les utilisateurs authentifiés peuvent uploader
- **RLS (Row Level Security)** : Les utilisateurs ne voient que leurs propres rapports
- **Validation** : Toutes les données sont validées avant insertion
- **Nettoyage** : Les fichiers OpenAI sont supprimés après extraction

### 8.2 Performance

- **Upload asynchrone** : L'extraction ne bloque pas la réponse à l'utilisateur
- **Indexation** : Index sur `user_id`, `upload_date`, `report_id` pour des requêtes rapides
- **Caching** : Les données du dashboard sont chargées une fois et mises en cache côté client
- **Optimisation OpenAI** : Utilisation de `createAndPoll` pour éviter les polling manuels

---

## 9. Flux Complet Résumé

```
1. Utilisateur upload PDF → /api/upload-pdf
   ├─ Validation fichier
   ├─ Upload Supabase Storage
   ├─ Création entrée DB (status: 'pending')
   └─ Déclenchement extraction asynchrone

2. Extraction → /api/extract-report
   ├─ Mise à jour status: 'processing'
   ├─ Téléchargement PDF depuis Storage
   ├─ Upload vers OpenAI Files
   ├─ Création Assistant GPT-4o
   ├─ Exécution extraction
   ├─ Normalisation données
   ├─ Validation données
   ├─ Calcul confiance
   ├─ Sauvegarde DB (status: 'completed')
   └─ Nettoyage ressources OpenAI

3. Visualisation → /dashboard
   ├─ Chargement rapport (plus récent ou spécifique)
   ├─ Chargement systèmes corporels
   ├─ Chargement recommandations
   ├─ Mapping snake_case → camelCase
   └─ Affichage composants visuels
```

---

## 10. Points d'Attention et Limitations

### 10.1 Limitations actuelles

- **Taille PDF** : Maximum 50MB
- **Format** : Uniquement PDF (pas d'autres formats)
- **Temps d'extraction** : 30-60 secondes en moyenne (dépend d'OpenAI)
- **Coût OpenAI** : Chaque extraction consomme des tokens (GPT-4o)

### 10.2 Améliorations possibles

- **Retry automatique** : En cas d'échec, réessayer automatiquement
- **Webhooks** : Notifier l'utilisateur quand l'extraction est terminée
- **Cache** : Mettre en cache les données extraites pour éviter les re-extractions
- **Batch processing** : Traiter plusieurs rapports en parallèle
- **Compression PDF** : Optimiser la taille avant upload

---

## 11. Dépannage

### 11.1 Extraction échoue (`status: 'failed'`)

**Causes possibles** :

- PDF corrompu ou illisible
- Format PDF non standard
- Erreur OpenAI (rate limit, timeout)
- Erreur de validation des données

**Solutions** :

- Vérifier les logs dans `raw_extraction_data`
- Réessayer l'upload
- Vérifier que le PDF est bien un rapport SystemAge valide

### 11.2 Données incomplètes

**Vérifications** :

- Nombre de systèmes extraits (doit être 19)
- Score de confiance (`extraction_confidence`)
- Logs dans `raw_extraction_data`

**Solutions** :

- Si confiance < 70%, considérer ré-extraire
- Vérifier manuellement les données dans `raw_extraction_data`

### 11.3 Performance lente

**Optimisations** :

- Vérifier la taille du PDF (optimiser si > 10MB)
- Vérifier les index de la base de données
- Mettre en cache les données du dashboard

---

## 12. Tests et Validation

### 12.1 Tests à effectuer

1. **Upload** : Tester avec différents formats et tailles de PDF
2. **Extraction** : Vérifier que les 19 systèmes sont toujours extraits
3. **Validation** : Tester avec des données invalides (valeurs négatives, etc.)
4. **Visualisation** : Vérifier l'affichage correct de tous les composants

### 12.2 Données de test

- Utiliser un rapport SystemAge réel pour les tests
- Vérifier que les valeurs extraites correspondent aux valeurs du PDF
- Comparer les recommandations extraites avec celles du PDF

---

## Conclusion

Ce système permet une extraction automatisée et précise des données depuis les rapports SystemAge PDF, avec validation, normalisation et visualisation complète dans le dashboard BioKing. L'utilisation de l'API Assistants d'OpenAI garantit une extraction fiable et structurée des données complexes du rapport.
