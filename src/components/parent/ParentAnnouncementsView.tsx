import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Calendar,
  Users,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Announcement, AnnouncementType } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ParentAnnouncementsViewProps {
  parentId: string;
}

export const ParentAnnouncementsView: React.FC<ParentAnnouncementsViewProps> = ({
  parentId,
}) => {
  const { getParentAnnouncements, teams } = useApp();
  const { t, language } = useLanguage();

  const [activeFilter, setActiveFilter] = useState<'ALL' | AnnouncementType>('ALL');

  const allAnnouncements = getParentAnnouncements(parentId);

  const filteredAnnouncements = allAnnouncements.filter((a) => {
    if (activeFilter === 'ALL') return true;
    return a.type === activeFilter;
  });

  const getBadgeStyle = (type: AnnouncementType) => {
    switch (type) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'EQUIPE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EVENEMENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getTypeName = (type: AnnouncementType) => {
    if (language === 'ar') {
      switch (type) {
        case 'URGENT': return 'هام وعاجل';
        case 'EQUIPE': return 'خاص بالفئة';
        case 'EVENEMENT': return 'حدث وتظاهرة';
        default: return 'عام للنادي';
      }
    }
    switch (type) {
      case 'URGENT': return 'Urgent';
      case 'EQUIPE': return 'Équipe';
      case 'EVENEMENT': return 'Événement';
      default: return 'Général';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('parentPortal.announcements', 'Annonces du club')}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {allAnnouncements.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'التواصل الرسمي، مواعيد المباريات الإعدادية، المستجدات وتنبيهات الطقس'
              : 'Communications officielles de l’association et informations destinées aux familles'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'Toutes'}
          </button>
          <button
            onClick={() => setActiveFilter('URGENT')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'URGENT'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'ar' ? 'عاجل' : 'Urgentes'}
          </button>
          <button
            onClick={() => setActiveFilter('EQUIPE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'EQUIPE'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'ar' ? 'خاص بالفرق' : 'Par équipe'}
          </button>
          <button
            onClick={() => setActiveFilter('GENERAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'GENERAL'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'ar' ? 'عام' : 'Général'}
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">
            {language === 'ar' ? 'لا توجد إعلانات مطابقة للتصفية' : 'Aucune annonce dans cette catégorie'}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const team = ann.teamId ? teams.find((t) => t.id === ann.teamId) : null;
            const title = language === 'ar' && ann.titleAr ? ann.titleAr : ann.title;
            const content = language === 'ar' && ann.contentAr ? ann.contentAr : ann.content;

            return (
              <div
                key={ann.id}
                className={`p-6 bg-white rounded-3xl border transition-all ${
                  ann.important
                    ? 'border-amber-300 shadow-sm bg-gradient-to-br from-white to-amber-50/20'
                    : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(ann.type)}`}>
                      {getTypeName(ann.type)}
                    </span>
                    {team && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {team.name} ({team.category})
                      </span>
                    )}
                    {ann.important && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{language === 'ar' ? 'إعلان مهم' : 'Prioritaire'}</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(ann.createdAt)}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                  {title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {language === 'ar' ? 'نُشر بواسطة' : 'Publié par'} : <strong>{ann.authorName}</strong> {ann.authorRole ? `(${ann.authorRole})` : ''}
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'رسالة معتمدة' : 'Officiel club'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
