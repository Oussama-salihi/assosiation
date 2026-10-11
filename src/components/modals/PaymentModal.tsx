import React, { useState, useEffect } from 'react';
import { X, Wallet, CheckCircle2, ReceiptText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';

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

  const [playerId, setPlayerId] = useState(preselectedPlayerId || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [period, setPeriod] = useState('Octobre 2026');
  const [method, setMethod] = useState<PaymentMethod>('Espèces');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // State after submission
  const [savedPaymentId, setSavedPaymentId] = useState<string | null>(null);

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
  }, [preselectedPlayerId, isOpen]);

  if (!isOpen) return null;

  const selectedPlayer = players.find((p) => p.id === playerId);
  const selectedParent = selectedPlayer ? parents.find((pr) => pr.id === selectedPlayer.parentId) : null;
  const selectedTeam = selectedPlayer ? teams.find((t) => t.id === selectedPlayer.teamId) : null;
  const playerFinancials = selectedPlayer ? getPlayerFinancials(selectedPlayer.id) : null;
  const activePlayers = players.filter((p) => !p.isDeleted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newPayment = addPayment({
      playerId,
      parentId: selectedParent?.id,
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      period,
      method,
      reference,
      notes,
    });

    setSavedPaymentId(newPayment.id);
  };

  const handleClose = () => {
    setSavedPaymentId(null);
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
              Enregistrer un paiement
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
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
                Paiement enregistré avec succès
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Le solde du joueur et de la famille a été mis à jour instantanément.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Fermer
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
                <span>Voir le reçu</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Joueur */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Joueur <span className="text-rose-500">*</span>
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900 font-medium"
              >
                <option value="">-- Sélectionner le joueur --</option>
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
                  <span className="text-slate-500">Parent :</span>
                  <span className="font-bold text-slate-800">
                    {selectedParent ? `${selectedParent.firstName} ${selectedParent.lastName}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Équipe :</span>
                  <span className="font-bold text-slate-800">
                    {selectedTeam?.name} ({selectedTeam?.category})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">Solde actuel restant :</span>
                  <span className={`font-mono font-bold ${playerFinancials && playerFinancials.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {playerFinancials ? formatCurrency(playerFinancials.remainingAmount, settings.currency) : '-'}
                  </span>
                </div>
              </div>
            )}

            {/* Montant */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Montant ({settings.currency}) <span className="text-rose-500">*</span>
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
                Période <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                placeholder="ex: Octobre 2026"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
              />
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mode de paiement <span className="text-rose-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
              >
                <option value="Espèces">Espèces</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Carte bancaire">Carte bancaire</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Référence */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Référence (facultatif)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="N° chèque ou référence virement"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900 font-mono"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Note (facultatif)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note interne..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
              />
            </div>

            {/* Bouton Enregistrer le paiement */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!playerId || !amount}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold cursor-pointer"
              >
                Enregistrer le paiement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
