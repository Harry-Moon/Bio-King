'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme/theme-context';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  Moon,
  Sun,
  Monitor,
  Globe,
  KeyRound,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    fetch('/api/user/openai-key')
      .then((r) => r.json())
      .then((d) => setHasApiKey(d.hasApiKey ?? false))
      .catch(() => setHasApiKey(false));
  }, []);

  const saveOpenaiKey = async (keyToSave: string) => {
    setSavingKey(true);
    setKeySaved(false);
    try {
      const res = await fetch('/api/user/openai-key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openaiApiKey: keyToSave }),
      });
      if (!res.ok) throw new Error('Failed');
      setHasApiKey(Boolean(keyToSave.trim()));
      setOpenaiKey('');
      setKeySaved(true);
    } catch {
      setKeySaved(false);
    } finally {
      setSavingKey(false);
    }
  };
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const themeOptions: Array<{
    value: 'light' | 'dark' | 'system';
    label: string;
    icon: React.ReactNode;
  }> = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
    },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>
      <div className="space-y-6">
        {/* Coach - OpenAI API Key */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <KeyRound className="h-5 w-5" />
            Coach IA
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Le Coach utilise votre clé API OpenAI pour converser. Vos données
            restent privées et la clé n&apos;est jamais partagée.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                type="password"
                placeholder={
                  hasApiKey === true
                    ? 'Clé configurée • Entrez une nouvelle pour remplacer'
                    : 'sk-... (votre clé OpenAI)'
                }
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => saveOpenaiKey(openaiKey)}
                disabled={savingKey || !openaiKey.trim()}
                className="sm:w-auto"
              >
                {savingKey ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : keySaved ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  'Enregistrer'
                )}
              </Button>
              {hasApiKey === true && (
                <Button
                  variant="outline"
                  onClick={() => saveOpenaiKey('')}
                  disabled={savingKey}
                  className="sm:w-auto"
                >
                  Supprimer
                </Button>
              )}
            </div>
          </div>
          {hasApiKey === true && (
            <p className="mt-2 text-xs text-muted-foreground">
              Clé configurée. Laissez vide pour conserver l&apos;actuelle.
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">General Preferences</h2>
          <div className="space-y-6">
            {/* Language Setting */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'en' | 'fr')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      language === lang.code
                        ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'border border-border text-muted-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Setting */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Light, dark, or system mode
                </p>
              </div>
              <div className="flex gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                      theme === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'border bg-card text-muted-foreground hover:border-primary/50 hover:bg-card/80'
                    }`}
                    title={option.label}
                  >
                    {option.icon}
                    <span className="hidden text-sm font-medium sm:inline">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-muted-foreground">
                  Recevoir des mises à jour par email
                </p>
              </div>
              <p className="text-muted-foreground">Activées</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rappels</p>
                <p className="text-sm text-muted-foreground">
                  Rappels pour vos défis et objectifs
                </p>
              </div>
              <p className="text-muted-foreground">Activés</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Confidentialité</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profil public</p>
                <p className="text-sm text-muted-foreground">
                  Rendre votre profil visible aux autres
                </p>
              </div>
              <p className="text-muted-foreground">Désactivé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
