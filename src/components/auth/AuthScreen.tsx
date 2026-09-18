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
  BookOpen,
  Award,
  Clock,
  Sparkles,
  KeyRound,
  Check,
} from 'lucide-react';

interface AuthScreenProps {
  levels: NursingLevel[];
  onSuccess?: () => void;
  initialMode?: 'register' | 'login' | 'admin';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  levels,
  onSuccess,
  initialMode = 'login',
}) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'register' | 'login' | 'admin'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [levelId, setLevelId] = useState(levels[0]?.id || 'lvl-nd1');
  const [school, setSchool] = useState('');
  const [gradYear, setGradYear] = useState('2027');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your Full Name or Username.');
        }
        if (!email.trim()) {
          throw new Error('Please enter your Email Address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const registeredUser = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          levelId,
          school: school.trim() || 'College of Nursing Sciences',
          gradYear: gradYear.trim() || '2027',
        });

        setSuccessMsg(`Account successfully created! Welcome, ${registeredUser.name}.`);
        if (onSuccess) onSuccess();
      } else if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email and password.');
        }

        const loggedInUser = await login(email.trim(), password);
        setSuccessMsg(`Welcome back, ${loggedInUser.name}!`);
        if (onSuccess) onSuccess();
      } else if (mode === 'admin') {
        if (!email.trim() || !password) {
          throw new Error('Administrator email and password are required.');
        }

        const adminUser = await login(email.trim(), password);
        if (adminUser.role !== 'admin') {
          throw new Error('Access denied: Account does not hold administrator privileges.');
        }
        setSuccessMsg('Administrator session verified.');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'student' | 'admin') => {
    setError(null);
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
                Portal Auth
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === 'register' && 'Create Your Account'}
            {mode === 'login' && 'Log In to NursesStudy'}
            {mode === 'admin' && 'Administrator Portal Gateway'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {mode === 'register' &&
              'Sign up to access verified nursing curricula, timed CBT exam simulations, and your personalized grade tracking.'}
            {mode === 'login' &&
              'Enter your email and password to access your lecture notes, CBT mock exams, and saved bookmarks.'}
            {mode === 'admin' &&
              'Sign in with platform administrator credentials to manage subjects, question banks, and student records.'}
          </p>
        </div>

        {/* Primary Navigation Tabs */}
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

        {/* Main Card */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5 relative">
          {/* Security & Cloud Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 shadow-xs shadow-teal-400 animate-pulse" />
              <span className="font-semibold text-xs text-slate-300">Firebase Authentication</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {mode === 'register' ? 'New Candidate' : mode === 'login' ? 'Protected Session' : 'Owner Area'}
            </span>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Notice</p>
                <p className="text-[11px] mt-0.5 text-rose-300">{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Success</p>
                <p className="text-[11px] mt-0.5 text-emerald-300">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. FULL NAME OR USERNAME (SIGN UP ONLY) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name or Username <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    id="signup-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nurse Augustine Chigaemezu or JoyNurse"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 2. EMAIL ADDRESS (SIGN UP & LOG IN) */}
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* 3. PASSWORD (SIGN UP & LOG IN) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password <span className="text-teal-400">*</span>
                </label>
                {mode === 'register' && (
                  <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                )}
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. OPTIONAL ACADEMIC PROFILE (FOR SIGN UP) */}
            {mode === 'register' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nursing Level / Class
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <select
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Expected Grad Year
                    </label>
                    <input
                      type="text"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      placeholder="2027"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    School / College of Nursing
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="e.g. College of Nursing Sciences, University Teaching Hospital"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
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
                  <span>Verifying Credentials...</span>
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
                Instant Evaluation Shortcuts:
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
            <p className="text-[10px] text-slate-400 leading-tight">Instant sync of registered students</p>
          </div>
        </div>
      </div>
    </div>
  );
};
