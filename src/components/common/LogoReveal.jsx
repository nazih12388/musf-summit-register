import React, { useState, useEffect } from 'react';

/**
 * High-End Logo Reveal Animation (Inspired by Dmitry Lepisov Motion Design)
 * 
 * Animation Stages:
 * 1. Initial Central Spark & Radial Light Burst
 * 2. Luminous Neon Stroke Trace along the orbital ring with high-intensity satellite particle
 * 3. Elastic Spring Expansion of the central emblem with ambient glassmorphism backlight
 * 4. Specular Diagonal Light Sweep (Sheen Reflection) slicing across the crest
 * 5. Text Reveal with letter-spacing expansion & gold/cyan accent glow
 * 6. Continuous, graceful idle breathing & orbital rotation
 */
export const LogoReveal = ({
  size = 'md', // 'sm' | 'md' | 'lg' | 'login' | 'splash'
  mode = 'reveal', // 'reveal' (plays entrance then loops) | 'loop' (loops immediately)
  showText = true,
  title = "MUSF STUDENTS' UNION",
  subtitle = "Majlis Umariyya Wafy College",
  arabicMotto = "من رام درّا للسفينة يركب",
  className = '',
  logoSrc = '/musf-official-emblem.jpg',
  onRevealComplete
}) => {
  const [animStage, setAnimStage] = useState(mode === 'loop' ? 4 : 0);

  useEffect(() => {
    if (mode === 'loop') return;

    // Sequence timing:
    // 0ms: Initial central spark ignite
    const t1 = setTimeout(() => setAnimStage(1), 80);    // Ring stroke & satellite trace starts
    const t2 = setTimeout(() => setAnimStage(2), 400);   // Logo emblem pops with elastic bounce
    const t3 = setTimeout(() => setAnimStage(3), 850);   // Specular diagonal light sweep slices across
    const t4 = setTimeout(() => {
      setAnimStage(4);   // Typography & idle breathing settles
      if (onRevealComplete) onRevealComplete();
    }, 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [mode, onRevealComplete]);

  // Dimension mapping
  const dim = {
    sm: {
      box: 84,
      logo: 48,
      r1: 37,
      r2: 31,
      stroke: 2.5,
      sparkR: 3,
      titleSize: 'text-xs',
      subSize: 'text-[10px]'
    },
    md: {
      box: 116,
      logo: 68,
      r1: 52,
      r2: 44,
      stroke: 3,
      sparkR: 3.5,
      titleSize: 'text-sm',
      subSize: 'text-[11px]'
    },
    lg: {
      box: 138,
      logo: 84,
      r1: 62,
      r2: 52,
      stroke: 3.5,
      sparkR: 4,
      titleSize: 'text-base sm:text-lg',
      subSize: 'text-xs'
    },
    login: {
      box: 130,
      logo: 80,
      r1: 58,
      r2: 48,
      stroke: 3.5,
      sparkR: 4,
      titleSize: 'text-xl sm:text-2xl',
      subSize: 'text-xs'
    },
    splash: {
      box: 176,
      logo: 108,
      r1: 79,
      r2: 66,
      stroke: 4,
      sparkR: 4.5,
      titleSize: 'text-base sm:text-lg font-black',
      subSize: 'text-xs font-semibold'
    }
  }[size] || {
    box: 116,
    logo: 68,
    r1: 52,
    r2: 44,
    stroke: 3,
    sparkR: 3.5,
    titleSize: 'text-sm',
    subSize: 'text-[11px]'
  };

  const center = dim.box / 2;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Lepisov Motion Keyframes */}
      <style>{`
        @keyframes lepisovOrbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes lepisovCounterOrbit {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes lepisovAuraPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.35; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes lepisovLogoIdle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes lepisovLightSweep {
          0% { transform: translateX(-160%) rotate(25deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translateX(240%) rotate(25deg); opacity: 0; }
        }
        @keyframes lepisovSparkGlow {
          0%, 100% { filter: drop-shadow(0 0 6px #38BDF8) drop-shadow(0 0 12px #14B8A6); }
          50% { filter: drop-shadow(0 0 10px #38BDF8) drop-shadow(0 0 20px #0E7C86); }
        }
        .lepisov-orbit {
          animation: lepisovOrbit 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: center;
        }
        .lepisov-counter-orbit {
          animation: lepisovCounterOrbit 5.2s linear infinite;
          transform-origin: center;
        }
        .lepisov-aura {
          animation: lepisovAuraPulse 3.2s ease-in-out infinite;
        }
        .lepisov-idle {
          animation: lepisovLogoIdle 3.6s ease-in-out infinite;
        }
        .lepisov-sweep-run {
          animation: lepisovLightSweep 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite 1.8s;
        }
        .lepisov-spark {
          animation: lepisovSparkGlow 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Main Emblem & Orbital Composition */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: dim.box, height: dim.box }}
      >
        {/* 1. Ambient Luminous Backlight Aura */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
            animStage >= 2 ? 'opacity-100 scale-100 lepisov-aura' : 'opacity-0 scale-50'
          }`}
          style={{
            width: dim.logo * 1.45,
            height: dim.logo * 1.45,
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.5) 0%, rgba(14, 124, 134, 0.25) 45%, rgba(56, 189, 248, 0.1) 70%, transparent 85%)',
            filter: 'blur(16px)'
          }}
        />

        {/* 2. SVG Concentric Orbital Rings & Satellite Light */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${dim.box} ${dim.box}`}
        >
          <defs>
            {/* Luminous Neon Gradient */}
            <linearGradient id="lepisovBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0E7C86" stopOpacity="0.05" />
              <stop offset="25%" stopColor="#0E7C86" stopOpacity="0.35" />
              <stop offset="65%" stopColor="#14B8A6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="lepisovGoldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A227" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#EAB308" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#C9A227" stopOpacity="0.1" />
            </linearGradient>

            {/* Glowing filter for neon satellite spark */}
            <filter id="lepisovSparkFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Static Track Ring (Subtle guide wire) */}
          <circle
            cx={center}
            cy={center}
            r={dim.r1}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-white/10 dark:text-white/10 transition-opacity duration-500"
            opacity={animStage >= 1 ? 1 : 0}
          />

          {/* Secondary Gyroscopic Dashed Ring (Counter-rotating) */}
          <circle
            cx={center}
            cy={center}
            r={dim.r2}
            fill="none"
            stroke="url(#lepisovGoldAccent)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            className={`lepisov-counter-orbit transition-opacity duration-700 ${
              animStage >= 1 ? 'opacity-80' : 'opacity-0'
            }`}
          />

          {/* Primary High-Speed Orbital Beam & Leading Neon Spark */}
          <g className={`lepisov-orbit transition-opacity duration-500 ${
            animStage >= 1 ? 'opacity-100' : 'opacity-0'
          }`}>
            <circle
              cx={center}
              cy={center}
              r={dim.r1}
              fill="none"
              stroke="url(#lepisovBeamGradient)"
              strokeWidth={dim.stroke}
              strokeLinecap="round"
              strokeDasharray={`${dim.r1 * 1.6} ${dim.r1 * 4.7}`}
            />
            {/* Satellite Spark Particle */}
            <circle
              cx={center + dim.r1 * Math.cos(0)}
              cy={center + dim.r1 * Math.sin(0)}
              r={dim.sparkR}
              fill="#38BDF8"
              filter="url(#lepisovSparkFilter)"
              className="lepisov-spark"
            />
            {/* Trailing golden micro-sparkle */}
            <circle
              cx={center + dim.r1 * Math.cos(0.35)}
              cy={center + dim.r1 * Math.sin(0.35)}
              r={dim.sparkR * 0.65}
              fill="#EAB308"
              opacity="0.85"
            />
          </g>
        </svg>

        {/* 3. Center Emblem Frame with Elastic Pop & Light Sweep */}
        <div
          className={`relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-700 ease-out shadow-2xl ${
            animStage >= 2
              ? 'scale-100 opacity-100 lepisov-idle'
              : 'scale-0 opacity-0'
          }`}
          style={{
            width: dim.logo,
            height: dim.logo,
            padding: dim.logo * 0.05,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,250,0.98) 100%)',
            boxShadow: '0 12px 30px -8px rgba(14, 124, 134, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.6) inset, 0 0 0 1.5px rgba(20, 184, 166, 0.5)'
          }}
        >
          {/* Official Emblem Image */}
          <img
            src={logoSrc}
            alt="MUSF Official Crest"
            className="w-full h-full object-contain select-none filter contrast-105 drop-shadow-xs"
            onError={(e) => {
              if (e.target.src.indexOf('amu-crest-square.png') === -1) {
                e.target.src = '/amu-crest-square.png';
              }
            }}
          />

          {/* 4. The Lepisov Specular Light Sweep Sheen */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              animStage >= 3 ? 'lepisov-sweep-run' : 'opacity-0'
            }`}
            style={{
              width: '200%',
              height: '200%',
              top: '-50%',
              left: '-50%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.1) 65%, transparent 100%)',
              mixBlendMode: 'overlay'
            }}
          />
        </div>
      </div>

      {/* 5. Staggered Text Reveal */}
      {showText && (
        <div className={`mt-3.5 flex flex-col items-center text-center transition-all duration-700 ease-out ${
          animStage >= 4
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-3'
        }`}>
          {title && (
            <h2 className={`${dim.titleSize} font-black tracking-[0.16em] uppercase text-white drop-shadow-md`}>
              {title}
            </h2>
          )}

          {subtitle && (
            <p className={`${dim.subSize} text-teal-300 font-medium tracking-wider mt-0.5 drop-shadow-xs`}>
              {subtitle}
            </p>
          )}

          {arabicMotto && (
            <p className="text-[12px] font-serif text-amber-200/90 tracking-widest mt-1 drop-shadow-xs" dir="rtl">
              {arabicMotto}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
