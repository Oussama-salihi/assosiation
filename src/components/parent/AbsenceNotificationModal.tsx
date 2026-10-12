import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Clock, CheckCircle2, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { AbsenceReason, Player, TrainingSession } from '../../types';

interface AbsenceNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
  linkedPlayers: Player[];
  preselectedPlayerId?: string;
  preselectedDate?: string;
  upcomingSessions: TrainingSession[];
}

export const AbsenceNotificationModal: React.FC<AbsenceNotificationModalProps> = ({
  isOpen,
  onClose,
  parentId,
  linkedPlayers,
  preselectedPlayerId,
  preselectedDate,
  upcomingSessions,
}) => {
  const { addAbsenceNotification } = useApp();
  const { t, language, isRTL } = useLanguage();

  const [playerId, setPlayerId] = useState<string>(
    preselectedPlayerId || (linkedPlayers.length > 0 ? linkedPlayers[0].id : '')
  );
  const [sessionDate, setSessionDate] = useState<string>(
    preselectedDate || new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState<AbsenceReason>('Maladie');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = addAbsenceNotification({
      parentId,
      playerId,
      sessionDate,
      reason,
      notes,
    });

    setIsSubmitting(false);

    if (result.success) {
      setNotes('');
      onClose();
    } else {
      setError(result.error || 'Erreur lors de l’envoi');
    }
  };

  const reasonsList: { value: AbsenceReason; labelFr: string; labelAr: string }[] = [
    { value: 'Maladie', labelFr: 'Maladie / Raison médicale', labelAr: 'مرض / وعكة صحية' },
    { value: 'Études / Examens', labelFr: 'Études / Examens scolaires', labelAr: 'دراسة / امتحانات' },
    { value: 'Voyage', labelFr: 'Voyage / Déplacement', labelAr: 'سفر / تنقل' },
    { value: 'Familial', labelFr: 'Événement familial', labelAr: 'ظرف عائلي' },
    { value: 'Autre', labelFr: 'Autre motif', labelAr: 'سبب آخر' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 rounded-xl text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {language === 'ar' ? 'إشعار غياب مسبق' : 'Signaler une absence'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'إعلام الطاقم التقني مسبقاً بعدم حضور الحصة'
                  : 'Prévenez les entraîneurs à l’avance pour la séance'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Child selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'ar' ? 'الابن المعني' : 'Enfant concerné'} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
              <select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                required
                className={`w-full ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                } py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-xs outline-none bg-white`}
              >
                {linkedPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.gender === 'Féminin' ? 'Fille' : 'Garçon'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of session */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'ar' ? 'تاريخ الحصة التدريبية' : 'Date de la séance'} *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
                className={`w-full ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                } py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-xs outline-none`}
              />
            </div>
          </div>

          {/* Absence Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'ar' ? 'سبب الغياب' : 'Motif de l’absence'} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reasonsList.map((r) => {
                const isSelected = reason === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`p-2.5 rounded-xl border text-left rtl:text-right font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{language === 'ar' ? r.labelAr : r.labelFr}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / explanation */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'ar' ? 'ملاحظات وتوضيحات للمدرب' : 'Précisions pour le coach (facultatif)'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب أي توضيح ترغب في إبلاغه للمدرب...'
                  : 'Ex: Contrôle de maths prévu le lendemain, repos médical recommandé...'
              }
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 text-xs outline-none resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
            ℹ️ {language === 'ar'
              ? 'تنبيه: إشعار الغياب يتيح إعلام الطاقم التقني مسبقاً لتنظيم الحصة، ولا يُغير تلقائياً الحضور الرسمي إلا بعد تأكيد المدرب.'
              : 'Notice : Ce signalement informe le staff technique afin d’adapter les effectifs. L’émargement officiel sera validé par l’entraîneur.'}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <span>{language === 'ar' ? 'جارٍ الإرسال...' : 'Transmission...'}</span>
              ) : (
                <span>{language === 'ar' ? 'إرسال الإشعار' : 'Transmettre l’absence'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
