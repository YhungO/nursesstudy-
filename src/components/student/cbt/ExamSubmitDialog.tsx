import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface ExamSubmitDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
  flaggedCount: number;
  secondsRemaining: number;
  formatTime: (sec: number) => string;
  isSubmitting: boolean;
}

export const ExamSubmitDialog: React.FC<ExamSubmitDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  answeredCount,
  totalQuestions,
  flaggedCount,
  secondsRemaining,
  formatTime,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-exam-dialog-title"
    >
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-white animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 id="submit-exam-dialog-title" className="text-base font-bold text-white">
              Finish Exam?
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Are you sure you want to submit? This action will conclude your examination and score your answers.
            </p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Answered Questions:</span>
            <span className="font-bold text-teal-300">
              {answeredCount} of {totalQuestions}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Unanswered Questions:</span>
            <span
              className={`font-bold ${
                unansweredCount > 0 ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {unansweredCount}
            </span>
          </div>

          {flaggedCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Flagged for Review:</span>
              <span className="font-bold text-amber-400">{flaggedCount}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Time Remaining:</span>
            <span className="font-mono font-bold text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              {formatTime(secondsRemaining)}
            </span>
          </div>
        </div>

        {/* Unanswered warning if any */}
        {unansweredCount > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-tight">
              You have <strong>{unansweredCount} unanswered</strong> question
              {unansweredCount > 1 ? 's' : ''}. Unanswered questions will be scored as zero.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Continue Exam
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 rounded-xl transition-colors shadow-lg shadow-teal-950/40 cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Exam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
