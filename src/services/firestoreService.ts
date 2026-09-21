import {
  db,
  auth,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  writeBatch,
  FIREBASE_CONFIG,
} from '../firebase';

export { FIREBASE_CONFIG };
import {
  NursingLevel,
  Subject,
  StudyNote,
  Question,
  CBTExam,
  ExamAttempt,
  Announcement,
  Bookmark,
  User,
  AuditLog,
  ContentStatus,
} from '../types';

export const COLLECTIONS = {
  LEVELS: 'levels',
  SUBJECTS: 'subjects',
  NOTES: 'notes',
  QUESTIONS: 'questions',
  EXAMS: 'exams',
  ATTEMPTS: 'attempts',
  ANNOUNCEMENTS: 'announcements',
  BOOKMARKS: 'bookmarks',
  USERS: 'users',
  SETTINGS: 'settings',
  AUDIT_LOGS: 'audit_logs',
};

// ==================== CONNECTION TEST ==================== //
export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  projectId: string;
  databaseId?: string;
  error?: string;
}> {
  try {
    const levelsCol = collection(db, COLLECTIONS.LEVELS);
    await getDocs(levelsCol);
    return {
      connected: true,
      projectId: FIREBASE_CONFIG.projectId,
      databaseId: FIREBASE_CONFIG.firestoreDatabaseId,
    };
  } catch (err: any) {
    console.warn('Firestore connection check notice:', err);
    return {
      connected: false,
      projectId: FIREBASE_CONFIG.projectId,
      error: err.message || 'Unable to connect to Cloud Firestore',
    };
  }
}

// ==================== AUDIT LOGS ==================== //
export async function recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullLog: AuditLog = {
      ...log,
      id: logId,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, COLLECTIONS.AUDIT_LOGS, logId), fullLog);
  } catch (err) {
    console.warn('[Firestore] Failed to record audit log:', err);
  }
}

export function subscribeToAuditLogs(
  callback: (logs: AuditLog[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(
      collection(db, COLLECTIONS.AUDIT_LOGS),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const items: AuditLog[] = [];
        snapshot.forEach((d) => items.push({ ...(d.data() as AuditLog), id: d.id }));
        callback(items);
      },
      (err) => {
        console.warn('Firestore audit logs listener notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Could not attach audit logs listener:', err);
    return () => {};
  }
}

// ==================== SEEDING ==================== //
export async function seedFirestoreIfEmpty(
  initialData: {
    levels: NursingLevel[];
    subjects: Subject[];
    notes: StudyNote[];
    questions: Question[];
    exams: CBTExam[];
    announcements: Announcement[];
  },
  currentUser?: { role?: string; email?: string } | null
): Promise<boolean> {
  const currentAuthUser = auth.currentUser;
  const isUserAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase().trim() === 'chigaemezuaugustine43@gmail.com' ||
    currentUser?.email?.toLowerCase().trim() === 'tiktokyhung@gmail.com' ||
    currentAuthUser?.email?.toLowerCase().trim() === 'chigaemezuaugustine43@gmail.com' ||
    currentAuthUser?.email?.toLowerCase().trim() === 'tiktokyhung@gmail.com';

  // Do not attempt to write to Firestore if no admin is authenticated
  if (!currentAuthUser || !isUserAdmin) {
    return false;
  }

  try {
    const levelsRef = collection(db, COLLECTIONS.LEVELS);
    const existingSnap = await getDocs(levelsRef);

    if (!existingSnap.empty) {
      console.log(`[Firestore] Found ${existingSnap.size} existing academic levels. No seed required.`);
      return false;
    }

    console.log('[Firestore] Database is empty. Seeding initial nursing curriculum to Cloud Firestore...');

    for (const lvl of initialData.levels) {
      await setDoc(doc(db, COLLECTIONS.LEVELS, lvl.id), lvl);
    }
    for (const subj of initialData.subjects) {
      await setDoc(doc(db, COLLECTIONS.SUBJECTS, subj.id), {
        ...subj,
        status: subj.status || (subj.isPublished ? 'published' : 'draft'),
      });
    }
    for (const note of initialData.notes) {
      await setDoc(doc(db, COLLECTIONS.NOTES, note.id), {
        ...note,
        status: note.status || (note.isPublished ? 'published' : 'draft'),
      });
    }
    for (const q of initialData.questions) {
      await setDoc(doc(db, COLLECTIONS.QUESTIONS, String(q.id)), {
        ...q,
        status: q.status || 'published',
      });
    }
    for (const ex of initialData.exams) {
      await setDoc(doc(db, COLLECTIONS.EXAMS, ex.id), {
        ...ex,
        status: ex.status || (ex.isPublished ? 'published' : 'draft'),
      });
    }
    for (const ann of initialData.announcements) {
      await setDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id), ann);
    }

    console.log('[Firestore] Successfully seeded initial curriculum to Cloud Firestore!');
    return true;
  } catch (err: any) {
    console.warn('[Firestore] Seeding notice (requires admin privileges):', err?.message || err);
    return false;
  }
}

