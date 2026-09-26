import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { TheoryMarkingResponse } from '../../types';

interface AiTheoryMarkingProps {
  question: string;
  expectedAnswer: string;
  studentAnswer: string;
  maxMarks?: number;
  category?: string;
}

export const AiTheoryMarking: React.FC<AiTheoryMarkingProps> = ({
  question,
  expectedAnswer,
  studentAnswer,
  maxMarks = 10,
  category,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<TheoryMarkingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestMarking = async () => {
    if (evaluation) {
      setIsOpen(!isOpen);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.markTheory({
        question,
        expectedAnswer,
        studentAnswer,
        maxMarks,
        category,
      });

      // Strict client-side validation
      const safeMax = Math.max(1, Number(data.maxMarks) || maxMarks);
      const safeScore = Math.max(0, Math.min(safeMax, Number(data.score) || 0));

      setEvaluation({
        ...data,
        score: safeScore,
        maxMarks: safeMax,
        pointsCorrect: Array.isArray(data.pointsCorrect) ? data.pointsCorrect : [],
        pointsPartial: Array.isArray(data.pointsPartial) ? data.pointsPartial : [],
        pointsMissed: Array.isArray(data.pointsMissed) ? data.pointsMissed : [],
      });
    } catch (err: any) {
      console.warn('AI Theory marking notice:', err);
      setErrorMsg(
        err.message ||
          'AI theory marking is temporarily unavailable. You can compare your answer directly with the model answer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={handleRequestMarking}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span>Evaluating with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Marking Assessment</span>
            {isOpen ? (
              <ChevronUp className="w-3 h-3 text-slate-400 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            )}
          </>
        )}
      </button>

      {isOpen && (
        <div className="mt-3 p-5 bg-[#0d1424] rounded-2xl border border-purple-500/40 text-xs text-slate-200 space-y-4 animate-in fade-in duration-200 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-purple-300 text-xs uppercase tracking-wider">
                AI Rubric Assessment
              </span>
            </div>
            {evaluation && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 font-mono font-bold text-xs">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Score: {evaluation.score} / {evaluation.maxMarks}
                </span>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="py-6 flex flex-col items-center justify-center gap-2.5 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span>Analyzing substance against expected clinical criteria...</span>
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

          {evaluation && (
            <div className="space-y-4">
              {/* Score Gauge / Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Performance Benchmark</span>
                  <span className="font-bold text-purple-300">
                    {Math.round((evaluation.score / evaluation.maxMarks) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, (evaluation.score / evaluation.maxMarks) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Points Correctly Covered */}
              {evaluation.pointsCorrect.length > 0 && (
                <div className="p-3 bg-emerald-950/25 border border-emerald-500/30 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Points Correctly Covered ({evaluation.pointsCorrect.length}):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-200 pl-1">
                    {evaluation.pointsCorrect.map((p, i) => (
                      <li key={i} className="leading-relaxed">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Partially Explained Points */}
              {evaluation.pointsPartial.length > 0 && (
                <div className="p-3 bg-amber-950/25 border border-amber-500/30 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Partially Covered / Needs Elaboration ({evaluation.pointsPartial.length}):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-200 pl-1">
                    {evaluation.pointsPartial.map((p, i) => (
                      <li key={i} className="leading-relaxed">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Points Missed */}
              {evaluation.pointsMissed.length > 0 && (
                <div className="p-3 bg-rose-950/25 border border-rose-500/30 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    Important Points Missed ({evaluation.pointsMissed.length}):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-200 pl-1">
                    {evaluation.pointsMissed.map((p, i) => (
                      <li key={i} className="leading-relaxed">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examiner Constructive Feedback */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                  Examiner Educational Feedback:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {evaluation.feedback}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 pt-1">
                * Note: AI marking serves as educational feedback against standard council rubrics and does not alter official student attempt records.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
