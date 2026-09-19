import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import { saveUserToFirestore } from '../services/firestoreService';

export function getFirebaseAuthErrorMessage(err: any): string {
  if (!err) return 'Authentication failed. Please try again.';
  const message = err.message || '';
  const code = err.code || '';

  // If error has a direct human message without auth code prefix
  if (message && !message.includes('auth/') && !message.includes('Firebase:')) {
    return message;
  }

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-not-found':
      return 'Account not found. No registered account with this email exists.';
    case 'auth/wrong-password':
      return 'Wrong password. Please verify your password and try again.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please verify your email and password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access has been temporarily throttled. Please try again shortly.';
    case 'auth/network-request-failed':
      return 'Network communication issue. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in provider is disabled in Firebase console.';
    default:
      return message.replace(/^Firebase:\s*/, '') || 'Authentication failed. Please check your credentials.';
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    levelId?: string;
    school?: string;
    gradYear?: string;
  }) => Promise<User>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetCode?: string }>;
  resetPassword: (data: {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'student' | 'admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // Enforce compulsory registration: No auto-login without token
        setUser(null);
        return;
      }
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.warn('Auth session expired or invalid:', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = getAuthToken();
        if (!token) {
          try {
            // Attempt to restore user with UID
            setAuthToken(fbUser.uid);
            const res = await api.getCurrentUser();
            setUser(res.user);
          } catch {
            // If local token not found, user can still log in explicitly
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();
    let fbSuccess = false;

    // 1. Attempt Firebase Authentication
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      fbSuccess = true;
    } catch (fbErr: any) {
      console.info('Firebase Auth sign-in notice:', fbErr?.code || fbErr?.message);
    }

    // 2. Authenticate via application API backend (validates PBKDF2 hashed password)
    let res;
    try {
      res = await api.login(cleanEmail, password);
    } catch (apiErr: any) {
      throw new Error(apiErr?.message || 'Invalid email or password. Please verify and try again.');
    }

    setAuthToken(res.token);
    setUser(res.user);

    // If Firebase Auth sign-in wasn't previously done, attempt syncing with Firebase Auth in background
    if (!fbSuccess && auth) {
      try {
        const fbNew = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(fbNew.user, { displayName: res.user.name });
      } catch {
        // Best effort sync
      }
    }

    // 3. Ensure student profile exists in Firestore for Admin tracking
    saveUserToFirestore(res.user).catch(() => {});

    return res.user;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    levelId?: string;
    school?: string;
    gradYear?: string;
  }): Promise<User> => {
    const cleanEmail = data.email.trim().toLowerCase();
    let firebaseUid: string | undefined;

    // 1. Register with Firebase Authentication
    try {
      const fbCred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      firebaseUid = fbCred.user.uid;
      try {
        await updateProfile(fbCred.user, { displayName: data.name.trim() });
      } catch (profErr) {
        console.warn('Could not set displayName on Firebase Auth:', profErr);
      }
    } catch (fbErr: any) {
      console.info('Firebase Auth registration notice:', fbErr?.code || fbErr?.message);
      if (fbErr?.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login instead.');
      } else if (fbErr?.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters long.');
      } else if (fbErr?.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (fbErr?.code !== 'auth/operation-not-allowed') {
        throw new Error(getFirebaseAuthErrorMessage(fbErr));
      }
    }

    // 2. Register with application API backend (securely hashes password)
    const res = await api.register({
      ...data,
      name: data.name.trim(),
      email: cleanEmail,
      id: firebaseUid,
    });

    setAuthToken(res.token);
    setUser(res.user);

    // 3. Save student profile to Cloud Firestore `users` collection for Admin real-time tracking
    saveUserToFirestore(res.user).catch((err) => {
      console.warn('Could not sync user to Firestore:', err);
    });

    return res.user;
  };

  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Dispatch Firebase Auth password reset email if configured
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, cleanEmail);
        console.log('[Firebase Auth] Password reset email triggered for:', cleanEmail);
      }
    } catch (fbErr: any) {
      console.info('[Firebase Auth] reset notice:', fbErr?.code || fbErr?.message);
    }

    // 2. Request recovery code from backend
    return await api.forgotPassword(cleanEmail);
  };

  const resetPassword = async (data: {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword?: string;
  }) => {
    await api.resetPassword({
      ...data,
      email: data.email.trim().toLowerCase(),
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut notice:', err);
    }
    setAuthToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role: 'student' | 'admin') => {
    setLoading(true);
    try {
      const res = await api.switchDemoUser(role);
      setAuthToken(res.token);
      setUser(res.user);
      saveUserToFirestore(res.user).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveUserToFirestore(updatedUser).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        switchDemoRole,
        refreshProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