// ==================== REAL-TIME SUBSCRIPTIONS ==================== //

// Academic Levels
export function subscribeToLevels(
  callback: (levels: NursingLevel[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.LEVELS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: NursingLevel[] = [];
        snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as NursingLevel), id: docSnap.id }));
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        callback(items);
      },
      (error) => {
        console.warn('Firestore levels listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach levels listener:', err);
    return () => {};
  }
}

// Subjects
export function subscribeToSubjects(
  callback: (subjects: Subject[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.SUBJECTS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Subject[] = [];
        snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as Subject), id: docSnap.id }));
        items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        callback(items);
      },
      (error) => {
        console.warn('Firestore subjects listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach subjects listener:', err);
    return () => {};
  }
}

// Study Notes
// If publishedOnly is true (Student view): returns only published notes.
// If publishedOnly is false (Admin view): returns all notes (draft, published, archived).
export function subscribeToNotes(
  callback: (notes: StudyNote[]) => void,
  options: { publishedOnly?: boolean } = {},
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.NOTES));
    return onSnapshot(
      q,
      (snapshot) => {
        let items: StudyNote[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as StudyNote;
          items.push({ ...data, id: docSnap.id });
        });

        if (options.publishedOnly) {
          // Strictly published notes only
          items = items.filter((n) => {
            const isPub = n.status ? n.status === 'published' : n.isPublished === true;
            return isPub && n.status !== 'archived' && n.status !== 'draft';
          });
        }

        callback(items);
      },
      (error) => {
        console.warn('Firestore notes listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach notes listener:', err);
    return () => {};
  }
}

// CBT Questions Bank
export function subscribeToQuestions(
  callback: (questions: Question[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.QUESTIONS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Question[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Question;
          items.push({ ...data, id: docSnap.id });
        });
        callback(items);
      },
      (error) => {
        console.warn('Firestore questions listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach questions listener:', err);
    return () => {};
  }
}

// CBT Exams
// If publishedOnly is true: returns only published exams.
// If publishedOnly is false: returns all exams (draft, published, archived).
export function subscribeToExams(
  callback: (exams: CBTExam[]) => void,
  options: { publishedOnly?: boolean } = {},
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.EXAMS));
    return onSnapshot(
      q,
      (snapshot) => {
        let items: CBTExam[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CBTExam;
          items.push({ ...data, id: docSnap.id });
        });

        if (options.publishedOnly) {
          items = items.filter((e) => {
            const isPub = e.status ? e.status === 'published' : e.isPublished === true;
            return isPub && e.status !== 'archived' && e.status !== 'draft';
          });
        }

        callback(items);
      },
      (error) => {
        console.warn('Firestore exams listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach exams listener:', err);
    return () => {};
  }
}

// Announcements
export function subscribeToAnnouncements(
  callback: (announcements: Announcement[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.ANNOUNCEMENTS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Announcement[] = [];
        snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as Announcement), id: docSnap.id }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('Firestore announcements listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach announcements listener:', err);
    return () => {};
  }
}

// Student Attempts for specific user (PROTECTED & FILTERED)
export function subscribeToUserAttempts(
  userId: string,
  callback: (attempts: ExamAttempt[]) => void,
  onError?: (err: any) => void
) {
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(collection(db, COLLECTIONS.ATTEMPTS), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ExamAttempt[] = [];
        snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as ExamAttempt), id: docSnap.id }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('Firestore user attempts listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach user attempts listener:', err);
    return () => {};
  }
}

// All Attempts (for Admin dashboard & analytics)
export function subscribeToAllAttempts(
  callback: (attempts: ExamAttempt[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, COLLECTIONS.ATTEMPTS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ExamAttempt[] = [];
        snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as ExamAttempt), id: docSnap.id }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('Firestore all attempts listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach all attempts listener:', err);
    return () => {};
  }
}

