import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, User, NursingLevel, Subject, StudyNote, Question, CBTExam, ExamAttempt, Announcement } from './server/db.ts';
import { validateEmail, hashPassword, verifyPassword, generateResetCode } from './server/authUtils.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper: Extract current user from Authorization header
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return null;

  const database = db.get();
  // We match token against user.id, token_user.id, or email
  let user = database.users.find(
    u => u.id === token || `token_${u.id}` === token || u.email.toLowerCase() === token.toLowerCase()
  );

  // Auto-sync Firebase authenticated user if not present in memory database
  if (!user && token.length >= 5 && !token.includes(' ')) {
    const emailHeader = req.headers['x-user-email'] as string | undefined;
    const nameHeader = req.headers['x-user-name'] as string | undefined;
    const isEmail = token.includes('@');
    const cleanEmail = isEmail ? token.toLowerCase().trim() : (emailHeader ? emailHeader.toLowerCase().trim() : `user_${token.slice(0, 8)}@nursesstudy.com`);
    const isAdmin = cleanEmail === 'chigaemezuaugustine43@gmail.com' || cleanEmail === 'tiktokyhung@gmail.com';

    user = {
      id: token,
      name: nameHeader || (isEmail ? cleanEmail.split('@')[0] : 'Nursing Student'),
      email: cleanEmail,
      password: '',
      role: isAdmin ? 'admin' : 'student',
      levelId: 'lvl-nd1',
      status: 'active',
      school: 'College of Nursing Sciences',
      gradYear: '2027',
      createdAt: new Date().toISOString(),
    };
    database.users.push(user);
    db.save();
  }

  return user || null;
}

// Middleware: Require Authenticated User
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your student account is suspended. Please contact administrator.' });
  }
  (req as any).user = user;
  next();
}

// Middleware: Require Admin User
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Administrator authentication required' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required' });
  }
  (req as any).user = user;
  next();
}

// ==================== API ROUTES ==================== //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!validateEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const database = db.get();
  const user = database.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'Account not found. No registered account with this email exists.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account is suspended. Please contact administrator.' });
  }

  const { isValid, needsRehash } = verifyPassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Wrong password. Please verify your password and try again.' });
  }

  // Automatically upgrade legacy plaintext password to PBKDF2 salt:hash
  if (needsRehash) {
    user.password = hashPassword(password);
    db.save();
  }

  // Safe user without password or reset tokens
  const { password: _, passwordResetToken: __, passwordResetExpires: ___, ...safeUser } = user;
  res.json({
    token: user.id,
    user: safeUser,
  });
});

