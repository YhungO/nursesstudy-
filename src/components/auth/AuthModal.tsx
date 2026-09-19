import React, { useState } from 'react';
import { useAuth, getFirebaseAuthErrorMessage } from '../../context/AuthContext';
import { NursingLevel } from '../../types';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Building,
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
  Sparkles,
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
  const { login, register, forgotPassword, resetPassword, switchDemoRole } = useAuth();
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
  const [recoveryCodeHint, setRecoveryCodeHint] = useState<string | null>(null);

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

        const res = await forgotPassword(cleanEmail);
        setSuccessMsg(res.message || 'Recovery code generated! Check your email or use the code below.');
        if (res.resetCode) {
          setRecoveryCodeHint(res.resetCode);
          setResetCode(res.resetCode);
        }
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

        setSuccessMsg('Password has been successfully updated! You can now log in.');
        setPassword('');
        setConfirmPassword('');
        setMode('login');
      }
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'student' | 'admin') => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
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
            <button
              type="button"
              id="modal-tab-admin"
              onClick={() => {
                setMode('admin_login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`px-4 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                mode === 'admin_login'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/60 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Admin
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

          {recoveryCodeHint && mode === 'reset_password' && (
            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/40 text-teal-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span>Code: <strong className="text-white font-mono tracking-wider">{recoveryCodeHint}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setResetCode(recoveryCodeHint)}
                className="text-[10px] font-bold text-teal-300 underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* REGISTER FIELDS */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Augustine Chigaemezu"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Level <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <select
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Graduation <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="2027"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  School / College Name <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Imo State College of Nursing Science"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* EMAIL (NOT FOR RESET PASSWORD) */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@nursesstudy.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
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
          {mode === 'reset_password' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Registered Email <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  6-Digit Recovery Code <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    maxLength={8}
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono tracking-widest focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Confirm New Password <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    tabIndex={-1}
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
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : mode === 'forgot_password' ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Send Recovery Code</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            ) : mode === 'reset_password' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Reset Password & Log In</span>
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

          {/* Instant Quick Demo */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-2">
              Instant 1-Click Evaluation:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                disabled={isSubmitting}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={isSubmitting}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
