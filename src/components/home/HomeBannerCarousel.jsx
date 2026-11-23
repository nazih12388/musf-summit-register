import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  ExternalLink,
  Award,
  Layers,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

export const HomeBannerCarousel = ({ onNavigateToWing, onNavigateToTab }) => {
  const { currentUser } = useAuth();
  const { lang, tr } = useLanguage();
  const {
    banners = [],
    addBanner,
    updateBanner,
    deleteBanner,
    wings = []
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Touch swipe support
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const slides = banners.length > 0 ? banners : [];

  // Check if user is Admin, Executive, or Convener
  const canManage = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.role === 'admin' ||
      currentUser.role === 'executive' ||
      currentUser.role === 'convener'
    );
  }, [currentUser]);

  // Autoplay timer (5 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Keep index within bounds if slides delete
  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Form local state for Add / Edit
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'Summit 2026',
    tag: 'Fine Arts Wing',
    imageUrl: '',
    wingId: 'fine_arts',
    actionText: 'View Details',
    bgGradient: 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]'
  });

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'Union Event',
      tag: 'Students Union',
      imageUrl: '',
      wingId: 'fine_arts',
      actionText: 'Explore Details',
      bgGradient: 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      badge: slide.badge || 'Notice',
      tag: slide.tag || '',
      imageUrl: slide.imageUrl || '',
      wingId: slide.wingId || 'fine_arts',
      actionText: slide.actionText || 'Explore',
      bgGradient: slide.bgGradient || 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]'
    });
    setIsFormOpen(true);
  };

  const handleSaveSlide = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a banner title.');
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim()
    };

    if (editingSlide) {
      updateBanner(editingSlide.id, payload, currentUser?.username || 'admin');
    } else {
      addBanner(payload, currentUser?.username || 'admin');
    }

    setIsFormOpen(false);
    setEditingSlide(null);
  };

  const handleDeleteSlide = (id) => {
    if (window.confirm('Are you sure you want to delete this banner slide?')) {
      deleteBanner(id, currentUser?.username || 'admin');
    }
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div className="relative w-full">
      {/* Outer Carousel Container */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 bg-[#0F1B2B] select-none group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Banner Slide Content Viewport */}
        <div className="relative w-full h-[260px] sm:h-[300px] md:h-[340px] overflow-hidden">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Ambient Blur + Uncropped Foreground Poster */}
                {slide.imageUrl ? (
                  <>
                    <div className="absolute inset-0 overflow-hidden bg-slate-950 pointer-events-none z-0">
                      <img
                        src={slide.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
                      />
                      <div className="absolute inset-0 bg-slate-950/45" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none z-10">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-contain rounded-xl drop-shadow-2xl"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  </>
                ) : (
                  <div className={`w-full h-full bg-gradient-to-r ${slide.bgGradient || 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]'}`} />
                )}

                {/* Slide Text & Action Details */}
                <div className="absolute inset-0 p-5 sm:p-8 md:p-10 flex flex-col justify-between z-20 text-white">
                  {/* Top Badges */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {slide.badge ? (
                          lang === 'en' ? (
                            slide.badge.replace(/സമ്മിറ്റ്/g, 'Summit')
                              .replace(/യൂണിയൻ പരിപാടി/g, 'Union Event')
                              .replace(/യൂണിയൻ നേട്ടം/g, 'Union Honor')
                              .replace(/കായികമേള/g, 'Sports Meet')
                              .replace(/അക്കാദമിക് സിമ്പോസിയം/g, 'Academic Symposium')
                              .replace(/ജീവകാരുണ്യം/g, 'Social Service')
                              .replace(/പരിപാടി/g, 'Event')
                              .replace(/അറിയിപ്പ്/g, 'Notice')
                          ) : slide.badge
                        ) : tr('Event', 'പരിപാടി')}
                      </span>
                    </span>

                    {slide.tag && (
                      <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-[10px] sm:text-xs border border-white/25">
                        {slide.tag}
                      </span>
                    )}
                  </div>

                  {/* Center/Bottom Content */}
                  <div className="max-w-2xl space-y-2 mt-auto">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight drop-shadow-md text-white">
                      {lang === 'ml' && slide.titleMl ? slide.titleMl : slide.title}
                    </h2>

                    {(slide.subtitle || slide.subtitleMl) && (
                      <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
                        {lang === 'ml' && slide.subtitleMl ? slide.subtitleMl : (slide.subtitle || '')}
                      </p>
                    )}

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof onNavigateToWing === 'function' && slide.wingId) {
                            onNavigateToWing(slide.wingId);
                          } else if (typeof onNavigateToTab === 'function') {
                            onNavigateToTab('wings');
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0E7C86] to-[#0c6b74] hover:brightness-110 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <span>{lang === 'ml' && slide.actionTextMl ? slide.actionTextMl : (slide.actionText || tr('Explore Details', 'കൂടുതൽ വിവരങ്ങൾ'))}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous Button */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition active:scale-90 opacity-80 sm:opacity-0 group-hover:opacity-100"
            title="Previous Slide"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition active:scale-90 opacity-80 sm:opacity-0 group-hover:opacity-100"
            title="Next Slide"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Top-Right Admin / Convener Manage Trigger */}
        {canManage && (
          <div className="absolute top-4 right-4 z-30">
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md"
              title="Manage Home Carousel Slides"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">Manage Slides</span>
            </button>
          </div>
        )}

        {/* Bottom Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 z-30 flex items-center justify-center gap-1.5 pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-amber-400 shadow-sm'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* MANAGE SLIDES MODAL (Admin / Executive / Convener) */}
      {isManageModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsManageModalOpen(false)}
          title="Manage Home Banner Carousel Slides"
          maxWidth="max-w-2xl"
        >
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Active Home Carousel Slides ({slides.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Slides display horizontally on the logged-in dashboard and auto-sync to all users.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#0c6b74] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Slide</span>
              </button>
            </div>

            {/* Slides Roster */}
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                      {slide.imageUrl ? (
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                          {slide.badge || 'Slide'}
                        </span>
                        {slide.tag && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            • {slide.tag}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                        {slide.title}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(slide)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT SLIDE MODAL */}
      {isFormOpen && (
        <Modal
          isOpen={true}
          onClose={() => { setIsFormOpen(false); setEditingSlide(null); }}
          title={editingSlide ? 'Edit Carousel Banner Slide' : 'Add New Carousel Banner Slide'}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveSlide} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Slide Headline / Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Fine Arts Summit 2026 Poster Launch"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Subtitle / Malayalam Description
              </label>
              <textarea
                rows={2}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Brief Malayalam or English description..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Category Badge
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Summit 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tag / Label
                </label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="e.g. Fine Arts Wing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Poster Image / Upload Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {tr('Poster Graphic / Photo', 'പോസ്റ്റർ ചിത്രം')}
              </label>

              {/* Option 1: File Upload directly from phone/laptop */}
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-teal-500/50 hover:border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 font-bold text-xs cursor-pointer transition active:scale-98">
                  <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{tr('Choose Photo from Device', 'ഫോണിൽ നിന്ന് തിരഞ്ഞെടുക്കുക')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image size exceeds 5MB. Please choose a smaller photo.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (loadEvt) => {
                        // Compress via canvas for fast real-time Firestore sync
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const maxDim = 1200;
                          let width = img.width;
                          let height = img.height;
                          if (width > maxDim || height > maxDim) {
                            if (width > height) {
                              height = Math.round((height * maxDim) / width);
                              width = maxDim;
                            } else {
                              width = Math.round((width * maxDim) / height);
                              height = maxDim;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, width, height);
                          const compressed = canvas.toDataURL('image/jpeg', 0.82);
                          setFormData(prev => ({ ...prev, imageUrl: compressed }));
                        };
                        img.src = loadEvt.target.result;
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                    title="Remove Image"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Option 2: Direct Image URL or Instagram Link */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={formData.imageUrl.startsWith('data:image') ? '[Uploaded Photo Ready]' : formData.imageUrl}
                  disabled={formData.imageUrl.startsWith('data:image')}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              {/* Image Preview Box */}
              {formData.imageUrl && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900">
                  <img
                    src={formData.imageUrl}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                    Slide Preview
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Linked Union Wing
                </label>
                <select
                  value={formData.wingId}
                  onChange={(e) => setFormData({ ...formData, wingId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {wings.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Action Button Label
                </label>
                <input
                  type="text"
                  value={formData.actionText}
                  onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
                  placeholder="e.g. View Details"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setIsFormOpen(false); setEditingSlide(null); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0E7C86] text-white font-bold text-xs shadow-md hover:bg-[#0c6b74] transition"
              >
                {editingSlide ? 'Save Changes' : 'Add Banner'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
