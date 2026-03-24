import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateProductScore,
  calculateSystemCoverage,
} from './marketplace-scoring';
import type { BioProduct, ProtocolItem } from '@/lib/types/marketplace';
import type { BodySystem } from '@/lib/types/systemage';

// --- Helpers ---

const createMockBodySystem = (
  overrides: Partial<BodySystem> = {}
): BodySystem => ({
  id: 'sys-1',
  reportId: 'report-1',
  systemName: 'Inflammatory Regulation',
  systemAge: 55,
  bioNoise: 0.3,
  ageDifference: 10,
  agingStage: 'Accelerated',
  agingSpeed: 1.2,
  percentileRank: 85,
  createdAt: new Date('2025-01-01'),
  ...overrides,
});

const createMockProduct = (
  overrides: Partial<BioProduct> = {}
): BioProduct => ({
  id: 'prod-1',
  name: 'Quercetin Complex',
  category: 'inflammation',
  type: 'supplement',
  price: 39,
  currency: 'EUR',
  description: 'Anti-inflammatory supplement',
  image: 'https://example.com/img.jpg',
  isHero: false,
  tags: [
    {
      name: 'anti-inflammatory',
      visible: true,
      systemTargets: ['Inflammatory Regulation'],
    },
  ],
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

const createMockProtocolItem = (
  product: BioProduct,
  overrides: Partial<ProtocolItem> = {}
): ProtocolItem => ({
  productId: product.id,
  product,
  frequency: 'monthly',
  addedAt: new Date('2025-01-01'),
  ...overrides,
});

// --- Tests ---

describe('calculateProductScore', () => {
  describe('Happy Path', () => {
    it('devrait retourner un score élevé pour un produit ciblant un système vieillissant', () => {
      const product = createMockProduct();
      const systems = [
        createMockBodySystem({
          systemName: 'Inflammatory Regulation',
          ageDifference: 10,
          agingStage: 'Accelerated',
        }),
      ];

      const score = calculateProductScore(product, systems);

      // ageDifference > 5 => +10, agingStage Accelerated => +5
      expect(score).toBe(15);
    });

    it('devrait accumuler les scores pour plusieurs tags ciblant différents systèmes', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag-1',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
          {
            name: 'tag-2',
            visible: false,
            systemTargets: ['Cardiac System'],
          },
        ],
      });
      const systems = [
        createMockBodySystem({
          systemName: 'Inflammatory Regulation',
          ageDifference: 8,
          agingStage: 'Accelerated',
        }),
        createMockBodySystem({
          id: 'sys-2',
          systemName: 'Cardiac System',
          ageDifference: 3,
          agingStage: 'Plateau',
        }),
      ];

      const score = calculateProductScore(product, systems);

      // Inflammatory: 10 + 5 = 15, Cardiac: 5 = 5 => Total 20
      expect(score).toBe(20);
    });

    it('devrait retourner un score moyen pour ageDifference entre 0 et 5', () => {
      const product = createMockProduct();
      const systems = [
        createMockBodySystem({
          ageDifference: 3,
          agingStage: 'Plateau',
        }),
      ];

      const score = calculateProductScore(product, systems);

      expect(score).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('devrait retourner 0 quand bodySystems est vide', () => {
      const product = createMockProduct();
      const score = calculateProductScore(product, []);

      expect(score).toBe(0);
    });

    it("devrait retourner 0 quand le produit n'a pas de tags", () => {
      const product = createMockProduct({ tags: [] });
      const systems = [createMockBodySystem()];

      const score = calculateProductScore(product, systems);

      expect(score).toBe(0);
    });

    it("devrait retourner 0 quand les tags n'ont pas de systemTargets", () => {
      const product = createMockProduct({
        tags: [{ name: 'generic', visible: true }],
      });
      const systems = [createMockBodySystem()];

      const score = calculateProductScore(product, systems);

      expect(score).toBe(0);
    });

    it('devrait retourner 0 quand systemTargets est un tableau vide', () => {
      const product = createMockProduct({
        tags: [{ name: 'tag', visible: true, systemTargets: [] }],
      });
      const systems = [createMockBodySystem()];

      const score = calculateProductScore(product, systems);

      expect(score).toBe(0);
    });

    it('devrait retourner 0 quand aucun système ne correspond au tag', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag',
            visible: true,
            systemTargets: ['Nonexistent System'],
          },
        ],
      });
      const systems = [createMockBodySystem()];

      const score = calculateProductScore(product, systems);

      expect(score).toBe(0);
    });

    it('devrait retourner 0 quand ageDifference est 0 ou négatif', () => {
      const product = createMockProduct();
      const systems = [
        createMockBodySystem({
          ageDifference: 0,
          agingStage: 'Prime',
        }),
      ];

      const score = calculateProductScore(product, systems);

      expect(score).toBe(0);
    });

    it('devrait retourner 0 quand ageDifference est négatif (plus jeune biologiquement)', () => {
      const product = createMockProduct();
      const systems = [
        createMockBodySystem({
          ageDifference: -5,
          agingStage: 'Prime',
        }),
      ];

      const score = calculateProductScore(product, systems);

      expect(score).toBe(0);
    });

    it('devrait gérer un tag qui cible le même système plusieurs fois', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag-1',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
          {
            name: 'tag-2',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
        ],
      });
      const systems = [
        createMockBodySystem({
          ageDifference: 10,
          agingStage: 'Accelerated',
        }),
      ];

      const score = calculateProductScore(product, systems);

      // Each tag scores independently: 2 * (10 + 5) = 30
      expect(score).toBe(30);
    });
  });
});

