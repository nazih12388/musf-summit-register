import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  ArrowRight,
  Maximize2,
  X
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
  const [fullscreenPoster, setFullscreenPoster] = useState(null);
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
    if (slides.length <= 1 || isHovered || fullscreenPoster) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered, fullscreenPoster]);

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
      return;
    }
    if (slide.imageUrl) {
      setFullscreenPoster(slide);
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
        className="relative rounded-[16px] overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800 bg-slate-950 h-[220px] sm:h-[300px] md:h-[340px] flex items-center group cursor-pointer"
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
            className="absolute inset-0 w-full h-full flex flex-col justify-between p-3 sm:p-5 text-white"
          >
            {/* Background & Foreground Display */}
            {currentSlide.imageUrl ? (
              <>
                {/* 1. Ambient Blurred Backdrop */}
                <div className="absolute inset-0 overflow-hidden bg-slate-950 pointer-events-none z-0">
                  <img
                    src={currentSlide.imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-950/45" />
                </div>

                {/* 2. Uncropped Foreground Poster (100% visible, natural aspect ratio) */}
                <div className="absolute inset-0 flex items-center justify-center p-2.5 sm:p-4 pointer-events-none z-10">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title || 'Poster'}
                    className="w-full h-full object-contain rounded-lg drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                </div>
              </>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-tr ${currentSlide.bgGradient || 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]'} z-0`} />
            )}

            {/* Top row: Category Badge & Fullscreen trigger */}
            <div className="relative z-20 flex items-center justify-between gap-2 pointer-events-auto">
              <span className="px-2.5 py-0.8 rounded-full bg-slate-900/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-teal-300 border border-teal-500/30">
                {currentSlide.badge || 'Campus Highlight'}
              </span>

              {currentSlide.imageUrl ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenPoster(currentSlide);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-900/75 hover:bg-black/90 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md"
                  title="View Full Poster"
                >
                  <Maximize2 className="w-3 h-3 text-teal-400" />
                  <span className="hidden sm:inline">Full Poster</span>
                </button>
              ) : currentSlide.tag ? (
                <span className="text-[11px] font-semibold text-teal-200/90 truncate max-w-[140px]">
                  {currentSlide.tag}
                </span>
              ) : null}
            </div>

            {/* Middle & Bottom: Title, Subtitle, and Action Button */}
            {currentSlide.imageUrl ? (
              <div className="relative z-20 mt-auto flex items-end justify-between gap-3 pointer-events-auto">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/10 max-w-md space-y-0.5 shadow-lg">
                  <h2 className="text-xs sm:text-sm font-extrabold text-white leading-snug truncate drop-shadow-sm">
                    {currentSlide.title}
                  </h2>
                  {currentSlide.subtitle && (
                    <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1 font-medium">
                      {currentSlide.subtitle}
                    </p>
                  )}
                </div>

                {(currentSlide.linkUrl || currentSlide.actionTab) && (
                  <motion.button
                    type="button"
                    whileTap={reduced ? undefined : { scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlideAction(currentSlide);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0E7C86] hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                  >
                    <span>{currentSlide.actionText || 'View Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>
            ) : (
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
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrow Controls */}
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

      {/* Fullscreen Poster Lightbox Modal */}
      <AnimatePresence>
        {fullscreenPoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6"
            onClick={() => setFullscreenPoster(null)}
          >
            {/* Top Bar */}
            <div
              className="w-full max-w-4xl flex items-center justify-between text-white pb-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-w-0 pr-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                  {fullscreenPoster.badge || 'Poster View'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {fullscreenPoster.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenPoster(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Close poster view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Image (100% Uncropped Full Natural Aspect Ratio) */}
            <div
              className="relative flex-1 w-full max-w-4xl flex items-center justify-center min-h-0 overflow-hidden py-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenPoster.imageUrl}
                alt={fullscreenPoster.title}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none"
              />
            </div>

            {/* Bottom Bar */}
            <div
              className="w-full max-w-4xl pt-3 flex items-center justify-center gap-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {(fullscreenPoster.linkUrl || fullscreenPoster.actionTab) && (
                <button
                  type="button"
                  onClick={() => {
                    handleSlideAction(fullscreenPoster);
                    setFullscreenPoster(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>{fullscreenPoster.actionText || 'Open Action'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setFullscreenPoster(null)}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
