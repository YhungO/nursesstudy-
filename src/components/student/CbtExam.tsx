import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CBTExam, Question, ExamAttempt } from '../../types';
import { api } from '../../services/api';
import { saveAttemptToFirestore } from '../../services/firestoreService';
import { cbtSessionManager, CbtActiveSession } from '../../services/cbtSessionManager';
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
  HelpCircle,
  RefreshCw,
  Info,
  AlertCircle,
} from 'lucide-react';
import { ExamTopBar } from './cbt/ExamTopBar';
import { ExamContextBar } from './cbt/ExamContextBar';
import { QuestionProgress } from './cbt/QuestionProgress';
import { QuestionContent } from './cbt/QuestionContent';
import { AnswerOptions } from './cbt/AnswerOptions';
import { BottomActionBar } from './cbt/BottomActionBar';
import { QuestionPaletteDrawer } from './cbt/QuestionPaletteDrawer';
import { ExamSubmitDialog } from './cbt/ExamSubmitDialog';
import { ExamExitDialog } from './cbt/ExamExitDialog';

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
  onNavigateHome,
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);

  // Session restoration and failure banners
  const [restoredBanner, setRestoredBanner] = useState<{ message: string; count: number } | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Result state
  const [examResult, setExamResult] = useState<{
    attempt: ExamAttempt;
    detailedAnswers: any[];
  } | null>(null);

  // CRITICAL REFS: Bypasses React state stale closures during async callbacks and setInterval ticks
  const answersRef = useRef<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const examDataRef = useRef<(CBTExam & { questions: Question[] }) | null>(null);
  const examStartTimeRef = useRef<number>(Date.now());
  const examEndTimeRef = useRef<number>(0);
  const timerRef = useRef<any>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const hasSubmittedRef = useRef<boolean>(false);

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync examData to ref
  useEffect(() => {
    examDataRef.current = examData;
  }, [examData]);

  // Sync selectedAnswers to ref continuously
  useEffect(() => {
    answersRef.current = { ...selectedAnswers };
  }, [selectedAnswers]);

  // Central Submission Handler
  const submitCBT = useCallback(
    async (reason: 'manual' | 'timeout' | 'forced') => {
      // 1. Concurrency lock to prevent double submissions
      if (hasSubmittedRef.current || isSubmittingRef.current) {
        return;
      }
      hasSubmittedRef.current = true;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setShowSubmitConfirm(false);
      setSubmissionError(null);

      // 2. Stop timer immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const currentExam = examDataRef.current;
      if (!currentExam) {
        hasSubmittedRef.current = false;
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // 3. Obtain the absolute latest answers from synchronous ref
      const finalAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | null> = {
        ...answersRef.current,
      };

      // 4. Fallback check: merge any answers saved in persistent local storage
      const savedSession = cbtSessionManager.getSession(currentExam.id);
      if (savedSession?.answers) {
        for (const [qid, opt] of Object.entries(savedSession.answers)) {
          if ((finalAnswers[qid] === undefined || finalAnswers[qid] === null) && opt !== null) {
            finalAnswers[qid] = opt;
          }
        }
      }

      // 5. Calculate exam duration and time spent
      const totalDurationSec = (currentExam.durationMinutes || 30) * 60;
      const elapsedSec = Math.floor((Date.now() - examStartTimeRef.current) / 1000);
      const timeSpentSeconds =
        reason === 'timeout'
          ? totalDurationSec
          : Math.min(totalDurationSec, Math.max(1, elapsedSec));

      try {
        const result = await api.submitExam(currentExam.id, {
          answers: finalAnswers,
          timeSpentSeconds,
          submissionReason: reason,
        });

        // Clear active session upon verified submission
        cbtSessionManager.clearSession(currentExam.id);
        cbtSessionManager.removePendingSubmission(currentExam.id);

        setExamResult(result);

        // Background sync to Firestore
        if (result?.attempt) {
          saveAttemptToFirestore(result.attempt).catch((err) => {
            console.warn('[CBT] Notice: background sync to Firestore:', err);
          });
        }
      } catch (err: any) {
        console.error('[CBT] Submission network error:', err);

        // Queue in pending submissions for offline recovery
        cbtSessionManager.savePendingSubmission({
          examId: currentExam.id,
          answers: finalAnswers,
          timeSpentSeconds,
          submissionReason: reason,
          timestamp: Date.now(),
        });

        setSubmissionError(
          err.message ||
            'Network connectivity error while submitting. All your answers are safely preserved on your device. Please click "Retry Submission" below.'
        );

        // Unlock submission state so the student can retry without losing their work
        hasSubmittedRef.current = false;
        isSubmittingRef.current = false;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  // Start or resume an examination
  const startExam = async (examId: string) => {
    setLoading(true);
    setError(null);
    setSubmissionError(null);
    setRestoredBanner(null);
    hasSubmittedRef.current = false;
    isSubmittingRef.current = false;

    try {
      const data = await api.getExamDetails(examId);
      examDataRef.current = data;
      setExamData(data);
      setSelectedExam(data);

      // Check for active preserved session in localStorage
      const existingSession = cbtSessionManager.getSession(examId);

      if (existingSession && existingSession.endTime) {
        const now = Date.now();
        const isExpired = now >= existingSession.endTime;

        if (!isExpired) {
          // RESTORE ACTIVE IN-PROGRESS SESSION
          const restoredAnswers = existingSession.answers || {};
          answersRef.current = { ...restoredAnswers };
          setSelectedAnswers({ ...restoredAnswers });
          setFlaggedQuestions(existingSession.flaggedQuestions || {});
          setCurrentIndex(
            Math.min(
              (data.questions?.length || 1) - 1,
              Math.max(0, existingSession.currentIndex || 0)
            )
          );

          examStartTimeRef.current = existingSession.startTime;
          examEndTimeRef.current = existingSession.endTime;

          const remainingSec = Math.max(0, Math.ceil((existingSession.endTime - now) / 1000));
          setSecondsRemaining(remainingSec);

          const answeredCount = Object.values(restoredAnswers).filter(Boolean).length;
          setRestoredBanner({
            message: `Active CBT session resumed. ${answeredCount} answered question${
              answeredCount === 1 ? '' : 's'
            } preserved.`,
            count: answeredCount,
          });

          setExamResult(null);
          return;
        } else {
          // Prior session expired: Clear it so the student can start a fresh session
          cbtSessionManager.clearSession(examId);
        }
      }

      // INITIALIZE BRAND NEW SESSION
      const now = Date.now();
      const durationSec = (data.durationMinutes || 30) * 60;
      const deadline = now + durationSec * 1000;

      examStartTimeRef.current = now;
      examEndTimeRef.current = deadline;
      answersRef.current = {};
      setSelectedAnswers({});
      setFlaggedQuestions({});
      setCurrentIndex(0);
      setSecondsRemaining(durationSec);
      setExamResult(null);

      // Persist fresh session immediately
      cbtSessionManager.saveSession({
        examId: data.id,
        examTitle: data.title,
        startTime: now,
        endTime: deadline,
        durationMinutes: data.durationMinutes || 30,
        currentIndex: 0,
        answers: {},
        flaggedQuestions: {},
        lastUpdated: now,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to initialize CBT examination');
    } finally {
      setLoading(false);
    }
  };

  // Auto-start if activeExamId was provided
  useEffect(() => {
    if (activeExamId) {
      startExam(activeExamId);
    }
  }, [activeExamId]);

  // Wall-Clock Timer Loop & Mobile Tab Visibility Listener
  useEffect(() => {
    if (!examData || examResult) return;

    const checkTimerTick = () => {
      if (hasSubmittedRef.current || isSubmittingRef.current) return;

      const now = Date.now();
      const deadline = examEndTimeRef.current;
      if (!deadline) return;

      const remainingSec = Math.max(0, Math.ceil((deadline - now) / 1000));
      setSecondsRemaining(remainingSec);

      if (remainingSec <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        submitCBT('timeout');
      }
    };

    // Run immediately
    checkTimerTick();

    // Tick every 1000ms
    timerRef.current = setInterval(checkTimerTick, 1000);

    // Resilient to phone sleep, background tabs, and browser throttling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTimerTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkTimerTick);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkTimerTick);
    };
  }, [examData?.id, !!examResult, submitCBT]);

  // Retry offline pending submissions when online
  useEffect(() => {
    const handleOnline = () => {
      const pendingList = cbtSessionManager.getPendingSubmissions();
      if (pendingList.length > 0 && examData) {
        const matching = pendingList.find((p) => p.examId === examData.id);
        if (matching && !examResult && !isSubmittingRef.current) {
          submitCBT(matching.submissionReason);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [examData, examResult, submitCBT]);

  // Option selection with immediate ref update and persistent auto-save
  const handleSelectOption = (questionId: string | number, option: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmittingRef.current || hasSubmittedRef.current) return;
    const qKey = String(questionId);

    // 1. Immediately update ref (synchronous source of truth)
    answersRef.current[qKey] = option;

    // 2. Update React state
    setSelectedAnswers((prev) => {
      const next = { ...prev, [qKey]: option };

      // 3. Immediately persist to localStorage
      if (examDataRef.current) {
        cbtSessionManager.saveSession({
          examId: examDataRef.current.id,
          examTitle: examDataRef.current.title,
          startTime: examStartTimeRef.current,
          endTime: examEndTimeRef.current,
          durationMinutes: examDataRef.current.durationMinutes || 30,
          currentIndex,
          answers: next,
          flaggedQuestions,
          lastUpdated: Date.now(),
        });
      }

      return next;
    });
  };

  // Flag toggle with persistent auto-save
  const toggleFlag = (questionId: string | number) => {
    if (isSubmittingRef.current || hasSubmittedRef.current) return;
    const qKey = String(questionId);

    setFlaggedQuestions((prev) => {
      const next = { ...prev, [qKey]: !prev[qKey] };

      if (examDataRef.current) {
        cbtSessionManager.saveSession({
          examId: examDataRef.current.id,
          examTitle: examDataRef.current.title,
          startTime: examStartTimeRef.current,
          endTime: examEndTimeRef.current,
          durationMinutes: examDataRef.current.durationMinutes || 30,
          currentIndex,
          answers: answersRef.current,
          flaggedQuestions: next,
          lastUpdated: Date.now(),
        });
      }

      return next;
    });
  };

  // Navigation handlers
  const handleNext = () => {
    if (!examData) return;
    const nextIdx = Math.min(examData.questions.length - 1, currentIndex + 1);
    setCurrentIndex(nextIdx);
    if (examDataRef.current) {
      cbtSessionManager.saveSession({
        examId: examDataRef.current.id,
        examTitle: examDataRef.current.title,
        startTime: examStartTimeRef.current,
        endTime: examEndTimeRef.current,
        durationMinutes: examDataRef.current.durationMinutes || 30,
        currentIndex: nextIdx,
        answers: answersRef.current,
        flaggedQuestions,
        lastUpdated: Date.now(),
      });
    }
  };

  const handlePrevious = () => {
    if (!examData) return;
    const prevIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(prevIdx);
    if (examDataRef.current) {
      cbtSessionManager.saveSession({
        examId: examDataRef.current.id,
        examTitle: examDataRef.current.title,
        startTime: examStartTimeRef.current,
        endTime: examEndTimeRef.current,
        durationMinutes: examDataRef.current.durationMinutes || 30,
        currentIndex: prevIdx,
        answers: answersRef.current,
        flaggedQuestions,
        lastUpdated: Date.now(),
      });
    }
  };

  const handleSelectQuestion = (idx: number) => {
    if (!examData) return;
    setCurrentIndex(idx);
    setShowPaletteDrawer(false);
    if (examDataRef.current) {
      cbtSessionManager.saveSession({
        examId: examDataRef.current.id,
        examTitle: examDataRef.current.title,
        startTime: examStartTimeRef.current,
        endTime: examEndTimeRef.current,
        durationMinutes: examDataRef.current.durationMinutes || 30,
        currentIndex: idx,
        answers: answersRef.current,
        flaggedQuestions,
        lastUpdated: Date.now(),
      });
    }
  };

  // ==================== VIEW 1: COMPLETED RESULT DISPLAY ==================== //
  if (examResult) {
    const { attempt, detailedAnswers } = examResult;
    const passingScore = selectedExam?.passingScore ?? 50;
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (attempt.score / 100) * circumference;

    const answeredCount = Array.isArray(attempt.answers)
      ? attempt.answers.filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length
      : attempt.correctCount;
    const unansweredCount = Math.max(0, attempt.totalQuestions - answeredCount);
    const wrongCount = Math.max(0, attempt.totalQuestions - attempt.correctCount);
    const isTimeout = attempt.submissionReason === 'timeout';

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in">
        {/* Score Hero Banner with Circular Progress Gauge */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${
            attempt.passed
              ? 'bg-gradient-to-br from-emerald-950/80 via-[#0c1f19] to-teal-950/90 text-white border-emerald-500/40'
              : 'bg-gradient-to-br from-rose-950/80 via-[#1f0d14] to-slate-900/90 text-white border-rose-500/40'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Circular Gauge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-800/80"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${
                      attempt.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    {attempt.score}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300 mt-0.5">
                    {attempt.correctCount}/{attempt.totalQuestions} Correct
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span
                  className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    attempt.passed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {attempt.passed ? 'Status: Passed' : 'Status: Examination Failed'}
                </span>
              </div>
            </div>

            {/* Score Details & Stats Breakdown */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white backdrop-blur-xs border border-white/15">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verified CBT Examination Result</span>
                </div>

                {/* Submission Mode Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                    isTimeout
                      ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                      : 'bg-teal-950/70 border-teal-500/40 text-teal-300'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {isTimeout ? 'Auto-submitted (Timer Expired)' : 'Submitted by Student'}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {attempt.passed ? '🎉 Congratulations! Benchmark Achieved' : '⚠️ Examination Threshold Not Met'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Official passing benchmark is <strong className="text-white">{passingScore}%</strong>. You answered{' '}
                <strong className="text-white">{answeredCount} of {attempt.totalQuestions} questions</strong> ({attempt.correctCount} correct, {wrongCount} wrong, {unansweredCount} unanswered) in{' '}
                <strong className="text-white">{Math.round(attempt.timeSpentSeconds / 60)} minutes</strong>.
              </p>

              {/* 4 Metric Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Answered
                  </span>
                  <span className="text-base font-extrabold text-teal-400 mt-0.5 block">
                    {answeredCount}/{attempt.totalQuestions}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Unanswered
                  </span>
                  <span className={`text-base font-extrabold mt-0.5 block ${unansweredCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {unansweredCount}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Correct Keys
                  </span>
                  <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
                    {attempt.correctCount}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Time Spent
                  </span>
                  <span className="text-base font-extrabold text-white mt-0.5 block font-mono">
                    {formatTime(attempt.timeSpentSeconds)}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => selectedExam && startExam(selectedExam.id)}
                  className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
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
                  className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <span>Back to CBT Lobby</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Clinical Performance & Rationales Breakdown
            </h2>
            <span className="text-xs font-medium text-slate-400">
              Review correct keys and clinical distractors
            </span>
          </div>

          {detailedAnswers.map((item, idx) => {
            const isCorrect = item.isCorrect;
            const isUnanswered = item.selectedOption === null || item.selectedOption === undefined;

            return (
              <div
                key={item.questionId || idx}
                className={`p-6 bg-[#111827] rounded-2xl border transition-all shadow-md ${
                  isCorrect
                    ? 'border-emerald-500/40'
                    : isUnanswered
                    ? 'border-slate-700'
                    : 'border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isUnanswered
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                      </>
                    ) : isUnanswered ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Not Answered (0)
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
                  {(item.options || []).map((opt: any, optIdx: number) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const optObj =
                      typeof opt === 'string'
                        ? { id: letters[optIdx] || 'A', text: opt }
                        : opt;

                    const isOptionCorrect = optObj.id === item.correctOption;
                    const isSelectedByStudent = optObj.id === item.selectedOption;

                    let optStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
                    if (isOptionCorrect) {
                      optStyle =
                        'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/40';
                    } else if (isSelectedByStudent && !isOptionCorrect) {
                      optStyle =
                        'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                    }

                    return (
                      <div
                        key={optObj.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center">
                            {optObj.id}
                          </span>
                          <span>{optObj.text}</span>
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

                {/* Clinical Rationale */}
                <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-slate-200 space-y-1">
                  <div className="font-bold text-teal-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    <span>Clinical Rationale</span>
                  </div>
                  <p className="leading-relaxed">
                    {item.explanation || item.rationale || 'No rationale available.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== VIEW: LOADING CBT SESSION ==================== //
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 shadow-md">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          </div>
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Preparing Examination Hall
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Loading examination questions, configuring 45-minute countdown timer, and initializing auto-save session...
          </p>
        </div>
      </div>
    );
  }

  // ==================== VIEW: ERROR STATE WITH RETRY ==================== //
  if (error && !examData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-white">
            Unable to Load Examination
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              const targetId = (selectedExam && selectedExam.id) || activeExamId || (exams.length > 0 ? exams[0].id : null);
              if (targetId) {
                startExam(targetId);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Examination</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setExamData(null);
              setSelectedExam(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>Back to Hall</span>
          </button>
        </div>
      </div>
    );
  }

  // ==================== VIEW 2: ACTIVE EXAMINATION TESTING SESSION ==================== //
  if (examData) {
    const questions = Array.isArray(examData.questions) ? examData.questions : [];
    const totalQ = questions.length;

    if (totalQ === 0) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">No Questions Available</h2>
            <p className="text-xs text-slate-400">
              This examination currently has no registered questions. Please contact your administrator.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setExamData(null);
              setSelectedExam(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Return to CBT Hall
          </button>
        </div>
      );
    }

    const safeIndex = Math.max(0, Math.min(currentIndex, totalQ - 1));
    const currentQ = questions[safeIndex] || null;
    const isFlagged = currentQ ? !!flaggedQuestions[currentQ.id] : false;
    const currentAnswer = currentQ ? selectedAnswers[currentQ.id] : null;
    const answeredCount = Object.values(selectedAnswers).filter(Boolean).length;
    const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col justify-between -mx-4 sm:mx-auto max-w-3xl pb-2 animate-in fade-in duration-150">
        {/* TOP ACTION BAR WITH LIVE COUNTDOWN TIMER */}
        <ExamTopBar
          onExitClick={() => setShowExitConfirm(true)}
          isFlagged={isFlagged}
          onToggleFlag={() => currentQ && toggleFlag(currentQ.id)}
          secondsRemaining={secondsRemaining}
          formatTime={formatTime}
          onOpenPalette={() => setShowPaletteDrawer(true)}
          onSubmitClick={() => setShowSubmitConfirm(true)}
          answeredCount={answeredCount}
          totalQuestions={totalQ}
        />

        {/* RESTORED SESSION BANNER */}
        {restoredBanner && (
          <div className="mx-4 mt-2 p-3 bg-teal-950/70 border border-teal-500/40 rounded-xl text-xs text-teal-200 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{restoredBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setRestoredBanner(null)}
              className="text-teal-400 hover:text-white text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SUBMISSION NETWORK NOTICE / RETRY BUTTON */}
        {submissionError && (
          <div className="mx-4 mt-2 p-4 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 space-y-2 shadow-lg animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">Submission Incomplete</p>
                <p className="mt-0.5 leading-relaxed">{submissionError}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => submitCBT('timeout')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>Retry Submission</span>
              </button>
            </div>
          </div>
        )}

        {/* EXAM/SECTION CONTEXT & QUESTION PROGRESS */}
        <div className="w-full">
          <ExamContextBar
            levelName={examData.levelId ? 'ND1 NURSING' : undefined}
            subjectName={examData.subjectName}
            examTitle={examData.title}
          />

          <QuestionProgress
            currentIndex={safeIndex}
            totalQuestions={totalQ}
            answeredCount={answeredCount}
          />
        </div>

        {/* QUESTION CONTENT & MULTIPLE-CHOICE OPTIONS */}
        <div className="flex-1 flex flex-col justify-center py-2 sm:py-4">
          {currentQ ? (
            <div className="space-y-4">
              <QuestionContent
                question={currentQ}
                questionId={currentQ.id}
                scenario={currentQ.scenario}
                questionText={currentQ.questionText || currentQ.question || ''}
                currentIndex={safeIndex}
                totalQuestions={totalQ}
              />

              <AnswerOptions
                questionId={currentQ.id}
                options={currentQ.options || []}
                selectedAnswer={currentAnswer}
                onSelectOption={(opt) => handleSelectOption(currentQ.id, opt)}
              />
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400 text-xs">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <span>No questions found for this examination.</span>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION ACTION BAR (PREV / PALETTE / NEXT or FINISH) */}
        <BottomActionBar
          currentIndex={safeIndex}
          totalQuestions={totalQ}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onOpenPalette={() => setShowPaletteDrawer(true)}
          onSubmit={() => setShowSubmitConfirm(true)}
        />

        {/* QUESTION PALETTE DRAWER */}
        <QuestionPaletteDrawer
          isOpen={showPaletteDrawer}
          onClose={() => setShowPaletteDrawer(false)}
          questions={questions}
          currentIndex={safeIndex}
          selectedAnswers={selectedAnswers}
          flaggedQuestions={flaggedQuestions}
          onSelectQuestion={handleSelectQuestion}
          onSubmitClick={() => {
            setShowPaletteDrawer(false);
            setShowSubmitConfirm(true);
          }}
        />

        {/* SUBMIT / FINISH CONFIRMATION DIALOG */}
        <ExamSubmitDialog
          isOpen={showSubmitConfirm}
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={() => submitCBT('manual')}
          answeredCount={answeredCount}
          totalQuestions={totalQ}
          flaggedCount={flaggedCount}
          secondsRemaining={secondsRemaining}
          formatTime={formatTime}
          isSubmitting={isSubmitting}
        />

        {/* EXIT CONFIRMATION DIALOG */}
        <ExamExitDialog
          isOpen={showExitConfirm}
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={() => {
            setShowExitConfirm(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (examData) {
              cbtSessionManager.clearSession(examData.id);
            }
            setExamData(null);
            setSelectedExam(null);
            if (onNavigateHome) onNavigateHome();
          }}
        />
      </div>
    );
  }

  // ==================== VIEW 3: EXAMINATION LOBBY ==================== //
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-400" />
          <span>Timed Computer-Based Testing (CBT) Hall</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Simulate nursing council examination conditions with active wall-clock countdown timers, auto-save state recovery, and automated grading.
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
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
