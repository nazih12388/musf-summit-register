import * as XLSX from 'xlsx';

/**
 * Downloads a sample student Excel template
 */
export function downloadStudentTemplate() {
  const sampleData = [
    {
      "Name": "Ahmad Faris",
      "CIC Number": "23980",
      "Class": "Class 1",
      "Group": "A",
      "Field": "General"
    },
    {
      "Name": "Muhammed Sinan",
      "CIC Number": "22934",
      "Class": "Class 2",
      "Group": "B",
      "Field": "General"
    },
    {
      "Name": "Ammar Farooq",
      "CIC Number": "21724",
      "Class": "Class 3",
      "Group": "C",
      "Field": "Communicative"
    },
    {
      "Name": "Rashid Hashmi",
      "CIC Number": "21015",
      "Class": "Class 4",
      "Group": "A",
      "Field": "Creative & Media"
    },
    {
      "Name": "Rayyan Shafi",
      "CIC Number": "20194",
      "Class": "Class 5",
      "Group": "C",
      "Field": "Management & Psychological"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students Template");
  XLSX.writeFile(wb, "MUSF_Student_Import_Template.xlsx");
}

/**
 * Parses an uploaded Excel or CSV file into row objects
 */
export function parseStudentExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exports credentials sheet for students
 */
export function exportCredentialsExcel(studentsList, teamsMap, classesMap, fieldsMap = {}) {
  const data = studentsList.map(s => ({
    "Chest No": s.chestNo || "-",
    "CIC Number": s.cicNo || "-",
    "Student Name": s.name || "-",
    "Section": s.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya',
    "Class": classesMap[s.classId]?.name || s.classId || "-",
    "Team / Group": teamsMap[s.teamId]?.name || s.teamId || "-",
    "Field": s.sectionId === 'aliya' ? (fieldsMap[s.fieldId]?.name || s.fieldId || "Unassigned") : "Foundational Academic",
    "Username": s.username || s.cicNo || "-",
    "Initial Password": s.initialPassword || s.cicNo || "student123"
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Credentials");
  XLSX.writeFile(wb, `MUSF_Student_Credentials_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Exports monthly performance report to Excel with Section & Field metadata
 */
export function exportMonthlyReportExcel(reportRows, monthName, meta = {}) {
  const headerInfo = [
    { "Date": `Institution: Majlis Umariyya Wafy College | MUSF Summit Register` },
    { "Date": `Month: ${monthName} | Summit: ${meta.summitName || 'All'} | Section: ${meta.section || 'All'} | Field: ${meta.field || 'All'}` },
    {}
  ];

  const data = reportRows.map(row => ({
    "Date": row.date,
    "Program": row.programName,
    "Section": row.sectionName || row.section || "-",
    "Field": row.fieldName || row.field || "-",
    "Type": row.type,
    "Participant": row.participantName,
    "Chest No": row.chestNo,
    "Class": row.className,
    "Team": row.teamName,
    "Final Mark (out of 10)": row.obtainedMark != null ? Number(row.obtainedMark).toFixed(2) : "-",
    "Grade": row.grade || "-",
    "Position": row.position || "-"
  }));

  const ws = XLSX.utils.json_to_sheet([...headerInfo, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Report-${monthName}`);
  XLSX.writeFile(wb, `MUSF_Summit_Report_${monthName}.xlsx`);
}

/**
 * Exports Overall Leaderboard & Ranks to Excel
 */
export function exportLeaderboardExcel(teamStandings, studentStandings, meta = {}) {
  const wb = XLSX.utils.book_new();

  // Team Sheet (Section-wise & Combined)
  const teamData = teamStandings.map(t => ({
    "Overall Rank": t.rank,
    "Team Name": t.name,
    "Leader": t.leaderName,
    "Members": t.memberCount,
    "Thamheediyya Points": t.thamheediyyaPoints != null ? t.thamheediyyaPoints.toFixed(1) : "-",
    "Aliya Points": t.aliyaPoints != null ? t.aliyaPoints.toFixed(1) : "-",
    "Total Points": t.totalPoints.toFixed(1),
    "Marks %": t.marksPercentage.toFixed(1) + "%",
    "Avg Attendance": t.avgAttendancePct.toFixed(1) + "%",
    "1st Places": t.firstPlaces,
    "2nd Places": t.secondPlaces,
    "3rd Places": t.thirdPlaces
  }));
  const wsTeams = XLSX.utils.json_to_sheet(teamData);
  XLSX.utils.book_append_sheet(wb, wsTeams, "Team Standings");

  // Student Sheet
  const studentData = studentStandings.map(s => ({
    "Overall Rank": s.overallRank || s.rank,
    "Section Rank": s.sectionRank || "-",
    "Class Rank": s.classRank || "-",
    "Student Name": s.name,
    "Chest No": s.chestNo,
    "CIC Number": s.cicNo,
    "Section": s.sectionName || (s.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'),
    "Class": s.className,
    "Team": s.teamName,
    "Total Marks": s.totalMarks.toFixed(1),
    "Marks %": s.marksPercentage.toFixed(1) + "%",
    "Attendance %": s.attendancePercentage.toFixed(1) + "%",
    "OPS Composite Score": s.overallPerformanceScore != null ? s.overallPerformanceScore.toFixed(1) : "-",
    "1st Places": s.firstPlaces,
    "2nd Places": s.secondPlaces,
    "3rd Places": s.thirdPlaces
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentData);
  XLSX.utils.book_append_sheet(wb, wsStudents, "Student Standings");

  XLSX.writeFile(wb, `MUSF_Summit_Leaderboard_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Report 1: Exports Summit Program List (Section-wise & Field-wise with participants per team)
 */
export function exportSummitProgramListExcel(rows, meta = {}) {
  const header = [
    { "Program": `Institution: Majlis Umariyya Wafy College | MUSF Summit Register` },
    { "Program": `Report: Summit Program List | Summit: ${meta.summitName || 'All'} | Section: ${meta.section || 'All'} | Field: ${meta.field || 'All'}` },
    {}
  ];

  const data = rows.map(r => ({
    "Program": r.programName,
    "Section": r.sectionName,
    "Field": r.fieldName,
    "Format": r.type,
    "Scheduled Time": r.time,
    "Venue": r.stage,
    "Allowed / Team": r.defaultAllowed,
    "Total Registered": r.totalRegistered,
    "Teams Participating": r.participatingTeams
  }));

  const ws = XLSX.utils.json_to_sheet([...header, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Summit Programs");
  XLSX.writeFile(wb, `MUSF_Summit_Programs_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Report 2: Exports Participation Report (team-wise, class-wise, field-wise)
 */
export function exportParticipationReportExcel(rows, meta = {}) {
  const data = rows.map(r => ({
    "Participant Name": r.studentName,
    "Chest No": r.chestNo,
    "CIC No": r.cicNo,
    "Section": r.sectionName,
    "Class": r.className,
    "House Team": r.teamName,
    "Field": r.fieldName,
    "Program": r.programName,
    "Summit": r.summitName
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Participation");
  XLSX.writeFile(wb, `MUSF_Participation_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Report 3: Exports Field-wise Performance Report
 */
export function exportFieldPerformanceExcel(rows, meta = {}) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Field Performance");
  XLSX.writeFile(wb, `MUSF_Field_Performance_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Report 4: Exports Aliya Team Program Assignment Matrix Report
 */
export function exportAssignmentMatrixExcel(rows, meta = {}) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Assignment Matrix");
  XLSX.writeFile(wb, `MUSF_Aliya_Assignment_Matrix_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Report 5: Exports Team Registration Status Report
 * Per summit, per section, per team, per program: allowed, filled, empty slots, and nominating leader
 */
export function exportTeamRegistrationStatusExcel(rows, meta = {}) {
  const data = rows.map(r => ({
    "Program": r.programName,
    "Section": r.sectionName,
    "Field": r.fieldName,
    "House Team": r.teamName,
    "Format": r.format,
    "Allowed Slots": r.allowedSlots,
    "Filled Slots": r.filledSlots,
    "Empty Slots": r.emptySlots,
    "Status": r.isComplete ? "Complete" : `${r.emptySlots} Slots Unfilled`,
    "Nominated Students & Nominating Leader": r.nominationsDetail
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Registration Status");
  XLSX.writeFile(wb, `MUSF_Team_Registration_Status_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Report: Exports Comprehensive Monthly or Multi-Month Academic Report (Multiple Tabular Worksheets)
 */
export function exportComprehensiveReportExcel(reportData, periodTitle, reportType = 'monthly') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Executive Summary
  const summaryRows = [
    { "Metric": "Academic Period", "Value": periodTitle },
    { "Metric": "Total Summits Held", "Value": reportData.summary.totalSummits },
    { "Metric": "Total Programs Conducted", "Value": reportData.summary.totalPrograms },
    { "Metric": "Total Unique Participants", "Value": reportData.summary.totalParticipants },
    { "Metric": "Total Score Accrued", "Value": reportData.summary.totalMarks.toFixed(1) },
    { "Metric": "Average Marks Percentage", "Value": `${reportData.summary.averageMarksPercentage.toFixed(1)}%` },
    { "Metric": "Average Attendance Percentage", "Value": `${reportData.summary.averageAttendancePercentage.toFixed(1)}%` }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

  // Sheet 2: Summits Breakdown
  const summitRows = reportData.summitBreakdown.map(sm => {
    const row = {
      "Summit Running Tag": `Summit ${sm.runningNumber}`,
      "Summit Name": sm.name,
      "Date": sm.date,
      "Venue": sm.venue,
      "Status": sm.status,
      "Programs Count": sm.programsCount,
      "Participants Count": sm.participantsCount
    };
    reportData.teamReports.forEach(t => {
      row[t.teamName] = (sm.teamTotals[t.teamId] || 0).toFixed(1);
    });
    return row;
  });
  const wsSummits = XLSX.utils.json_to_sheet(summitRows);
  XLSX.utils.book_append_sheet(wb, wsSummits, "Summits Breakdown");

  // Sheet 3: Class-Wise Performance
  const classRows = reportData.classReports.map(cr => ({
    "Class Rank": cr.classRank,
    "Class Name": cr.className,
    "Division / Section": cr.sectionName,
    "Student Count": cr.studentCount,
    "Total Marks": cr.totalMarks.toFixed(1),
    "Max Marks": cr.totalMaxMarks,
    "Marks %": `${cr.marksPercentage.toFixed(1)}%`,
    "Average per Student": cr.averagePerStudent.toFixed(1),
    "Attendance %": `${cr.attendancePercentage.toFixed(0)}%`,
    "Top 3 Students": cr.top3.map(s => `${s.name} (${s.totalMarksObtained.toFixed(1)} pts)`).join('; ')
  }));
  const wsClasses = XLSX.utils.json_to_sheet(classRows);
  XLSX.utils.book_append_sheet(wb, wsClasses, "Class Evaluations");

  // Sheet 3b: Class-Wise Students Detailed (Each Summit Programs, Marks & %)
  const classDetailRows = [];
  reportData.classReports.forEach(cr => {
    cr.students.forEach(st => {
      const row = {
        "Class": cr.className,
        "Section": cr.sectionName,
        "Class Rank": st.classRank,
        "Student Name": st.name,
        "CIC No": st.cicNo,
        "Chest No": st.chestNo,
        "House Team": st.teamName,
      };

      (st.summitPerformances || []).forEach(sp => {
        const sLabel = sp.runningLabel || `Summit ${sp.runningNumber}`;
        const progsStr = (sp.programs || []).map(p => `${p.programName}: ${p.marksObtained.toFixed(1)}/10 (${p.grade})`).join('; ');
        row[`${sLabel} Events & Marks`] = progsStr || "No event";
        row[`${sLabel} Subtotal`] = sp.obtainedMarks != null ? Number(sp.obtainedMarks).toFixed(1) : "0";
      });

      row["Total Marks Obtained"] = st.totalMarksObtained.toFixed(1);
      row["Total Max Marks"] = st.totalMaxMarks;
      row["Overall Marks %"] = `${st.overallMarksPercentage.toFixed(1)}%`;
      row["Overall Grade"] = st.overallGrade;
      row["Overall Section Rank"] = st.overallSectionRank;
      row["Attendance %"] = `${st.overallAttendancePercentage.toFixed(0)}%`;

      classDetailRows.push(row);
    });
  });
  const wsClassDetails = XLSX.utils.json_to_sheet(classDetailRows);
  XLSX.utils.book_append_sheet(wb, wsClassDetails, "Class Students Detailed");

  // Sheet 4: Team-Wise Performance
  const teamRows = reportData.teamReports.map(tr => {
    const row = {
      "Team Rank": tr.teamRank,
      "House Team": tr.teamName,
      "Member Count": tr.memberCount,
      "Total Marks": tr.totalMarks.toFixed(1),
      "Max Marks": tr.totalMaxMarks,
      "Marks %": `${tr.marksPercentage.toFixed(1)}%`,
      "Average per Member": tr.averagePerMember.toFixed(1),
      "Attendance %": `${tr.attendancePercentage.toFixed(0)}%`,
      "Top 3 Members": tr.top3.map(s => `${s.name} (${s.totalMarksObtained.toFixed(1)} pts)`).join('; ')
    };
    Object.values(tr.fieldTotals).forEach(f => {
      row[`Field: ${f.fieldName}`] = f.marks.toFixed(1);
    });
    return row;
  });
  const wsTeams = XLSX.utils.json_to_sheet(teamRows);
  XLSX.utils.book_append_sheet(wb, wsTeams, "House Standings");

  // Sheet 5: Student Summary & Ranks
  const studentRows = reportData.studentReports.map(st => {
    const row = {
      "Overall Rank": st.overallRank,
      "Section Rank": st.overallSectionRank,
      "Class Rank": st.classRank,
      "Team Rank": st.teamRank,
      "Student Name": st.name,
      "CIC No": st.cicNo,
      "Chest No": st.chestNo,
      "Class": st.className,
      "Section": st.sectionName,
      "House Team": st.teamName,
      "Programs Count": st.totalProgramsPerformed,
      "Total Marks": st.totalMarksObtained.toFixed(1),
      "Max Marks": st.totalMaxMarks,
      "Marks %": `${st.overallMarksPercentage.toFixed(1)}%`,
      "Overall Grade": st.overallGrade,
      "Sessions Present": `${st.totalSessionsPresent} / ${st.totalPossibleSessions}`,
      "Attendance %": `${st.overallAttendancePercentage.toFixed(0)}%`
    };
    if (reportType === 'selected_months') {
      reportData.periodMonths.forEach(mKey => {
        row[`Marks (${mKey})`] = (st.monthWiseMarks[mKey] || 0).toFixed(1);
      });
    }
    return row;
  });
  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, "Student Summary");

  // Sheet 6: Student Detailed Summit-by-Summit Log
  const detailRows = [];
  reportData.studentReports.forEach(st => {
    st.summitPerformances.forEach(sp => {
      if (sp.programs.length === 0) {
        detailRows.push({
          "Student Name": st.name,
          "CIC No": st.cicNo,
          "Class": st.className,
          "Team": st.teamName,
          "Summit": sp.runningLabel,
          "Date": sp.summitDate,
          "Program": "No Assigned Program",
          "Field": "-",
          "Score": "-",
          "Grade": "-",
          "Summit Attendance (S/M/E)": `${sp.attendance.start}/${sp.attendance.mid}/${sp.attendance.end}`,
          "Summit Attendance %": `${sp.attendance.percentage.toFixed(0)}%`
        });
      } else {
        sp.programs.forEach(prog => {
          detailRows.push({
            "Student Name": st.name,
            "CIC No": st.cicNo,
            "Class": st.className,
            "Team": st.teamName,
            "Summit": sp.runningLabel,
            "Date": sp.summitDate,
            "Program": prog.programName,
            "Field": prog.fieldName,
            "Score": prog.statusText,
            "Grade": prog.grade,
            "Summit Attendance (S/M/E)": `${sp.attendance.start}/${sp.attendance.mid}/${sp.attendance.end}`,
            "Summit Attendance %": `${sp.attendance.percentage.toFixed(0)}%`
          });
        });
      }
    });
  });
  const wsDetails = XLSX.utils.json_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(wb, wsDetails, "Summit-by-Summit Details");

  XLSX.writeFile(wb, `MUSF_Academic_Report_${periodTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
