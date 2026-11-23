import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';

/**
 * Modern Entry / Splash Screen Logo Animation for MUSF Union App
 *
 * Choreography:
 * 1. Deep Teal & Cream ambient bento backdrop with soft radial light bursts
 * 2. Floating glassmorphism Bento card with dual cream borders
 * 3. Official MUSF Crest emblem spring expansion
 * 4. Staggered kinetic typography reveal for "M" - "U" - "S" - "F"
 * 5. Specular diagonal light sheen sweep across the letters
 * 6. Bento metadata pills & Arabic motto unfold
 * 7. Sleek cream/teal 2px progress track
 * 8. Smooth dismiss on finish or tap
 */
export const MusfSplashScreen = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Connecting to Directorate Services...');
  const [isDismissing, setIsDismissing] = useState(false);

  // Smooth, snappy loading sequence
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 14 + 10);
        const next = Math.min(prev + step, 100);

        if (next < 30) setStatusText('Connecting to Directorate Services...');
        else if (next < 65) setStatusText('Synchronizing Summit Architecture...');
        else if (next < 90) setStatusText('Verifying Security Protocol...');
        else setStatusText("Welcome to MUSF Students' Union");

        return next;
      });
    }, 75);

    return () => clearInterval(interval);
  }, []);

  // Automatic exit on completion
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const handleDismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(() => {
      if (typeof onFinished === 'function') {
        onFinished();
      }
    }, 550);
  };

  // Staggered letters motion variants
  const letterContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.35
      }
    }
  };

  const letterVariant = {
    hidden: {
      opacity: 0,
      y: 35,
      scale: 0.6,
      rotateX: -45,
      filter: 'blur(6px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 20
      }
    }
  };

  const bentoCardVariant = {
    hidden: { opacity: 0, scale: 0.88, y: 30, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="musf-splash"
          onClick={handleDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.96,
            filter: 'blur(8px)',
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          }}
          className="fixed inset-0 z-50 overflow-hidden cursor-pointer select-none flex flex-col items-center justify-between py-8 px-4 sm:px-6 bg-[#07111D] text-slate-100 font-sans"
        >
          {/* 1. Teal & Cream Ambient Background Lighting */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top Teal Orb */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.45, 0.25]
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-[#0E7C86]/30 blur-[90px]"
            />
            {/* Bottom Warm Cream/Amber Orb */}
            <motion.div
              animate={{
                scale: [1.1, 0.95, 1.1],
                opacity: [0.15, 0.28, 0.15]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-[440px] h-[440px] rounded-full bg-[#C9A227]/20 blur-[85px]"
            />
            {/* Subtle Grid Watermark Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:24px_24px]"
            />
          </div>

          {/* 2. Top Header Pill: Official Union Security Token */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex items-center justify-center pt-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-[#FAF6EE]/15 backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span className="text-[10px] font-mono tracking-widest text-[#FAF6EE]/90 uppercase font-bold">
                Official Directorate Portal
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#0E7C86]/40 text-[#2DD4BF] border border-[#0E7C86]/50">
                2026
              </span>
            </div>
          </motion.div>

          {/* 3. Center Hero: MUSF Teal / Cream Bento Card */}
          <motion.div
            variants={bentoCardVariant}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-sm sm:max-w-md my-auto"
          >
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-[#FAF6EE]/20 shadow-[0_20px_50px_rgba(7,17,29,0.8),0_0_0_1px_rgba(250,246,238,0.08)_inset] overflow-hidden flex flex-col items-center text-center">

              {/* Diagonal Shimmer Sheen Slice across Bento Card */}
              <motion.div
                initial={{ x: '-180%' }}
                animate={{ x: '260%' }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 3.5,
                  duration: 1.4,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="absolute inset-0 pointer-events-none w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent skew-x-12"
              />

              {/* Concentric Crest Halo with Spring Pop */}
              <div className="relative mb-4 flex items-center justify-center">
                {/* Outer Breathing Glow Ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.4, 0.75, 0.4]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 -m-3 rounded-full bg-gradient-to-tr from-[#0E7C86] via-[#14B8A6] to-[#C9A227] blur-md opacity-50"
                />

                {/* Animated Gyroscopic SVG Orbit */}
                <svg
                  className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none animate-spin"
                  style={{ animationDuration: '8s' }}
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="1.5"
                    strokeDasharray="6 10"
                    opacity="0.6"
                  />
                  <circle
                    cx="60"
                    cy="6"
                    r="3.5"
                    fill="#FAF6EE"
                    className="drop-shadow-[0_0_8px_#2DD4BF]"
                  />
                </svg>

                {/* Crest Emblem Image Card */}
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.2 }}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2 bg-gradient-to-br from-white/95 to-[#FAF6EE] shadow-xl border border-white/60 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src="/musf-official-emblem.jpg"
                    alt="MUSF Official Emblem"
                    className="w-full h-full object-contain filter contrast-105 select-none"
                    onError={(e) => {
                      if (e.target.src.indexOf('amu-crest-logo.png') === -1) {
                        e.target.src = '/amu-crest-logo.png';
                      }
                    }}
                  />
                  {/* Subtle emblem gloss */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/60 pointer-events-none" />
                </motion.div>
              </div>

              {/* Kinetic "MUSF" Kinetic Text Reveal (The Core Focus) */}
              <div className="relative mt-2">
                <motion.div
                  variants={letterContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center justify-center gap-1.5 sm:gap-2.5"
                >
                  {['M', 'U', 'S', 'F'].map((char, index) => (
                    <motion.span
                      key={index}
                      variants={letterVariant}
                      className="inline-block text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FAF6EE] via-[#EAE1D1] to-[#2DD4BF] drop-shadow-[0_4px_16px_rgba(14,124,134,0.6)]"
                      style={{
                        textShadow: '0 2px 20px rgba(45, 212, 191, 0.35)'
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Subtitle Line */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-1"
                >
                  <p className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-[#FAF6EE]/90 uppercase">
                    STUDENTS&apos; FEDERATION
                  </p>
                </motion.div>
              </div>

              {/* Bento Badges & Arabic Ribbon */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-5 w-full flex flex-col items-center gap-2.5 pt-4 border-t border-white/[0.08]"
              >
                {/* College Bento Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-medium text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
                  <span>Majlis Umariyya Wafy College</span>
                </div>

                {/* Arabic Golden Motto Ribbon */}
                <p
                  className="text-xs sm:text-[13px] font-serif tracking-wider text-[#D4AF37] font-semibold drop-shadow-sm pt-0.5"
                  dir="rtl"
                >
                  من رام درّا للسفينة يركب * ويغوص بحرا ثمّ درّا حصّلا
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* 4. Bottom Sleek Progress Bar & Skip Hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative z-10 w-full max-w-xs mx-auto space-y-2 pb-2"
          >
            {/* Status & Live Percentage */}
            <div className="flex items-center justify-between text-xs font-mono px-0.5">
              <span className="truncate pr-2 text-[11px] text-[#FAF6EE]/75 font-medium">
                {statusText}
              </span>
              <span className="font-bold text-[#2DD4BF] font-mono text-xs">
                {progress}%
              </span>
            </div>

            {/* Ultra-Sleek Cream & Teal Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-white/[0.08] backdrop-blur-md overflow-hidden p-0 border border-white/[0.05]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] via-[#2DD4BF] to-[#FAF6EE] relative overflow-hidden"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              >
                {/* Shimmer on track */}
                <div className="absolute inset-0 bg-white/40 animate-pulse" />
              </motion.div>
            </div>

            {/* Skip Tap Hint */}
            <div className="text-center pt-1 flex items-center justify-center gap-1 text-[11px] text-slate-400 hover:text-white transition">
              <span>Tap anywhere to continue</span>
              <ChevronRight className="w-3 h-3 text-[#2DD4BF]" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
