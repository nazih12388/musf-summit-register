import React from 'react';

/**
 * Minimal & Aesthetic Logo Loading Animation
 * Features:
 * - Concentric glowing orbital rings with SVG gradient stroke
 * - Smooth counter-rotating dashed secondary ring for gyroscopic depth
 * - Orbiting glowing neon satellite spark
 * - Breathing aura glow backdrop
 * - Rounded emblem container displaying the official college crest
 * - Minimal typography and optional animated dot ellipses
 */
export const LogoLoader = ({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  text = 'Loading...',
  subtext = '',
  fullScreen = false,
  showText = true,
  className = '',
  logoSrc = '/amu-crest-logo.png'
}) => {
  // Size configurations
  const config = {
    sm: {
      box: 76,
      logo: 42,
      r1: 33,
      r2: 27,
      stroke: 2.5,
      sparkR: 3,
      fontSize: 'text-[11px]',
      gap: 'gap-2'
    },
    md: {
      box: 108,
      logo: 62,
      r1: 48,
      r2: 40,
      stroke: 3,
      sparkR: 3.5,
      fontSize: 'text-xs',
      gap: 'gap-3'
    },
    lg: {
      box: 144,
      logo: 82,
      r1: 64,
      r2: 54,
      stroke: 3.5,
      sparkR: 4,
      fontSize: 'text-sm',
      gap: 'gap-3.5'
    },
    xl: {
      box: 180,
      logo: 104,
      r1: 80,
      r2: 68,
      stroke: 4,
      sparkR: 4.5,
      fontSize: 'text-sm',
      gap: 'gap-4'
    }
  }[size] || {
    box: 108,
    logo: 62,
    r1: 48,
    r2: 40,
    stroke: 3,
    sparkR: 3.5,
    fontSize: 'text-xs',
    gap: 'gap-3'
  };

  const center = config.box / 2;

  const content = (
    <div className={`flex flex-col items-center justify-center select-none ${config.gap} ${className}`}>
      {/* Animation Styles */}
      <style>{`
        @keyframes musfOrbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes musfReverseSpin {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes musfPulseAura {
          0%, 100% { transform: scale(0.94); opacity: 0.45; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes musfLogoBreath {
          0%, 100% { transform: scale(0.97); }
          50% { transform: scale(1.02); }
        }
        @keyframes musfDotFade {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .musf-orbit-main {
          animation: musfOrbitSpin 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: center;
        }
        .musf-orbit-reverse {
          animation: musfReverseSpin 4.5s linear infinite;
          transform-origin: center;
        }
        .musf-aura-pulse {
          animation: musfPulseAura 3s ease-in-out infinite;
        }
        .musf-logo-breath {
          animation: musfLogoBreath 3s ease-in-out infinite;
        }
        .musf-dot-1 { animation: musfDotFade 1.4s infinite 0.2s; }
        .musf-dot-2 { animation: musfDotFade 1.4s infinite 0.4s; }
        .musf-dot-3 { animation: musfDotFade 1.4s infinite 0.6s; }
      `}</style>

      {/* Orbital Ring & Logo Composition */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.box, height: config.box }}
      >
        {/* Ambient Backlight Glow Aura */}
        <div
          className="absolute rounded-full musf-aura-pulse pointer-events-none"
          style={{
            width: config.logo * 1.3,
            height: config.logo * 1.3,
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.45) 0%, rgba(14, 124, 134, 0.2) 50%, transparent 75%)',
            filter: 'blur(14px)'
          }}
        />

        {/* SVG Orbital Rings */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${config.box} ${config.box}`}
        >
          <defs>
            {/* Gradient for the primary spinning ring */}
            <linearGradient id="musfOrbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0E7C86" stopOpacity="0.05" />
              <stop offset="30%" stopColor="#0E7C86" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="1" />
            </linearGradient>

            {/* Glowing filter for the orbital spark dot */}
            <filter id="musfNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Static delicate track ring (ultra subtle) */}
          <circle
            cx={center}
            cy={center}
            r={config.r1}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-200/50 dark:text-slate-700/40"
          />

          {/* 2. Secondary counter-rotating dashed ring */}
          <circle
            cx={center}
            cy={center}
            r={config.r2}
            fill="none"
            stroke="#14B8A6"
            strokeOpacity="0.35"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            className="musf-orbit-reverse"
          />

          {/* 3. Primary active gradient orbital arc */}
          <g className="musf-orbit-main">
            <circle
              cx={center}
              cy={center}
              r={config.r1}
              fill="none"
              stroke="url(#musfOrbitGradient)"
              strokeWidth={config.stroke}
              strokeLinecap="round"
              strokeDasharray={`${config.r1 * 1.55} ${config.r1 * 4.8}`}
            />
            {/* Leading glowing neon satellite dot */}
            <circle
              cx={center + config.r1 * Math.cos(0)}
              cy={center + config.r1 * Math.sin(0)}
              r={config.sparkR}
              fill="#38BDF8"
              filter="url(#musfNeonGlow)"
            />
            {/* Trailing tiny accent sparkle */}
            <circle
              cx={center + config.r1 * Math.cos(0.4)}
              cy={center + config.r1 * Math.sin(0.4)}
              r={config.sparkR * 0.65}
              fill="#14B8A6"
              opacity="0.8"
            />
          </g>
        </svg>

        {/* Center Logo Emblem Badge */}
        <div
          className="relative rounded-2xl p-1.5 flex items-center justify-center musf-logo-breath transition-transform duration-300 shadow-xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#0B1522]/90 backdrop-blur-md overflow-hidden"
          style={{
            width: config.logo,
            height: config.logo
          }}
        >
          {/* Subtle inner ambient shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-transparent to-white/25 pointer-events-none" />

          {/* College Crest Image */}
          <img
            src={logoSrc}
            alt="MUSF Logo Emblem"
            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 select-none"
            onError={(e) => {
              // Fallback to square emblem or college logo if transparent PNG fails
              if (e.target.src.indexOf('amu-crest-square.png') === -1) {
                e.target.src = '/amu-crest-square.png';
              }
            }}
          />
        </div>
      </div>

      {/* Minimal Status Label */}
      {showText && (text || subtext) && (
        <div className="flex flex-col items-center text-center space-y-0.5">
          {text && (
            <div className={`font-bold tracking-wide text-slate-800 dark:text-slate-100 flex items-center justify-center ${config.fontSize}`}>
              <span>{text}</span>
              <span className="inline-flex font-mono ml-0.5">
                <span className="musf-dot-1">.</span>
                <span className="musf-dot-2">.</span>
                <span className="musf-dot-3">.</span>
              </span>
            </div>
          )}
          {subtext && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F6F8FB]/90 dark:bg-[#080E18]/95 backdrop-blur-md transition-all duration-300">
        {content}
      </div>
    );
  }

  return content;
};
