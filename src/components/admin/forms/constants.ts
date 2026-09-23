import {
  Pill,
  Stethoscope,
  HeartHandshake,
  Activity,
  Brain,
  ShieldCheck,
  Microscope,
  BookOpen,
  FileText,
  Award,
} from 'lucide-react';

export interface LevelOption {
  id: string;
  label: string;
  badge: string;
  badgeClass: string;
  description: string;
}

export const NURSING_LEVEL_OPTIONS: LevelOption[] = [
  {
    id: 'lvl-nd1',
    label: 'ND 1 - National Diploma 1',
    badge: 'ND 1',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Foundation nursing, anatomy, physiology, and pre-clinical arts',
  },
  {
    id: 'lvl-nd2',
    label: 'ND 2 - National Diploma 2',
    badge: 'ND 2',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Pharmacology, community health, and med-surg foundations',
  },
  {
    id: 'lvl-hnd',
    label: 'HND - Higher National Diploma',
    badge: 'HND',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Advanced nursing practice, maternal-child health, and ward management',
  },
  {
    id: 'lvl-1',
    label: 'Year 1 - Basic Nursing',
    badge: 'Year 1',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Fundamentals of nursing, medical ethics, and microbiology',
  },
  {
    id: 'lvl-2',
    label: 'Year 2 - Intermediate & Pharmacology',
    badge: 'Year 2',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Clinical pharmacology, pathology, and clinical assessments',
  },
  {
    id: 'lvl-3',
    label: 'Year 3 - Advanced Med-Surg',
    badge: 'Year 3',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Critical care, pediatric nursing, emergency, and psychiatry',
  },
  {
    id: 'lvl-4',
    label: 'Final Year - Midwifery & Public Health',
    badge: 'Final Year',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'Obstetrics, public health administration, and clinical research',
  },
  {
    id: 'lvl-5',
    label: 'RN Prep - Licensure & Board Exam',
    badge: 'RN Prep',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'NMCN Licensure, NCLEX exam drills, and comprehensive CBT revision',
  },
  {
    id: 'all',
    label: 'All Levels (Universal Nursing Core)',
    badge: 'All Levels',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    description: 'Cross-cohort clinical curriculum accessible by all students',
  },
];

export const getLevelBadge = (levelId?: string): { badge: string; badgeClass: string } => {
  if (!levelId || levelId === 'all') {
    return { badge: 'All Levels', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
  const cleanId = levelId.toLowerCase().replace(/[\s-_]/g, '');
  const match = NURSING_LEVEL_OPTIONS.find(
    (o) =>
      o.id === levelId ||
      o.badge.toLowerCase() === levelId.toLowerCase() ||
      o.id.toLowerCase().replace(/[\s-_]/g, '') === cleanId ||
      o.badge.toLowerCase().replace(/[\s-_]/g, '') === cleanId
  );
  if (match) return { badge: match.badge, badgeClass: match.badgeClass };

  const legacyMap: Record<string, { badge: string; badgeClass: string }> = {
    'lvl-nd1': { badge: 'ND 1', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    'nd1': { badge: 'ND 1', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    'lvl-nd2': { badge: 'ND 2', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'nd2': { badge: 'ND 2', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'lvl-hnd': { badge: 'HND', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
    'hnd': { badge: 'HND', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
    'lvl-1': { badge: 'Year 1', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'year1': { badge: 'Year 1', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'lvl-2': { badge: 'Year 2', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' },
    'year2': { badge: 'Year 2', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' },
    'lvl-3': { badge: 'Year 3', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    'year3': { badge: 'Year 3', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    'lvl-4': { badge: 'Final Year', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
    'lvl-5': { badge: 'RN Prep', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return legacyMap[levelId] || legacyMap[cleanId] || { badge: levelId, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
};

export const SUBJECT_COLORS = [
  { id: 'teal', label: 'Clinical Teal', bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-600', ring: 'ring-teal-500' },
  { id: 'indigo', label: 'Academic Indigo', bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600', ring: 'ring-indigo-500' },
  { id: 'blue', label: 'Hospital Blue', bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600', ring: 'ring-blue-500' },
  { id: 'rose', label: 'Emergency Rose', bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-600', ring: 'ring-rose-500' },
  { id: 'amber', label: 'Maternal Amber', bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600', ring: 'ring-amber-500' },
  { id: 'emerald', label: 'Health Emerald', bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-500' },
  { id: 'purple', label: 'Specialist Purple', bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600', ring: 'ring-purple-500' },
];

export const SUBJECT_ICONS = [
  { id: 'Pill', label: 'Pill (Pharmacology)', icon: Pill },
  { id: 'Stethoscope', label: 'Stethoscope (Med-Surg)', icon: Stethoscope },
  { id: 'HeartHandshake', label: 'HeartHandshake (Maternal / Care)', icon: HeartHandshake },
  { id: 'Activity', label: 'Activity (Anatomy & Physiology)', icon: Activity },
  { id: 'Brain', label: 'Brain (Psychiatric & Mental Health)', icon: Brain },
  { id: 'ShieldCheck', label: 'ShieldCheck (Foundations & Ethics)', icon: ShieldCheck },
  { id: 'Microscope', label: 'Microscope (Microbiology & Labs)', icon: Microscope },
  { id: 'BookOpen', label: 'BookOpen (General Study)', icon: BookOpen },
  { id: 'FileText', label: 'FileText (Documentation & Records)', icon: FileText },
  { id: 'Award', label: 'Award (Licensure & Board Prep)', icon: Award },
];
