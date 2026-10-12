import { User, Parent } from '../types';
import { INITIAL_USERS, INITIAL_PARENTS } from '../data/seedData';
import {
  hashPassword,
  verifyPassword,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginAttempts,
  createSecureSession,
  isSessionValid,
  SecureSessionData,
} from '../utils/security';

export interface AuthInstance {
  currentUser: User | null;
}

const AUTH_STORAGE_KEY = 'as_atlas_auth_session_data_v2';
const LEGACY_AUTH_STORAGE_KEY = 'as_atlas_auth_session_user_id';
const USERS_STORAGE_KEY = 'maroc_football_academy_db_v1_users';

type AuthStateCallback = (user: User | null) => void;

/**
 * Nettoie les données sensibles d'un utilisateur avant exposition au client
 */
export function sanitizeUser(user: User): User {
  const sanitized = { ...user };
  delete sanitized.password;
  return sanitized;
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
}

class FirebaseAuthService {
  private listeners: Set<AuthStateCallback> = new Set();
  private _currentUser: User | null = null;
  private isInitialized = false;

  constructor() {
    this.restoreSession();
  }

  private getUsers(): User[] {
    try {
      const stored = safeGetItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Fusionner les comptes initiaux manquants (notamment les comptes parents préconfigurés)
          const existingEmails = new Set(parsed.map((u: User) => u.email?.toLowerCase()));
          const existingIds = new Set(parsed.map((u: User) => u.id));
          let needsUpdate = false;
          const merged = [...parsed];

          for (const initialUser of INITIAL_USERS) {
            if (!existingEmails.has(initialUser.email.toLowerCase()) && !existingIds.has(initialUser.id)) {
              merged.push(initialUser);
              needsUpdate = true;
            }
          }

          if (needsUpdate) {
            safeSetItem(USERS_STORAGE_KEY, JSON.stringify(merged));
          }
          return merged;
        }
      }
    } catch (e) {
      console.warn('Error reading stored users:', e);
    }
    return INITIAL_USERS;
  }

  private restoreSession() {
    try {
      // 1. Lire la session v2 sécurisée avec horodatage d'expiration
      const savedSessionRaw = safeGetItem(AUTH_STORAGE_KEY);
      let session: SecureSessionData | null = null;

      if (savedSessionRaw) {
        try {
          session = JSON.parse(savedSessionRaw);
        } catch {
          session = null;
        }
      } else {
        // Migration rétrocompatible éventuelle depuis legacy
        const legacyUserId = safeGetItem(LEGACY_AUTH_STORAGE_KEY);
        if (legacyUserId) {
          session = createSecureSession(legacyUserId);
          safeRemoveItem(LEGACY_AUTH_STORAGE_KEY);
          safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        }
      }

      if (session && isSessionValid(session)) {
        const users = this.getUsers();
        const found = users.find((u) => u.id === session!.userId && u.active);
        if (found) {
          // Mettre à jour lastActiveAt
          session.lastActiveAt = Date.now();
          safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          this._currentUser = sanitizeUser(found);
        } else {
          // Utilisateur introuvable ou désactivé
          this.clearSession();
        }
      } else if (session && !isSessionValid(session)) {
        // Session expirée
        this.clearSession();
      } else {
        this._currentUser = null;
      }
    } catch (e) {
      console.warn('Error restoring session:', e);
      this._currentUser = null;
    } finally {
      this.isInitialized = true;
    }
  }

  private clearSession() {
    this._currentUser = null;
    safeRemoveItem(AUTH_STORAGE_KEY);
    safeRemoveItem(LEGACY_AUTH_STORAGE_KEY);
  }

  get currentUser(): User | null {
    if (!this.isInitialized) {
      this.restoreSession();
    } else if (this._currentUser) {
      // Vérifier si la session n'a pas expiré entre-temps
      const savedSessionRaw = safeGetItem(AUTH_STORAGE_KEY);
      if (savedSessionRaw) {
        try {
          const session: SecureSessionData = JSON.parse(savedSessionRaw);
          if (!isSessionValid(session)) {
            this.clearSession();
            this.notifyListeners();
          } else {
            // Prolonger l'activité
            session.lastActiveAt = Date.now();
            safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          }
        } catch {
          this.clearSession();
        }
      }
    }
    return this._currentUser;
  }

  /**
   * Registers an authentication listener that fires when the user's auth state changes.
   * Returns a cleanup unsubscribe function: const unsubscribe = onAuthStateChanged(auth, callback);
   */
  onAuthStateChanged(callback: AuthStateCallback): () => void {
    this.listeners.add(callback);

    // Initial async notification to listener upon subscription
    Promise.resolve().then(() => {
      if (this.listeners.has(callback)) {
        callback(this._currentUser);
      }
    });

    // Cleanup function that unregisters the listener
    return () => {
      this.listeners.delete(callback);
    };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<{ user: User }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Vérification Anti-Brute-Force
    const rateLimit = checkLoginRateLimit(cleanEmail);
    if (!rateLimit.isAllowed) {
      const minutes = Math.ceil((rateLimit.remainingLockoutSeconds || 60) / 60);
      throw new Error(
        `Compte temporairement verrouillé suite à de multiples tentatives erronées. Veuillez réessayer dans ${minutes} minute(s).`
      );
    }

    const users = this.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    // Si non trouvé par email utilisateur direct, vérifier si l'email correspond au contact d'un tuteur/parent
    if (!user) {
      try {
        const storedParentsRaw = safeGetItem('maroc_football_academy_db_v1_parents');
        const parentsList: Parent[] = storedParentsRaw ? JSON.parse(storedParentsRaw) : INITIAL_PARENTS;
        if (Array.isArray(parentsList)) {
          const matchedParent = parentsList.find(
            (p) => p.email && p.email.toLowerCase() === cleanEmail
          );
          if (matchedParent) {
            user = users.find(
              (u) => u.id === matchedParent.userId || (matchedParent.id && u.parentId === matchedParent.id)
            );
          }
        }
      } catch {
        // Ignorer l'erreur de recherche secondaire
      }
    }

    if (!user) {
      recordFailedLoginAttempt(cleanEmail);
      throw new Error('Identifiant ou mot de passe incorrect.');
    }

    if (!user.active) {
      throw new Error("Ce compte utilisateur a été désactivé par l'administrateur.");
    }

    // 2. Vérification sécurisée du mot de passe (gestion hash et défaut 'Atlas2026!')
    let isPasswordCorrect = false;
    const defaultPassword = 'Atlas2026!';
    const defaultHash = await hashPassword(defaultPassword);

    if (user.password) {
      if (user.password.length === 64) {
        // C'est un hash SHA-256
        isPasswordCorrect = await verifyPassword(password, user.password);
      } else {
        // Mot de passe texte ou mot de passe par défaut
        isPasswordCorrect = password === user.password || password === defaultPassword;
      }
    } else {
      isPasswordCorrect = password === defaultPassword;
    }

    if (!isPasswordCorrect) {
      const failure = recordFailedLoginAttempt(cleanEmail);
      if (failure.locked) {
        throw new Error(
          'Trop de tentatives infructueuses. Votre compte a été temporairement verrouillé pour 15 minutes.'
        );
      }
      throw new Error(
        `Mot de passe incorrect. Il vous reste ${failure.attemptsLeft} tentative(s) avant verrouillage.`
      );
    }

    // Réinitialiser les tentatives après succès
    resetLoginAttempts(cleanEmail);

    // 3. Création de session sécurisée avec TTL
    const session = createSecureSession(user.id);
    safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    // Assainir l'utilisateur avant de l'assigner à currentUser
    const sanitized = sanitizeUser(user);
    this._currentUser = sanitized;
    this.notifyListeners();

    return { user: sanitized };
  }

  async signOut(): Promise<void> {
    this.clearSession();
    this.notifyListeners();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Aucun compte associé à cette adresse email.');
    }
  }

  private notifyListeners() {
    for (const callback of this.listeners) {
      try {
        callback(this._currentUser);
      } catch (err) {
        console.error('Error in onAuthStateChanged listener:', err);
      }
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();

export const auth: AuthInstance = {
  get currentUser() {
    return firebaseAuthService.currentUser;
  },
};

/**
 * Firebase Authentication onAuthStateChanged listener.
 * Returns the unsubscribe cleanup function.
 */
export function onAuthStateChanged(
  _auth: AuthInstance,
  callback: (user: User | null) => void
): () => void {
  return firebaseAuthService.onAuthStateChanged(callback);
}

export async function signInWithEmailAndPassword(
  _auth: AuthInstance,
  email: string,
  password: string
): Promise<{ user: User }> {
  return firebaseAuthService.signInWithEmailAndPassword(email, password);
}

export async function signOut(_auth: AuthInstance): Promise<void> {
  return firebaseAuthService.signOut();
}

export async function sendPasswordResetEmail(
  _auth: AuthInstance,
  email: string
): Promise<void> {
  return firebaseAuthService.sendPasswordResetEmail(email);
}
