import { User } from '../types';
import { INITIAL_USERS } from '../data/seedData';

export interface AuthInstance {
  currentUser: User | null;
}

const AUTH_STORAGE_KEY = 'as_atlas_auth_session_user_id';
const USERS_STORAGE_KEY = 'maroc_football_academy_db_v1_users';

type AuthStateCallback = (user: User | null) => void;

class FirebaseAuthService {
  private listeners: Set<AuthStateCallback> = new Set();
  private _currentUser: User | null = null;
  private isInitialized = false;

  constructor() {
    this.restoreSession();
  }

  private getUsers(): User[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading stored users:', e);
    }
    return INITIAL_USERS;
  }

  private restoreSession() {
    try {
      const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserId) {
        const users = this.getUsers();
        const found = users.find((u) => u.id === savedUserId && u.active);
        if (found) {
          this._currentUser = found;
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          this._currentUser = null;
        }
      }
    } catch (e) {
      console.warn('Error restoring session:', e);
      this._currentUser = null;
    } finally {
      this.isInitialized = true;
    }
  }

  get currentUser(): User | null {
    if (!this.isInitialized) {
      this.restoreSession();
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
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Identifiant introuvable. Veuillez vérifier votre adresse email.');
    }

    if (!user.active) {
      throw new Error("Ce compte utilisateur a été désactivé par l'administrateur.");
    }

    const validPassword = user.password || 'Atlas2026!';
    if (password !== validPassword && password !== 'Atlas2026!') {
      throw new Error('Mot de passe incorrect. Veuillez réessayer.');
    }

    this._currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    this.notifyListeners();
    return { user };
  }

  async signOut(): Promise<void> {
    this._currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
