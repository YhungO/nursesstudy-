import React, { useState } from 'react';
import { useAuth, getFirebaseAuthErrorMessage } from '../../context/AuthContext';
import { NursingLevel } from '../../types';
import {
  Activity,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Building,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  KeyRound,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface AuthScreenProps {
  levels: NursingLevel[];
  onSuccess?: () => void;
  initialMode?: 'register' | 'login' | 'admin' | 'forgot_password';
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AuthScreen: React.FC<AuthScreenProps> = ({
  levels,
  onSuccess,
  initialMode = 'login',
}) => {
  const { login, register, forgotPassword, resetPassword, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'register' | 'login' | 'admin' | 'forgot_password' | 'reset_password'>(initialMode);

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

  // Password Recovery Fields
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [recoveryCodeHint, setRecoveryCodeHint] = useState<string | null>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email format validation helper
  const isEmailValid = (val: string) => EMAIL_REGEX.test(val.trim());

  // Handle Main Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'register') {
        // Validation Checks
        if (!name.trim()) {
          throw new Error('Please enter your Full Name.');
        }
        if (!cleanEmail) {
          throw new Error('Please enter your Email Address.');
        }
        if (!isEmailValid(cleanEmail)) {
          throw new Error('Please enter a valid email address (e.g. name@example.com).');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please ensure both fields are identical.');
        }

        const registeredUser = await register({
          name: name.trim(),
          email: cleanEmail,
          password,
          confirmPassword,
          levelId,
          school: school.trim() || 'College of Nursing Sciences',
          gradYear: gradYear.trim() || '2027',
        });

        setSuccessMsg(`Account successfully created! Welcome to NursesStudy, ${registeredUser.name}.`);
        if (onSuccess) onSuccess();
      } else if (mode === 'login') {
        if (!cleanEmail || !password) {
          throw new Error('Please enter both your email address and password.');
        }
        if (!isEmailValid(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }

        const loggedInUser = await login(cleanEmail, password);
        setSuccessMsg(`Welcome back, ${loggedInUser.name}!`);
        if (onSuccess) onSuccess();
      } else if (mode === 'admin') {
        if (!cleanEmail || !password) {
          throw new Error('Administrator email and password are required.');
        }

        const adminUser = await login(cleanEmail, password);
        if (adminUser.role !== 'admin') {
          throw new Error('Access denied: Account does not hold administrator privileges.');
        }
        setSuccessMsg('Administrator credentials verified.');
        if (onSuccess) onSuccess();
      } else if (mode === 'forgot_password') {
        if (!cleanEmail) {
          throw new Error('Please enter your registered email address.');
        }
        if (!isEmailValid(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }

        const res = await forgotPassword(cleanEmail);
        setSuccessMsg(res.message || 'Recovery code generated! Check your email or use the verification code below.');
        if (res.resetCode) {
          setRecoveryCodeHint(res.resetCode);
          setResetCode(res.resetCode);
        }
        // Advance to step 2: Reset Password
        setMode('reset_password');
      } else if (mode === 'reset_password') {
        if (!cleanEmail) {
          throw new Error('Please provide your registered email address.');
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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo initialization failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-teal-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
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
                Portal Security
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === 'register' && 'Create Your Student Account'}
            {mode === 'login' && 'Log In to NursesStudy'}
            {mode === 'forgot_password' && 'Recover Your Password'}
            {mode === 'reset_password' && 'Create a New Password'}
            {mode === 'admin' && 'Administrator Portal Gateway'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {mode === 'register' &&
              'Register your permanent nursing student profile to access lecture materials, question banks, and timed CBT mock examinations.'}
            {mode === 'login' &&
              'Enter your registered email and password to access your lecture notes, CBT mock exams, and saved bookmarks.'}
            {mode === 'forgot_password' &&
              'Enter your registered email address to receive a secure recovery code and reset link.'}
            {mode === 'reset_password' &&
              'Enter your verification code along with your new password to restore account access.'}
            {mode === 'admin' &&
              'Sign in with platform administrator credentials to manage subjects, question banks, and student records.'}
          </p>
        </div>

        {/* Primary Navigation Tabs (shown during login, register, admin) */}
        {mode !== 'forgot_password' && mode !== 'reset_password' && (
          <div className="bg-[#111827] p-1.5 rounded-2xl border border-slate-800 flex shadow-inner">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40 ring-1 ring-teal-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>

            <button
              type="button"
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40 ring-1 ring-teal-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Create Account (Sign Up)</span>
            </button>

            <button
              type="button"
              id="auth-tab-admin"
              onClick={() => {
                setMode('admin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Administrator Gateway"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        )}

        {/* Back Link for Forgot / Reset Password modes */}
        {(mode === 'forgot_password' || mode === 'reset_password') && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Log In</span>
            </button>
            <span className="text-[11px] text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              Account Recovery
            </span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5 relative">
          {/* Security & Cloud Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 shadow-xs shadow-teal-400 animate-pulse" />
              <span className="font-semibold text-xs text-slate-300">Secure Hashed Authentication</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {mode === 'register'
                ? 'Permanent Enrollment'
                : mode === 'login'
                ? 'Persistent Session'
                : mode === 'forgot_password' || mode === 'reset_password'
                ? 'Password Recovery'
                : 'Administrator Area'}
            </span>
          </div>

          {/* Feedback Messages */}
          {error && (
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

          {successMsg && (
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

          {/* Recovery Code Hint Banner (For Seamless Demonstration / Testing) */}
          {recoveryCodeHint && mode === 'reset_password' && (
            <div className="p-3 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-teal-200 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
                <span>
                  Your verification recovery code is <strong className="text-white tracking-widest font-mono text-sm">{recoveryCodeHint}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setResetCode(recoveryCodeHint)}
                className="text-[11px] font-bold text-teal-300 underline hover:text-white cursor-pointer"
              >
                Auto-fill Code
              </button>
            </div>
          )}

          {/* Form */}
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Augustine Chigaemezu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      mode === 'admin'
                        ? 'chigaemezuaugustine43@gmail.com'
                        : 'student@nursesstudy.com'
                    }
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                      email && !isEmailValid(email)
                        ? 'border-amber-500/60 focus:border-amber-500 focus:ring-amber-500'
                        : 'border-slate-800 focus:border-teal-500 focus:ring-teal-500'
                    }`}
                  />
                </div>
                {email && !isEmailValid(email) && (
                  <p className="text-[11px] text-amber-400 mt-1">Please enter a valid email format (e.g. student@domain.com)</p>
                )}
              </div>
            )}

            {/* 3. PASSWORD (SIGN UP, LOG IN, ADMIN) */}
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
                      }}
                      className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  ) : mode === 'register' ? (
                    <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                  ) : null}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="auth-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
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
              </div>
            )}

            {/* 4. CONFIRM PASSWORD (SIGN UP ONLY) */}
            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Confirm Password <span className="text-teal-400">*</span>
                  </label>
                  {confirmPassword && password && (
                    <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                      password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
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
              </div>
            )}

            {/* 5. OPTIONAL ACADEMIC DETAILS (SIGN UP ONLY) */}
            {mode === 'register' && (
              <div className="space-y-3 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Academic Profile</span>
                  <span className="text-[10px] text-teal-400 font-medium">Optional Fields</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Level (e.g. ND1) <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <select
                        id="signup-level-select"
                        value={levelId}
                        onChange={(e) => setLevelId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      >
                        {levels.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Graduation Year <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="signup-gradyear-input"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      placeholder="2027"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    School / College Name <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      id="signup-school-input"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="e.g. Imo State College of Nursing Science, Orlu"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. RESET PASSWORD FIELDS (RESET PASSWORD MODE ONLY) */}
            {mode === 'reset_password' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Registered Email <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@nursesstudy.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    6-Digit Verification Code <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      id="reset-code-input"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 123456"
                      maxLength={8}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      New Password <span className="text-teal-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min. 6 characters</span>
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
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
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                        newPassword === confirmNewPassword ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showConfirmNewPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
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
                  <span>Processing Request...</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserIcon className="w-4 h-4" />
                  <span>Create Account & Sign In</span>
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
                  <RotateCcw className="w-4 h-4" />
                  <span>Send Recovery Code & Reset Link</span>
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
                  <Shield className="w-4 h-4" />
                  <span>Log In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

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
            ) : mode === 'forgot_password' || mode === 'reset_password' ? (
              <p className="text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
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

          {/* Quick Demo Previews */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="text-[11px] font-medium text-slate-400">
                Evaluation Shortcuts:
              </span>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                1-Click Sign-In
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                id="demo-student-login-btn"
                onClick={() => handleQuickDemo('student')}
                disabled={isSubmitting}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <UserIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>Demo Student (Amara)</span>
              </button>
              <button
                type="button"
                id="demo-admin-login-btn"
                onClick={() => handleQuickDemo('admin')}
                disabled={isSubmitting}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Demo Admin (YHUNGO)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-3 text-center text-slate-400 text-xs">
          <div className="p-3 bg-[#111827] rounded-2xl border border-slate-800/80 space-y-1">
            <BookOpen className="w-4 h-4 text-teal-400 mx-auto" />
            <div className="font-bold text-white text-[11px]">11 Subjects</div>
            <p className="text-[10px] text-slate-400 leading-tight">Curriculum notes & clinical guides</p>
          </div>
          <div className="p-3 bg-[#111827] rounded-2xl border border-slate-800/80 space-y-1">
            <Clock className="w-4 h-4 text-cyan-400 mx-auto" />
            <div className="font-bold text-white text-[11px]">CBT Hall</div>
            <p className="text-[10px] text-slate-400 leading-tight">Timed NCLEX & NMCN mocks</p>
          </div>
          <div className="p-3 bg-[#111827] rounded-2xl border border-slate-800/80 space-y-1">
            <Award className="w-4 h-4 text-indigo-400 mx-auto" />
            <div className="font-bold text-white text-[11px]">Admin Roster</div>
            <p className="text-[10px] text-slate-400 leading-tight">Permanent registered students</p>
          </div>
        </div>
      </div>
    </div>
  );
};
