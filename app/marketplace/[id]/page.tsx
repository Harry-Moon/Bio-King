'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllProducts } from '@/lib/data/marketplace-products-db';
import type { BioProduct } from '@/lib/types/marketplace';
import {
  ArrowLeft,
  AlertTriangle,
  Award,
  Info,
  Zap,
  ShoppingCart,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * Page de détail d'un produit
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<BioProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        // Charger depuis Supabase
        const allProducts = await getAllProducts(false); // Seulement les actifs
        const foundProduct = allProducts.find((p) => p.id === productId);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          Produit introuvable
        </h1>
        <Link
          href="/marketplace"
          className="text-green-500 hover:text-green-600 transition-colors"
        >
          Retour à la marketplace
        </Link>
      </div>
    );
  }

  const badge = product.badge;
  const featured = product.featuredData;

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la marketplace
      </Link>

      {/* Header avec image */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        {/* Badge */}
        {badge && (
          <div className="absolute left-6 top-6 z-10">
            {badge.type === 'action_required' && (
              <div className="flex items-center gap-1.5 rounded-md border border-orange-500/50 bg-black/80 px-3 py-1.5 text-xs font-semibold text-orange-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                {badge.text}
              </div>
            )}
            {badge.type === 'age_delta' && (
              <div className="flex items-center gap-1 rounded-md border border-orange-500/50 bg-black/80 px-2 py-1 text-xs font-semibold text-orange-500">
                <Zap className="h-3 w-3" />
                {badge.value || badge.text}
              </div>
            )}
            {badge.type === 'priority' && (
              <div className="rounded-md border border-orange-500/50 bg-black/80 px-2 py-1 text-xs font-semibold text-orange-500">
                {badge.text}
              </div>
            )}
          </div>
        )}

        {/* Image */}
        <div className="relative h-96 w-full overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Informations sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              {featured?.clinicalStandard && (
                <div className="flex items-center gap-2 text-sm text-yellow-500">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">
                    {featured.clinicalStandard}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {product.price.toLocaleString('fr-FR')}€
              </div>
              {product.type === 'therapy' && (
                <div className="mt-1 text-sm text-white/80">Par session</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Description
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{product.description}</p>
              {product.detailedDescription && (
                <p>{product.detailedDescription}</p>
              )}
            </div>
          </div>

          {/* Recommandation pour */}
          {featured?.recommendedFor && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Recommandation
              </h2>
              <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Recommandé pour :
                  </span>{' '}
                  {featured.recommendedFor}
                </p>
              </div>
            </div>
          )}

          {/* Bénéfices cliniques */}
          {featured?.clinicalStandard && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Standard Clinique
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ce produit respecte les standards cliniques les plus élevés et
                est recommandé par les professionnels de santé pour son
                efficacité et sa sécurité.
              </p>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Caractéristiques
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.tags
                  .filter((tag) => tag.visible)
                  .map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Carte d'action */}
          <div className="sticky top-6 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="space-y-4">
              {/* Prix */}
              <div className="border-b border-border/50 pb-4">
                <div className="text-sm text-muted-foreground">Prix</div>
                <div className="text-3xl font-bold text-foreground">
                  {product.price.toLocaleString('fr-FR')}€
                </div>
                {product.type === 'therapy' && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Par session
                  </div>
                )}
                {product.type === 'supplement' && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Prix unitaire
                  </div>
                )}
              </div>

              {/* Informations importantes */}
              <div className="space-y-3">
                {featured?.doctorRequired && (
                  <div className="flex items-start gap-2 rounded-lg border border-orange-500/50 bg-orange-500/10 p-3">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                    <div className="text-xs text-orange-500">
                      <div className="font-semibold">Médecin Requis</div>
                      <div className="mt-1 text-orange-500/80">
                        Ce service nécessite une consultation médicale
                        préalable.
                      </div>
                    </div>
                  </div>
                )}

                {featured?.ageDelta && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3">
                    <Zap className="h-4 w-4 text-green-500" />
                    <div className="text-xs">
                      <div className="font-semibold text-green-500">
                        Potentiel de réduction d&apos;âge
                      </div>
                      <div className="mt-1 text-green-500/80">
                        Jusqu&apos;à {featured.ageDelta} ans de réduction
                        d&apos;âge biologique
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-2 pt-2">
                {product.type === 'therapy' ? (
                  <button
                    onClick={() => {
                      // TODO: Ajouter au protocole et rediriger
                      router.push(`/marketplace?add=${product.id}`);
                    }}
                    className="w-full rounded-lg bg-green-500 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-green-600 active:scale-[0.98]"
                  >
                    <Calendar className="mr-2 inline h-5 w-5" />
                    Réserver Session
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      router.push(`/marketplace?add=${product.id}`);
                    }}
                    className="w-full rounded-lg bg-green-500 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-green-600 active:scale-[0.98]"
                  >
                    <ShoppingCart className="mr-2 inline h-5 w-5" />
                    Ajouter au Protocole
                  </button>
                )}

                {product.externalLink && (
                  <a
                    href={product.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent/50"
                  >
                    En savoir plus
                    <Info className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Garanties */}
              <div className="space-y-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Produit certifié</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Livraison sécurisée</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Support client disponible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
