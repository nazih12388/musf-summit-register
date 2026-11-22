import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SPRING_POP, pressTile, hoverTile, isReducedMotion } from '../motion';

export const IconTile = ({
  icon: Icon,
  label,
  badge,
  iconColor = '#0E7C86',
  bgColor = '#0E7C8615',
  animationType = 'bounce', // 'tilt' | 'flip' | 'bounce' | 'ring' | 'pulse'
  onClick,
  index = 0
}) => {
  const reduced = isReducedMotion();
  const [animating, setAnimating] = useState(false);

  const getMicroAnimation = () => {
    if (reduced || !animating) return {};
    switch (animationType) {
      case 'tilt':
        return { rotate: [0, -20, 20, -10, 0], transition: { duration: 0.4 } };
      case 'flip':
        return { rotateY: [0, 180, 360], transition: { duration: 0.45 } };
      case 'bounce':
        return { y: [0, -6, 0, -3, 0], transition: { duration: 0.35 } };
      case 'ring':
        return { rotate: [0, -16, 16, -12, 12, 0], transition: { duration: 0.4 } };
      case 'pulse':
      default:
        return { scale: [1, 1.2, 0.95, 1], transition: { duration: 0.35 } };
    }
  };

  const handleTap = (e) => {
    if (!reduced) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    }
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      type="button"
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        ...SPRING_POP,
        delay: index * 0.04
      }}
      whileTap={reduced ? undefined : pressTile}
      whileHover={reduced ? undefined : hoverTile}
      onClick={handleTap}
      className="group relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-[12px] bg-slate-50/70 hover:bg-slate-100/90 dark:bg-slate-900/40 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer text-center select-none w-full"
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}

      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] flex items-center justify-center mb-1.5 transition-transform"
        style={{
          backgroundColor: bgColor,
          color: iconColor
        }}
      >
        <motion.div animate={getMicroAnimation()}>
          <Icon className="w-5 h-5" />
        </motion.div>
      </div>

      <span className="text-xs font-bold text-[#0F2A4A] dark:text-white truncate max-w-full leading-tight">
        {label}
      </span>
    </motion.button>
  );
};
