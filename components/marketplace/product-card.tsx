'use client';

import { Zap, Info, Plus } from 'lucide-react';
import Link from 'next/link';
import type { BioProduct } from '@/lib/types/marketplace';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: BioProduct;
  onAdd: (productId: string) => void;
}

/**
 * Petite carte produit pour les suppléments (ex: Quercetin Complex)
 */
export function ProductCard({ product, onAdd }: ProductCardProps) {
  const badge = product.badge;
  const featured = product.featuredData;

  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md"
    >
      {/* Badge Delta Age */}
      {badge && badge.type === 'age_delta' && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md border border-orange-500/50 bg-black/80 px-2 py-1 text-xs font-semibold text-orange-500">
          <Zap className="h-3 w-3" />
          {badge.value || badge.text}
        </div>
      )}

      {/* Prix */}
      <div className="absolute right-2 top-2 z-10 rounded bg-black/80 px-2 py-1 text-sm font-bold text-white">
        {product.price.toLocaleString('fr-FR')}€
      </div>

      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-4">
        {/* Titre */}
        <h3 className="mb-2 text-base font-semibold text-foreground">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mb-4 flex-1 text-sm text-muted-foreground">
          {product.description}
        </p>

        {/* Bouton Ajouter */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdd(product.id);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Ajouter
          <Info className="ml-auto h-4 w-4 opacity-70" />
        </button>
      </div>
    </Link>
  );
}
