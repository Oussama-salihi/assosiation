import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  User,
  Wallet,
  ReceiptText,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.description.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q);

    const matchesType = filterType === 'ALL' || log.targetType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <span>Journal d'Audit & Historique des Opérations ({auditLogs.length})</span>
        </h2>
        <p className="text-xs text-slate-500">
          Traçabilité sécurisée des encaissements, modifications et actions administratives sensibles
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une opération, un utilisateur..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 bg-white"
            >
              <option value="ALL">Toutes les catégories d'actions</option>
              <option value="PAIEMENT">Paiements & Encaissements</option>
              <option value="RECU">Reçus officiels</option>
              <option value="JOUEUR">Fiches joueurs</option>
              <option value="PARENT">Parents & Tuteurs</option>
              <option value="INSCRIPTION">Adhésions</option>
              <option value="PRESENCE">Feuilles de présence</option>
              <option value="PARAMETRES">Paramètres système</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">DATE & HEURE</th>
                <th className="py-3 px-3">UTILISATEUR</th>
                <th className="py-3 px-3">RÔLE</th>
                <th className="py-3 px-3">CIBLE</th>
                <th className="py-3 px-4">DESCRIPTION DE L'ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Aucune action enregistrée pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {log.targetType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {log.description}
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
