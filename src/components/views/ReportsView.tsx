import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate, calculateAge, exportToExcelCsv } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    payments,
    players,
    parents,
    teams,
    getPlayerFinancials,
    getParentFinancials,
    getPlayerAttendanceStats,
    logExport,
  } = useApp();

  const { t, language, formatMoney } = useLanguage();

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
      const filename = `Rapport_Finances_${todayStr}`;
      if (!logExport('FINANCES', filename)) return;

      const headers = [
        language === 'ar' ? 'رقم الدفعة' : 'N° Paiement',
        language === 'ar' ? 'التاريخ' : 'Date',
        language === 'ar' ? 'اللاعب' : 'Joueur',
        language === 'ar' ? 'الفترة' : 'Période',
        language === 'ar' ? 'طريقة الأداء' : 'Mode',
        language === 'ar' ? 'المبلغ (د.م)' : 'Montant (DH)',
      ];
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
      exportToExcelCsv(filename, headers, rows);
    } else if (activeTab === 'joueurs') {
      const filename = `Rapport_Joueurs_${todayStr}`;
      if (!logExport('JOUEURS', filename)) return;

      const headers = [
        language === 'ar' ? 'اللاعب' : 'Joueur',
        language === 'ar' ? 'العمر' : 'Âge',
        language === 'ar' ? 'الفريق' : 'Équipe',
        language === 'ar' ? 'الحالة' : 'Statut',
        language === 'ar' ? 'المواظبة (%)' : 'Assiduité (%)',
        language === 'ar' ? 'المستحقات (د.م)' : 'Reste (DH)',
      ];
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
      exportToExcelCsv(filename, headers, rows);
    } else {
      const filename = `Rapport_Parents_${todayStr}`;
      if (!logExport('PARENTS', filename)) return;

      const headers = [
        language === 'ar' ? 'ولي الأمر' : 'Parent',
        language === 'ar' ? 'الهاتف' : 'Téléphone',
        language === 'ar' ? 'الأبناء' : 'Enfants',
        language === 'ar' ? 'إجمالي المؤدى (د.م)' : 'Total Payé (DH)',
        language === 'ar' ? 'المتبقي (د.م)' : 'Solde Dû (DH)',
      ];
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
      exportToExcelCsv(filename, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('reports.title', 'Rapports')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('reports.subtitle', 'Analyses financières, effectifs des joueurs et situations des familles')}
          </p>
        </div>

        {/* Boutons Exporter Excel & Imprimer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('common.print', 'Imprimer')}</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t('common.exportExcel', 'Exporter Excel')}</span>
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
          {t('reports.tabFinances', 'Rapport Financier')}
        </button>
        <button
          onClick={() => setActiveTab('joueurs')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'joueurs'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('reports.tabPlayers', 'Rapport Joueurs')}
        </button>
        <button
          onClick={() => setActiveTab('parents')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'parents'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('reports.tabParents', 'Rapport Parents')}
        </button>
      </div>

      {/* ONGLET 1: FINANCES */}
      {activeTab === 'finances' && (
        <div className="space-y-5">
          {/* Filter Period */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              {language === 'ar' ? 'الفترة الزمنية:' : 'Période :'}
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setPeriodFilter('today')}
                className={`px-3 py-1 font-semibold rounded-md cursor-pointer ${periodFilter === 'today' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                {language === 'ar' ? 'اليوم' : "Aujourd'hui"}
              </button>
              <button
                onClick={() => setPeriodFilter('week')}
                className={`px-3 py-1 font-semibold rounded-md cursor-pointer ${periodFilter === 'week' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                {language === 'ar' ? '7 أيام' : '7 jours'}
              </button>
              <button
                onClick={() => setPeriodFilter('month')}
                className={`px-3 py-1 font-semibold rounded-md cursor-pointer ${periodFilter === 'month' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                {language === 'ar' ? 'هذا الشهر' : 'Ce mois'}
              </button>
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1 font-semibold rounded-md cursor-pointer ${periodFilter === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                {language === 'ar' ? 'الموسم بأكمله' : 'Toute la saison'}
              </button>
            </div>
          </div>

          {/* Cards : Total encaissé & Impayés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {t('reports.totalRevenue', 'Total encaissé')}
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                {formatMoney(totalCollected)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {filteredPayments.length} {language === 'ar' ? 'عملية مؤكدة' : 'règlements validés'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {t('reports.totalUnpaidRevenue', 'Total impayés')}
              </span>
              <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                {formatMoney(totalUnpaid)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {language === 'ar' ? 'المتبقي لتحصيله هذا الموسم' : 'Reste à recouvrer sur la saison'}
              </span>
            </div>
          </div>

          {/* Table Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'ar' ? 'سجل العمليات للفترة المحددة' : 'Détail des opérations sur la période'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">{t('payments.colNum', 'N° PAIEMENT')}</th>
                    <th className="py-2.5 px-3">{t('common.date', 'DATE')}</th>
                    <th className="py-2.5 px-3">{t('common.player', 'JOUEUR')}</th>
                    <th className="py-2.5 px-3">{t('payments.colPeriod', 'PÉRIODE')}</th>
                    <th className="py-2.5 px-3">{t('payments.colMethod', 'MODE')}</th>
                    <th className="py-2.5 px-4 text-end">{t('common.amount', 'MONTANT')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {language === 'ar' ? 'لا توجد عمليات مسجلة في هذه الفترة.' : 'Aucun encaissement sur cette période.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const pl = players.find((plyr) => plyr.id === p.playerId);
                      return (
                        <tr key={p.id}>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{p.paymentNumber}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{formatDate(p.date)}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {pl ? `${pl.firstName} ${pl.lastName}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{p.period}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.method}</td>
                          <td className="py-2.5 px-4 text-end font-mono font-bold text-emerald-700">
                            {formatMoney(p.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2: JOUEURS */}
      {activeTab === 'joueurs' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {t('dashboard.activePlayers', 'Joueurs actifs')}
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                {activePlayersCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {language === 'ar' ? 'اللاعبون غير النشطين' : 'Joueurs inactifs'}
              </span>
              <span className="text-2xl font-bold font-mono text-slate-600 mt-1 block">
                {inactivePlayersCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {t('attendance.overallRate', 'Taux de présence moyen')}
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                {avgAttendance} %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 3: PARENTS */}
      {activeTab === 'parents' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {t('parents.title', 'Parents enregistrés')}
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {parentsCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {language === 'ar' ? 'أسر متعددة الأبناء' : 'Familles multi-enfants'}
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                {multiChildrenParents.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">
                {language === 'ar' ? 'أولياء أمور بمستحقات معلقة' : 'Parents avec impayés'}
              </span>
              <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                {unpaidParents.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
