import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/95 text-slate-950 font-semibold text-xs shadow-xl backdrop-blur-md border border-amber-400/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Viewing saved study notes & question banks</span>
      <Database className="w-3 h-3 ml-1 opacity-70" />
    </div>
  );
};
