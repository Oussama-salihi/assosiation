import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ReceiptViewModalProps {
  paymentId: string | null;
  onClose: () => void;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({
  paymentId,
  onClose,
}) => {
  const { settings, payments, players, parents, teams, receipts, generateReceipt, getPlayerFinancials } = useApp();

  if (!paymentId) return null;

  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) return null;

  // Assurer qu'un reçu existe ou le créer
  let receipt = receipts.find((r) => r.paymentId === paymentId);
  if (!receipt) {
    receipt = generateReceipt(paymentId);
  }

  const player = players.find((p) => p.id === payment.playerId);
  const parent = parents.find((p) => p.id === payment.parentId);
  const team = teams.find((t) => t.id === player?.teamId);
  const fin = player ? getPlayerFinancials(player.id) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Non-printable) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">
              REÇU OFFICIEL DE COTISATION · {settings.shortName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt-area" className="p-8 sm:p-10 bg-white text-slate-900">
          {/* Header with Association Details & Crest */}
          <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-emerald-700/30 overflow-hidden bg-slate-50 flex items-center justify-center p-1 shrink-0">
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-emerald-950 uppercase tracking-tight">
                  {settings.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {settings.address}, {settings.city}
                </p>
                <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-4">
                  <span>Tél : {settings.phone}</span>
                  <span>Email : {settings.email}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  ICE : {settings.ice} {settings.patente && `· Patente : ${settings.patente}`}
                </div>
              </div>
            </div>

            {/* Receipt Number Badge */}
            <div className="text-right shrink-0">
              <div className="inline-block px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-bold text-xs">
                #{receipt.receiptNumber}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Date : <strong>{formatDate(payment.date)}</strong>
              </p>
              <p className="text-[10px] text-slate-400">
                Paiement N° : {payment.paymentNumber}
              </p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center my-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="text-sm font-extrabold tracking-wider text-slate-800 uppercase">
              REÇU DE RÈGLEMENT DE COTISATION
            </h2>
            <p className="text-[11px] text-slate-500">
              Document officiel valant quittance de paiement
            </p>
          </div>

          {/* Grid of Beneficiary & Player */}
          <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                REÇU DE (PARENT / TUTEUR)
              </span>
              <p className="text-sm font-bold text-slate-900">
                {parent ? `${parent.firstName} ${parent.lastName}` : 'Client'}
              </p>
              <p className="text-slate-600 mt-0.5">Qualité : {parent?.relation || 'Parent'}</p>
              <p className="text-slate-500">{parent?.phone}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                POUR LE COMPTE DU JOUEUR
              </span>
              <p className="text-sm font-bold text-slate-900">
                {player ? `${player.firstName} ${player.lastName}` : 'Joueur'}
              </p>
              <p className="text-emerald-800 font-semibold mt-0.5">
                Équipe : {team?.name || 'Académie'} ({team?.category})
              </p>
              <p className="text-slate-500">
                Date de naissance : {formatDate(player?.birthDate)}
              </p>
            </div>
          </div>

          {/* Transaction Table */}
          <table className="w-full text-xs my-6 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 text-[11px]">
                <th className="py-2 text-left font-semibold">DÉSIGNATION / PÉRIODE</th>
                <th className="py-2 text-center font-semibold">MODE DE RÈGLEMENT</th>
                <th className="py-2 text-center font-semibold">RÉFÉRENCE</th>
                <th className="py-2 text-right font-semibold">MONTANT ENCAISSÉ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 font-medium text-slate-900">
                  Cotisation Football - {payment.period}
                  {payment.notes && (
                    <div className="text-[10px] text-slate-500 italic mt-0.5">
                      Note : {payment.notes}
                    </div>
                  )}
                </td>
                <td className="py-3 text-center text-slate-700 font-medium">
                  {payment.method}
                </td>
                <td className="py-3 text-center text-slate-600 font-mono">
                  {payment.reference || '-'}
                </td>
                <td className="py-3 text-right font-bold text-emerald-800 text-sm font-mono">
                  {formatCurrency(payment.amount, settings.currency)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Account Balance Summary */}
          {fin && (
            <div className="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Montant total saison prévu :</span>{' '}
                <strong className="text-slate-900 font-mono">{formatCurrency(fin.expectedAmount, settings.currency)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Total réglé à ce jour :</span>{' '}
                <strong className="text-emerald-700 font-mono">{formatCurrency(fin.paidAmount, settings.currency)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Solde restant dû :</span>{' '}
                <strong className={`font-mono ${fin.remainingAmount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}`}>
                  {formatCurrency(fin.remainingAmount, settings.currency)}
                </strong>
              </div>
            </div>
          )}

          {/* Signatures & Stamp area */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-200 text-xs">
            <div>
              <p className="font-semibold text-slate-700">Signature du Parent / Tuteur :</p>
              <div className="h-20 mt-2 border border-dashed border-slate-300 rounded-lg flex items-end p-2 text-[10px] text-slate-400">
                Lu et approuvé
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-slate-700">
                Cachet & Signature de l'Association :
              </p>
              <div className="h-20 mt-2 border border-dashed border-emerald-300 bg-emerald-50/30 rounded-lg flex flex-col items-center justify-center p-2 text-[10px] text-emerald-800 relative">
                <div className="border border-emerald-600 rounded-full w-14 h-14 flex flex-col items-center justify-center text-[7px] text-center font-bold uppercase rotate-[-6deg]">
                  <span>{settings.shortName}</span>
                  <span className="text-[6px]">CASABLANCA</span>
                  <span>CACHET</span>
                </div>
                <span className="mt-1 font-mono text-[9px] text-slate-500">
                  Émis par : {receipt.generatedBy}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            <p>{settings.receiptFooterText}</p>
            <p className="mt-0.5">
              Reçu généré électroniquement via la plateforme {settings.shortName} · Casablanca, Maroc
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
