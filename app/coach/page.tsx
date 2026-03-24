import dynamic from 'next/dynamic';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import {
  mapSupabaseReport,
  mapSupabaseBodySystem,
} from '@/lib/utils/supabase-mappers';

export interface HealthContextItem {
  systemName: string;
  systemAge: number;
  ageDifference: number;
  agingStage: string;
  isPriority: boolean;
}

const CoachChatInterface = dynamic(
  () =>
    import('@/components/coach/coach-chat-interface').then(
      (mod) => mod.CoachChatInterface
    ),
  {
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl border bg-muted" />
    ),
    ssr: false,
  }
);

export const metadata = {
  title: 'Coach | BioKing',
  description:
    "Échangez avec l'IA Coach entraînée sur vos données, le marketplace et Learn",
};

export default async function CoachPage() {
  const user = await requireAuth();

  let healthContext: HealthContextItem[] = [];
  let chronologicalAge: number | null = null;

  try {
    const { data: reports } = await supabaseAdmin
      .from('systemage_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('extraction_status', 'completed')
      .order('upload_date', { ascending: false })
      .limit(1);

    if (reports && reports.length > 0) {
      const report = mapSupabaseReport(reports[0]);
      chronologicalAge = report.chronologicalAge;

      const { data: systems } = await supabaseAdmin
        .from('body_systems')
        .select('*')
        .eq('report_id', report.id)
        .order('age_difference', { ascending: false })
        .limit(5);

      if (systems) {
        healthContext = systems.map(mapSupabaseBodySystem).map((s) => ({
          systemName: s.systemName,
          systemAge: s.systemAge ?? 0,
          ageDifference: s.ageDifference ?? 0,
          agingStage: s.agingStage ?? '',
          isPriority: (s.ageDifference ?? 0) > 5,
        }));
      }
    }
  } catch {
    // Non-blocking: coach still works without context
  }

  return (
    <div className="mx-auto max-w-7xl">
      <CoachChatInterface
        healthContext={healthContext}
        chronologicalAge={chronologicalAge}
      />
    </div>
  );
}
