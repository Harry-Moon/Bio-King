'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  const safeAgingRate = agingRate || 0;

  const ageDifference = safeSystemAge - safeChronoAge;
  const percentageValue = (safeSystemAge / 100) * 100;

  // Couleur selon le stage
  const stageColors = {
    Prime: '#10b981', // green
    Plateau: '#f59e0b', // amber
    Accelerated: '#ef4444', // red
  };

  const color = stageColors[agingStage];

  const data = [{ value: percentageValue }, { value: 100 - percentageValue }];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={120}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Texte central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
        <div className="text-center">
          <div className="mb-1 text-5xl font-bold">
            {safeSystemAge.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('dashboard.biologicalYears')}
          </div>
          <div className="mt-4 text-sm">
            <span className="text-muted-foreground">vs </span>
            <span className="font-semibold">{safeChronoAge}</span>
            <span className="text-muted-foreground">
              {' '}
              {t('dashboard.realYears')}
            </span>
          </div>
          <div
            className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {ageDifference > 0 ? '+' : ''}
            {ageDifference.toFixed(1)} {t('common.years')}
          </div>
        </div>
      </div>
    </div>
  );
}
