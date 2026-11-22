import confetti from 'canvas-confetti';
import { isReducedMotion } from '../motion';

export const triggerStudentConfetti = () => {
  if (isReducedMotion()) return;

  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      ticks: 120,
      colors: ['#0E7C86', '#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      disableForReducedMotion: true
    });
  } catch (err) {
    console.debug('Confetti suppressed:', err);
  }
};