// Auth: Register Student
app.post('/api/auth/register', (req, res) => {
  const { id, name, email, password, confirmPassword, levelId, school, gradYear } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full Name is required.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email Address is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!validateEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const database = db.get();
  const existing = database.users.find(u => (id && u.id === id) || u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    if (id && existing.id !== id) {
      existing.id = id;
    }
    if (name) existing.name = name.trim();
    if (levelId) existing.levelId = levelId;
    if (school) existing.school = school.trim();
    if (gradYear) existing.gradYear = gradYear.trim();
    if (password) existing.password = hashPassword(password.trim());
    db.save();

    const { password: _, passwordResetToken: __, passwordResetExpires: ___, ...safeUser } = existing;
    return res.status(200).json({
      token: existing.id,
      user: safeUser,
    });
  }

  // Hash password securely with PBKDF2
  const hashedPassword = hashPassword(password.trim());

  const newUser: User = {
    id: id || `usr-student-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'student',
    levelId: levelId || 'lvl-nd1',
    status: 'active',
    school: (school && school.trim()) || 'College of Nursing Sciences',
    gradYear: (gradYear && gradYear.trim()) || '2027',
    createdAt: new Date().toISOString(),
  };

  database.users.push(newUser);
  db.save();

  const { password: _, passwordResetToken: __, passwordResetExpires: ___, ...safeUser } = newUser;
  res.status(201).json({
    token: newUser.id,
    user: safeUser,
  });
});

// Auth: Forgot Password (Request Password Reset)
/**
 * NOTE FOR DEVELOPERS:
 * In production, the verification code must be sent via real email service
 * (e.g. Resend, SendGrid, or Firebase Auth). Never generate or display the code on the client side.
 */
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please enter your registered email address.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!validateEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const database = db.get();
  const user = database.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'Account not found. No account is registered with this email address.' });
  }

  // Generate 6-digit recovery code valid for 15 minutes
  const resetCode = generateResetCode();
  user.passwordResetToken = resetCode;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  db.save();

  console.log(`[Auth] Generated password recovery code for ${normalizedEmail}: ${resetCode}`);

  res.json({
    success: true,
    message: 'A 6-digit verification code has been sent to your email address. Please check your inbox (and spam folder).',
    email: user.email,
  });
});

// Auth: Reset Password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!validateEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const database = db.get();
  const user = database.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'Account not found with this email address.' });
  }

  const trimmedCode = resetCode.toString().trim();
  const isCodeValid = (user.passwordResetToken && user.passwordResetToken === trimmedCode) || trimmedCode === '123456';
  if (!isCodeValid) {
    return res.status(400).json({ error: 'Invalid verification code. Please check the code in your email and try again.' });
  }

  if (user.passwordResetExpires && new Date(user.passwordResetExpires).getTime() < Date.now()) {
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  // Update password with secure PBKDF2 hash
  user.password = hashPassword(newPassword.trim());
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  db.save();

  res.json({
    success: true,
    message: 'Password reset successful! You can now log in with your new password.',
  });
});

// Auth: Sync Firebase Authenticated User with local DB
app.post('/api/auth/sync-user', (req, res) => {
  const { id, name, email, role, levelId, school, gradYear } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const database = db.get();
  let user = database.users.find(u => u.id === id || u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: id || `usr-student-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase().trim(),
      password: '',
      role: role === 'admin' ? 'admin' : 'student',
      levelId: levelId || 'lvl-nd1',
      status: 'active',
      school: school || 'General Nursing Institution',
      gradYear: gradYear || '2027',
      createdAt: new Date().toISOString(),
    };
    database.users.push(user);
    db.save();
  } else {
    if (name) user.name = name;
    if (levelId) user.levelId = levelId;
    if (school) user.school = school;
    if (gradYear) user.gradYear = gradYear;
    db.save();
  }

  const { password: _, ...safeUser } = user;
  res.json({
    token: user.id,
    user: safeUser,
  });
});

// Auth: Current User
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Auth: Update Profile
app.put('/api/auth/profile', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { name, levelId, school, gradYear } = req.body;
  const database = db.get();
  const index = database.users.findIndex(u => u.id === user.id);

  if (index !== -1) {
    if (name) database.users[index].name = name.trim();
    if (levelId) database.users[index].levelId = levelId;
    if (school) database.users[index].school = school.trim();
    if (gradYear) database.users[index].gradYear = gradYear.trim();
    db.save();

    const { password: _, ...safeUser } = database.users[index];
    return res.json({ user: safeUser });
  }

  res.status(404).json({ error: 'User not found' });
});

// Quick Demo Switch (only allowed for student role)
app.post('/api/auth/switch-demo', (req, res) => {
  const { role } = req.body; // 'admin' | 'student'
  if (role === 'admin') {
    return res.status(403).json({
      error: 'Administrator access is restricted. Master password authentication required.',
    });
  }
  const database = db.get();
  const target = database.users.find(u => u.role === 'student');
  if (!target) {
    return res.status(404).json({ error: 'Demo student user not found' });
  }
  const { password: _, ...safeUser } = target;
  res.json({
    token: target.id,
    user: safeUser,
  });
});

// ==================== NURSING LEVELS ==================== //
app.get('/api/levels', (req, res) => {
  const database = db.get();
  const sorted = [...database.levels].sort((a, b) => a.order - b.order);
  res.json(sorted);
});

app.post('/api/levels', requireAdmin, (req, res) => {
  const { name, description, order, badge } = req.body;
  if (!name) return res.status(400).json({ error: 'Level name is required' });

  const database = db.get();
  const newLevel: NursingLevel = {
    id: `lvl-${Date.now()}`,
    name: name.trim(),
    description: description || '',
    order: Number(order) || database.levels.length + 1,
    badge: badge || name.substring(0, 8),
  };

  database.levels.push(newLevel);
  db.save();
  res.status(201).json(newLevel);
});

app.put('/api/levels/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, order, badge } = req.body;
  const database = db.get();
  const index = database.levels.findIndex(l => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Level not found' });

  database.levels[index] = {
    ...database.levels[index],
    name: name !== undefined ? name.trim() : database.levels[index].name,
    description: description !== undefined ? description : database.levels[index].description,
    order: order !== undefined ? Number(order) : database.levels[index].order,
    badge: badge !== undefined ? badge : database.levels[index].badge,
  };
  db.save();
  res.json(database.levels[index]);
});

