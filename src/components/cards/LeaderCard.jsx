import React from 'react';
import { Crown, PenTool, Star, Shield, Flag, User } from 'lucide-react';

export const LeaderCard = ({
  name = 'Leader Name',
  position = 'Chairman',
  wingName,
  avatarUrl,
  onClick,
  className = ''
}) => {
  const norm = String(position || '').toLowerCase();
  let Icon = Crown;
  let ringGradient = 'from-[#0E7C86] via-[#14919D] to-[#1E3A8A]';
  let badgeBg = 'bg-gradient-to-r from-[#0E7C86] to-[#1E3A8A]';

  if (norm.includes('chairman') || norm === 'general_secretary') {
    Icon = Crown;
    ringGradient = 'from-amber-400 via-yellow-500 to-amber-600';
    badgeBg = 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950';
  } else if (norm.includes('secretary')) {
    Icon = PenTool;
    ringGradient = 'from-indigo-500 via-blue-500 to-indigo-600';
    badgeBg = 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white';
  } else if (norm.includes('president')) {
    Icon = Star;
    ringGradient = 'from-purple-500 via-indigo-500 to-purple-600';
    badgeBg = 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
  } else if (norm.includes('convener')) {
    Icon = Shield;
    ringGradient = 'from-teal-400 via-emerald-500 to-teal-600';
    badgeBg = 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white';
  } else if (norm.includes('leader')) {
    Icon = Flag;
    ringGradient = 'from-emerald-400 via-teal-500 to-emerald-600';
    badgeBg = 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center text-center p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-[#111B2B] dark:to-slate-900 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-28 sm:w-32 shrink-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0E7C86] cursor-pointer ${className}`}
    >
      {/* Radiant Gradient Ring Avatar */}
      <div className={`relative w-15 h-15 rounded-full p-0.5 bg-gradient-to-tr ${ringGradient} shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7 text-slate-400" />
          )}
        </div>

        {/* Small role icon badge at bottom-right */}
        <div className={`absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full ${badgeBg} flex items-center justify-center shadow-xs ring-1 ring-white dark:ring-slate-800`}>
          <Icon className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Name & Position */}
      <div className="mt-2.5 w-full">
        <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
          {name}
        </div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
          {position}
        </div>
        {wingName && (
          <div className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 truncate mt-0.5">
            {wingName}
          </div>
        )}
      </div>
    </button>
  );
};
