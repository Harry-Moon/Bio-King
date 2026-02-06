'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HeroCard } from '@/components/marketplace/hero-card';
import { ProductCard } from '@/components/marketplace/product-card';
import { Check, Eye, Copy, Archive, Link as LinkIcon } from 'lucide-react';
import type {
  BioProduct,
  DisplayType,
  BillingModel,
} from '@/lib/types/marketplace';
import { BODY_SYSTEMS } from '@/lib/types/systemage';
import { formatDistanceToNow } from 'date-fns';

interface ItemBuilderProps {
  product: BioProduct;
  onUpdate: (product: BioProduct) => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onClose?: () => void;
}

export function ItemBuilder({
  product,
  onUpdate,
  onDuplicate,
  onArchive,
  onClose,
}: ItemBuilderProps) {
  const [formData, setFormData] = useState<Partial<BioProduct>>(product);
  const [showPreview, setShowPreview] = useState(false);
  const [clinicalRefs, setClinicalRefs] = useState<string>(
    product.clinicalReferences?.join('\n') || ''
  );

  // Mettre à jour le formData quand le produit change
  useEffect(() => {
    setFormData(product);
    setClinicalRefs(product.clinicalReferences?.join('\n') || '');
  }, [product]);

  const handleFieldChange = (field: keyof BioProduct, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
  };

  const handleSave = () => {
    const updated: BioProduct = {
      ...product,
      ...formData,
      clinicalReferences: clinicalRefs
        .split('\n')
        .filter((ref) => ref.trim())
        .map((ref) => ref.trim()),
      updatedAt: new Date(),
      // Mettre à jour isHero basé sur displayType
      isHero: formData.displayType === 'hero' || formData.isHero || false,
    };
    onUpdate(updated);
    // Fermer la modale après sauvegarde
    if (onClose) {
      onClose();
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const displayType =
    formData.displayType || (product.isHero ? 'hero' : 'grid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Item builder</h3>
          <p className="text-sm text-muted-foreground">
            Editing: {product.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Check className="h-4 w-4" />
            Clinical evidence linked
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave} className="bg-green-500">
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Type</label>
              <Select
                value={formData.type || 'supplement'}
                onChange={(e) => handleFieldChange('type', e.target.value)}
              >
                <option value="supplement">Supplement</option>
                <option value="service">Service</option>
                <option value="therapy">Therapy</option>
                <option value="protocol">Protocol</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Short description
              </label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Price</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) =>
                    handleFieldChange('price', parseFloat(e.target.value) || 0)
                  }
                />
                <span className="text-sm text-muted-foreground">EUR</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Billing model
              </label>
              <Select
                value={formData.billingModel || 'one-time'}
                onChange={(e) =>
                  handleFieldChange(
                    'billingModel',
                    e.target.value as BillingModel
                  )
                }
              >
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="per-session">Per session</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Categorization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Primary biological system
              </label>
              <Select
                value={formData.primarySystem || ''}
                onChange={(e) =>
                  handleFieldChange(
                    'primarySystem',
                    e.target.value || undefined
                  )
                }
              >
                <option value="">Select a system</option>
                {BODY_SYSTEMS.map((system) => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Secondary systems
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.secondarySystems?.map((system) => (
                  <span
                    key={system}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs"
                  >
                    {system.split(' ')[0]}
                    <button
                      onClick={() => {
                        const updated = formData.secondarySystems?.filter(
                          (s) => s !== system
                        );
                        handleFieldChange('secondarySystems', updated);
                      }}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <Select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const current = formData.secondarySystems || [];
                      if (!current.includes(e.target.value)) {
                        handleFieldChange('secondarySystems', [
                          ...current,
                          e.target.value,
                        ]);
                      }
                      e.target.value = '';
                    }
                  }}
                  className="w-auto"
                >
                  <option value="">+ Add</option>
                  {BODY_SYSTEMS.filter((s) => s !== formData.primarySystem).map(
                    (system) => (
                      <option key={system} value={system}>
                        {system}
                      </option>
                    )
                  )}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Logic */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Display Logic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Display format
              </label>
              <Select
                value={displayType}
                onChange={(e) =>
                  handleFieldChange(
                    'displayType',
                    e.target.value as DisplayType
                  )
                }
              >
                <option value="grid">Case simple / Standard</option>
                <option value="hero">Bandeau / Hero</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clinical References */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Clinical references</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="Link one or more clinician-reviewed articles or protocols that justify this product."
                value={clinicalRefs}
                onChange={(e) => setClinicalRefs(e.target.value)}
                rows={3}
                className="pr-10"
              />
              <LinkIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">
          Last edited{' '}
          {formatDistanceToNow(product.updatedAt || product.createdAt, {
            addSuffix: true,
          })}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDuplicate} className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicate item
          </Button>
          <Button
            variant="outline"
            onClick={onArchive}
            className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {(() => {
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
              return displayType === 'hero' ? (
                <HeroCard product={previewProduct} onReserve={() => {}} />
              ) : (
                <div className="max-w-sm">
                  <ProductCard product={previewProduct} onAdd={() => {}} />
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
