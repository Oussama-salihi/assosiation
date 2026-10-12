import React, { useState } from 'react';
import {
  Users,
  Shield,
  Wallet,
  AlertCircle,
  Plus,
  CheckSquare,
  ArrowRight,
  ReceiptText,
  AlertTriangle,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
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
    getOverduePlayers,
  } = useApp();

  const { t, language, formatMoney, isRTL } = useLanguage();

  // Automatic check for players whose dues are late > 30 days
  const overduePlayers = getOverduePlayers();
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [showOverdueDetails, setShowOverdueDetails] = useState(false);

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
    { month: language === 'ar' ? 'يونيو' : 'Juin', amount: 3200 },
    { month: language === 'ar' ? 'يوليوز' : 'Juil', amount: 1800 },
    { month: language === 'ar' ? 'غشت' : 'Août', amount: 2500 },
    { month: language === 'ar' ? 'شتنبر' : 'Sept', amount: 5955 },
    { month: language === 'ar' ? 'أكتوبر' : 'Oct', amount: paymentsThisMonth },
  ];
  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1);

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & 3 Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('dashboard.title', 'Tableau de bord')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('dashboard.subtitle', "Aperçu rapide de l'association sportive")}
          </p>
        </div>

        {/* 3 Actions rapides demandées */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenQuickPlayer}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('dashboard.addPlayer', 'Ajouter un joueur')}</span>
          </button>
          <button
            onClick={() => onOpenQuickPayment()}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{t('dashboard.recordPayment', 'Enregistrer un paiement')}</span>
          </button>
          <button
            onClick={onOpenQuickAttendance}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('dashboard.takeAttendance', "Faire l'appel")}</span>
          </button>
        </div>
      </div>

      {/* DISCREET OVERDUE DUES ALERT (> 30 DAYS LATE) */}
      {overduePlayers.length > 0 && !isAlertDismissed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 sm:p-4 text-xs transition-all shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="font-bold text-amber-950 flex items-center gap-2">
                  <span>{t('dashboard.overdueAlertTitle', 'Alerte cotisations en retard (> 30 jours)')}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-900">
                    {overduePlayers.length}
                  </span>
                </div>
                <p className="text-amber-800/90 text-[11px] mt-0.5">
                  {language === 'ar'
                    ? `فحص تلقائي: تم تحديد ${overduePlayers.length} لاعب(ين) مع اشتراكات متأخرة لأكثر من 30 يوماً.`
                    : `Vérification automatique au démarrage : ${overduePlayers.length} joueur(s) identifié(s) avec une cotisation impayée depuis plus de 30 jours.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setShowOverdueDetails(!showOverdueDetails)}
                className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{language === 'ar' ? 'التفاصيل' : 'Détails'}</span>
                {showOverdueDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => onNavigate('unpaid')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] cursor-pointer transition-colors"
              >
                {t('dashboard.overdueViewList', 'Consulter les impayés')}
              </button>
              <button
                onClick={() => setIsAlertDismissed(true)}
                className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 hover:text-amber-900 cursor-pointer"
                title={t('dashboard.overdueHide', 'Masquer')}
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Expandable Overdue Details List */}
          {showOverdueDetails && (
            <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2">
              <div className="text-[11px] font-semibold text-amber-900">
                {language === 'ar' ? 'قائمة المنخرطين المتأخرين:' : 'Joueurs en retard de paiement :'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {overduePlayers.map((item) => (
                  <div
                    key={item.player.id}
                    className="p-2.5 bg-white/90 rounded-lg border border-amber-200/60 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {item.player.firstName} {item.player.lastName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span>{item.team?.name || item.player.status}</span>
                        <span>•</span>
                        <span className="text-amber-700 font-bold">
                          {item.daysLate} {t('dashboard.overdueDaysLate', 'jours de retard')}
                        </span>
                      </div>
                    </div>

                    <div className="text-end shrink-0 flex flex-col items-end gap-1">
                      <span className="font-mono font-bold text-rose-600 text-xs">
                        {formatMoney(item.remainingAmount)}
                      </span>
                      <button
                        onClick={() => onOpenQuickPayment(item.player.id)}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                      >
                        {t('dashboard.settle', 'Régulariser')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* UNIQUEMENT 4 STATISTIQUES PRINCIPALES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Joueurs actifs */}
        <div
          onClick={() => onNavigate('players')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">
              {t('dashboard.activePlayers', 'Joueurs actifs')}
            </span>
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
            <span className="text-xs font-semibold">
              {t('dashboard.teams', 'Équipes')}
            </span>
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
            <span className="text-xs font-semibold">
              {t('dashboard.monthlyPayments', 'Paiements du mois')}
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {formatMoney(paymentsThisMonth)}
            </span>
          </div>
        </div>

        {/* 4. Total des impayés */}
        <div
          onClick={() => onNavigate('unpaid')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">
              {t('dashboard.totalUnpaid', 'Total des impayés')}
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">
              {formatMoney(totalUnpaidAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Graphique simple des paiements mensuels */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {t('dashboard.monthlyEvolution', 'Évolution des paiements mensuels')} ({language === 'ar' ? 'د.م' : settings.currency})
          </h2>
          <span className="text-xs text-slate-400">
            {t('dashboard.recentMonths', 'Derniers mois')}
          </span>
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
              {t('dashboard.recentPayments', 'Derniers paiements')}
            </h2>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              {t('dashboard.allPayments', 'Tous les paiements →')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {payments.slice(0, 5).map((pay) => {
              const player = players.find((p) => p.id === pay.playerId);
              return (
                <div key={pay.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">
                      {player ? `${player.firstName} ${player.lastName}` : t('common.player', 'Joueur')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatDate(pay.date)} · {pay.period} · {pay.method}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700">
                      {formatMoney(pay.amount)}
                    </span>
                    <button
                      onClick={() => onOpenReceipt(pay.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-50 cursor-pointer"
                      title={t('dashboard.viewReceipt', 'Voir reçu')}
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
              {t('dashboard.priorityUnpaid', 'Impayés prioritaires')}
            </h2>
            <button
              onClick={() => onNavigate('unpaid')}
              className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
            >
              {t('dashboard.allUnpaid', 'Tous les impayés')} ({unpaidPlayersList.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {unpaidPlayersList.length === 0 ? (
              <p className="text-slate-400 py-6 text-center text-xs">
                {t('dashboard.noUnpaid', 'Aucun impayé à signaler.')}
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
                        {formatMoney(remaining)}
                      </span>
                      <button
                        onClick={() => onOpenQuickPayment(player.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] cursor-pointer"
                      >
                        {t('dashboard.settle', 'Régulariser')}
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
