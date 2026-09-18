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
  CheckCircle2,
  Bell,
  Bookmark,
  GraduationCap,
  Trophy,
  HeartPulse,
  X,
  Activity,
  AlertCircle,
  ShieldCheck,
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

interface ClinicalCase {
  id: string;
  title: string;
  category: string;
  patientAgeGender: string;
  setting: string;
  chiefComplaint: string;
  vitals: {
    bp: string;
    hr: string;
    rr: string;
    temp: string;
    spo2: string;
  };
  clinicalFindings: string[];
  priorityDiagnosis: string;
  priorityInterventions: string[];
  rationale: string;
}

const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case-1',
    title: 'Post-Operative Thyroidectomy: Hypocalcemia',
    category: 'Endocrine & Surgical Nursing',
    patientAgeGender: '38-year-old Female',
    setting: 'Post-Anesthesia Care Unit (PACU)',
    chiefComplaint: 'Numbness around mouth, muscle twitching, and tingling in fingers 8 hours post-total thyroidectomy.',
    vitals: {
      bp: '138/88 mmHg',
      hr: '84 bpm',
      rr: '18 bpm',
      temp: '37.1 °C',
      spo2: '98% on room air',
    },
    clinicalFindings: [
      'Positive Chvostek’s sign (facial muscle spasm upon tapping facial nerve)',
      'Positive Trousseau’s sign (carpal spasm during BP cuff inflation)',
      'Laryngeal stridor heard intermittently upon respiration',
    ],
    priorityDiagnosis: 'Risk for Ineffective Airway Clearance & Hypocalcemic Tetany secondary to parathyroid trauma.',
    priorityInterventions: [
      'Immediately notify surgeon and anesthesia team',
      'Keep IV Calcium Gluconate (10%) and sterile tracheostomy tray at bedside',
      'Maintain patient in semi-Fowler position with neck supported',
      'Monitor cardiac telemetry for QT interval prolongation',
    ],
    rationale: 'Accidental excision or vascular compromise of parathyroid glands leads to rapid calcium drop. Laryngeal spasm can cause sudden fatal airway obstruction.',
  },
  {
    id: 'case-2',
    title: 'Diabetic Ketoacidosis (DKA) Crisis',
    category: 'Medical-Surgical & Metabolic',
    patientAgeGender: '22-year-old Male',
    setting: 'Emergency Assessment Unit',
    chiefComplaint: 'Nausea, persistent vomiting, abdominal pain, and lethargy over the last 24 hours.',
    vitals: {
      bp: '94/60 mmHg',
      hr: '124 bpm',
      rr: '28 bpm (Kussmaul breathing)',
      temp: '37.8 °C',
      spo2: '96% on room air',
    },
    clinicalFindings: [
      'Blood glucose: 480 mg/dL with severe ketonuria',
      'Fruity/acetone breath odor detected upon examination',
      'Arterial Blood Gas: pH 7.18, HCO3 12 mEq/L (Metabolic Acidosis)',
    ],
    priorityDiagnosis: 'Deficient Fluid Volume related to osmotic diuresis and severe metabolic ketoacidosis.',
    priorityInterventions: [
      'Administer rapid fluid resuscitation: 0.9% Normal Saline (1 L/hr initially)',
      'Verify serum potassium is ≥ 3.5 mEq/L before starting continuous regular insulin IV infusion',
      'Insert Foley catheter for strict hourly intake and output monitoring',
      'Switch fluids to 5% Dextrose in 0.45% Saline once blood glucose reaches 250 mg/dL',
    ],
    rationale: 'Fluid resuscitation restores circulating volume. Insulin drives potassium into cells; starting insulin with low potassium can trigger fatal cardiac arrhythmias.',
  },
  {
    id: 'case-3',
    title: 'Acute Pediatric Asthma Exacerbation',
    category: 'Pediatric & Respiratory',
    patientAgeGender: '6-year-old Female',
    setting: 'Pediatric Emergency Unit',
    chiefComplaint: 'Progressive shortness of breath, wheezing, and inability to speak in full sentences.',
    vitals: {
      bp: '102/64 mmHg',
      hr: '138 bpm',
      rr: '36 bpm',
      temp: '36.9 °C',
      spo2: '89% on room air',
    },
    clinicalFindings: [
      'Bilateral expiratory and inspiratory musical wheezing on lung auscultation',
      'Intercostal and substernal retractions with nasal flaring',
      'Sitting forward in tripod position',
    ],
    priorityDiagnosis: 'Impaired Gas Exchange related to severe bronchospasm and airway mucosal edema.',
    priorityInterventions: [
      'Apply supplemental humidified oxygen to maintain SpO2 ≥ 94%',
      'Deliver high-dose nebulized Albuterol with Ipratropium bromide',
      'Administer systemic corticosteroids (IV Methylprednisolone or oral Dexamethasone)',
      'Maintain calm, low-stress environment and stay with patient',
    ],
    rationale: 'Rapid bronchodilation with beta-2 agonists relieves smooth muscle constriction, while corticosteroids suppress inflammatory airway edema.',
  },
  {
    id: 'case-4',
    title: 'Postpartum Hemorrhage (PPH) Recognition',
    category: 'Maternal & Obstetric',
    patientAgeGender: '29-year-old Female (G2P2)',
    setting: 'Labor & Delivery Recovery Ward',
    chiefComplaint: 'Feeling dizzy and lightheaded with heavy bleeding 45 minutes after vaginal delivery.',
    vitals: {
      bp: '88/54 mmHg',
      hr: '118 bpm',
      rr: '22 bpm',
      temp: '36.6 °C',
      spo2: '97% on room air',
    },
    clinicalFindings: [
      'Fundus is soft, boggy, and displaced to the right above the umbilicus',
      'Perineal pad fully saturated in 15 minutes with dark blood clots',
      'Skin is pale, cool, and clammy to touch',
    ],
    priorityDiagnosis: 'Deficient Fluid Volume related to uterine atony and uncontrolled postpartum hemorrhage.',
    priorityInterventions: [
      'Immediately perform vigorous fundal massage until uterus becomes firm',
      'Administer IV Oxytocin infusion as per protocol',
      'Straight catheterize to relieve full bladder causing uterine displacement',
      'Establish two large-bore IV lines (16 or 18 gauge) for fluid/blood access',
    ],
    rationale: 'Uterine atony is the primary cause of postpartum hemorrhage. Fundal massage stimulates myometrial contraction to compress bleeding vessels.',
  },
];

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

  // Modals for Leaderboard & Clinical Cases
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showClinicalCasesModal, setShowClinicalCasesModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(CLINICAL_CASES[0]);

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

  // Primary featured CBT exam
  const featuredExam = exams[0];

  // Quick stats
  const totalAttempts = recentAttempts.length;
  const passedCount = recentAttempts.filter((a) => a.passed).length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          recentAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts
        )
      : 0;

  // Cohort leaderboard preview
  const cohortLeaderboard = [
    { rank: 1, name: 'Chioma Adebayo', school: 'UCH Ibadan', avgScore: 96, attempts: 14 },
    { rank: 2, name: 'Ibrahim Musa', school: 'ABUTH Zaria', avgScore: 94, attempts: 12 },
    { rank: 3, name: user?.name || 'Registered Candidate', school: user?.school || 'College of Nursing', avgScore: avgScore > 0 ? avgScore : 91, attempts: Math.max(totalAttempts, 4), isCurrentUser: true },
    { rank: 4, name: 'Blessing Okon', school: 'LASCON Lagos', avgScore: 89, attempts: 11 },
    { rank: 5, name: 'Emeka Nwosu', school: 'UNTH Enugu', avgScore: 88, attempts: 9 },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-150">
      {/* 1. Academic Notice (Only if present, compact 1-line) */}
      {relevantAnnouncements.length > 0 && (
        <div className="p-3 rounded-xl border border-teal-500/20 bg-[#0c1815] text-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="font-semibold text-white truncate">
              {relevantAnnouncements[0].title}:
            </span>
            <span className="text-slate-400 truncate hidden sm:inline">
              {relevantAnnouncements[0].content}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 shrink-0 uppercase">
            Notice
          </span>
        </div>
      )}

      {/* 2. Top Header & Candidate Command Strip (Clean, Flat, Minimal) */}
      <div className="rounded-2xl bg-[#0d0f14] border border-slate-800/80 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-[11px] font-medium border border-teal-500/20">
                <GraduationCap className="w-3 h-3 text-teal-400" />
                ND 1 Nursing
              </span>
              {user?.school && (
                <span className="text-[11px] text-slate-400 truncate max-w-xs">
                  {user.school}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}
            </h1>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
            <div className="px-3 py-1 rounded-lg bg-[#14161f] border border-slate-800">
              <span className="text-slate-400">Tests:</span> <strong className="text-white">{totalAttempts}</strong>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#14161f] border border-slate-800">
              <span className="text-slate-400">Average:</span> <strong className="text-teal-400">{avgScore}%</strong>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#14161f] border border-slate-800">
              <span className="text-slate-400">Passed:</span> <strong className="text-emerald-400">{passedCount}</strong>
            </div>
          </div>
        </div>

        {/* Clean Flat Search Input */}
        <form onSubmit={handleSearchSubmit} className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, notes, nursing concepts..."
            className="w-full pl-10 pr-20 py-2.5 bg-[#12141c] text-white placeholder:text-slate-500 border border-slate-800 focus:border-teal-500/80 rounded-xl text-xs sm:text-sm focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 3. SIGNATURE O3SCHOOLS-STYLE 2-COLUMN CARD GRID (Clean, Soft Pastels)     */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Learning Modules</span>
          </h2>
          <span className="text-xs text-slate-500">Tap a card to start</span>
        </div>

        {/* 2-Column Grid with Soft Muted Pastel Backgrounds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Practice Mode (Soft Pastel Blue) */}
          <div
            id="home-card-practice-mode"
            onClick={() => onNavigate('practice')}
            className="group rounded-2xl p-4 sm:p-5 bg-[#0e1726] hover:bg-[#121f33] border border-sky-500/20 hover:border-sky-500/40 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-sky-300 transition-colors truncate">
                  Practice Mode
                </h3>
                <ChevronRight className="w-4 h-4 text-sky-400/60 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Untimed question drills with instant clinical rationales
              </p>
            </div>
          </div>

          {/* 2. CBT Hall (Soft Pastel Purple) */}
          <div
            id="home-card-cbt-hall"
            onClick={() => onNavigate('cbt')}
            className="group rounded-2xl p-4 sm:p-5 bg-[#171226] hover:bg-[#1f1833] border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors truncate">
                  CBT Hall
                </h3>
                <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Official timed exams with countdown timer and scoring
              </p>
            </div>
          </div>

          {/* 3. Notes (Soft Pastel Teal / Green - Brand Color) */}
          <div
            id="home-card-notes"
            onClick={() => onNavigate('notes')}
            className="group rounded-2xl p-4 sm:p-5 bg-[#0c1a17] hover:bg-[#10231f] border border-teal-500/20 hover:border-teal-500/40 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors truncate">
                  Study Notes
                </h3>
                <ChevronRight className="w-4 h-4 text-teal-400/60 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Curriculum lecture notes, summaries, and key points
              </p>
            </div>
          </div>

          {/* 4. Results & Performance (Soft Pastel Orange / Amber) */}
          <div
            id="home-card-results"
            onClick={() => onNavigate('results')}
            className="group rounded-2xl p-4 sm:p-5 bg-[#1f170d] hover:bg-[#291f11] border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
                  Results & Analytics
                </h3>
                <ChevronRight className="w-4 h-4 text-amber-400/60 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Review scorecards, test breakdown, and performance
              </p>
            </div>
          </div>

          {/* 5. Bookmarks (Soft Pastel Green / Sage) */}
          <div
            id="home-card-bookmarks"
            onClick={() => onNavigate('bookmarks')}
            className="group rounded-2xl p-4 sm:p-5 bg-[#0e1a14] hover:bg-[#13231a] border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Bookmark className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors truncate">
                  Saved Bookmarks
                </h3>
                <ChevronRight className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Quick revision of saved questions and clinical notes
              </p>
            </div>
          </div>

          {/* 6. Leaderboard (Soft Pastel Indigo) */}
          <div
            id="home-card-leaderboard"
            onClick={() => setShowLeaderboardModal(true)}
            className="group rounded-2xl p-4 sm:p-5 bg-[#121626] hover:bg-[#171d33] border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors truncate">
                  Leaderboard
                </h3>
                <ChevronRight className="w-4 h-4 text-indigo-400/60 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Compare scores with fellow ND 1 nursing peers
              </p>
            </div>
          </div>

          {/* 7. Virtual Labs / Clinical Cases (Soft Pastel Pink / Rose - Spans 2 cols on tablet/desktop) */}
          <div
            id="home-card-clinical-cases"
            onClick={() => setShowClinicalCasesModal(true)}
            className="group rounded-2xl p-4 sm:p-5 bg-[#21111a] hover:bg-[#2c1723] border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer flex items-center gap-4 sm:col-span-2"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-rose-300 transition-colors truncate">
                    Clinical Cases & Virtual Labs
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    Interactive
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400/60 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Simulated patient cases: triage, vital signs, priority diagnoses, and interventions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Featured Live Examination (Clean, Flat, 1-Line) */}
      {featuredExam && (
        <div className="rounded-2xl bg-[#0f1118] border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded">
                  Active CBT Exam
                </span>
                <span className="text-xs text-slate-400">
                  {featuredExam.durationMinutes} Mins • {featuredExam.totalQuestions} Questions
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                {featuredExam.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => onStartExam(featuredExam.id)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Start Exam</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Minimal ND 1 Subjects Catalog */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            ND 1 Nursing Courses ({subjects.length})
          </h2>
          <button
            onClick={() => onNavigate('notes')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            View All Notes
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              onClick={() => {
                onSelectSubject(subj.id);
                onNavigate('notes', { subjectId: subj.id });
              }}
              className="bg-[#0e0f14] hover:bg-[#13151c] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <IconHelper name={subj.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{subj.name}</div>
                  <div className="text-[11px] text-slate-400">{subj.code} • {subj.noteCount || 0} notes</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEADERBOARD MODAL                                                         */}
      {/* ========================================================================= */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[#0e1017] border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-3 text-white"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">ND 1 Cohort Leaderboard</h3>
              </div>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {cohortLeaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    item.isCurrentUser
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-white font-semibold'
                      : 'bg-[#12141c] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 font-bold text-slate-400">#{item.rank}</span>
                    <div>
                      <div className="text-white">{item.name} {item.isCurrentUser && '(You)'}</div>
                      <div className="text-[10px] text-slate-500">{item.school}</div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-teal-400">
                    {item.avgScore}%
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowLeaderboardModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition-colors mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLINICAL CASES MODAL                                                      */}
      {/* ========================================================================= */}
      {showClinicalCasesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl bg-[#0e1017] border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-3 text-white max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Clinical Case Simulation</h3>
                  <p className="text-[11px] text-slate-400">Patient assessment and priority interventions</p>
                </div>
              </div>
              <button
                onClick={() => setShowClinicalCasesModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Case Selector Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
              {CLINICAL_CASES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                    selectedCase?.id === c.id
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                      : 'bg-[#12141c] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {c.title.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Case Details */}
            {selectedCase && (
              <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
                <div className="bg-[#12141c] p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-rose-400 uppercase">{selectedCase.category}</div>
                  <h4 className="font-bold text-white text-sm">{selectedCase.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{selectedCase.chiefComplaint}</p>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="bg-[#12141c] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500">BP</div>
                    <div className="font-bold text-white">{selectedCase.vitals.bp}</div>
                  </div>
                  <div className="bg-[#12141c] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500">HR</div>
                    <div className="font-bold text-white">{selectedCase.vitals.hr}</div>
                  </div>
                  <div className="bg-[#12141c] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500">RR</div>
                    <div className="font-bold text-white">{selectedCase.vitals.rr}</div>
                  </div>
                  <div className="bg-[#12141c] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500">Temp</div>
                    <div className="font-bold text-white">{selectedCase.vitals.temp}</div>
                  </div>
                  <div className="bg-[#12141c] p-2 rounded-lg border border-slate-800 text-center col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-500">SpO2</div>
                    <div className="font-bold text-teal-400">{selectedCase.vitals.spo2}</div>
                  </div>
                </div>

                {/* Priority Actions */}
                <div className="bg-[#12141c] p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-teal-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Priority Nursing Actions:</span>
                  </div>
                  <ul className="space-y-1 list-disc list-inside text-slate-300 leading-relaxed">
                    {selectedCase.priorityInterventions.map((pi, idx) => (
                      <li key={idx}>{pi}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowClinicalCasesModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition-colors shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
