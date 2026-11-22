import React from 'react';
import { CategoryTag, NewDot } from '../common/Badge';
import { CardSkeleton } from './CardSkeleton';
import { Pin, Paperclip, Clock } from 'lucide-react';

export const NoticeCard = ({
  title = 'Official Announcement',
  content = 'Detailed notice content explaining important upcoming union activities...',
  wingName = 'General',
  timeAgo = '2 hours ago',
  isPinned = false,
  isUnread = false,
  hasAttachment = false,
  onClick,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  const Comp = onClick ? 'button' : 'div';

  const cardStyle = isPinned
    ? 'border-amber-300 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 dark:from-amber-950/20 dark:via-[#111B2B] dark:to-yellow-950/10 shadow-xs'
    : isUnread
      ? 'border-teal-300/80 dark:border-teal-700/60 bg-gradient-to-br from-teal-50/40 via-white to-slate-50/60 dark:from-teal-950/20 dark:via-[#111B2B] dark:to-slate-900/40 shadow-xs'
      : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative overflow-hidden text-left w-full p-4 sm:p-5 rounded-2xl border ${cardStyle} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-3.5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top Accent Strip for Pinned or Unread */}
      {isPinned ? (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
      ) : isUnread ? (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
      ) : null}

      {/* Header: Title, Pin, Unread Dot */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {isPinned && (
            <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500 -rotate-45" />
            </div>
          )}
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NewDot isNew={isUnread} />
          {hasAttachment && (
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
              <Paperclip className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Excerpt (2 lines) */}
      <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
        {content}
      </p>

      {/* Footer: Wing Tag & Time Ago */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <CategoryTag label={wingName} />

        <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </Comp>
  );
};
