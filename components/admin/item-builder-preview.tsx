'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HeroCard } from '@/components/marketplace/hero-card';
import { ProductCard } from '@/components/marketplace/product-card';
import type { BioProduct, DisplayType } from '@/lib/types/marketplace';

interface ItemBuilderPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: BioProduct;
  formData: Partial<BioProduct>;
  clinicalRefs: string;
  displayType: string;
}

export function ItemBuilderPreview({
  open,
  onOpenChange,
  product,
  formData,
  clinicalRefs,
  displayType,
}: ItemBuilderPreviewProps) {
  const previewProduct: BioProduct = {
    ...product,
    ...formData,
    clinicalReferences: clinicalRefs
      .split('\n')
      .filter((ref) => ref.trim())
      .map((ref) => ref.trim()),
    isHero: displayType === 'hero',
    displayType: displayType as DisplayType,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Product Preview</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {displayType === 'hero' ? (
            <HeroCard product={previewProduct} onReserve={() => {}} />
          ) : (
            <div className="max-w-sm">
              <ProductCard product={previewProduct} onAdd={() => {}} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