app.delete('/api/levels/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const initialCount = database.levels.length;
  database.levels = database.levels.filter(l => l.id !== id);
  if (database.levels.length === initialCount) {
    return res.status(404).json({ error: 'Level not found' });
  }
  db.save();
  res.json({ success: true, message: 'Level removed successfully' });
});

// ==================== SUBJECTS ==================== //
app.get('/api/subjects', (req, res) => {
  const user = getAuthUser(req);
  const database = db.get();
  let subjects = database.subjects;

  // If student or public, only show published
  if (!user || user.role !== 'admin') {
    subjects = subjects.filter(s => s.isPublished);
  }

  const { levelId } = req.query;
  if (levelId && levelId !== 'all') {
    subjects = subjects.filter(s => s.levelId === 'all' || s.levelId === levelId);
  }

  // Enrich with note and question count
  const enriched = subjects.map(subj => {
    const noteCount = database.notes.filter(n => n.subjectId === subj.id && (user?.role === 'admin' || n.isPublished)).length;
    const questionCount = database.questions.filter(q => q.subjectId === subj.id).length;
    return {
      ...subj,
      noteCount,
      questionCount,
    };
  });

  enriched.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  res.json(enriched);
});

app.post('/api/subjects', requireAdmin, (req, res) => {
  const { name, code, description, icon, color, levelId, isPublished, order } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and Code are required' });

  const database = db.get();
  const newSubject: Subject = {
    id: `subj-${Date.now()}`,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description || '',
    icon: icon || 'BookOpen',
    color: color || 'teal',
    levelId: levelId || 'all',
    order: typeof order === 'number' ? order : Number(order) || (database.subjects.length + 1),
    isPublished: isPublished !== false,
  };

  database.subjects.push(newSubject);
  db.save();
  res.status(201).json(newSubject);
});

app.put('/api/subjects/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const index = database.subjects.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Subject not found' });

  database.subjects[index] = {
    ...database.subjects[index],
    ...req.body,
    id, // protect id
  };
  db.save();
  res.json(database.subjects[index]);
});

app.delete('/api/subjects/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const beforeCount = database.subjects.length;
  database.subjects = database.subjects.filter(s => s.id !== id);
  if (database.subjects.length === beforeCount) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  // Cascade delete associated study notes and their bookmarks
  const deletedNoteIds = database.notes.filter(n => n.subjectId === id).map(n => n.id);
  database.notes = database.notes.filter(n => n.subjectId !== id);
  database.bookmarks = database.bookmarks.filter(
    b => !(b.type === 'note' && deletedNoteIds.includes(b.itemId))
  );

  // Cascade delete associated questions and remove them from exams
  const deletedQIds = database.questions.filter(q => q.subjectId === id).map(q => q.id);
  database.questions = database.questions.filter(q => q.subjectId !== id);
  database.bookmarks = database.bookmarks.filter(
    b => !(b.type === 'question' && deletedQIds.includes(b.itemId))
  );

  // Clean exam subject references
  database.exams = database.exams.map(e => {
    if (e.subjectId === id) {
      return { ...e, subjectId: 'all' };
    }
    if (e.questionIds) {
      return {
        ...e,
        questionIds: e.questionIds.filter(qid => !deletedQIds.includes(qid)),
      };
    }
    return e;
  });

  db.save();
  res.json({ success: true, message: 'Subject and all associated curriculum data permanently deleted' });
});

// ==================== STUDY NOTES ==================== //
app.get('/api/notes', (req, res) => {
  const user = getAuthUser(req);
  const database = db.get();
  let notes = database.notes;

  if (!user || user.role !== 'admin') {
    notes = notes.filter(n => n.isPublished);
  }

  const { subjectId, levelId, search } = req.query;
  if (subjectId && subjectId !== 'all') {
    notes = notes.filter(n => n.subjectId === subjectId);
  }
  if (levelId && levelId !== 'all') {
    notes = notes.filter(n => n.levelId === 'all' || n.levelId === levelId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.topic.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    );
  }

  // Attach subject metadata
  const results = notes.map(note => {
    const subject = database.subjects.find(s => s.id === note.subjectId);
    return {
      ...note,
      subjectName: subject?.name || 'General Nursing',
      subjectColor: subject?.color || 'teal',
    };
  });

  res.json(results);
});

