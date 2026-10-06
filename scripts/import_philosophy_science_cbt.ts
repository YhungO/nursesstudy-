import fs from 'fs';
import path from 'path';
import {
  PHILOSOPHY_SCIENCE_EXAM_ID,
  PHILOSOPHY_SCIENCE_EXAM_TITLE,
  buildPhilosophyScienceExamPayload,
  buildPhilosophyScienceQuestionPayloads,
} from '../src/data/philosophyScienceQuestions.ts';

export function importPhilosophyScienceBank() {
  const dbPath = path.resolve(process.cwd(), 'data/database.json');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found at ${dbPath}`);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (!db.exams) db.exams = [];
  if (!db.questions) db.questions = [];

  const examPayload = buildPhilosophyScienceExamPayload();
  const questionPayloads = buildPhilosophyScienceQuestionPayloads();

  if (questionPayloads.length !== 125) {
    throw new Error(`Expected exactly 125 questions, got ${questionPayloads.length}`);
  }

  // Remove any previous versions of these specific question IDs to prevent duplicates
  const targetIds = new Set(questionPayloads.map((q) => String(q.id)));
  db.questions = db.questions.filter((q: any) => !targetIds.has(String(q.id)));

  // Append the 125 objective questions
  db.questions.push(...questionPayloads);

  // Upsert the exam record
  const examIdx = db.exams.findIndex((e: any) => e.id === PHILOSOPHY_SCIENCE_EXAM_ID);
  if (examIdx >= 0) {
    db.exams[examIdx] = {
      ...db.exams[examIdx],
      ...examPayload,
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.exams.push(examPayload);
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(
    `[DB Import] Successfully imported ${questionPayloads.length} questions and exam '${PHILOSOPHY_SCIENCE_EXAM_TITLE}' into database.json`
  );
  return { exam: examPayload, questionsCount: questionPayloads.length };
}

// Execute if run directly
if (process.argv[1]?.endsWith('import_philosophy_science_cbt.ts')) {
  importPhilosophyScienceBank();
}
