import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_POP, isReducedMotion } from '../motion';

export const Tag = ({
  children,
  variant = 'grey', // 'grey' | 'teal' | 'amber' | 'emerald' | 'indigo' | 'rose'
  size = 'sm', // 'sm' | 'md'
  className = ''
}) => {
  const reduced = isReducedMotion();

  const colorStyles = {
    grey: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    teal: 'bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300 border border-teal-200 dark:border-teal-800',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-[6px]',
    md: 'text-xs px-2.5 py-1 rounded-[8px]'
  };

  return (
    <motion.span
      initial={reduced ? { opacity: 1 } : { scale: 0.82, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING_POP}
      className={`inline-flex items-center gap-1 font-semibold leading-none whitespace-nowrap select-none ${
        colorStyles[variant] || colorStyles.grey
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </motion.span>
  );
};
