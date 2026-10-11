import React, { useState, useEffect } from 'react';
import { X, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTeamId?: string;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  preselectedTeamId,
}) => {
  const { teams, players, addSession, saveAttendance } = useApp();

  const [teamId, setTeamId] = useState(preselectedTeamId || teams[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('17:00 - 18:30');
  const [location, setLocation] = useState('Terrain Synthétique');

  // Player attendances state
  const [attendances, setAttendances] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    if (preselectedTeamId) {
      setTeamId(preselectedTeamId);
    }
  }, [preselectedTeamId]);

  useEffect(() => {
    if (teamId) {
      const selected = teams.find((t) => t.id === teamId);
      if (selected) {
        setLocation(selected.trainingLocation);
        setTime(selected.trainingTime);
      }
      // Populate players with default 'Présent'
      const teamPlayers = players.filter((p) => p.teamId === teamId && !p.isDeleted && p.status === 'Actif');
      const initial: Record<string, AttendanceStatus> = {};
      teamPlayers.forEach((p) => {
        initial[p.id] = 'Présent';
      });
      setAttendances(initial);
    }
  }, [teamId, teams, players]);

  if (!isOpen) return null;

  const teamPlayers = players.filter((p) => p.teamId === teamId && !p.isDeleted && p.status === 'Actif');
  const team = teams.find((t) => t.id === teamId);

  const setStatus = (pId: string, status: AttendanceStatus) => {
    setAttendances((prev) => ({ ...prev, [pId]: status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !date) return;

    // 1. Create session
    const newSession = addSession({
      teamId,
      date,
      time,
      location,
      coachName: team?.coachName || 'Entraîneur',
    });

    // 2. Save attendances
    const records = Object.entries(attendances).map(([playerId, status]) => ({
      playerId,
      status,
    }));
    saveAttendance(newSession.id, records);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight">
              Créer une séance et faire l'appel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Équipe */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Équipe <span className="text-rose-500">*</span>
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900 font-medium"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Date, Heure, Lieu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Heure <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                placeholder="17:00 - 18:30"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lieu
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Terrain Synthétique"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none text-slate-900"
            />
          </div>

          {/* Liste des joueurs : Youssef: Présent / Absent / Excusé */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 uppercase text-[11px]">
                Joueurs de l'équipe ({teamPlayers.length})
              </span>
              <span className="text-slate-400 text-[10px]">Cliquer pour marquer</span>
            </div>

            {teamPlayers.length === 0 ? (
              <p className="text-slate-400 py-3 italic">Aucun joueur actif dans cette équipe.</p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {teamPlayers.map((p) => {
                  const currentStatus = attendances[p.id] || 'Présent';

                  return (
                    <div
                      key={p.id}
                      className="pt-1.5 first:pt-0 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-900">
                        {p.firstName} {p.lastName}
                      </span>

                      <div className="inline-flex rounded-lg p-0.5 bg-slate-200 border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setStatus(p.id, 'Présent')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            currentStatus === 'Présent'
                              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                              : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(p.id, 'Absent')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white font-bold shadow-2xs'
                              : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(p.id, 'Excusé')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            currentStatus === 'Excusé'
                              ? 'bg-amber-500 text-white font-bold shadow-2xs'
                              : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          Excusé
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bouton Enregistrer les présences */}
          <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Enregistrer les présences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
