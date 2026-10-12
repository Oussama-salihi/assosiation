import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Wallet,
  Clock,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Player } from '../../types';
import { calculateAge, formatDate } from '../../utils/formatters';

interface PlayersViewProps {
  onOpenNewPlayer: () => void;
  onEditPlayer: (player: Player) => void;
  onOpenPaymentForPlayer: (playerId: string) => void;
  onOpenReceipt: (paymentId: string) => void;
  preselectedPlayerId?: string;
}

export const PlayersView: React.FC<PlayersViewProps> = ({
  onOpenNewPlayer,
  onEditPlayer,
  onOpenPaymentForPlayer,
  onOpenReceipt,
  preselectedPlayerId,
}) => {
  const {
    players,
    parents,
    teams,
    payments,
    settings,
    getPlayerFinancials,
    getPlayerAttendanceStats,
    deletePlayer,
    currentUser,
  } = useApp();

  const { t, language, formatMoney, isRTL } = useLanguage();

  const isCoach = currentUser.role === 'ENTRAINEUR';
  const canDelete = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState<Player | null>(() => {
    if (preselectedPlayerId) {
      const pl = players.find((p) => p.id === preselectedPlayerId);
      if (pl && isCoach && pl.teamId !== currentUser.assignedTeamId) {
        return null;
      }
      return pl || null;
    }
    return null;
  });

  // 3 tabs inside player sheet modal
  const [activePlayerTab, setActivePlayerTab] = useState<'info' | 'payments' | 'attendance'>('info');

  const PAGE_SIZE = 10;

  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => !p.isDeleted)
      .filter((p) => {
        if (isCoach && p.teamId !== currentUser.assignedTeamId) {
          return false;
        }
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase());
        const matchesTeam = filterTeam === 'ALL' || p.teamId === filterTeam;
        const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesTeam && matchesStatus;
      });
  }, [players, search, filterTeam, filterStatus, isCoach, currentUser.assignedTeamId]);

  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE) || 1;
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Actif':
        return t('common.active', 'Actif');
      case 'Inactif':
        return t('common.inactive', 'Inactif');
      case 'Suspendu':
        return t('common.suspended', 'Suspendu');
      case 'Ancien':
        return t('common.former', 'Ancien');
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('players.title', 'Joueurs')} ({filteredPlayers.length})
          </h1>
          <p className="text-xs text-slate-500">
            {t('players.subtitle', 'Effectif du club et fiches individuelles')}
          </p>
        </div>

        <button
          onClick={onOpenNewPlayer}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('players.newPlayer', 'Ajouter un joueur')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={language === 'ar' ? 'البحث بالاسم...' : 'Rechercher par nom...'}
            className={`w-full ${
              isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'
            } py-1.5 rounded-lg border border-slate-200 focus:border-emerald-600 text-slate-900 outline-none text-xs`}
          />
        </div>

        <select
          value={filterTeam}
          onChange={(e) => {
            setFilterTeam(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs cursor-pointer"
        >
          <option value="ALL">{t('players.filterTeam', 'Toutes les équipes')}</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.category})
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs cursor-pointer"
        >
          <option value="ALL">{t('players.filterStatus', 'Tous les statuts')}</option>
          <option value="Actif">{t('common.active', 'Actif')}</option>
          <option value="Inactif">{t('common.inactive', 'Inactif')}</option>
          <option value="Suspendu">{t('common.suspended', 'Suspendu')}</option>
          <option value="Ancien">{t('common.former', 'Ancien')}</option>
        </select>
      </div>

      {/* Simplified Table: Joueur, Âge, Équipe, Parent, Statut, Solde, Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="py-3 px-4">{t('players.colName', 'JOUEUR')}</th>
                <th className="py-3 px-3">{language === 'ar' ? 'العمر' : 'ÂGE'}</th>
                <th className="py-3 px-3">{t('players.colTeam', 'ÉQUIPE')}</th>
                <th className="py-3 px-3">{t('players.colParent', 'PARENT')}</th>
                <th className="py-3 px-3 text-center">{t('common.status', 'STATUT')}</th>
                <th className="py-3 px-3 text-end">{language === 'ar' ? 'المستحقات' : 'SOLDE'}</th>
                <th className="py-3 px-4 text-center">{t('common.actions', 'ACTIONS')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    {language === 'ar' ? 'لم يتم العثور على لاعبين.' : 'Aucun joueur trouvé.'}
                  </td>
                </tr>
              ) : (
                paginatedPlayers.map((player) => {
                  const parent = parents.find((p) => p.id === player.parentId);
                  const team = teams.find((t) => t.id === player.teamId);
                  const fin = getPlayerFinancials(player.id);
                  const age = calculateAge(player.birthDate);

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Joueur */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {player.firstName[0]}
                          </div>
                          <span className="font-bold text-slate-900">
                            {player.firstName} {player.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Âge */}
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {age} {language === 'ar' ? 'سنة' : 'ans'}
                      </td>

                      {/* Équipe */}
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {team?.name || '-'} ({team?.category})
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-3 text-slate-600">
                        {parent ? `${parent.firstName} ${parent.lastName}` : '-'}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            player.status === 'Actif'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {getStatusLabel(player.status)}
                        </span>
                      </td>

                      {/* Solde */}
                      <td className="py-3 px-3 text-end font-mono font-bold">
                        <span className={fin.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                          {formatMoney(fin.remainingAmount)}
                        </span>
                      </td>

                      {/* Actions : Voir, Modifier, Supprimer */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedPlayerDetail(player);
                              setActivePlayerTab('info');
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title={t('common.viewProfile', 'Voir')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPlayer(player)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title={t('common.edit', 'Modifier')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (confirm(
                                  language === 'ar'
                                    ? `هل تريد بالتأكيد حذف اللاعب ${player.firstName} ${player.lastName}؟`
                                    : `Supprimer le joueur ${player.firstName} ${player.lastName} ?`
                                )) {
                                  deletePlayer(player.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title={t('common.delete', 'Supprimer')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {language === 'ar'
                ? `صفحة ${currentPage} من ${totalPages}`
                : `Page ${currentPage} sur ${totalPages}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FICHE JOUEUR AVEC 3 ONGLETS : Informations, Paiements, Présences */}
      {selectedPlayerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 font-bold flex items-center justify-center text-sm text-white">
                  {selectedPlayerDetail.firstName[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {selectedPlayerDetail.firstName} {selectedPlayerDetail.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('players.detailsTitle', 'Fiche joueur')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlayerDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold">
              <button
                onClick={() => setActivePlayerTab('info')}
                className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                  activePlayerTab === 'info'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'المعلومات' : 'Informations'}
              </button>
              <button
                onClick={() => setActivePlayerTab('payments')}
                className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                  activePlayerTab === 'payments'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('payments.title', 'Paiements')}
              </button>
              <button
                onClick={() => setActivePlayerTab('attendance')}
                className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                  activePlayerTab === 'attendance'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('attendance.title', 'Présences')}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* TAB 1: INFORMATIONS */}
              {activePlayerTab === 'info' && (() => {
                const parent = parents.find((p) => p.id === selectedPlayerDetail.parentId);
                const team = teams.find((t) => t.id === selectedPlayerDetail.teamId);
                const age = calculateAge(selectedPlayerDetail.birthDate);

                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        {language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedPlayerDetail.firstName} {selectedPlayerDetail.lastName}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        {language === 'ar' ? 'العمر وتاريخ الازدياد' : 'Âge & Date de naissance'}
                      </span>
                      <p className="font-semibold text-slate-900">
                        {age} {language === 'ar' ? 'سنة' : 'ans'} ({formatDate(selectedPlayerDetail.birthDate)})
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        {t('common.team', 'Équipe')}
                      </span>
                      <p className="font-semibold text-slate-900">
                        {team?.name || '-'} ({team?.category})
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        {t('common.status', 'Statut')}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {getStatusLabel(selectedPlayerDetail.status)}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        {t('common.parent', 'Parent / Tuteur')}
                      </span>
                      <p className="font-semibold text-slate-900">
                        {parent ? `${parent.firstName} ${parent.lastName} (${parent.relation})` : (language === 'ar' ? 'غير محدد' : 'Non renseigné')}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        {t('common.phone', 'Téléphone')}
                      </span>
                      <p className="font-mono font-medium text-slate-900">
                        {parent?.phone || selectedPlayerDetail.phone || (language === 'ar' ? 'غير محدد' : 'Non renseigné')}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 2: PAIEMENTS */}
              {activePlayerTab === 'payments' && (() => {
                const fin = getPlayerFinancials(selectedPlayerDetail.id);
                const playerPayments = payments.filter((p) => p.playerId === selectedPlayerDetail.id);

                return (
                  <div className="space-y-4">
                    {/* Summary row */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {t('players.expectedAmount', 'Total prévu')}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatMoney(fin.expectedAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {t('players.paidAmount', 'Total payé')}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {formatMoney(fin.paidAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {t('players.remainingAmount', 'Reste à payer')}
                        </span>
                        <span className={`font-mono font-bold text-sm ${fin.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {formatMoney(fin.remainingAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const id = selectedPlayerDetail.id;
                          setSelectedPlayerDetail(null);
                          onOpenPaymentForPlayer(id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer"
                      >
                        + {t('dashboard.recordPayment', 'Enregistrer un paiement')}
                      </button>
                    </div>

                    {/* Payment History Table */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
                        {language === 'ar' ? 'سجل المدفوعات' : 'Historique des règlements'}
                      </span>
                      {playerPayments.length === 0 ? (
                        <p className="text-slate-400 py-3 italic">
                          {language === 'ar' ? 'لا توجد مدفوعات مسجلة.' : 'Aucun paiement enregistré.'}
                        </p>
                      ) : (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs text-start">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                              <tr>
                                <th className="py-2 px-3">{t('common.date', 'DATE')}</th>
                                <th className="py-2 px-3">{t('payments.colPeriod', 'PÉRIODE')}</th>
                                <th className="py-2 px-3">{t('payments.colMethod', 'MODE')}</th>
                                <th className="py-2 px-3 text-end">{t('common.amount', 'MONTANT')}</th>
                                <th className="py-2 px-3 text-center">{t('receipts.title', 'REÇU')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {playerPayments.map((p) => (
                                <tr key={p.id}>
                                  <td className="py-2 px-3 font-mono">{formatDate(p.date)}</td>
                                  <td className="py-2 px-3 text-slate-700">{p.period}</td>
                                  <td className="py-2 px-3 text-slate-600">{p.method}</td>
                                  <td className="py-2 px-3 text-end font-mono font-bold text-emerald-700">
                                    {formatMoney(p.amount)}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      onClick={() => onOpenReceipt(p.id)}
                                      className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                                    >
                                      {language === 'ar' ? 'الإيصال' : 'Reçu'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: PRÉSENCES */}
              {activePlayerTab === 'attendance' && (() => {
                const stats = getPlayerAttendanceStats(selectedPlayerDetail.id);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {language === 'ar' ? 'النسبة' : 'Taux'}
                        </span>
                        <span className={`text-xl font-bold font-mono ${stats.percentage >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {stats.percentage} %
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {t('common.present', 'Présences')}
                        </span>
                        <span className="text-xl font-bold font-mono text-emerald-700">
                          {stats.attended}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {t('common.absent', 'Absences')}
                        </span>
                        <span className="text-xl font-bold font-mono text-rose-600">
                          {stats.absent}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {t('common.excused', 'Excusés')}
                        </span>
                        <span className="text-xl font-bold font-mono text-amber-600">
                          {stats.excused}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs">
                      {language === 'ar'
                        ? `بناءً على ${stats.totalSessions} حصة مبرمجة ومسجلة لهذا الفريق.`
                        : `Basé sur ${stats.totalSessions} séances programmées et pointées pour cette équipe.`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
