import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Eye,
  Edit2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Team } from '../../types';
import { formatDate } from '../../utils/formatters';

interface TeamsViewProps {
  onOpenNewTeam: () => void;
  onEditTeam: (team: Team) => void;
  onNavigateToPlayer: (playerId: string) => void;
  onOpenQuickSession: (teamId: string) => void;
  preselectedTeamId?: string;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  onOpenNewTeam,
  onEditTeam,
  onNavigateToPlayer,
  onOpenQuickSession,
  preselectedTeamId,
}) => {
  const {
    teams,
    players,
    sessions,
    currentUser,
  } = useApp();

  const { t, language, formatMoney } = useLanguage();

  const isCoach = currentUser.role === 'ENTRAINEUR';
  const visibleTeams = isCoach
    ? teams.filter((t) => t.id === currentUser.assignedTeamId)
    : teams;

  const [selectedTeamDetail, setSelectedTeamDetail] = useState<Team | null>(() => {
    if (preselectedTeamId) {
      if (isCoach && preselectedTeamId !== currentUser.assignedTeamId) {
        return null;
      }
      return teams.find((t) => t.id === preselectedTeamId) || null;
    }
    return null;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('teams.title', 'Équipes & Catégories')} ({visibleTeams.length})
          </h1>
          <p className="text-xs text-slate-500">
            {isCoach
              ? (language === 'ar' ? 'فريقك التدريبي المعين' : 'Votre équipe assignée')
              : t('teams.subtitle', 'De U7 aux Seniors, encadrement technique et plannings')}
          </p>
        </div>

        {!isCoach && (
          <button
            onClick={onOpenNewTeam}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('teams.newTeam', 'Créer une équipe')}</span>
          </button>
        )}
      </div>

      {/* Cartes Simples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTeams.map((team) => {
          const teamPlayers = players.filter(
            (p) => p.teamId === team.id && !p.isDeleted && p.status === 'Actif'
          );

          // Find next or recent session
          const nextSession = sessions.find((s) => s.teamId === team.id && !s.completed) ||
            sessions.find((s) => s.teamId === team.id);

          return (
            <div
              key={team.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Header : Catégorie & Nom */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm">
                      {team.category}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {team.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t('common.coach', 'Coach')} : <strong className="text-slate-700">{team.coachName}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {teamPlayers.length} {language === 'ar' ? 'لاعبين' : 'joueurs'}
                  </span>
                </div>

                {/* Details : Cotisation mensuelle & Prochaine séance */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('teams.colFee', 'Cotisation mensuelle')} :</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatMoney(team.monthlyFee)} / {language === 'ar' ? 'شهر' : 'mois'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{language === 'ar' ? 'الحصة القادمة:' : 'Prochaine séance :'}</span>
                    <span className="font-medium text-emerald-800">
                      {nextSession ? `${formatDate(nextSession.date)} (${nextSession.time})` : `${team.trainingDays[0] || ''} ${team.trainingTime}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions : Voir, Modifier */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenQuickSession(team.id)}
                  className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  + {language === 'ar' ? 'حصة جديدة' : 'Séance'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedTeamDetail(team)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title={t('common.viewProfile', 'Voir')}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditTeam(team)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title={t('common.edit', 'Modifier')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL DE L'ÉQUIPE */}
      {selectedTeamDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {selectedTeamDetail.name} ({selectedTeamDetail.category})
                </h3>
                <p className="text-xs text-slate-400">
                  {t('common.coach', 'Coach')} : {selectedTeamDetail.coachName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeamDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <p><strong>{t('teams.trainingLocation', 'Lieu')} :</strong> {selectedTeamDetail.trainingLocation}</p>
                <p><strong>{t('teams.trainingDays', 'Créneaux')} :</strong> {selectedTeamDetail.trainingDays.join(', ')} à {selectedTeamDetail.trainingTime}</p>
                <p><strong>{t('teams.colFee', 'Cotisation')} :</strong> {formatMoney(selectedTeamDetail.monthlyFee)} / {language === 'ar' ? 'شهر' : 'mois'}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase block mb-2">
                  {language === 'ar' ? 'قائمة اللاعبين' : 'Liste des joueurs'} ({players.filter((p) => p.teamId === selectedTeamDetail.id && !p.isDeleted).length})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {players
                    .filter((p) => p.teamId === selectedTeamDetail.id && !p.isDeleted)
                    .map((player) => (
                      <div
                        key={player.id}
                        className="p-2.5 flex items-center justify-between hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-900">
                          {player.firstName} {player.lastName}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedTeamDetail(null);
                            onNavigateToPlayer(player.id);
                          }}
                          className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                        >
                          {language === 'ar' ? 'الملف ←' : 'Fiche →'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
