import React from 'react';
import {
  Pill,
  Stethoscope,
  Activity,
  Brain,
  ShieldCheck,
  HeartHandshake,
  BookOpen,
  GraduationCap,
  Heart,
  Languages,
  Atom,
  Briefcase,
  Compass,
  Apple,
  FileText,
  HelpCircle,
  Clock,
  Award,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Bell,
  User,
  Settings,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  RotateCcw,
  Sparkles,
  BarChart3,
  Users,
  Layers,
  Lock,
  LogOut,
  Sliders,
} from 'lucide-react';

interface IconHelperProps {
  name: string;
  className?: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Pill':
      return <Pill className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    case 'Atom':
      return <Atom className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Apple':
      return <Apple className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export {
  Pill,
  Stethoscope,
  Activity,
  Brain,
  ShieldCheck,
  HeartHandshake,
  BookOpen,
  GraduationCap,
  FileText,
  HelpCircle,
  Clock,
  Award,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Bell,
  User as UserIcon,
  Settings,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  RotateCcw,
  Sparkles,
  BarChart3,
  Users,
  Layers,
  Lock,
  LogOut,
  Sliders,
};
