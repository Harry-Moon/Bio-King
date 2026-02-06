'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Upload, Calendar, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';
import type { SystemAgeReport } from '@/lib/types/systemage';

interface LastUploadInfoProps {
  report: SystemAgeReport | null;
}

/**
 * Composant affichant la date du dernier upload et permettant d'uploader un nouveau rapport
 */
export function LastUploadInfo({ report }: LastUploadInfoProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || !user) return;

      const selectedFile = acceptedFiles[0];
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Simuler la progression
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userId', user.id);

        const response = await fetch('/api/upload-pdf', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        setIsUploading(false);

        // Rediriger vers le dashboard avec le nouveau rapport
        router.push(`/dashboard?reportId=${data.reportId}`);
        router.refresh();
      } catch (err) {
        console.error('Upload error:', err);
        setIsUploading(false);
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [user, router]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    noClick: true,
    noKeyboard: true,
  });

  const handleUploadClick = () => {
    open();
  };

  const formatUploadDate = (date: Date): string => {
    try {
      return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return format(date, 'dd/MM/yyyy HH:mm');
    }
  };

  return (
    <div className="relative">
      <div {...getRootProps()} />

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        {/* Date du dernier upload */}
        {report ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              Dernier upload :{' '}
              <span className="font-medium text-foreground">
                {formatUploadDate(report.uploadDate)}
              </span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Aucun rapport uploadé</span>
          </div>
        )}

        {/* Bouton d'upload */}
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed',
            isUploading && 'cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Upload en cours... {progress}%</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Uploader un rapport</span>
            </>
          )}
        </button>

        {/* Message d'erreur */}
        {error && (
          <div className="absolute right-0 top-full z-10 mt-2 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="rounded p-0.5 hover:bg-destructive/20"
              aria-label="Fermer l'erreur"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
