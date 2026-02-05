import { z } from 'zod';
import { BODY_SYSTEMS } from '@/lib/types/systemage';

/**
 * Schémas de validation Zod pour l'extraction des rapports SystemAge
 */

// Schéma pour un système corporel extrait
export const ExtractedBodySystemSchema = z.object({
  systemName: z.string(),
  systemAge: z.number(),
  bioNoise: z.number().nullable().optional(),
  ageDifference: z.number().optional(),
  agingStage: z.enum(['Prime', 'Plateau', 'Accelerated']).optional(),
  agingSpeed: z.number().nullable().optional(),
  percentileRank: z.number().nullable().optional(),
});

// Schéma pour une recommandation extraite
export const ExtractedRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  targetSystems: z.array(z.string()),
  clinicalBenefits: z.string(),
});

// Schéma pour un facteur d'âge top
export const TopAgingFactorSchema = z.object({
  systemName: z.string(),
  systemAge: z.number(),
  reason: z.string(),
});

// Schéma principal pour les données extraites
export const ExtractedSystemAgeDataSchema = z.object({
  chronologicalAge: z.number().positive(),
  overallSystemAge: z.number().positive(),
  agingRate: z.number().positive(),
  agingStage: z.enum(['Prime', 'Plateau', 'Accelerated']),
  overallBioNoise: z.number().nullable().optional(),
  bodySystems: z.array(ExtractedBodySystemSchema),
  recommendations: z.object({
    nutritional: z.array(ExtractedRecommendationSchema),
    fitness: z.array(ExtractedRecommendationSchema),
    therapy: z.array(ExtractedRecommendationSchema),
  }),
  topAgingFactors: z.array(TopAgingFactorSchema).optional(),
});

// Type inféré depuis le schéma
export type ValidatedExtractedData = z.infer<
  typeof ExtractedSystemAgeDataSchema
>;

// Fonction de validation avec messages d'erreur détaillés
export function validateExtractedData(data: unknown): ValidatedExtractedData {
  try {
    return ExtractedSystemAgeDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

// Fonction pour vérifier que tous les systèmes requis sont présents
export function checkAllSystemsPresent(
  systems: { systemName: string }[]
): boolean {
  const extractedSystemNames = new Set(systems.map((s) => s.systemName));
  return BODY_SYSTEMS.every((requiredSystem) =>
    extractedSystemNames.has(requiredSystem)
  );
}

// Fonction pour calculer la confiance de l'extraction
export function calculateExtractionConfidence(
  data: ValidatedExtractedData
): number {
  let confidence = 100;

  // Pénalité si des systèmes ont des valeurs nulles
  const systemsWithNullBioNoise = data.bodySystems.filter(
    (s) => s.bioNoise === null
  ).length;
  confidence -= systemsWithNullBioNoise * 2;

  // Pénalité si peu de recommandations
  const totalRecommendations =
    data.recommendations.nutritional.length +
    data.recommendations.fitness.length +
    data.recommendations.therapy.length;
  if (totalRecommendations === 0) confidence -= 20;
  else if (totalRecommendations < 3) confidence -= 10;

  // Pénalité si les valeurs semblent incohérentes
  const systemAgesInRange = data.bodySystems.filter(
    (s) => s.systemAge > 0 && s.systemAge < 150
  ).length;
  if (systemAgesInRange < 19) confidence -= 30;

  return Math.max(0, Math.min(100, confidence));
}
