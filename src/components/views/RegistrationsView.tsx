import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Registration, RegistrationStatus, PlanFrequency } from '../../types';
import { formatDate } from '../../utils/formatters';

interface RegistrationsViewProps {
  onNavigateToPlayer: (playerId: string) => void;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  onNavigateToPlayer,
}) => {
  const { registrations, players, parents, teams, addRegistration } = useApp();
  const { t, language, formatMoney, isRTL } = useLanguage();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [playerId, setPlayerId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [planFrequency, setPlanFrequency] = useState<PlanFrequency>('Annuelle');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2027-06-30');
  const [totalAmount, setTotalAmount] = useState<number | ''>(2500);
  const [season, setSeason] = useState('2026-2027');
  const [notes, setNotes] = useState('');

  const filteredRegistrations = registrations.filter((reg) => {
    const player = players.find((p) => p.id === reg.playerId);
    const parent = parents.find((pr) => pr.id === reg.parentId);
    const q = search.toLowerCase();

    const matchesSearch =
      (player && `${player.firstName} ${player.lastName}`.toLowerCase().includes(q)) ||
      (parent && `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(q)) ||
      reg.id.toLowerCase().includes(q) ||
      reg.season.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || reg.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handlePlayerSelect = (pId: string) => {
    setPlayerId(pId);
    const p = players.find((plyr) => plyr.id === pId);
    if (p) {
      setTeamId(p.teamId);
      const team = teams.find((t) => t.id === p.teamId);
      const baseFee = team?.monthlyFee || 300;
      if (planFrequency === 'Annuelle') {
        setTotalAmount(Math.round(baseFee * 10 * 0.85)); // 15% remise
      } else if (planFrequency === 'Trimestrielle') {
        setTotalAmount(Math.round(baseFee * 3 * 0.95)); // 5% remise
      } else {
        setTotalAmount(baseFee);
      }
    }
  };

  const handleCreateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !totalAmount) return;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    addRegistration({
      playerId,
      parentId: player.parentId,
      teamId: teamId || player.teamId,
      registrationDate: new Date().toISOString().split('T')[0],
      startDate,
      endDate,
      planFrequency,
      totalAmount: Number(totalAmount),
      status: 'Active',
      season,
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
    setPlayerId('');
    setNotes('');
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'Annuelle':
        return t('registrations.annual', 'Annuelle');
      case 'Trimestrielle':
        return t('registrations.term', 'Trimestrielle');
      case 'Semestrielle':
        return t('registrations.semester', 'Semestrielle');
      case 'Mensuelle':
        return t('registrations.monthly', 'Mensuelle');
      default:
        return freq;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <span>{t('registrations.title', 'Inscriptions & Adhésions')} ({registrations.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('registrations.subtitle', 'Adhésions de la saison sportive')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('registrations.newRegistration', 'Nouvelle inscription')}</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ar' ? 'البحث بالاسم أو الموسم...' : 'Rechercher par nom de joueur, saison...'}
              className={`w-full ${
                isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'
              } py-1.5 rounded-lg border border-slate-200 focus:border-emerald-600 text-slate-900 outline-none text-xs`}
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs cursor-pointer"
            >
              <option value="ALL">{language === 'ar' ? 'جميع الحالات' : 'Tous les statuts'}</option>
              <option value="Active">{language === 'ar' ? 'نشطة' : 'Active'}</option>
              <option value="Expirée">{language === 'ar' ? 'منتهية' : 'Expirée'}</option>
              <option value="Annulée">{language === 'ar' ? 'ملغاة' : 'Annulée'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">{t('registrations.colPlayer', 'JOUEUR')}</th>
                <th className="py-3 px-3">{t('registrations.colTeam', 'ÉQUIPE')}</th>
                <th className="py-3 px-3">{t('registrations.season', 'SAISON')}</th>
                <th className="py-3 px-3">{t('registrations.formula', 'FORMULE')}</th>
                <th className="py-3 px-3">{t('registrations.colPeriod', 'PÉRIODE DE VALIDITÉ')}</th>
                <th className="py-3 px-3 text-end">{t('registrations.colTotal', 'MONTANT TOTAL PRÉVU')}</th>
                <th className="py-3 px-3 text-center">{t('common.status', 'STATUT')}</th>
                <th className="py-3 px-4 text-center">{t('common.actions', 'ACTION')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {language === 'ar' ? 'لم يتم العثور على أي تسجيل.' : 'Aucune adhésion trouvée.'}
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const player = players.find((p) => p.id === reg.playerId);
                  const team = teams.find((t) => t.id === reg.teamId);

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {player ? `${player.firstName} ${player.lastName}` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {language === 'ar' ? 'تاريخ التسجيل:' : 'Inscrit le'} {formatDate(reg.registrationDate)}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {team?.name || '-'} ({team?.category})
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {reg.season}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{getFrequencyLabel(reg.planFrequency)}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {formatDate(reg.startDate)} - {formatDate(reg.endDate)}
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-slate-900 tabular-nums">
                        {formatMoney(reg.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            reg.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.status === 'Expirée'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {player && (
                          <button
                            onClick={() => onNavigateToPlayer(player.id)}
                            className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                          >
                            {language === 'ar' ? 'الملف ←' : 'Fiche joueur →'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Registration */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {t('registrations.newRegistration', 'Nouvelle inscription')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRegistration} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('registrations.colPlayer', 'Joueur')} *
                </label>
                <select
                  value={playerId}
                  onChange={(e) => handlePlayerSelect(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
                >
                  <option value="">-- {language === 'ar' ? 'اختر اللاعب' : 'Sélectionner un joueur'} --</option>
                  {players
                    .filter((p) => !p.isDeleted)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('registrations.season', 'Saison')}
                  </label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('registrations.formula', 'Formule')}
                  </label>
                  <select
                    value={planFrequency}
                    onChange={(e) => {
                      const f = e.target.value as PlanFrequency;
                      setPlanFrequency(f);
                      if (playerId) handlePlayerSelect(playerId);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
                  >
                    <option value="Annuelle">{t('registrations.annual', 'Annuelle')}</option>
                    <option value="Trimestrielle">{t('registrations.term', 'Trimestrielle')}</option>
                    <option value="Semestrielle">{t('registrations.semester', 'Semestrielle')}</option>
                    <option value="Mensuelle">{t('registrations.monthly', 'Mensuelle')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('registrations.colTotal', 'Montant total prévu')} *
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : '')}
                  required
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  {t('common.save', 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
