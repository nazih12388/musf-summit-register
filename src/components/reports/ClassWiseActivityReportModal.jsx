import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { printHtmlDocument } from '../../utils/printHelper';
import { MusfEmblemSvg } from '../common/MusfEmblemSvg';
import { ACADEMIC_MONTHS } from './OfficialMalayalamReportModal';
import {
  Printer,
  Calendar,
  Filter,
  FileText,
  X,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Trophy,
  FileSpreadsheet,
  Building,
  ChevronRight,
  Layers
} from 'lucide-react';

export const ClassWiseActivityReportModal = ({ isOpen, onClose, defaultClassId = 'all' }) => {
  const { tr, lang } = useLanguage();
  const {
    students = [],
    classes = [],
    teams = [],
    sections = [],
    wingPrograms = [],
    wings = [],
    certificates = [],
    programs = [],
    entries = [],
    programResultsMap = {},
    summits = []
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState(defaultClassId);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('students'); // 'students' | 'programs'

  const classesMap = useMemo(() => Object.fromEntries((classes || []).map(c => [c.id, c])), [classes]);
  const teamsMap = useMemo(() => Object.fromEntries((teams || []).map(t => [t.id, t])), [teams]);
  const wingsMap = useMemo(() => Object.fromEntries((wings || []).map(w => [w.id, w])), [wings]);

  // Current selected class object
  const selectedClass = selectedClassId !== 'all' ? classesMap[selectedClassId] : null;

  // Students belonging to the chosen class
  const classStudents = useMemo(() => {
    return (students || []).filter(s => {
      if (selectedClassId === 'all') return true;
      return s.classId === selectedClassId;
    });
  }, [students, selectedClassId]);

  // Filter programs by selected month
  const filteredWingPrograms = useMemo(() => {
    return (wingPrograms || []).filter(p => {
      if (p.type === 'meeting' && p.isConfidential) return false;
      if (selectedMonth === 'all') return true;
      return p.date && p.date.startsWith(selectedMonth);
    });
  }, [wingPrograms, selectedMonth]);

  // Filter summit programs by selected month
  const filteredSummitPrograms = useMemo(() => {
    return (programs || []).filter(p => {
      if (p.status === 'draft' || p.status === 'planned') return false;
      if (selectedMonth === 'all') return true;
      return p.date && p.date.startsWith(selectedMonth);
    });
  }, [programs, selectedMonth]);

  // Comprehensive Student Activity Breakdown
  const studentReports = useMemo(() => {
    return classStudents.map(student => {
      const studentClass = classesMap[student.classId] || { name: student.className || 'Class' };
      const studentTeam = teamsMap[student.teamId] || { name: student.teamName || 'Team' };

      // Registered Wing Programs
      const registeredWingProgs = [];
      filteredWingPrograms.forEach(p => {
        const reg = (p.registeredStudents || []).find(r => r.studentId === student.id || r.cicNo === student.cicNo);
        if (reg) {
          registeredWingProgs.push({
            id: p.id,
            title: p.title,
            type: p.type === 'competition' ? 'Competition' : 'General Program',
            wingName: wingsMap[p.wingId]?.name || 'Union Wing',
            date: p.date,
            attended: reg.attended === true,
            isCompetition: p.type === 'competition',
            programObj: p
          });
        }
      });

      // Registered Summit Programs
      const registeredSummitProgs = [];
      filteredSummitPrograms.forEach(p => {
        const progEntries = entries.filter(e => e.programId === p.id);
        const isEnrolled = progEntries.some(e => e.studentId === student.id || (e.memberIds && e.memberIds.includes(student.id)));
        if (isEnrolled) {
          const res = (programResultsMap[p.id] || []).find(r => r.studentId === student.id || (r.memberIds && r.memberIds.includes(student.id)));
          registeredSummitProgs.push({
            id: p.id,
            title: p.title,
            type: 'Summit Competition',
            wingName: 'Fine Arts Summit',
            date: p.date,
            attended: Boolean(res),
            isCompetition: true,
            programObj: p
          });
        }
      });

      const allRegistered = [...registeredWingProgs, ...registeredSummitProgs];
      const attendedCount = allRegistered.filter(p => p.attended).length;
      const attendancePercent = allRegistered.length > 0 ? Math.round((attendedCount / allRegistered.length) * 100) : 0;

      // Competition Wins & 1st Places
      const competitionWins = [];
      filteredWingPrograms.forEach(p => {
        if (!p.winners) return;
        const w = wingsMap[p.wingId];
        const checkPlace = (entry, placeLabel) => {
          if (!entry) return;
          if (entry.studentId === student.id || entry.cicNo === student.cicNo || (entry.name && entry.name.toLowerCase().trim() === student.name.toLowerCase().trim())) {
            competitionWins.push({
              programTitle: p.title,
              wingName: w?.name || 'Union Wing',
              place: placeLabel,
              date: p.date
            });
          }
        };
        checkPlace(p.winners.firstPlace, '1st Place');
        checkPlace(p.winners.secondPlace, '2nd Place');
        checkPlace(p.winners.thirdPlace, '3rd Place');
      });

      filteredSummitPrograms.forEach(p => {
        const results = programResultsMap[p.id] || [];
        const res = results.find(r => r.studentId === student.id || (r.memberIds && r.memberIds.includes(student.id)));
        if (res && res.position) {
          competitionWins.push({
            programTitle: p.title,
            wingName: 'Fine Arts Summit',
            place: res.position || `${res.rank} Place`,
            date: p.date
          });
        }
      });

      // Certificates Earned
      const studentCerts = (certificates || []).filter(c => {
        const matchesStudent = c.studentId === student.id || (student.cicNo && c.cicNo === student.cicNo);
        if (!matchesStudent) return false;
        if (selectedMonth === 'all') return true;
        const dateStr = c.issueDate || c.issuedDate || c.createdAt;
        return dateStr && dateStr.startsWith(selectedMonth);
      });

      // Also add derived wing certificates
      competitionWins.forEach(win => {
        if (!studentCerts.some(c => c.title === win.programTitle || c.programTitle === win.programTitle)) {
          studentCerts.push({
            title: win.programTitle,
            awardTitle: `${win.place} - ${win.programTitle}`,
            wingName: win.wingName,
            place: win.place,
            issueDate: win.date
          });
        }
      });

      return {
        student,
        className: studentClass.name,
        teamName: studentTeam.name,
        totalPrograms: allRegistered.length,
        attendedCount,
        attendancePercent,
        registeredPrograms: allRegistered,
        competitionWins,
        firstPlaceWins: competitionWins.filter(w => w.place.includes('1st')).length,
        certificates: studentCerts
      };
    });
  }, [classStudents, filteredWingPrograms, filteredSummitPrograms, classesMap, teamsMap, wingsMap, entries, programResultsMap, certificates, selectedMonth]);

  // Aggregate Metrics
  const summaryMetrics = useMemo(() => {
    const totalStudents = studentReports.length;
    let totalProgramEngagements = 0;
    let totalAttendedEngagements = 0;
    let totalWins = 0;
    let totalFirstPlaces = 0;
    let totalCerts = 0;

    studentReports.forEach(sr => {
      totalProgramEngagements += sr.totalPrograms;
      totalAttendedEngagements += sr.attendedCount;
      totalWins += sr.competitionWins.length;
      totalFirstPlaces += sr.firstPlaceWins;
      totalCerts += sr.certificates.length;
    });

    const avgAttendance = totalProgramEngagements > 0
      ? Math.round((totalAttendedEngagements / totalProgramEngagements) * 100)
      : 0;

    return {
      totalStudents,
      totalProgramEngagements,
      avgAttendance,
      totalWins,
      totalFirstPlaces,
      totalCerts
    };
  }, [studentReports]);

  // Programs & Events Breakdown (showing who from this class participated and who won 1st Place)
  const programLedger = useMemo(() => {
    const list = [];
    filteredWingPrograms.forEach(p => {
      const classParticipants = (p.registeredStudents || []).filter(r =>
        classStudents.some(s => s.id === r.studentId || s.cicNo === r.cicNo)
      );

      const w = wingsMap[p.wingId];
      const firstWinner = p.winners?.firstPlace;
      const secondWinner = p.winners?.secondPlace;
      const thirdWinner = p.winners?.thirdPlace;

      list.push({
        id: p.id,
        title: p.title,
        wingName: w?.name || 'Union Wing',
        type: p.type === 'competition' ? 'Competition' : 'General Program',
        date: p.date,
        venue: p.venue || 'Campus',
        totalParticipantsOverall: (p.registeredStudents || []).length,
        classParticipantsCount: classParticipants.length,
        classParticipantsList: classParticipants.map(cp => cp.name || cp.cicNo),
        classAttendedCount: classParticipants.filter(cp => cp.attended).length,
        firstPlaceWinner: firstWinner ? `${firstWinner.name} (CIC ${firstWinner.cicNo || '-'})` : 'Not Announced',
        otherWinners: [
          secondWinner ? `2nd: ${secondWinner.name}` : null,
          thirdWinner ? `3rd: ${thirdWinner.name}` : null
        ].filter(Boolean).join('; ')
      });
    });

    return list;
  }, [filteredWingPrograms, classStudents, wingsMap]);

  const selectedMonthObj = ACADEMIC_MONTHS.find(m => m.value === selectedMonth) || ACADEMIC_MONTHS[0];
  const periodLabel = lang === 'ml' ? selectedMonthObj.labelMl : selectedMonthObj.labelEn;
  const classLabel = selectedClass ? selectedClass.name : 'All Classes';

  // Standalone Print / PDF Export Handler
  const handlePrint = () => {
    const contentHtml = `
      <div style="font-family: 'Times New Roman', serif; color: #0f172a; padding: 15px 20px;">
        <!-- Letterhead Header -->
        <div style="text-align: center; border-bottom: 2px solid #002B7F; padding-bottom: 12px; margin-bottom: 18px;">
          <div style="font-size: 18pt; font-family: 'Traditional Arabic', 'Amiri', serif; font-weight: bold; color: #002B7F; margin-bottom: 4px;">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيم
          </div>
          <div style="font-size: 15pt; font-weight: 900; letter-spacing: 1.5px; color: #002B7F; text-transform: uppercase;">
            MAJLIS UMARIYYA STUDENTS' FEDERATION (MUSF)
          </div>
          <div style="font-size: 11pt; font-weight: bold; color: #1e3a8a; margin-top: 2px;">
            മജ്‌ലിസ് ഉമരിയ്യ സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ
          </div>
          <div style="font-size: 9pt; color: #475569; margin-top: 4px;">
            Majlis Nagar, Puramannur - Valanchery, Malappuram Dt., Kerala - 676552 | Phone: 9526343334
          </div>
        </div>

        <!-- Document Title Banner -->
        <div style="text-align: center; margin-bottom: 18px;">
          <h2 style="font-size: 14pt; font-weight: bold; color: #002B7F; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Official Class-Wise Student Activity &amp; Participation Report
          </h2>
          <div style="font-size: 10pt; color: #334155; margin-top: 4px; font-weight: bold;">
            Class: <span style="color: #002B7F;">${classLabel}</span> &bull; Period: <span style="color: #002B7F;">${periodLabel}</span>
          </div>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">
            Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <!-- Summary KPI Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9pt;">
          <tr style="background: #f1f5f9;">
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Total Students:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #002B7F;">${summaryMetrics.totalStudents}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Program Engagements:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #002B7F;">${summaryMetrics.totalProgramEngagements}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Average Attendance:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #002B7F;">${summaryMetrics.avgAttendance}%</td>
          </tr>
          <tr style="background: #ffffff;">
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Prizes &amp; Wins:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #16a34a;">${summaryMetrics.totalWins}</td>
            <td style="border: 1px solid #899bb2ff; padding: 6px 10px; font-weight: bold;">1st Place Positions:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #d97706;">${summaryMetrics.totalFirstPlaces}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Certificates Awarded:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #4f46e5;">${summaryMetrics.totalCerts}</td>
          </tr>
        </table>

        <!-- Section 1: Student Roster & Achievements -->
        <h3 style="font-size: 11pt; font-weight: bold; color: #002B7F; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase;">
          1. Student-Wise Participation &amp; Achievement Roster
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 8.5pt;">
          <thead>
            <tr style="background: #002B7F; color: #ffffff;">
              <th style="border: 1px solid #002B7F; padding: 6px 4px; text-align: center; width: 30px;">#</th>
              <th style="border: 1px solid #002B7F; padding: 6px 8px; text-align: left;">Student Name &amp; CIC</th>
              <th style="border: 1px solid #002B7F; padding: 6px 8px; text-align: left;">House Team</th>
              <th style="border: 1px solid #002B7F; padding: 6px 6px; text-align: center;">Registered Programs</th>
              <th style="border: 1px solid #002B7F; padding: 6px 6px; text-align: center;">Attended</th>
              <th style="border: 1px solid #002B7F; padding: 6px 8px; text-align: left;">Prizes &amp; 1st Places Won</th>
              <th style="border: 1px solid #002B7F; padding: 6px 6px; text-align: center;">Certs</th>
            </tr>
          </thead>
          <tbody>
            ${studentReports.map((sr, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">
                  <strong>${sr.student.name}</strong><br/>
                  <span style="color: #64748b; font-size: 7.5pt;">CIC: ${sr.student.cicNo || '-'}</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${sr.teamName}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center;">
                  <strong>${sr.totalPrograms}</strong>
                  ${sr.registeredPrograms.length > 0 ? `
                    <div style="font-size: 7pt; color: #475569; text-align: left; margin-top: 3px;">
                      ${sr.registeredPrograms.slice(0, 3).map(p => `&bull; ${p.title} (${p.type === 'Competition' ? 'Comp' : 'Prog'})`).join('<br/>')}
                      ${sr.registeredPrograms.length > 3 ? `<em>+${sr.registeredPrograms.length - 3} more</em>` : ''}
                    </div>
                  ` : ''}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center;">
                  <span style="color: ${sr.attendancePercent >= 75 ? '#16a34a' : '#d97706'}; font-weight: bold;">
                    ${sr.attendedCount} / ${sr.totalPrograms} (${sr.attendancePercent}%)
                  </span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">
                  ${sr.competitionWins.length > 0 ? `
                    ${sr.competitionWins.map(w => `
                      <div style="font-size: 7.5pt; margin-bottom: 2px;">
                        <span style="color: ${w.place.includes('1st') ? '#d97706' : '#2563eb'}; font-weight: bold;">[${w.place}]</span>
                        ${w.programTitle}
                      </div>
                    `).join('')}
                  ` : '<span style="color: #94a3b8; font-size: 7.5pt;">None in period</span>'}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center; font-weight: bold; color: #4f46e5;">
                  ${sr.certificates.length}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Section 2: Programs Conducted & Winners Breakdown -->
        <h3 style="font-size: 11pt; font-weight: bold; color: #002B7F; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase;">
          2. Program-Wise Participation &amp; Winners Breakdown
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff;">
              <th style="border: 1px solid #1e3a8a; padding: 6px 4px; text-align: center; width: 30px;">#</th>
              <th style="border: 1px solid #1e3a8a; padding: 6px 8px; text-align: left;">Program / Event</th>
              <th style="border: 1px solid #1e3a8a; padding: 6px 8px; text-align: left;">Wing &amp; Date</th>
              <th style="border: 1px solid #1e3a8a; padding: 6px 6px; text-align: center;">Class Participation</th>
              <th style="border: 1px solid #1e3a8a; padding: 6px 8px; text-align: left;">1st Place Winner</th>
              <th style="border: 1px solid #1e3a8a; padding: 6px 8px; text-align: left;">Other Prize Winners</th>
            </tr>
          </thead>
          <tbody>
            ${programLedger.map((pr, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">
                  <strong>${pr.title}</strong><br/>
                  <span style="font-size: 7.5pt; color: #64748b;">${pr.type} &bull; ${pr.venue}</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">
                  ${pr.wingName}<br/>
                  <span style="font-size: 7.5pt; color: #64748b;">${pr.date || '-'}</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center;">
                  <strong>${pr.classParticipantsCount}</strong> students<br/>
                  <span style="font-size: 7pt; color: #16a34a;">${pr.classAttendedCount} attended</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">
                  <strong style="color: #d97706;">${pr.firstPlaceWinner}</strong>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 7.5pt; color: #475569;">
                  ${pr.otherWinners || '-'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Signatures Footer -->
        <div style="margin-top: 40px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid #cbd5e1;">
          <div style="text-align: center; width: 180px;">
            <div style="font-size: 9pt; font-weight: bold;">Staff In-Charge</div>
            <div style="font-size: 8pt; color: #64748b;">Majlis Umariyya</div>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="font-size: 9pt; font-weight: bold;">General Secretary</div>
            <div style="font-size: 8pt; color: #64748b;">Students Federation</div>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="font-size: 9pt; font-weight: bold;">Union Chairman</div>
            <div style="font-size: 8pt; color: #64748b;">MUSF Executive</div>
          </div>
        </div>
      </div>
    `;

    printHtmlDocument({
      title: `MUSF_Class_Report_${classLabel.replace(/\s+/g, '_')}_${selectedMonth}`,
      contentHtml,
      orientation: 'portrait'
    });
  };

  // Excel (.xlsx) Export Handler
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Student Roster
    const studentData = studentReports.map(sr => ({
      "Student Name": sr.student.name,
      "CIC No": sr.student.cicNo || "-",
      "Class": sr.className,
      "House Team": sr.teamName,
      "Total Registered Programs": sr.totalPrograms,
      "Total Attended": sr.attendedCount,
      "Attendance %": `${sr.attendancePercent}%`,
      "1st Place Wins": sr.firstPlaceWins,
      "Total Prizes Won": sr.competitionWins.length,
      "Certificates Earned": sr.certificates.length,
      "Prizes List": sr.competitionWins.map(w => `${w.place}: ${w.programTitle} (${w.wingName})`).join('; '),
      "Programs List": sr.registeredPrograms.map(p => `${p.title} [${p.type}, Attended: ${p.attended ? 'Yes' : 'No'}]`).join('; ')
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentData);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Student Performance");

    // Sheet 2: Programs and Winners Ledger
    const programData = programLedger.map(pr => ({
      "Program Title": pr.title,
      "Organizer Wing": pr.wingName,
      "Program Type": pr.type,
      "Date": pr.date,
      "Venue": pr.venue,
      "Class Students Enrolled": pr.classParticipantsCount,
      "Class Students Attended": pr.classAttendedCount,
      "Enrolled Student Names": pr.classParticipantsList.join(', '),
      "1st Place Winner": pr.firstPlaceWinner,
      "Other Winners": pr.otherWinners || "-"
    }));
    const wsPrograms = XLSX.utils.json_to_sheet(programData);
    XLSX.utils.book_append_sheet(wb, wsPrograms, "Programs & Winners Ledger");

    XLSX.writeFile(wb, `MUSF_Class_Report_${classLabel.replace(/\s+/g, '_')}_${selectedMonth}.xlsx`);
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const studentData = studentReports.map(sr => ({
      "Student Name": sr.student.name,
      "CIC No": sr.student.cicNo || "-",
      "Class": sr.className,
      "House Team": sr.teamName,
      "Total Registered Programs": sr.totalPrograms,
      "Total Attended": sr.attendedCount,
      "Attendance %": `${sr.attendancePercent}%`,
      "1st Place Wins": sr.firstPlaceWins,
      "Total Prizes Won": sr.competitionWins.length,
      "Certificates Earned": sr.certificates.length
    }));
    const ws = XLSX.utils.json_to_sheet(studentData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `MUSF_Class_Report_${classLabel.replace(/\s+/g, '_')}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-white dark:bg-[#0F1B2B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F2A4A] via-[#163B66] to-[#0E7C86] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Class-Wise Detailed Student Activity Report
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold uppercase tracking-wider hidden sm:inline">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                Programs enrolled, attendance rate, competition participation, 1st place prizes, and certificates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls & Action Buttons Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Selector */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#0F1B2B] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Building className="w-4 h-4 text-[#0E7C86] shrink-0" />
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Classes ({students.length} students)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({students.filter(s => s.classId === c.id).length} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter Selector */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#0F1B2B] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Period:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                {ACADEMIC_MONTHS.map(m => (
                  <option key={m.value} value={m.value}>
                    {lang === 'ml' ? m.labelMl : m.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Compact KPI Overview Summary Cards */}
        <div className="p-4 bg-white dark:bg-[#0F1B2B] border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-500 text-[11px] block font-semibold">Students</span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tabular-nums leading-none">
                {summaryMetrics.totalStudents}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40">
              <span className="text-indigo-600 dark:text-indigo-400 text-[11px] block font-semibold">Engagements</span>
              <span className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-300 tabular-nums leading-none">
                {summaryMetrics.totalProgramEngagements}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40">
              <span className="text-[#0E7C86] dark:text-teal-400 text-[11px] block font-semibold">Avg Attendance</span>
              <span className="text-base sm:text-lg font-black text-teal-700 dark:text-teal-300 tabular-nums leading-none">
                {summaryMetrics.avgAttendance}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40">
              <span className="text-amber-600 dark:text-amber-400 text-[11px] block font-semibold">Total Prizes Won</span>
              <span className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-300 tabular-nums leading-none">
                {summaryMetrics.totalWins}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px] block font-semibold">1st Place Wins</span>
              <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 tabular-nums leading-none">
                {summaryMetrics.totalFirstPlaces}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40">
              <span className="text-purple-600 dark:text-purple-400 text-[11px] block font-semibold">Certificates</span>
              <span className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-300 tabular-nums leading-none">
                {summaryMetrics.totalCerts}
              </span>
            </div>
          </div>
        </div>

        {/* View Toggle Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('students')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeSubTab === 'students'
                  ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Performance Roster ({studentReports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('programs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeSubTab === 'programs'
                  ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Program Participation &amp; Winners Ledger ({programLedger.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Showing records for <strong>{periodLabel}</strong>
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeSubTab === 'students' ? (
            <div className="space-y-3">
              {studentReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No students found in this class selection.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0F1B2B]">
                  {studentReports.map((sr, idx) => (
                    <div key={sr.student.id || idx} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {sr.student.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                                CIC {sr.student.cicNo || '-'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                                {sr.className}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 mt-0.5 block">
                              Team: <strong>{sr.teamName}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Student Metrics Badges */}
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
                          <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                            {sr.attendedCount} / {sr.totalPrograms} Attended ({sr.attendancePercent}%)
                          </span>
                          {sr.firstPlaceWins > 0 && (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" />
                              <span>{sr.firstPlaceWins} First Place</span>
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-purple-500" />
                            <span>{sr.certificates.length} Certs</span>
                          </span>
                        </div>
                      </div>

                      {/* Registered Programs Row */}
                      {sr.registeredPrograms.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                            Registered Programs ({sr.registeredPrograms.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {sr.registeredPrograms.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${p.attended
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                              >
                                <span>{p.title}</span>
                                <span className="text-[10px] opacity-75">
                                  ({p.type === 'Competition' ? 'Comp' : 'Prog'} &bull; {p.attended ? 'Attended ✓' : 'Registered'})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Competition Wins List */}
                      {sr.competitionWins.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-500 font-semibold text-[11px]">Wins:</span>
                          {sr.competitionWins.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${w.place.includes('1st')
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                }`}
                            >
                              {w.place}: {w.programTitle}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {programLedger.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No programs found for the selected period.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0F1B2B]">
                  {programLedger.map((pr, pIdx) => (
                    <div key={pr.id || pIdx} className="p-4 space-y-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {pr.wingName}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${pr.type === 'Competition'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                              }`}>
                              {pr.type}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {pr.date || 'TBA'} &bull; {pr.venue}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            {pr.title}
                          </h4>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 block sm:inline-block">
                            Class Participation: <strong>{pr.classParticipantsCount}</strong> students ({pr.classAttendedCount} attended)
                          </span>
                        </div>
                      </div>

                      {/* Winners and Participants Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40">
                          <span className="font-bold text-amber-800 dark:text-amber-300 text-[11px] block">
                            1st Place &amp; Winners:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                            {pr.firstPlaceWinner}
                          </span>
                          {pr.otherWinners && (
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {pr.otherWinners}
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] block">
                            Enrolled Class Students ({pr.classParticipantsList.length}):
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 text-xs block mt-0.5 line-clamp-2">
                            {pr.classParticipantsList.length > 0 ? pr.classParticipantsList.join(', ') : 'None from this class'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            Official records for <strong>Majlis Umariyya Wafy College</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs transition active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
