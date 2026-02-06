'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { SystemGauge } from '@/components/dashboard/system-gauge';
import { SystemCard } from '@/components/dashboard/system-card';
import { SystemComparisonChart } from '@/components/dashboard/system-comparison-chart';
import { EntropyCurve } from '@/components/dashboard/entropy-curve';
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

function DashboardContent() {
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
            .eq('user_id', user?.id || '')
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
            .eq('user_id', user?.id || '')
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
          <p className="text-muted-foreground">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-3 text-2xl font-bold">
            {t('dashboard.noReportFound')}
          </h2>
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
          <h2 className="mb-2 text-xl font-semibold">
            {t('dashboard.analysisInProgress')}
          </h2>
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
      <div className="rounded-xl border bg-gradient-to-br from-card via-card to-card/80 p-8 shadow-lg backdrop-blur-sm">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SystemGauge
              chronologicalAge={report.chronologicalAge}
              systemAge={report.overallSystemAge}
              agingRate={report.agingRate}
              agingStage={report.agingStage}
            />
          </div>

          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
            {/* Biological Age - Prominent */}
            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('dashboard.biologicalAge')}
              </p>
              <p className="mt-2 text-4xl font-bold text-orange-500">
                {report.overallSystemAge?.toFixed(1) || 0}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {report.agingRate && report.agingRate > 1
                  ? `+${(report.agingRate - 1).toFixed(2)}x vs Chronological`
                  : 'Within normal range'}
              </p>
            </div>

            {/* Aging Phase */}
            <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('dashboard.agingPhase')}
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-500">
                {t(`stages.${report.agingStage.toLowerCase()}`)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Stabilité observée
              </p>
            </div>

            {/* Aging Speed */}
            <div className="rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('dashboard.agingSpeed')}
              </p>
              <p className="mt-2 text-4xl font-bold text-red-500">
                {report.agingRate?.toFixed(2) || 0}x
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {report.agingRate && report.agingRate > 1
                  ? 'Accélération'
                  : 'Normal'}
              </p>
            </div>

            {/* Chronological Age */}
            <div className="rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 p-5 sm:col-span-3 lg:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('dashboard.chronologicalAge')}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {report.chronologicalAge} {t('common.years')}
              </p>
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

      {/* Entropy Curve */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EntropyCurve
          chronologicalAge={report.chronologicalAge}
          systemAge={report.overallSystemAge}
          agingStage={report.agingStage}
        />
      </div>

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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
