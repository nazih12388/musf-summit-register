import React from 'react';
import { StatusBadge, CategoryTag } from '../common/Badge';
import { CardSkeleton } from './CardSkeleton';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

export const ProgramCard = ({
  title = 'Program Title',
  date = '2026-11-25',
  time = '10:00 AM',
  venue = 'Main Auditorium',
  wingName = 'Fine Arts',
  status = 'active', // 'active', 'scheduled', 'completed', 'open'
  participantsCount = 0,
  participantAvatars = [],
  actionLabel = 'Details',
  onAction,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  // Parse date for day and month
  let day = '25';
  let month = 'NOV';
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      day = String(d.getDate()).padStart(2, '0');
      month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    }
  } catch {}

  return (
    <div
      className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-white to-slate-50/70 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-slate-900/60 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4 ${className}`}
    >
      {/* 3px Top Gradient Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-blue-500 opacity-80" />

      <div className="flex items-start gap-3.5 pt-0.5">
        {/* Left Date Block with Gradient Header */}
        <div className="w-13 h-15 rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col shrink-0 text-center select-none shadow-2xs">
          <div className="py-0.5 bg-gradient-to-r from-[#0E7C86] to-[#1E3A8A] text-white text-[10px] font-bold tracking-wider uppercase leading-tight">
            {month}
          </div>
          <div className="flex-1 flex items-center justify-center text-[22px] font-black text-slate-800 dark:text-slate-100 font-mono leading-none">
            {day}
          </div>
        </div>

        {/* Title, Wing Tag, and Top-Right Status Badge */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
              {title}
            </h3>
            {status && (
              <StatusBadge status={status} className="shrink-0" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {wingName && (
              <CategoryTag label={wingName} />
            )}
          </div>
        </div>
      </div>

      {/* Meta details: Venue & Time */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-slate-500 dark:text-slate-400">
        {venue && (
          <div className="inline-flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" strokeWidth={2} />
            <span className="truncate">{venue}</span>
          </div>
        )}
        {time && (
          <div className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" strokeWidth={2} />
            <span>{time}</span>
          </div>
        )}
      </div>

      {/* Footer: Participants Avatar Stack + Action Button */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Avatar stack (max 3) */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {(participantAvatars.slice(0, 3)).map((av, idx) => (
              <div
                key={idx}
                className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#111B2B] bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0"
              >
                {av ? (
                  <img src={av} alt="Participant" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-600">
                    {idx + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {participantsCount > 0 ? `${participantsCount} registered` : 'Open'}
          </span>
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 text-[12px] font-bold text-[#0E7C86] dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 transition active:scale-95 shadow-2xs"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
