'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { HeroCard } from '@/components/marketplace/hero-card';
import { ProductCard } from '@/components/marketplace/product-card';

const ProtocolSidebar = nextDynamic(
  () =>
    import('@/components/marketplace/protocol-sidebar').then(
      (mod) => mod.ProtocolSidebar
    ),
  { ssr: false }
);
import { productCategories } from '@/lib/data/marketplace-products';
import { getAllProducts } from '@/lib/data/marketplace-products-db';
import type {
  BioProduct,
  ProductCategory,
  ProductType,
  UserProtocol,
  ProtocolItem,
  SystemCoverage,
} from '@/lib/types/marketplace';
import type { BodySystem } from '@/lib/types/systemage';
import { Flame, Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateProductScore,
  calculateSystemCoverage,
} from '@/lib/utils/marketplace-scoring';

/**
 * Page Marketplace Intervention
 * Marketplace dynamique de biohacking avec recommandations intelligentes
 */
export const dynamic = 'force-dynamic';

function MarketplaceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get('reportId');

  // État des filtres
  const [activeFilter, setActiveFilter] = useState<ProductCategory>('all');
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all');
  const [sortBy, setSortBy] = useState<
    'relevance' | 'price_asc' | 'price_desc'
  >('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // État de la recherche
  const [searchQuery, setSearchQuery] = useState('');

  // État du protocole utilisateur
  const [protocol, setProtocol] = useState<UserProtocol>({
    items: [],
    totalPrice: 0,
    systemCoverage: [],
    weekNumber: 42,
  });

  // État des données du rapport (pour recommandations intelligentes)
  const [bodySystems, setBodySystems] = useState<BodySystem[]>([]);

  // État de visibilité de la sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // État des produits
  const [allProducts, setAllProducts] = useState<BioProduct[]>([]);

  // Charger les produits au montage
  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await getAllProducts(false); // Seulement les actifs
        setAllProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
    loadProducts();
  }, []);

  // Gérer l'ajout depuis l'URL (ex: ?add=product-id)
  useEffect(() => {
    const addParam = searchParams.get('add');
    if (addParam && user && allProducts.length > 0) {
      const product = allProducts.find((p) => p.id === addParam);
      if (
        product &&
        !protocol.items.some((item) => item.productId === addParam)
      ) {
        const newItem: ProtocolItem = {
          productId: product.id,
          product,
          frequency: product.type === 'therapy' ? 'appointment' : 'monthly',
          addedAt: new Date(),
        };
        setProtocol((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
        setIsSidebarOpen(true);
      }
      // Nettoyer l'URL
      router.replace('/marketplace');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, allProducts]);

  // Charger les données du rapport pour les recommandations
  useEffect(() => {
    if (!user) return;

    async function loadReportData() {
      if (!user) return; // Vérification supplémentaire pour TypeScript
      try {
        let targetReportId = reportId;

        // Si pas de reportId, charger le plus récent
        if (!targetReportId) {
          const { data: reports, error: reportError } = await supabase
            .from('systemage_reports')
            .select('id')
            .eq('user_id', user.id)
            .order('upload_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (reportError) throw reportError;
          if (!reports) return; // Pas de rapport disponible

          targetReportId = reports.id;
        }

        // Charger les systèmes corporels
        const { data: systemsData, error } = await supabase
          .from('body_systems')
          .select('*')
          .eq('report_id', targetReportId)
          .order('age_difference', { ascending: false });

        if (error) throw error;
        if (systemsData) {
          const systems = systemsData.map((s: any) => ({
            id: s.id,
            reportId: s.report_id,
            systemName: s.system_name,
            systemAge: s.system_age,
            bioNoise: s.bio_noise,
            ageDifference: s.age_difference,
            agingStage: s.aging_stage,
            agingSpeed: s.aging_speed,
            percentileRank: s.percentile_rank,
            createdAt: new Date(s.created_at),
          }));
          setBodySystems(systems);
        }
      } catch (err) {
        console.error('Error loading report data:', err);
        // Continuer sans données de rapport (mode démo)
      }
    }

    loadReportData();
  }, [user, reportId]);

  // Filtrer et recommander les produits
  const filteredProducts = useMemo(() => {
    let products = allProducts.filter((p) => p.isActive);

    // Filtre par catégorie
    if (activeFilter !== 'all') {
      products = products.filter((p) => p.category === activeFilter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      products = products.filter((p) => p.type === typeFilter);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.detailedDescription?.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    // Tri
    if (sortBy === 'price_asc') {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products = [...products].sort((a, b) => b.price - a.price);
    } else {
      products = products.sort((a, b) => {
        const scoreA = calculateProductScore(a, bodySystems);
        const scoreB = calculateProductScore(b, bodySystems);
        return scoreB - scoreA;
      });
    }

    return products;
  }, [allProducts, activeFilter, typeFilter, bodySystems, searchQuery, sortBy]);

  // Séparer Hero et Products (utiliser displayType si disponible, sinon isHero)
  const heroProducts = filteredProducts.filter(
    (p) => p.displayType === 'hero' || (p.displayType === undefined && p.isHero)
  );
  const regularProducts = filteredProducts.filter(
    (p) =>
      p.displayType !== 'hero' && !(p.displayType === undefined && p.isHero)
  );

  // Calculer la couverture systémique
  useEffect(() => {
    const coverage = calculateSystemCoverage(protocol.items, bodySystems);
    const totalPrice = protocol.items.reduce(
      (sum, item) => sum + item.product.price,
      0
    );

    setProtocol((prev) => ({
      ...prev,
      systemCoverage: coverage,
      totalPrice,
    }));
  }, [protocol.items, bodySystems]);

  // Handlers
  const handleAddToProtocol = (productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    // Vérifier si déjà présent
    if (protocol.items.some((item) => item.productId === productId)) {
      return;
    }

    const newItem: ProtocolItem = {
      productId: product.id,
      product,
      frequency: product.type === 'therapy' ? 'appointment' : 'monthly',
      addedAt: new Date(),
    };

    setProtocol((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Ouvrir la sidebar lors de l'ajout
    setIsSidebarOpen(true);
  };

  const handleRemoveFromProtocol = (productId: string) => {
    setProtocol((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }));
  };

  const handleReserve = (productId: string) => {
    handleAddToProtocol(productId);
    setIsSidebarOpen(true);
    // TODO: Ouvrir modal de réservation
  };

  const handleValidateProtocol = () => {
    // TODO: Implémenter la validation du protocole
    console.log('Validating protocol:', protocol);
    alert('Protocole validé ! (Fonctionnalité à implémenter)');
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Contenu principal */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Marketplace Intervention
          </h1>
          <p className="mt-1 hidden text-muted-foreground md:mt-2 md:block">
            Construisez votre protocole de longévité personnalisé.
          </p>
        </div>

        {/* Ligne 1 - Search + Filter + Sort */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground md:h-5 md:w-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 md:py-3 md:pl-10 md:pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setFiltersOpen(!filtersOpen);
                  setSortDropdownOpen(false);
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium md:px-4',
                  filtersOpen
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtres</span>
              </button>
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen);
                  setFiltersOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 md:px-4"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    sortDropdownOpen && 'rotate-180'
                  )}
                />
                <span className="hidden sm:inline">
                  {sortBy === 'relevance' && 'Pertinence'}
                  {sortBy === 'price_asc' && 'Prix ↑'}
                  {sortBy === 'price_desc' && 'Prix ↓'}
                </span>
              </button>
              {sortDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortDropdownOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg">
                    <button
                      onClick={() => {
                        setSortBy('relevance');
                        setSortDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm',
                        sortBy === 'relevance'
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'text-muted-foreground hover:bg-accent/50'
                      )}
                    >
                      Pertinence
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('price_asc');
                        setSortDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm',
                        sortBy === 'price_asc'
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'text-muted-foreground hover:bg-accent/50'
                      )}
                    >
                      Prix croissant
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('price_desc');
                        setSortDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm',
                        sortBy === 'price_desc'
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'text-muted-foreground hover:bg-accent/50'
                      )}
                    >
                      Prix décroissant
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ligne 2 - Catégories (thèmes) : scroll horizontal sur mobile */}
          <div className="-mx-6 overflow-x-auto overscroll-x-contain px-6 scroll-smooth scrollbar-hide md:mx-0 md:overflow-visible md:px-0">
            <div className="flex gap-2 md:flex-wrap">
              {productCategories.map((category) => {
                const isActive = activeFilter === category.value;
                const isPriority = 'priority' in category && category.priority;

                return (
                  <button
                    key={category.value}
                    onClick={() =>
                      setActiveFilter(category.value as ProductCategory)
                    }
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      isActive
                        ? isPriority
                          ? 'bg-orange-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'border border-border bg-card text-muted-foreground hover:bg-accent/50'
                    )}
                  >
                    {isPriority && <Flame className="mr-1 inline h-3 w-3" />}
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panneau Filtres (mobile) - type de produit */}
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-200 md:!grid-rows-[1fr]',
              filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="overflow-hidden md:contents">
              <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card/50 p-4 md:hidden">
                <span className="w-full text-sm font-medium text-muted-foreground">
                  Type de produit
                </span>
                <button
                  onClick={() => setTypeFilter('all')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium',
                    typeFilter === 'all'
                      ? 'bg-green-500 text-white'
                      : 'border border-border bg-card'
                  )}
                >
                  Tous
                </button>
                <button
                  onClick={() =>
                    setTypeFilter(
                      typeFilter === 'supplement' ? 'all' : 'supplement'
                    )
                  }
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium',
                    typeFilter === 'supplement'
                      ? 'bg-green-500 text-white'
                      : 'border border-border bg-card'
                  )}
                >
                  Suppléments
                </button>
                <button
                  onClick={() =>
                    setTypeFilter(typeFilter === 'service' ? 'all' : 'service')
                  }
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium',
                    typeFilter === 'service'
                      ? 'bg-green-500 text-white'
                      : 'border border-border bg-card'
                  )}
                >
                  Services
                </button>
                <button
                  onClick={() =>
                    setTypeFilter(typeFilter === 'therapy' ? 'all' : 'therapy')
                  }
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium',
                    typeFilter === 'therapy'
                      ? 'bg-green-500 text-white'
                      : 'border border-border bg-card'
                  )}
                >
                  Thérapies
                </button>
                <button
                  onClick={() =>
                    setTypeFilter(
                      typeFilter === 'protocol' ? 'all' : 'protocol'
                    )
                  }
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium',
                    typeFilter === 'protocol'
                      ? 'bg-green-500 text-white'
                      : 'border border-border bg-card'
                  )}
                >
                  Protocoles
                </button>
              </div>
            </div>
          </div>

          {/* Desktop: filtre type visible */}
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <span className="text-sm text-muted-foreground">Type :</span>
            {(
              [
                { value: 'all', label: 'Tous' },
                { value: 'supplement', label: 'Suppléments' },
                { value: 'service', label: 'Services' },
                { value: 'therapy', label: 'Thérapies' },
                { value: 'protocol', label: 'Protocoles' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() =>
                  setTypeFilter(typeFilter === value ? 'all' : value)
                }
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium',
                  typeFilter === value
                    ? 'bg-green-500 text-white'
                    : 'border border-border bg-card text-muted-foreground hover:bg-accent/50'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Products */}
        {heroProducts.length > 0 && (
          <div className="space-y-4">
            {heroProducts.map((product) => (
              <HeroCard
                key={product.id}
                product={product}
                onReserve={handleReserve}
              />
            ))}
          </div>
        )}

        {/* Regular Products Grid */}
        {regularProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAddToProtocol}
              />
            ))}
          </div>
        )}

        {/* Message si aucun produit */}
        {filteredProducts.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Aucun produit trouvé pour cette catégorie.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar Protocole - Affichée uniquement si ouverte */}
      {isSidebarOpen && (
        <ProtocolSidebar
          protocol={protocol}
          onRemoveItem={handleRemoveFromProtocol}
          onValidateProtocol={handleValidateProtocol}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
