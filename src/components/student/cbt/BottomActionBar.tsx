import React from 'react';
import { ArrowLeft, ArrowRight, Check, LayoutGrid } from 'lucide-react';

interface BottomActionBarProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onOpenPalette: () => void;
  onSubmit: () => void;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onOpenPalette,
  onSubmit,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= totalQuestions - 1;

  return (
    <nav
      className="sticky bottom-0 z-20 w-full bg-[#0c121e]/95 backdrop-blur-md border-t border-slate-800/90 py-2.5 px-3 sm:px-4 shadow-lg"
      aria-label="Question Navigation"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Previous Question Button */}
        <button
          type="button"
          disabled={isFirst}
          onClick={onPrevious}
          className="h-10 px-3 sm:px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label="Previous question"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        {/* Center: Question Palette Pill */}
        <button
          type="button"
          onClick={onOpenPalette}
          className="h-10 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Open Question Palette"
          aria-label="Open question navigator palette"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-mono text-white">
            {currentIndex + 1}
            <span className="text-slate-500 font-normal"> / {totalQuestions}</span>
          </span>
        </button>

        {/* Next or Finish Button */}
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-teal-900/40 cursor-pointer"
            aria-label="Finish and submit examination"
          >
            <span>Finish</span>
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-teal-900/40 cursor-pointer"
            aria-label="Next question"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </nav>
  );
};
