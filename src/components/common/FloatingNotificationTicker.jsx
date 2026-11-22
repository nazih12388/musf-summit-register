import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  Megaphone,
  Sparkles,
  Flame,
  ChevronRight,
  Calendar,
  Award,
  Layers,
  X,
  Volume2,
  ExternalLink
} from 'lucide-react';

export const FloatingNotificationTicker = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const {
    notifications = [],
    notices = [],
    wingPrograms = [],
    wings = [],
    sportsFixtures = []
  } = useApp();
  const { tr, lang } = useLanguage();

  const [isDismissed, setIsDismissed] = useState(false);

  // Compile ONLY real notifications posted by Admin, Chairman, or Wing Members
  const tickerItems = useMemo(() => {
    const feed = [];

    (notifications || []).slice(0, 15).forEach(n => {
      const isTargeted = !n.userId ||
        n.userId === 'all' ||
        n.userId === currentUser?.id ||
        n.userId === currentUser?.studentId ||
        n.userId === currentUser?.username ||
        n.userId === currentUser?.role ||
        (n.userId === 'students' && currentUser?.role === 'student') ||
        (n.userId === 'leaders' && currentUser?.role === 'leader') ||
        (n.userId === 'judges' && currentUser?.role === 'judge') ||
        currentUser?.role === 'admin';

      if (isTargeted) {
        const wing = n.wingId ? wings.find(w => w.id === n.wingId) : (n.metadata?.wingId ? wings.find(w => w.id === n.metadata.wingId) : null);
        const badgeLabel = n.authorRole === 'chairman' ? 'Chairman' : (wing?.shortName || n.author || 'Notice');
        const badgeColor = n.type === 'urgent' ? 'bg-rose-500' : (wing?.color ? '' : (n.authorRole === 'chairman' ? 'bg-amber-500' : 'bg-teal-600'));

        feed.push({
          id: n.id,
          type: 'notification',
          badge: badgeLabel,
          badgeColor: badgeColor,
          badgeStyleColor: wing?.color,
          author: n.author || 'Official',
          title: n.title,
          snippet: n.message,
          time: n.timestamp,
          linkTab: n.metadata?.linkTab || null,
          notifId: n.id
        });
      }
    });

    return feed;
  }, [notifications, wings, currentUser]);

  if (isDismissed || tickerItems.length === 0) return null;

  const handleOpenPopup = (item) => {
    if (item?.linkTab && typeof setActiveTab === 'function') {
      setActiveTab(item.linkTab);
    }
    window.dispatchEvent(
      new CustomEvent('musf:open-notifications', {
        detail: { notifId: item?.notifId }
      })
    );
  };

  // Duplicate items array once to ensure seamless infinite loop
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full mb-3 sm:mb-4 px-1 sm:px-0">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F2A4A] to-[#0E7C86] text-white p-1 sm:p-1.5 shadow-lg shadow-teal-950/20 border border-teal-500/30 backdrop-blur-md flex items-center gap-2 group/ticker animate-pulse-border-glow">
        
        {/* Left Glowing Pill: LIVE ALERTS */}
        <button
          type="button"
          onClick={() => handleOpenPopup(tickerItems[0])}
          className="relative z-10 shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-[10px] sm:text-xs shadow-md uppercase tracking-wider cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Click to view all notices"
        >
          <Flame className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
          <span className="hidden xs:inline">{tr('Live Updates', 'തത്സമയ അറിയിപ്പ്')}</span>
          <span className="xs:hidden">Live</span>
          <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
        </button>

        {/* Center: Infinite Horizontal Running Text Marquee */}
        <div className="flex-1 overflow-hidden relative select-none cursor-pointer py-1">
          {/* Subtle edge fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0F2A4A] to-transparent z-1 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0E7C86] to-transparent z-1 pointer-events-none" />

          <div
            className="animate-marquee-scroll flex items-center gap-8 text-xs font-medium text-slate-100"
            title="Hover to pause • Click to open details"
          >
            {displayItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => handleOpenPopup(item)}
                className="inline-flex items-center gap-2.5 shrink-0 px-2.5 py-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer group"
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs ${item.badgeColor || ''}`}
                  style={{
                    backgroundColor: item.badgeStyleColor || (typeof item.badgeColor === 'string' && item.badgeColor.startsWith('#')
                      ? item.badgeColor
                      : undefined)
                  }}
                >
                  {item.badge}
                </span>

                <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </span>

                {item.snippet && (
                  <span className="text-[11px] text-teal-100/90 hidden sm:inline max-w-xs truncate">
                    — {item.snippet}
                  </span>
                )}

                <span className="text-amber-400 font-black text-sm ml-1 select-none">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Action: Open Modal & Count Badge */}
        <div className="relative z-10 shrink-0 flex items-center gap-1.5 pr-1">
          <button
            type="button"
            onClick={() => handleOpenPopup(tickerItems[0])}
            className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[10px] sm:text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            title="Open all announcements"
          >
            <span>{tickerItems.length}</span>
            <span className="hidden md:inline">{tr('Notices', 'അറിയിപ്പുകൾ')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Hide ticker"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
