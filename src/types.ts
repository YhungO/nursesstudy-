export type ContentStatus = 'draft' | 'published' | 'archived';

export interface User {
  id: string;
  name: string;
  email: string;
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
  levelId: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  order?: number;
  status?: ContentStatus;
  isPublished: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  noteCount?: number;
  questionCount?: number;
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
  status?: ContentStatus;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
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
  subjectName?: string;
  subjectColor?: string;
  topic: string;
  levelId?: string;
  scenario?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  status?: ContentStatus;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CBTExam {
  id: string;
  title: string;
  description: string;
  examType?: 'objective' | 'theory';
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  levelId: string;
  durationMinutes: number;
  totalQuestions: number;
  actualQuestionCount?: number;
  passingScore: number;
  questionIds?: (string | number)[];
  status?: ContentStatus;
  isPublished: boolean;
  publishedAt?: string;
  instructions: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  courseCode?: string;
  department?: string;
  level?: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  type: 'cbt_exam' | 'practice_quiz' | 'theory_exam';
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
    options?: QuestionOption[];
    explanation?: string;
    difficulty?: string;
  }[];
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'high' | 'normal';
  targetLevel: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  type: 'note' | 'question';
  itemId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  adminName?: string;
  action: string;
  targetType: 'question' | 'exam' | 'note' | 'subject' | 'level' | 'announcement' | 'student' | 'attempt';
  targetId: string;
  targetTitle?: string;
  previousStatus?: ContentStatus | string;
  newStatus?: ContentStatus | string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface AdminStats {
  totalStudents: number;
  totalLevels: number;
  totalSubjects: number;
  totalNotes: number;
  publishedNotes: number;
  draftNotes: number;
  archivedNotes: number;
  totalQuestions: number;
  publishedQuestions: number;
  draftQuestions: number;
  totalExams: number;
  publishedExams: number;
  draftExams: number;
  archivedExams: number;
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  passRate: number;
}
