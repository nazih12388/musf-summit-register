import React from 'react';
import { MedalBadge, CategoryTag } from '../common/Badge';
import { CardSkeleton } from './CardSkeleton';
import { triggerPrizeConfetti } from '../../utils/motion';
import { Share2 } from 'lucide-react';

export const ResultCard = ({
  rank = 1,
  studentName = 'Student Name',
  cicNo = '24001',
  programName = 'Elocution English',
  wingName = 'Literary',
  className: studentClass = 'Class 2',
  teamName = 'Team A',
  points = 10,
  date = '2026-11-20',
  photoUrl,
  onShare,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  const numRank = Number(rank);

  // Distinct styling by rank
  const rankStyles = numRank === 1 ? {
    accentGradient: 'linear-gradient(90deg, #F59E0B, #F8E27D, #C9A227)',
    cardBg: 'bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/40 dark:from-amber-950/25 dark:via-[#111B2B] dark:to-yellow-950/15',
    border: 'border-amber-300 dark:border-amber-700/60 shadow-md shadow-amber-500/10',
    pointColor: 'text-amber-600 dark:text-amber-400'
  } : numRank === 2 ? {
    accentGradient: 'linear-gradient(90deg, #94A3B8, #CBD5E1, #64748B)',
    cardBg: 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900/40 dark:via-[#111B2B] dark:to-indigo-950/15',
    border: 'border-slate-300 dark:border-slate-700',
    pointColor: 'text-slate-700 dark:text-slate-300'
  } : numRank === 3 ? {
    accentGradient: 'linear-gradient(90deg, #EA580C, #FDBA74, #B45309)',
    cardBg: 'bg-gradient-to-br from-orange-50/70 via-white to-amber-50/30 dark:from-orange-950/25 dark:via-[#111B2B] dark:to-amber-950/15',
    border: 'border-orange-300 dark:border-orange-700/60 shadow-xs shadow-orange-500/10',
    pointColor: 'text-orange-600 dark:text-orange-400'
  } : {
    accentGradient: 'transparent',
    cardBg: 'bg-white dark:bg-[#111B2B]',
    border: 'border-slate-200 dark:border-slate-800',
    pointColor: 'text-[#0E7C86] dark:text-teal-400'
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    // Burst confetti when opening or sharing a winning card
    triggerPrizeConfetti({ x: 0.5, y: 0.6 });
    if (onShare) onShare();
  };

  return (
    <div
      className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl border ${rankStyles.border} ${rankStyles.cardBg} shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-3.5 ${className}`}
    >
      {/* Top Accent Strip for 1st/2nd/3rd */}
      {numRank <= 3 && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none"
          style={{ background: rankStyles.accentGradient }}
          aria-hidden="true"
        />
      )}

      {/* Header: Medal Badge, Student Info, Share Action */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <MedalBadge rank={numRank} size={36} />

          <div className="min-w-0">
            <h4 className="text-[16px] font-bold text-slate-900 dark:text-white truncate">
              {studentName}
            </h4>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {cicNo} • {studentClass} {teamName ? `• ${teamName}` : ''}
            </p>
          </div>
        </div>

        {/* Share Button with Confetti Trigger */}
        <button
          type="button"
          onClick={handleShareClick}
          title="Share Result"
          aria-label="Share result"
          className="w-8.5 h-8.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-[#0E7C86] hover:to-[#1E3A8A] flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-2xs"
        >
          <Share2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Program & Wing Details */}
      <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-slate-900 dark:text-slate-100 truncate">
            {programName}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {wingName && <CategoryTag label={wingName} />}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={`text-[19px] font-black font-mono ${rankStyles.pointColor} leading-none`}>
            {points} <span className="text-[11px] font-sans font-bold text-slate-400">pts</span>
          </div>
          {date && (
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              {date}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
