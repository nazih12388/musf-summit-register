import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Megaphone,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguage } from '@/context/LanguageContext';
import { isReducedMotion, SPRING_POP } from '../motion';

export const NoticesScreen = ({
  notices = [],
  notifications = [],
  wings = [],
  currentUser,
  onBack,
  markNotificationRead
}) => {
  const { tr } = useLanguage();
  const reduced = isReducedMotion();
  const [selectedWingFilter, setSelectedWingFilter] = useState('all');
  const [activeNotice, setActiveNotice] = useState(null);

  // Combine real notices & notifications
  const combinedFeed = useMemo(() => {
    const list = [];

    // 1. Official Notices from notices collection
    (notices || []).forEach(n => {
      if (!n || n.id?.startsWith('notice_0') || n.id?.startsWith('notice_demo') || n.title?.includes('Fine Arts Summit 2026: 101 Master Events')) return;

      const wing = n.wingId ? (wings || []).find(w => w.id === n.wingId) : null;
      list.push({
        id: `notice_${n.id}`,
        type: 'notice',
        title: n.title,
        message: n.message || n.content || '',
        wingId: n.wingId || 'general',
        wingName: wing?.name || wing?.shortName || 'Union Directorate',
        wingColor: wing?.color || '#0F2A4A',
        timestamp: n.publishTime || n.date || n.createdAt || '',
        priority: n.priority || 'normal',
        rawItem: n
      });
    });

    // 2. Targeted Notifications
    (notifications || []).forEach(n => {
      const isTargeted = !n.userId ||
        n.userId === 'all' ||
        n.userId === currentUser?.id ||
        n.userId === currentUser?.studentId ||
        n.userId === currentUser?.username ||
        (n.userId === 'students' && currentUser?.role === 'student');

      if (isTargeted) {
        const wing = n.metadata?.wingId ? (wings || []).find(w => w.id === n.metadata.wingId) : null;
        list.push({
          id: `notif_${n.id}`,
          type: 'notification',
          title: n.title,
          message: n.message || '',
          wingId: n.metadata?.wingId || 'general',
          wingName: wing?.name || wing?.shortName || 'Union Directorate',
          wingColor: wing?.color || '#0E7C86',
          timestamp: n.timestamp || n.createdAt || '',
          read: n.read || (n.readBy && (n.readBy.includes(currentUser?.id) || n.readBy.includes(currentUser?.studentId))),
          rawItem: n
        });
      }
    });

    // Sort newest first
    list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    // Filter
    if (selectedWingFilter === 'all') return list;
    return list.filter(item => item.wingId === selectedWingFilter);
  }, [notices, notifications, wings, currentUser, selectedWingFilter]);

  const handleOpenNotice = (item) => {
    setActiveNotice(item);
    if (item.type === 'notification' && !item.read && typeof markNotificationRead === 'function') {
      markNotificationRead(item.rawItem?.id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      <Hero
        variant="inner"
        title={tr('Notices & Circulars', 'അറിയിപ്പുകൾ')}
        subtitle={tr('Official orders, circulars, and wing communications', 'യൂണിയൻ അറിയിപ്പുകളും സർക്കുലറുകളും')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-6">
        {/* Wing Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedWingFilter('all')}
            className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold shrink-0 transition cursor-pointer ${
              selectedWingFilter === 'all'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'bg-white dark:bg-[#0B1522] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tr('All Communications', 'എല്ലാം')}
          </button>

          {(wings || []).map(w => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWingFilter(w.id)}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedWingFilter === w.id
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0B1522] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {w.shortName || w.name}
            </button>
          ))}
        </div>

        {/* Notices Feed */}
        <div className="space-y-3">
          <SectionHeader
            title={tr('Official Dispatch', 'ഔദ്യോഗിക അറിയിപ്പുകൾ')}
            subtitle={tr('Published in real time by the executive council', 'തത്സമയം പ്രസിദ്ധീകരിച്ചത്')}
            badge={combinedFeed.length > 0 ? `${combinedFeed.length}` : undefined}
          />

          {combinedFeed.length === 0 ? (
            <Card className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Megaphone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {tr('No notices published', 'പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {tr(
                    'All verified circulars and announcements from the Union Council will appear here.',
                    'യൂണിയൻ കൗൺസിലിന്റെ സർക്കുലറുകളും അറിയിപ്പുകളും ഇവിടെ കാണാം.'
                  )}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {combinedFeed.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={reduced ? {} : { opacity: 0, y: 12 }}
                  animate={reduced ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, ...SPRING_POP }}
                >
                  <Card
                    onClick={() => handleOpenNotice(item)}
                    className="p-4 cursor-pointer hover:border-[#0E7C86]/50 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag variant={item.type === 'notice' ? 'amber' : 'teal'}>
                          {item.wingName}
                        </Tag>
                        {item.type === 'notification' && !item.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
                        {item.message}
                      </p>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.type === 'notice' ? 'Official Gazette' : 'Direct Dispatch'}</span>
                      <span className="text-[#0E7C86] dark:text-teal-400 font-semibold flex items-center gap-0.5">
                        <span>Read circular</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal / Dialog for reading the circular */}
      <AnimatePresence>
        {activeNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNotice(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={SPRING_POP}
              className="relative w-full max-w-md bg-white dark:bg-[#0B1522] rounded-[16px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl z-10"
            >
              <div className="flex items-center justify-between">
                <Tag variant="teal">{activeNotice.wingName}</Tag>
                <span className="text-xs text-slate-400 font-medium">
                  {formatDate(activeNotice.timestamp)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {activeNotice.title}
                </h3>
                <div className="max-h-60 overflow-y-auto pr-1">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                    {activeNotice.message}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveNotice(null)}
                  className="w-full py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#0c6b74] text-white font-bold text-xs transition cursor-pointer"
                >
                  Close Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
