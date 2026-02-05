'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Play } from 'lucide-react';

export default function TestOpenAIPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [reportId, setReportId] = useState('');

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const url = reportId
        ? `/api/test-extraction?reportId=${reportId}`
        : '/api/test-extraction';

      const response = await fetch(url);
      const data = await response.json();

      setResult({
        success: response.ok,
        data,
        status: response.status,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-4xl font-bold">Test OpenAI</h1>
        <p className="text-lg text-muted-foreground">
          Vérifier la connexion OpenAI et l&apos;extraction
        </p>
      </div>

      {/* Test Controls */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Lancer le Test</h2>

        <div className="space-y-4">
          {/* Report ID Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Report ID (optionnel)
            </label>
            <input
              type="text"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              placeholder="Laisser vide pour test basique, ou entrer un ID de rapport"
              className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Pour tester un rapport spécifique, coller son ID ici
            </p>
          </div>

          {/* Test Button */}
          <button
            onClick={runTest}
            disabled={testing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Lancer le test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div
          className={`rounded-xl border p-6 ${
            result.success
              ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
              : 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
          }`}
        >
          <div className="mb-4 flex items-center gap-3">
            {result.success ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                    Test Réussi
                  </h2>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    OpenAI fonctionne correctement
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                    Test Échoué
                  </h2>
                  <p className="text-sm text-red-600 dark:text-red-500">
                    Il y a un problème avec OpenAI
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="rounded-lg bg-black/10 p-4">
              <h3 className="mb-2 font-semibold">Détails</h3>
              <pre className="overflow-x-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {/* Environment Checks */}
            {result.data?.checks && (
              <div className="rounded-lg bg-black/10 p-4">
                <h3 className="mb-2 font-semibold">
                  Variables d&apos;Environnement
                </h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(result.data.checks).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-mono">{key}</span>
                      <span className="text-muted-foreground">
                        {value ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-xl border bg-muted/50 p-6">
        <h2 className="mb-4 text-xl font-bold">Comment Utiliser</h2>
        <ol className="space-y-2 text-sm">
          <li>
            <strong>1. Test Basique</strong> : Laisser le champ vide et cliquer
            sur &quot;Lancer le test&quot;. Cela vérifie juste la connexion
            OpenAI.
          </li>
          <li>
            <strong>2. Test Complet</strong> : Entrer un Report ID pour tester
            l&apos;extraction complète d&apos;un rapport.
          </li>
          <li>
            <strong>3. Trouver un Report ID</strong> : Allez dans Supabase &gt;
            Table Editor &gt; systemage_reports et copiez un ID.
          </li>
          <li>
            <strong>4. Consulter les Logs</strong> : Regardez la console de
            votre terminal où tourne npm run dev pour voir les logs détaillés.
          </li>
        </ol>
      </div>
    </div>
  );
}
