import React, { useState } from 'react';
import {
  CheckSquare,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingSession } from '../../types';
import { formatDate } from '../../utils/formatters';

interface AttendanceViewProps {
  onOpenAttendanceSheet: (session: TrainingSession) => void;
  onNavigateToPlayer: (playerId: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  onOpenAttendanceSheet,
  onNavigateToPlayer,
}) => {
  const { teams, players, sessions, attendances, getPlayerAttendanceStats, getTeamStats } = useApp();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');

  const activePlayers = players.filter((p) => !p.isDeleted && p.status === 'Actif');

  // Find players with low attendance (< 75%)
  const lowAttendancePlayers = activePlayers
    .map((player) => ({
      player,
      stats: getPlayerAttendanceStats(player.id),
      team: teams.find((t) => t.id === player.teamId),
    }))
    .filter((item) => item.stats.totalSessions > 0 && item.stats.percentage < 75);

  const teamSessions = sessions.filter((s) => s.teamId === selectedTeamId);
  const teamPlayers = activePlayers.filter((p) => p.teamId === selectedTeamId);
  const teamStats = getTeamStats(selectedTeamId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-600" />
          <span>Suivi de l'Assiduité & Présences aux Entraînements</span>
        </h2>
        <p className="text-xs text-slate-500">
          Statistiques de présence par joueur et par équipe, alertes d'absentéisme
        </p>
      </div>

      {/* Alerte Absentéisme (< 75% assiduité) */}
      {lowAttendancePlayers.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <h4 className="font-bold text-xs uppercase tracking-wide text-amber-800">
              Alerte Assiduité : {lowAttendancePlayers.length} joueur(s) en dessous de 75%
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-xs">
            {lowAttendancePlayers.map(({ player, stats, team }) => (
              <div
                key={player.id}
                onClick={() => onNavigateToPlayer(player.id)}
                className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {player.firstName} {player.lastName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {team?.name} ({team?.category})
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-600 block">
                    {stats.percentage} %
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {stats.attended}/{stats.totalSessions} séances
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTeamId(t.id)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors border ${
              selectedTeamId === t.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.name} ({t.category})
          </button>
        ))}
      </div>

      {/* Selected Team Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Taux d'assiduité moyen de l'équipe
          </span>
          <span
            className={`text-2xl font-black font-mono tabular-nums block mt-1 ${
              teamStats.avgAttendanceRate >= 80 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {teamStats.avgAttendanceRate} %
          </span>
          <span className="text-xs text-slate-500">Moyenne de l'ensemble de l'effectif</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Séances organisées
          </span>
          <span className="text-2xl font-black font-mono text-slate-900 tabular-nums block mt-1">
            {teamSessions.length}
          </span>
          <span className="text-xs text-slate-500">
            {teamSessions.filter((s) => s.completed).length} séances pointées
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Joueurs engagés
          </span>
          <span className="text-2xl font-black font-mono text-slate-900 tabular-nums block mt-1">
            {teamPlayers.length}
          </span>
          <span className="text-xs text-slate-500">Effectif régulier</span>
        </div>
      </div>

      {/* Players Attendance Sheet for Selected Team */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900">
            Feuille d'Assiduité par Joueur
          </h3>
          <span className="text-xs text-slate-500">
            Calcul automatique : Présents / (Présents + Absents + Excusés)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">JOUEUR</th>
                <th className="py-3 px-3">POSTE</th>
                <th className="py-3 px-3 text-center">SÉANCES TOTAL</th>
                <th className="py-3 px-3 text-center">PRÉSENCES</th>
                <th className="py-3 px-3 text-center">ABSENCES</th>
                <th className="py-3 px-3 text-center">EXCUSÉS</th>
                <th className="py-3 px-3 text-right">POURCENTAGE DE PRÉSENCE</th>
                <th className="py-3 px-4 text-center">FICHE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun joueur dans cette catégorie.
                  </td>
                </tr>
              ) : (
                teamPlayers.map((player) => {
                  const stats = getPlayerAttendanceStats(player.id);
                  return (
                    <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {player.firstName} {player.lastName}
                        {player.jerseyNumber && (
                          <span className="ml-1 text-[10px] text-slate-500">#{player.jerseyNumber}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {player.position || 'Joueur'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-700">
                        {stats.totalSessions}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                        {stats.attended}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                        {stats.absent}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-amber-700">
                        {stats.excused}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-mono font-black text-sm tabular-nums ${
                            stats.percentage >= 80
                              ? 'text-emerald-700'
                              : stats.percentage >= 65
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {stats.percentage} %
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onNavigateToPlayer(player.id)}
                          className="text-xs text-emerald-700 font-semibold hover:underline"
                        >
                          Détails →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
