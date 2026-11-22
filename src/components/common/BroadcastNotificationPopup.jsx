import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  Sparkles,
  X,
  CheckCheck,
  Megaphone,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Trophy,
  Flame
} from 'lucide-react';

export const BroadcastNotificationPopup = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const { notifications = [], markNotificationRead, wings = [] } = useApp();
  const { lang, tr } = useLanguage();

  const userKey = useMemo(() => {
    return currentUser?.id || currentUser?.studentId || currentUser?.username || 'guest';
  }, [currentUser]);

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const key = `musf_dismissed_popups_${currentUser?.id || currentUser?.username || 'guest'}`;
      return JSON.parse(sessionStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  });

  const [forceOpen, setForceOpen] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync dismissedIds when currentUser changes
  useEffect(() => {
    try {
      const key = `musf_dismissed_popups_${userKey}`;
      const saved = JSON.parse(sessionStorage.getItem(key) || '[]');
      setDismissedIds(saved);
    } catch {
      setDismissedIds([]);
    }
  }, [userKey]);

  // Listen for custom trigger to open notifications modal anytime
  useEffect(() => {
    const handleOpenModal = (e) => {
      if (e?.detail?.notifId) {
        setSelectedNotifId(e.detail.notifId);
      }
      setForceOpen(true);
    };
    window.addEventListener('musf:open-notifications', handleOpenModal);
    return () => window.removeEventListener('musf:open-notifications', handleOpenModal);
  }, []);

  // Filter relevant notifications for current user
  const relevantNotifs = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => {
      const isTargeted = !n.userId ||
        n.userId === 'all' ||
        n.userId === currentUser.id ||
        n.userId === currentUser.studentId ||
        n.userId === currentUser.username ||
        n.userId === currentUser.role ||
        (n.userId === 'students' && currentUser.role === 'student') ||
        (n.userId === 'leaders' && currentUser.role === 'leader') ||
        (n.userId === 'judges' && currentUser.role === 'judge') ||
        currentUser.role === 'admin';
      return isTargeted;
    });
  }, [notifications, currentUser]);

  // Automatic one-time pop up: unread & not yet dismissed in this session
  const popupNotifs = useMemo(() => {
    if (!currentUser) return [];
    return relevantNotifs.filter(n => {
      const readBy = Array.isArray(n.readBy) ? n.readBy : [];
      const hasRead = readBy.includes(currentUser.id) ||
        readBy.includes(currentUser.studentId) ||
        readBy.includes(currentUser.username);

      const isUnread = (!n.userId || n.userId === 'all' || n.userId === 'students' || n.userId === 'leaders' || n.userId === 'judges')
        ? !hasRead
        : (!n.read && !hasRead);

      const isNotDismissed = !dismissedIds.includes(n.id);
      return isUnread && isNotDismissed;
    });
  }, [relevantNotifs, currentUser, dismissedIds]);

  const activeList = forceOpen ? (relevantNotifs.length > 0 ? relevantNotifs : popupNotifs) : popupNotifs;

  // Find index of targeted notification if selected
  useEffect(() => {
    if (selectedNotifId && activeList.length > 0) {
      const idx = activeList.findIndex(n => n.id === selectedNotifId);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [selectedNotifId, activeList]);

  const currentNotif = activeList[currentIndex] || activeList[0] || null;

  const handleDismiss = (notifId) => {
    if (!notifId) {
      setForceOpen(false);
      return;
    }
    const myId = currentUser?.id || currentUser?.username || 'user';
    markNotificationRead(notifId, myId);

    setDismissedIds(prev => {
      const updated = [...new Set([...prev, notifId])];
      try {
        const key = `musf_dismissed_popups_${userKey}`;
        sessionStorage.setItem(key, JSON.stringify(updated));
      } catch (_) { }
      return updated;
    });

    if (forceOpen) {
      setForceOpen(false);
    } else {
      if (currentIndex >= activeList.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  const handleDismissAll = () => {
    const myId = currentUser?.id || currentUser?.username || 'user';
    activeList.forEach(n => markNotificationRead(n.id, myId));
    const allIds = activeList.map(n => n.id);
    setDismissedIds(prev => {
      const updated = [...new Set([...prev, ...allIds])];
      try {
        const key = `musf_dismissed_popups_${userKey}`;
        sessionStorage.setItem(key, JSON.stringify(updated));
      } catch (_) { }
      return updated;
    });
    setForceOpen(false);
    setCurrentIndex(0);
  };

  const handleActionClick = (targetTab) => {
    if (targetTab && typeof setActiveTab === 'function') {
      setActiveTab(targetTab);
    }
    if (currentNotif) {
      handleDismiss(currentNotif.id);
    } else {
      setForceOpen(false);
    }
  };

  if (!currentNotif) return null;

  const wing = currentNotif.metadata?.wingId
    ? wings.find(w => w.id === currentNotif.metadata.wingId)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300"
    >
      {/* Background Animated Gradient Orb */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#0E7C86]/30 via-indigo-500/25 to-amber-400/20 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F1B2B] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-scale-up-center">
        {/* Animated Shimmering Top Accent Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0E7C86] via-amber-400 via-rose-500 to-[#0E7C86] bg-[length:200%_100%] animate-shimmer" />

        <div className="p-5 sm:p-7 space-y-5">
          {/* Header Row: Badge & Dismiss Icon */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#0F2A4A] to-[#0E7C86] text-white flex items-center justify-center shadow-md shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] font-extrabold text-[#0E7C86] dark:text-teal-300 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{tr('Official Union Notice', 'ഔദ്യോഗിക അറിയിപ്പ്')}</span>
                  </span>
                  {wing && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white shadow-2xs"
                      style={{ backgroundColor: wing.color || '#0E7C86' }}
                    >
                      {wing.shortName || wing.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(currentNotif.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {currentNotif.timestamp && (
                    <span>• {new Date(currentNotif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDismiss(currentNotif.id)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close announcement"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Animated Notification Content Area */}
          <div className="space-y-3 pt-1">
            {/* Animated Title Text with Radiant Shimmer */}
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug tracking-tight bg-gradient-to-r from-[#0F2A4A] via-[#0E7C86] to-cyan-500 dark:from-white dark:via-teal-200 dark:to-cyan-300 bg-clip-text text-transparent animate-gradient-x">
              {currentNotif.title}
            </h2>

            {/* Stylized Animated Message Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0E7C86] dark:text-teal-400">
                <Megaphone className="w-3.5 h-3.5 shrink-0" />
                <span>{tr('Announcement Message', 'സന്ദേശം')}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                {currentNotif.message}
              </p>
            </div>

            {/* Pagination if multiple notices exist */}
            {activeList.length > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Notice {currentIndex + 1} of {activeList.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-[11px] font-semibold cursor-pointer transition"
                  >
                    &larr; Prev
                  </button>
                  <button
                    type="button"
                    disabled={currentIndex >= activeList.length - 1}
                    onClick={() => setCurrentIndex(prev => Math.min(activeList.length - 1, prev + 1))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-[11px] font-semibold cursor-pointer transition"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-start sm:self-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                {currentNotif.author
                  ? `${tr('Posted by', 'നൽകിയത്')}: ${currentNotif.author}${currentNotif.authorDesignation ? ` (${currentNotif.authorDesignation})` : ''}`
                  : tr('Verified Official Notice', 'ഔദ്യോഗിക അറിയിപ്പ്')}
              </span>
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {currentNotif.metadata?.linkTab && (
                <button
                  type="button"
                  onClick={() => handleActionClick(currentNotif.metadata.linkTab)}
                  className="px-3.5 py-2.5 rounded-xl border border-[#0E7C86]/30 bg-teal-50/70 dark:bg-teal-950/40 text-[#0E7C86] dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-1 transition hover:bg-teal-100 dark:hover:bg-teal-900/60 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{tr('Open Details', 'വിവരങ്ങൾ കാണുക')}</span>
                </button>
              )}

              {activeList.length > 1 && (
                <button
                  type="button"
                  onClick={handleDismissAll}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {tr('Dismiss All', 'എല്ലാം ഒഴിവാക്കുക')}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDismiss(currentNotif.id)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F2A4A] to-[#0E7C86] hover:from-[#163860] hover:to-[#128a95] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-900/10 transition active:scale-95 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-300" />
                <span>{tr('I have read this', 'മനസ്സിലായി (Dismiss)')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
