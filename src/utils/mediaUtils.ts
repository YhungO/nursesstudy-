/**
 * mediaUtils.ts
 *
 * Robust, cross-browser, and Android-compatible utility module for:
 * 1. Text-to-Speech (speechSynthesis) with voice loading and fallbacks.
 * 2. Microphone audio recording (MediaRecorder) with explicit on-demand permissions.
 * 3. Speech-to-Text / Speech Recognition capability detection.
 *
 * Each capability is treated independently to ensure devices lacking one feature
 * (e.g. mic permission in an iframe) can still use other features (e.g. read question aloud).
 */

export interface SpeechSynthesisSupport {
  isSupported: boolean;
  reason?: string;
}

export interface MicrophoneSupport {
  isSupported: boolean;
  isSecureContext: boolean;
  isInIframe: boolean;
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
  reason?: string;
}

export interface SpeechRecognitionSupport {
  isSupported: boolean;
  apiName: 'SpeechRecognition' | 'webkitSpeechRecognition' | null;
  reason?: string;
}

export interface AudioRecordingResult {
  blob: Blob;
  url: string;
  mimeType: string;
}

export interface AudioRecordingSession {
  mediaRecorder: MediaRecorder;
  stream: MediaStream;
  stop: () => Promise<AudioRecordingResult>;
  cancel: () => void;
}

export interface SpeakOptions {
  voice?: SpeechSynthesisVoice | null;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// ============================================================================
// 1. TEXT-TO-SPEECH (speechSynthesis) CAPABILITY & UTILITIES
// ============================================================================

/**
 * Checks if the current browser environment supports the SpeechSynthesis API.
 */
export function checkSpeechSynthesisSupport(): SpeechSynthesisSupport {
  if (typeof window === 'undefined') {
    return { isSupported: false, reason: 'Window object is undefined (SSR environment).' };
  }

  if (!('speechSynthesis' in window) || !window.speechSynthesis) {
    return {
      isSupported: false,
      reason: 'SpeechSynthesis API is not available on this browser or platform.',
    };
  }

  if (typeof window.SpeechSynthesisUtterance === 'undefined') {
    return {
      isSupported: false,
      reason: 'SpeechSynthesisUtterance constructor is missing.',
    };
  }

  return { isSupported: true };
}

/**
 * Safely loads available SpeechSynthesis voices, handling Android's asynchronous voice loading.
 */
export function loadSpeechSynthesisVoices(timeoutMs: number = 2000): Promise<SpeechSynthesisVoice[]> {
  const support = checkSpeechSynthesisSupport();
  if (!support.isSupported) {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    try {
      const immediateVoices = window.speechSynthesis.getVoices();
      if (immediateVoices && immediateVoices.length > 0) {
        return resolve(immediateVoices);
      }

      let isResolved = false;
      const onVoicesChanged = () => {
        if (isResolved) return;
        try {
          const loaded = window.speechSynthesis.getVoices();
          if (loaded && loaded.length > 0) {
            isResolved = true;
            cleanup();
            resolve(loaded);
          }
        } catch {
          // ignore error during voice loading
        }
      };

      const cleanup = () => {
        if (typeof window.speechSynthesis.removeEventListener === 'function') {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        } else {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };

      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      } else {
        window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      }

      // Timeout fallback in case voiceschanged never fires (e.g. some webviews)
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          try {
            resolve(window.speechSynthesis.getVoices() || []);
          } catch {
            resolve([]);
          }
        }
      }, timeoutMs);
    } catch (err) {
      console.warn('Error loading speech synthesis voices:', err);
      resolve([]);
    }
  });
}

/**
 * Selects the best available English voice, prioritizing native English voices
 * and falling back gracefully without declaring the device unsupported.
 */
export function getBestEnglishVoice(voices?: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const voiceList = voices && voices.length > 0
    ? voices
    : (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis?.getVoices()) || [];

  if (!voiceList || voiceList.length === 0) {
    return null;
  }

  // 1. Priority: US English with natural/enhanced/Google voice
  const usNatural = voiceList.find(
    (v) =>
      v.lang === 'en-US' &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
  );
  if (usNatural) return usNatural;

  // 2. Priority: Standard en-US or en-GB
  const standardEn = voiceList.find((v) => v.lang === 'en-US' || v.lang === 'en-GB');
  if (standardEn) return standardEn;

  // 3. Priority: Any English language prefix
  const anyEnglish = voiceList.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 4. Fallback: Default voice or first available
  const defaultVoice = voiceList.find((v) => v.default);
  return defaultVoice || voiceList[0] || null;
}

