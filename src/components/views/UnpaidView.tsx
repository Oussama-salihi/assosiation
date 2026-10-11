import React, { useState } from 'react';
import {
  AlertCircle,
  Search,
  Wallet,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, exportToExcelCsv } from '../../utils/formatters';

interface UnpaidViewProps {
  onOpenQuickPayment: (playerId: string) => void;
  onNavigateToPlayer: (playerId: string) => void;
}

export const UnpaidView: React.FC<UnpaidViewProps> = ({
  onOpenQuickPayment,
  onNavigateToPlayer,
}) => {
  const { players, parents, teams, settings, getPlayerFinancials } = useApp();

  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');

  const activePlayers = players.filter((p) => !p.isDeleted);

  const unpaidList = activePlayers
    .map((player) => {
      const parent = parents.find((pr) => pr.id === player.parentId);
      const team = teams.find((t) => t.id === player.teamId);
      const fin = getPlayerFinancials(player.id);
      return {
        player,
        parent,
        team,
        fin,
      };
    })
    .filter((item) => item.fin.remainingAmount > 0)
    .filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        `${item.player.firstName} ${item.player.lastName}`.toLowerCase().includes(q) ||
        (item.parent && `${item.parent.firstName} ${item.parent.lastName}`.toLowerCase().includes(q));

      const matchesTeam = filterTeam === 'ALL' || item.player.teamId === filterTeam;

      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => b.fin.remainingAmount - a.fin.remainingAmount);

  const totalRemainingSum = unpaidList.reduce((sum, item) => sum + item.fin.remainingAmount, 0);

  const handleExportCsv = () => {
    const headers = [
      'Joueur',
      'Parent',
      'Équipe',
      'Montant restant (DH)',
      'Dernier paiement',
      'Statut',
    ];

    const rows = unpaidList.map((item) => [
      `${item.player.firstName} ${item.player.lastName}`,
      item.parent ? `${item.parent.firstName} ${item.parent.lastName}` : '',
      item.team?.name || '',
      item.fin.remainingAmount,
      item.fin.lastPaymentDate ? formatDate(item.fin.lastPaymentDate) : 'Aucun',
      item.fin.status,
    ]);

    exportToExcelCsv(`Impayes_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Impayés ({unpaidList.length})</span>
          </h1>
          <p className="text-xs text-slate-500">
            Total restant à recouvrer : <strong className="text-rose-600 font-mono">{formatCurrency(totalRemainingSum, settings.currency)}</strong>
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Exporter Excel</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par joueur ou parent..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:border-rose-500 text-slate-900 outline-none text-xs"
          />
        </div>

        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs"
        >
          <option value="ALL">Toutes les équipes</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.category})
            </option>
          ))}
        </select>
      </div>

      {/* Simplified Table : Joueur, Parent, Équipe, Montant restant, Dernier paiement, Statut, Action [ Régulariser ] */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="py-3 px-4">JOUEUR</th>
                <th className="py-3 px-3">PARENT</th>
                <th className="py-3 px-3">ÉQUIPE</th>
                <th className="py-3 px-3 text-right">MONTANT RESTANT</th>
                <th className="py-3 px-3 text-center">DERNIER PAIEMENT</th>
                <th className="py-3 px-3 text-center">STATUT</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unpaidList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 stroke-1" />
                    <p className="font-semibold text-slate-700">Aucun impayé trouvé</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tous les adhérents sélectionnés sont à jour.</p>
                  </td>
                </tr>
              ) : (
                unpaidList.map(({ player, parent, team, fin }) => (
                  <tr key={player.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Joueur */}
                    <td className="py-3 px-4">
                      <span
                        className="font-bold text-slate-900 cursor-pointer hover:text-emerald-700"
                        onClick={() => onNavigateToPlayer(player.id)}
                      >
                        {player.firstName} {player.lastName}
                      </span>
                    </td>

                    {/* Parent */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {parent ? `${parent.firstName} ${parent.lastName}` : '-'}
                    </td>

                    {/* Équipe */}
                    <td className="py-3 px-3 text-slate-600">
                      {team?.name || '-'} ({team?.category})
                    </td>

                    {/* Montant restant */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 text-sm">
                      {formatCurrency(fin.remainingAmount, settings.currency)}
                    </td>

                    {/* Dernier paiement */}
                    <td className="py-3 px-3 text-center text-slate-600 font-mono">
                      {fin.lastPaymentDate ? formatDate(fin.lastPaymentDate) : 'Aucun'}
                    </td>

                    {/* Statut */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          fin.status === 'PARTIELLEMENT PAYÉ'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {fin.status}
                      </span>
                    </td>

                    {/* Action : [ Régulariser ] */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenQuickPayment(player.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Régulariser
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