// Student Bookmarks (Private to user)
export function subscribeToUserBookmarks(
  userId: string,
  callback: (bookmarks: Bookmark[]) => void,
  onError?: (err: any) => void
) {
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(collection(db, COLLECTIONS.BOOKMARKS), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Bookmark[] = [];
        snapshot.forEach((docSnap) => items.push({ ...(docSnap.data() as Bookmark), id: docSnap.id }));
        callback(items);
      },
      (error) => {
        console.warn('Firestore bookmarks listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach bookmarks listener:', err);
    return () => {};
  }
}

// Registered Students / Users
export function subscribeToUsers(
  callback: (users: User[]) => void,
  onError?: (err: any) => void
) {
  return subscribeToStudents(callback, onError);
}

/**
 * Real-time listener for the Authoritative Students Directory in Firestore.
 * Subscribes to the `students` collection and reconciles with `users` collection.
 * Ensures every registered student appears immediately without page reload.
 */
export function subscribeToStudents(
  callback: (students: User[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    // Primary subscription to students/{uid} collection
    const studentsCol = collection(db, 'students');
    const unsubStudents = onSnapshot(
      studentsCol,
      (snapshot) => {
        const studentMap = new Map<string, User>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const uid = data.uid || data.id || docSnap.id;
          const studentProfile: User = {
            id: uid,
            name: data.fullName || data.name || (data.email ? data.email.split('@')[0] : 'Nursing Student'),
            email: data.email || '',
            role: 'student',
            levelId: data.levelId || data.nursingLevel || 'lvl-nd1',
            status: data.status || 'active',
            school: data.school || 'College of Nursing Sciences',
            gradYear: data.gradYear || '2027',
            createdAt: data.createdAt || new Date().toISOString(),
          };
          (studentProfile as any).emailVerified = Boolean(data.emailVerified);
          studentMap.set(uid, studentProfile);
        });

        // Also cross-fetch / merge from users collection to reconcile any students that might only exist there
        getDocs(collection(db, COLLECTIONS.USERS))
          .then((usersSnap) => {
            usersSnap.forEach((userDoc) => {
              const uData = userDoc.data() as User;
              if (uData.role === 'student' || (!uData.role && uData.levelId)) {
                const uid = uData.id || userDoc.id;
                if (!studentMap.has(uid)) {
                  const reconciledProfile: User = {
                    id: uid,
                    name: uData.name || (uData.email ? uData.email.split('@')[0] : 'Nursing Student'),
                    email: uData.email || '',
                    role: 'student',
                    levelId: uData.levelId || 'lvl-nd1',
                    status: uData.status || 'active',
                    school: uData.school || 'College of Nursing Sciences',
                    gradYear: uData.gradYear || '2027',
                    createdAt: uData.createdAt || new Date().toISOString(),
                  };
                  (reconciledProfile as any).emailVerified = Boolean((uData as any).emailVerified);
                  studentMap.set(uid, reconciledProfile);

                  // Asynchronously reconcile missing students/{uid} document in Firestore
                  setDoc(
                    doc(db, 'students', uid),
                    {
                      id: uid,
                      uid: uid,
                      fullName: reconciledProfile.name,
                      name: reconciledProfile.name,
                      email: reconciledProfile.email,
                      role: 'student',
                      nursingLevel: reconciledProfile.levelId,
                      levelId: reconciledProfile.levelId,
                      school: reconciledProfile.school,
                      gradYear: reconciledProfile.gradYear,
                      status: reconciledProfile.status,
                      createdAt: reconciledProfile.createdAt,
                      updatedAt: new Date().toISOString(),
                      emailVerified: Boolean((reconciledProfile as any).emailVerified),
                    },
                    { merge: true }
                  ).catch(() => {});
                }
              }
            });

            const sortedStudents = Array.from(studentMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            callback(sortedStudents);
          })
          .catch((uErr) => {
            console.warn('[Firestore] users cross-reconciliation notice:', uErr);
            const sortedStudents = Array.from(studentMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            callback(sortedStudents);
          });
      },
      (error) => {
        console.warn('[Firestore] students collection listener notice:', error);
        if (onError) onError(error);
      }
    );

    return () => {
      unsubStudents();
    };
  } catch (err) {
    console.warn('[Firestore] Could not attach students listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

// ==================== AUTHORITATIVE FIRESTORE WRITE OPERATIONS ==================== //

// Admin User info type for audit logging
export interface AdminActor {
  uid: string;
  email: string;
  name?: string;
}

// Study Notes CRUD
export async function saveNoteToFirestore(
  note: StudyNote,
  adminUser?: AdminActor,
  previousStatus?: ContentStatus | string
): Promise<void> {
  const status: ContentStatus = note.status || (note.isPublished ? 'published' : 'draft');
  const now = new Date().toISOString();
  const notePayload: StudyNote = {
    ...note,
    status,
    isPublished: status === 'published',
    updatedAt: now,
    updatedBy: adminUser?.email || note.updatedBy,
    publishedAt: status === 'published' ? (note.publishedAt || now) : undefined,
  };

  await setDoc(doc(db, COLLECTIONS.NOTES, note.id), notePayload, { merge: true });

  if (adminUser) {
    let action = 'UPDATE_NOTE';
    if (!previousStatus) {
      action = 'CREATE_NOTE';
    } else if (previousStatus !== status) {
      action = status === 'published' ? 'PUBLISH_NOTE' : status === 'archived' ? 'ARCHIVE_NOTE' : 'UNPUBLISH_NOTE';
    }

    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action,
      targetType: 'note',
      targetId: note.id,
      targetTitle: note.title,
      previousStatus,
      newStatus: status,
    });
  }
}

export async function updateNoteStatus(
  noteId: string,
  newStatus: ContentStatus,
  adminUser?: AdminActor,
  previousStatus?: ContentStatus | string,
  noteTitle?: string
): Promise<void> {
  const now = new Date().toISOString();
  await updateDoc(doc(db, COLLECTIONS.NOTES, noteId), {
    status: newStatus,
    isPublished: newStatus === 'published',
    updatedAt: now,
    updatedBy: adminUser?.email,
    ...(newStatus === 'published' ? { publishedAt: now } : {}),
  });

  if (adminUser) {
    const action = newStatus === 'published' ? 'PUBLISH_NOTE' : newStatus === 'archived' ? 'ARCHIVE_NOTE' : 'UNPUBLISH_NOTE';
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action,
      targetType: 'note',
      targetId: noteId,
      targetTitle: noteTitle,
      previousStatus,
      newStatus,
    });
  }
}

