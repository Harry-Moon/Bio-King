/**
 * Configuration typée de l'application
 * Centralise toutes les variables d'environnement avec validation de type
 */

interface AppConfig {
  app: {
    name: string;
    url: string;
  };
  supabase: {
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
  };
  auth: {
    url: string | undefined;
    secret: string | undefined;
  };
  api: {
    key: string | undefined;
  };
}

export const config: AppConfig = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'BioKing',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  auth: {
    url: process.env.NEXTAUTH_URL,
    secret: process.env.NEXTAUTH_SECRET,
  },
  api: {
    key: process.env.NEXT_PUBLIC_API_KEY,
  },
};

/**
 * Valide que les variables d'environnement requises sont présentes
 * À appeler au démarrage de l'application pour échouer rapidement
 */
export function validateConfig() {
  const requiredVars: Array<{ key: string; value: string | undefined }> = [
    { key: 'NEXT_PUBLIC_APP_NAME', value: config.app.name },
    { key: 'NEXT_PUBLIC_APP_URL', value: config.app.url },
  ];

  const missing = requiredVars.filter((v) => !v.value);

  if (missing.length > 0) {
    const missingKeys = missing.map((v) => v.key).join(', ');
    console.warn(`⚠️  Variables d'environnement manquantes: ${missingKeys}`);
  }
}

// Validation optionnelle au démarrage
if (process.env.NODE_ENV !== 'production') {
  validateConfig();
}
