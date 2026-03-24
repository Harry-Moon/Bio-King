'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock } from 'lucide-react';
import { getArticleBySlug } from '@/lib/data/learn-articles-db';
import type { LearnArticle } from '@/lib/types/learn';
import { useLearnTranslations } from '@/lib/i18n/use-learn-translations';
import { LevelBadge } from '@/components/learn/level-badge';

/**
 * Page détail d'un article Learn
 */
export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { getThemeLabel, getContentTypeLabel, t } = useLearnTranslations();

  const [article, setArticle] = useState<LearnArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      try {
        const data = await getArticleBySlug(slug);
        setArticle(data);
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('learn.backToArticles')}
        </Link>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">{t('learn.articleNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      {/* Retour */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('learn.backToArticles')}
      </Link>

      {/* En-tête */}
      <header className="space-y-4">
        <span className="inline-block rounded bg-green-500/15 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
          {getContentTypeLabel(article.contentType)}
        </span>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.readingTimeMinutes} {t('learn.minRead')}
          </span>
          <LevelBadge level={article.level} size="md" />
          {article.themes.length > 0 && (
            <div className="flex gap-2">
              {article.themes.map((theme) => (
                <span
                  key={theme}
                  className="rounded bg-muted px-2 py-0.5 text-xs"
                >
                  #{getThemeLabel(theme)}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Image de couverture */}
      {article.coverImage && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Contenu */}
      <div className="prose prose-invert max-w-none dark:prose-invert">
        {article.content ? (
          <div
            dangerouslySetInnerHTML={{
              __html:
                article.content.startsWith('<') ||
                article.content.includes('<p>')
                  ? article.content
                  : `<p>${article.content.replace(/\n/g, '</p><p>')}</p>`,
            }}
          />
        ) : (
          <p className="text-muted-foreground">{article.excerpt}</p>
        )}
      </div>
    </article>
  );
}
