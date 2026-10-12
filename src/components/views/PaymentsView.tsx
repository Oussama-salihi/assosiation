import React, { useState } from 'react';
import {
  Wallet,
  Search,
  Plus,
  ReceiptText,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate, exportToExcelCsv } from '../../utils/formatters';

interface PaymentsViewProps {
  onOpenNewPayment: () => void;
  onOpenReceipt: (paymentId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenNewPayment,
  onOpenReceipt,
}) => {
  const { payments, players, parents, teams, logExport } = useApp();
  const { t, language, formatMoney, isRTL } = useLanguage();

  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [filterDateMonth, setFilterDateMonth] = useState<string>('ALL');

  const filteredPayments = payments.filter((pay) => {
    const player = players.find((p) => p.id === pay.playerId);
    const parent = parents.find((pr) => pr.id === pay.parentId);
    const q = search.toLowerCase();

    const matchesSearch =
      pay.paymentNumber.toLowerCase().includes(q) ||
      (player && `${player.firstName} ${player.lastName}`.toLowerCase().includes(q)) ||
      (parent && `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(q)) ||
      (pay.reference && pay.reference.toLowerCase().includes(q)) ||
      pay.period.toLowerCase().includes(q);

    const matchesMethod = filterMethod === 'ALL' || pay.method === filterMethod;
    const matchesMonth =
      filterDateMonth === 'ALL' || pay.date.startsWith(filterDateMonth);

    return matchesSearch && matchesMethod && matchesMonth;
  });

  const totalFilteredAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'Espèces':
        return t('common.cash', 'Espèces');
      case 'Virement bancaire':
        return t('common.bankTransfer', 'Virement bancaire');
      case 'Chèque':
        return t('common.cheque', 'Chèque');
      case 'Carte bancaire':
        return t('common.creditCard', 'Carte bancaire');
      default:
        return method;
    }
  };

  const handleExportCsv = () => {
    const headers = [
      language === 'ar' ? 'رقم الدفعة' : 'N° Paiement',
      language === 'ar' ? 'التاريخ' : 'Date',
      language === 'ar' ? 'اللاعب' : 'Joueur',
      language === 'ar' ? 'ولي الأمر' : 'Parent / Tuteur',
      language === 'ar' ? 'الفترة' : 'Période',
      language === 'ar' ? 'طريقة الأداء' : 'Mode de règlement',
      language === 'ar' ? 'المرجع' : 'Référence',
      language === 'ar' ? 'المبلغ (د.م)' : 'Montant (DH)',
      language === 'ar' ? 'الحالة' : 'Statut',
      language === 'ar' ? 'سجل بواسطة' : 'Enregistré par',
    ];

    const rows = filteredPayments.map((p) => {
      const pl = players.find((plyr) => plyr.id === p.playerId);
      const pr = parents.find((par) => par.id === p.parentId);
      return [
        p.paymentNumber,
        formatDate(p.date),
        pl ? `${pl.firstName} ${pl.lastName}` : '',
        pr ? `${pr.firstName} ${pr.lastName}` : '',
        p.period,
        p.method,
        p.reference || '',
        p.amount,
        p.status,
        p.recordedBy,
      ];
    });

    const filename = `Paiements_Club_${new Date().toISOString().split('T')[0]}`;
    if (!logExport('FINANCES', filename)) return;

    exportToExcelCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('payments.title', 'Paiements & Encaissements')} ({payments.length})
          </h2>
          <p className="text-xs text-slate-500">
            {t('payments.subtitle', 'Registre des encaissements en DH')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('common.exportExcel', 'Exporter Excel')}</span>
          </button>
          <button
            onClick={onOpenNewPayment}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('payments.newPayment', 'Enregistrer un paiement')}</span>
          </button>
        </div>
      </div>

      {/* Filter and summary bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ar' ? 'البحث باللاعب، ولي الأمر، الرقم...' : 'Rechercher par joueur, parent, reçu, réf...'}
              className={`w-full ${
                isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'
              } py-1.5 rounded-lg border border-slate-200 focus:border-emerald-600 text-slate-900 outline-none text-xs`}
            />
          </div>

          <div>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs cursor-pointer"
            >
              <option value="ALL">{language === 'ar' ? 'جميع طرق الأداء' : 'Tous les modes de règlement'}</option>
              <option value="Espèces">{t('common.cash', 'Espèces')}</option>
              <option value="Virement bancaire">{t('common.bankTransfer', 'Virement bancaire')}</option>
              <option value="Chèque">{t('common.cheque', 'Chèque')}</option>
              <option value="Carte bancaire">{t('common.creditCard', 'Carte bancaire')}</option>
              <option value="Autre">{t('common.other', 'Autre')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
            <span className="text-[11px] font-semibold">
              {language === 'ar' ? 'إجمالي المحدد:' : 'Total sélection :'}
            </span>
            <span className="font-mono font-bold text-sm ml-2">
              {formatMoney(totalFilteredAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">{t('payments.colNum', 'N° TRANSACTION')}</th>
                <th className="py-3 px-3">{t('common.date', 'DATE')}</th>
                <th className="py-3 px-3">{t('payments.colPlayer', 'JOUEUR & ÉQUIPE')}</th>
                <th className="py-3 px-3">{t('common.parent', 'PARENT / PAYEUR')}</th>
                <th className="py-3 px-3">{t('payments.colPeriod', 'PÉRIODE CONCERNÉE')}</th>
                <th className="py-3 px-3">{t('payments.colMethod', 'MODE')}</th>
                <th className="py-3 px-3 text-end">{t('common.amount', 'MONTANT')}</th>
                <th className="py-3 px-3 text-center">{t('common.status', 'STATUT')}</th>
                <th className="py-3 px-4 text-center">{t('receipts.title', 'REÇU OFFICIEL')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    {language === 'ar' ? 'لم يتم العثور على أي مدفوعات.' : 'Aucun paiement trouvé pour ces critères.'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const player = players.find((p) => p.id === payment.playerId);
                  const parent = parents.find((pr) => pr.id === payment.parentId);
                  const team = teams.find((t) => t.id === player?.teamId);

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {payment.paymentNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {formatDate(payment.date)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          {player ? `${player.firstName} ${player.lastName}` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {team?.category} · {team?.name}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">
                          {parent ? `${parent.firstName} ${parent.lastName}` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {parent?.phone}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {payment.period}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{getMethodLabel(payment.method)}</div>
                        {payment.reference && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {payment.reference}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-emerald-700 text-sm tabular-nums">
                        {formatMoney(payment.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {payment.status === 'Validé' ? t('common.validated', 'Validé') : payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenReceipt(payment.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
                        >
                          <ReceiptText className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'معاينة الإيصال' : 'Voir reçu'}</span>
                        </button>
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
  );
};
