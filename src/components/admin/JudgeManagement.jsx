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
  AlertCircle
} from 'lucide-react';

export const JudgeManagement = () => {
  const {
    judges,
    programs,
    summits,
    settings,
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
  const [assignedPrograms, setAssignedPrograms] = useState([]);
  const [programSearch, setProgramSearch] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editUnrestricted, setEditUnrestricted] = useState(false);
  const [editAssignedPrograms, setEditAssignedPrograms] = useState([]);
  const [editProgramSearch, setEditProgramSearch] = useState('');

  const globalRestrictionsEnforced = settings?.enforceJudgeRestrictions !== false;

  const handleToggleGlobalRestrictions = () => {
    const nextVal = !globalRestrictionsEnforced;
    updateSettings({ enforceJudgeRestrictions: nextVal }, currentUser?.username || 'admin');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username) return;
    await addJudge({
      name,
      username,
      password,
      unrestricted,
      assignedPrograms: unrestricted ? [] : assignedPrograms
    }, currentUser?.username);
    setIsAddOpen(false);
    setName('');
    setUsername('');
    setPassword('judge123');
    setUnrestricted(false);
    setAssignedPrograms([]);
    setProgramSearch('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingJudge) return;
    const updates = {
      name: editName,
      username: editUsername,
      unrestricted: editUnrestricted,
      assignedPrograms: editUnrestricted ? [] : editAssignedPrograms
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
    setEditAssignedPrograms(judge.assignedPrograms || []);
    setEditProgramSearch('');
  };

  const filteredProgramsAdd = programs.filter(p =>
    p.name.toLowerCase().includes(programSearch.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(programSearch.toLowerCase()))
  );

  const filteredProgramsEdit = programs.filter(p =>
    p.name.toLowerCase().includes(editProgramSearch.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(editProgramSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-emerald-600" />
            <span>Judges & Evaluators</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {judges.length} Active
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Manage judges, grant all-program access or restrict evaluations to specific summit events.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddOpen(true);
            setUnrestricted(false);
            setAssignedPrograms([]);
          }}
          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Judge</span>
        </button>
      </div>

      {/* Global Judge Policy Banner */}
      <div className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
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
                {globalRestrictionsEnforced ? 'System Judge Restrictions: ENFORCED' : 'System Judge Restrictions: REMOVED (All Allowed)'}
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
                ? 'Judges can only mark their explicitly assigned events. You can toggle restrictions per judge below or lift restrictions globally.'
                : 'All judges are currently allowed to evaluate any program across all summits without restrictions.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleGlobalRestrictions}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0 shadow-xs ${
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

      {/* Judges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {judges.map(judge => {
          const isJudgeUnrestricted = Boolean(judge.unrestricted) || !globalRestrictionsEnforced;
          const assignedList = programs.filter(p => judge.assignedPrograms?.includes(p.id));

          return (
            <div
              key={judge.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {judge.name}
                    </h4>
                    {isJudgeUnrestricted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>All Programs</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>{assignedList.length} Assigned</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                      @{judge.username}
                    </span>
                    <span>•</span>
                    <span>{isJudgeUnrestricted ? 'No program restrictions' : `${assignedList.length} restricted events`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(judge)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    title="Edit Judge & Restrictions"
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

              {/* Quick Toggle Restriction Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Restriction Status:
                </span>
                <button
                  onClick={() => toggleJudgeRestrictions(judge.id, currentUser?.username || 'admin')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition ${
                    judge.unrestricted
                      ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                  }`}
                  title={judge.unrestricted ? "Click to restrict this judge to assigned programs only" : "Click to allow this judge to evaluate ALL programs"}
                >
                  {judge.unrestricted ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Restrict to Events</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>Remove Restrictions (Allow All)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Programs List */}
              <div className="space-y-1.5 text-xs">
                {isJudgeUnrestricted ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Unrestricted Evaluator: Can evaluate all {programs.length} programs in every summit.</span>
                  </div>
                ) : assignedList.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>No programs assigned. Click &quot;Edit&quot; or &quot;Remove Restrictions&quot; to permit scoring.</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                    {assignedList.map(p => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Judge Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Judge / Evaluator" maxWidth="max-w-lg">
        <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold mb-1">Judge Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Usthad Abdul Hameed"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. judge5"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Unrestricted Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Allow Access to ALL Programs (No Restrictions)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Judge can score any program in any summit without requiring individual assignment.
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

          {/* Program Restrictions Selector (only shown if not unrestricted) */}
          {!unrestricted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold block">Assign to Specific Programs:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignedPrograms(programs.map(p => p.id))}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Select All ({programs.length})</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setAssignedPrograms([])}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter programs by name..."
                  value={programSearch}
                  onChange={(e) => setProgramSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1">
                {filteredProgramsAdd.map(p => {
                  const checked = assignedPrograms.includes(p.id);
                  const summit = summits?.find(s => s.id === p.summitId);
                  return (
                    <label key={p.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg">
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
                        <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                      </div>
                      {summit && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {summit.name?.split('-')[0] || summit.name}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl mt-4 shadow-xs"
          >
            Create Judge
          </button>
        </form>
      </Modal>

      {/* Edit Judge Modal */}
      {editingJudge && (
        <Modal isOpen={Boolean(editingJudge)} onClose={() => setEditingJudge(null)} title="Edit Judge & Program Restrictions" maxWidth="max-w-lg">
          <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1">Judge Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Reset Password (empty = keep)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Unrestricted Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Allow Access to ALL Programs (No Restrictions)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When enabled, this judge can evaluate any program across all summits.
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

            {/* Program Restrictions Selector (only shown if not unrestricted) */}
            {!editUnrestricted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold block">
                    Assigned Programs ({editAssignedPrograms.length} selected):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditAssignedPrograms(programs.map(p => p.id))}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Select All ({programs.length})</span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEditAssignedPrograms([])}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="Filter programs by name..."
                    value={editProgramSearch}
                    onChange={(e) => setEditProgramSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1">
                  {filteredProgramsEdit.map(p => {
                    const checked = editAssignedPrograms.includes(p.id);
                    const summit = summits?.find(s => s.id === p.summitId);
                    return (
                      <label key={p.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg">
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
                          <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                        </div>
                        {summit && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {summit.name?.split('-')[0] || summit.name}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl mt-4 shadow-xs"
            >
              Update Judge & Restrictions
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
