/**
 * Types TypeScript stricts pour le système SystemAge
 */

// Enums
export type AgingStage = 'Prime' | 'Plateau' | 'Accelerated';
export type ExtractionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';
export type RecommendationType = 'nutritional' | 'fitness' | 'therapy';
export type CatalogItemType = 'product' | 'service' | 'article' | 'protocol';
export type ChatRole = 'user' | 'assistant' | 'system';

// Liste des 19 systèmes corporels
export const BODY_SYSTEMS = [
  'Auditory System',
  'Muscular System',
  'Blood Sugar & Insulin Control',
  'Neurodegeneration',
  'Skeletal System',
  'Reproductive System',
  'Cardiac System',
  'Respiratory System',
  'Digestive System',
  'Urinary System',
  'Hepatic System',
  'Blood and Vascular System',
  'Immune System',
  'Metabolism',
  'Oncogenesis',
  'Tissue Regeneration',
  'Fibrogenesis and Fibrosis',
  'Inflammatory Regulation',
  'Brain Health and Cognition',
] as const;

export type BodySystemName = (typeof BODY_SYSTEMS)[number];

// Interface principale du rapport
export interface SystemAgeReport {
  id: string;
  userId: string;
  pdfUrl: string;
  uploadDate: Date;

  // Scores globaux
  chronologicalAge: number;
  overallSystemAge: number;
  agingRate: number;
  agingStage: AgingStage;
  overallBioNoise: number;

  // État extraction
  extractionStatus: ExtractionStatus;
  extractionConfidence: number | null;
  rawExtractionData: Record<string, any> | null;

  // Relations
  systems?: BodySystem[];
  recommendations?: Recommendation[];

  createdAt: Date;
  updatedAt: Date;
}

// Interface des systèmes corporels
export interface BodySystem {
  id: string;
  reportId: string;
  systemName: BodySystemName;
  systemAge: number;
  bioNoise: number | null;
  ageDifference: number;
  agingStage: AgingStage;
  agingSpeed?: number | null;
  percentileRank: number | null;
  createdAt: Date;
}

// Interface des recommandations
export interface Recommendation {
  id: string;
  reportId: string;
  type: RecommendationType;
  title: string;
  description: string | null;
  targetSystems: string[];
  clinicalBenefits: string | null;
  createdAt: Date;
}

// Interface du catalogue
export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  title: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  price: number | null;
  externalLink: string | null;
  tags: string[];
  targetSystems: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface des conversations
export interface ChatConversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

// Interface des messages
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

// Interface des plans d'action
export interface ActionPlan {
  id: string;
  userId: string;
  reportId: string | null;
  title: string;
  description: string | null;
  targetSystems: string[];
  recommendedItems: string[];
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// Types pour l'extraction GPT-4 Vision
export interface ExtractedSystemAgeData {
  chronologicalAge: number;
  overallSystemAge: number;
  agingRate: number;
  agingStage: AgingStage;
  overallBioNoise: number;
  bodySystems: ExtractedBodySystem[];
  recommendations: {
    nutritional: ExtractedRecommendation[];
    fitness: ExtractedRecommendation[];
    therapy: ExtractedRecommendation[];
  };
  topAgingFactors?: TopAgingFactor[];
}

export interface ExtractedBodySystem {
  systemName: string;
  systemAge: number;
  bioNoise: number | null;
  ageDifference: number;
  agingStage: AgingStage;
  agingSpeed?: number | null;
  percentileRank?: number | null;
}

export interface ExtractedRecommendation {
  title: string;
  description: string;
  targetSystems: string[];
  clinicalBenefits: string;
}

export interface TopAgingFactor {
  systemName: string;
  systemAge: number;
  reason: string;
}

// Type pour le dashboard
export interface DashboardData {
  report: SystemAgeReport;
  systems: BodySystem[];
  recommendations: Recommendation[];
  topAgingFactors: BodySystem[];
  systemsInPrime: BodySystem[];
  systemsInAccelerated: BodySystem[];
}
