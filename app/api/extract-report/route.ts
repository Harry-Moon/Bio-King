import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { downloadPdf } from '@/lib/utils/pdf';
import {
  validateExtractedData,
  calculateExtractionConfidence,
} from '@/lib/validations/systemage';
import { extractSystemAgeDataWithAssistants } from '@/lib/openai/assistants';
import type { ExtractedSystemAgeData } from '@/lib/types/systemage';

/**
 * API Route pour extraire les données d'un rapport SystemAge avec GPT-4 Vision
 * POST /api/extract-report
 * Body: { reportId: string, pdfUrl: string }
 */
export async function POST(request: NextRequest) {
  let reportId: string | undefined;
  
  try {
    const body = await request.json();
    const { reportId: extractReportId, pdfUrl, userId } = body;
    reportId = extractReportId;

    if (!reportId || !pdfUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: reportId, pdfUrl, userId' },
        { status: 400 }
      );
    }

    console.log(`[Extract] Starting extraction for report ${reportId}`);

    // 1. Mettre à jour le status à "processing"
    await supabaseAdmin
      .from('systemage_reports')
      .update({ extraction_status: 'processing' })
      .eq('id', reportId);

    // 2. Télécharger le PDF
    console.log(`[Extract] Downloading PDF from ${pdfUrl}`);
    const pdfBuffer = await downloadPdf(pdfUrl);
    console.log(`[Extract] PDF downloaded: ${pdfBuffer.length} bytes`);

    // 3. Extraire les données avec l'API Assistants d'OpenAI
    console.log(`[Extract] Extracting data with OpenAI Assistants API`);
    const extractedData = await extractSystemAgeDataWithAssistants(
      pdfBuffer,
      pdfUrl
    );

    console.log(`[Extract] Data extracted successfully`);

    // 4. Normaliser les données extraites avant validation
    const normalizeSystemName = (name: string | undefined) => {
      if (!name) return name;
      const trimmed = name.replace(/\s*\(.*?\)\s*/g, '').trim();
      if (trimmed.toLowerCase() === 'blood sugar and insulin control') {
        return 'Blood Sugar & Insulin Control';
      }
      return trimmed;
    };

    const normalizeSystems = (systems: any[], chronologicalAge: number) =>
      systems.map((system) => {
        const systemAge = Number(system.systemAge ?? system.system_age ?? system.age);
        const ageDifference =
          system.ageDifference ??
          system.age_difference ??
          (Number.isFinite(systemAge)
            ? Number(systemAge) - Number(chronologicalAge)
            : 0);

        const inferredStage =
          ageDifference < 0
            ? 'Prime'
            : ageDifference <= 3
              ? 'Plateau'
              : 'Accelerated';

        return {
          systemName: normalizeSystemName(
            system.systemName ?? system.system_name ?? system.name
          ),
          systemAge,
          bioNoise: system.bioNoise ?? system.bio_noise ?? null,
          ageDifference,
          agingStage: system.agingStage ?? system.aging_stage ?? inferredStage,
          agingSpeed:
            system.agingSpeed ??
            system.aging_speed ??
            system.agingRate ??
            system.aging_rate ??
            null,
          percentileRank: system.percentileRank ?? system.percentile_rank ?? null,
        };
      });

    const normalizedData = {
      chronologicalAge:
        extractedData.chronologicalAge ??
        extractedData.chronological_age ??
        0,
      overallSystemAge:
        extractedData.overallSystemAge ??
        extractedData.overall_system_age ??
        0,
      agingRate: extractedData.agingRate ?? extractedData.aging_rate ?? 0,
      agingStage: extractedData.agingStage ?? extractedData.aging_stage ?? 'Plateau',
      overallBioNoise:
        extractedData.overallBioNoise ?? extractedData.overall_bionoise ?? null,
      bodySystems: normalizeSystems(
        extractedData.bodySystems ??
          extractedData.body_systems ??
          extractedData.systems ??
          [],
        extractedData.chronologicalAge ?? extractedData.chronological_age ?? 0
      ),
      recommendations: {
        nutritional:
          extractedData.recommendations?.nutritional ??
          extractedData.recommendations?.nutrition ??
          [],
        fitness:
          extractedData.recommendations?.fitness ??
          extractedData.recommendations?.exercise ??
          [],
        therapy:
          extractedData.recommendations?.therapy ??
          extractedData.recommendations?.therapies ??
          [],
      },
      topAgingFactors:
        extractedData.topAgingFactors ??
        extractedData.top_aging_factors ??
        [],
    };

    // 5. Valider les données extraites
    console.log(`[Extract] Validating extracted data`);
    const validatedData = validateExtractedData(normalizedData);

    // 5. Calculer la confiance de l'extraction
    const confidence = calculateExtractionConfidence(validatedData);
    console.log(`[Extract] Extraction confidence: ${confidence}%`);

    // 6. Sauvegarder dans Supabase
    console.log(`[Extract] Saving to database`);

    // Mettre à jour le rapport principal
    const { error: reportError } = await supabaseAdmin
      .from('systemage_reports')
      .update({
        chronological_age: validatedData.chronologicalAge,
        overall_system_age: validatedData.overallSystemAge,
        aging_rate: validatedData.agingRate,
        aging_stage: validatedData.agingStage,
        overall_bionoise: validatedData.overallBioNoise,
        extraction_status: 'completed',
        extraction_confidence: confidence,
        raw_extraction_data: normalizedData,
      })
      .eq('id', reportId);

    if (reportError) {
      throw new Error(`Failed to update report: ${reportError.message}`);
    }

    // Insérer les systèmes corporels
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

    const { error: systemsError } = await supabaseAdmin
      .from('body_systems')
      .insert(bodySystems);

    if (systemsError) {
      throw new Error(`Failed to insert body systems: ${systemsError.message}`);
    }

    // Insérer les recommandations
    const recommendations = [
      ...validatedData.recommendations.nutritional.map((rec) => ({
        report_id: reportId,
        type: 'nutritional' as const,
        title: rec.title,
        description: rec.description,
        target_systems: rec.targetSystems,
        clinical_benefits: rec.clinicalBenefits,
      })),
      ...validatedData.recommendations.fitness.map((rec) => ({
        report_id: reportId,
        type: 'fitness' as const,
        title: rec.title,
        description: rec.description,
        target_systems: rec.targetSystems,
        clinical_benefits: rec.clinicalBenefits,
      })),
      ...validatedData.recommendations.therapy.map((rec) => ({
        report_id: reportId,
        type: 'therapy' as const,
        title: rec.title,
        description: rec.description,
        target_systems: rec.targetSystems,
        clinical_benefits: rec.clinicalBenefits,
      })),
    ];

    if (recommendations.length > 0) {
      const { error: recsError } = await supabaseAdmin
        .from('recommendations')
        .insert(recommendations);

      if (recsError) {
        throw new Error(
          `Failed to insert recommendations: ${recsError.message}`
        );
      }
    }

    console.log(
      `[Extract] Successfully extracted and saved report ${reportId}`
    );

    return NextResponse.json({
      success: true,
      reportId,
      confidence,
      systemsCount: validatedData.bodySystems.length,
      recommendationsCount: recommendations.length,
    });
  } catch (error) {
    console.error('[Extract] Error:', error);

    // Mettre à jour le status à "failed" si on a un reportId
    if (reportId) {
      try {
        await supabaseAdmin
          .from('systemage_reports')
          .update({ 
            extraction_status: 'failed',
            raw_extraction_data: { 
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          })
          .eq('id', reportId);
      } catch (updateError) {
        console.error('[Extract] Failed to update report status:', updateError);
      }
    }

    return NextResponse.json(
      {
        error: 'Extraction failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/extract-report?reportId=xxx
 * Récupère le statut d'une extraction
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing reportId parameter' },
        { status: 400 }
      );
    }

    const { data: report, error } = await supabaseAdmin
      .from('systemage_reports')
      .select('extraction_status, extraction_confidence')
      .eq('id', reportId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      reportId,
      status: report.extraction_status,
      confidence: report.extraction_confidence,
    });
  } catch (error) {
    console.error('[Extract] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get extraction status' },
      { status: 500 }
    );
  }
}
