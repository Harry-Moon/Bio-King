'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ConversationsPanelProps {
  activeConversationId: string | null;
  onSelect: (conv: Conversation) => void;
  onNew: () => void;
  /** Called after a delete so the parent can clear if active */
  onDelete: (id: string) => void;
}

export function ConversationsPanel({
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
}: ConversationsPanelProps) {
  const [open, setOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/coach/conversations');
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Re-fetch when a new conversation becomes active (created externally)
  useEffect(() => {
    if (activeConversationId) fetchConversations();
  }, [activeConversationId, fetchConversations]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch(`/api/coach/conversations/${id}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className={cn(
        'hidden lg:flex flex-col shrink-0 transition-all duration-200 overflow-hidden',
        open ? 'w-64' : 'w-10'
      )}
    >
      {/* Toggle + New */}
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-2 border-b border-border',
          open ? 'justify-between' : 'justify-center'
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Réduire l'historique" : "Afficher l'historique"}
          title={open ? 'Réduire' : 'Historique'}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {open ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        {open && (
          <button
            type="button"
            onClick={onNew}
            aria-label="Nouvelle conversation"
            title="Nouvelle conversation"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouveau
          </button>
        )}
      </div>

      {/* List */}
      {open && (
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex justify-center pt-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 pt-8 px-4 text-center">
              <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                Aucune conversation pour l&apos;instant.
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5 px-2">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conv)}
                    className={cn(
                      'group flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors',
                      activeConversationId === conv.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium leading-snug">
                        {conv.title ?? 'Sans titre'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, conv.id)}
                      aria-label="Supprimer"
                      className="ml-auto shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      {deletingId === conv.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
