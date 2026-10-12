import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  validatePaymentInput,
  validateAbsenceNotificationInput,
  validateParentMessageInput,
  hashPassword,
} from '../utils/security';
import {
  Player,
  Parent,
  Team,
  MembershipPlan,
  Registration,
  Payment,
  Receipt,
  TrainingSession,
  AttendanceRecord,
  User,
  AuditLog,
  AssociationSettings,
  PlayerFinancialSummary,
  UserRole,
  Announcement,
  AbsenceNotification,
  AbsenceReason,
  AbsenceNotificationStatus,
  ParentMessage,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_TEAMS,
  INITIAL_PARENTS,
  INITIAL_PLAYERS,
  INITIAL_PLANS,
  INITIAL_REGISTRATIONS,
  INITIAL_PAYMENTS,
  INITIAL_RECEIPTS,
  INITIAL_SESSIONS,
  INITIAL_ATTENDANCES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ABSENCE_NOTIFICATIONS,
  INITIAL_PARENT_MESSAGES,
} from '../data/seedData';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  message: string;
}

interface AppContextType {
  // Data
  settings: AssociationSettings;
  users: User[];
  currentUser: User;
  teams: Team[];
  parents: Parent[];
  players: Player[];
  plans: MembershipPlan[];
  registrations: Registration[];
  payments: Payment[];
  receipts: Receipt[];
  sessions: TrainingSession[];
  attendances: AttendanceRecord[];
  auditLogs: AuditLog[];
  announcements: Announcement[];
  absenceNotifications: AbsenceNotification[];
  parentMessages: ParentMessage[];
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;

  // User & Role Switching
  setCurrentUser: (user: User) => void;
  hasPermission: (module: string) => boolean;

  // CRUD Actions
  // Players
  addPlayer: (player: Omit<Player, 'id' | 'createdAt'>) => Player;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void; // Soft delete

  // Parents
  addParent: (parent: Omit<Parent, 'id' | 'createdAt'>) => Parent;
  updateParent: (id: string, updates: Partial<Parent>) => void;
  deleteParent: (id: string) => void;

  // Teams
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Team;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // Plans & Registrations
  addRegistration: (reg: Omit<Registration, 'id' | 'createdAt'>) => Registration;
  updateRegistration: (id: string, updates: Partial<Registration>) => void;
  updatePlan: (id: string, updates: Partial<MembershipPlan>) => void;

  // Payments & Receipts
  addPayment: (data: {
    playerId: string;
    parentId?: string;
    registrationId?: string;
    amount: number;
    date: string;
    period: string;
    method: Payment['method'];
    reference?: string;
    notes?: string;
  }) => Payment;
  generateReceipt: (paymentId: string) => Receipt;

  // Sport & Sessions
  addSession: (session: Omit<TrainingSession, 'id' | 'completed'>) => TrainingSession;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  saveAttendance: (sessionId: string, records: { playerId: string; status: AttendanceRecord['status']; notes?: string }[]) => void;

  // Settings & Users
  updateSettings: (updates: Partial<AssociationSettings>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  resetToSeedData: () => void;

  // Parent Portal & Club Communications
  addAbsenceNotification: (data: {
    parentId: string;
    playerId: string;
    sessionDate: string;
    sessionId?: string;
    reason: AbsenceReason;
    notes?: string;
  }) => { success: boolean; error?: string };
  updateAbsenceNotificationStatus: (
    id: string,
    status: AbsenceNotificationStatus,
    responseNote?: string
  ) => void;
  sendParentMessage: (data: {
    parentId: string;
    parentName: string;
    parentEmail?: string;
    parentPhone?: string;
    playerId?: string;
    subject: string;
    message: string;
  }) => { success: boolean; error?: string };
  updateParentMessageStatus: (
    id: string,
    status: 'Non lu' | 'Lu' | 'Répondu',
    response?: string
  ) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'authorName'>) => Announcement;
  deleteAnnouncement: (id: string) => void;
  createParentAccount: (
    parentId: string,
    email: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  resetParentPassword: (
    parentId: string
  ) => Promise<{ success: boolean; error?: string; tempPassword?: string }>;
  linkChildToParent: (playerId: string, parentId: string) => void;
  unlinkChildFromParent: (playerId: string) => void;

  // Parent Portal Relational Helpers (Strictly Scoped)
  getParentLinkedPlayers: (parentId: string) => Player[];
  getParentPayments: (parentId: string) => Payment[];
  getParentReceipts: (parentId: string) => Receipt[];
  getParentSessions: (parentId: string) => TrainingSession[];
  getParentAttendanceRecords: (parentId: string) => AttendanceRecord[];
  getParentAnnouncements: (parentId: string) => Announcement[];
  getParentAbsenceNotifications: (parentId: string) => AbsenceNotification[];
  getParentMessages: (parentId: string) => ParentMessage[];

  // Relational Helpers
  getPlayerFinancials: (playerId: string) => PlayerFinancialSummary;
  getParentFinancials: (parentId: string) => { expected: number; paid: number; remaining: number; childrenCount: number };
  getPlayerAttendanceStats: (playerId: string) => { totalSessions: number; attended: number; absent: number; excused: number; percentage: number };
  getTeamStats: (teamId: string) => { playersCount: number; expectedRevenue: number; collectedRevenue: number; unpaidRevenue: number; avgAttendanceRate: number };
  getOverduePlayers: () => OverduePlayerItem[];
  logExport: (type: 'FINANCES' | 'JOUEURS' | 'PARENTS' | 'IMPAYES', filename: string) => boolean;
}

export interface OverduePlayerItem {
  player: Player;
  parent?: Parent;
  team?: Team;
  remainingAmount: number;
  daysLate: number;
  lastPaymentDate?: string;
  registrationDate: string;
}

const STORAGE_KEY = 'maroc_football_academy_db_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if available
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.warn(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  };

