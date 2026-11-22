import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { isReducedMotion } from '../motion';

export const SectionHeader = ({
  title,
  subtitle,
  badge,
  actionLabel,
  onAction,
  icon: Icon,
  className = ''
}) => {
  const reduced = isReducedMotion();

  return (
    <div className={`flex items-center justify-between gap-3 pb-2.5 ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className="w-4 h-4 text-[#0E7C86] dark:text-teal-400 shrink-0" />
          )}
          <h2 className="text-sm sm:text-base font-bold text-[#0F2A4A] dark:text-white truncate">
            {title}
          </h2>
          {badge !== undefined && (
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 shrink-0">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <motion.button
          type="button"
          onClick={onAction}
          whileTap={reduced ? undefined : { scale: 0.94 }}
          className="text-xs font-bold text-[#0E7C86] hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
};
