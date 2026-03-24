'use client';

import { RecommendationCard } from '@/components/dashboard/recommendation-card';
import type { Recommendation } from '@/lib/types/systemage';

interface DashboardRecommendationsProps {
  recommendations: Recommendation[];
  title: string;
}

export function DashboardRecommendations({
  recommendations,
  title,
}: DashboardRecommendationsProps) {
  const nutritionalRecs = recommendations.filter(
    (r) => r.type === 'nutritional'
  );
  const fitnessRecs = recommendations.filter((r) => r.type === 'fitness');
  const therapyRecs = recommendations.filter((r) => r.type === 'therapy');

  if (recommendations.length === 0) return null;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>

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

      {therapyRecs.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Therapies</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {therapyRecs.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