  const [settings, setSettings] = useState<AssociationSettings>(() => loadState('settings', INITIAL_SETTINGS));
  const [users, setUsers] = useState<User[]>(() => {
    const list = loadState<User[]>('users', INITIAL_USERS);
    // Fusionner les comptes de base s'ils sont absents de la sauvegarde locale
    const existingEmails = new Set(list.map((u) => u.email?.toLowerCase()));
    const missing = INITIAL_USERS.filter((u) => !existingEmails.has(u.email?.toLowerCase()));
    if (missing.length > 0) {
      return [...list, ...missing];
    }
    return list;
  });
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const list = loadState<User[]>('users', INITIAL_USERS);
    return list[0] || INITIAL_USERS[0];
  });
  const [teams, setTeams] = useState<Team[]>(() => loadState('teams', INITIAL_TEAMS));
  const [parents, setParents] = useState<Parent[]>(() => {
    const list = loadState<Parent[]>('parents', INITIAL_PARENTS);
    // Assurer la liaison des tuteurs initiaux
    return list.map((p) => {
      if (p.id === 'par-1' && !p.userId) {
        return { ...p, userId: 'usr-par-1', accountStatus: 'Active' as const };
      }
      if (p.id === 'par-2' && !p.userId) {
        return { ...p, userId: 'usr-par-2', accountStatus: 'Active' as const };
      }
      return p;
    });
  });
  const [players, setPlayers] = useState<Player[]>(() => loadState('players', INITIAL_PLAYERS));
  const [plans, setPlans] = useState<MembershipPlan[]>(() => loadState('plans', INITIAL_PLANS));
  const [registrations, setRegistrations] = useState<Registration[]>(() => loadState('registrations', INITIAL_REGISTRATIONS));
  const [payments, setPayments] = useState<Payment[]>(() => loadState('payments', INITIAL_PAYMENTS));
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadState('receipts', INITIAL_RECEIPTS));
  const [sessions, setSessions] = useState<TrainingSession[]>(() => loadState('sessions', INITIAL_SESSIONS));
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => loadState('attendances', INITIAL_ATTENDANCES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadState('auditLogs', INITIAL_AUDIT_LOGS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadState('announcements', INITIAL_ANNOUNCEMENTS));
  const [absenceNotifications, setAbsenceNotifications] = useState<AbsenceNotification[]>(() => loadState('absenceNotifications', INITIAL_ABSENCE_NOTIFICATIONS));
  const [parentMessages, setParentMessages] = useState<ParentMessage[]>(() => loadState('parentMessages', INITIAL_PARENT_MESSAGES));
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persistent savers
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_teams`, JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_parents`, JSON.stringify(parents)); }, [parents]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(players)); }, [players]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_registrations`, JSON.stringify(registrations)); }, [registrations]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_receipts`, JSON.stringify(receipts)); }, [receipts]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_attendances`, JSON.stringify(attendances)); }, [attendances]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_announcements`, JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_absenceNotifications`, JSON.stringify(absenceNotifications)); }, [absenceNotifications]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_parentMessages`, JSON.stringify(parentMessages)); }, [parentMessages]);

  // Toast Helpers
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToasts((prev) => {
      // Prevent identical message from being stacked concurrently
      if (prev.some((t) => t.message === message)) {
        return prev;
      }
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setTimeout(() => {
        removeToast(id);
      }, 4000);
      return [...prev, { id, message, type }];
    });
  }, [removeToast]);

  // Audit logger
  const logAudit = (action: string, targetType: AuditLog['targetType'], targetId: string, description: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      targetType,
      targetId,
      description,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Permission Checker
  const hasPermission = (module: string): boolean => {
    const role = currentUser.role;
    if (role === 'SUPER_ADMIN') return true;

    if (role === 'PARENT') {
      return ['dashboard', 'parentPortal', 'children', 'schedule', 'payments', 'announcements', 'contact'].includes(module);
    }

    switch (module) {
      case 'dashboard':
        return true;
      case 'players':
      case 'parents':
        return ['ADMIN', 'COMPTABLE', 'ENTRAINEUR', 'STAFF'].includes(role);
      case 'teams':
        return ['ADMIN', 'ENTRAINEUR'].includes(role);
      case 'registrations':
        return ['ADMIN', 'STAFF'].includes(role);
      case 'plans':
        return ['ADMIN', 'COMPTABLE'].includes(role);
      case 'payments':
      case 'unpaid':
      case 'receipts':
        return ['ADMIN', 'COMPTABLE'].includes(role);
      case 'sessions':
      case 'attendance':
        return ['ADMIN', 'ENTRAINEUR'].includes(role);
      case 'reports':
        return ['ADMIN', 'COMPTABLE'].includes(role);
      case 'users':
      case 'settings':
        return role === 'ADMIN';
      case 'audit':
        return role === 'ADMIN' || role === 'COMPTABLE';
      default:
        return true;
    }
  };

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
  }, []);

  // -------------------------
  // RELATIONAL CALCULATIONS
  // -------------------------

  const getPlayerFinancials = (playerId: string): PlayerFinancialSummary => {
    const player = players.find((p) => p.id === playerId);
    if (!player) {
      return {
        expectedAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        status: 'PAYÉ',
        unpaidPeriodsCount: 0,
      };
    }

    // Calcul du montant prévu : d'abord via ses inscriptions actives/totales
    const playerRegs = registrations.filter((r) => r.playerId === playerId && r.status !== 'Annulée');
    let expected = playerRegs.reduce((sum, r) => sum + r.totalAmount, 0);

    // Si aucune inscription explicite, calcul basé sur la mensualité de son équipe x 10 mois (saison)
    if (expected === 0 && player.teamId) {
      const team = teams.find((t) => t.id === player.teamId);
      expected = (team?.monthlyFee || 300) * 10;
    }

    // Montants payés validés
    const validPayments = payments.filter((p) => p.playerId === playerId && p.status === 'Validé');
    const paid = validPayments.reduce((sum, p) => sum + p.amount, 0);

    const remaining = Math.max(0, expected - paid);

    let status: PlayerFinancialSummary['status'] = 'PAYÉ';
    if (remaining > 0 && paid > 0) {
      status = 'PARTIELLEMENT PAYÉ';
    } else if (remaining > 0 && paid === 0) {
      status = 'IMPAYÉ';
    }

    // Dernier paiement
    const sortedPayments = [...validPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastP = sortedPayments[0];

    // Estimation des périodes impayées (ex: 1 période = 1 mois équivalent d'après les frais de l'équipe)
    const team = teams.find((t) => t.id === player.teamId);
    const monthlyFee = team?.monthlyFee || 300;
    const unpaidPeriodsCount = remaining > 0 ? Math.ceil(remaining / monthlyFee) : 0;

    return {
      expectedAmount: expected,
      paidAmount: paid,
      remainingAmount: remaining,
      status,
      lastPaymentDate: lastP?.date,
      lastPaymentAmount: lastP?.amount,
      unpaidPeriodsCount,
    };
  };

  const getParentFinancials = (parentId: string) => {
    const children = players.filter((p) => p.parentId === parentId && !p.isDeleted);
    let expected = 0;
    let paid = 0;

    children.forEach((c) => {
      const fin = getPlayerFinancials(c.id);
      expected += fin.expectedAmount;
      paid += fin.paidAmount;
    });

    return {
      expected,
      paid,
      remaining: Math.max(0, expected - paid),
      childrenCount: children.length,
    };
  };

  const getPlayerAttendanceStats = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return { totalSessions: 0, attended: 0, absent: 0, excused: 0, percentage: 100 };

    // Toutes les séances complétées pour l'équipe du joueur
    const teamSessions = sessions.filter((s) => s.teamId === player.teamId && s.completed);
    const sessionIds = new Set(teamSessions.map((s) => s.id));

    const records = attendances.filter((a) => a.playerId === playerId && sessionIds.has(a.sessionId));
    const attended = records.filter((a) => a.status === 'Présent').length;
    const absent = records.filter((a) => a.status === 'Absent').length;
    const excused = records.filter((a) => a.status === 'Excusé').length;
    const total = teamSessions.length;

    const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

    return {
      totalSessions: total,
      attended,
      absent,
      excused,
      percentage,
    };
  };

  const getTeamStats = (teamId: string) => {
    const teamPlayers = players.filter((p) => p.teamId === teamId && !p.isDeleted && p.status === 'Actif');
    let expectedRevenue = 0;
    let collectedRevenue = 0;

    teamPlayers.forEach((p) => {
      const fin = getPlayerFinancials(p.id);
      expectedRevenue += fin.expectedAmount;
      collectedRevenue += fin.paidAmount;
    });

    const rates = teamPlayers.map((p) => getPlayerAttendanceStats(p.id).percentage);
    const avgAttendanceRate = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 100;

    return {
      playersCount: teamPlayers.length,
      expectedRevenue,
      collectedRevenue,
      unpaidRevenue: Math.max(0, expectedRevenue - collectedRevenue),
      avgAttendanceRate,
    };
  };

  const getOverduePlayers = (): OverduePlayerItem[] => {
    const today = new Date();
    const activePlayers = players.filter((p) => !p.isDeleted);
    const overdueList: OverduePlayerItem[] = [];

    activePlayers.forEach((player) => {
      const fin = getPlayerFinancials(player.id);
      if (fin.remainingAmount > 0) {
        let refDateStr = fin.lastPaymentDate;
        if (!refDateStr) {
          const reg = registrations.find((r) => r.playerId === player.id && r.status !== 'Annulée');
          refDateStr = reg?.startDate || reg?.registrationDate || player.registrationDate;
        }

        if (refDateStr) {
          const refDate = new Date(refDateStr);
          const diffMs = today.getTime() - refDate.getTime();
          const daysLate = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

          if (daysLate > 30) {
            const parent = parents.find((pr) => pr.id === player.parentId);
            const team = teams.find((t) => t.id === player.teamId);
            overdueList.push({
              player,
              parent,
              team,
              remainingAmount: fin.remainingAmount,
              daysLate,
              lastPaymentDate: fin.lastPaymentDate,
              registrationDate: player.registrationDate,
            });
          }
        }
      }
    });

    return overdueList.sort((a, b) => b.daysLate - a.daysLate);
  };

  // -------------------------
  // CRUD IMPLEMENTATIONS
  // -------------------------

  // PLAYERS
  const addPlayer = (data: Omit<Player, 'id' | 'createdAt'>): Player => {
    const newId = `ply-${Date.now().toString().slice(-5)}`;
    const newPlayer: Player = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setPlayers((prev) => [newPlayer, ...prev]);

    // Créer automatiquement une inscription standard si non présente
    const team = teams.find((t) => t.id === data.teamId);
    const fee = (team?.monthlyFee || 300) * 10;
    const newReg: Registration = {
      id: `reg-${Date.now().toString().slice(-5)}`,
      playerId: newId,
      parentId: data.parentId,
      teamId: data.teamId,
      registrationDate: data.registrationDate || new Date().toISOString().split('T')[0],
      startDate: `${new Date().getFullYear()}-09-01`,
      endDate: `${new Date().getFullYear() + 1}-06-30`,
      planFrequency: 'Annuelle',
      totalAmount: fee,
      status: 'Active',
      season: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      createdAt: new Date().toISOString(),
    };
    setRegistrations((prev) => [newReg, ...prev]);

    logAudit('CREATION_JOUEUR', 'JOUEUR', newId, `${currentUser.name} a inscrit le joueur ${data.firstName} ${data.lastName}.`);
    showToast(`Joueur ${data.firstName} ${data.lastName} ajouté avec succès`);
    return newPlayer;
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    // Si l'utilisateur est un entraîneur, vérifier qu'il ne modifie que les joueurs de son équipe
    if (currentUser.role === 'ENTRAINEUR') {
      const existing = players.find((p) => p.id === id);
      if (existing && existing.teamId !== currentUser.assignedTeamId) {
        showToast("Accès refusé : vous ne pouvez modifier que les joueurs de votre équipe.", 'error');
        logAudit('REFUS_ACCES', 'JOUEUR', id, `${currentUser.name} (ENTRAÎNEUR) a tenté de modifier le joueur ${id} hors de son équipe assignée.`);
        return;
      }
    }

    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    const updated = players.find((p) => p.id === id);
    logAudit('MODIFICATION_JOUEUR', 'JOUEUR', id, `${currentUser.name} a modifié les informations de ${updated?.firstName || ''} ${updated?.lastName || ''}.`);
    showToast('Fiche joueur mise à jour');
  };

  const deletePlayer = (id: string) => {
    // Seuls SUPER_ADMIN et ADMIN peuvent archiver/supprimer un joueur
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Action refusée : seuls les administrateurs peuvent archiver ou supprimer un joueur.", 'error');
      logAudit('REFUS_ACCES', 'JOUEUR', id, `${currentUser.name} (${currentUser.role}) a tenté de supprimer le joueur ${id} sans autorisation.`);
      return;
    }

    const p = players.find((pl) => pl.id === id);
    setPlayers((prev) =>
      prev.map((pl) => (pl.id === id ? { ...pl, isDeleted: true, status: 'Ancien' } : pl))
    );
    logAudit('SUPPRESSION_JOUEUR', 'JOUEUR', id, `${currentUser.name} a archivé le joueur ${p?.firstName || ''} ${p?.lastName || ''}.`);
    showToast('Joueur archivé avec succès', 'info');
  };

  // PARENTS
  const addParent = (data: Omit<Parent, 'id' | 'createdAt'>): Parent => {
    const newId = `par-${Date.now().toString().slice(-5)}`;
    const newParent: Parent = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setParents((prev) => [newParent, ...prev]);
    logAudit('CREATION_PARENT', 'PARENT', newId, `${currentUser.name} a créé la fiche parent de ${data.firstName} ${data.lastName}.`);
    showToast(`Parent ${data.firstName} ${data.lastName} enregistré avec succès`);
    return newParent;
  };

  const updateParent = (id: string, updates: Partial<Parent>) => {
    setParents((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    const updated = parents.find((p) => p.id === id);
    logAudit('MODIFICATION_PARENT', 'PARENT', id, `${currentUser.name} a mis à jour les coordonnées de ${updated?.firstName} ${updated?.lastName}.`);
    showToast('Fiche parent mise à jour');
  };

  const deleteParent = (id: string) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Action refusée : seuls les administrateurs peuvent archiver un parent.", 'error');
      logAudit('REFUS_ACCES', 'PARENT', id, `${currentUser.name} (${currentUser.role}) a tenté d'archiver un parent sans droit.`);
      return;
    }
    const par = parents.find((p) => p.id === id);
    setParents((prev) => prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p)));
    logAudit('SUPPRESSION_PARENT', 'PARENT', id, `${currentUser.name} a archivé la fiche parent de ${par?.firstName} ${par?.lastName}.`);
    showToast('Parent archivé');
  };

  // TEAMS
  const addTeam = (data: Omit<Team, 'id' | 'createdAt'>): Team => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Action refusée : seuls les administrateurs peuvent créer une équipe.", 'error');
      logAudit('REFUS_ACCES', 'EQUIPE', '', `${currentUser.name} (${currentUser.role}) a tenté de créer une équipe.`);
      throw new Error("Opération non autorisée.");
    }
    const newId = `team-${Date.now().toString().slice(-5)}`;
    const newTeam: Team = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setTeams((prev) => [...prev, newTeam]);
    logAudit('CREATION_EQUIPE', 'EQUIPE', newId, `${currentUser.name} a créé l'équipe ${data.name} (${data.category}).`);
    showToast(`Équipe ${data.name} créée`);
    return newTeam;
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Action refusée : seuls les administrateurs peuvent modifier les paramètres d'une équipe.", 'error');
      logAudit('REFUS_ACCES', 'EQUIPE', id, `${currentUser.name} (${currentUser.role}) a tenté de modifier l'équipe ${id}.`);
      return;
    }
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Informations de l\'équipe enregistrées');
  };

  const deleteTeam = (id: string) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Action refusée : seuls les administrateurs peuvent supprimer une équipe.", 'error');
      logAudit('REFUS_ACCES', 'EQUIPE', id, `${currentUser.name} (${currentUser.role}) a tenté de supprimer l'équipe ${id}.`);
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== id));
    showToast('Équipe supprimée', 'info');
  };

  // REGISTRATIONS
  const addRegistration = (data: Omit<Registration, 'id' | 'createdAt'>): Registration => {
    const newId = `reg-${Date.now().toString().slice(-5)}`;
    const newReg: Registration = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setRegistrations((prev) => [newReg, ...prev]);
    const pl = players.find((p) => p.id === data.playerId);
    logAudit('NOUVELLE_INSCRIPTION', 'INSCRIPTION', newId, `${currentUser.name} a enregistré une adhésion de ${data.totalAmount} DH pour ${pl?.firstName} ${pl?.lastName}.`);
    showToast('Inscription validée avec succès');
    return newReg;
  };

  const updateRegistration = (id: string, updates: Partial<Registration>) => {
    setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    showToast('Inscription mise à jour');
  };

  const updatePlan = (id: string, updates: Partial<MembershipPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Tarification de la cotisation mise à jour');
  };

  // PAYMENTS & RECEIPTS
  const addPayment = (data: {
    playerId: string;
    parentId?: string;
    registrationId?: string;
    amount: number;
    date: string;
    period: string;
    method: Payment['method'];
    reference?: string;
    notes?: string;
  }): Payment => {
    // 1. Contrôle d'autorisation RBAC strict
    if (!['SUPER_ADMIN', 'ADMIN', 'COMPTABLE'].includes(currentUser.role)) {
      showToast("Accès refusé : vous n'avez pas l'autorisation d'enregistrer des paiements.", 'error');
      logAudit('REFUS_ACCES', 'PAIEMENT', data.playerId, `${currentUser.name} (${currentUser.role}) a tenté d'enregistrer un paiement sans droit financier.`);
      throw new Error("Opération non autorisée.");
    }

    // 2. Validation stricte des entrées financières
    const validation = validatePaymentInput({
      amount: data.amount,
      date: data.date,
      method: data.method,
      playerId: data.playerId,
    });

    if (!validation.isValid) {
      showToast(validation.error || 'Données financières invalides', 'error');
      throw new Error(validation.error || 'Données invalides');
    }

    // 3. Prévention des soumissions en doublon (dans les 60 dernières secondes)
    const isDuplicate = payments.some(
      (p) =>
        p.playerId === data.playerId &&
        Math.abs(p.amount - Number(data.amount)) < 0.001 &&
        p.period === data.period &&
        p.date === data.date &&
        Date.now() - new Date(p.createdAt).getTime() < 60000
    );

    if (isDuplicate) {
      showToast("Paiement identique déjà enregistré récemment pour cette période.", 'warning');
      const existing = payments.find((p) => p.playerId === data.playerId && p.period === data.period);
      if (existing) return existing;
    }

    const player = players.find((p) => p.id === data.playerId);
    const parentId = data.parentId || player?.parentId || '';

    // Génération du numéro unique séquentiel protégé contre les collisions
    const year = new Date().getFullYear();
    const maxNum = payments.reduce((max, p) => {
      const match = p.paymentNumber?.match(/PAY-\d+-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const paymentNumber = `PAY-${year}-${String(maxNum + 1).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      paymentNumber,
      playerId: data.playerId,
      parentId,
      registrationId: data.registrationId,
      amount: Math.round(Number(data.amount) * 100) / 100, // Arrondi à 2 décimales
      date: data.date,
      period: data.period,
      method: data.method,
      reference: data.reference ? String(data.reference).trim() : '',
      status: 'Validé',
      notes: data.notes ? String(data.notes).trim() : '',
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);
    logAudit(
      'ENREGISTREMENT_PAIEMENT',
      'PAIEMENT',
      newPayment.id,
      `${currentUser.name} a enregistré un paiement de ${newPayment.amount} DH pour ${player?.firstName || ''} ${player?.lastName || ''} (${paymentNumber}).`
    );
    showToast(`Paiement de ${newPayment.amount} DH validé (#${paymentNumber})`);
    return newPayment;
  };

  const generateReceipt = (paymentId: string): Receipt => {
    // 1. Contrôle d'autorisation RBAC
    if (!['SUPER_ADMIN', 'ADMIN', 'COMPTABLE'].includes(currentUser.role)) {
      showToast("Accès refusé : seuls les comptables et administrateurs peuvent émettre des reçus.", 'error');
      logAudit('REFUS_ACCES', 'RECU', paymentId, `${currentUser.name} (${currentUser.role}) a tenté d'émettre un reçu sans droit.`);
      throw new Error("Opération non autorisée.");
    }

    // Vérifier si un reçu existe déjà pour ce paiement (idempotence)
    const existing = receipts.find((r) => r.paymentId === paymentId);
    if (existing) {
      return existing;
    }

    const year = new Date().getFullYear();
    const maxNum = receipts.reduce((max, r) => {
      const match = r.receiptNumber?.match(/REC-\d+-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const receiptNumber = `REC-${year}-${String(maxNum + 1).padStart(4, '0')}`;

    const newReceipt: Receipt = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber,
      paymentId,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser.name,
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    const pay = payments.find((p) => p.id === paymentId);
    const par = parents.find((pr) => pr.id === pay?.parentId);
    logAudit(
      'GENERATION_RECU',
      'RECU',
      newReceipt.id,
      `${currentUser.name} a émis le reçu officiel #${receiptNumber} au nom de ${par?.firstName || ''} ${par?.lastName || ''}.`
    );
    showToast(`Reçu #${receiptNumber} généré`);
    return newReceipt;
  };

  // SPORT & ATTENDANCE
  const addSession = (data: Omit<TrainingSession, 'id' | 'completed'>): TrainingSession => {
    if (currentUser.role === 'ENTRAINEUR' && data.teamId !== currentUser.assignedTeamId) {
      showToast("Accès refusé : vous ne pouvez planifier que pour votre équipe assignée.", 'error');
      logAudit('REFUS_ACCES', 'EQUIPE', data.teamId, `${currentUser.name} (ENTRAÎNEUR) a tenté de planifier une séance pour l'équipe ${data.teamId}.`);
      throw new Error("Opération non autorisée.");
    }

    const newSession: TrainingSession = {
      ...data,
      id: `ses-${Date.now()}`,
      completed: false,
    };
    setSessions((prev) => [newSession, ...prev]);
    showToast('Séance d\'entraînement programmée');
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<TrainingSession>) => {
    if (currentUser.role === 'ENTRAINEUR') {
      const s = sessions.find((se) => se.id === id);
      if (s && s.teamId !== currentUser.assignedTeamId) {
        showToast("Accès refusé : vous ne pouvez modifier que les séances de votre équipe.", 'error');
        logAudit('REFUS_ACCES', 'EQUIPE', s.teamId, `${currentUser.name} (ENTRAÎNEUR) a tenté de modifier la séance ${id} d'une autre équipe.`);
        return;
      }
    }
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Séance mise à jour');
  };

  const saveAttendance = (sessionId: string, records: { playerId: string; status: AttendanceRecord['status']; notes?: string }[]) => {
    const s = sessions.find((se) => se.id === sessionId);
    if (currentUser.role === 'ENTRAINEUR' && s && s.teamId !== currentUser.assignedTeamId) {
      showToast("Accès refusé : vous ne pouvez enregistrer l'appel que pour votre équipe.", 'error');
      logAudit('REFUS_ACCES', 'PRESENCE', sessionId, `${currentUser.name} (ENTRAÎNEUR) a tenté de marquer l'appel de l'équipe ${s.teamId}.`);
      return;
    }

    // Remplacer les présences de cette séance
    setAttendances((prev) => {
      const filtered = prev.filter((a) => a.sessionId !== sessionId);
      const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
        id: `att-${sessionId}-${idx}-${Date.now()}`,
        sessionId,
        playerId: r.playerId,
        status: r.status,
        notes: r.notes,
      }));
      return [...filtered, ...newRecords];
    });

    // Marquer la séance comme complétée
    setSessions((prev) => prev.map((se) => (se.id === sessionId ? { ...se, completed: true } : se)));

    const team = teams.find((t) => t.id === s?.teamId);
    logAudit('MARQUAGE_PRESENCES', 'PRESENCE', sessionId, `${currentUser.name} a enregistré la présence pour l'équipe ${team?.name || ''} (${s?.date || ''}).`);
    showToast('Feuille de présence validée');
  };

  // SETTINGS & USERS
  const updateSettings = (updates: Partial<AssociationSettings>) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Action refusée : seuls les administrateurs peuvent modifier les paramètres.", 'error');
      logAudit('REFUS_ACCES', 'PARAMETRES', 'settings', `${currentUser.name} (${currentUser.role}) a tenté de modifier les paramètres.`);
      return;
    }
    setSettings((prev) => ({ ...prev, ...updates }));
    logAudit('MODIFICATION_PARAMETRES', 'PARAMETRES', 'settings', `${currentUser.name} a mis à jour les paramètres de l'association.`);
    showToast('Paramètres de l\'association enregistrés');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Accès refusé : seuls les administrateurs peuvent créer des utilisateurs.", 'error');
      logAudit('REFUS_ACCES', 'UTILISATEUR', '', `${currentUser.name} (${currentUser.role}) a tenté de créer un utilisateur.`);
      throw new Error("Opération non autorisée.");
    }
    if (userData.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      showToast("Accès refusé : seul un Super Admin peut créer un compte Super Admin.", 'error');
      logAudit('REFUS_ACCES', 'UTILISATEUR', '', `${currentUser.name} (ADMIN) a tenté de créer un Super Admin.`);
      throw new Error("Opération non autorisée.");
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('CREATION_UTILISATEUR', 'UTILISATEUR', newUser.id, `${currentUser.name} a créé le compte collaborateur de ${userData.name} (${userData.role}).`);
    showToast(`Utilisateur ${userData.name} ajouté`);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    // 1. Interdiction stricte de modifier son propre rôle (anti-élévation de privilèges)
    if (id === currentUser.id && updates.role && updates.role !== currentUser.role) {
      showToast("Action interdite : vous ne pouvez pas modifier votre propre rôle.", 'error');
      logAudit('REFUS_ACCES', 'UTILISATEUR', id, `${currentUser.name} a tenté d'élever son propre rôle (${currentUser.role} -> ${updates.role}).`);
      return;
    }

    // 2. Interdiction de s'auto-désactiver
    if (id === currentUser.id && updates.active === false) {
      showToast("Action interdite : vous ne pouvez pas désactiver votre propre compte.", 'error');
      return;
    }

    // 3. Vérification des privilèges administrateur
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      showToast("Accès refusé : gestion des utilisateurs réservée aux administrateurs.", 'error');
      logAudit('REFUS_ACCES', 'UTILISATEUR', id, `${currentUser.name} (${currentUser.role}) a tenté de modifier l'utilisateur ${id}.`);
      return;
    }

    const targetUser = users.find((u) => u.id === id);

    // 4. Un ADMIN ne peut pas modifier un SUPER_ADMIN
    if (targetUser?.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      showToast("Accès refusé : seul un Super Admin peut modifier un compte Super Admin.", 'error');
      logAudit('REFUS_ACCES', 'UTILISATEUR', id, `${currentUser.name} (ADMIN) a tenté de modifier le Super Admin ${targetUser.name}.`);
      return;
    }

    // 5. Un ADMIN ne peut pas promouvoir un utilisateur en SUPER_ADMIN
    if (updates.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      showToast("Accès refusé : seul le Super Admin peut attribuer le rôle Super Admin.", 'error');
      logAudit('REFUS_ACCES', 'UTILISATEUR', id, `${currentUser.name} (ADMIN) a tenté de promouvoir ${targetUser?.name} en Super Admin.`);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logAudit('MODIFICATION_UTILISATEUR', 'UTILISATEUR', id, `${currentUser.name} a mis à jour les informations du compte ${targetUser?.name || id}.`);
    showToast('Utilisateur mis à jour');
  };

  const logExport = (type: 'FINANCES' | 'JOUEURS' | 'PARENTS' | 'IMPAYES', filename: string): boolean => {
    if (!['SUPER_ADMIN', 'ADMIN', 'COMPTABLE'].includes(currentUser.role)) {
      showToast("Accès refusé : vous n'avez pas l'autorisation d'exporter des données.", 'error');
      logAudit('REFUS_ACCES', 'PARAMETRES', type, `${currentUser.name} (${currentUser.role}) a tenté d'exporter des données sensibles (${type}).`);
      return false;
    }
    logAudit('EXPORT_DONNEES', 'PARAMETRES', type, `${currentUser.name} (${currentUser.role}) a exporté le fichier ${filename}.`);
    return true;
  };

  const resetToSeedData = () => {
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setTeams(INITIAL_TEAMS);
    setParents(INITIAL_PARENTS);
    setPlayers(INITIAL_PLAYERS);
    setPlans(INITIAL_PLANS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setPayments(INITIAL_PAYMENTS);
    setReceipts(INITIAL_RECEIPTS);
    setSessions(INITIAL_SESSIONS);
    setAttendances(INITIAL_ATTENDANCES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAbsenceNotifications(INITIAL_ABSENCE_NOTIFICATIONS);
    setParentMessages(INITIAL_PARENT_MESSAGES);
    localStorage.clear();
    showToast('Données de démonstration réinitialisées avec succès', 'info');
  };

  // ==========================================
  // PORTAIL PARENTS & ACTIONS LIÉES
  // ==========================================

  const addAbsenceNotification = (data: {
    parentId: string;
    playerId: string;
    sessionDate: string;
    sessionId?: string;
    reason: AbsenceReason;
    notes?: string;
  }): { success: boolean; error?: string } => {
    const validation = validateAbsenceNotificationInput(data);
    if (!validation.isValid) {
      showToast(validation.error || 'Erreur de saisie.', 'error');
      return { success: false, error: validation.error };
    }

    // Security check: Verify that the child actually belongs to this parent (Anti-IDOR)
    const child = players.find((p) => p.id === data.playerId && !p.isDeleted);
    if (!child || child.parentId !== data.parentId) {
      showToast('Accès refusé : cet enfant n’est pas associé à votre compte parent.', 'error');
      logAudit('ALERTE_IDOR', 'PARAMETRES', data.playerId, `Tentative d'enregistrement d'absence pour un joueur non associé au parent ${data.parentId}.`);
      return { success: false, error: 'Accès refusé : enfant non associé.' };
    }

    const newNotification: AbsenceNotification = {
      id: `abs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      parentId: data.parentId,
      playerId: data.playerId,
      sessionDate: data.sessionDate,
      sessionId: data.sessionId,
      reason: data.reason,
      notes: data.notes?.trim(),
      status: 'En attente',
      createdAt: new Date().toISOString(),
    };

    setAbsenceNotifications((prev) => [newNotification, ...prev]);
    logAudit('NOTIFICATION_ABSENCE', 'PRESENCE', newNotification.id, `Absence signalée pour ${child.firstName} ${child.lastName} le ${data.sessionDate} (${data.reason}).`);
    showToast('Notification d’absence transmise aux entraîneurs et à l’administration.', 'success');
    return { success: true };
  };

  const updateAbsenceNotificationStatus = (
    id: string,
    status: AbsenceNotificationStatus,
    responseNote?: string
  ) => {
    setAbsenceNotifications((prev) =>
      prev.map((notif) => {
        if (notif.id === id) {
          return {
            ...notif,
            status,
            responseNote: responseNote !== undefined ? responseNote : notif.responseNote,
            reviewedBy: currentUser.name,
            reviewedAt: new Date().toISOString(),
          };
        }
        return notif;
      })
    );
    showToast(`Statut de l'absence mis à jour : ${status}`, 'success');
  };

  const sendParentMessage = (data: {
    parentId: string;
    parentName: string;
    parentEmail?: string;
    parentPhone?: string;
    playerId?: string;
    subject: string;
    message: string;
  }): { success: boolean; error?: string } => {
    const validation = validateParentMessageInput(data);
    if (!validation.isValid) {
      showToast(validation.error || 'Erreur de saisie.', 'error');
      return { success: false, error: validation.error };
    }

    const newMsg: ParentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      parentId: data.parentId,
      parentName: data.parentName,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone,
      playerId: data.playerId,
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: 'Non lu',
      createdAt: new Date().toISOString(),
    };

    setParentMessages((prev) => [newMsg, ...prev]);
    showToast('Votre message a bien été transmis au secrétariat de l’association.', 'success');
    return { success: true };
  };

  const updateParentMessageStatus = (
    id: string,
    status: 'Non lu' | 'Lu' | 'Répondu',
    response?: string
  ) => {
    setParentMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          return {
            ...msg,
            status,
            response: response !== undefined ? response : msg.response,
            respondedAt: response ? new Date().toISOString() : msg.respondedAt,
          };
        }
        return msg;
      })
    );
    showToast('Statut du message mis à jour', 'info');
  };

  const addAnnouncement = (
    announcement: Omit<Announcement, 'id' | 'createdAt' | 'authorName'>
  ): Announcement => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...announcement,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    showToast('Nouvelle annonce publiée avec succès', 'success');
    logAudit('PUBLICATION_ANNONCE', 'PARAMETRES', newAnn.id, `Annonce publiée : ${newAnn.title}`);
    return newAnn;
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast('Annonce supprimée', 'info');
  };

  const createParentAccount = async (
    parentId: string,
    email: string,
    password = 'Atlas2026!'
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const targetParent = parents.find((p) => p.id === parentId);
    if (!targetParent) {
      return { success: false, error: 'Parent introuvable.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Adresse email invalide.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
    }

    const newUser: User = {
      id: `usr-parent-${Date.now()}`,
      name: `${targetParent.firstName} ${targetParent.lastName}`,
      email: cleanEmail,
      password: password,
      role: 'PARENT',
      parentId: targetParent.id,
      phone: targetParent.phone,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setParents((prev) =>
      prev.map((p) =>
        p.id === parentId
          ? { ...p, accountStatus: 'Active', userId: newUser.id, email: cleanEmail }
          : p
      )
    );

    logAudit(
      'CREATION_COMPTE_PARENT',
      'UTILISATEUR',
      newUser.id,
      `Compte parent créé pour ${targetParent.firstName} ${targetParent.lastName} (${cleanEmail}).`
    );
    showToast(`Compte parent créé avec succès pour ${targetParent.firstName} ${targetParent.lastName}`, 'success');
    return { success: true, user: newUser };
  };

  const resetParentPassword = async (
    parentId: string
  ): Promise<{ success: boolean; error?: string; tempPassword?: string }> => {
    const parent = parents.find((p) => p.id === parentId);
    if (!parent) return { success: false, error: 'Parent introuvable' };

    const parentUser = users.find(
      (u) => u.parentId === parentId || (parent.email && u.email.toLowerCase() === parent.email.toLowerCase())
    );
    if (!parentUser) {
      return { success: false, error: 'Aucun compte utilisateur actif associé à ce parent.' };
    }

    const tempPassword = 'Atlas2026!';
    setUsers((prev) =>
      prev.map((u) => (u.id === parentUser.id ? { ...u, password: tempPassword } : u))
    );

    logAudit('REINITIALISATION_MDP_PARENT', 'UTILISATEUR', parentUser.id, `Mot de passe réinitialisé pour le compte parent ${parentUser.email}`);
    showToast(`Mot de passe réinitialisé pour ${parent.firstName} ${parent.lastName} (Mot de passe temporaire : ${tempPassword})`, 'success');
    return { success: true, tempPassword };
  };

  const linkChildToParent = (playerId: string, parentId: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, parentId } : p))
    );
    logAudit('LIAISON_ENFANT_PARENT', 'JOUEUR', playerId, `Joueur ${playerId} lié au parent ${parentId}.`);
    showToast('Enfant associé au parent avec succès', 'success');
  };

  const unlinkChildFromParent = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, parentId: '' } : p))
    );
    logAudit('DISSOCIATION_ENFANT_PARENT', 'JOUEUR', playerId, `Joueur ${playerId} dissocié de son parent.`);
    showToast('Liaison parent-enfant retirée', 'info');
  };

  // Scoped Accessors (Anti-IDOR)
  const getParentLinkedPlayers = useCallback((parentId: string): Player[] => {
    if (!parentId) return [];
    return players.filter((p) => !p.isDeleted && p.parentId === parentId);
  }, [players]);

  const getParentPayments = useCallback((parentId: string): Payment[] => {
    if (!parentId) return [];
    const linkedPlayerIds = new Set(players.filter((p) => !p.isDeleted && p.parentId === parentId).map((p) => p.id));
    return payments.filter((pay) => pay.parentId === parentId || linkedPlayerIds.has(pay.playerId));
  }, [payments, players]);

  const getParentReceipts = useCallback((parentId: string): Receipt[] => {
    if (!parentId) return [];
    const parentPaymentIds = new Set(getParentPayments(parentId).map((p) => p.id));
    return receipts.filter((rec) => parentPaymentIds.has(rec.paymentId));
  }, [getParentPayments, receipts]);

  const getParentSessions = useCallback((parentId: string): TrainingSession[] => {
    if (!parentId) return [];
    const childrenTeams = new Set(players.filter((p) => !p.isDeleted && p.parentId === parentId).map((p) => p.teamId));
    return sessions.filter((s) => childrenTeams.has(s.teamId));
  }, [players, sessions]);

  const getParentAttendanceRecords = useCallback((parentId: string): AttendanceRecord[] => {
    if (!parentId) return [];
    const childrenIds = new Set(players.filter((p) => !p.isDeleted && p.parentId === parentId).map((p) => p.id));
    return attendances.filter((att) => childrenIds.has(att.playerId));
  }, [attendances, players]);

  const getParentAnnouncements = useCallback((parentId: string): Announcement[] => {
    if (!parentId) return announcements.filter((a) => !a.teamId);
    const childrenTeams = new Set(players.filter((p) => !p.isDeleted && p.parentId === parentId).map((p) => p.teamId));
    return announcements.filter((a) => !a.teamId || childrenTeams.has(a.teamId));
  }, [announcements, players]);

  const getParentAbsenceNotifications = useCallback((parentId: string): AbsenceNotification[] => {
    if (!parentId) return [];
    return absenceNotifications.filter((n) => n.parentId === parentId);
  }, [absenceNotifications]);

  const getParentMessages = useCallback((parentId: string): ParentMessage[] => {
    if (!parentId) return [];
    return parentMessages.filter((m) => m.parentId === parentId);
  }, [parentMessages]);

  return (
    <AppContext.Provider
      value={{
        settings,
        users,
        currentUser,
        teams,
        parents,
        players,
        plans,
        registrations,
        payments,
        receipts,
        sessions,
        attendances,
        auditLogs,
        announcements,
        absenceNotifications,
        parentMessages,
        toasts,
        showToast,
        removeToast,
        setCurrentUser,
        hasPermission,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addParent,
        updateParent,
        deleteParent,
        addTeam,
        updateTeam,
        deleteTeam,
        addRegistration,
        updateRegistration,
        updatePlan,
        addPayment,
        generateReceipt,
        addSession,
        updateSession,
        saveAttendance,
        updateSettings,
        addUser,
        updateUser,
        resetToSeedData,
        addAbsenceNotification,
        updateAbsenceNotificationStatus,
        sendParentMessage,
        updateParentMessageStatus,
        addAnnouncement,
        deleteAnnouncement,
        createParentAccount,
        resetParentPassword,
        linkChildToParent,
        unlinkChildFromParent,
        getParentLinkedPlayers,
        getParentPayments,
        getParentReceipts,
        getParentSessions,
        getParentAttendanceRecords,
        getParentAnnouncements,
        getParentAbsenceNotifications,
        getParentMessages,
        getPlayerFinancials,
        getParentFinancials,
        getPlayerAttendanceStats,
        getTeamStats,
        getOverduePlayers,
        logExport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
};
