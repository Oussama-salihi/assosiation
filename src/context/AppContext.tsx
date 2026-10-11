import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    const updated = players.find((p) => p.id === id);
    logAudit('MODIFICATION_JOUEUR', 'JOUEUR', id, `${currentUser.name} a modifié les informations de ${updated?.firstName || ''} ${updated?.lastName || ''}.`);
    showToast('Fiche joueur mise à jour');
  };

  const deletePlayer = (id: string) => {
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
    const par = parents.find((p) => p.id === id);
    setParents((prev) => prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p)));
    logAudit('SUPPRESSION_PARENT', 'PARENT', id, `${currentUser.name} a archivé la fiche parent de ${par?.firstName} ${par?.lastName}.`);
    showToast('Parent archivé');
  };

  // TEAMS
  const addTeam = (data: Omit<Team, 'id' | 'createdAt'>): Team => {
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
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Informations de l\'équipe enregistrées');
  };

  const deleteTeam = (id: string) => {
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
    const player = players.find((p) => p.id === data.playerId);
    const parentId = data.parentId || player?.parentId || '';

    // Génération du numéro unique séquentiel
    const year = new Date().getFullYear();
    const count = payments.length + 1;
    const paymentNumber = `PAY-${year}-${String(count).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      playerId: data.playerId,
      parentId,
      registrationId: data.registrationId,
      amount: Number(data.amount),
      date: data.date,
      period: data.period,
      method: data.method,
      reference: data.reference || '',
      status: 'Validé',
      notes: data.notes || '',
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);
    logAudit(
      'ENREGISTREMENT_PAIEMENT',
      'PAIEMENT',
      newPayment.id,
      `${currentUser.name} a enregistré un paiement de ${newPayment.amount} DH pour ${player?.firstName} ${player?.lastName} (${paymentNumber}).`
    );
    showToast(`Paiement de ${newPayment.amount} DH validé (#${paymentNumber})`);
    return newPayment;
  };

  const generateReceipt = (paymentId: string): Receipt => {
    // Vérifier si un reçu existe déjà pour ce paiement
    const existing = receipts.find((r) => r.paymentId === paymentId);
    if (existing) {
      return existing;
    }

    const year = new Date().getFullYear();
    const count = receipts.length + 1;
    const receiptNumber = `REC-${year}-${String(count).padStart(4, '0')}`;

    const newReceipt: Receipt = {
      id: `rec-${Date.now()}`,
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
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Séance mise à jour');
  };

  const saveAttendance = (sessionId: string, records: { playerId: string; status: AttendanceRecord['status']; notes?: string }[]) => {
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
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, completed: true } : s)));

    const s = sessions.find((se) => se.id === sessionId);
    const team = teams.find((t) => t.id === s?.teamId);
    logAudit('MARQUAGE_PRESENCES', 'PRESENCE', sessionId, `${currentUser.name} a enregistré la présence pour l'équipe ${team?.name || ''} (${s?.date || ''}).`);
    showToast('Feuille de présence validée');
  };

  // SETTINGS & USERS
  const updateSettings = (updates: Partial<AssociationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    logAudit('MODIFICATION_PARAMETRES', 'PARAMETRES', 'settings', `${currentUser.name} a mis à jour les paramètres de l'association.`);
    showToast('Paramètres de l\'association enregistrés');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`Utilisateur ${userData.name} ajouté`);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    showToast('Utilisateur mis à jour');
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
