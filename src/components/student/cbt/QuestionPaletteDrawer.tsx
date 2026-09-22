import React, { useEffect, useRef } from 'react';
import { Question } from '../../../types';
import { X, CheckCircle, Flag, Circle, Check } from 'lucide-react';

interface QuestionPaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  selectedAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
  flaggedQuestions: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  onSubmitClick: () => void;
}

export const QuestionPaletteDrawer: React.FC<QuestionPaletteDrawerProps> = ({
  isOpen,
  onClose,
  questions = [],
  currentIndex,
  selectedAnswers,
  flaggedQuestions,
  onSelectQuestion,
  onSubmitClick,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalQ = questions.length;
  const answeredCount = Object.values(selectedAnswers).filter(Boolean).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = totalQ - answeredCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Question Navigator Palette"
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] bg-[#111827] border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Question Palette</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({answeredCount}/{totalQ} Answered)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tap any question number to jump directly to it
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close palette"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-teal-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Flagged ({flaggedCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span>Unanswered ({unansweredCount})</span>
          </div>
        </div>

        {/* Questions Number Grid */}
        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {(questions || []).map((q, idx) => {
              if (!q) return null;
              const qId = String(q.id ?? idx);
              const isCurrent = idx === currentIndex;
              const isAnswered = !!selectedAnswers[qId] || !!selectedAnswers[q.id];
              const isFlagged = !!flaggedQuestions[qId] || !!flaggedQuestions[q.id];

              let buttonStyle =
                'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white';

              if (isFlagged) {
                buttonStyle =
                  'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
              } else if (isAnswered) {
                buttonStyle =
                  'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold';
              }

              if (isCurrent) {
                buttonStyle +=
                  ' ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950 font-extrabold text-white';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(idx);
                    onClose();
                  }}
                  className={`h-10 rounded-xl text-xs border flex items-center justify-center relative transition-all cursor-pointer ${buttonStyle}`}
                  aria-label={`Jump to question ${idx + 1}${
                    isAnswered ? ', answered' : ''
                  }${isFlagged ? ', flagged' : ''}`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with Finish Option */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Palette
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSubmitClick();
            }}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-teal-900/40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Finish Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};
