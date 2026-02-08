'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from 'recharts';
import type { BodySystem } from '@/lib/types/systemage';
import { useTranslation } from '@/lib/i18n/use-translation';

type Category = 'need_attention' | 'normal' | 'good' | 'excellent';

interface SystemComparisonChartProps {
  systems: BodySystem[];
  chronologicalAge: number;
}

const categoryColors: Record<Category, string> = {
  excellent: '#39C5EB', // Blue
  good: '#B7EBB4', // Green
  normal: '#F9CD71', // Yellow
  need_attention: '#D64219', // Red/Orange
};

// Removed - using translations instead

const getCategory = (ageDiff: number): Category => {
  if (ageDiff >= 4) return 'need_attention';
  if (ageDiff >= 1) return 'normal';
  if (ageDiff >= -1) return 'good';
  return 'excellent';
};

export function SystemComparisonChart({
  systems,
  chronologicalAge,
}: SystemComparisonChartProps) {
  const { t } = useTranslation();

  const categoryLabels = {
    need_attention: t('dashboard.needAttention'),
    normal: t('dashboard.normal'),
    good: t('dashboard.good'),
    excellent: t('dashboard.excellent'),
  };

  // Séparer: Attention+Normal au-dessus, Bon+Excellent en-dessous
  const systemsAbove = [...systems]
    .filter((s) => {
      const cat = getCategory(s.ageDifference);
      return cat === 'need_attention' || cat === 'normal';
    })
    .sort((a, b) => b.systemAge - a.systemAge);

  const systemsBelow = [...systems]
    .filter((s) => {
      const cat = getCategory(s.ageDifference);
      return cat === 'good' || cat === 'excellent';
    })
    .sort((a, b) => a.systemAge - b.systemAge);

  const chartData = [...systemsAbove, ...systemsBelow].map((system) => ({
    name: t(`systems.${system.systemName}`) || system.systemName,
    systemAge: Number(system.systemAge.toFixed(1)),
    ageDiff: system.ageDifference,
    category: getCategory(system.ageDifference),
  }));

  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">
          {t('dashboard.systemAgeComparison')}
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: categoryColors[key as Category] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[600px] w-full min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={400}>
          <BarChart
            data={chartData}
            margin={{ top: 40, right: 20, left: 0, bottom: 160 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              interval={0}
              angle={mounted && isMobile ? 0 : -60}
              textAnchor={mounted && isMobile ? 'middle' : 'end'}
              height={mounted && isMobile ? 0 : 130}
              tick={
                mounted && isMobile
                  ? false
                  : {
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }
              }
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              formatter={(value: any) => [
                `${typeof value === 'number' ? value : 0} ${t('common.years')}`,
                'SystemAge',
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
            />
            <ReferenceLine
              y={chronologicalAge}
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              label={{
                value: `${chronologicalAge.toFixed(1)} ${t('common.years')}`,
                position: 'left',
                fill: 'hsl(var(--primary))',
                fontSize: 13,
                fontWeight: 700,
              }}
            />
            <Bar dataKey="systemAge" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={categoryColors[entry.category as Category]}
                />
              ))}
              {mounted && !isMobile && (
                <LabelList
                  dataKey="systemAge"
                  position="top"
                  formatter={(value: any) =>
                    typeof value === 'number' ? value.toFixed(1) : '0'
                  }
                  fill="hsl(var(--foreground))"
                  fontSize={11}
                  fontWeight={600}
                  offset={12}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
