/**
 * offlineStorage.ts
 *
 * Robust, client-side IndexedDB caching engine for NursesStudy.
 * Allows nursing students to persist and access:
 * - Study Notes (full articles, clinical pearls, topics, summaries, and offline status)
 * - Question Banks & CBT Exams (questions, options, explanations, scenarios)
 * - Curriculum Subjects & Levels (for offline category filtering and navigation)
 * - Platform Announcements & Metadata
 *
 * Works across modern browsers, progressive web app (PWA) standalone mode, Android Chrome, and Android WebView.
 */

import { StudyNote, Question, CBTExam, Subject, NursingLevel, Announcement } from '../types';

const DB_NAME = 'NursesStudyOfflineDB';
const DB_VERSION = 2;

export interface CachedNoteRecord extends StudyNote {
  isDownloadedOffline?: boolean;
  offlineSavedAt?: string;
}

export interface CachedQuestionRecord extends Question {
  isDownloadedOffline?: boolean;
  offlineSavedAt?: string;
}

export interface CachedExamRecord extends CBTExam {
  cachedQuestions?: Question[];
  isDownloadedOffline?: boolean;
  offlineSavedAt?: string;
}

export interface OfflineStorageSummary {
  notesCount: number;
  downloadedNotesCount: number;
  questionsCount: number;
  downloadedQuestionsCount: number;
  examsCount: number;
  downloadedExamsCount: number;
  lastSyncedAt: string | null;
}

class OfflineStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const tx = (event.target as IDBOpenDBRequest).transaction;

          // 1. Study Notes Store
          let noteStore: IDBObjectStore;
          if (!db.objectStoreNames.contains('studyNotes')) {
            noteStore = db.createObjectStore('studyNotes', { keyPath: 'id' });
            noteStore.createIndex('subjectId', 'subjectId', { unique: false });
            noteStore.createIndex('isDownloadedOffline', 'isDownloadedOffline', { unique: false });
          }

          // 2. Question Bank Store
          let questionStore: IDBObjectStore;
          if (!db.objectStoreNames.contains('questions')) {
            questionStore = db.createObjectStore('questions', { keyPath: 'id' });
            questionStore.createIndex('subjectId', 'subjectId', { unique: false });
            questionStore.createIndex('difficulty', 'difficulty', { unique: false });
            questionStore.createIndex('isDownloadedOffline', 'isDownloadedOffline', { unique: false });
          } else if (tx) {
            questionStore = tx.objectStore('questions');
            if (!questionStore.indexNames.contains('isDownloadedOffline')) {
              questionStore.createIndex('isDownloadedOffline', 'isDownloadedOffline', { unique: false });
            }
          }

          // 3. CBT Exams & bundles
          if (!db.objectStoreNames.contains('cbtExams')) {
            const examStore = db.createObjectStore('cbtExams', { keyPath: 'id' });
            examStore.createIndex('subjectId', 'subjectId', { unique: false });
          }

          // 4. Subjects
          if (!db.objectStoreNames.contains('subjects')) {
            db.createObjectStore('subjects', { keyPath: 'id' });
          }

          // 5. Nursing Levels
          if (!db.objectStoreNames.contains('levels')) {
            db.createObjectStore('levels', { keyPath: 'id' });
          }

          // 6. Announcements
          if (!db.objectStoreNames.contains('announcements')) {
            db.createObjectStore('announcements', { keyPath: 'id' });
          }

          // 7. Metadata / Sync Stats
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB failed to open:', request.error);
          this.dbPromise = null;
          reject(request.error);
        };
      });
    }

    return this.dbPromise;
  }

  // ==================== STUDY NOTES ==================== //

  async saveNotes(notes: StudyNote[], markDownloaded = false): Promise<void> {
    if (!Array.isArray(notes) || notes.length === 0) return;
    try {
      const db = await this.getDB();
      const existingDownloadedIds = new Set<string>();

      // Read existing download flags first to preserve offline state
      try {
        const readTx = db.transaction('studyNotes', 'readonly');
        const readStore = readTx.objectStore('studyNotes');
        const allExisting = await new Promise<CachedNoteRecord[]>((res) => {
          const req = readStore.getAll();
          req.onsuccess = () => res((req.result as CachedNoteRecord[]) || []);
          req.onerror = () => res([]);
        });
        allExisting.forEach((n) => {
          if (n.isDownloadedOffline) existingDownloadedIds.add(n.id);
        });
      } catch {}

      const tx = db.transaction(['studyNotes', 'metadata'], 'readwrite');
      const store = tx.objectStore('studyNotes');
      const now = new Date().toISOString();

      for (const note of notes) {
        if (!note || !note.id) continue;
        const isDownloaded = markDownloaded || existingDownloadedIds.has(note.id);
        const record: CachedNoteRecord = {
          ...note,
          isDownloadedOffline: isDownloaded,
          offlineSavedAt: now,
        };
        store.put(record);
      }

      const metaStore = tx.objectStore('metadata');
      metaStore.put({ key: 'lastNotesSync', timestamp: now });

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('OfflineStorage: Failed to save notes to IndexedDB:', err);
    }
  }

  async getNotes(subjectId?: string): Promise<StudyNote[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('studyNotes', 'readonly');
      const store = tx.objectStore('studyNotes');

      return new Promise<StudyNote[]>((resolve) => {
        const request = subjectId && subjectId !== 'all'
          ? store.index('subjectId').getAll(subjectId)
          : store.getAll();

        request.onsuccess = () => {
          resolve((request.result as StudyNote[]) || []);
        };
        request.onerror = () => {
          resolve([]);
        };
      });
    } catch (err) {
      console.warn('OfflineStorage: Failed to read notes from IndexedDB:', err);
      return [];
    }
  }

  async getNote(id: string): Promise<StudyNote | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('studyNotes', 'readonly');
      const store = tx.objectStore('studyNotes');

      return new Promise<StudyNote | null>((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as StudyNote) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async markNoteDownloaded(noteId: string, isDownloaded: boolean = true): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('studyNotes', 'readwrite');
      const store = tx.objectStore('studyNotes');

      const req = store.get(noteId);
      req.onsuccess = () => {
        const note = req.result as CachedNoteRecord | undefined;
        if (note) {
          note.isDownloadedOffline = isDownloaded;
          note.offlineSavedAt = new Date().toISOString();
          store.put(note);
        }
      };

      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (err) {
      console.warn('Failed to update note download status:', err);
    }
  }

  async markAllNotesDownloaded(notes: StudyNote[]): Promise<void> {
    if (!Array.isArray(notes) || notes.length === 0) return;
    await this.saveNotes(notes, true);
  }

  async getDownloadedNotes(): Promise<StudyNote[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('studyNotes', 'readonly');
      const store = tx.objectStore('studyNotes');

      return new Promise<StudyNote[]>((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const all = (request.result as CachedNoteRecord[]) || [];
          const downloaded = all.filter((n) => n.isDownloadedOffline === true);
          resolve(downloaded);
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ==================== QUESTION BANKS ==================== //

  async saveQuestions(questions: Question[], markDownloaded = false): Promise<void> {
    if (!Array.isArray(questions) || questions.length === 0) return;
    try {
      const db = await this.getDB();
      const existingDownloadedIds = new Set<string | number>();

      try {
        const readTx = db.transaction('questions', 'readonly');
        const readStore = readTx.objectStore('questions');
        const allExisting = await new Promise<CachedQuestionRecord[]>((res) => {
          const req = readStore.getAll();
          req.onsuccess = () => res((req.result as CachedQuestionRecord[]) || []);
          req.onerror = () => res([]);
        });
        allExisting.forEach((q) => {
          if (q.isDownloadedOffline) existingDownloadedIds.add(q.id);
        });
      } catch {}

      const tx = db.transaction(['questions', 'metadata'], 'readwrite');
      const store = tx.objectStore('questions');
      const now = new Date().toISOString();

      for (const q of questions) {
        if (!q || q.id === undefined) continue;
        const isDownloaded = markDownloaded || existingDownloadedIds.has(q.id);
        const record: CachedQuestionRecord = {
          ...q,
          isDownloadedOffline: isDownloaded,
          offlineSavedAt: now,
        };
        store.put(record);
      }

      const metaStore = tx.objectStore('metadata');
      metaStore.put({ key: 'lastQuestionsSync', timestamp: now });

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('OfflineStorage: Failed to save questions to IndexedDB:', err);
    }
  }

  async getQuestions(subjectId?: string, difficulty?: string): Promise<Question[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('questions', 'readonly');
      const store = tx.objectStore('questions');

      return new Promise<Question[]>((resolve) => {
        const request = subjectId && subjectId !== 'all'
          ? store.index('subjectId').getAll(subjectId)
          : store.getAll();

        request.onsuccess = () => {
          let list = (request.result as Question[]) || [];
          if (difficulty && difficulty !== 'all') {
            list = list.filter((q) => q.difficulty === difficulty);
          }
          resolve(list);
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async markQuestionsDownloaded(questions: Question[]): Promise<void> {
    if (!Array.isArray(questions) || questions.length === 0) return;
    await this.saveQuestions(questions, true);
  }

  async getDownloadedQuestions(): Promise<Question[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('questions', 'readonly');
      const store = tx.objectStore('questions');

      return new Promise<Question[]>((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const all = (request.result as CachedQuestionRecord[]) || [];
          const downloaded = all.filter((q) => q.isDownloadedOffline === true);
          // If none specifically flagged with markDownloaded, but questions exist, all cached questions are offline available
          resolve(downloaded.length > 0 ? downloaded : all);
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ==================== CBT EXAMS & DETAILS ==================== //

  async saveExams(exams: CBTExam[]): Promise<void> {
    if (!Array.isArray(exams) || exams.length === 0) return;
    try {
      const db = await this.getDB();
      const existingDownloads = new Map<string, { cachedQuestions?: Question[]; isDownloadedOffline?: boolean }>();

      try {
        const readTx = db.transaction('cbtExams', 'readonly');
        const readStore = readTx.objectStore('cbtExams');
        const allExisting = await new Promise<CachedExamRecord[]>((res) => {
          const req = readStore.getAll();
          req.onsuccess = () => res((req.result as CachedExamRecord[]) || []);
          req.onerror = () => res([]);
        });
        allExisting.forEach((e) => {
          existingDownloads.set(e.id, {
            cachedQuestions: e.cachedQuestions,
            isDownloadedOffline: e.isDownloadedOffline,
          });
        });
      } catch {}

      const tx = db.transaction('cbtExams', 'readwrite');
      const store = tx.objectStore('cbtExams');

      for (const exam of exams) {
        if (!exam || !exam.id) continue;
        const prev = existingDownloads.get(exam.id);
        store.put({
          ...exam,
          cachedQuestions: prev?.cachedQuestions || [],
          isDownloadedOffline: prev?.isDownloadedOffline || false,
        });
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('OfflineStorage: Failed to save exams to IndexedDB:', err);
    }
  }

  async getExams(): Promise<CBTExam[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('cbtExams', 'readonly');
      const store = tx.objectStore('cbtExams');

      return new Promise<CBTExam[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as CBTExam[]) || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async saveExamDetails(examId: string, examDetails: CBTExam & { questions: Question[] }): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['cbtExams', 'questions'], 'readwrite');
      const examStore = tx.objectStore('cbtExams');
      const questionStore = tx.objectStore('questions');

      const now = new Date().toISOString();
      const record: CachedExamRecord = {
        ...examDetails,
        cachedQuestions: examDetails.questions || [],
        isDownloadedOffline: true,
        offlineSavedAt: now,
      };

      examStore.put(record);

      // Also persist individual questions into question bank store with offline flag
      if (Array.isArray(examDetails.questions)) {
        for (const q of examDetails.questions) {
          if (q && q.id !== undefined) {
            questionStore.put({
              ...q,
              isDownloadedOffline: true,
              offlineSavedAt: now,
            });
          }
        }
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('OfflineStorage: Failed to save exam bundle to IndexedDB:', err);
    }
  }

  async getExamDetails(examId: string): Promise<(CBTExam & { questions: Question[] }) | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('cbtExams', 'readonly');
      const store = tx.objectStore('cbtExams');

      return new Promise((resolve) => {
        const req = store.get(examId);
        req.onsuccess = () => {
          const res = req.result as CachedExamRecord | undefined;
          if (res) {
            resolve({
              ...res,
              questions: res.cachedQuestions || [],
            });
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async getDownloadedExams(): Promise<CBTExam[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('cbtExams', 'readonly');
      const store = tx.objectStore('cbtExams');

      return new Promise<CBTExam[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const all = (req.result as CachedExamRecord[]) || [];
          resolve(all.filter((e) => e.isDownloadedOffline === true));
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ==================== SUBJECTS & LEVELS ==================== //

  async saveSubjects(subjects: Subject[]): Promise<void> {
    if (!Array.isArray(subjects) || subjects.length === 0) return;
    try {
      const db = await this.getDB();
      const tx = db.transaction('subjects', 'readwrite');
      const store = tx.objectStore('subjects');
      subjects.forEach((s) => store.put(s));
    } catch {}
  }

  async getSubjects(): Promise<Subject[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('subjects', 'readonly');
      const store = tx.objectStore('subjects');
      return new Promise<Subject[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as Subject[]) || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async saveLevels(levels: NursingLevel[]): Promise<void> {
    if (!Array.isArray(levels) || levels.length === 0) return;
    try {
      const db = await this.getDB();
      const tx = db.transaction('levels', 'readwrite');
      const store = tx.objectStore('levels');
      levels.forEach((l) => store.put(l));
    } catch {}
  }

  async getLevels(): Promise<NursingLevel[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('levels', 'readonly');
      const store = tx.objectStore('levels');
      return new Promise<NursingLevel[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as NursingLevel[]) || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ==================== ANNOUNCEMENTS ==================== //

  async saveAnnouncements(announcements: Announcement[]): Promise<void> {
    if (!Array.isArray(announcements) || announcements.length === 0) return;
    try {
      const db = await this.getDB();
      const tx = db.transaction('announcements', 'readwrite');
      const store = tx.objectStore('announcements');
      announcements.forEach((a) => store.put(a));
    } catch {}
  }

  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('announcements', 'readonly');
      const store = tx.objectStore('announcements');
      return new Promise<Announcement[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as Announcement[]) || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // ==================== STATS & MANAGEMENT ==================== //

  async getOfflineSummary(): Promise<OfflineStorageSummary> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['studyNotes', 'questions', 'cbtExams', 'metadata'], 'readonly');

      const notesReq = tx.objectStore('studyNotes').getAll();
      const questionsReq = tx.objectStore('questions').getAll();
      const examsReq = tx.objectStore('cbtExams').getAll();
      const metaReq = tx.objectStore('metadata').get('lastNotesSync');

      return new Promise((resolve) => {
        tx.oncomplete = () => {
          const notes = (notesReq.result as CachedNoteRecord[]) || [];
          const downloadedNotes = notes.filter((n) => n.isDownloadedOffline === true).length;

          const questions = (questionsReq.result as CachedQuestionRecord[]) || [];
          const downloadedQuestions = questions.filter((q) => q.isDownloadedOffline === true).length;

          const exams = (examsReq.result as CachedExamRecord[]) || [];
          const downloadedExams = exams.filter((e) => e.isDownloadedOffline === true).length;

          resolve({
            notesCount: notes.length,
            downloadedNotesCount: downloadedNotes,
            questionsCount: questions.length,
            downloadedQuestionsCount: downloadedQuestions || questions.length,
            examsCount: exams.length,
            downloadedExamsCount: downloadedExams,
            lastSyncedAt: metaReq.result?.timestamp || null,
          });
        };
        tx.onerror = () => {
          resolve({
            notesCount: 0,
            downloadedNotesCount: 0,
            questionsCount: 0,
            downloadedQuestionsCount: 0,
            examsCount: 0,
            downloadedExamsCount: 0,
            lastSyncedAt: null,
          });
        };
      });
    } catch {
      return {
        notesCount: 0,
        downloadedNotesCount: 0,
        questionsCount: 0,
        downloadedQuestionsCount: 0,
        examsCount: 0,
        downloadedExamsCount: 0,
        lastSyncedAt: null,
      };
    }
  }

  async clearOfflineCache(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['studyNotes', 'questions', 'cbtExams'], 'readwrite');
      tx.objectStore('studyNotes').clear();
      tx.objectStore('questions').clear();
      tx.objectStore('cbtExams').clear();
    } catch (e) {
      console.warn('Failed to clear offline cache:', e);
    }
  }
}

export const offlineStorage = new OfflineStorageManager();
