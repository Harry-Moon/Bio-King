import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';

/** GET /api/coach/conversations — list user's coach conversations */
export async function GET() {
  try {
    const user = await requireAuth();

    const { data, error } = await supabaseAdmin
      .from('chat_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ conversations: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message?.includes('redirect'))
      throw error;
    console.error('[Coach conversations] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
