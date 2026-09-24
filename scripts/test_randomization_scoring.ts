import fs from 'fs';

// Test simulation of server scoring logic
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function gradeQuestion(q: any, answers: Record<string, any>, shuffledOptions?: Record<string, any[]>) {
  const qKey = String(q.id);
  const rawVal = answers ? (answers[q.id] ?? answers[qKey] ?? null) : null;
  const selectedOption =
    rawVal === 'A' || rawVal === 'B' || rawVal === 'C' || rawVal === 'D' ? rawVal : null;

  let originalExpectedOption = q.correctOption || q.correctAnswer || '';
  if (!originalExpectedOption && typeof q.correct === 'number') {
    originalExpectedOption = OPTION_KEYS[q.correct] || 'A';
  }

  const originalFormattedOptions = (q.options || []).map((opt: any, idx: number) => {
    const defaultId = OPTION_KEYS[idx] || 'A';
    if (typeof opt === 'string') {
      return { id: defaultId, text: opt, originalId: defaultId };
    }
    return {
      id: opt.id || defaultId,
      text: opt.text || opt.label || opt.value || '',
      originalId: opt.originalId || opt.id || defaultId,
    };
  });

  let finalOptions = originalFormattedOptions;
  let expectedDisplayedOption = originalExpectedOption;

  const clientShuffled = shuffledOptions ? (shuffledOptions[q.id] ?? shuffledOptions[qKey]) : null;

  if (Array.isArray(clientShuffled) && clientShuffled.length > 0) {
    finalOptions = clientShuffled.map((opt: any, idx: number) => ({
      id: OPTION_KEYS[idx] || 'A',
      text: typeof opt === 'string' ? opt : (opt.text || opt.label || opt.value || ''),
      originalId: opt.originalId || opt.id || OPTION_KEYS[idx] || 'A',
    }));

    const matchingShuffled = finalOptions.find((opt: any) => {
      if (opt.originalId && String(opt.originalId).toUpperCase() === String(originalExpectedOption).toUpperCase()) {
        return true;
      }
      const originalOpt = originalFormattedOptions.find(
        (o: any) => String(o.id).toUpperCase() === String(originalExpectedOption).toUpperCase()
      );
      if (
        originalOpt &&
        originalOpt.text &&
        opt.text &&
        originalOpt.text.trim().toLowerCase() === opt.text.trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    });

    if (matchingShuffled) {
      expectedDisplayedOption = matchingShuffled.id;
    }
  }

  const isCorrect = selectedOption !== null && selectedOption === expectedDisplayedOption;

  return {
    questionId: q.id,
    selectedOption,
    expectedDisplayedOption,
    originalExpectedOption,
    isCorrect,
    options: finalOptions,
  };
}

// Read database
const db = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
const q301 = db.questions.find((q: any) => String(q.id) === '301');

console.log('Testing Question 301...');
console.log('Original Question 301 Correct Answer:', q301.correctAnswer); // 'B'

// Test Case 1: Shuffled so that original 'B' is placed at display 'D'
const shuffledFor301 = [
  { id: 'A', originalId: 'C', text: '1988 Abuja Health Policy' },
  { id: 'B', originalId: 'A', text: '1975 Geneva Declaration' },
  { id: 'C', originalId: 'D', text: '1992 NPHCDA Decree' },
  { id: 'D', originalId: 'B', text: '1978 Alma-Ata Declaration' }, // Correct answer now at D
];

// Student selects D (which has the correct text)
const result1 = gradeQuestion(q301, { '301': 'D' }, { '301': shuffledFor301 });
console.log('Test 1 (Student chose D):', {
  selectedOption: result1.selectedOption,
  expectedDisplayedOption: result1.expectedDisplayedOption,
  isCorrect: result1.isCorrect,
});
if (!result1.isCorrect || result1.expectedDisplayedOption !== 'D') {
  throw new Error('Test 1 failed! Selecting D should be marked correct.');
}

// Test Case 2: Student selects A (which is wrong)
const result2 = gradeQuestion(q301, { '301': 'A' }, { '301': shuffledFor301 });
console.log('Test 2 (Student chose A):', {
  selectedOption: result2.selectedOption,
  expectedDisplayedOption: result2.expectedDisplayedOption,
  isCorrect: result2.isCorrect,
});
if (result2.isCorrect) {
  throw new Error('Test 2 failed! Selecting A should be marked incorrect.');
}

// Test Case 3: Student left it blank
const result3 = gradeQuestion(q301, {}, { '301': shuffledFor301 });
console.log('Test 3 (Student left unanswered):', {
  selectedOption: result3.selectedOption,
  isCorrect: result3.isCorrect,
});
if (result3.isCorrect) {
  throw new Error('Test 3 failed! Blank answer should be marked incorrect.');
}

// Test Case 4: No shuffle passed (backward compatibility)
const result4 = gradeQuestion(q301, { '301': 'B' });
console.log('Test 4 (No shuffle, student chose original B):', {
  selectedOption: result4.selectedOption,
  expectedDisplayedOption: result4.expectedDisplayedOption,
  isCorrect: result4.isCorrect,
});
if (!result4.isCorrect || result4.expectedDisplayedOption !== 'B') {
  throw new Error('Test 4 failed! Backward compatibility broken.');
}

console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
