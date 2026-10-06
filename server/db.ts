import fs from 'fs';
import path from 'path';
import { SEED_STUDY_NOTES } from './seedNotes.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // stored hashed for local verification
  role: 'student' | 'admin';
  levelId: string;
  status: 'active' | 'suspended';
  school?: string;
  gradYear?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  createdAt: string;
}

export interface NursingLevel {
  id: string;
  name: string;
  description: string;
  order: number;
  badge: string;
}

export interface Subject {
  id: string;
  levelId: string; // 'all' or specific levelId
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  order?: number;
  isPublished: boolean;
}

export interface StudyNote {
  id: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  levelId: string;
  title: string;
  topic: string;
  summary: string;
  content: string;
  keyPoints: string[];
  clinicalPearls: string[];
  readingTime: number;
  status?: 'draft' | 'published' | 'unpublished' | 'archived';
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string | number;
  questionType?: 'objective' | 'theory';
  category?: string;
  modelAnswer?: string;
  question?: string;
  questionText?: string;
  options?: (QuestionOption | string)[];
  correct?: number;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  rationale?: string;
  explanation?: string;
  course?: string;
  subjectId: string;
  topic: string;
  levelId?: string;
  scenario?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  createdAt?: string;
}

export interface CBTExam {
  id: string;
  title: string;
  description: string;
  examType?: 'objective' | 'theory';
  subjectId: string; // 'all' or specific
  subjectName?: string;
  levelId: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  questionIds: (string | number)[];
  status?: 'draft' | 'published' | 'unpublished' | 'archived';
  isPublished: boolean;
  publishedAt?: string;
  instructions: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  type: 'cbt_exam' | 'practice_drill' | 'theory_exam';
  examType?: 'objective' | 'theory';
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  passed: boolean;
  submissionReason?: 'manual' | 'timeout' | 'forced';
  answers: {
    questionId: string;
    selectedOption?: 'A' | 'B' | 'C' | 'D' | null;
    correctOption?: 'A' | 'B' | 'C' | 'D' | null;
    originalCorrectOption?: string;
    isCorrect?: boolean;
    typedAnswer?: string;
    voiceRecordingUrl?: string | null;
    modelAnswer?: string;
    category?: string;
    scenario?: string;
    questionText?: string;
    options?: any[];
    explanation?: string;
    difficulty?: string;
  }[];
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  type: 'note' | 'question';
  itemId: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'high' | 'normal';
  targetLevel: string; // 'all' or levelId
  author: string;
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  category: 'exam-strategy' | 'study-topic' | 'clinical-pearl' | 'question-discussion' | 'general';
  badge?: string;
  color?: string;
  activeTopic?: string;
  participantCount?: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  topicTitle?: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  senderSchool?: string;
  senderLevel?: string;
  content: string;
  category?: 'exam-strategy' | 'study-topic' | 'clinical-pearl' | 'question-discussion' | 'general';
  reactions?: Record<string, string[]>;
  pinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DatabaseSchema {
  users: User[];
  levels: NursingLevel[];
  subjects: Subject[];
  notes: StudyNote[];
  questions: Question[];
  exams: CBTExam[];
  attempts: ExamAttempt[];
  bookmarks: Bookmark[];
  announcements: Announcement[];
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];
  settings: {
    platformName: string;
    maintenanceMode: boolean;
    defaultExamPassingScore: number;
    allowStudentRegistration: boolean;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export const DEFAULT_CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'exam-prep-strategies',
    name: 'Exam Prep & Strategy Hub',
    description: 'Timed CBT pacing, high-yield revision schedules, pass benchmark strategies, and clinical exam tips.',
    category: 'exam-strategy',
    badge: 'Strategy',
    color: 'amber',
    activeTopic: 'ND1 CBT Time Management & Negative Marking Myths',
    participantCount: 38,
  },
  {
    id: 'philosophy-history-science',
    name: 'Philosophy & History of Science',
    description: 'Active discussion on the 125-Question CBT bank, scientific methodology, early discoveries, and key philosophers.',
    category: 'study-topic',
    badge: '125-Q CBT',
    color: 'purple',
    activeTopic: 'Paleolithic artifacts, Thales, Archimedes & Arabic algebra review',
    participantCount: 42,
  },
  {
    id: 'anatomy-physiology',
    name: 'Anatomy & Physiology Hub',
    description: 'Endocrine system, Integumentary layers, burn percentage (Rule of Nines), and organ physiology.',
    category: 'study-topic',
    badge: 'Anatomy',
    color: 'teal',
    activeTopic: 'Endocrine hormonal feedback loops & skin membrane histology',
    participantCount: 56,
  },
  {
    id: 'primary-health-care',
    name: 'PHC & Community Nursing',
    description: 'Epidemiological triad, cold chain immunization, Alma-Ata principles, maternal child health, and community diagnosis.',
    category: 'study-topic',
    badge: 'PHC',
    color: 'emerald',
    activeTopic: 'PHC Sets 1–3 CBT questions review & cold-chain temperatures',
    participantCount: 29,
  },
  {
    id: 'clinical-pearls-mnemonics',
    name: 'Clinical Pearls & Mnemonics',
    description: 'High-yield memory tricks, pharmacology suffixes, vital sign thresholds, and clinical decision trees.',
    category: 'clinical-pearl',
    badge: 'Pearls',
    color: 'sky',
    activeTopic: 'Electrolyte imbalance ECG changes & endocrine feedback mnemonics',
    participantCount: 34,
  },
  {
    id: 'student-lounge',
    name: 'Nursing Student Lounge',
    description: 'Peer support, study motivation, group formation, and general nursing school check-ins.',
    category: 'general',
    badge: 'Community',
    color: 'rose',
    activeTopic: 'Daily clinical shift debrief & weekend revision plans',
    participantCount: 65,
  },
];

