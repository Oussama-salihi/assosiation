import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Bell,
  MessageSquare,
  LogOut,
  Globe,
  ChevronDown,
  User,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { ParentDashboardView } from './ParentDashboardView';
import { ParentChildrenView } from './ParentChildrenView';
import { ParentScheduleView } from './ParentScheduleView';
import { ParentPaymentsView } from './ParentPaymentsView';
import { ParentAnnouncementsView } from './ParentAnnouncementsView';
import { ParentContactView } from './ParentContactView';
import { AbsenceNotificationModal } from './AbsenceNotificationModal';
import { ReceiptViewModal } from '../modals/ReceiptViewModal';

export type ParentPortalTab =
  | 'dashboard'
  | 'children'
  | 'schedule'
  | 'payments'
  | 'announcements'
  | 'contact';

export const ParentPortalLayout: React.FC = () => {
  const { currentUser, logout, login } = useAuth();
  const {
    settings,
    parents,
    getParentLinkedPlayers,
    getParentAnnouncements,
    sessions,
  } = useApp();

  const { t, language, setLanguage, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<ParentPortalTab>('dashboard');
  const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  // Switch to admin/staff dashboard seamlessly
  const handleSwitchToAdmin = async () => {
    setIsSwitching(true);
    await login('direction@asatlasfoot.ma', 'Atlas2026!');
    setIsSwitching(false);
  };

  // Absence modal
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState<boolean>(false);
  const [absencePreselectedChildId, setAbsencePreselectedChildId] = useState<string | undefined>();
  const [absencePreselectedDate, setAbsencePreselectedDate] = useState<string | undefined>();

  // Receipt modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [selectedPaymentIdForReceipt, setSelectedPaymentIdForReceipt] = useState<string | null>(null);

  // Identify linked parent record from trusted data source
  const currentParent = parents.find(
    (p) =>
      (currentUser?.parentId && p.id === currentUser.parentId) ||
      (p.userId && p.userId === currentUser?.id) ||
      (p.email && currentUser?.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  const currentParentId = currentParent?.id || '';
  const parentDisplayName =
    currentParent ? `${currentParent.firstName} ${currentParent.lastName}` : (currentUser?.name || 'Parent');

  const linkedPlayers = currentParentId ? getParentLinkedPlayers(currentParentId) : [];

  const handleOpenAbsence = (childId?: string, sessionDate?: string) => {
    setAbsencePreselectedChildId(childId);
    setAbsencePreselectedDate(sessionDate);
    setIsAbsenceModalOpen(true);
  };

  const handleOpenReceipt = (paymentId: string) => {
    setSelectedPaymentIdForReceipt(paymentId);
    setIsReceiptModalOpen(true);
  };

  const navItems: { id: ParentPortalTab; labelFr: string; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', labelFr: 'Accueil', labelAr: 'الرئيسية', icon: LayoutDashboard },
    { id: 'children', labelFr: 'Mes enfants', labelAr: 'أبنائي', icon: Users },
    { id: 'schedule', labelFr: 'Planning & Présences', labelAr: 'الحصص والغياب', icon: Calendar },
    { id: 'payments', labelFr: 'Cotisations & Reçus', labelAr: 'الاشتراكات والإيصالات', icon: Wallet },
    { id: 'announcements', labelFr: 'Annonces', labelAr: 'الإعلانات', icon: Bell },
    { id: 'contact', labelFr: 'Contact', labelAr: 'اتصل بالنادي', icon: MessageSquare },
  ];

  // Si le compte parent authentifié n'est relié à aucune fiche tuteur dans la base
  if (!currentParent) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'ar' ? 'حساب غير مرتبط بملف ولي أمر' : 'Compte parent non rattaché'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'ar'
              ? `تم تسجيل الدخول بنجاح بحساب (${currentUser?.email})، لكن هذا الحساب لم يتم ربطه بعد بملف ولي أمر رسمي في قاعدة بيانات النادي. يرجى التواصل مع إدارة النادي لربط حسابكم بأبنائكم.`
              : `Votre compte (${currentUser?.email}) est authentifié avec succès, mais aucune fiche parent/tuteur officielle ne lui est encore associée. Veuillez contacter l'administration du club (direction@asatlasfoot.ma) pour lier votre compte à vos enfants.`}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'تسجيل الخروج' : 'Se déconnecter'}
            </button>
            <button
              onClick={handleSwitchToAdmin}
              disabled={isSwitching}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'التبديل إلى فضاء الإدارة (تجريبي)' : 'Basculer vers l’espace Administration'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-20 md:pb-8">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Club Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200 p-1 shadow-2xs flex items-center justify-center">
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight block leading-tight">
                  {settings.shortName}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 block">
                  {language === 'ar' ? 'فضاء أولياء الأمور' : 'Portail Parents'}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{language === 'ar' ? item.labelAr : item.labelFr}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Language & User & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    language === 'fr'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Français"
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    language === 'ar'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="العربية"
                >
                  عربي
                </button>
              </div>

              {/* User Profile Info */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {parentDisplayName[0]}
                </div>
                <div className="text-left rtl:text-right">
                  <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                    {parentDisplayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {language === 'ar' ? 'حساب ولي الأمر' : 'Parent'}
                  </span>
                </div>
              </div>

              {/* Switch to Admin Button */}
              <button
                onClick={handleSwitchToAdmin}
                disabled={isSwitching}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title={language === 'ar' ? 'التبديل إلى فضاء الإدارة' : "Basculer vers l'espace Administration"}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">
                  {language === 'ar' ? 'فضاء الإدارة' : 'Espace Administration'}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title={language === 'ar' ? 'تسجيل الخروج' : 'Se déconnecter'}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'خروج' : 'Déconnexion'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Switch Notification Banner */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-300">
            {language === 'ar'
              ? 'أنت حالياً متصل بحساب ولي أمر.'
              : 'Connecté en tant que parent (espace restreint).'}
          </span>
        </div>
        <button
          onClick={handleSwitchToAdmin}
          disabled={isSwitching}
          className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>
            {language === 'ar'
              ? 'التبديل فوراً إلى لوحة تحكم الإدارة (Direction) ←'
              : 'Accéder à la gestion complète (Administration / Staff) →'}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <ParentDashboardView
            parentId={currentParentId}
            parentName={parentDisplayName}
            linkedPlayers={linkedPlayers}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
            onNavigateTab={setActiveTab}
            onOpenAbsenceModal={handleOpenAbsence}
            onOpenReceiptModal={handleOpenReceipt}
          />
        )}

        {activeTab === 'children' && (
          <ParentChildrenView
            parentId={currentParentId}
            linkedPlayers={linkedPlayers}
            onOpenAbsenceModal={handleOpenAbsence}
            onNavigateToSchedule={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'schedule' && (
          <ParentScheduleView
            parentId={currentParentId}
            linkedPlayers={linkedPlayers}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
            onOpenAbsenceModal={handleOpenAbsence}
          />
        )}

        {activeTab === 'payments' && (
          <ParentPaymentsView
            parentId={currentParentId}
            linkedPlayers={linkedPlayers}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
            onOpenReceiptModal={handleOpenReceipt}
          />
        )}

        {activeTab === 'announcements' && (
          <ParentAnnouncementsView parentId={currentParentId} />
        )}

        {activeTab === 'contact' && (
          <ParentContactView
            parentId={currentParentId}
            parentName={parentDisplayName}
            parentEmail={currentUser?.email || currentParent?.email}
            parentPhone={currentUser?.phone || currentParent?.phone}
            linkedPlayers={linkedPlayers}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer min-w-[50px] ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-600 scale-110' : 'text-slate-400'}`} />
              <span className="text-[10px] leading-tight truncate max-w-[65px]">
                {language === 'ar' ? item.labelAr : item.labelFr}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Absence Notification Modal */}
      <AbsenceNotificationModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
        parentId={currentParentId}
        linkedPlayers={linkedPlayers}
        preselectedPlayerId={absencePreselectedChildId}
        preselectedDate={absencePreselectedDate}
        upcomingSessions={sessions}
      />

      {/* Official Receipt Viewer Modal */}
      <ReceiptViewModal
        paymentId={selectedPaymentIdForReceipt}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPaymentIdForReceipt(null);
        }}
      />
    </div>
  );
};
