import React from 'react';
import { ArrowLeft, Flag, Clock, LayoutGrid, CheckCircle, AlertTriangle, Flame } from 'lucide-react';

interface ExamTopBarProps {
  onExitClick: () => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  secondsRemaining: number;
  totalDurationSeconds?: number;
  formatTime: (sec: number) => string;
  onOpenPalette: () => void;
  onSubmitClick: () => void;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting?: boolean;
}

export const ExamTopBar: React.FC<ExamTopBarProps> = ({
  onExitClick,
  isFlagged,
  onToggleFlag,
  secondsRemaining,
  totalDurationSeconds,
  formatTime,
  onOpenPalette,
  onSubmitClick,
  answeredCount,
  totalQuestions,
  isSubmitting = false,
}) => {
  const isTimeExpired = secondsRemaining <= 0;
  const isTimeCritical = secondsRemaining <= 60 && !isTimeExpired; // <= 1 min
  const isTimeLow = secondsRemaining <= 300 && secondsRemaining > 60; // <= 5 min

  const safeTotalDuration = Math.max(1, totalDurationSeconds || 1800);
  const percentRemaining = Math.max(0, Math.min(100, (secondsRemaining / safeTotalDuration) * 100));

  // Circular gauge calculations (radius = 9, circumference = 2 * PI * 9 ≈ 56.55)
  const ringRadius = 9;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (percentRemaining / 100) * ringCircumference;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-800/90 shadow-md transition-colors">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 h-14 flex items-center justify-between gap-1 sm:gap-2">
        {/* Left: Back / Exit & Flag Tool */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onExitClick}
            disabled={isSubmitting}
            className="h-9 px-2 sm:px-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-50"
            title="Exit Examination"
            aria-label="Exit examination"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <button
            type="button"
            onClick={onToggleFlag}
            disabled={isSubmitting}
            className={`h-9 px-2 sm:px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border disabled:opacity-50 ${
              isFlagged
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-900/20'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/80'
            }`}
            title={isFlagged ? 'Question flagged for review' : 'Flag question for review'}
            aria-label={isFlagged ? 'Unflag question' : 'Flag question'}
          >
            <Flag
              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                isFlagged ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>
        </div>

        {/* Center: Live Countdown Timer with Circular Progress & Urgency Badging */}
        <div className="flex items-center justify-center shrink-0">
          <div
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-2xl text-xs font-mono font-bold tracking-wider transition-all border shadow-md ${
              isTimeExpired
                ? 'bg-rose-950 border-rose-500 text-white animate-pulse ring-2 ring-rose-500/50'
                : isTimeCritical
                ? 'bg-rose-950/90 border-rose-500/90 text-rose-200 animate-pulse ring-2 ring-rose-500/30'
                : isTimeLow
                ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                : 'bg-slate-900/90 border-teal-500/40 text-teal-300'
            }`}
            title={`Time Remaining: ${formatTime(secondsRemaining)} (${Math.round(percentRemaining)}% left)`}
            aria-live="polite"
            aria-label={`Countdown timer: ${formatTime(secondsRemaining)} remaining`}
          >
            {/* Miniature circular countdown gauge */}
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r={ringRadius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-800 opacity-60"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={ringRadius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-linear ${
                    isTimeExpired
                      ? 'text-rose-400'
                      : isTimeCritical
                      ? 'text-rose-400'
                      : isTimeLow
                      ? 'text-amber-400'
                      : 'text-teal-400'
                  }`}
                />
              </svg>
              {isTimeExpired ? (
                <AlertTriangle className="w-2.5 h-2.5 text-rose-300 absolute" />
              ) : isTimeCritical ? (
                <Flame className="w-2.5 h-2.5 text-rose-400 absolute animate-bounce" />
              ) : (
                <Clock
                  className={`w-2.5 h-2.5 absolute ${
                    isTimeLow ? 'text-amber-400' : 'text-teal-400'
                  }`}
                />
              )}
            </div>

            {/* Time Readout */}
            <div className="flex flex-col items-center leading-none">
              <span className="text-xs sm:text-sm font-black tracking-widest">
                {formatTime(secondsRemaining)}
              </span>
              <span
                className={`text-[8px] font-sans font-bold uppercase tracking-wider hidden xs:block mt-0.5 ${
                  isTimeExpired
                    ? 'text-rose-300'
                    : isTimeCritical
                    ? 'text-rose-300'
                    : isTimeLow
                    ? 'text-amber-300/90'
                    : 'text-teal-400/80'
                }`}
              >
                {isTimeExpired
                  ? 'Auto-Submitting'
                  : isTimeCritical
                  ? 'Final 60s'
                  : isTimeLow
                  ? 'Under 5 Mins'
                  : 'Time Remaining'}
              </span>
            </div>

            {/* Pulsing indicator badge */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isTimeExpired
                    ? 'bg-rose-400'
                    : isTimeCritical
                    ? 'bg-rose-500'
                    : isTimeLow
                    ? 'bg-amber-400'
                    : 'bg-teal-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isTimeExpired
                    ? 'bg-rose-500'
                    : isTimeCritical
                    ? 'bg-rose-500'
                    : isTimeLow
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
                }`}
              />
            </span>
          </div>
        </div>

        {/* Right: Question Palette Trigger & Submit Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPalette}
            disabled={isSubmitting}
            className="h-9 px-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
            title="Open Question Palette"
            aria-label="Open Question Palette"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Palette</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {answeredCount}/{totalQuestions}
            </span>
          </button>

          <button
            type="button"
            onClick={onSubmitClick}
            disabled={isSubmitting}
            className="h-9 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-teal-900/30 cursor-pointer disabled:opacity-50"
            title="Finish & Submit Exam"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Visual countdown progress bar spanning the header bottom edge */}
      <div
        className="w-full h-1 bg-slate-800/80 overflow-hidden relative"
        title={`${Math.round(percentRemaining)}% time remaining`}
      >
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isTimeExpired
              ? 'bg-rose-600 w-0'
              : isTimeCritical
              ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 animate-pulse'
              : isTimeLow
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400'
              : 'bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400'
          }`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    </header>
  );
};
