/**
 * Utilitaires de sécurité applicative
 * Association Sportive Atlas Football
 */

import { UserRole, PaymentMethod } from '../types';

/**
 * 1. Protection contre l'injection de formules CSV (CWE-1236)
 * Neutralise les caractères dangereux (=, +, -, @, \t, \r) au début des cellules
 */
export function sanitizeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.length === 0) return '';

  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some((char) => str.startsWith(char))) {
    // Préfixer avec une apostrophe simple pour forcer Excel/Calc à interpréter en texte brut
    return `'${str}`;
  }
  return str;
}

/**
 * 2. Hash cryptographique sécurisé pour mots de passe (SHA-256 avec sel fixe d'application)
 * Utilise la Web Crypto API native du navigateur
 */
const PASSWORD_SALT = 'AS_ATLAS_FOOT_SECURE_SALT_2026_';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${PASSWORD_SALT}${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === expectedHash;
}

/**
 * 3. Validation stricte des données financières
 */
export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
}

export const VALID_PAYMENT_METHODS: PaymentMethod[] = [
  'Espèces',
  'Virement bancaire',
  'Chèque',
  'Carte bancaire',
  'Autre',
];

export function validatePaymentInput(data: {
  amount: number;
  date: string;
  method: PaymentMethod;
  playerId: string;
}): PaymentValidationResult {
  if (!data.playerId || typeof data.playerId !== 'string' || data.playerId.trim() === '') {
    return { isValid: false, error: 'Identifiant du joueur obligatoire.' };
  }

  const amt = Number(data.amount);
  if (isNaN(amt) || !isFinite(amt)) {
    return { isValid: false, error: 'Le montant doit être une valeur numérique valide.' };
  }

  if (amt <= 0) {
    return { isValid: false, error: 'Le montant du paiement doit être strictement supérieur à 0 DH.' };
  }

  if (amt > 50000) {
    return { isValid: false, error: 'Le montant dépasse le seuil maximal autorisé (50 000 DH).' };
  }

  // Vérifier format de date YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) {
    return { isValid: false, error: 'Format de date invalide (JJ/MM/AAAA attendu).' };
  }

  const paymentDate = new Date(data.date);
  if (isNaN(paymentDate.getTime())) {
    return { isValid: false, error: 'Date de paiement non valide.' };
  }

  // Empêcher les dates futures aberrantes (> 30 jours dans le futur)
  const maxFuture = new Date();
  maxFuture.setDate(maxFuture.getDate() + 30);
  if (paymentDate > maxFuture) {
    return { isValid: false, error: 'La date de paiement ne peut pas dépasser 30 jours dans le futur.' };
  }

  if (!VALID_PAYMENT_METHODS.includes(data.method)) {
    return { isValid: false, error: 'Mode de paiement non autorisé.' };
  }

  return { isValid: true };
}

/**
 * 4. Protection Anti Brute-Force & Verrouillage Temporaire
 */
export interface LoginAttemptTracker {
  attempts: number;
  lockoutUntil: number | null;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const loginAttemptsMap = new Map<string, LoginAttemptTracker>();

export function checkLoginRateLimit(identifier: string): { isAllowed: boolean; remainingLockoutSeconds?: number } {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttemptsMap.get(key);

  if (!record) {
    return { isAllowed: true };
  }

  if (record.lockoutUntil && record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { isAllowed: false, remainingLockoutSeconds: remainingSeconds };
  }

  // Le verrouillage a expiré
  if (record.lockoutUntil && record.lockoutUntil <= now) {
    loginAttemptsMap.delete(key);
    return { isAllowed: true };
  }

  return { isAllowed: true };
}

export function recordFailedLoginAttempt(identifier: string): { locked: boolean; attemptsLeft: number } {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttemptsMap.get(key) || { attempts: 0, lockoutUntil: null };

  record.attempts += 1;

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    loginAttemptsMap.set(key, record);
    return { locked: true, attemptsLeft: 0 };
  }

  loginAttemptsMap.set(key, record);
  return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - record.attempts };
}

export function resetLoginAttempts(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  loginAttemptsMap.delete(key);
}

/**
 * 5. Gestion de session sécurisée (Expiration et Inactivité)
 */
export interface SecureSessionData {
  userId: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
}

const MAX_SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 heures maximum
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;   // 2 heures d'inactivité

export function createSecureSession(userId: string): SecureSessionData {
  const now = Date.now();
  return {
    userId,
    createdAt: now,
    lastActiveAt: now,
    expiresAt: now + MAX_SESSION_DURATION_MS,
  };
}

