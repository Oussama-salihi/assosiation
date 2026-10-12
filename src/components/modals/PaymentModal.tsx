import React, { useState, useEffect } from 'react';
import { X, Wallet, CheckCircle2, ReceiptText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PaymentMethod } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlayerId?: string;
  onPaymentSuccess?: (paymentId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedPlayerId,
  onPaymentSuccess,
}) => {
  const { players, parents, teams, addPayment, getPlayerFinancials, settings } = useApp();
  const { t, language, formatMoney } = useLanguage();

  const [playerId, setPlayerId] = useState(preselectedPlayerId || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [period, setPeriod] = useState(language === 'ar' ? 'أكتوبر 2026' : 'Octobre 2026');
  const [method, setMethod] = useState<PaymentMethod>('Espèces');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // State after submission
  const [savedPaymentId, setSavedPaymentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedPlayerId) {
      setPlayerId(preselectedPlayerId);
      const pl = players.find((p) => p.id === preselectedPlayerId);
      if (pl) {
        const fin = getPlayerFinancials(pl.id);
        const team = teams.find((t) => t.id === pl.teamId);
        setAmount(fin.remainingAmount > 0 ? Math.min(fin.remainingAmount, team?.monthlyFee || 300) : (team?.monthlyFee || 300));
      }
    } else {
      setSavedPaymentId(null);
    }
    setErrorMessage(null);
  }, [preselectedPlayerId, isOpen]);

  if (!isOpen) return null;

  const selectedPlayer = players.find((p) => p.id === playerId);
  const selectedParent = selectedPlayer ? parents.find((pr) => pr.id === selectedPlayer.parentId) : null;
  const selectedTeam = selectedPlayer ? teams.find((t) => t.id === selectedPlayer.teamId) : null;
  const playerFinancials = selectedPlayer ? getPlayerFinancials(selectedPlayer.id) : null;
  const activePlayers = players.filter((p) => !p.isDeleted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setErrorMessage(language === 'ar' ? 'يرجى إدخال مبلغ صحيح أكبر من 0' : 'Veuillez saisir un montant valide supérieur à 0 DH.');
        setIsSubmitting(false);
        return;
      }

      const newPayment = addPayment({
        playerId,
        parentId: selectedParent?.id,
        amount: numAmount,
        date: new Date().toISOString().split('T')[0],
        period,
        method,
        reference: reference.trim(),
        notes: notes.trim(),
      });

      setSavedPaymentId(newPayment.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSavedPaymentId(null);
    setErrorMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight">
              {t('payments.newPayment', 'Enregistrer un paiement')}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Screen after registration */}
        {savedPaymentId ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {language === 'ar' ? 'تم تسجيل الدفعة بنجاح' : 'Paiement enregistré avec succès'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ar'
                  ? 'تم تحديث الرصيد المالي للاعب والأسرة فورياً.'
                  : 'Le solde du joueur et de la famille a été mis à jour instantanément.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('common.close', 'Fermer')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = savedPaymentId;
                  handleClose();
                  if (onPaymentSuccess) onPaymentSuccess(id);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <ReceiptText className="w-4 h-4" />
                <span>{language === 'ar' ? 'معاينة الإيصال' : 'Voir le reçu'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Joueur */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('payments.selectPlayer', 'Joueur')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={playerId}
                onChange={(e) => {
                  setPlayerId(e.target.value);
                  const pl = players.find((p) => p.id === e.target.value);
                  if (pl) {
                    const fin = getPlayerFinancials(pl.id);
                    const team = teams.find((t) => t.id === pl.teamId);
                    setAmount(fin.remainingAmount > 0 ? Math.min(fin.remainingAmount, team?.monthlyFee || 300) : (team?.monthlyFee || 300));
                  }
                }}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900 font-medium cursor-pointer"
              >
                <option value="">-- {language === 'ar' ? 'اختر اللاعب' : 'Sélectionner le joueur'} --</option>
                {activePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Affichage automatique : Parent, Équipe, Solde actuel */}
            {selectedPlayer && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('common.parent', 'Parent')} :</span>
                  <span className="font-bold text-slate-800">
                    {selectedParent ? `${selectedParent.firstName} ${selectedParent.lastName}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('common.team', 'Équipe')} :</span>
                  <span className="font-bold text-slate-800">
                    {selectedTeam?.name} ({selectedTeam?.category})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">{t('unpaid.colRemaining', 'Solde actuel restant')} :</span>
                  <span className={`font-mono font-bold ${playerFinancials && playerFinancials.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {playerFinancials ? formatMoney(playerFinancials.remainingAmount) : '-'}
                  </span>
                </div>
              </div>
            )}

            {/* Montant */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('payments.paymentAmount', 'Montant')} ({language === 'ar' ? 'د.م' : settings.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                required
                placeholder="ex: 300"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-mono font-bold text-slate-900"
              />
            </div>

            {/* Période */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('payments.paymentPeriod', 'Période')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                placeholder={language === 'ar' ? 'أكتوبر 2026' : 'Octobre 2026'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
              />
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('payments.paymentMethod', 'Mode de paiement')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900 cursor-pointer"
              >
                <option value="Espèces">{t('common.cash', 'Espèces')}</option>
                <option value="Virement bancaire">{t('common.bankTransfer', 'Virement bancaire')}</option>
                <option value="Chèque">{t('common.cheque', 'Chèque')}</option>
                <option value="Carte bancaire">{t('common.creditCard', 'Carte bancaire')}</option>
                <option value="Autre">{t('common.other', 'Autre')}</option>
              </select>
            </div>

            {/* Référence */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('payments.referenceLabel', 'Référence (facultatif)')}
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={language === 'ar' ? 'رقم الشيك أو الحوالة' : 'N° chèque ou référence virement'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900 font-mono"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('common.notes', 'Remarques')}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'ar' ? 'ملاحظة داخلية...' : 'Note interne...'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Bouton Enregistrer le paiement */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
              >
                {t('common.cancel', 'Annuler')}
              </button>
              <button
                type="submit"
                disabled={!playerId || !amount || isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold cursor-pointer"
              >
                {isSubmitting ? '...' : t('dashboard.recordPayment', 'Enregistrer le paiement')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
