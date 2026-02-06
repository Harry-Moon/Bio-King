'use client';

import { Switch } from '@/components/ui/switch';
import { productCategories } from '@/lib/data/marketplace-products';
import { BODY_SYSTEMS } from '@/lib/types/systemage';
import type { ProductCategory } from '@/lib/types/marketplace';
import { GripVertical, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogFiltersProps {
  typeFilter: ProductCategory;
  systemFilter: string | null;
  visibleInMarketplace: boolean;
  featuredRow: boolean;
  onTypeFilterChange: (filter: ProductCategory) => void;
  onSystemFilterChange: (filter: string | null) => void;
  onVisibleInMarketplaceChange: (value: boolean) => void;
  onFeaturedRowChange: (value: boolean) => void;
}

export function CatalogFilters({
  typeFilter,
  systemFilter,
  visibleInMarketplace,
  featuredRow,
  onTypeFilterChange,
  onSystemFilterChange,
  onVisibleInMarketplaceChange,
  onFeaturedRowChange,
}: CatalogFiltersProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supplement':
        return '💊';
      case 'service':
      case 'therapy':
        return '🔗';
      case 'protocol':
        return '☁️';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Structure */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <GripVertical className="h-4 w-4" />
          <span>Structure</span>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => onTypeFilterChange('all')}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              typeFilter === 'all'
                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            <span>📋</span>
            <span>All items</span>
          </button>
          {productCategories
            .filter((cat) => cat.value !== 'all')
            .map((category) => (
              <button
                key={category.value}
                onClick={() => onTypeFilterChange(category.value)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  typeFilter === category.value
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <span>{getTypeIcon(category.value)}</span>
                <span>
                  {category.value === 'inflammation'
                    ? 'Clinical services'
                    : category.value === 'metabolism'
                      ? 'Supplements'
                      : category.value === 'cognitive'
                        ? 'Digital protocols'
                        : category.label}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Biological Systems */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Biological systems</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {BODY_SYSTEMS.slice(0, 6).map((system) => (
            <button
              key={system}
              onClick={() =>
                onSystemFilterChange(systemFilter === system ? null : system)
              }
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                systemFilter === system
                  ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent/50'
              )}
            >
              {system.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Publishing */}
      <div>
        <div className="mb-3 text-sm font-medium text-muted-foreground">
          Publishing
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Visible in Marketplace</span>
            <Switch
              checked={visibleInMarketplace}
              onCheckedChange={onVisibleInMarketplaceChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Featured row</span>
            <Switch
              checked={featuredRow}
              onCheckedChange={onFeaturedRowChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