export function isSessionValid(session: SecureSessionData | null): boolean {
  if (!session || typeof session !== 'object') return false;
  if (!session.userId || typeof session.userId !== 'string') return false;
  if (!session.expiresAt || typeof session.expiresAt !== 'number') return false;
  if (!session.lastActiveAt || typeof session.lastActiveAt !== 'number') return false;

  const now = Date.now();

  // Expiration absolue
  if (now > session.expiresAt) return false;

  // Expiration par inactivité
  if (now - session.lastActiveAt > INACTIVITY_TIMEOUT_MS) return false;

  return true;
}

/**
 * 6. Matrice des autorisations de contrôle d'accès basée sur les rôles (RBAC)
 */
export const ROLE_PERMISSIONS: Record<UserRole, {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageFinancials: boolean; // Paiements, impayés, reçus
  canManageAllTeams: boolean;
  canManageAllPlayers: boolean;
  canDeleteEntities: boolean;
  canExportData: boolean;
  canViewAuditLogs: boolean;
}> = {
  SUPER_ADMIN: {
    canManageUsers: true,
    canManageSettings: true,
    canManageFinancials: true,
    canManageAllTeams: true,
    canManageAllPlayers: true,
    canDeleteEntities: true,
    canExportData: true,
    canViewAuditLogs: true,
  },
  ADMIN: {
    canManageUsers: true,
    canManageSettings: true,
    canManageFinancials: true,
    canManageAllTeams: true,
    canManageAllPlayers: true,
    canDeleteEntities: true,
    canExportData: true,
    canViewAuditLogs: true,
  },
  COMPTABLE: {
    canManageUsers: false,
    canManageSettings: false,
    canManageFinancials: true,
    canManageAllTeams: false,
    canManageAllPlayers: false,
    canDeleteEntities: false,
    canExportData: true,
    canViewAuditLogs: true,
  },
  ENTRAINEUR: {
    canManageUsers: false,
    canManageSettings: false,
    canManageFinancials: false,
    canManageAllTeams: false,
    canManageAllPlayers: false, // Seulement son équipe assignée
    canDeleteEntities: false,
    canExportData: false,
    canViewAuditLogs: false,
  },
  STAFF: {
    canManageUsers: false,
    canManageSettings: false,
    canManageFinancials: false,
    canManageAllTeams: false,
    canManageAllPlayers: false,
    canDeleteEntities: false,
    canExportData: false,
    canViewAuditLogs: false,
  },
  PARENT: {
    canManageUsers: false,
    canManageSettings: false,
    canManageFinancials: false,
    canManageAllTeams: false,
    canManageAllPlayers: false,
    canDeleteEntities: false,
    canExportData: false,
    canViewAuditLogs: false,
  },
};

/**
 * 7. Sécurité & Contrôle d'accès Portail Parents (Anti-IDOR)
 */
export function canParentAccessChild(
  parentRecordId: string | undefined,
  targetPlayerParentId: string | undefined
): boolean {
  if (!parentRecordId || !targetPlayerParentId) return false;
  return parentRecordId.trim() === targetPlayerParentId.trim();
}

export function validateAbsenceNotificationInput(data: {
  parentId?: string;
  playerId?: string;
  sessionDate?: string;
  reason?: string;
}): { isValid: boolean; error?: string } {
  if (!data.parentId || typeof data.parentId !== 'string' || data.parentId.trim() === '') {
    return { isValid: false, error: 'Identifiant parent obligatoire.' };
  }
  if (!data.playerId || typeof data.playerId !== 'string' || data.playerId.trim() === '') {
    return { isValid: false, error: 'Veuillez sélectionner l’enfant concerné.' };
  }
  if (!data.sessionDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.sessionDate)) {
    return { isValid: false, error: 'Date de séance invalide (format AAAA-MM-JJ attendu).' };
  }
  if (!data.reason || typeof data.reason !== 'string' || data.reason.trim() === '') {
    return { isValid: false, error: 'Veuillez préciser le motif de l’absence.' };
  }
  return { isValid: true };
}

export function validateParentMessageInput(data: {
  parentId?: string;
  subject?: string;
  message?: string;
}): { isValid: boolean; error?: string } {
  if (!data.parentId || typeof data.parentId !== 'string') {
    return { isValid: false, error: 'Identifiant parent obligatoire.' };
  }
  if (!data.subject || data.subject.trim().length < 3) {
    return { isValid: false, error: 'Le sujet du message doit comporter au moins 3 caractères.' };
  }
  if (!data.message || data.message.trim().length < 5) {
    return { isValid: false, error: 'Le message doit comporter au moins 5 caractères.' };
  }
  return { isValid: true };
}

