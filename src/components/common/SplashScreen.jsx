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
    // Phase 1 -> 2: Overlay starts after 350ms
    const t1 = setTimeout(() => setPhase(2), 350);

    // Phase 2 -> 3: Emblem appears after 700ms
    const t2 = setTimeout(() => setPhase(3), 700);

    // Phase 3 -> 4: Text branding appears after 1000ms
    const t3 = setTimeout(() => setPhase(4), 1000);

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
        const step = Math.floor(Math.random() * 14 + 10);
        const next = Math.min(prev + step, 100);

        if (next < 30) setStatusText('Connecting to Directorate Services...');
        else if (next < 65) setStatusText('Loading Summit Architecture & Fields...');
        else if (next < 90) setStatusText('Verifying Security Protocol...');
        else setStatusText('Welcome to MUSF Summit Register');

        return next;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [phase]);

  // Complete and fade out
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const exitTimer = setTimeout(() => {
          if (onFinished) onFinished();
        }, 700);
        return () => clearTimeout(exitTimer);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [progress, onFinished]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinished) onFinished();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 overflow-hidden cursor-pointer select-none transition-all duration-700 ease-out bg-black ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. FULL-SCREEN CAMPUS IMAGE (Starts full screen immediately with cinematic slow zoom) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src="/college-campus.jpg"
          alt="Majlis Umariyya Wafy College Campus"
          className="w-full h-full object-cover object-center animate-ken-burns will-change-transform"
        />
      </div>

      {/* 2. CINEMATIC MULTI-LAYERED GRADIENT OVERLAY (Fades in over full screen image) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-out pointer-events-none ${
          phase >= 2 ? 'opacity-100' : 'opacity-20'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(15, 42, 74, 0.45) 0%, rgba(8, 20, 36, 0.85) 65%, rgba(3, 7, 13, 0.95) 100%)'
        }}
      />

      {/* Top & Bottom Vignette Shadow Gradients */}
      <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`} />

      {/* Ambient Colored Light Orbs */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#0E7C86]/25 blur-3xl pointer-events-none transition-opacity duration-1000 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#C9A227]/15 blur-3xl pointer-events-none transition-opacity duration-1000 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`} />

      {/* 3. CONTENT CONTAINER (Flex column over full screen) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-8">
        
        {/* Top Header Badge */}
        <div className={`w-full max-w-sm mx-auto text-center transition-all duration-700 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#C9A227]/40 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C9A227]">
              Majlis Umariyya Wafy College
            </span>
          </div>
        </div>

        {/* Center: Heraldic Floating Campus Orb & Title */}
        <div className="my-auto flex flex-col items-center justify-center space-y-6">
          
          {/* Animated Emblem (Phase 3) */}
          <div className={`relative group transition-all duration-700 ${
            phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            {/* Outer Rotating Dashed Ring */}
            <div className="absolute -inset-4 sm:-inset-5 rounded-full border-2 border-dashed border-[#0E7C86]/60 animate-spin-slow pointer-events-none" />
            
            {/* Concentric Golden Ring */}
            <div className="absolute -inset-2 rounded-full border border-[#C9A227]/70 pointer-events-none animate-pulse" />

            {/* Glowing Center Badge containing the Minaret & Dome photo */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-br from-[#C9A227] via-[#0E7C86] to-[#0F2A4A] shadow-2xl animate-pulse-glow">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/90 shadow-2xl bg-[#071322]">
                <img
                  src="/college-campus.jpg"
                  alt="Wafy College Campus Minaret"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Floating Golden Institutional Crest */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#0F2A4A] via-[#1E3A5F] to-[#0F2A4A] border border-[#C9A227] shadow-xl flex items-center gap-1.5 text-[11px] font-extrabold text-[#C9A227] tracking-wider whitespace-nowrap">
              <Award className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>ESTD 2026 &bull; WAFY</span>
            </div>
          </div>

          {/* Title & Governance Tagline (Phase 4) */}
          <div className={`text-center space-y-2 max-w-lg px-4 transition-all duration-700 ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              MUSF SUMMIT REGISTER
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium tracking-wide drop-shadow-md">
              Academic, Leadership & Talents Summit Governance Portal
            </p>
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-mono text-teal-300 drop-shadow-xs">
              <span>Thamheediyya</span>
              <span>&bull;</span>
              <span>Aliya</span>
              <span>&bull;</span>
              <span>House Teams</span>
            </div>
          </div>
        </div>

        {/* Bottom Loading Progress Bar (Phase 4 / 5) */}
        <div className={`w-full max-w-xs mx-auto space-y-2.5 transition-all duration-700 ${
          phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-200">
            <span className="truncate pr-2 drop-shadow-sm">{statusText}</span>
            <span className="font-bold text-[#C9A227] drop-shadow-sm">{progress}%</span>
          </div>

          {/* Glowing Track */}
          <div className="w-full h-2.5 bg-black/70 backdrop-blur-md rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] via-[#14919D] to-[#C9A227] transition-all duration-150 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/40 animate-shimmer" />
            </div>
          </div>

          <div className="text-center pt-1">
            <span className="text-[10px] text-slate-400 hover:text-white transition">
              Tap anywhere to enter &rarr;
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
