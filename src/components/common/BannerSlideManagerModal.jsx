import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import {
  Image,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  FileCheck
} from 'lucide-react';

/**
 * Client-side canvas image compressor for free hosting / local storage.
 * Resizes to max 1000x560 (16:9) and compresses JPEG at 0.72 quality.
 * Typical output is 40KB - 110KB.
 */
export const compressPosterImage = (file, maxWidth = 1000, maxHeight = 560, quality = 0.72) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (JPG, PNG, WebP)'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const head = 'data:image/jpeg;base64,';
        const sizeInBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
        const sizeInKB = Math.round(sizeInBytes / 1024);

        resolve({ dataUrl, sizeInKB, width, height });
      };
      img.onerror = () => reject(new Error('Failed to process image'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
};

export const BannerSlideManagerModal = ({
  isOpen,
  onClose,
  banners = [],
  onAddBanner,
  onDeleteBanner,
  wings = [],
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'list'
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('📌 Union Program');
  const [selectedWingId, setSelectedWingId] = useState(
    currentUser?.wingId || currentUser?.assignedWingId || 'all'
  );
  const [actionText, setActionText] = useState('View Details');
  const [actionTab, setActionTab] = useState('programs');
  const [linkUrl, setLinkUrl] = useState('');

  // Compressed Image State
  const [posterDataUrl, setPosterDataUrl] = useState('');
  const [posterSizeKB, setPosterSizeKB] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsCompressing(true);

    try {
      const result = await compressPosterImage(file);
      setPosterDataUrl(result.dataUrl);
      setPosterSizeKB(result.sizeInKB);
    } catch (err) {
      setUploadError(err.message || 'Error optimizing poster image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemovePosterImage = () => {
    setPosterDataUrl('');
    setPosterSizeKB(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError('Please provide a banner title');
      return;
    }

    const actor = currentUser?.name || currentUser?.username || 'Union Official';

    const newSlide = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      badge: badge.trim() || '📌 Announcement',
      tag: wings.find(w => w.id === selectedWingId)?.name || 'MUSF Union',
      wingId: selectedWingId,
      imageUrl: posterDataUrl,
      bgGradient: 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]',
      actionText: actionText.trim() || 'View Details',
      actionTab: actionTab,
      linkUrl: linkUrl.trim(),
      isPinned: true
    };

    if (typeof onAddBanner === 'function') {
      await onAddBanner(newSlide, actor);
    }

    setFeedbackMsg(`Successfully published slide: "${newSlide.title}"!`);
    setTitle('');
    setSubtitle('');
    setPosterDataUrl('');
    setPosterSizeKB(0);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setFeedbackMsg('');
      setActiveTab('list');
    }, 1200);
  };

  const handleDelete = (id, slideTitle) => {
    if (window.confirm(`Delete banner slide "${slideTitle || 'this slide'}"?`)) {
      if (typeof onDeleteBanner === 'function') {
        onDeleteBanner(id, currentUser?.username || 'admin');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Home Posters & Animated Slides"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Sub-header Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'add'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Slide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Active Slides ({banners.length})</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* TAB 1: ADD NEW SLIDE */}
        {activeTab === 'add' && (
          <form onSubmit={handleSaveSlide} className="space-y-4">
            {/* Poster Upload with Auto-compression badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-[#0E7C86]" />
                  <span>Poster Image (Auto-Optimized for Free Hosting)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">JPG, PNG, WebP</span>
              </label>

              {posterDataUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                  <img
                    src={posterDataUrl}
                    alt="Poster Preview"
                    className="w-full h-44 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-3 opacity-95">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Optimized Size: {posterSizeKB} KB</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePosterImage}
                      className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center cursor-pointer hover:border-[#0E7C86] hover:bg-teal-50/20 dark:hover:bg-teal-950/10 transition space-y-2"
                >
                  <Upload className="w-6 h-6 text-[#0E7C86] mx-auto animate-bounce" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Click to choose Poster image
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Auto-compressed to under ~100 KB for unlimited free hosting compatibility
                    </p>
                  </div>
                  {isCompressing && (
                    <div className="text-xs text-teal-600 font-bold animate-pulse">
                      Optimizing image...
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {uploadError && (
              <div className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Title & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fine Arts Summit 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0E7C86]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tag / Category Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🎨 Fine Arts, 🏆 Sports"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0E7C86]"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Subtitle / Description
              </label>
              <input
                type="text"
                placeholder="e.g. 101 Stage and Non-stage items scheduled for this month"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0E7C86]"
              />
            </div>

            {/* Wing Association & Action */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Associated Wing
                </label>
                <select
                  value={selectedWingId}
                  onChange={(e) => setSelectedWingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0E7C86]"
                >
                  <option value="all">Union (Central / All)</option>
                  {wings.map(w => (
                    <option key={w.id} value={w.id}>{w.name || w.shortName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Button Action
                </label>
                <select
                  value={actionTab}
                  onChange={(e) => setActionTab(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0E7C86]"
                >
                  <option value="programs">Open Programs</option>
                  <option value="wings">Open Wings List</option>
                  <option value="summit">Open Fine Arts Summit</option>
                  <option value="notices">Open Notices</option>
                  <option value="prizes">Open Prizes</option>
                  <option value="external">Open External Link</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Button Text
                </label>
                <input
                  type="text"
                  placeholder="View Details"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0E7C86]"
                />
              </div>
            </div>

            {actionTab === 'external' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  External URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0E7C86]"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0E7C86] hover:bg-teal-700 active:scale-95 text-white transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish Slide</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ACTIVE SLIDES LIST */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {banners.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Image className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">No active banner slides yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0E7C86] text-white cursor-pointer"
                >
                  Create First Slide
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {banners.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {slide.imageUrl ? (
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-16 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-gradient-to-tr from-[#0F2A4A] to-[#0E7C86] flex items-center justify-center shrink-0 text-white font-bold text-xs">
                          Poster
                        </div>
                      )}

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                            {slide.badge || 'Slide'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {slide.title}
                          </h4>
                        </div>
                        {slide.subtitle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {slide.subtitle}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          {slide.createdBy ? `By ${slide.createdBy}` : 'Official'} &bull; Action: {slide.actionText || 'View'} ({slide.actionTab || 'programs'})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(slide.id, slide.title)}
                      className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="Delete slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
