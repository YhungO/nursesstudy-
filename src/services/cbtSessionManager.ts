/**
 * CBT Session Manager & Auto-Save Recovery Service
 * Ensures zero data loss during Computer-Based Testing:
 * - Persists every answer, flag, and question cursor to local storage
 * - Calculates remaining time against a wall-clock deadline
 * - Restores active sessions across page refreshes and browser tab suspensions
 * - Queues pending submissions if network is temporarily offline
 */

export interface CbtActiveSession {
  examId: string;
  examTitle: string;
  startTime: number; // Unix ms
  endTime: number; // Unix ms (absolute wall-clock deadline)
  durationMinutes: number;
  currentIndex: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
  flaggedQuestions: Record<string, boolean>;
  shuffledQuestions?: Record<string, any[]>;
  lastUpdated: number;
}

export interface PendingCbtSubmission {
  examId: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
  timeSpentSeconds: number;
  submissionReason: 'manual' | 'timeout' | 'forced';
  timestamp: number;
  shuffledOptions?: Record<string, any[]>;
}

const SESSION_PREFIX = 'nursesstudy_cbt_session_';
const PENDING_SUBMISSIONS_KEY = 'nursesstudy_pending_cbt_submissions';

export const cbtSessionManager = {
  /**
   * Save or update an active exam session immediately on every answer/flag change
   */
  saveSession(session: CbtActiveSession): void {
    try {
      if (!session || !session.examId) return;
      const key = `${SESSION_PREFIX}${session.examId}`;
      const payload = {
        ...session,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (err) {
      console.warn('[CBT Session Manager] Failed to write session to localStorage:', err);
    }
  },

  /**
   * Update answers in an active session without modifying other fields
   */
  updateAnswers(
    examId: string,
    answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>,
    currentIndex?: number
  ): void {
    try {
      const existing = this.getSession(examId);
      if (existing) {
        existing.answers = { ...existing.answers, ...answers };
        if (typeof currentIndex === 'number') {
          existing.currentIndex = currentIndex;
        }
        this.saveSession(existing);
      }
    } catch (err) {
      console.warn('[CBT Session Manager] Failed to update answers in session:', err);
    }
  },

  /**
   * Retrieve an active session for an exam
   */
  getSession(examId: string): CbtActiveSession | null {
    try {
      if (!examId) return null;
      const key = `${SESSION_PREFIX}${examId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CbtActiveSession;
      if (!parsed || !parsed.examId || !parsed.endTime) return null;
      return parsed;
    } catch (err) {
      console.warn('[CBT Session Manager] Failed to parse session from localStorage:', err);
      return null;
    }
  },

  /**
   * Clear active session after successful submission or explicit exit
   */
  clearSession(examId: string): void {
    try {
      if (!examId) return;
      localStorage.removeItem(`${SESSION_PREFIX}${examId}`);
    } catch (err) {
      console.warn('[CBT Session Manager] Failed to clear session:', err);
    }
  },

  /**
   * Check if a session has expired (wall-clock deadline passed)
   */
  isSessionExpired(session: CbtActiveSession): boolean {
    if (!session || !session.endTime) return true;
    return Date.now() >= session.endTime;
  },

  /**
   * Save a pending submission for offline retry
   */
  savePendingSubmission(submission: PendingCbtSubmission): void {
    try {
      const existing = this.getPendingSubmissions();
      const filtered = existing.filter((s) => s.examId !== submission.examId);
      filtered.push(submission);
      localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.warn('[CBT Session Manager] Failed to queue pending submission:', err);
    }
  },

  /**
   * Get all queued pending submissions
   */
  getPendingSubmissions(): PendingCbtSubmission[] {
    try {
      const raw = localStorage.getItem(PENDING_SUBMISSIONS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Remove a completed submission from offline queue
   */
  removePendingSubmission(examId: string): void {
    try {
      const existing = this.getPendingSubmissions();
      const filtered = existing.filter((s) => s.examId !== examId);
      localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.warn('[CBT Session Manager] Failed to remove pending submission:', err);
    }
  },
};
