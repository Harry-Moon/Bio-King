import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import { getAllProducts } from '@/lib/data/marketplace-products-db';
import { getAllArticles } from '@/lib/data/learn-articles-db';
import {
  mapSupabaseReport,
  mapSupabaseBodySystem,
  mapSupabaseRecommendation,
} from '@/lib/utils/supabase-mappers';

/**
 * Builds the ecosystem context for the Coach AI from user data, marketplace, and learn.
 */
async function buildEcosystemContext(userId: string) {
  const sections: string[] = [];

  // 1. User profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, email, chronological_age, date_of_birth')
    .eq('id', userId)
    .single();

  if (profile) {
    sections.push(`## PROFIL UTILISATEUR
- Nom: ${profile.first_name || ''} ${profile.last_name || ''}
- Email: ${profile.email || 'Non renseigné'}
- Âge chronologique (profil): ${profile.chronological_age ?? 'Non renseigné'}
- Date de naissance: ${profile.date_of_birth ?? 'Non renseignée'}`);
  }

  // 2. Latest SystemAge report
  const { data: reports } = await supabaseAdmin
    .from('systemage_reports')
    .select('*')
    .eq('user_id', userId)
    .eq('extraction_status', 'completed')
    .order('upload_date', { ascending: false })
    .limit(1);

  if (reports && reports.length > 0) {
    const report = mapSupabaseReport(reports[0]);
    const [systemsRes, recsRes] = await Promise.all([
      supabaseAdmin
        .from('body_systems')
        .select('*')
        .eq('report_id', report.id)
        .order('age_difference', { ascending: false }),
      supabaseAdmin
        .from('recommendations')
        .select('*')
        .eq('report_id', report.id),
    ]);

    const systems = (systemsRes.data || []).map(mapSupabaseBodySystem);
    const recommendations = (recsRes.data || []).map(mapSupabaseRecommendation);

    sections.push(`## RAPPORT SYSTEMAGE (dernier upload: ${report.uploadDate.toLocaleDateString()})
- Âge chronologique: ${report.chronologicalAge} ans
- Âge biologique global: ${report.overallSystemAge?.toFixed(1) ?? 'N/A'} ans
- Vitesse de vieillissement: ${report.agingRate?.toFixed(2) ?? 'N/A'}x
- Phase: ${report.agingStage}
- BioNoise global: ${report.overallBioNoise ?? 'N/A'}

### Systèmes corporels (top 10 par différence d'âge)
${
  systems
    .slice(0, 10)
    .map(
      (s) =>
        `- ${s.systemName}: ${s.systemAge?.toFixed(1)} ans (écart: ${s.ageDifference > 0 ? '+' : ''}${s.ageDifference?.toFixed(1)} ans, stage: ${s.agingStage})`
    )
    .join('\n') || 'Aucun'
}

### Recommandations personnalisées
${recommendations.map((r) => `[${r.type.toUpperCase()}] ${r.title}: ${r.description || 'Pas de description'}`).join('\n\n') || 'Aucune'}`);
  } else {
    sections.push(`## RAPPORT SYSTEMAGE
Aucun rapport SystemAge complété. L'utilisateur n'a pas encore uploadé de rapport ou l'extraction n'est pas terminée.`);
  }

  // 3. Marketplace products (summary)
  const products = await getAllProducts();
  const productSummary = products
    .slice(0, 30)
    .map(
      (p) =>
        `- ${p.name} (${p.category}, ${p.type}): ${p.description?.slice(0, 120)}...`
    )
    .join('\n');

  sections.push(`## MARKETPLACE BIOKING (produits disponibles)
${productSummary || 'Aucun produit actif.'}`);

  // 4. Learn articles (summary)
  const articles = await getAllArticles();
  const articleSummary = articles
    .slice(0, 20)
    .map(
      (a) =>
        `- ${a.title} (${a.contentType}, ${a.level}): ${a.excerpt?.slice(0, 100)}... Thèmes: ${a.themes?.join(', ') || 'N/A'}`
    )
    .join('\n');

  sections.push(`## SECTION LEARN (articles et protocoles)
${articleSummary || 'Aucun article actif.'}`);

  return sections.join('\n\n');
}

/**
 * POST /api/coach
 * Chat with the BioKing Coach AI.
 * Body: { message, conversationId?, conversationHistory?, additionalContext? }
 * Returns: { success, response, conversationId }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const {
      message,
      conversationId: incomingConversationId,
      conversationHistory = [],
      additionalContext = '',
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid message' },
        { status: 400 }
      );
    }

    const ecosystemContext = await buildEcosystemContext(user.id);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const userContextBlock =
      typeof additionalContext === 'string' && additionalContext.trim()
        ? `\n\n## CONTEXTE SUPPLÉMENTAIRE FOURNI PAR L'UTILISATEUR\n${additionalContext.trim()}`
        : '';

    const systemPrompt = `Tu es le Coach BioKing, un assistant IA spécialisé en santé, longévité et biohacking. Tu aides l'utilisateur à comprendre ses données SystemAge, à choisir des produits du marketplace et à exploiter les articles Learn.

Tu as accès à un écosystème mutualisé contenant:
1. Le profil de l'utilisateur
2. Son dernier rapport SystemAge (systèmes corporels, recommandations)
3. Les produits du marketplace BioKing
4. Les articles et protocoles de la section Learn

RÈGLES:
1. Réponds toujours en français
2. Base-toi sur les données fournies ci-dessous pour personnaliser tes réponses
3. Recommande des produits du marketplace ou des articles Learn quand c'est pertinent
4. Explique les termes médicaux simplement
5. Sois empathique et encourageant
6. Si une donnée n'est pas disponible, dis-le clairement
7. Ne invente jamais de données - utilise uniquement le contexte fourni
8. Quand tu cites une donnée de santé spécifique corrélée à ta réponse (ex: un système corporel, un biomarqueur, une métrique), ajoute à la fin de ta réponse une balise sur sa propre ligne au format: [DONNEE:Nom de la donnée:Valeur]. N'ajoute qu'une seule balise par réponse, uniquement pour la donnée la plus pertinente.

CONTEXTE ÉCOSYSTÈME:
${ecosystemContext}${userContextBlock}`;

    const history = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-10)
      : [];
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(
        (m: { role: string; content: string }) =>
          ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          }) as OpenAI.Chat.ChatCompletionMessageParam
      ),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content?.trim() ||
      "Désolé, je n'ai pas pu générer de réponse.";

    // Persist conversation and messages
    let conversationId = incomingConversationId ?? null;

    if (!conversationId) {
      const title =
        message.trim().slice(0, 60) + (message.trim().length > 60 ? '…' : '');
      const { data: newConv } = await supabaseAdmin
        .from('chat_conversations')
        .insert({ user_id: user.id, title })
        .select('id')
        .single();
      conversationId = newConv?.id ?? null;
    } else {
      // Touch updated_at so list ordering stays fresh
      await supabaseAdmin
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', user.id);
    }

    if (conversationId) {
      await supabaseAdmin.from('chat_messages').insert([
        { conversation_id: conversationId, role: 'user', content: message },
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantMessage,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      response: assistantMessage,
      conversationId,
    });
  } catch (error) {
    if (error instanceof Error && error.message?.includes('redirect')) {
      throw error;
    }
    console.error('[Coach] Error:', error);
    return NextResponse.json(
      {
        error: 'Chat failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
