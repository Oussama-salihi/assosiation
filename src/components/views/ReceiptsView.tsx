import React, { useState } from 'react';
import {
  ReceiptText,
  Search,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/formatters';

interface ReceiptsViewProps {
  onOpenReceiptModal: (paymentId: string) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  onOpenReceiptModal,
}) => {
  const { receipts, payments, players, parents } = useApp();
  const { t, language, formatMoney, isRTL } = useLanguage();

  const [search, setSearch] = useState('');

  const filteredReceipts = receipts.filter((rec) => {
    const pay = payments.find((p) => p.id === rec.paymentId);
    const player = players.find((pl) => pl.id === pay?.playerId);
    const parent = parents.find((pr) => pr.id === pay?.parentId);

    const q = search.toLowerCase();
    return (
      rec.receiptNumber.toLowerCase().includes(q) ||
      (pay && pay.paymentNumber.toLowerCase().includes(q)) ||
      (player && `${player.firstName} ${player.lastName}`.toLowerCase().includes(q)) ||
      (parent && `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-600" />
            <span>{t('receipts.title', 'Reçus Officiels')} ({receipts.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('receipts.subtitle', 'Reçus officiels de cotisation numérotés')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'البحث برقم الإيصال، اللاعب أو ولي الأمر...' : 'Rechercher par N° de reçu, joueur ou parent...'}
            className={`w-full ${
              isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'
            } py-1.5 rounded-lg border border-slate-200 focus:border-emerald-600 text-slate-900 outline-none text-xs`}
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">{t('receipts.colNumber', 'N° REÇU')}</th>
                <th className="py-3 px-3">{t('receipts.colDate', "DATE D'ÉMISSION")}</th>
                <th className="py-3 px-3">{language === 'ar' ? 'المؤدي (ولي الأمر)' : 'PAYEUR (PARENT)'}</th>
                <th className="py-3 px-3">{t('receipts.forPlayer', 'JOUEUR')}</th>
                <th className="py-3 px-3">{language === 'ar' ? 'الفترة' : 'PÉRIODE'}</th>
                <th className="py-3 px-3">{t('payments.colMethod', 'MODE')}</th>
                <th className="py-3 px-3 text-end">{t('receipts.colAmount', 'MONTANT ENCAISSÉ')}</th>
                <th className="py-3 px-3">{language === 'ar' ? 'حرر من طرف' : 'ÉMIS PAR'}</th>
                <th className="py-3 px-4 text-center">{t('common.actions', 'ACTION')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    {language === 'ar' ? 'لم يتم العثور على أي إيصال رسمي.' : 'Aucun reçu officiel trouvé.'}
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => {
                  const pay = payments.find((p) => p.id === rec.paymentId);
                  const player = players.find((pl) => pl.id === pay?.playerId);
                  const parent = parents.find((pr) => pr.id === pay?.parentId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-black text-emerald-800 text-sm">
                        #{rec.receiptNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {formatDate(rec.generatedAt)}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {parent ? `${parent.firstName} ${parent.lastName}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {player ? `${player.firstName} ${player.lastName}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {pay?.period || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {pay?.method || '-'}
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-emerald-700 text-sm tabular-nums">
                        {pay ? formatMoney(pay.amount) : '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {rec.generatedBy}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenReceiptModal(rec.paymentId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'طباعة / PDF' : 'Imprimer / PDF'}</span>
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
