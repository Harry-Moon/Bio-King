/**
 * Mappers pour convertir les données Supabase (snake_case) en types TypeScript (camelCase)
 */

import type {
  SystemAgeReport,
  BodySystem,
  Recommendation,
} from '@/lib/types/systemage';

/**
 * Convertit un rapport Supabase en SystemAgeReport
 */
export function mapSupabaseReport(data: any): SystemAgeReport {
  return {
    id: data.id,
    userId: data.user_id,
    pdfUrl: data.pdf_url,
    uploadDate: new Date(data.upload_date),
    chronologicalAge: data.chronological_age || 0,
    overallSystemAge: data.overall_system_age || 0,
    agingRate: data.aging_rate || 0,
    agingStage: data.aging_stage || 'Plateau',
    overallBioNoise: data.overall_bionoise || 0,
    extractionStatus: data.extraction_status || 'pending',
    extractionConfidence: data.extraction_confidence,
    rawExtractionData: data.raw_extraction_data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Convertit un système corporel Supabase en BodySystem
 */
export function mapSupabaseBodySystem(data: any): BodySystem {
  return {
    id: data.id,
    reportId: data.report_id,
    systemName: data.system_name,
    systemAge: data.system_age,
    bioNoise: data.bionoise,
    ageDifference: data.age_difference,
    agingStage: data.aging_stage,
    agingSpeed: data.aging_speed ?? null,
    percentileRank: data.percentile_rank,
    createdAt: new Date(data.created_at),
  };
}

/**
 * Convertit une recommandation Supabase en Recommendation
 */
export function mapSupabaseRecommendation(data: any): Recommendation {
  return {
    id: data.id,
    reportId: data.report_id,
    type: data.type,
    title: data.title,
    description: data.description,
    targetSystems: data.target_systems || [],
    clinicalBenefits: data.clinical_benefits,
    createdAt: new Date(data.created_at),
  };
}
