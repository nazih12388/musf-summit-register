import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Layers,
  BookOpen,
  Calendar,
  Globe,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  ZapOff,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { isReducedMotion, setReducedMotionPreference, SPRING_POP } from '../motion';

export const ProfileScreen = ({
  student,
  cl,
  sec,
  team,
  myRegisteredWingPrograms = [],
  myProgramsList = [],
  onBack,
  onNavigate
}) => {
  const { tr, lang, toggleLanguage } = useLanguage();
  const { logout } = useAuth();
  const [reduced, setReducedState] = useState(isReducedMotion());
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const handleToggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('musf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('musf_theme', 'light');
    }
  };

  const handleToggleReducedMotion = () => {
    const next = !reduced;
    setReducedState(next);
    setReducedMotionPreference(next);
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      <Hero
        variant="inner"
        title={tr('Student Profile', 'വിദ്യാർത്ഥി പ്രൊഫൈൽ')}
        subtitle={tr('Academic identity and personalized union settings', 'വിദ്യാർത്ഥി വിവരങ്ങളും ക്രമീകരണങ്ങളും')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-6">
        {/* Academic Identity Card */}
        <Card className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {student?.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#0E7C86] dark:ring-teal-400"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E7C86] to-[#0A575E] text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
                  {student?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="min-w-0 space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                {toTitleCase(student?.name || 'Student Name')}
              </h3>
              <p className="text-xs text-[#0E7C86] dark:text-teal-400 font-semibold font-mono tracking-wide">
                CIC: {student?.cicNo || 'Unassigned'}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <Tag variant="grey">{cl?.name || student?.className || 'Class'}</Tag>
                {sec?.name && <Tag variant="grey">Sec {sec.name}</Tag>}
                {team?.name && <Tag variant="teal">{team.name}</Tag>}
              </div>
            </div>
          </div>

          {/* Academic Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Class</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{cl?.name || '—'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Section</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{sec?.name || 'A'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">House Team</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{team?.name || '—'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Roll No</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{student?.rollNo || '—'}</p>
            </div>
          </div>
        </Card>

        {/* Activity & Participation Summary */}
        <div className="space-y-3">
          <SectionHeader
            title={tr('Activity Engagement', 'പ്രവർത്തനങ്ങൾ')}
            subtitle={tr('Co-curricular enrollment across wings and summits', 'വിവിധ വിംഗുകളിലെ പങ്കാളിത്തം')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0E7C86] dark:text-teal-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {tr('Wing Programs', 'വിംഗ് പരിപാടികൾ')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {myRegisteredWingPrograms.length} registered activities
                  </p>
                </div>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {myRegisteredWingPrograms.length}
              </span>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {tr('Summit Events', 'സമ്മിറ്റ് മത്സരങ്ങൾ')}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {myProgramsList.length} enrolled competitions
                  </p>
                </div>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {myProgramsList.length}
              </span>
            </Card>
          </div>

          {/* Monthly Participation & Personal Activity Report Card */}
          <Card className="p-4 bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-slate-900 dark:to-[#0F2A4A] border-teal-200 dark:border-teal-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#0E7C86] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#0F2A4A] dark:text-white truncate">
                  {tr('Monthly Participation Report', 'പ്രതിമാസ പ്രവർത്തന റിപ്പോർട്ട്')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 truncate">
                  {tr('Generate & print your participation records for selected months', 'തിരഞ്ഞെടുത്ത മാസങ്ങളിലെ പങ്കാളിത്ത രേഖകൾ')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('activity_report')}
              className="px-3.5 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#0c6b74] text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <span>{tr('View Report', 'റിപ്പോർട്ട്')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Card>
        </div>

        {/* App Settings */}
        <div className="space-y-3">
          <SectionHeader
            title={tr('Preferences', 'ക്രമീകരണങ്ങൾ')}
            subtitle={tr('Language, display, and animation preferences', 'ഭാഷ, തീം, ആനിമേഷൻ ക്രമീകരണങ്ങൾ')}
          />

          <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
            {/* Language Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tr('Language', 'ഭാഷ')}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ml' ? 'മലയാളം' : 'English'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {lang === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക'}
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tr('Dark Appearance', 'ഡാർക്ക് മോഡ്')}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    {isDark ? 'Dark theme enabled' : 'Light theme active'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleDark}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  isDark ? 'bg-[#0E7C86]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                    isDark ? 'transform translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Reduce Animations Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <ZapOff className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tr('Reduce Animations', 'ആനിമേഷനുകൾ കുറയ്ക്കുക')}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    {reduced ? 'Minimal motion active' : 'Full motion enabled'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleReducedMotion}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  reduced ? 'bg-[#0E7C86]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                    reduced ? 'transform translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Sign Out */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {tr('Sign Out', 'ലോഗൗട്ട്')}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    End current student session
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out?')) {
                    logout();
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
