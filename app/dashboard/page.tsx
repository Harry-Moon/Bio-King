'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { SystemGauge } from '@/components/dashboard/system-gauge';
import { SystemCard } from '@/components/dashboard/system-card';
import { SystemComparisonChart } from '@/components/dashboard/system-comparison-chart';
import { RecommendationCard } from '@/components/dashboard/recommendation-card';
import { Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  mapSupabaseReport,
  mapSupabaseBodySystem,
  mapSupabaseRecommendation,
} from '@/lib/utils/supabase-mappers';
import type {
  SystemAgeReport,
  BodySystem,
  Recommendation,
} from '@/lib/types/systemage';
import { useTranslation } from '@/lib/i18n/use-translation';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<SystemAgeReport | null>(null);
  const [systems, setSystems] = useState<BodySystem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attendre que l'authentification soit chargée
    if (authLoading || !user) return;

    async function fetchReport() {
      try {
        if (!reportId) {
          // Charger le rapport le plus récent de l'utilisateur
          const { data: reports, error: reportError } = await supabase
            .from('systemage_reports')
            .select('*')
            .eq('user_id', user.id)
            .order('upload_date', { ascending: false })
            .limit(1);

          if (reportError) throw reportError;

          if (!reports || reports.length === 0) {
            setError('Aucun rapport trouvé. Veuillez en uploader un.');
            setLoading(false);
            return;
          }

          const latestReport = mapSupabaseReport(reports[0]);
          setReport(latestReport);
          await fetchSystemsAndRecommendations(latestReport.id);
        } else {
          // Charger le rapport spécifique (vérifier qu'il appartient à l'utilisateur)
          const { data: reportData, error: reportError } = await supabase
            .from('systemage_reports')
            .select('*')
            .eq('id', reportId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (reportError) throw reportError;

          if (!reportData) {
            setError('Rapport introuvable.');
            setLoading(false);
            return;
          }

          setReport(mapSupabaseReport(reportData));
          await fetchSystemsAndRecommendations(reportId);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    async function fetchSystemsAndRecommendations(reportId: string) {
      const [systemsResult, recsResult] = await Promise.all([
        supabase
          .from('body_systems')
          .select('*')
          .eq('report_id', reportId)
          .order('age_difference', { ascending: false }),
        supabase.from('recommendations').select('*').eq('report_id', reportId),
      ]);

      if (systemsResult.data) {
        setSystems(systemsResult.data.map(mapSupabaseBodySystem));
      }

      if (recsResult.data) {
        setRecommendations(recsResult.data.map(mapSupabaseRecommendation));
      }
    }

    fetchReport();
  }, [reportId, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {t('common.loading')}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-3 text-2xl font-bold">{t('dashboard.noReportFound')}</h2>
          <p className="mb-6 text-muted-foreground">
            {error || t('dashboard.reportNotFoundDesc')}
          </p>
          <button
            onClick={() => (window.location.href = '/upload')}
            className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('dashboard.uploadFirstReport')}
          </button>
        </div>
      </div>
    );
  }

  // Si extraction en cours
  if (
    report.extractionStatus === 'pending' ||
    report.extractionStatus === 'processing'
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="mb-2 text-xl font-semibold">{t('dashboard.analysisInProgress')}</h2>
          <p className="text-muted-foreground">
            {t('dashboard.analysisInProgressDesc')}
            <br />
            {t('dashboard.analysisInProgressTime')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg border px-6 py-2 hover:bg-muted"
          >
            {t('common.refresh')}
          </button>
        </div>
      </div>
    );
  }

  const topAgingFactors = systems.slice(0, 5);
  const systemsInPrime = systems.filter((s) => s.agingStage === 'Prime');
  const nutritionalRecs = recommendations.filter(
    (r) => r.type === 'nutritional'
  );
  const fitnessRecs = recommendations.filter((r) => r.type === 'fitness');
  const therapyRecs = recommendations.filter((r) => r.type === 'therapy');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-4xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Hero Card - Score global */}
      <div className="rounded-xl border bg-card p-8 shadow-lg">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SystemGauge
              chronologicalAge={report.chronologicalAge}
              systemAge={report.overallSystemAge}
              agingRate={report.agingRate}
              agingStage={report.agingStage}
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h2 className="mb-4 text-2xl font-bold">{t('dashboard.overview')}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <span className="text-muted-foreground">
                    {t('dashboard.chronologicalAge')}
                  </span>
                  <span className="text-xl font-bold">
                    {report.chronologicalAge} {t('common.years')}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <span className="text-muted-foreground">{t('dashboard.biologicalAge')}</span>
                  <span className="text-xl font-bold">
                    {report.overallSystemAge?.toFixed(1) || 0} {t('common.years')}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <span className="text-muted-foreground">
                    {t('dashboard.agingSpeed')}
                  </span>
                  <span className="text-xl font-bold">
                    {report.agingRate?.toFixed(2) || 0}x
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <span className="text-muted-foreground">
                    {t('dashboard.agingPhase')}
                  </span>
                  <span className="text-xl font-bold">
                    {t(`stages.${report.agingStage.toLowerCase()}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SystemAge in Comparison */}
      {systems.length > 0 && (
        <SystemComparisonChart
          systems={systems}
          chronologicalAge={report.chronologicalAge}
        />
      )}

      {/* Top Aging Factors */}
      {topAgingFactors.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-bold">
              {t('dashboard.topAgingFactors')}
            </h2>
          </div>
          <p className="mb-6 text-muted-foreground">
            {t('dashboard.topAgingFactorsDesc')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topAgingFactors.map((system) => (
              <SystemCard
                key={system.id}
                system={system}
                chronologicalAge={report.chronologicalAge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tous les systèmes */}
      <div>
        <h2 className="mb-6 text-2xl font-bold">
          {t('dashboard.systemsAnalysis')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {systems.map((system) => (
            <SystemCard
              key={system.id}
              system={system}
              chronologicalAge={report.chronologicalAge}
            />
          ))}
        </div>
      </div>

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="mb-6 text-2xl font-bold">
            {t('dashboard.personalizedRecommendations')}
          </h2>

          {/* Nutrition */}
          {nutritionalRecs.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Nutrition</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nutritionalRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Fitness */}
          {fitnessRecs.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Fitness</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fitnessRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Therapy */}
          {therapyRecs.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Thérapies</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {therapyRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats footer */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-2 text-3xl font-bold text-green-500">
            {systemsInPrime.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Systèmes en phase Prime
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-2 text-3xl font-bold">{systems.length}</div>
          <div className="text-sm text-muted-foreground">Systèmes analysés</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-2 text-3xl font-bold">
            {recommendations.length}
          </div>
          <div className="text-sm text-muted-foreground">Recommandations</div>
        </div>
      </div>
    </div>
  );
}
