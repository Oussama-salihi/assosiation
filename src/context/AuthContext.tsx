import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '../types';
import { useApp } from './AppContext';
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '../services/firebaseAuth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setCurrentUser: setAppCurrentUser, showToast } = useApp();
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Stable ref tracking the processed user session ID to decouple notifications from re-renders
  const processedSessionNotificationRef = useRef<string | null>(auth.currentUser?.id || null);

  // Centralized onAuthStateChanged listener at the root of AuthProvider with proper unsubscribe cleanup
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user) {
        setAppCurrentUser(user);
      } else {
        // Reset the processed notification session on auth transition to logged out
        processedSessionNotificationRef.current = null;
      }
      setIsLoading(false);
    });

    // Cleanup: properly unsubscribes when unmounting or during React StrictMode remount cycles
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setAppCurrentUser]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsAuthenticating(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Mettre à jour l'état de l'application immédiatement avec le profil résolu
      setCurrentUser(user);
      setAppCurrentUser(user);

      // Decouple toast notification from re-renders:
      // Verify that this specific user session transition has not already been processed
      if (processedSessionNotificationRef.current !== user.id) {
        processedSessionNotificationRef.current = user.id;
        const roleLabel =
          user.role === 'PARENT'
            ? 'Espace Parent'
            : user.role === 'SUPER_ADMIN'
            ? 'Super Administrateur'
            : user.role === 'ADMIN'
            ? 'Administrateur'
            : user.role === 'COMPTABLE'
            ? 'Comptabilité'
            : user.role === 'ENTRAINEUR'
            ? 'Entraîneur'
            : 'Staff';
        showToast(`Connecté avec succès : ${user.name} (${roleLabel})`, 'info');
      }

      return { success: true, user };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Identifiants ou mot de passe incorrects.';
      return { success: false, error: message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    // Reset processed session notification ref on logout
    processedSessionNotificationRef.current = null;
    await signOut(auth);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: `Un lien de réinitialisation sécurisé a été envoyé à ${email}. (Mot de passe temporaire : Atlas2026!)`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Aucun compte associé à cette adresse email.';
      return {
        success: false,
        message,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        isAuthenticating,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