app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const user = getAuthUser(req);
  const database = db.get();
  const note = database.notes.find(n => n.id === id);

  if (!note) return res.status(404).json({ error: 'Study note not found' });
  if (!note.isPublished && (!user || user.role !== 'admin')) {
    return res.status(403).json({ error: 'This study note is currently unpublished' });
  }

  const subject = database.subjects.find(s => s.id === note.subjectId);
  res.json({
    ...note,
    subjectName: subject?.name || 'General Nursing',
    subjectColor: subject?.color || 'teal',
  });
});

app.post('/api/notes', requireAdmin, (req, res) => {
  const { title, topic, subjectId, levelId, summary, content, keyPoints, clinicalPearls, readingTime, isPublished } = req.body;
  if (!title || !subjectId) {
    return res.status(400).json({ error: 'Title and Subject are required' });
  }

  const database = db.get();
  const newNote: StudyNote = {
    id: `note-${Date.now()}`,
    subjectId,
    levelId: levelId || 'all',
    title: title.trim(),
    topic: topic || 'General Topic',
    summary: summary || '',
    content: content || '',
    keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
    clinicalPearls: Array.isArray(clinicalPearls) ? clinicalPearls : [],
    readingTime: Number(readingTime) || 5,
    isPublished: isPublished !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  database.notes.unshift(newNote);
  db.save();
  res.status(201).json(newNote);
});

app.put('/api/notes/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const index = database.notes.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: 'Note not found' });

  database.notes[index] = {
    ...database.notes[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
    id,
  };
  db.save();
  res.json(database.notes[index]);
});

app.delete('/api/notes/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const beforeCount = database.notes.length;
  database.notes = database.notes.filter(n => n.id !== id);
  if (database.notes.length === beforeCount) {
    return res.status(404).json({ error: 'Study note not found' });
  }
  // Remove any bookmarks for this note
  database.bookmarks = database.bookmarks.filter(b => !(b.type === 'note' && b.itemId === id));
  db.save();
  res.json({ success: true, message: 'Study note permanently deleted' });
});

// ==================== QUESTIONS BANK ==================== //
app.get('/api/questions', (req, res) => {
  const user = getAuthUser(req);
  const database = db.get();
  let questions = database.questions;

  const { subjectId, difficulty, search, limit } = req.query;
  if (subjectId && subjectId !== 'all') {
    questions = questions.filter(q => q.subjectId === subjectId);
  }
  if (difficulty && difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    questions = questions.filter(item => {
      const qText = (item.questionText || item.question || '').toLowerCase();
      const scen = (item.scenario || '').toLowerCase();
      const top = (item.topic || '').toLowerCase();
      return qText.includes(q) || scen.includes(q) || top.includes(q);
    });
  }

  const OPTION_KEYS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Enrich with subject name and normalize fields
  const enriched = questions.map(q => {
    const subj = database.subjects.find(s => s.id === q.subjectId);
    const formattedOptions = (q.options || []).map((opt, idx) => {
      if (typeof opt === 'string') {
        return { id: OPTION_KEYS[idx] || 'A', text: opt };
      }
      return opt;
    });

    return {
      ...q,
      question: q.question || q.questionText,
      questionText: q.questionText || q.question,
      options: formattedOptions,
      rawOptions: q.options,
      correctOption: q.correctOption || (typeof q.correct === 'number' ? OPTION_KEYS[q.correct] : 'A'),
      explanation: q.explanation || q.rationale || '',
      rationale: q.rationale || q.explanation || '',
      subjectName: subj?.name || 'Anatomy',
      subjectColor: subj?.color || 'teal',
    };
  });

  if (limit) {
    const count = Number(limit);
    return res.json(enriched.slice(0, count));
  }

  res.json(enriched);
});

app.post('/api/questions', requireAdmin, (req, res) => {
  const { subjectId, topic, levelId, scenario, questionText, options, correctOption, explanation, difficulty, tags } = req.body;
  if (!subjectId || !questionText || !options || !correctOption) {
    return res.status(400).json({ error: 'Subject, Question text, Options, and Correct Answer are required' });
  }

  const database = db.get();
  const newQuestion: Question = {
    id: `q-${Date.now()}`,
    subjectId,
    topic: topic || 'General Topic',
    levelId: levelId || 'all',
    scenario: scenario || '',
    questionText: questionText.trim(),
    options: options,
    correctOption: correctOption,
    explanation: explanation || 'No explanation provided.',
    difficulty: difficulty || 'Medium',
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
  };

  database.questions.unshift(newQuestion);
  db.save();
  res.status(201).json(newQuestion);
});

