import React from 'react';
import {
  Users,
  Shield,
  Wallet,
  AlertCircle,
  Plus,
  CheckSquare,
  ArrowRight,
  ReceiptText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab, detailId?: string) => void;
  onOpenQuickPayment: (playerId?: string) => void;
  onOpenQuickPlayer: () => void;
  onOpenQuickAttendance: () => void;
  onOpenReceipt: (paymentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickPayment,
  onOpenQuickPlayer,
  onOpenQuickAttendance,
  onOpenReceipt,
}) => {
  const {
    players,
    teams,
    payments,
    settings,
    getPlayerFinancials,
  } = useApp();

  // 1. Joueurs actifs
  const activePlayers = players.filter((p) => !p.isDeleted);
  const activeCount = activePlayers.filter((p) => p.status === 'Actif').length;

  // 2. Équipes
  const teamsCount = teams.filter((t) => t.status === 'Active').length;

  // 3. Paiements du mois
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);
  const validPayments = payments.filter((p) => p.status === 'Validé');
  const paymentsThisMonth = validPayments
    .filter((p) => p.date.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + p.amount, 0);

  // 4. Total des impayés & liste impayés prioritaires
  let totalUnpaidAmount = 0;
  const unpaidPlayersList: { player: typeof players[0]; remaining: number }[] = [];

  activePlayers.forEach((p) => {
    const fin = getPlayerFinancials(p.id);
    if (fin.remainingAmount > 0) {
      totalUnpaidAmount += fin.remainingAmount;
      unpaidPlayersList.push({ player: p, remaining: fin.remainingAmount });
    }
  });

  unpaidPlayersList.sort((a, b) => b.remaining - a.remaining);

  // Graphique simple des paiements mensuels
  const monthlyData = [
    { month: 'Juin', amount: 3200 },
    { month: 'Juil', amount: 1800 },
    { month: 'Août', amount: 2500 },
    { month: 'Sept', amount: 5955 },
    { month: 'Oct', amount: paymentsThisMonth },
  ];
  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1);

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & 3 Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-xs text-slate-500">
            Aperçu rapide de l'association sportive
          </p>
        </div>

        {/* 3 Actions rapides demandées */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenQuickPlayer}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ajouter un joueur</span>
          </button>
          <button
            onClick={() => onOpenQuickPayment()}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Enregistrer un paiement</span>
          </button>
          <button
            onClick={onOpenQuickAttendance}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Faire l'appel</span>
          </button>
        </div>
      </div>

      {/* UNIQUEMENT 4 STATISTIQUES PRINCIPALES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Joueurs actifs */}
        <div
          onClick={() => onNavigate('players')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Joueurs actifs</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {activeCount}
            </span>
          </div>
        </div>

        {/* 2. Équipes */}
        <div
          onClick={() => onNavigate('teams')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Équipes</span>
            <Shield className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {teamsCount}
            </span>
          </div>
        </div>

        {/* 3. Paiements du mois */}
        <div
          onClick={() => onNavigate('payments')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Paiements du mois</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {formatCurrency(paymentsThisMonth, settings.currency)}
            </span>
          </div>
        </div>

        {/* 4. Total des impayés */}
        <div
          onClick={() => onNavigate('unpaid')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total des impayés</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">
              {formatCurrency(totalUnpaidAmount, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Graphique simple des paiements mensuels */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Évolution des paiements mensuels ({settings.currency})
          </h2>
          <span className="text-xs text-slate-400">Derniers mois</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
          {monthlyData.map((item, idx) => {
            const heightPercent = Math.max(15, Math.round((item.amount / maxMonthly) * 100));
            const isCurrent = idx === monthlyData.length - 1;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  {item.amount > 0 ? `${item.amount}` : '0'}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[48px] rounded-t-md transition-all ${
                    isCurrent ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
                <span className={`text-xs font-medium ${isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Colonnes : Derniers Paiements & Impayés Prioritaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des derniers paiements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Derniers paiements
            </h2>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Tous les paiements →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {payments.slice(0, 5).map((pay) => {
              const player = players.find((p) => p.id === pay.playerId);
              return (
                <div key={pay.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">
                      {player ? `${player.firstName} ${player.lastName}` : 'Joueur'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatDate(pay.date)} · {pay.period} · {pay.method}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(pay.amount, settings.currency)}
                    </span>
                    <button
                      onClick={() => onOpenReceipt(pay.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-50"
                      title="Voir reçu"
                    >
                      <ReceiptText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des impayés prioritaires */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-rose-700">
              Impayés prioritaires
            </h2>
            <button
              onClick={() => onNavigate('unpaid')}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Tous les impayés ({unpaidPlayersList.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {unpaidPlayersList.length === 0 ? (
              <p className="text-slate-400 py-6 text-center text-xs">
                Aucun impayé à signaler.
              </p>
            ) : (
              unpaidPlayersList.slice(0, 5).map(({ player, remaining }) => {
                const team = teams.find((t) => t.id === player.teamId);
                return (
                  <div key={player.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {team?.name || '-'} ({team?.category})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-rose-600">
                        {formatCurrency(remaining, settings.currency)}
                      </span>
                      <button
                        onClick={() => onOpenQuickPayment(player.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] cursor-pointer"
                      >
                        Régulariser
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
