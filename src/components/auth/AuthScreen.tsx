import React, { useState, useEffect } from 'react';
import {
  useAuth,
  getFirebaseAuthErrorMessage,
  validatePasswordStrength,
  isProviderDisabledError,
} from '../../context/AuthContext';
import { NursingLevel } from '../../types';
import {
  Activity,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Check,
  Send,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface AuthScreenProps {
  levels: NursingLevel[];
  onSuccess?: () => void;
  initialMode?: 'register' | 'login' | 'admin' | 'forgot_password' | 'reset_password';
  initialOobCode?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AuthScreen: React.FC<AuthScreenProps> = ({
  levels,
  onSuccess,
  initialMode = 'login',
  initialOobCode,
}) => {
  const {
    login,
    register,
    forgotPassword,
    verifyResetCode,
    confirmPasswordResetAction,
    sendVerificationEmail,
    reloadUserVerification,
  } = useAuth();

  const [mode, setMode] = useState<
    'register' | 'login' | 'admin' | 'forgot_password' | 'reset_password' | 'verify_email'
  >(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Optional Academic Details for Registration
  const [levelId, setLevelId] = useState(levels[0]?.id || 'lvl-nd1');
  const [school, setSchool] = useState('');
  const [gradYear, setGradYear] = useState('2027');

  // Password Reset / Recovery States
  const [oobCode, setOobCode] = useState<string>(initialOobCode || '');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);
  const [codeVerificationError, setCodeVerificationError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Email Verification States
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [verifyStatusMsg, setVerifyStatusMsg] = useState<string | null>(null);
  const [verifyStatusType, setVerifyStatusType] = useState<'success' | 'warning' | null>(null);

  // In-field validation / touched tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email format validation helper
  const isEmailValid = (val: string) => EMAIL_REGEX.test(val.trim());

  // Password strength validation helper
  const passwordStrength = validatePasswordStrength(password);
  const newPasswordStrength = validatePasswordStrength(newPassword);

  // 60-Second Cooldown Timer for Resending Verification Email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check URL query parameters for oobCode on mount or if initialOobCode updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('oobCode');
      const urlMode = params.get('mode');

      if (urlCode) {
        setOobCode(urlCode);
        setMode('reset_password');
      } else if (urlMode === 'resetPassword') {
        setMode('reset_password');
      }
    }
  }, []);

  // When in reset_password mode and oobCode is available, verify it with Firebase
  useEffect(() => {
    if (mode === 'reset_password' && oobCode) {
      let isCurrent = true;
      setIsVerifyingCode(true);
      setCodeVerificationError(null);

      verifyResetCode(oobCode)
        .then((userEmail) => {
          if (isCurrent) {
            setVerifiedEmail(userEmail);
            setEmail(userEmail);
            setIsVerifyingCode(false);
          }
        })
        .catch((err) => {
          if (isCurrent) {
            setCodeVerificationError(
              err.message || 'This password reset link is invalid or has expired. Please request a new one.'
            );
            setIsVerifyingCode(false);
          }
        });

      return () => {
        isCurrent = false;
      };
    }
  }, [mode, oobCode, verifyResetCode]);

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Handle Main Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    // Comprehensive client-side form validation before sending request to Firebase
    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!cleanEmail) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!isEmailValid(cleanEmail)) {
        setError('Please enter a valid email address (e.g. student@example.com).');
        return;
      }
      if (!levelId) {
        setError('Please select your nursing level.');
        return;
      }
      if (password.length < 8) {
        setError('Password must contain at least 8 characters.');
        return;
      }
      if (!passwordStrength.isValid) {
        setError(passwordStrength.feedback[0] || 'Password does not meet security requirements.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else if (mode === 'login' || mode === 'admin') {
      if (!cleanEmail) {
        setError('Please enter your email address.');
        return;
      }
      if (!isEmailValid(cleanEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    } else if (mode === 'forgot_password') {
      if (!cleanEmail) {
        setError('Please enter your registered email address.');
        return;
      }
      if (!isEmailValid(cleanEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
    } else if (mode === 'reset_password') {
      if (!oobCode.trim()) {
        setError('Missing password reset action code.');
        return;
      }
      if (newPassword.length < 8) {
        setError('New password must contain at least 8 characters.');
        return;
      }
      if (!newPasswordStrength.isValid) {
        setError(newPasswordStrength.feedback[0] || 'Password does not meet security requirements.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const registeredUser = await register({
          name: name.trim(),
          email: cleanEmail,
          password,
          confirmPassword,
          levelId,
          school: school.trim() || 'College of Nursing Sciences',
          gradYear: gradYear.trim() || '2027',
        });

        // Set registered email and switch to verify_email screen
        setRegisteredEmail(cleanEmail);
        setResendCooldown(60);
        setMode('verify_email');
        setVerifyStatusMsg(`Verification email dispatched to ${cleanEmail}. Please verify your email.`);
        setVerifyStatusType('success');
      } else if (mode === 'login') {
        const loggedInUser = await login(cleanEmail, password);
        setSuccessMsg(`Welcome back, ${loggedInUser.name}!`);
        if (onSuccess) onSuccess();
      } else if (mode === 'admin') {
        const adminUser = await login(cleanEmail, password);
        if (adminUser.role !== 'admin') {
          throw new Error('Access denied: Account does not hold administrator privileges.');
        }
        setSuccessMsg('Administrator credentials verified.');
        if (onSuccess) onSuccess();
      } else if (mode === 'forgot_password') {
        const res = await forgotPassword(cleanEmail);
        setResetEmailSent(true);
        setSuccessMsg(res.message);
      } else if (mode === 'reset_password') {
        await confirmPasswordResetAction(oobCode.trim(), newPassword);

        if (typeof window !== 'undefined' && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        setSuccessMsg('Password updated successfully! You can now log in with your new password.');
        setPassword('');
        setConfirmPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setOobCode('');
        setMode('login');
      }
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check email verification status manually
  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    setVerifyStatusMsg(null);

    try {
      const isVerified = await reloadUserVerification();
      if (isVerified) {
        setVerifyStatusMsg('Email verified successfully! Entering your student portal...');
        setVerifyStatusType('success');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setVerifyStatusMsg(
          'Email not verified yet. Please open the verification link in your inbox or spam folder, then click this button again.'
        );
        setVerifyStatusType('warning');
      }
    } catch {
      setVerifyStatusMsg('Could not verify status. Please check your internet connection.');
      setVerifyStatusType('warning');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setIsResendingVerification(true);
    setVerifyStatusMsg(null);

    try {
      await sendVerificationEmail();
      setResendCooldown(60);
      setVerifyStatusMsg('A fresh verification link has been sent to your email address.');
      setVerifyStatusType('success');
    } catch (err: any) {
      setVerifyStatusMsg(getFirebaseAuthErrorMessage(err));
      setVerifyStatusType('warning');
    } finally {
      setIsResendingVerification(false);
    }
  };

  const isProviderDisabled =
    Boolean(error && isProviderDisabledError(error)) ||
    Boolean(error && error.includes('Email/Password sign-in is not enabled'));

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-teal-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#111827] border border-slate-800 shadow-md">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm ring-1 ring-teal-400/30">
              <Activity className="w-4 h-4 text-teal-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                Nurses<span className="text-teal-400">Study</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                Student Portal
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === 'register' && 'Create Your Student Account'}
            {mode === 'login' && 'Log In to NursesStudy'}
            {mode === 'verify_email' && 'Verify Your Email'}
            {mode === 'forgot_password' && 'Password Recovery'}
            {mode === 'reset_password' && 'Set New Password'}
            {mode === 'admin' && 'Administrator Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {mode === 'register' &&
              'Register your student profile to access lecture materials, question banks, and timed CBT mock examinations.'}
            {mode === 'login' &&
              'Enter your registered credentials to access your course materials, practice questions, and CBT examinations.'}
            {mode === 'verify_email' &&
              'Click the verification link sent to your inbox to activate your account and access CBT exams.'}
            {mode === 'forgot_password' &&
              'Enter your registered email address to receive a secure Firebase password reset link.'}
            {mode === 'reset_password' &&
              'Choose a new strong password for your verified account to restore access.'}
            {mode === 'admin' &&
              'Sign in with platform administrator credentials to manage subjects, questions, and students.'}
          </p>
        </div>

        {/* Back Link for Non-Login modes */}
        {mode !== 'login' && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
                setResetEmailSent(false);
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Log In</span>
            </button>
            <span className="text-[11px] text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              {mode === 'register'
                ? 'New Student'
                : mode === 'verify_email'
                ? 'Email Verification'
                : mode === 'admin'
                ? 'Staff Portal'
                : 'Account Recovery'}
            </span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5 relative">
          {/* Security & Cloud Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 shadow-xs shadow-teal-400 animate-pulse" />
              <span className="font-semibold text-xs text-slate-300">Firebase Security</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {mode === 'register'
                ? 'Student Registration'
                : mode === 'login'
                ? 'Student Access'
                : mode === 'verify_email'
                ? 'Account Verification'
                : mode === 'forgot_password' || mode === 'reset_password'
                ? 'Password Recovery'
                : 'Administrator Area'}
            </span>
          </div>

          {/* Feedback Messages */}
          {error && !isProviderDisabled && (
            <div
              id="auth-error-banner"
              className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">Authentication Error</p>
                <p className="text-[11px] mt-0.5 text-rose-200 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* FIREBASE CONSOLE ACTION REQUIRED SETUP HELPER BANNER */}
          {isProviderDisabled && (
            <div
              id="firebase-console-action-box"
              className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/60 text-amber-100 text-xs space-y-3 animate-in fade-in shadow-xl shadow-amber-950/30"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-200 text-sm tracking-tight">
                    ONE FIREBASE CONSOLE ACTION REQUIRED
                  </h4>
                  <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                    The <strong>Email/Password</strong> sign-in provider is not yet enabled in your Firebase Project. Enable it once to allow student registration:
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 font-mono text-[11px] text-amber-300 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider mb-1">
                  Exact Firebase Console Navigation Path:
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-semibold">Firebase Console</span>
                  <span>&rarr;</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-semibold">Authentication</span>
                  <span>&rarr;</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-semibold">Sign-in method</span>
                  <span>&rarr;</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">Email/Password</span>
                  <span>&rarr;</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">Enable</span>
                  <span>&rarr;</span>
                  <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">Save</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <span>Open Firebase Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition-colors"
                >
                  Dismiss Notice
                </button>
              </div>
            </div>
          )}

          {successMsg && !resetEmailSent && mode !== 'verify_email' && (
            <div
              id="auth-success-banner"
              className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-300">Success</p>
                <p className="text-[11px] mt-0.5 text-emerald-200 leading-relaxed">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Special Email Verification Mode */}
          {mode === 'verify_email' ? (
            <div className="space-y-5 py-2 text-center animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Verify Your Email Address</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                  We have sent a Firebase verification link to:
                  <span className="block mt-1 font-bold text-teal-300 break-all">{registeredEmail || email}</span>
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Please check your Inbox (and Spam/Promotions folder) and click the link to activate your student account.
                </p>
              </div>

              {verifyStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center justify-center gap-2 ${
                    verifyStatusType === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                  }`}
                >
                  {verifyStatusType === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  )}
                  <span className="text-[11px]">{verifyStatusMsg}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  id="confirm-email-verified-btn"
                  disabled={isCheckingVerification}
                  onClick={handleCheckVerification}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ring-1 ring-teal-400/30"
                >
                  {isCheckingVerification ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Checking verification status...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>I've Verified My Email — Enter Portal</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="resend-verification-email-btn"
                  disabled={resendCooldown > 0 || isResendingVerification}
                  onClick={handleResendVerification}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isResendingVerification ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                      <span>Sending verification email...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Resend available in {resendCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-teal-400" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-400 hover:text-teal-400 transition-colors py-1 cursor-pointer block mx-auto underline underline-offset-2"
                >
                  Back to Log In
                </button>
              </div>
            </div>
          ) : mode === 'forgot_password' && resetEmailSent ? (
            /* Special Forgot Password Sent View */
            <div className="space-y-4 py-2 text-center animate-in fade-in">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Send className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                  If an account exists for <span className="font-semibold text-teal-300">{email}</span>, a secure password-reset link has been sent.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-1.5 text-[11px] text-slate-400">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                  <span>Important Delivery Instructions:</span>
                </div>
                <p>1. Check your <strong className="text-slate-200">Inbox, Spam, Promotions, or Junk</strong> folder.</p>
                <p>2. Look for an email with subject <em className="text-slate-200">"Reset your password for NursesStudy"</em>.</p>
                <p>3. Click the secure reset link inside the email to set your new password.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetEmailSent(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Return to Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmailSent(false);
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-teal-400 transition-colors cursor-pointer py-1"
                >
                  Try a different email address
                </button>
              </div>
            </div>
          ) : mode === 'reset_password' && isVerifyingCode ? (
            /* Verifying action code loader */
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-300 font-medium">Verifying password reset action link...</p>
            </div>
          ) : mode === 'reset_password' && codeVerificationError ? (
            /* Expired or invalid action link view */
            <div className="space-y-4 py-3 text-center animate-in fade-in">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-300">Link Invalid or Expired</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {codeVerificationError}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setError(null);
                    setSuccessMsg(null);
                    setCodeVerificationError(null);
                  }}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Request New Password Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setCodeVerificationError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
                >
                  Return to Log In
                </button>
              </div>
            </div>
          ) : (
            /* Standard Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. FULL NAME (SIGN UP ONLY) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      id="signup-name-input"
                      value={name}
                      onBlur={() => markTouched('name')}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Augustine Chigaemezu"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                        touched.name && !name.trim()
                          ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-teal-500 focus:ring-teal-500'
                      }`}
                    />
                  </div>
                  {touched.name && !name.trim() && (
                    <p className="text-[11px] text-rose-400 mt-1">Please enter your full name.</p>
                  )}
                </div>
              )}

              {/* 2. EMAIL ADDRESS (SIGN UP, LOG IN, FORGOT PASSWORD, ADMIN) */}
              {mode !== 'reset_password' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {mode === 'admin' ? 'Administrator Email' : 'Email Address'}{' '}
                    <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      id="auth-email-input"
                      value={email}
                      onBlur={() => markTouched('email')}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        mode === 'admin'
                          ? 'chigaemezuaugustine43@gmail.com'
                          : 'student@nursesstudy.com'
                      }
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                        touched.email && email && !isEmailValid(email)
                          ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
                          : touched.email && !email
                          ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-teal-500 focus:ring-teal-500'
                      }`}
                    />
                  </div>
                  {touched.email && !email && (
                    <p className="text-[11px] text-rose-400 mt-1">Please enter a valid email address.</p>
                  )}
                  {touched.email && email && !isEmailValid(email) && (
                    <p className="text-[11px] text-rose-400 mt-1">Please enter a valid email format (e.g. student@domain.com).</p>
                  )}
                </div>
              )}

              {/* 3. NURSING LEVEL (SIGN UP ONLY) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nursing Level <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      id="signup-level-select"
                      value={levelId}
                      onChange={(e) => setLevelId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors cursor-pointer"
                    >
                      {levels.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.name} ({lvl.badge})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 4. PASSWORD (SIGN UP, LOG IN, ADMIN) */}
              {(mode === 'login' || mode === 'register' || mode === 'admin') && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password <span className="text-teal-400">*</span>
                    </label>
                    {mode === 'login' ? (
                      <button
                        type="button"
                        id="forgot-password-link"
                        onClick={() => {
                          setMode('forgot_password');
                          setError(null);
                          setSuccessMsg(null);
                          setResetEmailSent(false);
                        }}
                        className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    ) : mode === 'register' ? (
                      <span className="text-[10px] text-slate-400">Min. 8 characters</span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="auth-password-input"
                      value={password}
                      onBlur={() => markTouched('password')}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                        touched.password && mode === 'register' && password && !passwordStrength.isValid
                          ? 'border-amber-500/60 focus:border-amber-500 focus:ring-amber-500'
                          : touched.password && !password
                          ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-teal-500 focus:ring-teal-500'
                      }`}
                    />
                    <button
                      type="button"
                      id="toggle-password-visibility-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {touched.password && !password && (
                    <p className="text-[11px] text-rose-400 mt-1">
                      {mode === 'register' ? 'Password must contain at least 8 characters.' : 'Please enter your password.'}
                    </p>
                  )}

                  {/* Password requirements live status */}
                  {mode === 'register' && (
                    <div className="mt-2.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider mb-1">
                        Password Requirements:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        <span
                          className={`flex items-center gap-1.5 ${
                            passwordStrength.hasMinLength ? 'text-teal-400 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                              passwordStrength.hasMinLength ? 'bg-teal-500/20 text-teal-400 font-bold' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {passwordStrength.hasMinLength ? '✓' : '•'}
                          </span>
                          At least 8 characters
                        </span>

                        <span
                          className={`flex items-center gap-1.5 ${
                            passwordStrength.hasUpper ? 'text-teal-400 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                              passwordStrength.hasUpper ? 'bg-teal-500/20 text-teal-400 font-bold' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {passwordStrength.hasUpper ? '✓' : '•'}
                          </span>
                          Uppercase letter (A-Z)
                        </span>

                        <span
                          className={`flex items-center gap-1.5 ${
                            passwordStrength.hasLower ? 'text-teal-400 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                              passwordStrength.hasLower ? 'bg-teal-500/20 text-teal-400 font-bold' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {passwordStrength.hasLower ? '✓' : '•'}
                          </span>
                          Lowercase letter (a-z)
                        </span>

                        <span
                          className={`flex items-center gap-1.5 ${
                            passwordStrength.hasNumber ? 'text-teal-400 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                              passwordStrength.hasNumber ? 'bg-teal-500/20 text-teal-400 font-bold' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {passwordStrength.hasNumber ? '✓' : '•'}
                          </span>
                          At least one number (0-9)
                        </span>

                        <span
                          className={`flex items-center gap-1.5 ${
                            passwordStrength.hasSpecial ? 'text-teal-400 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                              passwordStrength.hasSpecial ? 'bg-teal-500/20 text-teal-400 font-bold' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {passwordStrength.hasSpecial ? '✓' : '•'}
                          </span>
                          Special character (!@#$)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. CONFIRM PASSWORD (SIGN UP ONLY) */}
              {mode === 'register' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Confirm Password <span className="text-teal-400">*</span>
                    </label>
                    {confirmPassword && password && (
                      <span
                        className={`text-[10px] font-semibold flex items-center gap-1 ${
                          password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {password === confirmPassword ? (
                          <>
                            <Check className="w-3 h-3" /> Passwords match
                          </>
                        ) : (
                          'Passwords do not match'
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      id="signup-confirm-password-input"
                      value={confirmPassword}
                      onBlur={() => markTouched('confirmPassword')}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-teal-500 focus:ring-teal-500'
                      }`}
                    />
                    <button
                      type="button"
                      id="toggle-confirm-password-visibility-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1">Passwords do not match.</p>
                  )}
                </div>
              )}

              {/* 6. RESET PASSWORD FIELDS */}
              {mode === 'reset_password' && (
                <div className="space-y-4">
                  {verifiedEmail && (
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
                      Resetting password for: <span className="font-bold text-white">{verifiedEmail}</span>
                    </div>
                  )}

                  {!oobCode && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Action Code / Link Token <span className="text-teal-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={oobCode}
                        onChange={(e) => setOobCode(e.target.value.trim())}
                        placeholder="Paste reset code from email"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        New Password <span className="text-teal-400">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Min. 8 characters</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        id="reset-new-password-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Confirm New Password <span className="text-teal-400">*</span>
                      </label>
                      {confirmNewPassword && newPassword && (
                        <span
                          className={`text-[10px] font-semibold flex items-center gap-1 ${
                            newPassword === confirmNewPassword ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {newPassword === confirmNewPassword ? (
                            <>
                              <Check className="w-3 h-3" /> Passwords match
                            </>
                          ) : (
                            'Passwords do not match'
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        id="reset-confirm-password-input"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button with Loading States */}
              <button
                type="submit"
                id="auth-submit-btn"
                disabled={isSubmitting}
                className={`w-full mt-2 py-3 px-4 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ring-1 ${
                  mode === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30 ring-indigo-400/30'
                    : 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/30 ring-teal-400/30'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {mode === 'register'
                        ? 'Creating account...'
                        : mode === 'login'
                        ? 'Logging in...'
                        : mode === 'forgot_password'
                        ? 'Sending reset link...'
                        : mode === 'reset_password'
                        ? 'Updating password...'
                        : 'Signing in...'}
                    </span>
                  </>
                ) : mode === 'register' ? (
                  <>
                    <UserIcon className="w-4 h-4" />
                    <span>Create Student Account</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : mode === 'login' ? (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Log In to Portal</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : mode === 'forgot_password' ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : mode === 'reset_password' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Log In to Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between Register and Login */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            {mode === 'login' ? (
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  id="switch-to-signup-btn"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-teal-400 hover:text-teal-300 font-bold transition-colors underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Create an Account (Sign Up)
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  id="switch-to-login-btn"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-teal-400 hover:text-teal-300 font-bold transition-colors underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Log In to Your Account
                </button>
              </p>
            ) : mode === 'forgot_password' || mode === 'reset_password' || mode === 'verify_email' ? (
              <p className="text-xs text-slate-400">
                Remember your credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                    setResetEmailSent(false);
                  }}
                  className="text-teal-400 hover:text-teal-300 font-bold transition-colors underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Return to Log In
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Need student access?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-teal-400 hover:text-teal-300 font-bold transition-colors underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Back to Student Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
