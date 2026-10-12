import React, { useState } from 'react';
import {
  AlertCircle,
  Search,
  Wallet,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate, exportToExcelCsv } from '../../utils/formatters';

interface UnpaidViewProps {
  onOpenQuickPayment: (playerId: string) => void;
  onNavigateToPlayer: (playerId: string) => void;
}

export const UnpaidView: React.FC<UnpaidViewProps> = ({
  onOpenQuickPayment,
  onNavigateToPlayer,
}) => {
  const { players, parents, teams, settings, registrations, getPlayerFinancials, logExport } = useApp();
  const { t, language, formatMoney, isRTL } = useLanguage();

  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [onlyOverdue30, setOnlyOverdue30] = useState(false);

  const today = new Date();
  const activePlayers = players.filter((p) => !p.isDeleted);

  const unpaidList = activePlayers
    .map((player) => {
      const parent = parents.find((pr) => pr.id === player.parentId);
      const team = teams.find((t) => t.id === player.teamId);
      const fin = getPlayerFinancials(player.id);

      // Compute delay days
      let daysLate = 0;
      let refDateStr = fin.lastPaymentDate;
      if (!refDateStr) {
        const reg = registrations.find((r) => r.playerId === player.id && r.status !== 'Annulée');
        refDateStr = reg?.startDate || reg?.registrationDate || player.registrationDate;
      }
      if (refDateStr && fin.remainingAmount > 0) {
        const refDate = new Date(refDateStr);
        daysLate = Math.max(0, Math.floor((today.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));
      }

      return {
        player,
        parent,
        team,
        fin,
        daysLate,
      };
    })
    .filter((item) => item.fin.remainingAmount > 0)
    .filter((item) => {
      if (onlyOverdue30 && item.daysLate <= 30) return false;

      const q = search.toLowerCase();
      const matchesSearch =
        `${item.player.firstName} ${item.player.lastName}`.toLowerCase().includes(q) ||
        (item.parent && `${item.parent.firstName} ${item.parent.lastName}`.toLowerCase().includes(q));

      const matchesTeam = filterTeam === 'ALL' || item.player.teamId === filterTeam;

      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => b.fin.remainingAmount - a.fin.remainingAmount);

  const totalOverdue30Count = activePlayers.filter((p) => {
    const fin = getPlayerFinancials(p.id);
    if (fin.remainingAmount <= 0) return false;
    let refDateStr = fin.lastPaymentDate;
    if (!refDateStr) {
      const reg = registrations.find((r) => r.playerId === p.id && r.status !== 'Annulée');
      refDateStr = reg?.startDate || reg?.registrationDate || p.registrationDate;
    }
    if (!refDateStr) return false;
    const days = Math.floor((today.getTime() - new Date(refDateStr).getTime()) / (1000 * 60 * 60 * 24));
    return days > 30;
  }).length;

  const totalRemainingSum = unpaidList.reduce((sum, item) => sum + item.fin.remainingAmount, 0);

  const handleExportCsv = () => {
    const headers = [
      language === 'ar' ? 'اللاعب' : 'Joueur',
      language === 'ar' ? 'ولي الأمر' : 'Parent',
      language === 'ar' ? 'الفريق' : 'Équipe',
      language === 'ar' ? 'المبلغ المتبقي (د.م)' : 'Montant restant (DH)',
      language === 'ar' ? 'آخر دفعة' : 'Dernier paiement',
      language === 'ar' ? 'مدة التأخير (أيام)' : 'Retard (jours)',
      language === 'ar' ? 'الحالة' : 'Statut',
    ];

    const rows = unpaidList.map((item) => [
      `${item.player.firstName} ${item.player.lastName}`,
      item.parent ? `${item.parent.firstName} ${item.parent.lastName}` : '',
      item.team?.name || '',
      item.fin.remainingAmount,
      item.fin.lastPaymentDate ? formatDate(item.fin.lastPaymentDate) : (language === 'ar' ? 'لا يوجد' : 'Aucun'),
      item.daysLate,
      item.fin.status,
    ]);

    const filename = `Impayes_${new Date().toISOString().split('T')[0]}`;
    if (!logExport('IMPAYES', filename)) return;

    exportToExcelCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('unpaid.title', 'Impayés')} ({unpaidList.length})</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('unpaid.totalToRecover', 'Total restant à recouvrer :')}{' '}
            <strong className="text-rose-600 font-mono font-bold text-sm">
              {formatMoney(totalRemainingSum)}
            </strong>
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>{t('common.exportExcel', 'Exporter Excel')}</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ar' ? 'البحث باللاعب أو ولي الأمر...' : 'Rechercher par joueur ou parent...'}
              className={`w-full ${
                isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'
              } py-1.5 rounded-lg border border-slate-200 focus:border-rose-500 text-slate-900 outline-none text-xs`}
            />
          </div>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs cursor-pointer"
          >
            <option value="ALL">{language === 'ar' ? 'جميع الفرق' : 'Toutes les équipes'}</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter: Retard > 30 jours */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyOverdue30(!onlyOverdue30)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              onlyOverdue30
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {language === 'ar' ? 'متأخر > 30 يوماً' : 'Retard > 30 jours'} ({totalOverdue30Count})
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="py-3 px-4">{t('unpaid.colPlayer', 'JOUEUR')}</th>
                <th className="py-3 px-3">{t('unpaid.colParent', 'PARENT')}</th>
                <th className="py-3 px-3">{t('unpaid.colTeam', 'ÉQUIPE')}</th>
                <th className="py-3 px-3 text-end">{t('unpaid.colRemaining', 'MONTANT RESTANT')}</th>
                <th className="py-3 px-3 text-center">{t('unpaid.colLastPayment', 'DERNIER PAIEMENT')}</th>
                <th className="py-3 px-3 text-center">{t('unpaid.colDelay', 'RETARD')}</th>
                <th className="py-3 px-3 text-center">{t('common.status', 'STATUT')}</th>
                <th className="py-3 px-4 text-center">{t('common.actions', 'ACTION')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unpaidList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 stroke-1" />
                    <p className="font-semibold text-slate-700">
                      {language === 'ar' ? 'لا توجد مستحقات معلقة' : 'Aucun impayé trouvé'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {language === 'ar' ? 'جميع المشتركين المحددين في وضعية سليمة.' : 'Tous les adhérents sélectionnés sont à jour.'}
                    </p>
                  </td>
                </tr>
              ) : (
                unpaidList.map(({ player, parent, team, fin, daysLate }) => (
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
                    <td className="py-3 px-3 text-end font-mono font-bold text-rose-600 text-sm">
                      {formatMoney(fin.remainingAmount)}
                    </td>

                    {/* Dernier paiement */}
                    <td className="py-3 px-3 text-center text-slate-600 font-mono">
                      {fin.lastPaymentDate ? formatDate(fin.lastPaymentDate) : t('unpaid.none', 'Aucun')}
                    </td>

                    {/* Retard constaté */}
                    <td className="py-3 px-3 text-center">
                      {daysLate > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            daysLate > 30
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {daysLate > 30 && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{daysLate} {language === 'ar' ? 'يوم' : 'j'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
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
                        {fin.status === 'PARTIELLEMENT PAYÉ'
                          ? t('common.partiallyPaid', 'PARTIELLEMENT PAYÉ')
                          : t('common.unpaidStatus', 'IMPAYÉ')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenQuickPayment(player.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {t('dashboard.settle', 'Régulariser')}
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
