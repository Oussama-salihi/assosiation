import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  MessageSquare,
  Eye,
  Edit2,
  X,
  KeyRound,
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Send,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Parent, AbsenceNotification, AbsenceNotificationStatus, Player } from '../../types';
import { getWhatsAppUrl, formatDate } from '../../utils/formatters';

interface ParentsViewProps {
  onOpenNewParent: () => void;
  onEditParent: (parent: Parent) => void;
  onNavigateToPlayer: (playerId: string) => void;
  onOpenQuickPayment: (playerId: string) => void;
  preselectedParentId?: string;
}

export const ParentsView: React.FC<ParentsViewProps> = ({
  onOpenNewParent,
  onEditParent,
  onNavigateToPlayer,
  onOpenQuickPayment,
  preselectedParentId,
}) => {
  const {
    parents,
    players,
    teams,
    users,
    settings,
    getParentFinancials,
    absenceNotifications,
    updateAbsenceNotificationStatus,
    parentMessages,
    updateParentMessageStatus,
    createParentAccount,
    resetParentPassword,
    linkChildToParent,
    unlinkChildFromParent,
  } = useApp();

  const { t, language, formatMoney, isRTL } = useLanguage();

  const [activeSection, setActiveSection] = useState<'parents' | 'absences' | 'messages'>('parents');
  const [search, setSearch] = useState('');
  const [selectedParentDetail, setSelectedParentDetail] = useState<Parent | null>(() => {
    if (preselectedParentId) {
      return parents.find((p) => p.id === preselectedParentId) || null;
    }
    return null;
  });

  // Modal for creating parent account
  const [accountModalParent, setAccountModalParent] = useState<Parent | null>(null);
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [accountPassword, setAccountPassword] = useState<string>('Atlas2026!');
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  // Modal for linking child
  const [linkChildModalParent, setLinkChildModalParent] = useState<Parent | null>(null);
  const [selectedPlayerToLink, setSelectedPlayerToLink] = useState<string>('');

  // Modal for replying to parent message
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // State for acknowledging absence notification
  const [reviewingAbsenceId, setReviewingAbsenceId] = useState<string | null>(null);
  const [absenceResponseNote, setAbsenceResponseNote] = useState<string>('');

  const filteredParents = parents
    .filter((p) => !p.isDeleted)
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    });

  const getRelationLabel = (rel: string) => {
    switch (rel) {
      case 'Père':
        return t('parents.father', 'Père');
      case 'Mère':
        return t('parents.mother', 'Mère');
      case 'Tuteur légal':
        return t('parents.guardian', 'Tuteur légal');
      default:
        return rel;
    }
  };

  const getParentUser = (parent: Parent) => {
    return users.find(
      (u) =>
        u.parentId === parent.id ||
        (parent.email && u.email.toLowerCase() === parent.email.toLowerCase())
    );
  };

  const handleOpenCreateAccount = (parent: Parent) => {
    setAccountModalParent(parent);
    setAccountEmail(parent.email || `${parent.firstName.toLowerCase()}.${parent.lastName.toLowerCase()}@asatlasfoot.ma`);
    setAccountPassword('Atlas2026!');
  };

  const handleConfirmCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountModalParent) return;
    setIsCreatingAccount(true);
    await createParentAccount(accountModalParent.id, accountEmail, accountPassword);
    setIsCreatingAccount(false);
    setAccountModalParent(null);
  };

  const handleResetPassword = async (parent: Parent) => {
    await resetParentPassword(parent.id);
  };

  const handleConfirmLinkChild = () => {
    if (!linkChildModalParent || !selectedPlayerToLink) return;
    linkChildToParent(selectedPlayerToLink, linkChildModalParent.id);
    setLinkChildModalParent(null);
    setSelectedPlayerToLink('');
  };

  const pendingAbsences = absenceNotifications.filter((a) => a.status === 'En attente');
  const unreadMessages = parentMessages.filter((m) => m.status === 'Non lu');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('parents.title', 'Parents & Familles')}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'إدارة حسابات أولياء الأمور، ربط الأبناء، متابعة إشعارات الغياب والمراسلات'
              : 'Gestion des tuteurs légaux, comptes d’accès, justificatifs d’absence et échanges'}
          </p>
        </div>

        <button
          onClick={onOpenNewParent}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('parents.newParent', 'Ajouter un parent')}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSection('parents')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSection === 'parents'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{language === 'ar' ? 'دليل العائلات' : 'Liste des familles'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSection === 'parents' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {filteredParents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('absences')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSection === 'absences'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'إشعارات الغياب' : 'Demandes d’absence'}</span>
          {pendingAbsences.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white animate-pulse">
              {pendingAbsences.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('messages')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSection === 'messages'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'رسائل الأولياء' : 'Messages reçus'}</span>
          {unreadMessages.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
              {unreadMessages.length}
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: PARENTS LIST */}
      {activeSection === 'parents' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative max-w-sm text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={language === 'ar' ? 'البحث بالاسم، الهاتف أو البريد...' : 'Rechercher par nom, téléphone, email...'}
                className={`w-full ${
                  isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'
                } py-2 rounded-xl border border-slate-200 focus:border-emerald-600 text-slate-900 outline-none text-xs`}
              />
            </div>
          </div>

          {/* Parents Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParents.map((parent) => {
              const children = players.filter((p) => p.parentId === parent.id && !p.isDeleted);
              const fin = getParentFinancials(parent.id);
              const parentUser = getParentUser(parent);
              const waUrl = getWhatsAppUrl(
                parent.whatsapp || parent.phone,
                `Salam ${parent.firstName} ${parent.lastName}, de l'${settings.name} :`
              );

              return (
                <div
                  key={parent.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div>
                    {/* Header: Name, Status & Contact */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {parent.firstName} {parent.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {getRelationLabel(parent.relation)} · <span className="font-mono">{parent.phone}</span>
                        </p>
                      </div>

                      {/* Online account badge */}
                      {parentUser ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'ar' ? 'حساب مفعل' : 'Actif'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          <span>{language === 'ar' ? 'بدون حساب' : 'Non créé'}</span>
                        </span>
                      )}
                    </div>

                    {/* Children badges */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          {language === 'ar' ? 'الأبناء المسجلون' : 'Enfants'} ({children.length})
                        </span>
                        <button
                          onClick={() => setLinkChildModalParent(parent)}
                          className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>{language === 'ar' ? 'ربط ابن' : '+ Lier'}</span>
                        </button>
                      </div>

                      <div className="space-y-1 text-xs">
                        {children.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">
                            {language === 'ar' ? 'لا يوجد أبناء مرتبطون حالياً' : 'Aucun enfant assigné'}
                          </span>
                        ) : (
                          children.map((ch) => {
                            const tm = teams.find((t) => t.id === ch.teamId);
                            return (
                              <div
                                key={ch.id}
                                className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors text-slate-800"
                              >
                                <span
                                  onClick={() => onNavigateToPlayer(ch.id)}
                                  className="font-medium hover:underline cursor-pointer"
                                >
                                  {ch.firstName} {ch.lastName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-mono text-[10px]">
                                    {tm?.category || 'Club'}
                                  </span>
                                  <button
                                    onClick={() => unlinkChildFromParent(ch.id)}
                                    title={language === 'ar' ? 'فصل الربط' : 'Dissocier'}
                                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Unlink className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          {t('players.paidAmount', 'Total payé')}
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          {formatMoney(fin.paid)}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          {t('players.remainingAmount', 'Solde restant')}
                        </span>
                        <span className={`font-mono font-bold ${fin.remaining > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {formatMoney(fin.remaining)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Account management */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WA</span>
                      </a>

                      {parentUser ? (
                        <button
                          onClick={() => handleResetPassword(parent)}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Réinitialiser le mot de passe"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'كلمة المرور' : 'MDP'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenCreateAccount(parent)}
                          className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Créer un compte d'accès pour ce parent"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'تفعيل الحساب' : 'Créer accès'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedParentDetail(parent)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title={t('common.viewProfile', 'Voir')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditParent(parent)}
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
        </div>
      )}

      {/* SECTION 2: ABSENCE NOTIFICATIONS */}
      {activeSection === 'absences' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'إشعارات الغياب الواردة من أولياء الأمور' : 'Avis d’absence signalés par les familles'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'تمكين المدربين والإدارة من معرفة الغيابات مسبقاً وتأكيد استلامها'
                  : 'Validation et accusé de réception des absences pour les séances d’entraînement'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
              {absenceNotifications.length} avis
            </span>
          </div>

          {absenceNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              {language === 'ar' ? 'لا توجد إشعارات غياب مسجلة.' : 'Aucun avis d’absence soumis.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {absenceNotifications.map((notif) => {
                const child = players.find((p) => p.id === notif.playerId);
                const parent = parents.find((p) => p.id === notif.parentId);
                const tm = child ? teams.find((t) => t.id === child.teamId) : null;

                return (
                  <div key={notif.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {child ? `${child.firstName} ${child.lastName}` : 'Enfant'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">
                          {parent ? `${parent.firstName} ${parent.lastName}` : 'Parent'}
                        </span>
                        {tm && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {tm.category}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          {notif.reason}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        <strong>Date de la séance :</strong> {formatDate(notif.sessionDate)}
                      </p>

                      {notif.notes && (
                        <p className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60 max-w-xl">
                          "{notif.notes}"
                        </p>
                      )}

                      {notif.responseNote && (
                        <p className="text-xs text-emerald-800 font-semibold mt-1">
                          ✓ Accusé de réception : {notif.responseNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        notif.status === 'Approuvé'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notif.status === 'Vu'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {notif.status}
                      </span>

                      {notif.status === 'En attente' && (
                        <button
                          onClick={() => {
                            setReviewingAbsenceId(notif.id);
                            setAbsenceResponseNote('Bien noté par le staff technique.');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          {language === 'ar' ? 'تأكيد واستلام' : 'Approuver'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: PARENT MESSAGES */}
      {activeSection === 'messages' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'رسائل واستفسارات أولياء الأمور' : 'Boîte de réception des messages parents'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'التواصل المباشر مع العائلات والرد على الطلبات الإدارية'
                  : 'Échanges et réponses aux sollicitations des familles'}
              </p>
            </div>
          </div>

          {parentMessages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              {language === 'ar' ? 'لا توجد رسائل واردة.' : 'Aucun message reçu.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {parentMessages.map((msg) => (
                <div key={msg.id} className="p-6 space-y-3 hover:bg-slate-50/50 transition-colors text-xs">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{msg.subject}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        De <strong>{msg.parentName}</strong> {msg.parentEmail ? `(${msg.parentEmail})` : ''} • {formatDate(msg.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        msg.status === 'Répondu'
                          ? 'bg-emerald-100 text-emerald-800'
                          : msg.status === 'Lu'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {msg.status}
                      </span>

                      <button
                        onClick={() => {
                          setReplyingMessageId(msg.id);
                          setReplyText(msg.response || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                      >
                        {msg.response ? (language === 'ar' ? 'تعديل الرد' : 'Modifier la réponse') : (language === 'ar' ? 'الرد' : 'Répondre')}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                    {msg.message}
                  </p>

                  {msg.response && (
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/70 text-xs text-emerald-950 space-y-1">
                      <span className="font-bold text-[10px] uppercase text-emerald-800 block">
                        {language === 'ar' ? 'رد الإدارة المرسل :' : 'Réponse du secrétariat :'}
                      </span>
                      <p className="leading-relaxed">{msg.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE PARENT ACCOUNT */}
      {accountModalParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  {language === 'ar' ? 'إنشاء حساب ولوج لولي الأمر' : 'Créer un accès Parent'}
                </h3>
              </div>
              <button
                onClick={() => setAccountModalParent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateAccount} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Créez les identifiants d'accès au Portail Parents pour{' '}
                <strong>{accountModalParent.firstName} {accountModalParent.lastName}</strong>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adresse Email de connexion *
                </label>
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mot de passe temporaire *
                </label>
                <input
                  type="text"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 font-mono text-slate-900 outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px]">
                ✓ Ce compte sera automatiquement associé au profil parent et restreint en lecture seule aux enfants de ce foyer.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAccountModalParent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {isCreatingAccount ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK CHILD TO PARENT */}
      {linkChildModalParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  Associer un joueur à {linkChildModalParent.firstName} {linkChildModalParent.lastName}
                </h3>
              </div>
              <button
                onClick={() => setLinkChildModalParent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Sélectionnez le joueur licencié à rattacher à ce parent / tuteur légal :
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Joueur à associer
                </label>
                <select
                  value={selectedPlayerToLink}
                  onChange={(e) => setSelectedPlayerToLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none bg-white"
                >
                  <option value="">Sélectionnez un joueur...</option>
                  {players
                    .filter((p) => !p.isDeleted && p.parentId !== linkChildModalParent.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.birthDate})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLinkChildModalParent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLinkChild}
                  disabled={!selectedPlayerToLink}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold cursor-pointer"
                >
                  Confirmer la liaison
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPLY TO PARENT MESSAGE */}
      {replyingMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Répondre au message du parent</h3>
              <button
                onClick={() => setReplyingMessageId(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Réponse officielle du secrétariat *
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyingMessageId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateParentMessageStatus(replyingMessageId, 'Répondu', replyText);
                    setReplyingMessageId(null);
                  }}
                  disabled={!replyText.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold cursor-pointer"
                >
                  Envoyer la réponse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE ABSENCE NOTIFICATION */}
      {reviewingAbsenceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Valider l'avis d'absence</h3>
              <button
                onClick={() => setReviewingAbsenceId(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mot / Accusé de réception pour la famille
                </label>
                <input
                  type="text"
                  value={absenceResponseNote}
                  onChange={(e) => setAbsenceResponseNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingAbsenceId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateAbsenceNotificationStatus(reviewingAbsenceId, 'Approuvé', absenceResponseNote);
                    setReviewingAbsenceId(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Confirmer et valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DU PARENT */}
      {selectedParentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {selectedParentDetail.firstName} {selectedParentDetail.lastName}
                </h3>
                <p className="text-xs text-slate-400">
                  {getRelationLabel(selectedParentDetail.relation)}
                </p>
              </div>
              <button
                onClick={() => setSelectedParentDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <p><strong>{t('common.phone', 'Téléphone')} :</strong> {selectedParentDetail.phone}</p>
                {selectedParentDetail.email && <p><strong>{t('common.email', 'Email')} :</strong> {selectedParentDetail.email}</p>}
                {selectedParentDetail.address && <p><strong>{t('common.address', 'Adresse')} :</strong> {selectedParentDetail.address}</p>}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase block mb-2">
                  {language === 'ar' ? 'الأبناء' : 'Enfants'} ({players.filter((p) => p.parentId === selectedParentDetail.id && !p.isDeleted).length})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {players
                    .filter((p) => p.parentId === selectedParentDetail.id && !p.isDeleted)
                    .map((player) => (
                      <div
                        key={player.id}
                        className="p-2.5 flex items-center justify-between hover:bg-slate-50"
                      >
                        <span className="font-semibold text-slate-900">
                          {player.firstName} {player.lastName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedParentDetail(null);
                              onOpenQuickPayment(player.id);
                            }}
                            className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                          >
                            + {t('dashboard.recordPayment', 'Paiement')}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedParentDetail(null);
                              onNavigateToPlayer(player.id);
                            }}
                            className="text-xs text-slate-500 hover:underline cursor-pointer"
                          >
                            {language === 'ar' ? 'الملف ←' : 'Fiche →'}
                          </button>
                        </div>
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
