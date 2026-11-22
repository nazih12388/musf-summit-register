import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  ArrowRight
} from 'lucide-react';
import { EASING, isReducedMotion } from '../motion';

export const BannerCarousel = ({
  banners = [],
  wings = [],
  onNavigate,
  canManage = false,
  onOpenManageModal
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [isHovered, setIsHovered] = useState(false);
  const reduced = isReducedMotion();

  // If no banners, provide a polished fallback college slide
  const slides = banners.length > 0 ? banners : [
    {
      id: 'default_welcome',
      title: 'Majlis Umariyya Wafy College',
      subtitle: 'Affiliated to CIC • Learn • Grow • Excel under autonomous student wings',
      badge: '🏛️ Official Union',
      tag: 'MUSF Union',
      bgGradient: 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]',
      actionText: 'Explore Wings',
      actionTab: 'wings'
    }
  ];

  // Auto-advance every 5 seconds (paused on hover)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  const handleSlideAction = (slide) => {
    if (slide.linkUrl) {
      window.open(slide.linkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (slide.actionTab && typeof onNavigate === 'function') {
      onNavigate(slide.actionTab);
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: reduced ? 0 : dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: EASING
      }
    },
    exit: (dir) => ({
      x: reduced ? 0 : dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.35,
        ease: EASING
      }
    })
  };

  return (
    <div className="px-4 sm:px-6 space-y-2 select-none">
      {/* Header bar with optional Manage button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#0E7C86]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Featured Highlights
          </h3>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={onOpenManageModal}
            className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0E7C86] dark:text-teal-300 text-[11px] font-bold hover:bg-teal-100 dark:hover:bg-teal-900 transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Manage Posters</span>
          </button>
        )}
      </div>

      {/* Carousel Card Container */}
      <div
        className="relative rounded-[16px] overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800 bg-slate-900 min-h-[175px] sm:min-h-[195px] flex items-center group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleSlideAction(currentSlide)}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full flex flex-col justify-between p-4 sm:p-6 text-white"
          >
            {/* Background Poster Image or Gradient */}
            {currentSlide.imageUrl ? (
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                />
                {/* Multi-layer readability gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-900/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
              </div>
            ) : (
              <div className={`absolute inset-0 -z-10 bg-gradient-to-tr ${currentSlide.bgGradient || 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]'}`} />
            )}

            {/* Top row: Category Badge & Tag */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.8 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                {currentSlide.badge || 'Campus Highlight'}
              </span>

              {currentSlide.tag && (
                <span className="text-[11px] font-semibold text-teal-200/90 truncate max-w-[140px]">
                  {currentSlide.tag}
                </span>
              )}
            </div>

            {/* Middle & Bottom: Title, Subtitle, and Action Button */}
            <div className="relative z-10 space-y-2 mt-auto">
              <div className="space-y-0.5 max-w-xl">
                <h2 className="text-base sm:text-xl font-extrabold text-white leading-snug drop-shadow-sm line-clamp-2">
                  {currentSlide.title}
                </h2>
                {currentSlide.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 font-medium drop-shadow-xs">
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-1 flex items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideAction(currentSlide);
                  }}
                  className="px-3.5 py-1.5 rounded-[10px] bg-[#0E7C86] hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>{currentSlide.actionText || 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrow Controls (Visible on hover on desktop, always responsive on mobile) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Slide Indicator Dots / Pills */}
        {slides.length > 1 && (
          <div className="absolute bottom-2.5 right-4 z-20 flex items-center gap-1.5 pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-5 h-1.5 bg-[#0E7C86]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
