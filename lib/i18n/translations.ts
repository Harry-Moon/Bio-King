/**
 * Translations for English and French
 */

export type Language = 'en' | 'fr';

export const translations = {
  en: {
    // Common
    common: {
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      refresh: 'Refresh',
      years: 'years',
      year: 'year',
    },

    // Dashboard
    dashboard: {
      title: 'Your SystemAge Report',
      subtitle: 'Complete analysis of your biological age',
      overview: 'Overview',
      chronologicalAge: 'Chronological Age',
      biologicalAge: 'Biological Age',
      agingSpeed: 'Aging Speed',
      agingPhase: 'Aging Phase',
      topAgingFactors: 'Top 5 Aging Factors',
      topAgingFactorsDesc:
        'These systems are aging faster than your chronological age',
      systemsAnalysis: 'Analysis of 19 Body Systems',
      personalizedRecommendations: 'Personalized Recommendations',
      nutritional: 'Nutritional',
      fitness: 'Fitness',
      therapy: 'Therapy',
      noReportFound: 'No Report Found',
      reportNotFoundDesc:
        "You haven't uploaded any SystemAge report yet. Start by uploading your first report to see your complete analysis.",
      uploadFirstReport: 'Upload My First Report',
      analysisInProgress: 'Analysis in Progress...',
      analysisInProgressDesc: 'AI is extracting data from your report.',
      analysisInProgressTime: 'This may take 30-60 seconds.',
      reportNotFound: 'Report not found.',
      systemAgeComparison: 'SystemAge in Comparison',
      biologicalYears: 'biological years',
      realYears: 'real years',
      needAttention: 'Need attention',
      normal: 'Normal',
      good: 'Good',
      excellent: 'Excellent',
    },

    // Upload
    upload: {
      title: 'Upload Your Report',
      subtitle: 'Import your SystemAge report for complete analysis',
      dragHere: 'Drag your PDF here',
      dropHere: 'Drop your file here',
      clickToSelect: 'or click to select a file',
      pdfOnly: 'PDF only • Maximum 50MB',
      analyzeReport: 'Analyze Report',
      analysisInProgress: 'Analysis in progress...',
      extractionTime: 'AI data extraction (may take 30-60s)',
      analysisSuccess: 'Analysis successful!',
      redirecting: 'Redirecting to your dashboard...',
      uploadError: 'Upload error',
      retry: 'Retry',
      aboutAnalysis: 'About the Analysis',
      biomarkers400: 'Automatic extraction of 400+ biomarkers with AI',
      systems19: 'Analysis of 19 body systems',
      personalizedRecs: 'Personalized recommendations',
      interactiveViz: 'Interactive visualizations',
    },

    // Stages
    stages: {
      prime: 'Prime',
      plateau: 'Plateau',
      accelerated: 'Accelerated',
    },

    // Systems (body systems names)
    systems: {
      'Auditory System': 'Auditory System',
      'Muscular System': 'Muscular System',
      'Blood Sugar & Insulin Control': 'Blood Sugar & Insulin Control',
      Neurodegeneration: 'Neurodegeneration',
      'Skeletal System': 'Skeletal System',
      'Reproductive System': 'Reproductive System',
      'Cardiac System': 'Cardiac System',
      'Respiratory System': 'Respiratory System',
      'Digestive System': 'Digestive System',
      'Urinary System': 'Urinary System',
      'Hepatic System': 'Hepatic System',
      'Blood and Vascular System': 'Blood and Vascular System',
      'Immune System': 'Immune System',
      Metabolism: 'Metabolism',
      Oncogenesis: 'Oncogenesis',
      'Tissue Regeneration': 'Tissue Regeneration',
      'Fibrogenesis and Fibrosis': 'Fibrogenesis and Fibrosis',
      'Inflammatory Regulation': 'Inflammatory Regulation',
      'Brain Health and Cognition': 'Brain Health and Cognition',
    },
  },

  fr: {
    // Common
    common: {
      loading: 'Chargement',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      refresh: 'Actualiser',
      years: 'ans',
      year: 'an',
    },

    // Dashboard
    dashboard: {
      title: 'Votre Rapport SystemAge',
      subtitle: 'Analyse complète de votre âge biologique',
      overview: "Vue d'ensemble",
      chronologicalAge: 'Âge chronologique',
      biologicalAge: 'Âge biologique',
      agingSpeed: 'Vitesse de vieillissement',
      agingPhase: 'Phase de vieillissement',
      topAgingFactors: 'Top 5 Facteurs de Vieillissement',
      topAgingFactorsDesc:
        'Ces systèmes vieillissent plus rapidement que votre âge chronologique',
      systemsAnalysis: 'Analyse des 19 Systèmes Corporels',
      personalizedRecommendations: 'Recommandations Personnalisées',
      nutritional: 'Nutritionnel',
      fitness: 'Fitness',
      therapy: 'Thérapie',
      noReportFound: 'Aucun rapport trouvé',
      reportNotFoundDesc:
        "Vous n'avez pas encore uploadé de rapport SystemAge. Commencez par uploader votre premier rapport pour voir votre analyse complète.",
      uploadFirstReport: 'Uploader mon premier rapport',
      analysisInProgress: 'Analyse en cours...',
      analysisInProgressDesc: "L'IA extrait les données de votre rapport.",
      analysisInProgressTime: 'Cela peut prendre 30-60 secondes.',
      reportNotFound: 'Rapport introuvable.',
      systemAgeComparison: 'Comparaison SystemAge',
      biologicalYears: 'ans biologiques',
      realYears: 'ans réels',
      needAttention: 'Attention requise',
      normal: 'Normal',
      good: 'Bon',
      excellent: 'Excellent',
    },

    // Upload
    upload: {
      title: 'Télécharger votre rapport',
      subtitle: 'Importez votre rapport SystemAge pour une analyse complète',
      dragHere: 'Glissez votre PDF ici',
      dropHere: 'Déposez votre fichier ici',
      clickToSelect: 'ou cliquez pour sélectionner un fichier',
      pdfOnly: 'PDF uniquement • Maximum 50MB',
      analyzeReport: 'Analyser le rapport',
      analysisInProgress: 'Analyse en cours...',
      extractionTime: "Extraction des données avec l'IA (peut prendre 30-60s)",
      analysisSuccess: 'Analyse réussie !',
      redirecting: 'Redirection vers votre dashboard...',
      uploadError: "Erreur lors de l'upload",
      retry: 'Réessayer',
      aboutAnalysis: "À propos de l'analyse",
      biomarkers400: 'Extraction automatique de 400+ biomarqueurs avec IA',
      systems19: 'Analyse de 19 systèmes corporels',
      personalizedRecs: 'Recommandations personnalisées',
      interactiveViz: 'Visualisations interactives',
    },

    // Stages
    stages: {
      prime: 'Prime',
      plateau: 'Plateau',
      accelerated: 'Accéléré',
    },

    // Systems (body systems names in French)
    systems: {
      'Auditory System': 'Système Auditif',
      'Muscular System': 'Système Musculaire',
      'Blood Sugar & Insulin Control': 'Contrôle Glycémique & Insuline',
      Neurodegeneration: 'Neurodégénération',
      'Skeletal System': 'Système Squelettique',
      'Reproductive System': 'Système Reproductif',
      'Cardiac System': 'Système Cardiaque',
      'Respiratory System': 'Système Respiratoire',
      'Digestive System': 'Système Digestif',
      'Urinary System': 'Système Urinaire',
      'Hepatic System': 'Système Hépatique',
      'Blood and Vascular System': 'Système Sanguin et Vasculaire',
      'Immune System': 'Système Immunitaire',
      Metabolism: 'Métabolisme',
      Oncogenesis: 'Oncogenèse',
      'Tissue Regeneration': 'Régénération Tissulaire',
      'Fibrogenesis and Fibrosis': 'Fibrogénèse et Fibrose',
      'Inflammatory Regulation': 'Régulation Inflammatoire',
      'Brain Health and Cognition': 'Santé Cérébrale et Cognition',
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
