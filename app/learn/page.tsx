'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Grid3X3, ChevronDown, Filter, ChevronUp } from 'lucide-react';
import { ArticleCard } from '@/components/learn/article-card';
import { getAllArticles } from '@/lib/data/learn-articles-db';
import type { LearnArticle } from '@/lib/types/learn';
import { normalizeThemeKey } from '@/lib/types/learn';
import { useLearnTranslations } from '@/lib/i18n/use-learn-translations';
import { LEVEL_CONFIG } from '@/components/learn/level-badge';
import { cn } from '@/lib/utils';

type ContentTypeFilter = 'all' | LearnArticle['contentType'];
type LevelFilter = 'all' | LearnArticle['level'];
type SortOption = 'relevance' | 'recent' | 'reading_time' | 'popularity';

/**
 * Page Learn - Espace d'apprentissage avec articles par thématiques et niveau
 */
export default function LearnPage() {
  const { t, getThemeLabel, getContentTypeLabel, getLevelLabel, themeKeys } =
    useLearnTranslations();
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] =
    useState<ContentTypeFilter>('all');
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await getAllArticles(false);
        setArticles(data);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const filteredAndSortedArticles = useMemo(() => {
    let result = [...articles];

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query) ||
          a.themes.some(
            (theme) =>
              theme.toLowerCase().includes(query) ||
              normalizeThemeKey(theme).toLowerCase().includes(query)
          )
      );
    }

    // Filtre par type de contenu
    if (contentTypeFilter !== 'all') {
      result = result.filter((a) => a.contentType === contentTypeFilter);
    }

    // Filtre par thématique (comparaison par clé normalisée)
    if (themeFilter) {
      result = result.filter((a) =>
        a.themes.some(
          (theme) =>
            normalizeThemeKey(theme).toLowerCase() === themeFilter.toLowerCase()
        )
      );
    }

    // Filtre par niveau
    if (levelFilter !== 'all') {
      result = result.filter((a) => a.level === levelFilter);
    }

    // Tri
    switch (sortBy) {
      case 'recent':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'reading_time':
        result.sort((a, b) => a.readingTimeMinutes - b.readingTimeMinutes);
        break;
      case 'popularity':
        result.sort(
          (a, b) => b.likesCount + b.savesCount - (a.likesCount + a.savesCount)
        );
        break;
      case 'relevance':
      default:
        result.sort((a, b) => a.sortOrder - b.sortOrder || 0);
        break;
    }

    return result;
  }, [
    articles,
    searchQuery,
    contentTypeFilter,
    themeFilter,
    levelFilter,
    sortBy,
  ]);

  const sortLabels: Record<SortOption, string> = {
    relevance: t('learn.sort.relevance'),
    recent: t('learn.sort.recent'),
    reading_time: t('learn.sort.reading_time'),
    popularity: t('learn.sort.popularity'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Learn
        </h1>
        <p className="mt-1 hidden text-muted-foreground md:mt-2 md:block">
          {t('learn.subtitle')}
        </p>
      </div>

      {/* Mobile: Ligne 1 - Search + Filter + Sort */}
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          {/* Search - flexible sur mobile */}
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground md:h-5 md:w-5" />
            <input
              type="text"
              placeholder={t('learn.searchPlaceholderShort')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 md:py-3 md:pl-10 md:pr-4"
            />
          </div>

          {/* Filter dropdown - mobile: icône, desktop: visible */}
          <div className="relative shrink-0">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium md:px-4',
                filtersOpen
                  ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                  : 'text-muted-foreground hover:bg-accent/50'
              )}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t('learn.filtersLabel')}
              </span>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setFiltersOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 md:px-4"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  sortDropdownOpen && 'rotate-180'
                )}
              />
              <span className="hidden sm:inline">
                {sortLabels[sortBy].length > 12
                  ? sortLabels[sortBy].slice(0, 10) + '…'
                  : sortLabels[sortBy]}
              </span>
            </button>
            {sortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortDropdownOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg">
                  {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setSortDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm',
                        sortBy === option
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'text-muted-foreground hover:bg-accent/50'
                      )}
                    >
                      {sortLabels[option]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ligne 2 - Thématiques: scroll horizontal sur mobile */}
        <div className="-mx-6 overflow-x-auto overscroll-x-contain px-6 scroll-smooth scrollbar-hide md:mx-0 md:overflow-visible md:px-0">
          <div className="flex gap-2 md:flex-wrap">
            {themeKeys.map((themeKey) => (
              <button
                key={themeKey}
                onClick={() =>
                  setThemeFilter(themeFilter === themeKey ? null : themeKey)
                }
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  themeFilter === themeKey
                    ? 'bg-green-500 text-white'
                    : 'border border-border bg-card text-muted-foreground hover:bg-accent/50'
                )}
              >
                #{getThemeLabel(themeKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Panneau Filtres (mobile) - content type + level */}
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 md:!grid-rows-[1fr]',
            filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden md:contents">
            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card/50 p-4 md:hidden">
              <span className="w-full text-sm font-medium text-muted-foreground">
                {t('learn.all')} / {t('learn.themesLabel')}
              </span>
              <button
                onClick={() => setContentTypeFilter('all')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium',
                  contentTypeFilter === 'all'
                    ? 'bg-green-500 text-white'
                    : 'border border-border bg-card'
                )}
              >
                {t('learn.all')}
              </button>
              {(['article', 'protocol', 'clinical_study'] as const).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setContentTypeFilter(
                        contentTypeFilter === type ? 'all' : type
                      )
                    }
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium',
                      contentTypeFilter === type
                        ? 'bg-green-500 text-white'
                        : 'border border-border bg-card'
                    )}
                  >
                    {getContentTypeLabel(type)}
                  </button>
                )
              )}
              <span className="mt-2 w-full text-sm font-medium text-muted-foreground">
                {t('learn.levelLabel')}
              </span>
              {(['beginner', 'intermediate', 'advanced'] as const).map(
                (level) => {
                  const config = LEVEL_CONFIG[level];
                  const LevelIcon = config.icon;
                  const isActive = levelFilter === level;
                  return (
                    <button
                      key={level}
                      onClick={() =>
                        setLevelFilter(levelFilter === level ? 'all' : level)
                      }
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                        isActive
                          ? config.badgeClassName
                          : 'border border-border bg-card'
                      )}
                    >
                      <LevelIcon className="h-3.5 w-3.5" />
                      {getLevelLabel(level)}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Filtres type + niveau + thématiques - masqués sur mobile */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <button
            onClick={() => setContentTypeFilter('all')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
              contentTypeFilter === 'all'
                ? 'bg-green-500 text-white'
                : 'border border-border bg-card text-muted-foreground hover:bg-accent/50'
            )}
          >
            <Grid3X3 className="h-4 w-4" />
            {t('learn.all')}
          </button>
          {(['article', 'protocol', 'clinical_study'] as const).map((type) => (
            <button
              key={type}
              onClick={() =>
                setContentTypeFilter(contentTypeFilter === type ? 'all' : type)
              }
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium',
                contentTypeFilter === type
                  ? 'bg-green-500 text-white'
                  : 'border border-border bg-card text-muted-foreground hover:bg-accent/50'
              )}
            >
              {getContentTypeLabel(type)}
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {t('learn.levelLabel')} :
          </span>
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
            const config = LEVEL_CONFIG[level];
            const LevelIcon = config.icon;
            const isActive = levelFilter === level;
            return (
              <button
                key={level}
                onClick={() =>
                  setLevelFilter(levelFilter === level ? 'all' : level)
                }
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                  isActive
                    ? config.badgeClassName
                    : 'border border-border bg-card text-muted-foreground hover:bg-accent/50'
                )}
              >
                <LevelIcon
                  className={cn(
                    'h-3.5 w-3.5',
                    isActive ? config.iconClassName : 'text-muted-foreground'
                  )}
                />
                {getLevelLabel(level)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille d'articles */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        </div>
      ) : filteredAndSortedArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">{t('learn.noArticles')}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('learn.useAdmin')}
          </p>
        </div>
      )}
    </div>
  );
}
