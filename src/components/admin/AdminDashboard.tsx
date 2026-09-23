import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AdminStats,
  NursingLevel,
  Subject,
  StudyNote,
  Question,
  CBTExam,
  ExamAttempt,
  Announcement,
  AuditLog,
  ContentStatus,
} from '../../types';
import { api } from '../../services/api';
import {
  saveLevelToFirestore,
  deleteLevelFromFirestore,
  saveSubjectToFirestore,
  deleteSubjectFromFirestore,
  saveNoteToFirestore,
  deleteNoteFromFirestore,
  updateNoteStatus,
  saveQuestionToFirestore,
  deleteQuestionFromFirestore,
  saveExamToFirestore,
  deleteExamFromFirestore,
  updateExamStatus,
  saveAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  deleteAttemptFromFirestore,
  subscribeToUsers,
  subscribeToStudents,
  getStudentsFromFirestore,
  updateStudentStatusInFirestore,
  subscribeToAuditLogs,
  FIREBASE_CONFIG,
} from '../../services/firestoreService';
import {
  BarChart3,
  Users,
  Layers,
  BookOpen,
  HelpCircle,
  Clock,
  Award,
  Bell,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Shield,
  ShieldAlert,
  RotateCcw,
  Cloud,
  RefreshCw,
  Search,
  ArrowRight,
  Activity,
  Eye,
  Archive,
  FileCheck,
} from 'lucide-react';
import { SubjectFormModal } from './forms/SubjectFormModal';
import { StudyNoteFormModal } from './forms/StudyNoteFormModal';
import { MCQQuestionFormModal } from './forms/MCQQuestionFormModal';
import { CBTExamFormModal } from './forms/CBTExamFormModal';
import { getLevelBadge } from './forms/constants';

interface DeleteTarget {
  type: 'student' | 'question' | 'exam' | 'subject' | 'note' | 'level' | 'announcement' | 'result';
  id: string | number;
  title?: string;
  email?: string;
}

interface AdminDashboardProps {
  levels: NursingLevel[];
  subjects: Subject[];
  notes: StudyNote[];
  questions: Question[];
  exams: CBTExam[];
  announcements: Announcement[];
  onDataChanged: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  levels,
  subjects,
  notes,
  questions,
  exams,
  announcements,
  onDataChanged,
  onExitAdmin,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'levels'
    | 'subjects'
    | 'notes'
    | 'questions'
    | 'exams'
    | 'students'
    | 'results'
    | 'announcements'
    | 'audit_logs'
    | 'settings'
  >('overview');

  const adminActor = user
    ? {
        uid: user.id,
        email: user.email,
        name: user.name,
      }
    : undefined;

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentFilterStatus, setStudentFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [attemptsList, setAttemptsList] = useState<ExamAttempt[]>([]);
  const attemptsListRef = useRef<ExamAttempt[]>([]);
  const [, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilterType, setAuditFilterType] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Unified Delete Confirmation State (for students, questions, exams, subjects, notes, levels, announcements, results)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletedStudentIdsRef = useRef<Set<string>>(new Set());
  const deletedItemIdsRef = useRef<Set<string>>(new Set());

  // Local state for all admin lists to allow instantaneous UI updates without requiring page reload
  const [localLevels, setLocalLevels] = useState<NursingLevel[]>(levels);
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(subjects);
  const [localNotes, setLocalNotes] = useState<StudyNote[]>(notes);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [localExams, setLocalExams] = useState<CBTExam[]>(exams);
  const [localAnnouncements, setLocalAnnouncements] = useState<Announcement[]>(announcements);

  // Keep local states synchronized with props from parent App, while preserving locally deleted items
  useEffect(() => {
    setLocalLevels(levels.filter((l) => !deletedItemIdsRef.current.has(String(l.id))));
  }, [levels]);

  useEffect(() => {
    setLocalSubjects(subjects.filter((s) => !deletedItemIdsRef.current.has(String(s.id))));
  }, [subjects]);

  useEffect(() => {
    setLocalNotes(notes.filter((n) => !deletedItemIdsRef.current.has(String(n.id))));
  }, [notes]);

  useEffect(() => {
    setLocalQuestions(questions.filter((q) => !deletedItemIdsRef.current.has(String(q.id))));
  }, [questions]);

  useEffect(() => {
    setLocalExams(exams.filter((e) => !deletedItemIdsRef.current.has(String(e.id))));
  }, [exams]);

  useEffect(() => {
    setLocalAnnouncements(announcements.filter((a) => !deletedItemIdsRef.current.has(String(a.id))));
  }, [announcements]);

