import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { LoginPage } from './components/auth/LoginPage';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PlayersView } from './components/views/PlayersView';
import { ParentsView } from './components/views/ParentsView';
import { TeamsView } from './components/views/TeamsView';
import { RegistrationsView } from './components/views/RegistrationsView';
import { PaymentsView } from './components/views/PaymentsView';
import { UnpaidView } from './components/views/UnpaidView';
import { ReceiptsView } from './components/views/ReceiptsView';
import { SessionsView } from './components/views/SessionsView';
import { AttendanceView } from './components/views/AttendanceView';
import { ReportsView } from './components/views/ReportsView';
import { UsersView } from './components/views/UsersView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { PaymentModal } from './components/modals/PaymentModal';
import { ReceiptViewModal } from './components/modals/ReceiptViewModal';
import { PlayerModal } from './components/modals/PlayerModal';
import { ParentModal } from './components/modals/ParentModal';
import { TeamModal } from './components/modals/TeamModal';
import { SessionModal } from './components/modals/SessionModal';
import { AttendanceSheetModal } from './components/modals/AttendanceSheetModal';

// Types
import { Player, Parent, Team, TrainingSession, UserRole } from './types';

function MainApp() {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const { isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedPlayerIdForPayment, setPreselectedPlayerIdForPayment] = useState<string | undefined>();

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPaymentIdForReceipt, setSelectedPaymentIdForReceipt] = useState<string | null>(null);

  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [selectedPlayerIdForView, setSelectedPlayerIdForView] = useState<string | undefined>();

  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [parentToEdit, setParentToEdit] = useState<Parent | null>(null);
  const [selectedParentIdForView, setSelectedParentIdForView] = useState<string | undefined>();

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [selectedTeamIdForView, setSelectedTeamIdForView] = useState<string | undefined>();

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [preselectedTeamIdForSession, setPreselectedTeamIdForSession] = useState<string | undefined>();

  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<TrainingSession | null>(null);

  // Check role-based permission for active tab
  const canAccessTab = (tab: ActiveTab): boolean => {
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

  // Protect route if current user cannot access active tab
  useEffect(() => {
    if (isAuthenticated && !canAccessTab(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser, isAuthenticated]);

  // Session loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium text-xs tracking-wide">
          Chargement sécurisé de la session...
        </p>
      </div>
    );
  }

  // Not authenticated => Route protection: Render Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Navigation router with parameter handling
  const handleNavigate = (tab: ActiveTab, detailId?: string) => {
    setActiveTab(tab);
    if (tab === 'players' && detailId) {
      setSelectedPlayerIdForView(detailId);
    } else if (tab === 'parents' && detailId) {
      setSelectedParentIdForView(detailId);
    } else if (tab === 'teams' && detailId) {
      setSelectedTeamIdForView(detailId);
    }
  };

  // Handlers for quick triggers
  const handleOpenPayment = (playerId?: string) => {
    setPreselectedPlayerIdForPayment(playerId);
    setIsPaymentModalOpen(true);
  };

  const handleOpenReceipt = (paymentId: string) => {
    setSelectedPaymentIdForReceipt(paymentId);
    setIsReceiptModalOpen(true);
  };

  const handleOpenNewPlayer = () => {
    setPlayerToEdit(null);
    setIsPlayerModalOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    setIsPlayerModalOpen(true);
  };

  const handleOpenNewParent = () => {
    setParentToEdit(null);
    setIsParentModalOpen(true);
  };

  const handleEditParent = (parent: Parent) => {
    setParentToEdit(parent);
    setIsParentModalOpen(true);
  };

  const handleOpenNewTeam = () => {
    setTeamToEdit(null);
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setTeamToEdit(team);
    setIsTeamModalOpen(true);
  };

  const handleOpenNewSession = (teamId?: string) => {
    setPreselectedTeamIdForSession(teamId);
    setIsSessionModalOpen(true);
  };

  const handleOpenAttendance = (session: TrainingSession) => {
    setSelectedSessionForAttendance(session);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isRTL ? 'lg:pr-64 lg:pl-0' : 'lg:pl-64'}`}>
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickPayment={() => handleOpenPayment()}
          onOpenQuickPlayer={() => handleOpenNewPlayer()}
          onOpenQuickSession={() => handleOpenNewSession()}
          onOpenQuickParent={() => handleOpenNewParent()}
          onNavigateToSettings={() => setActiveTab('settings')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Active View Dispatcher */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenQuickPayment={handleOpenPayment}
              onOpenQuickPlayer={handleOpenNewPlayer}
              onOpenQuickAttendance={() => setActiveTab('attendance')}
              onOpenReceipt={handleOpenReceipt}
            />
          )}

          {activeTab === 'players' && (
            <PlayersView
              onOpenNewPlayer={handleOpenNewPlayer}
              onEditPlayer={handleEditPlayer}
              onOpenPaymentForPlayer={handleOpenPayment}
              onOpenReceipt={handleOpenReceipt}
              preselectedPlayerId={selectedPlayerIdForView}
            />
          )}

          {activeTab === 'parents' && (
            <ParentsView
              onOpenNewParent={handleOpenNewParent}
              onEditParent={handleEditParent}
              onNavigateToPlayer={(pId) => handleNavigate('players', pId)}
              onOpenQuickPayment={handleOpenPayment}
              preselectedParentId={selectedParentIdForView}
            />
          )}

          {activeTab === 'teams' && (
            <TeamsView
              onOpenNewTeam={handleOpenNewTeam}
              onEditTeam={handleEditTeam}
              onNavigateToPlayer={(pId) => handleNavigate('players', pId)}
              onOpenQuickSession={handleOpenNewSession}
              preselectedTeamId={selectedTeamIdForView}
            />
          )}

          {activeTab === 'registrations' && (
            <RegistrationsView
              onNavigateToPlayer={(pId) => handleNavigate('players', pId)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              onOpenNewPayment={() => handleOpenPayment()}
              onOpenReceipt={handleOpenReceipt}
            />
          )}

          {activeTab === 'unpaid' && (
            <UnpaidView
              onOpenQuickPayment={handleOpenPayment}
              onNavigateToPlayer={(pId) => handleNavigate('players', pId)}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsView onOpenReceiptModal={handleOpenReceipt} />
          )}

          {activeTab === 'sessions' && (
            <SessionsView
              onOpenNewSession={() => handleOpenNewSession()}
              onOpenAttendanceSheet={handleOpenAttendance}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              onOpenAttendanceSheet={handleOpenAttendance}
              onNavigateToPlayer={(pId) => handleNavigate('players', pId)}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'users' && <UsersView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
        onSelectPaymentForReceipt={handleOpenReceipt}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        preselectedPlayerId={preselectedPlayerIdForPayment}
        onPaymentSuccess={(paymentId) => handleOpenReceipt(paymentId)}
      />

      <ReceiptViewModal
        paymentId={selectedPaymentIdForReceipt}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPaymentIdForReceipt(null);
        }}
      />

      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setPlayerToEdit(null);
        }}
        playerToEdit={playerToEdit}
      />

      <ParentModal
        isOpen={isParentModalOpen}
        onClose={() => {
          setIsParentModalOpen(false);
          setParentToEdit(null);
        }}
        parentToEdit={parentToEdit}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setTeamToEdit(null);
        }}
        teamToEdit={teamToEdit}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setPreselectedTeamIdForSession(undefined);
        }}
        preselectedTeamId={preselectedTeamIdForSession}
      />

      <AttendanceSheetModal
        session={selectedSessionForAttendance}
        onClose={() => setSelectedSessionForAttendance(null)}
      />

      {/* Toast feedback notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </AppProvider>
    </LanguageProvider>
  );
}
