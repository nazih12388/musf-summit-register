import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Shield,
  Layers,
  Edit2,
  Trash2,
  Plus,
  ArrowRightLeft,
  Users,
  Palette,
  AlertCircle,
  GraduationCap,
  Building,
  Crown,
  KeyRound,
  UserCheck,
  Search,
  Check,
  UserPlus,
  UserMinus,
  Printer,
  Calendar,
  Award,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';

export const TeamAndClassManagement = () => {
  const {
    sections,
    classes,
    teams,
    students,
    summits,
    programs,
    entries,
    marks,
    settings,
    updateSection,
    addClass,
    updateClass,
    deleteClass,
    addTeam,
    updateTeam,
    deleteTeam,
    bulkAssignTeams,
    appointTeamLeader,
    updateStudent,
    nominateStudentForProgram,
    removeStudentEntry,
    updateSummitProgramAllocation
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Navigation Sub-tabs: 'teams' | 'summit_assignments' | 'classes'
  const [activeSubTab, setActiveSubTab] = useState('teams');

  // =========================================================================
  // SUMMIT ASSIGNMENTS & PER-TEAM PRINT STATE
  // =========================================================================
  const [selectedSummitId, setSelectedSummitId] = useState(() => summits[0]?.id || '');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [printingTeamData, setPrintingTeamData] = useState(null); // { team, summit }
  const [nominateModalData, setNominateModalData] = useState(null); // { program, team }
  const [nominateStudentId, setNominateStudentId] = useState('');
  const [nominateError, setNominateError] = useState('');
  const [nominateSuccess, setNominateSuccess] = useState('');

  // Active Summit object
  const activeSummit = summits.find(s => s.id === selectedSummitId) || summits[0];

  // =========================================================================
  // LEADER APPOINT MODAL STATE
  // =========================================================================
  const [leaderModalTeam, setLeaderModalTeam] = useState(null);
  const [leaderModalRole, setLeaderModalRole] = useState('leader1');
  const [leaderStudentId, setLeaderStudentId] = useState('');
  const [leaderUsernameInput, setLeaderUsernameInput] = useState('');
  const [leaderPasswordInput, setLeaderPasswordInput] = useState('leader123');
  const [leaderSectionInput, setLeaderSectionInput] = useState('all');
  const [leaderSuccessMsg, setLeaderSuccessMsg] = useState('');

  const openAppointLeaderModal = (team, role = 'leader1') => {
    const existingLeader = role === 'leader1'
      ? students.find(s => s.id === (team.leader1Id || team.leaderId))
      : students.find(s => s.id === team.leader2Id);

    setLeaderModalTeam(team);
    setLeaderModalRole(role);
    setLeaderStudentId(existingLeader?.id || '');
    setLeaderUsernameInput(existingLeader?.leaderUsername || (role === 'leader2' ? `leader_${team.id}b` : `leader_${team.id}`));
    setLeaderPasswordInput('leader123');
    setLeaderSectionInput(existingLeader?.leaderSectionRestriction || 'all');
  };

  const handleAppointLeaderSubmit = async (e) => {
    e.preventDefault();
    if (!leaderModalTeam || !leaderStudentId) return;

    await appointTeamLeader({
      teamId: leaderModalTeam.id,
      leaderRole: leaderModalRole,
      studentId: leaderStudentId,
      leaderUsername: leaderUsernameInput.trim(),
      leaderPassword: leaderPasswordInput.trim(),
      sectionRestriction: leaderSectionInput
    }, currentUser?.username);

    setLeaderSuccessMsg(`Successfully updated ${leaderModalRole === 'leader2' ? 'Leader 2' : 'Leader 1'} for ${leaderModalTeam.name}!`);
    setTimeout(() => setLeaderSuccessMsg(''), 3000);
    setLeaderModalTeam(null);
  };

  // =========================================================================
  // SECTIONS & CLASS EDIT MODALS
  // =========================================================================
  const [editingSection, setEditingSection] = useState(null);
  const [sectionNameInput, setSectionNameInput] = useState('');

  const [editingClass, setEditingClass] = useState(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [classSectionInput, setClassSectionInput] = useState('thamheediyya');

  // Academic Class Add / Delete State
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassNameInput, setNewClassNameInput] = useState('');
  const [newClassSectionInput, setNewClassSectionInput] = useState('thamheediyya');
  const [classToDelete, setClassToDelete] = useState(null);
  const [targetMoveClassId, setTargetMoveClassId] = useState('');
  const [classDeleteError, setClassDeleteError] = useState('');

  // =========================================================================
  // TEAM ADD / EDIT / DELETE MODALS
  // =========================================================================
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#0E7C86');

  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamColor, setEditTeamColor] = useState('#0E7C86');

  const [teamToDelete, setTeamToDelete] = useState(null);
  const [targetMoveTeamId, setTargetMoveTeamId] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Bulk Reassign Modal State
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [destinationTeamId, setDestinationTeamId] = useState(() => teams[0]?.id || '');

  // Manage Team Members & Quick Edit Modal State
  const [managingMembersTeam, setManagingMembersTeam] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberFilterSection, setMemberFilterSection] = useState('all');
  const [addMemberStudentId, setAddMemberStudentId] = useState('');
  const [quickTeamName, setQuickTeamName] = useState('');
  const [quickTeamColor, setQuickTeamColor] = useState('#0E7C86');
  const [manageSuccessMsg, setManageSuccessMsg] = useState('');

  const openManageMembersModal = (team) => {
    setManagingMembersTeam(team);
    setQuickTeamName(team.name);
    setQuickTeamColor(team.color);
    setMemberSearchQuery('');
    setMemberFilterSection('all');
    setAddMemberStudentId('');
    setManageSuccessMsg('');
  };

  const handleSaveQuickTeamDetails = (e) => {
    e?.preventDefault();
    if (!managingMembersTeam || !quickTeamName.trim()) return;
    updateTeam(managingMembersTeam.id, {
      name: quickTeamName.trim(),
      color: quickTeamColor
    }, currentUser?.username);
    setManagingMembersTeam(prev => ({
      ...prev,
      name: quickTeamName.trim(),
      color: quickTeamColor
    }));
    setManageSuccessMsg(`Team details updated successfully!`);
    setTimeout(() => setManageSuccessMsg(''), 3000);
  };

  const handleAddMemberToTeam = (e) => {
    e?.preventDefault();
    if (!managingMembersTeam || !addMemberStudentId) return;
    const targetStudent = students.find(s => s.id === addMemberStudentId);
    if (!targetStudent) return;

    updateStudent(addMemberStudentId, { teamId: managingMembersTeam.id }, currentUser?.username);
    setManageSuccessMsg(`Assigned ${targetStudent.name} to ${quickTeamName || managingMembersTeam.name}!`);
    setAddMemberStudentId('');
    setTimeout(() => setManageSuccessMsg(''), 3000);
  };

  const handleTransferMember = (studentId, newTeamId) => {
    if (!studentId || !newTeamId) return;
    const st = students.find(s => s.id === studentId);
    const targetTeam = teams.find(t => t.id === newTeamId);
    updateStudent(studentId, { teamId: newTeamId }, currentUser?.username);
    setManageSuccessMsg(`Moved ${st?.name || 'student'} to ${targetTeam?.name || 'selected team'}!`);
    setTimeout(() => setManageSuccessMsg(''), 3000);
  };

  const handleRemoveMemberFromTeam = (studentId) => {
    const st = students.find(s => s.id === studentId);
    if (!window.confirm(`Are you sure you want to remove ${st?.name} from ${quickTeamName || managingMembersTeam?.name}? They will be marked as unassigned.`)) {
      return;
    }
    updateStudent(studentId, { teamId: '' }, currentUser?.username);
    setManageSuccessMsg(`Removed ${st?.name} from team.`);
    setTimeout(() => setManageSuccessMsg(''), 3000);
  };

  // Section Edit Submit
  const handleEditSectionSubmit = (e) => {
    e.preventDefault();
    if (!editingSection || !sectionNameInput.trim()) return;
    updateSection(editingSection.id, { name: sectionNameInput.trim() }, currentUser?.username);
    setEditingSection(null);
  };

  // Class Edit Submit
  const handleEditClassSubmit = (e) => {
    e.preventDefault();
    if (!editingClass || !classNameInput.trim()) return;
    updateClass(editingClass.id, {
      name: classNameInput.trim(),
      sectionId: classSectionInput
    }, currentUser?.username);
    setEditingClass(null);
  };

  // Add Class Submit
  const handleAddClassSubmit = (e) => {
    e.preventDefault();
    if (!newClassNameInput.trim()) return;
    addClass({
      name: newClassNameInput.trim(),
      sectionId: newClassSectionInput
    }, currentUser?.username);
    setIsAddClassOpen(false);
    setNewClassNameInput('');
  };

  // Delete Class with enrolled students re-assignment check
  const handleDeleteClass = () => {
    if (!classToDelete) return;
    const memberCount = students.filter(s => s.classId === classToDelete.id).length;
    if (memberCount > 0 && !targetMoveClassId) {
      setClassDeleteError("You must select another class to move enrolled students before deleting!");
      return;
    }
    try {
      deleteClass(classToDelete.id, targetMoveClassId, currentUser?.username);
      setClassToDelete(null);
      setTargetMoveClassId('');
      setClassDeleteError('');
    } catch (err) {
      setClassDeleteError(err.message);
    }
  };

  // Add team handler
  const handleAddTeamSubmit = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    addTeam({ name: newTeamName.trim(), color: newTeamColor }, currentUser?.username);
    setIsAddTeamOpen(false);
    setNewTeamName('');
  };

  // Edit team handler
  const handleEditTeamSubmit = (e) => {
    e.preventDefault();
    if (!editingTeam || !editTeamName.trim()) return;
    updateTeam(editingTeam.id, { name: editTeamName.trim(), color: editTeamColor }, currentUser?.username);
    setEditingTeam(null);
  };

  // Delete team with check
  const handleDeleteTeam = () => {
    if (!teamToDelete) return;
    const memberCount = students.filter(s => s.teamId === teamToDelete.id).length;
    if (memberCount > 0 && !targetMoveTeamId) {
      setDeleteError("You must select another team to move existing members before deleting!");
      return;
    }

    try {
      deleteTeam(teamToDelete.id, targetMoveTeamId, currentUser?.username);
      setTeamToDelete(null);
      setTargetMoveTeamId('');
      setDeleteError('');
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  // Handle bulk assign
  const handleExecuteBulkAssign = () => {
    if (selectedStudentIds.length === 0 || !destinationTeamId) return;
    const assignments = {};
    selectedStudentIds.forEach(id => {
      assignments[id] = destinationTeamId;
    });
    bulkAssignTeams(assignments, currentUser?.username);
    setIsBulkAssignOpen(false);
    setSelectedStudentIds([]);
  };

  // Quick Nominate Student for Program Handler
  const handleQuickNominateSubmit = (e) => {
    e.preventDefault();
    setNominateError('');
    if (!nominateModalData || !nominateStudentId) return;

    const res = nominateStudentForProgram({
      programId: nominateModalData.program.id,
      studentId: nominateStudentId,
      teamId: nominateModalData.team.id
    }, currentUser?.username || 'admin');

    if (res?.success === false) {
      setNominateError(res.error || 'Failed to nominate member.');
    } else {
      setNominateSuccess(`Enrolled member successfully into ${nominateModalData.program.name}!`);
      setTimeout(() => {
        setNominateSuccess('');
        setNominateModalData(null);
        setNominateStudentId('');
      }, 1500);
    }
  };

  // Trigger browser print
  const handlePrintTeamSheet = (team, summit) => {
    setPrintingTeamData({ team, summit });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">
            <span>Directorate Team Console</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0E7C86]" />
            <span>Team &amp; House Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage house teams, leaders, member assignments, summit program allocations, and dedicated per-team print sheets.
          </p>
        </div>

        {/* 3 Nav Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start md:self-center overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('teams')}
            className={`py-2 px-3.5 rounded-lg font-bold text-xs flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'teams'
                ? 'bg-white dark:bg-[#0F1B2B] text-[#0F2A4A] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-[#0E7C86]" />
            <span>House Teams ({teams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('summit_assignments')}
            className={`py-2 px-3.5 rounded-lg font-bold text-xs flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'summit_assignments'
                ? 'bg-white dark:bg-[#0F1B2B] text-[#0F2A4A] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Summit Rosters &amp; Print</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('classes')}
            className={`py-2 px-3.5 rounded-lg font-bold text-xs flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'classes'
                ? 'bg-white dark:bg-[#0F1B2B] text-[#0F2A4A] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-[#334E73]" />
            <span>Academic Classes &amp; Stages</span>
          </button>
        </div>
      </div>

      {leaderSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{leaderSuccessMsg}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: HOUSE TEAMS & MEMBERS
         ========================================================================= */}
      {activeSubTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0E7C86]" />
                <span>House Teams Roster &amp; Leadership</span>
              </h3>
              <p className="text-xs text-slate-500">
                View enrolled members, appoint Leader 1 &amp; Leader 2, transfer students between teams, and manage house identities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkAssignOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#0E7C86]" />
                <span>Bulk Assign Teams</span>
              </button>

              <button
                onClick={() => setIsAddTeamOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Team</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map(team => {
              const currentTeamMembers = students.filter(s => s.teamId === team.id);
              const memberCount = currentTeamMembers.length;
              const leader1 = students.find(s => s.id === (team.leader1Id || team.leaderId));
              const leader2 = students.find(s => s.id === team.leader2Id);

              const thCount = currentTeamMembers.filter(s => {
                const cl = classes.find(c => c.id === s.classId);
                return (s.sectionId || cl?.sectionId) === 'thamheediyya';
              }).length;

              const alCount = currentTeamMembers.filter(s => {
                const cl = classes.find(c => c.id === s.classId);
                return (s.sectionId || cl?.sectionId) === 'aliya';
              }).length;

              return (
                <div
                  key={team.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: team.color }}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {team.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openManageMembersModal(team)}
                          className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/60 text-[#0E7C86] dark:text-teal-400 transition"
                          title="Manage Team & Members"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTeam(team);
                            setEditTeamName(team.name);
                            setEditTeamColor(team.color);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                          title="Edit Team Name & Color"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setTeamToDelete(team);
                            setTargetMoveTeamId('');
                            setDeleteError('');
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Leaders Breakdown */}
                    <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500 font-semibold">
                          <Crown className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Leader 1:</span>
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                          {leader1 ? leader1.name : <span className="text-slate-400 font-normal">None</span>}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500 font-semibold">
                          <Crown className="w-3.5 h-3.5 text-slate-400" />
                          <span>Leader 2:</span>
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                          {leader2 ? leader2.name : <span className="text-slate-400 font-normal">None</span>}
                        </strong>
                      </div>

                      <div className="flex justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500">Enrolled Members:</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold font-mono">
                          {memberCount} ({thCount} Th • {alCount} Al)
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Team Quick Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => openManageMembersModal(team)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#0E7C86] hover:bg-[#0B636B] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View &amp; Edit Members ({memberCount})</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openAppointLeaderModal(team, 'leader1')}
                        className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-semibold text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <Crown className="w-3 h-3 text-[#C9A227]" />
                        <span>Appoint Leaders</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeamFilter(team.id);
                          setActiveSubTab('summit_assignments');
                        }}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <Calendar className="w-3 h-3 text-[#0E7C86]" />
                        <span>Summit Sheet</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SUMMIT ROSTERS & PER-TEAM PRINT
         ========================================================================= */}
      {activeSubTab === 'summit_assignments' && (
        <div className="space-y-6">
          {/* Summit & Team Filter Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0E7C86]" />
                  <span>Summit Event Allocations &amp; House Team Dossiers</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select an academic summit to inspect programs assigned to each house, review nominated candidates, and print official team rosters.
                </p>
              </div>

              {/* Summit Selector */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Selected Summit:
                </span>
                <select
                  value={selectedSummitId}
                  onChange={(e) => setSelectedSummitId(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs text-[#0F2A4A] dark:text-white min-w-[240px]"
                >
                  {summits.length === 0 ? (
                    <option value="">-- No Summits Scheduled --</option>
                  ) : (
                    summits.map((sm, idx) => (
                      <option key={sm.id} value={sm.id}>
                        Summit {idx + 1}: {sm.name} ({sm.date || 'TBD'})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Team Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Filter House:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTeamFilter('all')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedTeamFilter === 'all'
                    ? 'bg-[#0F2A4A] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All 4 Houses
              </button>

              {teams.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeamFilter(t.id)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    selectedTeamFilter === t.id
                      ? 'bg-[#0E7C86] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* When 0 Summits Exist */}
          {summits.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-base">
                No Summits Scheduled Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Summits can be scheduled from the <strong>Summits &amp; Sessions</strong> console. Once a summit is scheduled, house program assignments and dedicated print sheets will appear here.
              </p>
            </div>
          ) : (
            /* Render Team Rosters for Selected Summit */
            <div className="space-y-6">
              {teams
                .filter(t => selectedTeamFilter === 'all' || t.id === selectedTeamFilter)
                .map(team => {
                  const leader1 = students.find(s => s.id === (team.leader1Id || team.leaderId));
                  const leader2 = students.find(s => s.id === team.leader2Id);

                  // All programs for this summit
                  const summitPrograms = programs.filter(p => p.summitId === activeSummit?.id);

                  // Programs assigned to this team:
                  // - In Thamheediyya, all programs are common to all 4 teams
                  // - In Aliya, teamAllocations[team.id].assigned !== false
                  const teamPrograms = summitPrograms.filter(p => {
                    if (p.sectionId === 'thamheediyya') return true;
                    return p.teamAllocations?.[team.id]?.assigned !== false;
                  });

                  // Calculate total enrolled participants for this team in this summit
                  let totalTeamParticipants = 0;
                  teamPrograms.forEach(p => {
                    const progEntries = entries.filter(e => e.programId === p.id && (e.teamId === team.id || students.find(s => s.id === e.studentId)?.teamId === team.id));
                    totalTeamParticipants += progEntries.length;
                  });

                  return (
                    <div
                      key={team.id}
                      className="rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
                    >
                      {/* Team Header Banner */}
                      <div
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white"
                        style={{
                          background: `linear-gradient(135deg, ${team.color} 0%, #0F2A4A 100%)`
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-white shrink-0 shadow-xs" />
                            <h4 className="text-lg font-bold tracking-tight">
                              {team.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                              {activeSummit?.name || 'Active Summit'}
                            </span>
                          </div>
                          <p className="text-xs text-white/80">
                            Leaders: <strong>{leader1?.name || 'Leader 1'}</strong> &amp; <strong>{leader2?.name || 'Leader 2'}</strong> • Assigned Events: <strong>{teamPrograms.length}</strong> • Registered Participants: <strong>{totalTeamParticipants}</strong>
                          </p>
                        </div>

                        {/* Dedicated Team Print Action Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePrintTeamSheet(team, activeSummit)}
                            className="py-2.5 px-4 rounded-xl bg-white text-[#0F2A4A] hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition shadow-md"
                            title={`Print official ${team.name} summit roster sheet`}
                          >
                            <Printer className="w-4 h-4 text-[#0E7C86]" />
                            <span>🖨️ Print Team Summit Sheet</span>
                          </button>
                        </div>
                      </div>

                      {/* Programs Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3 w-12 text-center">#</th>
                              <th className="p-3">Program / Event</th>
                              <th className="p-3">Section</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Venue &amp; Time</th>
                              <th className="p-3">Nominated Member(s)</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {teamPrograms.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-400">
                                  No programs assigned to {team.name} in this summit.
                                </td>
                              </tr>
                            ) : (
                              teamPrograms.map((prog, pIdx) => {
                                const progEntries = entries.filter(e =>
                                  e.programId === prog.id &&
                                  (e.teamId === team.id || students.find(s => s.id === e.studentId)?.teamId === team.id)
                                );
                                const allowedCount = prog.teamAllocations?.[team.id]?.allowedCount || (prog.type === 'group' ? 2 : 1);
                                const isFull = progEntries.length >= allowedCount;

                                return (
                                  <tr
                                    key={prog.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                                  >
                                    <td className="p-3 text-center font-mono font-bold text-slate-400">
                                      {pIdx + 1}
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-slate-900 dark:text-white">
                                        {prog.name}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        Max: {allowedCount} slot(s) • Type: {prog.type}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                        prog.sectionId === 'thamheediyya'
                                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                          : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                                      }`}>
                                        {prog.sectionId === 'thamheediyya' ? 'Thamheediyya' : 'Aliya'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-600 dark:text-slate-300">
                                      {prog.category || 'Academic'}
                                    </td>
                                    <td className="p-3 text-slate-500">
                                      <div>{prog.venue || activeSummit?.venue || 'College Auditorium'}</div>
                                      <div className="text-[10px] text-slate-400">{prog.time || activeSummit?.date || 'Scheduled'}</div>
                                    </td>
                                    <td className="p-3">
                                      {progEntries.length === 0 ? (
                                        <span className="text-amber-600 dark:text-amber-400 italic text-[11px]">
                                          None nominated ({progEntries.length}/{allowedCount})
                                        </span>
                                      ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                          {progEntries.map(e => {
                                            const st = students.find(s => s.id === e.studentId);
                                            const stClass = classes.find(c => c.id === st?.classId);
                                            return (
                                              <span
                                                key={e.id}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold text-[11px]"
                                              >
                                                <span>{st?.name || 'Student'}</span>
                                                <span className="font-mono text-[9px] text-slate-500">({st?.cicNo || 'CIC'})</span>
                                                <button
                                                  type="button"
                                                  onClick={() => removeStudentEntry(e.id, currentUser?.username || 'admin')}
                                                  className="hover:text-rose-600 transition ml-0.5"
                                                  title="Remove participant"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        type="button"
                                        disabled={isFull}
                                        onClick={() => {
                                          setNominateModalData({ program: prog, team });
                                          setNominateStudentId('');
                                          setNominateError('');
                                        }}
                                        className="py-1.5 px-3 rounded-lg bg-[#0E7C86] hover:bg-[#0B636B] disabled:opacity-40 text-white font-bold text-[11px] inline-flex items-center gap-1 transition shadow-xs"
                                        title={isFull ? 'All slots filled' : 'Nominate student from this house'}
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Nominate</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ACADEMIC CLASSES & STAGES
         ========================================================================= */}
      {activeSubTab === 'classes' && (
        <div className="space-y-8">
          {/* 1. SECTIONS OVERVIEW */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-[#0E7C86]" />
                <span>Academic Sections (Stages)</span>
              </h3>
              <p className="text-xs text-slate-500">
                The institutional division between Thamheediyya (Junior Preparatory) and Aliya (Senior Degree). Rankings and programs are administered section-wise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map(sec => {
                const secClasses = classes.filter(c => c.sectionId === sec.id);
                const secStudents = students.filter(s => {
                  const cl = classes.find(c => c.id === s.classId);
                  return (cl?.sectionId || s.sectionId) === sec.id;
                });

                return (
                  <div
                    key={sec.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border-2 border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-400 font-mono">
                          Section Code: {sec.id}
                        </span>
                        <button
                          onClick={() => {
                            setEditingSection(sec);
                            setSectionNameInput(sec.name);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                          title="Rename Section"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-[#0F2A4A] dark:text-white">
                        {sec.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {sec.description || 'Academic program and ranking division.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Classes: <strong className="text-slate-800 dark:text-slate-200">{secClasses.map(c => c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1] || '')).join(', ') || 'None'}</strong>
                      </span>
                      <span className="font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F2A4A] dark:text-white">
                        {secStudents.length} Students
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. ACADEMIC CLASSES & SECTION MAPPING */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#334E73]" />
                  <span>Academic Classes &amp; Section Assignment</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Assign each class to its respective Section. Enrolled students inherit their section automatically.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewClassNameInput('');
                  setNewClassSectionInput(sections[0]?.id || 'thamheediyya');
                  setIsAddClassOpen(true);
                }}
                className="px-3.5 py-2 bg-[#0E7C86] hover:bg-[#0B636B] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Academic Class</span>
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Academic Classes Found</p>
                <p className="text-xs text-slate-500 mb-4">Click below to create your first class.</p>
                <button
                  onClick={() => {
                    setNewClassNameInput('');
                    setNewClassSectionInput(sections[0]?.id || 'thamheediyya');
                    setIsAddClassOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0E7C86] hover:bg-[#0B636B] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Class</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classes.map((cls, idx) => {
                  const count = students.filter(s => s.classId === cls.id).length;
                  const sec = sections.find(s => s.id === cls.sectionId);

                  return (
                    <div
                      key={cls.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-[#0E7C86] font-mono">
                            Class {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {sec?.name?.split(' ')[0] || 'Thamheediyya'}
                          </span>
                        </div>

                        <h4 className="font-bold text-[#0F2A4A] dark:text-white text-sm">
                          {cls.name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {count} Enrolled Students
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingClass(cls);
                            setClassNameInput(cls.name);
                            setClassSectionInput(cls.sectionId || 'thamheediyya');
                          }}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                          title="Edit Class & Section"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setClassToDelete(cls);
                            setClassDeleteError('');
                            setTargetMoveClassId(classes.find(c => c.id !== cls.id)?.id || '');
                          }}
                          className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          DEDICATED PRINT MODAL (AND PRINTABLE SHEET PREVIEW)
         ========================================================================= */}
      {printingTeamData && (() => {
        const { team, summit } = printingTeamData;
        const leader1 = students.find(s => s.id === (team.leader1Id || team.leaderId));
        const leader2 = students.find(s => s.id === team.leader2Id);

        const summitPrograms = programs.filter(p => p.summitId === summit?.id);
        const teamPrograms = summitPrograms.filter(p => {
          if (p.sectionId === 'thamheediyya') return true;
          return p.teamAllocations?.[team.id]?.assigned !== false;
        });

        const printNow = () => {
          window.print();
        };

        return (
          <Modal
            isOpen={true}
            onClose={() => setPrintingTeamData(null)}
            title={`Print Dossier: ${team.name} - ${summit?.name || 'Summit'}`}
            maxWidth="max-w-4xl"
          >
            <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto p-1">
              {/* Action Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  Print official high-resolution sheet for team captain, leaders and evaluators.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintingTeamData(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={printNow}
                    className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#0B636B] text-white font-bold flex items-center gap-2 shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Sheet (A4)</span>
                  </button>
                </div>
              </div>

              {/* Printable Document Preview */}
              <div className="bg-white text-slate-900 p-8 rounded-2xl border-2 border-slate-300 shadow-md space-y-6 font-sans">
                {/* College Institutional Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                    Co-ordination of Islamic Colleges (CIC) Affiliated
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-[#0F2A4A] uppercase">
                    MAJLIS UMARIYYA WAFY COLLEGE
                  </h1>
                  <div className="text-xs font-bold text-[#0E7C86] uppercase tracking-wider">
                    MUSF Summit Register • Official House Team Program Roster
                  </div>
                </div>

                {/* Summit & House Details Banner */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-slate-500 font-medium">Summit Gathering: </span>
                      <strong className="text-slate-900">{summit?.name || 'Official Summit'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Date &amp; Venue: </span>
                      <strong className="text-slate-900">{summit?.date || 'Scheduled Date'} • {summit?.venue || 'College Campus'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Academic Period: </span>
                      <strong className="text-slate-900">Academic Year 2026-27</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-l border-slate-200 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">House Team: </span>
                      <span className="px-2 py-0.5 rounded font-black text-white text-[11px]" style={{ backgroundColor: team.color }}>
                        {team.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Leader 1: </span>
                      <strong className="text-slate-900">{leader1?.name ? `${leader1.name} (${leader1.cicNo})` : 'Appointed Leader 1'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Leader 2: </span>
                      <strong className="text-slate-900">{leader2?.name ? `${leader2.name} (${leader2.cicNo})` : 'Appointed Leader 2'}</strong>
                    </div>
                  </div>
                </div>

                {/* Programs & Participants Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Allocated Programs &amp; Enrolled Participants ({teamPrograms.length} Events)
                  </h4>
                  <table className="w-full text-left border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 font-bold uppercase text-[10px]">
                        <th className="border border-slate-400 p-2 text-center w-8">Sl</th>
                        <th className="border border-slate-400 p-2">Program Name</th>
                        <th className="border border-slate-400 p-2">Section</th>
                        <th className="border border-slate-400 p-2">Type</th>
                        <th className="border border-slate-400 p-2">Nominated Student(s)</th>
                        <th className="border border-slate-400 p-2">CIC No &amp; Class</th>
                        <th className="border border-slate-400 p-2 text-center w-24">Score / Sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamPrograms.map((prog, idx) => {
                        const progEntries = entries.filter(e =>
                          e.programId === prog.id &&
                          (e.teamId === team.id || students.find(s => s.id === e.studentId)?.teamId === team.id)
                        );

                        return (
                          <tr key={prog.id} className="border-b border-slate-300">
                            <td className="border border-slate-300 p-2 text-center font-bold">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-300 p-2 font-bold text-slate-900">
                              {prog.name}
                              <div className="text-[10px] text-slate-500 font-normal">{prog.venue || summit?.venue || 'Campus'} • {prog.time || 'Scheduled'}</div>
                            </td>
                            <td className="border border-slate-300 p-2 uppercase font-mono text-[10px] font-semibold">
                              {prog.sectionId === 'thamheediyya' ? 'Thamheediyya' : 'Aliya'}
                            </td>
                            <td className="border border-slate-300 p-2 capitalize text-[10px]">
                              {prog.type}
                            </td>
                            <td className="border border-slate-300 p-2">
                              {progEntries.length === 0 ? (
                                <span className="text-slate-400 italic">Pending Nomination</span>
                              ) : (
                                progEntries.map((e, eIdx) => {
                                  const st = students.find(s => s.id === e.studentId);
                                  return (
                                    <div key={e.id} className="font-semibold text-slate-900">
                                      {eIdx + 1}. {st?.name || 'Nominated Student'}
                                    </div>
                                  );
                                })
                              )}
                            </td>
                            <td className="border border-slate-300 p-2 font-mono text-[11px]">
                              {progEntries.length === 0 ? (
                                <span className="text-slate-400">-</span>
                              ) : (
                                progEntries.map(e => {
                                  const st = students.find(s => s.id === e.studentId);
                                  const cl = classes.find(c => c.id === st?.classId);
                                  return (
                                    <div key={e.id}>
                                      {st?.cicNo || 'CIC'} ({cl?.name?.split(' ')[0] || 'Cls'})
                                    </div>
                                  );
                                })
                              )}
                            </td>
                            <td className="border border-slate-300 p-2 text-center">
                              <div className="h-6 border-b border-dotted border-slate-400 mt-2"></div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signatures Footer */}
                <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs">
                  <div className="space-y-1">
                    <div className="border-t border-slate-900 pt-1.5 font-bold">
                      Team Leader Signature
                    </div>
                    <div className="text-[10px] text-slate-500">{team.name}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="border-t border-slate-900 pt-1.5 font-bold">
                      General Captain / Coordinator
                    </div>
                    <div className="text-[10px] text-slate-500">MUSF Summit Coordination</div>
                  </div>

                  <div className="space-y-1">
                    <div className="border-t border-slate-900 pt-1.5 font-bold">
                      Summit Director
                    </div>
                    <div className="text-[10px] text-slate-500">Majlis Umariyya Wafy College</div>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 text-center pt-4 border-t border-slate-200">
                  Document generated by MUSF Summit Register Command Center • Official Record of Majlis Umariyya Wafy College
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* =========================================================================
          PRINT-ONLY CONTAINER FOR BROWSER PRINT (A4 OUTPUT)
         ========================================================================= */}
      {printingTeamData && (() => {
        const { team, summit } = printingTeamData;
        const leader1 = students.find(s => s.id === (team.leader1Id || team.leaderId));
        const leader2 = students.find(s => s.id === team.leader2Id);

        const summitPrograms = programs.filter(p => p.summitId === summit?.id);
        const teamPrograms = summitPrograms.filter(p => {
          if (p.sectionId === 'thamheediyya') return true;
          return p.teamAllocations?.[team.id]?.assigned !== false;
        });

        return (
          <div id="printable-team-sheet" className="print-only p-8 text-black bg-white">
            <div className="text-center border-b-2 border-black pb-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                Co-ordination of Islamic Colleges (CIC) Affiliated
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                MAJLIS UMARIYYA WAFY COLLEGE
              </h1>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                MUSF Summit Register • Official House Team Program Roster
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 p-3 border border-black text-xs">
              <div className="space-y-1">
                <div>Summit Gathering: <strong>{summit?.name || 'Summit'}</strong></div>
                <div>Date &amp; Venue: <strong>{summit?.date || 'Date'} • {summit?.venue || 'Campus'}</strong></div>
                <div>Academic Period: <strong>Academic Year 2026-27</strong></div>
              </div>
              <div className="space-y-1 border-l border-black pl-3">
                <div>House Team: <strong>{team.name}</strong></div>
                <div>Leader 1: <strong>{leader1?.name ? `${leader1.name} (${leader1.cicNo})` : 'Appointed Leader 1'}</strong></div>
                <div>Leader 2: <strong>{leader2?.name ? `${leader2.name} (${leader2.cicNo})` : 'Appointed Leader 2'}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-black">
                Allocated Programs &amp; Enrolled Participants ({teamPrograms.length} Events)
              </h4>
              <table className="w-full text-left border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-200 border-b border-black text-black font-bold uppercase text-[10px]">
                    <th className="border border-black p-2 text-center w-8">Sl</th>
                    <th className="border border-black p-2">Program Name</th>
                    <th className="border border-black p-2">Section</th>
                    <th className="border border-black p-2">Type</th>
                    <th className="border border-black p-2">Nominated Student(s)</th>
                    <th className="border border-black p-2">CIC No &amp; Class</th>
                    <th className="border border-black p-2 text-center w-24">Score / Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPrograms.map((prog, idx) => {
                    const progEntries = entries.filter(e =>
                      e.programId === prog.id &&
                      (e.teamId === team.id || students.find(s => s.id === e.studentId)?.teamId === team.id)
                    );

                    return (
                      <tr key={prog.id} className="border-b border-black">
                        <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                        <td className="border border-black p-2 font-bold">{prog.name}</td>
                        <td className="border border-black p-2 uppercase font-mono text-[10px]">{prog.sectionId}</td>
                        <td className="border border-black p-2 capitalize text-[10px]">{prog.type}</td>
                        <td className="border border-black p-2">
                          {progEntries.length === 0 ? 'Pending Nomination' : progEntries.map((e, eIdx) => {
                            const st = students.find(s => s.id === e.studentId);
                            return <div key={e.id}>{eIdx + 1}. {st?.name || 'Nominated'}</div>;
                          })}
                        </td>
                        <td className="border border-black p-2 font-mono text-[11px]">
                          {progEntries.length === 0 ? '-' : progEntries.map(e => {
                            const st = students.find(s => s.id === e.studentId);
                            const cl = classes.find(c => c.id === st?.classId);
                            return <div key={e.id}>{st?.cicNo || 'CIC'} ({cl?.name?.split(' ')[0] || ''})</div>;
                          })}
                        </td>
                        <td className="border border-black p-2 text-center">
                          <div className="h-6 border-b border-dotted border-black mt-2"></div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-16 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="border-t border-black pt-1 font-bold">Team Leader Signature</div>
                <div className="text-[10px]">{team.name}</div>
              </div>
              <div>
                <div className="border-t border-black pt-1 font-bold">General Captain / Coordinator</div>
                <div className="text-[10px]">MUSF Summit Coordination</div>
              </div>
              <div>
                <div className="border-t border-black pt-1 font-bold">Summit Director</div>
                <div className="text-[10px]">Majlis Umariyya Wafy College</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          QUICK NOMINATE STUDENT MODAL
         ========================================================================= */}
      {nominateModalData && (() => {
        const { program, team } = nominateModalData;
        const teamStudents = students.filter(s => s.teamId === team.id);

        // Filter eligible students:
        // Must belong to program section (Thamheediyya vs Aliya)
        const eligibleStudents = teamStudents.filter(s => {
          const cl = classes.find(c => c.id === s.classId);
          const sSec = s.sectionId || cl?.sectionId || 'thamheediyya';
          if (program.sectionId === 'both') return true;
          return sSec === program.sectionId;
        });

        // Already nominated in this program
        const alreadyNominatedIds = entries
          .filter(e => e.programId === program.id)
          .map(e => e.studentId);

        return (
          <Modal
            isOpen={true}
            onClose={() => setNominateModalData(null)}
            title={`Nominate Member: ${program.name}`}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleQuickNominateSubmit} className="space-y-4 text-xs">
              {nominateError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{nominateError}</span>
                </div>
              )}

              {nominateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{nominateSuccess}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                  <strong className="text-slate-900 dark:text-white">{team.name}</strong>
                </div>
                <div className="text-slate-500">
                  Program: <strong>{program.name}</strong> ({program.sectionId === 'thamheediyya' ? 'Thamheediyya' : 'Aliya'})
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Team Member to Enroll
                </label>
                <select
                  required
                  value={nominateStudentId}
                  onChange={(e) => setNominateStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="">-- Choose eligible student from {team.name} --</option>
                  {eligibleStudents.map(s => {
                    const cl = classes.find(c => c.id === s.classId);
                    const isAlready = alreadyNominatedIds.includes(s.id);
                    return (
                      <option key={s.id} value={s.id} disabled={isAlready}>
                        {s.name} ({s.cicNo}) • {cl?.name || 'Class'} {isAlready ? ' (Already Nominated)' : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only students belonging to {team.name} in {program.sectionId === 'thamheediyya' ? 'Class 1 & 2' : 'Class 3, 4 & 5'} are eligible.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNominateModalData(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!nominateStudentId}
                  className="px-4 py-2 bg-[#0E7C86] hover:bg-[#0B636B] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm Nomination
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* =========================================================================
          OTHER MODALS (ADD/EDIT TEAM, BULK ASSIGN, LEADER APPOINT, EDIT CLASS)
         ========================================================================= */}
      {/* Edit Section Modal */}
      {editingSection && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSection(null)}
          title="Rename Academic Section"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditSectionSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Section Name
              </label>
              <input
                type="text"
                required
                value={sectionNameInput}
                onChange={(e) => setSectionNameInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <Modal
          isOpen={true}
          onClose={() => setEditingClass(null)}
          title="Configure Class & Section"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditClassSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Class Name
              </label>
              <input
                type="text"
                required
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Assign to Section (Stage)
              </label>
              <select
                value={classSectionInput}
                onChange={(e) => setClassSectionInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Moving this class automatically relocates all its enrolled students into the selected section.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
              >
                Save Class
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Academic Class Modal */}
      {isAddClassOpen && (
        <Modal
          isOpen={isAddClassOpen}
          onClose={() => setIsAddClassOpen(false)}
          title="Add New Academic Class"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddClassSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Class Name
              </label>
              <input
                type="text"
                required
                value={newClassNameInput}
                onChange={(e) => setNewClassNameInput(e.target.value)}
                placeholder="e.g. Class 6 or Hifz 1"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Assign to Section (Stage)
              </label>
              <select
                value={newClassSectionInput}
                onChange={(e) => setNewClassSectionInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-white"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Enrolled students will inherit this section for summit rankings and rules.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddClassOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0E7C86] hover:bg-[#0B636B] text-white rounded-xl font-semibold shadow-xs"
              >
                Create Class
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Class Confirmation Modal */}
      {classToDelete && (() => {
        const enrolledCount = students.filter(s => s.classId === classToDelete.id).length;
        const otherClasses = classes.filter(c => c.id !== classToDelete.id);

        return (
          <Modal
            isOpen={true}
            onClose={() => { setClassToDelete(null); setClassDeleteError(''); }}
            title="Delete Academic Class"
            maxWidth="max-w-md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Are you sure you want to delete <strong>{classToDelete.name}</strong>?
                  {enrolledCount > 0 && ` There are ${enrolledCount} students currently enrolled in this class.`}
                </p>
              </div>

              {enrolledCount > 0 && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Move {enrolledCount} enrolled students to:
                  </label>
                  <select
                    value={targetMoveClassId}
                    onChange={(e) => setTargetMoveClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-white"
                  >
                    <option value="">-- Select Destination Class --</option>
                    {otherClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {classDeleteError && (
                <p className="text-xs text-rose-600 font-semibold">{classDeleteError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setClassToDelete(null); setClassDeleteError(''); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClass}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Add Team Modal */}
      {isAddTeamOpen && (
        <Modal
          isOpen={isAddTeamOpen}
          onClose={() => setIsAddTeamOpen(false)}
          title="Add New Summit Team"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddTeamSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Team Name
              </label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Team Al-Noor"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Team Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newTeamColor}
                  onChange={(e) => setNewTeamColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={newTeamColor}
                  onChange={(e) => setNewTeamColor(e.target.value)}
                  className="w-32 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddTeamOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
              >
                Create Team
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTeam(null)}
          title="Edit Summit Team"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditTeamSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Team Name
              </label>
              <input
                type="text"
                required
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Team Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editTeamColor}
                  onChange={(e) => setEditTeamColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={editTeamColor}
                  onChange={(e) => setEditTeamColor(e.target.value)}
                  className="w-32 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const t = editingTeam;
                  setEditingTeam(null);
                  openManageMembersModal(t);
                }}
                className="px-3 py-2 bg-teal-50 dark:bg-teal-950/40 text-[#0E7C86] dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-teal-100 transition"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Members ({students.filter(s => s.teamId === editingTeam.id).length})</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
                >
                  Save Team
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Team Modal */}
      {teamToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setTeamToDelete(null)}
          title={`Delete Team: ${teamToDelete.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            {deleteError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {students.filter(s => s.teamId === teamToDelete.id).length > 0 ? (
              <div className="space-y-3">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Notice:</strong> This team has <strong>{students.filter(s => s.teamId === teamToDelete.id).length} members</strong>. As per summit rules, you must move all existing members to another team before deleting this team.
                </p>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Move all members to:
                  </label>
                  <select
                    value={targetMoveTeamId}
                    onChange={(e) => setTargetMoveTeamId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">-- Select Destination Team --</option>
                    {teams.filter(t => t.id !== teamToDelete.id).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-300">
                This team has no assigned members. Are you sure you want to delete it permanently?
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTeam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Assign Students to Team Modal */}
      <Modal isOpen={isBulkAssignOpen} onClose={() => setIsBulkAssignOpen(false)} title="Bulk Assign Students to Team" maxWidth="max-w-xl">
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Destination Team:</span>
            <select
              value={destinationTeamId}
              onChange={(e) => setDestinationTeamId(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Select students to move ({selectedStudentIds.length} selected):</span>
            <button
              onClick={() => {
                if (selectedStudentIds.length === students.length) setSelectedStudentIds([]);
                else setSelectedStudentIds(students.map(s => s.id));
              }}
              className="text-[#0E7C86] font-semibold hover:underline"
            >
              {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y">
            {students.map(s => {
              const currentTeam = teams.find(t => t.id === s.teamId);
              const isChecked = selectedStudentIds.includes(s.id);
              return (
                <label key={s.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStudentIds(prev => [...prev, s.id]);
                        else setSelectedStudentIds(prev => prev.filter(id => id !== s.id));
                      }}
                      className="rounded text-[#0E7C86] focus:ring-[#0E7C86]"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.cicNo} • {s.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: currentTeam?.color }}>
                    {currentTeam?.name || 'Unassigned'}
                  </span>
                </label>
              );
            })}
          </div>

          <button
            onClick={handleExecuteBulkAssign}
            disabled={selectedStudentIds.length === 0}
            className="w-full py-2.5 bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl disabled:opacity-50"
          >
            Move {selectedStudentIds.length} Students to Destination Team
          </button>
        </div>
      </Modal>

      {/* Appoint / Change Leader Modal */}
      {leaderModalTeam && (
        <Modal
          isOpen={true}
          onClose={() => setLeaderModalTeam(null)}
          title={`Assign Leaders: ${leaderModalTeam.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAppointLeaderSubmit} className="space-y-4 text-xs">
            {/* Role Tab */}
            <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setLeaderModalRole('leader1');
                  const ex = students.find(s => s.id === (leaderModalTeam.leader1Id || leaderModalTeam.leaderId));
                  setLeaderStudentId(ex?.id || '');
                  setLeaderUsernameInput(ex?.leaderUsername || `leader_${leaderModalTeam.id}`);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
                  leaderModalRole === 'leader1'
                    ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs font-bold'
                    : 'text-slate-500'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Leader 1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLeaderModalRole('leader2');
                  const ex = students.find(s => s.id === leaderModalTeam.leader2Id);
                  setLeaderStudentId(ex?.id || '');
                  setLeaderUsernameInput(ex?.leaderUsername || `leader_${leaderModalTeam.id}b`);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
                  leaderModalRole === 'leader2'
                    ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs font-bold'
                    : 'text-slate-500'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-slate-400" />
                <span>Leader 2</span>
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Select Team Member to Appoint as {leaderModalRole === 'leader2' ? 'Leader 2' : 'Leader 1'}
              </label>
              <select
                required
                value={leaderStudentId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setLeaderStudentId(sId);
                  const st = students.find(x => x.id === sId);
                  if (st && !leaderUsernameInput) {
                    setLeaderUsernameInput(`leader_${leaderModalTeam.id}${leaderModalRole === 'leader2' ? 'b' : ''}`);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="">-- Choose Member from {leaderModalTeam.name} --</option>
                {students
                  .filter(s => s.teamId === leaderModalTeam.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.cicNo})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Login Username</label>
                <input
                  type="text"
                  required
                  value={leaderUsernameInput}
                  onChange={(e) => setLeaderUsernameInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Set Password</label>
                <input
                  type="password"
                  required
                  value={leaderPasswordInput}
                  onChange={(e) => setLeaderPasswordInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Managing Section Restriction</label>
              <select
                value={leaderSectionInput}
                onChange={(e) => setLeaderSectionInput(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="all">Whole Team (Thamheediyya + Aliya)</option>
                <option value="thamheediyya">Thamheediyya Only (Class 1 &amp; 2)</option>
                <option value="aliya">Aliya Only (Class 3, 4 &amp; 5)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLeaderModalTeam(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold shadow-xs"
              >
                Appoint Leader
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Team Members & Quick Team Edit Modal */}
      {managingMembersTeam && (() => {
        const currentTeamMembers = students.filter(s => s.teamId === managingMembersTeam.id);
        const otherStudents = students.filter(s => s.teamId !== managingMembersTeam.id);

        const thMembersCount = currentTeamMembers.filter(s => {
          const cl = classes.find(c => c.id === s.classId);
          return (s.sectionId || cl?.sectionId) === 'thamheediyya';
        }).length;

        const alMembersCount = currentTeamMembers.filter(s => {
          const cl = classes.find(c => c.id === s.classId);
          return (s.sectionId || cl?.sectionId) === 'aliya';
        }).length;

        const query = memberSearchQuery.toLowerCase().trim();
        const filteredMembers = currentTeamMembers.filter(s => {
          const matchesQuery = !query ||
            s.name?.toLowerCase().includes(query) ||
            s.cicNo?.toLowerCase().includes(query);

          if (!matchesQuery) return false;

          const cl = classes.find(c => c.id === s.classId);
          const sSec = s.sectionId || cl?.sectionId || 'thamheediyya';

          if (memberFilterSection === 'thamheediyya') return sSec === 'thamheediyya';
          if (memberFilterSection === 'aliya') return sSec === 'aliya';
          return true;
        });

        return (
          <Modal
            isOpen={true}
            onClose={() => setManagingMembersTeam(null)}
            title={`Manage Team: ${quickTeamName || managingMembersTeam.name}`}
            maxWidth="max-w-3xl"
          >
            <div className="space-y-5 text-xs max-h-[80vh] overflow-y-auto pr-1">
              {manageSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{manageSuccessMsg}</span>
                </div>
              )}

              {/* 1. Team Properties (Name & Color) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>Edit Team Name &amp; Color</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const t = managingMembersTeam;
                      setManagingMembersTeam(null);
                      openAppointLeaderModal(t, 'leader1');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#0F2A4A]/5 hover:bg-[#0F2A4A]/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#0F2A4A] dark:text-white font-semibold text-[11px] flex items-center gap-1 transition border border-slate-200 dark:border-slate-700"
                  >
                    <Crown className="w-3 h-3 text-[#C9A227]" />
                    <span>Assign Leaders</span>
                  </button>
                </div>

                <form onSubmit={handleSaveQuickTeamDetails} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={quickTeamName}
                      onChange={(e) => setQuickTeamName(e.target.value)}
                      placeholder="e.g. Team A"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm text-[#0F2A4A] dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Team Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={quickTeamColor}
                        onChange={(e) => setQuickTeamColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 shrink-0"
                      />
                      <input
                        type="text"
                        value={quickTeamColor}
                        onChange={(e) => setQuickTeamColor(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-3 bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Name</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. Add / Transfer Student to this Team */}
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0E7C86] dark:text-teal-400 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Add Member to {quickTeamName || managingMembersTeam.name}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {otherStudents.length} available students
                  </span>
                </div>

                <form onSubmit={handleAddMemberToTeam} className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={addMemberStudentId}
                    onChange={(e) => setAddMemberStudentId(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="">-- Choose student from other teams / unassigned --</option>
                    {otherStudents.map(s => {
                      const sTeam = teams.find(t => t.id === s.teamId);
                      const sClass = classes.find(c => c.id === s.classId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.cicNo}) • {sClass?.name || 'Class'} • Current: {sTeam?.name || 'Unassigned'}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="submit"
                    disabled={!addMemberStudentId}
                    className="py-2.5 px-4 bg-[#0E7C86] hover:bg-[#0B636B] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Member</span>
                  </button>
                </form>
              </div>

              {/* 3. Current Members List */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#0E7C86]" />
                      <span>Current Members ({currentTeamMembers.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      ({thMembersCount} Thamheediyya • {alMembersCount} Aliya)
                    </span>
                  </div>

                  {/* Section Tabs */}
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setMemberFilterSection('all')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        memberFilterSection === 'all'
                          ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      All ({currentTeamMembers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberFilterSection('thamheediyya')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        memberFilterSection === 'thamheediyya'
                          ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Thamheediyya ({thMembersCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberFilterSection('aliya')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        memberFilterSection === 'aliya'
                          ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Aliya ({alMembersCount})
                    </button>
                  </div>
                </div>

                {/* Filter / Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search enrolled members by name or CIC..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                {/* Member Rows */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredMembers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                      <p className="text-xs font-semibold">No students in this team matching your filter.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Use the select box above to assign students to this team.</p>
                    </div>
                  ) : (
                    filteredMembers.map(s => {
                      const sClass = classes.find(c => c.id === s.classId);
                      const isLeader1 = s.id === (managingMembersTeam.leader1Id || managingMembersTeam.leaderId);
                      const isLeader2 = s.id === managingMembersTeam.leader2Id;

                      return (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-300 dark:hover:border-teal-700 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                              style={{ backgroundColor: quickTeamColor }}
                            >
                              {s.name?.charAt(0) || 'S'}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                  {s.name}
                                </span>
                                {isLeader1 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                                    <Crown className="w-2.5 h-2.5 text-amber-600" />
                                    <span>Leader 1</span>
                                  </span>
                                )}
                                {isLeader2 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1">
                                    <Crown className="w-2.5 h-2.5 text-slate-500" />
                                    <span>Leader 2</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="font-mono font-semibold">{s.cicNo}</span>
                                <span>•</span>
                                <span>{sClass?.name || 'Class'}</span>
                                <span>•</span>
                                <span className="capitalize">{s.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action: Transfer / Reassign dropdown */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">Move:</span>
                            <select
                              value={managingMembersTeam.id}
                              onChange={(e) => handleTransferMember(s.id, e.target.value)}
                              className="p-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                            >
                              <option value={managingMembersTeam.id}>{quickTeamName || managingMembersTeam.name} (Current)</option>
                              {teams.filter(t => t.id !== managingMembersTeam.id).map(t => (
                                <option key={t.id} value={t.id}>
                                  Transfer to {t.name}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveMemberFromTeam(s.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                              title="Remove from this team"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400">
                  Total {currentTeamMembers.length} enrolled members in this house
                </span>
                <button
                  type="button"
                  onClick={() => setManagingMembersTeam(null)}
                  className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};
