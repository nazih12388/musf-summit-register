import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  Folder,
  Calendar,
  Trophy,
  Award,
  Users,
  Bell,
  Palette,
  User,
  Globe,
  Moon,
  Sun,
  Sparkles,
  LogOut,
  ChevronRight,
  FileText
} from 'lucide-react';
import { SPRING_DRAWER, isReducedMotion, setReducedMotionPreference } from '../motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';

export const DrawerMenu = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme
}) => {
  const { lang, setLang, tr } = useLanguage();
  const { logout, currentUser } = useAuth();
  const reduced = isReducedMotion();
  const drawerRef = useRef(null);

  // Close on ESC & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    { id: 'overview', label: tr('Home', 'ഹോം'), icon: LayoutDashboard },
    { id: 'wings', label: tr('Union Wings', 'യൂണിയൻ വിംഗുകൾ'), icon: Folder },
    { id: 'programs', label: tr('Programs & Events', 'പരിപാടികൾ'), icon: Calendar },
    { id: 'prizes', label: tr('My Prizes', 'എന്റെ നേട്ടങ്ങൾ'), icon: Trophy },
    { id: 'certificates', label: tr('Certificates', 'സർട്ടിഫിക്കറ്റുകൾ'), icon: Award },
    { id: 'sports', label: tr('College Sports', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy },
    { id: 'activity_report', label: tr('Activity Report', 'പ്രവർത്തന റിപ്പോർട്ട്'), icon: FileText },
    { id: 'leaders', label: tr('Union Leaders', 'യൂണിയൻ ഭാരവാഹികൾ'), icon: Users },
    { id: 'notices', label: tr('Notices & Circulars', 'അറിയിപ്പുകൾ'), icon: Bell },
    { id: 'summit', label: tr('Fine Arts Summit', 'സമ്മിറ്റ്'), icon: Palette },
    { id: 'profile', label: tr('Student Profile', 'പ്രൊഫൈൽ'), icon: User }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex select-none">
          {/* Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.aside
            ref={drawerRef}
            initial={reduced ? { opacity: 0 } : { x: '-100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '-100%' }}
            transition={SPRING_DRAWER}
            className="relative z-10 w-[290px] sm:w-[320px] max-w-[85vw] h-full bg-white dark:bg-[#0B1522] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-[#0E7C86] dark:bg-[#071F2C] text-white">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block leading-tight">
                  Student Portal
                </span>
                <h3 className="text-base font-extrabold truncate text-white leading-tight mt-0.5">
                  MUSF Union Menu
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation List (Staggered items) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={reduced ? { opacity: 1 } : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.04 + idx * 0.03,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    whileTap={reduced ? undefined : { scale: 0.97 }}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[12px] text-xs sm:text-[13px] font-bold transition-colors cursor-pointer text-left ${isActive
                      ? 'bg-[#0E7C86]/10 text-[#0E7C86] dark:bg-teal-500/20 dark:text-teal-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Settings & Logout */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/60 dark:bg-slate-900/40">
              {/* Language & Theme Controls */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => setLang(lang === 'ml' ? 'en' : 'ml')}
                  className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-1.5 transition hover:bg-slate-50 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{lang === 'ml' ? 'English' : 'മലയാളം'}</span>
                </button>

                {/* Theme Switcher */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-1.5 transition hover:bg-slate-50 cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reduced Motion Toggle */}
              <button
                type="button"
                onClick={() => setReducedMotionPreference(!reduced)}
                className="w-full px-3 py-1.5 rounded-[10px] text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  <span>{tr('Reduce animations', 'ആനിമേഷൻ കുറയ്ക്കുക')}</span>
                </div>
                <span className="font-bold">{reduced ? 'On' : 'Off'}</span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    logout();
                  }
                }}
                className="w-full py-1.5 px-3 rounded-[10px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{tr('Sign out', 'പുറത്തിറങ്ങുക')}</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

