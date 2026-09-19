import React, { useState, useEffect } from 'react';
import { useAuth, getFirebaseAuthErrorMessage } from '../../context/AuthContext';
import { NursingLevel } from '../../types';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCcw,
  Send,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin_login' | 'forgot_password';
  levels: NursingLevel[];
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  levels,
}) => {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'admin_login' | 'forgot_password' | 'reset_password'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Optional Academic Details
  const [levelId, setLevelId] = useState(levels[0]?.id || 'lvl-nd1');
  const [school, setSchool] = useState('');
  const [gradYear, setGradYear] = useState('2027');

  // Password Recovery States
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 60-Second Cooldown Timer for Resend Code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isEmailValid = (val: string) => EMAIL_REGEX.test(val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'login' || mode === 'admin_login') {
        if (!cleanEmail || !password) {
          throw new Error('Please enter both email and password.');
        }
        if (!isEmailValid(cleanEmail)) {
          throw new Error('Please enter a valid email address format.');
        }

        const user = await login(cleanEmail, password);
        if (mode === 'admin_login' && user.role !== 'admin') {
          throw new Error('Access denied: Account does not have administrator privileges.');
        }
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your Full Name.');
        }
        if (!cleanEmail) {
          throw new Error('Please enter your Email Address.');
        }
        if (!isEmailValid(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please ensure both fields are identical.');
        }

        await register({
          name: name.trim(),
          email: cleanEmail,
          password,
          confirmPassword,
          levelId,
          school: school.trim() || 'College of Nursing Sciences',
          gradYear: gradYear.trim() || '2027',
        });
        onClose();
      } else if (mode === 'forgot_password') {
        if (!cleanEmail) {
          throw new Error('Please enter your registered email address.');
        }
        if (!isEmailValid(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }

        await forgotPassword(cleanEmail);
        setSuccessMsg('A 6-digit verification code has been sent to your email address. Please check your inbox (and spam folder).');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setResendCooldown(60);
        setMode('reset_password');
      } else if (mode === 'reset_password') {
        if (!cleanEmail) {
          throw new Error('Please enter your registered email address.');
        }
        if (!resetCode.trim()) {
          throw new Error('Please enter the 6-digit verification code.');
        }
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        if (newPassword !== confirmNewPassword) {
          throw new Error('New passwords do not match. Please ensure both fields are identical.');
        }

        await resetPassword({
          email: cleanEmail,
          resetCode: resetCode.trim(),
          newPassword,
          confirmPassword: confirmNewPassword,
        });

        setSuccessMsg('Password has been successfully updated! You can now log in with your new password.');
        setPassword('');
        setConfirmPassword('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setMode('login');
      }
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address to receive a recovery code.');
      return;
    }
    if (!isEmailValid(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(cleanEmail);
      setResendCooldown(60);
      setSuccessMsg('A 6-digit verification code has been sent to your email address. Please check your inbox (and spam folder).');
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#111827] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden my-8">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-teal-900/80 via-slate-900 to-indigo-900/80 p-5 sm:p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-300">
              <GraduationCap className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              NURSESSTUDY PORTAL
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === 'login' && 'Log In'}
            {mode === 'admin_login' && 'Administrator Portal'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot_password' && 'Password Recovery'}
            {mode === 'reset_password' && 'Set New Password'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {mode === 'login' && 'Sign in to access your nursing notes, CBT mocks, and progress.'}
            {mode === 'admin_login' && 'Administrator authentication for managing the platform.'}
            {mode === 'register' && 'Sign up with full name, email, and password.'}
            {mode === 'forgot_password' && 'Enter your registered email to receive a recovery code.'}
            {mode === 'reset_password' && 'Enter your verification code and choose a new password.'}
          </p>
        </div>

        {/* Mode Switcher Tabs (shown for normal modes) */}
        {mode !== 'forgot_password' && mode !== 'reset_password' && (
          <div className="flex border-b border-slate-800 bg-slate-900/90 text-xs font-semibold">
            <button
              type="button"
              id="modal-tab-login"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                mode === 'login'
                  ? 'border-teal-500 text-teal-400 bg-slate-800/60 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              id="modal-tab-register"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                mode === 'register'
                  ? 'border-teal-500 text-teal-400 bg-slate-800/60 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Back navigation for forgot/reset */}
        {(mode === 'forgot_password' || mode === 'reset_password') && (
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
            <span className="text-[10px] text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded-full">
              Reset Flow
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. FULL NAME (REGISTER ONLY) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Full Name <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  id="modal-signup-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Augustine Chigaemezu"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* 2. EMAIL (NOT FOR RESET PASSWORD) */}
          {mode !== 'reset_password' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  id="modal-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@nursesstudy.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* 3. NURSING LEVEL (REGISTER ONLY) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Nursing Level <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  id="modal-signup-level-select"
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name} ({lvl.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PASSWORD FOR LOGIN / REGISTER / ADMIN */}
          {(mode === 'login' || mode === 'register' || mode === 'admin_login') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password <span className="text-teal-400">*</span>
                </label>
                {mode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                ) : mode === 'register' ? (
                  <span className="text-[10px] text-slate-400">Min. 6 chars</span>
                ) : null}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* CONFIRM PASSWORD (REGISTER ONLY) */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Confirm Password <span className="text-teal-400">*</span>
                </label>
                {confirmPassword && password && (
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {password === confirmPassword ? (
                      <>
                        <Check className="w-3 h-3" /> Match
                      </>
                    ) : (
                      'Mismatch'
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* RESET PASSWORD FIELDS */}
          {/*
            NOTE FOR DEVELOPERS:
            In production, the verification code must be sent via real email service
            (e.g. Resend, SendGrid, or Firebase Auth). Never generate or display the code on the client side.
          */}
          {mode === 'reset_password' && (
            <div className="space-y-3.5">
              {/* 1. Email (Pre-filled) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    id="modal-reset-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@nursesstudy.com"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* 2. 6-Digit Verification Code with Resend Code Button & 60s cooldown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    6-Digit Verification Code <span className="text-teal-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className={`text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                      resendCooldown > 0
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-teal-400 hover:text-teal-300 cursor-pointer'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    id="modal-reset-code-input"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* 3. New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    New Password <span className="text-teal-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Min. 6 chars</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    id="modal-reset-new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 4. Confirm New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Confirm New Password <span className="text-teal-400">*</span>
                  </label>
                  {confirmNewPassword && newPassword && (
                    <span className={`text-[10px] font-semibold ${newPassword === confirmNewPassword ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {newPassword === confirmNewPassword ? 'Match' : 'Mismatch'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    id="modal-reset-confirm-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              mode === 'admin_login'
                ? 'bg-indigo-600 hover:bg-indigo-500'
                : 'bg-teal-600 hover:bg-teal-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserIcon className="w-4 h-4" />
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : mode === 'forgot_password' ? (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reset Code</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : mode === 'reset_password' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Reset Password</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {/* Bottom Switch Link */}
          {(mode === 'login' || mode === 'register') && (
            <div className="text-center pt-2 border-t border-slate-800/80">
              {mode === 'login' ? (
                <p className="text-xs text-slate-400">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
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
              ) : (
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button
                    type="button"
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
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