export const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    channelId: 'exam-prep-strategies',
    topicTitle: 'CBT Time Management Advice for 125 Questions',
    senderId: 'usr-admin-1',
    senderName: 'YHUNGO (Lead Admin)',
    senderRole: 'admin',
    senderSchool: 'NursesStudy Clinical Faculty',
    content: '📌 HIGH-YIELD TIP: For the 125-Question Philosophy & History of Science CBT, you have exactly 60 minutes. That is roughly 28 seconds per question. Never spend more than 40 seconds on one question; flag it, proceed, and use the Question Palette to return!',
    category: 'exam-strategy',
    pinned: true,
    reactions: { '💡': ['usr-student-1'], '🔥': ['usr-student-1', 'usr-admin-2'], '👍': ['usr-student-1'] },
    createdAt: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'msg-2',
    channelId: 'exam-prep-strategies',
    topicTitle: 'CBT Time Management Advice for 125 Questions',
    senderId: 'usr-student-1',
    senderName: 'Amara Vance',
    senderRole: 'student',
    senderSchool: 'St. Jude College of Nursing',
    senderLevel: 'ND 1',
    content: 'Thank you for this advice! I took the practice run and finished in 48 minutes by trusting my first instinct on the factual history questions.',
    category: 'exam-strategy',
    reactions: { '❤️': ['usr-admin-1'], '👏': ['usr-admin-2'] },
    createdAt: '2026-09-28T09:15:00.000Z',
  },
  {
    id: 'msg-3',
    channelId: 'philosophy-history-science',
    topicTitle: 'Remembering Arabic algebra terms: Al-Jabr vs Al-Muqabala',
    senderId: 'usr-student-1',
    senderName: 'Amara Vance',
    senderRole: 'student',
    senderSchool: 'St. Jude College of Nursing',
    senderLevel: 'ND 1',
    content: 'Quick memory tip for Question 47: Al-muqabala means combining similar terms on either side of an equation! Al-jabr is restoring/transposing negative terms.',
    category: 'study-topic',
    reactions: { '💡': ['usr-admin-1'], '👍': ['usr-admin-1'] },
    createdAt: '2026-09-28T10:30:00.000Z',
  },
  {
    id: 'msg-4',
    channelId: 'anatomy-physiology',
    topicTitle: 'Rule of Nines in Burns - Integumentary Review',
    senderId: 'usr-admin-2',
    senderName: 'TikTokYhung',
    senderRole: 'admin',
    senderSchool: 'NursesStudy Platform Owner',
    content: '📌 Integumentary Theory CBT Pearl: In adult burn evaluation, Head & Neck = 9%, Each Upper Limb = 9%, Anterior Trunk = 18%, Posterior Trunk = 18%, Each Lower Limb = 18%, Perineum = 1%. Always state this clearly in clinical case questions!',
    category: 'clinical-pearl',
    pinned: true,
    reactions: { '💡': ['usr-student-1'], '🔥': ['usr-student-1'] },
    createdAt: '2026-09-28T11:00:00.000Z',
  },
];

