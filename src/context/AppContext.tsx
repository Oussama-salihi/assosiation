import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { validatePaymentInput } from '../utils/security';
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
  const [users, setUsers] = useState<User[]>(() => loadState('users', INITIAL_USERS));
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const list = loadState('users', INITIAL_USERS);
    return list[0] || INITIAL_USERS[0];
  });
  const [teams, setTeams] = useState<Team[]>(() => loadState('teams', INITIAL_TEAMS));
  const [parents, setParents] = useState<Parent[]>(() => loadState('parents', INITIAL_PARENTS));
  const [players, setPlayers] = useState<Player[]>(() => loadState('players', INITIAL_PLAYERS));
  const [plans, setPlans] = useState<MembershipPlan[]>(() => loadState('plans', INITIAL_PLANS));
  const [registrations, setRegistrations] = useState<Registration[]>(() => loadState('registrations', INITIAL_REGISTRATIONS));
  const [payments, setPayments] = useState<Payment[]>(() => loadState('payments', INITIAL_PAYMENTS));
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadState('receipts', INITIAL_RECEIPTS));
  const [sessions, setSessions] = useState<TrainingSession[]>(() => loadState('sessions', INITIAL_SESSIONS));
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => loadState('attendances', INITIAL_ATTENDANCES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadState('auditLogs', INITIAL_AUDIT_LOGS));
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
    localStorage.clear();
    showToast('Données de démonstration réinitialisées avec succès', 'info');
  };

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
