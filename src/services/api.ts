import {
  User,
  NursingLevel,
  Subject,
  StudyNote,
  Question,
  CBTExam,
  ExamAttempt,
  Announcement,
  AdminStats,
} from '../types';

let authToken: string | null = localStorage.getItem('nursesstudy_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('nursesstudy_token', token);
  } else {
    localStorage.removeItem('nursesstudy_token');
  }
};

export const getAuthToken = () => authToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    id?: string;
    name: string;
    email: string;
    password: string;
    levelId?: string;
    school?: string;
    gradYear?: string;
  }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),

  updateProfile: (data: Partial<User>) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  switchDemoUser: (role: 'student' | 'admin') =>
    request<{ token: string; user: User }>('/api/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // Levels
  getLevels: () => request<NursingLevel[]>('/api/levels'),
  createLevel: (data: Partial<NursingLevel>) =>
    request<NursingLevel>('/api/levels', { method: 'POST', body: JSON.stringify(data) }),
  updateLevel: (id: string, data: Partial<NursingLevel>) =>
    request<NursingLevel>(`/api/levels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLevel: (id: string) =>
    request<{ success: boolean }>(`/api/levels/${id}`, { method: 'DELETE' }),

  // Subjects
  getSubjects: (levelId?: string) => {
    const query = levelId ? `?levelId=${encodeURIComponent(levelId)}` : '';
    return request<Subject[]>(`/api/subjects${query}`);
  },
  createSubject: (data: Partial<Subject>) =>
    request<Subject>('/api/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id: string, data: Partial<Subject>) =>
    request<Subject>(`/api/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: (id: string) =>
    request<{ success: boolean }>(`/api/subjects/${id}`, { method: 'DELETE' }),

  // Study Notes
  getNotes: (params?: { subjectId?: string; levelId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.subjectId) query.set('subjectId', params.subjectId);
    if (params?.levelId) query.set('levelId', params.levelId);
    if (params?.search) query.set('search', params.search);
    return request<StudyNote[]>(`/api/notes?${query.toString()}`);
  },
  getNote: (id: string) => request<StudyNote>(`/api/notes/${id}`),
  createNote: (data: Partial<StudyNote>) =>
    request<StudyNote>('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: Partial<StudyNote>) =>
    request<StudyNote>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) =>
    request<{ success: boolean }>(`/api/notes/${id}`, { method: 'DELETE' }),

  // Questions
  getQuestions: (params?: { subjectId?: string; difficulty?: string; search?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.subjectId) query.set('subjectId', params.subjectId);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    return request<Question[]>(`/api/questions?${query.toString()}`);
  },
  createQuestion: (data: Partial<Question>) =>
    request<Question>('/api/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: Partial<Question>) =>
    request<Question>(`/api/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) =>
    request<{ success: boolean }>(`/api/questions/${id}`, { method: 'DELETE' }),

  // CBT Exams
  getExams: () => request<CBTExam[]>('/api/exams'),
  getExamDetails: (id: string) =>
    request<CBTExam & { questions: Question[] }>(`/api/exams/${id}`),
  createExam: (data: Partial<CBTExam>) =>
    request<CBTExam>('/api/exams', { method: 'POST', body: JSON.stringify(data) }),
  updateExam: (id: string, data: Partial<CBTExam>) =>
    request<CBTExam>(`/api/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExam: (id: string) =>
    request<{ success: boolean }>(`/api/exams/${id}`, { method: 'DELETE' }),
  submitExam: (
    id: string,
    payload: { answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>; timeSpentSeconds: number }
  ) =>
    request<{ attempt: ExamAttempt; detailedAnswers: any[] }>(`/api/exams/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Practice Quiz
  submitPractice: (payload: {
    subjectId: string;
    answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
    timeSpentSeconds: number;
  }) =>
    request<{ attempt: ExamAttempt; detailed: any[] }>('/api/practice/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Attempts
  getAttempts: () => request<ExamAttempt[]>('/api/attempts'),
  getAttemptDetails: (id: string) => request<ExamAttempt>(`/api/attempts/${id}`),

  // Bookmarks
  getBookmarks: () =>
    request<{ bookmarks: any[]; notes: StudyNote[]; questions: Question[] }>('/api/bookmarks'),
  toggleBookmark: (type: 'note' | 'question', itemId: string) =>
    request<{ bookmarked: boolean }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ type, itemId }),
    }),
  addBookmark: (type: 'note' | 'question', itemId: string) =>
    request<{ bookmarked: boolean }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ type, itemId }),
    }),
  removeBookmark: (type: 'note' | 'question', itemId: string) =>
    request<{ bookmarked: boolean }>('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ type, itemId }),
    }),

  // Announcements
  getAnnouncements: () => request<Announcement[]>('/api/announcements'),
  createAnnouncement: (data: Partial<Announcement>) =>
    request<Announcement>('/api/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) =>
    request<{ success: boolean }>(`/api/announcements/${id}`, { method: 'DELETE' }),

  // Admin Specific
  getAdminStats: () => request<AdminStats>('/api/admin/stats'),
  getAdminStudents: () =>
    request<
      (User & { levelName: string; totalAttempts: number; avgScore: number })[]
    >('/api/admin/students'),
  updateStudentStatus: (id: string, status?: string, levelId?: string) =>
    request<User>(`/api/admin/students/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, levelId }),
    }),
  deleteStudent: (id: string) =>
    request<{ success: boolean }>(`/api/admin/students/${id}`, { method: 'DELETE' }),
  resetDatabase: () =>
    request<{ success: boolean; message: string }>('/api/admin/reset-data', { method: 'POST' }),
};
