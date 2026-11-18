import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Calendar,
  Plus,
  Copy,
  XCircle,
  Users,
  UserPlus,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  Share2,
  Eye,
  EyeOff,
  Table,
  Layers,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Check,
  UserCheck,
  Edit,
  Gavel,
  Search,
  Trash2
} from 'lucide-react';

export const ProgramManagement = () => {
  const {
    summits,
    sections,
    fields,
    programLibrary,
    programs,
    entries,
    students,
    teams,
    judges,
    assignProgramToSummit,
    updateSummitProgramAllocation,
    bulkAssignSummitProgramToAllTeams,
    copyTeamAllocationsToOtherTeams,
    copySummitSetup,
    toggleSummitRegistrationLock,
    nominateStudentForProgram,
    removeStudentEntry,
    updateProgram,
    duplicateProgram,
    cancelProgram,
    toggleProgramStatus
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Active Summit Selector
  const [selectedSummitId, setSelectedSummitId] = useState(summits[0]?.id || 'summit1');
  const activeSummit = summits.find(s => s.id === selectedSummitId) || summits[0];

  // Section Tab
  const [activeSection, setActiveSection] = useState('thamheediyya'); // 'thamheediyya' or 'aliya'

  // Aliya Sub-view: 'matrix' or 'cards'
  const [aliyaViewMode, setAliyaViewMode] = useState('matrix');

  // Copy Setup Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [sourceSummitId, setSourceSummitId] = useState(summits[1]?.id || summits[0]?.id);

  // Add Program Modal State (from Library or Custom)
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [addMode, setAddMode] = useState('library'); // 'library' or 'custom'
  const [selectedLibraryProgId, setSelectedLibraryProgId] = useState(programLibrary[0]?.id || '');
  const [progSearchText, setProgSearchText] = useState('');
  const [selectedAliyaTeamIds, setSelectedAliyaTeamIds] = useState(() => teams.map(t => t.id));
  const [aliyaSlotCount, setAliyaSlotCount] = useState(1);
  const [addVenue, setAddVenue] = useState('Auditorium Stage');
  const [addTime, setAddTime] = useState('10:00 AM');
  const [addAssignedJudges, setAddAssignedJudges] = useState([]);
  const [newCustomProg, setNewCustomProg] = useState({
    name: '',
    fieldId: fields[0]?.id || '',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Auditorium Stage',
    time: '10:00 AM',
    defaultAllowedPerTeam: 1,
    allowLeaderMarkEntry: false
  });

  // Edit Program Modal State
  const [editingProgram, setEditingProgram] = useState(null);
  const [editProgForm, setEditProgForm] = useState({
    name: '',
    fieldId: '',
    stage: '',
    time: '',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    assignedJudges: [],
    summitId: ''
  });

  // Participant Management Modal State
  const [managingProgram, setManagingProgram] = useState(null);
  const [managingTeamId, setManagingTeamId] = useState(teams[0]?.id || 't1');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState([]);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [assignError, setAssignError] = useState('');

  // Cancel Program Confirm
  const [cancellingProgram, setCancellingProgram] = useState(null);

  // Programs for current summit & section
  const currentSummitPrograms = useMemo(() => {
    return programs.filter(p => p.summitId === selectedSummitId);
  }, [programs, selectedSummitId]);

  const sectionPrograms = useMemo(() => {
    return currentSummitPrograms.filter(p => p.sectionId === activeSection || p.sectionId === 'both');
  }, [currentSummitPrograms, activeSection]);

  // Library programs available for adding
  const availableLibraryPrograms = useMemo(() => {
    return programLibrary.filter(lp => lp.sectionId === activeSection || lp.sectionId === 'both');
  }, [programLibrary, activeSection]);

  // Live filtered library programs based on typing search query
  const filteredLibraryPrograms = useMemo(() => {
    const q = progSearchText.toLowerCase().trim();
    if (!q) return availableLibraryPrograms;
    return availableLibraryPrograms.filter(lp =>
      lp.name.toLowerCase().includes(q) ||
      (lp.description && lp.description.toLowerCase().includes(q))
    );
  }, [availableLibraryPrograms, progSearchText]);

  // Handle Add Program Submit
  const handleAddProgramSubmit = (e) => {
    e.preventDefault();

    // Prepare team allocations for Aliya if activeSection is aliya
    let teamAllocations = undefined;
    if (activeSection === 'aliya') {
      teamAllocations = {};
      teams.forEach(t => {
        const isAssigned = selectedAliyaTeamIds.includes(t.id);
        teamAllocations[t.id] = {
          assigned: isAssigned,
          allowedCount: isAssigned ? (Number(aliyaSlotCount) || 1) : 1
        };
      });
    }

    if (addMode === 'library') {
      const libProg = programLibrary.find(lp => lp.id === selectedLibraryProgId);
      if (!libProg) return;

      assignProgramToSummit(selectedSummitId, {
        libraryProgramId: libProg.id,
        name: libProg.name,
        fieldId: libProg.fieldId,
        sectionId: libProg.sectionId || activeSection,
        type: libProg.type,
        maxMarks: libProg.maxMarks || 10,
        defaultAllowedPerTeam: activeSection === 'aliya' ? (Number(aliyaSlotCount) || 1) : (libProg.defaultAllowedPerTeam || 1),
        stage: addVenue || 'Auditorium Stage',
        date: activeSummit?.date,
        time: addTime || '10:00 AM',
        assignedJudges: addAssignedJudges,
        teamAllocations,
        allowLeaderMarkEntry: false
      }, currentUser?.username);
    } else {
      if (!newCustomProg.name.trim()) return;
      assignProgramToSummit(selectedSummitId, {
        ...newCustomProg,
        stage: newCustomProg.stage || addVenue || 'Auditorium Stage',
        time: newCustomProg.time || addTime || '10:00 AM',
        assignedJudges: addAssignedJudges,
        sectionId: activeSection,
        date: activeSummit?.date,
        teamAllocations
      }, currentUser?.username);
    }

    setIsAddProgramOpen(false);
    setAddAssignedJudges([]);
    setProgSearchText('');
  };

  // Open Edit Program Modal
  const handleOpenEditProgram = (prog) => {
    setEditingProgram(prog);
    setEditProgForm({
      name: prog.name,
      fieldId: prog.fieldId || fields[0]?.id || '',
      stage: prog.stage || 'Auditorium Stage',
      time: prog.time || '10:00 AM',
      maxMarks: prog.maxMarks || 10,
      defaultAllowedPerTeam: prog.defaultAllowedPerTeam || 1,
      assignedJudges: prog.assignedJudges || [],
      summitId: prog.summitId || selectedSummitId
    });
  };

  // Save Edit Program
  const handleSaveEditProgram = (e) => {
    e.preventDefault();
    if (!editingProgram) return;

    updateProgram(editingProgram.id, {
      name: editProgForm.name,
      fieldId: editProgForm.fieldId,
      stage: editProgForm.stage,
      time: editProgForm.time,
      maxMarks: Number(editProgForm.maxMarks) || 10,
      defaultAllowedPerTeam: Number(editProgForm.defaultAllowedPerTeam) || 1,
      assignedJudges: editProgForm.assignedJudges,
      summitId: editProgForm.summitId
    }, currentUser?.username);

    setEditingProgram(null);
  };

  // Toggle Judge selection for program assignment
  const toggleJudgeSelection = (judgeId, isEdit = false) => {
    if (isEdit) {
      setEditProgForm(prev => {
        const current = prev.assignedJudges || [];
        const next = current.includes(judgeId)
          ? current.filter(id => id !== judgeId)
          : [...current, judgeId];
        return { ...prev, assignedJudges: next };
      });
    } else {
      setAddAssignedJudges(prev => {
        return prev.includes(judgeId)
          ? prev.filter(id => id !== judgeId)
          : [...prev, judgeId];
      });
    }
  };

  // Handle Copy Summit Setup
  const handleExecuteCopy = () => {
    if (!sourceSummitId || sourceSummitId === selectedSummitId) return;
    copySummitSetup(sourceSummitId, selectedSummitId, currentUser?.username);
    setIsCopyModalOpen(false);
  };

  // Open Participant Management Modal
  const handleOpenParticipantModal = (prog, teamId = teams[0]?.id) => {
    setManagingProgram(prog);
    setManagingTeamId(teamId);
    setSelectedStudentId('');
    setSelectedGroupMemberIds([]);
    setGroupNameInput('');
    setAssignError('');
  };

  // Handle Add Participant Submit
  const handleAddParticipantSubmit = (e) => {
    e.preventDefault();
    if (!managingProgram) return;

    let res;
    if (managingProgram.type === 'group') {
      res = nominateStudentForProgram({
        programId: managingProgram.id,
        memberIds: selectedGroupMemberIds,
        teamId: managingTeamId,
        groupName: groupNameInput
      }, currentUser?.username);
    } else {
      if (!selectedStudentId) {
        setAssignError('Please select a student.');
        return;
      }
      res = nominateStudentForProgram({
        programId: managingProgram.id,
        studentId: selectedStudentId,
        teamId: managingTeamId
      }, currentUser?.username);
    }

    if (!res.success) {
      setAssignError(res.error);
    } else {
      setAssignError('');
      setSelectedStudentId('');
      setSelectedGroupMemberIds([]);
      setGroupNameInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summit Selector & Control Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] font-mono">
              Active Summit Management
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              activeSummit.registrationLocked ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              {activeSummit.registrationLocked ? 'Registration Locked' : 'Registration Open'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSummitId}
              onChange={(e) => setSelectedSummitId(e.target.value)}
              className="text-lg font-bold text-[#0F2A4A] dark:text-white bg-transparent border-b-2 border-[#0E7C86] pb-0.5 focus:outline-none cursor-pointer"
            >
              {summits.map(s => (
                <option key={s.id} value={s.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-semibold text-sm">
                  {s.name} ({s.month})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#0E7C86]" />
              {activeSummit.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#334E73]" />
              {activeSummit.venue}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleSummitRegistrationLock(activeSummit.id, !activeSummit.registrationLocked, currentUser?.username)}
            className={`py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition ${
              activeSummit.registrationLocked
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {activeSummit.registrationLocked ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
            <span>{activeSummit.registrationLocked ? 'Unlock Registrations' : 'Lock Registrations'}</span>
          </button>

          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
            title="Copy program setup from another summit"
          >
            <Copy className="w-4 h-4 text-[#0E7C86]" />
            <span>Copy Setup...</span>
          </button>

          <button
            onClick={() => {
              setAddMode('library');
              setIsAddProgramOpen(true);
            }}
            className="py-2 px-3.5 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Program</span>
          </button>
        </div>
      </div>

      {/* 2. Section Tabs: Thamheediyya vs Aliya */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('thamheediyya')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeSection === 'thamheediyya'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-[#0E7C86]" />
            <span>THAMHEEDIYYA (Class 1 &amp; 2)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {currentSummitPrograms.filter(p => p.sectionId === 'thamheediyya').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('aliya')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeSection === 'aliya'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C9A227]" />
            <span>ALIYA (Class 3, 4 &amp; 5)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {currentSummitPrograms.filter(p => p.sectionId === 'aliya').length}
            </span>
          </button>
        </div>

        {/* If Aliya, show Toggle between Matrix view and Cards view */}
        {activeSection === 'aliya' && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setAliyaViewMode('matrix')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                aliyaViewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-[#0E7C86]" />
              <span>Assignment Matrix</span>
            </button>
            <button
              onClick={() => setAliyaViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                aliyaViewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Cards List</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. SECTION A: THAMHEEDIYYA CONSOLE */}
      {activeSection === 'thamheediyya' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0E7C86] shrink-0" />
              <span>
                <strong>Thamheediyya Rule:</strong> All programs assigned to this summit are automatically applied to <strong>all teams</strong>. Admin can adjust slot limits per team if required.
              </span>
            </div>
            <span className="font-mono font-bold text-xs">
              {sectionPrograms.length} Common Programs
            </span>
          </div>

          {sectionPrograms.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">No programs assigned to Thamheediyya in this summit yet.</p>
              <button
                onClick={() => {
                  setAddMode('library');
                  setIsAddProgramOpen(true);
                }}
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl text-xs font-semibold"
              >
                Pick from Program Library
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Program &amp; Field</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Time &amp; Venue</th>
                      <th className="py-3 px-4 text-center">Team Slots Status</th>
                      <th className="py-3 px-4 text-center">Total Registered</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {sectionPrograms.map(prog => {
                      const progEntries = entries.filter(e => e.programId === prog.id);
                      const fieldObj = fields.find(f => f.id === prog.fieldId);

                      // Check team slot status
                      let hasUnfilledSlot = false;
                      const teamSlotBadges = teams.map(team => {
                        const count = progEntries.filter(e => e.teamId === team.id).length;
                        const allowed = prog.teamAllocations?.[team.id]?.allowedCount ?? (prog.defaultAllowedPerTeam || 1);
                        if (count < allowed) hasUnfilledSlot = true;

                        return {
                          team,
                          count,
                          allowed,
                          isFilled: count >= allowed
                        };
                      });

                      return (
                        <tr key={prog.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {prog.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                                {fieldObj?.name || 'Foundational'}
                              </span>
                              <span>• Max: {prog.maxMarks || 10} pts</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              {prog.type} ({prog.defaultAllowedPerTeam}/team)
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[11px]">
                            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">{prog.time || '10:00 AM'}</div>
                            <div className="text-slate-500 font-sans text-[11px] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#0E7C86] shrink-0" />
                              <span className="font-medium text-slate-700 dark:text-slate-300">{prog.stage || 'Main Hall'}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(prog.assignedJudges || []).length > 0 ? (
                                prog.assignedJudges.map(jId => {
                                  const jObj = judges.find(x => x.id === jId);
                                  return (
                                    <span key={jId} className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 font-semibold text-[9px] inline-flex items-center gap-0.5" title={jObj?.name || jId}>
                                      <Gavel className="w-2.5 h-2.5" />
                                      <span className="truncate max-w-[85px]">{jObj?.name?.split(' ')[0] || jId}</span>
                                    </span>
                                  );
                                })
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProgram(prog)}
                                  className="text-[9px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 font-semibold hover:bg-amber-100 flex items-center gap-0.5"
                                >
                                  <Gavel className="w-2.5 h-2.5" />
                                  <span>+ Assign Judge</span>
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              {teamSlotBadges.map(({ team, count, allowed, isFilled }) => (
                                <span
                                  key={team.id}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                                    isFilled
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/80'
                                  }`}
                                  title={`${team.name}: ${count}/${allowed} registered`}
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                                  <span>{count}/{allowed}</span>
                                </span>
                              ))}
                            </div>
                            {hasUnfilledSlot && (
                              <div className="text-center text-[10px] text-amber-600 font-medium mt-1">
                                Unfilled team slots
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-sm text-[#0F2A4A] dark:text-white">
                            {progEntries.length}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProgram(prog)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                                title="Edit Event, Venue & Assign Judges"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#0E7C86]" />
                              </button>

                              <button
                                onClick={() => handleOpenParticipantModal(prog)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#0E7C86] hover:bg-[#14919D] text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                                title="Manage enrolled students"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Students</span>
                              </button>

                              <button
                                onClick={() => setCancellingProgram(prog)}
                                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition"
                                title="Delete Permanently from Summit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SECTION B: ALIYA CONSOLE & ASSIGNMENT MATRIX */}
      {activeSection === 'aliya' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>
                <strong>Aliya Rules:</strong> Programs are organized by field (Communicative, Creative, etc.). Teams do not necessarily have identical programs. Use the matrix below to assign programs and configure participant counts per team.
              </span>
            </div>
          </div>

          {/* VIEW B1: ASSIGNMENT MATRIX */}
          {aliyaViewMode === 'matrix' && (
            <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 min-w-[240px]">Program (Field)</th>
                      <th className="py-3.5 px-3 text-center">Type</th>
                      {teams.map(team => (
                        <th key={team.id} className="py-3.5 px-3 text-center min-w-[130px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                            <span>{team.name}</span>
                          </div>
                        </th>
                      ))}
                      <th className="py-3.5 px-4 text-center">Total Reg.</th>
                      <th className="py-3.5 px-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {sectionPrograms.length === 0 ? (
                      <tr>
                        <td colSpan={teams.length + 4} className="py-12 text-center text-slate-400">
                          No programs assigned to Aliya for this summit yet. Click &quot;Assign Program&quot; above to pick from library.
                        </td>
                      </tr>
                    ) : (
                      sectionPrograms.map(prog => {
                        const fieldObj = fields.find(f => f.id === prog.fieldId);
                        const progEntries = entries.filter(e => e.programId === prog.id);

                        return (
                          <tr key={prog.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            {/* Program Info */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white text-sm">
                                {prog.name}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center flex-wrap gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                                  {fieldObj?.name || 'General'}
                                </span>
                                <span>• {prog.time || '10:00 AM'}</span>
                                <span className="flex items-center gap-0.5 text-slate-500 font-medium">
                                  <MapPin className="w-2.5 h-2.5 text-[#0E7C86]" />
                                  <span>{prog.stage || 'Auditorium'}</span>
                                </span>
                              </div>
                              {/* Judges pill list */}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(prog.assignedJudges || []).length > 0 ? (
                                  prog.assignedJudges.map(jId => {
                                    const jObj = judges.find(x => x.id === jId);
                                    return (
                                      <span key={jId} className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 font-semibold text-[9px] inline-flex items-center gap-0.5" title={jObj?.name || jId}>
                                        <Gavel className="w-2.5 h-2.5" />
                                        <span className="truncate max-w-[85px]">{jObj?.name?.split(' ')[0] || jId}</span>
                                      </span>
                                    );
                                  })
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProgram(prog)}
                                    className="text-[9px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 font-semibold hover:bg-amber-100 flex items-center gap-0.5"
                                  >
                                    <Gavel className="w-2.5 h-2.5" />
                                    <span>+ Assign Judge</span>
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-3 text-center font-mono">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                                {prog.type}
                              </span>
                            </td>

                            {/* Team Columns (Assignment Toggle + Slot Limit) */}
                            {teams.map(team => {
                              const alloc = prog.teamAllocations?.[team.id] || { assigned: false, allowedCount: prog.defaultAllowedPerTeam || 1 };
                              const teamRegCount = progEntries.filter(e => e.teamId === team.id).length;
                              const isUnfilled = alloc.assigned && teamRegCount < alloc.allowedCount;

                              return (
                                <td key={team.id} className="py-3 px-3 text-center">
                                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                                    alloc.assigned
                                      ? isUnfilled
                                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/80'
                                        : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40'
                                      : 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent opacity-60'
                                  }`}>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={alloc.assigned}
                                        onChange={(e) => updateSummitProgramAllocation(
                                          prog.id,
                                          team.id,
                                          { assigned: e.target.checked, allowedCount: alloc.allowedCount },
                                          currentUser?.username
                                        )}
                                        className="rounded text-[#0E7C86] focus:ring-[#0E7C86]"
                                      />
                                      <span className="text-[11px] font-bold">
                                        {alloc.assigned ? 'Assigned' : 'Off'}
                                      </span>
                                    </label>

                                    {alloc.assigned && (
                                      <div className="flex items-center gap-1 text-[11px]">
                                        <input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={alloc.allowedCount}
                                          onChange={(e) => updateSummitProgramAllocation(
                                            prog.id,
                                            team.id,
                                            { assigned: true, allowedCount: e.target.value },
                                            currentUser?.username
                                          )}
                                          className="w-10 p-0.5 rounded border border-slate-300 dark:border-slate-700 text-center font-mono font-bold"
                                          title="Allowed participant slots"
                                        />
                                        <span className={`font-mono text-[10px] font-bold ${isUnfilled ? 'text-amber-600' : 'text-teal-600'}`}>
                                          ({teamRegCount}/{alloc.allowedCount})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}

                            {/* Total Registered */}
                            <td className="py-3 px-4 text-center font-mono font-bold text-sm text-[#0F2A4A] dark:text-white">
                              {progEntries.length}
                            </td>

                            {/* Quick Matrix Row Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditProgram(prog)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                                  title="Edit Event, Venue & Assign Judges"
                                >
                                  <Edit className="w-3.5 h-3.5 text-[#0E7C86]" />
                                </button>
                                <button
                                  onClick={() => bulkAssignSummitProgramToAllTeams(prog.id, prog.defaultAllowedPerTeam || 1, currentUser?.username)}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                  title="Assign to all 4 teams"
                                >
                                  All Teams
                                </button>
                                <button
                                  onClick={() => handleOpenParticipantModal(prog)}
                                  className="p-1.5 rounded-lg bg-[#0E7C86] hover:bg-[#14919D] text-white"
                                  title="Manage Students"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setCancellingProgram(prog)}
                                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition"
                                  title="Delete Permanently from Summit"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW B2: CARDS LIST */}
          {aliyaViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionPrograms.map(prog => {
                const progEntries = entries.filter(e => e.programId === prog.id);
                const fieldObj = fields.find(f => f.id === prog.fieldId);

                return (
                  <div
                    key={prog.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#334E73] dark:text-blue-300 font-mono">
                          {fieldObj?.name || 'Communicative / Creative'}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {progEntries.length} Participants
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {prog.name}
                      </h4>

                      <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
                        <span className="font-mono">{prog.time || '10:00 AM'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-[#0E7C86]" />
                          <span>{prog.stage || 'Auditorium'}</span>
                        </span>
                      </div>

                      {/* Evaluator Judges badges */}
                      <div className="flex items-center flex-wrap gap-1 pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Evaluators:</span>
                        {(prog.assignedJudges || []).length > 0 ? (
                          prog.assignedJudges.map(jId => {
                            const jObj = judges.find(x => x.id === jId);
                            return (
                              <span key={jId} className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 font-semibold text-[10px] inline-flex items-center gap-0.5">
                                <Gavel className="w-2.5 h-2.5" />
                                <span>{jObj?.name?.split(' ')[0] || jId}</span>
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold italic">No judge assigned</span>
                        )}
                      </div>

                      {/* Team breakdown */}
                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        {teams.map(t => {
                          const alloc = prog.teamAllocations?.[t.id];
                          const reg = progEntries.filter(e => e.teamId === t.id).length;

                          return (
                            <div key={t.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                                <span>{t.name}</span>
                              </span>
                              <span className="font-mono font-bold text-[11px]">
                                {alloc?.assigned ? `${reg}/${alloc.allowedCount}` : 'Not Assigned'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProgram(prog)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#0E7C86]" />
                          <span>Edit &amp; Judges</span>
                        </button>
                        <button
                          onClick={() => handleOpenParticipantModal(prog)}
                          className="px-3 py-1.5 rounded-xl bg-[#0E7C86] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Students</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setCancellingProgram(prog)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Permanently from Summit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD PROGRAM (FROM LIBRARY OR CUSTOM) */}
      {isAddProgramOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddProgramOpen(false)}
          title={`Assign Program to ${activeSummit.name}`}
          maxWidth="max-w-4xl"
        >
          <form onSubmit={handleAddProgramSubmit} className="space-y-5 text-xs">
            {/* Mode Switcher */}
            <div className="flex gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setAddMode('library')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm text-center transition flex items-center justify-center gap-2 ${
                  addMode === 'library'
                    ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#0E7C86]" />
                <span>Pick from Master Library ({availableLibraryPrograms.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMode('custom')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm text-center transition flex items-center justify-center gap-2 ${
                  addMode === 'custom'
                    ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Plus className="w-4 h-4 text-[#C9A227]" />
                <span>Create Custom Event</span>
              </button>
            </div>

            {addMode === 'library' ? (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Type Program Name to Search &amp; Auto-Select:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Showing <strong>{filteredLibraryPrograms.length}</strong> of {availableLibraryPrograms.length} programs
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={progSearchText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProgSearchText(val);
                        const q = val.toLowerCase().trim();
                        const firstMatch = availableLibraryPrograms.find(lp =>
                          lp.name.toLowerCase().includes(q)
                        );
                        if (firstMatch) {
                          setSelectedLibraryProgId(firstMatch.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredLibraryPrograms.length > 0) {
                            setSelectedLibraryProgId(filteredLibraryPrograms[0].id);
                          }
                        }
                      }}
                      placeholder="Start typing program name (press Enter or click to choose)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-[#0E7C86] focus:border-[#0E7C86]"
                      autoFocus
                    />
                  </div>
                </div>

                {selectedLibraryProgId && (
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Check className="w-4 h-4 text-[#0E7C86]" />
                      <span>Selected: {programLibrary.find(p => p.id === selectedLibraryProgId)?.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-200/50 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                      {programLibrary.find(p => p.id === selectedLibraryProgId)?.type} • {fields.find(f => f.id === programLibrary.find(p => p.id === selectedLibraryProgId)?.fieldId)?.name || 'General'}
                    </span>
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y bg-white dark:bg-slate-900">
                  {filteredLibraryPrograms.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic space-y-1">
                      <p className="font-semibold text-sm">No programs match &quot;{progSearchText}&quot;</p>
                      <p className="text-xs">Switch to &quot;Create Custom Event&quot; above to add a new event directly.</p>
                    </div>
                  ) : (
                    filteredLibraryPrograms.map(lp => {
                      const f = fields.find(x => x.id === lp.fieldId);
                      const isSelected = selectedLibraryProgId === lp.id;
                      return (
                        <label
                          key={lp.id}
                          className={`flex items-center justify-between p-3.5 cursor-pointer transition ${
                            isSelected ? 'bg-teal-50/90 dark:bg-teal-950/60 border-l-4 border-l-[#0E7C86]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="libraryProg"
                              checked={isSelected}
                              onChange={() => setSelectedLibraryProgId(lp.id)}
                              className="text-[#0E7C86] focus:ring-[#0E7C86] w-4 h-4"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm">{lp.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                <span className="font-medium text-[#0E7C86]">{f?.name || 'General'}</span>
                                <span>•</span>
                                <span className="capitalize">{lp.type}</span>
                                <span>•</span>
                                <span>{lp.defaultAllowedPerTeam} slot(s) per team</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Max: {lp.maxMarks || 10} pts
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Event Name</label>
                  <input
                    type="text"
                    required
                    value={newCustomProg.name}
                    onChange={(e) => setNewCustomProg(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    placeholder="e.g. Contemporary Research Symposium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Field</label>
                    <select
                      value={newCustomProg.fieldId}
                      onChange={(e) => setNewCustomProg(prev => ({ ...prev, fieldId: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      {fields.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Type</label>
                    <select
                      value={newCustomProg.type}
                      onChange={(e) => setNewCustomProg(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="individual">Individual</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Venue / Stage</label>
                    <input
                      type="text"
                      value={newCustomProg.stage}
                      onChange={(e) => setNewCustomProg(prev => ({ ...prev, stage: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Scheduled Time</label>
                    <input
                      type="text"
                      value={newCustomProg.time}
                      onChange={(e) => setNewCustomProg(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ALIYA HOUSE TEAM SELECTION */}
            {activeSection === 'aliya' && (
              <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-[#0F2A4A] dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0E7C86]" />
                    <span>Assign to House Teams (Aliya Section):</span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedAliyaTeamIds(teams.map(t => t.id))}
                      className="text-[#0E7C86] font-bold hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAliyaTeamIds([])}
                      className="text-slate-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {teams.map(t => {
                    const isChecked = selectedAliyaTeamIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                          isChecked
                            ? 'bg-white dark:bg-slate-900 border-[#0E7C86] shadow-xs'
                            : 'bg-slate-100/60 dark:bg-slate-800/40 border-transparent opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAliyaTeamIds(prev => [...prev, t.id]);
                            } else {
                              setSelectedAliyaTeamIds(prev => prev.filter(id => id !== t.id));
                            }
                          }}
                          className="rounded text-[#0E7C86] focus:ring-[#0E7C86]"
                        />
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{t.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Allowed Participant Slots per Selected Team:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={aliyaSlotCount}
                      onChange={(e) => setAliyaSlotCount(Math.max(1, Number(e.target.value) || 1))}
                      className="w-14 p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-center"
                    />
                    <span>participant(s)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Common Venue, Time, and Judges Assignment for Added Program */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Venue / Stage Assignment</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={addMode === 'custom' ? newCustomProg.stage : addVenue}
                    onChange={(e) => {
                      if (addMode === 'custom') {
                        setNewCustomProg(prev => ({ ...prev, stage: e.target.value }));
                      } else {
                        setAddVenue(e.target.value);
                      }
                    }}
                    placeholder="e.g. Auditorium Stage A, Seminar Room 1"
                    className="w-full p-2.5 pl-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Scheduled Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={addMode === 'custom' ? newCustomProg.time : addTime}
                    onChange={(e) => {
                      if (addMode === 'custom') {
                        setNewCustomProg(prev => ({ ...prev, time: e.target.value }));
                      } else {
                        setAddTime(e.target.value);
                      }
                    }}
                    placeholder="10:00 AM"
                    className="w-full p-2.5 pl-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            {/* Judges Selection */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Gavel className="w-4 h-4 text-[#0E7C86]" />
                  <span>Assign Evaluator Judges:</span>
                </label>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {addAssignedJudges.length} Selected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Select one or more collegiate judges who will evaluate student performances in this event:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 max-h-48 overflow-y-auto">
                {judges.map(j => {
                  const isChecked = addAssignedJudges.includes(j.id);
                  return (
                    <label
                      key={j.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        isChecked
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 text-[#0F2A4A] dark:text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleJudgeSelection(j.id, false)}
                        className="rounded text-[#0E7C86] focus:ring-[#0E7C86] w-4 h-4"
                      />
                      <div className="truncate">
                        <div className="font-bold truncate text-xs">{j.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{j.username}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddProgramOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0E7C86] hover:bg-[#14919D] text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Assign Program to Summit</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: EDIT PROGRAM, VENUE & ASSIGN JUDGES */}
      {editingProgram && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProgram(null)}
          title={`Edit Event & Assign Judges: ${editingProgram.name}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveEditProgram} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Program / Event Name</label>
              <input
                type="text"
                required
                value={editProgForm.name}
                onChange={(e) => setEditProgForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Venue / Stage Assignment</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editProgForm.stage}
                    onChange={(e) => setEditProgForm(prev => ({ ...prev, stage: e.target.value }))}
                    placeholder="e.g. Auditorium Stage A, Seminar Room 1"
                    className="w-full p-2.5 pl-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Scheduled Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editProgForm.time}
                    onChange={(e) => setEditProgForm(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="10:00 AM"
                    className="w-full p-2.5 pl-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Max Marks (Points)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editProgForm.maxMarks}
                  onChange={(e) => setEditProgForm(prev => ({ ...prev, maxMarks: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Allowed Slots / Team</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editProgForm.defaultAllowedPerTeam}
                  onChange={(e) => setEditProgForm(prev => ({ ...prev, defaultAllowedPerTeam: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            {/* ASSIGN JUDGES CHECKBOX LIST */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-[#0E7C86]" />
                  <span>Assign Program Evaluators / Judges:</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {editProgForm.assignedJudges.length} Selected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Judges can be different for each program. Check the judges who will mark this specific event.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto">
                {judges.map(judge => {
                  const isChecked = editProgForm.assignedJudges.includes(judge.id);
                  return (
                    <label
                      key={judge.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        isChecked
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-[#0F2A4A] dark:text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleJudgeSelection(judge.id, true)}
                        className="rounded text-[#0E7C86] focus:ring-[#0E7C86] w-4 h-4"
                      />
                      <div className="truncate text-xs">
                        <div className="font-bold truncate">{judge.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{judge.username}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProgram(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white rounded-xl font-semibold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: COPY SUMMIT SETUP */}
      {isCopyModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCopyModalOpen(false)}
          title={`Copy Program Setup to ${activeSummit.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Select an existing summit to clone all its configured program library events, participant slot limits, and team assignment matrices into <strong>{activeSummit.name}</strong>.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Source Summit to Copy From:
              </label>
              <select
                value={sourceSummitId}
                onChange={(e) => setSourceSummitId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                {summits.filter(s => s.id !== selectedSummitId).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.month})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
              >
                Clone Setup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: STUDENT ENROLMENT / NOMINATION MANAGER */}
      {managingProgram && (
        <Modal
          isOpen={true}
          onClose={() => setManagingProgram(null)}
          title={`Enrol Participants: ${managingProgram.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">
                  {managingProgram.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  Section: <strong className="text-[#0E7C86]">{managingProgram.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'}</strong> • Type: {managingProgram.type}
                </span>
              </div>

              {/* Team Selector */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Managing House:</span>
                <select
                  value={managingTeamId}
                  onChange={(e) => {
                    setManagingTeamId(e.target.value);
                    setAssignError('');
                  }}
                  className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {assignError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            {/* Existing Entries for this Team */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Current Enrolled Participants for {teams.find(t => t.id === managingTeamId)?.name}</span>
                <span className="font-mono text-slate-400">
                  Slots: {entries.filter(e => e.programId === managingProgram.id && e.teamId === managingTeamId).length} / {managingProgram.teamAllocations?.[managingTeamId]?.allowedCount ?? (managingProgram.defaultAllowedPerTeam || 1)}
                </span>
              </h5>

              <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y">
                {entries.filter(e => e.programId === managingProgram.id && e.teamId === managingTeamId).length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No participants enrolled for this team yet.
                  </div>
                ) : (
                  entries.filter(e => e.programId === managingProgram.id && e.teamId === managingTeamId).map(entry => {
                    const st = students.find(s => s.id === entry.studentId);
                    return (
                      <div key={entry.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {entry.groupName || st?.name} ({entry.chestNo})
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {entry.memberIds ? `${entry.memberIds.length} members` : st?.cicNo}
                          </div>
                        </div>

                        <button
                          onClick={() => removeStudentEntry(entry.id, currentUser?.username)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add New Participant Form */}
            <form onSubmit={handleAddParticipantSubmit} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white">
                Enrol / Nominate New Participant
              </h5>

              {managingProgram.type === 'group' ? (
                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold mb-1">Group Ensemble Name</label>
                    <input
                      type="text"
                      value={groupNameInput}
                      onChange={(e) => setGroupNameInput(e.target.value)}
                      placeholder="e.g. Al-Bayan Senior Debaters"
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Select Group Members (Only {managingProgram.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'} Students from {teams.find(t => t.id === managingTeamId)?.name}):</label>
                    <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y">
                      {students.filter(s => s.teamId === managingTeamId && (managingProgram.sectionId === 'both' || s.sectionId === managingProgram.sectionId)).map(st => {
                        const isChecked = selectedGroupMemberIds.includes(st.id);
                        return (
                          <label key={st.id} className="p-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {st.name} ({st.chestNo})
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedGroupMemberIds(prev => [...prev, st.id]);
                                else setSelectedGroupMemberIds(prev => prev.filter(x => x !== st.id));
                              }}
                              className="rounded text-[#0E7C86] focus:ring-[#0E7C86]"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold mb-1">
                    Select Eligible Student ({managingProgram.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'} Section):
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="">-- Choose Student --</option>
                    {students
                      .filter(s => s.teamId === managingTeamId && (managingProgram.sectionId === 'both' || s.sectionId === managingProgram.sectionId))
                      .map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.chestNo} • {st.cicNo})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl transition"
              >
                Confirm Participant Enrolment
              </button>
            </form>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE PROGRAM FROM SUMMIT */}
      {cancellingProgram && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Program Permanently from Summit"
          message={`Are you sure you want to permanently delete "${cancellingProgram.name}" from ${activeSummit.name}? All student participant registrations for this program will be removed.`}
          confirmLabel="Delete Permanently"
          isDestructive={true}
          onConfirm={() => {
            cancelProgram(cancellingProgram.id, currentUser?.username);
            setCancellingProgram(null);
          }}
          onClose={() => setCancellingProgram(null)}
        />
      )}
    </div>
  );
};
