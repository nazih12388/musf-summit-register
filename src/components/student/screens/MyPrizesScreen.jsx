import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { ListRow } from '../ui/ListRow';
import { SectionHeader } from '../ui/SectionHeader';
import { triggerStudentConfetti } from '../ui/ConfettiHelper';
import { useLanguage } from '../../../context/LanguageContext';
import { isReducedMotion, SPRING_POP } from '../motion';

export const MyPrizesScreen = ({
  student,
  myUnionWins = [],
  myProgramsList = [],
  onBack,
  onNavigate
}) => {
  const { tr } = useLanguage();
  const reduced = isReducedMotion();
  const [selectedPrize, setSelectedPrize] = useState(null);

  // Normalize all prize items from wing competitions and summit results
  const allPrizes = useMemo(() => {
    const list = [];

    // 1. Wing program wins
    (myUnionWins || []).forEach((w, idx) => {
      list.push({
        id: `wing_${w.program?.id || idx}_${w.place}`,
        title: w.program?.title || 'Competition',
        source: 'wing',
        wingName: w.wing?.name || w.wing?.shortName || 'Union Wing',
        wingColor: w.wing?.color || '#0E7C86',
        place: w.place, // '1st', '2nd', '3rd'
        points: w.points || (w.place === '1st' ? 10 : w.place === '2nd' ? 7 : 5),
        date: w.program?.date || '',
        venue: w.program?.venue || '',
        remarks: w.remarks || ''
      });
    });

    // 2. Summit published results with ranks
    (myProgramsList || []).forEach((p, idx) => {
      if (p.position && p.position !== '-' && p.position !== 'None') {
        const placeStr = String(p.position).toLowerCase();
        let normalizedPlace = '3rd';
        let pts = 5;
        if (placeStr.includes('first') || placeStr === '1' || placeStr.includes('1st')) {
          normalizedPlace = '1st';
          pts = 10;
        } else if (placeStr.includes('second') || placeStr === '2' || placeStr.includes('2nd')) {
          normalizedPlace = '2nd';
          pts = 7;
        }

        list.push({
          id: `summit_${p.program?.id || idx}`,
          title: p.program?.title || p.program?.name || 'Summit Event',
          source: 'summit',
          wingName: 'Fine Arts Summit',
          wingColor: '#0E7C86',
          place: normalizedPlace,
          points: pts,
          date: p.program?.date || '',
          grade: p.grade !== '-' ? p.grade : null,
          marks: p.obtainedMark ? `${p.obtainedMark}/${p.maxMarks}` : null
        });
      }
    });

    return list;
  }, [myUnionWins, myProgramsList]);

  // Counts
  const firstCount = allPrizes.filter(p => p.place === '1st').length;
  const secondCount = allPrizes.filter(p => p.place === '2nd').length;
  const thirdCount = allPrizes.filter(p => p.place === '3rd').length;
  const totalPoints = allPrizes.reduce((sum, p) => sum + (p.points || 0), 0);

  // Animated points counter (counts up to totalPoints in 600ms)
  const [displayPoints, setDisplayPoints] = useState(() => (reduced ? totalPoints : 0));

  useEffect(() => {
    if (reduced || totalPoints === 0) return;

    let start = 0;
    const duration = 600;
    const steps = 30;
    const increment = totalPoints / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= totalPoints) {
        setDisplayPoints(totalPoints);
        clearInterval(timer);
      } else {
        setDisplayPoints(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [totalPoints, reduced]);

  // Trigger confetti burst on initial view if student has prizes
  useEffect(() => {
    if (allPrizes.length > 0) {
      const hasBurst = sessionStorage.getItem(`musf_prizes_burst_${student?.id}`);
      if (!hasBurst) {
        triggerStudentConfetti();
        try {
          sessionStorage.setItem(`musf_prizes_burst_${student?.id}`, 'true');
        } catch {}
      }
    }
  }, [allPrizes.length, student?.id]);

  const handlePrizeClick = (item) => {
    setSelectedPrize(item);
    triggerStudentConfetti();
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Shorter Inner Hero */}
      <Hero
        variant="inner"
        title={tr('My Prizes & Honors', 'എന്റെ പുരസ്കാരങ്ങൾ')}
        subtitle={tr('Recognizing excellence in co-curricular competitions', 'യൂണിയൻ മത്സരങ്ങളിലെ മികച്ച നേട്ടങ്ങൾ')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-6">
        {/* Points Summary & Medals Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Total Points Card */}
          <Card className="sm:col-span-1 bg-gradient-to-br from-[#0E7C86] to-[#0A575E] text-white p-5 border-none">
            <p className="text-xs uppercase font-bold text-teal-100 tracking-wider">
              {tr('Honors Score', 'പോയിന്റുകൾ')}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">
                {displayPoints}
              </span>
              <span className="text-xs text-teal-100 font-medium">pts earned</span>
            </div>
            <p className="mt-2 text-[11px] text-teal-100/90 leading-tight">
              {allPrizes.length} {allPrizes.length === 1 ? 'competition victory' : 'competition victories'}
            </p>
          </Card>

          {/* 1st Place Card */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 10 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...SPRING_POP }}
          >
            <Card className="h-full flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1st Place</span>
                <span className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-bold text-sm">
                  🥇
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {firstCount}
                </span>
                <span className="text-[11px] text-slate-400 font-medium ml-1.5">awards</span>
              </div>
            </Card>
          </motion.div>

          {/* 2nd Place Card */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 10 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.18, ...SPRING_POP }}
          >
            <Card className="h-full flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">2nd Place</span>
                <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm">
                  🥈
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {secondCount}
                </span>
                <span className="text-[11px] text-slate-400 font-medium ml-1.5">awards</span>
              </div>
            </Card>
          </motion.div>

          {/* 3rd Place Card */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 10 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.26, ...SPRING_POP }}
          >
            <Card className="h-full flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">3rd Place</span>
                <span className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center font-bold text-sm">
                  🥉
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {thirdCount}
                </span>
                <span className="text-[11px] text-slate-400 font-medium ml-1.5">awards</span>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Prizes List Section */}
        <div className="space-y-3">
          <SectionHeader
            title={tr('Victory Roll', 'നേട്ടങ്ങളുടെ പട്ടിക')}
            subtitle={tr('All verified competition titles won', 'സാക്ഷ്യപ്പെടുത്തിയ പുരസ്കാരങ്ങൾ')}
            badge={allPrizes.length > 0 ? `${allPrizes.length}` : undefined}
          />

          {allPrizes.length === 0 ? (
            <Card className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {tr('No competition prizes recorded yet', 'പുരസ്കാരങ്ങൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {tr(
                    'Register for upcoming Wing competitions or the Fine Arts Summit to earn honors and house points.',
                    'വരാനിരിക്കുന്ന വിംഗ് മത്സരങ്ങളിലും ഫൈൻ ആർട്സ് സമ്മിറ്റിലും പങ്കെടുത്ത് പുരസ്കാരങ്ങൾ നേടൂ.'
                  )}
                </p>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('programs')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#0E7C86] text-white text-xs font-bold hover:bg-[#0c6b74] transition"
                >
                  <span>{tr('Explore Programs', 'പരിപാടികൾ കാണുക')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </Card>
          ) : (
            <div className="space-y-2">
              {allPrizes.map((prize, idx) => {
                const medalEmoji = prize.place === '1st' ? '🥇' : prize.place === '2nd' ? '🥈' : '🥉';
                const tagColor = prize.place === '1st' ? 'amber' : prize.place === '2nd' ? 'grey' : 'rose';

                return (
                  <motion.div
                    key={prize.id}
                    initial={reduced ? {} : { opacity: 0, y: 12 }}
                    animate={reduced ? {} : { opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, ...SPRING_POP }}
                  >
                    <ListRow
                      onClick={() => handlePrizeClick(prize)}
                      icon={
                        <span className="text-lg leading-none select-none">
                          {medalEmoji}
                        </span>
                      }
                      title={prize.title}
                      subtitle={`${prize.wingName}${prize.date ? ` • ${prize.date}` : ''}`}
                      tag={
                        <Tag variant={tagColor}>
                          {prize.place} Place &bull; +{prize.points} pts
                        </Tag>
                      }
                      action={
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-0.5">
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Prize Detail Modal / Bottom Sheet */}
      <AnimatePresence>
        {selectedPrize && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPrize(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={SPRING_POP}
              className="relative w-full max-w-sm bg-white dark:bg-[#0B1522] rounded-[16px] border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4 shadow-xl z-10"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-3xl">
                {selectedPrize.place === '1st' ? '🥇' : selectedPrize.place === '2nd' ? '🥈' : '🥉'}
              </div>

              <div className="space-y-1">
                <Tag variant={selectedPrize.place === '1st' ? 'amber' : 'teal'}>
                  {selectedPrize.place} Position
                </Tag>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                  {selectedPrize.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organized by {selectedPrize.wingName}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Honors Awarded:</span>
                  <span className="font-bold text-[#0E7C86] dark:text-teal-400">+{selectedPrize.points} House Points</span>
                </div>
                {selectedPrize.date && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-medium">{selectedPrize.date}</span>
                  </div>
                )}
                {selectedPrize.remarks && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remarks:</span>
                    <span className="font-medium">{selectedPrize.remarks}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPrize(null)}
                className="w-full py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#0c6b74] text-white font-bold text-xs transition"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
