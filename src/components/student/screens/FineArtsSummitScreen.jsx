import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Medal,
  CheckCircle2,
  Layers,
  BookOpen
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { ListRow } from '../ui/ListRow';
import { SectionHeader } from '../ui/SectionHeader';
import { useLanguage } from '@/context/LanguageContext';
import { isReducedMotion, SPRING_POP } from '../motion';

export const FineArtsSummitScreen = ({
  summits = [],
  student,
  team,
  teamStandings = [],
  studentStandings = [],
  myProgramsList = [],
  onBack,
  onNavigate
}) => {
  const { tr } = useLanguage();
  const reduced = isReducedMotion();
  const [activeTab, setActiveTab] = useState('standing'); // 'standing' | 'events'

  const activeSummit = useMemo(() => {
    return (summits || []).find(s => s.status === 'active' || s.status === 'published') || summits[0] || null;
  }, [summits]);

  const studentRank = useMemo(() => {
    return (studentStandings || []).find(s => s?.id === student?.id);
  }, [studentStandings, student]);

  return (
    <div className="space-y-6 pb-12 select-none">
      <Hero
        variant="inner"
        title={tr('Fine Arts Summit', 'ഫൈൻ ആർട്സ് സമ്മിറ്റ്')}
        subtitle={tr('Live house championship points, stages & published results', 'ഹൗസ് പോയിന്റുകളും മത്സര ഫലങ്ങളും')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-6">
        {/* Active Summit Banner */}
        {activeSummit && (
          <Card className="bg-gradient-to-br from-[#0F2A4A] to-[#0A1C32] text-white p-5 border-none space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-[8px] bg-teal-500/20 text-teal-300 font-bold text-[11px] uppercase tracking-wider">
                {activeSummit.status === 'active' ? '● Live Summit' : 'Championship Season'}
              </span>
              {activeSummit.academicYear && (
                <span className="text-xs text-slate-300 font-medium">
                  {activeSummit.academicYear}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {activeSummit.name || 'Annual Fine Arts Summit'}
              </h3>
              {activeSummit.theme && (
                <p className="text-xs text-teal-200/90 italic mt-0.5">
                  "{activeSummit.theme}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
              {activeSummit.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>{activeSummit.date}</span>
                </span>
              )}
              {activeSummit.venue && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{activeSummit.venue}</span>
                </span>
              )}
            </div>
          </Card>
        )}

        {/* Segmented View Switcher */}
        <div className="flex bg-slate-100 dark:bg-[#0B1522] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('standing')}
            className={`flex-1 py-2 rounded-[10px] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'standing'
                ? 'bg-white dark:bg-[#0F2A4A] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{tr('House Standings', 'ഹൗസ് പോയിന്റുകൾ')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 rounded-[10px] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'events'
                ? 'bg-white dark:bg-[#0F2A4A] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-500" />
            <span>{tr('My Summit Events', 'എന്റെ മത്സരങ്ങൾ')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300">
              {myProgramsList.length}
            </span>
          </button>
        </div>

        {/* Tab 1: House Standings */}
        {activeTab === 'standing' && (
          <div className="space-y-3">
            <SectionHeader
              title={tr('Championship Leaderboard', 'പോയിന്റ് നില')}
              subtitle={tr('Aggregated scores across stage and non-stage master events', 'മത്സര ഫലങ്ങളുടെ അടിസ്ഥാനത്തിലുള്ള നില')}
            />

            {teamStandings.length === 0 ? (
              <Card className="text-center py-10 px-4 space-y-2">
                <Trophy className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {tr('Standings will be updated as results are published', 'ഫലങ്ങൾ പ്രസിദ്ധീകരിക്കുന്ന മുറയ്ക്ക് പോയിന്റ് നില വരും')}
                </p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {teamStandings.map((tm, idx) => {
                  const rank = idx + 1;
                  const isMyTeam = team?.id && tm.id === team.id;
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

                  return (
                    <motion.div
                      key={tm.id || idx}
                      initial={reduced ? {} : { opacity: 0, y: 12 }}
                      animate={reduced ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, ...SPRING_POP }}
                    >
                      <Card
                        className={`p-4 flex items-center justify-between gap-3 ${
                          isMyTeam ? 'ring-2 ring-[#0E7C86] dark:ring-teal-400 bg-teal-50/20 dark:bg-teal-950/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            rank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                            rank === 2 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' :
                            rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' :
                            'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                          }`}>
                            {medal}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {tm.name}
                              </h4>
                              {isMyTeam && (
                                <Tag variant="teal">Your House</Tag>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {tm.totalWins || 0} event wins
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {tm.totalPoints || tm.points || 0}
                          </span>
                          <span className="text-xs text-slate-400 font-medium ml-1">pts</span>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Enrolled Events */}
        {activeTab === 'events' && (
          <div className="space-y-3">
            <SectionHeader
              title={tr('Registered Summit Programs', 'പങ്കെടുക്കുന്ന ഇനങ്ങൾ')}
              subtitle={tr('Stage schedules, evaluation marks, and grade certificates', 'സ്റ്റേജ് വിവരങ്ങളും ഗ്രേഡുകളും')}
            />

            {myProgramsList.length === 0 ? (
              <Card className="text-center py-10 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {tr('No summit registrations recorded', 'സമ്മിറ്റ് മത്സരങ്ങളിൽ രജിസ്റ്റർ ചെയ്തിട്ടില്ല')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {tr(
                      'Contact your house team leaders to be enrolled into official summit stage programs.',
                      'സമ്മിറ്റ് മത്സരങ്ങളിൽ പങ്കെടുക്കാൻ ഹൗസ് ക്യാപ്റ്റനുമായി ബന്ധപ്പെടുക.'
                    )}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {myProgramsList.map((item, idx) => (
                  <motion.div
                    key={item.program?.id || idx}
                    initial={reduced ? {} : { opacity: 0, y: 12 }}
                    animate={reduced ? {} : { opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, ...SPRING_POP }}
                  >
                    <Card className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Tag variant={item.isPublished ? 'amber' : 'teal'}>
                          {item.fieldName}
                        </Tag>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.program?.category || 'General'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {item.program?.title || 'Summit Competition'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {item.program?.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{item.program.date}</span>
                            </span>
                          )}
                          {item.program?.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{item.program.venue}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Marks / Result strip */}
                      {item.isPublished ? (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Result Published</span>
                          </span>

                          <div className="flex items-center gap-2">
                            {item.grade && item.grade !== '-' && (
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-[#0E7C86] dark:text-teal-400 font-bold">
                                Grade {item.grade}
                              </span>
                            )}
                            {item.position && item.position !== '-' && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold">
                                {item.position} Place
                              </span>
                            )}
                            {item.obtainedMark !== null && (
                              <span className="font-bold text-slate-900 dark:text-white">
                                {item.obtainedMark} / {item.maxMarks}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                          Status: Scheduled / Evaluation in progress
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
