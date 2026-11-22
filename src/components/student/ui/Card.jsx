import React from 'react';
import { motion } from 'framer-motion';
import { EASING, isReducedMotion } from '../motion';

export const Card = ({
  children,
  onClick,
  className = '',
  statusBadge = null,
  interactive = false
}) => {
  const reduced = isReducedMotion();
  const isClickable = interactive || typeof onClick === 'function';

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, ease: EASING }}
      whileHover={isClickable && !reduced ? { y: -2 } : undefined}
      whileTap={isClickable && !reduced ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={`relative rounded-[12px] bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 ${
        isClickable ? 'cursor-pointer select-none active:outline-none' : ''
      } ${className}`}
      style={{
        boxShadow: 'none',
        backgroundImage: 'none'
      }}
    >
      {statusBadge && (
        <div className="absolute top-3 right-3 z-10">
          {statusBadge}
        </div>
      )}
      {children}
    </motion.div>
  );
};
