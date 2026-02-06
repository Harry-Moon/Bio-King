'use client';

import { X, Download, CheckCircle2, Calendar } from 'lucide-react';
import type { UserProtocol, ProtocolItem } from '@/lib/types/marketplace';
import { cn } from '@/lib/utils';

interface ProtocolSidebarProps {
  protocol: UserProtocol;
  onRemoveItem: (productId: string) => void;
  onValidateProtocol: () => void;
  onClose?: () => void;
}

/**
 * Sidebar droite récapitulant le protocole utilisateur
 */
export function ProtocolSidebar({
  protocol,
  onRemoveItem,
  onValidateProtocol,
  onClose,
}: ProtocolSidebarProps) {
  return (
    <aside className="sticky top-6 h-fit w-full animate-in slide-in-from-right space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg lg:w-80">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Votre Protocole</h2>
        <div className="flex items-center gap-3">
          {protocol.weekNumber && (
            <span className="text-sm text-muted-foreground">
              Semaine {protocol.weekNumber}
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Fermer le protocole"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Couverture Systémique */}
      {protocol.systemCoverage.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Couverture Systémique
          </h3>
          {protocol.systemCoverage.map((coverage) => (
            <div key={coverage.systemName} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={cn(
                    'font-medium',
                    coverage.priority
                      ? 'text-orange-500'
                      : 'text-muted-foreground'
                  )}
                >
                  {coverage.systemName}
                </span>
                <span className="text-muted-foreground">
                  {coverage.coverage}%
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full transition-all',
                    coverage.priority
                      ? 'bg-orange-500'
                      : 'bg-muted-foreground/30'
                  )}
                  style={{ width: `${coverage.coverage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste des sélections */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Sélection ({protocol.items.length})
        </h3>
        <div className="max-h-[400px] space-y-3 overflow-y-auto">
          {protocol.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun produit dans votre protocole
            </p>
          ) : (
            protocol.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-3"
              >
                {/* Image miniature */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-12 w-12 flex-shrink-0 rounded object-cover"
                />

                {/* Détails */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-foreground">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Retirer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {item.product.price.toLocaleString('fr-FR')}€
                    </span>
                    {item.frequency && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.frequency === 'monthly'
                            ? 'Mensuel'
                            : item.frequency === 'appointment'
                              ? 'Rendez-vous'
                              : item.frequency === 'one_time'
                                ? 'Unique'
                                : item.frequency}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Total */}
      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total estimé</span>
          <span className="text-2xl font-bold text-green-500">
            {protocol.totalPrice.toLocaleString('fr-FR')}€
          </span>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-2">
          <button
            onClick={onValidateProtocol}
            className="w-full rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-green-600 active:scale-[0.98]"
          >
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            Valider le Protocole
          </button>
          <button className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download className="mr-2 inline h-4 w-4" />
            Télécharger pour mon médecin
          </button>
        </div>
      </div>
    </aside>
  );
}
