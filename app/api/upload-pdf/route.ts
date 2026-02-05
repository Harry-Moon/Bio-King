import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, STORAGE_BUCKETS } from '@/lib/supabase';
import { generateUniquePdfFilename, isPdfFile } from '@/lib/utils/pdf';

/**
 * API Route pour uploader un PDF de rapport SystemAge
 * POST /api/upload-pdf
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No userId provided' },
        { status: 400 }
      );
    }

    // Vérifier que c'est bien un PDF
    if (!isPdfFile(file.name)) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    console.log(`[Upload] Uploading PDF for user ${userId}: ${file.name}`);

    // Générer un nom de fichier unique
    const uniqueFilename = generateUniquePdfFilename(file.name);
    const filePath = `${userId}/${uniqueFilename}`;

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Uploader vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.SYSTEMAGE_REPORTS)
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKETS.SYSTEMAGE_REPORTS)
      .getPublicUrl(filePath);

    const pdfUrl = urlData.publicUrl;

    console.log(`[Upload] PDF uploaded successfully: ${pdfUrl}`);

    // Créer une entrée dans la table systemage_reports
    const { data: report, error: reportError } = await supabaseAdmin
      .from('systemage_reports')
      .insert({
        user_id: userId,
        pdf_url: pdfUrl,
        // Note: original_filename sera ajouté plus tard via migration
        chronological_age: 0, // Sera rempli par l'extraction
        overall_system_age: 0,
        aging_rate: 0,
        aging_stage: 'Plateau',
        overall_bionoise: 0,
        extraction_status: 'pending',
      })
      .select()
      .single();

    if (reportError) {
      console.error('[Upload] Database error:', reportError);
      throw new Error(`Failed to create report: ${reportError.message}`);
    }

    console.log(`[Upload] Report created with ID: ${report.id}`);

    // Déclencher l'extraction automatiquement
    console.log(`[Upload] Triggering extraction for report ${report.id}`);
    console.log(`[Upload] PDF URL: ${pdfUrl}`);
    console.log(`[Upload] User ID: ${userId}`);

    // Appel asynchrone à l'API d'extraction (ne pas attendre)
    const extractUrl = `${request.nextUrl.origin}/api/extract-report`;
    console.log(`[Upload] Extraction URL: ${extractUrl}`);

    fetch(extractUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: report.id,
        pdfUrl: pdfUrl,
        userId: userId,
      }),
    })
      .then((response) => {
        console.log(
          `[Upload] Extraction API response status: ${response.status}`
        );
        return response.json();
      })
      .then((data) => {
        console.log('[Upload] Extraction API response:', data);
      })
      .catch((error) => {
        console.error('[Upload] ❌ Failed to trigger extraction:', error);
        console.error('[Upload] Error details:', {
          message: error.message,
          stack: error.stack,
        });
      });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      pdfUrl: pdfUrl,
      message: 'PDF uploaded successfully. Extraction started.',
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