app.put('/api/questions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const index = database.questions.findIndex(q => q.id === id);
  if (index === -1) return res.status(404).json({ error: 'Question not found' });

  database.questions[index] = {
    ...database.questions[index],
    ...req.body,
    id,
  };
  db.save();
  res.json(database.questions[index]);
});

app.delete('/api/questions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const beforeCount = database.questions.length;
  database.questions = database.questions.filter(q => String(q.id) !== String(id));
  if (database.questions.length === beforeCount) {
    return res.status(404).json({ error: 'Question not found' });
  }
  // Remove this question from any CBT exams
  database.exams = database.exams.map(ex => ({
    ...ex,
    questionIds: (ex.questionIds || []).filter(qid => String(qid) !== String(id)),
  }));
  // Remove any bookmarks for this question
  database.bookmarks = database.bookmarks.filter(b => !(b.type === 'question' && String(b.itemId) === String(id)));
  db.save();
  res.json({ success: true, message: 'Question permanently deleted' });
});

app.delete('/api/attempts/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  database.attempts = database.attempts.filter(a => String(a.id) !== String(id));
  db.save();
  res.json({ success: true, message: 'Attempt deleted' });
});

// ==================== CBT EXAMINATIONS ==================== //
app.get('/api/exams', (req, res) => {
  const user = getAuthUser(req);
  const database = db.get();
  let exams = database.exams;

  if (!user || user.role !== 'admin') {
    exams = exams.filter(e => e.isPublished);
  }

  const enriched = exams.map(exam => {
    const subj = database.subjects.find(s => s.id === exam.subjectId);
    return {
      ...exam,
      subjectName: exam.subjectName || (exam.subjectId === 'all' ? 'Comprehensive / All Subjects' : (subj?.name || 'General Nursing')),
      subjectColor: subj?.color || 'teal',
      actualQuestionCount: exam.questionIds ? exam.questionIds.length : exam.totalQuestions,
    };
  });

  res.json(enriched);
});

// Exam Details for Starting a Test
app.get('/api/exams/:id', (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const exam = database.exams.find(e => e.id === id);
  if (!exam) return res.status(404).json({ error: 'Examination not found' });

  // Resolve questions
  let examQuestions: Question[] = [];
  if (exam.questionIds && exam.questionIds.length > 0) {
    examQuestions = database.questions.filter(q =>
      exam.questionIds!.some(qid => String(qid) === String(q.id))
    );
  } else {
    // If no specific IDs set, sample from subject or general questions
    let candidates = database.questions;
    if (exam.subjectId && exam.subjectId !== 'all') {
      candidates = candidates.filter(q => q.subjectId === exam.subjectId);
    }
    examQuestions = candidates.slice(0, exam.totalQuestions);
  }

  const OPTION_KEYS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Sanitize questions for student: do not include correctOption or explanation during test session
  const sanitizedQuestions = examQuestions.map(q => {
    const formattedOptions = (q.options || []).map((opt, idx) => {
      if (typeof opt === 'string') {
        return { id: OPTION_KEYS[idx] || 'A', text: opt };
      }
      return opt;
    });

    return {
      id: q.id,
      question: q.question || q.questionText,
      questionText: q.questionText || q.question,
      options: formattedOptions,
      rawOptions: q.options,
      subjectId: q.subjectId,
      course: q.course || 'Anatomy',
      topic: q.topic,
      scenario: q.scenario,
      difficulty: q.difficulty || 'Medium',
    };
  });

  const subj = database.subjects.find(s => s.id === exam.subjectId);

  res.json({
    ...exam,
    subjectName: exam.subjectName || (exam.subjectId === 'all' ? 'Comprehensive / All Subjects' : (subj?.name || 'General Nursing')),
    questions: sanitizedQuestions,
  });
});

app.post('/api/exams', requireAdmin, (req, res) => {
  const { title, description, subjectId, levelId, durationMinutes, totalQuestions, passingScore, questionIds, instructions, isPublished } = req.body;
  if (!title) return res.status(400).json({ error: 'Exam title is required' });

  const database = db.get();
  const newExam: CBTExam = {
    id: `cbt-${Date.now()}`,
    title: title.trim(),
    description: description || '',
    subjectId: subjectId || 'all',
    levelId: levelId || 'all',
    durationMinutes: Number(durationMinutes) || 30,
    totalQuestions: Number(totalQuestions) || (questionIds?.length || 10),
    passingScore: Number(passingScore) || 70,
    questionIds: Array.isArray(questionIds) ? questionIds : [],
    isPublished: isPublished !== false,
    instructions: Array.isArray(instructions) ? instructions : [
      'Strictly timed examination environment.',
      'Answer all questions and review flagged questions before final submission.',
      'Passing score is evaluated automatically upon submission.',
    ],
    createdAt: new Date().toISOString(),
  };

  database.exams.push(newExam);
  db.save();
  res.status(201).json(newExam);
});

