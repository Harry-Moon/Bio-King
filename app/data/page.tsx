'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import {
  mapSupabaseReport,
  mapSupabaseBodySystem,
} from '@/lib/utils/supabase-mappers';
import type { SystemAgeReport, BodySystem } from '@/lib/types/systemage';
import type { Biomarker } from '@/lib/data/genlab-biomarkers';
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** Logo BioKing en blanc pâle pour les cartes biomarkers */
function BiomarkerLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <path
        d="M7 13L11.5 17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8L12.5 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0004 2C13.2024 3.998 11.5 7 11.5 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8L17.5 11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.0004 6.00038L14.1094 3.10938"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 15C8.667 9 15.333 15 22 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 5.5L20.891 9.891"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.10938 14.1094L4.00038 15.0004"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 12.5L7.5 13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15L9.891 20.891"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22.0008C10.798 20.0028 12.5 16.5 12.5 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CATEGORY_ORDER = [
  'Auditory Health',
  'Blood Sugar and Insulin Control',
  'Skeletal Health',
  'Cardiac Health',
  'Brain Health and Cognition',
  'Digestive Health',
  'Fibrogenesis and Fibrosis',
  'Hepatic Health',
  'Immunity',
  'Inflammatory Regulation',
  'Metabolism',
  'Muscular Health',
  'Neurodegeneration',
  'Oncogenesis',
  'Reproductive Health',
  'Respiratory Health',
  'Tissue Regeneration',
  'Blood and Vascular Health',
  'Urinary Health',
];

function BiomarkerCard({ biomarker }: { biomarker: Biomarker }) {
  const [expanded, setExpanded] = useState(false);
  const hasPathways = biomarker.keggPathways.length > 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30">
      <button
        type="button"
        onClick={() => hasPathways && setExpanded(!expanded)}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/30">
          <BiomarkerLogoIcon className="h-4 w-4 text-white/90" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              {biomarker.geneSymbol}
            </span>
            {hasPathways && (
              <span className="text-muted-foreground">
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {biomarker.geneName}
          </p>
        </div>
      </button>
      {expanded && hasPathways && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            KEGG Pathways
          </p>
          <ul className="space-y-1.5">
            {biomarker.keggPathways.map((pathway) => (
              <li
                key={pathway}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                {pathway}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CategorySection({
  category,
  biomarkers,
  patientSystem,
  categoryToSystem,
}: {
  category: string;
  biomarkers: Biomarker[];
  patientSystem?: BodySystem | null;
  categoryToSystem: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(true);
  const systemName = categoryToSystem[category] ?? category;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              patientSystem
                ? patientSystem.agingStage === 'Prime'
                  ? 'bg-green-500/10 text-green-600'
                  : patientSystem.agingStage === 'Accelerated'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-slate-500/10 text-slate-600'
                : 'bg-primary/10 text-primary'
            )}
          >
            {expanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{systemName}</h3>
            <p className="text-sm text-muted-foreground">
              {biomarkers.length} biomarker{biomarkers.length !== 1 ? 's' : ''}{' '}
              analyzed in this report
            </p>
          </div>
        </div>
        {patientSystem && (
          <div className="text-right">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                patientSystem.agingStage === 'Prime'
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                  : patientSystem.agingStage === 'Accelerated'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'bg-slate-500/20 text-slate-700 dark:text-slate-400'
              )}
            >
              {patientSystem.agingStage}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              System age: {patientSystem.systemAge} yrs
            </p>
          </div>
        )}
      </button>
      {expanded && (
        <div className="border-t border-border p-4">
          <p className="mb-4 text-sm text-muted-foreground">
            The following biomarkers from your Genlab report are associated with{' '}
            <strong className="text-foreground">{systemName}</strong>. Each gene
            plays a role in biological pathways that influence this
            system&apos;s health and aging.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {biomarkers.map((b) => (
              <BiomarkerCard key={b.geneSymbol} biomarker={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<SystemAgeReport | null>(null);
  const [systems, setSystems] = useState<BodySystem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [biomarkersModule, setBiomarkersModule] = useState<{
    getBiomarkersForCategory: (category: string) => Biomarker[];
    HEALTH_CATEGORY_TO_SYSTEM: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    import('@/lib/data/genlab-biomarkers').then((mod) => {
      setBiomarkersModule({
        getBiomarkersForCategory: mod.getBiomarkersForCategory,
        HEALTH_CATEGORY_TO_SYSTEM: mod.HEALTH_CATEGORY_TO_SYSTEM,
      });
    });
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const { data: reports, error: reportError } = await supabase
          .from('systemage_reports')
          .select('*')
          .eq('user_id', user?.id || '')
          .order('upload_date', { ascending: false })
          .limit(1);

        if (reportError) throw reportError;

        if (!reports || reports.length === 0) {
          setReport(null);
          setSystems([]);
          setLoading(false);
          return;
        }

        const latestReport = mapSupabaseReport(reports[0]);
        setReport(latestReport);

        const { data: systemsData, error: systemsError } = await supabase
          .from('body_systems')
          .select('*')
          .eq('report_id', latestReport.id)
          .order('age_difference', { ascending: false });

        if (systemsError) throw systemsError;
        setSystems(
          systemsData
            ? systemsData.map((s: any) => mapSupabaseBodySystem(s))
            : []
        );
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [user, authLoading]);

  const getSystemForCategory = (category: string): BodySystem | undefined => {
    if (!biomarkersModule) return undefined;
    const systemName = biomarkersModule.HEALTH_CATEGORY_TO_SYSTEM[category];
    return systems.find((s) => s.systemName === systemName);
  };

  if (authLoading || loading || !biomarkersModule) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Biomarkers</h1>
        <p className="text-muted-foreground">
          Detailed list of biomarkers from your Genlab report, organized by
          health system. Each biomarker is explained with its gene function and
          associated biological pathways (KEGG).
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!report && !error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex gap-3">
            <Info className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-foreground">
                No report uploaded yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a Genlab SystemAge report to see your biomarkers
                contextualized with your body system scores. For now, you can
                browse the full reference list of biomarkers below.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const biomarkers =
            biomarkersModule.getBiomarkersForCategory(category);
          if (biomarkers.length === 0) return null;

          const patientSystem = report ? getSystemForCategory(category) : null;

          return (
            <CategorySection
              key={category}
              category={category}
              biomarkers={biomarkers}
              patientSystem={patientSystem}
              categoryToSystem={biomarkersModule.HEALTH_CATEGORY_TO_SYSTEM}
            />
          );
        })}
      </div>
    </div>
  );
}
