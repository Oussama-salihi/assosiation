import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  UserCheck,
  FileSpreadsheet,
  Printer,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, calculateAge, exportToExcelCsv } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    payments,
    players,
    parents,
    teams,
    settings,
    getPlayerFinancials,
    getParentFinancials,
    getPlayerAttendanceStats,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'finances' | 'joueurs' | 'parents'>('finances');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // 1. FINANCES DATA
  const validPayments = payments.filter((p) => p.status === 'Validé');
  const filteredPayments = validPayments.filter((p) => {
    if (periodFilter === 'today') return p.date === todayStr;
    if (periodFilter === 'month') return p.date.startsWith(currentMonthStr);
    if (periodFilter === 'week') {
      const pDate = new Date(p.date).getTime();
      const sevenDaysAgo = new Date().getTime() - 7 * 24 * 3600 * 1000;
      return pDate >= sevenDaysAgo;
    }
    return true;
  });

  const totalCollected = filteredPayments.reduce((s, p) => s + p.amount, 0);

  const activePlayers = players.filter((p) => !p.isDeleted);
  const totalUnpaid = activePlayers.reduce(
    (s, p) => s + getPlayerFinancials(p.id).remainingAmount,
    0
  );

  // 2. JOUEURS DATA
  const activePlayersCount = activePlayers.filter((p) => p.status === 'Actif').length;
  const inactivePlayersCount = activePlayers.filter((p) => p.status === 'Inactif').length;

  const attendanceRates = activePlayers.map((p) => getPlayerAttendanceStats(p.id).percentage);
  const avgAttendance = attendanceRates.length > 0 ? Math.round(attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length) : 100;

  // 3. PARENTS DATA
  const activeParents = parents.filter((p) => !p.isDeleted);
  const parentsCount = activeParents.length;
  const multiChildrenParents = activeParents.filter((pr) => {
    return players.filter((pl) => pl.parentId === pr.id && !pl.isDeleted).length > 1;
  });
  const unpaidParents = activeParents.filter((pr) => {
    return getParentFinancials(pr.id).remaining > 0;
  });

  // Export Excel
  const handleExport = () => {
    if (activeTab === 'finances') {
      const headers = ['N° Paiement', 'Date', 'Joueur', 'Période', 'Mode', 'Montant (DH)'];
      const rows = filteredPayments.map((p) => {
        const pl = players.find((plyr) => plyr.id === p.playerId);
        return [
          p.paymentNumber,
          formatDate(p.date),
          pl ? `${pl.firstName} ${pl.lastName}` : '',
          p.period,
          p.method,
          p.amount,
        ];
      });
      exportToExcelCsv(`Rapport_Finances_${todayStr}`, headers, rows);
    } else if (activeTab === 'joueurs') {
      const headers = ['Joueur', 'Âge', 'Équipe', 'Statut', 'Assiduité (%)', 'Reste (DH)'];
      const rows = activePlayers.map((p) => {
        const tm = teams.find((t) => t.id === p.teamId);
        const fin = getPlayerFinancials(p.id);
        const att = getPlayerAttendanceStats(p.id);
        return [
          `${p.firstName} ${p.lastName}`,
          calculateAge(p.birthDate),
          tm?.name || '',
          p.status,
          `${att.percentage}%`,
          fin.remainingAmount,
        ];
      });
      exportToExcelCsv(`Rapport_Joueurs_${todayStr}`, headers, rows);
    } else {
      const headers = ['Parent', 'Téléphone', 'Enfants', 'Total Payé (DH)', 'Solde Dû (DH)'];
      const rows = activeParents.map((pr) => {
        const fin = getParentFinancials(pr.id);
        return [
          `${pr.firstName} ${pr.lastName}`,
          pr.phone,
          fin.childrenCount,
          fin.paid,
          fin.remaining,
        ];
      });
      exportToExcelCsv(`Rapport_Parents_${todayStr}`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Rapports
          </h1>
          <p className="text-xs text-slate-500">
            Analyses financières, effectifs des joueurs et situations des familles
          </p>
        </div>

        {/* Boutons Exporter Excel & Imprimer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* 3 Onglets : Finances, Joueurs, Parents */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('finances')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'finances'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Finances
        </button>
        <button
          onClick={() => setActiveTab('joueurs')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'joueurs'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Joueurs
        </button>
        <button
          onClick={() => setActiveTab('parents')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'parents'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Parents
        </button>
      </div>

      {/* ONGLET 1: FINANCES */}
      {activeTab === 'finances' && (
        <div className="space-y-5">
          {/* Filter Period */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Période :</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setPeriodFilter('today')}
                className={`px-3 py-1 font-semibold rounded-md ${periodFilter === 'today' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setPeriodFilter('week')}
                className={`px-3 py-1 font-semibold rounded-md ${periodFilter === 'week' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                7 jours
              </button>
              <button
                onClick={() => setPeriodFilter('month')}
                className={`px-3 py-1 font-semibold rounded-md ${periodFilter === 'month' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                Ce mois
              </button>
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1 font-semibold rounded-md ${periodFilter === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                Toute la saison
              </button>
            </div>
          </div>

          {/* Cards : Total encaissé & Impayés */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Total encaissé</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 block mt-1">
                {formatCurrency(totalCollected, settings.currency)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Total impayés</span>
              <span className="text-2xl font-bold font-mono text-rose-600 block mt-1">
                {formatCurrency(totalUnpaid, settings.currency)}
              </span>
            </div>
          </div>

          {/* Table des paiements de la période */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">N° PAIEMENT</th>
                    <th className="py-2.5 px-3">DATE</th>
                    <th className="py-2.5 px-3">JOUEUR</th>
                    <th className="py-2.5 px-3">PÉRIODE</th>
                    <th className="py-2.5 px-3">MODE</th>
                    <th className="py-2.5 px-4 text-right">MONTANT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const pl = players.find((plyr) => plyr.id === p.playerId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{p.paymentNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{formatDate(p.date)}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{pl ? `${pl.firstName} ${pl.lastName}` : '-'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{p.period}</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.method}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(p.amount, settings.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2: JOUEURS */}
      {activeTab === 'joueurs' && (
        <div className="space-y-5">
          {/* Effectif, Joueurs actifs, Joueurs inactifs, Assiduité */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Effectif total</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                {activePlayers.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Joueurs actifs</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 block mt-1">
                {activePlayersCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Joueurs inactifs</span>
              <span className="text-2xl font-bold font-mono text-slate-600 block mt-1">
                {inactivePlayersCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Assiduité moyenne</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 block mt-1">
                {avgAttendance} %
              </span>
            </div>
          </div>

          {/* Joueurs par équipe */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Joueurs par équipe
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {teams.map((t) => {
                const count = activePlayers.filter((p) => p.teamId === t.id).length;
                return (
                  <div key={t.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{t.category}</span>
                    <span className="font-mono font-bold text-slate-900">{count} joueurs</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 3: PARENTS */}
      {activeTab === 'parents' && (
        <div className="space-y-5">
          {/* Nombre de familles, Parents avec plusieurs enfants, Parents avec impayés */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Nombre de familles</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                {parentsCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Plusieurs enfants inscrits</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 block mt-1">
                {multiChildrenParents.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Parents avec impayés</span>
              <span className="text-2xl font-bold font-mono text-rose-600 block mt-1">
                {unpaidParents.length}
              </span>
            </div>
          </div>

          {/* Liste récapitulative simple */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">PARENT</th>
                    <th className="py-2.5 px-3">TÉLÉPHONE</th>
                    <th className="py-2.5 px-3 text-center">ENFANTS</th>
                    <th className="py-2.5 px-3 text-right">TOTAL PAYÉ</th>
                    <th className="py-2.5 px-4 text-right">SOLDE RESTANT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeParents.map((pr) => {
                    const fin = getParentFinancials(pr.id);
                    return (
                      <tr key={pr.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{pr.firstName} {pr.lastName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{pr.phone}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{fin.childrenCount}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(fin.paid, settings.currency)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          <span className={fin.remaining > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                            {formatCurrency(fin.remaining, settings.currency)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