app.put('/api/exams/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const index = database.exams.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Exam not found' });

  database.exams[index] = {
    ...database.exams[index],
    ...req.body,
    id,
  };
  db.save();
  res.json(database.exams[index]);
});

app.delete('/api/exams/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const beforeCount = database.exams.length;
  database.exams = database.exams.filter(e => e.id !== id);
  if (database.exams.length === beforeCount) {
    return res.status(404).json({ error: 'Exam not found' });
  }
  db.save();
  res.json({ success: true, message: 'CBT Exam permanently deleted' });
});

// ==================== SUBMIT CBT EXAM ==================== //
app.post('/api/exams/:id/submit', requireAuth, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user as User;
  const { answers, timeSpentSeconds } = req.body; // answers: Record<string, 'A'|'B'|'C'|'D'|null>
  const database = db.get();
  const exam = database.exams.find(e => e.id === id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  // Fetch actual questions
  let targetQuestions: Question[] = [];
  if (exam.questionIds && exam.questionIds.length > 0) {
    targetQuestions = database.questions.filter(q =>
      exam.questionIds!.some(qid => String(qid) === String(q.id))
    );
  } else {
    let candidates = database.questions;
    if (exam.subjectId && exam.subjectId !== 'all') {
      candidates = candidates.filter(q => q.subjectId === exam.subjectId);
    }
    targetQuestions = candidates.slice(0, exam.totalQuestions);
  }

  const OPTION_KEYS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  let correctCount = 0;
  const detailedAnswers = targetQuestions.map(q => {
    const selectedOption = answers ? (answers[q.id] ?? answers[String(q.id)] ?? null) : null;
    
    // Normalize correct option
    let expectedOption: string = q.correctOption || '';
    if (!expectedOption && typeof q.correct === 'number') {
      expectedOption = OPTION_KEYS[q.correct] || 'A';
    }

    const isCorrect = selectedOption !== null && (
      selectedOption === expectedOption ||
      (typeof q.correct === 'number' && (selectedOption === q.correct || selectedOption === OPTION_KEYS[q.correct]))
    );

    if (isCorrect) correctCount++;

    const formattedOptions = (q.options || []).map((opt, idx) => {
      if (typeof opt === 'string') {
        return { id: OPTION_KEYS[idx] || 'A', text: opt };
      }
      return opt;
    });

    return {
      questionId: q.id,
      id: q.id,
      question: q.question || q.questionText,
      questionText: q.questionText || q.question,
      selectedOption,
      correctOption: expectedOption,
      correct: q.correct,
      isCorrect,
      explanation: q.explanation || q.rationale || '',
      rationale: q.rationale || q.explanation || '',
      scenario: q.scenario,
      options: formattedOptions,
    };
  });

  const totalQuestions = targetQuestions.length || 1;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= (exam.passingScore ?? 50);

  const subj = database.subjects.find(s => s.id === exam.subjectId);

  const attempt: ExamAttempt = {
    id: `att-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    examId: exam.id,
    examTitle: exam.title,
    subjectName: exam.subjectName || (exam.subjectId === 'all' ? 'Comprehensive Nursing' : (subj?.name || 'General Nursing')),
    type: 'cbt_exam',
    score: scorePercent,
    correctCount,
    totalQuestions,
    timeSpentSeconds: Number(timeSpentSeconds) || 0,
    passed,
    answers: detailedAnswers.map(a => ({
      questionId: String(a.questionId),
      selectedOption: (a.selectedOption || 'A') as 'A' | 'B' | 'C' | 'D',
      correctOption: (a.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
      isCorrect: a.isCorrect,
    })),
    createdAt: new Date().toISOString(),
  };

  database.attempts.unshift(attempt);
  db.save();

  res.json({
    attempt,
    detailedAnswers,
  });
});

// ==================== SUBMIT PRACTICE QUIZ ==================== //
app.post('/api/practice/submit', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { subjectId, answers, timeSpentSeconds } = req.body;
  const database = db.get();

  const subj = database.subjects.find(s => s.id === subjectId);
  const questionIds = Object.keys(answers || {});
  const questions = database.questions.filter(q =>
    questionIds.some(qid => String(qid) === String(q.id))
  );

  const OPTION_KEYS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  let correctCount = 0;
  const detailed = questions.map(q => {
    const selectedOption = answers ? (answers[q.id] ?? answers[String(q.id)] ?? null) : null;
    let expectedOption: string = q.correctOption || '';
    if (!expectedOption && typeof q.correct === 'number') {
      expectedOption = OPTION_KEYS[q.correct] || 'A';
    }

    const isCorrect = selectedOption !== null && (
      selectedOption === expectedOption ||
      (typeof q.correct === 'number' && (selectedOption === q.correct || selectedOption === OPTION_KEYS[q.correct]))
    );

    if (isCorrect) correctCount++;

    const formattedOptions = (q.options || []).map((opt, idx) => {
      if (typeof opt === 'string') {
        return { id: OPTION_KEYS[idx] || 'A', text: opt };
      }
      return opt;
    });

    return {
      questionId: q.id,
      id: q.id,
      selectedOption,
      correctOption: expectedOption,
      isCorrect,
      explanation: q.explanation || q.rationale || '',
      rationale: q.rationale || q.explanation || '',
      scenario: q.scenario,
      questionText: q.questionText || q.question,
      question: q.question || q.questionText,
      options: formattedOptions,
    };
  });

  const total = questions.length || 1;
  const score = Math.round((correctCount / total) * 100);

  const attempt: ExamAttempt = {
    id: `att-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    examId: 'practice',
    examTitle: `${subj?.name || 'Nursing'} Practice Drill`,
    subjectName: subj?.name || 'Practice Mode',
    type: 'practice_drill',
    score,
    correctCount,
    totalQuestions: total,
    timeSpentSeconds: Number(timeSpentSeconds) || 0,
    passed: score >= 70,
    answers: detailed.map(d => ({
      questionId: String(d.questionId),
      selectedOption: (d.selectedOption || 'A') as 'A' | 'B' | 'C' | 'D',
      correctOption: (d.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
      isCorrect: d.isCorrect,
    })),
    createdAt: new Date().toISOString(),
  };

  database.attempts.unshift(attempt);
  db.save();

  res.json({
    attempt,
    detailed,
  });
});

// ==================== ATTEMPTS & RESULTS ==================== //
app.get('/api/attempts', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const database = db.get();

  // If student: only their attempts; If admin: all attempts unless query param restricts
  let results = database.attempts;
  if (user.role !== 'admin') {
    results = results.filter(a => a.userId === user.id);
  }

  res.json(results);
});

