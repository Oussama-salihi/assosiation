import React from 'react';
import {
  Users,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Bell,
  FileText,
  MessageSquare,
  MapPin,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Player, Team, TrainingSession, Payment, Announcement } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ParentDashboardViewProps {
  parentId: string;
  parentName: string;
  linkedPlayers: Player[];
  selectedChildId: string | 'all';
  onSelectChild: (id: string | 'all') => void;
  onNavigateTab: (tab: 'dashboard' | 'children' | 'schedule' | 'payments' | 'announcements' | 'contact') => void;
  onOpenAbsenceModal: (childId?: string, sessionDate?: string) => void;
  onOpenReceiptModal: (paymentId: string) => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  parentId,
  parentName,
  linkedPlayers,
  selectedChildId,
  onSelectChild,
  onNavigateTab,
  onOpenAbsenceModal,
  onOpenReceiptModal,
}) => {
  const {
    teams,
    sessions,
    getParentPayments,
    getPlayerFinancials,
    getPlayerAttendanceStats,
    getParentAnnouncements,
  } = useApp();

  const { t, language, formatMoney, isRTL } = useLanguage();

  // Filter players based on selection
  const displayedPlayers = selectedChildId === 'all'
    ? linkedPlayers
    : linkedPlayers.filter((p) => p.id === selectedChildId);

  // Financial aggregation for displayed children
  const financialTotals = displayedPlayers.reduce(
    (acc, player) => {
      const fin = getPlayerFinancials(player.id);
      acc.expected += fin.expectedAmount;
      acc.paid += fin.paidAmount;
      acc.remaining += fin.remainingAmount;
      return acc;
    },
    { expected: 0, paid: 0, remaining: 0 }
  );

  // Find upcoming sessions for linked children teams
  const displayedTeamIds = new Set(displayedPlayers.map((p) => p.teamId));
  const todayStr = new Date().toISOString().split('T')[0];

  const relevantSessions = sessions
    .filter((s) => displayedTeamIds.has(s.teamId))
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextUpcomingSession = relevantSessions.find((s) => s.date >= todayStr) || relevantSessions[0];
  const nextSessionTeam = nextUpcomingSession ? teams.find((t) => t.id === nextUpcomingSession.teamId) : null;

  // Payments for displayed children
  const displayedPlayerIds = new Set(displayedPlayers.map((p) => p.id));
  const allParentPayments = getParentPayments(parentId);
  const relevantPayments = allParentPayments
    .filter((p) => displayedPlayerIds.has(p.playerId))
    .slice(0, 3);

  // Attendance stats aggregation
  const attendanceAgg = displayedPlayers.reduce(
    (acc, player) => {
      const stat = getPlayerAttendanceStats(player.id);
      acc.total += stat.totalSessions;
      acc.attended += stat.attended;
      return acc;
    },
    { total: 0, attended: 0 }
  );
  const globalAttendanceRate = attendanceAgg.total > 0
    ? Math.round((attendanceAgg.attended / attendanceAgg.total) * 100)
    : 100;

  // Announcements
  const announcements = getParentAnnouncements(parentId).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('parentPortal.title', 'Espace Parents & Familles')} • Saison 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'ar' ? `مرحباً، ${parentName}` : `Bonjour, ${parentName}`}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              {language === 'ar'
                ? `متابعة شاملة لأنشطة أبنائك (${linkedPlayers.length} مسجلين)، التداريب، الغيابات والاشتراكات.`
                : `Suivez en temps réel l'activité sportive de vos enfants (${linkedPlayers.length} inscrit(s)), séances, présences et reçus.`}
            </p>
          </div>

          {/* Quick Action Button in Banner */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAbsenceModal(displayedPlayers[0]?.id)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('parentPortal.notifyAbsence', 'Signaler une absence')}</span>
            </button>
            <button
              onClick={() => onNavigateTab('contact')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('parentPortal.contact', 'Contacter le club')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Child Selector Switcher (if multiple children) */}
      {linkedPlayers.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectChild('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedChildId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('parentPortal.allChildren', 'Tous mes enfants')} ({linkedPlayers.length})</span>
          </button>
          {linkedPlayers.map((player) => {
            const isSelected = selectedChildId === player.id;
            const team = teams.find((t) => t.id === player.teamId);
            return (
              <button
                key={player.id}
                onClick={() => onSelectChild(player.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {player.jerseyNumber || player.firstName[0]}
                </div>
                <span>{player.firstName} {player.lastName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {team?.category || 'Club'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Linked Children */}
        <div
          onClick={() => onNavigateTab('children')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'الأبناء المسجلون' : 'Enfants inscrits'}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{displayedPlayers.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>{language === 'ar' ? 'عرض بطاقات الأبناء ←' : 'Voir les fiches →'}</span>
          </p>
        </div>

        {/* Metric 2: Attendance Rate */}
        <div
          onClick={() => onNavigateTab('schedule')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'نسبة المواظبة' : 'Taux d’assiduité'}
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{globalAttendanceRate}%</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {attendanceAgg.attended} / {attendanceAgg.total} {language === 'ar' ? 'حصص مؤكدة' : 'séances suivies'}
          </p>
        </div>

        {/* Metric 3: Fees Remaining */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'الرصيد المتبقي' : 'Solde restant'}
            </span>
            <div className={`p-2 rounded-xl group-hover:scale-105 transition-transform ${
              financialTotals.remaining > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {formatMoney(financialTotals.remaining)}
          </p>
          <div className="mt-1">
            {financialTotals.remaining === 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'الاشتراك مسوى بالكامل' : 'Cotisations à jour'}</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-700">
                {language === 'ar' ? 'مستحق للأداء' : 'Paiement en attente'}
              </span>
            )}
          </div>
        </div>

        {/* Metric 4: Next Session countdown */}
        <div
          onClick={() => onNavigateTab('schedule')}
          className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'الحصة التدريبية' : 'Prochaine séance'}
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 truncate">
            {nextUpcomingSession ? formatDate(nextUpcomingSession.date) : '-'}
          </p>
          <p className="text-[11px] text-slate-500 truncate mt-1">
            {nextUpcomingSession ? nextUpcomingSession.time : language === 'ar' ? 'لا توجد حصص مبرمجة' : 'Aucune séance programmée'}
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Next Session + Quick Children Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Prochaine séance en détail */}
          {nextUpcomingSession && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {language === 'ar' ? 'الحصة التدريبية المبرمجة القادمة' : 'Prochaine séance d’entraînement'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  {nextSessionTeam?.category || 'Club'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 mb-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    {language === 'ar' ? 'التاريخ والتوقيت' : 'Date & Horaire'}
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{formatDate(nextUpcomingSession.date)} • {nextUpcomingSession.time}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    {language === 'ar' ? 'الملعب والموقع' : 'Terrain / Lieu'}
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{nextUpcomingSession.location}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    {language === 'ar' ? 'المدرب المسؤول' : 'Entraîneur'}
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{nextUpcomingSession.coachName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-slate-500">
                  {language === 'ar'
                    ? 'هل سيتغيب ابنك عن هذه الحصة لأسباب دراسية أو صحية؟'
                    : 'Votre enfant a un empêchement pour cette séance ?'}
                </span>
                <button
                  onClick={() => onOpenAbsenceModal(displayedPlayers[0]?.id, nextUpcomingSession.date)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إشعار بالغياب' : 'Signaler une absence'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Card: Mes enfants inscrits */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {t('parentPortal.myChildren', 'Mes enfants')} ({displayedPlayers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar' ? 'الفئات، الفرق وأرقام القمصان' : 'Catégories, équipes et statut de licence'}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('children')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'عرض الكل' : 'Voir tout'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedPlayers.map((player) => {
                const team = teams.find((t) => t.id === player.teamId);
                const stats = getPlayerAttendanceStats(player.id);
                return (
                  <div
                    key={player.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {player.jerseyNumber || player.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-slate-900 truncate">
                          {player.firstName} {player.lastName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                          {team?.category || 'Club'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {team?.name || 'Équipe assignée'}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-600">
                        <span>{language === 'ar' ? 'المواظبة' : 'Assiduité'} : <strong>{stats.percentage}%</strong></span>
                        <span className="text-emerald-700 font-semibold cursor-pointer" onClick={() => onNavigateTab('children')}>
                          {language === 'ar' ? 'التفاصيل ←' : 'Détails →'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Announcements + Recent Payments (1 col) */}
        <div className="space-y-6">
          {/* Card: Dernières annonces */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {t('parentPortal.announcements', 'Annonces du club')}
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('announcements')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {language === 'ar' ? 'جميع الإعلانات' : 'Toutes'}
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => {
                const title = language === 'ar' && ann.titleAr ? ann.titleAr : ann.title;
                const content = language === 'ar' && ann.contentAr ? ann.contentAr : ann.content;
                return (
                  <div
                    key={ann.id}
                    className={`p-3.5 rounded-xl border text-xs transition-colors ${
                      ann.important
                        ? 'bg-amber-50/60 border-amber-200 text-slate-900'
                        : 'bg-slate-50/60 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ann.type === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : ann.type === 'EQUIPE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ann.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(ann.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 mt-1 mb-1 line-clamp-1">{title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{content}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Derniers paiements & Reçus officiels */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {language === 'ar' ? 'آخر المدفوعات والإيصالات' : 'Derniers paiements'}
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('payments')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {language === 'ar' ? 'سجل الأداء' : 'Historique'}
              </button>
            </div>

            {relevantPayments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                {language === 'ar' ? 'لا توجد دفعات مسجلة مؤخراً.' : 'Aucun paiement récent enregistré.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {relevantPayments.map((pay) => {
                  const player = displayedPlayers.find((p) => p.id === pay.playerId);
                  return (
                    <div key={pay.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-900 block truncate">
                          {player ? `${player.firstName} ${player.lastName}` : 'Enfant'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {formatDate(pay.date)} • {pay.method}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-emerald-700 block">
                          {formatMoney(pay.amount)}
                        </span>
                        <button
                          onClick={() => onOpenReceiptModal(pay.id)}
                          className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                        >
                          {language === 'ar' ? 'معاينة الإيصال' : 'Voir reçu'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
