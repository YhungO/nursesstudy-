import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, setAuthToken, getAuthToken, setStoredUser, getStoredUser } from '../services/api';
import {
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification,
  reload,
} from '../firebase';
import {
  saveUserToFirestore,
  getOrCreateUserProfile,
  getUserFromFirestore,
  updateEmailVerificationInFirestore,
} from '../services/firestoreService';
import type { User as FirebaseUser } from 'firebase/auth';

export type AuthStatus =
  | 'AUTH_INITIALIZING'
  | 'AUTHENTICATED'
  | 'AUTH_UNAUTHENTICATED'
  | 'EMAIL_VERIFICATION_REQUIRED'
  | 'AUTH_ERROR';

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number;
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const pwd = password || '';
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  const feedback: string[] = [];
  if (!hasMinLength) feedback.push('Password must contain at least 8 characters.');
  if (!hasUpper) feedback.push('Include at least one uppercase letter (A-Z).');
  if (!hasLower) feedback.push('Include at least one lowercase letter (a-z).');
  if (!hasNumber) feedback.push('Include at least one number (0-9).');
  if (!hasSpecial) feedback.push('Include at least one special character (!@#$%^&*...).');

  // Policy: min 8 characters, requires letters (upper or lower) and numbers
  const isValid = hasMinLength && (hasUpper || hasLower) && hasNumber;

  return {
    isValid,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    score,
    feedback,
  };
}

export function isProviderDisabledError(err: any): boolean {
  if (!err) return false;
  const code = typeof err === 'string' ? err : err.code || '';
  const message = typeof err === 'string' ? err : err.message || '';
  return (
    code === 'auth/operation-not-allowed' ||
    code === 'auth/configuration-not-found' ||
    message.includes('operation-not-allowed') ||
    message.includes('Email/Password sign-in is not enabled') ||
    message.includes('CONFIGURATION_NOT_FOUND')
  );
}

