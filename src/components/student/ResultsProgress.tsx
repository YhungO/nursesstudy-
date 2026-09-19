import React, { useState, useEffect } from 'react';
import { ExamAttempt } from '../../types';
import { api } from '../../services/api';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface ResultsProgressProps {
  initialAttemptId?: string | null;
  onRetakeExam?: (examId: string) => void;
}

export const ResultsProgress: React.FC<ResultsProgressProps> = ({
  initialAttemptId = null,
}) => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const data = await api.getAttempts();
      setAttempts(data);
      if (initialAttemptId) {
        openAttempt(initialAttemptId);
      }
    } catch (err) {
      console.error('Failed to load attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAttempt = async (attemptId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getAttemptDetails(attemptId);
      setSelectedAttempt(detail);
    } catch (err) {
      console.error('Failed to load attempt detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Aggregated Stats
  const total = attempts.length;
  const passed = attempts.filter((a) => a.passed).length;
  const avg =
    total > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / total) : 0;

  // Single Attempt Drill-Down View
  if (selectedAttempt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedAttempt(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to All Results</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              selectedAttempt.passed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {selectedAttempt.passed ? 'PASSED' : 'NOT PASSED'}
          </span>
        </div>

        {/* Overview Header with Circular Progress Gauge */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-md">
              {selectedAttempt.subjectName}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-2.5">{selectedAttempt.examTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Attempted on {new Date(selectedAttempt.createdAt).toLocaleString()} • Completed in{' '}
              {Math.round(selectedAttempt.timeSpentSeconds / 60)} minutes
            </p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${
                  selectedAttempt.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {selectedAttempt.passed ? 'Status: Passed' : 'Status: Retake Needed'}
              </span>
              <span className="text-xs text-slate-400">
                {selectedAttempt.correctCount} of {selectedAttempt.totalQuestions} Questions Correct
              </span>
            </div>
          </div>

          {/* Visual Gauge */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 - (selectedAttempt.score / 100) * (2 * Math.PI * 40)}
                  strokeLinecap="round"
                  className={selectedAttempt.passed ? 'text-emerald-400' : 'text-rose-400'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-white">{selectedAttempt.score}%</span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">Attempt Question Review</h2>
          {selectedAttempt.answers.map((ans, idx) => (
            <div
              key={idx}
              className={`bg-[#111827] rounded-2xl border p-5 shadow-sm ${
                ans.isCorrect ? 'border-emerald-500/40' : 'border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    ans.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {ans.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              {ans.scenario && (
                <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 mb-2 leading-relaxed">
                  {ans.scenario}
                </p>
              )}

              <h4 className="font-bold text-sm text-white mb-3 leading-snug">{ans.questionText}</h4>

              {ans.options && (
                <div className="space-y-1.5 mb-3">
                  {ans.options.map((opt) => {
                    const isCorrectKey = opt.id === ans.correctOption;
                    const isSelectedKey = opt.id === ans.selectedOption;

                    let optStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
                    if (isCorrectKey) {
                      optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/40';
                    } else if (isSelectedKey && !isCorrectKey) {
                      optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isCorrectKey && (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">
                            Correct Answer
                          </span>
                        )}
                        {isSelectedKey && !isCorrectKey && (
                          <span className="text-[10px] font-bold text-rose-400 uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {ans.explanation && (
                <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-xs text-slate-200">
                  <span className="font-bold text-teal-300 block mb-0.5">Clinical Rationale:</span>
                  {ans.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // All Attempts Listing
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <span>My Examination Results & Progress</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Historical log of your CBT test sessions and multiple-choice question practices.
        </p>
      </div>

      {/* Summary Stat Cards with Circular Visual Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] p-5 rounded-3xl border border-slate-800 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{total}</div>
              <div className="text-xs text-slate-400 font-medium">Examinations Taken</div>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400">
            {total === 1 ? '1 Test' : `${total} Tests`}
          </div>
        </div>

        {/* Gauge Card: Cumulative Average */}
        <div className="bg-[#111827] p-5 rounded-3xl border border-slate-800 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{avg}%</div>
              <div className="text-xs text-slate-400 font-medium">Cumulative Average</div>
            </div>
          </div>

          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-sky-400"
                strokeDasharray={`${avg}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-sky-300">{avg}%</span>
          </div>
        </div>

        {/* Gauge Card: Pass Rate */}
        {(() => {
          const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
          return (
            <div className="bg-[#111827] p-5 rounded-3xl border border-slate-800 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">{passed}</div>
                  <div className="text-xs text-slate-400 font-medium">
                    Passed Exams ({passRate}%)
                  </div>
                </div>
              </div>

              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={passRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}
                    strokeDasharray={`${passRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-emerald-300">{passRate}%</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Attempts Table */}
      {attempts.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl p-12 text-center border border-slate-800">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No examination attempts yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Take a timed CBT test or run through a practice question session to see your results and
            detailed clinical performance metrics here.
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden shadow-md">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Attempt History</h3>
            <span className="text-xs text-slate-400 font-medium">{attempts.length} records</span>
          </div>

          <div className="divide-y divide-slate-800">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                onClick={() => openAttempt(attempt.id)}
                className="p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm border ${
                      attempt.passed
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {attempt.score}%
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{attempt.examTitle}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="text-amber-400">{attempt.subjectName}</span>
                      <span>•</span>
                      <span>
                        {attempt.correctCount} / {attempt.totalQuestions} Correct
                      </span>
                      <span>•</span>
                      <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      attempt.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {attempt.passed ? 'PASSED' : 'RETAKE'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
