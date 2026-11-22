import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Users,
  Shield,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { SectionHeader } from '../ui/SectionHeader';
import { ProfileBottomSheet } from '../ui/ProfileBottomSheet';
import { useLanguage } from '@/context/LanguageContext';
import { isReducedMotion, SPRING_POP } from '../motion';

export const UnionLeadersScreen = ({
  unionOfficials = [],
  wings = [],
  onBack
}) => {
  const { tr } = useLanguage();
  const reduced = isReducedMotion();
  const [activeTab, setActiveTab] = useState('executives'); // 'executives' | 'conveners'
  const [selectedLeader, setSelectedLeader] = useState(null);

  const wingsMap = useMemo(() => {
    return Object.fromEntries((wings || []).map(w => [w.id, w]));
  }, [wings]);

  const executives = useMemo(() => {
    return (unionOfficials || []).filter(o =>
      o.category === 'executive' || o.role === 'executive' || o.assignedWingId === 'all' || !o.assignedWingId
    );
  }, [unionOfficials]);

  const conveners = useMemo(() => {
    return (unionOfficials || []).filter(o =>
      !executives.some(e => e.id === o.id)
    );
  }, [unionOfficials, executives]);

  const displayedList = activeTab === 'executives' ? executives : conveners;

  return (
    <div className="space-y-6 pb-12 select-none">
      <Hero
        variant="inner"
        title={tr('Union Leaders', 'യൂണിയൻ ഭാരവാഹികൾ')}
        subtitle={tr('Executive council and wing conveners for the academic tenure', 'യൂണിയൻ എക്സിക്യൂട്ടീവ് കൗൺസിലും വിംഗ് കൺവീനർമാരും')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-6">
        {/* Segmented Control */}
        <div className="flex bg-slate-100 dark:bg-[#0B1522] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('executives')}
            className={`flex-1 py-2 rounded-[10px] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'executives'
                ? 'bg-white dark:bg-[#0F2A4A] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{tr('Executive Council', 'എക്സിക്യൂട്ടീവ് കൗൺസിൽ')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300">
              {executives.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conveners')}
            className={`flex-1 py-2 rounded-[10px] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'conveners'
                ? 'bg-white dark:bg-[#0F2A4A] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-500" />
            <span>{tr('Wing Conveners', 'വിംഗ് കൺവീനർമാർ')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300">
              {conveners.length}
            </span>
          </button>
        </div>

        {/* Section Header */}
        <SectionHeader
          title={
            activeTab === 'executives'
              ? tr('Central Executive Council', 'കേന്ദ്ര എക്സിക്യൂട്ടീവ് കൗൺസിൽ')
              : tr('Wing Conveners & Joint Conveners', 'വിംഗ് കൺവീനർമാർ')
          }
          subtitle={
            activeTab === 'executives'
              ? tr('Apex governing body of the Students Union', 'യൂണിയൻ ഭരണസമിതി')
              : tr('Operational heads driving autonomous co-curricular wings', 'വിംഗ് നേതൃത്വം')
          }
        />

        {/* Leaders Grid */}
        {displayedList.length === 0 ? (
          <Card className="text-center py-10 px-4 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {tr('No leaders listed in this roster', 'ഭാരവാഹികളെ ചേർത്തിട്ടില്ല')}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedList.map((leader, idx) => {
              const isChairman = leader.designation?.toLowerCase().includes('chair');
              const isGenSec = leader.designation?.toLowerCase().includes('secretary');
              const wing = wingsMap[leader.assignedWingId];

              const cleanPhone = (leader.contact || leader.phone || '').replace(/[^0-9+]/g, '');
              const student = (students || []).find(s => s.id === leader.studentId || s.cicNo === leader.cicNo);
              const photo = leader?.photoUrl || leader?.photo || student?.photoUrl || student?.photo;

              return (
                <motion.div
                  key={leader.id || idx}
                  initial={reduced ? {} : { opacity: 0, y: 12 }}
                  animate={reduced ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, ...SPRING_POP }}
                >
                  <Card
                    onClick={() => setSelectedLeader(leader)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[#0E7C86]/50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {photo ? (
                          <img
                            src={photo}
                            alt={leader.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0E7C86] dark:text-teal-400 font-bold text-sm flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            {leader.name?.slice(0, 2).toUpperCase() || 'UL'}
                          </div>
                        )}

                        {isChairman && (
                          <span className="absolute -top-1.5 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] shadow-xs">
                            👑
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {leader.name}
                          </h4>
                        </div>
                        <p className="text-xs text-[#0E7C86] dark:text-teal-400 font-semibold truncate">
                          {leader.designation || 'Union Official'}
                        </p>
                        {wing && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {wing.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Contacts */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {cleanPhone && (
                        <>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
                            title="Call Leader"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400" />
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Bottom Sheet */}
      <ProfileBottomSheet
        isOpen={Boolean(selectedLeader)}
        official={selectedLeader}
        leader={selectedLeader}
        onClose={() => setSelectedLeader(null)}
      />
    </div>
  );
};
