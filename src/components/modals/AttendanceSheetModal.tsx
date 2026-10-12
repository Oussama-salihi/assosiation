import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { TrainingSession, AttendanceStatus } from '../../types';
import { formatDate } from '../../utils/formatters';

interface AttendanceSheetModalProps {
  session: TrainingSession | null;
  onClose: () => void;
}

export const AttendanceSheetModal: React.FC<AttendanceSheetModalProps> = ({
  session,
  onClose,
}) => {
  const { teams, players, attendances, saveAttendance } = useApp();
  const { t, language } = useLanguage();

  const [records, setRecords] = useState<
    { playerId: string; status: AttendanceStatus; notes: string }[]
  >([]);

  useEffect(() => {
    if (session) {
      // Find all active players of this team
      const teamPlayers = players.filter(
        (p) => p.teamId === session.teamId && !p.isDeleted && p.status === 'Actif'
      );

      // Pre-fill with existing attendances if recorded, or default to 'Présent'
      const sessionAttendances = attendances.filter((a) => a.sessionId === session.id);

      const initial = teamPlayers.map((p) => {
        const found = sessionAttendances.find((a) => a.playerId === p.id);
        return {
          playerId: p.id,
          status: found ? found.status : ('Présent' as AttendanceStatus),
          notes: found?.notes || '',
        };
      });

      setRecords(initial);
    }
  }, [session, players, attendances]);

  if (!session) return null;

  const team = teams.find((t) => t.id === session.teamId);

  const setPlayerStatus = (playerId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.playerId === playerId ? { ...r, status } : r))
    );
  };

  const setPlayerNote = (playerId: string, notes: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.playerId === playerId ? { ...r, notes } : r))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = () => {
    saveAttendance(session.id, records);
    onClose();
  };

  const presentCount = records.filter((r) => r.status === 'Présent').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const excusedCount = records.filter((r) => r.status === 'Excusé').length;
  const presencePercent = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">
                {t('attendance.title', 'Feuille de Présence')} · {team?.name} ({team?.category})
              </h3>
              <p className="text-xs text-slate-400">
                {formatDate(session.date)} · {session.time} · {session.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attendance Summary Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-bold">
              {presentCount} {t('common.present', 'Présents')}
            </span>
            <span className="text-rose-600 font-bold">
              {absentCount} {t('common.absent', 'Absents')}
            </span>
            <span className="text-amber-600 font-bold">
              {excusedCount} {t('common.excused', 'Excusés')}
            </span>
            <span className="text-slate-400">/ {records.length} {language === 'ar' ? 'لاعبين' : 'joueurs'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">{language === 'ar' ? 'نسبة الحضور:' : 'Taux de présence :'}</span>
            <span
              className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                presencePercent >= 80
                  ? 'bg-emerald-100 text-emerald-800'
                  : presencePercent >= 60
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {presencePercent} %
            </span>
          </div>
        </div>

        {/* Quick Batch Select Buttons */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {language === 'ar' ? 'إجراءات جماعية:' : 'Actions groupées :'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('Présent')}
              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-medium transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'الجميع حاضر' : 'Tous Présents'}
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('Excusé')}
              className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-medium transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'الجميع معذور' : 'Tous Excusés'}
            </button>
          </div>
        </div>

        {/* Players List Table */}
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {records.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {language === 'ar' ? 'لا يوجد لاعبون نشطون في هذا الفريق.' : 'Aucun joueur actif dans cette équipe.'}
            </div>
          ) : (
            records.map((rec) => {
              const player = players.find((p) => p.id === rec.playerId);
              if (!player) return null;

              return (
                <div
                  key={rec.playerId}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {player.jerseyNumber ? `#${player.jerseyNumber}` : player.firstName[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {player.position || (language === 'ar' ? 'لاعب' : 'Joueur')}
                      </div>
                    </div>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(rec.playerId, 'Présent')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          rec.status === 'Présent'
                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t('common.present', 'Présent')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(rec.playerId, 'Absent')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          rec.status === 'Absent'
                            ? 'bg-rose-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t('common.absent', 'Absent')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(rec.playerId, 'Excusé')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          rec.status === 'Excusé'
                            ? 'bg-amber-500 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t('common.excused', 'Excusé')}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={rec.notes}
                      onChange={(e) => setPlayerNote(rec.playerId, e.target.value)}
                      placeholder={language === 'ar' ? 'ملاحظة...' : 'Note...'}
                      className="w-28 px-2 py-1 text-[11px] rounded border border-slate-200 focus:border-emerald-600 outline-none text-slate-700"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {t('common.cancel', 'Annuler')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('attendance.saveAttendance', 'Valider la feuille de présence')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
