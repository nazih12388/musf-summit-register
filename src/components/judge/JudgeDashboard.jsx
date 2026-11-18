import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Gavel,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Save,
  Clock,
  History,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  User,
  GraduationCap,
  Award,
  Check,
  Users
} from 'lucide-react';

export const JudgeDashboard = ({ activeTab, setActiveTab }) => {
  const {
    programs,
    entries,
    marks,
    teams,
    students,
    classes,
    fields,
    classesMap,
    fieldsMap,
    teamsMap,
    judges,
    summits,
    settings,
    submitJudgeMark
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const currentJudge = judges?.find(j => j.id === currentUser?.id) || currentUser;
  const isUnrestricted = Boolean(currentJudge?.unrestricted) ||
    currentJudge?.assignedPrograms?.includes('all') ||
    settings?.enforceJudgeRestrictions === false;

  const [selectedSummitFilter, setSelectedSummitFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  // Only summits that have been published / opened by Admin (planned summits are hidden from judges)
  const publishedSummits = useMemo(() => {
    return (summits || []).filter(s => s.status && s.status !== 'planned' && s.status !== 'cancelled');
  }, [summits]);

  const publishedSummitIds = useMemo(() => new Set(publishedSummits.map(s => s.id)), [publishedSummits]);

  // Programs available to this judge
  const assignedPrograms = useMemo(() => {
    let pool = [];
    if (isUnrestricted) {
      pool = programs || [];
    } else {
      pool = (programs || []).filter(p =>
        p.assignedJudges?.includes(currentUser?.id) ||
        currentJudge?.assignedPrograms?.includes(p.id)
      );
    }

    // Exclude any programs in 'planned' or 'draft' status, or belonging to a 'planned' summit
    pool = pool.filter(p => {
      if (p.status === 'draft' || p.status === 'planned') return false;
      if (p.summitId && !publishedSummitIds.has(p.summitId)) return false;
      return true;
    });

    if (selectedSummitFilter !== 'all') {
      pool = pool.filter(p => p.summitId === selectedSummitFilter);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      pool = pool.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q))
      );
    }

    return pool;
  }, [programs, currentUser, currentJudge, isUnrestricted, publishedSummitIds, selectedSummitFilter, searchFilter]);

  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [savedRowIds, setSavedRowIds] = useState({});

  // Keep selected program valid
  useEffect(() => {
    if (assignedPrograms.length > 0) {
      if (!selectedProgramId || !assignedPrograms.some(p => p.id === selectedProgramId)) {
        setSelectedProgramId(assignedPrograms[0].id);
      }
    } else {
      setSelectedProgramId('');
    }
  }, [assignedPrograms, selectedProgramId]);

  const currentProgram = (programs || []).find(p => p.id === selectedProgramId);
  const isLocked = currentProgram?.status === 'locked' || currentProgram?.status === 'published';

  // Entries for selected program
  const currentEntries = useMemo(() => {
    let list = (entries || []).filter(e => e.programId === selectedProgramId);

    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase();
      list = list.filter(e => {
        const st = (students || []).find(s => s.id === e.studentId);
        const cl = classesMap?.[st?.classId] || (classes || []).find(c => c.id === st?.classId);
        const tm = teamsMap?.[e.teamId] || (teams || []).find(t => t.id === e.teamId);

        return (
          st?.name?.toLowerCase().includes(q) ||
          st?.cicNo?.toLowerCase().includes(q) ||
          cl?.name?.toLowerCase().includes(q) ||
          tm?.name?.toLowerCase().includes(q) ||
          e.groupName?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [entries, selectedProgramId, participantSearch, students, classesMap, classes, teamsMap, teams]);

  // Local state of marks entered by this judge
  const [marksState, setMarksState] = useState({});

  useEffect(() => {
    const initial = {};
    (entries || []).filter(e => e.programId === selectedProgramId).forEach(e => {
      const existing = (marks || []).find(
        m => m.programId === selectedProgramId &&
          (m.entryId === e.id || m.studentId === e.studentId) &&
          m.enteredBy === currentUser?.id
      );
      if (existing) {
        initial[e.id] = String(existing.marks);
      }
    });
    setMarksState(initial);
  }, [selectedProgramId, entries, marks, currentUser]);

  const handleMarkChange = (entryId, val) => {
    setMarksState(prev => ({ ...prev, [entryId]: val }));
  };

  const getGradeInfo = (val) => {
    if (val === '' || val == null || isNaN(val)) return null;
    const num = Number(val);
    if (num < 0 || num > 10) return null;
    if (num >= 9.0) return { grade: 'A', text: 'Outstanding (A)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    if (num >= 7.0) return { grade: 'B', text: 'Very Good (B)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    if (num >= 5.0) return { grade: 'C', text: 'Good (C)', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    return { grade: 'D', text: 'Below Min', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
  };

  const handleSaveIndividualMark = (entry) => {
    if (isLocked) return;
    const val = marksState[entry.id];
    if (val == null || val === '') return;

    submitJudgeMark(
      selectedProgramId,
      entry.id,
      entry.studentId,
      currentUser.id,
      currentUser.name,
      val,
      `judge:${currentUser.name}`
    );

    const st = (students || []).find(s => s.id === entry.studentId);
    const displayName = st?.name || entry.groupName || 'Participant';

    setSavedRowIds(prev => ({ ...prev, [entry.id]: true }));
    setTimeout(() => {
      setSavedRowIds(prev => ({ ...prev, [entry.id]: false }));
    }, 2000);

    setToastMsg(`Saved score (${val}/10) for ${displayName}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSaveAllMarks = () => {
    if (isLocked) return;
    let savedCount = 0;
    currentEntries.forEach(entry => {
      const val = marksState[entry.id];
      if (val != null && val !== '') {
        submitJudgeMark(
          selectedProgramId,
          entry.id,
          entry.studentId,
          currentUser.id,
          currentUser.name,
          val,
          `judge:${currentUser.name}`
        );
        savedCount++;
      }
    });

    setToastMsg(`Successfully saved marks for ${savedCount} participant(s)!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Evaluation History (all marks submitted by this judge)
  const myEvaluationHistory = useMemo(() => {
    return (marks || []).filter(m => m.enteredBy === currentUser?.id);
  }, [marks, currentUser]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              <Gavel className="w-3.5 h-3.5" />
              <span>Judge Console</span>
            </div>
            {isUnrestricted ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[10px] sm:text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>All Programs</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 text-[10px] sm:text-[11px] font-bold">
                <Lock className="w-3 h-3 text-amber-300" />
                <span>{assignedPrograms.length} Events</span>
              </div>
            )}
          </div>
          <h2 className="text-lg sm:text-2xl font-bold">{currentUser?.name}</h2>
          <p className="text-[11px] sm:text-xs text-slate-200 hidden sm:block">
            {isUnrestricted
              ? `You can view full student details and evaluate all ${programs?.length || 0} events • Max Marks: 10 per participant`
              : `${assignedPrograms.length} events assigned to you • Max Marks: 10 per participant`}
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Scoring Console or History Tab */}
      {activeTab === 'evaluation' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#0E7C86]" />
                <span>Summit Filter:</span>
              </span>
              <select
                value={selectedSummitFilter}
                onChange={(e) => setSelectedSummitFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              >
                <option value="all">All Published Summits ({assignedPrograms.length} Events)</option>
                {publishedSummits.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.date || 'Scheduled'})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search event name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Program Selectors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                Select Program ({assignedPrograms.length} Available):
              </label>
              {isUnrestricted && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✨ No Restrictions (All Programs Unlocked)
                </span>
              )}
            </div>

            {assignedPrograms.length === 0 ? (
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  No Programs Assigned to Your Account
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                  You are currently restricted to assigned events, but no programs have been linked yet.
                  Contact an Admin (Hashim, Nazih, or Hisham) to assign events or enable <strong>&quot;Allow Access to ALL Programs&quot;</strong> in Judge Management.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {assignedPrograms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProgramId(p.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${selectedProgramId === p.id
                        ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                        : 'bg-white dark:bg-[#0F1B2B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
                      }`}
                  >
                    {p.status === 'locked' || p.status === 'published' ? (
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentProgram && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Event</span>
                  <span className="font-bold text-sm text-[#0F2A4A] dark:text-white">{currentProgram.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold">{currentProgram.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue & Time</span>
                  <span className="font-semibold">{currentProgram.stage || 'Auditorium'} • {currentProgram.time || '10:00 AM'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className={`font-bold ${isLocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isLocked ? "Evaluation Closed / Locked by Admin" : "Open for Scoring"}
                  </span>
                </div>
              </div>

              {!isLocked && (
                <button
                  onClick={handleSaveAllMarks}
                  className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1E3A5F] dark:bg-[#0E7C86] dark:hover:bg-teal-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Scores</span>
                </button>
              )}
            </div>
          )}

          {/* Participant Search and Summary Header */}
          {currentProgram && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Users className="w-4 h-4 text-[#0E7C86]" />
                <span>Student Participants ({currentEntries.length}):</span>
                <span className="text-slate-400 font-normal">
                  All student details, CIC numbers &amp; classes are displayed below. Enter marks out of 10.
                </span>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter student name, CIC No, class..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* MOBILE VIEW (Screens < 768px): Sleek Native Card Feed - Zero Horizontal Scrolling, Everything in One View */}
          {currentProgram && (
            <div className="md:hidden space-y-3">
              {currentEntries.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs">
                  No student participants found matching your selection.
                </div>
              ) : (
                currentEntries.map((entry, index) => {
                  const st = (students || []).find(s => s.id === entry.studentId);
                  const cl = classesMap?.[st?.classId] || (classes || []).find(c => c.id === st?.classId);
                  const tm = teamsMap?.[entry.teamId || st?.teamId] || (teams || []).find(t => t.id === (entry.teamId || st?.teamId));
                  const isGroup = Boolean(entry.groupName || (entry.memberIds && entry.memberIds.length > 0));

                  const val = marksState[entry.id] || '';
                  const gradeInfo = getGradeInfo(val);
                  const hasSubmitted = (marks || []).some(
                    m => m.programId === selectedProgramId &&
                      (m.entryId === entry.id || m.studentId === entry.studentId) &&
                      m.enteredBy === currentUser?.id
                  );
                  const isRowSaved = Boolean(savedRowIds[entry.id]);

                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition"
                    >
                      {/* Header Row: Index + Avatar + Name + CIC + Class & House Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: tm?.color || '#0E7C86' }}
                          >
                            {st?.name ? st.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {isGroup ? (entry.groupName || 'Group Performance') : (st?.name || 'Student Name')}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{st?.cicNo || 'WAFY-ID'}</span>
                              <span>•</span>
                              <span>{cl?.name || st?.classId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: tm?.color || '#0E7C86' }}
                          >
                            {tm?.name || 'House'}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            hasSubmitted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {hasSubmitted ? 'Saved' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Group performers list if group event */}
                      {isGroup && entry.memberIds && entry.memberIds.length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Performers:</span>
                          {entry.memberIds.map(mId => {
                            const mem = (students || []).find(s => s.id === mId);
                            return (
                              <div key={mId} className="flex items-center gap-1.5 font-medium">
                                <span>{mem?.name}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">({mem?.cicNo})</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Controls: Mark Input + /10 + Grade Pill + Save Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              inputMode="decimal"
                              disabled={isLocked}
                              value={val}
                              onChange={(e) => handleMarkChange(entry.id, e.target.value)}
                              placeholder="0.0"
                              className="w-20 h-11 text-center font-mono font-bold text-base rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#0E7C86] focus:bg-white transition"
                            />
                            <span className="font-bold text-xs text-slate-400">/ 10</span>
                          </div>

                          {gradeInfo && (
                            <span className={`px-2 py-1 rounded-xl text-xs font-bold ${gradeInfo.color}`}>
                              {gradeInfo.grade}
                            </span>
                          )}
                        </div>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleSaveIndividualMark(entry)}
                            disabled={val === '' || val == null}
                            className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
                              isRowSaved
                                ? 'bg-emerald-600 text-white'
                                : val === '' || val == null
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#0E7C86] hover:bg-teal-700 text-white'
                            }`}
                          >
                            {isRowSaved ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Quick Fast Tap Chips */}
                      {!isLocked && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0 pr-1">Fast:</span>
                          {['7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleMarkChange(entry.id, preset)}
                              className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold transition shrink-0 active:scale-95 ${
                                val === preset
                                  ? 'bg-[#0E7C86] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* DESKTOP VIEW (Screens >= 768px): Full Table */}
          {currentProgram && (
            <div className="hidden md:block bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 sm:px-4 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">Student Participant (Name &amp; CIC No)</th>
                    <th className="hidden sm:table-cell py-2.5 px-3">Class &amp; Section</th>
                    <th className="hidden md:table-cell py-2.5 px-3">House Team &amp; Field</th>
                    <th className="py-2.5 px-3 text-center min-w-[130px] sm:min-w-[190px]">Score (0.0 to 10.0)</th>
                    <th className="py-2.5 px-3 text-center">Grade &amp; Status</th>
                    {!isLocked && <th className="py-2.5 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                        No student participants found matching your selection.
                      </td>
                    </tr>
                  ) : (
                    currentEntries.map((entry, index) => {
                      const st = (students || []).find(s => s.id === entry.studentId);
                      const cl = classesMap?.[st?.classId] || (classes || []).find(c => c.id === st?.classId);
                      const tm = teamsMap?.[entry.teamId || st?.teamId] || (teams || []).find(t => t.id === (entry.teamId || st?.teamId));
                      const fld = fieldsMap?.[st?.fieldId] || (fields || []).find(f => f.id === st?.fieldId);
                      const isGroup = Boolean(entry.groupName || (entry.memberIds && entry.memberIds.length > 0));

                      const val = marksState[entry.id] || '';
                      const gradeInfo = getGradeInfo(val);
                      const hasSubmitted = (marks || []).some(
                        m => m.programId === selectedProgramId &&
                          (m.entryId === entry.id || m.studentId === entry.studentId) &&
                          m.enteredBy === currentUser?.id
                      );
                      const isRowSaved = Boolean(savedRowIds[entry.id]);

                      return (
                        <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                            {index + 1}
                          </td>

                          {/* Student Name & CIC Number Details */}
                          <td className="py-2.5 px-3 sm:px-4 sticky left-0 bg-white dark:bg-[#0F1B2B] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                            {isGroup ? (
                              <div className="space-y-1">
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                                  <Users className="w-4 h-4 text-[#0E7C86]" />
                                  <span>{entry.groupName || 'Group Performance'}</span>
                                </div>
                                {entry.memberIds && entry.memberIds.length > 0 && (
                                  <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5">
                                    {entry.memberIds.map(mId => {
                                      const mem = (students || []).find(s => s.id === mId);
                                      const memClass = classesMap?.[mem?.classId]?.name || mem?.classId;
                                      return (
                                        <div key={mId} className="flex items-center gap-1.5">
                                          <span className="font-semibold text-slate-800 dark:text-slate-200">{mem?.name}</span>
                                          <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">({mem?.cicNo})</span>
                                          {memClass && <span className="text-[10px] text-slate-400">• {memClass}</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                <div
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                                  style={{ backgroundColor: tm?.color || '#0E7C86' }}
                                >
                                  {st?.name ? st.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div>
                                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                    {st?.name || 'Student Name'}
                                  </div>
                                  <div className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <GraduationCap className="w-3.5 h-3.5" />
                                      <span>CIC: {st?.cicNo || 'WAFY-ID'}</span>
                                    </span>
                                    <span
                                      className="sm:hidden font-sans font-bold text-white px-2 py-0.2 rounded-full text-[9px]"
                                      style={{ backgroundColor: tm?.color || '#0E7C86' }}
                                    >
                                      {tm?.name || 'House'}
                                    </span>
                                    <span className="sm:hidden text-slate-400 font-sans text-[10px]">
                                      • {cl?.name || st?.classId}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Class & Academic Section */}
                          <td className="hidden sm:table-cell py-2.5 px-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {cl?.name || st?.classId || 'Wafy Class'}
                            </div>
                            <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                              {st?.sectionId === 'aliya' ? 'Aliya Section' : 'Thamheediyya Section'}
                            </div>
                          </td>

                          {/* House Team & Field */}
                          <td className="hidden md:table-cell py-2.5 px-3">
                            <div className="space-y-1">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                                style={{ backgroundColor: tm?.color || '#0ca6b4ff' }}
                              >
                                <span>{tm?.name || 'House Team'}</span>
                              </span>
                              {fld?.name && (
                                <div className="text-[11px] text-slate-500 font-medium">
                                  Field: {fld.name}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Score Input (0.0 to 10.0) with Quick Presets */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="10"
                                  inputMode="decimal"
                                  disabled={isLocked}
                                  value={val}
                                  onChange={(e) => handleMarkChange(entry.id, e.target.value)}
                                  placeholder="0.0 - 10.0"
                                  className="w-28 p-2 font-mono font-bold text-center text-base sm:text-sm min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50 focus:ring-2 focus:ring-[#0E7C86] focus:border-[#0E7C86] shadow-xs"
                                />
                                <span className="font-bold text-xs text-slate-400">/ 10</span>
                              </div>

                              {/* Quick Mark Suggestion Chips */}
                              {!isLocked && (
                                <div className="flex items-center gap-1.5 flex-wrap justify-center pt-0.5">
                                  {['7.0', '8.0', '8.5', '9.0', '9.5', '10.0'].map(preset => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => handleMarkChange(entry.id, preset)}
                                      className={`min-h-[34px] min-w-[34px] px-2 py-1 rounded-lg text-xs font-mono font-bold transition active:scale-95 ${val === preset
                                          ? 'bg-[#0E7C86] text-white shadow-xs'
                                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Grade & Status Badge */}
                          <td className="py-3 px-4 text-center">
                            <div className="space-y-1 inline-flex flex-col items-center">
                              {gradeInfo ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeInfo.color}`}>
                                  {gradeInfo.text}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No score</span>
                              )}

                              <div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${hasSubmitted
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}>
                                  {hasSubmitted ? `Evaluated (${val}/10)` : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Individual Save Action */}
                          {!isLocked && (
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleSaveIndividualMark(entry)}
                                disabled={val === '' || val == null}
                                className={`px-3 py-1.5 font-semibold rounded-xl text-xs transition flex items-center gap-1 ml-auto shadow-xs ${isRowSaved
                                    ? 'bg-emerald-600 text-white'
                                    : val === '' || val == null
                                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                      : 'bg-[#0E7C86] hover:bg-teal-700 text-white'
                                  }`}
                              >
                                {isRowSaved ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Saved</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save</span>
                                  </>
                                )}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Evaluation History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#0E7C86]" />
            <span>My Submitted Scores History ({myEvaluationHistory.length} Marks Recorded)</span>
          </h3>

          <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Program</th>
                  <th className="py-2.5 px-4">Student Participant (Name &amp; CIC)</th>
                  <th className="py-2.5 px-4">House Team &amp; Class</th>
                  <th className="py-2.5 px-4 text-center">Score Given</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myEvaluationHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No evaluation scores submitted yet.
                    </td>
                  </tr>
                ) : (
                  myEvaluationHistory.map((m, hIdx) => {
                    const prog = (programs || []).find(p => p.id === m.programId);
                    const entry = (entries || []).find(e => e.id === m.entryId);
                    const st = (students || []).find(s => s.id === (entry?.studentId || m.studentId));
                    const tm = teamsMap?.[entry?.teamId || st?.teamId] || (teams || []).find(t => t.id === (entry?.teamId || st?.teamId));
                    const cl = classesMap?.[st?.classId] || (classes || []).find(c => c.id === st?.classId);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 text-center font-mono text-slate-400">{hIdx + 1}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-400">{new Date(m.timestamp).toLocaleString()}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{prog?.name || 'Program'}</td>
                        <td className="py-2.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{st?.name || entry?.groupName || 'Student'}</div>
                          {st?.cicNo && (
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                              CIC: {st.cicNo}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-semibold">{tm?.name || 'Team'}</div>
                          <div className="text-[11px] text-slate-400">{cl?.name || st?.classId}</div>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-sm text-[#0E7C86]">{m.marks}/10</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
