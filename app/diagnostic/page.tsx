'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Brain,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'error';
  checks: {
    timestamp: string;
    environment: Record<string, boolean>;
    supabase: {
      connection: boolean;
      tables: Record<string, boolean>;
      storage: {
        bucket_exists: boolean;
      };
    };
    openai: {
      connection: boolean;
      model_available: boolean;
    };
  };
  error?: string;
}

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthCheck | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Vérification de la configuration...
          </p>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-muted-foreground">
            Impossible de charger les diagnostics
          </p>
        </div>
      </div>
    );
  }

  const allGood = health.status === 'healthy';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Diagnostic Système</h1>
          <p className="text-lg text-muted-foreground">
            Vérification de la configuration et des connexions
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Statut Global */}
      <div
        className={`rounded-xl border p-8 ${
          allGood
            ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
            : 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20'
        }`}
      >
        <div className="flex items-center gap-4">
          {allGood ? (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {allGood
                ? 'Tout fonctionne correctement !'
                : 'Configuration incomplète'}
            </h2>
            <p className="text-muted-foreground">
              {allGood
                ? "Tous les services sont opérationnels"
                : 'Certains services nécessitent votre attention'}
            </p>
          </div>
        </div>
      </div>

      {/* Variables d'Environnement */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <HardDrive className="h-6 w-6" />
          <h2 className="text-xl font-bold">Variables d&apos;Environnement</h2>
        </div>
        <div className="space-y-2">
          {Object.entries(health.checks.environment).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
            >
              <span className="font-mono text-sm">{key}</span>
              <StatusIcon status={value} />
            </div>
          ))}
        </div>
      </div>

      {/* Supabase */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-6 w-6" />
          <h2 className="text-xl font-bold">Supabase</h2>
        </div>

        {/* Connexion */}
        <div className="mb-4">
          <h3 className="mb-2 font-semibold">Connexion</h3>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span>Connexion à la base de données</span>
            <StatusIcon status={health.checks.supabase.connection} />
          </div>
        </div>

        {/* Tables */}
        <div className="mb-4">
          <h3 className="mb-2 font-semibold">Tables</h3>
          <div className="space-y-2">
            {Object.entries(health.checks.supabase.tables).map(
              ([table, exists]) => (
                <div
                  key={table}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <span className="font-mono text-sm">{table}</span>
                  <StatusIcon status={exists} />
                </div>
              )
            )}
          </div>
        </div>

        {/* Storage */}
        <div>
          <h3 className="mb-2 font-semibold">Storage</h3>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span>Bucket &quot;systemage-reports&quot;</span>
            <StatusIcon status={health.checks.supabase.storage.bucket_exists} />
          </div>
        </div>
      </div>

      {/* OpenAI */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-6 w-6" />
          <h2 className="text-xl font-bold">OpenAI</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span>Connexion API</span>
            <StatusIcon status={health.checks.openai.connection} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span>Modèle GPT-4o disponible</span>
            <StatusIcon status={health.checks.openai.model_available} />
          </div>
        </div>
      </div>

      {/* Erreurs */}
      {health.error && (
        <div className="rounded-xl border border-red-500/50 bg-red-50 p-6 dark:bg-red-950/20">
          <div className="mb-2 flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
              Erreur
            </h2>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-black/10 p-4 font-mono text-sm">
            {health.error}
          </pre>
        </div>
      )}

      {/* Actions Recommandées */}
      {!allGood && (
        <div className="rounded-xl border border-yellow-500/50 bg-yellow-50 p-6 dark:bg-yellow-950/20">
          <h2 className="mb-4 text-xl font-bold">Actions Recommandées</h2>
          <ul className="space-y-2 text-sm">
            {!health.checks.environment.openaiApiKey && (
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>
                  Ajouter votre clé OpenAI dans{' '}
                  <code className="rounded bg-black/10 px-2 py-1">
                    .env.local
                  </code>
                </span>
              </li>
            )}
            {!health.checks.supabase.tables.systemage_reports && (
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>
                  Exécuter le script SQL{' '}
                  <code className="rounded bg-black/10 px-2 py-1">
                    001_create_systemage_schema.sql
                  </code>{' '}
                  dans Supabase
                </span>
              </li>
            )}
            {!health.checks.supabase.tables.profiles && (
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>
                  Exécuter le script SQL{' '}
                  <code className="rounded bg-black/10 px-2 py-1">
                    002_create_users_and_profiles.sql
                  </code>{' '}
                  dans Supabase
                </span>
              </li>
            )}
            {!health.checks.supabase.storage.bucket_exists && (
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>
                  Créer le bucket{' '}
                  <code className="rounded bg-black/10 px-2 py-1">
                    systemage-reports
                  </code>{' '}
                  (PUBLIC) dans Supabase Storage
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-center text-sm text-muted-foreground">
        Dernière vérification : {new Date(health.checks.timestamp).toLocaleString('fr-FR')}
      </div>
    </div>
  );
}
