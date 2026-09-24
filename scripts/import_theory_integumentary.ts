import fs from 'fs';
import { THEORY_INTEGUMENTARY_QUESTIONS } from '../src/data/theoryIntegumentaryQuestions';

const dbPath = './data/database.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Check if theory exam already exists
const existingExamIdx = db.exams.findIndex((e: any) => e.id === 'cbt-theory-integumentary-50');

const theoryExam = {
  id: 'cbt-theory-integumentary-50',
  title: 'Integumentary System – Theory CBT',
  courseCode: 'ANA 101 / NUR 111',
  department: 'Nursing',
  level: 'ND 1',
  levelId: 'lvl-nd1',
  subjectId: 'subj-anatomy',
  subjectName: 'Anatomy & Physiology / Integumentary System',
  description: 'Standardized 50-Question Theory Examination covering General Characteristics, Protection, Thermoregulation, Sensation, Excretion, Metabolic Pathways, Body Membranes, Epidermal Strata, Dermal Layers, Skin Appendages, and Burn Pathophysiology.',
  durationMinutes: 60,
  totalQuestions: 50,
  passingScore: 50,
  questionIds: THEORY_INTEGUMENTARY_QUESTIONS.map(q => q.id),
  instructions: [
    'Attempt all 50 theoretical questions within the allotted 60-minute duration.',
    'You may type your responses or record spoken answers using the built-in voice recorder.',
    'Optional text-to-speech audio reader is available to read questions aloud.',
    'All typed answers and audio recordings are continuously auto-saved.',
    'Upon submission, full clinical model answers and key scoring points are provided for comprehensive review.'
  ],
  examType: 'theory',
  isPublished: true,
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  subjectColor: 'teal',
  actualQuestionCount: 50
};

if (existingExamIdx >= 0) {
  db.exams[existingExamIdx] = theoryExam;
  console.log('Updated existing theory exam in database');
} else {
  db.exams.push(theoryExam);
  console.log('Added new theory exam to database');
}

// Add or update questions
let addedCount = 0;
let updatedCount = 0;

for (const q of THEORY_INTEGUMENTARY_QUESTIONS) {
  const qRecord = {
    id: q.id,
    questionType: 'theory',
    category: q.category,
    question: q.question,
    questionText: q.question,
    modelAnswer: q.modelAnswer,
    explanation: q.modelAnswer,
    rationale: q.modelAnswer,
    options: [],
    subjectId: 'subj-anatomy',
    levelId: 'lvl-nd1',
    course: 'Anatomy & Physiology',
    topic: q.category,
    difficulty: 'Medium',
    isPublished: true,
    createdAt: new Date().toISOString()
  };

  const existingQIdx = db.questions.findIndex((item: any) => String(item.id) === String(q.id));
  if (existingQIdx >= 0) {
    db.questions[existingQIdx] = { ...db.questions[existingQIdx], ...qRecord };
    updatedCount++;
  } else {
    db.questions.push(qRecord);
    addedCount++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Successfully imported theory questions: ${addedCount} added, ${updatedCount} updated. Total questions now: ${db.questions.length}`);