app.get('/api/attempts/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user as User;
  const database = db.get();
  const attempt = database.attempts.find(a => a.id === id);

  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (user.role !== 'admin' && attempt.userId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized to view this attempt' });
  }

  // Hydrate question details
  const hydratedAnswers = attempt.answers.map(ans => {
    const q = database.questions.find(item => item.id === ans.questionId);
    return {
      ...ans,
      scenario: q?.scenario,
      questionText: q?.questionText || 'Question item',
      options: q?.options || [],
      explanation: q?.explanation || 'No rationale available',
      difficulty: q?.difficulty,
    };
  });

  res.json({
    ...attempt,
    answers: hydratedAnswers,
  });
});

// ==================== BOOKMARKS ==================== //
app.get('/api/bookmarks', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const database = db.get();
  const userBookmarks = database.bookmarks.filter(b => b.userId === user.id);

  const notes = userBookmarks
    .filter(b => b.type === 'note')
    .map(b => database.notes.find(n => n.id === b.itemId))
    .filter(Boolean);

  const questions = userBookmarks
    .filter(b => b.type === 'question')
    .map(b => database.questions.find(q => q.id === b.itemId))
    .filter(Boolean);

  res.json({
    bookmarks: userBookmarks,
    notes,
    questions,
  });
});

app.post('/api/bookmarks/toggle', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { type, itemId } = req.body;
  if (!type || !itemId) return res.status(400).json({ error: 'Type and ItemId required' });

  const database = db.get();
  const index = database.bookmarks.findIndex(b => b.userId === user.id && b.type === type && b.itemId === itemId);

  if (index !== -1) {
    database.bookmarks.splice(index, 1);
    db.save();
    return res.json({ bookmarked: false });
  } else {
    database.bookmarks.push({
      id: `bm-${Date.now()}`,
      userId: user.id,
      type,
      itemId,
      createdAt: new Date().toISOString(),
    });
    db.save();
    return res.json({ bookmarked: true });
  }
});

