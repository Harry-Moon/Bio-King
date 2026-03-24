'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';

const ArticleBuilder = dynamic(
  () =>
    import('@/components/admin/article-builder').then(
      (mod) => mod.ArticleBuilder
    ),
  {
    loading: () => <div className="h-96 animate-pulse rounded-xl bg-muted" />,
    ssr: false,
  }
);
import {
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/lib/data/learn-articles-db';
import type { LearnArticle } from '@/lib/types/learn';
import {
  ARTICLE_CONTENT_TYPE_LABELS,
  ARTICLE_LEVEL_LABELS,
} from '@/lib/types/learn';

/**
 * Page admin de gestion des articles Learn
 */
export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<LearnArticle | null>(
    null
  );
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await getAllArticles(true);
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.themes.some((t) => t.toLowerCase().includes(q))
    );
  }, [articles, searchQuery]);

  const handleSave = async (data: Partial<LearnArticle>) => {
    if (isCreateMode) {
      const created = await createArticle({
        title: data.title!,
        slug: data.slug!,
        excerpt: data.excerpt!,
        content: data.content,
        contentType: data.contentType || 'article',
        readingTimeMinutes: data.readingTimeMinutes ?? 5,
        level: data.level || 'beginner',
        themes: data.themes || [],
        coverImage: data.coverImage,
        likesCount: 0,
        savesCount: 0,
        sharesCount: 0,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      });
      if (created) {
        await loadArticles();
        setSelectedArticle(null);
        setIsCreateMode(false);
      }
    } else if (selectedArticle) {
      const updated = await updateArticle(selectedArticle.id, data);
      if (updated) {
        await loadArticles();
        setSelectedArticle(updated);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    const ok = await deleteArticle(id);
    if (ok) {
      await loadArticles();
      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
      }
    }
  };

  const handleNewArticle = () => {
    setIsCreateMode(true);
    setSelectedArticle(null);
  };

  const isModalOpen = isCreateMode || selectedArticle !== null;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Articles Learn</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Gérez les articles de l&apos;espace d&apos;apprentissage.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, extrait, thématique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleNewArticle} className="bg-green-500">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ARTICLE</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>NIVEAU</TableHead>
                  <TableHead>TEMPS</TableHead>
                  <TableHead>STATUT</TableHead>
                  <TableHead className="w-24">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow
                    key={article.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setIsCreateMode(false);
                      setSelectedArticle(article);
                    }}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{article.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {article.excerpt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">
                        {ARTICLE_CONTENT_TYPE_LABELS[article.contentType]}
                      </span>
                    </TableCell>
                    <TableCell>{ARTICLE_LEVEL_LABELS[article.level]}</TableCell>
                    <TableCell>{article.readingTimeMinutes} min</TableCell>
                    <TableCell>
                      <span
                        className={
                          article.isActive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-muted-foreground'
                        }
                      >
                        {article.isActive ? 'Publié' : 'Brouillon'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCreateMode(false);
                            setSelectedArticle(article);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(article.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredArticles.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                Aucun article. Cliquez sur &quot;Nouvel article&quot; pour en
                créer un.
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedArticle(null);
            setIsCreateMode(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ArticleBuilder
            article={selectedArticle}
            onSave={handleSave}
            onClose={() => {
              setSelectedArticle(null);
              setIsCreateMode(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
