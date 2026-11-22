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
  Users,
  ShieldAlert,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

export const JudgeDashboard = ({ activeTab = 'evaluation', setActiveTab }) => {
  const {
    programs = [],
    entries = [],
    marks = [],
    teams = [],
    students = [],
    classes = [],
    fields = [],
    classesMap = {},
    fieldsMap = {},
    teamsMap = {},
    judges = [],
    summits = [],
    settings = {},
    submitJudgeMark
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Internal tab state synced with activeTab prop
  const [currentTab, setCurrentTab] = useState(activeTab || 'evaluation');
  useEffect(() => {
    if (activeTab) setCurrentTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (typeof setActiveTab === 'function') {
      setActiveTab(tab);
    }
  };

  // Find judge profile
  const currentJudge = (judges || []).find(j => j.id === currentUser?.id) || currentUser;

  // Unrestricted judge check
  const isUnrestricted = Boolean(currentJudge?.unrestricted) ||
    currentJudge?.assignedPrograms?.includes('all') ||
    currentJudge?.assignedSummits?.includes('all') ||
    settings?.enforceJudgeRestrictions === false;

  // Admin mark edit restriction check:
  // Both global settings and per-judge settings must permit editing (unless unrestricted)
  const canEditMarks = isUnrestricted || (
    settings?.allowJudgeMarkEditing !== false &&
    currentJudge?.allowMarkEditing !== false
  );

  const [selectedSummitFilter, setSelectedSummitFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  // 1. SUMMITS ALLOCATED TO THIS JUDGE (Planned & Cancelled summits are hidden; Restricted judges only see assigned summits)
  const publishedSummits = useMemo(() => {
    // Only published/active summits are visible (planned summits are strictly hidden)
    const activeSummits = (summits || []).filter(s => s.status && s.status !== 'planned' && s.status !== 'cancelled');
    
    if (isUnrestricted) {
      return activeSummits;
    }

    const assignedSummitIds = new Set(currentJudge?.assignedSummits || []);
    // Also include any summit if the judge was explicitly assigned to one of its programs
    (programs || []).forEach(p => {
      if ((p.assignedJudges?.includes(currentUser?.id) || currentJudge?.assignedPrograms?.includes(p.id)) && p.summitId) {
        assignedSummitIds.add(p.summitId);
      }
    });

    return activeSummits.filter(s => assignedSummitIds.has(s.id));
  }, [summits, isUnrestricted, currentJudge, programs, currentUser]);

  const publishedSummitIds = useMemo(() => new Set(publishedSummits.map(s => s.id)), [publishedSummits]);

  // 2. PROGRAMS AVAILABLE TO THIS JUDGE
  const assignedPrograms = useMemo(() => {
    let pool = [];
    if (isUnrestricted) {
      pool = programs || [];
    } else {
      const assignedSummitIds = new Set(currentJudge?.assignedSummits || []);
      pool = (programs || []).filter(p =>
        p.assignedJudges?.includes(currentUser?.id) ||
        currentJudge?.assignedPrograms?.includes(p.id) ||
        (p.summitId && assignedSummitIds.has(p.summitId))
      );
    }

    // Exclude draft/planned programs or programs belonging to unallocated/planned summits
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
    // If mark editing is restricted and mark already exists, prevent changing
    const existing = (marks || []).find(
      m => m.programId === selectedProgramId &&
        (m.entryId === entryId || (entries || []).find(e => e.id === entryId)?.studentId === m.studentId) &&
        m.enteredBy === currentUser?.id
    );
    if (!canEditMarks && existing) {
      setToastMsg('Mark editing is restricted by Admin. Submitted scores cannot be changed.');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
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

    // Check if score is already submitted and editing is restricted
    const existing = (marks || []).find(
      m => m.programId === selectedProgramId &&
        (m.entryId === entry.id || m.studentId === entry.studentId) &&
        m.enteredBy === currentUser?.id
    );
    if (!canEditMarks && existing) {
      setToastMsg('Mark editing is restricted by Admin. Submitted scores cannot be modified.');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

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
    let skippedLocked = 0;

    currentEntries.forEach(entry => {
      const val = marksState[entry.id];
      if (val != null && val !== '') {
        const existing = (marks || []).find(
          m => m.programId === selectedProgramId &&
            (m.entryId === entry.id || m.studentId === entry.studentId) &&
            m.enteredBy === currentUser?.id
        );
        if (!canEditMarks && existing) {
          skippedLocked++;
          return;
        }

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

    if (skippedLocked > 0 && savedCount === 0) {
      setToastMsg('Mark editing is restricted by Admin. All existing marks are locked.');
    } else {
      setToastMsg(`Saved ${savedCount} mark(s)${skippedLocked > 0 ? ` (${skippedLocked} locked skipped)` : ''}!`);
    }
    setTimeout(() => setToastMsg(''), 2500);
  };

  // 3. EVALUATION HISTORY (All marks submitted by this judge across all past and current summits)
  const myEvaluationHistory = useMemo(() => {
    return (marks || []).filter(m => m.enteredBy === currentUser?.id);
  }, [marks, currentUser]);

  // History Filter State
  const [historySearch, setHistorySearch] = useState('');
  const [historySummitFilter, setHistorySummitFilter] = useState('all');

  const filteredHistory = useMemo(() => {
    let list = [...myEvaluationHistory].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    if (historySummitFilter !== 'all') {
      list = list.filter(m => {
        const p = (programs || []).find(prog => prog.id === m.programId);
        return p?.summitId === historySummitFilter;
      });
    }

    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      list = list.filter(m => {
        const prog = (programs || []).find(p => p.id === m.programId);
        const entry = (entries || []).find(e => e.id === m.entryId);
        const st = (students || []).find(s => s.id === (entry?.studentId || m.studentId));
        const tm = teamsMap?.[entry?.teamId || st?.teamId] || (teams || []).find(t => t.id === (entry?.teamId || st?.teamId));
        return (
          prog?.name?.toLowerCase().includes(q) ||
          st?.name?.toLowerCase().includes(q) ||
          st?.cicNo?.toLowerCase().includes(q) ||
          tm?.name?.toLowerCase().includes(q) ||
          entry?.groupName?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [myEvaluationHistory, historySummitFilter, historySearch, programs, entries, students, teamsMap, teams]);

  return (
    <div className="space-y-6">
      {/* Radiant Judge Header Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0F2A4A] via-[#1E3A8A] to-[#0E7C86] text-white shadow-xl shadow-teal-900/15 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-60 h-60 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
              <Gavel className="w-3.5 h-3.5 text-amber-300" />
              <span>Official Jury Panel</span>
            </div>

            {/* Status badge */}
            {!canEditMarks ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 backdrop-blur-md text-amber-200 border border-amber-300/40 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>Mark Editing Restricted</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md text-emerald-200 border border-emerald-300/40 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Mark Editing Enabled</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentUser?.name}</h2>
          <p className="text-xs sm:text-sm text-teal-100/90 font-medium">
            {isUnrestricted
              ? 'Unrestricted Evaluator &bull; Full access to all college summits and events'
              : `Allocated to ${publishedSummits.length} published summit(s) and ${assignedPrograms.length} active event(s)`}
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="relative z-10 flex items-center gap-1 bg-white/15 backdrop-blur-md p-1.5 rounded-2xl self-start md:self-auto shrink-0 border border-white/20 shadow-md shadow-black/10">
          <button
            type="button"
            onClick={() => handleTabChange('evaluation')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              currentTab === 'evaluation'
                ? 'bg-white text-[#0F2A4A] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Scoring Console</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('history')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              currentTab === 'history'
                ? 'bg-white text-[#0F2A4A] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({myEvaluationHistory.length})</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* VIEW 1: SCORING CONSOLE */}
      {currentTab === 'evaluation' && (
        <div className="space-y-4">
          {/* Allocated Summit Warning if none allocated */}
          {!isUnrestricted && publishedSummits.length === 0 ? (
            <div className="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="font-bold text-base text-amber-900 dark:text-amber-200">
                No Summits Allocated by Admin
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-lg mx-auto">
                Only summits that an Administrator has explicitly allocated to your account can be accessed here. 
                Currently, no active published summits are linked to your profile. Please contact an Admin to allocate summits in <strong>Admin &gt; Judges &amp; Evaluators</strong>.
              </p>
              {myEvaluationHistory.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => handleTabChange('history')}
                    className="px-4 py-2 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Your Previous Evaluation History ({myEvaluationHistory.length} Marks)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Summit and Program Filter Toolbar */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>Allocated Summit:</span>
                  </span>
                  <select
                    value={selectedSummitFilter}
                    onChange={(e) => setSelectedSummitFilter(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="all">
                      All Allocated Summits ({publishedSummits.length} Summits • {assignedPrograms.length} Events)
                    </option>
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
                    placeholder="Search assigned event..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Programs Selector Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                    Available Events ({assignedPrograms.length}):
                  </label>
                  {!canEditMarks && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Marks locked after submission (Admin Restricted)</span>
                    </span>
                  )}
                </div>

                {assignedPrograms.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                      No Events in Selected Summit
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                      No active events match your current filter. Choose &quot;All Allocated Summits&quot; or contact an Admin.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {assignedPrograms.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProgramId(p.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                          selectedProgramId === p.id
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

              {/* Selected Program Header Card */}
              {currentProgram && (
                <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Event</span>
                      <span className="font-bold text-sm text-[#0F2A4A] dark:text-white">{currentProgram.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Summit</span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400">
                        {(summits || []).find(s => s.id === currentProgram.summitId)?.name || 'Summit Gathering'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue & Time</span>
                      <span className="font-semibold">{currentProgram.stage || 'Auditorium'} • {currentProgram.time || '10:00 AM'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Status</span>
                      <StatusBadge
                        status={isLocked ? 'danger' : 'info'}
                        label={isLocked ? 'Locked / Closed' : 'Open for Scoring'}
                      />
                    </div>
                  </div>

                  {!isLocked && (
                    <button
                      onClick={handleSaveAllMarks}
                      className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1E3A5F] dark:bg-[#0E7C86] dark:hover:bg-teal-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save All Valid Scores</span>
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
                      Enter marks out of 10. {!canEditMarks && '(Locked once saved)'}
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

              {/* MOBILE VIEW (Screens < 768px): Native Card Feed */}
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

                      const existingMark = (marks || []).find(
                        m => m.programId === selectedProgramId &&
                          (m.entryId === entry.id || m.studentId === entry.studentId) &&
                          m.enteredBy === currentUser?.id
                      );
                      const hasSubmitted = Boolean(existingMark);
                      const isEditingRestricted = hasSubmitted && !canEditMarks;
                      const isRowDisabled = isLocked || isEditingRestricted;
                      const isRowSaved = Boolean(savedRowIds[entry.id]);

                      return (
                        <div
                          key={entry.id}
                          className="p-3.5 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition"
                        >
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
                                {hasSubmitted ? (isEditingRestricted ? 'Locked' : 'Saved') : 'Pending'}
                              </span>
                            </div>
                          </div>

                          {/* Group Members */}
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

                          {/* Controls */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="10"
                                  inputMode="decimal"
                                  disabled={isRowDisabled}
                                  value={val}
                                  onChange={(e) => handleMarkChange(entry.id, e.target.value)}
                                  placeholder="0.0"
                                  title={isEditingRestricted ? "Mark editing restricted by Admin" : "Score (0.0 to 10.0)"}
                                  className={`w-20 h-11 text-center font-mono font-bold text-base rounded-xl border-2 ${
                                    isEditingRestricted
                                      ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#0E7C86] focus:bg-white'
                                  } transition`}
                                />
                                <span className="font-bold text-xs text-slate-400">/ 10</span>
                              </div>

                              {gradeInfo && (
                                <span className={`px-2 py-1 rounded-xl text-xs font-bold ${gradeInfo.color}`}>
                                  {gradeInfo.grade}
                                </span>
                              )}
                            </div>

                            {isEditingRestricted ? (
                              <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                                <Lock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Locked</span>
                              </div>
                            ) : !isLocked && (
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
                                    <span>{hasSubmitted ? 'Update' : 'Save'}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Quick Fast Tap Chips */}
                          {!isRowDisabled && (
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

                            const existingMark = (marks || []).find(
                              m => m.programId === selectedProgramId &&
                                (m.entryId === entry.id || m.studentId === entry.studentId) &&
                                m.enteredBy === currentUser?.id
                            );
                            const hasSubmitted = Boolean(existingMark);
                            const isEditingRestricted = hasSubmitted && !canEditMarks;
                            const isRowDisabled = isLocked || isEditingRestricted;
                            const isRowSaved = Boolean(savedRowIds[entry.id]);

                            return (
                              <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                                  {index + 1}
                                </td>

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

                                <td className="hidden sm:table-cell py-2.5 px-3">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    {cl?.name || st?.classId || 'Wafy Class'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                                    {st?.sectionId === 'aliya' ? 'Aliya Section' : 'Thamheediyya Section'}
                                  </div>
                                </td>

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

                                <td className="py-3 px-4">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        inputMode="decimal"
                                        disabled={isRowDisabled}
                                        value={val}
                                        onChange={(e) => handleMarkChange(entry.id, e.target.value)}
                                        placeholder="0.0 - 10.0"
                                        title={isEditingRestricted ? "Mark editing restricted by Admin" : "Score (0.0 to 10.0)"}
                                        className={`w-28 p-2 font-mono font-bold text-center text-base sm:text-sm min-h-[44px] rounded-xl border ${
                                          isEditingRestricted
                                            ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:border-[#0E7C86]'
                                        } shadow-xs transition`}
                                      />
                                      <span className="font-bold text-xs text-slate-400">/ 10</span>
                                    </div>

                                    {!isRowDisabled && (
                                      <div className="flex items-center gap-1.5 flex-wrap justify-center pt-0.5">
                                        {['7.0', '8.0', '8.5', '9.0', '9.5', '10.0'].map(preset => (
                                          <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handleMarkChange(entry.id, preset)}
                                            className={`min-h-[34px] min-w-[34px] px-2 py-1 rounded-lg text-xs font-mono font-bold transition active:scale-95 ${
                                              val === preset
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
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        hasSubmitted
                                          ? (isEditingRestricted
                                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')
                                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      }`}>
                                        {hasSubmitted ? (isEditingRestricted ? `Locked (${val}/10)` : `Evaluated (${val}/10)`) : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {!isLocked && (
                                  <td className="py-3 px-4 text-right">
                                    {isEditingRestricted ? (
                                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                                        <Lock className="w-3 h-3 text-amber-500" />
                                        <span>Locked</span>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleSaveIndividualMark(entry)}
                                        disabled={val === '' || val == null}
                                        className={`px-3 py-1.5 font-semibold rounded-xl text-xs transition flex items-center gap-1 ml-auto shadow-xs ${
                                          isRowSaved
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
                                            <span>{hasSubmitted ? 'Update' : 'Save'}</span>
                                          </>
                                        )}
                                      </button>
                                    )}
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
            </>
          )}
        </div>
      )}

      {/* VIEW 2: EVALUATION HISTORY (View past allocated summits and submitted scores) */}
      {currentTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#0E7C86]" />
                <span>My Submitted Scores History</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review all past evaluations submitted by your account across allocated weekly summits.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                Total Evaluated: {myEvaluationHistory.length}
              </span>
            </div>
          </div>

          {/* History Filters */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#0E7C86]" />
                <span>Summit:</span>
              </span>
              <select
                value={historySummitFilter}
                onChange={(e) => setHistorySummitFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              >
                <option value="all">All Allocated Summits</option>
                {publishedSummits.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search participant, CIC, event..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Mobile History Feed */}
          <div className="md:hidden space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs">
                No evaluation scores found matching your filter.
              </div>
            ) : (
              filteredHistory.map((m, hIdx) => {
                const prog = (programs || []).find(p => p.id === m.programId);
                const sum = (summits || []).find(s => s.id === prog?.summitId);
                const entry = (entries || []).find(e => e.id === m.entryId);
                const st = (students || []).find(s => s.id === (entry?.studentId || m.studentId));
                const tm = teamsMap?.[entry?.teamId || st?.teamId] || (teams || []).find(t => t.id === (entry?.teamId || st?.teamId));
                const cl = classesMap?.[st?.classId] || (classes || []).find(c => c.id === st?.classId);
                const grade = getGradeInfo(m.marks);

                return (
                  <div
                    key={m.id || hIdx}
                    className="p-3.5 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {st?.name || entry?.groupName || 'Participant'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{st?.cicNo || 'WAFY-ID'}</span>
                          <span>•</span>
                          <span>{cl?.name || st?.classId}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-base text-[#0E7C86]">
                          {m.marks}/10
                        </div>
                        {grade && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${grade.color}`}>
                            {grade.grade}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-teal-700 dark:text-teal-400">{prog?.name || 'Program'}</span>
                        <span
                          className="px-2 py-0.2 rounded-full text-[9px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: tm?.color || '#0E7C86' }}
                        >
                          {tm?.name || 'House'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{sum?.name || 'Summit'}</span>
                        <span>{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : 'Recorded'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </span>

                      {!canEditMarks ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <Unlock className="w-3 h-3 text-emerald-500" />
                          <span>Editable in Console</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop History Table */}
          <div className="hidden md:block bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Date &amp; Time</th>
                    <th className="py-2.5 px-4">Summit &amp; Program</th>
                    <th className="py-2.5 px-4">Student Participant (Name &amp; CIC)</th>
                    <th className="py-2.5 px-4">House Team &amp; Class</th>
                    <th className="py-2.5 px-4 text-center">Score Given</th>
                    <th className="py-2.5 px-4 text-center">Status &amp; Edit Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No evaluation scores submitted yet.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((m, hIdx) => {
                      const prog = (programs || []).find(p => p.id === m.programId);
                      const sum = (summits || []).find(s => s.id === prog?.summitId);
                      const entry = (entries || []).find(e => e.id === m.entryId);
                      const st = (students || []).find(s => s.id === (entry?.studentId || m.studentId));
                      const tm = teamsMap?.[entry?.teamId || st?.teamId] || (teams || []).find(t => t.id === (entry?.teamId || st?.teamId));
                      const cl = classesMap?.[st?.classId] || (classes || []).find(c => c.id === st?.classId);
                      const grade = getGradeInfo(m.marks);

                      return (
                        <tr key={m.id || hIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 text-center font-mono text-slate-400">{hIdx + 1}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-400">
                            <div>{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : 'N/A'}</div>
                            <div className="text-[10px] text-slate-400">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}</div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{prog?.name || 'Program'}</div>
                            <div className="text-[11px] text-teal-700 dark:text-teal-400">{sum?.name || 'Summit Gathering'}</div>
                          </td>
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
                          <td className="py-2.5 px-4 text-center">
                            <div className="font-mono font-bold text-sm text-[#0E7C86]">{m.marks}/10</div>
                            {grade && (
                              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${grade.color}`}>
                                {grade.grade}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {!canEditMarks ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <Lock className="w-3 h-3 text-amber-500" />
                                <span>Locked</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <Unlock className="w-3 h-3 text-emerald-500" />
                                <span>Editable</span>
                              </span>
                            )}
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
