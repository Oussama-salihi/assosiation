import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  UserCheck,
  Shield,
  Wallet,
  ReceiptText,
  ArrowRight,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ActiveTab } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, detailId?: string) => void;
  onSelectPaymentForReceipt: (paymentId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectPaymentForReceipt,
}) => {
  const { players, parents, teams, payments, receipts, getPlayerFinancials } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Filter entities
  const matchingPlayers = cleanQuery
    ? players.filter(
        (p) =>
          !p.isDeleted &&
          (`${p.firstName} ${p.lastName}`.toLowerCase().includes(cleanQuery) ||
            p.id.toLowerCase().includes(cleanQuery) ||
            p.position?.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchingParents = cleanQuery
    ? parents.filter(
        (p) =>
          !p.isDeleted &&
          (`${p.firstName} ${p.lastName}`.toLowerCase().includes(cleanQuery) ||
            p.phone.includes(cleanQuery) ||
            p.email?.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchingTeams = cleanQuery
    ? teams.filter(
        (t) =>
          t.name.toLowerCase().includes(cleanQuery) ||
          t.category.toLowerCase().includes(cleanQuery) ||
          t.coachName.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingPayments = cleanQuery
    ? payments.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(cleanQuery) ||
          p.reference?.toLowerCase().includes(cleanQuery) ||
          p.period.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingReceipts = cleanQuery
    ? receipts.filter((r) => r.receiptNumber.toLowerCase().includes(cleanQuery))
    : [];

  const hasResults =
    matchingPlayers.length > 0 ||
    matchingParents.length > 0 ||
    matchingTeams.length > 0 ||
    matchingPayments.length > 0 ||
    matchingReceipts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mt-10 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom de joueur (ex: Youssef Amrani), parent, équipe, reçu..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-medium text-slate-600">Recherche globale instantanée</p>
              <p className="text-xs text-slate-400 mt-1">
                Tapez le nom d'un joueur, parent, numéro de reçu ou équipe.
              </p>
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-slate-500 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Aucun résultat trouvé pour « {query} »</p>
            </div>
          )}

          {/* Joueurs Matches - With Full Detail as requested in prompt item 14 */}
          {matchingPlayers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Joueurs ({matchingPlayers.length})
              </div>
              <div className="space-y-2">
                {matchingPlayers.map((player) => {
                  const fin = getPlayerFinancials(player.id);
                  const parent = parents.find((p) => p.id === player.parentId);
                  const team = teams.find((t) => t.id === player.teamId);
                  const playerPayments = payments
                    .filter((p) => p.playerId === player.id)
                    .slice(0, 2);

                  return (
                    <div
                      key={player.id}
                      onClick={() => {
                        onClose();
                        onNavigate('players', player.id);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {player.firstName[0]}
                            {player.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-2">
                              {player.firstName} {player.lastName}
                              {player.jerseyNumber && (
                                <span className="text-xs px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  #{player.jerseyNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Équipe : <strong>{team?.name || 'Non assigné'}</strong></span>
                              <span>·</span>
                              <span>Parent : <strong>{parent ? `${parent.firstName} ${parent.lastName}` : 'N/A'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Financial summary snapshot */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-semibold text-slate-900">
                            Reste : <span className={fin.remainingAmount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                              {formatCurrency(fin.remainingAmount)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Payé : {formatCurrency(fin.paidAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Recent payment info inside card as requested */}
                      {playerPayments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Dernier paiement : <strong>{formatCurrency(playerPayments[0].amount)}</strong> ({formatDate(playerPayments[0].date)})
                          </span>
                          <span className="text-emerald-600 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Voir la fiche <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parents Matches */}
          {matchingParents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                Parents & Familles ({matchingParents.length})
              </div>
              <div className="space-y-1.5">
                {matchingParents.map((parent) => {
                  const children = players.filter((p) => p.parentId === parent.id && !p.isDeleted);
                  return (
                    <div
                      key={parent.id}
                      onClick={() => {
                        onClose();
                        onNavigate('parents', parent.id);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {parent.firstName} {parent.lastName} ({parent.relation})
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{parent.phone}</span>
                          <span>·</span>
                          <span>{children.length} enfant(s) inscrit(s)</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Équipes Matches */}
          {matchingTeams.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Équipes ({matchingTeams.length})
              </div>
              <div className="space-y-1.5">
                {matchingTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => {
                      onClose();
                      onNavigate('teams', team.id);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {team.name} ({team.category})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Coach : {team.coachName} · {team.monthlyFee} DH / mois
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reçus Matches */}
          {matchingReceipts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <ReceiptText className="w-3.5 h-3.5 text-amber-600" />
                Reçus officiels ({matchingReceipts.length})
              </div>
              <div className="space-y-1.5">
                {matchingReceipts.map((receipt) => {
                  const pay = payments.find((p) => p.id === receipt.paymentId);
                  return (
                    <div
                      key={receipt.id}
                      onClick={() => {
                        onClose();
                        onSelectPaymentForReceipt(receipt.paymentId);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          #{receipt.receiptNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Montant : {pay ? formatCurrency(pay.amount) : 'N/A'} · Émis le {formatDate(receipt.generatedAt)}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-amber-700">Ouvrir reçu</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
