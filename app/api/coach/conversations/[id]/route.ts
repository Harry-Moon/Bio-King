import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';

/** GET /api/coach/conversations/[id] — fetch all messages for a conversation */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Verify ownership
    const { data: conv } = await supabaseAdmin
      .from('chat_conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('id, role, content, metadata, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: messages ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message?.includes('redirect')) throw error;
    console.error('[Coach conversations] GET [id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

/** DELETE /api/coach/conversations/[id] — delete a conversation and its messages */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('chat_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message?.includes('redirect')) throw error;
    console.error('[Coach conversations] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
