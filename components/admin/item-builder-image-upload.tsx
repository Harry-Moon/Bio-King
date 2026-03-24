'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

interface ItemBuilderImageUploadProps {
  productId: string;
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export function ItemBuilderImageUpload({
  productId,
  imageUrl,
  onImageChange,
}: ItemBuilderImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/admin/products/${productId}/cover`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onImageChange(data.coverUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Image URL
        </label>
        <Input
          type="url"
          value={imageUrl}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Or upload an image
        </label>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="cursor-pointer"
        />
        {uploading && (
          <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>
        )}
      </div>
      {imageUrl && (
        <div className="mt-2 rounded-lg border border-border overflow-hidden">
          <Image
            src={imageUrl}
            alt="Preview"
            width={400}
            height={128}
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
