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

// Prevent Garbage Collection of active utterances in Chromium & Android WebView
const activeUtterances = new Set<SpeechSynthesisUtterance>();
if (typeof window !== 'undefined') {
  (window as any).__activeSpeechUtterances = activeUtterances;
}

/**
 * Splits text into natural sentence/clause chunks to prevent Android TTS buffer timeouts.
 */
function splitIntoSpokenChunks(text: string, maxChunkLength: number = 200): string[] {
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= maxChunkLength) return [clean];

  // Match sentences or natural clauses (. ? ! ; : or newline)
  const rawSegments = clean.match(/[^.!?;\n:]+[.!?;\n:]*|\S+/g) || [clean];
  const chunks: string[] = [];
  let current = '';

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    if (current && (current.length + trimmed.length + 1 > maxChunkLength)) {
      chunks.push(current);
      current = trimmed;
    } else {
      current = current ? `${current} ${trimmed}` : trimmed;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [clean];
}

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
export function loadSpeechSynthesisVoices(timeoutMs: number = 2500): Promise<SpeechSynthesisVoice[]> {
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
 * Selects the best available English voice, prioritizing local offline voices
 * and falling back gracefully without declaring the device unsupported.
 */
export function getBestEnglishVoice(voices?: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const voiceList = voices && voices.length > 0
    ? voices
    : (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis?.getVoices()) || [];

  if (!voiceList || voiceList.length === 0) {
    return null;
  }

  // 1. Priority: Local offline English voice (guaranteed to work on Android without network)
  const localEnglish = voiceList.find(
    (v) => v.lang && v.lang.toLowerCase().startsWith('en') && (v as any).localService === true
  );
  if (localEnglish) return localEnglish;

  // 2. Priority: Natural/Enhanced English voice from Google or Samsung
  const enhancedEnglish = voiceList.find(
    (v) =>
      v.lang &&
      v.lang.toLowerCase().startsWith('en') &&
      (v.name.includes('Google') || v.name.includes('Samsung') || v.name.includes('Natural') || v.name.includes('Premium'))
  );
  if (enhancedEnglish) return enhancedEnglish;

  // 3. Priority: Standard en-US or en-GB
  const standardEn = voiceList.find((v) => v.lang === 'en-US' || v.lang === 'en-GB');
  if (standardEn) return standardEn;

  // 4. Priority: Any English language prefix
  const anyEnglish = voiceList.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 5. Fallback: Default voice or first available
  const defaultVoice = voiceList.find((v) => v.default);
  return defaultVoice || voiceList[0] || null;
}

/**
 * Cancels any currently active speech synthesis utterances and resets paused state.
 */
export function stopSpeechSynthesis(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      activeUtterances.forEach((u) => {
        u.onstart = null;
        u.onend = null;
        u.onerror = null;
      });
      activeUtterances.clear();
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (err) {
      console.warn('stopSpeechSynthesis error:', err);
    }
  }
}

