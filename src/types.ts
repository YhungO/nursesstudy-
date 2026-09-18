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
  isPublished: boolean;
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
  subjectName?: string;
  subjectColor?: string;
  topic: string;
  levelId: string;
  scenario?: string;
  questionText: string;
  options: QuestionOption[];
  correctOption?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  createdAt: string;
}

export interface CBTExam {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  levelId: string;
  durationMinutes: number;
  totalQuestions: number;
  actualQuestionCount?: number;
  passingScore: number;
  questionIds?: string[];
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
  type: 'cbt_exam' | 'practice_quiz';
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
    scenario?: string;
    questionText?: string;
    options?: QuestionOption[];
    explanation?: string;
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
}

export interface AdminStats {
  totalStudents: number;
  totalLevels: number;
  totalSubjects: number;
  totalNotes: number;
  totalQuestions: number;
  totalExams: number;
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  passRate: number;
}
