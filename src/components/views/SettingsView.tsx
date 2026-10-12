import React, { useState } from 'react';
import {
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateTime } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, teams, updateTeam, auditLogs, resetToSeedData } = useApp();
  const { t, language, formatMoney } = useLanguage();

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
          {t('settings.title', 'Paramètres du Club')}
        </h1>
        <p className="text-xs text-slate-500">
          {t('settings.subtitle', 'Configuration générale, tarifs par équipe et journal d’audit')}
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
          {t('settings.tabGeneral', 'Association')}
        </button>
        <button
          onClick={() => setActiveTab('saison')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'saison'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('settings.tabSeason', 'Saison')}
        </button>
        <button
          onClick={() => setActiveTab('tarifs')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tarifs'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('settings.tabFees', 'Tarifs par équipe')}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('settings.tabAudit', 'Historique & Audit')}
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
              <span className="text-slate-400 text-xs">
                {language === 'ar' ? 'الشعار الرسمي للنادي' : "Logo officiel de l'académie"}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('settings.assocName', "Nom de l'association")}
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
                {t('common.address', 'Adresse')}
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
                {t('settings.city', 'Ville')}
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
                {t('common.phone', 'Téléphone')}
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
                {t('common.email', 'Email officiel')}
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
                if (confirm(
                  language === 'ar'
                    ? 'هل تريد بالتأكيد إعادة تعيين البيانات التجريبية؟'
                    : 'Réinitialiser les données de démo ?'
                )) resetToSeedData();
              }}
              className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إعادة ضبط البيانات' : 'Réinitialiser démo'}</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              {t('common.save', 'Enregistrer')}
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: SAISON */}
      {activeTab === 'saison' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4 max-w-lg text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('registrations.season', 'Saison en cours')}
            </label>
            <input
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 font-mono text-slate-900"
            />
          </div>
          <button
            onClick={() => alert(language === 'ar' ? 'تم حفظ الموسم الرياضي.' : 'Saison active enregistrée.')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
          >
            {t('common.save', 'Enregistrer')}
          </button>
        </div>
      )}

      {/* SECTION 3: TARIFS */}
      {activeTab === 'tarifs' && (
        <form onSubmit={handleSaveTarifs} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4 max-w-2xl text-xs">
          <div className="space-y-3">
            {teams.map((tItem) => (
              <div key={tItem.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="font-bold text-slate-900 block">{tItem.name}</span>
                  <span className="text-[11px] text-slate-500">{tItem.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={teamFees[tItem.id] ?? tItem.monthlyFee}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTeamFees({ ...teamFees, [tItem.id]: val });
                    }}
                    min="0"
                    step="50"
                    className="w-24 px-2 py-1 rounded border border-slate-300 text-right font-mono font-bold"
                  />
                  <span className="text-slate-600 font-mono">
                    {language === 'ar' ? 'د.م/شهر' : 'DH/mois'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              {t('common.save', 'Enregistrer')}
            </button>
          </div>
        </form>
      )}

      {/* SECTION 4: AUDIT */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">{t('common.date', 'DATE & HEURE')}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'المستخدم' : 'UTILISATEUR'}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'الإجراء' : 'ACTION'}</th>
                  <th className="py-2.5 px-4">{language === 'ar' ? 'التفاصيل' : 'DESCRIPTION'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      {language === 'ar' ? 'سجل العمليات فارغ.' : 'Aucun journal d\'audit.'}
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 20).map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{formatDateTime(log.timestamp)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{log.userName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{log.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
