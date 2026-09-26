import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { McqExplanationResponse } from '../../types';

interface AiMcqExplanationProps {
  question: string;
  options: { id: string; text: string }[];
  correctOption: string;
  selectedOption: string | null;
  scenario?: string;
  rationale?: string;
}

export const AiMcqExplanation: React.FC<AiMcqExplanationProps> = ({
  question,
  options,
  correctOption,
  selectedOption,
  scenario,
  rationale,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<McqExplanationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFetchExplanation = async () => {
    if (explanation) {
      setIsOpen(!isOpen);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.explainMcq({
        question,
        options,
        correctOption,
        selectedOption,
        scenario,
        rationale,
      });
      setExplanation(data);
    } catch (err: any) {
      console.warn('AI explanation notice:', err);
      setErrorMsg(
        err.message ||
          'AI assistance is temporarily unavailable. You can continue using the normal CBT features.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-2">
      {/* Optional Trigger Button */}
      <button
        type="button"
        onClick={handleFetchExplanation}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 via-sky-500/15 to-indigo-500/20 hover:from-teal-500/30 hover:to-indigo-500/30 text-teal-300 hover:text-white border border-teal-500/40 text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
            <span>Analyzing with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Explain with AI</span>
            {isOpen ? (
              <ChevronUp className="w-3 h-3 text-slate-400 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            )}
          </>
        )}
      </button>

      {/* Expandable Explanation Panel */}
      {isOpen && (
        <div className="mt-3 p-4 bg-[#0d1424] rounded-2xl border border-teal-500/30 text-xs text-slate-200 space-y-3.5 animate-in fade-in duration-200 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="font-bold text-teal-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              AI Clinical Explanation
            </span>
            <span className="text-[10px] text-slate-500">
              Curriculum-aligned reference
            </span>
          </div>

          {isLoading && (
            <div className="py-4 flex items-center justify-center gap-2.5 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              <span>Generating educational breakdown...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {errorMsg}
              </div>
            </div>
          )}

          {explanation && (
            <div className="space-y-3">
              {/* 1. Why Correct Answer is Correct */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Why Option {correctOption} is Correct:</span>
                </div>
                <p className="text-slate-200 leading-relaxed pl-5">
                  {explanation.whyCorrect}
                </p>
              </div>

              {/* 2. Why Student's Answer was Correct or Incorrect */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  selectedOption === correctOption
                    ? 'bg-teal-950/30 border-teal-500/30'
                    : 'bg-amber-950/30 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-300">
                  {selectedOption === correctOption ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>
                    Your Choice (
                    {selectedOption ? `Option ${selectedOption}` : 'Unanswered'}
                    ):
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed pl-5">
                  {explanation.whyStudentChoice}
                </p>
              </div>

              {/* 3. Important Concept to Remember */}
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sky-300 text-[11px] uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                  <span>Key Clinical Principle to Remember:</span>
                </div>
                <p className="text-slate-200 leading-relaxed pl-5">
                  {explanation.keyTakeaway}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
