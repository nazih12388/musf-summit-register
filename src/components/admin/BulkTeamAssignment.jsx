import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  Search,
  CheckSquare,
  Square,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

export const BulkTeamAssignment = () => {
  const {
    students = [],
    classes = [],
    teams = [],
    sections = [],
    bulkAssignTeams,
    updateStudent
  } = useApp();
  const { currentUser } = useAuth();

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all'); // 'all', 'unassigned', 'team_a', 'team_b', 'team_c'
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // Maps
  const classesMap = useMemo(() => Object.fromEntries(classes.map(c => [c.id, c])), [classes]);
  const teamsMap = useMemo(() => Object.fromEntries(teams.map(t => [t.id, t])), [teams]);

  // Team counts
  const stats = useMemo(() => {
    const total = students.length;
    const teamCounts = {};
    teams.forEach(t => {
      teamCounts[t.id] = students.filter(s => s.teamId === t.id).length;
    });
    const unassigned = students.filter(s => !s.teamId || !teamsMap[s.teamId]).length;

    return {
      total,
      teamCounts,
      unassigned
    };
  }, [students, teams, teamsMap]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(s => {
      if (!s) return false;
      const sName = String(s.name || '').toLowerCase();
      const sCic = String(s.cicNo || '').toLowerCase();
      const sChest = String(s.chestNo || '').toLowerCase();
      const matchSearch = !q || sName.includes(q) || sCic.includes(q) || sChest.includes(q);

      const matchClass = classFilter === 'all' || s.classId === classFilter;

      let matchTeam = true;
      if (teamFilter === 'unassigned') {
        matchTeam = !s.teamId || !teamsMap[s.teamId];
      } else if (teamFilter !== 'all') {
        matchTeam = s.teamId === teamFilter;
      }

      return matchSearch && matchClass && matchTeam;
    });
  }, [students, search, classFilter, teamFilter, teamsMap]);

  // Selection handlers
  const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id));
  const isSomeFilteredSelected = filteredStudents.some(s => selectedStudentIds.includes(s.id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredSet = new Set(filteredStudents.map(s => s.id));
      setSelectedStudentIds(prev => prev.filter(id => !filteredSet.has(id)));
    } else {
      const newIds = new Set([...selectedStudentIds, ...filteredStudents.map(s => s.id)]);
      setSelectedStudentIds(Array.from(newIds));
    }
  };

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk action execution
  const handleBulkAssign = (targetTeamId) => {
    if (selectedStudentIds.length === 0) return;

    const count = selectedStudentIds.length;
    const assignments = {};
    selectedStudentIds.forEach(id => {
      assignments[id] = targetTeamId; // targetTeamId can be '' for unassign
    });

    bulkAssignTeams(assignments, currentUser?.username || 'admin');

    const teamObj = teams.find(t => t.id === targetTeamId);
    const teamName = teamObj ? teamObj.name : 'Unassigned';

    setToastMsg(`Successfully updated ${count} student(s) &rarr; ${teamName}!`);
    setTimeout(() => setToastMsg(''), 5000);
    setSelectedStudentIds([]);
  };

  // Quick 1-click single student assignment
  const handleSingleAssign = (studentId, targetTeamId) => {
    updateStudent(studentId, { teamId: targetTeamId }, currentUser?.username || 'admin');
  };

  return (
    <div className="space-y-6">
      
      {/* Pillar Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0E7C86] via-[#14919D] to-[#0F2A4A] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>Fine Arts Wing &bull; Team Assignment Tool</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Bulk Group / Team Assignment
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Assign students from the main Union directory into Summit teams (Team A, Team B, Team C) with multi-select checkboxes and class-based filters. All changes automatically sync to Firestore in real-time.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-white/10 p-2.5 rounded-xl backdrop-blur-xs border border-white/15 text-center">
          <div className="px-3 py-1 border-r border-white/20">
            <div className="text-xl font-bold font-mono text-white">{stats.total}</div>
            <div className="text-[10px] text-teal-100 uppercase tracking-wider font-semibold">Total Students</div>
          </div>
          <div className="px-3 py-1">
            <div className={`text-xl font-bold font-mono ${stats.unassigned > 0 ? 'text-amber-300 animate-pulse' : 'text-emerald-300'}`}>
              {stats.unassigned}
            </div>
            <div className="text-[10px] text-teal-100 uppercase tracking-wider font-semibold">Unassigned</div>
          </div>
        </div>
      </div>

      {/* Live Team Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {teams.map(team => {
          const count = stats.teamCounts[team.id] || 0;
          const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          const isSelectedFilter = teamFilter === team.id;

          return (
            <div
              key={team.id}
              onClick={() => setTeamFilter(isSelectedFilter ? 'all' : team.id)}
              className={`p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border transition cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md ${
                isSelectedFilter
                  ? 'ring-2 ring-[#0E7C86] border-transparent'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.color }}
              />
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                  <span>{team.name}</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {percentage}%
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {count}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">students</span>
              </div>
            </div>
          );
        })}

        {/* Unassigned Card */}
        <div
          onClick={() => setTeamFilter(teamFilter === 'unassigned' ? 'all' : 'unassigned')}
          className={`p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border transition cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md ${
            teamFilter === 'unassigned'
              ? 'ring-2 ring-amber-500 border-transparent'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Unassigned</span>
            </span>
            {stats.unassigned > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                Action Needed
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.unassigned}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">students</span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/20 animate-fade-in">
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg('')}
            className="text-white hover:text-emerald-200 ml-4 px-2 py-0.5 rounded text-sm font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#0F1B2B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or CIC..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
            >
              <option value="all">All Academic Classes (Class 1 – 5)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'})
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
            >
              <option value="all">All Statuses (Assigned & Unassigned)</option>
              <option value="unassigned">Unassigned Students Only ({stats.unassigned})</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({stats.teamCounts[t.id] || 0} students)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Controls (Visible / Active when students are selected) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-[#0E7C86]" />
              ) : isSomeFilteredSelected ? (
                <span className="w-4 h-4 rounded bg-[#0E7C86] text-white flex items-center justify-center text-[10px]">&minus;</span>
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {isAllFilteredSelected ? 'Deselect All' : `Select All Filtered (${filteredStudents.length})`}
              </span>
            </button>

            {selectedStudentIds.length > 0 && (
              <span className="text-xs font-bold text-[#0E7C86] dark:text-teal-400 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                {selectedStudentIds.length} Selected
              </span>
            )}
          </div>

          {/* Bulk Assign Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 hidden md:inline">
              Assign Selected To:
            </span>

            {teams.map(team => (
              <button
                key={team.id}
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={() => handleBulkAssign(team.id)}
                className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: team.color }}
                title={`Assign ${selectedStudentIds.length} students to ${team.name}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{team.name}</span>
              </button>
            ))}

            <button
              type="button"
              disabled={selectedStudentIds.length === 0}
              onClick={() => handleBulkAssign('')}
              className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
              title="Remove selected students from their current team"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Unassign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Roster Table */}
      <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">CIC Number</th>
                <th className="py-3 px-3">Academic Class</th>
                <th className="py-3 px-3">Contact &amp; Place</th>
                <th className="py-3 px-3">Current Summit Team</th>
                <th className="py-3 px-3 text-right">Quick Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No students match the current filters or search query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const currentTeam = teamsMap[student.teamId];
                  const cl = classesMap[student.classId];
                  const isChecked = selectedStudentIds.includes(student.id);

                  return (
                    <tr
                      key={student.id}
                      onClick={() => toggleSelectStudent(student.id)}
                      className={`transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-teal-50/70 dark:bg-teal-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectStudent(student.id)}
                          className="w-4 h-4 rounded text-[#0E7C86] focus:ring-[#0E7C86] cursor-pointer"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{student.name}</span>
                          {student.isLeader && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Team Leader
                            </span>
                          )}
                        </div>
                      </td>

                      {/* CIC */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400">
                        {student.cicNo}
                      </td>

                      {/* Class & Stage */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-200">
                            {cl?.name || student.className || student.classId}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            cl?.sectionId === 'aliya' || student.sectionId === 'aliya'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}>
                            {cl?.sectionId === 'aliya' || student.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'}
                          </span>
                        </div>
                      </td>

                      {/* Contact & Place */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {student.phone ? <span className="font-mono">{student.phone}</span> : '—'}
                          {student.place && <span className="ml-1.5 text-slate-400">&bull; {student.place}</span>}
                        </div>
                      </td>

                      {/* Current Team Badge */}
                      <td className="py-3 px-3">
                        {currentTeam ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[11px] font-bold shadow-xs"
                            style={{ backgroundColor: currentTeam.color }}
                          >
                            <Shield className="w-3 h-3" />
                            <span>{currentTeam.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Unassigned</span>
                          </span>
                        )}
                      </td>

                      {/* Quick 1-Click Change */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {teams.map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleSingleAssign(student.id, t.id)}
                              className={`w-6 h-6 rounded-full text-[10px] font-bold text-white transition active:scale-90 flex items-center justify-center ${
                                student.teamId === t.id ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: t.color }}
                              title={`Assign to ${t.name}`}
                            >
                              {t.name.replace('Team ', '')}
                            </button>
                          ))}
                          {student.teamId && (
                            <button
                              type="button"
                              onClick={() => handleSingleAssign(student.id, '')}
                              className="w-6 h-6 rounded-full bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-600 text-xs font-bold transition flex items-center justify-center"
                              title="Unassign student"
                            >
                              &times;
                            </button>
                          )}
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

    </div>
  );
};
