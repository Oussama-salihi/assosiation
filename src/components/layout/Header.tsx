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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Tab Titles
  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Situation générale de l\'association',
    },
    players: {
      title: 'Joueurs',
      subtitle: 'Effectif du club et fiches joueurs',
    },
    parents: {
      title: 'Parents & Tuteurs',
      subtitle: 'Répertoire familial et contacts',
    },
    teams: {
      title: 'Équipes',
      subtitle: 'Catégories, coachs et entraînements',
    },
    registrations: {
      title: 'Inscriptions',
      subtitle: 'Adhésions de la saison',
    },
    payments: {
      title: 'Paiements',
      subtitle: 'Registre des encaissements en DH',
    },
    unpaid: {
      title: 'Impayés',
      subtitle: 'Suivi des cotisations en retard',
    },
    receipts: {
      title: 'Reçus',
      subtitle: 'Reçus officiels de cotisation',
    },
    sessions: {
      title: 'Séances',
      subtitle: 'Planning des entraînements',
    },
    attendance: {
      title: 'Présences',
      subtitle: 'Pointage et taux de présence',
    },
    reports: {
      title: 'Rapports',
      subtitle: 'Analyses consolidées et export Excel',
    },
    users: {
      title: 'Utilisateurs',
      subtitle: 'Comptes et droits d\'accès',
    },
    settings: {
      title: 'Paramètres',
      subtitle: 'Configuration du club',
    },
  };

  const currentMeta = tabTitles[activeTab] || {
    title: 'Association Football',
    subtitle: 'Plateforme de gestion',
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between">
        {/* Left zone: mobile toggle + Page title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Ouvrir le menu"
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

        {/* Right zone: Search + Quick Action + Clean User Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
            title="Rechercher (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rechercher...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-400 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Quick Create Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showQuickMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs">
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickPlayer();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Ajouter un joueur</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickPayment();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Enregistrer un paiement</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickParent();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <UserCheck className="w-4 h-4 text-slate-600" />
                    <span>Ajouter un parent</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenQuickSession();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-600" />
                    <span>Créer une séance</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Clean User Menu (Production Only: Nom, Email, Rôle, Mon profil, Paramètres, Se déconnecter) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">
                  {currentUser?.role}
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
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 text-xs">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {currentUser?.role}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>Mon profil</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateToSettings();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Paramètres</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-rose-600 hover:bg-rose-50 font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Se déconnecter</span>
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
