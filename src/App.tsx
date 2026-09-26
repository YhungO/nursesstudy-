import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { StudentHome } from './components/student/StudentHome';
import { StudyNotes } from './components/student/StudyNotes';
import { QuestionPractice } from './components/student/QuestionPractice';
import { CbtExam } from './components/student/CbtExam';
import { ResultsProgress } from './components/student/ResultsProgress';
import { Bookmarks } from './components/student/Bookmarks';
import { Profile } from './components/student/Profile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { AuthScreen } from './components/auth/AuthScreen';
import { AuthGate } from './components/auth/AuthGate';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AiTutorDrawer } from './components/student/AiTutorDrawer';
import { api } from './services/api';
import {
  subscribeToLevels,
  subscribeToSubjects,
  subscribeToNotes,
  subscribeToQuestions,
  subscribeToExams,
  subscribeToAnnouncements,
  subscribeToUserAttempts,
  subscribeToUserBookmarks,
  toggleBookmarkInFirestore,
  seedFirestoreIfEmpty,
  subscribeToAiSettings,
  getAiSettingsFromFirestore,
} from './services/firestoreService';
import {
  NursingLevel,
  Subject,
  StudyNote,
  Question,
  CBTExam,
  Announcement,
  ExamAttempt,
  AiSettings,
} from './types';
import { Search, Loader2, Sparkles, AlertCircle, X, Shield, Lock, ArrowLeft } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, logout } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState('home');
  const [extraParams, setExtraParams] = useState<any>({});

  // Core Data
  const [levels, setLevels] = useState<NursingLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<CBTExam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin_login' | 'forgot_password'>('login');

  // AI Tutor State
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [aiTutorTopic, setAiTutorTopic] = useState('');
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    aiFeaturesEnabled: true,
    aiTutorEnabled: true,
    aiExplanationEnabled: true,
  });

  // Loading & Global Search
  const [isLoading, setIsLoading] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all app data and seed Firestore if necessary
  const fetchData = async () => {
    try {
      const [lvls, subjs, nts, qts, exms, anns] = await Promise.all([
        api.getLevels(),
        api.getSubjects(),
        api.getNotes(),
        api.getQuestions(),
        api.getExams(),
        api.getAnnouncements(),
      ]);

      if (Array.isArray(lvls)) setLevels(lvls);
      if (Array.isArray(subjs)) setSubjects(subjs);
      if (Array.isArray(nts)) setNotes(nts);
      if (Array.isArray(qts)) setQuestions(qts);
      if (Array.isArray(exms)) setExams(exms);
      if (Array.isArray(anns)) setAnnouncements(anns);

      // Auto-seed Firestore in background if Firestore is currently fresh/empty and user is admin
      if (user?.role === 'admin' || user?.email === 'chigaemezuaugustine43@gmail.com' || user?.email === 'tiktokyhung@gmail.com') {
        seedFirestoreIfEmpty({
          levels: lvls,
          subjects: subjs,
          notes: nts,
          questions: qts,
          exams: exms,
          announcements: anns,
        }, user).catch((e) => console.warn('Firestore auto-seed notice:', e));
      }

      if (user) {
        try {
          const [attempts, bmarksData] = await Promise.all([
            api.getAttempts(),
            api.getBookmarks(),
          ]);
          if (Array.isArray(attempts)) setRecentAttempts(attempts);
          setBookmarks(
            Array.isArray(bmarksData)
              ? bmarksData
              : Array.isArray(bmarksData?.bookmarks)
              ? bmarksData.bookmarks
              : []
          );
        } catch (e) {
          console.warn('Could not fetch user attempts/bookmarks', e);
        }
      }
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time Firestore Subscriptions: Single Source of Truth
  // Automatically propagates changes when admin creates, edits, publishes, archives, or deletes content
  useEffect(() => {
    fetchData();

    // Attach real-time listeners to Firestore collections
    const unsubLevels = subscribeToLevels((liveLevels) => {
      if (Array.isArray(liveLevels) && liveLevels.length > 0) {
        setLevels(liveLevels);
      }
      setIsLoading(false);
    });

    const unsubSubjects = subscribeToSubjects((liveSubjects) => {
      if (Array.isArray(liveSubjects) && liveSubjects.length > 0) {
        setSubjects(liveSubjects);
      }
    });

    const unsubNotes = subscribeToNotes((liveNotes) => {
      if (Array.isArray(liveNotes) && liveNotes.length > 0) {
        setNotes(liveNotes);
      }
    }, { publishedOnly: false });

    const unsubQuestions = subscribeToQuestions((liveQuestions) => {
      if (Array.isArray(liveQuestions) && liveQuestions.length > 0) {
        setQuestions(liveQuestions);
      }
    });

    const unsubExams = subscribeToExams((liveExams) => {
      if (Array.isArray(liveExams)) {
        if (liveExams.length > 0) {
          setExams(liveExams);
        } else {
          setExams((prev) => (prev.length > 0 ? prev : []));
        }
      }
    }, { publishedOnly: false });

    const unsubAnnouncements = subscribeToAnnouncements((liveAnnouncements) => {
      if (Array.isArray(liveAnnouncements) && liveAnnouncements.length > 0) {
        setAnnouncements(liveAnnouncements);
      }
    });

    return () => {
      unsubLevels();
      unsubSubjects();
      unsubNotes();
      unsubQuestions();
      unsubExams();
      unsubAnnouncements();
    };
  }, []);

  // Real-time user specific data subscriptions (Attempts & Bookmarks)
  useEffect(() => {
    if (!user) return;

    const unsubAttempts = subscribeToUserAttempts(user.id, (liveAttempts) => {
      if (liveAttempts) {
        setRecentAttempts(liveAttempts);
      }
    });

    const unsubBookmarks = subscribeToUserBookmarks(user.id, (liveBookmarks) => {
      if (liveBookmarks) {
        setBookmarks(liveBookmarks);
      }
    });

    // Auto-seed if admin just logged in and data is present
    if (user.role === 'admin' || user.email === 'chigaemezuaugustine43@gmail.com' || user.email === 'tiktokyhung@gmail.com') {
      if (levels.length > 0) {
        seedFirestoreIfEmpty(
          {
            levels,
            subjects,
            notes,
            questions,
            exams,
            announcements,
          },
          user
        ).catch(() => {});
      }
    }

    return () => {
      unsubAttempts();
      unsubBookmarks();
    };
  }, [user]);

  // Synchronize AI settings across the application
  useEffect(() => {
    getAiSettingsFromFirestore()
      .then((res) => {
        if (res) setAiSettings(res);
        else {
          api
            .getAiSettings()
            .then((s) => {
              if (s) setAiSettings(s);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    const unsubAi = subscribeToAiSettings((settings) => {
      if (settings) {
        setAiSettings(settings);
      }
    });

    return () => unsubAi();
  }, []);

  // Bookmark Toggle
  const handleToggleBookmark = async (type: 'note' | 'question', itemId: string) => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const safeBookmarks = Array.isArray(bookmarks) ? bookmarks : [];
      const isCurrentlyBookmarked = safeBookmarks.some(
        (b) => b.type === type && b.itemId === itemId
      );

      // Optimistic UI update
      if (isCurrentlyBookmarked) {
        setBookmarks((prev) =>
          (Array.isArray(prev) ? prev : []).filter(
            (b) => !(b.type === type && b.itemId === itemId)
          )
        );
      } else {
        setBookmarks((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          { id: `bm-${Date.now()}`, type, itemId, userId: user.id },
        ]);
      }

      // Sync with Firestore & backend API
      toggleBookmarkInFirestore(user.id, type, itemId).catch(() => {});
      await api.toggleBookmark(type, itemId).catch(() => {});
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  // Helper arrays for bookmarks
  const safeBookmarks = Array.isArray(bookmarks) ? bookmarks : [];
  const bookmarkedNoteIds = safeBookmarks
    .filter((b) => b.type === 'note')
    .map((b) => b.itemId);
  const bookmarkedQuestionIds = safeBookmarks
    .filter((b) => b.type === 'question')
    .map((b) => b.itemId);

  // Segmented Content: Single Source of Truth
  // Students ONLY see published content. Admins see all items (draft, published, archived) in AdminDashboard.
  const publishedNotes = notes.filter((n) => {
    const isPub = n.status ? n.status === 'published' : n.isPublished !== false;
    return isPub && n.status !== 'draft' && n.status !== 'archived';
  });

  const publishedExams = exams.filter((e) => {
    const isPub = e.status ? e.status === 'published' : e.isPublished !== false;
    return isPub && e.status !== 'draft' && e.status !== 'archived';
  });

  const savedNotes = publishedNotes.filter((n) => bookmarkedNoteIds.includes(n.id));
  const savedQuestions = questions.filter((q) =>
    bookmarkedQuestionIds.includes(q.id)
  );

  // Navigation Handler
  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setExtraParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSearch = (query: string) => {
    setSearchQuery(query);
    setSearchModalOpen(true);
  };

  // Search Results
  const searchResults = {
    notes: searchQuery
      ? publishedNotes.filter(
          (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.summary.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [],
    questions: searchQuery
      ? questions.filter(
          (q) =>
            q &&
            ((q.questionText || q.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.explanation || q.rationale || '').toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : [],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4 ring-1 ring-teal-400/30">
          <Sparkles className="w-7 h-7 animate-pulse text-teal-200" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">NursesStudy Medical Portal</h2>
        <p className="text-xs text-slate-400 mt-1">
          Synchronizing ND 1 curriculum, clinical question banks & examination hall...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Main Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        levels={levels}
        unreadAnnouncementsCount={announcements.length}
        aiTutorEnabled={aiSettings.aiFeaturesEnabled && aiSettings.aiTutorEnabled}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
        onOpenAiTutor={(topic) => {
          setAiTutorTopic(topic || '');
          setAiTutorOpen(true);
        }}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-20 min-w-0">
        {currentView === 'home' && (
          <StudentHome
            subjects={subjects}
            notes={publishedNotes}
            exams={publishedExams}
            recentAttempts={recentAttempts}
            announcements={announcements}
            levels={levels}
            onNavigate={handleNavigate}
            onSelectSubject={(subjId) => handleNavigate('notes', { subjectId: subjId })}
            onStartExam={(examId) => handleNavigate('cbt', { examId })}
            onOpenSearch={handleOpenSearch}
          />
        )}

        {currentView === 'notes' && (
          <StudyNotes
            notes={publishedNotes}
            subjects={subjects}
            levels={levels}
            selectedNoteId={extraParams?.noteId}
            initialSubjectId={extraParams?.subjectId}
            bookmarkedNoteIds={bookmarkedNoteIds}
            onToggleBookmark={(noteId) => handleToggleBookmark('note', noteId)}
            onNavigateToPractice={(subjectId) => handleNavigate('practice', { subjectId })}
          />
        )}

        {currentView === 'practice' && (
          <QuestionPractice
            questions={questions}
            subjects={subjects}
            initialSubjectId={extraParams?.subjectId}
            bookmarkedQuestionIds={bookmarkedQuestionIds}
            onToggleBookmark={(qId) => handleToggleBookmark('question', String(qId))}
            onRecordAttempt={() => {
              api.getAttempts().then(setRecentAttempts);
            }}
          />
        )}

        {currentView === 'cbt' && (
          <ErrorBoundary fallbackTitle="CBT Examination Hall Error" onReset={() => handleNavigate('cbt')}>
            <CbtExam
              exams={publishedExams}
              activeExamId={extraParams?.examId}
              isLoading={isLoading}
              onFinishExam={(attemptId) => {
                api.getAttempts().then(setRecentAttempts);
                handleNavigate('results', { attemptId });
              }}
              onNavigateHome={() => handleNavigate('home')}
            />
          </ErrorBoundary>
        )}

        {currentView === 'results' && (
          <ResultsProgress
            initialAttemptId={extraParams?.attemptId}
            onRetakeExam={(examId) => handleNavigate('cbt', { examId })}
          />
        )}

        {currentView === 'bookmarks' && (
          <Bookmarks
            notes={savedNotes}
            questions={savedQuestions}
            onOpenNote={(noteId) => handleNavigate('notes', { noteId })}
            onOpenPracticeWithQuestion={(qId) => handleNavigate('practice', { questionId: qId })}
            onRemoveBookmark={(type, id) => handleToggleBookmark(type, id)}
          />
        )}

        {currentView === 'profile' && <Profile levels={levels} />}

        {currentView === 'admin' && (
          user?.role === 'admin' ? (
            <AdminDashboard
              levels={levels}
              subjects={subjects}
              notes={notes}
              questions={questions}
              exams={exams}
              announcements={announcements}
              onDataChanged={fetchData}
              onExitAdmin={() => handleNavigate('home')}
            />
          ) : user?.role === 'student' ? (
            <div className="max-w-md mx-auto my-16 px-4">
              <div className="bg-[#111827] border border-rose-900/60 rounded-3xl shadow-xl p-6 sm:p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Administrator Access Restricted
                </h2>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  You are currently signed in as a student (<strong className="text-slate-200">{user.email}</strong>). The management dashboard and administrative tools are reserved exclusively for the verified platform owner.
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Student Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleNavigate('admin');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Sign Out & Log In as Admin
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AdminLogin
              onLoginSuccess={() => {
                fetchData();
                handleNavigate('admin');
              }}
              onCancel={() => handleNavigate('home')}
            />
          )
        )}
      </main>

      {/* Clinical Portal Footer */}
      <footer className="mt-auto border-t border-slate-800/60 bg-[#09090d] mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-900/30 ring-1 ring-teal-400/30">
                <span className="font-extrabold text-sm">NS</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Nurses<span className="text-teal-400">Study</span> Clinical Platform
                </div>
                <div className="text-xs text-slate-400">
                  National Diploma 1 (ND 1) Nursing Curriculum & CBT Hall
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <button onClick={() => handleNavigate('home')} className="hover:text-teal-400 transition-colors">
                Dashboard
              </button>
              <button onClick={() => handleNavigate('notes')} className="hover:text-teal-400 transition-colors">
                Study Notes
              </button>
              <button onClick={() => handleNavigate('practice')} className="hover:text-teal-400 transition-colors">
                Practice Drills
              </button>
              <button onClick={() => handleNavigate('cbt')} className="hover:text-teal-400 transition-colors">
                CBT Exams
              </button>
              <button onClick={() => handleNavigate('results')} className="hover:text-teal-400 transition-colors">
                Analytics
              </button>
            </div>

            <div className="text-xs text-slate-400 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300">Firestore Cloud Persistent Sync</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                © {new Date().getFullYear()} NursesStudy. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Search Results Overlay Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm p-4 pt-16 sm:pt-24 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#111827] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clinical topics, notes, procedures, pharmacology..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 shadow-inner"
                />
              </div>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Notes Matches */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400 mb-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  Matching Study Notes ({searchResults.notes.length})
                </h4>
                {searchResults.notes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No notes matching "{searchQuery}"</p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.notes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          handleNavigate('notes', { noteId: n.id });
                        }}
                        className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/60 hover:bg-slate-800/80 cursor-pointer transition-all shadow-xs"
                      >
                        <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-800/60 px-2 py-0.5 rounded-md">
                          {n.topic}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-white mt-1.5">{n.title}</h5>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{n.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Questions Matches */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-sky-400 mb-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  Matching Questions ({searchResults.questions.length})
                </h4>
                {searchResults.questions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No questions matching "{searchQuery}"
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.questions.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          handleNavigate('practice', { subjectId: q.subjectId });
                        }}
                        className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-sky-500/60 hover:bg-slate-800/80 cursor-pointer transition-all shadow-xs"
                      >
                        <span className="text-[10px] font-bold text-sky-300 bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded-md">
                          {q.topic}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-white mt-1.5 line-clamp-2">
                          {q.questionText || q.question}
                        </h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        levels={levels}
      />

      {/* AI Study Tutor Drawer */}
      <AiTutorDrawer
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
        initialTopic={aiTutorTopic}
        isEnabled={aiSettings.aiFeaturesEnabled && aiSettings.aiTutorEnabled}
      />

      {/* Floating Ask AI Tutor Button */}
      {currentView !== 'admin' && currentView !== 'cbt' && aiSettings.aiFeaturesEnabled && aiSettings.aiTutorEnabled && (
        <button
          type="button"
          onClick={() => {
            setAiTutorTopic('');
            setAiTutorOpen(true);
          }}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-bold text-xs shadow-xl shadow-teal-900/40 border border-teal-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-1 ring-white/20"
          title="Ask AI Study Tutor"
        >
          <Sparkles className="w-4 h-4 text-teal-100 animate-pulse" />
          <span className="hidden sm:inline">Ask AI Tutor</span>
          <span className="sm:hidden">Tutor</span>
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <MainAppContent />
      </AuthGate>
    </AuthProvider>
  );
}
