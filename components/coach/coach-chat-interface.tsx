'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Loader2,
  Activity,
  Zap,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  FileText,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useProfile } from '@/components/auth/use-profile';
import type { HealthContextItem } from '@/app/coach/page';
import {
  ConversationsPanel,
  type Conversation,
} from '@/components/coach/conversations-panel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  correlatedData?: { name: string; value: string };
  timestamp: Date;
}

interface UserContextEntry {
  id: string;
  label: string;
  content: string;
  type: 'text' | 'file';
}

interface CoachChatInterfaceProps {
  healthContext: HealthContextItem[];
  chronologicalAge: number | null;
  className?: string;
}

const DONNEE_REGEX = /\[DONNEE:([^:]+):([^\]]+)\]/;

function parseAiResponse(raw: string): {
  text: string;
  correlatedData?: { name: string; value: string };
} {
  const match = raw.match(DONNEE_REGEX);
  if (!match) return { text: raw.trim() };
  return {
    text: raw.replace(DONNEE_REGEX, '').trim(),
    correlatedData: { name: match[1].trim(), value: match[2].trim() },
  };
}

const SUGGESTED_QUESTIONS = [
  'Ajoute la Quercétine à mon plan',
  "Montre l'évolution sur 6 mois",
  'Quels aliments éviter ?',
];

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden border border-border">
      <span className="text-xs font-semibold text-foreground">{initials}</span>
    </div>
  );
}

function BAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
      <span className="text-sm font-bold text-white">B</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <BAvatar />
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
          <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
          <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function CorrelatedDataCard({ name, value }: { name: string; value: string }) {
  const isNegative =
    value.toLowerCase().includes('élevé') ||
    value.toLowerCase().includes('elevé') ||
    value.toLowerCase().includes('elevee') ||
    value.toLowerCase().includes('élevée') ||
    value.toLowerCase().includes('accéléré') ||
    value.toLowerCase().includes('accelere');

  return (
    <div className="mt-2 rounded-md border border-border bg-muted/40 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
        Donnée corrélée
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>{name}</span>
        </div>
        <span
          className={cn(
            'text-xs font-semibold',
            isNegative ? 'text-amber-500' : 'text-emerald-500'
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => (
          <h1 className="mt-3 mb-1 text-base font-bold text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-3 mb-1 text-sm font-bold text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-2 mb-1 text-sm font-semibold text-foreground">
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          return isBlock ? (
            <code className="block w-full rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground overflow-x-auto whitespace-pre">
              {children}
            </code>
          ) : (
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono text-foreground">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-border pl-3 text-muted-foreground italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-2 border-border" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ContextEditorPanel({
  entries,
  onAdd,
  onRemove,
}: {
  entries: UserContextEntry[];
  onAdd: (entry: UserContextEntry) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = () => {
    if (!draft.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      label: draft.trim().slice(0, 40) + (draft.trim().length > 40 ? '…' : ''),
      content: draft.trim(),
      type: 'text',
    });
    setDraft('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text().catch(() => '');
    if (!text.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      label: file.name,
      content: text.trim(),
      type: 'file',
    });
    e.target.value = '';
  };

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Contexte biologique
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {entries.length > 0 && (
            <ul className="space-y-1.5">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-2 rounded-lg border border-border bg-card px-2.5 py-2"
                >
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-[11px] text-foreground leading-snug break-all">
                    {e.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(e.id)}
                    aria-label="Supprimer"
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ajoutez une note, un résultat d'analyse, une observation…"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddText}
              disabled={!draft.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter le texte
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Importer un fichier"
              className="flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {entries.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {entries.length} élément{entries.length > 1 ? 's' : ''} ajouté
              {entries.length > 1 ? 's' : ''} au contexte.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function CoachChatInterface({
  healthContext,
  chronologicalAge,
  className,
}: CoachChatInterfaceProps) {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [contextEntries, setContextEntries] = useState<UserContextEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userInitials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() ||
      'U'
    : 'U';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /** Load messages for a given conversation from the API */
  const loadConversation = useCallback(async (conv: Conversation) => {
    setLoadingConv(true);
    setActiveConversation(conv);
    setMessages([]);
    setConversationHistory([]);
    try {
      const res = await fetch(`/api/coach/conversations/${conv.id}`);
      const data = await res.json();
      const loaded: Message[] = (data.messages ?? []).map(
        (m: { role: string; content: string; created_at: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at),
        })
      );
      setMessages(loaded);
      setConversationHistory(
        loaded.map((m) => ({ role: m.role, content: m.content }))
      );
    } finally {
      setLoadingConv(false);
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setConversationHistory([]);
  }, []);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = (text ?? input).trim();
      if (!messageText || loading) return;

      const userMessage: Message = {
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      const additionalContext = contextEntries
        .map((e) => `### ${e.label}\n${e.content}`)
        .join('\n\n');

      try {
        const response = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            conversationId: activeConversation?.id ?? null,
            conversationHistory,
            additionalContext,
          }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.details || data.message || 'Failed');

        const { text: cleanedText, correlatedData } = parseAiResponse(
          data.response
        );

        const assistantMessage: Message = {
          role: 'assistant',
          content: cleanedText,
          correlatedData,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: messageText },
          { role: 'assistant', content: cleanedText },
        ]);

        // If this was a new conversation, store the returned conversationId
        if (!activeConversation && data.conversationId) {
          setActiveConversation({
            id: data.conversationId,
            title: messageText.slice(0, 60),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Coach error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, conversationHistory, contextEntries, activeConversation]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const topSystems = healthContext.slice(0, 3);

  return (
    <div className={cn('flex gap-3 h-[calc(100vh-8rem)]', className)}>
      {/* ── Left: Conversations panel ─────────────────────────── */}
      <ConversationsPanel
        activeConversationId={activeConversation?.id ?? null}
        onSelect={loadConversation}
        onNew={startNewConversation}
        onDelete={(id) => {
          if (activeConversation?.id === id) startNewConversation();
        }}
      />

      {/* ── Center: Chat column ───────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 rounded-xl border border-border bg-background overflow-hidden">
        {/* Icon-only right-sidebar toggle */}
        <div className="hidden lg:flex justify-end px-3 pt-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={
              sidebarOpen ? 'Masquer le contexte' : 'Afficher le contexte'
            }
            title={sidebarOpen ? 'Masquer le contexte' : 'Afficher le contexte'}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {loadingConv ? (
            <div className="flex justify-center pt-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 pb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <p className="text-base font-medium text-foreground">
                Bonjour{profile?.first_name ? `, ${profile.first_name}` : ''} !
              </p>
              <p className="text-sm max-w-xs">
                Je suis votre Coach BioKing. Posez-moi une question sur vos
                données de santé, le marketplace ou vos protocoles.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && <BAvatar />}

                <div
                  className={cn(
                    'max-w-[78%]',
                    message.role === 'user' && 'flex flex-col items-end'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <MarkdownMessage content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                  {message.correlatedData && (
                    <CorrelatedDataCard
                      name={message.correlatedData.name}
                      value={message.correlatedData.value}
                    />
                  )}
                </div>

                {message.role === 'user' && (
                  <UserAvatar initials={userInitials} />
                )}
              </div>
            ))
          )}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question sur votre santé..."
              disabled={loading || loadingConv}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-32"
              style={{ lineHeight: '1.5rem' }}
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || loadingConv}
              aria-label="Envoyer"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                input.trim() && !loading && !loadingConv
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Bio King AI peut faire des erreurs. Vérifiez les données
            importantes.
          </p>
        </div>
      </div>

      {/* ── Right: Context sidebar ────────────────────────────── */}
      <div
        className={cn(
          'flex-col gap-4 shrink-0 w-72 overflow-y-auto',
          sidebarOpen ? 'hidden lg:flex' : 'hidden'
        )}
      >
        {/* CONTEXTE ACTUEL */}
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Contexte actuel
          </p>
          {topSystems.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aucun rapport SystemAge disponible.
            </p>
          ) : (
            <div className="space-y-3">
              {topSystems.map((system) => (
                <div
                  key={system.systemName}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Activity className="h-4 w-4" />
                      <span>{system.systemName}</span>
                    </div>
                    {system.isPriority && (
                      <span className="rounded-sm bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-500">
                        Priorité
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {system.systemAge.toFixed(1)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ans
                    </span>
                  </p>
                  {chronologicalAge != null && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {system.ageDifference > 0 ? '+' : ''}
                      {system.ageDifference.toFixed(1)} ans vs Chronologique
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CONTEXTE BIOLOGIQUE — editable */}
        <ContextEditorPanel
          entries={contextEntries}
          onAdd={(entry) => setContextEntries((prev) => [...prev, entry])}
          onRemove={(id) =>
            setContextEntries((prev) => prev.filter((e) => e.id !== id))
          }
        />

        {/* SUGGESTIONS */}
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Suggestions
          </p>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={loading || loadingConv}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-left text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
