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
    const passingScore = selectedExam?.passingScore ?? 50;
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (attempt.score / 100) * circumference;

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
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-800/80"
                  />
                  {/* Progress Arc */}
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
                {/* Center Content */}
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
                  {attempt.passed ? 'Status: Passed' : 'Status: Failed'}
                </span>
              </div>
            </div>

            {/* Score Details & Stats Breakdown */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white backdrop-blur-xs border border-white/15">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Automated CBT Examination Result</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {attempt.passed ? '🎉 Excellent Job! Exam Passed' : '⚠️ Examination Threshold Not Met'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                The official passing benchmark is <strong className="text-white">{passingScore}%</strong>. You answered{' '}
                <strong className="text-white">{attempt.correctCount} out of {attempt.totalQuestions} questions</strong> correctly in{' '}
                <strong className="text-white">{Math.round(attempt.timeSpentSeconds / 60)} minutes</strong>.
              </p>

              {/* 3 Metric Gauges Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Passing Cutoff
                  </span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">{passingScore}%</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Avg Speed / Q
                  </span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {attempt.totalQuestions > 0
                      ? Math.round(attempt.timeSpentSeconds / attempt.totalQuestions)
                      : 0}s
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Time
                  </span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {formatTime(attempt.timeSpentSeconds)}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => startExam(selectedExam!.id)}
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
    const answeredCount = Object.values(selectedAnswers).filter(Boolean).length;
    const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col justify-between -mx-4 sm:mx-auto max-w-3xl pb-2 animate-in fade-in duration-150">
        {/* 1. TOP ACTION BAR */}
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

        {/* 2. EXAM/SECTION CONTEXT & 3. QUESTION PROGRESS */}
        <div className="w-full">
          <ExamContextBar
            levelName={examData.levelId ? 'ND1 NURSING' : undefined}
            subjectName={examData.subjectName}
            examTitle={examData.title}
          />

          <QuestionProgress
            currentIndex={currentIndex}
            totalQuestions={totalQ}
            answeredCount={answeredCount}
          />
        </div>

        {/* 4. QUESTION CONTENT & 5. ANSWER OPTIONS (MAIN FOCUS) */}
        <main className="flex-1 flex flex-col justify-start py-2 sm:py-3 space-y-4">
          {currentQ ? (
            <>
              <QuestionContent
                question={currentQ}
                currentIndex={currentIndex}
                totalQuestions={totalQ}
              />

              <AnswerOptions
                questionId={currentQ.id}
                options={currentQ.options || []}
                selectedAnswer={currentAnswer}
                onSelectOption={(optionId) => handleSelectOption(currentQ.id, optionId)}
              />
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No question found at this index.
            </div>
          )}
        </main>

        {/* 6. BOTTOM ACTION BAR */}
        <BottomActionBar
          currentIndex={currentIndex}
          totalQuestions={totalQ}
          onPrevious={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          onNext={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
          onOpenPalette={() => setShowPaletteDrawer(true)}
          onSubmit={() => setShowSubmitConfirm(true)}
        />

        {/* 7. QUESTION PALETTE DRAWER (ACCESSIBLE ON DEMAND) */}
        <QuestionPaletteDrawer
          isOpen={showPaletteDrawer}
          onClose={() => setShowPaletteDrawer(false)}
          questions={examData.questions}
          currentIndex={currentIndex}
          selectedAnswers={selectedAnswers}
          flaggedQuestions={flaggedQuestions}
          onSelectQuestion={(idx) => setCurrentIndex(idx)}
          onSubmitClick={() => setShowSubmitConfirm(true)}
        />

        {/* 9. SUBMIT / FINISH EXAM CONFIRMATION DIALOG */}
        <ExamSubmitDialog
          isOpen={showSubmitConfirm}
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={handleSubmitExam}
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
            setExamData(null);
            setSelectedExam(null);
            if (onNavigateHome) onNavigateHome();
          }}
        />
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
