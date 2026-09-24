import {
  db,
  auth,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from '../firebase';
import { CBTExam, Question } from '../types';
import { THEORY_INTEGUMENTARY_QUESTIONS } from '../data/theoryIntegumentaryQuestions';

export const INTEGUMENTARY_THEORY_EXAM_ID = 'integumentary-system-theory-cbt';
export const INTEGUMENTARY_THEORY_EXAM_TITLE = 'Integumentary System – Theory CBT';

export interface ImportIntegumentaryTheoryResult {
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

export interface IntegumentaryTheoryStatus {
  examExists: boolean;
  examData?: CBTExam;
  existingQuestionCount: number;
  expectedQuestionCount: number;
  allQuestionsImported: boolean;
  missingQuestionIds: string[];
}

/**
 * Builds the canonical CBTExam payload for the Integumentary System Theory CBT.
 */
export function buildIntegumentaryTheoryExamPayload(): CBTExam {
  const questionIds = THEORY_INTEGUMENTARY_QUESTIONS.map((q) => q.id);
  const now = new Date().toISOString();

  return {
    id: INTEGUMENTARY_THEORY_EXAM_ID,
    title: INTEGUMENTARY_THEORY_EXAM_TITLE,
    courseCode: 'ANA 101 / NUR 111',
    department: 'Nursing',
    level: 'ND 1',
    levelId: 'lvl-nd1',
    subjectId: 'subj-anatomy',
    subjectName: 'Anatomy & Physiology / Integumentary System',
    description:
      'Standardized 50-Question Theory Examination covering General Characteristics, Protection, Thermoregulation, Sensation, Excretion, Metabolic Pathways, Body Membranes, Epidermal Strata, Dermal Layers, Skin Appendages, and Burn Pathophysiology.',
    durationMinutes: 60,
    totalQuestions: 50,
    actualQuestionCount: 50,
    passingScore: 50,
    questionIds: Array.from(new Set(questionIds)),
    instructions: [
      'Attempt all 50 theoretical questions within the allotted 60-minute duration.',
      'You may type your responses or record spoken answers using the built-in voice recorder.',
      'Optional text-to-speech audio reader is available to read questions aloud.',
      'All typed answers and audio recordings are continuously auto-saved.',
      'Upon submission, full clinical model answers and key scoring points are provided for comprehensive review.',
    ],
    examType: 'theory',
    isPublished: true,
    status: 'published',
    subjectColor: 'teal',
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };
}

/**
 * Builds the canonical list of 50 Question documents from the static questions bank.
 */
export function buildIntegumentaryTheoryQuestionPayloads(): Question[] {
  const now = new Date().toISOString();

  return THEORY_INTEGUMENTARY_QUESTIONS.map((q) => ({
    id: q.id,
    examId: INTEGUMENTARY_THEORY_EXAM_ID,
    questionNumber: q.questionNumber,
    questionType: 'theory' as const,
    category: q.category,
    topic: q.category,
    question: q.question,
    questionText: q.questionText || q.question,
    modelAnswer: q.modelAnswer,
    explanation: q.explanation || q.modelAnswer,
    rationale: q.explanation || q.modelAnswer,
    options: [],
    correctOption: '' as any,
    subjectId: 'subj-anatomy',
    subjectName: 'Anatomy',
    subjectColor: 'teal',
    course: 'Anatomy',
    levelId: 'lvl-nd1',
    difficulty: 'Medium' as const,
    tags: ['Integumentary System', 'Theory CBT', q.category],
    isPublished: true,
    status: 'published' as const,
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * Checks Firestore to see if the Integumentary Theory exam and its 50 questions
 * already exist in the database.
 */
export async function getIntegumentaryTheoryExamImportStatus(
  firestoreInstance: any = db
): Promise<IntegumentaryTheoryStatus> {
  try {
    const examDocRef = doc(firestoreInstance, 'exams', INTEGUMENTARY_THEORY_EXAM_ID);
    const examSnap = await getDoc(examDocRef);
    const examExists = examSnap.exists();
    const examData = examExists ? (examSnap.data() as CBTExam) : undefined;

    const expectedIds = THEORY_INTEGUMENTARY_QUESTIONS.map((q) => q.id);
    let existingCount = 0;
    const missingQuestionIds: string[] = [];

    // Query in batches of parallel gets
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
    console.warn('[Firestore] Error checking integumentary theory status:', err);
    return {
      examExists: false,
      existingQuestionCount: 0,
      expectedQuestionCount: 50,
      allQuestionsImported: false,
      missingQuestionIds: THEORY_INTEGUMENTARY_QUESTIONS.map((q) => q.id),
    };
  }
}

/**
 * Performs an idempotent upsert of the 'Integumentary System – Theory CBT' examination
 * and all 50 theory questions into Cloud Firestore.
 *
 * Idempotency & Duplicate Prevention:
 * 1. Uses explicit deterministic IDs:
 *    - Exam: 'integumentary-system-theory-cbt'
 *    - Questions: 'integumentary-theory-001' through 'integumentary-theory-050'
 * 2. Writes using setDoc with { merge: true } inside transactional batches.
 * 3. Checks existing state before writing to track whether records are newly created
 *    or updated in-place without generating duplicates.
 * 4. Ensures questionIds array contains only unique question IDs.
 */
export async function importIntegumentaryTheoryExamToFirestore(
  options: {
    firestoreInstance?: any;
    adminActor?: { uid?: string; email?: string; name?: string };
    onProgress?: (progress: { stage: string; current: number; total: number; message: string }) => void;
  } = {}
): Promise<ImportIntegumentaryTheoryResult> {
  const startTime = Date.now();
  const firestore = options.firestoreInstance || db;
  const onProgress = options.onProgress || (() => {});

  try {
    onProgress({
      stage: 'INIT',
      current: 0,
      total: 51,
      message: 'Inspecting existing Firestore records...',
    });

    const examRef = doc(firestore, 'exams', INTEGUMENTARY_THEORY_EXAM_ID);
    const existingExamSnap = await getDoc(examRef);
    const examExisted = existingExamSnap.exists();

    const baseExam = buildIntegumentaryTheoryExamPayload();
    const finalExamPayload: CBTExam = {
      ...baseExam,
      // If the exam already existed, keep original creation timestamp and user references
      createdAt: examExisted ? (existingExamSnap.data()?.createdAt || baseExam.createdAt) : baseExam.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: options.adminActor?.email || 'admin',
    };

    onProgress({
      stage: 'EXAM',
      current: 1,
      total: 51,
      message: `${examExisted ? 'Updating' : 'Creating'} examination document '${INTEGUMENTARY_THEORY_EXAM_ID}'...`,
    });

    // Upsert the exam document with merge: true to prevent duplication
    await setDoc(examRef, finalExamPayload, { merge: true });

    // Prepare questions
    const questionPayloads = buildIntegumentaryTheoryQuestionPayloads();
    let questionsAdded = 0;
    let questionsUpdated = 0;

    // Check each question for existence so we can report accurately
    const questionStatusList = await Promise.all(
      questionPayloads.map(async (q) => {
        const qRef = doc(firestore, 'questions', q.id as string);
        const snap = await getDoc(qRef);
        return {
          payload: q,
          ref: qRef,
          exists: snap.exists(),
          existingData: snap.exists() ? snap.data() : null,
        };
      })
    );

    // Write questions in batches of 25 to remain well within Firestore's 500 limits
    const BATCH_SIZE = 25;
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
        total: 51,
        message: `Upserted ${processedSoFar} of 50 questions (${questionsAdded} new, ${questionsUpdated} updated)...`,
      });
    }

    const durationMs = Date.now() - startTime;
    const message = `Successfully upserted '${INTEGUMENTARY_THEORY_EXAM_TITLE}' into Cloud Firestore. Exam ${
      examExisted ? 'updated' : 'created'
    }; 50 questions processed (${questionsAdded} added, ${questionsUpdated} updated) in ${durationMs}ms with zero duplicates.`;

    console.info(`[Firestore] ${message}`);

    return {
      success: true,
      examId: INTEGUMENTARY_THEORY_EXAM_ID,
      examTitle: INTEGUMENTARY_THEORY_EXAM_TITLE,
      totalQuestions: 50,
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
    console.error('[Firestore] Error during Integumentary Theory upsert:', errorMessage);

    return {
      success: false,
      examId: INTEGUMENTARY_THEORY_EXAM_ID,
      examTitle: INTEGUMENTARY_THEORY_EXAM_TITLE,
      totalQuestions: 50,
      questionsAdded: 0,
      questionsUpdated: 0,
      examCreated: false,
      examUpdated: false,
      questionIds: THEORY_INTEGUMENTARY_QUESTIONS.map((q) => q.id),
      durationMs,
      timestamp: new Date().toISOString(),
      message: `Failed to upsert Integumentary Theory exam into Firestore: ${errorMessage}`,
      error: errorMessage,
    };
  }
}
