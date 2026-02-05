import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { openai, MODELS } from '@/lib/openai';

/**
 * Endpoint de test pour vérifier l'extraction OpenAI
 * GET /api/test-extraction?reportId=xxx
 */
export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get('reportId');

  try {
    console.log('\n🧪 === TEST EXTRACTION START ===');
    console.log('[Test] Report ID:', reportId);

    // Test 1: Variables d'environnement
    console.log('\n📋 Test 1: Environment Variables');
    const checks = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_API_KEY_PREFIX: process.env.OPENAI_API_KEY?.substring(0, 7),
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    console.log('[Test] Environment checks:', checks);

    if (!checks.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Test 2: Connexion OpenAI basique
    console.log('\n🤖 Test 2: OpenAI Basic Connection');
    try {
      const testResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Say "OK"' }],
        max_tokens: 5,
      });

      console.log('[Test] OpenAI response:', testResponse.choices[0].message);
      console.log('[Test] ✅ OpenAI connection successful');
    } catch (openaiError) {
      console.error('[Test] ❌ OpenAI connection failed:', openaiError);
      throw openaiError;
    }

    // Test 3: Si reportId fourni, tester l'extraction réelle
    if (reportId) {
      console.log('\n📄 Test 3: Report Extraction');

      // Récupérer le rapport
      const { data: report, error: reportError } = await supabaseAdmin
        .from('systemage_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        throw new Error(`Report not found: ${reportError?.message}`);
      }

      console.log('[Test] Report found:', {
        id: report.id,
        pdf_url: report.pdf_url,
        status: report.extraction_status,
      });

      // Vérifier l'URL du PDF
      console.log('\n🔗 Test 4: PDF URL Check');
      try {
        const pdfResponse = await fetch(report.pdf_url, { method: 'HEAD' });
        console.log('[Test] PDF accessible:', pdfResponse.ok);
        console.log(
          '[Test] PDF size:',
          pdfResponse.headers.get('content-length')
        );
      } catch (fetchError) {
        console.error('[Test] ❌ PDF not accessible:', fetchError);
        throw new Error('PDF URL is not accessible');
      }

      // Test d'appel à l'extraction
      console.log('\n🚀 Test 5: Trigger Extraction API');
      const extractUrl = `${req.nextUrl.origin}/api/extract-report`;
      console.log('[Test] Extraction URL:', extractUrl);

      try {
        const extractResponse = await fetch(extractUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportId: report.id,
            pdfUrl: report.pdf_url,
            userId: report.user_id,
          }),
        });

        const extractData = await extractResponse.json();
        console.log(
          '[Test] Extraction API response status:',
          extractResponse.status
        );
        console.log('[Test] Extraction API response:', extractData);

        if (!extractResponse.ok) {
          throw new Error(
            `Extraction API failed: ${extractResponse.status} - ${JSON.stringify(extractData)}`
          );
        }

        console.log('[Test] ✅ Extraction triggered successfully');
      } catch (extractError) {
        console.error('[Test] ❌ Extraction API failed:', extractError);
        throw extractError;
      }
    }

    console.log('\n✅ === TEST EXTRACTION COMPLETE ===\n');

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      checks,
      reportId,
    });
  } catch (error) {
    console.error('\n❌ === TEST EXTRACTION FAILED ===');
    console.error('[Test] Error:', error);
    console.error('=====================================\n');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
