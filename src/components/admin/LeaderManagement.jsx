import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import {
  Crown,
  Key,
  UserCheck,
  Shield,
  ArrowLeftRight,
  Layers,
  AlertCircle,
  CheckCircle2,
  Lock,
  User
} from 'lucide-react';

export const LeaderManagement = () => {
  const { teams = [], students = [], classes = [], appointTeamLeader, swapTeamLeaders } = useApp();
  const { currentUser } = useAuth();

  const [appointModalData, setAppointModalData] = useState(null); // { team, role: 'leader1' | 'leader2' }
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [leaderUsername, setLeaderUsername] = useState('');
  const [leaderPassword, setLeaderPassword] = useState('leader123');
  const [sectionRestriction, setSectionRestriction] = useState('all');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const classesMap = Object.fromEntries((classes || []).map(c => [c.id, c]));

  const handleOpenAppoint = (team, role) => {
    const existingLeader = students.find(s => s.teamId === team.id && s.isLeader && s.leaderRole === role)
      || (role === 'leader1' ? students.find(s => s.id === (team.leader1Id || team.leaderId)) : students.find(s => s.id === team.leader2Id));

    setAppointModalData({ team, role });
    setSelectedStudentId(existingLeader?.id || '');
    setLeaderUsername(existingLeader?.leaderUsername || (role === 'leader2' ? `leader_${team.id}b` : `leader_${team.id}`));
    setLeaderPassword('leader123');
    setSectionRestriction(existingLeader?.leaderSectionRestriction || 'all');
  };

  const handleAppointSubmit = async (e) => {
    e.preventDefault();
    if (!appointModalData || !selectedStudentId) return;

    setLoading(true);
    try {
      await appointTeamLeader({
        teamId: appointModalData.team.id,
        leaderRole: appointModalData.role,
        studentId: selectedStudentId,
        leaderUsername: leaderUsername.trim(),
        leaderPassword: leaderPassword.trim(),
        sectionRestriction
      }, currentUser?.username);

      setActionSuccess(`Successfully appointed ${appointModalData.role === 'leader2' ? 'Leader 2' : 'Leader 1'} for ${appointModalData.team.name}!`);
      setTimeout(() => setActionSuccess(''), 3000);
      setAppointModalData(null);
    } catch (err) {
      alert("Failed to appoint leader: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = (team) => {
    try {
      swapTeamLeaders(team.id, currentUser?.username);
      setActionSuccess(`Swapped Leader 1 and Leader 2 for ${team.name}!`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>Two Team Leaders Governance (Leader 1 & Leader 2)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every house team is governed by exactly two leaders (Leader 1 and Leader 2) with independent credentials, equal permissions, and optional section restrictions.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {teams.map(team => {
          const leader1 = students.find(s => s.teamId === team.id && s.isLeader && s.leaderRole === 'leader1')
            || students.find(s => s.id === (team.leader1Id || team.leaderId));
          const leader2 = students.find(s => s.teamId === team.id && s.isLeader && s.leaderRole === 'leader2')
            || students.find(s => s.id === team.leader2Id);

          const teamMembers = students.filter(s => s.teamId === team.id);

          return (
            <div
              key={team.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              {/* Team Card Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: team.color }} />
                  <div>
                    <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                      {team.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {teamMembers.length} Active Students enrolled
                    </span>
                  </div>
                </div>

                {leader1 && leader2 && (
                  <button
                    onClick={() => handleSwap(team)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
                    title="Swap Leader 1 and Leader 2 roles"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>Swap Roles</span>
                  </button>
                )}
              </div>

              {/* Two Leaders Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Leader 1 Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50">
                        <Crown className="w-3 h-3" />
                        Leader 1
                      </span>
                      {leader1?.leaderSectionRestriction && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                          {leader1.leaderSectionRestriction === 'all' ? 'Full Team' : leader1.leaderSectionRestriction === 'aliya' ? 'Aliya' : 'Thamheediyya'}
                        </span>
                      )}
                    </div>

                    {leader1 ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{leader1.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex justify-between">
                          <span>Chest: <strong className="font-mono text-slate-700 dark:text-slate-300">{leader1.chestNo}</strong></span>
                          <span>Class: <strong>{classesMap[leader1.classId]?.name?.slice(0, 7) || 'Class'}</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                          <span>Login Username:</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{leader1.leaderUsername || 'leader1'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No Leader 1 appointed yet</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenAppoint(team, 'leader1')}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-xs transition border border-amber-500/30 text-center"
                  >
                    {leader1 ? "Change Leader 1" : "Appoint Leader 1"}
                  </button>
                </div>

                {/* Leader 2 Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#0E7C86] bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900/50">
                        <Shield className="w-3 h-3" />
                        Leader 2
                      </span>
                      {leader2?.leaderSectionRestriction && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                          {leader2.leaderSectionRestriction === 'all' ? 'Full Team' : leader2.leaderSectionRestriction === 'aliya' ? 'Aliya' : 'Thamheediyya'}
                        </span>
                      )}
                    </div>

                    {leader2 ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
                          <span className="truncate">{leader2.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex justify-between">
                          <span>Chest: <strong className="font-mono text-slate-700 dark:text-slate-300">{leader2.chestNo}</strong></span>
                          <span>Class: <strong>{classesMap[leader2.classId]?.name?.slice(0, 7) || 'Class'}</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                          <span>Login Username:</span>
                          <span className="font-mono font-bold text-[#0E7C86]">{leader2.leaderUsername || 'leader1b'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No Leader 2 appointed yet</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenAppoint(team, 'leader2')}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-[#0E7C86] font-semibold text-xs transition border border-teal-500/30 text-center"
                  >
                    {leader2 ? "Change Leader 2" : "Appoint Leader 2"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appoint / Replace Modal */}
      {appointModalData && (
        <Modal
          isOpen={true}
          onClose={() => setAppointModalData(null)}
          title={`Appoint ${appointModalData.role === 'leader2' ? 'Leader 2' : 'Leader 1'} for ${appointModalData.team.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAppointSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
              <span className="font-bold block">Leadership Reassignment Rule:</span>
              <span>If an existing student was holding this role, they will automatically revert to a normal team member. Both leaders can nominate, record attendance, and submit marks for their own team.</span>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Select Student from {appointModalData.team.name}:
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="">-- Choose Member --</option>
                {students
                  .filter(s => s.teamId === appointModalData.team.id)
                  .map(s => {
                    const sClass = classesMap[s.classId];
                    const isAlreadyOtherLeader = s.isLeader && s.leaderRole && s.leaderRole !== appointModalData.role;
                    return (
                      <option key={s.id} value={s.id} disabled={isAlreadyOtherLeader}>
                        {s.name} ({s.chestNo} • {sClass?.name || 'Class'}) {isAlreadyOtherLeader ? `[Already ${s.leaderRole === 'leader1' ? 'Leader 1' : 'Leader 2'}]` : ''}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Section Management Scope:
              </label>
              <select
                value={sectionRestriction}
                onChange={(e) => setSectionRestriction(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="all">Full Team (Both Thamheediyya & Aliya) - Recommended</option>
                <option value="thamheediyya">Thamheediyya Only (Class 1 & 2)</option>
                <option value="aliya">Aliya Only (Class 3, 4 & 5)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Restricting a leader ensures they only nominate students belonging to that division.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Login Username:
                </label>
                <input
                  type="text"
                  required
                  value={leaderUsername}
                  onChange={(e) => setLeaderUsername(e.target.value)}
                  placeholder="e.g. leader1"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Password:
                </label>
                <input
                  type="password"
                  required
                  value={leaderPassword}
                  onChange={(e) => setLeaderPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAppointModalData(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
