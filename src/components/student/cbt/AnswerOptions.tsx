import React from 'react';
import { QuestionOption } from '../../../types';

interface AnswerOptionsProps {
  questionId: string | number;
  options: (QuestionOption | string)[];
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  onSelectOption: (optionId: 'A' | 'B' | 'C' | 'D') => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options = [],
  selectedAnswer,
  onSelectOption,
}) => {
  const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  return (
    <div
      className="w-full max-w-2xl mx-auto px-4 space-y-2.5 sm:space-y-3"
      role="radiogroup"
      aria-label="Answer choices"
    >
      {options.map((option, idx) => {
        const optionLetter = letters[idx] || 'A';
        const optObj =
          typeof option === 'string'
            ? { id: optionLetter, text: option }
            : option;

        const isSelected = selectedAnswer === optObj.id;

        return (
          <button
            key={optObj.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectOption(optObj.id)}
            className={`w-full min-h-[50px] p-3 sm:p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer group active:scale-[0.99] ${
              isSelected
                ? 'bg-teal-950/40 border-teal-500 text-white shadow-sm ring-1 ring-teal-500/30 font-medium'
                : 'bg-[#111827]/70 border-slate-800/90 hover:bg-slate-900 hover:border-slate-700 text-slate-200'
            }`}
          >
            {/* 1. Letter Indicator (A, B, C, D) */}
            <span
              className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 font-extrabold shadow-xs'
                  : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {optObj.id}
            </span>

            {/* 2. Radio Circle Control (○ / ●) */}
            <span
              className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? 'border-teal-400 bg-teal-500/20'
                  : 'border-slate-600 bg-slate-900/50 group-hover:border-slate-500'
              }`}
              aria-hidden="true"
            >
              {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />}
            </span>

            {/* 3. Answer Text */}
            <span className="flex-1 text-xs sm:text-sm leading-relaxed font-normal">
              {optObj.text}
            </span>
          </button>
        );
      })}
    </div>
  );
};
