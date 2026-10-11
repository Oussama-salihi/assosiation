/**
 * Modèle de données relationnel normalisé
 * Association de Football au Maroc
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COMPTABLE' | 'ENTRAINEUR' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  assignedTeamId?: string; // Pour les entraîneurs
  active: boolean;
  createdAt: string;
}

export type PlayerStatus = 'Actif' | 'Inactif' | 'Suspendu' | 'Ancien';
export type Gender = 'Masculin' | 'Féminin';

export interface Player {
  id: string;
  photoUrl?: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  address: string;
  phone?: string;
  registrationDate: string; // YYYY-MM-DD
  teamId: string;
  status: PlayerStatus;
  notes?: string;
  parentId: string;
  jerseyNumber?: number;
  position?: string;
  createdAt: string;
  isDeleted?: boolean;
}

export type ParentRelation = 'Père' | 'Mère' | 'Tuteur légal' | 'Autre';

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  relation: ParentRelation;
  notes?: string;
  createdAt: string;
  isDeleted?: boolean;
}

export type TeamCategory = 'U7' | 'U9' | 'U11' | 'U13' | 'U15' | 'U17' | 'U19' | 'Senior';

export interface Team {
  id: string;
  name: string;
  category: TeamCategory;
  coachName: string;
  coachPhone?: string;
  trainingLocation: string;
  trainingDays: string[]; // e.g. ['Lundi', 'Mercredi', 'Vendredi']
  trainingTime: string; // e.g. '17:30 - 19:00'
  status: 'Active' | 'Inactive';
  monthlyFee: number; // Montant en DH
  notes?: string;
  createdAt: string;
}

export type RegistrationStatus = 'Active' | 'Expirée' | 'Annulée';
export type PlanFrequency = 'Mensuelle' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle';

export interface MembershipPlan {
  id: string;
  name: string;
  frequency: PlanFrequency;
  monthsCount: number;
  defaultDiscountPercent?: number;
  description: string;
}

export interface Registration {
  id: string;
  playerId: string;
  parentId: string;
  teamId: string;
  registrationDate: string;
  startDate: string;
  endDate: string;
  planFrequency: PlanFrequency;
  totalAmount: number; // Montant total prévu pour cette adhésion en DH
  status: RegistrationStatus;
  season: string; // e.g. '2026-2027'
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Espèces' | 'Virement bancaire' | 'Chèque' | 'Carte bancaire' | 'Autre';
export type PaymentStatus = 'Validé' | 'En attente' | 'Rejeté';

export interface Payment {
  id: string;
  paymentNumber: string; // ex: 'PAY-2026-0012'
  playerId: string;
  parentId: string;
  registrationId?: string;
  amount: number; // en DH
  date: string; // YYYY-MM-DD
  period: string; // ex: 'Octobre 2026' ou 'T1 2026'
  method: PaymentMethod;
  reference?: string; // ex: N° de chèque ou référence virement
  status: PaymentStatus;
  notes?: string;
  recordedBy: string; // Nom de l'utilisateur
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // ex: 'REC-2026-0045'
  paymentId: string;
  generatedAt: string;
  generatedBy: string;
}

export interface TrainingSession {
  id: string;
  teamId: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  coachName: string;
  notes?: string;
  completed: boolean;
}

export type AttendanceStatus = 'Présent' | 'Absent' | 'Excusé';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  playerId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: 'JOUEUR' | 'PARENT' | 'EQUIPE' | 'PAIEMENT' | 'RECU' | 'INSCRIPTION' | 'PRESENCE' | 'PARAMETRES' | 'UTILISATEUR';
  targetId?: string;
  description: string;
  timestamp: string;
}

export interface AssociationSettings {
  name: string;
  shortName: string;
  logoUrl: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  ice: string; // Identifiant Commun de l'Entreprise / Asso Maroc
  patente?: string;
  rib?: string;
  bankName?: string;
  currency: string; // 'DH' ou 'MAD'
  receiptFooterText: string;
  presidentName: string;
}

export type FinancialStatus = 'PAYÉ' | 'PARTIELLEMENT PAYÉ' | 'IMPAYÉ';

export interface PlayerFinancialSummary {
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FinancialStatus;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  unpaidPeriodsCount: number;
}
