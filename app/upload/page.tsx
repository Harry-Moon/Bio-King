'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';
import { useTranslation } from '@/lib/i18n/use-translation';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setStatus('idle');
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Rediriger vers login si non authentifié (effet côté client uniquement)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si pas d'utilisateur, retourner null (la redirection est en cours)
  if (!user) {
    return null;
  }

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setProgress(0);
    setError(null);

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', selectedFile);
      // Utiliser le vrai userId de l'utilisateur connecté
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
      setReportId(data.reportId);
      setStatus('success');

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push(`/dashboard?reportId=${data.reportId}`);
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold">{t('upload.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('upload.subtitle')}
            </p>
          </div>

          {/* Upload zone */}
          <div
            {...getRootProps()}
            className={cn(
              'relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
              status === 'uploading' && 'pointer-events-none opacity-50'
            )}
          >
            <input {...getInputProps()} />

            {!selectedFile ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-6">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="mb-2 text-xl font-semibold">
                    {isDragActive ? t('upload.dropHere') : t('upload.dragHere')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('upload.clickToSelect')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('upload.pdfOnly')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-6">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="mb-1 text-xl font-semibold">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {selectedFile && status === 'idle' && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setSelectedFile(null)}
                className="flex-1 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-muted"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('upload.analyzeReport')}
              </button>
            </div>
          )}

          {/* Progress */}
          {status === 'uploading' && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t('upload.analysisInProgress')}
                </span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('upload.extractionTime')}</span>
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="mt-6 rounded-lg border border-green-500/50 bg-green-500/10 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-500">
                    {t('upload.analysisSuccess')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('upload.redirecting')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-destructive" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">
                    {t('upload.uploadError')}
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStatus('idle');
                  setError(null);
                }}
                className="mt-4 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                {t('upload.retry')}
              </button>
            </div>
          )}

          {/* Info */}
          <div className="mt-12 rounded-lg border bg-muted/50 p-6">
            <h3 className="mb-3 font-semibold">{t('upload.aboutAnalysis')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                <span>{t('upload.biomarkers400')}</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>{t('upload.systems19')}</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>{t('upload.personalizedRecs')}</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>{t('upload.interactiveViz')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
