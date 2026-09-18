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
  User,
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
};

// Check if Firebase Firestore is connected and initialized
export async function testFirestoreConnection(): Promise<{
  connected: boolean;
  projectId: string;
  databaseId?: string;
  error?: string;
}> {
  try {
    const levelsCol = collection(db, COLLECTIONS.LEVELS);
    const snap = await getDocs(levelsCol);
    return {
      connected: true,
      projectId: FIREBASE_CONFIG.projectId,
      databaseId: FIREBASE_CONFIG.firestoreDatabaseId,
    };
  } catch (err: any) {
    console.warn('Firestore connection check failed:', err);
    return {
      connected: false,
      projectId: FIREBASE_CONFIG.projectId,
      error: err.message || 'Unable to connect to Cloud Firestore',
    };
  }
}

// Seed Initial Cloud Firestore Data from API if Firestore is empty
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

    // Batch seed levels
    for (const lvl of initialData.levels) {
      await setDoc(doc(db, COLLECTIONS.LEVELS, lvl.id), lvl);
    }

    // Batch seed subjects
    for (const subj of initialData.subjects) {
      await setDoc(doc(db, COLLECTIONS.SUBJECTS, subj.id), subj);
    }

    // Batch seed notes
    for (const note of initialData.notes) {
      await setDoc(doc(db, COLLECTIONS.NOTES, note.id), note);
    }

    // Batch seed questions
    for (const q of initialData.questions) {
      await setDoc(doc(db, COLLECTIONS.QUESTIONS, String(q.id)), q);
    }

    // Batch seed exams
    for (const ex of initialData.exams) {
      await setDoc(doc(db, COLLECTIONS.EXAMS, ex.id), ex);
    }

    // Batch seed announcements
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

