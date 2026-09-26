import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CBTExam, Question, ExamAttempt } from '../../types';
import { api } from '../../services/api';
import { saveAttemptToFirestore } from '../../services/firestoreService';
import { cbtSessionManager, CbtActiveSession } from '../../services/cbtSessionManager';
import { AiMcqExplanation } from './AiMcqExplanation';
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
  Volume2,
  Volume1,
  VolumeX,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';
import {
  checkSpeechSynthesisSupport,
  loadSpeechSynthesisVoices,
  getBestEnglishVoice,
  stopSpeechSynthesis,
  speakText,
  checkMicrophoneSupport,
  startAudioRecording,
  cleanupMediaStreamTracks,
  mapMicrophoneError,
  AudioRecordingSession,
} from '../../utils/mediaUtils';
import { ExamTopBar } from './cbt/ExamTopBar';
import { ExamContextBar } from './cbt/ExamContextBar';
import { QuestionProgress } from './cbt/QuestionProgress';
import { QuestionContent } from './cbt/QuestionContent';
import { AnswerOptions } from './cbt/AnswerOptions';
import { BottomActionBar } from './cbt/BottomActionBar';
import { QuestionPaletteDrawer } from './cbt/QuestionPaletteDrawer';
import { ExamSubmitDialog } from './cbt/ExamSubmitDialog';
import { ExamExitDialog } from './cbt/ExamExitDialog';
import { TheoryCbtExam } from './TheoryCbtExam';

interface CbtExamProps {
  exams: CBTExam[];
  activeExamId?: string | null;
  isLoading?: boolean;
  onFinishExam: (attemptId: string) => void;
  onNavigateHome: () => void;
}

const OPTION_LETTERS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

/**
 * Randomize the display positions of answer choices for a single question.
 * Preserves original question text, all option texts, and original option identifiers
 * while assigning display labels A, B, C, D to the newly permuted positions.
 */
function randomizeQuestionOptions(options: any[]): any[] {
  if (!Array.isArray(options) || options.length <= 1) return options;

  // 1. Normalize options with original identifiers preserved
  const normalized = options.map((opt, idx) => {
    const defaultLetter = OPTION_LETTERS[idx] || 'A';
    if (typeof opt === 'string') {
      return { id: defaultLetter, originalId: defaultLetter, text: opt };
    }
    const origId = (opt as any).originalId || (opt as any).id || defaultLetter;
    const text = (opt as any).text || (opt as any).label || (opt as any).value || '';
    return { id: defaultLetter, originalId: origId as 'A' | 'B' | 'C' | 'D', text };
  });

  // 2. Fisher-Yates unbiased shuffle
  const shuffled = [...normalized];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 3. Re-assign display labels A, B, C, D to the newly permuted positions
  return shuffled.map((item, idx) => ({
    id: OPTION_LETTERS[idx] || 'A',
    originalId: item.originalId,
    text: item.text,
  }));
}

