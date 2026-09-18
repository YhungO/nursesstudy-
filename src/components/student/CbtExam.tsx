import React, { useState, useEffect, useRef } from 'react';
import { CBTExam, Question, ExamAttempt } from '../../types';
import { api } from '../../services/api';
import { saveAttemptToFirestore } from '../../services/firestoreService';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  ShieldAlert,
  Award,
  BookOpen,
} from 'lucide-react';

interface CbtExamProps {
  exams: CBTExam[];
  activeExamId?: string | null;
  onFinishExam: (attemptId: string) => void;
  onNavigateHome: () => void;
}

export const CbtExam: React.FC<CbtExamProps> = ({
  exams = [],
  activeExamId = null,
  onFinishExam,
}) => {
  const [selectedExam, setSelectedExam] = useState<CBTExam | null>(null);
  const [examData, setExamData] = useState<(CBTExam & { questions: Question[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active testing state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Result state
  const [examResult, setExamResult] = useState<{
    attempt: ExamAttempt;
    detailedAnswers: any[];
  } | null>(null);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Auto-load if activeExamId passed
  useEffect(() => {
    if (activeExamId) {
      const found = exams?.find((e) => e.id === activeExamId);
      if (found) {
        startExam(found.id);
      }
    }
  }, [activeExamId, exams]);

  const startExam = async (examId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExamDetails(examId);
      setExamData(data);
      setSelectedExam(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setFlaggedQuestions({});
      setSecondsRemaining(data.durationMinutes * 60);
      startTimeRef.current = Date.now();
      setExamResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize CBT examination');
    } finally {
      setLoading(false);
    }
  };

  // Timer loop
  useEffect(() => {
    if (!examData || examResult) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleForceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examData, examResult]);

  const handleForceSubmit = () => {
    handleSubmitExam();
  };

  const handleSelectOption = (questionId: string | number, option: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const toggleFlag = (questionId: string | number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleSubmitExam = async () => {
    if (!examData || isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitConfirm(false);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const result = await api.submitExam(examData.id, {
        answers: selectedAnswers,
        timeSpentSeconds,
      });
      setExamResult(result);
      if (result?.attempt) {
        saveAttemptToFirestore(result.attempt).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Result Display View
  if (examResult) {
    const { attempt, detailedAnswers } = examResult;
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in">
        {/* Score Hero Banner */}
        <div
          className={`p-6 sm:p-9 rounded-3xl border text-center relative overflow-hidden shadow-2xl ${
            attempt.passed
              ? 'bg-gradient-to-br from-emerald-950 via-[#0c1f19] to-teal-950 text-white border-emerald-500/50'
              : 'bg-gradient-to-br from-rose-950 via-[#1f0d14] to-slate-900 text-white border-rose-500/50'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-white/10 text-white backdrop-blur-xs border border-white/15">
            <Award className="w-4 h-4" />
            <span>Automated CBT Examination Result</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {attempt.score}%
          </h1>
          <p className="text-lg font-bold mt-2 text-white">
            {attempt.passed ? '🎉 Congratulations! You Passed' : '⚠️ Examination Not Passed'}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
            Passing benchmark is {selectedExam?.passingScore ?? 50}% ({Math.round(((selectedExam?.passingScore ?? 50) / 100) * attempt.totalQuestions)}/{attempt.totalQuestions}). You scored{' '}
            <strong className="text-white">{attempt.correctCount} out of {attempt.totalQuestions} questions</strong> ({attempt.score}%) in{' '}
            {Math.round(attempt.timeSpentSeconds / 60)} minutes.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => startExam(selectedExam!.id)}
              className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-teal-600" />
              <span>Retake Examination</span>
            </button>
            <button
              onClick={() => {
                setExamData(null);
                setExamResult(null);
                onFinishExam(attempt.id);
              }}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <span>Back to CBT Lobby</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Clinical Performance & Rationales Breakdown
            </h2>
            <span className="text-xs font-medium text-slate-400">
              Review correct keys and distractors
            </span>
          </div>

          {detailedAnswers.map((item, idx) => {
            const isCorrect = item.isCorrect;
            return (
              <div
                key={item.questionId}
                className={`p-6 bg-[#111827] rounded-2xl border transition-all shadow-md ${
                  isCorrect ? 'border-emerald-500/40' : 'border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (0)
                      </>
                    )}
                  </span>
                </div>

                {item.scenario && (
                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 mb-3 leading-relaxed">
                    {item.scenario}
                  </p>
                )}

                <h3 className="font-bold text-sm text-white leading-snug mb-3">
                  {item.questionText || item.question}
                </h3>

                {/* Options Review */}
                <div className="space-y-2 mb-4">
                  {((item.options || []).map((opt: any, optIdx: number) => {
                    if (typeof opt === 'string') {
                      const letters = ['A', 'B', 'C', 'D'];
                      return { id: letters[optIdx] || 'A', text: opt };
                    }
                    return opt;
                  })).map((opt: any) => {
                    const isOptionCorrect = opt.id === item.correctOption;
                    const isSelectedByStudent = opt.id === item.selectedOption;

                    let optStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
                    if (isOptionCorrect) {
                      optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/40';
                    } else if (isSelectedByStudent && !isOptionCorrect) {
                      optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isOptionCorrect && (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">
                            Correct Answer
                          </span>
                        )}
                        {isSelectedByStudent && !isOptionCorrect && (
                          <span className="text-[10px] font-bold text-rose-400 uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-slate-200 space-y-1">
                  <div className="font-bold text-teal-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    <span>Clinical Rationale</span>
                  </div>
                  <p className="leading-relaxed">{item.explanation || item.rationale || 'No rationale available.'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Active Testing Session View
  if (examData) {
    const currentQ = examData.questions[currentIndex];
    const totalQ = examData.questions.length;
    const isFlagged = currentQ ? !!flaggedQuestions[currentQ.id] : false;
    const currentAnswer = currentQ ? selectedAnswers[currentQ.id] : null;

    const isTimeLow = secondsRemaining <= 300; // under 5 min
    const isTimeCritical = secondsRemaining <= 60; // under 1 min

    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Top CBT Navigation / Timer Bar */}
        <div className="bg-[#0c121e]/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between flex-wrap gap-4 sticky top-20 z-30">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              {examData.title}
            </span>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              Question <span className="font-bold text-white">{currentIndex + 1}</span> of {totalQ} •{' '}
              <span className="text-purple-300 font-bold">{answeredCount}</span> answered •{' '}
              <span className="text-slate-400 font-bold">{totalQ - answeredCount}</span> unanswered
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Timer Gauge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm tracking-wider shadow-sm ${
                isTimeCritical
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                  : isTimeLow
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-slate-800/90 border-slate-700 text-purple-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-purple-900/30"
            >
              Finish & Submit
            </button>
          </div>
        </div>

        {/* Question Palette Drawer / Matrix */}
        <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 flex-wrap gap-2">
            <span>Question Palette ({totalQ} items):</span>
            <div className="flex items-center gap-3 text-[11px] flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-purple-600"></span> Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700"></span> Unanswered ({totalQ - answeredCount})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
            {examData.questions.map((q, idx) => {
              const isAnswered = !!selectedAnswers[q.id];
              const qFlagged = !!flaggedQuestions[q.id];
              const isCurrent = idx === currentIndex;

              let style = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750';
              if (isCurrent) {
                style = 'ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-900 font-bold text-white';
              }
              if (qFlagged) {
                style = 'bg-amber-500 text-slate-950 border-amber-400 font-bold';
              } else if (isAnswered) {
                style = 'bg-purple-600 text-white border-purple-500 font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium border flex items-center justify-center transition-all ${style}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Question Stem and Choices */}
        {currentQ && (
          <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Question {currentIndex + 1} of {totalQ}
              </span>

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  isFlagged
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            {currentQ.scenario && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-[10px] uppercase tracking-wider text-purple-400 block mb-1">
                  Clinical Vignette
                </span>
                {currentQ.scenario}
              </div>
            )}

            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.questionText || currentQ.question}
            </h2>

            {/* Choices */}
            <div className="space-y-3">
              {(currentQ.options || []).map((option: any, optIdx: number) => {
                const optObj = typeof option === 'string'
                  ? { id: (['A', 'B', 'C', 'D'][optIdx] || 'A') as 'A'|'B'|'C'|'D', text: option }
                  : option;

                const isSelected = currentAnswer === optObj.id;
                return (
                  <button
                    key={optObj.id}
                    onClick={() => handleSelectOption(currentQ.id, optObj.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all text-xs sm:text-sm ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 text-white ring-1 ring-purple-500/40 font-medium'
                        : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {optObj.id}
                    </div>
                    <span className="flex-1 leading-relaxed">{optObj.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Bottom Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < totalQ - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-purple-900/30"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-900/30"
                >
                  <span>Finish & Submit</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#111827] rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Submit CBT Examination?</h3>
                  <p className="text-xs text-slate-400">
                    Are you ready to submit your exam and receive your score?
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Answered Questions:</span>
                  <strong className="text-white">
                    {answeredCount} of {totalQ}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Flagged for Review:</span>
                  <strong className="text-amber-400">
                    {Object.values(flaggedQuestions).filter(Boolean).length}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Time:</span>
                  <strong className="text-white">{formatTime(secondsRemaining)}</strong>
                </div>
              </div>

              {answeredCount < totalQ && (
                <p className="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>You still have {totalQ - answeredCount} unanswered questions!</span>
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-purple-900/30"
                >
                  Confirm & Grade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Examination Lobby View
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-400" />
          <span>Timed Computer-Based Testing (CBT) Hall</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Simulate nursing council examination conditions with an active countdown timer and automated scoring.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl p-12 text-center border border-slate-800">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No CBT Examinations Scheduled</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            The examination hall is currently clear. Examinations created by administrators for the ND 1 curriculum will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-md flex flex-col justify-between hover:border-purple-500/60 hover:shadow-xl transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {exam.subjectName}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-purple-300">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{exam.durationMinutes} mins</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white leading-snug group-hover:text-purple-300 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {exam.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Total Questions</span>
                    <strong className="text-white text-xs">
                      {exam.actualQuestionCount || exam.totalQuestions} Questions
                    </strong>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Pass Benchmark</span>
                    <strong className="text-white text-xs">
                      {exam.passingScore}% Pass ({Math.round(((exam.passingScore || 50) / 100) * (exam.actualQuestionCount || exam.totalQuestions))}/{exam.actualQuestionCount || exam.totalQuestions})
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  disabled={loading}
                  onClick={() => startExam(exam.id)}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>Start Exam</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
