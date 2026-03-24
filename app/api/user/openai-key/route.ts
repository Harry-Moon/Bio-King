import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/user/openai-key
 * Returns whether the user has an OpenAI API key configured (without exposing the key).
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const { data } = await supabaseAdmin
      .from('profiles')
      .select('openai_api_key')
      .eq('id', user.id)
      .single();

    const hasApiKey = Boolean(data?.openai_api_key?.trim());
    return NextResponse.json({ hasApiKey });
  } catch (error) {
    if (error instanceof Error && error.message?.includes('redirect')) {
      throw error;
    }
    return NextResponse.json({ hasApiKey: false }, { status: 500 });
  }
}

/**
 * PUT /api/user/openai-key
 * Update the user's OpenAI API key in their profile.
 * Body: { openaiApiKey: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { openaiApiKey } = body;

    if (typeof openaiApiKey !== 'string') {
      return NextResponse.json(
        { error: 'openaiApiKey must be a string' },
        { status: 400 }
      );
    }

    const trimmed = openaiApiKey.trim();
    // Allow empty string to clear the key
    if (trimmed.length > 0 && !trimmed.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ openai_api_key: trimmed || null })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message?.includes('redirect')) {
      throw error;
    }
    console.error('[OpenAI Key] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update API key',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
