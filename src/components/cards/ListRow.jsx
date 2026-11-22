import React from 'react';
import { StatusBadge } from '../common/Badge';
import { ChevronRight, User } from 'lucide-react';

export const ListRow = ({
  avatarUrl,
  avatarText,
  primaryText = 'Primary Title',
  secondaryText = 'Secondary detail or ID',
  metaText,
  status,
  statusLabel,
  onClick,
  showChevron = true,
  className = ''
}) => {
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group w-full text-left p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111B2B] hover:border-teal-400/60 dark:hover:border-teal-500/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 shadow-2xs hover:shadow-md transition-all duration-150 flex items-center justify-between gap-3 ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Avatar / Leading Visual */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-teal-950/60 dark:to-indigo-950/60 text-[#0E7C86] dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-teal-500/30 dark:ring-teal-400/30 shadow-2xs">
          {avatarUrl ? (
            <img src={avatarUrl} alt={primaryText} className="w-full h-full object-cover" />
          ) : avatarText ? (
            <span>{avatarText.slice(0, 2).toUpperCase()}</span>
          ) : (
            <User className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
          )}
        </div>

        {/* Text Content */}
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-slate-900 dark:text-white truncate">
            {primaryText}
          </div>
          <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
            {secondaryText}
          </div>
        </div>
      </div>

      {/* Trailing metadata, status, or chevron */}
      <div className="flex items-center gap-2.5 shrink-0">
        {metaText && (
          <span className="text-[12px] font-mono font-bold text-slate-600 dark:text-slate-300 hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
            {metaText}
          </span>
        )}

        {status && (
          <StatusBadge status={status} label={statusLabel} />
        )}

        {showChevron && onClick && (
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E7C86] dark:group-hover:text-teal-300 shrink-0 transition" />
        )}
      </div>
    </Comp>
  );
};
