/**
/**
 * Comprehensive Academic Report & Evaluation Calculation Engine
 * MUSF Summit Register - Majlis Umariyya Wafy College
 * 
 * Computes:
 * - Student Summit-Wise Performance (Programs, Marks, Grades, Attendance, Absent/Not Performed)
 * - Period Student Totals (Marks, Max Marks, Marks %, Attendance %, Section Rank, Class Rank, Team Rank)
 * - Class-Wise Evaluations (Grouped by Thamheediyya & Aliya)
 * - Team-Wise Evaluations (Points, Averages, Field Totals, Top 3)
 * - Period Top 10 (Section-wise & Combined)
 * - Multi-Month Trend & Comparison Matrices
 */

export const MONTH_NAMES = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December'
};

export function formatMonthLabel(monthKey) {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES[month] || month} ${year}`;
}

/**
 * Calculates grade based on marks or percentage
 */
export function getGradeFromScore(score, maxScore = 10, gradeRanges = null) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 90) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 50) return 'C';
  return 'No Grade';
}

/**
 * Computes the 1-based running index and display label of a summit within its month
 */
export function getSummitRunningInfo(summit, allSummits = []) {
  if (!summit) return { runningNumber: 1, label: 'Summit 1', monthLabel: '' };
  const monthKey = summit.month || (summit.date ? summit.date.slice(0, 7) : '');
  const monthSummits = allSummits
    .filter(s => (s.month || (s.date && s.date.slice(0, 7))) === monthKey)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const index = monthSummits.findIndex(s => s.id === summit.id);
  const runningNumber = index >= 0 ? index + 1 : 1;
  const monthLabel = formatMonthLabel(monthKey);
  const label = `${monthLabel} - Summit ${runningNumber}`;

  return {
    runningNumber,
    label,
    monthKey,
    monthLabel,
    totalInMonth: monthSummits.length
  };
}

/**
 * Core Evaluation Calculation Function
 */
export function computeComprehensiveReport({
  summits = [],
  programs = [],
  entries = [],
  marks = [],
  attendance = [],
  students = [],
  classes = [],
  teams = [],
  fields = [],
  settings = {},
  periodMonths = [], // e.g. ['2026-10'] or ['2026-10', '2026-11']
  sectionFilter = 'all', // 'all', 'thamheediyya', 'aliya'
  classFilter = 'all',
  teamFilter = 'all'
}) {
  // 1. Filter Summits in Selected Period
  const activePeriodSummits = summits
    .filter(s => {
      const m = s.month || (s.date ? s.date.slice(0, 7) : '');
      return periodMonths.length === 0 || periodMonths.includes(m);
    })
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const periodSummitIds = new Set(activePeriodSummits.map(s => s.id));

  // Pre-calculate running numbers for each summit
  const summitRunningMap = {};
  activePeriodSummits.forEach(s => {
    summitRunningMap[s.id] = getSummitRunningInfo(s, summits);
  });

  // 2. Filter Students
  const filteredStudents = students.filter(st => {
    if (st.isArchived) return false;
    // Section filter
    const cl = classes.find(c => c.id === st.classId);
    const studentSec = cl?.sectionId || st.sectionId || 'thamheediyya';
    if (sectionFilter !== 'all' && studentSec !== sectionFilter) return false;
    // Class filter
    if (classFilter !== 'all' && st.classId !== classFilter) return false;
    // Team filter
    if (teamFilter !== 'all' && st.teamId !== teamFilter) return false;
    return true;
  });

  // Map to easily look up programs & results
  const programMap = {};
  programs.forEach(p => { programMap[p.id] = p; });

  const fieldMap = {};
  fields.forEach(f => { fieldMap[f.id] = f; });

  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });

  const classMap = {};
  classes.forEach(c => { classMap[c.id] = c; });

  // 3. Compute Student Detailed Performance Block
  const studentReports = filteredStudents.map(st => {
    const cl = classMap[st.classId];
    const tm = teamMap[st.teamId];
    const secId = cl?.sectionId || st.sectionId || 'thamheediyya';
    const secName = secId === 'aliya' ? 'Aliya' : 'Thamheediyya';

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let totalProgramsPerformed = 0;
    let totalSessionsPresent = 0;

    // Summit-by-summit detailed performance
    const summitPerformances = activePeriodSummits.map(sm => {
      const runInfo = summitRunningMap[sm.id];

      // Find all programs assigned to this summit
      const smPrograms = programs.filter(p => p.summitId === sm.id);

      // Find entries where this student participated
      const studentEntries = entries.filter(e => {
        if (!e.programId) return false;
        const prog = programMap[e.programId];
        if (prog?.summitId !== sm.id) return false;
        if (e.studentId === st.id) return true;
        if (e.memberIds && Array.isArray(e.memberIds) && e.memberIds.includes(st.id)) return true;
        return false;
      });

      // Programs performed in this summit
      const programDetails = studentEntries.map(entry => {
        const prog = programMap[entry.programId];
        const fld = prog ? fieldMap[prog.fieldId] : null;

        // Marks for this entry
        const entryMarks = marks.filter(m => m.entryId === entry.id || (m.programId === prog?.id && m.studentId === st.id));
        let finalMark = null;
        let isAbsent = false;

        if (entryMarks.length > 0) {
          const approved = entryMarks.filter(m => m.status === 'approved');
          const pool = approved.length > 0 ? approved : entryMarks;
          const sum = pool.reduce((acc, m) => acc + Number(m.marks || 0), 0);
          finalMark = sum / pool.length;
        }

        // Check if explicitly marked absent or not performed
        if (finalMark === null && sm.status === 'completed') {
          isAbsent = true;
          finalMark = 0;
        }

        const maxM = prog?.maxMarks || 10;
        const score = finalMark !== null ? finalMark : 0;
        const grade = getGradeFromScore(score, maxM, settings.gradeRanges);

        return {
          entryId: entry.id,
          programId: prog?.id,
          programName: prog?.name || 'Program',
          fieldId: prog?.fieldId,
          fieldName: fld?.name || 'General',
          type: prog?.type || 'individual',
          isGroup: prog?.type === 'group',
          groupName: entry.groupName || null,
          maxMarks: maxM,
          marksObtained: score,
          grade,
          isAbsent,
          statusText: isAbsent ? 'Absent / Not Performed' : `${score.toFixed(1)} / ${maxM}`
        };
      });

      // Summit total marks
      const smObtainedMarks = programDetails.reduce((sum, p) => sum + p.marksObtained, 0);
      const smMaxMarks = programDetails.reduce((sum, p) => sum + p.maxMarks, 0);
      const smMarksPercentage = smMaxMarks > 0 ? (smObtainedMarks / smMaxMarks) * 100 : 0;

      // Summit attendance (Start, Mid, End)
      const smAttRecords = attendance.filter(a => a.summitId === sm.id && a.studentId === st.id);
      const getSessionStatus = (sess) => {
        const rec = smAttRecords.find(r => r.session === sess);
        return rec ? rec.status : 'Present'; // default to Present if not recorded
      };

      const startStatus = getSessionStatus('START');
      const midStatus = getSessionStatus('MID');
      const endStatus = getSessionStatus('END');

      const isSessPresent = (status) => {
        if (!status) return true;
        const s = status.toLowerCase();
        if (s === 'present') return true;
        if (s === 'late' && settings.lateCountsAsPresent !== false) return true;
        if (s === 'excused' && settings.excusedCountsAsPresent !== false) return true;
        return false;
      };

      const smSessionsPresent = [startStatus, midStatus, endStatus].filter(isSessPresent).length;
      const smAttendancePercentage = (smSessionsPresent / 3) * 100;

      // Accumulate totals
      totalMarksObtained += smObtainedMarks;
      totalMaxMarks += smMaxMarks;
      totalProgramsPerformed += programDetails.length;
      totalSessionsPresent += smSessionsPresent;

      return {
        summitId: sm.id,
        summitName: sm.name,
        summitDate: sm.date,
        runningLabel: runInfo.label,
        runningNumber: runInfo.runningNumber,
        programs: programDetails,
        programsCount: programDetails.length,
        obtainedMarks: smObtainedMarks,
        maxMarks: smMaxMarks,
        marksPercentage: smMarksPercentage,
        attendance: {
          start: startStatus,
          mid: midStatus,
          end: endStatus,
          sessionsPresent: smSessionsPresent,
          percentage: smAttendancePercentage
        }
      };
    });

    const totalPossibleSessions = Math.max(1, activePeriodSummits.length * 3);
    const overallAttendancePercentage = (totalSessionsPresent / totalPossibleSessions) * 100;
    const overallMarksPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const overallGrade = getGradeFromScore(overallMarksPercentage, 100, settings.gradeRanges);

    // Month-by-month breakdown for selected months report
    const monthWiseMarks = {};
    periodMonths.forEach(mKey => {
      const mSummits = activePeriodSummits.filter(s => (s.month || s.date?.slice(0, 7)) === mKey);
      let mScore = 0;
      mSummits.forEach(sm => {
        const perf = summitPerformances.find(sp => sp.summitId === sm.id);
        if (perf) mScore += perf.obtainedMarks;
      });
      monthWiseMarks[mKey] = mScore;
    });

    return {
      id: st.id,
      name: st.name,
      cicNo: st.cicNo,
      chestNo: st.chestNo,
      classId: st.classId,
      className: cl?.name || 'Class',
      sectionId: secId,
      sectionName: secName,
      teamId: st.teamId,
      teamName: tm?.name || 'Team',
      teamColor: tm?.color || '#0F2A4A',
      isLeader: Boolean(st.isLeader),
      leaderRole: st.leaderRole || null,
      summitPerformances,
      totalProgramsPerformed,
      totalMarksObtained,
      totalMaxMarks,
      overallMarksPercentage,
      overallGrade,
      totalSessionsPresent,
      totalPossibleSessions,
      overallAttendancePercentage,
      monthWiseMarks,
      // Positions will be populated in next step
      overallSectionRank: 1,
      overallRank: 1,
      classRank: 1,
      teamRank: 1
    };
  });

  // 4. Calculate Positions with Ties Sharing the Same Rank
  const assignRanks = (list, key = 'totalMarksObtained') => {
    const sorted = [...list].sort((a, b) => b[key] - a[key]);
    let currentRank = 1;
    sorted.forEach((item, idx) => {
      if (idx > 0 && item[key] < sorted[idx - 1][key]) {
        currentRank = idx + 1;
      }
      item._computedRank = currentRank;
    });
    return sorted;
  };

  // Cross-section Overall Rank
  const sortedOverall = assignRanks(studentReports, 'totalMarksObtained');
  sortedOverall.forEach(s => { s.overallRank = s._computedRank; });

  // Section-Wise Rank
  ['thamheediyya', 'aliya'].forEach(sec => {
    const secStudents = studentReports.filter(s => s.sectionId === sec);
    const sortedSec = assignRanks(secStudents, 'totalMarksObtained');
    sortedSec.forEach(s => { s.overallSectionRank = s._computedRank; });
  });

  // Class-Wise Rank
  classes.forEach(c => {
    const classStudents = studentReports.filter(s => s.classId === c.id);
    const sortedClass = assignRanks(classStudents, 'totalMarksObtained');
    sortedClass.forEach(s => { s.classRank = s._computedRank; });
  });

  // Team-Wise Rank
  teams.forEach(t => {
    const teamStudents = studentReports.filter(s => s.teamId === t.id);
    const sortedTeam = assignRanks(teamStudents, 'totalMarksObtained');
    sortedTeam.forEach(s => { s.teamRank = s._computedRank; });
  });

  // Clean temporary ranking keys
  studentReports.forEach(s => { delete s._computedRank; });

  // Sort student reports primarily by section rank / overall rank
  studentReports.sort((a, b) => a.overallSectionRank - b.overallSectionRank || b.totalMarksObtained - a.totalMarksObtained);

  // 5. Class-Wise Summaries (Strictly filtered by sectionFilter and classFilter)
  let targetClasses = classes;
  if (sectionFilter !== 'all') {
    targetClasses = targetClasses.filter(cl => (cl.sectionId || 'thamheediyya') === sectionFilter);
  }
  if (classFilter !== 'all') {
    targetClasses = targetClasses.filter(cl => cl.id === classFilter);
  }

  const classReports = targetClasses.map(cl => {
    let clStudents = studentReports.filter(s => s.classId === cl.id);
    if (teamFilter !== 'all') {
      clStudents = clStudents.filter(s => s.teamId === teamFilter);
    }
    const count = clStudents.length;
    const totalMarks = clStudents.reduce((acc, s) => acc + s.totalMarksObtained, 0);
    const totalMax = clStudents.reduce((acc, s) => acc + s.totalMaxMarks, 0);
    const marksPct = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;
    const avgPerStudent = count > 0 ? totalMarks / count : 0;

    const totalSessions = clStudents.reduce((acc, s) => acc + s.totalSessionsPresent, 0);
    const possibleSessions = count * Math.max(1, activePeriodSummits.length * 3);
    const attendancePct = possibleSessions > 0 ? (totalSessions / possibleSessions) * 100 : 0;

    // Top 3 students in this class
    const top3 = [...clStudents]
      .sort((a, b) => a.classRank - b.classRank || b.totalMarksObtained - a.totalMarksObtained)
      .slice(0, 3);

    // Month-wise totals
    const monthWiseMarks = {};
    periodMonths.forEach(mKey => {
      monthWiseMarks[mKey] = clStudents.reduce((acc, s) => acc + (s.monthWiseMarks[mKey] || 0), 0);
    });

    return {
      classId: cl.id,
      className: cl.name,
      sectionId: cl.sectionId || 'thamheediyya',
      sectionName: cl.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya',
      studentCount: count,
      totalMarks,
      totalMaxMarks: totalMax,
      marksPercentage: marksPct,
      averagePerStudent: avgPerStudent,
      attendancePercentage: attendancePct,
      top3,
      students: clStudents,
      monthWiseMarks,
      classRank: 1
    };
  });

  // Assign Class Ranks (grouped by section and overall)
  const sortedClasses = assignRanks(classReports, 'totalMarks');
  sortedClasses.forEach(c => { c.classRank = c._computedRank; delete c._computedRank; });

  // 6. Team-Wise Summaries (Strictly filtered by teamFilter, sectionFilter, and classFilter)
  let targetTeams = teams;
  if (teamFilter !== 'all') {
    targetTeams = targetTeams.filter(tm => tm.id === teamFilter);
  }

  const teamReports = targetTeams.map(tm => {
    let tmStudents = studentReports.filter(s => s.teamId === tm.id);
    if (classFilter !== 'all') {
      tmStudents = tmStudents.filter(s => s.classId === classFilter);
    }
    if (sectionFilter !== 'all') {
      tmStudents = tmStudents.filter(s => s.sectionId === sectionFilter);
    }
    const count = tmStudents.length;
    const totalMarks = tmStudents.reduce((acc, s) => acc + s.totalMarksObtained, 0);
    const totalMax = tmStudents.reduce((acc, s) => acc + s.totalMaxMarks, 0);
    const marksPct = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;
    const avgPerMember = count > 0 ? totalMarks / count : 0;

    const totalSessions = tmStudents.reduce((acc, s) => acc + s.totalSessionsPresent, 0);
    const possibleSessions = count * Math.max(1, activePeriodSummits.length * 3);
    const attendancePct = possibleSessions > 0 ? (totalSessions / possibleSessions) * 100 : 0;

    // Top 3 members in this team
    const top3 = [...tmStudents]
      .sort((a, b) => a.teamRank - b.teamRank || b.totalMarksObtained - a.totalMarksObtained)
      .slice(0, 3);

    // Field-wise totals for this team
    const fieldTotals = {};
    fields.forEach(f => {
      let fMarks = 0;
      tmStudents.forEach(st => {
        st.summitPerformances.forEach(sp => {
          sp.programs.forEach(p => {
            if (p.fieldId === f.id) fMarks += p.marksObtained;
          });
        });
      });
      fieldTotals[f.id] = {
        fieldName: f.name,
        sectionId: f.sectionId,
        marks: fMarks
      };
    });

    // Month-wise totals
    const monthWiseMarks = {};
    periodMonths.forEach(mKey => {
      monthWiseMarks[mKey] = tmStudents.reduce((acc, s) => acc + (s.monthWiseMarks[mKey] || 0), 0);
    });

    return {
      teamId: tm.id,
      teamName: tm.name,
      teamColor: tm.color,
      memberCount: count,
      totalMarks,
      totalMaxMarks: totalMax,
      marksPercentage: marksPct,
      averagePerMember: avgPerMember,
      attendancePercentage: attendancePct,
      fieldTotals,
      top3,
      members: tmStudents,
      monthWiseMarks,
      teamRank: 1
    };
  });

  // Assign Team Ranks
  const sortedTeams = assignRanks(teamReports, 'totalMarks');
  sortedTeams.forEach(t => { t.teamRank = t._computedRank; delete t._computedRank; });

  // 7. Top 10 Rankings
  const top10Thamheediyya = studentReports
    .filter(s => s.sectionId === 'thamheediyya')
    .sort((a, b) => a.overallSectionRank - b.overallSectionRank || b.totalMarksObtained - a.totalMarksObtained)
    .slice(0, 10);

  const top10Aliya = studentReports
    .filter(s => s.sectionId === 'aliya')
    .sort((a, b) => a.overallSectionRank - b.overallSectionRank || b.totalMarksObtained - a.totalMarksObtained)
    .slice(0, 10);

  const top10Overall = [...studentReports]
    .sort((a, b) => a.overallRank - b.overallRank || b.totalMarksObtained - a.totalMarksObtained)
    .slice(0, 10);

  // 8. Period Executive Summary
  const totalSummitsCount = activePeriodSummits.length;
  const periodProgramIds = new Set(programs.filter(p => periodSummitIds.has(p.summitId)).map(p => p.id));
  const totalProgramsCount = periodProgramIds.size;
  const uniqueParticipantsCount = new Set(entries.filter(e => periodProgramIds.has(e.programId)).map(e => e.studentId || e.id)).size;
  const collegeTotalMarks = studentReports.reduce((acc, s) => acc + s.totalMarksObtained, 0);
  const collegeTotalMax = studentReports.reduce((acc, s) => acc + s.totalMaxMarks, 0);
  const collegeAvgMarksPct = collegeTotalMax > 0 ? (collegeTotalMarks / collegeTotalMax) * 100 : 0;
  const collegeAvgAttendancePct = studentReports.length > 0
    ? studentReports.reduce((acc, s) => acc + s.overallAttendancePercentage, 0) / studentReports.length
    : 0;

  // 9. Summit-Wise Breakdown (Summit 1 to 5 with team totals)
  const summitBreakdown = activePeriodSummits.map(sm => {
    const runInfo = summitRunningMap[sm.id];
    const smPrograms = programs.filter(p => p.summitId === sm.id);
    const smEntries = entries.filter(e => smPrograms.some(p => p.id === e.programId));
    
    // Team totals in this summit (filtered teams only)
    const teamTotals = {};
    targetTeams.forEach(t => {
      let tMarks = 0;
      studentReports.forEach(st => {
        if (st.teamId === t.id) {
          const perf = st.summitPerformances.find(sp => sp.summitId === sm.id);
          if (perf) tMarks += perf.obtainedMarks;
        }
      });
      teamTotals[t.id] = tMarks;
    });

    return {
      summitId: sm.id,
      name: sm.name,
      date: sm.date,
      venue: sm.venue,
      status: sm.status,
      runningLabel: runInfo.label,
      runningNumber: runInfo.runningNumber,
      programsCount: smPrograms.length,
      participantsCount: smEntries.length,
      teamTotals
    };
  });

  return {
    periodMonths,
    activePeriodSummits,
    summitRunningMap,
    studentReports,
    classReports,
    teamReports,
    top10: {
      thamheediyya: top10Thamheediyya,
      aliya: top10Aliya,
      overall: top10Overall
    },
    summary: {
      totalSummits: totalSummitsCount,
      totalPrograms: totalProgramsCount,
      totalParticipants: uniqueParticipantsCount,
      totalMarks: collegeTotalMarks,
      averageMarksPercentage: collegeAvgMarksPct,
      averageAttendancePercentage: collegeAvgAttendancePct
    },
    summitBreakdown
  };
}
