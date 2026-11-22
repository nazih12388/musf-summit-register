import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Crown,
  Trophy,
  Palette,
  BookOpen,
  HeartHandshake,
  GraduationCap,
  Camera,
  Folder,
  Calendar,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  Shield,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  LogIn,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { LiveScoreboard } from '../scoreboard/LiveScoreboard';

const ICON_MAP = {
  Palette,
  BookOpen,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Folder
};

export const PublicUnionHome = ({ onOpenLogin, isDark, setIsDark }) => {
  const {
    wings = [],
    unionOfficials = [],
    wingPrograms = [],
    teamStandings = [],
    settings = {}
  } = useApp();
  const { lang, toggleLanguage } = useLanguage();

  const [viewingScoreboard, setViewingScoreboard] = useState(false);
  const [selectedWing, setSelectedWing] = useState('all');

  // Officials categorized
  const executiveOfficials = unionOfficials.filter(o => o.category === 'executive');
  const convenerOfficials = unionOfficials.filter(o => o.category === 'convener');

  // Filtered programs
  const publicPrograms = wingPrograms.filter(p =>
    selectedWing === 'all' || p.wingId === selectedWing
  );

  if (viewingScoreboard) {
    return (
      <div className="min-h-screen bg-[#080E18] text-white">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between border-b border-slate-800">
          <button
            type="button"
            onClick={() => setViewingScoreboard(false)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            &larr; Back to Union Showcase
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Fine Arts Summit Projector Mode
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <LiveScoreboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Iridescent Brand Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#0E7C86] via-indigo-500 via-amber-400 via-rose-500 to-[#0E7C86] bg-[length:200%_100%] animate-shimmer" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#0E7C86]/60 dark:ring-teal-400/60 shadow-xs bg-[#0F2A4A] shrink-0">
              <img src="/college-campus.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-xs sm:text-sm text-[#0F2A4A] dark:text-white leading-tight">
                  {settings.collegeName || 'Majlis Umariyya Wafy College'}
                </h2>
              </div>
              <span className="text-[10px] text-[#0E7C86] dark:text-teal-400 font-bold uppercase tracking-wider block">
                MUSF Students' Union
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Leaderboard Button */}
            <button
              type="button"
              onClick={() => setViewingScoreboard(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Summit Projector</span>
              <span className="sm:hidden">Scores</span>
            </button>

            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4 text-[#0E7C86]" />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setIsDark && setIsDark(prev => !prev)}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#334E73]" />}
            </button>

            {/* Login Button with Vibrant Gradient */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0E7C86] via-[#14919D] to-[#0F2A4A] hover:from-[#11919D] hover:to-[#173860] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-900/15 active:scale-95 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-12">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl bg-gradient-to-br from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86] text-white p-6 sm:p-12 shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Academic Year {settings.academicYear || '2025–2026'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              MUSF Students' Union
              <span className="block text-teal-300 text-xl sm:text-3xl font-bold mt-1">
                Majlis Umariyya Wafy College
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              Fostering collegiate excellence, intellectual dialogue, moral leadership, artistic expression, and social responsibility across our 6 autonomous union wings.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition"
              >
                <span>Student / Officer Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewingScoreboard(true)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md border border-white/20 active:scale-95 transition"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Fine Arts Summit Live Leaderboard</span>
              </button>
            </div>
          </div>
        </section>

        {/* EXECUTIVE COMMITTEE SHOWCASE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Leadership</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F2A4A] dark:text-white">
                Union Executive Cabinet
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Elected Office Bearers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {executiveOfficials.map((officer) => (
              <div
                key={officer.id}
                className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition text-center space-y-3"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0E7C86] to-[#0F2A4A] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white dark:border-slate-800">
                  {officer.name?.charAt(0) || 'U'}
                </div>

                <div>
                  <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold uppercase tracking-wider mb-1">
                    {officer.designation}
                  </span>
                  <h3 className="font-bold text-sm text-[#0F2A4A] dark:text-white truncate">
                    {officer.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {officer.classId?.toUpperCase()} &bull; {officer.cicNo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6 UNION WINGS SHOWCASE */}
        <section className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Folder className="w-3.5 h-3.5" />
              <span>Collegiate Departments</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F2A4A] dark:text-white">
              The 6 Autonomous Union Wings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wings.map(wing => {
              const Icon = ICON_MAP[wing.icon] || Folder;
              const wingProgs = wingPrograms.filter(p => p.wingId === wing.id);
              const wingMembers = unionOfficials.filter(o => o.assignedWingId === wing.id);
              const member1 = wingMembers.find(o => o.wingSlot === 1 || !o.designation?.toLowerCase().includes('joint')) || wingMembers[0];
              const member2 = wingMembers.find(o => (o.wingSlot === 2 || o.designation?.toLowerCase().includes('joint')) && o.id !== member1?.id) || (wingMembers.length > 1 ? wingMembers.find(o => o.id !== member1?.id) : null);

              return (
                <div
                  key={wing.id}
                  className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: wing.color || '#0E7C86' }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {wingProgs.length} Events
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[#0F2A4A] dark:text-white group-hover:text-[#0E7C86] transition">
                        {wing.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {wing.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Convener:</span>
                      <strong className="text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{member1?.name || 'Assigned Student'}</strong>
                    </div>
                    {member2 && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Joint Convener:</span>
                        <strong className="text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{member2.name}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINE ARTS SUMMIT LIVE SNAPSHOT */}
        <section className="rounded-3xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Fine Arts Wing Highlight</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F2A4A] dark:text-white">
                MUSF Summit Register &bull; House Standings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current point totals for the 3 competing houses: <strong>Team A, Team B, and Team C</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewingScoreboard(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition self-start sm:self-auto shrink-0"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Full Projector Scoreboard &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamStandings.map((team, idx) => (
              <div
                key={team.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full text-white uppercase ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-500' : 'bg-orange-600'
                  }`}>
                    House #{idx + 1}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#0F2A4A] dark:text-white">
                    {team.totalScore?.toFixed(1) || '0.0'} pts
                  </span>
                </div>

                <h4 className="font-bold text-lg text-[#0F2A4A] dark:text-white">
                  {team.name}
                </h4>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Honours</span>
                    <strong className="text-slate-800 dark:text-slate-200">{team.firstPlaces || 0} Firsts</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Entries</span>
                    <strong className="text-slate-800 dark:text-slate-200">{team.participationsCount || 0} Registered</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RECENT UNION ACTIVITIES */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Activities</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F2A4A] dark:text-white">
                Recent Programs Across All Wings
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedWing('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedWing === 'all'
                    ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All Wings
              </button>
              {wings.map(w => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWing(w.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                    selectedWing === w.id
                      ? 'bg-[#0E7C86] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {w.shortName || w.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicPrograms.slice(0, 6).map(p => {
              const wing = wings.find(w => w.id === p.wingId);
              const isComp = p.type === 'competition';

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase text-white"
                      style={{ backgroundColor: wing?.color || '#0E7C86' }}
                    >
                      {wing?.shortName || 'Wing'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {p.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  {isComp && p.winners?.firstPlace && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">
                        1st Place: {p.winners.firstPlace.name} ({p.winners.firstPlace.cicNo})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1522] py-8 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600 dark:text-slate-300">
          MUSF Students' Union &bull; {settings.collegeName || 'Majlis Umariyya Wafy College'}
        </p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} All rights reserved. Powered by MUSF Unified Campus Architecture.
        </p>
      </footer>
    </div>
  );
};
