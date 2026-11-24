import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, ArrowLeft, Crown } from 'lucide-react';
import { EASING, SPRING_POP, isReducedMotion } from '../motion';

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
};

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const Hero = ({
  variant = 'home', // 'home' | 'inner'
  title,
  subtitle,
  action,
  onBack,
  onOpenDrawer,
  onOpenNotifications,
  unreadCount = 0,
  student,
  className = '',
  sectionName = '',
  wings = [],
  dualRoleInfo = null,
  onSwitchRole
}) => {
  const reduced = isReducedMotion();
  const greeting = getTimeGreeting();
  const studentName = toTitleCase(student?.name || 'Student');
  const words = studentName.split(' ');

  // Bell wiggle trigger (runs ONCE if there are unread items)
  const [hasWiggled, setHasWiggled] = useState(false);
  useEffect(() => {
    if (unreadCount > 0 && !hasWiggled) {
      setHasWiggled(true);
    }
  }, [unreadCount, hasWiggled]);

  if (variant === 'inner') {
    return (
      <header className="relative w-full bg-[#0E7C86] dark:bg-[#071F2C] text-white rounded-b-[24px] px-4 sm:px-6 pt-5 pb-6 overflow-hidden select-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <motion.button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                whileTap={reduced ? undefined : { scale: 0.92 }}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate text-white leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-white/80 truncate mt-0.5 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && (
            <div className="shrink-0 flex items-center gap-2">
              {action}
            </div>
          )}
        </div>
      </header>
    );
  }

  // Home Hero with Wipe-down & Sequential Word Reveal
  return (
    <motion.header
      initial={reduced ? { opacity: 1 } : { scaleY: 0.94, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: EASING }}
      style={{ originY: 0 }}
      className={`relative w-full bg-[#0E7C86] dark:bg-[#071F2C] text-white rounded-b-[24px] px-4 sm:px-6 pt-4 pb-12 sm:pb-14 overflow-hidden select-none ${className}`}
    >
      {/* Top Header Row: Menu, "MUSF Union", Bell */}
      <div className="flex items-center justify-between gap-3 pb-4">
        {/* Menu Button with Icon Rotation on press */}
        <motion.button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          whileTap={reduced ? undefined : { rotate: 90, scale: 0.9 }}
          transition={{ duration: 0.18 }}
          className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-black tracking-wide uppercase text-white/95">
            MUSF Union
          </span>
          {dualRoleInfo && onSwitchRole && (
            <motion.button
              type="button"
              onClick={onSwitchRole}
              whileTap={reduced ? undefined : { scale: 0.94 }}
              className="px-2.5 py-1 rounded-full bg-amber-400/25 hover:bg-amber-400/35 border border-amber-300/40 text-amber-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
              title={`Switch to ${dualRoleInfo.roleTitle || 'Wing Console'}`}
            >
              <Crown className="w-3 h-3 text-amber-300 shrink-0" />
              <span>{dualRoleInfo.shortLabel || 'Wing Console'}</span>
            </motion.button>
          )}
        </div>

        {/* Bell with Wiggle and Spring Count Badge */}
        <motion.button
          type="button"
          onClick={onOpenNotifications}
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          whileTap={reduced ? undefined : { scale: 0.92 }}
          className="relative w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
        >
          <motion.div
            animate={
              !reduced && unreadCount > 0 && hasWiggled
                ? {
                  rotate: [0, -18, 16, -12, 8, -4, 0]
                }
                : {}
            }
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Bell className="w-5 h-5" />
          </motion.div>

          {/* Unread count badge springs in */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={reduced ? { opacity: 1 } : { scale: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={SPRING_POP}
                className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#0E7C86] dark:border-[#071F2C]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Main Student Info & Avatar Row */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="space-y-1 min-w-0 flex-1">
          {/* Time-based greeting */}
          <motion.p
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08, ease: EASING }}
            className="text-xs sm:text-sm text-teal-100 font-medium leading-none"
          >
            {greeting}
          </motion.p>

          {/* Large Student Name with Soft Per-word Reveal */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight flex flex-wrap gap-x-1.5">
            {words.map((word, idx) => (
              <motion.span
                key={idx}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.28,
                  delay: 0.12 + idx * 0.05,
                  ease: EASING
                }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* "CIC - Class - Section" line */}
          <motion.p
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.24, ease: EASING }}
            className="text-xs sm:text-sm text-teal-100/90 font-medium truncate pt-0.5"
          >
            CIC {student?.cicNo || '—'} &bull; {className || student?.className || 'Class'} &bull; {sectionName || (student?.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya')}
          </motion.p>

          {/* Outlined Wing Chips (Pop in one by one) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {(wings || []).slice(0, 3).map((w, idx) => (
              <motion.span
                key={w.id || idx}
                initial={reduced ? { opacity: 1 } : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  ...SPRING_POP,
                  delay: 0.28 + idx * 0.05
                }}
                className="px-2.5 py-0.5 rounded-full border border-white/35 bg-white/10 text-white text-[11px] font-semibold"
              >
                {w.shortName || w.name}
              </motion.span>
            ))}
            {(wings || []).length > 3 && (
              <motion.span
                initial={reduced ? { opacity: 1 } : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SPRING_POP, delay: 0.45 }}
                className="px-2 py-0.5 rounded-full border border-white/25 bg-white/5 text-white/80 text-[10px] font-medium"
              >
                +{wings.length - 3} more
              </motion.span>
            )}
          </div>
        </div>

        {/* Round Avatar with overshoot pop */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING_POP, delay: 0.16 }}
          className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full p-0.5 bg-white/30 shrink-0 shadow-sm"
        >
          <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg overflow-hidden border border-white/40">
            {student?.photoUrl ? (
              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span>{student?.name?.charAt(0) || 'S'}</span>
            )}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

