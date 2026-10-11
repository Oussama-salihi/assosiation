import React, { useState, useEffect } from 'react';
import { X, CheckSquare, CheckCircle2, User, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
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

  // Calculations
  const total = records.length;
  const presentCount = records.filter((r) => r.status === 'Présent').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const excusedCount = records.filter((r) => r.status === 'Excusé').length;
  const presencePercent = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const handleSave = () => {
    saveAttendance(session.id, records);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-tight">
                Feuille de présence · {team?.name} ({team?.category})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Séance du {formatDate(session.date)} ({session.time}) · {session.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Attendance Rate Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Total effectif :</span>{' '}
              <strong className="text-slate-900 font-mono">{total}</strong>
            </div>
            <div className="text-emerald-700 font-semibold">
              Présents : <span className="font-mono">{presentCount}</span>
            </div>
            <div className="text-rose-700 font-semibold">
              Absents : <span className="font-mono">{absentCount}</span>
            </div>
            <div className="text-amber-700 font-semibold">
              Excusés : <span className="font-mono">{excusedCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Taux de présence :</span>
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
          <span className="text-slate-500 font-medium">Actions groupées :</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('Présent')}
              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-medium transition-colors"
            >
              Tous Présents
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('Excusé')}
              className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-medium transition-colors"
            >
              Tous Excusés
            </button>
          </div>
        </div>

        {/* Players List Table */}
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {records.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucun joueur actif dans cette équipe.
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
                        {player.position || 'Joueur'}
                      </div>
                    </div>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(rec.playerId, 'Présent')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          rec.status === 'Présent'
                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Présent
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(rec.playerId, 'Absent')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          rec.status === 'Absent'
                            ? 'bg-rose-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(rec.playerId, 'Excusé')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          rec.status === 'Excusé'
                            ? 'bg-amber-500 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Excusé
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Motif / note..."
                      value={rec.notes}
                      onChange={(e) => setPlayerNote(rec.playerId, e.target.value)}
                      className="text-[11px] px-2 py-1 rounded border border-slate-200 w-28 sm:w-36 focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Valider la feuille de présence</span>
          </button>
        </div>
      </div>
    </div>
  );
};
