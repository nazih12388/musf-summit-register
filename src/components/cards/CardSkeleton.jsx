import React from 'react';

export const CardSkeleton = ({
  height = 'h-36',
  className = ''
}) => {
  return (
    <div
      aria-busy="true"
      aria-label="Loading card data"
      className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-3 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
        <div className="w-16 h-5 rounded-full skeleton-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="w-2/3 h-4 rounded-md skeleton-shimmer" />
        <div className="w-1/3 h-7 rounded-md skeleton-shimmer" />
      </div>
      <div className="w-full h-2 rounded-full skeleton-shimmer mt-2" />
    </div>
  );
};
