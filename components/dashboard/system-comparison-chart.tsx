'use client';

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
  need_attention: '#F97316', // orange
  normal: '#FACC15', // yellow
  good: '#65A30D', // green
  excellent: '#60A5FA', // blue
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

  const chartData = [...systems]
    .sort((a, b) => b.systemAge - a.systemAge)
    .map((system) => ({
      name: t(`systems.${system.systemName}`) || system.systemName,
      systemAge: Number(system.systemAge.toFixed(1)),
      ageDiff: system.ageDifference,
      category: getCategory(system.ageDifference),
    }));

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

      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 20, left: 0, bottom: 100 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              formatter={(value: any) => [
                `${typeof value === 'number' ? value : 0} ${t('common.years')}`,
                'SystemAge',
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine
              y={chronologicalAge}
              stroke="#64748B"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `${chronologicalAge.toFixed(1)} ${t('common.years')}`,
                position: 'left',
                fill: '#64748B',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="systemAge" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={categoryColors[entry.category as Category]}
                />
              ))}
              <LabelList
                dataKey="systemAge"
                position="top"
                formatter={(value: any) =>
                  typeof value === 'number' ? value.toFixed(1) : '0'
                }
                fill="#1e293b"
                fontSize={11}
                fontWeight={600}
                offset={8}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