/**
 * Cancels any currently active speech synthesis utterances and resets paused state.
 */
export function stopSpeechSynthesis(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('stopSpeechSynthesis error:', err);
    }
  }
}

/**
 * Reads text aloud using window.speechSynthesis with Android compatibility guards.
 */
export function speakText(
  text: string,
  options?: SpeakOptions
): { cancel: () => void; utterance: SpeechSynthesisUtterance | null } {
  const support = checkSpeechSynthesisSupport();
  if (!support.isSupported) {
    options?.onError?.(new Error(support.reason || 'Speech synthesis is not supported.'));
    return { cancel: () => {}, utterance: null };
  }

  // Clean text and strip any stray HTML formatting
  const clean = text.replace(/<[^>]*>?/gm, '').trim();
  if (!clean) {
    options?.onError?.(new Error('No text provided to read aloud.'));
    return { cancel: () => {}, utterance: null };
  }

  // Cancel prior speech and resume if paused by Android background process
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = options?.pitch ?? 1.0;
  if (typeof options?.volume === 'number') {
    utterance.volume = Math.max(0, Math.min(1, options.volume));
  }

  // Determine voice
  const voiceToUse = options?.voice || getBestEnglishVoice();
  if (voiceToUse) {
    utterance.voice = voiceToUse;
    utterance.lang = voiceToUse.lang || options?.lang || 'en-US';
  } else {
    utterance.lang = options?.lang || 'en-US';
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (event: any) => {
    // Normal interruption / cancelation is not an operational failure
    if (event.error === 'canceled' || event.error === 'interrupted') {
      return;
    }
    options?.onError?.(event);
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    options?.onError?.(err);
  }

  return {
    cancel: () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    },
    utterance,
  };
}

// ============================================================================
// 2. MICROPHONE & MEDIARECORDER CAPABILITY & UTILITIES
// ============================================================================

/**
 * Diagnostic check for microphone and MediaRecorder availability.
 */
export function checkMicrophoneSupport(): MicrophoneSupport {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      isSecureContext: false,
      isInIframe: false,
      hasMediaDevices: false,
      hasGetUserMedia: false,
      hasMediaRecorder: false,
      reason: 'Window object is undefined (SSR).',
    };
  }

  const isSecureContext = window.isSecureContext !== false;
  const isInIframe = window.self !== window.top;
  const hasMediaDevices = Boolean(navigator && navigator.mediaDevices);
  const hasGetUserMedia = Boolean(hasMediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
  const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';

  if (!isSecureContext) {
    return {
      isSupported: false,
      isSecureContext,
      isInIframe,
      hasMediaDevices,
      hasGetUserMedia,
      hasMediaRecorder,
      reason: 'Microphone access requires a secure origin (HTTPS or localhost).',
    };
  }

  if (!hasGetUserMedia) {
    return {
      isSupported: false,
      isSecureContext,
      isInIframe,
      hasMediaDevices,
      hasGetUserMedia,
      hasMediaRecorder,
      reason: isInIframe
        ? 'Microphone access is restricted by the embedding frame permissions policy.'
        : 'Microphone capture (getUserMedia) is not supported in this browser.',
    };
  }

  if (!hasMediaRecorder) {
    return {
      isSupported: false,
      isSecureContext,
      isInIframe,
      hasMediaDevices,
      hasGetUserMedia,
      hasMediaRecorder,
      reason: 'Audio recording (MediaRecorder) is not supported in this browser.',
    };
  }

  return {
    isSupported: true,
    isSecureContext,
    isInIframe,
    hasMediaDevices,
    hasGetUserMedia,
    hasMediaRecorder,
  };
}

/**
 * Evaluates candidate MIME types and returns the best supported audio container for MediaRecorder.
 */
export function getSupportedAudioMimeType(): string | undefined {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return undefined;
  }

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {
      // Continue to next candidate
    }
  }

  return undefined;
}

/**
 * Safely stops and frees all audio hardware tracks associated with a MediaStream.
 */
export function cleanupMediaStreamTracks(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.warn('Error stopping track:', err);
      }
    });
  } catch (err) {
    console.warn('Error cleaning up media stream:', err);
  }
}

/**
 * Maps raw getUserMedia / MediaRecorder errors into actionable, user-friendly messages.
 */
