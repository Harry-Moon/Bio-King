import type {
  BioProduct,
  ProtocolItem,
  SystemCoverage,
} from '@/lib/types/marketplace';
import type { BodySystem } from '@/lib/types/systemage';

/**
 * Calculates a recommendation score for a product based on body system data.
 * Higher scores indicate greater relevance to the user's aging profile.
 */
export function calculateProductScore(
  product: BioProduct,
  bodySystems: BodySystem[]
): number {
  if (bodySystems.length === 0) return 0;

  let score = 0;

  product.tags.forEach((tag) => {
    if (!tag.systemTargets || tag.systemTargets.length === 0) return;

    tag.systemTargets.forEach((targetSystem) => {
      const matchingSystem = bodySystems.find(
        (bs) => bs.systemName === targetSystem
      );

      if (matchingSystem) {
        if (matchingSystem.ageDifference > 5) {
          score += 10;
        } else if (matchingSystem.ageDifference > 0) {
          score += 5;
        }

        if (matchingSystem.agingStage === 'Accelerated') {
          score += 5;
        }
      }
    });
  });

  return score;
}

/**
 * Calculates how well a protocol covers the user's body systems.
 * Returns coverage percentages sorted by priority then coverage level.
 */
export function calculateSystemCoverage(
  items: ProtocolItem[],
  bodySystems: BodySystem[]
): SystemCoverage[] {
  if (bodySystems.length === 0) {
    return [
      { systemName: 'Inflammation', coverage: 65, priority: true },
      { systemName: 'Digestif', coverage: 30, priority: false },
      { systemName: 'Cognitif', coverage: 25, priority: false },
    ];
  }

  const coverageMap = new Map<string, number>();

  bodySystems.forEach((system) => {
    coverageMap.set(system.systemName, 0);
  });

  items.forEach((item) => {
    item.product.tags.forEach((tag) => {
      if (tag.systemTargets) {
        tag.systemTargets.forEach((targetSystem) => {
          const current = coverageMap.get(targetSystem) || 0;
          coverageMap.set(targetSystem, Math.min(100, current + 20));
        });
      }
    });
  });

  return Array.from(coverageMap.entries())
    .map(([systemName, coverage]) => {
      const system = bodySystems.find((bs) => bs.systemName === systemName);
      const priority =
        system !== undefined && system.ageDifference > 5 && coverage > 0;

      return { systemName, coverage, priority };
    })
    .filter((c) => c.coverage > 0)
    .sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return b.coverage - a.coverage;
    });
}