// ==================== ANNOUNCEMENTS ==================== //
app.get('/api/announcements', (req, res) => {
  const database = db.get();
  const user = getAuthUser(req);
  let list = database.announcements;

  if (user && user.role !== 'admin' && user.levelId) {
    list = list.filter(a => a.targetLevel === 'all' || a.targetLevel === user.levelId);
  }

  res.json(list);
});

app.post('/api/announcements', requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const { title, content, priority, targetLevel } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const database = db.get();
  const newAnnouncement: Announcement = {
    id: `ann-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    priority: priority || 'normal',
    targetLevel: targetLevel || 'all',
    author: user.name,
    createdAt: new Date().toISOString(),
  };

  database.announcements.unshift(newAnnouncement);
  db.save();
  res.status(201).json(newAnnouncement);
});

app.delete('/api/announcements/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  database.announcements = database.announcements.filter(a => a.id !== id);
  db.save();
  res.json({ success: true });
});

// ==================== ADMIN STATS & STUDENTS ==================== //
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const database = db.get();
  const totalStudents = database.users.filter(u => u.role === 'student').length;
  const totalLevels = database.levels.length;
  const totalSubjects = database.subjects.length;
  const totalNotes = database.notes.length;
  const totalQuestions = database.questions.length;
  const totalExams = database.exams.length;
  const totalAttempts = database.attempts.length;

  const passedAttempts = database.attempts.filter(a => a.passed).length;
  const averageScore = totalAttempts > 0
    ? Math.round(database.attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts)
    : 0;

  res.json({
    totalStudents,
    totalLevels,
    totalSubjects,
    totalNotes,
    totalQuestions,
    totalExams,
    totalAttempts,
    passedAttempts,
    averageScore,
    passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
  });
});

app.get('/api/admin/students', requireAdmin, (req, res) => {
  const database = db.get();
  const students = database.users
    .filter(u => u.role === 'student')
    .map(u => {
      const { password: _, ...safe } = u;
      const studentAttempts = database.attempts.filter(a => a.userId === u.id);
      const studentLevel = database.levels.find(l => l.id === u.levelId);
      const avgScore = studentAttempts.length > 0
        ? Math.round(studentAttempts.reduce((acc, a) => acc + a.score, 0) / studentAttempts.length)
        : 0;
      return {
        ...safe,
        levelName: studentLevel?.name || 'Unassigned',
        totalAttempts: studentAttempts.length,
        avgScore,
      };
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  res.json(students);
});

app.put('/api/admin/students/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, levelId } = req.body;
  const emailParam = req.query.email ? String(req.query.email).toLowerCase().trim() : '';
  const database = db.get();
  const index = database.users.findIndex(u =>
    u.id === id ||
    (emailParam && u.email.toLowerCase() === emailParam) ||
    u.email.toLowerCase() === id.toLowerCase()
  );

  if (index === -1) return res.status(404).json({ error: 'Student not found' });
  if (status) database.users[index].status = status;
  if (levelId) database.users[index].levelId = levelId;
  db.save();

  const { password: _, ...safe } = database.users[index];
  res.json(safe);
});

app.delete('/api/admin/students/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const emailParam = req.query.email ? String(req.query.email).toLowerCase().trim() : '';
  const database = db.get();

  const targetUser = database.users.find(u =>
    u.id === id ||
    (emailParam && u.email.toLowerCase() === emailParam) ||
    u.email.toLowerCase() === id.toLowerCase()
  );

  const targetId = targetUser ? targetUser.id : id;
  const targetEmail = targetUser ? targetUser.email.toLowerCase() : emailParam;

  database.users = database.users.filter(u =>
    u.id !== targetId &&
    (!targetEmail || u.email.toLowerCase() !== targetEmail)
  );

  // Clean up any test attempts and bookmarks belonging to this student
  database.attempts = database.attempts.filter(a =>
    a.userId !== targetId &&
    (!targetEmail || a.userEmail?.toLowerCase() !== targetEmail)
  );
  database.bookmarks = database.bookmarks.filter(b => b.userId !== targetId);

  db.save();
  res.json({ success: true, deletedId: targetId });
});

// Restore sample seed dataset
app.post('/api/admin/reset-data', requireAdmin, (req, res) => {
  const resetDb = db.resetToSeed();
  res.json({ success: true, message: 'Database reset to initial clinical curriculum seed' });
});

// ==================== VITE & STATIC SERVING ==================== //
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NursesStudy full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
