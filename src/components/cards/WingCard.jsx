import React from 'react';
import { CardSkeleton } from './CardSkeleton';
import { Layers, Users, Calendar, ArrowRight } from 'lucide-react';

export const WingCard = ({
  name = 'Wing Name',
  code = 'FA',
  color = '#0E7C86',
  description,
  memberCount = 12,
  programsCount = 4,
  conveners = [],
  onOpen,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  // Generate pleasant gradient based on wing color
  const wingColor = color || '#0E7C86';

  return (
    <div
      className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-white to-slate-50/60 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-slate-900/60 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4 ${className}`}
    >
      {/* 3px Top Accent Strip in Wing Color */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: `linear-gradient(90deg, ${wingColor}, #0F2A4A)` }}
        aria-hidden="true"
      />

      <div className="space-y-3">
        {/* Leading Initial / Logo Tile & Header */}
        <div className="flex items-start justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md transition-transform duration-200 group-hover:scale-105 shrink-0"
              style={{
                backgroundColor: wingColor,
                boxShadow: `0 6px 16px -2px ${wingColor}44`
              }}
            >
              {code || name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white truncate">
                {name}
              </h3>
              {description && (
                <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Counts row */}
        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
            <Users className="w-4 h-4 text-indigo-500 shrink-0" strokeWidth={2} />
            <span className="truncate"><strong className="font-bold text-slate-900 dark:text-white tabular-nums">{memberCount}</strong> Members</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />
            <span className="truncate"><strong className="font-bold text-slate-900 dark:text-white tabular-nums">{programsCount}</strong> Events</span>
          </div>
        </div>
      </div>

      {/* Conveners Avatar Stack & Open Button */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {conveners.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {conveners.slice(0, 3).map((conv, idx) => (
                <div
                  key={idx}
                  title={conv.name || `Convener ${idx + 1}`}
                  className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#111B2B] bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-slate-200"
                >
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                  ) : (
                    conv.name ? conv.name.slice(0, 1).toUpperCase() : 'C'
                  )}
                </div>
              ))}
            </div>
          )}
          <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {conveners.length > 0 ? `${conveners.length} Convener${conveners.length > 1 ? 's' : ''}` : 'Union Wing'}
          </span>
        </div>

        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 text-[12px] font-bold text-[#0E7C86] dark:text-teal-300 transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <span>Open Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};