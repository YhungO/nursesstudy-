import {
  db,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from '../firebase.ts';
import { CBTExam, Question } from '../types.ts';
import {
  PHILOSOPHY_SCIENCE_EXAM_ID,
  PHILOSOPHY_SCIENCE_EXAM_TITLE,
  PHILOSOPHY_SCIENCE_QUESTION_IDS,
  buildPhilosophyScienceExamPayload,
  buildPhilosophyScienceQuestionPayloads,
} from '../data/philosophyScienceQuestions.ts';

export { PHILOSOPHY_SCIENCE_EXAM_ID, PHILOSOPHY_SCIENCE_EXAM_TITLE };

export interface ImportPhilosophyScienceResult {
  success: boolean;
  examId: string;
  examTitle: string;
  totalQuestions: number;
  questionsAdded: number;
  questionsUpdated: number;
  examCreated: boolean;
  examUpdated: boolean;
  questionIds: string[];
  durationMs: number;
  timestamp: string;
  message: string;
  error?: string;
}

export interface PhilosophyScienceStatus {
  examExists: boolean;
  examData?: CBTExam;
  existingQuestionCount: number;
  expectedQuestionCount: number;
  allQuestionsImported: boolean;
  missingQuestionIds: string[];
}

/**
 * Checks Firestore to see if the Philosophy and History of Science exam and its 125 questions
 * already exist in the database.
 */
export async function getPhilosophyScienceExamImportStatus(
  firestoreInstance: any = db
): Promise<PhilosophyScienceStatus> {
  try {
    const examDocRef = doc(firestoreInstance, 'exams', PHILOSOPHY_SCIENCE_EXAM_ID);
    const examSnap = await getDoc(examDocRef);
    const examExists = examSnap.exists();
    const examData = examExists ? (examSnap.data() as CBTExam) : undefined;

    const expectedIds = PHILOSOPHY_SCIENCE_QUESTION_IDS;
    let existingCount = 0;
    const missingQuestionIds: string[] = [];

    // Query in parallel
    const checks = await Promise.all(
      expectedIds.map(async (id) => {
        const qRef = doc(firestoreInstance, 'questions', id);
        const qSnap = await getDoc(qRef);
        return { id, exists: qSnap.exists() };
      })
    );

    for (const res of checks) {
      if (res.exists) {
        existingCount++;
      } else {
        missingQuestionIds.push(res.id);
      }
    }

    return {
      examExists,
      examData,
      existingQuestionCount: existingCount,
      expectedQuestionCount: expectedIds.length,
      allQuestionsImported: existingCount === expectedIds.length && examExists,
      missingQuestionIds,
    };
  } catch (err: any) {
    console.warn('[Firestore] Error checking philosophy & science status:', err);
    return {
      examExists: false,
      existingQuestionCount: 0,
      expectedQuestionCount: 125,
      allQuestionsImported: false,
      missingQuestionIds: [...PHILOSOPHY_SCIENCE_QUESTION_IDS],
    };
  }
}

/**
 * Performs an idempotent upsert of the 'Philosophy and History of Science' examination
 * and all 125 multiple-choice questions into Cloud Firestore.
 */
export async function importPhilosophyScienceExamToFirestore(
  options: {
    firestoreInstance?: any;
    adminActor?: { uid?: string; email?: string; name?: string };
    onProgress?: (progress: { stage: string; current: number; total: number; message: string }) => void;
  } = {}
): Promise<ImportPhilosophyScienceResult> {
  const startTime = Date.now();
  const firestore = options.firestoreInstance || db;
  const onProgress = options.onProgress || (() => {});

  try {
    onProgress({
      stage: 'INIT',
      current: 0,
      total: 126,
      message: 'Inspecting existing Firestore records for Philosophy and History of Science...',
    });

    const examRef = doc(firestore, 'exams', PHILOSOPHY_SCIENCE_EXAM_ID);
    const existingExamSnap = await getDoc(examRef);
    const examExisted = existingExamSnap.exists();

    const baseExam = buildPhilosophyScienceExamPayload();
    const finalExamPayload: CBTExam = {
      ...baseExam,
      createdAt: examExisted ? (existingExamSnap.data()?.createdAt || baseExam.createdAt) : baseExam.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: options.adminActor?.email || 'admin',
    };

    onProgress({
      stage: 'EXAM',
      current: 1,
      total: 126,
      message: `${examExisted ? 'Updating' : 'Creating'} examination document '${PHILOSOPHY_SCIENCE_EXAM_ID}'...`,
    });

    // Upsert the exam document with merge: true to avoid duplication
    await setDoc(examRef, finalExamPayload, { merge: true });

    // Prepare questions
    const questionPayloads = buildPhilosophyScienceQuestionPayloads();
    let questionsAdded = 0;
    let questionsUpdated = 0;

    // Check each question for existence
    const questionStatusList = await Promise.all(
      questionPayloads.map(async (q) => {
        const qRef = doc(firestore, 'questions', String(q.id));
        const snap = await getDoc(qRef);
        return {
          payload: q,
          ref: qRef,
          exists: snap.exists(),
          existingData: snap.exists() ? snap.data() : null,
        };
      })
    );

    // Write questions in batches of 40 (Firestore limit is 500)
    const BATCH_SIZE = 40;
    for (let i = 0; i < questionStatusList.length; i += BATCH_SIZE) {
      const chunk = questionStatusList.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(firestore);

      for (const item of chunk) {
        const qPayload: Question = {
          ...item.payload,
          createdAt: item.exists && item.existingData?.createdAt ? item.existingData.createdAt : item.payload.createdAt,
          updatedAt: new Date().toISOString(),
          updatedBy: options.adminActor?.email || 'admin',
        };

        batch.set(item.ref, qPayload, { merge: true });

        if (item.exists) {
          questionsUpdated++;
        } else {
          questionsAdded++;
        }
      }

      await batch.commit();

      const processedSoFar = Math.min(i + chunk.length, questionStatusList.length);
      onProgress({
        stage: 'QUESTIONS',
        current: processedSoFar + 1,
        total: 126,
        message: `Upserted ${processedSoFar} of 125 questions (${questionsAdded} new, ${questionsUpdated} updated)...`,
      });
    }

    const durationMs = Date.now() - startTime;
    const message = `Successfully upserted '${PHILOSOPHY_SCIENCE_EXAM_TITLE}' into Cloud Firestore. Exam ${
      examExisted ? 'updated' : 'created'
    }; 125 questions processed (${questionsAdded} added, ${questionsUpdated} updated) in ${durationMs}ms with zero duplicates.`;

    console.info(`[Firestore] ${message}`);

    return {
      success: true,
      examId: PHILOSOPHY_SCIENCE_EXAM_ID,
      examTitle: PHILOSOPHY_SCIENCE_EXAM_TITLE,
      totalQuestions: 125,
      questionsAdded,
      questionsUpdated,
      examCreated: !examExisted,
      examUpdated: examExisted,
      questionIds: finalExamPayload.questionIds as string[],
      durationMs,
      timestamp: new Date().toISOString(),
      message,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Firestore] Error during Philosophy & Science CBT upsert:', errorMessage);

    return {
      success: false,
      examId: PHILOSOPHY_SCIENCE_EXAM_ID,
      examTitle: PHILOSOPHY_SCIENCE_EXAM_TITLE,
      totalQuestions: 125,
      questionsAdded: 0,
      questionsUpdated: 0,
      examCreated: false,
      examUpdated: false,
      questionIds: [...PHILOSOPHY_SCIENCE_QUESTION_IDS],
      durationMs,
      timestamp: new Date().toISOString(),
      message: `Failed to upsert Philosophy & Science exam into Firestore: ${errorMessage}`,
      error: errorMessage,
    };
  }
}
