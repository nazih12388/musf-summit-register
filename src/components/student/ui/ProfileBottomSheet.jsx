import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageCircle } from 'lucide-react';
import { SPRING_SHEET, isReducedMotion } from '../motion';

export const ProfileBottomSheet = ({
  isOpen,
  onClose,
  official: propOfficial,
  studentObj,
  leader
}) => {
  const official = propOfficial || leader;
  const reduced = isReducedMotion();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const rawPhone = official?.phone || studentObj?.phone || '';
  const cleanPhone = String(rawPhone).replace(/[^0-9+]/g, '');
  const hasValidPhone = cleanPhone.length >= 7;
  const waNumber = cleanPhone.replace(/^\+/, '');
  const waLink = hasValidPhone
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Assalamu Alaikum ${official?.name || 'Leader'}, I am contacting you regarding MUSF matters.`)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(`Assalamu Alaikum ${official?.name || 'Leader'}, I am contacting you regarding MUSF matters.`)}`;

  const isExec = official?.category === 'executive' || official?.role === 'executive';
  const photo = official?.photoUrl || official?.photo || studentObj?.photoUrl || studentObj?.photo;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && official && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center select-none">
          {/* Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={reduced ? { opacity: 0, y: 50 } : { y: '100%' }}
            animate={reduced ? { opacity: 1, y: 0 } : { y: 0 }}
            exit={reduced ? { opacity: 0, y: 50 } : { y: '100%' }}
            transition={SPRING_SHEET}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-[#0F1B2B] rounded-t-[24px] border-t border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4"
          >
            {/* Drag Handle Pill / Close indicator */}
            <div
              onClick={onClose}
              className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-2 cursor-pointer hover:bg-slate-400 transition-colors"
            />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#0E7C86] to-amber-400 shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg overflow-hidden">
                    {photo ? (
                      <img src={photo} alt={official.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{official.name?.charAt(0) || 'L'}</span>
                    )}
                  </div>
                  {isExec && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black border border-white dark:border-slate-900">
                      ★
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7C86] dark:text-teal-400 block leading-tight">
                    {official.designation}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0F2A4A] dark:text-white truncate mt-0.5">
                    {official.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {official.cicNo ? `CIC ${official.cicNo}` : ''} {official.className ? `• ${official.className}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {hasValidPhone ? (
                <a
                  href={`tel:${cleanPhone}`}
                  className="px-4 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
                  <span>Call {cleanPhone}</span>
                </a>
              ) : (
                <div className="px-4 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800/50 text-slate-400 font-medium text-xs flex items-center justify-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>No Phone Listed</span>
                </div>
              )}

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
