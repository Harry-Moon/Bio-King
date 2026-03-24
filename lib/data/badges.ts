import type { LucideIcon } from 'lucide-react';
import {
  Trophy,
  Target,
  Upload,
  BookOpen,
  MessageCircle,
  Flame,
  Star,
  Zap,
  Heart,
  Brain,
  Leaf,
  Dumbbell,
  Award,
  Crown,
  Sparkles,
} from 'lucide-react';

export type BadgeCategory = 'debutant' | 'intermediaire' | 'expert';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: BadgeCategory;
  /** Color for unlocked state */
  color: string;
  /** XP required or criteria description */
  criteria: string;
}

export const BADGES: Badge[] = [
  // Débutant
  {
    id: 'first-upload',
    name: 'Premier pas',
    description: 'Upload ton premier rapport SystemAge',
    icon: Upload,
    category: 'debutant',
    color: 'from-emerald-500 to-teal-600',
    criteria: '1 rapport uploadé',
  },
  {
    id: 'first-chat',
    name: 'Conversation',
    description: 'Pose ta première question au Coach IA',
    icon: MessageCircle,
    category: 'debutant',
    color: 'from-blue-500 to-indigo-600',
    criteria: '1 conversation',
  },
  {
    id: 'first-article',
    name: 'Curieux',
    description: 'Lis ton premier article Learn',
    icon: BookOpen,
    category: 'debutant',
    color: 'from-violet-500 to-purple-600',
    criteria: '1 article lu',
  },
  {
    id: 'week-streak',
    name: 'Régulier',
    description: "Connecte-toi 7 jours d'affilée",
    icon: Flame,
    category: 'debutant',
    color: 'from-orange-500 to-amber-600',
    criteria: '7 jours de suite',
  },
  {
    id: 'profile-complete',
    name: 'Profil complet',
    description: 'Complète tes informations personnelles',
    icon: Heart,
    category: 'debutant',
    color: 'from-rose-500 to-pink-600',
    criteria: 'Nom + avatar',
  },
  // Intermédiaire
  {
    id: 'three-reports',
    name: 'Suivi actif',
    description: 'Upload 3 rapports pour suivre ton évolution',
    icon: Target,
    category: 'intermediaire',
    color: 'from-cyan-500 to-blue-600',
    criteria: '3 rapports',
  },
  {
    id: 'five-articles',
    name: 'Érudit',
    description: 'Lis 5 articles dans Learn',
    icon: Brain,
    category: 'intermediaire',
    color: 'from-indigo-500 to-violet-600',
    criteria: '5 articles',
  },
  {
    id: 'coach-regular',
    name: 'Coach fidèle',
    description: '10 conversations avec le Coach IA',
    icon: MessageCircle,
    category: 'intermediaire',
    color: 'from-sky-500 to-cyan-600',
    criteria: '10 conversations',
  },
  {
    id: 'biomarkers-added',
    name: 'Data Master',
    description: 'Ajoute des données biomarqueurs manuellement',
    icon: Zap,
    category: 'intermediaire',
    color: 'from-yellow-500 to-orange-600',
    criteria: 'Données ajoutées',
  },
  {
    id: 'month-streak',
    name: 'Déterminé',
    description: '30 jours de connexion consécutifs',
    icon: Flame,
    category: 'intermediaire',
    color: 'from-red-500 to-rose-600',
    criteria: '30 jours',
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Membre depuis le lancement',
    icon: Star,
    category: 'intermediaire',
    color: 'from-amber-500 to-yellow-600',
    criteria: 'Membre fondateur',
  },
  // Expert
  {
    id: 'ten-reports',
    name: 'Archiviste',
    description: '10 rapports SystemAge dans ton historique',
    icon: Trophy,
    category: 'expert',
    color: 'from-amber-400 to-yellow-500',
    criteria: '10 rapports',
  },
  {
    id: 'learn-master',
    name: 'Maître Learn',
    description: "Lis tous les articles d'une catégorie",
    icon: Leaf,
    category: 'expert',
    color: 'from-green-500 to-emerald-600',
    criteria: 'Catégorie complète',
  },
  {
    id: 'coach-expert',
    name: 'Expert Coach',
    description: '50 conversations avec le Coach IA',
    icon: Dumbbell,
    category: 'expert',
    color: 'from-slate-600 to-slate-800',
    criteria: '50 conversations',
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: '100 jours de streak',
    icon: Crown,
    category: 'expert',
    color: 'from-amber-300 via-yellow-400 to-amber-500',
    criteria: '100 jours',
  },
  {
    id: 'legend',
    name: 'Légende',
    description: 'Débloque tous les badges',
    icon: Sparkles,
    category: 'expert',
    color: 'from-purple-400 via-pink-500 to-rose-500',
    criteria: 'Tous les badges',
  },
];

export const BADGE_CATEGORIES: Record<
  BadgeCategory,
  { label: string; count: number }
> = {
  debutant: { label: 'Débutant', count: 5 },
  intermediaire: { label: 'Intermédiaire', count: 6 },
  expert: { label: 'Expert', count: 5 },
};
