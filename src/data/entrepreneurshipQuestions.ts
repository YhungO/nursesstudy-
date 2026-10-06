// Introduction to Entrepreneurship (EED 126) - 100 Objective CBT Questions (Batch A & Batch B)
// Topic: Motivational Pattern of Entrepreneurs
// Strictly preserves all 50 Batch A and 50 Batch B questions, options, and given answers.

import { CBTExam, Question, Subject } from '../types.ts';

export const ENTREPRENEURSHIP_SUBJECT_ID = 'subj-entrepreneurship';
export const ENTREPRENEURSHIP_COURSE_CODE = 'EED 126';
export const ENTREPRENEURSHIP_COURSE_NAME = 'Introduction to Entrepreneurship (EED 126)';
export const ENTREPRENEURSHIP_EXAM_BATCH_A_ID = 'cbt-eed126-batch-a';
export const ENTREPRENEURSHIP_EXAM_BATCH_B_ID = 'cbt-eed126-batch-b';
export const ENTREPRENEURSHIP_EXAM_ID = ENTREPRENEURSHIP_EXAM_BATCH_A_ID;
export const ENTREPRENEURSHIP_EXAM_TITLE = 'Introduction to Entrepreneurship (EED 126) – Batch A';
export const ENTREPRENEURSHIP_EXAM_BATCH_B_TITLE = 'Introduction to Entrepreneurship (EED 126) – Batch B';

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

