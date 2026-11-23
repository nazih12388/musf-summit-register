import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Check,
  Plus,
  X,
  Filter,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { SectionHeader } from '../ui/SectionHeader';
import { triggerStudentConfetti } from '../ui/ConfettiHelper';
import { useLanguage } from '../../../context/LanguageContext';
import { isReducedMotion, SPRING_POP } from '../motion';

export const ProgramsScreen = ({
  student,
  wings = [],
  wingPrograms = [],
  onBack,
  registerForWingProgram,
  cancelWingProgramRegistration
}) => {
  const { tr } = useLanguage();
  const reduced = isReducedMotion();

  const [selectedWingFilter, setSelectedWingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [registeringProgId, setRegisteringProgId] = useState(null);

  const filteredPrograms = useMemo(() => {
    return (wingPrograms || []).filter(p => {
      if (p.type === 'meeting') return false;
      if (selectedWingFilter !== 'all' && p.wingId !== selectedWingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchVenue = (p.venue || '').toLowerCase().includes(q);
        return matchTitle || matchVenue;
      }
      return true;
    });
  }, [wingPrograms, selectedWingFilter, searchQuery]);

  const handleToggleRegistration = async (prog, isRegistered) => {
    if (registeringProgId) return;
    setRegisteringProgId(prog.id);

    try {
      if (isRegistered) {
        if (typeof cancelWingProgramRegistration === 'function') {
          await cancelWingProgramRegistration(prog.id, student?.id || student?.cicNo);
        }
      } else {
        if (typeof registerForWingProgram === 'function') {
          await registerForWingProgram(prog.id, student);
          triggerStudentConfetti();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegisteringProgId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      <Hero
        variant="inner"
        title={tr('Programs & Activities', 'പരിപാടികൾ')}
        subtitle={tr('Discover competitions, workshops and campus events', 'യൂണിയൻ പരിപാടികൾ')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-4">
        {/* Search & Wing Filter Chips */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr('Search programs, competitions, venue...', 'പരിപാടികൾ തിരയുക...')}
              className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0E7C86]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedWingFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${selectedWingFilter === 'all'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
            >
              All ({wingPrograms.filter(p => p.type !== 'meeting').length})
            </button>
            {wings.map(w => {
              const count = wingPrograms.filter(p => p.wingId === w.id && p.type !== 'meeting').length;
              const isSelected = selectedWingFilter === w.id;

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWingFilter(w.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${isSelected
                    ? 'bg-[#0E7C86] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  {w.shortName || w.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Programs List */}
        {filteredPrograms.length === 0 ? (
          <Card className="text-center py-8 text-slate-400 text-xs">
            {tr('No matching programs found.', 'പരിപാടികൾ ഒന്നും കണ്ടെത്തിയില്ല.')}
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPrograms.map((prog, idx) => {
              const wing = wings.find(w => w.id === prog.wingId);
              const isRegistered = (prog.registeredStudents || []).some(
                r => r.studentId === student?.id || r.cicNo === student?.cicNo
              );
              const isRegistering = registeringProgId === prog.id;

              return (
                <Card key={prog.id || idx} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag variant="grey" size="sm">
                          {wing?.shortName || wing?.name || 'Union'}
                        </Tag>
                        {prog.type === 'competition' && (
                          <Tag variant="amber" size="sm">
                            Competition
                          </Tag>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                        {prog.title}
                      </h3>

                      {prog.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {prog.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      {prog.date && (
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prog.date}</span>
                        </span>
                      )}
                      {prog.venue && (
                        <span className="flex items-center gap-1 font-medium truncate max-w-[140px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prog.venue}</span>
                        </span>
                      )}
                    </div>

                    {/* Registration Toggle Button */}
                    <div className="shrink-0">
                      {isRegistered ? (
                        <button
                          type="button"
                          disabled={isRegistering}
                          onClick={() => handleToggleRegistration(prog, true)}
                          className="px-3 py-1.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Registered</span>
                        </button>
                      ) : prog.isRegistrationOpen ? (
                        <motion.button
                          type="button"
                          disabled={isRegistering}
                          whileTap={reduced ? undefined : { scale: 0.94 }}
                          onClick={() => handleToggleRegistration(prog, false)}
                          className="px-3.5 py-1.5 rounded-[10px] bg-[#0E7C86] hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          {isRegistering ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Register</span>
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

