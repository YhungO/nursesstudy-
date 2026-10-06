import {
  db,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from '../firebase.ts';
import { CBTExam, Question } from '../types.ts';
import {
  ENTREPRENEURSHIP_EXAM_ID,
  ENTREPRENEURSHIP_EXAM_TITLE,
  ENTREPRENEURSHIP_QUESTION_IDS,
  ENTREPRENEURSHIP_SUBJECT_ID,
  buildEntrepreneurshipExamPayload,
  buildEntrepreneurshipQuestionPayloads,
  buildEntrepreneurshipSubjectPayload,
} from '../data/entrepreneurshipQuestions.ts';

export { ENTREPRENEURSHIP_EXAM_ID, ENTREPRENEURSHIP_EXAM_TITLE, ENTREPRENEURSHIP_SUBJECT_ID };

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
  examData?: CBTExam;
  existingQuestionCount: number;
  expectedQuestionCount: number;
  allQuestionsImported: boolean;
  missingQuestionIds: string[];
}

/**
 * Checks Firestore to see if the Introduction to Entrepreneurship (EED 126) exam and its 50 questions
 * already exist in the database.
 */
export async function getEntrepreneurshipExamImportStatus(
  firestoreInstance: any = db
): Promise<EntrepreneurshipStatus> {
  try {
    const examDocRef = doc(firestoreInstance, 'exams', ENTREPRENEURSHIP_EXAM_ID);
    const examSnap = await getDoc(examDocRef);
    const examExists = examSnap.exists();
    const examData = examExists ? (examSnap.data() as CBTExam) : undefined;

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
      examExists,
      examData,
      existingQuestionCount: existingCount,
      expectedQuestionCount: expectedIds.length,
      allQuestionsImported: examExists && existingCount === expectedIds.length,
      missingQuestionIds,
    };
  } catch (err) {
    console.warn('[Entrepreneurship] Error querying status from Firestore:', err);
    return {
      examExists: false,
      existingQuestionCount: 0,
      expectedQuestionCount: ENTREPRENEURSHIP_QUESTION_IDS.length,
      allQuestionsImported: false,
      missingQuestionIds: [...ENTREPRENEURSHIP_QUESTION_IDS],
    };
  }
}

/**
 * Robustly upserts the Introduction to Entrepreneurship (EED 126) Subject, Exam,
 * and all 50 multiple-choice questions into Cloud Firestore.
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
      total: 52,
      message: 'Inspecting existing Firestore records for Introduction to Entrepreneurship (EED 126)...',
    });

    // 1. Ensure Subject exists in Firestore
    const subjectRef = doc(firestore, 'subjects', ENTREPRENEURSHIP_SUBJECT_ID);
    const subjectPayload = buildEntrepreneurshipSubjectPayload();
    await setDoc(subjectRef, subjectPayload, { merge: true });

    // 2. Ensure Exam exists in Firestore
    const examRef = doc(firestore, 'exams', ENTREPRENEURSHIP_EXAM_ID);
    const existingExamSnap = await getDoc(examRef);
    const examExisted = existingExamSnap.exists();

    const baseExam = buildEntrepreneurshipExamPayload();
    const finalExamPayload: CBTExam = {
      ...baseExam,
      createdAt: examExisted ? (existingExamSnap.data()?.createdAt || baseExam.createdAt) : baseExam.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: options.adminActor?.email || 'admin',
    };

    onProgress({
      stage: 'EXAM',
      current: 1,
      total: 52,
      message: `${examExisted ? 'Updating' : 'Creating'} examination document '${ENTREPRENEURSHIP_EXAM_ID}'...`,
    });

    await setDoc(examRef, finalExamPayload, { merge: true });

    // 3. Prepare questions
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
        current: Math.min(i + chunk.length + 1, 52),
        total: 52,
        message: `Committed ${Math.min(i + chunk.length, questionStatusList.length)} of ${questionStatusList.length} questions...`,
      });
    }

    const durationMs = Date.now() - startTime;
    return {
      success: true,
      examId: ENTREPRENEURSHIP_EXAM_ID,
      examTitle: ENTREPRENEURSHIP_EXAM_TITLE,
      totalQuestions: questionPayloads.length,
      questionsAdded,
      questionsUpdated,
      examCreated: !examExisted,
      examUpdated: examExisted,
      questionIds: questionPayloads.map((q) => String(q.id)),
      durationMs,
      timestamp: new Date().toISOString(),
      message: `Successfully synchronized Introduction to Entrepreneurship (EED 126) CBT (${questionPayloads.length} questions) in ${durationMs}ms. Added: ${questionsAdded}, Updated: ${questionsUpdated}.`,
    };
  } catch (err: any) {
    console.error('[Entrepreneurship Import] Failed to upsert to Firestore:', err);
    return {
      success: false,
      examId: ENTREPRENEURSHIP_EXAM_ID,
      examTitle: ENTREPRENEURSHIP_EXAM_TITLE,
      totalQuestions: 50,
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
