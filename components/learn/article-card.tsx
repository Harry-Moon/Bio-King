'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  ThumbsUp,
  Bookmark,
  Share2,
  FileText,
  FlaskConical,
} from 'lucide-react';
import type { LearnArticle } from '@/lib/types/learn';
import { useLearnTranslations } from '@/lib/i18n/use-learn-translations';
import { LevelBadge } from '@/components/learn/level-badge';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: LearnArticle;
}

const CONTENT_TYPE_ICONS = {
  article: FileText,
  protocol: FileText,
  clinical_study: FlaskConical,
} as const;

/**
 * Carte article pour l'espace Learn
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const { getThemeLabel, getContentTypeLabel } = useLearnTranslations();
  const TypeIcon = CONTENT_TYPE_ICONS[article.contentType];
  const contentTypeLabel = getContentTypeLabel(article.contentType);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <Link
      href={`/learn/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md"
    >
      {/* Image de couverture */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={
            article.coverImage ||
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'
          }
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badge type de contenu */}
        <div
          className={cn(
            'absolute left-2 top-2 flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold',
            article.contentType === 'article' && 'bg-white/90 text-foreground',
            article.contentType === 'protocol' && 'bg-green-500/90 text-white',
            article.contentType === 'clinical_study' &&
              'bg-orange-500/90 text-white'
          )}
        >
          <TypeIcon className="h-3 w-3" />
          {contentTypeLabel.toUpperCase()}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground line-clamp-2">
            {article.title}
          </h3>
          <LevelBadge level={article.level} size="sm" className="shrink-0" />
        </div>

        <p className="mb-3 flex-1 text-sm text-muted-foreground line-clamp-2">
          {article.excerpt}
        </p>

        {/* Tags thématiques (traduits selon la langue) */}
        {article.themes.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {article.themes.slice(0, 4).map((theme) => (
              <span
                key={theme}
                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{getThemeLabel(theme)}
              </span>
            ))}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTimeMinutes} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
              {formatCount(article.likesCount)}
            </span>
            <button
              onClick={(e) => e.preventDefault()}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Sauvegarder"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Partager"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
