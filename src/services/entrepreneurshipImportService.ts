import {
  db,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from '../firebase.ts';
import { CBTExam, Question } from '../types.ts';
import {
  ENTREPRENEURSHIP_EXAM_BATCH_A_ID,
  ENTREPRENEURSHIP_EXAM_BATCH_B_ID,
  ENTREPRENEURSHIP_EXAM_ID,
  ENTREPRENEURSHIP_EXAM_TITLE,
  ENTREPRENEURSHIP_EXAM_BATCH_B_TITLE,
  ENTREPRENEURSHIP_QUESTION_IDS,
  ENTREPRENEURSHIP_SUBJECT_ID,
  buildEntrepreneurshipExamPayload,
  buildEntrepreneurshipBatchBExamPayload,
  buildEntrepreneurshipQuestionPayloads,
  buildEntrepreneurshipSubjectPayload,
} from '../data/entrepreneurshipQuestions.ts';

export {
  ENTREPRENEURSHIP_EXAM_BATCH_A_ID,
  ENTREPRENEURSHIP_EXAM_BATCH_B_ID,
  ENTREPRENEURSHIP_EXAM_ID,
  ENTREPRENEURSHIP_EXAM_TITLE,
  ENTREPRENEURSHIP_EXAM_BATCH_B_TITLE,
  ENTREPRENEURSHIP_SUBJECT_ID,
};

export interface ImportEntrepreneurshipResult {
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

export interface EntrepreneurshipStatus {
  examExists: boolean;
  batchAExists: boolean;
  batchBExists: boolean;
  existingQuestionCount: number;
  expectedQuestionCount: number;
  allQuestionsImported: boolean;
  missingQuestionIds: string[];
}

/**
 * Checks Firestore to see if the Introduction to Entrepreneurship (EED 126) exams (Batch A and Batch B)
 * and all 100 questions already exist in the database.
 */
export async function getEntrepreneurshipExamImportStatus(
  firestoreInstance: any = db
): Promise<EntrepreneurshipStatus> {
  try {
    const batchARef = doc(firestoreInstance, 'exams', ENTREPRENEURSHIP_EXAM_BATCH_A_ID);
    const batchBRef = doc(firestoreInstance, 'exams', ENTREPRENEURSHIP_EXAM_BATCH_B_ID);
    const [snapA, snapB] = await Promise.all([getDoc(batchARef), getDoc(batchBRef)]);

    const batchAExists = snapA.exists();
    const batchBExists = snapB.exists();

    const expectedIds = ENTREPRENEURSHIP_QUESTION_IDS;
    let existingCount = 0;
    const missingQuestionIds: string[] = [];

    // Parallel batches check
    const batchChecks = await Promise.all(
      expectedIds.map(async (id) => {
        const qDocRef = doc(firestoreInstance, 'questions', id);
        const qSnap = await getDoc(qDocRef);
        return { id, exists: qSnap.exists() };
      })
    );

    for (const check of batchChecks) {
      if (check.exists) {
        existingCount += 1;
      } else {
        missingQuestionIds.push(check.id);
      }
    }

    return {
      examExists: batchAExists && batchBExists,
      batchAExists,
      batchBExists,
      existingQuestionCount: existingCount,
      expectedQuestionCount: expectedIds.length,
      allQuestionsImported: batchAExists && batchBExists && existingCount === expectedIds.length,
      missingQuestionIds,
    };
  } catch (err) {
    console.warn('[Entrepreneurship] Error querying status from Firestore:', err);
    return {
      examExists: false,
      batchAExists: false,
      batchBExists: false,
      existingQuestionCount: 0,
      expectedQuestionCount: ENTREPRENEURSHIP_QUESTION_IDS.length,
      allQuestionsImported: false,
      missingQuestionIds: [...ENTREPRENEURSHIP_QUESTION_IDS],
    };
  }
}

/**
 * Robustly upserts the Introduction to Entrepreneurship (EED 126) Subject,
 * both CBT Exams (Batch A and Batch B), and all 100 multiple-choice questions into Cloud Firestore.
 */
export async function importEntrepreneurshipExamToFirestore(
  options: {
    firestoreInstance?: any;
    adminActor?: { uid?: string; email?: string; name?: string };
    onProgress?: (progress: { stage: string; current: number; total: number; message: string }) => void;
  } = {}
): Promise<ImportEntrepreneurshipResult> {
  const startTime = Date.now();
  const firestore = options.firestoreInstance || db;
  const onProgress = options.onProgress || (() => {});

  try {
    onProgress({
      stage: 'INIT',
      current: 0,
      total: 103,
      message: 'Inspecting existing Firestore records for Introduction to Entrepreneurship (EED 126)...',
    });

    // 1. Ensure Subject exists in Firestore
    const subjectRef = doc(firestore, 'subjects', ENTREPRENEURSHIP_SUBJECT_ID);
    const subjectPayload = buildEntrepreneurshipSubjectPayload();
    await setDoc(subjectRef, subjectPayload, { merge: true });

    // 2. Ensure Batch A Exam exists in Firestore
    const examARef = doc(firestore, 'exams', ENTREPRENEURSHIP_EXAM_BATCH_A_ID);
    const existingASnap = await getDoc(examARef);
    const examAExisted = existingASnap.exists();

    const baseExamA = buildEntrepreneurshipExamPayload();
    const finalExamAPayload: CBTExam = {
      ...baseExamA,
      createdAt: examAExisted ? (existingASnap.data()?.createdAt || baseExamA.createdAt) : baseExamA.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: options.adminActor?.email || 'admin',
    };
    await setDoc(examARef, finalExamAPayload, { merge: true });

    // 3. Ensure Batch B Exam exists in Firestore
    const examBRef = doc(firestore, 'exams', ENTREPRENEURSHIP_EXAM_BATCH_B_ID);
    const existingBSnap = await getDoc(examBRef);
    const examBExisted = existingBSnap.exists();

    const baseExamB = buildEntrepreneurshipBatchBExamPayload();
    const finalExamBPayload: CBTExam = {
      ...baseExamB,
      createdAt: examBExisted ? (existingBSnap.data()?.createdAt || baseExamB.createdAt) : baseExamB.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: options.adminActor?.email || 'admin',
    };
    await setDoc(examBRef, finalExamBPayload, { merge: true });

    onProgress({
      stage: 'EXAM',
      current: 3,
      total: 103,
      message: 'Synchronized Batch A and Batch B examination documents in Firestore...',
    });

    // 4. Prepare all 100 questions
    const questionPayloads = buildEntrepreneurshipQuestionPayloads();
    let questionsAdded = 0;
    let questionsUpdated = 0;

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

    // Write in chunks of 50 to respect Firestore batch limit
    const CHUNK_SIZE = 50;
    for (let i = 0; i < questionStatusList.length; i += CHUNK_SIZE) {
      const chunk = questionStatusList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(firestore);

      for (const item of chunk) {
        const finalQuestion: Question = {
          ...item.payload,
          createdAt: item.exists ? (item.existingData?.createdAt || item.payload.createdAt) : item.payload.createdAt,
          updatedAt: new Date().toISOString(),
        };

        if (item.exists) {
          questionsUpdated += 1;
        } else {
          questionsAdded += 1;
        }

        batch.set(item.ref, finalQuestion, { merge: true });
      }

      await batch.commit();

      onProgress({
        stage: 'QUESTIONS',
        current: Math.min(i + chunk.length + 3, 103),
        total: 103,
        message: `Committed ${Math.min(i + chunk.length, questionStatusList.length)} of ${questionStatusList.length} questions...`,
      });
    }

    const durationMs = Date.now() - startTime;
    return {
      success: true,
      examId: ENTREPRENEURSHIP_EXAM_BATCH_A_ID,
      examTitle: 'Introduction to Entrepreneurship (EED 126) – Batch A & Batch B',
      totalQuestions: questionPayloads.length,
      questionsAdded,
      questionsUpdated,
      examCreated: !examAExisted || !examBExisted,
      examUpdated: examAExisted && examBExisted,
      questionIds: questionPayloads.map((q) => String(q.id)),
      durationMs,
      timestamp: new Date().toISOString(),
      message: `Successfully synchronized Introduction to Entrepreneurship (EED 126) CBT (Batch A & Batch B, ${questionPayloads.length} total questions) in ${durationMs}ms. Added: ${questionsAdded}, Updated: ${questionsUpdated}.`,
    };
  } catch (err: any) {
    console.error('[Entrepreneurship Import] Failed to upsert to Firestore:', err);
    return {
      success: false,
      examId: ENTREPRENEURSHIP_EXAM_BATCH_A_ID,
      examTitle: 'Introduction to Entrepreneurship (EED 126)',
      totalQuestions: 100,
      questionsAdded: 0,
      questionsUpdated: 0,
      examCreated: false,
      examUpdated: false,
      questionIds: [],
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      message: `Failed to import Introduction to Entrepreneurship (EED 126): ${err.message || 'Unknown error'}`,
      error: err.message || String(err),
    };
  }
}
