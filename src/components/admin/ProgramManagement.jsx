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
  ArrowLeft,
  Sliders,
  Check,
  UserCheck,
  Edit,
  Gavel,
  Search,
  Trash2,
  CheckSquare,
  Square,
  Filter,
  X,
  Sparkles
} from 'lucide-react';

export const ProgramManagement = () => {
  const {
    summits = [],
    sections = [],
    fields = [],
    programLibrary = [],
    programs = [],
    entries = [],
    students = [],
    teams = [],
    judges = [],
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
  const { t, lang, tr } = useLanguage();

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

  // Add Program View State
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [addMode, setAddMode] = useState('library'); // 'library' or 'custom'
  const [progSearchText, setProgSearchText] = useState('');
  const [addVenue, setAddVenue] = useState('Auditorium Stage');
  const [addTime, setAddTime] = useState('10:00 AM');
  const [addAssignedJudges, setAddAssignedJudges] = useState([]);

  // Target Team Radio Selection (one team at a time, default to first team)
  const [assignTargetTeamId, setAssignTargetTeamId] = useState(teams[0]?.id || 'team_a');

  // Skill-based list filter & multi-selection
  const [selectedSkillFieldId, setSelectedSkillFieldId] = useState('all');
  const [assignSectionFilter, setAssignSectionFilter] = useState('all'); // 'all', 'thamheediyya', 'aliya'
  const [selectedSkillProgIds, setSelectedSkillProgIds] = useState([]);
  const [assignSlotCount, setAssignSlotCount] = useState(1);
  const [assignedSideSearch, setAssignedSideSearch] = useState('');
  const [assignToast, setAssignToast] = useState('');
  const [isCustomEventModalOpen, setIsCustomEventModalOpen] = useState(false);

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

  // Active selected target team (for Radio Selection)
  const selectedTargetTeam = useMemo(() => {
    return teams.find(t => t.id === assignTargetTeamId) || teams[0];
  }, [teams, assignTargetTeamId]);

  // Total assigned count per team (for radio card live badges)
  const teamAssignedCounts = useMemo(() => {
    const counts = {};
    teams.forEach(t => {
      counts[t.id] = currentSummitPrograms.filter(p => p.teamAllocations?.[t.id]?.assigned === true).length;
    });
    return counts;
  }, [currentSummitPrograms, teams]);

  // Skill program counts for filter pills
  const skillCounts = useMemo(() => {
    const counts = { all: 0 };
    fields.forEach(f => { counts[f.id] = 0; });
    programLibrary.forEach(lp => {
      if (assignSectionFilter !== 'all' && lp.sectionId !== assignSectionFilter && lp.sectionId !== 'both') {
        return;
      }
      counts.all = (counts.all || 0) + 1;
      if (lp.fieldId) {
        counts[lp.fieldId] = (counts[lp.fieldId] || 0) + 1;
      }
    });
    return counts;
  }, [programLibrary, fields, assignSectionFilter]);

  // Filtered programs for skill-based list
  const skillFilteredPrograms = useMemo(() => {
    return programLibrary.filter(lp => {
      if (assignSectionFilter !== 'all' && lp.sectionId !== assignSectionFilter && lp.sectionId !== 'both') {
        return false;
      }
      if (selectedSkillFieldId !== 'all' && lp.fieldId !== selectedSkillFieldId) {
        return false;
      }
      if (progSearchText.trim()) {
        const q = progSearchText.toLowerCase().trim();
        const fName = (fields.find(f => f.id === lp.fieldId)?.name || '').toLowerCase();
        return lp.name.toLowerCase().includes(q) || fName.includes(q);
      }
      return true;
    });
  }, [programLibrary, assignSectionFilter, selectedSkillFieldId, progSearchText, fields]);

  // Assigned programs to currently selected target team
  const assignedProgramsToTargetTeam = useMemo(() => {
    if (!selectedTargetTeam) return [];
    return currentSummitPrograms.filter(prog => {
      const isAssigned = prog.teamAllocations?.[selectedTargetTeam.id]?.assigned === true;
      if (!isAssigned) return false;
      if (assignedSideSearch.trim()) {
        const q = assignedSideSearch.toLowerCase().trim();
        const fName = (fields.find(f => f.id === prog.fieldId)?.name || '').toLowerCase();
        return prog.name.toLowerCase().includes(q) || fName.includes(q);
      }
      return true;
    });
  }, [currentSummitPrograms, selectedTargetTeam, assignedSideSearch, fields]);

  // Helper: check status of a library program for selectedTargetTeam
  const getLibProgTargetStatus = (libProg) => {
    if (!selectedTargetTeam) return { isAssigned: false, summitProg: null, allowedSlots: 1 };
    const existing = currentSummitPrograms.find(
      p => p.libraryProgramId === libProg.id || (p.name.toLowerCase() === libProg.name.toLowerCase() && (p.sectionId === libProg.sectionId || p.sectionId === 'both'))
    );
    if (!existing) return { isAssigned: false, summitProg: null, allowedSlots: 1 };
    const alloc = existing.teamAllocations?.[selectedTargetTeam.id];
    return {
      isAssigned: alloc?.assigned === true,
      summitProg: existing,
      allowedSlots: alloc?.allowedCount || existing.defaultAllowedPerTeam || 1
    };
  };

  // Toggle multi-select program
  const toggleSelectSkillProg = (progId) => {
    setSelectedSkillProgIds(prev =>
      prev.includes(progId) ? prev.filter(id => id !== progId) : [...prev, progId]
    );
  };

  // Select all visible skill programs
  const selectAllVisibleSkillProgs = () => {
    const ids = skillFilteredPrograms.map(p => p.id);
    setSelectedSkillProgIds(ids);
  };

  // Clear selected
  const clearSelectedSkillProgs = () => {
    setSelectedSkillProgIds([]);
  };

  // Assign all selected to target team
  const handleAssignSelectedToTargetTeam = () => {
    if (selectedSkillProgIds.length === 0 || !selectedTargetTeam) return;
    const targetTeamId = selectedTargetTeam.id;
    let count = 0;

    selectedSkillProgIds.forEach(libProgId => {
      const libProg = programLibrary.find(lp => lp.id === libProgId);
      if (!libProg) return;

      const existingProg = currentSummitPrograms.find(
        p => p.libraryProgramId === libProg.id || (p.name.toLowerCase() === libProg.name.toLowerCase() && (p.sectionId === libProg.sectionId || p.sectionId === 'both'))
      );

      if (existingProg) {
        updateSummitProgramAllocation(
          existingProg.id,
          targetTeamId,
          { assigned: true, allowedCount: Number(assignSlotCount) || 1 },
          currentUser?.username
        );
      } else {
        const teamAllocations = {};
        teams.forEach(t => {
          teamAllocations[t.id] = {
            assigned: t.id === targetTeamId,
            allowedCount: Number(assignSlotCount) || 1
          };
        });
        assignProgramToSummit(selectedSummitId, {
          libraryProgramId: libProg.id,
          name: libProg.name,
          fieldId: libProg.fieldId,
          sectionId: libProg.sectionId || (assignSectionFilter !== 'all' ? assignSectionFilter : 'thamheediyya'),
          type: libProg.type,
          maxMarks: libProg.maxMarks || 10,
          defaultAllowedPerTeam: Number(assignSlotCount) || libProg.defaultAllowedPerTeam || 1,
          stage: addVenue || 'Auditorium Stage',
          date: activeSummit?.date,
          time: addTime || '10:00 AM',
          assignedJudges: addAssignedJudges,
          teamAllocations,
          allowLeaderMarkEntry: false
        }, currentUser?.username);
      }
      count++;
    });

    setAssignToast(`Successfully assigned ${count} program(s) to ${selectedTargetTeam.name}!`);
    setSelectedSkillProgIds([]);
    setTimeout(() => setAssignToast(''), 3500);
  };

  // Quick single program toggle (assign or unassign)
  const handleToggleSingleProgramAssign = (libProg) => {
    if (!selectedTargetTeam) return;
    const targetTeamId = selectedTargetTeam.id;
    const status = getLibProgTargetStatus(libProg);

    if (status.isAssigned && status.summitProg) {
      updateSummitProgramAllocation(
        status.summitProg.id,
        targetTeamId,
        { assigned: false, allowedCount: 0 },
        currentUser?.username
      );
      setAssignToast(`Removed "${libProg.name}" from ${selectedTargetTeam.name}.`);
    } else if (status.summitProg) {
      updateSummitProgramAllocation(
        status.summitProg.id,
        targetTeamId,
        { assigned: true, allowedCount: Number(assignSlotCount) || 1 },
        currentUser?.username
      );
      setAssignToast(`Assigned "${libProg.name}" to ${selectedTargetTeam.name}!`);
    } else {
      const teamAllocations = {};
      teams.forEach(t => {
        teamAllocations[t.id] = {
          assigned: t.id === targetTeamId,
          allowedCount: Number(assignSlotCount) || 1
        };
      });
      assignProgramToSummit(selectedSummitId, {
        libraryProgramId: libProg.id,
        name: libProg.name,
        fieldId: libProg.fieldId,
        sectionId: libProg.sectionId || (assignSectionFilter !== 'all' ? assignSectionFilter : 'thamheediyya'),
        type: libProg.type,
        maxMarks: libProg.maxMarks || 10,
        defaultAllowedPerTeam: Number(assignSlotCount) || libProg.defaultAllowedPerTeam || 1,
        stage: addVenue || 'Auditorium Stage',
        date: activeSummit?.date,
        time: addTime || '10:00 AM',
        assignedJudges: addAssignedJudges,
        teamAllocations,
        allowLeaderMarkEntry: false
      }, currentUser?.username);
      setAssignToast(`Assigned "${libProg.name}" to ${selectedTargetTeam.name}!`);
    }
    setTimeout(() => setAssignToast(''), 3000);
  };

  // Unassign from side panel
  const handleUnassignFromTargetTeam = (summitProgId, progName) => {
    if (!selectedTargetTeam) return;
    updateSummitProgramAllocation(
      summitProgId,
      selectedTargetTeam.id,
      { assigned: false, allowedCount: 0 },
      currentUser?.username
    );
    setAssignToast(`Removed "${progName}" from ${selectedTargetTeam.name}.`);
    setTimeout(() => setAssignToast(''), 3000);
  };

  // Add custom program and assign to selectedTargetTeam
  const handleAddCustomProgramSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newCustomProg.name.trim() || !selectedTargetTeam) return;

    const teamAllocations = {};
    teams.forEach(t => {
      teamAllocations[t.id] = {
        assigned: t.id === selectedTargetTeam.id,
        allowedCount: Number(newCustomProg.defaultAllowedPerTeam) || 1
      };
    });

    assignProgramToSummit(selectedSummitId, {
      ...newCustomProg,
      stage: newCustomProg.stage || 'Auditorium Stage',
      time: newCustomProg.time || '10:00 AM',
      assignedJudges: addAssignedJudges,
      sectionId: newCustomProg.sectionId || (assignSectionFilter !== 'all' ? assignSectionFilter : 'thamheediyya'),
      date: activeSummit?.date,
      defaultAllowedPerTeam: Number(newCustomProg.defaultAllowedPerTeam) || 1,
      teamAllocations
    }, currentUser?.username);

    setAssignToast(`Created and assigned "${newCustomProg.name}" to ${selectedTargetTeam.name}!`);
    setIsCustomEventModalOpen(false);
    setNewCustomProg({
      name: '',
      fieldId: fields[0]?.id || '',
      sectionId: 'thamheediyya',
      type: 'individual',
      stage: 'Auditorium Stage',
      time: '10:00 AM',
      defaultAllowedPerTeam: 1,
      allowLeaderMarkEntry: false
    });
    setTimeout(() => setAssignToast(''), 3500);
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

  // REDESIGNED SKILL-BASED ASSIGN VIEW WITH RADIO TEAMS & ASSIGNED SIDE PANEL
  if (isAddProgramOpen) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Toast Notification Banner */}
        {assignToast && (
          <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200 flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{assignToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setAssignToast('')}
              className="p-1 hover:bg-teal-100 dark:hover:bg-teal-900 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddProgramOpen(false);
                setProgSearchText('');
                setSelectedSkillProgIds([]);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-2 font-bold text-xs"
              title="Back to Programs List"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Programs</span>
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F2A4A] dark:text-white">
                  Assign Programs to {activeSummit?.name || 'Summit'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] border border-teal-200 dark:border-teal-900">
                  Skill-Based Catalog
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a target house team, filter events by skill, check desired events, and assign with live side panel view.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsCustomEventModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>+ Create Custom Event</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddProgramOpen(false);
                setProgSearchText('');
                setSelectedSkillProgIds([]);
              }}
              className="px-5 py-2.5 bg-[#0F2A4A] hover:bg-[#1E3A5F] dark:bg-[#0E7C86] dark:hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </div>

        {/* 1. TARGET TEAMS: RADIO BUTTON SELECTION (ONE AT A TIME) */}
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border-2 border-teal-500/30 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0E7C86]" />
                <span>{tr('Assign to House Teams (Target Teams):', 'ഹൗസ് ടീമുകൾക്ക് നൽകുക:')}</span>
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                  (Select one team at a time)
                </span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current selected team: <strong className="text-[#0E7C86] font-bold">{selectedTargetTeam?.name || 'None'}</strong>. Program list and side panel show allocations for this team.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Total {teams.length} Teams
            </div>
          </div>

          {/* Grid of Team Radio Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
            {teams.map(t => {
              const isSelected = selectedTargetTeam?.id === t.id;
              const count = teamAssignedCounts[t.id] || 0;
              return (
                <label
                  key={t.id}
                  onClick={() => setAssignTargetTeamId(t.id)}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-2.5 cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-teal-50/90 dark:bg-teal-950/50 border-[#0E7C86] shadow-sm ring-2 ring-[#0E7C86]/30'
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="radio"
                      name="assignTargetTeamRadio"
                      checked={isSelected}
                      onChange={() => setAssignTargetTeamId(t.id)}
                      className="w-4 h-4 text-[#0E7C86] focus:ring-[#0E7C86] border-slate-300"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: t.color || '#0E7C86' }}
                    />
                    <div className="truncate">
                      <span className={`font-bold text-xs truncate block ${isSelected ? 'text-[#0F2A4A] dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {t.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isSelected ? 'Active Team' : 'Click to select'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    count > 0
                      ? 'bg-teal-100 dark:bg-teal-900/60 text-[#0E7C86] dark:text-teal-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {count} Assigned
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. TWO-COLUMN LAYOUT: (LEFT) SKILL-BASED PROGRAM LIST & (RIGHT) ASSIGNED SIDE PANEL */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT: SKILL-BASED PROGRAM CATALOG & BULK ASSIGN CONTROLS */}
          <div className="flex-1 w-full min-w-0 space-y-4">
            <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
              {/* Header Filters: Division & Skill Pills */}
              <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                {/* Division Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                    <span className="font-semibold text-slate-500 pl-2 pr-1">Division:</span>
                    <button
                      type="button"
                      onClick={() => setAssignSectionFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        assignSectionFilter === 'all'
                          ? 'bg-[#0F2A4A] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      All Divisions
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignSectionFilter('thamheediyya')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        assignSectionFilter === 'thamheediyya'
                          ? 'bg-[#0F2A4A] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Thamheediyya
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignSectionFilter('aliya')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        assignSectionFilter === 'aliya'
                          ? 'bg-[#0F2A4A] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Aliya
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    Showing <strong>{skillFilteredPrograms.length}</strong> programs
                  </span>
                </div>

                {/* Skill / Field Filter Pills */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>Filter by Skill / Field:</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedSkillFieldId('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                        selectedSkillFieldId === 'all'
                          ? 'bg-[#0E7C86] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <span>All Skills</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedSkillFieldId === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {skillCounts.all || 0}
                      </span>
                    </button>
                    {fields.map(f => {
                      const count = skillCounts[f.id] || 0;
                      const isSelected = selectedSkillFieldId === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedSkillFieldId(f.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#0E7C86] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{f.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Search & Bulk Assign Control Toolbar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={progSearchText}
                    onChange={(e) => setProgSearchText(e.target.value)}
                    placeholder="Search program by name or keyword..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-[#0E7C86]"
                  />
                  {progSearchText && (
                    <button
                      type="button"
                      onClick={() => setProgSearchText('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Batch Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllVisibleSkillProgs}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>Select All Visible</span>
                    </button>
                    {selectedSkillProgIds.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSelectedSkillProgs}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Clear ({selectedSkillProgIds.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Slots:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={assignSlotCount}
                        onChange={(e) => setAssignSlotCount(Math.max(1, Number(e.target.value) || 1))}
                        className="w-14 p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-center text-xs text-[#0E7C86]"
                        title="Allowed participant quota for this team"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={selectedSkillProgIds.length === 0}
                      onClick={handleAssignSelectedToTargetTeam}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2 ${
                        selectedSkillProgIds.length > 0
                          ? 'bg-[#0E7C86] hover:bg-[#14919D] text-white active:scale-95'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Assign {selectedSkillProgIds.length > 0 ? selectedSkillProgIds.length : ''} to {selectedTargetTeam?.name || 'Selected Team'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Program Cards Grid */}
              <div className="space-y-2.5 pt-1">
                {skillFilteredPrograms.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-xs">No programs found for current skill and filters.</p>
                    <button
                      type="button"
                      onClick={() => setIsCustomEventModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#0E7C86] text-white font-bold text-xs"
                    >
                      + Create Custom Program
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
                    {skillFilteredPrograms.map(lp => {
                      const status = getLibProgTargetStatus(lp);
                      const isSelected = selectedSkillProgIds.includes(lp.id);
                      const fieldObj = fields.find(f => f.id === lp.fieldId);

                      return (
                        <div
                          key={lp.id}
                          className={`p-3.5 rounded-xl border transition flex flex-col justify-between gap-3 ${
                            status.isAssigned
                              ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-300/60 dark:border-teal-900/40'
                              : isSelected
                              ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800'
                              : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectSkillProg(lp.id)}
                              className="mt-1 rounded text-[#0E7C86] focus:ring-[#0E7C86] w-4 h-4 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                                {lp.name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {fieldObj?.name || 'General'}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono capitalize bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                                  {lp.type}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-[#0E7C86]">
                                  {lp.sectionId === 'aliya' ? 'Aliya' : lp.sectionId === 'thamheediyya' ? 'Thamheediyya' : 'All Sections'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status and Action Buttons */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                            {status.isAssigned ? (
                              <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Assigned ({status.allowedSlots} slot)</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Not assigned to {selectedTargetTeam?.name}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleSingleProgramAssign(lp)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                status.isAssigned
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                  : 'bg-[#0E7C86] hover:bg-[#14919D] text-white shadow-2xs'
                              }`}
                            >
                              {status.isAssigned ? 'Unassign' : '+ Assign'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: DEDICATED SIDE PANEL - ASSIGNED LIST FOR CURRENTLY SELECTED TARGET TEAM */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 sticky top-20 space-y-3">
            <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border-2 border-teal-500/40 p-4 sm:p-5 shadow-xs space-y-3.5">
              {/* Side Panel Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: selectedTargetTeam?.color || '#0E7C86' }}
                  />
                  <div className="truncate">
                    <h3 className="font-bold text-xs text-[#0F2A4A] dark:text-white truncate">
                      {selectedTargetTeam?.name} Assigned Events
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Target Team Live List
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-100 dark:bg-teal-900/60 text-[#0E7C86] dark:text-teal-300 shrink-0">
                  {assignedProgramsToTargetTeam.length}
                </span>
              </div>

              {/* Search Inside Assigned List */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={assignedSideSearch}
                  onChange={(e) => setAssignedSideSearch(e.target.value)}
                  placeholder="Filter assigned events..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-[#0E7C86]"
                />
                {assignedSideSearch && (
                  <button
                    type="button"
                    onClick={() => setAssignedSideSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Scrollable Assigned List */}
              <div className="max-h-[calc(100vh-320px)] min-h-[220px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {assignedProgramsToTargetTeam.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <BookOpen className="w-7 h-7 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      No events assigned to {selectedTargetTeam?.name} yet.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Select programs from the skill list on the left and click &apos;Assign to {selectedTargetTeam?.name}&apos;.
                    </p>
                  </div>
                ) : (
                  assignedProgramsToTargetTeam.map(prog => {
                    const fieldObj = fields.find(f => f.id === prog.fieldId);
                    const slotCount = prog.teamAllocations?.[selectedTargetTeam?.id]?.allowedCount ?? (prog.defaultAllowedPerTeam || 1);

                    return (
                      <div
                        key={prog.id}
                        className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5 group"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {prog.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <span className="font-medium text-[#0E7C86]">
                              {fieldObj?.name || 'General'}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{prog.type}</span>
                            <span>•</span>
                            <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                              {slotCount} slot(s)
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnassignFromTargetTeam(prog.id, prog.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                          title={`Unassign "${prog.name}" from ${selectedTargetTeam?.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Side Panel Footer Note */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total: <strong>{assignedProgramsToTargetTeam.length}</strong> event(s)</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">Auto-saved to Cloud</span>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOM EVENT MODAL */}
        <Modal
          isOpen={isCustomEventModalOpen}
          onClose={() => setIsCustomEventModalOpen(false)}
          title={`Create Custom Event for ${selectedTargetTeam?.name || 'Team'}`}
        >
          <form onSubmit={handleAddCustomProgramSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1.5 text-xs text-slate-800 dark:text-slate-200">
                Event / Program Name
              </label>
              <input
                type="text"
                required
                value={newCustomProg.name}
                onChange={(e) => setNewCustomProg(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs focus:ring-2 focus:ring-[#0E7C86]"
                placeholder="e.g. Arabic Debating Championship"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Field / Skill</label>
                <select
                  value={newCustomProg.fieldId}
                  onChange={(e) => setNewCustomProg(prev => ({ ...prev, fieldId: e.target.value }))}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Type</label>
                <select
                  value={newCustomProg.type}
                  onChange={(e) => setNewCustomProg(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Division</label>
                <select
                  value={newCustomProg.sectionId}
                  onChange={(e) => setNewCustomProg(prev => ({ ...prev, sectionId: e.target.value }))}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                >
                  <option value="thamheediyya">Thamheediyya</option>
                  <option value="aliya">Aliya</option>
                  <option value="both">Both Sections</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Allowed Quota / Slots</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newCustomProg.defaultAllowedPerTeam}
                  onChange={(e) => setNewCustomProg(prev => ({ ...prev, defaultAllowedPerTeam: Number(e.target.value) || 1 }))}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[11px] text-teal-800 dark:text-teal-300">
              This event will be registered into <strong>{activeSummit?.name}</strong> and allocated to <strong className="underline">{selectedTargetTeam?.name}</strong> with {newCustomProg.defaultAllowedPerTeam} slot(s).
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustomEventModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white font-bold text-xs shadow-xs"
              >
                Create &amp; Assign Event
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  if (!activeSummit) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] flex items-center justify-center mx-auto shadow-xs">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white">
            No Active Summits Scheduled
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no summits scheduled. Go to the Summits &amp; Sessions page to schedule a summit before assigning programs.
          </p>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center gap-3 w-full">
            <select
              value={selectedSummitId}
              onChange={(e) => setSelectedSummitId(e.target.value)}
              className="w-full text-base sm:text-lg font-bold text-[#0F2A4A] dark:text-white bg-transparent border-b-2 border-[#0E7C86] pb-1 focus:outline-none cursor-pointer"
            >
              {summits.map(s => (
                <option key={s.id} value={s.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-semibold text-xs sm:text-sm">
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

        {/* Header Action Buttons: Responsive 2-col on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
          <button
            onClick={() => toggleSummitRegistrationLock(activeSummit.id, !activeSummit.registrationLocked, currentUser?.username)}
            className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
              activeSummit.registrationLocked
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {activeSummit.registrationLocked ? <Lock className="w-4 h-4 text-rose-600 shrink-0" /> : <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span className="truncate">{activeSummit.registrationLocked ? 'Unlock Registrations' : 'Lock Registrations'}</span>
          </button>

          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            title="Copy program setup from another summit"
          >
            <Copy className="w-4 h-4 text-[#0E7C86] shrink-0" />
            <span>Copy Setup...</span>
          </button>

          <button
            onClick={() => {
              setAddMode(programLibrary.length > 0 ? 'library' : 'custom');
              setIsAddProgramOpen(true);
            }}
            className="col-span-2 sm:col-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-[#0E7C86] hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Assign Program</span>
          </button>
        </div>
      </div>

      {/* 2. Section Tabs: Thamheediyya vs Aliya */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('thamheediyya')}
            className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
              activeSection === 'thamheediyya'
                ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-[#0E7C86] dark:text-teal-200 shrink-0" />
            <span className="truncate">Thamheediyya (1 &amp; 2)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono shrink-0">
              {currentSummitPrograms.filter(p => p.sectionId === 'thamheediyya').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('aliya')}
            className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
              activeSection === 'aliya'
                ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span className="truncate">Aliya (3, 4 &amp; 5)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono shrink-0">
              {currentSummitPrograms.filter(p => p.sectionId === 'aliya').length}
            </span>
          </button>
        </div>

        {/* If Aliya, show Toggle between Matrix view and Cards view */}
        {activeSection === 'aliya' && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs self-end sm:self-auto">
            <button
              onClick={() => setAliyaViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                aliyaViewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-[#0E7C86]" />
              <span>Matrix</span>
            </button>
            <button
              onClick={() => setAliyaViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                aliyaViewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Cards</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. SECTION A: THAMHEEDIYYA CONSOLE */}
      {activeSection === 'thamheediyya' && (
        <div className="space-y-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0E7C86] shrink-0 mt-0.5" />
              <span>
                <strong>Thamheediyya Rule:</strong> All programs assigned to this summit are automatically applied to <strong>all teams</strong>. Admin can adjust slot limits per team if required.
              </span>
            </div>
            <span className="font-mono font-bold text-xs shrink-0 self-end sm:self-auto px-2 py-0.5 rounded-md bg-teal-100/70 dark:bg-teal-900/40 text-[#0E7C86]">
              {sectionPrograms.length} Common Programs
            </span>
          </div>

          {sectionPrograms.length === 0 ? (
            <div className="p-6 sm:p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2.5">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300">No programs assigned to Thamheediyya in this summit yet.</p>
              <button
                onClick={() => {
                  setAddMode(programLibrary.length > 0 ? 'library' : 'custom');
                  setIsAddProgramOpen(true);
                }}
                className="min-h-[44px] px-5 py-2.5 bg-[#0F2A4A] dark:bg-[#0E7C86] hover:bg-[#1E3A5F] text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
              >
                {programLibrary.length > 0 ? 'Pick from Program Library' : 'Create & Assign Program'}
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
                            {entry.groupName || st?.name}
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
                      placeholder="e.g. Team A Senior Debaters"
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
                              {st.name}
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
                          {st.name} ({st.cicNo})
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
