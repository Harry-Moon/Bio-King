'use client';

import { Leaf, Dumbbell, Stethoscope } from 'lucide-react';
import type { Recommendation } from '@/lib/types/systemage';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  // Icône selon le type
  const icons = {
    nutritional: <Leaf className="h-5 w-5" />,
    fitness: <Dumbbell className="h-5 w-5" />,
    therapy: <Stethoscope className="h-5 w-5" />,
  };

  const colors = {
    nutritional: 'text-green-500 bg-green-500/10 border-green-500/20',
    fitness: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    therapy: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  const icon = icons[recommendation.type];
  const colorClass = colors[recommendation.type];

  return (
    <div
      className={`group overflow-hidden rounded-lg border p-5 transition-all hover:shadow-lg ${colorClass}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className={`rounded-full p-2 ${colorClass}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="mb-1 font-semibold">{recommendation.title}</h3>
          <p className="text-sm text-muted-foreground">
            {recommendation.description}
          </p>
        </div>
      </div>

      {/* Target systems */}
      {recommendation.targetSystems.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Systèmes ciblés :
          </p>
          <div className="flex flex-wrap gap-1">
            {recommendation.targetSystems.slice(0, 3).map((system, index) => (
              <span
                key={index}
                className="rounded-full bg-background/50 px-2 py-0.5 text-xs"
              >
                {system}
              </span>
            ))}
            {recommendation.targetSystems.length > 3 && (
              <span className="rounded-full bg-background/50 px-2 py-0.5 text-xs">
                +{recommendation.targetSystems.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Benefits */}
      {recommendation.clinicalBenefits && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Bénéfices :
          </p>
          <p className="text-sm">{recommendation.clinicalBenefits}</p>
        </div>
      )}
    </div>
  );
}
