import React from 'react';
import { CardSkeleton } from './CardSkeleton';
import { CheckCircle2, Clock } from 'lucide-react';

export const AttendanceCard = ({
  summitName = 'Summit November 2026',
  date = '2026-11-20',
  sessions = [
    { name: 'Morning', attended: true },
    { name: 'Mid-day', attended: true },
    { name: 'Evening', attended: false }
  ],
  attendancePct = 66,
  marksObtained = 42,
  marksMax = 50,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  const marksPct = marksMax > 0 ? (marksObtained / marksMax) * 100 : 0;

  // Circular ring helper
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(attendancePct, 100) / 100) * circumference;

  return (
    <div
      className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-white to-slate-50/70 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-slate-900/60 shadow-xs hover:shadow-lg transition-all duration-200 space-y-4 ${className}`}
    >
      {/* 3px Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />

      {/* Title & Date */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug">
            {summitName}
          </h3>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {date}
          </p>
        </div>

        {/* Attendance Percentage Ring with Emerald Gradient */}
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              stroke="#10B981"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="absolute text-[11px] font-black font-mono text-emerald-700 dark:text-emerald-300">
            {Math.round(attendancePct)}%
          </span>
        </div>
      </div>

      {/* 3 Session Dots (Start / Mid / End) */}
      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-around">
        {sessions.map((ses, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5">
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs ${
              ses.attended ? 'bg-gradient-to-tr from-emerald-600 to-teal-400' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
              {ses.attended && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {ses.name}
            </span>
          </div>
        ))}
      </div>

      {/* Marks Progress Bar with Multi-Color Gradient */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-bold text-slate-500 dark:text-slate-400">Summit Score</span>
          <span className="font-black text-slate-900 dark:text-white font-mono">
            {marksObtained} / {marksMax} <span className="text-teal-600 dark:text-teal-400 font-bold">({Math.round(marksPct)}%)</span>
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${Math.min(marksPct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
