import React from 'react';
import { ArrowLeft, Flag, Clock, LayoutGrid, CheckCircle } from 'lucide-react';

interface ExamTopBarProps {
  onExitClick: () => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  secondsRemaining: number;
  formatTime: (sec: number) => string;
  onOpenPalette: () => void;
  onSubmitClick: () => void;
  answeredCount: number;
  totalQuestions: number;
}

export const ExamTopBar: React.FC<ExamTopBarProps> = ({
  onExitClick,
  isFlagged,
  onToggleFlag,
  secondsRemaining,
  formatTime,
  onOpenPalette,
  onSubmitClick,
  answeredCount,
  totalQuestions,
}) => {
  const isTimeLow = secondsRemaining <= 300; // <= 5 min
  const isTimeCritical = secondsRemaining <= 60; // <= 1 min

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-800/90 shadow-sm">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 h-13 flex items-center justify-between gap-2">
        {/* Left: Back / Exit & Flag Tool */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onExitClick}
            className="h-9 px-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 active:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Exit Examination"
            aria-label="Exit examination"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Exit</span>
          </button>

          <button
            type="button"
            onClick={onToggleFlag}
            className={`h-9 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
              isFlagged
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/80'
            }`}
            title={isFlagged ? 'Question flagged for review' : 'Flag question for review'}
            aria-label={isFlagged ? 'Unflag question' : 'Flag question'}
          >
            <Flag
              className={`w-3.5 h-3.5 transition-colors ${
                isFlagged ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>
        </div>

        {/* Center: Live Countdown Timer */}
        <div className="flex items-center justify-center shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider transition-all border ${
              isTimeCritical
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/20'
                : isTimeLow
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700/80 text-teal-300'
            }`}
            title="Time Remaining"
          >
            <Clock
              className={`w-3.5 h-3.5 ${
                isTimeCritical ? 'text-rose-400' : isTimeLow ? 'text-amber-400' : 'text-teal-400'
              }`}
            />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        </div>

        {/* Right: Question Palette Trigger & Submit Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPalette}
            className="h-9 px-2.5 rounded-lg text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
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
            className="h-9 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm shadow-teal-900/30 cursor-pointer"
            title="Finish & Submit Exam"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Finish</span>
          </button>
        </div>
      </div>
    </header>
  );
};
