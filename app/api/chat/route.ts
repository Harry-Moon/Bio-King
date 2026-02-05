import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase';
import { downloadPdf } from '@/lib/utils/pdf';

/**
 * API Route pour converser avec l'IA sur la base du rapport SystemAge
 * POST /api/chat
 * Body: { reportId: string, message: string, conversationId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, message, conversationId } = body;

    if (!reportId || !message) {
      return NextResponse.json(
        { error: 'Missing reportId or message' },
        { status: 400 }
      );
    }

    console.log(`[Chat] New message for report ${reportId}`);

    // 1. Récupérer le rapport
    const { data: report, error: reportError } = await supabaseAdmin
      .from('systemage_reports')
      .select('*, body_systems(*), recommendations(*)')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    console.log(`[Chat] Report found, PDF URL: ${report.pdf_url}`);

    // 2. Télécharger le PDF
    const pdfBuffer = await downloadPdf(report.pdf_url);

    // 3. Créer/récupérer la conversation
    let conversation;
    if (conversationId) {
      const { data: existingConv } = await supabaseAdmin
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = existingConv;
    }

    if (!conversation) {
      const { data: newConv } = await supabaseAdmin
        .from('chat_conversations')
        .insert({
          user_id: report.user_id,
          title: `Discussion sur le rapport du ${new Date(report.upload_date).toLocaleDateString()}`,
        })
        .select()
        .single();
      conversation = newConv;
    }

    console.log(`[Chat] Conversation ID: ${conversation.id}`);

    // 4. Sauvegarder le message utilisateur
    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: message,
    });

    // 5. Préparer le contexte du rapport
    const reportContext = `
RAPPORT SYSTEMAGE DE L'UTILISATEUR:

Âge chronologique: ${report.chronological_age} ans
Âge biologique global: ${report.overall_system_age} ans
Vitesse de vieillissement: ${report.aging_rate}x
Phase: ${report.aging_stage}
BioNoise global: ${report.overall_bionoise}

SYSTÈMES CORPORELS (${report.body_systems?.length || 0} systèmes):
${report.body_systems?.map((sys: any) => `- ${sys.system_name}: ${sys.system_age} ans (différence: ${sys.age_difference > 0 ? '+' : ''}${sys.age_difference} ans, stage: ${sys.aging_stage})`).join('\n') || 'Aucun système'}

RECOMMANDATIONS:
Nutritionnelles: ${report.recommendations?.filter((r: any) => r.type === 'nutritional').length || 0}
Fitness: ${report.recommendations?.filter((r: any) => r.type === 'fitness').length || 0}
Thérapies: ${report.recommendations?.filter((r: any) => r.type === 'therapy').length || 0}

${report.recommendations?.map((rec: any) => `[${rec.type.toUpperCase()}] ${rec.title}: ${rec.description || 'Pas de description'}`).join('\n\n') || 'Aucune recommandation'}
    `.trim();

    // 6. Uploader le PDF vers OpenAI (si pas déjà fait)
    const openai = getOpenAIClient();
    
    console.log('[Chat] Uploading PDF to OpenAI');
    const pdfFile = new File([new Uint8Array(pdfBuffer)], 'report.pdf', {
      type: 'application/pdf',
    });
    
    const file = await openai.files.create({
      file: pdfFile,
      purpose: 'assistants',
    });

    console.log(`[Chat] File uploaded: ${file.id}`);

    // 7. Créer un assistant pour la conversation
    const assistant = await openai.beta.assistants.create({
      name: 'SystemAge Health Advisor',
      instructions: `Tu es un conseiller en santé spécialisé dans l'analyse de l'âge biologique. Tu aides les utilisateurs à comprendre leur rapport SystemAge et à améliorer leur santé.

CONTEXTE DU RAPPORT:
${reportContext}

RÈGLES:
1. Réponds en français
2. Base-toi sur le rapport PDF et les données ci-dessus
3. Donne des conseils personnalisés basés sur les données du rapport
4. Si une donnée n'est pas dans le rapport, dis-le clairement
5. Sois empathique et encourageant
6. Cite des systèmes corporels spécifiques quand c'est pertinent
7. Explique les termes médicaux simplement`,
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
    });

    console.log(`[Chat] Assistant created: ${assistant.id}`);

    // 8. Créer un thread et envoyer le message
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: message,
          attachments: [
            {
              file_id: file.id,
              tools: [{ type: 'file_search' }],
            },
          ],
        },
      ],
    });

    console.log(`[Chat] Thread created: ${thread.id}`);

    // 9. Exécuter l'assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    console.log(`[Chat] Run status: ${run.status}`);

    if (run.status !== 'completed') {
      throw new Error(`Assistant run failed with status: ${run.status}`);
    }

    // 10. Récupérer la réponse
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find((msg) => msg.role === 'assistant');

    if (!assistantMessage || !assistantMessage.content[0]) {
      throw new Error('No response from assistant');
    }

    const content = assistantMessage.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected content type');
    }

    const aiResponse = content.text.value;

    // 11. Sauvegarder la réponse de l'IA
    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse,
      metadata: {
        assistant_id: assistant.id,
        thread_id: thread.id,
        file_id: file.id,
      },
    });

    // 12. Nettoyer
    await openai.beta.assistants.delete(assistant.id);
    await openai.files.delete(file.id);

    console.log('[Chat] Response generated successfully');

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      response: aiResponse,
    });
  } catch (error) {
    console.error('[Chat] Error:', error);
    return NextResponse.json(
      {
        error: 'Chat failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat?conversationId=xxx
 * Récupère l'historique d'une conversation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      );
    }

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[Chat] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    );
  }
}
