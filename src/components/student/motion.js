/**
 * Shared Motion Variants & Animation Design System for Student Portal
 * Durations: 150ms to 450ms
 * Easing: [0.22, 1, 0.36, 1]
 * Springs: stiffness 420, damping 30
 */

export const EASING = [0.22, 1, 0.36, 1];

export const SPRING_POP = {
  type: 'spring',
  stiffness: 420,
  damping: 30
};

export const SPRING_DRAWER = {
  type: 'spring',
  stiffness: 350,
  damping: 32
};

export const SPRING_SHEET = {
  type: 'spring',
  stiffness: 380,
  damping: 32
};

// Check if user has requested reduced motion
export const isReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  const userSetting = localStorage.getItem('musf_reduced_motion');
  if (userSetting === 'true') return true;
  if (userSetting === 'false') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Set reduced motion preference
export const setReducedMotionPreference = (enabled) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('musf_reduced_motion', enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('musf:reduced-motion-changed', { detail: { enabled } }));
  }
};

// Route & screen transitions: fade and slide 8px (200ms)
export const routeVariants = {
  initial: {
    opacity: 0,
    y: 8
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: EASING
    }
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.15,
      ease: EASING
    }
  }
};

// Fade up entrance (12px, 300ms)
export const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 12
  },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      delay: custom * 0.04,
      ease: EASING
    }
  })
};

// Pop in with spring overshoot
export const popVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85
  },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRING_POP,
      delay: custom * 0.04
    }
  })
};

// Staggered list container
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

// Slide in from left
export const slideInLeftVariants = {
  hidden: {
    opacity: 0,
    x: -16
  },
  visible: (custom = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: custom * 0.04,
      ease: EASING
    }
  })
};

// Slide in from right
export const slideInRightVariants = {
  hidden: {
    opacity: 0,
    x: 16
  },
  visible: (custom = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: custom * 0.04,
      ease: EASING
    }
  })
};

// Interactive tap & hover variants
export const pressTile = {
  scale: 0.94,
  transition: { duration: 0.1, ease: 'easeOut' }
};

export const hoverTile = {
  y: -2,
  transition: { duration: 0.18, ease: EASING }
};

export const pressCard = {
  scale: 0.97,
  transition: { duration: 0.1, ease: 'easeOut' }
};

export const hoverCard = {
  y: -2,
  transition: { duration: 0.18, ease: EASING }
};