export function mapMicrophoneError(err: any): string {
  const errorName = err?.name || '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    if (isInIframe) {
      return 'Microphone access was denied or restricted by embedding frame permissions policy. You can type your answer instead.';
    }
    return 'Microphone permission was denied. Please allow microphone access in your browser site settings, or type your answer.';
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return 'No microphone was detected on this device. You can type your answer directly.';
  }

  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return 'Microphone is currently in use by another app or call. Please release it and retry, or type your answer.';
  }

  if (errorName === 'SecurityError') {
    return 'Microphone access is blocked by browser security policy. You can type your answer instead.';
  }

  if (errorName === 'OverconstrainedError') {
    return 'Requested audio format is not supported by your microphone. You can type your answer.';
  }

  return `Microphone notice: ${err?.message || errorName || 'Unable to access microphone'}. You can type your answer.`;
}

/**
 * Requests microphone permission on-demand and begins an audio recording session.
 */
export async function startAudioRecording(options?: {
  mimeType?: string;
  timeslice?: number;
}): Promise<AudioRecordingSession> {
  const support = checkMicrophoneSupport();
  if (!support.isSupported) {
    throw new Error(support.reason || 'Microphone recording is not available.');
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    throw new Error(mapMicrophoneError(err));
  }

  const selectedMime = options?.mimeType || getSupportedAudioMimeType();
  const recorderOptions: MediaRecorderOptions = selectedMime ? { mimeType: selectedMime } : {};

  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = new MediaRecorder(stream, recorderOptions);
  } catch (mimeErr) {
    console.warn('MediaRecorder with specified MIME type failed, trying default:', mimeErr);
    try {
      mediaRecorder = new MediaRecorder(stream);
    } catch (fallbackErr) {
      cleanupMediaStreamTracks(stream);
      throw new Error(mapMicrophoneError(fallbackErr));
    }
  }

  const audioChunks: Blob[] = [];

  mediaRecorder.ondataavailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.start(options?.timeslice ?? 250);

  return {
    mediaRecorder,
    stream,
    stop: () =>
      new Promise<AudioRecordingResult>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          try {
            const finalMime = mediaRecorder.mimeType || selectedMime || 'audio/webm';
            const audioBlob = new Blob(audioChunks, { type: finalMime });
            const audioUrl = URL.createObjectURL(audioBlob);
            cleanupMediaStreamTracks(stream);
            resolve({ blob: audioBlob, url: audioUrl, mimeType: finalMime });
          } catch (stopErr) {
            cleanupMediaStreamTracks(stream);
            reject(stopErr);
          }
        };

        mediaRecorder.onerror = (errEvent: any) => {
          cleanupMediaStreamTracks(stream);
          reject(new Error(errEvent?.error?.message || 'Recording encountered an error.'));
        };

        try {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          } else {
            cleanupMediaStreamTracks(stream);
            resolve({
              blob: new Blob(audioChunks, { type: selectedMime || 'audio/webm' }),
              url: '',
              mimeType: selectedMime || 'audio/webm',
            });
          }
        } catch (err) {
          cleanupMediaStreamTracks(stream);
          reject(err);
        }
      }),
    cancel: () => {
      try {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      } catch {}
      cleanupMediaStreamTracks(stream);
    },
  };
}

// ============================================================================
// 3. SPEECH RECOGNITION (DICTATION) CAPABILITY
// ============================================================================

/**
 * Diagnostic check for SpeechRecognition / webkitSpeechRecognition API support.
 */
export function checkSpeechRecognitionSupport(): SpeechRecognitionSupport {
  if (typeof window === 'undefined') {
    return { isSupported: false, apiName: null, reason: 'Window is undefined (SSR).' };
  }

  if (window.isSecureContext === false) {
    return {
      isSupported: false,
      apiName: null,
      reason: 'Voice dictation requires a secure origin (HTTPS).',
    };
  }

  const api = (window as any).SpeechRecognition
    ? 'SpeechRecognition'
    : (window as any).webkitSpeechRecognition
    ? 'webkitSpeechRecognition'
    : null;

  if (!api) {
    return {
      isSupported: false,
      apiName: null,
      reason: 'Speech recognition is not supported in this browser.',
    };
  }

  return { isSupported: true, apiName: api };
}

/**
 * Retrieves the SpeechRecognition constructor safely across standard and webkit prefixes.
 */
export function getSpeechRecognitionConstructor(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}
