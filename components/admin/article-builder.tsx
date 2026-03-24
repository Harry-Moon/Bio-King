'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  ARTICLE_CONTENT_TYPE_LABELS,
  ARTICLE_LEVEL_LABELS,
} from '@/lib/types/learn';
import type { LearnArticle } from '@/lib/types/learn';
import { useLearnTranslations } from '@/lib/i18n/use-learn-translations';
import { normalizeThemeKey, THEME_KEYS } from '@/lib/types/learn';

interface ArticleBuilderProps {
  article: LearnArticle | null;
  onSave: (article: Partial<LearnArticle>) => Promise<void>;
  onClose: () => void;
}

/**
 * Formulaire de création/édition d'article Learn
 */
export function ArticleBuilder({
  article,
  onSave,
  onClose,
}: ArticleBuilderProps) {
  const { getThemeLabel } = useLearnTranslations();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    contentType: 'article' as LearnArticle['contentType'],
    readingTimeMinutes: 5,
    level: 'beginner' as LearnArticle['level'],
    themes: [] as string[],
    coverImage: '',
    isActive: true,
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [themeInput, setThemeInput] = useState('');

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content || '',
        contentType: article.contentType,
        readingTimeMinutes: article.readingTimeMinutes,
        level: article.level,
        themes: article.themes || [],
        coverImage: article.coverImage || '',
        isActive: article.isActive,
        sortOrder: article.sortOrder,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        contentType: 'article',
        readingTimeMinutes: 5,
        level: 'beginner',
        themes: [],
        coverImage: '',
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [article]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...formData,
        themes: formData.themes,
      });
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };

  const addTheme = (theme: string) => {
    const trimmed = theme.trim();
    if (!trimmed) return;
    const key = normalizeThemeKey(trimmed);
    if (!formData.themes.includes(key)) {
      setFormData((prev) => ({
        ...prev,
        themes: [...prev.themes, key],
      }));
      setThemeInput('');
    }
  };

  const removeTheme = (theme: string) => {
    setFormData((prev) => ({
      ...prev,
      themes: prev.themes.filter((t) => t !== theme),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {article ? "Modifier l'article" : 'Nouvel article'}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-500"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Titre</label>
            <Input
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (!article) {
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, ''),
                  }));
                }
              }}
              placeholder="Titre de l'article"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Slug (URL)</label>
            <Input
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="url-de-larticle"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Extrait</label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Résumé court de l'article"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Contenu (HTML)
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="<p>Contenu de l'article...</p>"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select
              value={formData.contentType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contentType: e.target.value as LearnArticle['contentType'],
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(
                Object.keys(
                  ARTICLE_CONTENT_TYPE_LABELS
                ) as LearnArticle['contentType'][]
              ).map((type) => (
                <option key={type} value={type}>
                  {ARTICLE_CONTENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Niveau</label>
            <select
              value={formData.level}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  level: e.target.value as LearnArticle['level'],
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(
                Object.keys(ARTICLE_LEVEL_LABELS) as LearnArticle['level'][]
              ).map((level) => (
                <option key={level} value={level}>
                  {ARTICLE_LEVEL_LABELS[level]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Temps de lecture (min)
            </label>
            <Input
              type="number"
              min={1}
              value={formData.readingTimeMinutes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  readingTimeMinutes: parseInt(e.target.value, 10) || 5,
                }))
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Image de couverture (URL)
            </label>
            <Input
              type="url"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Ordre d&apos;affichage
            </label>
            <Input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sortOrder: parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Publié (visible)</label>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          {/* Thématiques */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Thématiques
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.themes.map((themeKey) => (
                <span
                  key={themeKey}
                  className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                >
                  #{getThemeLabel(themeKey)}
                  <button
                    type="button"
                    onClick={() => removeTheme(themeKey)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTheme(themeInput);
                  }
                }}
                placeholder="Ajouter une thématique"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTheme(themeInput)}
              >
                Ajouter
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {THEME_KEYS.filter((key) => !formData.themes.includes(key)).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addTheme(key)}
                    className="rounded bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                  >
                    +{getThemeLabel(key)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
