import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Parent } from '../../types';
import { formatCurrency, getWhatsAppUrl } from '../../utils/formatters';

interface ParentsViewProps {
  onOpenNewParent: () => void;
  onEditParent: (parent: Parent) => void;
  onNavigateToPlayer: (playerId: string) => void;
  onOpenQuickPayment: (playerId: string) => void;
  preselectedParentId?: string;
}

export const ParentsView: React.FC<ParentsViewProps> = ({
  onOpenNewParent,
  onEditParent,
  onNavigateToPlayer,
  onOpenQuickPayment,
  preselectedParentId,
}) => {
  const {
    parents,
    players,
    teams,
    settings,
    getParentFinancials,
    deleteParent,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedParentDetail, setSelectedParentDetail] = useState<Parent | null>(() => {
    if (preselectedParentId) {
      return parents.find((p) => p.id === preselectedParentId) || null;
    }
    return null;
  });

  const filteredParents = parents
    .filter((p) => !p.isDeleted)
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Parents & Familles ({filteredParents.length})
          </h1>
          <p className="text-xs text-slate-500">
            Contacts des tuteurs légaux et gestion des fratries
          </p>
        </div>

        <button
          onClick={onOpenNewParent}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un parent</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-sm text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:border-emerald-600 text-slate-900 outline-none text-xs"
          />
        </div>
      </div>

      {/* Simple Parent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParents.map((parent) => {
          const children = players.filter((p) => p.parentId === parent.id && !p.isDeleted);
          const fin = getParentFinancials(parent.id);
          const waUrl = getWhatsAppUrl(
            parent.whatsapp || parent.phone,
            `Salam ${parent.firstName} ${parent.lastName}, de l'${settings.name} :`
          );

          return (
            <div
              key={parent.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Nom, Relation, Téléphone, Nombre d'enfants */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {parent.firstName} {parent.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {parent.relation} · <span className="font-mono">{parent.phone}</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {children.length} enfant{children.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Enfants : Youssef — U11, Adam — U9, Sara — U7 */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                    Enfants :
                  </span>
                  <div className="space-y-1 text-xs">
                    {children.length === 0 ? (
                      <span className="text-slate-400 italic">Aucun enfant assigné</span>
                    ) : (
                      children.map((ch) => {
                        const t = teams.find((tm) => tm.id === ch.teamId);
                        return (
                          <div
                            key={ch.id}
                            onClick={() => onNavigateToPlayer(ch.id)}
                            className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 cursor-pointer font-medium text-slate-800"
                          >
                            <span>{ch.firstName}</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {t?.category || 'S'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Total payé & Solde restant */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total payé</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(fin.paid, settings.currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Solde restant</span>
                    <span className={`font-mono font-bold ${fin.remaining > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatCurrency(fin.remaining, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions : WhatsApp, Voir, Modifier */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedParentDetail(parent)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Voir"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditParent(parent)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL DU PARENT */}
      {selectedParentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {selectedParentDetail.firstName} {selectedParentDetail.lastName}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedParentDetail.relation} · {selectedParentDetail.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedParentDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Adresse</span>
                <p className="text-slate-800 font-medium">{selectedParentDetail.address}</p>
                {selectedParentDetail.email && (
                  <p className="text-slate-600 mt-1">{selectedParentDetail.email}</p>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase block mb-2">
                  Enfants inscrits et règlements
                </span>
                <div className="space-y-2">
                  {players
                    .filter((p) => p.parentId === selectedParentDetail.id && !p.isDeleted)
                    .map((child) => {
                      const childTeam = teams.find((t) => t.id === child.teamId);
                      return (
                        <div
                          key={child.id}
                          className="p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {child.firstName} {child.lastName}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {childTeam?.name} ({childTeam?.category})
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedParentDetail(null);
                              onNavigateToPlayer(child.id);
                            }}
                            className="text-xs text-emerald-700 font-semibold hover:underline"
                          >
                            Fiche joueur →
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
