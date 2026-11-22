import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#111B2B]/60 space-y-3 ${className}`}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <h4 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h4>
        {description && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-[#0E7C86] hover:bg-teal-700 text-white text-xs font-semibold transition active:scale-97"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
