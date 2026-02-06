'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { GripVertical } from 'lucide-react';
import type { BioProduct } from '@/lib/types/marketplace';
import { cn } from '@/lib/utils';

interface CatalogTableProps {
  products: BioProduct[];
  selectedProduct: BioProduct | null;
  onProductSelect: (product: BioProduct) => void;
  onProductUpdate: (product: BioProduct) => void;
}

export function CatalogTable({
  products,
  selectedProduct,
  onProductSelect,
  onProductUpdate,
}: CatalogTableProps) {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'supplement':
        return 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/50';
      case 'service':
      case 'therapy':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/50';
      case 'protocol':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/50';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getSystemBadgeColor = (system?: string) => {
    if (!system) return 'bg-muted text-muted-foreground';
    // Couleurs basées sur le système
    const colors: Record<string, string> = {
      'Inflammatory Regulation':
        'bg-orange-500/15 text-orange-600 dark:text-orange-400',
      Metabolism: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      'Digestive System': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      'Reproductive System': 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
      'Brain Health and Cognition':
        'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      'Cardiac System': 'bg-red-500/15 text-red-600 dark:text-red-400',
    };
    return colors[system] || 'bg-muted text-muted-foreground';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'supplement':
        return 'Supplement';
      case 'service':
        return 'Service';
      case 'therapy':
        return 'Service';
      case 'protocol':
        return 'Digital';
      default:
        return type;
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>ITEM</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>PRIMARY SYSTEM</TableHead>
              <TableHead>PRICE</TableHead>
              <TableHead>STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isSelected = selectedProduct?.id === product.id;
              return (
                <TableRow
                  key={product.id}
                  onClick={() => onProductSelect(product)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected && 'bg-green-500/10'
                  )}
                >
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {getTypeLabel(product.type)} •{' '}
                          {product.tags
                            .filter((t) => t.visible)
                            .slice(0, 2)
                            .map((t) => t.name)
                            .join(', ')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-1 text-xs font-medium',
                        getTypeBadgeColor(product.type)
                      )}
                    >
                      {getTypeLabel(product.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.primarySystem ? (
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                          getSystemBadgeColor(product.primarySystem)
                        )}
                      >
                        {product.primarySystem.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      €{product.price.toLocaleString('fr-FR')}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={(checked) => {
                        const updated = { ...product, isActive: checked };
                        onProductUpdate(updated);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
