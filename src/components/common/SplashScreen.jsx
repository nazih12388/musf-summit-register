import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { LogoReveal } from './LogoReveal';

export const SplashScreen = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Connecting to Directorate Services...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Smooth progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 16 + 12);
        const next = Math.min(prev + step, 100);

        if (next < 35) setStatusText('Connecting to Directorate Services...');
        else if (next < 70) setStatusText('Synchronizing Summit Architecture...');
        else if (next < 95) setStatusText('Verifying Security Protocol...');
        else setStatusText("Welcome to MUSF Portal");

        return next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, []);

  // Complete and smooth fade out
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const exitTimer = setTimeout(() => {
          if (onFinished) onFinished();
        }, 500);
        return () => clearTimeout(exitTimer);
      }, 300);

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
      className={`fixed inset-0 z-50 overflow-hidden cursor-pointer select-none transition-all duration-500 ease-out flex flex-col items-center justify-between py-10 px-6 bg-gradient-to-b from-white via-[#F7FAFD] to-[#EBF3FB] text-slate-800 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#0E7C86]/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-300/15 blur-3xl" />
      </div>

      {/* 2. Top Minimal Branding Header */}
      <div className="relative z-10 flex items-center justify-center pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/90 backdrop-blur-md shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0E7C86]" />
          <span className="text-[10px] font-mono tracking-widest text-slate-600 font-bold uppercase">
            Official Portal
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-50 text-[#0E7C86] border border-teal-200">
            v7.0
          </span>
        </div>
      </div>

      {/* 3. Center Hero: High-End Logo Reveal Animation on White Background */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <LogoReveal
          size="splash"
          mode="reveal"
          logoSrc="/musf-official-emblem.jpg"
          theme="light"
          title="MUSF STUDENTS' UNION"
          subtitle="Majlis Umariyya Wafy College"
          arabicMotto="من رام درّا للسفينة يركب"
        />
      </div>

      {/* 4. Bottom Controls & Minimal Progress Track */}
      <div className="relative z-10 w-full max-w-xs mx-auto space-y-2.5 pb-2">
        {/* Status Line & Percent */}
        <div className="flex items-center justify-between text-xs font-mono px-0.5">
          <span className="truncate pr-2 text-[11px] text-slate-600 font-semibold">
            {statusText}
          </span>
          <span className="font-bold text-[#0E7C86] font-mono text-xs">
            {progress}%
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="relative w-full h-1.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] via-[#103D6D] to-[#07244C] transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip Hint */}
        <div className="text-center pt-1">
          <span className="text-[10px] font-mono text-slate-400 hover:text-slate-600 transition">
            tap anywhere to enter
          </span>
        </div>
      </div>
    </div>
  );
};
