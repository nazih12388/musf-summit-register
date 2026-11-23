import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { LogoLoader } from './LogoLoader';

export const SplashScreen = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Connecting to Directorate Services...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Smooth, snappy progress tracking
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
      className={`fixed inset-0 z-50 overflow-hidden cursor-pointer select-none transition-all duration-500 ease-out flex flex-col items-center justify-between py-12 px-6 bg-[#070D17] ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#0E7C86]/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#38BDF8]/10 blur-3xl" />
      </div>

      {/* 2. Top Minimal Branding Header */}
      <div className="relative z-10 flex items-center justify-center pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">
            Official Portal
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">
            v7.0
          </span>
        </div>
      </div>

      {/* 3. Center Hero: Logo with Minimal Glowing Orbital Animation */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-5 my-auto">
        <LogoLoader
          size="xl"
          showText={false}
          logoSrc="/amu-crest-logo.png"
        />

        <div className="text-center space-y-1">
          <h1 className="text-sm font-extrabold tracking-[0.2em] text-white uppercase drop-shadow-sm">
            MUSF STUDENTS&apos; UNION
          </h1>
          <p className="text-[11px] text-slate-400 tracking-wider font-medium">
            Majlis Umariyya Wafy College
          </p>
        </div>
      </div>

      {/* 4. Bottom Controls & Minimal Progress Track */}
      <div className="relative z-10 w-full max-w-xs mx-auto space-y-2.5 pb-2">
        {/* Status Line & Percent */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-300 px-0.5">
          <span className="truncate pr-2 text-[11px] text-slate-300 font-medium">
            {statusText}
          </span>
          <span className="font-bold text-teal-400 font-mono text-xs">
            {progress}%
          </span>
        </div>

        {/* Minimal Sleek Progress Track */}
        <div className="w-full h-1.5 bg-white/10 backdrop-blur-md rounded-full overflow-hidden p-0">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] via-[#14B8A6] to-[#38BDF8] transition-all duration-150 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
          </div>
        </div>

        {/* Skip hint */}
        <div className="text-center pt-1">
          <span className="text-[10px] text-slate-400 hover:text-white transition tracking-wide">
            Tap anywhere to enter &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

