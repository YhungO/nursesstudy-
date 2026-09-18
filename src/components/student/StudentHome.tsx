import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Subject,
  StudyNote,
  CBTExam,
  ExamAttempt,
  Announcement,
  NursingLevel,
} from '../../types';
import { IconHelper } from '../common/IconHelper';
import {
  Search,
  BookOpen,
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  Flame,
  CheckCircle2,
  Bell,
  ArrowRight,
  TrendingUp,
  Bookmark,
  GraduationCap,
  Zap,
  BarChart3,
  Layers,
} from 'lucide-react';

interface StudentHomeProps {
  subjects: Subject[];
  notes: StudyNote[];
  exams: CBTExam[];
  recentAttempts: ExamAttempt[];
  announcements: Announcement[];
  levels: NursingLevel[];
  onNavigate: (view: string, extra?: any) => void;
  onSelectSubject: (subjectId: string) => void;
  onStartExam: (examId: string) => void;
  onOpenSearch: (query: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  subjects = [],
  notes = [],
  exams = [],
  recentAttempts = [],
  announcements = [],
  levels = [],
  onNavigate,
  onSelectSubject,
  onStartExam,
  onOpenSearch,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const currentLevel = levels?.find((l) => l.id === user?.levelId);

  // Filter announcements for user's level or 'all'
  const relevantAnnouncements = (announcements || []).filter(
    (a) => a.targetLevel === 'all' || a.targetLevel === user?.levelId
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenSearch(searchQuery.trim());
    }
  };

  // High-yield featured note to "Continue Studying"
  const continueNote = notes[0];