describe('calculateSystemCoverage', () => {
  describe('Happy Path', () => {
    it('devrait retourner des données de démo quand bodySystems est vide', () => {
      const result = calculateSystemCoverage([], []);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        systemName: 'Inflammation',
        coverage: 65,
        priority: true,
      });
      expect(result[1]).toEqual({
        systemName: 'Digestif',
        coverage: 30,
        priority: false,
      });
      expect(result[2]).toEqual({
        systemName: 'Cognitif',
        coverage: 25,
        priority: false,
      });
    });

    it('devrait calculer la couverture basée sur les produits du protocole', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
        ],
      });
      const items = [createMockProtocolItem(product)];
      const systems = [
        createMockBodySystem({
          systemName: 'Inflammatory Regulation',
          ageDifference: 10,
        }),
      ];

      const result = calculateSystemCoverage(items, systems);

      expect(result).toHaveLength(1);
      expect(result[0].systemName).toBe('Inflammatory Regulation');
      expect(result[0].coverage).toBe(20);
      expect(result[0].priority).toBe(true);
    });

    it('devrait additionner la couverture de plusieurs produits (max 100)', () => {
      const product1 = createMockProduct({
        id: 'p1',
        tags: [
          {
            name: 'tag1',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
        ],
      });
      const product2 = createMockProduct({
        id: 'p2',
        tags: [
          {
            name: 'tag2',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
        ],
      });
      const items = [
        createMockProtocolItem(product1),
        createMockProtocolItem(product2),
      ];
      const systems = [
        createMockBodySystem({
          systemName: 'Inflammatory Regulation',
          ageDifference: 10,
        }),
      ];

      const result = calculateSystemCoverage(items, systems);

      expect(result[0].coverage).toBe(40);
    });

    it('devrait plafonner la couverture à 100%', () => {
      const products = Array.from({ length: 6 }, (_, i) =>
        createMockProduct({
          id: `p${i}`,
          tags: [
            {
              name: `tag${i}`,
              visible: true,
              systemTargets: ['Inflammatory Regulation'],
            },
          ],
        })
      );
      const items = products.map((p) => createMockProtocolItem(p));
      const systems = [
        createMockBodySystem({
          systemName: 'Inflammatory Regulation',
          ageDifference: 10,
        }),
      ];

      const result = calculateSystemCoverage(items, systems);

      // 6 * 20 = 120, capped at 100
      expect(result[0].coverage).toBe(100);
    });
  });

  describe('Tri et priorité', () => {
    it('devrait trier les systèmes prioritaires en premier', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag',
            visible: true,
            systemTargets: ['Inflammatory Regulation', 'Cardiac System'],
          },
        ],
      });
      const items = [createMockProtocolItem(product)];
      const systems = [
        createMockBodySystem({
          id: 'sys-1',
          systemName: 'Cardiac System',
          ageDifference: 2,
          agingStage: 'Plateau',
        }),
        createMockBodySystem({
          id: 'sys-2',
          systemName: 'Inflammatory Regulation',
          ageDifference: 10,
          agingStage: 'Accelerated',
        }),
      ];

      const result = calculateSystemCoverage(items, systems);

      // Priority system (ageDifference > 5 && coverage > 0) first
      expect(result[0].systemName).toBe('Inflammatory Regulation');
      expect(result[0].priority).toBe(true);
      expect(result[1].systemName).toBe('Cardiac System');
      expect(result[1].priority).toBe(false);
    });

    it('devrait trier par couverture décroissante à priorité égale', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag1',
            visible: true,
            systemTargets: ['Cardiac System'],
          },
          {
            name: 'tag2',
            visible: true,
            systemTargets: ['Cardiac System', 'Digestive System'],
          },
        ],
      });
      const items = [createMockProtocolItem(product)];
      const systems = [
        createMockBodySystem({
          id: 'sys-1',
          systemName: 'Cardiac System',
          ageDifference: 2,
        }),
        createMockBodySystem({
          id: 'sys-2',
          systemName: 'Digestive System',
          ageDifference: 3,
        }),
      ];

      const result = calculateSystemCoverage(items, systems);

      // Cardiac hit by 2 tags => 40, Digestive hit by 1 tag => 20
      expect(result[0].systemName).toBe('Cardiac System');
      expect(result[0].coverage).toBe(40);
      expect(result[1].systemName).toBe('Digestive System');
      expect(result[1].coverage).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('devrait exclure les systèmes sans couverture', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
        ],
      });
      const items = [createMockProtocolItem(product)];
      const systems = [
        createMockBodySystem({
          id: 'sys-1',
          systemName: 'Inflammatory Regulation',
          ageDifference: 10,
        }),
        createMockBodySystem({
          id: 'sys-2',
          systemName: 'Cardiac System',
          ageDifference: 5,
        }),
      ];

      const result = calculateSystemCoverage(items, systems);

      // Only Inflammatory should appear (Cardiac has 0 coverage)
      expect(result).toHaveLength(1);
      expect(result[0].systemName).toBe('Inflammatory Regulation');
    });

    it('devrait créer une entrée non-prioritaire quand le tag cible un système hors rapport', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag',
            visible: true,
            systemTargets: ['Nonexistent System'],
          },
        ],
      });
      const items = [createMockProtocolItem(product)];
      const systems = [createMockBodySystem()];

      const result = calculateSystemCoverage(items, systems);

      expect(result).toHaveLength(1);
      expect(result[0].systemName).toBe('Nonexistent System');
      expect(result[0].coverage).toBe(20);
      expect(result[0].priority).toBe(false);
    });

    it('devrait retourner un tableau vide quand le protocole est vide', () => {
      const systems = [createMockBodySystem()];

      const result = calculateSystemCoverage([], systems);

      expect(result).toHaveLength(0);
    });

    it('devrait gérer un produit sans tags', () => {
      const product = createMockProduct({ tags: [] });
      const items = [createMockProtocolItem(product)];
      const systems = [createMockBodySystem()];

      const result = calculateSystemCoverage(items, systems);

      expect(result).toHaveLength(0);
    });

    it('devrait gérer un tag sans systemTargets', () => {
      const product = createMockProduct({
        tags: [{ name: 'generic', visible: true }],
      });
      const items = [createMockProtocolItem(product)];
      const systems = [createMockBodySystem()];

      const result = calculateSystemCoverage(items, systems);

      expect(result).toHaveLength(0);
    });

    it('devrait ne pas marquer comme prioritaire si ageDifference <= 5', () => {
      const product = createMockProduct({
        tags: [
          {
            name: 'tag',
            visible: true,
            systemTargets: ['Inflammatory Regulation'],
          },
        ],
      });
      const items = [createMockProtocolItem(product)];
      const systems = [
        createMockBodySystem({
          ageDifference: 5,
        }),
      ];

      const result = calculateSystemCoverage(items, systems);

      expect(result[0].priority).toBe(false);
    });
  });
});
