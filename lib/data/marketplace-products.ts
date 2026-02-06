/**
 * Données de produits pour la Marketplace
 * TODO: Migrer vers Supabase pour gestion admin
 */

import type { BioProduct } from '@/lib/types/marketplace';

/**
 * Produits de démonstration pour la marketplace
 */
export const mockProducts: BioProduct[] = [
  // Hero Product - Session TPE
  {
    id: 'tpe-session-001',
    name: 'Session TPE (Therapeutic Plasma Exchange)',
    category: 'inflammation',
    type: 'therapy',
    price: 2500,
    currency: 'EUR',
    description:
      'Élimination mécanique des cytokines pro-inflammatoires et facteurs de sénescence.',
    detailedDescription:
      "Élimination mécanique des cytokines pro-inflammatoires et facteurs de sénescence. Recommandé pour votre score d'inflammation (48.0 ans). Systemic Reset Médecin Requis.",
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
    isHero: true,
    displayType: 'hero',
    billingModel: 'per-session',
    primarySystem: 'Inflammatory Regulation',
    badge: {
      type: 'action_required',
      text: 'ACTION REQUISE',
      priority: true,
    },
    featuredData: {
      clinicalStandard: 'Gold Standard Clinique',
      recommendedFor: "votre score d'inflammation (48.0 ans)",
      doctorRequired: true,
    },
    tags: [
      {
        name: 'inflammation',
        visible: true,
        systemTargets: ['Inflammatory Regulation'],
        agingStageTargets: ['Accelerated'],
      },
      {
        name: 'high-priority',
        visible: false,
        systemTargets: ['Inflammatory Regulation'],
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Product - Quercetin Complex
  {
    id: 'quercetin-complex-001',
    name: 'Quercetin Complex',
    category: 'inflammation',
    type: 'supplement',
    price: 45,
    currency: 'EUR',
    description: 'Cible la sénescence cellulaire inflammatoire.',
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    isHero: false,
    displayType: 'grid',
    billingModel: 'one-time',
    primarySystem: 'Inflammatory Regulation',
    secondarySystems: ['Reproductive System', 'Metabolism'],
    badge: {
      type: 'age_delta',
      text: 'DELTA',
      value: '+10 ANS DELTA',
    },
    featuredData: {
      ageDelta: 10,
    },
    tags: [
      {
        name: 'inflammation',
        visible: true,
        systemTargets: ['Inflammatory Regulation'],
      },
      {
        name: 'senescence',
        visible: false,
        systemTargets: ['Inflammatory Regulation', 'Tissue Regeneration'],
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Product - Resveratrol Pure
  {
    id: 'resveratrol-pure-001',
    name: 'Resveratrol Pure',
    category: 'metabolism',
    type: 'supplement',
    price: 62,
    currency: 'EUR',
    description: 'Activation des sirtuines & santé digestive.',
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    isHero: false,
    tags: [
      {
        name: 'metabolism',
        visible: true,
        systemTargets: ['Metabolism', 'Digestive System'],
      },
      {
        name: 'sirtuins',
        visible: false,
        systemTargets: ['Metabolism'],
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Product - NAD+ Complex
  {
    id: 'nad-complex-001',
    name: 'NAD+ Complex',
    category: 'metabolism',
    type: 'supplement',
    price: 89,
    currency: 'EUR',
    description: 'Support mitochondrial et énergie cellulaire.',
    image:
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=400&fit=crop',
    isHero: false,
    badge: {
      type: 'age_delta',
      text: 'DELTA',
      value: '+5 ANS DELTA',
    },
    featuredData: {
      ageDelta: 5,
    },
    tags: [
      {
        name: 'metabolism',
        visible: true,
        systemTargets: ['Metabolism'],
      },
      {
        name: 'mitochondrial',
        visible: false,
        systemTargets: ['Metabolism', 'Cardiac System'],
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Product - Omega-3 Premium
  {
    id: 'omega3-premium-001',
    name: 'Omega-3 Premium',
    category: 'cardiovascular',
    type: 'supplement',
    price: 55,
    currency: 'EUR',
    description: 'Support cardiovasculaire et anti-inflammatoire.',
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    isHero: false,
    tags: [
      {
        name: 'cardiovascular',
        visible: true,
        systemTargets: ['Cardiac System', 'Blood and Vascular System'],
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Product - Curcumin Advanced
  {
    id: 'curcumin-advanced-001',
    name: 'Curcumin Advanced',
    category: 'inflammation',
    type: 'supplement',
    price: 48,
    currency: 'EUR',
    description: "Réduction de l'inflammation systémique.",
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    isHero: false,
    displayType: 'grid',
    billingModel: 'one-time',
    primarySystem: 'Inflammatory Regulation',
    secondarySystems: ['Reproductive System', 'Metabolism'],
    badge: {
      type: 'priority',
      text: 'Priorité',
      priority: true,
    },
    tags: [
      {
        name: 'inflammation',
        visible: true,
        systemTargets: ['Inflammatory Regulation'],
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Catégories disponibles avec leurs labels
 */
export const productCategories = [
  { value: 'all', label: 'Tous' },
  { value: 'inflammation', label: 'Inflammation (Priorité)', priority: true },
  { value: 'metabolism', label: 'Métabolisme' },
  { value: 'neurodegeneration', label: 'Neurodégénérescence' },
  { value: 'cardiovascular', label: 'Cardiovasculaire' },
  { value: 'digestive', label: 'Digestif' },
  { value: 'cognitive', label: 'Cognitif' },
] as const;
