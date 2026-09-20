import React from 'react';

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({
  currentIndex,
  totalQuestions,
  answeredCount,
}) => {
  const currentNumber = totalQuestions > 0 ? currentIndex + 1 : 0;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-1 pb-2">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <h2 className="text-sm font-bold text-white tracking-tight">
          Question <span className="text-teal-400">{currentNumber}</span> of {totalQuestions}
        </h2>
        <div className="text-[11px] font-medium text-slate-400">
          <span className="text-teal-300 font-semibold">{answeredCount}</span> answered
          <span className="text-slate-600 mx-1.5">•</span>
          <span className="text-slate-400">{progressPercent}% done</span>
        </div>
      </div>

      {/* Sleek thin progress bar */}
      <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
