import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // stored for local verification
  role: 'student' | 'admin';
  levelId: string;
  status: 'active' | 'suspended';
  school?: string;
  gradYear?: string;
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
  levelId: string;
  title: string;
  topic: string;
  summary: string;
  content: string;
  keyPoints: string[];
  clinicalPearls: string[];
  readingTime: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  subjectId: string;
  topic: string;
  levelId: string;
  scenario?: string;
  questionText: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  createdAt: string;
}

export interface CBTExam {
  id: string;
  title: string;
  description: string;
  subjectId: string; // 'all' or specific
  levelId: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  questionIds: string[];
  isPublished: boolean;
  instructions: string[];
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  type: 'cbt_exam' | 'practice_drill';
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  passed: boolean;
  answers: {
    questionId: string;
    selectedOption: 'A' | 'B' | 'C' | 'D' | null;
    correctOption: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
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
  settings: {
    platformName: string;
    maintenanceMode: boolean;
    defaultExamPassingScore: number;
    allowStudentRegistration: boolean;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

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
    notes: [],
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
        return {
          ...getInitialData(),
          ...parsed,
        };
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
