import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AttendanceManager } from '../attendance/AttendanceManager';
import { exportMonthlyReportExcel } from '../../utils/excel';
import { generateComprehensiveAcademicReportPDF } from '../../utils/comprehensivePdfReport';
import { computeComprehensiveReport, formatMonthLabel } from '../../utils/reportCalculations';
import { Modal } from '../common/Modal';
import {
  Shield,
  Users,
  Clock,
  Scale,
  Award,
  Trophy,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  AlertCircle,
  FileSpreadsheet,
  UserPlus,
  Layers,
  Calendar,
  AlertTriangle,
  UserCheck,
  Building
} from 'lucide-react';

export const TeamLeaderDashboard = ({ activeTab, setActiveTab }) => {
  const {
    teams,
    students,
    classes,
    sections,
    fields,
    programs,
    entries,
    marks,
    summits,
    programResultsMap,
    teamStandings,
    studentAttendanceMap,
    submitLeaderMarksBatch,
    nominateStudentForProgram,
    removeStudentEntry
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Find leader's team
  const myTeam = useMemo(() => {
    return teams.find(t => t.id === currentUser?.teamId) || teams[0];
  }, [teams, currentUser]);

  const myTeamStanding = useMemo(() => {
    return teamStandings.find(t => t.id === myTeam?.id) || {
      rank: 1, totalPoints: 0, thamheediyyaPoints: 0, aliyaPoints: 0, marksPercentage: 0, avgAttendancePct: 0
    };
  }, [teamStandings, myTeam]);

  // My members only
  const myMembers = useMemo(() => {
    return students.filter(s => s.teamId === myTeam?.id);
  }, [students, myTeam]);

  const classesMap = useMemo(() => Object.fromEntries(classes.map(c => [c.id, c])), [classes]);
  const fieldsMap = useMemo(() => Object.fromEntries(fields.map(f => [f.id, f])), [fields]);

  // Programs where leader upload is enabled
  const leaderUploadPrograms = useMemo(() => {
    return programs.filter(p => p.allowLeaderMarkEntry);
  }, [programs]);

  const [selectedUploadProgramId, setSelectedUploadProgramId] = useState(leaderUploadPrograms[0]?.id || '');
  const [uploadMarksInput, setUploadMarksInput] = useState({});
  const [submittedMsg, setSubmittedMsg] = useState('');

  // Selected program for mark upload
  const currentUploadProgram = programs.find(p => p.id === selectedUploadProgramId);
  const myEntriesInUploadProg = entries.filter(e => e.programId === selectedUploadProgramId && e.teamId === myTeam.id);

  // Check if leader has already submitted marks for this program
  const alreadySubmitted = useMemo(() => {
    return myEntriesInUploadProg.some(entry => {
      return marks.some(m => m.programId === selectedUploadProgramId && (m.entryId === entry.id || m.studentId === entry.studentId) && m.enteredBy === currentUser?.id);
    });
  }, [myEntriesInUploadProg, marks, selectedUploadProgramId, currentUser]);

  // --- NOMINATIONS STATE ---
  const [nominationSummitId, setNominationSummitId] = useState(summits.find(s => s.status === 'open')?.id || summits[0]?.id);
  const [nominationSectionFilter, setNominationSectionFilter] = useState('all');
  const [nominatingProgram, setNominatingProgram] = useState(null);
  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [selectedGroupNominees, setSelectedGroupNominees] = useState([]);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [nominationError, setNominationError] = useState('');
  const [nominationSuccess, setNominationSuccess] = useState('');

  const activeNominationSummit = summits.find(s => s.id === nominationSummitId) || summits[0];

  // Programs assigned to leader's team in selected summit
  const myAssignedSummitPrograms = useMemo(() => {
    return programs.filter(p => {
      if (p.summitId !== nominationSummitId) return false;
      if (nominationSectionFilter !== 'all' && p.sectionId !== nominationSectionFilter && p.sectionId !== 'both') return false;

      // In Thamheediyya, automatically assigned to all teams
      if (p.sectionId === 'thamheediyya') return true;

      // In Aliya, check team allocation
      const alloc = p.teamAllocations?.[myTeam.id];
      return alloc ? alloc.assigned : true;
    });
  }, [programs, nominationSummitId, nominationSectionFilter, myTeam]);

  // Handle Mark Change
  const handleMarkChange = (entryId, val) => {
    setUploadMarksInput(prev => ({ ...prev, [entryId]: val }));
  };

  const handleLeaderSubmitMarks = (e) => {
    e.preventDefault();
    if (alreadySubmitted) return;

    const payload = myEntriesInUploadProg.map(entry => ({
      entryId: entry.id,
      studentId: entry.studentId,
      mark: uploadMarksInput[entry.id] || 0
    }));

    submitLeaderMarksBatch(
      selectedUploadProgramId,
      currentUser.id,
      currentUser.name,
      payload,
      `leader:${currentUser.name}`
    );

    setSubmittedMsg("Marks submitted successfully! As per policy, submitted scores cannot be re-edited and are sent for administrative review.");
    setTimeout(() => setSubmittedMsg(''), 4000);
  };

  // Open Nomination Modal
  const handleOpenNominateModal = (prog) => {
    setNominatingProgram(prog);
    setSelectedNomineeId('');
    setSelectedGroupNominees([]);
    setGroupNameInput('');
    setNominationError('');
    setNominationSuccess('');
  };

  // Submit Nomination
  const handleNominateSubmit = (e) => {
    e.preventDefault();
    if (!nominatingProgram) return;

    const leaderTitle = `${currentUser.name} (${currentUser.leaderRole === 'leader2' ? 'Leader 2' : 'Leader 1'})`;

    let res;
    if (nominatingProgram.type === 'group') {
      res = nominateStudentForProgram({
        programId: nominatingProgram.id,
        memberIds: selectedGroupNominees,
        teamId: myTeam.id,
        groupName: groupNameInput || `${myTeam.name} Ensemble`
      }, currentUser.username, currentUser.id, leaderTitle);
    } else {
      if (!selectedNomineeId) {
        setNominationError("Please select an eligible student from your team.");
        return;
      }
      res = nominateStudentForProgram({
        programId: nominatingProgram.id,
        studentId: selectedNomineeId,
        teamId: myTeam.id
      }, currentUser.username, currentUser.id, leaderTitle);
    }

    if (!res.success) {
      setNominationError(res.error);
    } else {
      setNominationSuccess("Student successfully enrolled!");
      setSelectedNomineeId('');
      setSelectedGroupNominees([]);
      setGroupNameInput('');
      setTimeout(() => setNominationSuccess(''), 2500);
    }
  };

  // Export team monthly report
  const handleExportTeamReport = () => {
    const rows = [];
    programs.forEach(prog => {
      const results = programResultsMap[prog.id] || [];
      results.filter(r => r.teamId === myTeam.id).forEach(r => {
        const st = students.find(s => s.id === r.studentId);
        rows.push({
          date: prog.date,
          programName: prog.name,
          category: prog.category,
          type: prog.type,
          participantName: r.participantName,
          chestNo: r.chestNo,
          className: classesMap[st?.classId]?.name || '-',
          teamName: myTeam.name,
          finalMark: r.finalMark,
          grade: r.grade,
          position: r.position
        });
      });
    });
    exportMonthlyReportExcel(rows, `Team_${myTeam.name}`);
  };

  const handleDownloadTeamMonthlyReport = () => {
    const activeMonth = summits.find(s => s.status === 'completed' || s.status === 'published')?.month || '2026-10';
    const repData = computeComprehensiveReport({
      summits,
      programs,
      entries,
      marks,
      attendance,
      students,
      classes,
      teams,
      fields,
      settings: {},
      periodMonths: [activeMonth],
      teamFilter: myTeam.id,
      viewMode: 'team_wise'
    });

    generateComprehensiveAcademicReportPDF({
      reportData: repData,
      reportType: 'monthly',
      periodTitle: `${myTeam.name} - ${formatMonthLabel(activeMonth)}`,
      viewMode: 'team_wise',
      detailMode: 'detailed',
      sectionFilter: 'all',
      settings: {}
    });
  };

  return (
    <div className="space-y-6">
      {/* Team Header Banner */}
      <div 
        className="p-6 rounded-xl text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: `linear-gradient(135deg, #0F2A4A 0%, ${myTeam.color} 100%)`
        }}
      >
        <div className="space-y-1 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>House Command Console</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
              {currentUser.leaderRole === 'leader2' ? 'Leader 2' : 'Leader 1'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold text-slate-100">
              Scope: {currentUser.sectionRestriction === 'all' || !currentUser.sectionRestriction ? 'Full House' : currentUser.sectionRestriction === 'aliya' ? 'Aliya Only' : 'Thamheediyya Only'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>{myTeam.name}</span>
          </h2>
          <p className="text-xs text-slate-200">
            Active Leader: <strong>{currentUser.name}</strong> • 
            {(() => {
              const coLeader = students.find(s => s.teamId === myTeam.id && s.isLeader && s.id !== currentUser.id);
              return coLeader ? ` Co-Leader: ${coLeader.name} (${coLeader.leaderRole === 'leader2' ? 'Leader 2' : 'Leader 1'}) • ` : ' ';
            })()}
            Enrolled House Members: <strong>{myMembers.length} Students</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={handleDownloadTeamMonthlyReport}
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Monthly Team PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('nominations')}
            className="px-3.5 py-2 rounded-xl bg-white text-[#0F2A4A] font-bold text-xs flex items-center gap-1.5 shadow-xs transition hover:bg-slate-100"
          >
            <UserPlus className="w-4 h-4 text-[#0E7C86]" />
            <span>Summit Nominations</span>
          </button>

          <button
            onClick={handleExportTeamReport}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Overview & Roster */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">House Standings</span>
              <div className="text-xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#C9A227]" />
                <span>Rank #{myTeamStanding.rank}</span>
              </div>
              <span className="text-[10px] text-slate-400">Total: {myTeamStanding.totalPoints.toFixed(1)} pts</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Thamheediyya Points</span>
              <div className="text-xl font-bold text-[#0E7C86] font-mono">
                {myTeamStanding.thamheediyyaPoints != null ? myTeamStanding.thamheediyyaPoints.toFixed(1) : '0.0'}
              </div>
              <span className="text-[10px] text-slate-400">Class 1 &amp; 2 Division</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Aliya Points</span>
              <div className="text-xl font-bold text-[#C9A227] font-mono">
                {myTeamStanding.aliyaPoints != null ? myTeamStanding.aliyaPoints.toFixed(1) : '0.0'}
              </div>
              <span className="text-[10px] text-slate-400">Class 3 to 5 Division</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Attendance</span>
              <div className="text-xl font-bold text-emerald-600 font-mono">
                {myTeamStanding.avgAttendancePct.toFixed(0)}%
              </div>
              <span className="text-[10px] text-slate-400">Mandatory Sessions</span>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0E7C86]" />
                <span>House Members Roster ({myMembers.length})</span>
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b">
                  <tr>
                    <th className="py-2.5 px-4">Chest #</th>
                    <th className="py-2.5 px-4">Member Name</th>
                    <th className="py-2.5 px-4">CIC Number</th>
                    <th className="py-2.5 px-4">Section &amp; Class</th>
                    <th className="py-2.5 px-4 text-center">Marks (Obt / Max)</th>
                    <th className="py-2.5 px-4 text-center">Marks %</th>
                    <th className="py-2.5 px-4 text-center">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {myMembers.map(member => {
                    const att = studentAttendanceMap[member.id];
                    let myObtained = 0;
                    let myMax = 0;

                    Object.entries(programResultsMap).forEach(([progId, list]) => {
                      const prog = programs.find(p => p.id === progId);
                      if (prog && prog.status === 'published') {
                        const r = list.find(x => x.studentId === member.id || (x.memberIds && x.memberIds.includes(member.id)));
                        if (r) {
                          myObtained += r.finalMark;
                          myMax += r.maxMarks;
                        }
                      }
                    });

                    const pct = myMax > 0 ? (myObtained / myMax) * 100 : 0;
                    const sec = sections.find(s => s.id === member.sectionId);

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-mono font-bold text-[#0F2A4A] dark:text-[#0E7C86]">{member.chestNo}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {member.name} {member.id === currentUser.id && '(You)'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{member.cicNo}</td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-[#0E7C86]">{sec?.name?.split(' ')[0] || member.sectionId}</span>
                          <span className="text-slate-400 text-[11px] block">{classesMap[member.classId]?.name || member.classId}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold">{myObtained.toFixed(1)} / {myMax}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-[#0E7C86]">{pct.toFixed(0)}%</td>
                        <td className="py-2.5 px-4 text-center font-mono">{att?.percentage.toFixed(0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SUMMIT PROGRAM NOMINATIONS (Requirement E & F) */}
      {activeTab === 'nominations' && (
        <div className="space-y-5">
          {/* Summit Selector Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Select Summit:
                </label>
                <select
                  value={nominationSummitId}
                  onChange={(e) => setNominationSummitId(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-[#0F2A4A] dark:text-white"
                >
                  {summits.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.month})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Section Filter:
                </label>
                <select
                  value={nominationSectionFilter}
                  onChange={(e) => setNominationSectionFilter(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Sections</option>
                  <option value="thamheediyya">Thamheediyya (Class 1 &amp; 2)</option>
                  <option value="aliya">Aliya (Class 3, 4 &amp; 5)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                activeNominationSummit.registrationLocked
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}>
                {activeNominationSummit.registrationLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{activeNominationSummit.registrationLocked ? 'Registration Locked by Admin' : 'Nomination Window Open'}</span>
              </span>
            </div>
          </div>

          {/* Assigned Programs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignedSummitPrograms.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-1">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-sm">No programs assigned to your house for this summit selection.</p>
              </div>
            ) : (
              myAssignedSummitPrograms.map(prog => {
                const progEntries = entries.filter(e => e.programId === prog.id && e.teamId === myTeam.id);
                const alloc = prog.teamAllocations?.[myTeam.id];
                const allowedCount = alloc ? alloc.allowedCount : (prog.defaultAllowedPerTeam || 1);
                const isFilled = progEntries.length >= allowedCount;
                const fld = fields.find(f => f.id === prog.fieldId);
                const sec = sections.find(s => s.id === prog.sectionId);

                return (
                  <div
                    key={prog.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-mono">
                          {sec?.name?.split(' ')[0] || prog.sectionId} • {fld?.name || 'Field'}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isFilled
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/80'
                        }`}>
                          {isFilled ? 'Slots Filled' : 'Slots Unfilled'} ({progEntries.length}/{allowedCount})
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {prog.name}
                      </h4>

                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Format: <strong className="text-slate-700 dark:text-slate-300 uppercase font-mono">{prog.type}</strong></span>
                        <span>Time: <strong className="text-slate-700 dark:text-slate-300">{prog.time}</strong></span>
                        <span>Venue: <strong className="text-slate-700 dark:text-slate-300">{prog.stage}</strong></span>
                      </div>

                      {/* Current Nominated Members */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Nominated House Participants:
                        </span>
                        {progEntries.length === 0 ? (
                          <p className="text-amber-600 dark:text-amber-400 italic text-[11px]">
                            ⚠️ No member nominated yet. ({allowedCount} empty slot{allowedCount > 1 ? 's' : ''} available)
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {progEntries.map(e => {
                              const st = students.find(s => s.id === e.studentId);
                              return (
                                <div key={e.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <strong className="text-slate-900 dark:text-white font-semibold">{e.groupName || st?.name}</strong>
                                      <span className="text-slate-400 text-[11px] ml-1.5 font-mono">({e.chestNo})</span>
                                    </div>
                                    {!activeNominationSummit.registrationLocked && (
                                      <button
                                        onClick={() => removeStudentEntry(
                                          e.id,
                                          currentUser.username,
                                          currentUser.id,
                                          `${currentUser.name} (${currentUser.leaderRole === 'leader2' ? 'Leader 2' : 'Leader 1'})`
                                        )}
                                        className="text-rose-600 hover:text-rose-700 hover:underline text-[11px] font-bold"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>Nominated by: <strong className="text-slate-600 dark:text-slate-300">{e.nominatedBy || 'Leader'}</strong></span>
                                    {e.nominatedAt && (
                                      <span className="font-mono">{new Date(e.nominatedAt).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {!isFilled && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                                • {allowedCount - progEntries.length} slot(s) still unfilled.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => handleOpenNominateModal(prog)}
                        disabled={activeNominationSummit.registrationLocked || isFilled}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isFilled ? 'Slots Full' : 'Nominate Student'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Members Only List */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
            House Members &amp; Program Enrolment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myMembers.map(m => {
              const enrolledProgs = programs.filter(p => {
                const pEntries = entries.filter(e => e.programId === p.id);
                return pEntries.some(e => e.studentId === m.id || (e.memberIds && e.memberIds.includes(m.id)));
              });

              return (
                <div key={m.id} className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                      <p className="text-xs text-slate-400">Chest: {m.chestNo} • CIC: {m.cicNo}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {classesMap[m.classId]?.name}
                    </span>
                  </div>

                  <div className="pt-2 border-t text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Enrolled Programs:</span>
                    {enrolledProgs.length === 0 ? (
                      <p className="text-slate-400 italic text-[11px]">No programs enrolled yet.</p>
                    ) : (
                      enrolledProgs.map(p => (
                        <div key={p.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{p.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: Attendance Taking */}
      {activeTab === 'attendance' && (
        <AttendanceManager isLeaderView={true} leaderTeamId={myTeam.id} />
      )}

      {/* VIEW 5: Mark Upload Console */}
      {activeTab === 'mark_upload' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Team Leader Mark Entry Policy</span>
            </div>
            <p>
              You may upload scores for members of your own house in programs designated for leader evaluation. <strong>Important:</strong> Once you click Submit, your entries are permanently locked and cannot be edited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Select Designated Event:
            </label>
            <select
              value={selectedUploadProgramId}
              onChange={(e) => setSelectedUploadProgramId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
            >
              {leaderUploadPrograms.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>

          {currentUploadProgram && (
            <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">{currentUploadProgram.name}</h4>
                  <p className="text-xs text-slate-400">{currentUploadProgram.category} • Max Marks: 10</p>
                </div>
                {alreadySubmitted && (
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Already Submitted (Read-Only)
                  </span>
                )}
              </div>

              <form onSubmit={handleLeaderSubmitMarks} className="space-y-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-2.5">Chest #</th>
                      <th className="p-2.5">Member Name</th>
                      <th className="p-2.5 w-40 text-center">Score (0.0 to 10.0)</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myEntriesInUploadProg.map(entry => {
                      const st = students.find(s => s.id === entry.studentId);
                      return (
                        <tr key={entry.id}>
                          <td className="p-2.5 font-mono font-bold text-[#0E7C86]">{entry.chestNo}</td>
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{st?.name}</td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              disabled={alreadySubmitted}
                              value={uploadMarksInput[entry.id] || ''}
                              onChange={(e) => handleMarkChange(entry.id, e.target.value)}
                              className="w-24 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-center font-bold"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="text-[10px] font-bold text-slate-400">
                              {alreadySubmitted ? 'Submitted' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!alreadySubmitted && (
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0F2A4A] text-white font-semibold rounded-xl"
                  >
                    Submit Scores for Administrative Approval
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW 6: Published Marks & Results */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
            Official Published Results for House {myTeam.name}
          </h3>

          <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-4">Participant</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-center">Score (Obt / Max)</th>
                  <th className="py-2.5 px-4 text-center">Percentage</th>
                  <th className="py-2.5 px-4 text-center">Grade</th>
                  <th className="py-2.5 px-4 text-center">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {programs.filter(p => p.status === 'published').map(prog => {
                  const results = programResultsMap[prog.id]?.filter(r => r.teamId === myTeam.id) || [];
                  return results.map(r => (
                    <tr key={r.entryId}>
                      <td className="py-2.5 px-4 font-bold text-[#0F2A4A] dark:text-white">{prog.name}</td>
                      <td className="py-2.5 px-4 font-semibold">{r.participantName} ({r.chestNo})</td>
                      <td className="py-2.5 px-4 text-slate-400">{prog.date}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold">{r.finalMark.toFixed(1)} / {r.maxMarks}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-[#0E7C86]">{r.percentage.toFixed(0)}%</td>
                      <td className="py-2.5 px-4 text-center font-bold">{r.grade}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-amber-600">{r.position}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 7: House Standings */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
            Overall House Standings (View Only)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamStandings.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border-2 space-y-2 ${
                  t.id === myTeam.id ? 'ring-2 ring-[#0E7C86]' : ''
                }`}
                style={{ borderColor: `${t.color}50` }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Rank #{t.rank} {t.id === myTeam.id && '(Your Team)'}
                  </span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{t.name}</h4>
                <div className="text-xl font-bold text-[#0E7C86] font-mono">
                  {t.totalPoints.toFixed(1)} <span className="text-xs font-normal text-slate-400">pts</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t">
                  <span>Thamheediyya: <strong>{t.thamheediyyaPoints?.toFixed(1) || '0.0'}</strong></span>
                  <span>Aliya: <strong>{t.aliyaPoints?.toFixed(1) || '0.0'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOMINATION MODAL */}
      {nominatingProgram && (
        <Modal
          isOpen={true}
          onClose={() => setNominatingProgram(null)}
          title={`Nominate Member: ${nominatingProgram.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleNominateSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">{nominatingProgram.name}</span>
              <span className="text-slate-400">
                Division: <strong className="text-[#0E7C86]">{nominatingProgram.sectionId === 'aliya' ? 'Aliya (Degree)' : 'Thamheediyya (Preparatory)'}</strong> • Format: {nominatingProgram.type}
              </span>
            </div>

            {nominationError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{nominationError}</span>
              </div>
            )}

            {nominationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{nominationSuccess}</span>
              </div>
            )}

            {nominatingProgram.type === 'group' ? (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Group Name</label>
                  <input
                    type="text"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    placeholder={`e.g. ${myTeam.name} Ensemble`}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Select Group Members (Only {nominatingProgram.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'} Students from {myTeam.name}):
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y">
                    {myMembers
                      .filter(m => nominatingProgram.sectionId === 'both' || m.sectionId === nominatingProgram.sectionId)
                      .map(m => {
                        const isChecked = selectedGroupNominees.includes(m.id);
                        return (
                          <label key={m.id} className="p-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {m.name} ({m.chestNo} • {classesMap[m.classId]?.name})
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedGroupNominees(prev => [...prev, m.id]);
                                else setSelectedGroupNominees(prev => prev.filter(x => x !== m.id));
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
                  Select Member to Nominate (Eligible {nominatingProgram.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'} Members):
                </label>
                <select
                  value={selectedNomineeId}
                  onChange={(e) => setSelectedNomineeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="">-- Choose Member --</option>
                  {myMembers
                    .filter(m => nominatingProgram.sectionId === 'both' || m.sectionId === nominatingProgram.sectionId)
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.chestNo} • {classesMap[m.classId]?.name})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNominatingProgram(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
              >
                Confirm Nomination
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
