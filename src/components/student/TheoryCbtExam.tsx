import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CBTExam, Question, ExamAttempt } from '../../types';
import { api } from '../../services/api';
import {
  Clock,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  Send,
  X,
  RefreshCw,
  BookOpen,
  FileText,
  Radio,
  Award,
  ChevronRight,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import { THEORY_INTEGUMENTARY_QUESTIONS } from '../../data/theoryIntegumentaryQuestions';

interface TheoryQuestionItem extends Question {
  category: string;
  modelAnswer?: string;
}

interface QuestionAnswerState {
  typedAnswer: string;
  voiceAudioUrl: string | null;
  voiceBlob?: Blob | null;
  recordingStatus: 'none' | 'recording' | 'recorded';
}

interface TheoryCbtExamProps {
  exam: CBTExam;
  onFinishExam: (attemptId: string) => void;
  onExit: () => void;
}

export const TheoryCbtExam: React.FC<TheoryCbtExamProps> = ({
  exam,
  onFinishExam,
  onExit,
}) => {
  // Questions & Loading
  const [questions, setQuestions] = useState<TheoryQuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Exam navigation
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-question answers: map questionId -> QuestionAnswerState
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerState>>({});
  const answersRef = useRef<Record<string, QuestionAnswerState>>({});
  answersRef.current = answers;

  // Timer state
  const totalDurationSeconds = (exam.durationMinutes || 60) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalDurationSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // UI Modals & Drawers
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Model Answer reveal state during simulation / practice
  const [revealedModelAnswers, setRevealedModelAnswers] = useState<Record<string, boolean>>({});

  // Completed results view
  const [completedResult, setCompletedResult] = useState<{
    attempt: ExamAttempt;
    detailedAnswers: any[];
    attemptedCount: number;
    unansweredCount: number;
    totalQuestions: number;
  } | null>(null);
  const [activeReviewFilter, setActiveReviewFilter] = useState<'all' | 'attempted' | 'unanswered'>('all');

  // Media & Speech States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback state for active question
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Speech Recognition (Dictation) state
  const [isDictating, setIsDictating] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const dictationBaseTextRef = useRef<string>('');

  // Storage key for session recovery
  const storageKey = `nursesstudy_theory_session_${exam.id}`;

  // Check SpeechRecognition and initialize SpeechSynthesis voices on mount
  useEffect(() => {
    // 1. Check SpeechRecognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setDictationSupported(Boolean(SpeechRecognitionAPI));
    }

    // 2. Pre-load text-to-speech voices for mobile/Android
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      const populateVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) {
            setAvailableVoices(v);
          }
        } catch (err) {
          console.warn('Voice preloading error:', err);
        }
      };

      populateVoices();
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
      } else {
        window.speechSynthesis.onvoiceschanged = populateVoices;
      }

      // Retry voice fetch after brief delay (common Android Chrome behavior)
      const t1 = setTimeout(populateVoices, 500);
      const t2 = setTimeout(populateVoices, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        if (window.speechSynthesis) {
          if (typeof window.speechSynthesis.removeEventListener === 'function') {
            window.speechSynthesis.removeEventListener('voiceschanged', populateVoices);
          } else {
            window.speechSynthesis.onvoiceschanged = null;
          }
        }
      };
    }
  }, []);

  // 1. Fetch Exam & Questions
  useEffect(() => {
    let isMounted = true;
    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await api.getExamDetails(exam.id);
        if (!isMounted) return;

        let resolvedQuestions: TheoryQuestionItem[] = (data.questions || []).map((q: any, idx: number) => {
          const fallbackQ = THEORY_INTEGUMENTARY_QUESTIONS[idx];
          return {
            ...q,
            id: String(q.id || (fallbackQ ? fallbackQ.id : `theory-${idx + 1}`)),
            category: q.category || (fallbackQ ? fallbackQ.category : 'General Characteristics'),
            question: q.question || q.questionText || (fallbackQ ? fallbackQ.question : `Theory Question ${idx + 1}`),
            questionText: q.questionText || q.question || (fallbackQ ? fallbackQ.questionText : `Theory Question ${idx + 1}`),
            modelAnswer: q.modelAnswer || (fallbackQ ? fallbackQ.modelAnswer : undefined),
          };
        });

        if (resolvedQuestions.length === 0 && (exam.id === 'integumentary-system-theory-cbt' || exam.title.toLowerCase().includes('integumentary'))) {
          resolvedQuestions = THEORY_INTEGUMENTARY_QUESTIONS.map((q) => ({
            ...q,
            options: [],
            correctOption: '',
            difficulty: 'Medium',
          })) as any;
        }

        setQuestions(resolvedQuestions);

        // Try restoring cached session
        try {
          const cachedRaw = localStorage.getItem(storageKey);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.answers) {
              setAnswers(cached.answers);
            }
            if (cached && typeof cached.secondsRemaining === 'number' && cached.secondsRemaining > 10) {
              setSecondsRemaining(cached.secondsRemaining);
            }
            if (cached && typeof cached.currentIndex === 'number' && cached.currentIndex < resolvedQuestions.length) {
              setCurrentIndex(cached.currentIndex);
            }
          }
        } catch {
          // ignore cache error
        }
      } catch (err: any) {
        if (!isMounted) return;
        setLoadError(err.message || 'Failed to load theory examination details.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchExamData();

    return () => {
      isMounted = false;
    };
  }, [exam.id, storageKey]);

  // 2. Countdown Timer
  useEffect(() => {
    if (isLoading || completedResult || isSubmitting) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, completedResult, isSubmitting]);

  // 3. Auto-save session state to localStorage
  useEffect(() => {
    if (completedResult || isLoading || questions.length === 0) return;
    try {
      const stateToSave = {
        examId: exam.id,
        currentIndex,
        secondsRemaining,
        answers,
        updatedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch {
      // quota or private mode
    }
  }, [answers, currentIndex, secondsRemaining, completedResult, isLoading, questions.length, exam.id, storageKey]);

  // Clean up media and audio when switching questions or unmounting
  const stopAllMedia = useCallback(() => {
    // 1. Stop Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
    }
    // 2. Stop Dictation
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
      setIsDictating(false);
    }
    // 3. Stop Audio playback
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch {}
      setIsPlayingAudio(false);
    }
    // 4. Stop Recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    // 5. Release all active microphone tracks immediately
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
      } catch {}
      mediaStreamRef.current = null;
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, [stopAllMedia]);

  // Handle Typed Answer Changes
  const handleTypedAnswerChange = (text: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = String(currentQ.id);

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {
          typedAnswer: '',
          voiceAudioUrl: null,
          recordingStatus: 'none',
        }),
        typedAnswer: text,
      },
    }));
  };

  // Text-To-Speech: Read Question (Android & Mobile Browser Compatible)
  const handleReadQuestion = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    // Check if speechSynthesis is genuinely available in this browser environment
    const isSpeechSupported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      Boolean(window.speechSynthesis) &&
      typeof window.SpeechSynthesisUtterance !== 'undefined';

    if (!isSpeechSupported) {
      setSpeechError('Audio reading is not supported on this device/browser. You can read the question text directly.');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    // Toggle stop if already speaking
    if (isSpeaking) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Resume if previously paused (addresses Android Chrome background pause state)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}

    setSpeechError(null);

    // Read the exact question displayed on screen
    const rawQuestion = currentQ.questionText || currentQ.question || '';
    const cleanQuestion = rawQuestion.replace(/<[^>]*>?/gm, '').trim();

    if (!cleanQuestion) {
      setSpeechError('No question text available to read.');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanQuestion);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select available voice: prioritize English, fallback automatically
      let voicesList = availableVoices;
      if (!voicesList || voicesList.length === 0) {
        try {
          voicesList = window.speechSynthesis.getVoices();
        } catch {}
      }

      if (voicesList && voicesList.length > 0) {
        const preferredVoice =
          voicesList.find((v) => v.lang === 'en-US' || v.lang === 'en-GB') ||
          voicesList.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) ||
          voicesList.find((v) => v.default) ||
          voicesList[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          utterance.lang = preferredVoice.lang;
        } else {
          utterance.lang = 'en-US';
        }
      } else {
        // Fallback: device native default voice engine for en-US
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeechError(null);
      };

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        setIsSpeaking(false);
      };

      utterance.onerror = (e: any) => {
        activeUtteranceRef.current = null;
        setIsSpeaking(false);
        // Do not flag error if stopped intentionally
        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }
        console.warn('SpeechSynthesis error:', e.error);
        setSpeechError(`Audio reading notice: ${e.error || 'Playback interrupted'}. You can read the question text directly.`);
        setTimeout(() => setSpeechError(null), 5000);
      };

      // Keep utterance in ref to avoid Android Chrome premature garbage collection
      activeUtteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (speechErr: any) {
      console.warn('SpeechSynthesis execution error:', speechErr);
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
      setSpeechError('Audio reading encountered an issue. You can read the question normally.');
      setTimeout(() => setSpeechError(null), 5000);
    }
  };

  // Voice Dictation (Speech to Text)
  const handleToggleDictation = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechError('Speech recognition dictation is not available in this browser. You can type your answer directly.');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    if (isDictating && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
      setIsDictating(false);
      return;
    }

    // Detect insecure context
    if (window.isSecureContext === false) {
      setSpeechError('Voice dictation requires a secure connection (HTTPS). You can type your answer directly.');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Remember the text already present so transcribed speech appends cleanly without overwriting
      const currentQ = questions[currentIndex];
      const qId = currentQ ? String(currentQ.id) : '';
      dictationBaseTextRef.current = answersRef.current[qId]?.typedAnswer || '';

      recognition.onstart = () => {
        setIsDictating(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const base = dictationBaseTextRef.current.trim();
        const spokenChunk = (finalTranscript || interimTranscript).trim();

        if (spokenChunk) {
          const newText = base ? `${base} ${spokenChunk}` : spokenChunk;
          handleTypedAnswerChange(newText);
          if (finalTranscript) {
            dictationBaseTextRef.current = newText;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsDictating(false);
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission for dictation was denied. Please allow microphone or type your answer.');
        } else if (event.error === 'network') {
          setSpeechError('Voice dictation network service unavailable. You can type your answer directly.');
        } else if (event.error === 'audio-capture') {
          setSpeechError('No microphone detected for dictation. You can type your answer directly.');
        } else {
          setSpeechError(`Voice dictation note: ${event.error}. You can continue typing.`);
        }
        setTimeout(() => setSpeechError(null), 5000);
      };

      recognition.onend = () => {
        setIsDictating(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('SpeechRecognition failed:', err);
      setIsDictating(false);
      recognitionRef.current = null;
      setSpeechError('Voice dictation could not be initialized. You can type your answer.');
      setTimeout(() => setSpeechError(null), 5000);
    }
  };

  // MediaRecorder: Voice Answer Recording (Android & Mobile Browser Compatible)
  const handleStartRecording = async () => {
    setMicError(null);

    // 1. Detect if running outside HTTPS / secure context
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setMicError('Microphone access requires a secure connection (HTTPS). You can type your answer instead.');
      return;
    }

    // 2. Check if embedded in an iframe that lacks microphone permissions policy
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    // 3. Verify navigator.mediaDevices availability
    if (!navigator || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      if (isInIframe) {
        setMicError('Microphone access is restricted by embedding frame permissions. Please open the exam directly or type your answer.');
      } else {
        setMicError('Microphone API is not supported in this browser. You can type your answer instead.');
      }
      return;
    }

    // 4. Verify MediaRecorder support
    if (typeof window.MediaRecorder === 'undefined') {
      setMicError('Audio recording (MediaRecorder) is not supported in this browser. You can type your answer instead.');
      return;
    }

    // 5. Select supported MIME type
    const candidateMimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    let selectedMimeType: string | undefined = undefined;
    for (const mime of candidateMimeTypes) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
        selectedMimeType = mime;
        break;
      }
    }

    try {
      // Request permission strictly upon user click
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorderOptions: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, recorderOptions);
      } catch (mimeErr) {
        console.warn('MediaRecorder with selected MIME failed, falling back to browser default:', mimeErr);
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlobType = mediaRecorder.mimeType || selectedMimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalBlobType });
        const audioUrl = URL.createObjectURL(audioBlob);

        const currentQ = questions[currentIndex];
        if (currentQ) {
          const qId = String(currentQ.id);
          setAnswers((prev) => ({
            ...prev,
            [qId]: {
              ...(prev[qId] || { typedAnswer: '', recordingStatus: 'none' }),
              voiceAudioUrl: audioUrl,
              voiceBlob: audioBlob,
              recordingStatus: 'recorded',
            },
          }));
        }

        // Clean up and release all microphone hardware tracks immediately
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {}
          });
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
        setRecordDuration(0);
        if (recordIntervalRef.current) {
          clearInterval(recordIntervalRef.current);
          recordIntervalRef.current = null;
        }
      };

      mediaRecorder.onerror = (recErr: any) => {
        console.warn('MediaRecorder error:', recErr);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {}
          });
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
        setMicError('Audio recording encountered an error. You can try again or type your answer.');
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission or hardware error:', err);
      setIsRecording(false);

      // Immediately release tracks if obtained before failure
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        mediaStreamRef.current = null;
      }

      const errorName = err?.name || '';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        if (isInIframe) {
          setMicError('Microphone permission was denied or restricted by embedding permissions policy. You can type your answer instead.');
        } else {
          setMicError('Microphone permission was denied. Please allow microphone access in your browser site settings, or type your answer.');
        }
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setMicError('No microphone hardware detected on this device. You can type your answer directly.');
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setMicError('Microphone is in use by another app or call. Please release it and retry, or type your answer.');
      } else if (errorName === 'SecurityError') {
        setMicError('Microphone access is blocked by browser security or iframe policy. You can type your answer instead.');
      } else if (errorName === 'OverconstrainedError') {
        setMicError('Audio format requested is not supported by your microphone. You can type your answer.');
      } else {
        setMicError(`Microphone notice: ${err?.message || errorName || 'Unable to access microphone'}. You can type your answer.`);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
      }
    }
    // Also stop tracks if stream still exists
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const handleDeleteRecording = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = String(currentQ.id);

    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch {}
      setIsPlayingAudio(false);
    }

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { typedAnswer: '', recordingStatus: 'none' }),
        voiceAudioUrl: null,
        voiceBlob: null,
        recordingStatus: 'none',
      },
    }));
  };

  // Play / Pause Recorded Audio for current question
  const togglePlayRecordedAudio = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = String(currentQ.id);
    const audioUrl = answers[qId]?.voiceAudioUrl;
    if (!audioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    } else if (audioPlayerRef.current.src !== audioUrl) {
      audioPlayerRef.current.src = audioUrl;
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

  // Navigation handlers
  const handleGoNext = () => {
    stopAllMedia();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handleGoPrev = () => {
    stopAllMedia();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    stopAllMedia();
    setCurrentIndex(index);
    setShowPalette(false);
  };

  // Compute stats
  const totalQuestionsCount = questions.length;
  const answeredQuestionsCount = questions.filter((q) => {
    const qId = String(q.id);
    const a = answers[qId];
    return Boolean((a?.typedAnswer && a.typedAnswer.trim().length > 0) || a?.voiceAudioUrl);
  }).length;

  const currentQ = questions[currentIndex];
  const currentQId = currentQ ? String(currentQ.id) : '';
  const currentAnswerState: QuestionAnswerState = answers[currentQId] || {
    typedAnswer: '',
    voiceAudioUrl: null,
    recordingStatus: 'none',
  };

  // Final Submit Handler
  const executeSubmission = async (reason: 'manual' | 'timeout') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    stopAllMedia();

    const timeSpent = Math.max(1, totalDurationSeconds - secondsRemaining);

    // Prepare payload
    const payloadTheoryAnswers: Record<string, { typedAnswer: string; voiceRecordingUrl: string | null }> = {};
    for (const q of questions) {
      const qId = String(q.id);
      const state = answers[qId];
      payloadTheoryAnswers[qId] = {
        typedAnswer: state?.typedAnswer || '',
        voiceRecordingUrl: state?.voiceAudioUrl || null,
      };
    }

    try {
      const res = await api.submitTheoryExam(exam.id, {
        theoryAnswers: payloadTheoryAnswers,
        timeSpentSeconds: timeSpent,
        submissionReason: reason,
      });

      // Clear cached session
      try {
        localStorage.removeItem(storageKey);
      } catch {}

      setCompletedResult({
        attempt: res.attempt,
        detailedAnswers: res.detailedAnswers,
        attemptedCount: res.attemptedCount,
        unansweredCount: res.unansweredCount,
        totalQuestions: res.totalQuestions,
      });
      setShowSubmitModal(false);
    } catch (err: any) {
      console.error('Theory submission error:', err);
      // Fallback local attempt display so user never loses their responses
      const mockDetailedAnswers = questions.map((q) => {
        const qId = String(q.id);
        const a = answers[qId];
        const isAtt = Boolean((a?.typedAnswer && a.typedAnswer.trim().length > 0) || a?.voiceAudioUrl);
        return {
          questionId: q.id,
          id: q.id,
          category: q.category,
          question: q.question,
          questionText: q.questionText || q.question,
          typedAnswer: a?.typedAnswer || '',
          voiceRecordingUrl: a?.voiceAudioUrl || null,
          modelAnswer: q.modelAnswer || (q as any).explanation || 'Model answer available for clinical study.',
          isCorrect: isAtt,
        };
      });

      const fallbackAttempt: ExamAttempt = {
        id: `att-theory-${Date.now()}`,
        userId: 'current-student',
        userName: 'Nursing Candidate',
        userEmail: 'student@nursesstudy.com',
        examId: exam.id,
        examTitle: exam.title,
        subjectName: exam.subjectName || 'Anatomy & Physiology',
        type: 'theory_exam',
        examType: 'theory',
        score: Math.round((answeredQuestionsCount / (totalQuestionsCount || 1)) * 100),
        correctCount: answeredQuestionsCount,
        totalQuestions: totalQuestionsCount,
        timeSpentSeconds: timeSpent,
        passed: true,
        submissionReason: reason,
        answers: mockDetailedAnswers.map((item) => ({
          questionId: String(item.questionId),
          typedAnswer: item.typedAnswer,
          voiceRecordingUrl: item.voiceRecordingUrl,
          modelAnswer: item.modelAnswer,
          category: item.category,
          questionText: item.questionText,
          isCorrect: Boolean(item.typedAnswer || item.voiceRecordingUrl),
        })),
        createdAt: new Date().toISOString(),
      };

      setCompletedResult({
        attempt: fallbackAttempt,
        detailedAnswers: mockDetailedAnswers,
        attemptedCount: answeredQuestionsCount,
        unansweredCount: totalQuestionsCount - answeredQuestionsCount,
        totalQuestions: totalQuestionsCount,
      });
      setShowSubmitModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmitOnTimeout = () => {
    executeSubmission('timeout');
  };

  // Helper time format
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==================== VIEW 1: LOADING STATE ==================== //
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-12 text-center space-y-4">
        <div className="bg-[#111827] rounded-3xl p-10 border border-slate-800 shadow-xl max-w-lg mx-auto">
          <div className="w-12 h-12 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white">Preparing Theory Examination Hall...</h2>
          <p className="text-xs text-slate-400 mt-1">
            Loading standardized clinical theory questions, model answers, and audio modules for {exam.title}.
          </p>
        </div>
      </div>
    );
  }

  // ==================== VIEW 2: ERROR STATE ==================== //
  if (loadError || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-4">
        <div className="bg-[#111827] rounded-3xl p-8 border border-rose-800/50 shadow-xl max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">Theory Examination Unavailable</h2>
          <p className="text-xs text-rose-300 mt-1">{loadError || 'No theory questions found for this examination.'}</p>
          <button
            onClick={onExit}
            className="mt-5 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Return to CBT Hall
          </button>
        </div>
      </div>
    );
  }

  // ==================== VIEW 3: COMPLETED RESULTS & REVIEW ==================== //
  if (completedResult) {
    const { attempt, detailedAnswers, attemptedCount, unansweredCount, totalQuestions } = completedResult;

    const filteredReview = detailedAnswers.filter((item) => {
      const isAtt = Boolean((item.typedAnswer && item.typedAnswer.trim().length > 0) || item.voiceRecordingUrl);
      if (activeReviewFilter === 'attempted') return isAtt;
      if (activeReviewFilter === 'unanswered') return !isAtt;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onFinishExam(attempt.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Return to CBT Hall</span>
          </button>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
            THEORY CBT COMPLETED
          </span>
        </div>

        {/* Completion Card */}
        <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 rounded-md">
                {attempt.subjectName}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">{attempt.examTitle}</h1>
              <p className="text-xs text-slate-400">
                Examination submitted at {new Date(attempt.createdAt).toLocaleTimeString()} • Reason:{' '}
                <span className="capitalize font-semibold text-slate-300">{attempt.submissionReason || 'manual'}</span>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center min-w-[160px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Used</span>
              <span className="text-2xl font-extrabold text-teal-400 font-mono">
                {formatTime(attempt.timeSpentSeconds)}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Questions</span>
              <span className="text-lg font-black text-white">{totalQuestions}</span>
            </div>
            <div className="bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-500/30 text-center">
              <span className="text-[10px] font-semibold text-emerald-300 uppercase block">Attempted</span>
              <span className="text-lg font-black text-emerald-400">{attemptedCount}</span>
            </div>
            <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-500/30 text-center">
              <span className="text-[10px] font-semibold text-rose-300 uppercase block">Unanswered</span>
              <span className="text-lg font-black text-rose-400">{unansweredCount}</span>
            </div>
          </div>
        </div>

        {/* Review Answers Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <span>Review Theory Questions & Model Answers</span>
              </h2>
              <p className="text-xs text-slate-400">
                Compare your responses against standard clinical nursing council model answers.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveReviewFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeReviewFilter === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({detailedAnswers.length})
              </button>
              <button
                onClick={() => setActiveReviewFilter('attempted')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeReviewFilter === 'attempted'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Attempted ({attemptedCount})
              </button>
              <button
                onClick={() => setActiveReviewFilter('unanswered')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeReviewFilter === 'unanswered'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unanswered ({unansweredCount})
              </button>
            </div>
          </div>

          {/* List of Questions with Student Response vs Model Answer */}
          <div className="space-y-4">
            {filteredReview.map((item, idx) => {
              const isAtt = Boolean((item.typedAnswer && item.typedAnswer.trim().length > 0) || item.voiceRecordingUrl);

              return (
                <div
                  key={item.questionId || idx}
                  className="bg-[#111827] rounded-3xl border border-slate-800 p-6 space-y-4 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                        Q{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {item.category || 'General'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        isAtt
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isAtt ? 'Answered' : 'Unanswered'}
                    </span>
                  </div>

                  {/* Question text */}
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {item.questionText || item.question}
                  </h3>

                  {/* Student Written Response */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      <span>Your Written Response</span>
                    </label>
                    <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed min-h-[50px] whitespace-pre-wrap font-sans">
                      {item.typedAnswer && item.typedAnswer.trim().length > 0 ? (
                        item.typedAnswer
                      ) : (
                        <span className="text-slate-500 italic">No written answer submitted for this question.</span>
                      )}
                    </div>
                  </div>

                  {/* Student Audio Answer if exists */}
                  {item.voiceRecordingUrl && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-teal-400" />
                        <span>Your Spoken Voice Recording</span>
                      </label>
                      <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
                        <audio controls src={item.voiceRecordingUrl} className="w-full h-8" />
                      </div>
                    </div>
                  )}

                  {/* Model Answer */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Standard Model Answer & Key Points</span>
                    </label>
                    <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/30 text-xs text-emerald-100/90 leading-relaxed whitespace-pre-wrap">
                      {item.modelAnswer || item.explanation || 'Consult standard nursing anatomy syllabus.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== VIEW 4: ACTIVE THEORY EXAM WORKSPACE ==================== //
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 select-none animate-in fade-in">
      {/* Top Examination Context Header */}
      <header className="bg-[#111827] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600/20 border border-teal-500/40 text-teal-300 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs">
            TH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white">{exam.title}</h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                THEORY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Question {currentIndex + 1} of {totalQuestionsCount} • Answered: {answeredQuestionsCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Question Palette Button */}
          <button
            type="button"
            onClick={() => setShowPalette(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Question Palette"
          >
            <LayoutGrid className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Palette</span>
          </button>

          {/* Countdown Clock */}
          <div
            className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm ${
              secondsRemaining < 300
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/60 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-teal-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Submit / Finish Button */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-900/30 cursor-pointer flex items-center gap-1"
          >
            <span>Finish</span>
          </button>
        </div>
      </header>

      {/* Question Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestionsCount) * 100}%` }}
        />
      </div>

      {/* Main Question Box */}
      <main className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Question Header & Category */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md bg-teal-950 text-teal-300 border border-teal-800/80">
              {currentQ?.category || 'General Characteristics'}
            </span>

            <span className="text-xs font-mono font-bold text-slate-400">
              Q{currentIndex + 1} / {totalQuestionsCount}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
            {currentQ?.questionText || currentQ?.question}
          </h2>

          {/* Read Question & Voice Dictation Audio Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleReadQuestion}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
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

            {dictationSupported && (
              <button
                type="button"
                onClick={handleToggleDictation}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isDictating
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <Mic className={`w-3.5 h-3.5 ${isDictating ? 'text-rose-400' : 'text-purple-400'}`} />
                <span>{isDictating ? 'Stop Dictation' : 'Voice Dictation'}</span>
              </button>
            )}

            {isDictating && (
              <span className="text-[11px] text-rose-300 font-medium px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                Listening... Speak your response
              </span>
            )}

            {speechError && (
              <span className="text-[11px] text-amber-400/90 font-medium px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
                {speechError}
              </span>
            )}
          </div>
        </div>

        {/* METHOD A: TYPED ANSWER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Your Answer (Type or Dictate):</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {currentAnswerState.typedAnswer.trim().split(/\s+/).filter(Boolean).length} words • Auto-saved
            </span>
          </div>

          <textarea
            value={currentAnswerState.typedAnswer}
            onChange={(e) => handleTypedAnswerChange(e.target.value)}
            placeholder="Type your comprehensive theoretical explanation, anatomical structures, physiological pathways, and clinical nursing considerations here..."
            className="w-full min-h-[180px] sm:min-h-[220px] p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-y font-sans"
          />
        </div>

        {/* METHOD B: VOICE RECORDING OPTION */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                <Radio className="w-4 h-4 text-teal-400" />
                <span>Method B: Optional Spoken Voice Answer</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Record your voice using the microphone. Completely optional; you may also submit by typing alone.
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{currentAnswerState.voiceAudioUrl ? 'Re-record Answer' : 'Record Voice Answer'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all animate-pulse shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording ({recordDuration}s)</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Recording Indicator */}
          {isRecording && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center justify-between text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold">Microphone active. Recording your response...</span>
              </div>
              <span className="font-mono font-bold">{recordDuration}s</span>
            </div>
          )}

          {/* Microphone Error Note */}
          {micError && (
            <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{micError}</span>
            </div>
          )}

          {/* Recorded Audio Playback and Delete */}
          {currentAnswerState.voiceAudioUrl && !isRecording && (
            <div className="p-3 bg-slate-950 border border-teal-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-teal-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Spoken audio recording saved for Q{currentIndex + 1}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayRecordedAudio}
                  className="px-3 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer"
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
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Model Answer / Feedback Section (Revealed via toggle) */}
        {revealedModelAnswers[currentQId] && (
          <div className="p-4 sm:p-5 bg-emerald-950/25 border border-emerald-500/35 rounded-2xl animate-in fade-in space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Expert Model Answer / Key Points:</span>
              </h3>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Self-Review Mode
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed whitespace-pre-wrap font-sans">
              {currentQ?.modelAnswer || currentQ?.explanation || 'Model answer available for clinical study.'}
            </p>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handleGoPrev}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowPalette(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-teal-400" />
              <span>Jump to Q...</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRevealedModelAnswers((prev) => ({
                  ...prev,
                  [currentQId]: !prev[currentQId],
                }));
              }}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>{revealedModelAnswers[currentQId] ? 'Hide Model Answer' : 'View Model Answer'}</span>
            </button>

            {currentIndex === totalQuestionsCount - 1 ? (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-900/30 cursor-pointer flex items-center gap-1.5"
              >
                <span>Submit Theory Exam</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoNext}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-900/30 cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* QUESTION PALETTE DRAWER / MODAL */}
      {showPalette && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Question Navigation Palette</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPalette(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-teal-600 inline-block" />
                <span>Answered ({answeredQuestionsCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700 inline-block" />
                <span>Unanswered ({totalQuestionsCount - answeredQuestionsCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md ring-2 ring-teal-400 bg-slate-900 inline-block" />
                <span>Current</span>
              </div>
            </div>

            {/* Questions Grid 1 to 50 */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 overflow-y-auto p-1 flex-1 custom-scrollbar">
              {questions.map((q, idx) => {
                const qId = String(q.id);
                const a = answers[qId];
                const isAnswered = Boolean((a?.typedAnswer && a.typedAnswer.trim().length > 0) || a?.voiceAudioUrl);
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700';
                if (isAnswered) {
                  btnClass = 'bg-teal-600 text-white font-bold border-teal-500 shadow-sm';
                }
                if (isCurrent) {
                  btnClass += ' ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950 font-black';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowPalette(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Close Palette
            </button>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION DIALOG */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-600/20 border border-teal-500/40 text-teal-400 flex items-center justify-center mx-auto">
              <Send className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Submit Theory Examination?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have reached the end of the examination. Submit your answers?
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Attempted</span>
                <span className="text-emerald-400 font-bold">{answeredQuestionsCount} Questions</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Unanswered</span>
                <span className="text-rose-400 font-bold">{totalQuestionsCount - answeredQuestionsCount} Questions</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executeSubmission('manual')}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-900/40 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Exam</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
