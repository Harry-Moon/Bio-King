/**
 * Types TypeScript pour la Marketplace de Biohacking
 */

export type ProductCategory =
  | 'all'
  | 'inflammation'
  | 'metabolism'
  | 'neurodegeneration'
  | 'cardiovascular'
  | 'digestive'
  | 'cognitive'
  | 'immune'
  | 'metabolic';

export type ProductType = 'supplement' | 'service' | 'protocol' | 'therapy';

export type BadgeType = 'action_required' | 'age_delta' | 'priority' | 'new';

export type ProtocolItemFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'one_time'
  | 'appointment';

export type DisplayType = 'hero' | 'grid';

export type BillingModel = 'one-time' | 'monthly' | 'yearly' | 'per-session';

/**
 * Badge affiché sur un produit
 */
export interface ProductBadge {
  type: BadgeType;
  text: string;
  value?: string; // Ex: "+10 ANS DELTA"
  priority?: boolean; // Pour le badge orange "Priorité"
}

/**
 * Données spéciales pour les produits featured
 */
export interface FeaturedData {
  ageDelta?: number; // Ex: +10 ans
  clinicalStandard?: string; // Ex: "Gold Standard Clinique"
  recommendedFor?: string; // Ex: "your inflammation score (48.0 years)"
  doctorRequired?: boolean;
}

/**
 * Tags pour la recommandation intelligente (visibles ou invisibles)
 */
export interface ProductTag {
  name: string;
  visible: boolean; // Si false, utilisé uniquement pour le matching
  systemTargets?: string[]; // Systèmes corporels ciblés
  biomarkerTargets?: string[]; // Biomarqueurs ciblés
  ageRange?: {
    min?: number;
    max?: number;
  };
  agingStageTargets?: ('Prime' | 'Plateau' | 'Accelerated')[];
}

/**
 * Produit biohacking dans la marketplace
 */
export interface BioProduct {
  id: string;
  name: string;
  category: ProductCategory;
  type: ProductType;
  price: number;
  currency?: string;
  description: string;
  detailedDescription?: string; // Pour HeroCard
  image: string;
  isHero: boolean; // DEPRECATED: utiliser displayType à la place
  displayType?: DisplayType; // 'hero' = HeroCard, 'grid' = ProductCard
  badge?: ProductBadge;
  featuredData?: FeaturedData;
  tags: ProductTag[];
  isActive: boolean;
  externalLink?: string;
  // Champs admin
  billingModel?: BillingModel;
  primarySystem?: string; // Système biologique primaire
  secondarySystems?: string[]; // Systèmes biologiques secondaires
  clinicalReferences?: string[]; // URLs ou références cliniques
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item dans le protocole utilisateur
 */
export interface ProtocolItem {
  productId: string;
  product: BioProduct;
  quantity?: number;
  frequency: ProtocolItemFrequency;
  addedAt: Date;
}

/**
 * Couverture systémique du protocole
 */
export interface SystemCoverage {
  systemName: string;
  coverage: number; // 0-100%
  priority: boolean; // Si c'est une priorité (orange)
}

/**
 * Protocole utilisateur complet
 */
export interface UserProtocol {
  items: ProtocolItem[];
  totalPrice: number;
  systemCoverage: SystemCoverage[];
  weekNumber?: number;
}
