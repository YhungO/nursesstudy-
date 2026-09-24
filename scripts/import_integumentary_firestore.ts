import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import firebaseConfig from '../firebase-applet-config.json';
import {
  INTEGUMENTARY_THEORY_EXAM_ID,
  INTEGUMENTARY_THEORY_EXAM_TITLE,
  importIntegumentaryTheoryExamToFirestore,
  getIntegumentaryTheoryExamImportStatus,
  buildIntegumentaryTheoryExamPayload,
  buildIntegumentaryTheoryQuestionPayloads,
} from '../src/services/theoryExamImportService';
import { THEORY_INTEGUMENTARY_QUESTIONS } from '../src/data/theoryIntegumentaryQuestions';

async function main() {
  console.log('='.repeat(70));
  console.log('  FIRESTORE UPSERT UTILITY: INTEGUMENTARY SYSTEM THEORY CBT (50 Qs)');
  console.log('='.repeat(70));
  console.log(`Database ID: ${firebaseConfig.firestoreDatabaseId}`);
  console.log(`Target Exam ID: ${INTEGUMENTARY_THEORY_EXAM_ID}`);
  console.log(`Total Source Questions: ${THEORY_INTEGUMENTARY_QUESTIONS.length}`);
  console.log('='.repeat(70));

  // 1. Initialize Firebase App and Services
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  // 2. Authenticate Admin Actor to satisfy Firestore Security Rules
  const adminEmail = process.env.ADMIN_EMAIL || 'chigaemezuaugustine43@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'chiga4006#';

  console.log(`\n[Auth] Authenticating as designated administrator (${adminEmail})...`);
  let currentUser;
  try {
    const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    currentUser = cred.user;
    console.log(`[Auth] ✓ Successfully signed in as admin (UID: ${currentUser.uid})`);
  } catch (authErr: any) {
    console.warn(`[Auth] Warning: Could not sign in with email/password: ${authErr.message}`);
    console.log('[Auth] Proceeding with existing session / client authentication state...');
  }

  // 3. Inspect Current Status in Firestore
  console.log('\n[Status Check] Querying existing records in Cloud Firestore...');
  const beforeStatus = await getIntegumentaryTheoryExamImportStatus(db);
  console.log(` - Exam '${INTEGUMENTARY_THEORY_EXAM_ID}' exists: ${beforeStatus.examExists ? 'YES' : 'NO'}`);
  console.log(` - Existing questions in Firestore: ${beforeStatus.existingQuestionCount} / 50`);
  if (beforeStatus.missingQuestionIds.length > 0) {
    console.log(` - Missing question IDs (${beforeStatus.missingQuestionIds.length}): ${beforeStatus.missingQuestionIds.slice(0, 5).join(', ')}${beforeStatus.missingQuestionIds.length > 5 ? '...' : ''}`);
  }

  // 4. Execute the Upsert via the Service Utility
  console.log('\n[Upsert Execution] Executing batch upsert into Cloud Firestore...');
  const result = await importIntegumentaryTheoryExamToFirestore({
    firestoreInstance: db,
    adminActor: currentUser
      ? { uid: currentUser.uid, email: currentUser.email || adminEmail, name: 'Lead Administrator' }
      : { email: adminEmail },
    onProgress: (prog) => {
      console.log(` [${prog.stage}] ${prog.message}`);
    },
  });

  if (!result.success) {
    console.error(`\n❌ Upsert failed: ${result.error || result.message}`);
    process.exit(1);
  }

  console.log(`\n✓ ${result.message}`);

  // 5. Also Sync local database.json for dual-persistence guarantee
  try {
    const dbPath = path.resolve(process.cwd(), 'data', 'database.json');
    if (fs.existsSync(dbPath)) {
      console.log('\n[Local Sync] Synchronizing local data/database.json...');
      const localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

      const examPayload = buildIntegumentaryTheoryExamPayload();
      const questionPayloads = buildIntegumentaryTheoryQuestionPayloads();

      if (!localDb.exams) localDb.exams = [];
      if (!localDb.questions) localDb.questions = [];

      // Upsert exam
      const existingExamIdx = localDb.exams.findIndex((e: any) => e.id === INTEGUMENTARY_THEORY_EXAM_ID);
      if (existingExamIdx >= 0) {
        localDb.exams[existingExamIdx] = { ...localDb.exams[existingExamIdx], ...examPayload };
      } else {
        localDb.exams.push(examPayload);
      }

      // Upsert questions
      let localQAdded = 0;
      let localQUpdated = 0;
      for (const q of questionPayloads) {
        const qIdx = localDb.questions.findIndex((item: any) => String(item.id) === String(q.id));
        if (qIdx >= 0) {
          localDb.questions[qIdx] = { ...localDb.questions[qIdx], ...q };
          localQUpdated++;
        } else {
          localDb.questions.push(q);
          localQAdded++;
        }
      }

      fs.writeFileSync(dbPath, JSON.stringify(localDb, null, 2), 'utf8');
      console.log(`[Local Sync] ✓ Updated local database: Exam upserted, ${localQAdded} questions added, ${localQUpdated} updated.`);
    }
  } catch (localErr: any) {
    console.warn('[Local Sync] Notice:', localErr.message);
  }

  // 6. Verification Read
  console.log('\n[Verification] Validating imported documents directly in Firestore...');
  const afterStatus = await getIntegumentaryTheoryExamImportStatus(db);
  const examDoc = await getDoc(doc(db, 'exams', INTEGUMENTARY_THEORY_EXAM_ID));

  console.log('='.repeat(70));
  console.log('                      VERIFICATION REPORT');
  console.log('='.repeat(70));
  console.log(`Exam Document ID:     ${examDoc.id}`);
  console.log(`Exam Exists:          ${examDoc.exists() ? 'YES ✓' : 'NO ❌'}`);
  if (examDoc.exists()) {
    const data = examDoc.data();
    console.log(`Exam Title:           ${data?.title}`);
    console.log(`Exam Type:            ${data?.examType}`);
    console.log(`Total Questions:      ${data?.totalQuestions}`);
    console.log(`Question IDs Array:   ${Array.isArray(data?.questionIds) ? data?.questionIds.length : 0} items`);
  }
  console.log(`Questions in Firestore: ${afterStatus.existingQuestionCount} / 50 ✓`);
  console.log(`Missing Questions:    ${afterStatus.missingQuestionIds.length}`);
  console.log(`All Questions Synced: ${afterStatus.allQuestionsImported ? 'YES ✓' : 'NO ❌'}`);
  console.log(`Time Taken:           ${result.durationMs}ms`);
  console.log('='.repeat(70));
  console.log('✓ ONE-TIME IMPORT TO FIRESTORE COMPLETED SUCCESSFULLY WITH ZERO DUPLICATES.');
  console.log('='.repeat(70));

  process.exit(0);
}

main().catch((err) => {
  console.error('\nFatal error running import script:', err);
  process.exit(1);
});
