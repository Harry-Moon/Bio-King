'use client';

import { AlertTriangle, Award, Info } from 'lucide-react';
import Link from 'next/link';
import type { BioProduct } from '@/lib/types/marketplace';
import { cn } from '@/lib/utils';

interface HeroCardProps {
  product: BioProduct;
  onReserve: (productId: string) => void;
}

/**
 * Grande carte Hero pour les services premium (ex: Session TPE)
 */
export function HeroCard({ product, onReserve }: HeroCardProps) {
  const badge = product.badge;
  const featured = product.featuredData;

  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all hover:shadow-xl"
    >
      {/* Badge Action Requise */}
      {badge && badge.type === 'action_required' && (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-md border border-orange-500/50 bg-black/80 px-3 py-1.5 text-xs font-semibold text-orange-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          {badge.text}
        </div>
      )}

      {/* Prix */}
      <div className="absolute right-4 top-4 z-10 rounded-lg bg-black/80 px-3 py-1.5 text-lg font-bold text-white">
        {product.price.toLocaleString('fr-FR')}€
      </div>

      {/* Image */}
      <div className="relative h-64 w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Contenu */}
      <div className="space-y-4 p-6">
        {/* Titre */}
        <h3 className="text-2xl font-bold text-foreground">{product.name}</h3>

        {/* Gold Standard Badge */}
        {featured?.clinicalStandard && (
          <div className="flex items-center gap-2 text-sm text-yellow-500">
            <Award className="h-4 w-4" />
            <span className="font-medium">{featured.clinicalStandard}</span>
          </div>
        )}

        {/* Description détaillée */}
        {(product.detailedDescription || product.description) && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.detailedDescription || product.description}
          </p>
        )}

        {/* Recommandation pour */}
        {featured?.recommendedFor && (
          <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-sm">
            <span className="text-muted-foreground">Recommandé pour : </span>
            <span className="font-medium text-foreground">
              {featured.recommendedFor}
            </span>
          </div>
        )}

        {/* Médecin requis */}
        {featured?.doctorRequired && (
          <div className="flex items-center gap-2 text-sm text-orange-500">
            <Info className="h-4 w-4" />
            <span>Médecin Requis</span>
          </div>
        )}

        {/* Bouton Réserver */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReserve(product.id);
          }}
          className="w-full rounded-lg bg-green-500 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-green-600 active:scale-[0.98]"
        >
          Réserver Session →
        </button>
      </div>
    </Link>
  );
}