// Real-time listener subscriptions
export function subscribeToLevels(callback: (levels: NursingLevel[]) => void) {
  try {
    const q = query(collection(db, COLLECTIONS.LEVELS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: NursingLevel[] = [];
        snapshot.forEach((doc) => items.push({ ...(doc.data() as NursingLevel), id: doc.id }));
        items.sort((a, b) => a.order - b.order);
        if (items.length > 0) callback(items);
      },
      (error) => {
        console.warn('Firestore levels listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('Could not attach levels listener:', err);
    return () => {};
  }
}

export function subscribeToSubjects(callback: (subjects: Subject[]) => void) {
  try {
    const q = query(collection(db, COLLECTIONS.SUBJECTS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Subject[] = [];
        snapshot.forEach((doc) => items.push({ ...(doc.data() as Subject), id: doc.id }));
        items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        if (items.length > 0) callback(items);
      },
      (error) => {
        console.warn('Firestore subjects listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('Could not attach subjects listener:', err);
    return () => {};
  }
}

export function subscribeToNotes(callback: (notes: StudyNote[]) => void) {
  try {
    const q = query(collection(db, COLLECTIONS.NOTES));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: StudyNote[] = [];
        snapshot.forEach((doc) => items.push({ ...(doc.data() as StudyNote), id: doc.id }));
        if (items.length > 0) callback(items);
      },
      (error) => {
        console.warn('Firestore notes listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('Could not attach notes listener:', err);
    return () => {};
  }
}

export function subscribeToQuestions(callback: (questions: Question[]) => void) {
  try {
    const q = query(collection(db, COLLECTIONS.QUESTIONS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Question[] = [];
        snapshot.forEach((doc) => items.push({ ...(doc.data() as Question), id: doc.id }));
        if (items.length > 0) callback(items);
      },
      (error) => {
        console.warn('Firestore questions listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('Could not attach questions listener:', err);
    return () => {};
  }
}

export function subscribeToExams(callback: (exams: CBTExam[]) => void) {
  try {
    const q = query(collection(db, COLLECTIONS.EXAMS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: CBTExam[] = [];
        snapshot.forEach((doc) => items.push({ ...(doc.data() as CBTExam), id: doc.id }));
        if (items.length > 0) callback(items);
      },
      (error) => {
        console.warn('Firestore exams listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('Could not attach exams listener:', err);
    return () => {};
  }
}

export function subscribeToAnnouncements(callback: (announcements: Announcement[]) => void) {
  try {
    const q = query(collection(db, COLLECTIONS.ANNOUNCEMENTS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Announcement[] = [];
        snapshot.forEach((doc) => items.push({ ...(doc.data() as Announcement), id: doc.id }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (items.length > 0) callback(items);
      },
      (error) => {
        console.warn('Firestore announcements listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('Could not attach announcements listener:', err);
    return () => {};
  }
}

// Write helper functions directly to Firestore
export async function saveAttemptToFirestore(attempt: ExamAttempt) {
  try {
    await setDoc(doc(db, COLLECTIONS.ATTEMPTS, attempt.id), attempt);
  } catch (err) {
    console.warn('[Firestore] Failed to save attempt to cloud:', err);
  }
}

export async function saveLevelToFirestore(level: NursingLevel) {
  try {
    await setDoc(doc(db, COLLECTIONS.LEVELS, level.id), level);
  } catch (err) {
    console.warn('[Firestore] Failed to save level:', err);
  }
}

export async function deleteLevelFromFirestore(levelId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEVELS, levelId));
  } catch (err) {
    console.warn('[Firestore] Failed to delete level:', err);
  }
}

export async function saveSubjectToFirestore(subj: Subject) {
  try {
    await setDoc(doc(db, COLLECTIONS.SUBJECTS, subj.id), subj);
  } catch (err) {
    console.warn('[Firestore] Failed to save subject:', err);
  }
}

export async function deleteSubjectFromFirestore(subjId: string) {
  try {
    // Delete subject document
    await deleteDoc(doc(db, COLLECTIONS.SUBJECTS, subjId));
    
    // Also delete any associated study notes in Firestore
    try {
      const notesQ = query(collection(db, COLLECTIONS.NOTES), where('subjectId', '==', subjId));
      const notesSnap = await getDocs(notesQ);
      for (const noteDoc of notesSnap.docs) {
        await deleteDoc(noteDoc.ref);
      }
    } catch (notesErr) {
      console.warn('[Firestore] Error deleting associated notes for subject:', notesErr);
    }

    // Also delete any associated questions in Firestore
    try {
      const questionsQ = query(collection(db, COLLECTIONS.QUESTIONS), where('subjectId', '==', subjId));
      const questionsSnap = await getDocs(questionsQ);
      for (const qDoc of questionsSnap.docs) {
        await deleteDoc(qDoc.ref);
      }
    } catch (qErr) {
      console.warn('[Firestore] Error deleting associated questions for subject:', qErr);
    }
  } catch (err) {
    console.warn('[Firestore] Failed to delete subject:', err);
    throw err;
  }
}

export async function saveNoteToFirestore(note: StudyNote) {
  try {
    await setDoc(doc(db, COLLECTIONS.NOTES, note.id), note);
  } catch (err) {
    console.warn('[Firestore] Failed to save note:', err);
  }
}

export async function deleteNoteFromFirestore(noteId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.NOTES, noteId));
  } catch (err) {
    console.warn('[Firestore] Failed to delete note:', err);
    throw err;
  }
}

export async function saveQuestionToFirestore(q: Question) {
  try {
    await setDoc(doc(db, COLLECTIONS.QUESTIONS, String(q.id)), q);
  } catch (err) {
    console.warn('[Firestore] Failed to save question:', err);
  }
}

export async function deleteQuestionFromFirestore(qId: string | number) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.QUESTIONS, String(qId)));
  } catch (err) {
    console.warn('[Firestore] Failed to delete question:', err);
    throw err;
  }
}

export async function saveExamToFirestore(exam: CBTExam) {
  try {
    await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), exam);
  } catch (err) {
    console.warn('[Firestore] Failed to save exam:', err);
  }
}

export async function deleteExamFromFirestore(examId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.EXAMS, examId));
  } catch (err) {
    console.warn('[Firestore] Failed to delete exam:', err);
    throw err;
  }
}

export async function saveAnnouncementToFirestore(ann: Announcement) {
  try {
    await setDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id), ann);
  } catch (err) {
    console.warn('[Firestore] Failed to save announcement:', err);
  }
}

export async function deleteAnnouncementFromFirestore(annId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, annId));
  } catch (err) {
    console.warn('[Firestore] Failed to delete announcement:', err);
    throw err;
  }
}

// User & Student Profile Operations in Firestore
export async function saveUserToFirestore(user: User) {
  try {
    // Strip sensitive fields like password if present
    const { ...userDoc } = user as any;
    delete userDoc.password;
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), {
      ...userDoc,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to save user record:', err);
    return false;
  }
}

export async function deleteUserFromFirestore(userId: string, email?: string) {
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

export function subscribeToUsers(callback: (users: User[]) => void) {
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
      }
    );
  } catch (err) {
    console.warn('Could not attach users listener:', err);
    return () => {};
  }
}

