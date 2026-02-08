'use client';

import { useState, useMemo, useEffect } from 'react';
import { CatalogTable } from '@/components/admin/catalog-table';
import { CatalogFilters } from '@/components/admin/catalog-filters';
import { ItemBuilder } from '@/components/admin/item-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Plus, Loader2 } from 'lucide-react';
import {
  getAllProducts,
  updateProduct,
  createProduct,
} from '@/lib/data/admin-products';
import type { BioProduct, ProductCategory } from '@/lib/types/marketplace';

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<BioProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<BioProduct | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProductCategory>('all');
  const [systemFilter, setSystemFilter] = useState<string | null>(null);
  const [visibleInMarketplace, setVisibleInMarketplace] = useState(true);
  const [featuredRow, setFeaturedRow] = useState(false);

  // Charger les produits au montage
  useEffect(() => {
    async function loadProducts() {
      try {
        const allProducts = await getAllProducts(true); // Inclure les inactifs pour les admins
        setProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Recharger les produits depuis la DB après chaque mise à jour
  const refreshProducts = async () => {
    try {
      const allProducts = await getAllProducts(true);
      setProducts(allProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query)
      );
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((p) => p.category === typeFilter);
    }

    // Filtre par système biologique
    if (systemFilter) {
      filtered = filtered.filter(
        (p) =>
          p.primarySystem === systemFilter ||
          p.secondarySystems?.includes(systemFilter)
      );
    }

    // Filtre par visibilité marketplace
    if (visibleInMarketplace) {
      filtered = filtered.filter((p) => p.isActive);
    }

    // Filtre par featured row
    if (featuredRow) {
      filtered = filtered.filter((p) => p.displayType === 'hero' || p.isHero);
    }

    return filtered;
  }, [
    products,
    searchQuery,
    typeFilter,
    systemFilter,
    visibleInMarketplace,
    featuredRow,
  ]);

  const handleProductSelect = (product: BioProduct) => {
    setSelectedProduct(product);
  };

  const handleProductUpdate = async (
    updatedProduct: BioProduct,
    skipRefresh = false
  ) => {
    // Mettre à jour dans la DB
    const result = await updateProduct(updatedProduct.id, updatedProduct);
    if (result) {
      // Recharger depuis la DB pour synchroniser avec la marketplace
      // Sauf si skipRefresh est true (cas de l'upload d'image qui met déjà à jour la DB)
      if (!skipRefresh) {
        await refreshProducts();
      }
      // Mettre à jour le produit sélectionné avec la version mise à jour
      // Seulement si la popin est déjà ouverte (pour éviter de la rouvrir)
      if (selectedProduct && selectedProduct.id === updatedProduct.id) {
        setSelectedProduct(result);
      }
    }
  };

  const handleNewProduct = async () => {
    const newProduct = await createProduct({
      name: 'New Product',
      category: 'inflammation',
      type: 'supplement',
      price: 0,
      currency: 'EUR',
      description: '',
      image:
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      isHero: false,
      displayType: 'grid',
      tags: [],
      isActive: false,
      billingModel: 'one-time',
    });

    if (newProduct) {
      await refreshProducts();
      setSelectedProduct(newProduct);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-64 flex-shrink-0 space-y-6">
          <CatalogFilters
            typeFilter={typeFilter}
            systemFilter={systemFilter}
            visibleInMarketplace={visibleInMarketplace}
            featuredRow={featuredRow}
            onTypeFilterChange={setTypeFilter}
            onSystemFilterChange={setSystemFilter}
            onVisibleInMarketplaceChange={setVisibleInMarketplace}
            onFeaturedRowChange={setFeaturedRow}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Catalog Admin</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Create and manage products & services powering the Bio King
                marketplace.
              </p>
            </div>

            {/* Search and New Item */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items by name, system, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
              <Button onClick={handleNewProduct} className="bg-green-500">
                <Plus className="mr-2 h-4 w-4" />
                New item
              </Button>
            </div>
          </div>

          {/* Catalog Dashboard */}
          <div className="space-y-4">
            <CatalogTable
              products={filteredProducts}
              selectedProduct={selectedProduct}
              onProductSelect={handleProductSelect}
              onProductUpdate={handleProductUpdate}
            />
          </div>
        </div>
      </div>

      {/* Item Builder Modal */}
      <Dialog
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <ItemBuilder
              product={selectedProduct}
              onUpdate={(updatedProduct) => {
                handleProductUpdate(updatedProduct);
              }}
              onDuplicate={async () => {
                const { duplicateProduct } =
                  await import('@/lib/data/admin-products');
                const duplicated = await duplicateProduct(selectedProduct.id);
                if (duplicated) {
                  await refreshProducts();
                  setSelectedProduct(duplicated);
                }
              }}
              onArchive={() => {
                handleProductUpdate({ ...selectedProduct, isActive: false });
                setSelectedProduct(null);
              }}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
