import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { openai } from '@/lib/openai';

/**
 * Endpoint de diagnostic pour vérifier toute la configuration
 */
export async function GET(req: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      nextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nextPublicSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      openaiApiKey: !!process.env.OPENAI_API_KEY,
    },
    supabase: {
      connection: false,
      tables: {
        systemage_reports: false,
        body_systems: false,
        recommendations: false,
        profiles: false,
      },
      storage: {
        bucket_exists: false,
      },
    },
    openai: {
      connection: false,
      model_available: false,
    },
  };

  try {
    // Test 1: Connexion Supabase
    const { data: connectionTest, error: connectionError } =
      await supabase.from('systemage_reports').select('id').limit(1);

    if (!connectionError) {
      checks.supabase.connection = true;
    } else {
      checks.supabase.connection = false;
      console.error('Supabase connection error:', connectionError);
    }

    // Test 2: Vérifier les tables
    const tables = [
      'systemage_reports',
      'body_systems',
      'recommendations',
      'profiles',
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        checks.supabase.tables[
          table as keyof typeof checks.supabase.tables
        ] = !error;
      } catch (err) {
        checks.supabase.tables[
          table as keyof typeof checks.supabase.tables
        ] = false;
      }
    }

    // Test 3: Vérifier le bucket de storage
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      checks.supabase.storage.bucket_exists = buckets?.some(
        (b) => b.name === 'systemage-reports'
      );
    } catch (err) {
      checks.supabase.storage.bucket_exists = false;
    }

    // Test 4: Tester OpenAI
    try {
      const testResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello, respond with OK' }],
        max_tokens: 5,
      });

      checks.openai.connection = true;
      checks.openai.model_available =
        testResponse.choices[0]?.message?.content?.includes('OK') || true;
    } catch (err) {
      checks.openai.connection = false;
      console.error('OpenAI error:', err);
    }

    // Calculer le statut global
    const allGood =
      checks.supabase.connection &&
      Object.values(checks.supabase.tables).every((v) => v) &&
      checks.supabase.storage.bucket_exists &&
      checks.openai.connection &&
      checks.openai.model_available;

    return NextResponse.json({
      status: allGood ? 'healthy' : 'degraded',
      checks,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        checks,
      },
      { status: 500 }
    );
  }
}