export async function deleteNoteFromFirestore(
  noteId: string,
  adminUser?: AdminActor,
  noteTitle?: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.NOTES, noteId));

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'DELETE_NOTE',
      targetType: 'note',
      targetId: noteId,
      targetTitle: noteTitle,
      newStatus: 'deleted',
    });
  }
}

// CBT Examinations CRUD
// CRUCIAL: Deleting an exam NEVER deletes student attempts in attempts collection!
export async function saveExamToFirestore(
  exam: CBTExam,
  adminUser?: AdminActor,
  previousStatus?: ContentStatus | string
): Promise<void> {
  const status: ContentStatus = exam.status || (exam.isPublished ? 'published' : 'draft');
  const now = new Date().toISOString();
  const examPayload: CBTExam = {
    ...exam,
    status,
    isPublished: status === 'published',
    updatedAt: now,
    updatedBy: adminUser?.email || exam.updatedBy,
    publishedAt: status === 'published' ? (exam.publishedAt || now) : undefined,
  };

  await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), examPayload, { merge: true });

  if (adminUser) {
    let action = 'UPDATE_EXAM';
    if (!previousStatus) {
      action = 'CREATE_EXAM';
    } else if (previousStatus !== status) {
      action = status === 'published' ? 'PUBLISH_EXAM' : status === 'archived' ? 'ARCHIVE_EXAM' : 'UNPUBLISH_EXAM';
    }

    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action,
      targetType: 'exam',
      targetId: exam.id,
      targetTitle: exam.title,
      previousStatus,
      newStatus: status,
    });
  }
}

export async function updateExamStatus(
  examId: string,
  newStatus: ContentStatus,
  adminUser?: AdminActor,
  previousStatus?: ContentStatus | string,
  examTitle?: string
): Promise<void> {
  const now = new Date().toISOString();
  await updateDoc(doc(db, COLLECTIONS.EXAMS, examId), {
    status: newStatus,
    isPublished: newStatus === 'published',
    updatedAt: now,
    updatedBy: adminUser?.email,
    ...(newStatus === 'published' ? { publishedAt: now } : {}),
  });

  if (adminUser) {
    const action = newStatus === 'published' ? 'PUBLISH_EXAM' : newStatus === 'archived' ? 'ARCHIVE_EXAM' : 'UNPUBLISH_EXAM';
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action,
      targetType: 'exam',
      targetId: examId,
      targetTitle: examTitle,
      previousStatus,
      newStatus,
    });
  }
}

