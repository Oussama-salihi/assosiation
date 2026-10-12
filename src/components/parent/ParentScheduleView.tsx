import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  HelpCircle,
  Filter,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Player, Team, TrainingSession, AttendanceRecord } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ParentScheduleViewProps {
  parentId: string;
  linkedPlayers: Player[];
  selectedChildId: string | 'all';
  onSelectChild: (id: string | 'all') => void;
  onOpenAbsenceModal: (childId?: string, sessionDate?: string) => void;
}

export const ParentScheduleView: React.FC<ParentScheduleViewProps> = ({
  parentId,
  linkedPlayers,
  selectedChildId,
  onSelectChild,
  onOpenAbsenceModal,
}) => {
  const {
    teams,
    sessions,
    attendances,
    getParentAbsenceNotifications,
  } = useApp();

  const { t, language, isRTL } = useLanguage();

  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  const displayedPlayers = selectedChildId === 'all'
    ? linkedPlayers
    : linkedPlayers.filter((p) => p.id === selectedChildId);

  const displayedTeamIds = new Set(displayedPlayers.map((p) => p.teamId));
  const todayStr = new Date().toISOString().split('T')[0];

  // Sessions for relevant teams
  const relevantSessions = sessions
    .filter((s) => displayedTeamIds.has(s.teamId))
    .filter((s) => {
      if (filterMode === 'upcoming') return s.date >= todayStr;
      if (filterMode === 'completed') return s.date < todayStr || s.completed;
      return true;
    })
    .sort((a, b) => (filterMode === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

  // Absence notifications submitted by this parent
  const myAbsenceNotifs = getParentAbsenceNotifications(parentId);

  // Helper to get child's attendance in a session
  const getAttendanceForPlayer = (sessionId: string, playerId: string): AttendanceRecord | undefined => {
    return attendances.find((a) => a.sessionId === sessionId && a.playerId === playerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('parentPortal.schedule', 'Planning & Présences')}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {relevantSessions.length} {language === 'ar' ? 'حصص' : 'séances'}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'متابعة مواعيد التداريب، حضور الأبناء وإشعار الإدارة بالغيابات المسبقة'
              : 'Calendrier des séances d’entraînement et suivi d’assiduité officiel'}
          </p>
        </div>

        <button
          onClick={() => onOpenAbsenceModal(displayedPlayers[0]?.id)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('parentPortal.notifyAbsence', 'Signaler une absence')}</span>
        </button>
      </div>

      {/* Child Switcher & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Child Selector */}
        {linkedPlayers.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => onSelectChild('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                selectedChildId === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('parentPortal.allChildren', 'Tous')} ({linkedPlayers.length})
            </button>
            {linkedPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => onSelectChild(player.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                  selectedChildId === player.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {player.firstName}
              </button>
            ))}
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setFilterMode('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              filterMode === 'upcoming' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'الحصص القادمة' : 'À venir'}
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              filterMode === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'الحصص السابقة' : 'Passées'}
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'Toutes'}
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {relevantSessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">
            {language === 'ar' ? 'لا توجد حصص في هذه الفترة' : 'Aucune séance dans cette vue'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'تأكد من اختيار التصفية المناسبة أو مراجعة جدول التداريب الأسبوعي.'
              : 'Consultez les autres filtres pour visualiser les séances programmées.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relevantSessions.map((session) => {
            const team = teams.find((t) => t.id === session.teamId);
            const isFuture = session.date >= todayStr;

            // Find matching players in this session's team
            const playersInThisTeam = displayedPlayers.filter((p) => p.teamId === session.teamId);

            return (
              <div
                key={session.id}
                className={`p-4 sm:p-5 bg-white rounded-2xl border transition-all ${
                  isFuture ? 'border-slate-200/90 shadow-2xs' : 'border-slate-200/60 bg-slate-50/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Session Date & Meta */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl shrink-0 text-center min-w-[65px] ${
                      isFuture ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className="text-[10px] font-bold uppercase block tracking-wider">
                        {new Date(session.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-black block leading-none my-1">
                        {session.date.split('-')[2]}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 block">
                        {new Date(session.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', { month: 'short' })}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-slate-900">
                          {team?.name || 'Séance'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {team?.category}
                        </span>
                        {isFuture && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {language === 'ar' ? 'مقبلة' : 'À venir'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{session.time}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.coachName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance status for each child */}
                  <div className="flex flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {playersInThisTeam.map((child) => {
                      const att = getAttendanceForPlayer(session.id, child.id);
                      return (
                        <div key={child.id} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-medium">{child.firstName} :</span>
                          {att ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              att.status === 'Présent'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'Excusé'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {att.status === 'Présent' && <CheckCircle2 className="w-3 h-3" />}
                              {att.status === 'Excusé' && <HelpCircle className="w-3 h-3" />}
                              {att.status === 'Absent' && <XCircle className="w-3 h-3" />}
                              <span>{att.status}</span>
                            </span>
                          ) : isFuture ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                              <Clock className="w-3 h-3" />
                              <span>{language === 'ar' ? 'مقررة' : 'Programmée'}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {language === 'ar' ? 'غير مسجل' : 'Non pointé'}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Quick notify absence if future */}
                    {isFuture && (
                      <button
                        onClick={() => onOpenAbsenceModal(playersInThisTeam[0]?.id, session.date)}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{language === 'ar' ? 'إشعار بعدم الحضور' : 'Signaler absence'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submitted Absence Notifications Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t('parentPortal.pastAbsences', 'Historique de vos signalements d’absence')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {myAbsenceNotifs.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'متابعة وضعية إشعارات الغياب التي قمت بإرسالها إلى إدارة النادي'
                : 'Suivi des justificatifs et avis transmis aux éducateurs sportifs'}
            </p>
          </div>
        </div>

        {myAbsenceNotifs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            {language === 'ar' ? 'لم تقم بإرسال أي إشعار غياب مسبق.' : 'Aucun avis d’absence transmis.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {myAbsenceNotifs.map((notif) => {
              const child = linkedPlayers.find((p) => p.id === notif.playerId);
              return (
                <div key={notif.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900">
                        {child ? `${child.firstName} ${child.lastName}` : 'Enfant'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-700">
                        {formatDate(notif.sessionDate)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {notif.reason}
                      </span>
                    </div>
                    {notif.notes && (
                      <p className="text-[11px] text-slate-600 italic">
                        "{notif.notes}"
                      </p>
                    )}
                    {notif.responseNote && (
                      <p className="text-[11px] text-emerald-800 font-medium mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60 inline-block">
                        <strong>{notif.reviewedBy || 'Coach'} :</strong> {notif.responseNote}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      notif.status === 'Approuvé'
                        ? 'bg-emerald-100 text-emerald-800'
                        : notif.status === 'Vu'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{notif.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
