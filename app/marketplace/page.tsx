'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { HeroCard } from '@/components/marketplace/hero-card';
import { ProductCard } from '@/components/marketplace/product-card';
import { ProtocolSidebar } from '@/components/marketplace/protocol-sidebar';
import { productCategories } from '@/lib/data/marketplace-products';
import { getAllProducts } from '@/lib/data/marketplace-products-db';
import type {
  BioProduct,
  ProductCategory,
  UserProtocol,
  ProtocolItem,
  SystemCoverage,
} from '@/lib/types/marketplace';
import type { BodySystem } from '@/lib/types/systemage';
import { Flame, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // Tri intelligent basé sur les tags et les systèmes corporels
    products = products.sort((a, b) => {
      const scoreA = calculateProductScore(a, bodySystems);
      const scoreB = calculateProductScore(b, bodySystems);
      return scoreB - scoreA;
    });

    return products;
  }, [allProducts, activeFilter, bodySystems, searchQuery]);

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
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Marketplace Intervention
            </h1>
            <p className="mt-2 text-muted-foreground">
              Construisez votre protocole de longévité personnalisé.
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un produit, un supplément ou un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-10 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Barre de Filtres */}
        <div className="flex flex-wrap gap-2">
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
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? isPriority
                      ? 'bg-orange-500 text-white'
                      : 'bg-green-500 text-white'
                    : 'border border-border bg-card text-muted-foreground hover:bg-accent/50'
                )}
              >
                {isPriority && <Flame className="mr-1.5 inline h-3.5 w-3.5" />}
                {category.label}
              </button>
            );
          })}
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

/**
 * Calcule un score de recommandation pour un produit basé sur les systèmes corporels
 */
function calculateProductScore(
  product: BioProduct,
  bodySystems: BodySystem[]
): number {
  if (bodySystems.length === 0) return 0;

  let score = 0;

  // Parcourir les tags du produit
  product.tags.forEach((tag) => {
    if (!tag.systemTargets || tag.systemTargets.length === 0) return;

    // Vérifier chaque système ciblé
    tag.systemTargets.forEach((targetSystem) => {
      const matchingSystem = bodySystems.find(
        (bs) => bs.systemName === targetSystem
      );

      if (matchingSystem) {
        // Plus le système est en retard, plus le score est élevé
        if (matchingSystem.ageDifference > 5) {
          score += 10; // Priorité haute
        } else if (matchingSystem.ageDifference > 0) {
          score += 5; // Priorité moyenne
        }

        // Bonus si le système est en stage Accelerated
        if (matchingSystem.agingStage === 'Accelerated') {
          score += 5;
        }
      }
    });
  });

  return score;
}

/**
 * Calcule la couverture systémique du protocole
 */
function calculateSystemCoverage(
  items: ProtocolItem[],
  bodySystems: BodySystem[]
): SystemCoverage[] {
  if (bodySystems.length === 0) {
    // Mode démo sans données de rapport
    return [
      { systemName: 'Inflammation', coverage: 65, priority: true },
      { systemName: 'Digestif', coverage: 30, priority: false },
      { systemName: 'Cognitif', coverage: 25, priority: false },
    ];
  }

  const coverageMap = new Map<string, number>();

  // Initialiser avec tous les systèmes
  bodySystems.forEach((system) => {
    coverageMap.set(system.systemName, 0);
  });

  // Calculer la couverture basée sur les produits
  items.forEach((item) => {
    item.product.tags.forEach((tag) => {
      if (tag.systemTargets) {
        tag.systemTargets.forEach((targetSystem) => {
          const current = coverageMap.get(targetSystem) || 0;
          // Chaque produit ajoute 20% de couverture (ajustable)
          coverageMap.set(targetSystem, Math.min(100, current + 20));
        });
      }
    });
  });

  // Convertir en array avec priorité, trier par priorité puis par couverture
  return Array.from(coverageMap.entries())
    .map(([systemName, coverage]) => {
      const system = bodySystems.find((bs) => bs.systemName === systemName);
      const priority =
        system !== undefined && system.ageDifference > 5 && coverage > 0;

      return {
        systemName,
        coverage,
        priority,
      };
    })
    .filter((c) => c.coverage > 0) // Ne garder que les systèmes avec couverture
    .sort((a, b) => {
      // Priorité d'abord, puis par couverture décroissante
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return b.coverage - a.coverage;
    });
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
