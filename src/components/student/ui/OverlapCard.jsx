import React from 'react';
import { motion } from 'framer-motion';
import { EASING, isReducedMotion } from '../motion';

export const OverlapCard = ({ children, className = '' }) => {
  const reduced = isReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: EASING }}
      className={`relative z-20 -mt-[26px] mx-4 sm:mx-6 rounded-[12px] bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 p-3 sm:p-4 ${className}`}
      style={{
        boxShadow: 'none',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {children}
    </motion.div>
  );
};