  // Load Admin Data (Authoritative Firestore direct read for Students)
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, firestoreStudents, att] = await Promise.all([
        api.getAdminStats(),
        getStudentsFromFirestore(),
        api.getAttempts(),
      ]);

      const currentAttempts = att || [];
      setAttemptsList(currentAttempts);
      attemptsListRef.current = currentAttempts;

      const activeStudentCount = (firestoreStudents || []).length;
      if (s) {
        setStats({ ...s, totalStudents: activeStudentCount });
      }

      const mappedStudents = (firestoreStudents || [])
        .filter(
          (st) =>
            !deletedStudentIdsRef.current.has(st.id) &&
            (!st.email || !deletedStudentIdsRef.current.has(st.email.toLowerCase().trim()))
        )
        .map((fu) => {
          const studentAttempts = currentAttempts.filter(
            (a) =>
              a.userId === fu.id ||
              (fu.email && a.userEmail?.toLowerCase() === fu.email.toLowerCase())
          );
          const totalAttempts = studentAttempts.length;
          const avgScore =
            totalAttempts > 0
              ? Math.round(
                  studentAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalAttempts
                )
              : 0;

          return {
            id: fu.id,
            name: fu.name,
            email: fu.email,
            levelId: fu.levelId || 'lvl-nd1',
            levelName: levels.find((l) => l.id === fu.levelId)?.name || 'ND 1',
            status: fu.status || 'active',
            school: fu.school || 'College of Nursing Sciences',
            gradYear: fu.gradYear || '2027',
            createdAt: fu.createdAt || new Date().toISOString(),
            emailVerified: (fu as any).emailVerified ?? false,
            totalAttempts,
            avgScore,
          };
        });

      setStudentsList(mappedStudents);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Listen to real-time student registrations directly from Google Cloud Firestore
    const unsubscribeStudents = subscribeToStudents((firestoreStudents) => {
      if (firestoreStudents) {
        const currentAttempts = attemptsListRef.current;
        const filtered = firestoreStudents
          .filter(
            (u) =>
              u.role !== 'admin' &&
              !deletedStudentIdsRef.current.has(u.id) &&
              (!u.email || !deletedStudentIdsRef.current.has(u.email.toLowerCase().trim()))
          )
          .map((fu) => {
            const studentAttempts = currentAttempts.filter(
              (a) =>
                a.userId === fu.id ||
                (fu.email && a.userEmail?.toLowerCase() === fu.email.toLowerCase())
            );
            const totalAttempts = studentAttempts.length;
            const avgScore =
              totalAttempts > 0
                ? Math.round(
                    studentAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalAttempts
                  )
                : 0;

            return {
              id: fu.id,
              name: fu.name,
              email: fu.email,
              levelId: fu.levelId || 'lvl-nd1',
              levelName: levels.find((l) => l.id === fu.levelId)?.name || 'ND 1',
              status: fu.status || 'active',
              school: fu.school || 'College of Nursing Sciences',
              gradYear: fu.gradYear || '2027',
              createdAt: fu.createdAt || new Date().toISOString(),
              emailVerified: (fu as any).emailVerified ?? false,
              totalAttempts,
              avgScore,
            };
          });

        setStudentsList(filtered);
        setStats((prev) => (prev ? { ...prev, totalStudents: filtered.length } : prev));
      }
    });

    return () => {
      unsubscribeStudents();
    };
  }, [levels]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Cloud Sync State
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<string | null>(null);

  const handlePushAllToFirestore = async () => {
    setCloudSyncing(true);
    setCloudStatus('Uploading curriculum records to Cloud Firestore...');
    try {
      const levelsToSync = localLevels.length > 0 ? localLevels : await api.getLevels();
      const subjectsToSync = localSubjects.length > 0 ? localSubjects : await api.getSubjects();
      const notesToSync = localNotes.length > 0 ? localNotes : await api.getNotes();
      const questionsToSync = localQuestions.length > 0 ? localQuestions : await api.getQuestions();
      const examsToSync = localExams.length > 0 ? localExams : await api.getExams();
      const announcementsToSync = localAnnouncements.length > 0 ? localAnnouncements : await api.getAnnouncements();

      for (const lvl of levelsToSync) await saveLevelToFirestore(lvl);
      for (const subj of subjectsToSync) await saveSubjectToFirestore(subj);
      for (const n of notesToSync) await saveNoteToFirestore(n);
      for (const q of questionsToSync) await saveQuestionToFirestore(q);
      for (const ex of examsToSync) await saveExamToFirestore(ex);
      for (const ann of announcementsToSync) await saveAnnouncementToFirestore(ann);
      setCloudStatus('All records synchronized to Google Cloud Firestore!');
      showNotify('Full Cloud Firestore sync complete');
    } catch (err: any) {
      setCloudStatus(`Sync warning: ${err.message}`);
    } finally {
      setCloudSyncing(false);
    }
  };

  // 1. Levels Modal Form
  const [editingLevel, setEditingLevel] = useState<Partial<NursingLevel> | null>(null);
  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel?.name) return;
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      if (editingLevel.id) {
        await saveLevelToFirestore(editingLevel as NursingLevel, adminActor);
        const res = await api.updateLevel(editingLevel.id, editingLevel);
        setLocalLevels((prev) => prev.map((l) => (l.id === res.id ? res : l)));
        showNotify('Nursing level updated successfully');
      } else {
        const res = await api.createLevel(editingLevel);
        await saveLevelToFirestore(res, adminActor);
        setLocalLevels((prev) => [...prev, res]);
        showNotify('Nursing level created successfully');
      }
      setEditingLevel(null);
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      console.error('Failed to save level:', err);
      alert('Failed to save nursing level: ' + (err.message || err));
    }
  };

  // 2. Subjects Modal Form
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);
  const handleSaveSubject = async (data: Partial<Subject>) => {
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      const now = new Date().toISOString();
      const isPub = data.isPublished !== false;
      const status: ContentStatus = data.status || (isPub ? 'published' : 'draft');

      if (data.id) {
        const subjPayload: Subject = {
          ...(data as Subject),
          status,
          isPublished: isPub,
          updatedAt: now,
        };
        await saveSubjectToFirestore(subjPayload, adminActor);
        const res = await api.updateSubject(data.id, subjPayload);
        setLocalSubjects((prev) => prev.map((s) => (s.id === res.id ? res : s)));
        showNotify('Subject updated successfully');
      } else {
        const res = await api.createSubject({
          ...data,
          status,
          isPublished: isPub,
          createdAt: now,
          updatedAt: now,
        });
        await saveSubjectToFirestore(res, adminActor);
        setLocalSubjects((prev) => [...prev, res]);
        showNotify('Subject created successfully');
      }
      setEditingSubject(null);
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      console.error('Failed to save subject:', err);
      alert('Failed to save subject: ' + (err.message || err));
    }
  };

  // 3. Study Notes Modal Form
  const [editingNote, setEditingNote] = useState<Partial<StudyNote> | null>(null);

  const openNoteEditor = (note?: StudyNote) => {
    if (note) {
      setEditingNote(note);
    } else {
      setEditingNote({
        title: '',
        topic: '',
        subjectId: localSubjects[0]?.id || '',
        levelId: 'ND1',
        summary: '',
        content: '',
        readingTime: 5,
        status: 'published',
        isPublished: true,
      });
    }
  };

  const handleSaveNote = async (data: Partial<StudyNote>) => {
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      const now = new Date().toISOString();
      const status: ContentStatus = data.status || (data.isPublished ? 'published' : 'draft');
      const isPub = status === 'published';

      if (data.id) {
        const notePayload: StudyNote = {
          ...(data as StudyNote),
          status,
          isPublished: isPub,
          publishedAt: isPub ? (data.publishedAt || now) : undefined,
          updatedAt: now,
        };
        await saveNoteToFirestore(notePayload, adminActor);
        const res = await api.updateNote(data.id, notePayload);
        setLocalNotes((prev) => prev.map((n) => (n.id === res.id ? res : n)));
        showNotify(`Study note ${isPub ? 'published' : 'saved as draft'} successfully`);
      } else {
        const res = await api.createNote({
          ...data,
          status,
          isPublished: isPub,
          publishedAt: isPub ? now : undefined,
        });
        await saveNoteToFirestore(res, adminActor);
        setLocalNotes((prev) => [res, ...prev]);
        showNotify(`Study note ${isPub ? 'published' : 'created as draft'} successfully`);
      }
      setEditingNote(null);
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      console.error('Failed to save note:', err);
      alert('Failed to save study note: ' + (err.message || err));
    }
  };

  const handleToggleNotePublish = async (note: StudyNote) => {
    const isCurrentlyPub = note.status ? note.status === 'published' : note.isPublished !== false;
    const newStatus: ContentStatus = isCurrentlyPub ? 'draft' : 'published';
    const isPub = newStatus === 'published';
    const now = new Date().toISOString();
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      const updatedNote: StudyNote = {
        ...note,
        status: newStatus,
        isPublished: isPub,
        publishedAt: isPub ? (note.publishedAt || now) : undefined,
        updatedAt: now,
      };
      await saveNoteToFirestore(updatedNote, adminActor);
      await api.updateNote(note.id, updatedNote);
      setLocalNotes((prev) => prev.map((n) => (n.id === note.id ? updatedNote : n)));
      showNotify(`Note ${isPub ? 'published to students' : 'set to draft (hidden from students)'}`);
      onDataChanged();
    } catch (err: any) {
      console.error('Failed to toggle note publish status:', err);
      alert('Failed to update publication status: ' + (err.message || err));
    }
  };

  // 4. Questions Modal Form
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  const openQuestionEditor = (q?: Question) => {
    if (q) {
      setEditingQuestion(q);
    } else {
      setEditingQuestion({
        subjectId: localSubjects[0]?.id || '',
        topic: 'General Clinical Nursing',
        levelId: 'ND1',
        difficulty: 'Medium',
        scenario: '',
        questionText: '',
        correctOption: 'A',
        explanation: '',
      });
    }
  };

  const handleSaveQuestion = async (data: Partial<Question>) => {
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      const now = new Date().toISOString();
      if (data.id) {
        const qPayload: Question = {
          ...(data as Question),
          updatedAt: now,
        };
        await saveQuestionToFirestore(qPayload, adminActor);
        const res = await api.updateQuestion(data.id, qPayload);
        setLocalQuestions((prev) => prev.map((q) => (String(q.id) === String(res.id) ? res : q)));
        showNotify('Question updated successfully');
      } else {
        const res = await api.createQuestion({
          ...data,
          createdAt: now,
          updatedAt: now,
        });
        await saveQuestionToFirestore(res, adminActor);
        setLocalQuestions((prev) => [res, ...prev]);
        showNotify('Question created successfully');
      }
      setEditingQuestion(null);
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      console.error('Failed to save question:', err);
      alert('Failed to save question: ' + (err.message || err));
    }
  };

  // 5. CBT Exams Modal Form
  const [editingExam, setEditingExam] = useState<Partial<CBTExam> | null>(null);

  const handleSaveExam = async (data: Partial<CBTExam>) => {
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      const now = new Date().toISOString();
      const status: ContentStatus = data.status || (data.isPublished ? 'published' : 'draft');
      const isPub = status === 'published';

      if (data.id) {
        const examPayload: CBTExam = {
          ...(data as CBTExam),
          status,
          isPublished: isPub,
          publishedAt: isPub ? (data.publishedAt || now) : undefined,
          updatedAt: now,
        };
        await saveExamToFirestore(examPayload, adminActor);
        const res = await api.updateExam(data.id, examPayload);
        setLocalExams((prev) => prev.map((e) => (e.id === res.id ? res : e)));
        showNotify(`CBT Exam ${isPub ? 'published' : 'saved as draft'} successfully`);
      } else {
        const res = await api.createExam({
          ...data,
          status,
          isPublished: isPub,
          publishedAt: isPub ? now : undefined,
        });
        await saveExamToFirestore(res, adminActor);
        setLocalExams((prev) => [res, ...prev]);
        showNotify(`CBT Exam ${isPub ? 'published' : 'created as draft'} successfully`);
      }
      setEditingExam(null);
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      console.error('Failed to save exam:', err);
      alert('Failed to save CBT Examination: ' + (err.message || err));
    }
  };

  const handleToggleExamPublish = async (exam: CBTExam) => {
    const isCurrentlyPub = exam.status ? exam.status === 'published' : exam.isPublished !== false;
    const newStatus: ContentStatus = isCurrentlyPub ? 'draft' : 'published';
    const isPub = newStatus === 'published';
    const now = new Date().toISOString();
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      const updatedExam: CBTExam = {
        ...exam,
        status: newStatus,
        isPublished: isPub,
        publishedAt: isPub ? (exam.publishedAt || now) : undefined,
        updatedAt: now,
      };
      await saveExamToFirestore(updatedExam, adminActor);
      await api.updateExam(exam.id, updatedExam);
      setLocalExams((prev) => prev.map((e) => (e.id === exam.id ? updatedExam : e)));
      showNotify(`CBT Exam ${isPub ? 'published to students' : 'set to draft (hidden from students)'}`);
      onDataChanged();
    } catch (err: any) {
      console.error('Failed to toggle exam publish status:', err);
      alert('Failed to update exam publication status: ' + (err.message || err));
    }
  };

  // 6. Announcements Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'urgent' | 'high' | 'normal'>('normal');
  const [annTargetLevel, setAnnTargetLevel] = useState('all');

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    try {
      const adminActor = user ? { uid: user.id, email: user.email, name: user.name } : undefined;
      const res = await api.createAnnouncement({
        title: annTitle.trim(),
        content: annContent.trim(),
        priority: annPriority,
        targetLevel: annTargetLevel,
      });
      await saveAnnouncementToFirestore(res, adminActor);
      setLocalAnnouncements((prev) => [res, ...prev]);
      setAnnTitle('');
      setAnnContent('');
      showNotify('Announcement broadcast published successfully');
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      console.error('Failed to create announcement:', err);
      alert('Failed to publish announcement: ' + (err.message || err));
    }
  };

  // 7. Student Management
  const handleToggleStudentStatus = async (studentId: string, currentStatus: string, email?: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const targetEmail = email?.toLowerCase().trim();

    try {
      await api.updateStudentStatus(studentId, newStatus, undefined, targetEmail);
      await updateStudentStatusInFirestore(studentId, newStatus);
      setStudentsList((prev) =>
        prev.map((s) =>
          s.id === studentId || (targetEmail && s.email?.toLowerCase().trim() === targetEmail)
            ? { ...s, status: newStatus }
            : s
        )
      );
      showNotify(newStatus === 'suspended' ? 'Student account suspended' : 'Student account reactivated');
      onDataChanged();
    } catch (err: any) {
      console.error('Failed to update student status:', err);
      alert('Failed to update student status: ' + (err.message || err));
    }
  };

  // 8. UNIFIED EXECUTE DELETE FUNCTION (Students, Questions, Exams, Subjects, Notes, Levels, Announcements, Results)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, email } = deleteTarget;
    const idStr = String(id);

    setIsDeleting(true);

    try {
      switch (type) {
        case 'student': {
          const targetId = String(id);
          const targetEmail = email?.toLowerCase().trim();
          await api.deleteStudent(targetId, targetEmail);
          await deleteUserFromFirestore(targetId, targetEmail);
          deletedStudentIdsRef.current.add(targetId);
          if (targetEmail) {
            deletedStudentIdsRef.current.add(targetEmail);
          }
          setStudentsList((prev) =>
            prev.filter(
              (s) => s.id !== targetId && (!targetEmail || s.email?.toLowerCase().trim() !== targetEmail)
            )
          );
          setStats((prev) => (prev ? { ...prev, totalStudents: Math.max(0, prev.totalStudents - 1) } : null));
          break;
        }
        case 'question': {
          await deleteQuestionFromFirestore(id);
          await api.deleteQuestion(id);
          deletedItemIdsRef.current.add(idStr);
          setLocalQuestions((prev) => prev.filter((q) => String(q.id) !== idStr));
          setStats((prev) => (prev ? { ...prev, totalQuestions: Math.max(0, prev.totalQuestions - 1) } : null));
          break;
        }
        case 'exam': {
          await deleteExamFromFirestore(idStr);
          await api.deleteExam(idStr);
          deletedItemIdsRef.current.add(idStr);
          setLocalExams((prev) => prev.filter((e) => String(e.id) !== idStr));
          setStats((prev) => (prev ? { ...prev, totalExams: Math.max(0, prev.totalExams - 1) } : null));
          break;
        }
        case 'subject': {
          await deleteSubjectFromFirestore(idStr);
          await api.deleteSubject(idStr);
          deletedItemIdsRef.current.add(idStr);
          setLocalSubjects((prev) => prev.filter((s) => String(s.id) !== idStr));
          setLocalNotes((prev) => prev.filter((n) => n.subjectId !== idStr));
          setLocalQuestions((prev) => prev.filter((q) => q.subjectId !== idStr));
          setStats((prev) => (prev ? { ...prev, totalSubjects: Math.max(0, prev.totalSubjects - 1) } : null));
          break;
        }
        case 'note': {
          await deleteNoteFromFirestore(idStr);
          await api.deleteNote(idStr);
          deletedItemIdsRef.current.add(idStr);
          setLocalNotes((prev) => prev.filter((n) => String(n.id) !== idStr));
          setStats((prev) => (prev ? { ...prev, totalNotes: Math.max(0, prev.totalNotes - 1) } : null));
          break;
        }
        case 'level': {
          await deleteLevelFromFirestore(idStr);
          await api.deleteLevel(idStr);
          deletedItemIdsRef.current.add(idStr);
          setLocalLevels((prev) => prev.map((l) => (String(l.id) === idStr ? null! : l)).filter(Boolean));
          break;
        }
        case 'announcement': {
          await deleteAnnouncementFromFirestore(idStr);
          await api.deleteAnnouncement(idStr);
          deletedItemIdsRef.current.add(idStr);
          setLocalAnnouncements((prev) => prev.filter((a) => String(a.id) !== idStr));
          break;
        }
        case 'result': {
          await api.deleteAttempt(idStr);
          deletedItemIdsRef.current.add(idStr);
          setAttemptsList((prev) => prev.filter((att) => String(att.id) !== idStr));
          setStats((prev) => (prev ? { ...prev, totalAttempts: Math.max(0, prev.totalAttempts - 1) } : null));
          break;
        }
      }

      setDeleteTarget(null);
      showNotify('Item deleted successfully');
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      console.error(`Persistent deletion error for ${type} (${id}):`, err);
      alert('Failed to delete item: ' + (err.message || 'Network error occurred. The item remains intact.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // 8. Database Seed Reset
  const handleResetData = async () => {
    if (
      !confirm(
        'Warning: This will reset all database tables back to the initial realistic clinical seed data. Are you sure?'
      )
    )
      return;
    try {
      await api.resetDatabase();
      showNotify('Database successfully reset to clinical seed state');
      onDataChanged();
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner with Return Option */}
      <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-black/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 bg-teal-500/20 border border-teal-500/30 rounded-2xl text-teal-400 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white">Private Administrator Dashboard</h1>
              <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                Owner Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as <span className="text-slate-200 font-medium">{user.name}</span> ({user.email})
            </p>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          className="relative z-10 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 hover:border-slate-600 shadow-xs cursor-pointer"
        >
          Exit to Student Portal
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 border border-emerald-500/40">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex border border-slate-800 bg-[#111827] rounded-2xl p-1.5 shadow-md overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'levels', label: 'Nursing Levels', icon: Layers },
          { id: 'subjects', label: 'Subjects', icon: BookOpen },
          { id: 'notes', label: 'Study Notes CMS', icon: Edit3 },
          { id: 'questions', label: 'Questions Bank', icon: HelpCircle },
          { id: 'exams', label: 'CBT Exams', icon: Clock },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'results', label: 'Exam Results', icon: Award },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md font-bold ring-1 ring-teal-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 font-semibold'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 1. OVERVIEW TAB ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Enrolled Students
                </span>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {stats.totalStudents}
                </div>
                <div className="text-[11px] text-teal-400 font-semibold mt-1">Active Accounts</div>
              </div>

              <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Question Bank
                </span>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {stats.totalQuestions}
                </div>
                <div className="text-[11px] text-purple-400 font-semibold mt-1">ND 1 MCQ Items</div>
              </div>

              <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  CBT Exams Taken
                </span>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {stats.totalAttempts}
                </div>
                <div className="text-[11px] text-amber-400 font-semibold mt-1">
                  {stats.passRate}% Pass Rate
                </div>
              </div>

              <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Published Curricula
                </span>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {stats.totalNotes} Notes
                </div>
                <div className="text-[11px] text-sky-400 font-semibold mt-1">
                  Across {stats.totalSubjects} Subjects
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Loading platform metrics...</div>
          )}

          {/* Firebase Cloud Firestore Live Status Panel */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0f172a] to-teal-950 text-white border border-teal-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5" /> Cloud Firestore Connected
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                    Project: {FIREBASE_CONFIG.projectId}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Real-Time Cloud Persistence & Student Synchronization
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Every curriculum change, note update, and CBT exam created is automatically synchronized to Google Cloud Firestore and updated in real time for all nursing students.
                </p>
                {cloudStatus && (
                  <p className="text-[11px] font-medium text-emerald-300 pt-1">
                    {cloudStatus}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={cloudSyncing}
                onClick={handlePushAllToFirestore}
                className="shrink-0 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ring-1 ring-teal-400/30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncing ? 'animate-spin' : ''}`} />
                <span>{cloudSyncing ? 'Synchronizing...' : 'Sync All Data to Firestore'}</span>
              </button>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => {
                setActiveTab('notes');
                openNoteEditor();
              }}
              className="bg-[#111827] p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 shadow-md cursor-pointer flex items-center gap-3.5 transition-all group"
            >
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">Add New Study Note</h4>
                <p className="text-xs text-slate-400">Write clinical content & rationales</p>
              </div>
            </div>

            <div
              onClick={() => {
                setActiveTab('questions');
                openQuestionEditor();
              }}
              className="bg-[#111827] p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 shadow-md cursor-pointer flex items-center gap-3.5 transition-all group"
            >
              <div className="p-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">Add MCQ Question</h4>
                <p className="text-xs text-slate-400">Add 4 options, key & explanation</p>
              </div>
            </div>

            <div
              onClick={() => {
                setActiveTab('exams');
                setEditingExam({
                  title: '',
                  description: '',
                  subjectId: 'all',
                  durationMinutes: 30,
                  totalQuestions: 10,
                  passingScore: 70,
                  isPublished: true,
                });
              }}
              className="bg-[#111827] p-5 rounded-2xl border border-slate-800 hover:border-rose-500/50 shadow-md cursor-pointer flex items-center gap-3.5 transition-all group"
            >
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">Create Timed CBT Exam</h4>
                <p className="text-xs text-slate-400">Configure duration & pass mark</p>
              </div>
            </div>
          </div>

          {/* Recently Registered Students Section */}
          <div className="bg-[#111827] rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Recent Student Registrations</h4>
                  <p className="text-[11px] text-slate-400">
                    Latest sign-ups authenticated via Firebase and saved to the roster
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('students')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Full Roster ({studentsList.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {studentsList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No students registered yet. New signups will appear here instantly.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {studentsList.slice(0, 5).map((stud) => (
                  <div
                    key={stud.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center shrink-0 border border-teal-500/30">
                        {stud.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate flex items-center gap-2">
                          <span>{stud.name}</span>
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {stud.levelName || 'ND 1'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          <span className="font-mono text-slate-300">{stud.email}</span>
                          {stud.school && <span> • {stud.school}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {stud.status.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {stud.createdAt
                          ? new Date(stud.createdAt).toLocaleDateString()
                          : 'Registered'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. NURSING LEVELS TAB ================= */}
      {activeTab === 'levels' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Nursing Levels & Classes</h3>
              <p className="text-xs text-slate-400">
                Structure your student cohort stages (Year 1, Year 2, NCLEX prep, etc.)
              </p>
            </div>
            <button
              onClick={() =>
                setEditingLevel({
                  name: '',
                  description: '',
                  order: localLevels.length + 1,
                  badge: 'Year',
                })
              }
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Nursing Level</span>
            </button>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-md divide-y divide-slate-800">
            {localLevels.map((lvl) => (
              <div key={lvl.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{lvl.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                      {lvl.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{lvl.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingLevel(lvl)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: 'level', id: lvl.id, title: lvl.name })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Level"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Level Edit Modal */}
          {editingLevel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
              <form
                onSubmit={handleSaveLevel}
                className="bg-[#111827] rounded-3xl p-6 w-full max-w-md border border-slate-800 shadow-2xl space-y-4"
              >
                <h3 className="font-bold text-base text-white">
                  {editingLevel.id ? 'Edit Nursing Level' : 'Add New Nursing Level'}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Level Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLevel.name || ''}
                    onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })}
                    placeholder="e.g. Year 2: Intermediate Nursing"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge Short Name
                  </label>
                  <input
                    type="text"
                    value={editingLevel.badge || ''}
                    onChange={(e) => setEditingLevel({ ...editingLevel, badge: e.target.value })}
                    placeholder="e.g. Year 2"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingLevel.description || ''}
                    onChange={(e) =>
                      setEditingLevel({ ...editingLevel, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingLevel(null)}
                    className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition-colors shadow-sm cursor-pointer"
                  >
                    Save Level
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. SUBJECTS TAB ================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Nursing Subjects</h3>
              <p className="text-xs text-slate-400">
                Manage academic curriculum courses, level allocations, sorting order, and clinical scope
              </p>
            </div>
            <button
              id="admin-add-subject-top-btn"
              onClick={() =>
                setEditingSubject({
                  name: '',
                  code: '',
                  description: '',
                  icon: 'BookOpen',
                  color: 'teal',
                  levelId: 'ND1',
                  order: localSubjects.length + 1,
                  isPublished: true,
                })
              }
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {localSubjects.map((subj) => {
              const lvl = getLevelBadge(subj.levelId);
              return (
                <div
                  key={subj.id}
                  className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className="font-bold text-xs uppercase text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30 font-mono">
                        {subj.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lvl.badgeClass}`}>
                        {lvl.badge}
                      </span>
                      {subj.order !== undefined && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                          Pos #{subj.order}
                        </span>
                      )}
                      <span
                        className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          subj.isPublished
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {subj.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{subj.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{subj.description || 'No course description provided.'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      {subj.noteCount || 0} Notes • {subj.questionCount || 0} MCQs
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingSubject(subj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Subject"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'subject', id: subj.id, title: subj.name })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean Add / Edit Subject Form Modal */}
          {editingSubject && (
            <SubjectFormModal
              subject={editingSubject}
              existingSubjectsCount={localSubjects.length}
              onClose={() => setEditingSubject(null)}
              onSave={handleSaveSubject}
            />
          )}
        </div>
      )}

      {/* ================= 4. STUDY NOTES CMS TAB ================= */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Clinical Study Notes CMS</h3>
              <p className="text-xs text-slate-400">
                Author and publish curriculum-aligned study guides, high-yield pearls, and exam key points
              </p>
            </div>
            <button
              id="admin-compose-note-top-btn"
              onClick={() => openNoteEditor()}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Compose New Note</span>
            </button>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden shadow-md">
            {localNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No clinical study notes authored yet. Click "Compose New Note" above to write one.
              </div>
            ) : (
              localNotes.map((note) => {
                const lvl = getLevelBadge(note.levelId);
                const subj = localSubjects.find((s) => s.id === note.subjectId);
                return (
                  <div
                    key={note.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-xs font-mono uppercase bg-teal-950/60 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                          {subj?.code || 'General'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lvl.badgeClass}`}>
                          {lvl.badge}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleNotePublish(note)}
                          title="Click to toggle publication status (Published / Draft)"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all hover:scale-105 ${
                            note.isPublished
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {note.isPublished ? 'Published (Live)' : 'Draft (Hidden)'}
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-white truncate">{note.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-300">Topic: {note.topic}</span>
                        <span>•</span>
                        <span>{note.readingTime || 5} min read</span>
                        {note.clinicalPearls && note.clinicalPearls.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold">
                              {note.clinicalPearls.length} Pearls
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openNoteEditor(note)}
                        className="px-3 py-1 bg-slate-800 hover:bg-teal-500/20 hover:text-teal-300 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1 transition-colors border border-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'note', id: note.id, title: note.title })}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clean Study Note Form Modal */}
          {editingNote && (
            <StudyNoteFormModal
              note={editingNote}
              subjects={localSubjects}
              onClose={() => setEditingNote(null)}
              onSave={handleSaveNote}
            />
          )}
        </div>
      )}

      {/* ================= 5. QUESTIONS BANK CMS TAB ================= */}
      {activeTab === 'questions' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">MCQ Questions Bank (NCLEX / NMCN Pool)</h3>
              <p className="text-xs text-slate-400">
                Author clinical scenario MCQs with options A-D, answer rationale, difficulty, and academic level
              </p>
            </div>
            <button
              id="admin-add-question-top-btn"
              onClick={() => openQuestionEditor()}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden shadow-md">
            {localQuestions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No MCQ questions created yet. Click "Add Question" above to build the question pool.
              </div>
            ) : (
              localQuestions.map((q) => {
                const lvl = getLevelBadge(q.levelId);
                const subj = localSubjects.find((s) => s.id === q.subjectId);
                return (
                  <div
                    key={q.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-500/30">
                          {subj?.code || q.subjectName || 'Nursing'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lvl.badgeClass}`}>
                          {lvl.badge}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          Correct: Option {q.correctOption || (typeof q.correct === 'number' ? ['A','B','C','D'][q.correct] : 'A')}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            q.difficulty === 'Hard'
                              ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                              : q.difficulty === 'Easy'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                              : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {q.topic}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
                        {q.questionText || q.question}
                      </h4>
                      {q.scenario && (
                        <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                          Vignette: {q.scenario}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                        <span className="font-semibold text-slate-300">Rationale:</span> {q.explanation || q.rationale}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openQuestionEditor(q)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'question',
                            id: q.id,
                            title: q.questionText || q.question || 'MCQ Question',
                          })
                        }
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clean MCQ Question Form Modal */}
          {editingQuestion && (
            <MCQQuestionFormModal
              question={editingQuestion}
              subjects={localSubjects}
              onClose={() => setEditingQuestion(null)}
              onSave={handleSaveQuestion}
            />
          )}
        </div>
      )}

      {/* ================= 6. CBT EXAMS CMS TAB ================= */}
      {activeTab === 'exams' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">CBT Examination Management</h3>
              <p className="text-xs text-slate-400">
                Configure timed computer-based tests, duration, question pools & passing scores
              </p>
            </div>
            <button
              id="admin-create-cbt-exam-btn"
              onClick={() =>
                setEditingExam({
                  title: '',
                  description: '',
                  subjectId: 'all',
                  levelId: 'lvl-nd1',
                  durationMinutes: 30,
                  totalQuestions: 15,
                  passingScore: 70,
                  isPublished: true,
                })
              }
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create CBT Exam</span>
            </button>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden shadow-md">
            {localExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No CBT exams created yet. Click "Create CBT Exam" to set up a timed test for students.
              </div>
            ) : (
              localExams.map((exam) => {
                const lvl = getLevelBadge(exam.levelId);
                return (
                  <div
                    key={exam.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white">{exam.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lvl.badgeClass}`}>
                          {lvl.badge}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleExamPublish(exam)}
                          title="Click to toggle publication status (Published / Draft)"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all hover:scale-105 ${
                            exam.isPublished
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {exam.isPublished ? 'Published (Live)' : 'Draft (Hidden)'}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="font-medium text-slate-300">Subject: {exam.subjectName || 'Comprehensive'}</span>
                        <span>•</span>
                        <span>Duration: {exam.durationMinutes} mins</span>
                        <span>•</span>
                        <span>Questions: {exam.totalQuestions || 15}</span>
                        <span>•</span>
                        <span>Pass mark: {exam.passingScore}%</span>
                      </div>
                      {exam.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {exam.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingExam(exam)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1 transition-colors border border-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'exam',
                            id: exam.id,
                            title: exam.title,
                          })
                        }
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete CBT Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clean CBT Exam Form Modal */}
          {editingExam && (
            <CBTExamFormModal
              exam={editingExam}
              subjects={localSubjects}
              onClose={() => setEditingExam(null)}
              onSave={handleSaveExam}
            />
          )}
        </div>
      )}

      {/* ================= 7. STUDENTS TAB ================= */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Registered Students Directory</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {studentsList.length} Registered
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-950/70 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-teal-400 animate-pulse" />
                  <span>Firestore Authoritative (Real-Time)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative Firestore student roster synchronized in real-time. Every student signup automatically appears here.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAdminData}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh student roster"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Roster</span>
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search registered students by name, email, or school..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStudentFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  studentFilterStatus === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({studentsList.length})
              </button>
              <button
                onClick={() => setStudentFilterStatus('active')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  studentFilterStatus === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Active ({studentsList.filter((s) => s.status === 'active').length})
              </button>
              <button
                onClick={() => setStudentFilterStatus('suspended')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  studentFilterStatus === 'suspended'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Suspended ({studentsList.filter((s) => s.status === 'suspended').length})
              </button>
            </div>
          </div>

          {/* Student Roster Cards */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-md divide-y divide-slate-800">
            {studentsList
              .filter((stud) => {
                if (studentFilterStatus !== 'all' && stud.status !== studentFilterStatus)
                  return false;
                if (!studentSearchQuery.trim()) return true;
                const q = studentSearchQuery.toLowerCase();
                return (
                  stud.name?.toLowerCase().includes(q) ||
                  stud.email?.toLowerCase().includes(q) ||
                  stud.school?.toLowerCase().includes(q)
                );
              })
              .map((stud) => (
                <div
                  key={stud.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-700/20 border border-teal-500/30 text-teal-300 text-sm font-black flex items-center justify-center shrink-0">
                      {stud.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white">
                          {stud.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            stud.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {stud.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          {stud.levelName || 'ND 1'}
                        </span>
                        {stud.emailVerified ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Verified Email
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-mono">{stud.email}</span> •{' '}
                        <span>{stud.school || 'College of Nursing Sciences'}</span>
                        {stud.gradYear && (
                          <span className="text-slate-500"> • Class of {stud.gradYear}</span>
                        )}
                        {stud.createdAt && (
                          <span className="text-slate-500 hidden md:inline">
                            {' '}
                            • Registered: {new Date(stud.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right text-xs text-slate-400">
                      <div>
                        <strong className="text-white">{stud.totalAttempts ?? 0}</strong> Tests
                      </div>
                      <div>
                        Avg: <strong className="text-teal-400">{stud.avgScore ?? 0}%</strong>
                      </div>
                    </div>

                    {user?.role === 'admin' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStudentStatus(stud.id, stud.status, stud.email)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            stud.status === 'active'
                              ? 'border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-900/60'
                              : 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60'
                          }`}
                          title={stud.status === 'active' ? 'Suspend student account' : 'Reactivate student account'}
                        >
                          {stud.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>

                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'student',
                              id: stud.id,
                              title: stud.name || 'Registered Student',
                              email: stud.email || '',
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-rose-800/40"
                          title="Permanently delete student account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {studentsList.filter((stud) => {
              if (studentFilterStatus !== 'all' && stud.status !== studentFilterStatus)
                return false;
              if (!studentSearchQuery.trim()) return true;
              const q = studentSearchQuery.toLowerCase();
              return (
                stud.name?.toLowerCase().includes(q) ||
                stud.email?.toLowerCase().includes(q) ||
                stud.school?.toLowerCase().includes(q)
              );
            }).length === 0 && (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-white text-xs">No student accounts found</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  {studentSearchQuery
                    ? `No registered students match "${studentSearchQuery}".`
                    : 'When new students register at the login screen, they will appear right here in real time.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 8. EXAM RESULTS MONITOR TAB ================= */}
      {activeTab === 'results' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-bold text-base text-white">Student Examination Results Log</h3>
            <p className="text-xs text-slate-400">
              Live audit of all submitted practice quizzes and timed CBT examinations
            </p>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-md divide-y divide-slate-800">
            {attemptsList.map((att) => (
              <div key={att.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs ${
                      att.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {att.score}%
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">{att.examTitle}</h4>
                    <p className="text-[11px] text-slate-400">
                      Student: <strong className="text-slate-200">{att.userName}</strong> (
                      {att.userEmail}) • {new Date(att.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        att.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {att.passed ? 'PASSED' : 'FAILED'}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {att.correctCount}/{att.totalQuestions} Correct
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: 'result',
                        id: att.id,
                        title: `${att.examTitle} (${att.userName})`,
                      })
                    }
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Examination Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 9. ANNOUNCEMENTS TAB ================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-bold text-base text-white">Student Announcements Center</h3>
            <p className="text-xs text-slate-400">
              Broadcast critical exam dates, clinical alerts, and curriculum updates to all students
            </p>
          </div>

          {/* New Broadcast Form */}
          <form
            onSubmit={handleCreateAnnouncement}
            className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md space-y-3"
          >
            <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400">
              New Student Broadcast
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. 📢 Final Year CBT Board Examination Schedule"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Nursing Class
                </label>
                <select
                  value={annTargetLevel}
                  onChange={(e) => setAnnTargetLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Broadcast to All Students</option>
                  {localLevels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name} Only
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
              <textarea
                rows={3}
                required
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Type your message to students here..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Send Broadcast
            </button>
          </form>

          {/* Active Announcements List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Active Broadcasts ({localAnnouncements.length})
            </h4>
            {localAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-md flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        ann.priority === 'urgent'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <h4 className="font-bold text-sm text-white">{ann.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300">{ann.content}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Posted on {new Date(ann.createdAt).toLocaleDateString()} by {ann.author}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setDeleteTarget({
                      type: 'announcement',
                      id: ann.id,
                      title: ann.title,
                    })
                  }
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl shrink-0 cursor-pointer transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 10. SETTINGS TAB ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-bold text-base text-white">Platform & Database Settings</h3>
            <p className="text-xs text-slate-400">
              System configurations, default scoring parameters, and seed data controls
            </p>
          </div>

          <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-white">Platform Identity</h4>
                <p className="text-xs text-slate-400">Active educational portal name</p>
              </div>
              <span className="text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-3 py-1 rounded-xl">
                NursesStudy
              </span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-white">Default Exam Passing Score</h4>
                <p className="text-xs text-slate-400">Standard percentage required to pass CBT tests</p>
              </div>
              <span className="text-xs font-bold text-slate-200">70% Pass Rate</span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-white">Student Self-Registration</h4>
                <p className="text-xs text-slate-400">
                  Allow new nursing students to create accounts directly
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-xl">
                Enabled
              </span>
            </div>

            {/* Firebase Cloud Firestore Details */}
            <div className="pt-2">
              <div className="p-4 bg-teal-950/20 border border-teal-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-200 font-bold text-xs">
                    <Cloud className="w-4 h-4 text-teal-400" />
                    <span>Google Cloud Firestore Live Integration</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Firebase Project ID</span>
                    <span className="font-mono text-slate-200 font-semibold">{FIREBASE_CONFIG.projectId}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Firestore Database ID</span>
                    <span className="font-mono text-slate-200 font-semibold truncate block" title={FIREBASE_CONFIG.firestoreDatabaseId}>
                      {FIREBASE_CONFIG.firestoreDatabaseId}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-teal-300/80 leading-relaxed">
                  Real-time synchronization ensures that when you publish a new study note or CBT examination, it is immediately visible to students studying online without needing to reload the page.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={cloudSyncing}
                    onClick={handlePushAllToFirestore}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncing ? 'animate-spin' : ''}`} />
                    <span>{cloudSyncing ? 'Synchronizing with Firestore...' : 'Push All Curriculum to Cloud Firestore'}</span>
                  </button>
                  {cloudStatus && (
                    <span className="text-xs text-teal-300 font-medium">{cloudStatus}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Database Reset Option */}
            <div className="pt-2">
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Restore Initial Realistic Clinical Seed Data</span>
                </div>
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  Resetting the database will repopulate all realistic clinical subjects (Pharmacology,
                  Med-Surg, Maternal, etc.), high-yield NCLEX questions, and sample CBT mock exams.
                  Use this if you wish to restore the clean starting data set.
                </p>
                <button
                  onClick={handleResetData}
                  className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Database to Seed State</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= UNIFIED CONFIRM DELETE MODAL ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 text-white animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-dialog-title"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 id="confirm-delete-dialog-title" className="text-base font-bold text-white">
                  Confirm Delete
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Are you sure you want to delete this item? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Target Item Details Preview */}
            {(deleteTarget.title || deleteTarget.email) && (
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                  {deleteTarget.type.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {deleteTarget.type === 'student'
                      ? 'Student Account'
                      : deleteTarget.type === 'exam'
                      ? 'CBT Exam'
                      : deleteTarget.type === 'question'
                      ? 'MCQ Question'
                      : deleteTarget.type === 'note'
                      ? 'Study Note'
                      : deleteTarget.type === 'subject'
                      ? 'Curriculum Subject'
                      : deleteTarget.type === 'level'
                      ? 'Academic Level'
                      : deleteTarget.type === 'announcement'
                      ? 'Student Broadcast'
                      : deleteTarget.type === 'result'
                      ? 'Exam Result'
                      : deleteTarget.type}
                  </span>
                  {deleteTarget.title && (
                    <p className="text-xs font-semibold text-white truncate">{deleteTarget.title}</p>
                  )}
                  {deleteTarget.email && (
                    <p className="text-[11px] text-slate-400 font-mono truncate">{deleteTarget.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons: Cancel and Delete */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="confirm-delete-cancel-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl transition-colors shadow-lg shadow-rose-950/40 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
