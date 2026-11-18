import { jsPDF } from 'jspdf';
import { formatMonthLabel } from './reportCalculations';

/**
 * Professional Multi-Page Academic PDF Report Generator
 * MUSF Summit Register - Majlis Umariyya Wafy College
 */

const COLORS = {
  navy: [15, 42, 74],       // #0F2A4A Primary Deep Navy
  slate: [51, 78, 115],     // #334E73 Secondary Slate Blue
  teal: [14, 124, 134],     // #0E7C86 Accent Muted Teal
  gold: [201, 162, 39],     // #C9A227 Highlight Soft Gold
  bgLight: [246, 248, 251], // #F6F8FB Off-white canvas
  white: [255, 255, 255],
  darkText: [30, 41, 59],
  mutedText: [100, 116, 139],
  border: [226, 232, 240]
};

/**
 * Draws running header on each page
 */
function drawPageHeader(doc, title, subtitle, pageNum, totalPages, isLandscape = false) {
  const width = doc.internal.pageSize.getWidth();
  
  // Header bar
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, width, 16, 'F');

  // Gold accent line
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 16, width, 1.2, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.white);
  doc.text("MAJLIS UMARIYYA WAFY COLLEGE | MUSF SUMMIT REGISTER", 14, 10.5);

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 220, 240);
  doc.text(title.toUpperCase(), width - 14, 10.5, { align: 'right' });

  // Subtitle breadcrumb below header bar
  if (subtitle) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate);
    doc.text(subtitle, 14, 22);
  }
}

/**
 * Draws running footer on each page
 */
function drawPageFooter(doc, pageNum, totalPages) {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(14, height - 12, width - 14, height - 12);

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.mutedText);
  doc.text(`Official Academic Verification Audit \u2022 Generated on: ${new Date().toLocaleString()}`, 14, height - 7);

  doc.setFont('times', 'bold');
  doc.text(`Page ${pageNum} of ${totalPages}`, width - 14, height - 7, { align: 'right' });
}

/**
 * Check page overflow and auto-add new page
 */
function checkPageOverflow(doc, currentY, neededHeight, title, subtitle, pageState, isLandscape = false) {
  const height = doc.internal.pageSize.getHeight();
  if (currentY + neededHeight > height - 18) {
    doc.addPage(isLandscape ? 'landscape' : 'portrait');
    pageState.currentPage++;
    drawPageHeader(doc, title, subtitle, pageState.currentPage, pageState.totalPages, isLandscape);
    return 28; // Reset Y after header
  }
  return currentY;
}

/**
 * Generates the Official Monthly Report (or Selected Months Report)
 */
