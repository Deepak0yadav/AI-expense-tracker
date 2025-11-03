import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Platform } from 'react-native';

type AuthContextType = {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOutUser: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  // Handle redirect result for Google Sign-In on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      getRedirectResult(auth).catch((error) => {
        console.error('Google redirect error:', error);
      });
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    initializing,
    async signIn(email, password) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    },
    async signUp(email, password) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return cred.user;
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      
      if (Platform.OS === 'web') {
        // Use popup on web for better UX
        try {
          const result = await signInWithPopup(auth, provider);
          return result.user;
        } catch (error: any) {
          // Fallback to redirect if popup is blocked
          if (error.code === 'auth/popup-blocked') {
            await signInWithRedirect(auth, provider);
            throw new Error('Redirecting to Google...');
          }
          throw error;
        }
      } else {
        // For mobile, we'd use @react-native-google-signin/google-signin
        // For now, throw error prompting user to use email/password
        throw new Error('Google Sign-In on mobile requires additional setup. Please use email/password.');
      }
    },
    async signOutUser() {
      await signOut(auth);
    },
    async getIdToken() {
      const u = auth.currentUser;
      if (!u) return null;
      return await u.getIdToken();
    },
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