export async function deleteExamFromFirestore(
  examId: string,
  adminUser?: AdminActor,
  examTitle?: string
): Promise<void> {
  // Only deletes the exam curriculum entity.
  // Student attempts (attempts collection) are INDEPENDENT and permanently preserved!
  await deleteDoc(doc(db, COLLECTIONS.EXAMS, examId));

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'DELETE_EXAM',
      targetType: 'exam',
      targetId: examId,
      targetTitle: examTitle,
      newStatus: 'deleted',
      details: { note: 'Historical student exam attempts preserved intact' },
    });
  }
}

// Question Bank CRUD
export async function saveQuestionToFirestore(
  q: Question,
  adminUser?: AdminActor,
  isNew: boolean = false
): Promise<void> {
  const now = new Date().toISOString();
  const payload: Question = {
    ...q,
    status: q.status || 'published',
    isPublished: q.status === 'published' || q.isPublished !== false,
    updatedAt: now,
    updatedBy: adminUser?.email || q.updatedBy,
  };

  await setDoc(doc(db, COLLECTIONS.QUESTIONS, String(q.id)), payload, { merge: true });

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: isNew ? 'CREATE_QUESTION' : 'UPDATE_QUESTION',
      targetType: 'question',
      targetId: String(q.id),
      targetTitle: q.questionText || q.question || 'Clinical Question',
      newStatus: payload.status,
    });
  }
}

export async function deleteQuestionFromFirestore(
  qId: string | number,
  adminUser?: AdminActor,
  questionText?: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.QUESTIONS, String(qId)));

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'DELETE_QUESTION',
      targetType: 'question',
      targetId: String(qId),
      targetTitle: questionText || 'Clinical Question',
      newStatus: 'deleted',
    });
  }
}

// Subjects CRUD
export async function saveSubjectToFirestore(
  subj: Subject,
  adminUser?: AdminActor,
  isNew: boolean = false
): Promise<void> {
  const now = new Date().toISOString();
  const payload = {
    ...subj,
    updatedAt: now,
    updatedBy: adminUser?.email || subj.updatedBy,
  };
  await setDoc(doc(db, COLLECTIONS.SUBJECTS, subj.id), payload, { merge: true });

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: isNew ? 'CREATE_SUBJECT' : 'UPDATE_SUBJECT',
      targetType: 'subject',
      targetId: subj.id,
      targetTitle: subj.name,
    });
  }
}

export async function deleteSubjectFromFirestore(
  subjId: string,
  adminUser?: AdminActor,
  subjName?: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.SUBJECTS, subjId));

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'DELETE_SUBJECT',
      targetType: 'subject',
      targetId: subjId,
      targetTitle: subjName,
      newStatus: 'deleted',
    });
  }
}

// Academic Levels CRUD
export async function saveLevelToFirestore(
  level: NursingLevel,
  adminUser?: AdminActor,
  isNew: boolean = false
): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.LEVELS, level.id), level, { merge: true });

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: isNew ? 'CREATE_LEVEL' : 'UPDATE_LEVEL',
      targetType: 'level',
      targetId: level.id,
      targetTitle: level.name,
    });
  }
}

export async function deleteLevelFromFirestore(
  levelId: string,
  adminUser?: AdminActor,
  levelName?: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.LEVELS, levelId));

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'DELETE_LEVEL',
      targetType: 'level',
      targetId: levelId,
      targetTitle: levelName,
      newStatus: 'deleted',
    });
  }
}

// Announcements CRUD
export async function saveAnnouncementToFirestore(
  ann: Announcement,
  adminUser?: AdminActor
): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id), ann, { merge: true });

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'CREATE_ANNOUNCEMENT',
      targetType: 'announcement',
      targetId: ann.id,
      targetTitle: ann.title,
    });
  }
}

export async function deleteAnnouncementFromFirestore(
  annId: string,
  adminUser?: AdminActor,
  annTitle?: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, annId));

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'DELETE_ANNOUNCEMENT',
      targetType: 'announcement',
      targetId: annId,
      targetTitle: annTitle,
      newStatus: 'deleted',
    });
  }
}

