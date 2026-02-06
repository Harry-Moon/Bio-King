'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';

interface EntropyCurveProps {
  chronologicalAge: number;
  systemAge: number;
  agingStage: 'Prime' | 'Plateau' | 'Accelerated';
}

export function EntropyCurve({
  chronologicalAge,
  systemAge,
  agingStage,
}: EntropyCurveProps) {
  // Données de la courbe (exemple de courbe biologique)
  const data = [
    { x: 0, y: 0, stage: 'Birth' },
    { x: 25, y: 5, stage: 'End Prime' },
    { x: 38, y: 12, stage: 'Current' },
    { x: 45, y: 18, stage: 'End Plateau' },
    { x: 65, y: 35, stage: 'Accelerated' },
  ];

  // Points clés
  const primeEnd = 25.8;
  const plateauEnd = 42.1;

  // Couleurs selon le stage
  const stageColors = {
    Prime: '#39C5EB',
    Plateau: '#8B9F6F',
    Accelerated: '#FF6B4A',
  };

  const stageLabels = {
    Prime: 'End Prime',
    Plateau: 'End Plateau',
    Accelerated: 'Accelerated',
  };

  return (
    <div className="space-y-4">
      {/* Header avec titre et badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Overall Aging Entropy Curve</h3>
        <div
          className="rounded-full border px-4 py-1.5 text-sm font-medium"
          style={{
            borderColor: stageColors[agingStage],
            color: stageColors[agingStage],
            backgroundColor: `${stageColors[agingStage]}15`,
          }}
        >
          {agingStage}
        </div>
      </div>

      {/* Graphique */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 40, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="x"
              label={{ value: 'SystemAge among Population', position: 'bottom', offset: 10 }}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              label={{ value: 'Bionoise', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
            />

            {/* Ligne principale */}
            <Line
              type="monotone"
              dataKey="y"
              stroke="#FF8C42"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Ligne chronologique */}
            <ReferenceLine
              x={chronologicalAge}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              label={{
                value: 'Your ChronoAge',
                position: 'top',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 11,
              }}
            />

            {/* Marqueur Prime End */}
            <ReferenceLine
              x={primeEnd}
              stroke="#39C5EB"
              strokeDasharray="3 3"
              label={{
                value: 'End Prime',
                position: 'top',
                fill: '#39C5EB',
                fontSize: 10,
              }}
            />

            {/* Marqueur Plateau End */}
            <ReferenceLine
              x={plateauEnd}
              stroke="#8B9F6F"
              strokeDasharray="3 3"
              label={{
                value: 'End Plateau',
                position: 'top',
                fill: '#8B9F6F',
                fontSize: 10,
              }}
            />

            {/* Point utilisateur */}
            <ReferenceLine
              x={systemAge}
              stroke={stageColors[agingStage]}
              strokeWidth={2}
              label={{
                value: systemAge.toFixed(1),
                position: 'bottom',
                fill: stageColors[agingStage],
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Dot cx={systemAge} cy={12} r={6} fill={stageColors[agingStage]} />
            </ReferenceLine>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-8 rounded-full bg-orange-500" />
          <span>Your SystemAge</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 border-t-2 border-dashed border-slate-400" />
          <span>Current Aging Stage: {agingStage}</span>
        </div>
      </div>
    </div>
  );
}
