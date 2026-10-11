import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Plus,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Registration, RegistrationStatus, PlanFrequency } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RegistrationsViewProps {
  onNavigateToPlayer: (playerId: string) => void;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  onNavigateToPlayer,
}) => {
  const { registrations, players, parents, teams, plans, settings, addRegistration, updateRegistration } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [playerId, setPlayerId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [planFrequency, setPlanFrequency] = useState<PlanFrequency>('Annuelle');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2027-06-30');
  const [totalAmount, setTotalAmount] = useState<number | ''>(2500);
  const [season, setSeason] = useState('2026-2027');
  const [notes, setNotes] = useState('');

  const filteredRegistrations = registrations.filter((reg) => {
    const player = players.find((p) => p.id === reg.playerId);
    const parent = parents.find((pr) => pr.id === reg.parentId);
    const q = search.toLowerCase();

    const matchesSearch =
      (player && `${player.firstName} ${player.lastName}`.toLowerCase().includes(q)) ||
      (parent && `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(q)) ||
      reg.id.toLowerCase().includes(q) ||
      reg.season.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || reg.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handlePlayerSelect = (pId: string) => {
    setPlayerId(pId);
    const p = players.find((plyr) => plyr.id === pId);
    if (p) {
      setTeamId(p.teamId);
      const team = teams.find((t) => t.id === p.teamId);
      const baseFee = team?.monthlyFee || 300;
      if (planFrequency === 'Annuelle') {
        setTotalAmount(Math.round(baseFee * 10 * 0.85)); // 15% remise
      } else if (planFrequency === 'Trimestrielle') {
        setTotalAmount(Math.round(baseFee * 3 * 0.95)); // 5% remise
      } else {
        setTotalAmount(baseFee);
      }
    }
  };

  const handleCreateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !totalAmount) return;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    addRegistration({
      playerId,
      parentId: player.parentId,
      teamId: teamId || player.teamId,
      registrationDate: new Date().toISOString().split('T')[0],
      startDate,
      endDate,
      planFrequency,
      totalAmount: Number(totalAmount),
      status: 'Active',
      season,
      notes,
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <span>Adhésions & Inscriptions ({registrations.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Contrats d'adhésion saisonnière, formules de cotisation et historique complet
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle adhésion</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom de joueur, saison..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 bg-white"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="Active">Active</option>
              <option value="Expirée">Expirée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">JOUEUR</th>
                <th className="py-3 px-3">ÉQUIPE</th>
                <th className="py-3 px-3">SAISON</th>
                <th className="py-3 px-3">FORMULE</th>
                <th className="py-3 px-3">PÉRIODE DE VALIDITÉ</th>
                <th className="py-3 px-3 text-right">MONTANT TOTAL PRÉVU</th>
                <th className="py-3 px-3 text-center">STATUT</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Aucune adhésion trouvée.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const player = players.find((p) => p.id === reg.playerId);
                  const team = teams.find((t) => t.id === reg.teamId);

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {player ? `${player.firstName} ${player.lastName}` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Inscrit le {formatDate(reg.registrationDate)}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {team?.name || '-'} ({team?.category})
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {reg.season}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{reg.planFrequency}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {formatDate(reg.startDate)} au {formatDate(reg.endDate)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900 tabular-nums">
                        {formatCurrency(reg.totalAmount, settings.currency)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            reg.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.status === 'Expirée'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {player && (
                          <button
                            onClick={() => onNavigateToPlayer(player.id)}
                            className="text-xs text-emerald-700 font-semibold hover:underline"
                          >
                            Fiche joueur →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouvelle Inscription */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">Enregistrer une adhésion</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRegistration} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Joueur <span className="text-rose-500">*</span>
                </label>
                <select
                  value={playerId}
                  onChange={(e) => handlePlayerSelect(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 font-medium"
                >
                  <option value="">-- Sélectionner le joueur --</option>
                  {players
                    .filter((p) => !p.isDeleted)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.id})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Formule <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={planFrequency}
                    onChange={(e) => {
                      const freq = e.target.value as PlanFrequency;
                      setPlanFrequency(freq);
                      if (playerId) {
                        const p = players.find((pl) => pl.id === playerId);
                        const team = teams.find((t) => t.id === p?.teamId);
                        const base = team?.monthlyFee || 300;
                        if (freq === 'Annuelle') setTotalAmount(Math.round(base * 10 * 0.85));
                        else if (freq === 'Trimestrielle') setTotalAmount(Math.round(base * 3 * 0.95));
                        else setTotalAmount(base);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900"
                  >
                    <option value="Annuelle">Annuelle (10 mois)</option>
                    <option value="Trimestrielle">Trimestrielle (3 mois)</option>
                    <option value="Semestrielle">Semestrielle (6 mois)</option>
                    <option value="Mensuelle">Mensuelle (1 mois)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Saison sportive <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    required
                    placeholder="2026-2027"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Montant total prévu ({settings.currency}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!playerId || !totalAmount}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider l'adhésion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
