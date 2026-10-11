import React, { useState } from 'react';
import {
  ReceiptText,
  Search,
  Printer,
  Calendar,
  Wallet,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ReceiptsViewProps {
  onOpenReceiptModal: (paymentId: string) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  onOpenReceiptModal,
}) => {
  const { receipts, payments, players, parents, teams, settings } = useApp();

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
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-600" />
            <span>Reçus Officiels de Paiement ({receipts.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Quittances officielles numérotées, conformes aux exigences administratives de l'association
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative max-w-md text-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par N° de reçu, joueur ou parent..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">N° REÇU OFFICIEL</th>
                <th className="py-3 px-3">DATE D'ÉMISSION</th>
                <th className="py-3 px-3">PAYEUR (PARENT)</th>
                <th className="py-3 px-3">BÉNÉFICIAIRE (JOUEUR)</th>
                <th className="py-3 px-3">PÉRIODE CONCERNÉE</th>
                <th className="py-3 px-3">MODE DE RÈGLEMENT</th>
                <th className="py-3 px-3 text-right">MONTANT ENCAISSÉ</th>
                <th className="py-3 px-3">ÉMIS PAR</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Aucun reçu officiel trouvé.
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
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-sm tabular-nums">
                        {pay ? formatCurrency(pay.amount, settings.currency) : '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {rec.generatedBy}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenReceiptModal(rec.paymentId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer / PDF</span>
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
