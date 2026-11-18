import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Compass, ShieldCheck } from 'lucide-react';

export const SplashScreen = ({ onFinished }) => {
  // Animation phases:
  // 1: Full-screen image only
  // 2: Cinematic vignette & ambient lighting overlay appears
  // 3: Heraldic center emblem & glowing ring glide in
  // 4: Official college title and app branding rise with drop shadow
  // 5: Progress bar advances to 100%
  const [phase, setPhase] = useState(1);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Opening College Campus Portal...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Phase 1 -> 2: Overlay starts after 200ms
    const t1 = setTimeout(() => setPhase(2), 200);

    // Phase 2 -> 3: Emblem appears after 450ms
    const t2 = setTimeout(() => setPhase(3), 450);

    // Phase 3 -> 4: Text branding appears after 700ms
    const t3 = setTimeout(() => setPhase(4), 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Progress Bar tracking
  useEffect(() => {
    if (phase < 3) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 18 + 14);
        const next = Math.min(prev + step, 100);

        if (next < 30) setStatusText('Connecting to Directorate Services...');
        else if (next < 65) setStatusText('Loading Summit Architecture & Fields...');
        else if (next < 90) setStatusText('Verifying Security Protocol...');
        else setStatusText('Welcome to MUSF Summit Register');

        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [phase]);

  // Complete and fade out
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const exitTimer = setTimeout(() => {
          if (onFinished) onFinished();
        }, 500);
        return () => clearTimeout(exitTimer);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [progress, onFinished]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinished) onFinished();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 overflow-hidden cursor-pointer select-none transition-all duration-700 ease-out bg-[#0B1522] ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. DESKTOP AMBIENT BACKDROP BLUR (Wide Screens) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden hidden md:block">
        <img
          src="/college-poster.jpg"
          alt="Majlis Umariyya Wafy College Ambient"
          className="w-full h-full object-cover blur-2xl scale-110 opacity-30"
        />
      </div>

      {/* 2. MAIN POSTER IMAGE (Full screen on mobile, elegant centered poster on desktop) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src="/college-poster.jpg"
          alt="Majlis Umariyya Wafy College"
          className="w-full h-full md:max-w-md md:h-[94vh] md:rounded-3xl md:shadow-2xl object-cover md:object-contain object-top will-change-transform animate-ken-burns transition-all duration-1000"
        />
      </div>

      {/* 3. LIGHT TOP VIGNETTE (Keeps mobile notch and clock visible without darkening the college emblem) */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />

      {/* 4. BOTTOM CONTROLS & PROGRESS BAR (Sits naturally over the lower wave portion) */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-[#07111D] via-[#07111D]/80 to-transparent pt-16 pb-8 px-6">
        <div className={`w-full max-w-sm mx-auto space-y-3 transition-all duration-700 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Institution Summit Portal Pill */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#C9A227]/40 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227] animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">
                MUSF SUMMIT REGISTER
              </span>
              <span className="text-[10px] text-teal-300 font-bold px-1.5 py-0.2 rounded bg-teal-500/20">
                2026
              </span>
            </div>
          </div>

          {/* Status Text & Percentage */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-200 px-1">
            <span className="truncate pr-2 drop-shadow-sm font-semibold">{statusText}</span>
            <span className="font-bold text-[#C9A227] drop-shadow-sm">{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-black/75 backdrop-blur-md rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] via-[#14919D] to-[#C9A227] transition-all duration-150 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/40 animate-shimmer" />
            </div>
          </div>

          {/* Tap to enter hint */}
          <div className="text-center pt-1">
            <span className="text-[11px] text-slate-300/80 hover:text-white transition font-medium">
              Tap anywhere to enter &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
