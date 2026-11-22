import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { EASING, isReducedMotion } from '../motion';

export const ListRow = ({
  icon: Icon,
  iconColor = '#0E7C86',
  title,
  subtitle,
  tag,
  action,
  onClick,
  className = '',
  index = 0
}) => {
  const reduced = isReducedMotion();
  const isClickable = typeof onClick === 'function';

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: EASING }}
      whileTap={isClickable && !reduced ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-[12px] bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 transition-colors ${
        isClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${iconColor}15`,
              color: iconColor
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold text-[#0F2A4A] dark:text-white truncate leading-tight">
              {title}
            </h4>
            {tag && (
              <span className="shrink-0">{tag}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {action ? (
          action
        ) : isClickable ? (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        ) : null}
      </div>
    </motion.div>
  );
};
