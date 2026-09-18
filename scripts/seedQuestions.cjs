const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.json');
const rawSourcePath = path.join(__dirname, '..', 'src', 'data', 'endocrineQuestions.ts');

const content = fs.readFileSync(rawSourcePath, 'utf8');

// Extract the raw questions array from the file using regex or eval
const startMarker = 'export const ENDOCRINE_QUESTIONS_RAW: RawEndocrineQuestion[] = ';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Marker not found');
  process.exit(1);
}

const arrayCode = content.substring(startIndex + startMarker.length, content.indexOf(';\n\nconst OPTION_KEYS'));
let rawQuestions;
try {
  rawQuestions = eval(arrayCode);
} catch (e) {
  console.error('Eval error:', e);
  process.exit(1);
}

console.log(`Loaded ${rawQuestions.length} raw questions.`);

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const questionsToAdd = rawQuestions.map(q => {
  const correctLetter = OPTION_KEYS[q.correct] || 'A';
  return {
    // Exact requested structure
    id: q.id,
    question: q.question,
    options: q.options,
    correct: q.correct,
    rationale: q.rationale,

    // Course & Topic mapping
    course: 'Anatomy',
    subjectId: 'subj-anatomy',
    topic: 'Endocrine System',
    levelId: 'lvl-nd1',

    // Compatibility fields
    questionText: q.question,
    correctOption: correctLetter,
    explanation: q.rationale,
    difficulty: 'Medium',
    tags: ['Anatomy', 'Endocrine System'],
    createdAt: '2026-09-18T00:00:00.000Z'
  };
});

const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Filter out any existing questions with these IDs to avoid duplicates
const existingNonEndocrine = (database.questions || []).filter(
  q => !(q.topic === 'Endocrine System' && (q.subjectId === 'subj-anatomy' || q.course === 'Anatomy'))
);

database.questions = [...questionsToAdd, ...existingNonEndocrine];

// Update or find the Endocrine System exam
let exam = (database.exams || []).find(e => e.title === 'Endocrine System' && e.subjectId === 'subj-anatomy');
if (!exam) {
  exam = {
    id: `cbt-${Date.now()}`,
    title: 'Endocrine System',
    description: 'Comprehensive 100-Question CBT Examination on the Endocrine System for Anatomy.',
    subjectId: 'subj-anatomy',
    levelId: 'lvl-nd1',
    durationMinutes: 60,
    totalQuestions: 100,
    passingScore: 70,
    questionIds: questionsToAdd.map(q => q.id),
    isPublished: true,
    instructions: [
      'Attempt all multiple choice questions within the allotted duration.',
      'Each question carries 1 mark. There is no negative grading penalty.',
      'You may flag questions and review your answers prior to final submission.',
      'Once submitted, immediate grading, analytics, and clinical rationales are provided.'
    ],
    createdAt: new Date().toISOString()
  };
  database.exams = database.exams || [];
  database.exams.push(exam);
} else {
  exam.questionIds = questionsToAdd.map(q => q.id);
  exam.totalQuestions = 100;
  exam.durationMinutes = 60;
  exam.passingScore = 70;
  exam.levelId = 'lvl-nd1';
  exam.description = 'Comprehensive 100-Question CBT Examination on the Endocrine System for Anatomy.';
}

fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
console.log(`Successfully updated database.json with ${questionsToAdd.length} questions and updated exam.`);