// Student Exam Attempts (PROTECTED & IMMUTABLE)
export async function saveAttemptToFirestore(attempt: ExamAttempt): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.ATTEMPTS, attempt.id), attempt);

    // Also store score result under student's private results subcollection (students/{uid}/results/{resultId})
    if (attempt.userId) {
      const percentage =
        attempt.totalQuestions > 0
          ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
          : 0;

      const answeredCount = Array.isArray(attempt.answers)
        ? attempt.answers.filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length
        : attempt.correctCount;
      const unansweredCount = Math.max(0, attempt.totalQuestions - answeredCount);

      await setDoc(
        doc(db, 'students', attempt.userId, 'results', attempt.id),
        {
          uid: attempt.userId,
          resultId: attempt.id,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          answeredQuestions: answeredCount,
          unansweredQuestions: unansweredCount,
          percentage,
          subject: attempt.subjectName || 'Nursing Assessment',
          examTitle: attempt.examTitle,
          examId: attempt.examId,
          date: attempt.createdAt || new Date().toISOString(),
          duration: attempt.timeSpentSeconds,
          correctAnswers: attempt.correctCount,
          wrongAnswers: Math.max(0, attempt.totalQuestions - attempt.correctCount),
          passed: attempt.passed,
          type: attempt.type,
          submissionReason: attempt.submissionReason || 'manual',
          timeExpired: attempt.submissionReason === 'timeout',
          submittedAt: attempt.createdAt || new Date().toISOString(),
          createdAt: attempt.createdAt || new Date().toISOString(),
        }
      ).catch((err) => {
        console.warn('[Firestore] Notice saving to student results subcollection:', err);
      });
    }
  } catch (err) {
    console.warn('[Firestore] Failed to save attempt to cloud:', err);
    throw err;
  }
}

export async function deleteAttemptFromFirestore(
  attemptId: string,
  adminUser?: AdminActor
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ATTEMPTS, attemptId));

  if (adminUser) {
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'DELETE_ATTEMPT',
      targetType: 'attempt',
      targetId: attemptId,
      newStatus: 'deleted',
    });
  }
}

