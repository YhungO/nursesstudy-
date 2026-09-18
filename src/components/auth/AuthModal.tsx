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
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin_login';
  levels: NursingLevel[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  levels,
}) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'admin_login'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [levelId, setLevelId] = useState(levels[0]?.id || 'lvl-nd1');
  const [school, setSchool] = useState('');
  const [gradYear, setGradYear] = useState('2027');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login' || mode === 'admin_login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        const user = await login(email.trim(), password);
        if (mode === 'admin_login' && user.role !== 'admin') {
          throw new Error('Access denied: Account does not have administrator privileges.');
        }
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your Full Name or Username.');
        }
        if (!email.trim()) {
          throw new Error('Please enter your Email Address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          levelId,
          school: school.trim() || 'College of Nursing Sciences',
          gradYear: gradYear.trim() || '2027',
        });
      }
      onClose();
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
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {mode === 'login' && 'Sign in to access your nursing notes, CBT mocks, and progress.'}
            {mode === 'admin_login' && 'Administrator authentication for managing the platform.'}
            {mode === 'register' && 'Sign up with full name, email, and password.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
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
            onClick={() => {
              setMode('register');
              setError(null);
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
            onClick={() => {
              setMode('admin_login');
              setError(null);
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name or Username <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nurse Augustine or Joy"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Class / Level
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
                    Graduation Year
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
                  Nursing School
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. College of Nursing Sciences"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </>
          )}

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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password <span className="text-teal-400">*</span>
              </label>
              {mode === 'register' && (
                <span className="text-[10px] text-slate-400">Min. 6 chars</span>
              )}
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
