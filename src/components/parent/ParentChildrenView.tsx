import React from 'react';
import {
  User,
  Shield,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Player, Team, Registration } from '../../types';
import { calculateAge, formatDate } from '../../utils/formatters';

interface ParentChildrenViewProps {
  parentId: string;
  linkedPlayers: Player[];
  onOpenAbsenceModal: (childId: string) => void;
  onNavigateToSchedule: (childId: string) => void;
}

export const ParentChildrenView: React.FC<ParentChildrenViewProps> = ({
  parentId,
  linkedPlayers,
  onOpenAbsenceModal,
  onNavigateToSchedule,
}) => {
  const { teams, registrations, getPlayerAttendanceStats, getPlayerFinancials } = useApp();
  const { t, language, formatMoney, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('parentPortal.myChildren', 'Mes enfants')}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {linkedPlayers.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'الملفات الرياضية، جداول الحصص الأسبوعية والمواظبة لجميع الأبناء المسجلين'
              : 'Dossiers sportifs, créneaux d’entraînement et assiduité de vos enfants licenciés'}
          </p>
        </div>

        {/* Read-only Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-600 text-xs font-medium self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'ar' ? 'بيانات مؤكدة ومعتمدة من إدارة النادي' : 'Données certifiées par l’association'}</span>
        </div>
      </div>

      {linkedPlayers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">
            {language === 'ar' ? 'لا يوجد أبناء مرتبطون بهذا الحساب حالياً' : 'Aucun enfant associé à ce compte pour le moment'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {language === 'ar'
              ? 'يرجى التواصل مع إدارة الجمعية لربط ملفات أبنائك بحسابك الإلكتروني.'
              : 'Veuillez contacter le secrétariat du club pour rattacher les fiches de vos enfants à votre compte.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {linkedPlayers.map((player) => {
            const team = teams.find((t) => t.id === player.teamId);
            const reg = registrations.find((r) => r.playerId === player.id);
            const attendance = getPlayerAttendanceStats(player.id);
            const financials = getPlayerFinancials(player.id);
            const age = calculateAge(player.birthDate);

            return (
              <div
                key={player.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Child Card Header */}
                <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar / Photo */}
                    <div className="relative">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/80 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-emerald-400/40">
                          {player.jerseyNumber || player.firstName[0]}
                        </div>
                      )}
                      {player.jerseyNumber && (
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-white text-[10px] font-mono font-bold">
                          #{player.jerseyNumber}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black tracking-tight">
                          {player.firstName} {player.lastName}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {team?.category || 'Club'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          player.status === 'Actif'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {player.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{age} {language === 'ar' ? 'سنة' : 'ans'} ({formatDate(player.birthDate)})</span>
                        <span>•</span>
                        <span>{player.position || (player.gender === 'Féminin' ? 'Joueuse' : 'Joueur')}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{team?.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenAbsenceModal(player.id)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'إشعار غياب' : 'Signaler absence'}</span>
                    </button>
                    <button
                      onClick={() => onNavigateToSchedule(player.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'الجدول الكامل' : 'Planning'}</span>
                    </button>
                  </div>
                </div>

                {/* Child Card Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Column 1: Training Schedule */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'ar' ? 'مواعيد التداريب الأسبوعية' : 'Créneaux d’entraînement'}</span>
                    </h3>

                    {team ? (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            {language === 'ar' ? 'أيام وساعات الحصص' : 'Jours & Horaires'}
                          </span>
                          <p className="font-bold text-slate-900">
                            {team.trainingDays.join(', ')}
                          </p>
                          <p className="text-slate-600 mt-0.5 font-medium">{team.trainingTime}</p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            {language === 'ar' ? 'الملعب المخصص' : 'Lieu / Terrain'}
                          </span>
                          <p className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{team.trainingLocation}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                            {language === 'ar' ? 'المدرب المسؤول' : 'Entraîneur'}
                          </span>
                          <p className="font-bold text-slate-900">{team.coachName}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">
                        {language === 'ar' ? 'لم يتم تعيين فريق بعد' : 'Aucune équipe assignée'}
                      </p>
                    )}
                  </div>

                  {/* Column 2: Attendance Record & Stats */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'ar' ? 'سجل المواظبة والحضور' : 'Assiduité & Présences'}</span>
                    </h3>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">
                          {language === 'ar' ? 'نسبة الحضور الإجمالية' : 'Taux global'}
                        </span>
                        <span className="text-base font-black text-emerald-700">
                          {attendance.percentage}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, attendance.percentage)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center text-[11px]">
                        <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                          <span className="text-emerald-700 font-bold block text-sm">{attendance.attended}</span>
                          <span className="text-slate-500 text-[10px]">{language === 'ar' ? 'حاضر' : 'Présent'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                          <span className="text-blue-700 font-bold block text-sm">{attendance.excused}</span>
                          <span className="text-slate-500 text-[10px]">{language === 'ar' ? 'مبرر' : 'Excusé'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                          <span className="text-rose-700 font-bold block text-sm">{attendance.absent}</span>
                          <span className="text-slate-500 text-[10px]">{language === 'ar' ? 'غائب' : 'Absent'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Registration Status & Coach Feedback */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'ar' ? 'التسجيل وملاحظات المدرب' : 'Adhésion & Encadrement'}</span>
                    </h3>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500">{language === 'ar' ? 'انخراط الموسم' : 'Licence saison'}</span>
                          <span className="font-bold text-slate-900">{reg?.season || '2026-2027'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{language === 'ar' ? 'وضعية الاشتراك' : 'Statut cotisation'}</span>
                          <span className={`font-bold ${financials.remainingAmount === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {financials.remainingAmount === 0 ? 'À jour (0 DH)' : `Reste ${formatMoney(financials.remainingAmount)}`}
                          </span>
                        </div>
                      </div>

                      {/* Coach notes if any */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          {language === 'ar' ? 'ملاحظات وتوجيهات الطاقم' : 'Observations du coach'}
                        </span>
                        {player.notes ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-slate-800 text-[11px] leading-relaxed">
                            "{player.notes}"
                          </div>
                        ) : (
                          <p className="text-slate-400 text-[11px] italic">
                            {t('parentPortal.noFeedback', 'Aucune remarque spécifique enregistrée pour le moment.')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
