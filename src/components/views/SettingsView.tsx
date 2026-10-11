import React, { useState } from 'react';
import {
  Settings,
  Building,
  Calendar,
  CreditCard,
  History,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, teams, updateTeam, auditLogs, resetToSeedData } = useApp();

  const [activeTab, setActiveTab] = useState<'association' | 'saison' | 'tarifs' | 'audit'>('association');

  // Association form state
  const [formData, setFormData] = useState({
    name: settings.name,
    logoUrl: settings.logoUrl,
    address: settings.address,
    city: settings.city,
    phone: settings.phone,
    email: settings.email,
  });

  // Season state
  const [season, setSeason] = useState('2026-2027');

  // Tarifs state
  const [teamFees, setTeamFees] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    teams.forEach((t) => {
      map[t.id] = t.monthlyFee;
    });
    return map;
  });

  const handleSaveAssociation = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleSaveTarifs = (e: React.FormEvent) => {
    e.preventDefault();
    teams.forEach((t) => {
      if (teamFees[t.id] !== undefined && teamFees[t.id] !== t.monthlyFee) {
        updateTeam(t.id, { monthlyFee: teamFees[t.id] });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Paramètres du Club
        </h1>
        <p className="text-xs text-slate-500">
          Configuration générale, tarifs par équipe et journal d'audit
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('association')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'association'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Association
        </button>
        <button
          onClick={() => setActiveTab('saison')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'saison'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Saison
        </button>
        <button
          onClick={() => setActiveTab('tarifs')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tarifs'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Tarifs par équipe
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Historique & Audit
        </button>
      </div>

      {/* SECTION 1: ASSOCIATION */}
      {activeTab === 'association' && (
        <form onSubmit={handleSaveAssociation} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4 max-w-2xl text-xs">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <img
                src={formData.logoUrl}
                alt={formData.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">{formData.name}</span>
              <span className="text-slate-400 text-xs">Logo officiel de l'académie</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nom de l'association
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email officiel
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Réinitialiser les données de démo ?')) resetToSeedData();
              }}
              className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser démo</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: SAISON */}
      {activeTab === 'saison' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 max-w-md space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Saison sportive en cours
            </label>
            <input
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 font-mono font-bold text-slate-900 text-sm"
            />
            <p className="text-slate-400 text-[11px] mt-1">
              Cette saison est appliquée par défaut à toutes les nouvelles adhésions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert('Saison sportive enregistrée')}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            Mettre à jour la saison
          </button>
        </div>
      )}

      {/* SECTION 3: TARIFS PAR ÉQUIPE */}
      {activeTab === 'tarifs' && (
        <form onSubmit={handleSaveTarifs} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4 max-w-xl text-xs">
          <p className="text-slate-500">
            Définissez la cotisation mensuelle de base pour chaque équipe ({settings.currency} / mois) :
          </p>

          <div className="divide-y divide-slate-100">
            {teams.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{t.name}</span>
                  <span className="text-[11px] text-slate-500">Catégorie {t.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={teamFees[t.id] ?? t.monthlyFee}
                    onChange={(e) => setTeamFees({ ...teamFees, [t.id]: Number(e.target.value) })}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-right outline-none text-slate-900"
                  />
                  <span className="font-semibold text-slate-500">{settings.currency}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Enregistrer les tarifs
            </button>
          </div>
        </form>
      )}

      {/* SECTION 4: AUDIT */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Journal des dernières actions ({auditLogs.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">DATE & HEURE</th>
                  <th className="py-2.5 px-3">UTILISATEUR</th>
                  <th className="py-2.5 px-3">RÔLE</th>
                  <th className="py-2.5 px-4">ACTION EFFECTUÉE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{formatDateTime(log.timestamp)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.userRole}</td>
                    <td className="py-2.5 px-4 text-slate-800">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