export const ENTREPRENEURSHIP_BATCH_A_RAW_QUESTIONS: RawEedQuestion[] = [
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
      C: 'Ignore physiological needs when seeking esteem',
      D: 'Drop basic needs once self-actualization begins',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-023',
    question: "Which is the highest-level need in Maslow's hierarchy?",
    options: {
      A: 'Safety needs',
      B: 'Esteem needs',
      C: 'Physiological needs',
      D: 'Self-actualization',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-024',
    question: 'Self-actualization represents',
    options: {
      A: 'Fulfilling one’s potential and seeking personal growth',
      B: 'Securing a permanent bank overdraft',
      C: 'Earning social approval from relatives',
      D: 'Meeting basic survival requirements only',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-025',
    question: 'Job security, savings and shelter from danger are examples of which need in the hierarchy?',
    options: {
      A: 'Self-actualization',
      B: 'Esteem needs',
      C: 'Safety needs',
      D: 'Belongingness needs',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-026',
    question: 'An apprentice joins a guild of shoemakers to feel accepted and make friends. Which need is he meeting?',
    options: {
      A: 'Physiological needs',
      B: 'Self-actualization',
      C: 'Safety needs',
      D: 'Belongingness and love needs',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-027',
    question: 'Respect, status and recognition from other business owners belong to which level in Maslow’s hierarchy?',
    options: {
      A: 'Safety needs',
      B: 'Physiological needs',
      C: 'Esteem needs',
      D: 'Belongingness needs',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-028',
    question: 'A successful bakery owner opens a free training academy for youths to reach her fullest creative potential. She is acting on',
    options: {
      A: 'Self-actualization needs',
      B: 'Safety needs',
      C: 'Physiological needs',
      D: 'Extrinsic rewards',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-029',
    question: 'Which of the following places Maslow’s five needs in the correct order from lowest to highest?',
    options: {
      A: 'Physiological, Safety, Belongingness, Esteem, Self-actualization',
      B: 'Safety, Physiological, Esteem, Belongingness, Self-actualization',
      C: 'Physiological, Esteem, Safety, Belongingness, Self-actualization',
      D: 'Self-actualization, Esteem, Belongingness, Safety, Physiological',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-030',
    question: 'According to the handout, who proposed the Two-Factor Theory of motivation?',
    options: {
      A: 'Abraham Maslow',
      B: 'Frederick Herzberg',
      C: 'Max Weber',
      D: 'David McClelland',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-031',
    question: 'Herzberg’s Two-Factor Theory divides workplace factors into which two categories?',
    options: {
      A: 'Primary factors and secondary factors',
      B: 'Motivators and hygiene factors',
      C: 'Internal traits and external traits',
      D: 'Biological needs and social needs',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-032',
    question: 'According to Herzberg, hygiene factors are those that',
    options: {
      A: 'Produce high motivation when present',
      B: 'Must be absent for an employee to feel happy',
      C: 'Prevent dissatisfaction when present, but do not motivate on their own',
      D: 'Lead directly to self-actualization',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-033',
    question: 'Which of the following is listed as a hygiene factor in the handout?',
    options: {
      A: 'Personal growth',
      B: 'Challenging work',
      C: 'Working conditions',
      D: 'Responsibility',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-034',
    question: 'According to Herzberg, motivators are factors that',
    options: {
      A: 'Lead to job satisfaction and high performance',
      B: 'Cause job dissatisfaction when present',
      C: 'Prevent dissatisfaction but cannot satisfy',
      D: 'Are identical to physiological needs',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-035',
    question: 'Which of the following is listed as a motivator under Herzberg’s theory?',
    options: {
      A: 'Working conditions',
      B: 'Job security',
      C: 'Salary',
      D: 'Recognition and personal growth',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-036',
    question: 'A seamstress has a safe workshop, clean light and regular pay, yet she feels uninspired because her work offers no growth or responsibility. In Herzberg’s terms, what is missing?',
    options: {
      A: 'Hygiene factors',
      B: 'Safety needs',
      C: 'Motivators',
      D: 'Extrinsic rewards',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-037',
    question: 'What happens when hygiene factors are poor or missing in an enterprise?',
    options: {
      A: 'Dissatisfaction results',
      B: 'High motivation results',
      C: 'Self-actualization is reached faster',
      D: 'Intrinsic motivation doubles',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-038',
    question: 'Which factor is correctly matched with its category under Herzberg’s theory?',
    options: {
      A: 'Company policies: Motivator',
      B: 'Salary: Motivator',
      C: 'Responsibility: Motivator',
      D: 'Recognition: Hygiene factor',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-039',
    question: 'How do motivators differ from hygiene factors in their effect on workers?',
    options: {
      A: 'Motivators drive satisfaction; hygiene factors prevent dissatisfaction',
      B: 'Motivators come only from money; hygiene factors come from personal growth',
      C: 'Motivators cause dissatisfaction; hygiene factors create high motivation',
      D: 'Motivators are physical; hygiene factors are psychological',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-040',
    question: 'Who proposed the Acquired Needs Theory discussed in the handout?',
    options: {
      A: 'Frederick Herzberg',
      B: 'David McClelland',
      C: 'B. F. Skinner',
      D: 'Abraham Maslow',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-041',
    question: 'According to McClelland, which three needs motivate human behaviour?',
    options: {
      A: 'Achievement, affiliation and power',
      B: 'Direction, intensity and persistence',
      C: 'Biological, psychological and environmental',
      D: 'Physiological, safety and esteem',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-042',
    question: 'The need for achievement (nAch) drives individuals to',
    options: {
      A: 'Build warm personal relationships and avoid conflicts',
      B: 'Control and influence the actions of others',
      C: 'Rely on luck and public lotteries for income',
      D: 'Excel, achieve challenging goals and solve problems',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-043',
    question: 'Entrepreneurs are commonly believed to have a high level of which McClelland need?',
    options: {
      A: 'Need for affiliation',
      B: 'Need for achievement',
      C: 'Need for compliance',
      D: 'Need for dependence',
    },
    answer: 'B',
  },
  {
    id: 'EED126-A-044',
    question: 'The need for affiliation (nAff) is described in the handout as the desire for',
    options: {
      A: 'Friendship, social interaction and good relationships with others',
      B: 'Dominating team discussions and setting quotas',
      C: 'Challenging individual targets with quick feedback',
      D: 'Financial bonuses and official titles',
    },
    answer: 'A',
  },
  {
    id: 'EED126-A-045',
    question: 'The need for power (nPow) involves the desire to',
    options: {
      A: 'Work alone on simple tasks without supervision',
      B: 'Avoid all responsibility in the workplace',
      C: 'Gain friends and be accepted by peers',
      D: 'Lead, influence and make an impact on others',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-046',
    question: 'A manager enjoys setting ambitious sales targets, seeks immediate feedback and prefers tasks she can control. She is showing a high need for',
    options: {
      A: 'Security',
      B: 'Affiliation',
      C: 'Achievement',
      D: 'Leisure',
    },
    answer: 'C',
  },
  {
    id: 'EED126-A-047',
    question: 'An entrepreneur chooses business partners primarily to maintain close friendships rather than for their technical skills. Which need is dominating his choices?',
    options: {
      A: 'Need for safety',
      B: 'Need for power',
      C: 'Need for achievement',
      D: 'Need for affiliation',
    },
    answer: 'D',
  },
  {
    id: 'EED126-A-048',
    question: 'How many theories of motivation are outlined in the handout?',
    options: {
      A: 'Two',
      B: 'Four',
      C: 'Five',
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

export const ENTREPRENEURSHIP_BATCH_B_RAW_QUESTIONS: RawEedQuestion[] = [
  {
    id: 'EED126-B-001',
    question: 'Which objective of motivation means individuals exert effort, persist in the face of challenges and achieve better results?',
    options: {
      A: 'Goal attainment',
      B: 'Increasing productivity',
      C: 'Enhancing performance',
      D: 'Stimulating creativity',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-002',
    question: 'Which objective gives individuals the drive to set and pursue goals?',
    options: {
      A: 'Cultivating self-improvement',
      B: 'Goal attainment',
      C: 'Facilitating adaptation',
      D: 'Enhancing performance',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-003',
    question: 'Motivated employees or business owners are more engaged, innovative and committed. Which objective is this?',
    options: {
      A: 'Increasing productivity',
      B: 'Promoting positive behaviour',
      C: 'Fostering persistence',
      D: 'Enhancing well-being',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-004',
    question: 'Which objective is described as thriving where individuals explore new ideas, take risks and think outside the box?',
    options: {
      A: 'Facilitating adaptation',
      B: 'Stimulating creativity',
      C: 'Goal attainment',
      D: 'Increasing productivity',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-005',
    question: 'Which objective instils resilience and determination so that people can push through setbacks?',
    options: {
      A: 'Fostering persistence',
      B: 'Stimulating creativity',
      C: 'Promoting positive behaviour',
      D: 'Enhancing performance',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-006',
    question: 'Which objective drives individuals to invest in their own advancement and personal development?',
    options: {
      A: 'Enhancing well-being',
      B: 'Cultivating self-improvement',
      C: 'Increasing productivity',
      D: 'Goal attainment',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-007',
    question: "Which objective brings a sense of purpose, fulfilment and happiness in people's endeavours?",
    options: {
      A: 'Cultivating self-improvement',
      B: 'Fostering persistence',
      C: 'Enhancing well-being',
      D: 'Promoting positive behaviour',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-008',
    question: 'Which objective encourages people to embrace change, learn new skills and explore unfamiliar territories?',
    options: {
      A: 'Facilitating adaptation',
      B: 'Cultivating self-improvement',
      C: 'Goal attainment',
      D: 'Stimulating creativity',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-009',
    question: 'Which objective reinforces desirable behaviours such as cooperation, teamwork and ethical conduct?',
    options: {
      A: 'Fostering persistence',
      B: 'Increasing productivity',
      C: 'Enhancing well-being',
      D: 'Promoting positive behaviour',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-010',
    question: 'How many objectives of motivation are listed in the handout?',
    options: {
      A: 'Nine',
      B: 'Seven',
      C: 'Ten',
      D: 'Six',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-011',
    question: 'After a policy change, a tailor learns to sell online and tries fabrics he never used before. Which objective is at work?',
    options: {
      A: 'Stimulating creativity',
      B: 'Goal attainment',
      C: 'Facilitating adaptation',
      D: 'Enhancing performance',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-012',
    question: 'A team stays loyal, shares tasks fairly and refuses to cheat customers because good conduct is rewarded. Which objective is this?',
    options: {
      A: 'Increasing productivity',
      B: 'Goal attainment',
      C: 'Promoting positive behaviour',
      D: 'Cultivating self-improvement',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-013',
    question: 'A shop owner restarts trading after a flood destroys her stock and refuses to quit. Which objective of motivation is this?',
    options: {
      A: 'Enhancing performance',
      B: 'Fostering persistence',
      C: 'Stimulating creativity',
      D: 'Facilitating adaptation',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-014',
    question: 'A designer spends his evenings on a course to advance himself personally. Which objective is this?',
    options: {
      A: 'Cultivating self-improvement',
      B: 'Goal attainment',
      C: 'Enhancing well-being',
      D: 'Facilitating adaptation',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-015',
    question: 'Staff brainstorm daring product ideas without fear of ridicule. Which objective is being served?',
    options: {
      A: 'Promoting positive behaviour',
      B: 'Increasing productivity',
      C: 'Fostering persistence',
      D: 'Stimulating creativity',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-016',
    question: 'A sales team sets a target, makes a plan and works toward it every day. Which objective is this?',
    options: {
      A: 'Goal attainment',
      B: 'Enhancing well-being',
      C: 'Facilitating adaptation',
      D: 'Cultivating self-improvement',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-017',
    question: 'Which of the following is NOT an objective of motivation in the handout?',
    options: {
      A: 'Fostering persistence',
      B: 'Enhancing performance',
      C: 'Cultivating self-improvement',
      D: 'Reducing competition in the market',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-018',
    question: 'How many barriers to motivation and achievement does the handout list?',
    options: {
      A: 'Six',
      B: 'Four',
      C: 'Eight',
      D: 'Five',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-019',
    question: 'Which barrier is described as unclear goals leading to confusion and apathy?',
    options: {
      A: 'Lack of incentives',
      B: 'Lack of clarity',
      C: 'Fear of failure',
      D: 'Lack of support',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-020',
    question: 'The handout says the way to overcome lack of clarity is to',
    options: {
      A: 'Reduce the number of working hours',
      B: 'Wait for an employer to set the goals',
      C: 'Take time to define goals clearly',
      D: 'Avoid setting any goals at all',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-021',
    question: 'Fear of failure can lead to which behaviours?',
    options: {
      A: 'Overconfidence and risk-taking',
      B: 'Procrastination and avoidance',
      C: 'Creativity and adaptation',
      D: 'Teamwork and cooperation',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-022',
    question: 'Fear of failure can sap which two things?',
    options: {
      A: 'Capital and customers',
      B: 'Wages and benefits',
      C: 'Workload and stress',
      D: 'Motivation and confidence',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-023',
    question: 'When there is a lack of incentives for effort, motivation can',
    options: {
      A: 'Turn into creativity',
      B: 'Remain fixed',
      C: 'Decrease',
      D: 'Increase',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-024',
    question: 'To deal with lack of incentives, organizations must make employees feel valued through',
    options: {
      A: 'Longer hours, tighter control and fewer holidays',
      B: 'Frequent transfers, secrecy and rotating duties',
      C: 'Heavier workloads, strict rules and lower pay',
      D: 'Fair compensation, recognition programs and growth opportunities',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-025',
    question: 'Which of these is listed as a cause of burnout?',
    options: {
      A: 'Positive affirmations and realistic self-appraisal',
      B: 'Excessive workload, unrealistic expectations or prolonged stress',
      C: 'Mentoring, recognition and flexible schedules',
      D: 'Fair pay, clear goals and regular breaks',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-026',
    question: 'Burnout leads to',
    options: {
      A: 'Stronger support and more incentives',
      B: 'Higher creativity and faster learning',
      C: 'Better clarity and greater adaptability',
      D: 'Physical and emotional exhaustion and a decline in motivation and performance',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-027',
    question: 'Which of these is NOT something the handout suggests employers do to ease burnout?',
    options: {
      A: 'Promote work-life balance',
      B: 'Raise workloads to match unrealistic expectations',
      C: 'Offer flexible schedules',
      D: 'Provide resources for stress reduction',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-028',
    question: 'When individuals feel isolated or unsupported in their pursuits, the handout advises building',
    options: {
      A: 'A bigger stock of goods for sale',
      B: 'A strict timetable for every working hour',
      C: 'A list of competitors to avoid',
      D: 'A supportive network of friends, family, mentors and peers',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-029',
    question: 'Negative self-talk is characterized by',
    options: {
      A: 'Self-doubt, self-criticism and pessimism',
      B: 'Ambition, planning and discipline',
      C: 'Self-reliance, humour and optimism',
      D: 'Curiosity, enjoyment and autonomy',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-030',
    question: 'Negative self-talk can',
    options: {
      A: 'Erode confidence and motivation',
      B: 'Raise confidence and motivation',
      C: 'Create incentives for staff',
      D: 'Remove the fear of failure',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-031',
    question: 'Which barrier-and-remedy pair is correct?',
    options: {
      A: 'Fear of failure: set strict daily targets',
      B: 'Negative self-talk: raise the workload',
      C: 'Lack of support: build a network of mentors and peers',
      D: 'Lack of clarity: offer fair pay and bonuses',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-032',
    question: 'Which barrier-and-remedy pair is NOT correct?',
    options: {
      A: 'Fear of failure: offer fair pay and bonuses',
      B: 'Lack of clarity: define goals clearly',
      C: 'Negative self-talk: use positive affirmations',
      D: 'Burnout: set boundaries and practise self-care',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-033',
    question: 'Which of the following is NOT a barrier listed in the handout?',
    options: {
      A: 'Government taxation',
      B: 'Lack of support',
      C: 'Negative self-talk',
      D: 'Lack of clarity',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-034',
    question: 'A trader keeps postponing a loan application because he dreads being judged if it is rejected. Which barrier is this?',
    options: {
      A: 'Negative self-talk',
      B: 'Fear of failure',
      C: 'Lack of clarity',
      D: 'Lack of incentives',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-035',
    question: 'A woman works 18-hour days for months and now feels drained and uninterested. Which barrier is this?',
    options: {
      A: 'Fear of failure',
      B: 'Lack of support',
      C: 'Lack of clarity',
      D: 'Overwhelming and burnout',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-036',
    question: "A school-leaver says, 'I just want to do something,' but cannot name any goal and feels listless. Which barrier is this?",
    options: {
      A: 'Lack of clarity',
      B: 'Negative self-talk',
      C: 'Overwhelming and burnout',
      D: 'Lack of incentives',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-037',
    question: 'A mechanic works harder for a boss who pays unfairly and never acknowledges effort. Which barrier is this?',
    options: {
      A: 'Fear of failure',
      B: 'Lack of clarity',
      C: 'Lack of support',
      D: 'Lack of incentives',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-038',
    question: 'A young farmer lives far from relatives and has no mentor, so he feels alone in his venture. Which barrier is this?',
    options: {
      A: 'Lack of incentives',
      B: 'Lack of support',
      C: 'Negative self-talk',
      D: 'Overwhelming and burnout',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-039',
    question: "An entrepreneur keeps telling herself, 'I am not smart enough for this.' Which barrier is this?",
    options: {
      A: 'Lack of clarity',
      B: 'Lack of support',
      C: 'Fear of failure',
      D: 'Negative self-talk',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-040',
    question: 'What does the handout advise for the entrepreneur who keeps telling herself she is not smart enough?',
    options: {
      A: 'Accept the thoughts as an accurate judgement',
      B: 'Ignore every critic and avoid feedback',
      C: 'Build self-awareness and challenge negative thoughts with positive affirmations',
      D: 'Reduce goals until failure is impossible',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-041',
    question: 'An overworked entrepreneur is exhausted. Which step fits the handout’s advice to individuals?',
    options: {
      A: 'Prioritize self-care, set boundaries and practise relaxation exercises',
      B: 'Hide the stress from everyone around her',
      C: 'Skip rest breaks to finish faster',
      D: 'Take on extra orders to prove commitment',
    },
    answer: 'A',
  },
  {
    id: 'EED126-B-042',
    question: 'Barriers matter because they can',
    options: {
      A: 'Replace intrinsic motivation with talent',
      B: 'Prevent people from using their motivation effectively',
      C: 'Guarantee success to the persistent',
      D: 'Remove the need for any goals',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-043',
    question: 'Which statement about failure is supported by the handout?',
    options: {
      A: 'Failure proves that a person is incompetent',
      B: 'Failure is a sign that goals should be dropped',
      C: 'Failure should be reframed as a natural part of learning',
      D: 'Failure should be avoided by never taking risks',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-044',
    question: 'A manager offers recognition, promotion paths and fair rewards to staff who feel undervalued. Which barrier is she tackling?',
    options: {
      A: 'Negative self-talk',
      B: 'Lack of support',
      C: 'Overwhelming and burnout',
      D: 'Lack of incentives',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-045',
    question: 'An entrepreneur has clear goals and fair rewards but feels isolated and never hears encouragement. Which remedy fits best?',
    options: {
      A: 'Define goals more clearly',
      B: 'Reduce her working hours',
      C: 'Build a network of friends, family, mentors and peers',
      D: 'Raise her pay and bonuses',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-046',
    question: 'Which two items are both listed under barriers to motivation and achievement?',
    options: {
      A: 'Burnout and stimulating creativity',
      B: 'Lack of support and increasing productivity',
      C: 'Fear of failure and goal attainment',
      D: 'Fear of failure and negative self-talk',
    },
    answer: 'D',
  },
  {
    id: 'EED126-B-047',
    question: 'Which pairing of an objective and its description is correct?',
    options: {
      A: 'Facilitating adaptation: discouraging new skills',
      B: 'Stimulating creativity: encouraging people to avoid risks',
      C: 'Fostering persistence: building resilience to push through setbacks',
      D: 'Enhancing well-being: reducing happiness and fulfilment',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-048',
    question: 'According to the handout, motivation is often driven by incentives that may be',
    options: {
      A: 'Financial only',
      B: 'Physical only',
      C: 'Intrinsic or extrinsic',
      D: 'Legal or political',
    },
    answer: 'C',
  },
  {
    id: 'EED126-B-049',
    question: 'Unclear goals make it challenging to muster the energy and enthusiasm needed for',
    options: {
      A: 'Registration',
      B: 'Action',
      C: 'Taxation',
      D: 'Retirement',
    },
    answer: 'B',
  },
  {
    id: 'EED126-B-050',
    question: 'The handout describes motivation as the driving force behind',
    options: {
      A: 'Market prices',
      B: 'Legal registration',
      C: 'Human behaviour',
      D: 'Government policy',
    },
    answer: 'C',
  },
];

export const ENTREPRENEURSHIP_RAW_QUESTIONS: RawEedQuestion[] = [
  ...ENTREPRENEURSHIP_BATCH_A_RAW_QUESTIONS,
  ...ENTREPRENEURSHIP_BATCH_B_RAW_QUESTIONS,
];

const LETTER_INDEX_MAP: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

export const ENTREPRENEURSHIP_BATCH_A_QUESTION_IDS: string[] = ENTREPRENEURSHIP_BATCH_A_RAW_QUESTIONS.map((q) => q.id);
export const ENTREPRENEURSHIP_BATCH_B_QUESTION_IDS: string[] = ENTREPRENEURSHIP_BATCH_B_RAW_QUESTIONS.map((q) => q.id);
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
 * Builds the canonical CBTExam payload for Introduction to Entrepreneurship (EED 126) – Batch A.
 */
export function buildEntrepreneurshipExamPayload(): CBTExam {
  const now = new Date().toISOString();

  return {
    id: ENTREPRENEURSHIP_EXAM_BATCH_A_ID,
    title: ENTREPRENEURSHIP_EXAM_TITLE,
    courseCode: ENTREPRENEURSHIP_COURSE_CODE,
    department: 'Nursing',
    level: 'ND 1',
    levelId: 'lvl-nd1',
    subjectId: ENTREPRENEURSHIP_SUBJECT_ID,
    subjectName: 'Introduction to Entrepreneurship',
    subjectColor: 'amber',
    description:
      'Standardized 50-Question Timed CBT Examination on Introduction to Entrepreneurship (EED 126) – Batch A: Motivational Pattern of Entrepreneurs for ND1 Nursing candidates.',
    examType: 'objective',
    durationMinutes: 45,
    totalQuestions: 50,
    actualQuestionCount: 50,
    passingScore: 50,
    questionIds: [...ENTREPRENEURSHIP_BATCH_A_QUESTION_IDS],
    instructions: [
      'This examination consists of 50 single-answer multiple-choice questions (Batch A).',
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
 * Builds the canonical CBTExam payload for Introduction to Entrepreneurship (EED 126) – Batch B.
 */
export function buildEntrepreneurshipBatchBExamPayload(): CBTExam {
  const now = new Date().toISOString();

  return {
    id: ENTREPRENEURSHIP_EXAM_BATCH_B_ID,
    title: ENTREPRENEURSHIP_EXAM_BATCH_B_TITLE,
    courseCode: ENTREPRENEURSHIP_COURSE_CODE,
    department: 'Nursing',
    level: 'ND 1',
    levelId: 'lvl-nd1',
    subjectId: ENTREPRENEURSHIP_SUBJECT_ID,
    subjectName: 'Introduction to Entrepreneurship',
    subjectColor: 'amber',
    description:
      'Standardized 50-Question Timed CBT Examination on Introduction to Entrepreneurship (EED 126) – Batch B: Objectives of Motivation and Barriers to Achievement for ND1 Nursing candidates.',
    examType: 'objective',
    durationMinutes: 45,
    totalQuestions: 50,
    actualQuestionCount: 50,
    passingScore: 50,
    questionIds: [...ENTREPRENEURSHIP_BATCH_B_QUESTION_IDS],
    instructions: [
      'This examination consists of 50 single-answer multiple-choice questions (Batch B).',
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
 * Returns both Batch A and Batch B exam definitions for Introduction to Entrepreneurship.
 */
export function buildAllEntrepreneurshipExamPayloads(): CBTExam[] {
  return [buildEntrepreneurshipExamPayload(), buildEntrepreneurshipBatchBExamPayload()];
}

/**
 * Builds the canonical list of all 100 Question documents (Batch A + Batch B)
 * conforming exactly to existing question format (e.g. PHC / NUR 122).
 */
export function buildEntrepreneurshipQuestionPayloads(): Question[] {
  const now = new Date().toISOString();

  return ENTREPRENEURSHIP_RAW_QUESTIONS.map((q) => {
    const correctIdx = LETTER_INDEX_MAP[q.answer] ?? 0;
    const optionsArray: string[] = [q.options.A, q.options.B, q.options.C, q.options.D];
    const correctText = q.options[q.answer] || '';
    const isBatchB = q.id.startsWith('EED126-B-');

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
      topic: isBatchB
        ? 'Motivational Pattern of Entrepreneurs (Objectives & Barriers)'
        : 'Motivational Pattern of Entrepreneurs',
      levelId: 'lvl-nd1',
      difficulty: 'Medium',
      tags: [
        'Entrepreneurship',
        'EED 126',
        isBatchB ? 'Batch B' : 'Batch A',
        'Motivational Pattern of Entrepreneurs',
        'ND1',
      ],
      status: 'published',
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    };
  });
}
