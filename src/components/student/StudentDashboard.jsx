import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateCertificatePDF } from '../../utils/certificate';
import {
  User,
  Award,
  Calendar,
  Clock,
  Shield,
  Trophy,
  Download,
  CheckCircle2,
  Bell,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Building,
  Layers,
  BookOpen
} from 'lucide-react';

export const StudentDashboard = ({ activeTab, setActiveTab }) => {
  const {
    students,
    teams,
    classes,
    sections,
    fields,
    programs,
    entries,
    summits,
    attendance,
    notices,
    programResultsMap,
    studentStandings,
    teamStandings,
    studentAttendanceMap,
    settings,
    certificates
  } = useApp();
  const { currentUser } = useAuth();

  const student = useMemo(() => {
    return students.find(s => s.id === currentUser?.id) || students[0];
  }, [students, currentUser]);

  const team = useMemo(() => teams.find(t => t.id === student?.teamId), [teams, student]);
  const leader = useMemo(() => students.find(s => s.id === team?.leaderId), [students, team]);
  const cl = useMemo(() => classes.find(c => c.id === student?.classId), [classes, student]);
  const sec = useMemo(() => sections.find(s => s.id === (cl?.sectionId || student?.sectionId)), [sections, cl, student]);
  const fieldsMap = useMemo(() => Object.fromEntries(fields.map(f => [f.id, f])), [fields]);
  const summitsMap = useMemo(() => Object.fromEntries(summits.map(s => [s.id, s])), [summits]);

  const myStanding = useMemo(() => {
    return studentStandings.find(s => s.id === student?.id) || {
      overallRank: 1, sectionRank: 1, classRank: 1, teamRank: 1, totalMarks: 0, totalMaxMarks: 0, marksPercentage: 0, overallPerformanceScore: 0
    };
  }, [studentStandings, student]);

  const myTeamStanding = useMemo(() => {
    return teamStandings.find(t => t.id === team?.id) || { rank: 1, totalPoints: 0 };
  }, [teamStandings, team]);

  const attData = studentAttendanceMap[student?.id] || { percentage: 0, isLowAttendance: false, summitStats: {} };

  // My registered programs & published results
  const myProgramsList = useMemo(() => {
    const list = [];
    programs.forEach(prog => {
      const progEntries = entries.filter(e => e.programId === prog.id);
      const isEnrolled = progEntries.some(e => e.studentId === student?.id || (e.memberIds && e.memberIds.includes(student?.id)));

      if (isEnrolled) {
        const results = programResultsMap[prog.id] || [];
        const res = results.find(r => r.studentId === student?.id || (r.memberIds && r.memberIds.includes(student?.id)));
        const isPublished = prog.status === 'published';
        const fld = fieldsMap[prog.fieldId];
        const sm = summitsMap[prog.summitId];

        list.push({
          program: prog,
          fieldName: fld?.name || prog.category || 'General',
          summitName: sm?.name || 'Summit',
          isPublished,
          obtainedMark: isPublished ? res?.finalMark : null,
          maxMarks: prog.maxMarks || 10,
          marksPercentage: isPublished && res ? res.percentage : null,
          grade: isPublished ? res?.grade : '-',
          position: isPublished ? res?.position : '-',
          rank: isPublished ? res?.rank : null
        });
      }
    });
    return list;
  }, [programs, entries, programResultsMap, student, fieldsMap, summitsMap]);

  // Next upcoming program
  const nextProgram = useMemo(() => {
    return myProgramsList.find(p => !p.isPublished) || null;
  }, [myProgramsList]);

  // Official Merit Certificates: Top Performers of the Month & Class-wise Toppers (Published only)
  const myCertificates = useMemo(() => {
    return (certificates || []).filter(c => c.studentId === student?.id && c.isPublished);
  }, [certificates, student]);

  const handleDownloadCert = (cert) => {
    generateCertificatePDF(cert);
  };

  return (
    <div className="space-y-6">
      {/* Student Header Banner */}
      <div 
        className="p-4 sm:p-6 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: `linear-gradient(135deg, ${team?.color || '#0E7C86'} 0%, #0F2A4A 100%)`
        }}
      >
        <div className="space-y-1 relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              {sec?.name?.split(' ')[0] || (student?.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya')} Division
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{student?.name}</h2>

          <div className="text-[11px] sm:text-xs text-white/80 flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
            <span>CIC: <strong className="text-white font-mono">{student?.cicNo}</strong></span>
            <span>•</span>
            <span>Class: <strong className="text-white">{cl?.name}</strong></span>
            <span>•</span>
            <span>House: <strong className="text-white">{team?.name}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">House Leader: <strong className="text-white">{leader?.name || 'Assigned'}</strong></span>
          </div>
        </div>

        {/* Badges / Quick Stats */}
        <div className="flex items-center gap-2.5 relative z-10 w-full sm:w-auto">
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <div className="p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center min-w-[64px] sm:min-w-[90px]">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70 block">Section</span>
              <div className="text-sm sm:text-lg font-bold text-white font-mono">#{myStanding.sectionRank || 1}</div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center min-w-[64px] sm:min-w-[90px]">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70 block">Class</span>
              <div className="text-sm sm:text-lg font-bold text-white font-mono">#{myStanding.classRank || 1}</div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center min-w-[64px] sm:min-w-[90px]">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70 block">Overall</span>
              <div className="text-sm sm:text-lg font-bold text-amber-300 font-mono">#{myStanding.overallRank || myStanding.rank || 1}</div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks</span>
              <div className="text-xl font-bold text-[#0F2A4A] dark:text-white font-mono">
                {myStanding.totalMarks.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ {myStanding.totalMaxMarks}</span>
              </div>
              <span className="text-[10px] text-slate-400">{myStanding.programsAssignedCount} Enrolled Events</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Marks Percentage</span>
              <div className="text-xl font-bold text-[#0E7C86] font-mono">
                {myStanding.marksPercentage.toFixed(0)}%
              </div>
              <span className="text-[10px] text-slate-400">Cumulative Standard</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
              <div className="text-xl font-bold text-emerald-600 font-mono">
                {attData.percentage.toFixed(0)}%
              </div>
              <span className="text-[10px] text-slate-400">{attData.presentSessions} / {attData.totalSessions} Sessions</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Scheduled</span>
              {nextProgram ? (
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[140px]">
                    {nextProgram.program.name}
                  </div>
                  <span className="text-[10px] text-[#0E7C86] font-mono block">{nextProgram.program.date}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No upcoming events</span>
              )}
            </div>
          </div>

          {/* MOBILE EVALUATIONS FEED (Screens < 768px): Zero Horizontal Scroll */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
              <span>My Official Published Evaluations</span>
              <span className="text-[11px] text-[#0E7C86] font-mono">
                Division: {sec?.name?.split(' ')[0] || student?.sectionId}
              </span>
            </div>

            {myProgramsList.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs">
                No evaluation records published yet.
              </div>
            ) : (
              myProgramsList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                        {item.program.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#0E7C86] font-semibold mt-0.5">
                        <span>{item.fieldName}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.summitName}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isPublished
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.isPublished ? 'Declared' : 'Scheduled'}
                    </span>
                  </div>

                  {item.isPublished ? (
                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Score</span>
                        <span className="font-mono font-bold text-[#0E7C86] text-xs">
                          {item.obtainedMark != null ? `${item.obtainedMark.toFixed(1)}/${item.maxMarks}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">%</span>
                        <span className="font-mono font-bold text-xs">
                          {item.marksPercentage != null ? `${item.marksPercentage.toFixed(0)}%` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Grade</span>
                        <span className="font-bold text-xs">
                          {item.grade || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Position</span>
                        <span className="font-bold text-xs text-amber-600">
                          {item.position || '-'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-400 italic">
                      Scheduled for {item.program.date} at {item.program.stage}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* DESKTOP EVALUATIONS TABLE (Screens >= 768px) */}
          <div className="hidden md:block bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>My Official Published Evaluations</span>
              <span className="text-[11px] text-[#0E7C86] font-mono">
                Division: {sec?.name?.split(' ')[0] || student?.sectionId}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b">
                  <tr>
                    <th className="py-2.5 px-4">Program Event</th>
                    <th className="py-2.5 px-4">Field Group</th>
                    <th className="py-2.5 px-4">Summit &amp; Venue</th>
                    <th className="py-2.5 px-4 text-center">Score (Obt / Max)</th>
                    <th className="py-2.5 px-4 text-center">Percentage</th>
                    <th className="py-2.5 px-4 text-center">Grade</th>
                    <th className="py-2.5 px-4 text-center">Position</th>
                    <th className="py-2.5 px-4 text-right">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myProgramsList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-bold text-[#0F2A4A] dark:text-white">
                        {item.program.name}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#0E7C86]">{item.fieldName}</td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        <div>{item.summitName}</div>
                        <div>{item.program.date} • {item.program.stage}</div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-[#0E7C86]">
                        {item.isPublished && item.obtainedMark != null ? `${item.obtainedMark.toFixed(1)} / ${item.maxMarks}` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold">
                        {item.isPublished && item.marksPercentage != null ? `${item.marksPercentage.toFixed(0)}%` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold">
                        {item.isPublished ? item.grade : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-amber-600">
                        {item.isPublished ? item.position : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {item.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Declared</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-medium">Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: My Programs Schedule */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
            My Registered Programs &amp; Timetable
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProgramsList.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-mono">
                      {item.fieldName}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.program.type}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.isPublished ? 'Results Declared' : 'Upcoming Event'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {item.program.name}
                </h4>

                <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                  <div>Summit: <strong>{item.summitName}</strong></div>
                  <div>Scheduled: <strong>{item.program.date} at {item.program.time}</strong></div>
                  <div>Venue: <strong>{item.program.stage}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
            My Summit Attendance Records
          </h3>

          <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="p-3">Summit</th>
                  <th className="p-3 text-center">START Session</th>
                  <th className="p-3 text-center">MID Session</th>
                  <th className="p-3 text-center">END Session</th>
                  <th className="p-3 text-center">Summit Att %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summits.map(s => {
                  const sAtt = attendance.filter(a => a.summitId === s.id && a.studentId === student.id);
                  const startRec = sAtt.find(a => a.session === 'START');
                  const midRec = sAtt.find(a => a.session === 'MID');
                  const endRec = sAtt.find(a => a.session === 'END');
                  const stat = attData.summitStats?.[s.id];

                  return (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                      <td className="p-3 text-center font-semibold">{startRec?.status || '-'}</td>
                      <td className="p-3 text-center font-semibold">{midRec?.status || '-'}</td>
                      <td className="p-3 text-center font-semibold">{endRec?.status || '-'}</td>
                      <td className="p-3 text-center font-mono font-bold text-[#0E7C86]">
                        {stat ? stat.percentage.toFixed(0) : 0}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: Certificates */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Official Merit &amp; Distinction Certificates</span>
              </h3>
              <p className="text-xs text-slate-500">
                Collegiate certificates awarded exclusively to Top Performers of the Month and Class-Wise Toppers.
              </p>
            </div>
          </div>

          {myCertificates.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Merit Certificates Released Yet</p>
              <p className="text-xs max-w-md mx-auto text-slate-500">
                Certificates are awarded exclusively to <strong>Top Performers of the Month</strong> and <strong>Class-Wise Toppers</strong>. Once allocated and published by college administration, your certificate will be available here for download.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCertificates.map((cert) => (
                <div key={cert.id} className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border-2 border-amber-500/40 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      cert.category === 'TOP_PERFORMER_MONTH'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300'
                        : 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300'
                    }`}>
                      {cert.category === 'TOP_PERFORMER_MONTH' ? '🌟 Top Performer of Month' : '🎓 Class-Wise Academic Topper'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {cert.monthLabel || cert.month}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#0F2A4A] dark:text-white">
                      {cert.awardTitle}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic leading-relaxed">
                      "{cert.citation}"
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Class</div>
                      <div className="font-bold text-[#0F2A4A] dark:text-white truncate">{cert.className || '-'}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Marks %</div>
                      <div className="font-bold font-mono text-[#0E7C86]">{cert.marksPercentage}% ({cert.grade})</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Attendance</div>
                      <div className="font-bold font-mono text-emerald-600">{cert.attendancePercentage}%</div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[11px]">
                      Issued: {cert.issueDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadCert(cert)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1a3a60] dark:bg-[#0E7C86] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Official PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
