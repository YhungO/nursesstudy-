import React, { useState, useEffect } from 'react';
import { useAuth, getFirebaseAuthErrorMessage } from '../../context/AuthContext';
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
  RotateCcw,
  Send,
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
  const { login, register, forgotPassword, resetPassword } = useAuth();
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

        await forgotPassword(cleanEmail);
        setSuccessMsg('A 6-digit verification code has been sent to your email address. Please check your inbox (and spam folder).');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setResendCooldown(60);
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

  // Handle Resending 6-digit Verification Code with 60-Second Cooldown
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
            {mode === 'register' && 'Create Your Account'}
            {mode === 'login' && 'Log In to NursesStudy'}
            {mode === 'forgot_password' && 'Recover Your Password'}
            {mode === 'reset_password' && 'Create a New Password'}
            {mode === 'admin' && 'Administrator Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {mode === 'register' &&
              'Register your student profile to access lecture materials, question banks, and timed CBT mock examinations.'}
            {mode === 'login' &&
              'Enter your registered email and password to access your lecture notes, CBT mock exams, and saved bookmarks.'}
            {mode === 'forgot_password' &&
              'Enter your registered email address to receive a secure 6-digit recovery code.'}
            {mode === 'reset_password' &&
              'Enter your verification code along with your new password to restore account access.'}
            {mode === 'admin' &&
              'Sign in with platform administrator credentials to manage subjects, question banks, and student records.'}
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
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Log In</span>
            </button>
            <span className="text-[11px] text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              {mode === 'register' ? 'New Student' : mode === 'admin' ? 'Staff Portal' : 'Account Recovery'}
            </span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5 relative">
          {/* Security & Cloud Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 shadow-xs shadow-teal-400 animate-pulse" />
              <span className="font-semibold text-xs text-slate-300">Secure Authentication</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {mode === 'register'
                ? 'Student Registration'
                : mode === 'login'
                ? 'Student Access'
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
                        {lvl.name} ({lvl.code})
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

            {/* 5. CONFIRM PASSWORD (SIGN UP ONLY) */}
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

            {/* 6. RESET PASSWORD FIELDS (RESET PASSWORD MODE ONLY) */}
            {/*
              NOTE FOR DEVELOPERS:
              In production, the verification code must be sent via real email service
              (e.g. Resend, SendGrid, or Firebase Auth). Never generate or display the code on the client side.
            */}
            {mode === 'reset_password' && (
              <div className="space-y-4">
                {/* 1. Email Address (Pre-filled) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      id="reset-email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@nursesstudy.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 2. 6-Digit Verification Code with Resend Code & 60s cooldown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      6-Digit Verification Code <span className="text-teal-400">*</span>
                    </label>
                    <button
                      type="button"
                      id="resend-code-btn"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || isSubmitting}
                      className={`text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                        resendCooldown > 0
                          ? 'text-slate-500 cursor-not-allowed'
                          : 'text-teal-400 hover:text-teal-300 cursor-pointer'
                      }`}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'group-hover:rotate-180 transition-transform'}`} />
                      <span>{resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      id="reset-code-input"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm sm:text-base text-white font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 3. New Password */}
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
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

                {/* 4. Confirm New Password */}
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
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
        </div>
      </div>
    </div>
  );
};
