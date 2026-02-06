'use client';

import { useTranslation } from '@/lib/i18n/use-translation';

interface SystemGaugeProps {
  chronologicalAge: number;
  systemAge: number;
  agingRate: number;
  agingStage: 'Prime' | 'Plateau' | 'Accelerated';
}

export function SystemGauge({
  chronologicalAge,
  systemAge,
  agingRate,
  agingStage,
}: SystemGaugeProps) {
  const { t } = useTranslation();

  // Protections contre les valeurs undefined/null
  const safeChronoAge = chronologicalAge || 0;
  const safeSystemAge = systemAge || 0;
  const safeAgingRate = agingRate || 1;

  const ageDifference = safeSystemAge - safeChronoAge;

  // Déterminer le statut selon agingRate
  const getAgingStatus = (rate: number) => {
    if (rate < 0.95) return { label: 'Excellent', color: '#39C5EB' };
    if (rate < 1.05) return { label: 'Normal', color: '#F9CD71' };
    return { label: 'Attention', color: '#D64219' };
  };

  const agingStatus = getAgingStatus(safeAgingRate);

  // Position du pointeur (0-100%)
  const gaugePosition = Math.min(100, Math.max(0, (safeAgingRate - 0.5) * 100));

  return (
    <div className="space-y-8">
      {/* Titre et badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Overall Aging Speed</h3>
        <div
          className="rounded-full border px-4 py-1.5 text-sm font-medium"
          style={{
            borderColor: agingStatus.color,
            color: agingStatus.color,
          }}
        >
          {agingStatus.label}
        </div>
      </div>

      {/* Gauge */}
      <div className="space-y-2">
        <div className="text-center text-sm text-muted-foreground">
          Chronological Speed
        </div>

        {/* Gradient gauge bar */}
        <div className="relative h-12 overflow-hidden rounded-full border border-border/50 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500">
          {/* Pointer */}
          <div
            className="absolute top-0 h-full w-1 bg-white transition-all duration-300"
            style={{ left: `${gaugePosition}%` }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 translate-y-full">
              <div className="h-0 w-0 border-l-3 border-r-3 border-t-4 border-l-transparent border-r-transparent border-t-white" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Excellent</span>
          <span>Normal</span>
          <span>Attention</span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">You are aging</span>
          <span
            className="text-3xl font-bold"
            style={{ color: agingStatus.color }}
          >
            {safeAgingRate.toFixed(2)}x
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          of chronological time
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Biological age</span>
          <span className="font-semibold">{safeSystemAge.toFixed(1)} years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Chronological age</span>
          <span className="font-semibold">{safeChronoAge} years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Difference</span>
          <span className="font-semibold">
            {ageDifference > 0 ? '+' : ''}
            {ageDifference.toFixed(1)} years
          </span>
        </div>
      </div>
    </div>
  );
}
