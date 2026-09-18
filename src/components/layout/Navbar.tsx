import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NursingLevel } from '../../types';
import {
  Activity,
  BookOpen,
  HelpCircle,
  Clock,
  Award,
  Bookmark,
  Shield,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  Bell,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  levels?: NursingLevel[];
  onOpenAuth: (mode?: 'login' | 'register' | 'admin_login') => void;
  unreadAnnouncementsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  levels = [],
  onOpenAuth,
  unreadAnnouncementsCount = 0,
}) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLevel = levels?.find((l) => l.id === user?.levelId);

  const navItems = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'practice', label: 'Practice MCQs', icon: HelpCircle },
    { id: 'cbt', label: 'CBT Hall', icon: Clock },
    { id: 'results', label: 'My Results', icon: Award },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#07070a]/95 backdrop-blur-md border-b border-slate-800/60 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand Identity */}
            <div className="flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-3 text-left group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 group-hover:scale-[1.03] transition-all ring-1 ring-teal-400/30">
                  <Activity className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-white">
                      Nurses<span className="text-teal-400">Study</span>
                    </span>
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                      Portal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium tracking-normal hidden sm:block">
                    Clinical Nursing Education & CBT Hall
                  </p>
                </div>
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-normal transition-all duration-150 ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 ml-0.5 shadow-xs shadow-teal-400" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Area */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Cloud Firestore Live Status Pill */}
              <div
                className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 text-slate-300 border border-slate-700/60 text-[11px] font-medium shadow-inner"
                title="Connected to Google Cloud Firestore with real-time listeners"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-200">Firestore Cloud</span>
                <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider">Syncing</span>
              </div>

              {/* Admin Portal Gateway Button */}
              {user?.role === 'admin' ? (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    currentView === 'admin'
                      ? 'bg-teal-600 text-white shadow-teal-900/30'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('admin_login')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-all shadow-xs"
                  title="Sign in as Administrator"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admin Access</span>
                </button>
              )}

              {/* User / Auth State */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-700/80 hover:border-teal-500/80 bg-slate-800/80 hover:bg-slate-800 transition-all shadow-xs text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-xs font-bold text-slate-200 leading-tight">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-teal-400 font-semibold truncate max-w-[110px]">
                        {user.role === 'admin' ? 'Sole Owner' : currentLevel?.badge || 'Student'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#111827] rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-slate-800">
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                            {user.role === 'admin' ? 'Sole Owner & Admin' : currentLevel?.name || 'ND 1 Student'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onNavigate('profile');
                          }}
                          className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Student Profile & Academic Record
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onNavigate('results');
                          }}
                          className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <Award className="w-4 h-4 text-slate-400" />
                          Previous CBT Results & Analytics
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onNavigate('bookmarks');
                          }}
                          className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          Saved Clinical Notes & MCQs
                        </button>
                      </div>

                      <div className="pt-1.5 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out of Session
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Direct One-Click Log Out Button */}
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/40 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    title="Log Out"
                    id="navbar-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">Log Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0c121e] px-4 pt-3 pb-5 space-y-1.5 shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {user?.role === 'admin' ? (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white shadow-md mt-3 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-white" />
                Administrator Dashboard
              </button>
            ) : !user ? (
              <button
                onClick={() => {
                  onOpenAuth('admin_login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 mt-3 border border-dashed border-slate-700 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                Admin Portal Login
              </button>
            ) : null}

            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/30 mt-3 border border-rose-900/40 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Log Out of Session
              </button>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Optimized for Thumb Reach in O3Schools Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090e17]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all ${
            currentView === 'home'
              ? 'bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('notes')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all ${
            currentView === 'notes'
              ? 'bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Notes</span>
        </button>
        <button
          onClick={() => onNavigate('practice')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all ${
            currentView === 'practice'
              ? 'bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <HelpCircle className="w-4 h-4 mb-0.5" />
          <span>Practice</span>
        </button>
        <button
          onClick={() => onNavigate('cbt')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all ${
            currentView === 'cbt'
              ? 'bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span>CBT Hall</span>
        </button>
        <button
          onClick={() => onNavigate('results')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all ${
            currentView === 'results'
              ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" />
          <span>Results</span>
        </button>
      </div>
    </>
  );
};