/**
 * Reads text aloud using window.speechSynthesis with Android compatibility guards,
 * sentence chunking (to prevent Android 15-second buffer stalls), and voice fallbacks.
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
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (!clean) {
    options?.onError?.(new Error('No text provided to read aloud.'));
    return { cancel: () => {}, utterance: null };
  }

  // Stop previous speech session cleanly
  stopSpeechSynthesis();

  // Split into manageable sentence chunks for Android TTS stability
  const chunks = splitIntoSpokenChunks(clean, 180);
  if (chunks.length === 0) {
    options?.onError?.(new Error('No readable text content.'));
    return { cancel: () => {}, utterance: null };
  }

  let isCancelled = false;
  let activeVoice = options?.voice !== undefined ? options.voice : getBestEnglishVoice();
  let currentChunkUtterance: SpeechSynthesisUtterance | null = null;

  const playChunk = (index: number) => {
    if (isCancelled || index >= chunks.length) {
      if (!isCancelled && index >= chunks.length) {
        options?.onEnd?.();
      }
      return;
    }

    try {
      const chunkText = chunks[index];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      currentChunkUtterance = utterance;

      utterance.rate = options?.rate ?? 0.95;
      utterance.pitch = options?.pitch ?? 1.0;
      if (typeof options?.volume === 'number') {
        utterance.volume = Math.max(0, Math.min(1, options.volume));
      }

      // Configure voice and language
      if (activeVoice) {
        utterance.voice = activeVoice;
        utterance.lang = activeVoice.lang || options?.lang || 'en-US';
      } else {
        utterance.lang = options?.lang || 'en-US';
      }

      // Keep strong reference to prevent Chromium / Android WebView GC
      activeUtterances.add(utterance);

      utterance.onstart = () => {
        if (isCancelled) return;
        if (index === 0) {
          options?.onStart?.();
        }
      };

      utterance.onend = () => {
        activeUtterances.delete(utterance);
        if (isCancelled) return;
        playChunk(index + 1);
      };

      utterance.onerror = (event: any) => {
        activeUtterances.delete(utterance);
        if (isCancelled) return;

        // Normal cancellation or interruption should not trigger user errors
        if (event?.error === 'canceled' || event?.error === 'interrupted') {
          return;
        }

        // Voice/language unavailable on Android: retry this chunk with system default voice
        if (
          activeVoice &&
          (event?.error === 'voice-unavailable' ||
            event?.error === 'language-unavailable' ||
            event?.error === 'audio-busy')
        ) {
          console.warn(`[SpeechSynthesis] Selected voice failed (${event.error}), falling back to Android default.`);
          activeVoice = null;
          playChunk(index);
          return;
        }

        options?.onError?.(event);
      };

      // On Android, calling speak() immediately after cancel() can be cancelled by IPC queue.
      // A small timeout on chunk 0 ensures the Android TTS engine clears its cancelation queue.
      if (index === 0) {
        setTimeout(() => {
          if (!isCancelled) {
            try {
              if (window.speechSynthesis && window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
              window.speechSynthesis.speak(utterance);
            } catch (speakErr) {
              activeUtterances.delete(utterance);
              options?.onError?.(speakErr);
            }
          }
        }, 35);
      } else {
        if (window.speechSynthesis && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      }
    } catch (chunkErr) {
      if (!isCancelled) {
        options?.onError?.(chunkErr);
      }
    }
  };

  playChunk(0);

  return {
    cancel: () => {
      isCancelled = true;
      stopSpeechSynthesis();
    },
    utterance: currentChunkUtterance,
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
    'audio/wav',
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
    return 'Microphone permission was denied. Please allow microphone access in your browser or Android device settings, or type your answer.';
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
    // Attempt standard speech optimization constraints first
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch {
    // Fall back to simple audio capture if device does not support extended audio constraints
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      throw new Error(mapMicrophoneError(err));
    }
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

  // Start recording with chunking, with fallback for Android WebViews that reject timeslice parameter
  try {
    if (typeof options?.timeslice === 'number' && options.timeslice > 0) {
      mediaRecorder.start(options.timeslice);
    } else {
      mediaRecorder.start(1000);
    }
  } catch (startWithTimesliceErr) {
    console.warn('MediaRecorder.start with timeslice failed on this device, attempting without timeslice:', startWithTimesliceErr);
    try {
      mediaRecorder.start();
    } catch (startWithoutTimesliceErr) {
      cleanupMediaStreamTracks(stream);
      throw new Error(mapMicrophoneError(startWithoutTimesliceErr));
    }
  }

  return {
    mediaRecorder,
    stream,
    stop: () =>
      new Promise<AudioRecordingResult>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          try {
            cleanupMediaStreamTracks(stream);
            if (audioChunks.length === 0) {
              reject(new Error('No audio was captured. Please speak into the microphone and try again.'));
              return;
            }
            const finalMime = mediaRecorder.mimeType || selectedMime || 'audio/webm';
            const audioBlob = new Blob(audioChunks, { type: finalMime });
            if (audioBlob.size === 0) {
              reject(new Error('Audio recording was empty. Please try recording again.'));
              return;
            }
            const audioUrl = URL.createObjectURL(audioBlob);
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
            try {
              if (typeof mediaRecorder.requestData === 'function') {
                mediaRecorder.requestData();
              }
            } catch {}
            mediaRecorder.stop();
          } else {
            cleanupMediaStreamTracks(stream);
            if (audioChunks.length > 0) {
              const finalMime = mediaRecorder.mimeType || selectedMime || 'audio/webm';
              const audioBlob = new Blob(audioChunks, { type: finalMime });
              const audioUrl = URL.createObjectURL(audioBlob);
              resolve({ blob: audioBlob, url: audioUrl, mimeType: finalMime });
            } else {
              reject(new Error('Recording was stopped before audio was captured.'));
            }
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
