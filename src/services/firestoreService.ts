import {
  db,
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
export async function seedFirestoreIfEmpty(initialData: {
  levels: NursingLevel[];
  subjects: Subject[];
  notes: StudyNote[];
  questions: Question[];
  exams: CBTExam[];
  announcements: Announcement[];
}): Promise<boolean> {
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
  } catch (err) {
    console.error('[Firestore] Seeding error:', err);
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
  try {
    const q = query(collection(db, COLLECTIONS.USERS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: User[] = [];
        snapshot.forEach((d) => items.push({ ...(d.data() as User), id: d.id }));
        callback(items);
      },
      (error) => {
        console.warn('Firestore users listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not attach users listener:', err);
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
export async function saveUserToFirestore(user: User): Promise<boolean> {
  try {
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

export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return { ...(snap.data() as User), id: snap.id };
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
  const isAdminEmail = cleanEmail === 'chigaemezuaugustine43@gmail.com';

  try {
    const existing = await getUserFromFirestore(uid);
    if (existing) {
      return existing;
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
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId)).catch((err) => {
        console.warn('[Firestore] Error deleting user by doc id:', err);
      });
    }
    if (email) {
      try {
        const q = query(
          collection(db, COLLECTIONS.USERS),
          where('email', '==', email.toLowerCase().trim())
        );
        const snap = await getDocs(q);
        for (const userDoc of snap.docs) {
          await deleteDoc(userDoc.ref).catch(() => {});
        }
      } catch (qErr) {
        console.warn('[Firestore] Error deleting user by email query:', qErr);
      }
    }
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to delete user record:', err);
    return false;
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
