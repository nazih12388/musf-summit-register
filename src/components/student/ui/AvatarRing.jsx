import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { SPRING_POP, isReducedMotion } from '../motion';

export const AvatarRing = ({
  official,
  studentObj,
  onClick,
  hasRecentPost = false,
  isChairman = false,
  index = 0
}) => {
  const reduced = isReducedMotion();
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const handleVis = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  const shouldRotate = hasRecentPost && !reduced && isTabVisible;
  const photo = official?.photoUrl || official?.photo || studentObj?.photoUrl || studentObj?.photo;

  return (
    <motion.button
      type="button"
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(official);
      }}
      className="flex flex-col items-center gap-1.5 shrink-0 w-[72px] sm:w-[80px] group cursor-pointer focus:outline-none select-none text-center"
      title={`${official.name} (${official.designation})`}
    >
      <div className="relative w-14 h-14 sm:w-15 sm:h-15 p-0.5 rounded-full flex items-center justify-center">
        {/* Animated Conic Gradient Ring (Only if posted in last 24h) */}
        {shouldRotate ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-teal-500 to-indigo-500"
          />
        ) : (
          <div
            className={`absolute inset-0 rounded-full ${
              isChairman
                ? 'bg-gradient-to-tr from-amber-400 to-amber-600'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        )}

        {/* Inner Avatar Canvas */}
        <div className="relative z-10 w-full h-full rounded-full bg-white dark:bg-slate-900 p-0.5 overflow-hidden">
          <div className="w-full h-full rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
            {photo ? (
              <img src={photo} alt={official.name} className="w-full h-full object-cover" />
            ) : (
              <span>{official.name?.charAt(0) || 'L'}</span>
            )}
          </div>
        </div>

        {/* Crown on Chairman with Single Shine sweep on view */}
        {isChairman && (
          <motion.div
            initial={reduced ? { scale: 1 } : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRING_POP}
            className="absolute -top-1.5 -right-1 z-20 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center border border-white dark:border-slate-900 shadow-xs"
          >
            <motion.div
              animate={reduced ? {} : { rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Crown className="w-3 h-3 text-slate-950 fill-slate-950" />
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="min-w-0 w-full">
        <h4 className="text-[11px] sm:text-xs font-bold text-[#0F2A4A] dark:text-white truncate leading-tight">
          {official.name}
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5 font-medium">
          {official.designation}
        </p>
      </div>
    </motion.button>
  );
};
