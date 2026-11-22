import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

// Motion Tokens
export const MOTION_TOKENS = {
  durationFast: 0.12,
  durationBase: 0.20,
  durationSlow: 0.32,
  easeOut: [0.22, 1, 0.36, 1],
  spring: {
    type: 'spring',
    stiffness: 420,
    damping: 32
  }
};

// Framer Motion Animation Variants
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TOKENS.durationBase,
      ease: MOTION_TOKENS.easeOut
    }
  }
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

export const cardHoverLift = {
  whileHover: {
    y: -2,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
  },
  whileTap: {
    scale: 0.98
  }
};

export const buttonPressScale = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.01 }
};

/**
 * Animated CountUp Component for numerical values
 * Counts up smoothly over 600ms with ease-out curve once on entrance.
 */
export const CountUp = ({
  to = 0,
  duration = 0.6,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}) => {
  const [current, setCurrent] = useState(0);
  const target = Number(to) || 0;
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current && current === target) return;
    startedRef.current = true;

    // Check reduced motion
    const isReduced = typeof window !== 'undefined' && (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      localStorage.getItem('musf_reduce_motion') === 'true'
    );

    if (isReduced) {
      setCurrent(target);
      return;
    }

    const startVal = 0;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    let frameId;
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (target - startVal) * eased;
      setCurrent(val);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  const display = decimals > 0 ? current.toFixed(decimals) : Math.round(current);

  return React.createElement(
    'span',
    { className: `tabular-nums font-mono ${className}` },
    `${prefix}${display}${suffix}`
  );
};

/**
 * Single-shot confetti burst for prize unlocks and publishing results
 * 40 particles, 1.2s duration, canvas-confetti
 */
export const triggerPrizeConfetti = (origin = { x: 0.5, y: 0.5 }) => {
  if (typeof window === 'undefined') return;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    localStorage.getItem('musf_reduce_motion') === 'true';

  if (isReduced) return;

  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin,
      colors: ['#C9A227', '#0E7C86', '#1E3A5F', '#16A34A', '#2563EB'],
      disableForReducedMotion: true,
      ticks: 120,
      gravity: 1.1,
      scalar: 0.9
    });
  } catch (err) {
    // Fallback if canvas is blocked
    console.debug('Confetti suppressed:', err);
  }
};

/**
 * Hook to read and toggle reduced motion setting
 */
export const useReducedMotionPreference = () => {
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('musf_reduce_motion');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const toggleReduceMotion = (val) => {
    const nextVal = typeof val === 'boolean' ? val : !reduceMotion;
    setReduceMotion(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('musf_reduce_motion', String(nextVal));
      if (nextVal) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  };

  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reduceMotion]);

  return { reduceMotion, toggleReduceMotion };
};
