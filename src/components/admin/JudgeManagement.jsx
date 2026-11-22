import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Gavel,
  UserPlus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  KeyRound,
  ShieldCheck,
  Lock,
  Unlock,
  Sparkles,
  CheckSquare,
  Square,
  Search,
  AlertCircle,
  FileText,
  Clock,
  Check
} from 'lucide-react';

export const JudgeManagement = () => {
  const {
    judges = [],
    programs = [],
    summits = [],
    settings = {},
    updateSettings,
    addJudge,
    updateJudge,
    deleteJudge,
    toggleJudgeRestrictions
  } = useApp();
  const { currentUser } = useAuth();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState(null);
  const [deletingJudgeId, setDeletingJudgeId] = useState(null);

  // Add form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('judge123');
  const [unrestricted, setUnrestricted] = useState(false);
  const [assignedSummits, setAssignedSummits] = useState([]);
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [allowMarkEditing, setAllowMarkEditing] = useState(true);
  const [programSearch, setProgramSearch] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editUnrestricted, setEditUnrestricted] = useState(false);
  const [editAssignedSummits, setEditAssignedSummits] = useState([]);
  const [editAssignedPrograms, setEditAssignedPrograms] = useState([]);
  const [editAllowMarkEditing, setEditAllowMarkEditing] = useState(true);
  const [editProgramSearch, setEditProgramSearch] = useState('');

  const globalRestrictionsEnforced = settings?.enforceJudgeRestrictions !== false;
  const globalMarkEditingAllowed = settings?.allowJudgeMarkEditing !== false;

  const handleToggleGlobalRestrictions = () => {
    const nextVal = !globalRestrictionsEnforced;
    updateSettings({ enforceJudgeRestrictions: nextVal }, currentUser?.username || 'admin');
  };

  const handleToggleGlobalMarkEditing = () => {
    const nextVal = !globalMarkEditingAllowed;
    updateSettings({ allowJudgeMarkEditing: nextVal }, currentUser?.username || 'admin');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username) return;
    await addJudge({
      name,
      username,
      password,
      unrestricted,
      assignedSummits: unrestricted ? [] : assignedSummits,
      assignedPrograms: unrestricted ? [] : assignedPrograms,
      allowMarkEditing
    }, currentUser?.username);
    setIsAddOpen(false);
    setName('');
    setUsername('');
    setPassword('judge123');
    setUnrestricted(false);
    setAssignedSummits([]);
    setAssignedPrograms([]);
    setAllowMarkEditing(true);
    setProgramSearch('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingJudge) return;
    const updates = {
      name: editName,
      username: editUsername,
      unrestricted: editUnrestricted,
      assignedSummits: editUnrestricted ? [] : editAssignedSummits,
      assignedPrograms: editUnrestricted ? [] : editAssignedPrograms,
      allowMarkEditing: editAllowMarkEditing
    };
    if (editPassword) updates.password = editPassword;

    await updateJudge(editingJudge.id, updates, currentUser?.username);
    setEditingJudge(null);
  };

  const openEditModal = (judge) => {
    setEditingJudge(judge);
    setEditName(judge.name);
    setEditUsername(judge.username);
    setEditPassword('');
    setEditUnrestricted(Boolean(judge.unrestricted));
    setEditAssignedSummits(judge.assignedSummits || []);
    setEditAssignedPrograms(judge.assignedPrograms || []);
    setEditAllowMarkEditing(judge.allowMarkEditing !== false);
    setEditProgramSearch('');
  };

  const filteredProgramsAdd = programs.filter(p => {
    // If specific summits are selected, only show programs of those summits
    if (assignedSummits.length > 0 && !assignedSummits.includes(p.summitId)) return false;
    return (
      p.name.toLowerCase().includes(programSearch.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(programSearch.toLowerCase()))
    );
  });

  const filteredProgramsEdit = programs.filter(p => {
    if (editAssignedSummits.length > 0 && !editAssignedSummits.includes(p.summitId)) return false;
    return (
      p.name.toLowerCase().includes(editProgramSearch.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(editProgramSearch.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-emerald-600" />
            <span>Judges &amp; Evaluators</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {judges.length} Active
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Allocate summits and events to judges, manage scoring permissions, and restrict/unrestrict score editing.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddOpen(true);
            setUnrestricted(false);
            setAssignedSummits([]);
            setAssignedPrograms([]);
            setAllowMarkEditing(true);
          }}
          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Judge</span>
        </button>
      </div>

      {/* Global Judge Policy Banners (Restrictions & Mark Editing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Policy 1: Program & Summit Allocation Enforcement */}
        <div className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
          globalRestrictionsEnforced
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
            : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              globalRestrictionsEnforced
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
            }`}>
              {globalRestrictionsEnforced ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Summit &amp; Program Restriction
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  globalRestrictionsEnforced
                    ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                }`}>
                  {globalRestrictionsEnforced ? 'Restricted' : 'Unrestricted'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {globalRestrictionsEnforced
                  ? 'Judges can only see and score summits & events explicitly allocated to their account.'
                  : 'All judges are permitted to evaluate any summit and program without restrictions.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleGlobalRestrictions}
            className={`self-end px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs ${
              globalRestrictionsEnforced
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {globalRestrictionsEnforced ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Lift Restrictions Globally</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Enforce Restrictions Globally</span>
              </>
            )}
          </button>
        </div>

        {/* Policy 2: Score Edit Permission (Restrict vs Unrestrict Edit) */}
        <div className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
          !globalMarkEditingAllowed
            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
            : 'bg-teal-50/70 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/50'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              !globalMarkEditingAllowed
                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
                : 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300'
            }`}>
              {!globalMarkEditingAllowed ? <Lock className="w-5 h-5 text-rose-600" /> : <Edit className="w-5 h-5 text-teal-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Judge Score Edit Policy
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  !globalMarkEditingAllowed
                    ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200'
                    : 'bg-teal-200 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200'
                }`}>
                  {!globalMarkEditingAllowed ? 'Editing Restricted' : 'Editing Allowed'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {!globalMarkEditingAllowed
                  ? 'Judges CANNOT edit marks once saved. Scores are locked upon initial submission.'
                  : 'Judges CAN re-edit and update previously submitted marks anytime.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleGlobalMarkEditing}
            className={`self-end px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs ${
              !globalMarkEditingAllowed
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {!globalMarkEditingAllowed ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unrestrict Mark Editing (Allow Updates)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Restrict Mark Editing (Lock on Save)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Judges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {judges.map(judge => {
          const isJudgeUnrestricted = Boolean(judge.unrestricted) || !globalRestrictionsEnforced;
          const assignedList = programs.filter(p => judge.assignedPrograms?.includes(p.id));
          const allocatedSummitsList = summits.filter(s => judge.assignedSummits?.includes(s.id));
          const isMarkEditingAllowed = globalMarkEditingAllowed && judge.allowMarkEditing !== false;

          return (
            <div
              key={judge.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {judge.name}
                    </h4>
                    {isJudgeUnrestricted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>All Summits &amp; Programs</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Restricted Access</span>
                      </span>
                    )}

                    {/* Mark Editing Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isMarkEditingAllowed
                        ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}>
                      {isMarkEditingAllowed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{isMarkEditingAllowed ? 'Edit Allowed' : 'Edit Restricted'}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                      @{judge.username}
                    </span>
                    <span>•</span>
                    <span>
                      {isJudgeUnrestricted
                        ? 'Full Directorate Access'
                        : `${allocatedSummitsList.length} Summits &bull; ${assignedList.length} Events`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(judge)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    title="Edit Judge, Summits &amp; Restrictions"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingJudgeId(judge.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600"
                    title="Delete Judge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Allocated Summits Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#0E7C86]" />
                  <span>Allocated Summits:</span>
                </span>
                {isJudgeUnrestricted ? (
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    All Published Summits Available
                  </span>
                ) : allocatedSummitsList.length === 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 italic text-[11px]">
                    No summits explicitly allocated yet (Click Edit to assign).
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {allocatedSummitsList.map(s => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-[11px] text-[#0F2A4A] dark:text-white"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Buttons: Restriction & Mark Editing Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleJudgeRestrictions(judge.id, currentUser?.username || 'admin')}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                    judge.unrestricted
                      ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {judge.unrestricted ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Restrict Summits</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>Allow All Summits</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => updateJudge(judge.id, { allowMarkEditing: judge.allowMarkEditing === false }, currentUser?.username || 'admin')}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                    judge.allowMarkEditing === false
                      ? 'bg-teal-100 hover:bg-teal-200 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300'
                      : 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300'
                  }`}
                  title={judge.allowMarkEditing === false ? "Click to allow this judge to edit submitted marks" : "Click to lock marks upon submission"}
                >
                  {judge.allowMarkEditing === false ? (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>Unrestrict Editing</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Restrict Editing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Judge Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Judge / Evaluator" maxWidth="max-w-lg">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Judge Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Usthad Abdul Hameed Al-Wafy"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Login Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. judge_hameed"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="judge123"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Unrestricted Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Allow Access to ALL Summits &amp; Programs</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Judge can evaluate any program across all summits without requiring individual summit allocation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUnrestricted(!unrestricted)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                unrestricted ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  unrestricted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Mark Editing Permission Toggle */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/50 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#0E7C86]" />
                <span>Allow Re-Editing Submitted Marks (Unrestricted Editing)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When enabled, judge can re-edit scores anytime. When disabled, scores are locked upon saving.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAllowMarkEditing(!allowMarkEditing)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                allowMarkEditing ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  allowMarkEditing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Summit & Program Allocation (When restricted) */}
          {!unrestricted && (
            <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-700">
              {/* 1. Allocate Summits */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>Allocate Summits ({assignedSummits.length} Selected):</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignedSummits(summits.map(s => s.id))}
                      className="text-[11px] text-emerald-600 font-bold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAssignedSummits([])}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-slate-900">
                  {summits.length === 0 ? (
                    <div className="text-slate-400 p-2 italic text-center">No summits scheduled yet.</div>
                  ) : (
                    summits.map(s => {
                      const checked = assignedSummits.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center justify-between p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) setAssignedSummits(prev => [...prev, s.id]);
                                else setAssignedSummits(prev => prev.filter(id => id !== s.id));
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{s.date || 'Scheduled'}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. Allocate Programs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>Assign Specific Programs ({assignedPrograms.length} Selected):</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignedPrograms(filteredProgramsAdd.map(p => p.id))}
                      className="text-[11px] text-emerald-600 font-bold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAssignedPrograms([])}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-slate-900">
                  {filteredProgramsAdd.length === 0 ? (
                    <div className="text-slate-400 p-2 italic text-center">No programs matching filter.</div>
                  ) : (
                    filteredProgramsAdd.map(p => {
                      const checked = assignedPrograms.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center justify-between p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) setAssignedPrograms(prev => [...prev, p.id]);
                                else setAssignedPrograms(prev => prev.filter(id => id !== p.id));
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                          </div>
                          <span className="text-[10px] uppercase font-mono text-slate-400">{p.sectionId}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-4 shadow-xs"
          >
            Create Judge
          </button>
        </form>
      </Modal>

      {/* Edit Judge Modal */}
      {editingJudge && (
        <Modal isOpen={Boolean(editingJudge)} onClose={() => setEditingJudge(null)} title="Configure Judge, Summits &amp; Restrictions" maxWidth="max-w-lg">
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Judge Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Reset Password (empty = keep)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Unrestricted Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Allow Access to ALL Summits &amp; Programs</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When enabled, this judge can evaluate any summit and program.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditUnrestricted(!editUnrestricted)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  editUnrestricted ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    editUnrestricted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Mark Editing Permission Toggle */}
            <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/50 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-[#0E7C86]" />
                  <span>Allow Re-Editing Submitted Marks (Unrestricted Editing)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When enabled, this judge can update scores. When disabled, scores are locked once submitted.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditAllowMarkEditing(!editAllowMarkEditing)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  editAllowMarkEditing ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    editAllowMarkEditing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Summit & Program Allocation (When restricted) */}
            {!editUnrestricted && (
              <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                {/* 1. Allocate Summits */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>Allocate Summits ({editAssignedSummits.length} Selected):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditAssignedSummits(summits.map(s => s.id))}
                        className="text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setEditAssignedSummits([])}
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-slate-900">
                    {summits.length === 0 ? (
                      <div className="text-slate-400 p-2 italic text-center">No summits scheduled yet.</div>
                    ) : (
                      summits.map(s => {
                        const checked = editAssignedSummits.includes(s.id);
                        return (
                          <label key={s.id} className="flex items-center justify-between p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) setEditAssignedSummits(prev => [...prev, s.id]);
                                  else setEditAssignedSummits(prev => prev.filter(id => id !== s.id));
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{s.date || 'Scheduled'}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Assign Specific Programs */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Gavel className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>Assigned Programs ({editAssignedPrograms.length} Selected):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditAssignedPrograms(filteredProgramsEdit.map(p => p.id))}
                        className="text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setEditAssignedPrograms([])}
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter programs..."
                      value={editProgramSearch}
                      onChange={(e) => setEditProgramSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-slate-900">
                    {filteredProgramsEdit.length === 0 ? (
                      <div className="text-slate-400 p-2 italic text-center">No programs matching filter.</div>
                    ) : (
                      filteredProgramsEdit.map(p => {
                        const checked = editAssignedPrograms.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center justify-between p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) setEditAssignedPrograms(prev => [...prev, p.id]);
                                  else setEditAssignedPrograms(prev => prev.filter(id => id !== p.id));
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                            </div>
                            <span className="text-[10px] uppercase font-mono text-slate-400">{p.sectionId}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-4 shadow-xs"
            >
              Update Judge &amp; Allocations
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Judge Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingJudgeId)}
        onClose={() => setDeletingJudgeId(null)}
        onConfirm={() => {
          if (deletingJudgeId) {
            deleteJudge(deletingJudgeId, currentUser?.username);
            setDeletingJudgeId(null);
          }
        }}
        title="Delete Judge"
        message="Are you sure you want to remove this judge? Their assignments will be unlinked."
      />
    </div>
  );
};
