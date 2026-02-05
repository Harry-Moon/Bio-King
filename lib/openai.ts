import OpenAI from 'openai';

/**
 * Configuration OpenAI
 * Note: Ce fichier doit UNIQUEMENT être importé dans des routes API ou Server Components
 * Ne jamais l'importer dans des composants clients !
 */

// Fonction pour obtenir l'instance OpenAI (lazy initialization)
let openaiInstance: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (!openaiInstance) {
    // Vérifier que nous sommes côté serveur
    if (typeof window !== 'undefined') {
      throw new Error(
        'OpenAI client can only be used on the server side. Do not import this in client components.'
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not defined in environment variables'
      );
    }

    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiInstance;
};

// Pour la rétrocompatibilité, exporter une instance
// IMPORTANT: N'utilisez ceci QUE dans les routes API ou Server Components
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAIClient();
    return (client as any)[prop];
  },
});

// Modèles disponibles
export const MODELS = {
  GPT4_VISION: 'gpt-4-vision-preview',
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
} as const;
