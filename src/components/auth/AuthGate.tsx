import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthScreen } from './AuthScreen';
import { NursingLevel } from '../../types';
import { api } from '../../services/api';
import { Activity, ShieldCheck } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
  levels?: NursingLevel[];
}

const DEFAULT_LEVELS: NursingLevel[] = [
  { id: 'lvl-nd1', name: 'National Diploma 1', order: 1, badge: 'ND 1', description: 'Year 1 Nursing' },
  { id: 'lvl-nd2', name: 'National Diploma 2', order: 2, badge: 'ND 2', description: 'Year 2 Nursing' },
  { id: 'lvl-hnd1', name: 'Higher National Diploma 1', order: 3, badge: 'HND 1', description: 'Year 3 Nursing' },
  { id: 'lvl-hnd2', name: 'Higher National Diploma 2', order: 4, badge: 'HND 2', description: 'Year 4 Nursing' },
];

export const AuthGate: React.FC<AuthGateProps> = ({ children, levels: propLevels = [] }) => {
  const { user, loading, authStatus } = useAuth();
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [levels, setLevels] = useState<NursingLevel[]>(propLevels.length > 0 ? propLevels : DEFAULT_LEVELS);

  // Fetch levels if not provided
  useEffect(() => {
    if (propLevels.length === 0) {
      api.getLevels()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setLevels(data);
          }
        })
        .catch(() => {});
    }
  }, [propLevels]);

  // Check URL parameters on mount for Firebase password reset links (?mode=resetPassword&oobCode=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const oobCode = params.get('oobCode');

        if ((mode === 'resetPassword' || mode === 'verifyEmail' || !mode) && oobCode) {
          setResetOobCode(oobCode);
        }
      } catch {
        // Safe query parsing
      }
    }
  }, []);

  // STATE 1: Authentication is still initializing
  // Shows clean branded splash screen ("Loading your account..."). Never redirect.
  if (loading || authStatus === 'AUTH_INITIALIZING') {
    return (
      <div className="min-h-screen bg-[#090e17] text-slate-100 flex flex-col items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center max-w-sm text-center">
          {/* Branded Pulse Ring */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 flex items-center justify-center text-white shadow-xl shadow-teal-500/20 ring-1 ring-teal-400/40 animate-pulse">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-teal-500/10 -z-10 blur-md animate-pulse" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-black tracking-tight text-white">
              Nurses<span className="text-teal-400">Study</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
              Portal
            </span>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-300">
            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading your account...</span>
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            Restoring your verified clinical session and learning profile
          </p>

          <div className="mt-8 flex items-center gap-1.5 text-[10px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500/50" />
            <span>Secure Firebase Authentication</span>
          </div>
        </div>
      </div>
    );
  }

  // STATE 2: Firebase reports a valid authenticated user. Render the protected application.
  if (user) {
    return <>{children}</>;
  }

  // STATE 3: Firebase reports no authenticated user. Render the login/register interface.
  return (
    <AuthScreen
      levels={levels}
      initialMode={resetOobCode ? 'reset_password' : 'login'}
      initialOobCode={resetOobCode || undefined}
    />
  );
};
