import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  FileCheck2,
  Wallet,
  AlertCircle,
  ReceiptText,
  CalendarDays,
  CheckSquare,
  BarChart3,
  UserCog,
  Settings,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export type ActiveTab =
  | 'dashboard'
  | 'players'
  | 'parents'
  | 'teams'
  | 'registrations'
  | 'payments'
  | 'unpaid'
  | 'receipts'
  | 'sessions'
  | 'attendance'
  | 'reports'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const { settings, players, getPlayerFinancials } = useApp();
  const { currentUser } = useAuth();

  // Count players with unpaid fees for badge
  const unpaidCount = players.filter(
    (p) => !p.isDeleted && getPlayerFinancials(p.id).remainingAmount > 0
  ).length;

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // Check role-based permission for each module
  const canAccess = (tab: ActiveTab): boolean => {
    if (!currentUser) return false;
    const role: UserRole = currentUser.role;

    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;

    if (role === 'COMPTABLE') {
      return ['dashboard', 'payments', 'unpaid', 'receipts', 'reports'].includes(tab);
    }

    if (role === 'ENTRAINEUR') {
      return ['dashboard', 'players', 'teams', 'sessions', 'attendance'].includes(tab);
    }

    if (role === 'STAFF') {
      return ['dashboard', 'players', 'parents', 'registrations'].includes(tab);
    }

    return false;
  };

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  // Simplified Sections as requested
  const sections: NavSection[] = [
    {
      title: 'ACCUEIL',
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'CLUB',
      items: [
        {
          id: 'players',
          label: 'Joueurs',
          icon: Users,
        },
        {
          id: 'parents',
          label: 'Parents',
          icon: UserCheck,
        },
        {
          id: 'teams',
          label: 'Équipes',
          icon: Shield,
        },
        {
          id: 'registrations',
          label: 'Inscriptions',
          icon: FileCheck2,
        },
      ],
    },
    {
      title: 'FINANCES',
      items: [
        {
          id: 'payments',
          label: 'Paiements',
          icon: Wallet,
        },
        {
          id: 'unpaid',
          label: 'Impayés',
          icon: AlertCircle,
          badge: unpaidCount > 0 ? unpaidCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          id: 'receipts',
          label: 'Reçus',
          icon: ReceiptText,
        },
      ],
    },
    {
      title: 'SPORT',
      items: [
        {
          id: 'sessions',
          label: 'Séances',
          icon: CalendarDays,
        },
        {
          id: 'attendance',
          label: 'Présences',
          icon: CheckSquare,
        },
      ],
    },
    {
      title: 'RAPPORTS',
      items: [
        {
          id: 'reports',
          label: 'Rapports',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: UserCog,
        },
        {
          id: 'settings',
          label: 'Paramètres',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 p-1 shrink-0">
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white truncate">
                {settings.shortName}
              </h1>
              <p className="text-[11px] text-emerald-400 font-medium truncate">
                Gestion Club Foot
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {sections.map((section) => {
            const accessibleItems = section.items.filter((item) => canAccess(item.id));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {section.title}
                </div>
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            item.badgeColor || 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span className="font-medium text-slate-300">Saison 2026-2027</span>
          <span className="font-mono text-emerald-400">{settings.currency}</span>
        </div>
      </aside>
    </>
  );
};