// Student Bookmarks
export async function toggleBookmarkInFirestore(
  userId: string,
  type: 'note' | 'question',
  itemId: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, COLLECTIONS.BOOKMARKS),
      where('userId', '==', userId),
      where('type', '==', type),
      where('itemId', '==', itemId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Remove existing bookmark
      for (const docSnap of snap.docs) {
        await deleteDoc(docSnap.ref);
      }
      return false; // unbookmarked
    } else {
      // Add bookmark
      const bId = `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, COLLECTIONS.BOOKMARKS, bId), {
        id: bId,
        userId,
        type,
        itemId,
        createdAt: new Date().toISOString(),
      });
      return true; // bookmarked
    }
  } catch (err) {
    console.warn('[Firestore] Failed to toggle bookmark:', err);
    return false;
  }
}

// User & Student Profile Operations
// User & Student Profile Operations

/**
 * Authoritative save function for Student Profiles.
 * Saves strictly to `students/{uid}` and `users/{uid}` using UID as document ID.
 * Never stores passwords or sensitive security credentials.
 */
export async function saveStudentProfileToFirestore(student: User): Promise<boolean> {
  const uid = student.id;
  if (!uid) {
    console.error('[Firestore] Cannot save student profile: missing UID');
    return false;
  }

  const cleanEmail = (student.email || '').toLowerCase().trim();
  const cleanName = (student.name || '').trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Nursing Student');
  const level = student.levelId || 'lvl-nd1';
  const school = (student.school || '').trim() || 'College of Nursing Sciences';
  const gradYear = (student.gradYear || '').trim() || '2027';
  const status = student.status || 'active';
  const createdAt = student.createdAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const emailVerified = Boolean((student as any).emailVerified);

  const studentDoc = {
    id: uid,
    uid: uid,
    name: cleanName,
    fullName: cleanName,
    email: cleanEmail,
    role: 'student' as const,
    levelId: level,
    nursingLevel: level,
    school,
    gradYear,
    status,
    createdAt,
    updatedAt,
    emailVerified,
  };

  try {
    // 1. Primary write to authoritative students/{uid} document
    await setDoc(doc(db, 'students', uid), studentDoc, { merge: true });

    // 2. Synchronize to users/{uid} for general authentication profile compatibility
    await setDoc(doc(db, COLLECTIONS.USERS, uid), studentDoc, { merge: true });

    console.info(`[Firestore] Student profile successfully saved to students/${uid} and users/${uid}`);
    return true;
  } catch (err: any) {
    console.error(`[Firestore] Error saving student profile for UID ${uid}:`, err);
    return false;
  }
}

export async function saveUserToFirestore(user: User): Promise<boolean> {
  try {
    if (user.role === 'student' || !user.role) {
      return await saveStudentProfileToFirestore(user);
    }

    const { ...userDoc } = user as any;
    delete userDoc.password;
    delete userDoc.passwordResetToken;
    delete userDoc.passwordResetExpires;
    await setDoc(
      doc(db, COLLECTIONS.USERS, user.id),
      {
        ...userDoc,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to save user record:', err);
    return false;
  }
}

export async function updateEmailVerificationInFirestore(
  userId: string,
  emailVerified: boolean
): Promise<void> {
  try {
    await setDoc(
      doc(db, COLLECTIONS.USERS, userId),
      { emailVerified, updatedAt: new Date().toISOString() },
      { merge: true }
    ).catch(() => {});

    await setDoc(
      doc(db, 'students', userId),
      { emailVerified, updatedAt: new Date().toISOString() },
      { merge: true }
    ).catch(() => {});
  } catch (err) {
    console.warn('[Firestore] Failed to update email verification status:', err);
  }
}

export async function updateStudentStatusInFirestore(
  studentId: string,
  status: 'active' | 'suspended',
  levelId?: string
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (levelId) {
      updatePayload.levelId = levelId;
      updatePayload.nursingLevel = levelId;
    }

    await setDoc(doc(db, 'students', studentId), updatePayload, { merge: true }).catch(() => {});
    await setDoc(doc(db, COLLECTIONS.USERS, studentId), updatePayload, { merge: true }).catch(() => {});
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to update student status:', err);
    return false;
  }
}

export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return { ...(snap.data() as User), id: snap.id };
    }

    const studentDocRef = doc(db, 'students', userId);
    const sSnap = await getDoc(studentDocRef);
    if (sSnap.exists()) {
      const sData = sSnap.data();
      return {
        id: sSnap.id,
        name: sData.fullName || sData.name || 'Nursing Student',
        email: sData.email || '',
        role: 'student',
        levelId: sData.levelId || sData.nursingLevel || 'lvl-nd1',
        status: sData.status || 'active',
        school: sData.school || 'College of Nursing Sciences',
        gradYear: sData.gradYear || '2027',
        createdAt: sData.createdAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Failed to get user by id:', err);
    return null;
  }
}

export async function getOrCreateUserProfile(fbUser: {
  uid: string;
  email: string | null;
  displayName?: string | null;
}): Promise<User> {
  const uid = fbUser.uid;
  const cleanEmail = (fbUser.email || '').toLowerCase().trim();
  const isAdminEmail = cleanEmail === 'chigaemezuaugustine43@gmail.com' || cleanEmail === 'tiktokyhung@gmail.com';

  try {
    const existing = await getUserFromFirestore(uid);
    if (existing) {
      // Reconcile students/{uid} if missing
      if (existing.role === 'student') {
        saveStudentProfileToFirestore(existing).catch(() => {});
      }
      return existing;
    }

    const studentSnap = await getDoc(doc(db, 'students', uid)).catch(() => null);
    if (studentSnap && studentSnap.exists()) {
      const sData = studentSnap.data();
      const studentProfile: User = {
        id: uid,
        name: sData.fullName || sData.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Nursing Student'),
        email: cleanEmail,
        role: 'student',
        levelId: sData.nursingLevel || sData.levelId || 'lvl-nd1',
        status: sData.status || 'active',
        school: sData.school || 'College of Nursing Sciences',
        gradYear: sData.gradYear || '2027',
        createdAt: sData.createdAt || new Date().toISOString(),
      };
      await saveStudentProfileToFirestore(studentProfile).catch(() => {});
      return studentProfile;
    }
  } catch (err) {
    console.warn('[Firestore] Profile lookup error:', err);
  }

  if (cleanEmail) {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('email', '==', cleanEmail)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const found = snap.docs[0].data() as User;
        const profile: User = {
          ...found,
          id: uid,
        };
        await saveUserToFirestore(profile).catch(() => {});
        return profile;
      }
    } catch (qErr) {
      console.warn('[Firestore] Profile lookup by email error:', qErr);
    }
  }

  const defaultProfile: User = {
    id: uid,
    name: fbUser.displayName?.trim() || cleanEmail.split('@')[0] || 'Nursing Student',
    email: cleanEmail,
    role: isAdminEmail ? 'admin' : 'student',
    levelId: 'lvl-nd1',
    status: 'active',
    school: 'College of Nursing Sciences',
    gradYear: '2027',
    createdAt: new Date().toISOString(),
  };

  await saveUserToFirestore(defaultProfile).catch((err) => {
    console.warn('[Firestore] Auto-save profile notice:', err);
  });

  return defaultProfile;
}

export async function deleteUserFromFirestore(userId: string, email?: string): Promise<boolean> {
  try {
    if (userId) {
      // Delete from both users and students collections
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId)).catch((err) => {
        console.warn('[Firestore] Error deleting user doc:', err);
      });
      await deleteDoc(doc(db, 'students', userId)).catch((err) => {
        console.warn('[Firestore] Error deleting student doc:', err);
      });
    }

    if (email) {
      const targetEmail = email.toLowerCase().trim();
      try {
        const qUsers = query(
          collection(db, COLLECTIONS.USERS),
          where('email', '==', targetEmail)
        );
        const snapUsers = await getDocs(qUsers);
        for (const userDoc of snapUsers.docs) {
          await deleteDoc(userDoc.ref).catch(() => {});
        }
      } catch (qErr) {
        console.warn('[Firestore] Error deleting user by email query:', qErr);
      }

      try {
        const qStudents = query(
          collection(db, 'students'),
          where('email', '==', targetEmail)
        );
        const snapStudents = await getDocs(qStudents);
        for (const sDoc of snapStudents.docs) {
          await deleteDoc(sDoc.ref).catch(() => {});
        }
      } catch (sErr) {
        console.warn('[Firestore] Error deleting student by email query:', sErr);
      }
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to delete user record:', err);
    return false;
  }
}

export async function getStudentsFromFirestore(): Promise<User[]> {
  try {
    const studentMap = new Map<string, User>();

    // 1. Fetch from students collection
    const snapStudents = await getDocs(collection(db, 'students')).catch((err) => {
      console.warn('[Firestore] Failed to query students collection:', err);
      return null;
    });

    if (snapStudents) {
      snapStudents.forEach((d) => {
        const data = d.data();
        const uid = data.uid || data.id || d.id;
        const studentProfile: User = {
          id: uid,
          name: data.fullName || data.name || (data.email ? data.email.split('@')[0] : 'Nursing Student'),
          email: data.email || '',
          role: 'student',
          levelId: data.levelId || data.nursingLevel || 'lvl-nd1',
          status: data.status || 'active',
          school: data.school || 'College of Nursing Sciences',
          gradYear: data.gradYear || '2027',
          createdAt: data.createdAt || new Date().toISOString(),
        };
        (studentProfile as any).emailVerified = Boolean(data.emailVerified);
        studentMap.set(uid, studentProfile);
      });
    }

    // 2. Fetch and reconcile with users collection
    const snapUsers = await getDocs(collection(db, COLLECTIONS.USERS)).catch((err) => {
      console.warn('[Firestore] Failed to query users collection for reconciliation:', err);
      return null;
    });

    if (snapUsers) {
      snapUsers.forEach((d) => {
        const data = d.data() as User;
        if (data.role === 'student' || (!data.role && data.levelId)) {
          const uid = data.id || d.id;
          if (!studentMap.has(uid)) {
            const profile: User = {
              id: uid,
              name: data.name || (data.email ? data.email.split('@')[0] : 'Nursing Student'),
              email: data.email || '',
              role: 'student',
              levelId: data.levelId || 'lvl-nd1',
              status: data.status || 'active',
              school: data.school || 'College of Nursing Sciences',
              gradYear: data.gradYear || '2027',
              createdAt: data.createdAt || new Date().toISOString(),
            };
            (profile as any).emailVerified = Boolean((data as any).emailVerified);
            studentMap.set(uid, profile);

            // Save missing profile to students/{uid}
            saveStudentProfileToFirestore(profile).catch(() => {});
          }
        }
      });
    }

    return Array.from(studentMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (err) {
    console.warn('[Firestore] Failed to get students from Firestore:', err);
    return [];
  }
}

export async function getUsersFromFirestore(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    const users: User[] = [];
    snap.forEach((d) => {
      users.push({ ...(d.data() as User), id: d.id });
    });
    return users;
  } catch (err) {
    console.warn('[Firestore] Failed to get users list:', err);
    return [];
  }
}