export const CbtExam: React.FC<CbtExamProps> = ({
  exams = [],
  activeExamId = null,
  isLoading = false,
  onFinishExam,
  onNavigateHome,
}) => {
  const [selectedExam, setSelectedExam] = useState<CBTExam | null>(null);
  const [examData, setExamData] = useState<(CBTExam & { questions: Question[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CBT Category: Objective CBT vs Theory CBT
  const [cbtCategoryTab, setCbtCategoryTab] = useState<'objective' | 'theory'>('objective');
  const [activeTheoryExam, setActiveTheoryExam] = useState<CBTExam | null>(null);

  // Active testing state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimeoutTriggered, setIsTimeoutTriggered] = useState<boolean>(false);
  const [timeWarningDismissed, setTimeWarningDismissed] = useState<'5m' | '1m' | null>(null);
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
  const theoryAnswersRef = useRef<Record<string, string>>({});
  const examDataRef = useRef<(CBTExam & { questions: Question[] }) | null>(null);
  const shuffledQuestionsRef = useRef<Record<string, any[]>>({});
  const examStartTimeRef = useRef<number>(Date.now());
  const examEndTimeRef = useRef<number>(0);
  const timerRef = useRef<any>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const hasSubmittedRef = useRef<boolean>(false);

  // Media & Speech States via mediaUtils
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechVolume, setSpeechVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nursesstudy_cbt_speech_volume');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          return parsed;
        }
      }
    } catch {}
    return 1;
  });
  const activeUtteranceCancelRef = useRef<(() => void) | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const recordingSessionRef = useRef<AudioRecordingSession | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Per-question voice recordings (qId -> { voiceAudioUrl: string, voiceBlob?: Blob })
  const [voiceRecordings, setVoiceRecordings] = useState<Record<string, { voiceAudioUrl: string; voiceBlob?: Blob }>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds to mm:ss or hh:mm:ss for visual countdown timer
  const formatTime = (totalSec: number) => {
    const safeSec = Math.max(0, totalSec);
    const hrs = Math.floor(safeSec / 3600);
    const mins = Math.floor((safeSec % 3600) / 60);
    const secs = safeSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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

  // Sync theoryAnswers to ref continuously
  useEffect(() => {
    theoryAnswersRef.current = { ...theoryAnswers };
  }, [theoryAnswers]);

  // Central Submission Handler
  // Preload text-to-speech voices with Android asynchronous voice loading support
  useEffect(() => {
    let isCancelled = false;
    loadSpeechSynthesisVoices(2500).then((voices) => {
      if (!isCancelled && voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Clean up media and audio when switching questions, submitting, or unmounting
  const stopAllMedia = useCallback(() => {
    // 1. Stop Speech Synthesis
    stopSpeechSynthesis();
    if (activeUtteranceCancelRef.current) {
      try {
        activeUtteranceCancelRef.current();
      } catch {}
      activeUtteranceCancelRef.current = null;
    }
    setIsSpeaking(false);

    // 2. Stop Audio playback
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch {}
      setIsPlayingAudio(false);
    }

    // 3. Stop / Cancel Audio Recording session
    if (recordingSessionRef.current) {
      try {
        recordingSessionRef.current.cancel();
      } catch {}
      recordingSessionRef.current = null;
    }

    // 4. Release all active microphone tracks immediately
    if (mediaStreamRef.current) {
      cleanupMediaStreamTracks(mediaStreamRef.current);
      mediaStreamRef.current = null;
    }

    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordDuration(0);
  }, []);

  // Stop media on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, [stopAllMedia]);

  const submitCBT = useCallback(
    async (reason: 'manual' | 'timeout' | 'forced') => {
      // Release any active speech or recording
      stopAllMedia();

      // 1. Concurrency lock to prevent double submissions
      if (hasSubmittedRef.current || isSubmittingRef.current) {
        return;
      }
      hasSubmittedRef.current = true;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      if (reason === 'timeout') {
        setIsTimeoutTriggered(true);
      }
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
        // Collect any typed theory answers and voice answers recorded by the student
        const theoryAnswersPayload: Record<string, { typedAnswer?: string; voiceRecordingUrl?: string | null }> = {};
        
        Object.entries(theoryAnswersRef.current).forEach(([qid, text]) => {
          if (text && text.trim()) {
            theoryAnswersPayload[qid] = {
              ...(theoryAnswersPayload[qid] || {}),
              typedAnswer: text.trim(),
            };
          }
        });

        Object.entries(voiceRecordings).forEach(([qid, rec]) => {
          if (rec.voiceAudioUrl) {
            theoryAnswersPayload[qid] = {
              ...(theoryAnswersPayload[qid] || {}),
              voiceRecordingUrl: rec.voiceAudioUrl,
            };
          }
        });

        const result = await api.submitExam(currentExam.id, {
          answers: finalAnswers,
          theoryAnswers: Object.keys(theoryAnswersPayload).length > 0 ? (theoryAnswersPayload as any) : undefined,
          timeSpentSeconds,
          submissionReason: reason,
          shuffledOptions: shuffledQuestionsRef.current,
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
          shuffledOptions: shuffledQuestionsRef.current,
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
    // Check if target is a theory examination
    const targetExam = exams.find((e) => e.id === examId);
    if (targetExam && targetExam.examType === 'theory') {
      setActiveTheoryExam(targetExam);
      return;
    }

    setLoading(true);
    setError(null);
    setSubmissionError(null);
    setRestoredBanner(null);
    setIsTimeoutTriggered(false);
    setTimeWarningDismissed(null);
    hasSubmittedRef.current = false;
    isSubmittingRef.current = false;

    try {
      const data = await api.getExamDetails(examId);

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
          const restoredTheory = (existingSession as any)?.theoryAnswers || {};
          theoryAnswersRef.current = { ...restoredTheory };
          setTheoryAnswers({ ...restoredTheory });
          setFlaggedQuestions(existingSession.flaggedQuestions || {});
          setCurrentIndex(
            Math.min(
              (data.questions?.length || 1) - 1,
              Math.max(0, existingSession.currentIndex || 0)
            )
          );

          // Restore previously shuffled options to keep option positions identical
          if (existingSession.shuffledQuestions && Object.keys(existingSession.shuffledQuestions).length > 0) {
            shuffledQuestionsRef.current = existingSession.shuffledQuestions;
            data.questions = (data.questions || []).map((q) => {
              const saved =
                existingSession.shuffledQuestions![String(q.id)] ||
                existingSession.shuffledQuestions![(q.id as any)];
              if (saved && Array.isArray(saved) && saved.length > 0) {
                return { ...q, options: saved };
              }
              return q;
            });
          }

          examDataRef.current = data;
          setExamData(data);
          setSelectedExam(data);

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

      // INITIALIZE BRAND NEW SESSION WITH RANDOMIZED OPTION POSITIONS
      const now = Date.now();
      const durationSec = (data.durationMinutes || 30) * 60;
      const deadline = now + durationSec * 1000;

      // Randomize answer options independently for each question in this session
      const shuffledMap: Record<string, any[]> = {};
      const randomizedQuestions = (data.questions || []).map((q) => {
        const randomizedOpts = randomizeQuestionOptions(q.options || []);
        shuffledMap[String(q.id)] = randomizedOpts;
        return {
          ...q,
          options: randomizedOpts,
        };
      });

      data.questions = randomizedQuestions;
      shuffledQuestionsRef.current = shuffledMap;
      examDataRef.current = data;
      setExamData(data);
      setSelectedExam(data);

      examStartTimeRef.current = now;
      examEndTimeRef.current = deadline;
      answersRef.current = {};
      theoryAnswersRef.current = {};
      setSelectedAnswers({});
      setTheoryAnswers({});
      setFlaggedQuestions({});
      setCurrentIndex(0);
      setSecondsRemaining(durationSec);
      setExamResult(null);

      // Persist fresh session immediately with shuffled options mapping
      cbtSessionManager.saveSession({
        examId: data.id,
        examTitle: data.title,
        startTime: now,
        endTime: deadline,
        durationMinutes: data.durationMinutes || 30,
        currentIndex: 0,
        answers: {},
        flaggedQuestions: {},
        shuffledQuestions: shuffledMap,
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
      const match = exams.find((e) => e.id === activeExamId);
      if (match && match.examType === 'theory') {
        setCbtCategoryTab('theory');
        setActiveTheoryExam(match);
      } else {
        startExam(activeExamId);
      }
    }
  }, [activeExamId, exams]);

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
          if (matching.shuffledOptions) {
            shuffledQuestionsRef.current = matching.shuffledOptions;
          }
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
          shuffledQuestions: shuffledQuestionsRef.current,
          lastUpdated: Date.now(),
        });
      }

      return next;
    });
  };

  // Theory answer typed input with immediate ref update and persistent auto-save
  const handleTypedTheoryAnswerChange = (questionId: string | number, text: string) => {
    if (isSubmittingRef.current || hasSubmittedRef.current) return;
    const qKey = String(questionId);

    theoryAnswersRef.current[qKey] = text;
    setTheoryAnswers((prev) => {
      const next = { ...prev, [qKey]: text };

      if (examDataRef.current) {
        cbtSessionManager.saveSession({
          examId: examDataRef.current.id,
          examTitle: examDataRef.current.title,
          startTime: examStartTimeRef.current,
          endTime: examEndTimeRef.current,
          durationMinutes: examDataRef.current.durationMinutes || 30,
          currentIndex,
          answers: answersRef.current,
          flaggedQuestions,
          shuffledQuestions: shuffledQuestionsRef.current,
          lastUpdated: Date.now(),
          theoryAnswers: next,
        } as any);
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
          shuffledQuestions: shuffledQuestionsRef.current,
          lastUpdated: Date.now(),
        });
      }

      return next;
    });
  };

  // Navigation handlers
  const handleNext = () => {
    stopAllMedia();
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
        shuffledQuestions: shuffledQuestionsRef.current,
        lastUpdated: Date.now(),
      });
    }
  };

  const handlePrevious = () => {
    stopAllMedia();
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
        shuffledQuestions: shuffledQuestionsRef.current,
        lastUpdated: Date.now(),
      });
    }
  };

  const handleSelectQuestion = (idx: number) => {
    stopAllMedia();
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
        shuffledQuestions: shuffledQuestionsRef.current,
        lastUpdated: Date.now(),
      });
    }
  };

  // Text-To-Speech: Read Question (Android & Mobile Browser Compatible via mediaUtils)
  const handleReadQuestion = () => {
    if (!examData || !examData.questions) return;
    const currentQ = examData.questions[currentIndex];
    if (!currentQ) return;

    // Check if speechSynthesis is genuinely available in this browser
    const ttsCheck = checkSpeechSynthesisSupport();
    if (!ttsCheck.isSupported) {
      setSpeechError(
        ttsCheck.reason ||
          'Audio reading is not supported on this device/browser. You can read the question text directly.'
      );
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    // Toggle stop if already speaking
    if (isSpeaking) {
      stopSpeechSynthesis();
      if (activeUtteranceCancelRef.current) {
        try {
          activeUtteranceCancelRef.current();
        } catch {}
        activeUtteranceCancelRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    setSpeechError(null);

    // Read question stem and if options exist, read options
    const rawQuestion = currentQ.questionText || currentQ.question || '';
    const cleanQuestion = rawQuestion.replace(/<[^>]*>?/gm, '').trim();

    let fullSpeechText = cleanQuestion;
    if (currentQ.scenario) {
      fullSpeechText = `${currentQ.scenario.trim()}. ${cleanQuestion}`;
    }

    // Read options if present
    if (Array.isArray(currentQ.options) && currentQ.options.length > 0) {
      const optionsText = currentQ.options
        .map((opt: any) => {
          const letter = opt.id || opt.originalId || '';
          const text = opt.text || (typeof opt === 'string' ? opt : '');
          return `Option ${letter}: ${text}`;
        })
        .join('. ');
      fullSpeechText = `${fullSpeechText}. ${optionsText}`;
    }

    if (!fullSpeechText.trim()) {
      setSpeechError('No question text available to read.');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    // Dynamically retrieve available voices if not preloaded
    const voices = availableVoices && availableVoices.length > 0
      ? availableVoices
      : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
    const chosenVoice = getBestEnglishVoice(voices);

    const { cancel } = speakText(fullSpeechText, {
      voice: chosenVoice,
      lang: chosenVoice?.lang || 'en-US',
      rate: 0.95,
      pitch: 1.0,
      volume: speechVolume,
      onStart: () => {
        setIsSpeaking(true);
        setSpeechError(null);
      },
      onEnd: () => {
        activeUtteranceCancelRef.current = null;
        setIsSpeaking(false);
      },
      onError: (e: any) => {
        activeUtteranceCancelRef.current = null;
        setIsSpeaking(false);
        if (e?.error === 'canceled' || e?.error === 'interrupted') {
          return;
        }
        console.warn('SpeechSynthesis error:', e?.error || e);
        setSpeechError(
          `Audio reading notice: ${e?.error || 'Playback interrupted'}. You can read the question text directly.`
        );
        setTimeout(() => setSpeechError(null), 5000);
      },
    });

    activeUtteranceCancelRef.current = cancel;
  };

  // MediaRecorder: Voice Answer Recording via mediaUtils
  const handleStartRecording = async () => {
    setMicError(null);

    // 1. Diagnostic check for microphone availability and secure context
    const micCheck = checkMicrophoneSupport();
    if (!micCheck.isSupported) {
      setMicError(
        micCheck.reason ||
          'Microphone recording is not supported in this browser. You can select your answer directly.'
      );
      return;
    }

    try {
      // 2. Request permission on-demand and start recording session via mediaUtils
      const session = await startAudioRecording({ timeslice: 1000 });
      recordingSessionRef.current = session;
      mediaStreamRef.current = session.stream;

      setIsRecording(true);
      setRecordDuration(0);

      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission or recording error:', err);
      setIsRecording(false);
      setRecordDuration(0);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      setMicError(err?.message || mapMicrophoneError(err));
    }
  };

  const handleStopRecording = async () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecording(false);

    const session = recordingSessionRef.current;
    if (!session) {
      if (mediaStreamRef.current) {
        cleanupMediaStreamTracks(mediaStreamRef.current);
        mediaStreamRef.current = null;
      }
      return;
    }

    try {
      const result = await session.stop();
      if (examData && examData.questions) {
        const currentQ = examData.questions[currentIndex];
        if (currentQ) {
          const qId = String(currentQ.id);
          setVoiceRecordings((prev) => ({
            ...prev,
            [qId]: {
              voiceAudioUrl: result.url,
              voiceBlob: result.blob,
            },
          }));
        }
      }
    } catch (err: any) {
      console.warn('Error stopping audio recording session:', err);
      setMicError(err?.message || 'Failed to complete audio recording. You can retry or select your answer.');
    } finally {
      recordingSessionRef.current = null;
      mediaStreamRef.current = null;
      setRecordDuration(0);
    }
  };

  const handleDeleteRecording = () => {
    if (!examData || !examData.questions) return;
    const currentQ = examData.questions[currentIndex];
    if (!currentQ) return;
    const qId = String(currentQ.id);

    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch {}
      setIsPlayingAudio(false);
    }

    const prevRecording = voiceRecordings[qId];
    if (prevRecording?.voiceAudioUrl) {
      try {
        URL.revokeObjectURL(prevRecording.voiceAudioUrl);
      } catch {}
    }

    setVoiceRecordings((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const togglePlayRecordedAudio = () => {
    if (!examData || !examData.questions) return;
    const currentQ = examData.questions[currentIndex];
    if (!currentQ) return;
    const qId = String(currentQ.id);
    const recording = voiceRecordings[qId];
    if (!recording?.voiceAudioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(recording.voiceAudioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    } else if (audioPlayerRef.current.src !== recording.voiceAudioUrl) {
      audioPlayerRef.current.src = recording.voiceAudioUrl;
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  };

  // ==================== VIEW 0: ACTIVE THEORY CBT EXAMINATION ==================== //
  if (activeTheoryExam) {
    return (
      <TheoryCbtExam
        exam={activeTheoryExam}
        onFinishExam={(attemptId) => {
          setActiveTheoryExam(null);
          onFinishExam(attemptId);
        }}
        onExit={() => setActiveTheoryExam(null)}
      />
    );
  }

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

                {/* AI Explanation for MCQ Answers */}
                <AiMcqExplanation
                  question={item.questionText || item.question || ''}
                  options={(item.options || []).map((o: any, idx: number) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    if (typeof o === 'string') {
                      return { id: letters[idx] || 'A', text: o };
                    }
                    return { id: o.id || letters[idx] || 'A', text: o.text || '' };
                  })}
                  correctOption={item.correctOption || 'A'}
                  selectedOption={item.selectedOption || null}
                  scenario={item.scenario}
                  rationale={item.explanation || item.rationale}
                />
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
    const isTheoryQuestion = currentQ
      ? currentQ.questionType === 'theory' ||
        examData.examType === 'theory' ||
        !Array.isArray(currentQ.options) ||
        currentQ.options.length === 0
      : false;

    // Answered count includes multiple choice selections, typed theory answers, and voice recordings
    const answeredCount = questions.filter((q) => {
      const qKey = String(q.id);
      return (
        !!selectedAnswers[qKey] ||
        (theoryAnswers[qKey] && theoryAnswers[qKey].trim().length > 0) ||
        !!voiceRecordings[qKey]?.voiceAudioUrl
      );
    }).length;
    const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

    return (
      <div className="min-h-[calc(100vh-6rem)] min-h-[calc(100dvh-6rem)] w-full max-w-3xl mx-auto flex flex-col justify-between pb-2 animate-in fade-in duration-150">
        {/* TOP ACTION BAR WITH LIVE COUNTDOWN TIMER */}
        <ExamTopBar
          onExitClick={() => setShowExitConfirm(true)}
          isFlagged={isFlagged}
          onToggleFlag={() => currentQ && toggleFlag(currentQ.id)}
          secondsRemaining={secondsRemaining}
          totalDurationSeconds={(examData.durationMinutes || 30) * 60}
          formatTime={formatTime}
          onOpenPalette={() => setShowPaletteDrawer(true)}
          onSubmitClick={() => setShowSubmitConfirm(true)}
          answeredCount={answeredCount}
          totalQuestions={totalQ}
          isSubmitting={isSubmitting}
        />

        {/* TIME CRITICAL COUNTDOWN WARNING NOTICES */}
        {secondsRemaining <= 60 && secondsRemaining > 0 && timeWarningDismissed !== '1m' && (
          <div className="mx-4 mt-2 p-3.5 bg-rose-950/90 border border-rose-500/70 rounded-2xl text-xs text-rose-200 flex items-center justify-between gap-3 shadow-lg shadow-rose-950/50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Critical: Less than 60 seconds remaining!</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-mono">
                    {formatTime(secondsRemaining)}
                  </span>
                </p>
                <p className="text-[11px] text-rose-300 mt-0.5">
                  The examination will automatically submit all your selected answers once the countdown timer reaches 00:00.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTimeWarningDismissed('1m')}
              className="px-2.5 py-1 bg-rose-800/80 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {secondsRemaining <= 300 && secondsRemaining > 60 && timeWarningDismissed !== '5m' && (
          <div className="mx-4 mt-2 p-3.5 bg-amber-950/80 border border-amber-500/60 rounded-2xl text-xs text-amber-200 flex items-center justify-between gap-3 shadow-md shadow-amber-950/40 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>5-Minute Notice</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-mono">
                    {formatTime(secondsRemaining)} left
                  </span>
                </p>
                <p className="text-[11px] text-amber-300/90 mt-0.5">
                  Review any flagged questions and finish unanswered questions before the countdown timer expires.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTimeWarningDismissed('5m')}
              className="px-2.5 py-1 bg-amber-800/80 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

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

        {/* QUESTION CONTENT & MULTIPLE-CHOICE OPTIONS OR CONSOLIDATED THEORY CBT WORKSPACE */}
        <div className="flex-1 flex flex-col justify-center py-2 sm:py-4">
          {currentQ ? (
            isTheoryQuestion ? (
              /* ==================== THE THEORY CBT QUESTION WORKSPACE (CONSOLIDATED SINGLE-COLUMN) ==================== */
              <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
                {/* Question Header & Category */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-mono font-bold text-teal-400">
                    Question {safeIndex + 1} of {totalQ}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800/60">
                    {currentQ.category || currentQ.topic || examData.subjectName || 'Theory Question'}
                  </span>
                </div>

                {/* Scenario if available */}
                {currentQ.scenario && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentQ.scenario}
                  </div>
                )}

                {/* Question Stem */}
                <h2 className="text-base sm:text-lg font-medium text-white leading-relaxed">
                  {currentQ.questionText || currentQ.question}
                </h2>

                {/* "Read Question" button directly below the question */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleReadQuestion}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                    title={isSpeaking ? 'Stop reading' : 'Read question text aloud'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                        <span>Stop Reading</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Read Question</span>
                      </>
                    )}
                  </button>

                  {/* Compact Read Question Volume Slider */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs"
                    title={`Volume: ${Math.round(speechVolume * 100)}%`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const nextVol = speechVolume > 0 ? 0 : 1;
                        setSpeechVolume(nextVol);
                        try {
                          localStorage.setItem('nursesstudy_cbt_speech_volume', String(nextVol));
                        } catch {}
                      }}
                      className="text-slate-400 hover:text-teal-300 transition-colors p-0.5 cursor-pointer"
                      title={speechVolume === 0 ? 'Unmute voice reading' : 'Mute voice reading'}
                      aria-label="Toggle mute voice reading"
                    >
                      {speechVolume === 0 ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      ) : speechVolume < 0.5 ? (
                        <Volume1 className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={speechVolume}
                      onChange={(e) => {
                        const newVol = parseFloat(e.target.value);
                        setSpeechVolume(newVol);
                        try {
                          localStorage.setItem('nursesstudy_cbt_speech_volume', String(newVol));
                        } catch {}
                      }}
                      className="w-14 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                      aria-label="Read Question volume control"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-7 text-right select-none">
                      {Math.round(speechVolume * 100)}%
                    </span>
                  </div>

                  {speechError && (
                    <span className="text-xs text-amber-400/90 font-medium">
                      {speechError}
                    </span>
                  )}
                </div>

                {/* One large answer text box */}
                <div>
                  <textarea
                    value={theoryAnswers[String(currentQ.id)] || ''}
                    onChange={(e) => handleTypedTheoryAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={8}
                    className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-sans resize-y"
                  />
                </div>

                {/* One simple "Record Voice Answer" button & controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                          voiceRecordings[String(currentQ.id)]
                            ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 border-purple-500/40'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <Mic className="w-4 h-4 text-purple-400" />
                        <span>{voiceRecordings[String(currentQ.id)] ? 'Re-record Voice Answer' : 'Record Voice Answer'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all animate-pulse flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Stop Recording ({recordDuration}s)</span>
                      </button>
                    )}

                    {voiceRecordings[String(currentQ.id)] && !isRecording && (
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={togglePlayRecordedAudio}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Listen to recorded answer"
                        >
                          {isPlayingAudio ? (
                            <>
                              <Pause className="w-3 h-3 fill-current" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Play</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteRecording}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete recorded answer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {voiceRecordings[String(currentQ.id)] && !isRecording && (
                    <span className="text-xs text-teal-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      Voice answer saved
                    </span>
                  )}
                </div>

                {micError && (
                  <div className="p-3 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{micError}</span>
                  </div>
                )}
              </div>
            ) : (
              /* ==================== MULTIPLE-CHOICE CBT QUESTION WORKSPACE ==================== */
              <div className="space-y-4">
                <QuestionContent
                  question={currentQ}
                  questionId={currentQ.id}
                  scenario={currentQ.scenario}
                  questionText={currentQ.questionText || currentQ.question || ''}
                  currentIndex={safeIndex}
                  totalQuestions={totalQ}
                />

                {/* CBT Audio Assist Toolbar: Read Question & Record Voice Answer via mediaUtils */}
                <div className="w-full max-w-2xl mx-auto px-4">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Read Question Button */}
                      <button
                        type="button"
                        onClick={handleReadQuestion}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSpeaking
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80'
                        }`}
                        title={isSpeaking ? 'Stop reading question aloud' : 'Read question text aloud'}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Stop Reading</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>Read Question</span>
                          </>
                        )}
                      </button>

                      {/* Read Question Volume Slider */}
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
                        title={`Read Question Volume: ${Math.round(speechVolume * 100)}%`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const nextVol = speechVolume > 0 ? 0 : 1;
                            setSpeechVolume(nextVol);
                            try {
                              localStorage.setItem('nursesstudy_cbt_speech_volume', String(nextVol));
                            } catch {}
                          }}
                          className="text-slate-400 hover:text-teal-300 transition-colors p-0.5 cursor-pointer"
                          title={speechVolume === 0 ? 'Unmute voice reading' : 'Mute voice reading'}
                          aria-label="Toggle mute voice reading"
                        >
                          {speechVolume === 0 ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          ) : speechVolume < 0.5 ? (
                            <Volume1 className="w-3.5 h-3.5 text-teal-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={speechVolume}
                          onChange={(e) => {
                            const newVol = parseFloat(e.target.value);
                            setSpeechVolume(newVol);
                            try {
                              localStorage.setItem('nursesstudy_cbt_speech_volume', String(newVol));
                            } catch {}
                          }}
                          className="w-14 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                          aria-label="Read Question volume control"
                        />
                        <span className="text-[10px] font-mono text-slate-300 w-7 text-right select-none">
                          {Math.round(speechVolume * 100)}%
                        </span>
                      </div>

                      {/* Record Voice Answer Button */}
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            voiceRecordings[String(currentQ.id)]
                              ? 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{voiceRecordings[String(currentQ.id)] ? 'Re-record Voice Answer' : 'Start Recording'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all animate-pulse flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>Stop Recording ({recordDuration}s)</span>
                        </button>
                      )}
                    </div>

                    {/* Recorded Audio Controls for Current Question */}
                    {voiceRecordings[String(currentQ.id)] && !isRecording && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-teal-400 font-semibold hidden sm:inline">Recording ready</span>
                        <button
                          type="button"
                          onClick={togglePlayRecordedAudio}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Listen to recorded voice answer"
                        >
                          {isPlayingAudio ? (
                            <>
                              <Pause className="w-3 h-3 fill-current shrink-0" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current shrink-0" />
                              <span>Play</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleDeleteRecording}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete voice answer"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Speech Error Banner */}
                  {speechError && (
                    <div className="mt-2 p-2.5 bg-amber-950/40 border border-amber-800/40 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{speechError}</span>
                    </div>
                  )}

                  {/* Microphone Error Banner */}
                  {micError && (
                    <div className="mt-2 p-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{micError}</span>
                    </div>
                  )}
                </div>

                <AnswerOptions
                  questionId={currentQ.id}
                  options={currentQ.options || []}
                  selectedAnswer={currentAnswer}
                  onSelectOption={(opt) => handleSelectOption(currentQ.id, opt)}
                />
              </div>
            )
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
          selectedAnswers={{
            ...selectedAnswers,
            ...Object.fromEntries(
              Object.entries(theoryAnswers)
                .filter(([_, val]) => val && val.trim().length > 0)
                .map(([k]) => [k, 'A' as const])
            ),
            ...Object.fromEntries(
              Object.entries(voiceRecordings)
                .filter(([_, val]) => val?.voiceAudioUrl)
                .map(([k]) => [k, 'A' as const])
            ),
          }}
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
            stopAllMedia();
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

        {/* TIME EXPIRED AUTO-SUBMISSION MODAL */}
        {isSubmitting && isTimeoutTriggered && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="auto-submit-dialog-title"
          >
            <div className="w-full max-w-md bg-[#111827] border border-rose-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-center text-white animate-in zoom-in-95 duration-200">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-rose-500/20 animate-ping opacity-75" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-900/40 text-white border border-rose-400/40">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  Timer Expired
                </div>
                <h3 id="auto-submit-dialog-title" className="text-lg font-black text-white tracking-tight">
                  Auto-Submitting Examination
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  The examination countdown clock has reached 00:00. All your selected answers have been saved and are being automatically submitted for scoring.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-300">
                <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
                <span className="font-semibold">Evaluating answers and computing performance analytics...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== VIEW 3: EXAMINATION LOBBY ==================== //
  const objectiveExams = exams.filter((e) => e.examType !== 'theory');
  const theoryExams = exams.filter((e) => e.examType === 'theory');
  const displayedExams = cbtCategoryTab === 'theory' ? theoryExams : objectiveExams;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-400" />
            <span>CBT EXAM HALL</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate nursing council examination conditions with active wall-clock countdown timers, auto-save state recovery, and automated grading.
          </p>
        </div>
      </div>

      {/* CBT Hall Category Selector: Objective CBT vs Theory CBT */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => setCbtCategoryTab('objective')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            cbtCategoryTab === 'objective'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Objective CBT</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-950 text-purple-200 border border-purple-500/30">
            {objectiveExams.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCbtCategoryTab('theory')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            cbtCategoryTab === 'theory'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Theory CBT</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-950 text-teal-200 border border-teal-500/30">
            {theoryExams.length}
          </span>
        </button>
      </div>

      {isLoading && exams.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl p-12 text-center border border-slate-800 animate-pulse">
          <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Loading CBT examinations...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Retrieving scheduled examination sessions and clinical testing parameters...
          </p>
        </div>
      ) : error && exams.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl p-12 text-center border border-rose-900/50">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Unable to load CBT examinations. Please try again.</h3>
          <p className="text-xs text-rose-400 mt-1 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : displayedExams.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl p-12 text-center border border-slate-800">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">
            {cbtCategoryTab === 'theory'
              ? 'No Theory CBT examinations are currently available.'
              : 'No Objective CBT examinations are currently available.'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            The examination hall is currently clear. Examinations created by administrators for the ND 1 curriculum will appear here once published.
          </p>
        </div>
      ) : cbtCategoryTab === 'theory' ? (
        /* THEORY CBT EXAM CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-md flex flex-col justify-between hover:border-teal-500/60 hover:shadow-xl transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      THEORY CBT
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {exam.subjectName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-teal-300">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{exam.durationMinutes} mins</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white leading-snug group-hover:text-teal-300 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {exam.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Questions</span>
                    <strong className="text-white text-xs">
                      {exam.actualQuestionCount || exam.totalQuestions} Questions
                    </strong>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Type</span>
                    <strong className="text-teal-300 text-xs">Theory Examination</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  disabled={loading}
                  onClick={() => setActiveTheoryExam(exam)}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-900/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Exam</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* OBJECTIVE CBT EXAM CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedExams.map((exam) => (
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
