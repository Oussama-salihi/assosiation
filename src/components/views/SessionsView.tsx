import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckSquare,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingSession } from '../../types';
import { formatDate } from '../../utils/formatters';

interface SessionsViewProps {
  onOpenNewSession: () => void;
  onOpenAttendanceSheet: (session: TrainingSession) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  onOpenNewSession,
  onOpenAttendanceSheet,
}) => {
  const { sessions, teams, players, attendances } = useApp();

  const [filterTeam, setFilterTeam] = useState<string>('ALL');

  const filteredSessions = sessions.filter((s) => {
    return filterTeam === 'ALL' || s.teamId === filterTeam;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            <span>Séances d'Entraînement & Feuilles de Match ({sessions.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Planning des entraînements par catégorie, horaires, terrains et pointage des présences
          </p>
        </div>

        <button
          onClick={onOpenNewSession}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Programmer une séance</span>
        </button>
      </div>

      {/* Filter by Team */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="max-w-xs text-xs">
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 text-slate-900 bg-white"
          >
            <option value="ALL">Toutes les équipes</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => {
          const team = teams.find((t) => t.id === session.teamId);
          const sessionRecords = attendances.filter((a) => a.sessionId === session.id);
          const presentCount = sessionRecords.filter((a) => a.status === 'Présent').length;
          const totalRecords = sessionRecords.length;
          const rate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : null;

          return (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-amber-400 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-200 shrink-0">
                      {team?.category || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {team?.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Coach : {session.coachName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      session.completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {session.completed ? 'Pointée' : 'À venir'}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{session.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{session.location}</span>
                  </div>
                </div>

                {session.notes && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-100 italic">
                    « {session.notes} »
                  </div>
                )}
              </div>

              {/* Attendance quick info & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {session.completed && rate !== null ? (
                    <div className="text-xs">
                      <span className="text-slate-500">Présence :</span>{' '}
                      <strong className="font-mono text-emerald-700 font-bold">{rate} %</strong>
                      <span className="text-[10px] text-slate-400 ml-1">({presentCount}/{totalRecords})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Appel non fait</span>
                  )}
                </div>

                <button
                  onClick={() => onOpenAttendanceSheet(session)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                    session.completed
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{session.completed ? 'Modifier l\'appel' : 'Faire l\'appel'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