// Realistic nursing curriculum initial seed
export function getInitialData(): DatabaseSchema {
  return {
    settings: {
      platformName: 'NursesStudy',
      maintenanceMode: false,
      defaultExamPassingScore: 70,
      allowStudentRegistration: true,
    },
    levels: [
      {
        id: 'lvl-nd1',
        name: 'ND 1: National Diploma Year 1',
        description: 'Foundation nursing arts, human anatomy, physiology, and pre-clinical skills',
        order: 1,
        badge: 'ND 1',
      },
      {
        id: 'lvl-nd2',
        name: 'ND 2: National Diploma Year 2',
        description: 'Basic pharmacology, community health, medical-surgical nursing foundations',
        order: 2,
        badge: 'ND 2',
      },
      {
        id: 'lvl-hnd',
        name: 'HND: Higher National Diploma / Year 3-4',
        description: 'Advanced medical-surgical nursing, maternal-child health, nursing administration',
        order: 3,
        badge: 'HND',
      },
      {
        id: 'lvl-1',
        name: 'Year 1: Basic Nursing & Pre-Clinical',
        description: 'Anatomy, Physiology, Fundamentals of Nursing, Microbiology, Nutrition',
        order: 4,
        badge: 'Year 1',
      },
      {
        id: 'lvl-2',
        name: 'Year 2: Intermediate & Pharmacology',
        description: 'Pharmacology, Medical-Surgical I, Pathophysiology, Clinical Assessment',
        order: 5,
        badge: 'Year 2',
      },
      {
        id: 'lvl-3',
        name: 'Year 3: Med-Surg & Specialized Care',
        description: 'Advanced Med-Surg, Critical Care, Psychiatric Nursing, Pediatrics',
        order: 6,
        badge: 'Year 3',
      },
      {
        id: 'lvl-4',
        name: 'Final Year: Midwifery & Public Health',
        description: 'Maternal & Child Health, Community Health, Management & Ethics',
        order: 7,
        badge: 'Year 4',
      },
      {
        id: 'lvl-5',
        name: 'RN Licensure / NCLEX Examination Prep',
        description: 'Comprehensive Board Prep, CBT Mock Drills, High-Yield Question Banks',
        order: 8,
        badge: 'RN Prep',
      },
    ],
    subjects: [
      {
        id: 'subj-anatomy',
        levelId: 'lvl-nd1',
        name: 'Anatomy',
        code: 'ANA-101',
        description: 'Human gross and microscopic anatomy, structural organization of organ systems, directional terminology, and anatomical foundations for nursing practice.',
        icon: 'Activity',
        color: 'teal',
        order: 1,
        isPublished: true,
      },
      {
        id: 'subj-physiology',
        levelId: 'lvl-nd1',
        name: 'Physiology',
        code: 'PHS-102',
        description: 'Functional mechanisms of human organ systems, homeostatic regulatory pathways, cellular physiology, and physiological adaptation in health and illness.',
        icon: 'Heart',
        color: 'rose',
        order: 2,
        isPublished: true,
      },
      {
        id: 'subj-fns',
        levelId: 'lvl-nd1',
        name: 'Foundation of Nursing Science',
        code: 'FNS-101',
        description: 'Core nursing philosophy, nursing process, principles of asepsis, patient hygiene, therapeutic communication, vital sign assessment, and foundational clinical nursing skills.',
        icon: 'ShieldCheck',
        color: 'emerald',
        order: 3,
        isPublished: true,
      },
      {
        id: 'subj-psychology',
        levelId: 'lvl-nd1',
        name: 'Psychology',
        code: 'PSY-101',
        description: 'Foundational behavioral science, developmental stages across the lifespan, emotional and cognitive processes, stress responses, and patient-nurse interpersonal dynamics.',
        icon: 'Brain',
        color: 'indigo',
        order: 4,
        isPublished: true,
      },
      {
        id: 'subj-phc',
        levelId: 'lvl-nd1',
        name: 'Primary Health Care',
        code: 'PHC-101',
        description: 'Community health strategies, preventive medicine, immunization protocols, sanitation, maternal-child health services, and essential healthcare delivery systems.',
        icon: 'Stethoscope',
        color: 'cyan',
        order: 5,
        isPublished: true,
      },
      {
        id: 'subj-french',
        levelId: 'lvl-nd1',
        name: 'French',
        code: 'FRN-101',
        description: 'Basic French communication, grammatical fundamentals, essential healthcare terminology, and introductory conversational skills for bilingual patient care.',
        icon: 'Languages',
        color: 'blue',
        order: 6,
        isPublished: true,
      },
      {
        id: 'subj-phil-science',
        levelId: 'lvl-nd1',
        name: 'Philosophy of Science',
        code: 'POS-101',
        description: 'Scientific inquiry, epistemological foundations, the scientific method, paradigm shifts, empirical evidence, and the philosophy underpinning biomedical science.',
        icon: 'Atom',
        color: 'purple',
        order: 7,
        isPublished: true,
      },
      {
        id: 'subj-entrepreneurship',
        levelId: 'lvl-nd1',
        name: 'Entrepreneurship',
        code: 'ENT-101',
        description: 'Fundamentals of entrepreneurship, innovation in healthcare delivery, business management, financial literacy, and career independence for nurses.',
        icon: 'Briefcase',
        color: 'amber',
        order: 8,
        isPublished: true,
      },
      {
        id: 'subj-phil-logic',
        levelId: 'lvl-nd1',
        name: 'Philosophy and Logic',
        code: 'PHL-101',
        description: 'Principles of critical thinking, deductive and inductive reasoning, identification of logical fallacies, argumentative rigor, and rational clinical decision-making.',
        icon: 'Compass',
        color: 'orange',
        order: 9,
        isPublished: true,
      },
      {
        id: 'subj-pharmacology',
        levelId: 'lvl-nd1',
        name: 'Pharmacology',
        code: 'PHA-101',
        description: 'Introduction to basic pharmacokinetics and pharmacodynamics, drug administration routes, dosage calculation fundamentals, and medication safety principles.',
        icon: 'Pill',
        color: 'sky',
        order: 10,
        isPublished: true,
      },
      {
        id: 'subj-food-nutrition',
        levelId: 'lvl-nd1',
        name: 'Food and Nutrition',
        code: 'NUT-101',
        description: 'Essential nutrients, dietary guidelines, metabolism, nutritional assessment, deficiency disorders, and therapeutic diets in patient recovery.',
        icon: 'Apple',
        color: 'lime',
        order: 11,
        isPublished: true,
      },
    ],
    users: [
      {
        id: 'usr-admin-1',
        name: 'YHUNGO',
        email: 'chigaemezuaugustine43@gmail.com',
        password: 'chiga4006#',
        role: 'admin',
        levelId: 'lvl-nd1',
        status: 'active',
        school: 'NursesStudy Platform Owner',
        gradYear: 'Sole Owner & Lead Administrator',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'usr-admin-2',
        name: 'TikTokYhung',
        email: 'tiktokyhung@gmail.com',
        password: 'chiga4006#',
        role: 'admin',
        levelId: 'lvl-nd1',
        status: 'active',
        school: 'NursesStudy Platform Owner',
        gradYear: 'Sole Owner & Lead Administrator',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'usr-student-1',
        name: 'Amara Vance',
        email: 'student@nursesstudy.com',
        password: 'student123',
        role: 'student',
        levelId: 'lvl-nd1',
        status: 'active',
        school: 'St. Jude College of Nursing',
        gradYear: '2027',
        createdAt: '2026-02-14T09:30:00.000Z',
      },
    ],
    notes: SEED_STUDY_NOTES,
    questions: [],
    exams: [],
    attempts: [],
    bookmarks: [],
    announcements: [
      {
        id: 'ann-1',
        title: 'Welcome to the ND 1 Nursing Curriculum',
        content: 'The academic structure for National Diploma 1 (ND 1) has been updated with 11 core nursing subjects. Study notes and CBT question banks will be published by the administration.',
        priority: 'high',
        targetLevel: 'lvl-nd1',
        author: 'YHUNGO (Owner & Administrator)',
        createdAt: '2026-03-17T08:00:00.000Z',
      },
    ],
    chatChannels: DEFAULT_CHAT_CHANNELS,
    chatMessages: DEFAULT_CHAT_MESSAGES,
  };
}

// Database Manager
class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // ensure default arrays exist in case of partial structures
        const loaded: DatabaseSchema = {
          ...getInitialData(),
          ...parsed,
        };
        if (!Array.isArray(loaded.chatChannels) || loaded.chatChannels.length === 0) {
          loaded.chatChannels = DEFAULT_CHAT_CHANNELS;
        }
        if (!Array.isArray(loaded.chatMessages) || loaded.chatMessages.length === 0) {
          loaded.chatMessages = DEFAULT_CHAT_MESSAGES;
        }
        return loaded;
      }
    } catch (err) {
      console.error('Error loading database file, initializing default:', err);
    }

    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public reload(): DatabaseSchema {
    this.data = this.loadData();
    return this.data;
  }

  public save() {
    this.saveData(this.data);
  }

  public resetToSeed(): DatabaseSchema {
    this.data = getInitialData();
    this.save();
    return this.data;
  }
}

export const db = new DatabaseService();
