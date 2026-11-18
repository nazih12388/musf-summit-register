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
  UserCheck
} from 'lucide-react';

export const TeamAndClassManagement = () => {
  const {
    sections,
    classes,
    teams,
    students,
    updateSection,
    updateClass,
    addTeam,
    updateTeam,
    deleteTeam,
    bulkAssignTeams,
    appointTeamLeader
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Leader Appoint Modal State
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

  // Section Edit Modal
  const [editingSection, setEditingSection] = useState(null);
  const [sectionNameInput, setSectionNameInput] = useState('');

  // Class Edit Modal State (Name + Section)
  const [editingClass, setEditingClass] = useState(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [classSectionInput, setClassSectionInput] = useState('thamheediyya');

  // Team Modals State
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#0E7C86');

  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamColor, setEditTeamColor] = useState('#0E7C86');

  // Delete Team State
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [targetMoveTeamId, setTargetMoveTeamId] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Bulk Reassign Modal State
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [destinationTeamId, setDestinationTeamId] = useState(teams[0]?.id || '');

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

  return (
    <div className="space-y-8">
      {/* 1. SECTIONS OVERVIEW */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
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

      {/* 2. 5 CLASSES & SECTION MAPPING */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#334E73]" />
            <span>Academic Classes & Section Assignment</span>
          </h3>
          <p className="text-xs text-slate-500">
            Assign each class to its respective Section. Enrolled students inherit their section automatically.
          </p>
        </div>

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
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SUMMIT TEAMS / HOUSES */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#C9A227]" />
              <span>Summit Teams & Categorization</span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage summit houses, recolor, add, and reassign students team-wise.
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

        {leaderSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {leaderSuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map(team => {
            const memberCount = students.filter(s => s.teamId === team.id).length;
            const leader1 = students.find(s => s.id === (team.leader1Id || team.leaderId));
            const leader2 = students.find(s => s.id === team.leader2Id);

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
                        onClick={() => {
                          setEditingTeam(team);
                          setEditTeamName(team.name);
                          setEditTeamColor(team.color);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                        title="Edit Team"
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
                  <div className="space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Crown className="w-3 h-3 text-[#C9A227]" />
                        <span>Leader 1:</span>
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                        {leader1 ? leader1.name : <span className="text-slate-400 font-normal">None</span>}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Crown className="w-3 h-3 text-slate-400" />
                        <span>Leader 2:</span>
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                        {leader2 ? leader2.name : <span className="text-slate-400 font-normal">None</span>}
                      </strong>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Enrolled Members:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold font-mono">
                        {memberCount}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Quick Leader Action */}
                <button
                  type="button"
                  onClick={() => openAppointLeaderModal(team, 'leader1')}
                  className="w-full py-2 px-3 rounded-xl bg-[#0F2A4A]/5 hover:bg-[#0F2A4A]/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#0F2A4A] dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
                >
                  <Crown className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Assign / Change Leaders</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

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

            <div className="flex justify-end gap-2 pt-2">
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
                      <div className="font-semibold text-slate-900 dark:text-white">{s.name} ({s.chestNo})</div>
                      <div className="text-[11px] text-slate-400">{s.cicNo} • {s.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: currentTeam?.color }}>
                    {currentTeam?.name}
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
                      {s.name} ({s.cicNo}) - {s.chestNo}
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
    </div>
  );
};
