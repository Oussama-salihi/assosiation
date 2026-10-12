import React, { useState } from 'react';
import {
  Wallet,
  ReceiptText,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Printer,
  Download,
  Building2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Player, Payment, Receipt } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ParentPaymentsViewProps {
  parentId: string;
  linkedPlayers: Player[];
  selectedChildId: string | 'all';
  onSelectChild: (id: string | 'all') => void;
  onOpenReceiptModal: (paymentId: string) => void;
}

export const ParentPaymentsView: React.FC<ParentPaymentsViewProps> = ({
  parentId,
  linkedPlayers,
  selectedChildId,
  onSelectChild,
  onOpenReceiptModal,
}) => {
  const {
    settings,
    getParentPayments,
    getPlayerFinancials,
  } = useApp();

  const { t, language, formatMoney, isRTL } = useLanguage();

  const displayedPlayers = selectedChildId === 'all'
    ? linkedPlayers
    : linkedPlayers.filter((p) => p.id === selectedChildId);

  const displayedPlayerIds = new Set(displayedPlayers.map((p) => p.id));
  const allParentPayments = getParentPayments(parentId);
  const relevantPayments = allParentPayments.filter((p) => displayedPlayerIds.has(p.playerId));

  // Financial summary
  const totals = displayedPlayers.reduce(
    (acc, player) => {
      const fin = getPlayerFinancials(player.id);
      acc.expected += fin.expectedAmount;
      acc.paid += fin.paidAmount;
      acc.remaining += fin.remainingAmount;
      return acc;
    },
    { expected: 0, paid: 0, remaining: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('parentPortal.payments', 'Cotisations & Reçus')}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {relevantPayments.length} {language === 'ar' ? 'دفعات' : 'règlements'}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'الشفافية المالية التامة: تفاصيل الانخراط، المبالغ المؤداة وتحميل الإيصالات الرسمية'
              : 'Transparence financière : situation des cotisations, historique des paiements et reçus officiels'}
          </p>
        </div>

        {/* Read-only Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-600 text-xs font-medium self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'ar' ? 'سجل مالي معتمد ومحمي' : 'Historique financier certifié'}</span>
        </div>
      </div>

      {/* Child Switcher (if multiple children) */}
      {linkedPlayers.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectChild('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedChildId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{t('parentPortal.allChildren', 'Tous mes enfants')} ({linkedPlayers.length})</span>
          </button>
          {linkedPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelectChild(player.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                selectedChildId === player.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{player.firstName} {player.lastName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expected */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {language === 'ar' ? 'إجمالي الاشتراك السنوي' : 'Total des cotisations prévues'}
          </span>
          <p className="text-2xl font-black text-slate-900">{formatMoney(totals.expected)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {displayedPlayers.length} {language === 'ar' ? 'أبناء منخرطين' : 'enfant(s) licencié(s)'}
          </span>
        </div>

        {/* Total Paid */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            {language === 'ar' ? 'المبلغ المؤدى فعلياً' : 'Total des montants réglés'}
          </span>
          <p className="text-2xl font-black text-emerald-600">{formatMoney(totals.paid)}</p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{relevantPayments.length} {language === 'ar' ? 'دفعة مؤكدة بإيصال' : 'paiement(s) validé(s)'}</span>
          </span>
        </div>

        {/* Total Remaining */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
            totals.remaining > 0 ? 'text-amber-700' : 'text-slate-500'
          }`}>
            {language === 'ar' ? 'المبلغ المتبقي للأداء' : 'Reste à régler'}
          </span>
          <p className={`text-2xl font-black ${
            totals.remaining > 0 ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {formatMoney(totals.remaining)}
          </p>
          <span className="text-[11px] mt-1 block font-semibold">
            {totals.remaining === 0 ? (
              <span className="text-emerald-600 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'الاشتراكات مسواة بالكامل' : 'Compte totalement à jour'}</span>
              </span>
            ) : (
              <span className="text-amber-700">
                {language === 'ar' ? 'يرجى تسوية المستحق بالإدارة' : 'Règlement à prévoir auprès du secrétariat'}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'سجل عمليات الأداء والإيصالات الرسمية' : 'Historique des règlements effectués'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'انقر على "معاينة الإيصال" للطباعة أو الاحتفاظ بنسخة رسمية'
                : 'Consultez ou imprimez chaque reçu officiel délivré par le club'}
            </p>
          </div>
        </div>

        {relevantPayments.length === 0 ? (
          <div className="p-12 text-center">
            <ReceiptText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">
              {language === 'ar' ? 'لا توجد مدفوعات مسجلة حتى الآن' : 'Aucun paiement enregistré pour l’instant'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {language === 'ar'
                ? 'عند تسجيل أي دفعة بالإدارة، ستظهر هنا مع إمكانية استخراج الإيصال مباشرة.'
                : 'Vos prochains versements auprès du club apparaîtront automatiquement ici avec reçu téléchargeable.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200/60">
                <tr>
                  <th className="px-5 py-3.5">{language === 'ar' ? 'المرجع / الإيصال' : 'Réf. Paiement'}</th>
                  <th className="px-5 py-3.5">{language === 'ar' ? 'الابن المنخرط' : 'Enfant'}</th>
                  <th className="px-5 py-3.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-5 py-3.5">{language === 'ar' ? 'الفترة المغطاة' : 'Période'}</th>
                  <th className="px-5 py-3.5">{language === 'ar' ? 'طريقة الدفع' : 'Mode'}</th>
                  <th className="px-5 py-3.5 text-right rtl:text-left">{language === 'ar' ? 'المبلغ' : 'Montant'}</th>
                  <th className="px-5 py-3.5 text-center">{language === 'ar' ? 'الإيصال الرسمي' : 'Reçu officiel'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relevantPayments.map((payment) => {
                  const child = linkedPlayers.find((p) => p.id === payment.playerId);
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {payment.paymentNumber}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {child ? `${child.firstName} ${child.lastName}` : '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {payment.period}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right rtl:text-left font-black text-emerald-700 text-sm">
                        {formatMoney(payment.amount)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => onOpenReceiptModal(payment.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'معاينة الإيصال' : 'Voir le reçu'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Association Bank & Office Details Notice */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Building2 className="w-5 h-5" />
              <h4 className="font-bold text-base">
                {language === 'ar' ? 'طرق أداء الاشتراكات المعتمدة' : 'Modalités de règlement de vos cotisations'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {language === 'ar'
                ? `يمكنكم تسوية الاشتراكات إما نقداً أو بشيك بكتابة النادي بمركب الأمل بالدار البيضاء، أو عبر التحويل البنكي لحساب الجمعية مع ذكر اسم الابن في مرجع التحويل.`
                : `Les règlements peuvent être effectués au secrétariat du club (espèces ou chèque) ou par virement bancaire sur le compte officiel de l’association.`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-xs space-y-1.5 shrink-0 min-w-[280px]">
            <p><strong>{language === 'ar' ? 'البنك' : 'Banque'} :</strong> {settings.bankName || 'Attijariwafa Bank'}</p>
            <p><strong>RIB :</strong> <span className="font-mono text-[11px] text-emerald-300">{settings.rib || '011 780 0000 123456789012 34'}</span></p>
            <p><strong>{language === 'ar' ? 'المستفيد' : 'Bénéficiaire'} :</strong> {settings.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
