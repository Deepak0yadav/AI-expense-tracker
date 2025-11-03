import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithCredential } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Ensure pending auth sessions are completed
WebBrowser.maybeCompleteAuthSession();

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
        // Native: Use Expo AuthSession to get an ID token and sign in to Firebase
        const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
        if (!androidClientId) {
          throw new Error('Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in your env. See README for setup.');
        }

  const redirectUri = AuthSession.makeRedirectUri();
        const discovery = {
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        } as const;

        const request = new AuthSession.AuthRequest({
          clientId: androidClientId,
          redirectUri,
          responseType: AuthSession.ResponseType.IdToken,
          scopes: ['openid', 'profile', 'email'],
          extraParams: {
            // A random string for OIDC nonces; improves security
            nonce: Math.random().toString(36).slice(2),
          },
        });

        await request.makeAuthUrlAsync(discovery);
  const result = await request.promptAsync(discovery);

        if (result.type !== 'success') {
          throw new Error(result.type === 'dismiss' ? 'Google Sign-In canceled' : 'Google Sign-In failed');
        }

        const idToken = result.params.id_token as string | undefined;
        if (!idToken) throw new Error('No id_token received from Google');

        const credential = GoogleAuthProvider.credential(idToken);
        const credResult = await signInWithCredential(auth, credential);
        return credResult.user;
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