export function getFirebaseAuthErrorMessage(err: any): string {
  if (!err) return 'Authentication failed. Please try again.';
  const code = err.code || '';
  const message = err.message || '';

  if (isProviderDisabledError(err)) {
    return 'Email/Password sign-in is not enabled in the Firebase project.';
  }

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use a stronger password.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'The email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is currently disabled. Please enable Email/Password authentication in Firebase Console.';
    case 'auth/network-request-failed':
      return 'Network connection problem. Please check your internet connection and try again.';
    case 'auth/user-disabled':
      return 'This student account has been disabled. Please contact your administrator.';
    case 'auth/invalid-action-code':
      return 'This verification or password reset link is invalid or has already been used.';
    case 'auth/expired-action-code':
      return 'This link has expired. Please request a new link.';
    default:
      if (message.includes('auth/')) {
        return 'Authentication failed. Please check your credentials and try again.';
      }
      return message.replace(/^Firebase:\s*/, '') || 'Authentication failed. Please check your credentials.';
  }
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  authStatus: AuthStatus;
  loading: boolean;
  authError: string | null;
  isEmailVerified: boolean;
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
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyResetCode: (oobCode: string) => Promise<string>;
  confirmPasswordResetAction: (oobCode: string, newPassword: string) => Promise<void>;
  resetPassword: (data: {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword?: string;
  }) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUserVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'student' | 'admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check for cached user to prevent jarring flashes or premature login screens on reload
  const cachedUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const initialToken = typeof window !== 'undefined' ? getAuthToken() : null;

  const [user, setUser] = useState<User | null>(cachedUser);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    cachedUser && initialToken ? 'AUTHENTICATED' : 'AUTH_INITIALIZING'
  );
  const [authError, setAuthError] = useState<string | null>(null);

  // loading is strictly true during AUTH_INITIALIZING if we have no existing session
  const loading = authStatus === 'AUTH_INITIALIZING' && !user;

  // Primary single-source-of-truth observer: Firebase Authentication state
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted) return;

      if (fbUser) {
        setFirebaseUser(fbUser);
        setAuthToken(fbUser.uid, fbUser.email, fbUser.displayName);

        try {
          // Robust user profile retrieval separating auth from profile doc existence (Part 5)
          const profile = await getOrCreateUserProfile({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
          });

          if (isMounted) {
            setStoredUser(profile);
            setUser(profile);
            setAuthStatus('AUTHENTICATED');
            setAuthError(null);
          }
        } catch (err: any) {
          console.warn('[Auth] Error resolving user profile:', err);
          // Keep user authenticated even if profile retrieval threw
          if (isMounted) {
            const fallback: User = {
              id: fbUser.uid,
              name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Nursing Student'),
              email: fbUser.email || '',
              role: (fbUser.email === 'chigaemezuaugustine43@gmail.com' || fbUser.email === 'tiktokyhung@gmail.com') ? 'admin' : 'student',
              levelId: 'lvl-nd1',
              status: 'active',
              school: 'College of Nursing Sciences',
              gradYear: '2027',
              createdAt: new Date().toISOString(),
            };
            setStoredUser(fallback);
            setUser(fallback);
            setAuthStatus('AUTHENTICATED');
          }
        }
      } else {
        // No Firebase user authenticated
        setFirebaseUser(null);

        // Check if a valid session exists in storage
        const token = getAuthToken();
        const stored = getStoredUser();

        if (token) {
          try {
            // First check Firestore directly for the profile
            const firestoreUser = await getUserFromFirestore(token);
            if (isMounted && firestoreUser) {
              setStoredUser(firestoreUser);
              setUser(firestoreUser);
              setAuthStatus('AUTHENTICATED');
              return;
            }

            // Fallback: Check backend /api/auth/me
            const res = await api.getCurrentUser();
            if (isMounted && res?.user) {
              setStoredUser(res.user);
              setUser(res.user);
              setAuthStatus('AUTHENTICATED');
              return;
            }
          } catch {
            // Token invalid or expired
          }

          // If offline/delayed and stored profile matches token, keep user authenticated
          if (stored && stored.id === token) {
            if (isMounted) {
              setUser(stored);
              setAuthStatus('AUTHENTICATED');
              return;
            }
          }
        }

        if (isMounted) {
          setStoredUser(null);
          setAuthToken(null);
          setUser(null);
          setAuthStatus('AUTH_UNAUTHENTICATED');
        }
      }
    });

    // Fallback safety timeout in case of network freeze or offline indexeddb
    const fallbackTimer = setTimeout(() => {
      if (isMounted && authStatus === 'AUTH_INITIALIZING') {
        const token = getAuthToken();
        const stored = getStoredUser();
        if (token && stored) {
          setUser(stored);
          setAuthStatus('AUTHENTICATED');
        } else if (!token && !auth.currentUser) {
          setAuthStatus('AUTH_UNAUTHENTICATED');
        }
      }
    }, 4000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();
    setAuthError(null);

    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    let fbUser: FirebaseUser | null = null;
    let fbError: any = null;

    // 1. Primary authentication via Firebase Authentication
    try {
      const fbCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      fbUser = fbCred.user;
    } catch (err: any) {
      fbError = err;
      console.info('[Firebase Auth] Sign in error:', err?.code || err?.message);
    }

    // 2. If Firebase succeeded: load/sync user profile
    if (fbUser) {
      setFirebaseUser(fbUser);
      setAuthToken(fbUser.uid, fbUser.email, fbUser.displayName);

      const profile = await getOrCreateUserProfile({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
      });

      if (fbUser.emailVerified && !(profile as any).emailVerified) {
        (profile as any).emailVerified = true;
        updateEmailVerificationInFirestore(fbUser.uid, true).catch(() => {});
      }

      // Also notify backend server of active session
      api.syncUser(profile).catch(() => {});

      setStoredUser(profile);
      setUser(profile);
      setAuthStatus('AUTHENTICATED');
      return profile;
    }

    // 3. Fallback: If user had an existing account in backend with PBKDF2 before Firebase sync
    try {
      const res = await api.login(cleanEmail, password);
      if (res?.user) {
        // Attempt to create/link Firebase Auth user in background for future logins
        try {
          const fbNew = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          await updateProfile(fbNew.user, { displayName: res.user.name });
          res.user.id = fbNew.user.uid;
          saveUserToFirestore(res.user).catch(() => {});
        } catch {
          // Best effort sync
        }

        setAuthToken(res.user.id, res.user.email, res.user.name);
        setStoredUser(res.user);
        setUser(res.user);
        setAuthStatus('AUTHENTICATED');
        return res.user;
      }
    } catch {
      // Backend check also failed, surface original Firebase error
    }

    const message = getFirebaseAuthErrorMessage(fbError);
    setAuthError(message);
    throw new Error(message);
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
    const cleanName = data.name.trim();
    setAuthError(null);

    // 1. Validate the full name
    if (!cleanName) {
      throw new Error('Please enter your full name.');
    }

    // 2. Validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    // 3. Validate the nursing level
    if (!data.levelId) {
      throw new Error('Please select your nursing level.');
    }

    // 4. Validate the password policy
    const pwCheck = validatePasswordStrength(data.password);
    if (!pwCheck.hasMinLength) {
      throw new Error('Password must contain at least 8 characters.');
    }
    if (!pwCheck.isValid) {
      throw new Error(pwCheck.feedback[0] || 'Password does not meet security requirements.');
    }

    // 5. Confirm both passwords match
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    // 6. Create the Firebase Authentication account using email/password
    let fbUser: FirebaseUser;
    try {
      const fbCred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      fbUser = fbCred.user;
      await updateProfile(fbUser, { displayName: cleanName }).catch(() => {});

      // Dispatch Firebase email verification link immediately
      await sendEmailVerification(fbUser).catch((vErr) => {
        console.warn('[Firebase Auth] Verification email dispatch note:', vErr);
      });
    } catch (fbErr: any) {
      const message = getFirebaseAuthErrorMessage(fbErr);
      setAuthError(message);
      throw new Error(message);
    }

    // 7. Obtain the authenticated user's UID and build student profile
    const isAdminEmail = cleanEmail === 'chigaemezuaugustine43@gmail.com' || cleanEmail === 'tiktokyhung@gmail.com';
    const newProfile: User = {
      id: fbUser.uid,
      name: cleanName,
      email: cleanEmail,
      role: isAdminEmail ? 'admin' : 'student',
      levelId: data.levelId || 'lvl-nd1',
      status: 'active',
      school: (data.school && data.school.trim()) || 'College of Nursing Sciences',
      gradYear: (data.gradYear && data.gradYear.trim()) || '2027',
      createdAt: new Date().toISOString(),
    };
    (newProfile as any).emailVerified = fbUser.emailVerified || false;

    // 8. Create Firestore student profile using that UID (students/{uid} and users/{uid})
    await saveUserToFirestore(newProfile).catch((err) => {
      console.warn('[Firestore] Profile save notice:', err);
    });

    api.syncUser(newProfile).catch(() => {});

    // Update session state
    setFirebaseUser(fbUser);
    setAuthToken(fbUser.uid, cleanEmail, cleanName);
    setStoredUser(newProfile);
    setUser(newProfile);
    setAuthStatus('AUTHENTICATED');

    return newProfile;
  };

  /**
   * Password Reset Flow (Part 9, 10, 11, 12):
   * Dispatches genuine Firebase password reset email with secure action link.
   * Never generates fake 6-digit verification codes.
   */
  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }

    setAuthError(null);

    try {
      // Send Firebase password reset email
      const actionCodeSettings = typeof window !== 'undefined' ? {
        url: window.location.origin,
        handleCodeInApp: true,
      } : undefined;

      try {
        if (actionCodeSettings) {
          await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
        } else {
          await sendPasswordResetEmail(auth, cleanEmail);
        }
      } catch (subErr: any) {
        // Fallback without actionCodeSettings if authorized domain restriction hits
        if (subErr?.code === 'auth/unauthorized-continue-uri' || subErr?.code === 'auth/invalid-continue-uri') {
          await sendPasswordResetEmail(auth, cleanEmail);
        } else {
          throw subErr;
        }
      }

      // Best effort notification to backend for users with legacy accounts
      api.forgotPassword(cleanEmail).catch(() => {});
    } catch (fbErr: any) {
      const code = fbErr?.code || '';
      // Account enumeration protection: if user is not found, treat gracefully
      if (code === 'auth/user-not-found') {
        return {
          success: true,
          message:
            'If an account exists for this email address, a password reset link has been dispatched. Please check your inbox, spam, promotions, or junk folder.',
        };
      }
      if (code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      if (code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please wait a few moments before trying again.');
      }
      if (code === 'auth/network-request-failed') {
        throw new Error('Network communication issue. Please check your internet connection.');
      }
      throw new Error(getFirebaseAuthErrorMessage(fbErr));
    }

    return {
      success: true,
      message:
        'A secure password reset link has been dispatched to your email. Please check your Inbox, Spam, Junk, or Promotions folder. Click the link to choose your new password.',
    };
  };

  // Verify an action code received from Firebase reset email (Part 12)
  const verifyResetCode = async (oobCode: string): Promise<string> => {
    if (!oobCode) {
      throw new Error('Invalid or missing password reset action code.');
    }
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      return email;
    } catch (err: any) {
      throw new Error(getFirebaseAuthErrorMessage(err));
    }
  };

  // Confirm new password using Firebase action code
  const confirmPasswordResetAction = async (oobCode: string, newPassword: string): Promise<void> => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (err: any) {
      throw new Error(getFirebaseAuthErrorMessage(err));
    }
  };

  // Legacy resetPassword interface for backwards compatibility if called with backend code
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

  const isEmailVerified = Boolean(firebaseUser?.emailVerified || (user as any)?.emailVerified);

  const reloadUserVerification = async (): Promise<boolean> => {
    if (auth.currentUser) {
      try {
        await reload(auth.currentUser);
        const verified = Boolean(auth.currentUser.emailVerified);
        if (verified) {
          await updateEmailVerificationInFirestore(auth.currentUser.uid, true);
          if (user) {
            const updated = { ...user, emailVerified: true };
            setUser(updated);
            setStoredUser(updated);
          }
        }
        return verified;
      } catch (err) {
        console.warn('[Firebase Auth] Error refreshing verification status:', err);
      }
    }
    return false;
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No active user session to send verification email to.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Firebase Auth] Sign out notice:', err);
    }
    setStoredUser(null);
    setAuthToken(null);
    setFirebaseUser(null);
    setUser(null);
    setAuthStatus('AUTH_UNAUTHENTICATED');
  };

  const switchDemoRole = async (role: 'student' | 'admin') => {
    setAuthStatus('AUTH_INITIALIZING');
    try {
      const res = await api.switchDemoUser(role);
      setAuthToken(res.token, res.user.email, res.user.name);
      setStoredUser(res.user);
      setUser(res.user);
      saveUserToFirestore(res.user).catch(() => {});
      setAuthStatus('AUTHENTICATED');
    } catch (err) {
      console.error('Failed to switch demo role:', err);
      setAuthStatus(user ? 'AUTHENTICATED' : 'AUTH_UNAUTHENTICATED');
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      try {
        const profile = await getUserFromFirestore(firebaseUser.uid);
        if (profile) {
          setUser(profile);
          return;
        }
      } catch (err) {
        console.warn('Could not refresh profile from Firestore:', err);
      }
    }
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
    api.syncUser(updatedUser).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        authStatus,
        loading,
        authError,
        isEmailVerified,
        login,
        register,
        forgotPassword,
        verifyResetCode,
        confirmPasswordResetAction,
        resetPassword,
        sendVerificationEmail,
        reloadUserVerification,
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