export function generateComprehensiveAcademicReportPDF({
  reportData,
  reportType = 'monthly', // 'monthly' or 'selected_months'
  periodTitle = '',
  viewMode = 'both',      // 'class_wise', 'team_wise', 'both'
  detailMode = 'summary', // 'summary' or 'detailed'
  sectionFilter = 'all',
  classFilter = 'all',
  teamFilter = 'all',
  settings = {}
}) {
  const isMultiMonth = reportType === 'selected_months';
  // Use landscape if multi-month or detailed mode with wide matrices
  const isLandscape = isMultiMonth || detailMode === 'detailed';
  const doc = new jsPDF(isLandscape ? 'landscape' : 'portrait');
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  const collegeName = settings.collegeName || "MAJLIS UMARIYYA WAFY COLLEGE";
  const mainTitle = reportType === 'monthly'
    ? `OFFICIAL MONTHLY ACADEMIC SUMMIT EVALUATION REPORT`
    : `MULTI-MONTH CUMULATIVE ACADEMIC SUMMIT PERFORMANCE AUDIT`;

  const classLabel = classFilter !== 'all' ? (reportData.classReports?.find(c => c.classId === classFilter)?.className || classFilter) : 'All Classes';
  const teamLabel = teamFilter !== 'all' ? (reportData.teamReports?.find(t => t.teamId === teamFilter)?.teamName || teamFilter) : 'All Houses';
  const sectionLabel = sectionFilter === 'all' ? 'All Sections' : (sectionFilter === 'aliya' ? 'Aliya' : 'Thamheediyya');

  const pageState = { currentPage: 1, totalPages: 1 };
  const subTitle = `Period: ${periodTitle} | Section: ${sectionLabel} | Class: ${classLabel} | House: ${teamLabel}`;

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ==========================================
  drawPageHeader(doc, mainTitle, subTitle, 1, 1, isLandscape);

  let y = 28;

  // Title Box
  doc.setFillColor(...COLORS.bgLight);
  doc.roundedRect(14, y, width - 28, 26, 3, 3, 'F');
  doc.setDrawColor(...COLORS.slate);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, width - 28, 26, 3, 3, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text(collegeName.toUpperCase(), width / 2, y + 8, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.teal);
  doc.text(`${mainTitle} - ${periodTitle.toUpperCase()}`, width / 2, y + 16, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.darkText);
  doc.text(`Scope: ${sectionLabel} \u2022 Class: ${classLabel} \u2022 House: ${teamLabel} \u2022 Format: ${detailMode === 'detailed' ? 'Detailed Dossier' : 'Summary Table'} \u2022 View: ${viewMode.replace('_', ' ').toUpperCase()}`, width / 2, y + 22, { align: 'center' });

  y += 32;

  // 1. Executive Summary Cards (6 Key Metrics)
  const sum = reportData.summary;
  const cards = [
    { label: 'Summits Held', value: `${sum.totalSummits}` },
    { label: 'Programs Held', value: `${sum.totalPrograms}` },
    { label: 'Participants', value: `${sum.totalParticipants}` },
    { label: 'Total Score', value: `${sum.totalMarks.toFixed(1)} pts` },
    { label: 'Avg Marks %', value: `${sum.averageMarksPercentage.toFixed(1)}%` },
    { label: 'Avg Attendance %', value: `${sum.averageAttendancePercentage.toFixed(1)}%` }
  ];

  const cardW = (width - 28 - (cards.length - 1) * 3) / cards.length;
  cards.forEach((c, idx) => {
    const cx = 14 + idx * (cardW + 3);
    doc.setFillColor(...COLORS.bgLight);
    doc.roundedRect(cx, y, cardW, 16, 2, 2, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.4);
    doc.roundedRect(cx, y, cardW, 16, 2, 2, 'S');

    doc.setFont('times', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.mutedText);
    doc.text(c.label.toUpperCase(), cx + cardW / 2, y + 5.5, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);
    doc.text(c.value, cx + cardW / 2, y + 12, { align: 'center' });
  });

  y += 22;

  // 2. Summit-Wise Breakdown Table
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text("1. SUMMIT-WISE SCHEDULE & HOUSE SCORES BREAKDOWN", 14, y);
  y += 5;

  // Header row
  doc.setFillColor(...COLORS.slate);
  doc.rect(14, y, width - 28, 7, 'F');
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);

  const teamCols = reportData.teamReports.map(t => t.teamName.replace('Team ', ''));
  doc.text("Summit / Gathering", 16, y + 5);
  doc.text("Date", 65, y + 5);
  doc.text("Venue", 90, y + 5);
  doc.text("Progs", 140, y + 5);
  doc.text("Parts", 155, y + 5);

  let tx = 175;
  const colSpacing = (width - 14 - tx) / Math.max(1, teamCols.length);
  teamCols.forEach(tn => {
    doc.text(tn, tx, y + 5);
    tx += colSpacing;
  });

  y += 7;

  reportData.summitBreakdown.forEach((sm, sIdx) => {
    y = checkPageOverflow(doc, y, 7, mainTitle, subTitle, pageState, isLandscape);

    doc.setFillColor(sIdx % 2 === 0 ? 255 : 248, sIdx % 2 === 0 ? 255 : 250, sIdx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, width - 28, 6.5, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(14, y + 6.5, width - 14, y + 6.5);

    doc.setFont('times', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.navy);
    doc.text(`Summit ${sm.runningNumber}: ${sm.name.slice(0, 30)}`, 16, y + 4.5);

    doc.setFont('times', 'normal');
    doc.setTextColor(...COLORS.darkText);
    doc.text(sm.date, 65, y + 4.5);
    doc.text(sm.venue.slice(0, 25), 90, y + 4.5);
    doc.text(`${sm.programsCount}`, 140, y + 4.5);
    doc.text(`${sm.participantsCount}`, 155, y + 4.5);

    let sx = 175;
    reportData.teamReports.forEach(t => {
      const score = sm.teamTotals[t.teamId] || 0;
      doc.setFont('times', 'bold');
      doc.text(score > 0 ? score.toFixed(1) : '-', sx, y + 4.5);
      sx += colSpacing;
    });

    y += 6.5;
  });

  y += 6;

  // 3. Top 10 Students of the Period
  y = checkPageOverflow(doc, y, 35, mainTitle, subTitle, pageState, isLandscape);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text("2. PERIOD TOP 10 ACADEMIC LEADERS", 14, y);
  y += 5;

  let top10List = sectionFilter === 'thamheediyya' ? reportData.top10.thamheediyya
    : sectionFilter === 'aliya' ? reportData.top10.aliya
    : reportData.top10.overall;

  if (classFilter !== 'all' || teamFilter !== 'all') {
    top10List = (reportData.studentReports || []).slice(0, 10);
  }

  // Header row
  doc.setFillColor(...COLORS.navy);
  doc.rect(14, y, width - 28, 6.5, 'F');
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.white);

  doc.text("Rank", 16, y + 4.5);
  doc.text("Student Name", 30, y + 4.5);
  doc.text("CIC No.", 75, y + 4.5);
  doc.text("Chest", 105, y + 4.5);
  doc.text("Class & Section", 125, y + 4.5);
  doc.text("House Team", 175, y + 4.5);
  doc.text("Progs", 215, y + 4.5);
  doc.text("Marks", 232, y + 4.5);
  doc.text("Marks %", 252, y + 4.5);
  doc.text("Attendance %", 272, y + 4.5);

  y += 6.5;

  top10List.forEach((st, idx) => {
    y = checkPageOverflow(doc, y, 6.5, mainTitle, subTitle, pageState, isLandscape);

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, width - 28, 6, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(14, y + 6, width - 14, y + 6);

    // Medal style rank
    doc.setFont('times', 'bold');
    doc.setFontSize(7.5);
    if (idx === 0) doc.setTextColor(180, 140, 20); // Gold
    else if (idx === 1) doc.setTextColor(120, 130, 140); // Silver
    else if (idx === 2) doc.setTextColor(160, 90, 40); // Bronze
    else doc.setTextColor(...COLORS.navy);
    doc.text(`#${idx + 1}`, 16, y + 4.2);

    doc.setFont('times', 'bold');
    doc.setTextColor(...COLORS.navy);
    doc.text(st.name, 30, y + 4.2);

    doc.setFont('times', 'normal');
    doc.setTextColor(...COLORS.darkText);
    doc.text(st.cicNo, 75, y + 4.2);
    doc.text(st.chestNo, 105, y + 4.2);
    doc.text(`${st.className} (${st.sectionName})`, 125, y + 4.2);
    doc.text(st.teamName, 175, y + 4.2);
    doc.text(`${st.totalProgramsPerformed}`, 215, y + 4.2);
    doc.setFont('times', 'bold');
    doc.text(`${st.totalMarksObtained.toFixed(1)} / ${st.totalMaxMarks}`, 232, y + 4.2);
    doc.text(`${st.overallMarksPercentage.toFixed(1)}%`, 252, y + 4.2);
    doc.text(`${st.overallAttendancePercentage.toFixed(0)}%`, 272, y + 4.2);

    y += 6;
  });

  // ==========================================
  // SECTION 3: CLASS-WISE REPORT
  // ==========================================
  if (viewMode === 'class_wise' || viewMode === 'both') {
    doc.addPage(isLandscape ? 'landscape' : 'portrait');
    pageState.currentPage++;
    drawPageHeader(doc, mainTitle, `Class-Wise Academic Audit | ${periodTitle}`, pageState.currentPage, 1, isLandscape);
    y = 28;

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.navy);
    doc.text("3. CLASS-WISE ACADEMIC PERFORMANCE (5 CLASSES)", 14, y);
    y += 6;

    reportData.classReports.forEach(cr => {
      y = checkPageOverflow(doc, y, 40, mainTitle, "Class-Wise Report", pageState, isLandscape);

      // Class summary header bar
      doc.setFillColor(...COLORS.slate);
      doc.roundedRect(14, y, width - 28, 8, 1.5, 1.5, 'F');
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.white);
      doc.text(`${cr.className.toUpperCase()} [${cr.sectionName.toUpperCase()}] \u2022 Rank #${cr.classRank}`, 17, y + 5.5);

      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Total: ${cr.totalMarks.toFixed(1)} pts \u2022 Avg/Student: ${cr.averagePerStudent.toFixed(1)} \u2022 Marks %: ${cr.marksPercentage.toFixed(1)}% \u2022 Attendance: ${cr.attendancePercentage.toFixed(0)}%`,
        width - 17,
        y + 5.5,
        { align: 'right' }
      );
      y += 9.5;

      // Student rows for this class
      doc.setFillColor(...COLORS.bgLight);
      doc.rect(14, y, width - 28, 6, 'F');
      doc.setFont('times', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.navy);
      doc.text("Class Rank", 16, y + 4);
      doc.text("Student Name", 35, y + 4);
      doc.text("CIC No.", 85, y + 4);
      doc.text("House Team", 125, y + 4);
      doc.text("Total Marks", 175, y + 4);
      doc.text("Marks %", 205, y + 4);
      doc.text("Attendance %", 235, y + 4);
      doc.text("Sec Rank", 265, y + 4);
      y += 6;

      cr.students.forEach((st, sIdx) => {
        y = checkPageOverflow(doc, y, 5.5, mainTitle, "Class-Wise Report", pageState, isLandscape);

        doc.setFillColor(sIdx % 2 === 0 ? 255 : 248, sIdx % 2 === 0 ? 255 : 250, sIdx % 2 === 0 ? 255 : 252);
        doc.rect(14, y, width - 28, 5.5, 'F');
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.2);
        doc.line(14, y + 5.5, width - 14, y + 5.5);

        doc.setFont('times', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.navy);
        doc.text(`#${st.classRank}`, 16, y + 4);
        doc.text(st.name, 35, y + 4);

        doc.setFont('times', 'normal');
        doc.setTextColor(...COLORS.darkText);
        doc.text(st.cicNo, 85, y + 4);
        doc.text(st.teamName, 125, y + 4);
        doc.setFont('times', 'bold');
        doc.text(`${st.totalMarksObtained.toFixed(1)} / ${st.totalMaxMarks}`, 175, y + 4);
        doc.text(`${st.overallMarksPercentage.toFixed(1)}%`, 205, y + 4);
        doc.text(`${st.overallAttendancePercentage.toFixed(0)}%`, 235, y + 4);
        doc.text(`#${st.overallSectionRank}`, 265, y + 4);
        y += 5.5;

        // Summit-by-summit program performance line
        const summitSummaryParts = [];
        (st.summitPerformances || []).forEach(sp => {
          if (sp.programs && sp.programs.length > 0) {
            const progStr = sp.programs.map(p => `${p.programName}: ${p.marksObtained.toFixed(1)}/10`).join(', ');
            summitSummaryParts.push(`${sp.runningLabel || ('Summit ' + sp.runningNumber)}: ${progStr} (Tot: ${sp.obtainedMarks.toFixed(1)}/${sp.maxMarks})`);
          }
        });

        if (summitSummaryParts.length > 0) {
          y = checkPageOverflow(doc, y, 4.5, mainTitle, "Class-Wise Report", pageState, isLandscape);
          doc.setFont('times', 'italic');
          doc.setFontSize(6.5);
          doc.setTextColor(...COLORS.slate);
          const fullProgText = "• " + summitSummaryParts.join("   • ");
          const splitText = doc.splitTextToSize(fullProgText, width - 52);
          doc.text(splitText, 35, y + 3);
          y += (splitText.length * 3.2);
        }
      });

      y += 6;
    });
  }

  // ==========================================
  // SECTION 4: TEAM-WISE REPORT
  // ==========================================
  if (viewMode === 'team_wise' || viewMode === 'both') {
    doc.addPage(isLandscape ? 'landscape' : 'portrait');
    pageState.currentPage++;
    drawPageHeader(doc, mainTitle, `House Team Standings | ${periodTitle}`, pageState.currentPage, 1, isLandscape);
    y = 28;

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.navy);
    doc.text("4. HOUSE TEAM COMPREHENSIVE STANDINGS & FIELD BREAKDOWN", 14, y);
    y += 6;

    reportData.teamReports.forEach(tr => {
      y = checkPageOverflow(doc, y, 40, mainTitle, "Team-Wise Report", pageState, isLandscape);

      // Team summary header bar
      doc.setFillColor(...COLORS.navy);
      doc.roundedRect(14, y, width - 28, 8, 1.5, 1.5, 'F');
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.white);
      doc.text(`${tr.teamName.toUpperCase()} \u2022 Overall Rank #${tr.teamRank}`, 17, y + 5.5);

      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Total: ${tr.totalMarks.toFixed(1)} pts \u2022 Avg/Member: ${tr.averagePerMember.toFixed(1)} \u2022 Marks %: ${tr.marksPercentage.toFixed(1)}% \u2022 Attendance: ${tr.attendancePercentage.toFixed(0)}%`,
        width - 17,
        y + 5.5,
        { align: 'right' }
      );
      y += 9.5;

      // Field breakdown chips
      const fldTexts = Object.values(tr.fieldTotals).map(f => `${f.fieldName}: ${f.marks.toFixed(1)} pts`);
      doc.setFont('times', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.slate);
      doc.text(`Field Totals: ${fldTexts.join('  \u2022  ')}`, 16, y + 4);
      y += 6.5;

      // Member rows for this team
      doc.setFillColor(...COLORS.bgLight);
      doc.rect(14, y, width - 28, 6, 'F');
      doc.setFont('times', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.navy);
      doc.text("Team Rank", 16, y + 4);
      doc.text("Member Name", 35, y + 4);
      doc.text("CIC No.", 85, y + 4);
      doc.text("Class", 125, y + 4);
      doc.text("Total Marks", 175, y + 4);
      doc.text("Marks %", 205, y + 4);
      doc.text("Attendance %", 235, y + 4);
      doc.text("Sec Rank", 265, y + 4);
      y += 6;

      tr.members.forEach((st, sIdx) => {
        y = checkPageOverflow(doc, y, 5.5, mainTitle, "Team-Wise Report", pageState, isLandscape);

        doc.setFillColor(sIdx % 2 === 0 ? 255 : 248, sIdx % 2 === 0 ? 255 : 250, sIdx % 2 === 0 ? 255 : 252);
        doc.rect(14, y, width - 28, 5.5, 'F');
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.2);
        doc.line(14, y + 5.5, width - 14, y + 5.5);

        doc.setFont('times', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.navy);
        doc.text(`#${st.teamRank}`, 16, y + 4);
        doc.text(st.name, 35, y + 4);

        doc.setFont('times', 'normal');
        doc.setTextColor(...COLORS.darkText);
        doc.text(st.cicNo, 85, y + 4);
        doc.text(st.className, 125, y + 4);
        doc.setFont('times', 'bold');
        doc.text(`${st.totalMarksObtained.toFixed(1)} / ${st.totalMaxMarks}`, 175, y + 4);
        doc.text(`${st.overallMarksPercentage.toFixed(1)}%`, 205, y + 4);
        doc.text(`${st.overallAttendancePercentage.toFixed(0)}%`, 235, y + 4);
        doc.text(`#${st.overallSectionRank}`, 265, y + 4);
        y += 5.5;

        // Summit-by-summit program performance line
        const summitSummaryParts = [];
        (st.summitPerformances || []).forEach(sp => {
          if (sp.programs && sp.programs.length > 0) {
            const progStr = sp.programs.map(p => `${p.programName}: ${p.marksObtained.toFixed(1)}/10`).join(', ');
            summitSummaryParts.push(`${sp.runningLabel || ('Summit ' + sp.runningNumber)}: ${progStr} (Tot: ${sp.obtainedMarks.toFixed(1)}/${sp.maxMarks})`);
          }
        });

        if (summitSummaryParts.length > 0) {
          y = checkPageOverflow(doc, y, 4.5, mainTitle, "Class-Wise Report", pageState, isLandscape);
          doc.setFont('times', 'italic');
          doc.setFontSize(6.5);
          doc.setTextColor(...COLORS.slate);
          const fullProgText = "• " + summitSummaryParts.join("   • ");
          const splitText = doc.splitTextToSize(fullProgText, width - 52);
          doc.text(splitText, 35, y + 3);
          y += (splitText.length * 3.2);
        }
      });

      y += 6;
    });
  }

  // ==========================================
  // SECTION 5: STUDENT-WISE DETAILED DOSSIER
  // ==========================================
  if (detailMode === 'detailed') {
    doc.addPage(isLandscape ? 'landscape' : 'portrait');
    pageState.currentPage++;
    drawPageHeader(doc, mainTitle, `Student-Wise Detailed Performance Dossier | ${periodTitle}`, pageState.currentPage, 1, isLandscape);
    y = 28;

    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.navy);
    doc.text("5. STUDENT-WISE SUMMIT PROGRAM EVALUATION DOSSIER", 14, y);
    y += 6;

    reportData.studentReports.forEach(st => {
      // Need at least 32mm for a student card
      y = checkPageOverflow(doc, y, 35, mainTitle, "Student Detailed Dossier", pageState, isLandscape);

      // Student Card Outer Box
      doc.setFillColor(...COLORS.bgLight);
      doc.roundedRect(14, y, width - 28, 12, 1.5, 1.5, 'F');
      doc.setDrawColor(...COLORS.slate);
      doc.setLineWidth(0.4);
      doc.roundedRect(14, y, width - 28, 12, 1.5, 1.5, 'S');

      // Student Info Line 1
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.navy);
      doc.text(`${st.name} (${st.chestNo}) \u2022 ${st.cicNo}`, 17, y + 5);

      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.darkText);
      doc.text(`${st.className} [${st.sectionName}] \u2022 House: ${st.teamName}`, 17, y + 9.5);

      // Positions Badges
      doc.setFont('times', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.teal);
      const posText = `Sec Rank: #${st.overallSectionRank}  |  Class Rank: #${st.classRank}  |  Team Rank: #${st.teamRank}  |  Total: ${st.totalMarksObtained.toFixed(1)} / ${st.totalMaxMarks} (${st.overallMarksPercentage.toFixed(1)}%, Grade ${st.overallGrade})  |  Att: ${st.overallAttendancePercentage.toFixed(0)}%`;
      doc.text(posText, width - 17, y + 7, { align: 'right' });

      y += 14;

      // Summit-by-summit program performance table
      st.summitPerformances.forEach(sp => {
        if (sp.programs.length === 0) return; // Skip summits student did not participate in

        y = checkPageOverflow(doc, y, 12 + sp.programs.length * 5, mainTitle, "Student Detailed Dossier", pageState, isLandscape);

        // Summit sub-heading
        doc.setFont('times', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.slate);
        doc.text(
          `${sp.runningLabel} (${sp.summitDate}) \u2022 Score: ${sp.obtainedMarks.toFixed(1)}/${sp.maxMarks} (${sp.marksPercentage.toFixed(1)}%) \u2022 Att (S/M/E): [${sp.attendance.start.slice(0, 1)}/${sp.attendance.mid.slice(0, 1)}/${sp.attendance.end.slice(0, 1)}] (${sp.attendance.percentage.toFixed(0)}%)`,
          20,
          y
        );
        y += 4;

        sp.programs.forEach(prog => {
          y = checkPageOverflow(doc, y, 5, mainTitle, "Student Detailed Dossier", pageState, isLandscape);

          doc.setFont('times', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(...COLORS.darkText);
          const progText = `\u2022 ${prog.programName} [${prog.fieldName}] (${prog.type}): ${prog.statusText} \u2022 Grade: ${prog.grade}`;
          doc.text(progText, 25, y);
          y += 4;
        });
        y += 1.5;
      });

      y += 5;
    });
  }

  // ==========================================
  // FINAL PASS: ADD PAGE NUMBERS & FOOTERS
  // ==========================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(doc, i, totalPages);
  }

  const filename = `MUSF_Academic_Report_${reportType}_${periodTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Generates an Individual One-Page Student Report Card (PDF)
 */
export function generateIndividualStudentReportCardPDF({
  studentReport,
  periodTitle = '',
  settings = {}
}) {
  const doc = new jsPDF('portrait');
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const collegeName = settings.collegeName || "MAJLIS UMARIYYA WAFY COLLEGE";

  // Page Header
  drawPageHeader(doc, "Official Student Academic Dossier", `Student: ${studentReport.name} (${studentReport.chestNo})`, 1, 1, false);

  let y = 26;

  // Student Identity Box
  doc.setFillColor(...COLORS.bgLight);
  doc.roundedRect(14, y, width - 28, 30, 3, 3, 'F');
  doc.setDrawColor(...COLORS.navy);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, width - 28, 30, 3, 3, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text(studentReport.name.toUpperCase(), 18, y + 8);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.darkText);
  doc.text(`CIC Registration No: ${studentReport.cicNo}  |  Chest Code: ${studentReport.chestNo}`, 18, y + 14);
  doc.text(`Class: ${studentReport.className}  |  Division: ${studentReport.sectionName}`, 18, y + 19.5);
  doc.text(`House Team: ${studentReport.teamName}`, 18, y + 25);

  // Position Badges Column (Right side)
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.teal);
  doc.text(`Overall Section Rank: #${studentReport.overallSectionRank}`, width - 18, y + 8, { align: 'right' });
  doc.text(`Class Position: #${studentReport.classRank}`, width - 18, y + 14, { align: 'right' });
  doc.text(`House Position: #${studentReport.teamRank}`, width - 18, y + 19.5, { align: 'right' });
  doc.text(`Total Attendance: ${studentReport.overallAttendancePercentage.toFixed(0)}%`, width - 18, y + 25, { align: 'right' });

  y += 36;

  // Performance Summary Cards
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text(`CUMULATIVE PERFORMANCE SUMMARY (${periodTitle.toUpperCase()})`, 14, y);
  y += 5;

  const statCards = [
    { label: 'Marks Scored', val: `${studentReport.totalMarksObtained.toFixed(1)} / ${studentReport.totalMaxMarks}` },
    { label: 'Marks %', val: `${studentReport.overallMarksPercentage.toFixed(1)}%` },
    { label: 'Overall Grade', val: `${studentReport.overallGrade}` },
    { label: 'Sessions Present', val: `${studentReport.totalSessionsPresent} / ${studentReport.totalPossibleSessions}` }
  ];

  const cWidth = (width - 28 - 3 * 3) / 4;
  statCards.forEach((c, idx) => {
    const cx = 14 + idx * (cWidth + 3);
    doc.setFillColor(...COLORS.bgLight);
    doc.roundedRect(cx, y, cWidth, 14, 2, 2, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cWidth, 14, 2, 2, 'S');

    doc.setFont('times', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.mutedText);
    doc.text(c.label.toUpperCase(), cx + cWidth / 2, y + 5, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);
    doc.text(c.val, cx + cWidth / 2, y + 11, { align: 'center' });
  });

  y += 20;

  // Summit-By-Summit Program Table
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text("WEEKLY SUMMITS PARTICIPATION & EVALUATION LOG", 14, y);
  y += 5;

  // Header row
  doc.setFillColor(...COLORS.slate);
  doc.rect(14, y, width - 28, 7, 'F');
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.white);

  doc.text("Summit / Gathering", 16, y + 4.8);
  doc.text("Date", 65, y + 4.8);
  doc.text("Program & Field", 85, y + 4.8);
  doc.text("Score", 140, y + 4.8);
  doc.text("Grade", 160, y + 4.8);
  doc.text("Att (S/M/E)", 175, y + 4.8);

  y += 7;

  studentReport.summitPerformances.forEach((sp, idx) => {
    const progRows = sp.programs.length > 0 ? sp.programs : [
      { programName: 'No Assigned Program', fieldName: '-', statusText: '-', grade: '-' }
    ];

    progRows.forEach((prog, pIdx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(14, y, width - 28, 6.5, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.line(14, y + 6.5, width - 14, y + 6.5);

      doc.setFont('times', pIdx === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.navy);
      if (pIdx === 0) {
        doc.text(`Summit ${sp.runningNumber}: ${sp.summitName.slice(0, 24)}`, 16, y + 4.5);
        doc.setFont('times', 'normal');
        doc.text(sp.summitDate, 65, y + 4.5);
      }

      doc.text(`${prog.programName} [${prog.fieldName}]`, 85, y + 4.5);
      doc.setFont('times', 'bold');
      doc.text(prog.statusText, 140, y + 4.5);
      doc.text(prog.grade, 160, y + 4.5);

      if (pIdx === 0) {
        const attStr = `${sp.attendance.start.slice(0, 1)}/${sp.attendance.mid.slice(0, 1)}/${sp.attendance.end.slice(0, 1)} (${sp.attendance.percentage.toFixed(0)}%)`;
        doc.text(attStr, 175, y + 4.5);
      }

      y += 6.5;
    });
  });

  // Footer & Signatures
  y = Math.max(y + 10, height - 35);
  doc.setDrawColor(...COLORS.border);
  doc.line(14, y, width - 14, y);

  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.slate);
  doc.text("Director of Academic Summits", 20, y + 12);
  doc.text("Academic Evaluation Cell", width / 2, y + 12, { align: 'center' });
  doc.text("Institutional Registrar", width - 20, y + 12, { align: 'right' });

  drawPageFooter(doc, 1, 1);

  const filename = `MUSF_ReportCard_${studentReport.cicNo}_${studentReport.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
}
