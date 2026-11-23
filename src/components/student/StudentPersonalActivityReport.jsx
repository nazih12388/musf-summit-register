import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { generateCertificatePDF } from '../../utils/certificate';
import { printHtmlDocument } from '../../utils/printHelper';
import { ACADEMIC_MONTHS } from '../reports/OfficialMalayalamReportModal';
import {
  FileText,
  Calendar,
  Filter,
  Printer,
  Download,
  Trophy,
  Award,
  CheckCircle2,
  Users,
  Clock,
  MapPin,
  Building,
  Sparkles,
  ChevronRight,
  Folder
} from 'lucide-react';

export const StudentPersonalActivityReport = ({ student, currentClass, currentTeam }) => {
  const { tr, lang } = useLanguage();
  const {
    wingPrograms = [],
    wings = [],
    certificates = [],
    programs = [],
    entries = [],
    programResultsMap = {}
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('all');

  const wingsMap = useMemo(() => Object.fromEntries((wings || []).map(w => [w.id, w])), [wings]);

  // Filter wing programs for the chosen month
  const filteredWingPrograms = useMemo(() => {
    return (wingPrograms || []).filter(p => {
      if (p.type === 'meeting' && p.isConfidential) return false;
      if (selectedMonth === 'all') return true;
      return p.date && p.date.startsWith(selectedMonth);
    });
  }, [wingPrograms, selectedMonth]);

  // Filter summit programs for the chosen month
  const filteredSummitPrograms = useMemo(() => {
    return (programs || []).filter(p => {
      if (p.status === 'draft' || p.status === 'planned') return false;
      if (selectedMonth === 'all') return true;
      return p.date && p.date.startsWith(selectedMonth);
    });
  }, [programs, selectedMonth]);

  // Complete list of programs linked to the student
  const studentActivityItems = useMemo(() => {
    if (!student) return [];
    const list = [];

    // 1. Wing Programs
    filteredWingPrograms.forEach(p => {
      const reg = (p.registeredStudents || []).find(r => r.studentId === student.id || r.cicNo === student.cicNo);
      if (reg) {
        const wing = wingsMap[p.wingId];
        const isComp = p.type === 'competition';

        // Check if student won any place
        let studentPlace = null;
        if (p.winners) {
          const checkWinner = (entry, label) => {
            if (!entry) return false;
            return entry.studentId === student.id ||
              entry.cicNo === student.cicNo ||
              (entry.name && entry.name.toLowerCase().trim() === student.name.toLowerCase().trim());
          };
          if (checkWinner(p.winners.firstPlace)) studentPlace = '1st Place';
          else if (checkWinner(p.winners.secondPlace)) studentPlace = '2nd Place';
          else if (checkWinner(p.winners.thirdPlace)) studentPlace = '3rd Place';
        }

        // Matching certificate
        const cert = (certificates || []).find(c =>
          (c.studentId === student.id || c.cicNo === student.cicNo) &&
          (c.programId === p.id || c.title === p.title)
        );

        list.push({
          id: p.id,
          title: p.title,
          organizer: wing?.name || 'Union Wing',
          type: isComp ? 'Competition' : 'General Program / Activity',
          isCompetition: isComp,
          date: p.date,
          time: p.time,
          venue: p.venue || 'Campus Venue',
          registered: true,
          attended: reg.attended === true,
          totalParticipants: (p.registeredStudents || []).length,
          participantsList: (p.registeredStudents || []).map(r => r.name || r.cicNo),
          firstPlaceWinner: p.winners?.firstPlace ? `${p.winners.firstPlace.name} (CIC: ${p.winners.firstPlace.cicNo || '-'})` : 'Not declared',
          secondPlaceWinner: p.winners?.secondPlace ? p.winners.secondPlace.name : null,
          thirdPlaceWinner: p.winners?.thirdPlace ? p.winners.thirdPlace.name : null,
          studentPlace,
          certificate: cert || (studentPlace ? {
            title: p.title,
            awardTitle: `${studentPlace} - ${p.title}`,
            wingName: wing?.name || 'Union Wing',
            place: studentPlace,
            issueDate: p.date
          } : null)
        });
      }
    });

    // 2. Summit Programs
    filteredSummitPrograms.forEach(p => {
      const progEntries = entries.filter(e => e.programId === p.id);
      const myEntry = progEntries.find(e => e.studentId === student.id || (e.memberIds && e.memberIds.includes(student.id)));

      if (myEntry) {
        const results = programResultsMap[p.id] || [];
        const res = results.find(r => r.studentId === student.id || (r.memberIds && r.memberIds.includes(student.id)));
        const firstResult = results.find(r => r.rank === 1 || r.position === '1st');

        list.push({
          id: p.id,
          title: p.title,
          organizer: 'Fine Arts Summit',
          type: 'Fine Arts Competition',
          isCompetition: true,
          date: p.date,
          venue: 'Summit Auditorium',
          registered: true,
          attended: Boolean(res),
          totalParticipants: progEntries.length,
          participantsList: progEntries.map(e => e.studentName || e.chestNo || 'Participant'),
          firstPlaceWinner: firstResult ? (firstResult.studentName || '1st Place Winner') : 'Results Pending',
          studentPlace: res?.position || (res?.rank ? `${res.rank} Place` : null),
          certificate: res ? {
            title: p.title,
            awardTitle: `${res.position || 'Merit'} - ${p.title}`,
            wingName: 'Fine Arts Summit',
            place: res.position,
            issueDate: p.date
          } : null
        });
      }
    });

    // Sort by date descending
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [student, filteredWingPrograms, filteredSummitPrograms, wingsMap, certificates, entries, programResultsMap]);

  // Aggregate stats
  const totalPrograms = studentActivityItems.length;
  const attendedCount = studentActivityItems.filter(i => i.attended).length;
  const attendanceRate = totalPrograms > 0 ? Math.round((attendedCount / totalPrograms) * 100) : 0;
  const competitionsCount = studentActivityItems.filter(i => i.isCompetition).length;
  const prizesWon = studentActivityItems.filter(i => i.studentPlace).length;
  const firstPlacesWon = studentActivityItems.filter(i => i.studentPlace && i.studentPlace.includes('1st')).length;
  const totalCertificates = studentActivityItems.filter(i => i.certificate).length;

  const selectedMonthObj = ACADEMIC_MONTHS.find(m => m.value === selectedMonth) || ACADEMIC_MONTHS[0];
  const periodLabel = lang === 'ml' ? selectedMonthObj.labelMl : selectedMonthObj.labelEn;

  // Handle Certificate PDF Download
  const handleDownloadCert = (cert, item) => {
    generateCertificatePDF({
      studentName: student?.name || 'Student',
      cicNo: student?.cicNo || '',
      className: currentClass?.name || student?.className || 'Class',
      teamName: currentTeam?.name || student?.teamName || 'House Team',
      awardTitle: cert?.awardTitle || cert?.title || item?.title || 'Merit Certificate',
      wingName: cert?.wingName || item?.organizer || 'Students Union',
      programTitle: item?.title || '',
      place: cert?.place || item?.studentPlace || 'Award of Merit',
      issueDate: cert?.issueDate || item?.date || new Date().toISOString().slice(0, 10),
      citation: `Awarded with distinction for commendable achievement under ${item?.organizer || 'the Students Union'}.`
    });
  };

  // Standalone Print / PDF Generation
  const handlePrint = () => {
    const contentHtml = `
      <div style="font-family: 'Times New Roman', serif; color: #0f172a; padding: 20px 25px;">
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
          <h2 style="font-size: 13.5pt; font-weight: bold; color: #002B7F; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
            Individual Student Activity, Attendance &amp; Achievements Report
          </h2>
          <div style="font-size: 10pt; color: #334155; margin-top: 4px; font-weight: bold;">
            Reporting Period: <span style="color: #002B7F;">${periodLabel}</span>
          </div>
        </div>

        <!-- Student Profile Information Card -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 9pt;">
          <tr style="background: #f8fafc;">
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 25%; font-weight: bold;">Student Name:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 25%; font-weight: 900; color: #002B7F;">${student?.name}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 25%; font-weight: bold;">CIC Number:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 25%; font-weight: 900; font-family: monospace;">${student?.cicNo || '-'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Class / Division:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${currentClass?.name || student?.className || 'Class'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">House Team:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${currentTeam?.name || student?.teamName || 'House'}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Enrolled Programs:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; color: #002B7F;">${totalPrograms} (${competitionsCount} Competitions)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Attendance Status:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; color: ${attendanceRate >= 75 ? '#16a34a' : '#d97706'};">
              ${attendedCount} / ${totalPrograms} Attended (${attendanceRate}%)
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Prizes &amp; 1st Places:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #d97706;">${prizesWon} (${firstPlacesWon} First Place)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">Certificates Awarded:</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: 900; color: #4f46e5;">${totalCertificates} Certificates</td>
          </tr>
        </table>

        <!-- Detailed Activity Ledger Table -->
        <h3 style="font-size: 11pt; font-weight: bold; color: #002B7F; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase;">
          Program-Wise Participation, Attendance &amp; Winners Breakdown
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
          <thead>
            <tr style="background: #002B7F; color: #ffffff;">
              <th style="border: 1px solid #002B7F; padding: 6px 4px; text-align: center; width: 28px;">#</th>
              <th style="border: 1px solid #002B7F; padding: 6px 8px; text-align: left;">Program Title &amp; Organizer</th>
              <th style="border: 1px solid #002B7F; padding: 6px 6px; text-align: center;">Type</th>
              <th style="border: 1px solid #002B7F; padding: 6px 6px; text-align: center;">Date &amp; Venue</th>
              <th style="border: 1px solid #002B7F; padding: 6px 6px; text-align: center;">Attendance</th>
              <th style="border: 1px solid #002B7F; padding: 6px 8px; text-align: left;">1st Place Winner</th>
              <th style="border: 1px solid #002B7F; padding: 6px 6px; text-align: center;">Student Result</th>
            </tr>
          </thead>
          <tbody>
            ${studentActivityItems.length === 0 ? `
              <tr>
                <td colspan="7" style="border: 1px solid #cbd5e1; padding: 16px; text-align: center; color: #64748b;">
                  No programs found for this student in the selected period (${periodLabel}).
                </td>
              </tr>
            ` : studentActivityItems.map((item, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">
                  <strong>${item.title}</strong><br/>
                  <span style="font-size: 7.5pt; color: #64748b;">${item.organizer}</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center;">
                  <span style="font-size: 7.5pt; font-weight: bold; color: ${item.isCompetition ? '#b45309' : '#0f766e'};">
                    ${item.isCompetition ? 'Competition' : 'Program'}
                  </span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center; font-size: 7.5pt;">
                  ${item.date || '-'}<br/>
                  <span style="color: #64748b;">${item.venue}</span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center;">
                  <span style="color: ${item.attended ? '#16a34a' : '#d97706'}; font-weight: bold; font-size: 8pt;">
                    ${item.attended ? 'Attended ✓' : 'Registered'}
                  </span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">
                  <strong>${item.firstPlaceWinner}</strong>
                  ${item.secondPlaceWinner ? `<div style="font-size: 7pt; color: #64748b;">2nd: ${item.secondPlaceWinner}</div>` : ''}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 6px; text-align: center;">
                  ${item.studentPlace ? `
                    <span style="font-weight: 900; color: ${item.studentPlace.includes('1st') ? '#d97706' : '#2563eb'}; font-size: 8.5pt;">
                      ${item.studentPlace}
                    </span>
                  ` : '<span style="color: #94a3b8; font-size: 7.5pt;">Participant</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Footer Signatures -->
        <div style="margin-top: 40px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid #cbd5e1;">
          <div style="text-align: center; width: 180px;">
            <div style="font-size: 9pt; font-weight: bold;">Student Signature</div>
            <div style="font-size: 8pt; color: #64748b;">${student?.name}</div>
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
      title: `MUSF_Activity_Report_${student?.name?.replace(/\s+/g, '_')}_${selectedMonth}`,
      contentHtml,
      orientation: 'portrait'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Student Info, Month Filter & Print Action */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] dark:text-white">
              My Activity &amp; Participation Report
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-bold">
              Official Log
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Complete record of your registered programs, attendance status, competition participation, 1st place prizes, and certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Month Selector Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
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

          {/* Standalone Print / PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Enrolled Programs</span>
          <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5 tabular-nums">
            {totalPrograms}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {competitionsCount} competitions
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-[#0E7C86] dark:text-teal-400 block">Attendance Rate</span>
          <span className="text-xl font-black text-[#0E7C86] dark:text-teal-300 block mt-0.5 tabular-nums">
            {attendanceRate}%
          </span>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 block mt-0.5">
            {attendedCount} / {totalPrograms} attended
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">Total Prizes</span>
          <span className="text-xl font-black text-amber-700 dark:text-amber-300 block mt-0.5 tabular-nums">
            {prizesWon}
          </span>
          <span className="text-[10px] text-amber-600 block mt-0.5">
            podium finishes
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">1st Place Wins</span>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 block mt-0.5 tabular-nums">
            {firstPlacesWon}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">
            gold positions
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-center shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 block">Certificates</span>
          <span className="text-xl font-black text-purple-700 dark:text-purple-300 block mt-0.5 tabular-nums">
            {totalCertificates}
          </span>
          <span className="text-[10px] text-purple-600 block mt-0.5">
            ready for download
          </span>
        </div>
      </div>

      {/* Program Ledger List */}
      <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <span>Programs &amp; Events Ledger</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
              {studentActivityItems.length}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Filter: <strong>{periodLabel}</strong>
          </span>
        </div>

        {studentActivityItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No program engagements found for this period.</p>
            <p>Switch to "All Months" or select an active month to view your participation log.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {studentActivityItems.map((item, idx) => (
              <div key={item.id || idx} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.organizer}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        item.isCompetition
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.date || 'TBA'}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-slate-500">
                      {item.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      )}
                      {item.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.venue}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {item.totalParticipants} total participants
                      </span>
                    </div>
                  </div>

                  {/* Attendance & Result Badges */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs ${
                      item.attended
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-teal-50 text-[#0E7C86] dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.attended ? 'Attended ✓' : 'Registered'}</span>
                    </span>

                    {item.studentPlace && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{item.studentPlace}</span>
                      </span>
                    )}

                    {item.certificate && (
                      <button
                        type="button"
                        onClick={() => handleDownloadCert(item.certificate, item)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        title="Download Certificate PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Certificate PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Participation & Winners Breakdown Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {/* 1st Place & Winners */}
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-[11px] block">
                      1st Place / Competition Winners:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block mt-0.5">
                      {item.firstPlaceWinner}
                    </span>
                    {(item.secondPlaceWinner || item.thirdPlaceWinner) && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap gap-2">
                        {item.secondPlaceWinner && <span>2nd: {item.secondPlaceWinner}</span>}
                        {item.thirdPlaceWinner && <span>&bull; 3rd: {item.thirdPlaceWinner}</span>}
                      </div>
                    )}
                  </div>

                  {/* Registered Participants */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] block">
                      Participants in this Program ({item.participantsList.length}):
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] block mt-0.5 line-clamp-2">
                      {item.participantsList.length > 0 ? item.participantsList.join(', ') : 'Registered participants'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
