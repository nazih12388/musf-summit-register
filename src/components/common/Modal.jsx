import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 max-w-full animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Always Visible & Sticky) */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-[#0F2A4A] dark:text-amber-400 flex items-center gap-2 truncate pr-2">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Bottom Safe Area clearance */}
        <div className="p-4 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] overflow-y-auto space-y-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
