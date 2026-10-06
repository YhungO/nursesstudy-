// Introduction to Entrepreneurship (EED 126) - 50 Objective CBT Questions
// Topic: Motivational Pattern of Entrepreneurs
// Strictly preserves all 50 questions, options, and given answers.

import { CBTExam, Question, Subject } from '../types.ts';

export const ENTREPRENEURSHIP_SUBJECT_ID = 'subj-entrepreneurship';
export const ENTREPRENEURSHIP_COURSE_CODE = 'EED 126';
export const ENTREPRENEURSHIP_COURSE_NAME = 'Introduction to Entrepreneurship (EED 126)';
export const ENTREPRENEURSHIP_EXAM_ID = 'cbt-eed126-batch-a';
export const ENTREPRENEURSHIP_EXAM_TITLE = 'Introduction to Entrepreneurship (EED 126) – CBT';

export interface RawEedQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: 'A' | 'B' | 'C' | 'D';
}

export const ENTREPRENEURSHIP_RAW_QUESTIONS: RawEedQuestion[] = [
  {
    id: 'EED126-A-001',
    question: 'According to the handout, motivation is best defined as',
    options: {
      A: 'The capital needed to launch a new business',
      B: 'The process that starts, guides and keeps goal-directed actions going',
      C: 'An inherited personality trait that cannot be changed',
      D: 'The payment an employer makes for completed work',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-002',
    question: "Motivation includes which group of factors that affect a person's willingness to act toward goals?",
    options: {
      A: 'Biological, economic and technological factors',
      B: 'Environmental, financial and educational factors',
      C: 'Biological, psychological and environmental factors',
      D: 'Psychological, legal and political factors',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-003',
    question: 'Which three aspects of behaviour does motivation influence?',
    options: {
      A: 'Quality, quantity and price',
      B: 'Direction, intensity and persistence',
      C: 'Origin, ownership and size',
      D: 'Speed, accuracy and timing',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-004',
    question: 'Entrepreneurial motivation is the term used to describe',
    options: {
      A: 'The skill of writing a business plan for outside investors',
      B: 'The state aid offered to people who register small businesses',
      C: "The inner need and desire to launch and run one's own enterprise",
      D: 'The profit an owner expects after the first trading year',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-005',
    question: 'Why must an entrepreneur be self-motivated, according to the introduction?',
    options: {
      A: 'Customers buy only from owners who appear inspired',
      B: 'New ventures are barred from receiving outside supervision',
      C: 'Starting a business is hard and the owner must get things off the ground',
      D: 'Motivation guarantees that a business never records losses',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-006',
    question: 'Motivated business owners are more likely to show which qualities?',
    options: {
      A: 'Secrecy, caution and a reactive attitude',
      B: 'Tenacity, fortitude and a proactive attitude',
      C: 'Obedience, conformity and a passive attitude',
      D: 'Rivalry, impatience and a defensive attitude',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-007',
    question: 'Motivated owners report higher job satisfaction and long-term success because they are driven by',
    options: {
      A: 'A strong sense of purpose',
      B: 'A fixed monthly salary scale',
      C: 'A guaranteed flow of bank loans',
      D: 'The absence of competitors',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-008',
    question: 'Which of the following is NOT a feature of motivation as described in the handout?',
    options: {
      A: 'It keeps goal-directed actions going',
      B: 'It replaces planning and resources in a business',
      C: 'It guides goal-directed actions',
      D: 'It starts goal-directed actions',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-009',
    question: 'A trader repairs old radios every weekend only because he enjoys working out how they function. This is an example of',
    options: {
      A: 'Intrinsic motivation',
      B: 'Hierarchical motivation',
      C: 'Extrinsic motivation',
      D: 'Incentive-based motivation',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-010',
    question: 'Intrinsic motivation is often linked with feelings of',
    options: {
      A: 'Competition, reward and social approval',
      B: 'Competence, autonomy and psychological fulfilment',
      C: 'Obligation, pressure and public praise',
      D: 'Fear, dependence and punishment',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-011',
    question: 'Which of these is given in the handout as an example of intrinsic motivation?',
    options: {
      A: 'Pursuing a hobby out of personal interest or curiosity',
      B: 'Studying only to avoid failing a course',
      C: 'Working overtime to earn a salary bonus',
      D: 'Opening a shop to impress relatives',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-012',
    question: 'Extrinsic motivation involves doing activities in order to',
    options: {
      A: 'Gain external rewards or avoid punishment',
      B: 'Enjoy the activity for its own sake',
      C: 'Build a stronger sense of self-direction',
      D: 'Satisfy personal curiosity about the task',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-013',
    question: 'Which of the following is listed as an external reward under extrinsic motivation?',
    options: {
      A: 'Inherent enjoyment',
      B: 'Personal curiosity',
      C: 'Social approval',
      D: 'A sense of autonomy',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-014',
    question: 'What limitation of extrinsic motivation does the handout point out?',
    options: {
      A: 'It sustains behaviour for life but cannot begin it',
      B: 'It works only when no reward is on offer',
      C: 'It always outlasts intrinsic motivation in the long run',
      D: 'It can begin behaviour but may not sustain long-term engagement',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-015',
    question: 'A young hawker sells goods only because her aunt will praise her in public. Her motivation is mainly',
    options: {
      A: 'Competence-based',
      B: 'Intrinsic',
      C: 'Self-determined',
      D: 'Extrinsic',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-016',
    question: 'Grades, money and recognition are examples of',
    options: {
      A: 'Basic psychological needs',
      B: 'Extrinsic rewards',
      C: 'Physiological needs',
      D: 'Intrinsic rewards',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-017',
    question: 'Which statement correctly contrasts the two types of motivation?',
    options: {
      A: 'Intrinsic comes from fear of punishment; extrinsic comes from personal curiosity',
      B: 'Intrinsic comes from biological needs; extrinsic comes from psychological needs',
      C: 'Intrinsic comes from the task itself; extrinsic comes from outside rewards or punishments',
      D: 'Intrinsic comes from outside rewards; extrinsic comes from the task itself',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-018',
    question: 'Which pairing of motivation type and example is correct?',
    options: {
      A: 'Intrinsic: working only to earn good grades',
      B: 'Extrinsic: learning because of personal curiosity',
      C: 'Intrinsic: solving a challenging problem out of interest',
      D: 'Extrinsic: pursuing a hobby for its own enjoyment',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-019',
    question: "Maslow's theory suggests that human needs are arranged",
    options: {
      A: 'In a hierarchy, with self-actualization at the base',
      B: 'As equal needs that are satisfied together',
      C: 'In a circle, with no fixed starting point',
      D: 'In a hierarchy, with basic physiological needs at the base',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-020',
    question: "Which needs form the base of Maslow's hierarchy in the handout?",
    options: {
      A: 'Belongingness needs such as friendship and family',
      B: 'Esteem needs such as respect and status',
      C: 'Safety needs such as job security and health',
      D: 'Basic physiological needs such as food, water and shelter',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-021',
    question: 'In the order given in the handout, which need comes immediately after physiological needs?',
    options: {
      A: 'Belongingness needs',
      B: 'Self-actualization needs',
      C: 'Safety needs',
      D: 'Esteem needs',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-022',
    question: "According to Maslow's theory, people are motivated to",
    options: {
      A: 'Satisfy lower-level needs before moving on to higher-level needs',
      B: 'Satisfy higher-level needs before lower-level needs',
      C: 'Satisfy only one chosen need throughout life',
      D: 'Satisfy every need at once and to the same degree',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-023',
    question: "Which is the highest level of Maslow's hierarchy as presented in the handout?",
    options: {
      A: 'Self-actualization',
      B: 'Esteem',
      C: 'Safety',
      D: 'Belongingness',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-024',
    question: 'An entrepreneur has no savings and cannot afford food or rent. According to Maslow, what should concern her first?',
    options: {
      A: 'Her self-actualization needs',
      B: 'Her need for belongingness',
      C: 'Her basic physiological needs',
      D: 'Her esteem needs',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-025',
    question: "Which sequence lists Maslow's needs from lowest to highest as in the handout?",
    options: {
      A: 'Physiological, safety, belongingness, esteem, self-actualization',
      B: 'Physiological, safety, esteem, belongingness, self-actualization',
      C: 'Safety, physiological, esteem, belongingness, self-actualization',
      D: 'Physiological, belongingness, safety, self-actualization, esteem',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-026',
    question: "In Maslow's hierarchy, esteem needs sit directly between",
    options: {
      A: 'Safety and belongingness',
      B: 'Physiological and belongingness',
      C: 'Physiological and safety',
      D: 'Belongingness and self-actualization',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-027',
    question: 'Which theory emphasizes intrinsic motivation and distinguishes intrinsic from extrinsic sources?',
    options: {
      A: "Maslow's Hierarchy of Needs",
      B: 'Self-Determination Theory',
      C: 'Goal-Setting Theory',
      D: 'Expectancy-Value Theory',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-028',
    question: 'The three basic psychological needs in Self-Determination Theory are',
    options: {
      A: 'Autonomy, security and recognition',
      B: 'Esteem, relatedness and achievement',
      C: 'Autonomy, competence and relatedness',
      D: 'Safety, competence and relatedness',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-029',
    question: 'According to Self-Determination Theory, autonomy, competence and relatedness are essential for fostering',
    options: {
      A: 'Physical security and basic survival',
      B: 'Intrinsic motivation and psychological well-being',
      C: 'Outcome predictions and value judgements',
      D: 'Extrinsic rewards and financial growth',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-030',
    question: 'An entrepreneur is happiest when free to make her own business decisions. Which Self-Determination need does this mainly satisfy?',
    options: {
      A: 'Competence',
      B: 'Relatedness',
      C: 'Esteem',
      D: 'Autonomy',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-031',
    question: "Which theory focuses on a person's expectation of success and the value placed on the outcome?",
    options: {
      A: 'Equity Theory',
      B: 'Expectancy-Value Theory',
      C: "Maslow's Hierarchy of Needs",
      D: 'Self-Determination Theory',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-032',
    question: 'In Expectancy-Value Theory, motivation to engage in a behaviour is influenced by',
    options: {
      A: 'Rewards received and punishments avoided',
      B: 'Autonomy, competence and relatedness',
      C: 'Physical needs and safety requirements',
      D: 'Expectations of success and the subjective value of the outcome',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-033',
    question: "In the handout, belief about one's own ability to succeed is called",
    options: {
      A: 'Self-actualization',
      B: 'Self-efficacy',
      C: 'Outcome expectancy',
      D: 'Relatedness',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-034',
    question: 'In the handout, the perceived value or importance of a goal is referred to as',
    options: {
      A: 'Intrinsic satisfaction',
      B: 'Outcome expectancy',
      C: 'Self-efficacy',
      D: 'Psychological fulfilment',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-035',
    question: 'A young woman believes she can run a successful bakery and strongly values owning one. Expectancy-Value Theory predicts her motivation will be',
    options: {
      A: 'Low, since she lacks any external reward',
      B: 'Low, since intrinsic goals cannot motivate people',
      C: 'High, since both expectation of success and value are high',
      D: 'Unchanged, since belief has no effect on motivation',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-036',
    question: 'A man values owning a bus company but is convinced he will fail. Expectancy-Value Theory predicts his motivation will be',
    options: {
      A: 'Weakened, since his expectation of success is low',
      B: 'Unaffected, since only needs decide behaviour',
      C: 'Strong, since expecting failure raises effort',
      D: 'Strong, since value alone is always enough',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-037',
    question: 'The handout describes starting a business as',
    options: {
      A: 'Not an easy feat',
      B: 'A simple task for motivated people',
      C: 'A task that needs no self-motivation',
      D: 'A guaranteed route to wealth',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-038',
    question: 'According to the introduction, entrepreneurial motivation has a substantial impact on',
    options: {
      A: 'The size of the market',
      B: 'Interest rates',
      C: 'Government policy',
      D: 'Business success',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-039',
    question: 'Which statement about intrinsic motivation is FALSE?',
    options: {
      A: 'It depends mainly on money and public recognition',
      B: 'It can involve solving challenging problems out of curiosity',
      C: 'It is often linked with competence and autonomy',
      D: 'It is pursued for the inherent satisfaction of the activity',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-040',
    question: 'Which statement about extrinsic motivation is FALSE?',
    options: {
      A: 'It can start behaviour',
      B: 'It is carried out purely for the enjoyment of the activity',
      C: 'It may involve money, grades or recognition',
      D: 'It may involve avoiding punishment',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-041',
    question: "Which term belongs to Maslow's theory but NOT to Self-Determination Theory?",
    options: {
      A: 'Self-actualization',
      B: 'Competence',
      C: 'Autonomy',
      D: 'Relatedness',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-042',
    question: 'Which term belongs to Expectancy-Value Theory?',
    options: {
      A: 'Belongingness',
      B: 'Relatedness',
      C: 'Self-efficacy',
      D: 'Self-actualization',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-043',
    question: 'A man drops his plan because he does not believe he can succeed at it. Which theory best explains this?',
    options: {
      A: "Maslow's Hierarchy of Needs",
      B: 'Equity Theory',
      C: 'Expectancy-Value Theory',
      D: 'Self-Determination Theory',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-044',
    question: 'A woman refuses to start a venture until she can afford proper food and housing. Which theory best explains this?',
    options: {
      A: 'Expectancy-Value Theory',
      B: 'Self-Determination Theory',
      C: 'Goal-Setting Theory',
      D: "Maslow's Hierarchy of Needs",
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-045',
    question: 'Which approach would a Self-Determination Theory supporter suggest for building lasting motivation in a team?',
    options: {
      A: 'Reward only the top performer each month',
      B: 'Remove choice so that tasks are done uniformly',
      C: 'Rely mainly on bigger bonuses and strict penalties',
      D: 'Give members choice, skill growth and a sense of connection',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-046',
    question: 'A farmer keeps farming after three bad harvests in a row. Which aspect of motivation does this best show?',
    options: {
      A: 'Relatedness',
      B: 'Persistence',
      C: 'Direction',
      D: 'Esteem',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-047',
    question: 'Which of the following is NOT one of the three theories of motivation in the handout?',
    options: {
      A: 'Self-Determination Theory',
      B: 'Expectancy-Value Theory',
      C: "Maslow's Hierarchy of Needs",
      D: 'Equity Theory',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-048',
    question: 'How many theories of motivation does the handout present?',
    options: {
      A: 'Four',
      B: 'Five',
      C: 'Two',
      D: 'Three',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-049',
    question: 'A student works hard only for exam grades. Which statement best describes his motivation?',
    options: {
      A: 'It is extrinsic and may fade once grades stop mattering',
      B: 'It is intrinsic and certain to last a lifetime',
      C: 'It is purely physiological and fixed',
      D: 'It is self-determined and rooted in curiosity',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-050',
    question: 'Psychological fulfilment is most closely associated with which type of motivation?',
    options: {
      A: 'Extrinsic motivation',
      B: 'Reward-based motivation',
      C: 'Punishment-based motivation',
      D: 'Intrinsic motivation',
    },
    answer: 'D',
  },
];

const LETTER_INDEX_MAP: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

export const ENTREPRENEURSHIP_QUESTION_IDS: string[] = ENTREPRENEURSHIP_RAW_QUESTIONS.map((q) => q.id);

/**
 * Subject payload definition for Introduction to Entrepreneurship (EED 126)
 */
export function buildEntrepreneurshipSubjectPayload(): Subject {
  return {
    id: ENTREPRENEURSHIP_SUBJECT_ID,
    levelId: 'lvl-nd1',
    name: 'Introduction to Entrepreneurship',
    code: 'EED 126',
    description: 'Motivational pattern of entrepreneurs, venture establishment, innovation, self-reliance, and business planning for healthcare professionals.',
    icon: 'Briefcase',
    color: 'amber',
    order: 8,
    isPublished: true,
  };
}

/**
 * Builds the canonical CBTExam payload for the Introduction to Entrepreneurship (EED 126) CBT.
 */
export function buildEntrepreneurshipExamPayload(): CBTExam {
  const now = new Date().toISOString();

  return {
    id: ENTREPRENEURSHIP_EXAM_ID,
    title: ENTREPRENEURSHIP_EXAM_TITLE,
    courseCode: ENTREPRENEURSHIP_COURSE_CODE,
    department: 'Nursing',
    level: 'ND 1',
    levelId: 'lvl-nd1',
    subjectId: ENTREPRENEURSHIP_SUBJECT_ID,
    subjectName: 'Introduction to Entrepreneurship',
    subjectColor: 'amber',
    description:
      'Standardized 50-Question Timed CBT Examination on Introduction to Entrepreneurship (EED 126) – Motivational Pattern of Entrepreneurs for ND1 Nursing candidates.',
    examType: 'objective',
    durationMinutes: 45,
    totalQuestions: 50,
    actualQuestionCount: 50,
    passingScore: 50,
    questionIds: [...ENTREPRENEURSHIP_QUESTION_IDS],
    instructions: [
      'This examination consists of 50 single-answer multiple-choice questions.',
      'Total time allowed is 45 minutes (45:00). Timer counts down automatically to 00:00.',
      'Each correct answer scores 1 mark. Maximum total score is 50 marks. Pass mark is 50%.',
      'Navigate freely using Previous, Next, or the Question Palette drawer.',
      'All selected answers are saved continuously so you never lose progress.',
      'Upon completion, full answers, correct options, and detailed rationales are provided for review.',
    ],
    status: 'published',
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Builds the canonical list of 50 Question documents conforming exactly to existing question format (e.g. PHC / NUR 122).
 */
export function buildEntrepreneurshipQuestionPayloads(): Question[] {
  const now = new Date().toISOString();

  return ENTREPRENEURSHIP_RAW_QUESTIONS.map((q) => {
    const correctIdx = LETTER_INDEX_MAP[q.answer] ?? 0;
    const optionsArray: string[] = [q.options.A, q.options.B, q.options.C, q.options.D];
    const correctText = q.options[q.answer] || '';

    return {
      id: q.id,
      question: q.question,
      questionText: q.question,
      options: optionsArray,
      correct: correctIdx,
      correctOption: q.answer,
      rationale: correctText,
      explanation: correctText,
      course: 'Introduction to Entrepreneurship',
      subjectId: ENTREPRENEURSHIP_SUBJECT_ID,
      subjectName: 'Introduction to Entrepreneurship',
      subjectColor: 'amber',
      topic: 'Motivational Pattern of Entrepreneurs',
      levelId: 'lvl-nd1',
      difficulty: 'Medium',
      tags: ['Entrepreneurship', 'EED 126', 'Motivational Pattern of Entrepreneurs', 'ND1'],
      status: 'published',
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    };
  });
}
