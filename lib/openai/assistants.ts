import { getOpenAIClient } from '../openai';
import { SYSTEMAGE_EXTRACTION_PROMPT } from '../prompts/extraction';
import type { ExtractedSystemAgeData } from '../types/systemage';

/**
 * Extrait les données d'un rapport SystemAge en utilisant l'API Assistants d'OpenAI
 * L'API Assistants supporte nativement les fichiers PDF
 */
export async function extractSystemAgeDataWithAssistants(
  pdfBuffer: Buffer,
  pdfUrl: string
): Promise<ExtractedSystemAgeData> {
  const openai = getOpenAIClient();

  console.log('[Assistants] Creating file upload');
  
  // 1. Uploader le fichier vers OpenAI
  // Convertir le Buffer en Blob pour OpenAI (compatible Node.js et browser)
  const uint8Array = new Uint8Array(pdfBuffer);
  const pdfFile = new File([uint8Array], 'report.pdf', { type: 'application/pdf' });
  
  const file = await openai.files.create({
    file: pdfFile,
    purpose: 'assistants',
  });

  console.log(`[Assistants] File uploaded: ${file.id}`);

  try {
    // 2. Créer un assistant temporaire pour l'extraction
    console.log('[Assistants] Creating assistant');
    const assistant = await openai.beta.assistants.create({
      name: 'SystemAge Report Extractor',
      instructions: `You are a specialized medical data extraction AI. Your task is to extract biological aging data from SystemAge reports with MAXIMUM PRECISION.

CRITICAL RULES:
1. Extract ALL 19 body systems data (no exceptions)
2. Extract ALL recommendations (nutritional, fitness, therapy)
3. Calculate ageDifference = systemAge - chronologicalAge for each system
4. Return ONLY pure JSON (no markdown, no code blocks, no explanations)
5. Use null for missing numeric values (not 0)

The output MUST be valid JSON starting with { and ending with }`,
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
    });

    console.log(`[Assistants] Assistant created: ${assistant.id}`);

    // 3. Créer un thread avec le fichier
    console.log('[Assistants] Creating thread');
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: SYSTEMAGE_EXTRACTION_PROMPT,
          attachments: [
            {
              file_id: file.id,
              tools: [{ type: 'file_search' }],
            },
          ],
        },
      ],
    });

    console.log(`[Assistants] Thread created: ${thread.id}`);

    // 4. Exécuter l'assistant
    console.log('[Assistants] Running assistant');
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    console.log(`[Assistants] Run status: ${run.status}`);

    if (run.status !== 'completed') {
      throw new Error(`Assistant run failed with status: ${run.status}`);
    }

    // 5. Récupérer les messages
    console.log('[Assistants] Retrieving messages');
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find((msg) => msg.role === 'assistant');

    if (!assistantMessage || !assistantMessage.content[0]) {
      throw new Error('No response from assistant');
    }

    // 6. Extraire le contenu JSON
    const content = assistantMessage.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected content type from assistant');
    }

    console.log('[Assistants] Parsing response');
    let responseText = content.text.value;
    
    // Nettoyer les balises markdown si présentes
    // L'assistant peut retourner ```json ... ``` au lieu du JSON pur
    if (responseText.includes('```json')) {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        responseText = jsonMatch[1].trim();
      }
    } else if (responseText.includes('```')) {
      const jsonMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        responseText = jsonMatch[1].trim();
      }
    }
    
    console.log('[Assistants] Cleaned response length:', responseText.length);
    const extractedData: ExtractedSystemAgeData = JSON.parse(responseText);

    // 7. Nettoyage
    console.log('[Assistants] Cleaning up');
    await openai.beta.assistants.delete(assistant.id);
    await openai.files.delete(file.id);

    return extractedData;
  } catch (error) {
    // Nettoyer en cas d'erreur
    console.error('[Assistants] Error occurred, cleaning up');
    try {
      await openai.files.delete(file.id);
    } catch (cleanupError) {
      console.error('[Assistants] Cleanup failed:', cleanupError);
    }
    throw error;
  }
}
