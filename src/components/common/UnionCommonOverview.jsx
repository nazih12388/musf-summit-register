import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { HomeBannerCarousel } from '../home/HomeBannerCarousel';
import {
  Users,
  Folder,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  Shield,
  Crown,
  Lock,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Modal } from './Modal';

export const UnionCommonOverview = ({ onNavigateToPrograms, onNavigateToWings }) => {
  const { currentUser } = useAuth();
  const {
    students = [],
    wings = [],
    wingPrograms = [],
    unionOfficials = [],
    settings = {},
    updateSettings
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const [isEditYearOpen, setIsEditYearOpen] = useState(false);
  const [editYearValue, setEditYearValue] = useState(settings.academicYear || '2025–2026');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Find next upcoming program (excluding meetings if user is a student)
  const nextProgram = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Sort upcoming programs by date
    const eligible = (wingPrograms || []).filter(p => {
      if (isStudent && (p.type === 'meeting' || p.isConfidential)) return false;
      return p.date >= today || p.status === 'upcoming';
    }).sort((a, b) => (a.date > b.date ? 1 : -1));

    return eligible[0] || (wingPrograms || []).find(p => !isStudent || (p.type !== 'meeting' && !p.isConfidential)) || null;
  }, [wingPrograms, isStudent]);

  const conductingWing = useMemo(() => {
    if (!nextProgram) return null;
    return (wings || []).find(w => w.id === nextProgram.wingId);
  }, [nextProgram, wings]);

  // Check official role badge if user is official or student
  const officialBadge = useMemo(() => {
    if (currentUser?.designation) return currentUser.designation;
    const off = (unionOfficials || []).find(o =>
      (o.studentId && o.studentId === currentUser?.id) ||
      (o.cicNo && o.cicNo === currentUser?.username)
    );
    return off?.designation || null;
  }, [currentUser, unionOfficials]);

  return (
    <div className="space-y-4">
      {/* Top Welcome & Summary Header - Calm Institutional Style */}
      <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {settings.collegeName || 'Majlis Umariyya Wafy College'}
              </span>

              {officialBadge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold">
                  <Crown className="w-3 h-3 text-[#0E7C86]" />
                  <span>{officialBadge}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
              Welcome, {currentUser?.name || 'Union Member'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Majlis Umariyya Students' Federation (MUSF) Central Portal
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0">
            <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Academic Session
              </span>
              <span className="text-xs sm:text-sm font-semibold font-mono text-slate-700 dark:text-slate-200">
                {settings.academicYear || '2025–2026'}
              </span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditYearValue(settings.academicYear || '2025–2026');
                  setIsEditYearOpen(true);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition shadow-xs"
                title="Edit Academic Year / Session (Admin)"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Home Banner Carousel (Posters, Key Programs, & Achievements) */}
      <HomeBannerCarousel
        onNavigateToWing={onNavigateToWings}
        onNavigateToTab={onNavigateToPrograms}
      />

      {/* 3 Core KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1: Total Students */}
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0E7C86] dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Enrolled Students
            </span>
            <div className="text-2xl font-black text-[#0F2A4A] dark:text-white font-mono">
              {students.length}
            </div>
            <span className="text-[11px] text-slate-500">
              Thamheediyya &amp; Aliya
            </span>
          </div>
        </div>

        {/* Metric 2: Active Union Wings */}
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#334E73] dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Union Wings
            </span>
            <div className="text-2xl font-black text-[#0F2A4A] dark:text-white font-mono">
              {wings.length} Wings
            </div>
            <span className="text-[11px] text-slate-500">
              Autonomous Departments
            </span>
          </div>
        </div>

        {/* Metric 3: Next Upcoming Program */}
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Next Upcoming Program</span>
            </span>

            {conductingWing && (
              <span
                className="text-[9px] px-2 py-0.5 rounded font-bold uppercase text-white shrink-0"
                style={{ backgroundColor: conductingWing.color || '#0E7C86' }}
              >
                {conductingWing.shortName || conductingWing.name}
              </span>
            )}
          </div>

          {nextProgram ? (
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#0F2A4A] dark:text-white truncate">
                {nextProgram.title}
              </h4>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                <span>{nextProgram.date}</span>
                {nextProgram.time && <span>• {nextProgram.time}</span>}
                {nextProgram.venue && (
                  <span className="truncate">• {nextProgram.venue}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No upcoming union programs scheduled.
            </p>
          )}
        </div>
      </div>

      {/* Edit Academic Year Modal (Admin) */}
      {isEditYearOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditYearOpen(false)}
          title="Edit Academic Session / Year"
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editYearValue.trim()) {
                updateSettings({ academicYear: editYearValue.trim() }, currentUser?.username || 'admin');
                setSaveSuccessMsg(true);
                setTimeout(() => {
                  setSaveSuccessMsg(false);
                  setIsEditYearOpen(false);
                }, 1000);
              }
            }}
            className="p-5 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Academic Session / Year
              </label>
              <input
                type="text"
                value={editYearValue}
                onChange={(e) => setEditYearValue(e.target.value)}
                placeholder="e.g. 2025–2026 or 2026–2027"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0E7C86]"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Updates the official academic year displayed across the union dashboard, official reports, and certificates.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditYearOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0E7C86] text-white font-bold text-xs shadow-md hover:bg-[#0c6b74] transition flex items-center gap-1.5"
              >
                {saveSuccessMsg ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Academic Year</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