  // Quick stats
  const totalAttempts = recentAttempts.length;
  const passedCount = recentAttempts.filter((a) => a.passed).length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          recentAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts
        )
      : 0;

  // Specialty aesthetic mapper for the 11 ND1 subjects in dark mode
  const getSubjectTheme = (code: string, name: string) => {
    const lower = (code + ' ' + name).toLowerCase();
    if (lower.includes('anat')) {
      return {
        borderHover: 'hover:border-teal-400 hover:shadow-lg hover:shadow-teal-950/40',
        titleHover: 'group-hover:text-teal-300',
        badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
        iconBg: 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30',
        glow: 'from-teal-500/10 to-transparent',
      };
    }
    if (lower.includes('phys')) {
      return {
        borderHover: 'hover:border-rose-400 hover:shadow-lg hover:shadow-rose-950/40',
        titleHover: 'group-hover:text-rose-300',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        iconBg: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30',
        glow: 'from-rose-500/10 to-transparent',
      };
    }
    if (lower.includes('foundation') || lower.includes('nursing science')) {
      return {
        borderHover: 'hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/40',
        titleHover: 'group-hover:text-emerald-300',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        iconBg: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30',
        glow: 'from-emerald-500/10 to-transparent',
      };
    }
    if (lower.includes('pharm')) {
      return {
        borderHover: 'hover:border-sky-400 hover:shadow-lg hover:shadow-sky-950/40',
        titleHover: 'group-hover:text-sky-300',
        badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        iconBg: 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30',
        glow: 'from-sky-500/10 to-transparent',
      };
    }
    if (lower.includes('psych')) {
      return {
        borderHover: 'hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-950/40',
        titleHover: 'group-hover:text-indigo-300',
        badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        iconBg: 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30',
        glow: 'from-indigo-500/10 to-transparent',
      };
    }
    if (lower.includes('primary') || lower.includes('health')) {
      return {
        borderHover: 'hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-950/40',
        titleHover: 'group-hover:text-cyan-300',
        badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        iconBg: 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30',
        glow: 'from-cyan-500/10 to-transparent',
      };
    }
    if (lower.includes('nutrition') || lower.includes('food')) {
      return {
        borderHover: 'hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/40',
        titleHover: 'group-hover:text-emerald-300',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        iconBg: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30',
        glow: 'from-emerald-500/10 to-transparent',
      };
    }
    if (lower.includes('french')) {
      return {
        borderHover: 'hover:border-blue-400 hover:shadow-lg hover:shadow-blue-950/40',
        titleHover: 'group-hover:text-blue-300',
        badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        iconBg: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30',
        glow: 'from-blue-500/10 to-transparent',
      };
    }
    if (lower.includes('entrep')) {
      return {
        borderHover: 'hover:border-amber-400 hover:shadow-lg hover:shadow-amber-950/40',
        titleHover: 'group-hover:text-amber-300',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        iconBg: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30',
        glow: 'from-amber-500/10 to-transparent',
      };
    }
    return {
      borderHover: 'hover:border-teal-400 hover:shadow-lg hover:shadow-teal-950/40',
      titleHover: 'group-hover:text-teal-300',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      iconBg: 'bg-slate-800 text-slate-300 ring-1 ring-slate-700',
      glow: 'from-teal-500/10 to-transparent',
    };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Announcements Bar */}
      {relevantAnnouncements.length > 0 && (
        <div className="space-y-2.5">
          {relevantAnnouncements.slice(0, 2).map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all shadow-md ${
                ann.priority === 'urgent'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-teal-950/40 border-teal-500/40 text-teal-200'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  ann.priority === 'urgent'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      ann.priority === 'urgent'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    }`}
                  >
                    {ann.priority === 'urgent' ? 'Important Notice' : 'Academic Notice'}
                  </span>
                  <h4 className="font-bold text-sm text-white truncate">{ann.title}</h4>
                </div>
                <p className="text-xs mt-1 leading-relaxed text-slate-300">{ann.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern O3Schools-Style Dark Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c121e] via-[#111a2e] to-[#0d1424] text-white p-6 sm:p-9 shadow-2xl border border-slate-800/90">
        {/* Subtle background ambient glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none flex items-center justify-end pr-6">
          <div className="w-80 h-80 rounded-full bg-teal-500/20 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3.5 backdrop-blur-xs">
            <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
            <span>National Diploma 1 (ND 1) Nursing Curriculum Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.name || 'Candidate'} 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
            Prepare for semester examinations and nursing council tests. Choose a learning module below or search through lecture notes and question banks.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-5 relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, lecture notes, medications, vital signs..."
              className="w-full pl-11 pr-24 py-3 bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-900 text-white placeholder:text-slate-500 border border-slate-700/80 focus:border-teal-400 rounded-xl text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Quick Candidate Metrics Strip */}
        <div className="mt-7 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight">{totalAttempts}</div>
              <div className="text-[11px] text-slate-400 font-medium">Tests Taken</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight">{avgScore}%</div>
              <div className="text-[11px] text-slate-400 font-medium">Average Score</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight">{passedCount}</div>
              <div className="text-[11px] text-slate-400 font-medium">Passed Exams</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight">Active</div>
              <div className="text-[11px] text-slate-400 font-medium">Study Readiness</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE SIGNATURE O3SCHOOLS-STYLE COLORFUL GRID OF FEATURE CARDS              */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>Core Learning Hub</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any core feature to launch notes, practice MCQs, or enter the timed CBT hall
            </p>
          </div>
        </div>

        {/* 6 Tactile, High-Contrast Colorful Cards in O3Schools JAMB aesthetic */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {/* 1. Study Notes (Soft Green / Emerald) */}
          <div
            id="home-card-study-notes"
            onClick={() => onNavigate('notes')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-emerald-950/70 via-[#101b24] to-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400/80 shadow-lg shadow-black/20 hover:shadow-emerald-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {subjects.length} Subjects
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                Study Notes
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                Detailed lecture notes, anatomical summaries & syllabus modules.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span className="text-[11px] sm:text-xs">{notes.length} Clinical Notes</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Practice MCQs (Soft Blue / Sky) */}
          <div
            id="home-card-practice-mcq"
            onClick={() => onNavigate('practice')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-sky-950/70 via-[#101b2a] to-blue-950/40 border border-sky-500/30 hover:border-sky-400/80 shadow-lg shadow-black/20 hover:shadow-sky-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-sky-500/10 blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-sky-500/30 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Topic Drills
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-sky-300 transition-colors">
                Practice MCQs
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                Untimed practice drills with instant feedback and answer rationales.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-500/20 flex items-center justify-between text-xs text-sky-400 font-bold">
              <span className="text-[11px] sm:text-xs">Instant Rationales</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. CBT Exams (Soft Purple / Violet) */}
          <div
            id="home-card-cbt-exams"
            onClick={() => onNavigate('cbt')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-purple-950/70 via-[#19152a] to-indigo-950/40 border border-purple-500/30 hover:border-purple-400/80 shadow-lg shadow-black/20 hover:shadow-purple-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-purple-500/10 blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Timed Hall
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors">
                CBT Exam Hall
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                Simulate official computerized examinations with active countdown timer.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs text-purple-400 font-bold">
              <span className="text-[11px] sm:text-xs">{exams.length} Live Exams</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Results & Performance (Soft Amber / Orange) */}
          <div
            id="home-card-results"
            onClick={() => onNavigate('results')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-amber-950/70 via-[#211a14] to-orange-950/40 border border-amber-500/30 hover:border-amber-400/80 shadow-lg shadow-black/20 hover:shadow-amber-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-amber-500/10 blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Analytics
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                Exam Results
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                Detailed scorecards, question review, pass rate trends and analytics.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-400 font-bold">
              <span className="text-[11px] sm:text-xs">{totalAttempts} Completed Attempts</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Saved Bookmarks (Soft Teal / Cyan) */}
          <div
            id="home-card-bookmarks"
            onClick={() => onNavigate('bookmarks')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-teal-950/70 via-[#102022] to-cyan-950/40 border border-teal-500/30 hover:border-teal-400/80 shadow-lg shadow-black/20 hover:shadow-teal-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-teal-500/10 blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-400/30 group-hover:scale-105 transition-transform">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Saved Vault
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors">
                Bookmarks
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                Rapidly review difficult questions & clinical takeaways you saved.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between text-xs text-teal-400 font-bold">
              <span className="text-[11px] sm:text-xs">Quick Revision Vault</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Clinical Pearls & Syllabi (Soft Rose / Coral) */}
          <div
            id="home-card-clinical-pearls"
            onClick={() => onNavigate('notes')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-rose-950/70 via-[#22121a] to-pink-950/40 border border-rose-500/30 hover:border-rose-400/80 shadow-lg shadow-black/20 hover:shadow-rose-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-rose-500/10 blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  High Yield
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-rose-300 transition-colors">
                Clinical Pearls
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                High-yield NCLEX tips, pharmacology pearls & vital interventions.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-400 font-bold">
              <span className="text-[11px] sm:text-xs">High Yield Notes</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Note / Continue Studying Strip */}
      {continueNote && (
        <div className="bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-md">
                Featured Clinical Note
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {continueNote.readingTime} min read
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {continueNote.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {continueNote.summary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('notes', { noteId: continueNote.id })}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-900/30"
            >
              <span>Read Clinical Note</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('practice', { subjectId: continueNote.subjectId })}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Practice MCQs
            </button>
          </div>
        </div>
      )}

      {/* Nursing Subjects Section - Official 11 ND 1 Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                ND 1 Nursing Subjects
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                {subjects.length} Courses
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official National Diploma Year 1 syllabus modules and clinical prerequisites
            </p>
          </div>
          <button
            onClick={() => onNavigate('notes')}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {subjects.map((subj) => {
            const theme = getSubjectTheme(subj.code, subj.name);
            return (
              <div
                key={subj.id}
                onClick={() => {
                  onSelectSubject(subj.id);
                  onNavigate('notes', { subjectId: subj.id });
                }}
                className={`group bg-[#111827]/90 rounded-2xl p-4 sm:p-5 border border-slate-800 ${theme.borderHover} shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-xs`}>
                      <IconHelper name={subj.icon} className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border uppercase ${theme.badge}`}>
                      {subj.code}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm text-white ${theme.titleHover} transition-colors line-clamp-1`}>
                    {subj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {subj.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      <strong className="text-slate-200 font-bold">{subj.noteCount || 0}</strong> Notes
                    </span>
                    <span>•</span>
                    <span className="font-medium">
                      <strong className="text-slate-200 font-bold">{subj.questionCount || 0}</strong> MCQs
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CBT Examinations Preview Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Timed CBT Mock Examinations</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate computerized board exams with timer countdown & instant automatic grading
            </p>
          </div>
          <button
            onClick={() => onNavigate('cbt')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>All Exams</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-[#111827] rounded-2xl p-5 border border-slate-800 hover:border-purple-500/60 hover:shadow-lg transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      {exam.subjectName}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-purple-300">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{exam.durationMinutes} mins</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-white mt-1">{exam.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="mt-3.5 flex items-center gap-3 text-xs text-slate-400">
                    <span className="bg-slate-800/90 px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-slate-300 border border-slate-700">
                      {exam.totalQuestions} Questions
                    </span>
                    <span className="bg-slate-800/90 px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-slate-300 border border-slate-700">
                      Pass: {exam.passingScore}%
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800">
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-900/30"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Start CBT Examination</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 ring-1 ring-purple-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">
                  Ready to practice under exam conditions?
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Launch the Computer-Based Test (CBT) hall to simulate official nursing examination timers and scoring.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('cbt')}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md shadow-purple-900/30"
            >
              Enter CBT Testing Hall
            </button>
          </div>
        )}
      </div>

      {/* Recent Results Section */}
      {recentAttempts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Recent Exam Results</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Your latest test attempts and performance analytics</p>
            </div>
            <button
              onClick={() => onNavigate('results')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-md">
            <div className="divide-y divide-slate-800">
              {recentAttempts.slice(0, 3).map((attempt) => (
                <div
                  key={attempt.id}
                  onClick={() => onNavigate('results', { attemptId: attempt.id })}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-md ${
                        attempt.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {attempt.score}%
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {attempt.examTitle}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(attempt.createdAt).toLocaleDateString()} • {attempt.correctCount}/
                        {attempt.totalQuestions} correct •{' '}
                        {Math.round(attempt.timeSpentSeconds / 60)} min spent
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        attempt.passed
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {attempt.passed ? 'PASSED' : 'RETAKE'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
