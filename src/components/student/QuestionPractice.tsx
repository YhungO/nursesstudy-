import React, { useState, useMemo } from 'react';
import { Question, Subject } from '../../types';
import { AiMcqExplanation } from './AiMcqExplanation';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Bookmark,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface QuestionPracticeProps {
  questions: Question[];
  subjects: Subject[];
  initialSubjectId?: string | null;
  bookmarkedQuestionIds: (string | number)[];
  onToggleBookmark: (questionId: string | number) => void;
  onRecordAttempt?: (score: number, total: number) => void;
  onNavigateToCbt?: (examId?: string) => void;
}

export const QuestionPractice: React.FC<QuestionPracticeProps> = ({
  questions = [],
  subjects = [],
  initialSubjectId = null,
  bookmarkedQuestionIds = [],
  onToggleBookmark,
  onNavigateToCbt,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectId || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-question state in this practice session
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    Record<string, { selected: 'A' | 'B' | 'C' | 'D'; isCorrect: boolean }>
  >({});

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSubject = selectedSubject === 'all' || q.subjectId === selectedSubject;
      const matchDifficulty =
        selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchSubject && matchDifficulty;
    });
  }, [questions, selectedSubject, selectedDifficulty]);

  const currentQuestion: Question | undefined =
    filteredQuestions[currentIndex] || (filteredQuestions.length > 0 ? filteredQuestions[0] : undefined);

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !currentQuestion || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const correctOpt =
      currentQuestion.correctOption ||
      (typeof currentQuestion.correct === 'number'
        ? (['A', 'B', 'C', 'D'][currentQuestion.correct] as 'A' | 'B' | 'C' | 'D')
        : 'A');

    const isCorrect = selectedOption === correctOpt;
    setSessionResults((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selected: selectedOption,
        isCorrect,
      },
    }));
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const nextQ = filteredQuestions[currentIndex + 1];
      const previousState = sessionResults[nextQ.id];
      if (previousState) {
        setSelectedOption(previousState.selected);
        setIsAnswerSubmitted(true);
      } else {
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const prevQ = filteredQuestions[currentIndex - 1];
      const previousState = sessionResults[prevQ.id];
      if (previousState) {
        setSelectedOption(previousState.selected);
        setIsAnswerSubmitted(true);
      } else {
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      }
    }
  };

  const handleResetSession = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSessionResults({});
  };

  // Session summary stats
  const answeredCount = Object.keys(sessionResults).length;
  const correctCount = (
    Object.values(sessionResults) as { selected: 'A' | 'B' | 'C' | 'D'; isCorrect: boolean }[]
  ).filter((r) => r.isCorrect).length;
  const sessionAccuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const isBookmarked = currentQuestion
    ? bookmarkedQuestionIds.includes(currentQuestion.id)
    : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-sky-400" />
            <span>Clinical MCQ Practice Mode</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Test yourself with immediate feedback and in-depth clinical rationales.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              handleResetSession();
            }}
            className="px-3 py-1.5 bg-[#111827] border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 shadow-sm focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Subjects ({questions.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              handleResetSession();
            }}
            className="px-3 py-1.5 bg-[#111827] border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 shadow-sm focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            onClick={handleResetSession}
            className="p-2 rounded-xl border border-slate-800 bg-[#111827] text-slate-300 hover:text-white hover:bg-slate-800 shadow-sm transition-colors"
            title="Reset Practice Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timed CBT Hall Notification Banner */}
      {onNavigateToCbt && (
        <div className="bg-gradient-to-r from-purple-950/60 via-[#111827] to-teal-950/40 p-4 sm:p-5 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white">ND1 Nursing – Endocrine System CBT</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  45 Mins • 100 MCQs • 50% Pass
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Looking for the official timed examination? The 100-question Endocrine System timed test is now live in the CBT Hall.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToCbt()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/30 shrink-0 flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <span>Enter CBT Hall</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Session Progress Tracker */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Question:</span>
          <span className="text-white font-bold">
            {filteredQuestions.length > 0 ? currentIndex + 1 : 0} of {filteredQuestions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {correctCount} Correct ({sessionAccuracy}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{answeredCount} Answered</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {!currentQuestion ? (
        <div className="bg-[#111827] rounded-3xl p-12 text-center border border-slate-800">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No questions available</h3>
          <p className="text-xs text-slate-400 mt-1">
            No questions match your current subject or difficulty filters. Try selecting another filter.
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-xl overflow-hidden animate-in fade-in">
          {/* Question Header */}
          <div className="p-6 border-b border-slate-800 bg-[#0d1424] flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {currentQuestion.subjectName || 'Nursing'}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md">
                Topic: {currentQuestion.topic}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                  currentQuestion.difficulty === 'Hard'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : currentQuestion.difficulty === 'Medium'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            </div>

            <button
              onClick={() => onToggleBookmark(currentQuestion.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Clinical Scenario Vignette (if present) */}
            {currentQuestion.scenario && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-[10px] uppercase tracking-wider text-sky-400 block mb-1">
                  Clinical Vignette
                </span>
                {currentQuestion.scenario}
              </div>
            )}

            {/* Question Stem */}
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQuestion.questionText || currentQuestion.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3.5">
              {(currentQuestion.options || []).map((option: any, optIdx: number) => {
                const optObj =
                  typeof option === 'string'
                    ? { id: (['A', 'B', 'C', 'D'][optIdx] || 'A') as 'A' | 'B' | 'C' | 'D', text: option }
                    : option;

                const correctOpt =
                  currentQuestion.correctOption ||
                  (typeof currentQuestion.correct === 'number'
                    ? ['A', 'B', 'C', 'D'][currentQuestion.correct]
                    : 'A');

                const isSelected = selectedOption === optObj.id;
                const isCorrect = isAnswerSubmitted && optObj.id === correctOpt;
                const isWrongSelection =
                  isAnswerSubmitted && isSelected && optObj.id !== correctOpt;

                let optionStyles = 'bg-[#0d1424] border-slate-800/90 hover:border-sky-500/50 hover:bg-slate-900/90 text-slate-200';

                if (isSelected && !isAnswerSubmitted) {
                  optionStyles = 'bg-sky-950/70 border-sky-500 text-white ring-2 ring-sky-500/30 shadow-md shadow-sky-950/50';
                } else if (isCorrect) {
                  optionStyles =
                    'bg-emerald-950/70 border-emerald-500 text-white ring-2 ring-emerald-500/30 font-medium shadow-md shadow-emerald-950/50';
                } else if (isWrongSelection) {
                  optionStyles =
                    'bg-rose-950/70 border-rose-500 text-white ring-2 ring-rose-500/30 shadow-md shadow-rose-950/50';
                }

                return (
                  <button
                    key={optObj.id}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(optObj.id)}
                    className={`w-full min-h-[56px] p-4 sm:p-4.5 rounded-2xl border text-left flex items-center gap-4 transition-all text-xs sm:text-sm ${optionStyles} disabled:cursor-default cursor-pointer group`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isCorrect
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : isWrongSelection
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : isSelected
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                          : 'bg-slate-800/90 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {optObj.id}
                    </div>
                    <span className="flex-1 leading-relaxed font-normal sm:font-medium">{optObj.text}</span>
                    {isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isWrongSelection && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Check Button */}
            {!isAnswerSubmitted ? (
              <button
                disabled={!selectedOption}
                onClick={handleCheckAnswer}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-900/30"
              >
                Submit & Check Answer
              </button>
            ) : (
              /* In-depth Clinical Rationale */
              <div
                className={`p-5 rounded-2xl border space-y-2 animate-in fade-in ${
                  selectedOption ===
                  (currentQuestion.correctOption ||
                    (typeof currentQuestion.correct === 'number'
                      ? ['A', 'B', 'C', 'D'][currentQuestion.correct]
                      : 'A'))
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>
                    Clinical Rationale (Correct Answer:{' '}
                    {currentQuestion.correctOption ||
                      (typeof currentQuestion.correct === 'number'
                        ? ['A', 'B', 'C', 'D'][currentQuestion.correct]
                        : 'A')}
                    )
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {currentQuestion.explanation || currentQuestion.rationale || 'No rationale available.'}
                </p>

                {/* AI MCQ Pedagogical Explanation */}
                <AiMcqExplanation
                  question={currentQuestion.questionText || currentQuestion.question || ''}
                  options={(currentQuestion.options || []).map((o: any, idx: number) => {
                    if (typeof o === 'string') {
                      return { id: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D', text: o };
                    }
                    return o;
                  })}
                  correctOption={
                    currentQuestion.correctOption ||
                    (typeof currentQuestion.correct === 'number'
                      ? ['A', 'B', 'C', 'D'][currentQuestion.correct]
                      : 'A')
                  }
                  selectedOption={selectedOption}
                  scenario={currentQuestion.scenario}
                  rationale={currentQuestion.explanation || currentQuestion.rationale}
                />
              </div>
            )}

            {/* Navigation Bottom Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrevious}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={currentIndex >= filteredQuestions.length - 1}
                onClick={handleNext}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-sky-900/30"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
