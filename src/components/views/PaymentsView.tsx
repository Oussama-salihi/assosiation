import React, { useState } from 'react';
import {
  Wallet,
  Search,
  Plus,
  ReceiptText,
  Filter,
  Download,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, PaymentStatus } from '../../types';
import { formatCurrency, formatDate, exportToExcelCsv } from '../../utils/formatters';

interface PaymentsViewProps {
  onOpenNewPayment: () => void;
  onOpenReceipt: (paymentId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenNewPayment,
  onOpenReceipt,
}) => {
  const { payments, players, parents, teams, settings } = useApp();

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

  const handleExportCsv = () => {
    const headers = [
      'N° Paiement',
      'Date',
      'Joueur',
      'Parent / Tuteur',
      'Période',
      'Mode de règlement',
      'Référence',
      'Montant (DH)',
      'Statut',
      'Enregistré par',
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

    exportToExcelCsv(`Paiements_Club_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Registre des Paiements & Encaissements ({payments.length})
          </h2>
          <p className="text-xs text-slate-500">
            Grand livre des cotisations perçues · Transactions immuables et auditées
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exporter Excel</span>
          </button>
          <button
            onClick={onOpenNewPayment}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer un paiement</span>
          </button>
        </div>
      </div>

      {/* Filter and summary bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par joueur, parent, reçu, réf..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none"
            />
          </div>

          <div>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 bg-white"
            >
              <option value="ALL">Tous les modes de règlement</option>
              <option value="Espèces">Espèces</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Chèque">Chèque</option>
              <option value="Carte bancaire">Carte bancaire (TPE)</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
            <span className="text-[11px] font-semibold">Total sélection :</span>
            <span className="font-mono font-bold text-sm ml-2">
              {formatCurrency(totalFilteredAmount, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">N° TRANSACTION</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3">JOUEUR & ÉQUIPE</th>
                <th className="py-3 px-3">PARENT / PAYEUR</th>
                <th className="py-3 px-3">PÉRIODE CONCERNÉE</th>
                <th className="py-3 px-3">MODE DE RÈGLEMENT</th>
                <th className="py-3 px-3 text-right">MONTANT</th>
                <th className="py-3 px-3 text-center">STATUT</th>
                <th className="py-3 px-4 text-center">REÇU OFFICIEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Aucun paiement trouvé pour ces critères.
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
                        <div className="text-[10px] text-slate-400">
                          {parent?.phone}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {payment.period}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{payment.method}</div>
                        {payment.reference && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {payment.reference}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 text-sm tabular-nums">
                        {formatCurrency(payment.amount, settings.currency)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenReceipt(payment.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 mx-auto transition-colors"
                        >
                          <ReceiptText className="w-3.5 h-3.5" />
                          <span>Voir reçu</span>
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
