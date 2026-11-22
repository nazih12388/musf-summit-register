import React from 'react';
import { RoleBadge } from '../common/Badge';
import { CardSkeleton } from './CardSkeleton';
import { User, ChevronRight } from 'lucide-react';

export const ProfileCard = ({
  name = 'Student Name',
  cicNo = '24001',
  className: studentClass = 'Class 1',
  sectionName = 'Thamheediyya',
  role = 'student',
  avatarUrl,
  marksPct = 92,
  attendancePct = 98,
  rank = 1,
  onViewProfile,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  // Circular progress ring helper (radius 14, circumference ~88)
  const radius = 14;
  const circumference = 2 * Math.PI * radius;

  const renderRing = (pct, color = '#0E7C86') => {
    const strokeDashoffset = circumference - (Math.min(pct, 100) / 100) * circumference;
    return (
      <svg className="w-9 h-9 -rotate-90 transform" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="text-slate-100 dark:text-slate-800"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    );
  };

  return (
    <div
      className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-white to-slate-50/70 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-slate-900/60 shadow-xs hover:shadow-lg transition-all duration-200 space-y-4 ${className}`}
    >
      {/* 3px Top Gradient Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500 opacity-80" />

      {/* Header Row: Avatar, Name, Metadata, Role */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-[#0E7C86] via-[#6366F1] to-[#F59E0B] shadow-md shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white truncate">
              {name}
            </h3>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {cicNo} • {studentClass} • {sectionName}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        {role && role !== 'student' && (
          <RoleBadge role={role} className="shrink-0 shadow-2xs" />
        )}
      </div>

      {/* 3 Inline Stats with Circular Progress Rings */}
      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
            {renderRing(marksPct, '#0E7C86')}
            <span className="absolute text-[10px] font-bold font-mono text-teal-800 dark:text-teal-200">
              {Math.round(marksPct)}%
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider truncate">Marks</div>
            <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Grade A</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
            {renderRing(attendancePct, '#16A34A')}
            <span className="absolute text-[10px] font-bold font-mono text-emerald-800 dark:text-emerald-200">
              {Math.round(attendancePct)}%
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">Attend</div>
            <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Regular</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 font-black font-mono text-xs shrink-0 flex items-center justify-center shadow-xs">
            #{rank}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">Standing</div>
            <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Top 5</div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      {onViewProfile && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onViewProfile}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 text-[12px] font-bold text-[#0E7C86] dark:text-teal-300 transition active:scale-95 shadow-2xs"
          >
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
