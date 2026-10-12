import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  UserCheck,
  ChevronDown,
  User as UserIcon,
  Wallet,
  CalendarDays,
  UserPlus,
  Settings,
  LogOut,
  Languages,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from './Sidebar';
import { UserProfileModal } from '../modals/UserProfileModal';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenQuickPayment: () => void;
  onOpenQuickPlayer: () => void;
  onOpenQuickSession: () => void;
  onOpenQuickParent: () => void;
  onNavigateToSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenQuickPayment,
  onOpenQuickPlayer,
  onOpenQuickSession,
  onOpenQuickParent,
  onNavigateToSettings,
}) => {
  const { currentUser, logout } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Tab Titles localized
  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: t('dashboard.title', 'Tableau de bord'),
      subtitle: t('dashboard.subtitle', "Situation générale de l'association"),
    },
    players: {
      title: t('players.title', 'Joueurs'),
      subtitle: t('players.subtitle', 'Effectif du club et fiches joueurs'),
    },
    parents: {
      title: t('parents.title', 'Parents & Tuteurs'),
      subtitle: t('parents.subtitle', 'Répertoire familial et contacts'),
    },
    teams: {
      title: t('teams.title', 'Équipes'),
      subtitle: t('teams.subtitle', 'Catégories, coachs et entraînements'),
    },
    registrations: {
      title: t('registrations.title', 'Inscriptions'),
      subtitle: t('registrations.subtitle', 'Adhésions de la saison'),
    },
    payments: {
      title: t('payments.title', 'Paiements'),
      subtitle: t('payments.subtitle', 'Registre des encaissements'),
    },
    unpaid: {
      title: t('unpaid.title', 'Impayés'),
      subtitle: t('unpaid.subtitle', 'Suivi des cotisations en retard'),
    },
    receipts: {
      title: t('receipts.title', 'Reçus'),
      subtitle: t('receipts.subtitle', 'Reçus officiels de cotisation'),
    },
    sessions: {
      title: t('sessions.title', 'Séances'),
      subtitle: t('sessions.subtitle', 'Planning des entraînements'),
    },
    attendance: {
      title: t('attendance.title', 'Présences'),
      subtitle: t('attendance.subtitle', 'Pointage et taux de présence'),
    },
    reports: {
      title: t('reports.title', 'Rapports'),
      subtitle: t('reports.subtitle', 'Analyses consolidées et export Excel'),
    },
    users: {
      title: t('users.title', 'Utilisateurs'),
      subtitle: t('users.subtitle', "Comptes et droits d'accès"),
    },
    settings: {
      title: t('settings.title', 'Paramètres'),
      subtitle: t('settings.subtitle', 'Configuration du club'),
    },
  };

  const currentMeta = tabTitles[activeTab] || {
    title: 'Association Football',
    subtitle: 'Plateforme de gestion',
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return t('users.roleSuperAdmin', 'Super Admin');
      case 'ADMIN':
        return t('users.roleAdmin', 'Administrateur');
      case 'COMPTABLE':
        return t('users.roleAccountant', 'Comptable');
      case 'ENTRAINEUR':
        return t('users.roleCoach', 'Entraîneur');
      case 'STAFF':
        return t('users.roleStaff', 'Staff');
      default:
        return role || '';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between">
        {/* Left/Start zone: mobile toggle + Page title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {currentMeta.title}
            </h2>
            <p className="hidden sm:block text-xs text-slate-400 truncate">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right/End zone: Language Selector + Search + Quick Action + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowQuickMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title={t('auth.switchLang', 'Changer de langue')}
            >
              <span className="text-sm">
                {language === 'ar' ? '🇲🇦' : '🇫🇷'}
              </span>
              <span className="font-bold">
                {language === 'ar' ? 'العربية' : 'FR'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangMenu(false)}
                />
                <div
                  className={`absolute mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}
                >
                  <button
                    onClick={() => {
                      setLanguage('fr');
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 font-medium cursor-pointer ${
                      language === 'fr' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🇫🇷</span>
                      <span>Français</span>
                    </div>
                    {language === 'fr' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setLanguage('ar');
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 font-medium cursor-pointer ${
                      language === 'ar' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🇲🇦</span>
                      <span className="font-cairo">العربية</span>
                    </div>
                    {language === 'ar' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            title={`${t('common.search', 'Rechercher')} (⌘K)`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('common.search', 'Rechercher...')}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-400 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Quick Create Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowQuickMenu(!showQuickMenu);
                setShowLangMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.new', 'Nouveau')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showQuickMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickMenu(false)}
                />
                <div
                  className={`absolute mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}
                >
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickPlayer();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('dashboard.addPlayer', 'Ajouter un joueur')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickPayment();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('dashboard.recordPayment', 'Enregistrer un paiement')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickParent();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>{t('parents.newParent', 'Ajouter un parent')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickSession();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>{t('sessions.newSession', 'Créer une séance')}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Clean User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowLangMenu(false);
                setShowQuickMenu(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-xs text-start">
                <div className="font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">
                  {getRoleLabel(currentUser?.role)}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  className={`absolute mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 text-xs ${
                    isRTL ? 'left-0' : 'right-0'
                  }`}
                >
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {getRoleLabel(currentUser?.role)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{t('auth.myProfile', 'Mon profil')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateToSettings();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{t('auth.settings', 'Paramètres')}</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{t('auth.logout', 'Se déconnecter')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        user={currentUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
