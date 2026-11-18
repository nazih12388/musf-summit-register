import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  exportSummitProgramListExcel,
  exportParticipationReportExcel,
  exportFieldPerformanceExcel,
  exportAssignmentMatrixExcel,
  exportTeamRegistrationStatusExcel,
  exportComprehensiveReportExcel
} from '../../utils/excel';
import {
  generateComprehensiveAcademicReportPDF,
  generateIndividualStudentReportCardPDF
} from '../../utils/comprehensivePdfReport';
import {
  computeComprehensiveReport,
  formatMonthLabel,
  MONTH_NAMES
} from '../../utils/reportCalculations';
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Filter,
  Users,
  Layers,
  Search,
  Printer,
  ChevronRight,
  GitCompare,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Table,
  Sliders,
  Building,
  BookOpen,
  CalendarDays,
  FileText,
  History,
  Check,
  Eye,
  Sparkles,
  X
} from 'lucide-react';

export const ReportsAnalytics = () => {
  const {
    summits,
    sections,
    fields,
    programs,
    entries,
    students,
    teams,
    classes,
    judges,
    marks,
    attendance,
    settings,
    studentAttendanceMap,
    programResultsMap,
    studentStandings,
    top10Rankings,
    teamStandings,
    fieldPerformanceMap,
    classEvaluations,
    reportHistory,
    addReportHistory,
    checkSummitRegistrationDeadlines
  } = useApp();
  const { t } = useLanguage();

  const [deadlineAlertToast, setDeadlineAlertToast] = useState('');

  // Primary Tab: 'monthly', 'selected_months', 'summit_progs', 'participation', 'field_perf', 'assignment_matrix', 'registration_status', 'report_history'
  const [reportType, setReportType] = useState('monthly');

  // Preview sub-tab: 'summary', 'class_wise', 'team_wise', 'top10', 'matrix', 'dossier'
  const [previewTab, setPreviewTab] = useState('summary');

  // Single Month selection
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Multi-Month selection
  const [selectedMonthsMulti, setSelectedMonthsMulti] = useState(['2026-10', '2026-11']);

  // Filters & Options
  const [filterSection, setFilterSection] = useState('all'); // 'all', 'thamheediyya', 'aliya'
  const [filterClass, setFilterClass] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [viewMode, setViewMode] = useState('both'); // 'both', 'class_wise', 'team_wise'
  const [detailMode, setDetailMode] = useState('summary'); // 'summary', 'detailed'
  const [classReportMode, setClassReportMode] = useState('matrix'); // 'matrix' (summit-by-summit) or 'summary'
  const [searchStudent, setSearchStudent] = useState('');
  const [sortField, setSortField] = useState('rank'); // 'rank', 'name', 'marks', 'attendance'

  // Legacy/Summit progs filter
  const [selectedSummitId, setSelectedSummitId] = useState(summits[0]?.id || 'summit_oct_1');
  const [filterField, setFilterField] = useState('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // All distinct available months from summits
  const availableMonths = useMemo(() => {
    const set = new Set();
    summits.forEach(s => {
      const m = s.month || (s.date ? s.date.slice(0, 7) : '');
      if (m) set.add(m);
    });
    return Array.from(set).sort();
  }, [summits]);

  // Active period months array
  const activePeriodMonths = useMemo(() => {
    if (reportType === 'monthly') {
      return [selectedMonth];
    }
    return selectedMonthsMulti.length > 0 ? selectedMonthsMulti : ['2026-10', '2026-11'];
  }, [reportType, selectedMonth, selectedMonthsMulti]);

  const periodTitle = useMemo(() => {
    if (reportType === 'monthly') {
      return formatMonthLabel(selectedMonth);
    }
    if (activePeriodMonths.length === availableMonths.length && availableMonths.length > 0) {
      return "Full Academic Year";
    }
    return activePeriodMonths.map(formatMonthLabel).join(', ');
  }, [reportType, selectedMonth, activePeriodMonths, availableMonths]);

  // Comprehensive Report Data Calculation Engine
  const comprehensiveData = useMemo(() => {
    return computeComprehensiveReport({
      summits,
      programs,
      entries,
      marks,
      attendance,
      students,
      classes,
      teams,
      fields,
      settings,
      periodMonths: activePeriodMonths,
      sectionFilter: filterSection,
      classFilter: filterClass,
      teamFilter: filterTeam
    });
  }, [
    summits,
    programs,
    entries,
    marks,
    attendance,
    students,
    classes,
    teams,
    fields,
    settings,
    activePeriodMonths,
    filterSection,
    filterClass,
    filterTeam
  ]);

  // Filtered & Sorted Student Reports
  const displayStudentReports = useMemo(() => {
    let list = comprehensiveData.studentReports;
    if (searchStudent.trim()) {
      const q = searchStudent.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.cicNo.toLowerCase().includes(q) ||
        s.chestNo.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name);
      if (sortField === 'marks') return b.totalMarksObtained - a.totalMarksObtained;
      if (sortField === 'attendance') return b.overallAttendancePercentage - a.overallAttendancePercentage;
      return a.overallSectionRank - b.overallSectionRank || b.totalMarksObtained - a.totalMarksObtained;
    });
  }, [comprehensiveData.studentReports, searchStudent, sortField]);

  // Active Top 10 leaders respecting Section, Class, House, and Search filters
  const activeTop10List = useMemo(() => {
    if (filterClass !== 'all' || filterTeam !== 'all' || searchStudent.trim()) {
      return displayStudentReports.slice(0, 10);
    }
    return filterSection === 'thamheediyya' ? comprehensiveData.top10.thamheediyya
      : filterSection === 'aliya' ? comprehensiveData.top10.aliya
      : comprehensiveData.top10.overall;
  }, [filterClass, filterTeam, searchStudent, filterSection, comprehensiveData.top10, displayStudentReports]);

  // Export PDF
  const handleDownloadPDF = () => {
    const filename = generateComprehensiveAcademicReportPDF({
      reportData: comprehensiveData,
      reportType,
      periodTitle,
      viewMode,
      detailMode,
      sectionFilter: filterSection,
      classFilter: filterClass,
      teamFilter: filterTeam,
      settings
    });

    addReportHistory({
      name: `${reportType === 'monthly' ? 'Monthly Report' : 'Multi-Month Report'} (${periodTitle})`,
      reportType,
      months: activePeriodMonths,
      generatedBy: 'Director of Summits (Admin)',
      sectionFilter: filterSection,
      itemCount: comprehensiveData.studentReports.length
    });
  };

  // Export Excel
  const handleDownloadExcel = () => {
    exportComprehensiveReportExcel(comprehensiveData, periodTitle, reportType);
    addReportHistory({
      name: `Excel: ${reportType === 'monthly' ? 'Monthly' : 'Multi-Month'} (${periodTitle})`,
      reportType,
      months: activePeriodMonths,
      generatedBy: 'Director of Summits (Admin)',
      sectionFilter: filterSection,
      itemCount: comprehensiveData.studentReports.length
    });
  };

  // Print Report - Opens official formatted print preview modal
  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  // Toggle month selection for Multi-Month
  const toggleMonthSelection = (mKey) => {
    setSelectedMonthsMulti(prev => {
      if (prev.includes(mKey)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(m => m !== mKey);
      }
      return [...prev, mKey].sort();
    });
  };

  // ==========================================
  // SPECIALIZED REPORT ROWS (1 to 5)
  // ==========================================
  const activeSummit = summits.find(s => s.id === selectedSummitId) || summits[0];
  const exportMeta = {
    summitName: activeSummit?.name,
    section: filterSection === 'all' ? 'All Sections' : (filterSection === 'aliya' ? 'Aliya' : 'Thamheediyya'),
    field: filterField === 'all' ? 'All Fields' : fields.find(f => f.id === filterField)?.name || filterField,
    dateRange: activeSummit?.date
  };

  // 1. Summit Program List
  const summitProgramListRows = useMemo(() => {
    return programs
      .filter(p => selectedSummitId === 'all' || p.summitId === selectedSummitId)
      .filter(p => filterSection === 'all' || p.sectionId === filterSection || p.sectionId === 'both')
      .map(prog => {
        const progEntries = entries.filter(e => e.programId === prog.id);
        const fld = fields.find(f => f.id === prog.fieldId);
        const sec = sections.find(s => s.id === prog.sectionId);
        const participatingTeams = teams
          .filter(t => prog.teamAllocations?.[t.id]?.assigned)
          .map(t => `${t.name} (${progEntries.filter(e => e.teamId === t.id).length}/${prog.teamAllocations?.[t.id]?.allowedCount || 1})`)
          .join(', ');

        return {
          id: prog.id,
          programName: prog.name,
          sectionName: sec?.name?.split(' ')[0] || (prog.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'),
          fieldName: fld?.name || '-',
          type: prog.type,
          stage: prog.stage,
          time: prog.time,
          defaultAllowed: prog.defaultAllowedPerTeam || 1,
          totalRegistered: progEntries.length,
          participatingTeams: participatingTeams || 'All Teams'
        };
      });
  }, [programs, entries, selectedSummitId, filterSection, fields, sections, teams]);

  // 2. Participation Report
  const participationReportRows = useMemo(() => {
    const list = [];
    entries.forEach(entry => {
      const prog = programs.find(p => p.id === entry.programId);
      if (!prog) return;
      if (selectedSummitId !== 'all' && prog.summitId !== selectedSummitId) return;
      if (filterSection !== 'all' && prog.sectionId !== filterSection && prog.sectionId !== 'both') return;

      const fld = fields.find(f => f.id === prog.fieldId);
      const team = teams.find(t => t.id === entry.teamId);
      const summit = summits.find(s => s.id === prog.summitId);

      if (entry.groupName) {
        list.push({
          entryId: entry.id,
          studentName: entry.groupName,
          chestNo: entry.chestNo,
          cicNo: 'Group',
          sectionName: prog.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya',
          className: 'Ensemble',
          teamName: team?.name || '-',
          fieldName: fld?.name || '-',
          programName: prog.name,
          summitName: summit?.name || '-'
        });
      } else {
        const st = studentStandings.find(s => s.id === entry.studentId);
        if (filterClass !== 'all' && st?.classId !== filterClass) return;
        if (filterTeam !== 'all' && entry.teamId !== filterTeam) return;

        list.push({
          entryId: entry.id,
          studentName: st?.name || '-',
          chestNo: entry.chestNo,
          cicNo: st?.cicNo || '-',
          sectionName: st?.sectionName || (prog.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'),
          className: st?.className || '-',
          teamName: team?.name || '-',
          fieldName: fld?.name || '-',
          programName: prog.name,
          summitName: summit?.name || '-'
        });
      }
    });
    return list;
  }, [entries, programs, selectedSummitId, filterSection, fields, teams, summits, studentStandings, filterClass, filterTeam]);

  // 3. Field-Wise Performance
  const fieldPerformanceRows = useMemo(() => {
    const rows = [];
    fields.forEach(f => {
      teams.forEach(t => {
        const stats = fieldPerformanceMap[f.id]?.[t.id] || { points: 0, maxPoints: 0, count: 0, percentage: 0 };
        rows.push({
          "Field": f.name,
          "Section": f.sectionId === 'aliya' ? 'Aliya' : (f.sectionId === 'both' ? 'Both' : 'Thamheediyya'),
          "House Team": t.name,
          "Points Earned": stats.points.toFixed(1),
          "Max Points": stats.maxPoints,
          "Performance %": stats.percentage.toFixed(1) + "%",
          "Events Participated": stats.count
        });
      });
    });
    return rows;
  }, [fields, teams, fieldPerformanceMap]);

  // 4. Aliya Team Program Assignment Matrix
  const assignmentMatrixRows = useMemo(() => {
    const aliyaProgs = programs
      .filter(p => selectedSummitId === 'all' || p.summitId === selectedSummitId)
      .filter(p => p.sectionId === 'aliya');

    return aliyaProgs.map(prog => {
      const fld = fields.find(f => f.id === prog.fieldId);
      const row = {
        "Program": prog.name,
        "Field": fld?.name || '-',
        "Format": prog.type,
        "Scheduled Time": prog.time
      };

      teams.forEach(t => {
        const alloc = prog.teamAllocations?.[t.id];
        const reg = entries.filter(e => e.programId === prog.id && e.teamId === t.id).length;
        row[t.name] = alloc?.assigned ? `Assigned (${reg}/${alloc.allowedCount} slots)` : 'Not Assigned';
      });

      return row;
    });
  }, [programs, selectedSummitId, fields, teams, entries]);

  // 5. Team Registration Status
  const teamRegistrationStatusRows = useMemo(() => {
    const list = [];
    const activeProgs = programs
      .filter(p => selectedSummitId === 'all' || p.summitId === selectedSummitId)
      .filter(p => filterSection === 'all' || p.sectionId === filterSection || p.sectionId === 'both');

    activeProgs.forEach(prog => {
      const fld = fields.find(f => f.id === prog.fieldId);
      const sec = sections.find(s => s.id === prog.sectionId);

      teams
        .filter(t => filterTeam === 'all' || t.id === filterTeam)
        .forEach(t => {
          const alloc = prog.teamAllocations?.[t.id];
          const isAssigned = prog.sectionId === 'thamheediyya' ? true : (alloc ? alloc.assigned : false);
          if (!isAssigned) return;

          const allowed = alloc ? alloc.allowedCount : (prog.defaultAllowedPerTeam || 1);
          const teamEntries = entries.filter(e => e.programId === prog.id && e.teamId === t.id);
          const filled = teamEntries.length;
          const empty = Math.max(0, allowed - filled);

          const nominationsDetail = teamEntries.map(e => {
            if (e.groupName) {
              const members = e.memberIds?.map(mid => students.find(s => s.id === mid)?.name).filter(Boolean).join(', ');
              return `${e.groupName} (${members}) [Nominated by: ${e.nominatedBy || 'Leader'}]`;
            }
            const st = students.find(s => s.id === e.studentId);
            return `${st?.name || 'Student'} (${e.chestNo}) [Nominated by: ${e.nominatedBy || 'Leader'}]`;
          }).join('; ');

          list.push({
            id: `${prog.id}_${t.id}`,
            programId: prog.id,
            programName: prog.name,
            sectionName: sec?.name?.split(' ')[0] || (prog.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'),
            fieldName: fld?.name || '-',
            teamId: t.id,
            teamName: t.name,
            teamColor: t.color,
            format: prog.type,
            allowedSlots: allowed,
            filledSlots: filled,
            emptySlots: empty,
            isComplete: filled >= allowed,
            nominationsDetail: nominationsDetail || 'No nominations yet'
          });
        });
    });
    return list;
  }, [programs, selectedSummitId, filterSection, filterTeam, fields, sections, teams, entries, students]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Collegiate Institutional Evaluation Cell</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
            Academic Reports &amp; Multi-Month Evaluation Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Generate formal monthly audits, multi-month cumulative dossiers, class and house standings, and individual student performance report cards with vector-quality PDF, Excel, and Print exports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition border border-slate-300 dark:border-slate-700 shadow-xs"
            title="Preview and print official academic audit matching active filters"
          >
            <Printer className="w-4 h-4 text-[#C9A227]" />
            <span>Print Filtered Report</span>
          </button>

          <button
            onClick={() => {
              if (reportType === 'monthly' || reportType === 'selected_months') handleDownloadExcel();
              else if (reportType === 'summit_progs') exportSummitProgramListExcel(summitProgramListRows, exportMeta);
              else if (reportType === 'participation') exportParticipationReportExcel(participationReportRows, exportMeta);
              else if (reportType === 'field_perf') exportFieldPerformanceExcel(fieldPerformanceRows, exportMeta);
              else if (reportType === 'assignment_matrix') exportAssignmentMatrixExcel(assignmentMatrixRows, exportMeta);
              else if (reportType === 'registration_status') exportTeamRegistrationStatusExcel(teamRegistrationStatusRows, exportMeta);
            }}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>

          <button
            onClick={() => {
              if (reportType === 'monthly' || reportType === 'selected_months') handleDownloadPDF();
              else handleDownloadPDF();
            }}
            className="py-2.5 px-4 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] dark:bg-[#0E7C86] text-white font-semibold text-xs flex items-center gap-2 transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Main Report Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        {[
          { id: 'monthly', label: 'Monthly Report (PDF/Excel)', icon: Calendar },
          { id: 'selected_months', label: 'Selected Months / Full Year Audit', icon: CalendarDays },
          { id: 'summit_progs', label: '1. Summit Programs List', icon: BookOpen },
          { id: 'participation', label: '2. Participation Report', icon: Users },
          { id: 'field_perf', label: '3. Field-wise Performance', icon: Sliders },
          { id: 'assignment_matrix', label: '4. Aliya Assignment Matrix', icon: Table },
          { id: 'registration_status', label: '5. Team Registration Status', icon: CheckCircle2 },
          { id: 'report_history', label: 'Report History Log', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                isActive
                  ? 'bg-[#0F2A4A] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0E7C86]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* REPORT CONFIGURATION CONSOLE (For Monthly & Multi-Month) */}
      {/* ======================================================== */}
      {(reportType === 'monthly' || reportType === 'selected_months') && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0E7C86]" />
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                Report Generation Parameters &amp; Filter Options
              </h4>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Active Scope: {periodTitle}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Month Picker */}
            {reportType === 'monthly' ? (
              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-[#0E7C86]"
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{formatMonthLabel(m)} ({m})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    Selected Months
                  </label>
                  <button
                    onClick={() => setSelectedMonthsMulti([...availableMonths])}
                    className="text-[10px] text-[#0E7C86] font-bold hover:underline"
                  >
                    Select All (Full Year)
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 max-h-24 overflow-y-auto">
                  {availableMonths.map(m => {
                    const isChecked = selectedMonthsMulti.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMonthSelection(m)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                          isChecked
                            ? 'bg-[#0F2A4A] text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-teal-400" />}
                        <span>{formatMonthLabel(m)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Section Scope */}
            <div>
              <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">
                Collegiate Section
              </label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                <option value="all">All Sections (Thamheediyya &amp; Aliya Combined)</option>
                <option value="thamheediyya">Thamheediyya Division (Class 1 &amp; 2)</option>
                <option value="aliya">Aliya Division (Class 3, 4 &amp; 5)</option>
              </select>
            </div>

            {/* 3. Output View Focus */}
            <div>
              <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">
                Report View Composition
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                <option value="both">Both Class-Wise &amp; Team-Wise</option>
                <option value="class_wise">Class-Wise Only</option>
                <option value="team_wise">House Team-Wise Only</option>
              </select>
            </div>

            {/* 4. Format Mode */}
            <div>
              <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-400">
                Detail Mode in PDF
              </label>
              <select
                value={detailMode}
                onChange={(e) => setDetailMode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-[#0F2A4A] dark:text-teal-400"
              >
                <option value="summary">Summary Tables Only (Compact)</option>
                <option value="detailed">Detailed Dossier (Each Student's Program &amp; Marks)</option>
              </select>
            </div>
          </div>

          {/* Secondary Specific Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Focus Class:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="all">All 5 Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Focus House:</span>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="all">All 4 House Teams</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 max-w-xs relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search student by name, CIC, chest..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-8 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          {/* ACTIVE APPLIED FILTERS STATUS BANNER */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-[#0E7C86]" />
                Active Filter Scope:
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-[#0F2A4A] dark:text-white">
                Period: {periodTitle}
              </span>
              <span className={`px-2 py-0.5 rounded-lg border font-semibold ${
                filterSection !== 'all'
                  ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-[#0E7C86] font-bold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                Section: {filterSection === 'all' ? 'All (Thamheediyya & Aliya)' : (filterSection === 'aliya' ? 'Aliya' : 'Thamheediyya')}
              </span>
              {filterClass !== 'all' && (
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700 font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  Class: {classes.find(c => c.id === filterClass)?.name || filterClass}
                  <button onClick={() => setFilterClass('all')} className="hover:text-rose-600" title="Clear class filter"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterTeam !== 'all' && (
                <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-700 font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  House: {teams.find(t => t.id === filterTeam)?.name || filterTeam}
                  <button onClick={() => setFilterTeam('all')} className="hover:text-rose-600" title="Clear house filter"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchStudent.trim() && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  Search: "{searchStudent}"
                  <button onClick={() => setSearchStudent('')} className="hover:text-rose-600" title="Clear search query"><X className="w-3 h-3" /></button>
                </span>
              )}
              <span className="text-slate-400 font-mono text-[11px] ml-1">
                ({displayStudentReports.length} students matched)
              </span>
            </div>

            {(filterSection !== 'all' || filterClass !== 'all' || filterTeam !== 'all' || searchStudent.trim()) && (
              <button
                onClick={() => {
                  setFilterSection('all');
                  setFilterClass('all');
                  setFilterTeam('all');
                  setSearchStudent('');
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-[11px] transition flex items-center gap-1 border border-rose-200 dark:border-rose-800"
              >
                <X className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERACTIVE REPORT PREVIEW TABS (For Monthly & Multi-Month) */}
      {/* ======================================================== */}
      {(reportType === 'monthly' || reportType === 'selected_months') && (
        <div className="space-y-4">
          {/* Sub Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: 'summary', label: 'Executive Summary & Summits', icon: FileText },
                { id: 'class_wise', label: 'Class Evaluations (5 Classes)', icon: Building },
                { id: 'team_wise', label: 'House Standings & Fields', icon: Layers },
                { id: 'top10', label: 'Period Top 10 Leaders', icon: Award },
                { id: 'matrix', label: 'Multi-Summit Student Matrix', icon: Table },
                { id: 'dossier', label: 'Student Detailed Dossiers', icon: Users }
              ].map(sub => {
                const Icon = sub.icon;
                const isAct = previewTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setPreviewTab(sub.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition shrink-0 ${
                      isAct
                        ? 'bg-[#0E7C86] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {displayStudentReports.length} Students Audited
            </span>
          </div>

          {/* SUB-VIEW 1: EXECUTIVE SUMMARY & SUMMITS BREAKDOWN */}
          {previewTab === 'summary' && (
            <div className="space-y-5">
              {/* Metric summary boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Weekly Summits', val: comprehensiveData.summary.totalSummits, col: 'text-[#0F2A4A] dark:text-white' },
                  { label: 'Programs Held', val: comprehensiveData.summary.totalPrograms, col: 'text-blue-600' },
                  { label: 'Total Participants', val: comprehensiveData.summary.totalParticipants, col: 'text-emerald-600' },
                  { label: 'Total Score', val: `${comprehensiveData.summary.totalMarks.toFixed(1)} pts`, col: 'text-purple-600' },
                  { label: 'Avg Marks %', val: `${comprehensiveData.summary.averageMarksPercentage.toFixed(1)}%`, col: 'text-teal-600' },
                  { label: 'Avg Attendance %', val: `${comprehensiveData.summary.averageAttendancePercentage.toFixed(1)}%`, col: 'text-amber-600' }
                ].map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{m.label}</span>
                    <span className={`text-xl font-bold ${m.col}`}>{m.val}</span>
                  </div>
                ))}
              </div>

              {/* Weekly Summits Table */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0E7C86]" />
                  <span>Weekly Summits Schedule &amp; House Team Totals</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5">Summit Gathering</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Venue</th>
                        <th className="p-2.5">Programs</th>
                        <th className="p-2.5">Participants</th>
                        {comprehensiveData.teamReports.map(t => (
                          <th key={t.teamId} className="p-2.5 text-center">{t.teamName}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {comprehensiveData.summitBreakdown.map(sm => (
                        <tr key={sm.summitId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono mr-1.5">
                              Summit {sm.runningNumber}
                            </span>
                            {sm.name}
                          </td>
                          <td className="p-2.5 text-slate-500">{sm.date}</td>
                          <td className="p-2.5 text-slate-500">{sm.venue}</td>
                          <td className="p-2.5 font-semibold">{sm.programsCount}</td>
                          <td className="p-2.5 font-semibold">{sm.participantsCount}</td>
                          {comprehensiveData.teamReports.map(t => (
                            <td key={t.teamId} className="p-2.5 text-center font-bold text-[#0E7C86]">
                              {sm.teamTotals[t.teamId] ? sm.teamTotals[t.teamId].toFixed(1) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: CLASS-WISE EVALUATIONS */}
          {previewTab === 'class_wise' && (
            <div className="space-y-4">
              {/* Layout Switcher Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">Report Presentation:</span>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <button
                      onClick={() => setClassReportMode('matrix')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                        classReportMode === 'matrix'
                          ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>Summit Events &amp; Marks Matrix</span>
                    </button>
                    <button
                      onClick={() => setClassReportMode('summary')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                        classReportMode === 'summary'
                          ? 'bg-white dark:bg-slate-900 text-[#0F2A4A] dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Summary Ledger</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span>Active Period: <strong>{periodTitle}</strong></span>
                  <span>•</span>
                  <span><strong>{comprehensiveData.activePeriodSummits.length} Summits</strong> Audited</span>
                </div>
              </div>

              {comprehensiveData.classReports.map(cr => {
                const filteredClassStudents = searchStudent.trim()
                  ? cr.students.filter(st =>
                      st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                    )
                  : cr.students;

                if (searchStudent.trim() && filteredClassStudents.length === 0) {
                  return null;
                }

                return (
                <div key={cr.classId} className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-[#0F2A4A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        #{cr.classRank}
                      </span>
                      <div>
                        <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                          {cr.className}
                        </h4>
                        <span className="text-[10px] text-[#0E7C86] font-semibold uppercase tracking-wider">
                          {cr.sectionName} Division &bull; {cr.studentCount} Enrolled Students
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span>Total: <strong className="text-[#0E7C86] font-mono">{cr.totalMarks.toFixed(1)} pts</strong></span>
                      <span>Avg/Student: <strong className="font-mono">{cr.averagePerStudent.toFixed(1)}</strong></span>
                      <span>Marks %: <strong className="font-mono text-emerald-600">{cr.marksPercentage.toFixed(1)}%</strong></span>
                      <span>Att: <strong className="font-mono">{cr.attendancePercentage.toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  {classReportMode === 'matrix' ? (
                    /* VIEW M1: SUMMIT EVENTS & MARKS DETAILED MATRIX */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3">Rank</th>
                            <th className="py-2.5 px-3 min-w-[140px]">Student Details</th>
                            <th className="py-2.5 px-3">House</th>
                            {comprehensiveData.activePeriodSummits.map(sm => {
                              const rInfo = comprehensiveData.summitRunningMap[sm.id];
                              return (
                                <th key={sm.id} className="py-2.5 px-3 min-w-[200px]">
                                  <div className="text-[11px] font-bold text-[#0F2A4A] dark:text-white truncate">
                                    {rInfo?.label || sm.name}
                                  </div>
                                  <div className="text-[9px] text-slate-400 font-mono font-normal">
                                    {sm.date}
                                  </div>
                                </th>
                              );
                            })}
                            <th className="py-2.5 px-3 text-center whitespace-nowrap">Total Marks</th>
                            <th className="py-2.5 px-3 text-center whitespace-nowrap">Marks %</th>
                            <th className="py-2.5 px-3 text-center">Grade</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredClassStudents.map(st => (
                            <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                              <td className="py-2.5 px-3 font-bold text-[#0F2A4A] dark:text-white">#{st.classRank}</td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{st.cicNo} • {st.chestNo}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block" style={{ backgroundColor: `${st.teamColor}20`, color: st.teamColor }}>
                                  {st.teamName}
                                </span>
                              </td>

                              {/* Summit-by-summit event participation & score */}
                              {comprehensiveData.activePeriodSummits.map(sm => {
                                const sp = st.summitPerformances.find(p => p.summitId === sm.id);
                                if (!sp || sp.programs.length === 0) {
                                  return (
                                    <td key={sm.id} className="py-2.5 px-3 text-slate-400 text-[11px] italic">
                                      —
                                    </td>
                                  );
                                }

                                return (
                                  <td key={sm.id} className="py-2.5 px-3">
                                    <div className="space-y-1">
                                      {sp.programs.map((prog, pIdx) => (
                                        <div key={pIdx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-1">
                                          <div className="truncate max-w-[130px]">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]" title={prog.programName}>
                                              {prog.programName}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-mono">
                                              {prog.fieldName}
                                            </div>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <span className="font-mono font-bold text-xs text-[#0E7C86] dark:text-teal-400">
                                              {prog.marksObtained.toFixed(1)}/10
                                            </span>
                                            <span className="ml-1 text-[9px] font-bold px-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                              {prog.grade}
                                            </span>
                                          </div>
                                        </div>
                                      ))}

                                      <div className="flex items-center justify-between text-[10px] font-mono px-1 font-semibold text-slate-500">
                                        <span>Summit Subtotal:</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                          {sp.obtainedMarks.toFixed(1)} / {sp.maxMarks} ({sp.marksPercentage.toFixed(0)}%)
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}

                              {/* Total Marks */}
                              <td className="py-2.5 px-3 text-center">
                                <span className="font-mono font-bold text-sm text-[#0E7C86] dark:text-teal-400">
                                  {st.totalMarksObtained.toFixed(1)}
                                </span>
                                <span className="font-mono text-slate-400 text-[10px] block">
                                  / {st.totalMaxMarks} pts
                                </span>
                              </td>

                              {/* Marks % */}
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                                  st.overallMarksPercentage >= 85
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : st.overallMarksPercentage >= 70
                                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                  {st.overallMarksPercentage.toFixed(1)}%
                                </span>
                              </td>

                              {/* Overall Grade */}
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                                {st.overallGrade}
                              </td>

                              {/* Action */}
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => generateIndividualStudentReportCardPDF({ studentReport: st, periodTitle, settings })}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-[#0E7C86] inline-flex items-center gap-1 shadow-2xs"
                                  title="Download 1-page individual student report card PDF"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Report Card</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* VIEW M2: SUMMARY LEDGER OVERVIEW */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="p-2">Rank</th>
                            <th className="p-2">Student Name</th>
                            <th className="p-2">CIC Number</th>
                            <th className="p-2">House Team</th>
                            <th className="p-2 text-center">Programs Count</th>
                            <th className="p-2 text-center">Total Score</th>
                            <th className="p-2 text-center">Marks %</th>
                            <th className="p-2 text-center">Attendance %</th>
                            <th className="p-2 text-center">Sec Rank</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredClassStudents.map(st => (
                            <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2 font-bold text-[#0F2A4A] dark:text-white">#{st.classRank}</td>
                              <td className="p-2 font-bold">{st.name}</td>
                              <td className="p-2 text-slate-500 font-mono text-[11px]">{st.cicNo}</td>
                              <td className="p-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${st.teamColor}20`, color: st.teamColor }}>
                                  {st.teamName}
                                </span>
                              </td>
                              <td className="p-2 text-center font-mono font-semibold">{st.totalProgramsPerformed}</td>
                              <td className="p-2 text-center font-bold text-[#0E7C86] font-mono">{st.totalMarksObtained.toFixed(1)} / {st.totalMaxMarks}</td>
                              <td className="p-2 text-center font-mono font-bold text-emerald-600">{st.overallMarksPercentage.toFixed(1)}%</td>
                              <td className="p-2 text-center font-mono">{st.overallAttendancePercentage.toFixed(0)}%</td>
                              <td className="p-2 text-center font-bold">#{st.overallSectionRank}</td>
                              <td className="p-2 text-right">
                                <button
                                  onClick={() => generateIndividualStudentReportCardPDF({ studentReport: st, periodTitle, settings })}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-[#0E7C86] inline-flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Report Card</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
              })}

              {comprehensiveData.classReports.every(cr => {
                const list = searchStudent.trim()
                  ? cr.students.filter(st =>
                      st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                    )
                  : cr.students;
                return list.length === 0;
              }) && (
                <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-slate-500">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-[#0F2A4A] dark:text-white">No students match the current filter selection</p>
                  <p className="text-xs mt-1">Try resetting the Class or House filters, or clearing the student search.</p>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 3: HOUSE TEAM STANDINGS & FIELDS */}
          {previewTab === 'team_wise' && (
            <div className="space-y-4">
              {comprehensiveData.teamReports.map(tr => {
                const filteredTeamMembers = searchStudent.trim()
                  ? tr.members.filter(st =>
                      st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                    )
                  : tr.members;

                if (searchStudent.trim() && filteredTeamMembers.length === 0) {
                  return null;
                }

                return (
                <div key={tr.teamId} className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: tr.teamColor }}>
                        #{tr.teamRank}
                      </span>
                      <div>
                        <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                          {tr.teamName}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {tr.memberCount} Team Members &bull; Rank #{tr.teamRank} in College
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Total: <strong className="text-sm font-bold text-[#0E7C86]">{tr.totalMarks.toFixed(1)} pts</strong></span>
                      <span>Avg: <strong>{tr.averagePerMember.toFixed(1)}</strong></span>
                      <span>Marks %: <strong>{tr.marksPercentage.toFixed(1)}%</strong></span>
                      <span>Att: <strong>{tr.attendancePercentage.toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  {/* Field Breakdown Chips */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Field Points Accrued:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(tr.fieldTotals).map((fld, idx) => (
                        <div key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 font-semibold">
                          <span className="text-slate-500">{fld.fieldName}:</span>
                          <span className="text-[#0E7C86] font-bold">{fld.marks.toFixed(1)} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Member Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2">Team Rank</th>
                          <th className="p-2">Member Name</th>
                          <th className="p-2">Class</th>
                          <th className="p-2">Score</th>
                          <th className="p-2">Marks %</th>
                          <th className="p-2">Attendance %</th>
                          <th className="p-2">Sec Rank</th>
                          <th className="p-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredTeamMembers.map(st => (
                          <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2 font-bold text-[#0F2A4A] dark:text-white">#{st.teamRank}</td>
                            <td className="p-2 font-bold">{st.name}</td>
                            <td className="p-2 text-slate-500">{st.className}</td>
                            <td className="p-2 font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)} / {st.totalMaxMarks}</td>
                            <td className="p-2">{st.overallMarksPercentage.toFixed(1)}%</td>
                            <td className="p-2">{st.overallAttendancePercentage.toFixed(0)}%</td>
                            <td className="p-2 font-bold">#{st.overallSectionRank}</td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => generateIndividualStudentReportCardPDF({ studentReport: st, periodTitle, settings })}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-[#0E7C86] inline-flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>Report Card</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
              })}

              {comprehensiveData.teamReports.every(tr => {
                const list = searchStudent.trim()
                  ? tr.members.filter(st =>
                      st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                    )
                  : tr.members;
                return list.length === 0;
              }) && (
                <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 text-slate-500">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-[#0F2A4A] dark:text-white">No house members match the current filter selection</p>
                  <p className="text-xs mt-1">Try resetting the House or Class filters, or clearing the student search.</p>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 4: TOP 10 LEADERS */}
          {previewTab === 'top10' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Period Top 10 Academic Leaders</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b">
                    <tr>
                      <th className="p-2.5">Medal / Rank</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">CIC No.</th>
                      <th className="p-2.5">Chest</th>
                      <th className="p-2.5">Class &amp; Division</th>
                      <th className="p-2.5">House Team</th>
                      <th className="p-2.5">Programs</th>
                      <th className="p-2.5">Total Marks</th>
                      <th className="p-2.5">Marks %</th>
                      <th className="p-2.5">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeTop10List.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-400">
                          No students match the active filter criteria.
                        </td>
                      </tr>
                    ) : (
                      activeTop10List.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold">
                          {idx === 0 ? <span className="text-amber-500 font-bold">🥇 Rank #1</span>
                            : idx === 1 ? <span className="text-slate-400 font-bold">🥈 Rank #2</span>
                            : idx === 2 ? <span className="text-amber-700 font-bold">🥉 Rank #3</span>
                            : `#${idx + 1}`}
                        </td>
                        <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">{st.name}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">{st.cicNo}</td>
                        <td className="p-2.5 text-slate-500">{st.chestNo}</td>
                        <td className="p-2.5">{st.className} ({st.sectionName})</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${st.teamColor}20`, color: st.teamColor }}>
                            {st.teamName}
                          </span>
                        </td>
                        <td className="p-2.5 font-semibold">{st.totalProgramsPerformed}</td>
                        <td className="p-2.5 font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)} / {st.totalMaxMarks}</td>
                        <td className="p-2.5 font-semibold">{st.overallMarksPercentage.toFixed(1)}%</td>
                        <td className="p-2.5 font-semibold">{st.overallAttendancePercentage.toFixed(0)}%</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 5: MULTI-SUMMIT / MULTI-MONTH STUDENT MATRIX */}
          {previewTab === 'matrix' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#0E7C86]" />
                  <span>Student Multi-Summit Cross-Performance Matrix</span>
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500">Sort By:</span>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="rank">Section Rank</option>
                    <option value="name">Student Name</option>
                    <option value="marks">Total Marks</option>
                    <option value="attendance">Attendance %</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b">
                    <tr>
                      <th className="p-2.5">Sec Rank</th>
                      <th className="p-2.5">Student</th>
                      <th className="p-2.5">CIC No.</th>
                      <th className="p-2.5">Class</th>
                      <th className="p-2.5">Team</th>
                      {comprehensiveData.activePeriodSummits.map(sm => (
                        <th key={sm.id} className="p-2.5 text-center">
                          Summit {comprehensiveData.summitRunningMap[sm.id]?.runningNumber}
                        </th>
                      ))}
                      <th className="p-2.5 text-center font-bold text-[#0E7C86]">Total</th>
                      <th className="p-2.5 text-center">Marks %</th>
                      <th className="p-2.5 text-center">Att %</th>
                      <th className="p-2.5 text-center">Class / Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayStudentReports.map(st => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">#{st.overallSectionRank}</td>
                        <td className="p-2.5 font-bold">{st.name}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">{st.cicNo}</td>
                        <td className="p-2.5">{st.className}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${st.teamColor}20`, color: st.teamColor }}>
                            {st.teamName}
                          </span>
                        </td>
                        {comprehensiveData.activePeriodSummits.map(sm => {
                          const perf = st.summitPerformances.find(p => p.summitId === sm.id);
                          return (
                            <td key={sm.id} className="p-2.5 text-center font-mono">
                              {perf && perf.programs.length > 0
                                ? <span className="font-bold text-[#0F2A4A] dark:text-white">{perf.obtainedMarks.toFixed(1)}</span>
                                : <span className="text-slate-300 dark:text-slate-700">-</span>}
                            </td>
                          );
                        })}
                        <td className="p-2.5 text-center font-bold text-[#0E7C86] font-mono">
                          {st.totalMarksObtained.toFixed(1)} / {st.totalMaxMarks}
                        </td>
                        <td className="p-2.5 text-center font-semibold">{st.overallMarksPercentage.toFixed(1)}%</td>
                        <td className="p-2.5 text-center font-semibold">{st.overallAttendancePercentage.toFixed(0)}%</td>
                        <td className="p-2.5 text-center text-slate-500 text-[11px]">
                          #{st.classRank} / #{st.teamRank}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 6: STUDENT DETAILED DOSSIERS */}
          {previewTab === 'dossier' && (
            <div className="space-y-4">
              {displayStudentReports.map(st => (
                <div key={st.id} className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  {/* Student Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                          {st.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {st.chestNo}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono bg-teal-50 text-[#0E7C86] font-bold">
                          {st.cicNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {st.className} &bull; {st.sectionName} Division &bull; House: {st.teamName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span>Sec Rank: <strong className="text-[#0E7C86]">#{st.overallSectionRank}</strong></span>
                        <span>Class: <strong>#{st.classRank}</strong></span>
                        <span>Team: <strong>#{st.teamRank}</strong></span>
                        <span>Total: <strong className="text-emerald-600">{st.totalMarksObtained.toFixed(1)} pts</strong> ({st.overallGrade})</span>
                        <span>Att: <strong>{st.overallAttendancePercentage.toFixed(0)}%</strong></span>
                      </div>

                      <button
                        onClick={() => generateIndividualStudentReportCardPDF({ studentReport: st, periodTitle, settings })}
                        className="py-1.5 px-3 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Report Card PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Summit-by-summit program performance */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">
                      Summit Programs &amp; Attendance Records ({st.summitPerformances.length} Summits):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {st.summitPerformances.map(sp => (
                        <div key={sp.summitId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-bold border-b border-slate-200/60 dark:border-slate-700 pb-1">
                            <span className="text-[#0F2A4A] dark:text-teal-400">
                              {sp.runningLabel} ({sp.summitDate})
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              Att (S/M/E): [{sp.attendance.start.slice(0, 1)}/{sp.attendance.mid.slice(0, 1)}/{sp.attendance.end.slice(0, 1)}] ({sp.attendance.percentage.toFixed(0)}%)
                            </span>
                          </div>

                          {sp.programs.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic">No assigned program in this summit.</p>
                          ) : (
                            sp.programs.map((prog, pIdx) => (
                              <div key={pIdx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                <span className="font-medium">
                                  &bull; {prog.programName} <span className="text-[10px] text-slate-400">[{prog.fieldName}]</span>
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`font-bold ${prog.isAbsent ? 'text-rose-600' : 'text-[#0E7C86]'}`}>
                                    {prog.statusText}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700">
                                    Grade {prog.grade}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT 1: SUMMIT PROGRAMS LIST */}
      {/* ======================================================== */}
      {reportType === 'summit_progs' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0E7C86]" />
              <span>Report 1: Summit Program Catalog &amp; Quotas</span>
            </h4>
            <span className="text-xs text-slate-400">{summitProgramListRows.length} Scheduled Programs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="p-2.5">Program Name</th>
                  <th className="p-2.5">Section</th>
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Format</th>
                  <th className="p-2.5">Venue &amp; Time</th>
                  <th className="p-2.5">Default Allowed / Team</th>
                  <th className="p-2.5">Total Registered</th>
                  <th className="p-2.5">Participating Teams</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summitProgramListRows.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">{p.programName}</td>
                    <td className="p-2.5">{p.sectionName}</td>
                    <td className="p-2.5">{p.fieldName}</td>
                    <td className="p-2.5 capitalize">{p.type}</td>
                    <td className="p-2.5 text-slate-500">{p.stage} ({p.time})</td>
                    <td className="p-2.5 font-semibold text-center">{p.defaultAllowed}</td>
                    <td className="p-2.5 font-bold text-[#0E7C86] text-center">{p.totalRegistered}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">{p.participatingTeams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT 2: PARTICIPATION REPORT */}
      {/* ======================================================== */}
      {reportType === 'participation' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0E7C86]" />
              <span>Report 2: Multi-Dimensional Participation Directory</span>
            </h4>
            <span className="text-xs text-slate-400">{participationReportRows.length} Participant Registrations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="p-2.5">Participant / Group</th>
                  <th className="p-2.5">Chest No.</th>
                  <th className="p-2.5">CIC No.</th>
                  <th className="p-2.5">Class</th>
                  <th className="p-2.5">Division</th>
                  <th className="p-2.5">House Team</th>
                  <th className="p-2.5">Program</th>
                  <th className="p-2.5">Academic Field</th>
                  <th className="p-2.5">Summit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {participationReportRows.map(r => (
                  <tr key={r.entryId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">{r.studentName}</td>
                    <td className="p-2.5 font-mono">{r.chestNo}</td>
                    <td className="p-2.5 font-mono text-slate-500">{r.cicNo}</td>
                    <td className="p-2.5">{r.className}</td>
                    <td className="p-2.5">{r.sectionName}</td>
                    <td className="p-2.5 font-semibold">{r.teamName}</td>
                    <td className="p-2.5 font-semibold text-[#0E7C86]">{r.programName}</td>
                    <td className="p-2.5 text-slate-500">{r.fieldName}</td>
                    <td className="p-2.5 text-slate-500">{r.summitName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT 3: FIELD-WISE PERFORMANCE */}
      {/* ======================================================== */}
      {reportType === 'field_perf' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0E7C86]" />
            <span>Report 3: Academic Field Performance Distribution</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="p-2.5">Academic Field</th>
                  <th className="p-2.5">Section</th>
                  <th className="p-2.5">House Team</th>
                  <th className="p-2.5">Points Earned</th>
                  <th className="p-2.5">Max Points</th>
                  <th className="p-2.5">Performance %</th>
                  <th className="p-2.5">Events Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fieldPerformanceRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">{r["Field"]}</td>
                    <td className="p-2.5">{r["Section"]}</td>
                    <td className="p-2.5 font-semibold">{r["House Team"]}</td>
                    <td className="p-2.5 font-bold text-[#0E7C86]">{r["Points Earned"]} pts</td>
                    <td className="p-2.5 text-slate-500">{r["Max Points"]}</td>
                    <td className="p-2.5 font-semibold">{r["Performance %"]}</td>
                    <td className="p-2.5">{r["Events Participated"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT 4: ALIYA ASSIGNMENT MATRIX */}
      {/* ======================================================== */}
      {reportType === 'assignment_matrix' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-[#0E7C86]" />
            <span>Report 4: Aliya Degree Division Program Assignment Matrix</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="p-2.5">Program</th>
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Format</th>
                  <th className="p-2.5">Time</th>
                  {teams.map(t => (
                    <th key={t.id} className="p-2.5 text-center">{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignmentMatrixRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">{r["Program"]}</td>
                    <td className="p-2.5">{r["Field"]}</td>
                    <td className="p-2.5 capitalize">{r["Format"]}</td>
                    <td className="p-2.5 text-slate-500">{r["Scheduled Time"]}</td>
                    {teams.map(t => (
                      <td key={t.id} className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          r[t.name]?.startsWith('Assigned')
                            ? 'bg-teal-50 text-[#0E7C86] font-bold border border-teal-200 dark:bg-teal-950/40'
                            : 'text-slate-400'
                        }`}>
                          {r[t.name]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT 5: TEAM REGISTRATION STATUS */}
      {/* ======================================================== */}
      {reportType === 'registration_status' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0E7C86]" />
                <span>Report 5: Team Registration Quotas &amp; Nominations Audit</span>
              </h4>
              <p className="text-xs text-slate-500">
                Per summit, per section, per team program allocations: filled vs allowed slots and leader tracking.
              </p>
            </div>

            <button
              onClick={() => {
                const count = checkSummitRegistrationDeadlines(selectedSummitId, 'admin');
                setDeadlineAlertToast(`Checked unfilled slots for summit. Sent alerts to ${count} leaders with vacant slots.`);
                setTimeout(() => setDeadlineAlertToast(''), 5000);
              }}
              className="py-2 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 font-semibold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Check Unfilled Slots &amp; Alert Leaders</span>
            </button>
          </div>

          {deadlineAlertToast && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
              {deadlineAlertToast}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="p-2.5">Program</th>
                  <th className="p-2.5">Section</th>
                  <th className="p-2.5">House Team</th>
                  <th className="p-2.5 text-center">Slots (Filled / Allowed)</th>
                  <th className="p-2.5 text-center">Empty Slots</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Nominated Students &amp; Nominator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamRegistrationStatusRows.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white">{r.programName}</td>
                    <td className="p-2.5">{r.sectionName}</td>
                    <td className="p-2.5 font-semibold">{r.teamName}</td>
                    <td className="p-2.5 text-center font-bold font-mono">
                      {r.filledSlots} / {r.allowedSlots}
                    </td>
                    <td className="p-2.5 text-center">
                      {r.emptySlots > 0 ? (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                          {r.emptySlots} Unfilled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          Full
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.isComplete ? 'Complete' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate" title={r.nominationsDetail}>
                      {r.nominationsDetail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT HISTORY LOG */}
      {/* ======================================================== */}
      {reportType === 'report_history' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#0E7C86]" />
              <span>Report Generation History &amp; Re-Download Archive</span>
            </h4>
            <span className="text-xs text-slate-400">{reportHistory.length} Recorded Audits</span>
          </div>

          {reportHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No reports generated yet in this session. Click "Generate Official PDF" or "Download Excel" to record history entries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-600 dark:text-slate-400 border-b">
                  <tr>
                    <th className="p-2.5">Report Title</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Academic Months</th>
                    <th className="p-2.5">Generated Timestamp</th>
                    <th className="p-2.5">Generated By</th>
                    <th className="p-2.5">Students Audited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportHistory.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-[#0F2A4A] dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#0E7C86]" />
                        <span>{entry.name}</span>
                      </td>
                      <td className="p-2.5 uppercase font-mono text-[10px]">{entry.reportType}</td>
                      <td className="p-2.5">{entry.months?.map(formatMonthLabel).join(', ')}</td>
                      <td className="p-2.5 text-slate-500">{new Date(entry.generatedDate).toLocaleString()}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300 font-medium">{entry.generatedBy}</td>
                      <td className="p-2.5 font-bold text-[#0E7C86]">{entry.itemCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* OFFICIAL PRINTABLE ACADEMIC REPORT (PREVIEW MODAL & PRINT) */}
      {/* ======================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Control Bar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0E7C86]" />
                <div>
                  <h3 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                    Official Filtered Academic Report &mdash; Print Preview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Previewing exact institutional audit document formatted for paper printing and PDF archive.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#C9A227]" />
                  <span>Print Document (Ctrl+P)</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="px-3.5 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Sheet */}
            <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
              <div className="bg-white text-slate-900 w-full max-w-4xl p-8 rounded-xl shadow-lg border border-slate-300 font-sans space-y-6">
                {/* 1. Header */}
                <div className="text-center border-b-2 border-[#0F2A4A] pb-4 space-y-1">
                  <div className="text-[11px] font-bold tracking-widest text-[#0E7C86] uppercase">
                    Majlis Umariyya Student Federation &bull; Academic Directorate
                  </div>
                  <h1 className="text-2xl font-serif font-black tracking-wide text-[#0F2A4A] uppercase">
                    {settings.collegeName || "MAJLIS UMARIYYA WAFY COLLEGE"}
                  </h1>
                  <h2 className="text-sm font-bold tracking-wider text-slate-700 uppercase">
                    MUSF SUMMIT REGISTER &mdash; OFFICIAL ACADEMIC EVALUATION AUDIT REPORT
                  </h2>
                  <div className="h-1 w-24 bg-[#C9A227] mx-auto my-1.5 rounded-full" />
                </div>

                {/* 2. Parameters Scope Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Academic Period</span>
                      <strong className="text-[#0F2A4A] text-xs">{periodTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Collegiate Section</span>
                      <strong className="text-[#0F2A4A] text-xs">
                        {filterSection === 'all' ? 'All (Thamheediyya & Aliya)' : (filterSection === 'aliya' ? 'Aliya Division (Classes 3-5)' : 'Thamheediyya Division (Classes 1-2)')}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Class Scope</span>
                      <strong className="text-[#0F2A4A] text-xs">
                        {filterClass !== 'all' ? (classes.find(c => c.id === filterClass)?.name || filterClass) : 'All 5 Classes'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">House Scope</span>
                      <strong className="text-[#0F2A4A] text-xs">
                        {filterTeam !== 'all' ? (teams.find(t => t.id === filterTeam)?.name || filterTeam) : 'All 4 Houses'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Student Filter</span>
                      <strong className="text-[#0F2A4A] text-xs">
                        {searchStudent.trim() ? `Search: "${searchStudent}"` : 'None (Full Ledger)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Audit Date &amp; Time</span>
                      <strong className="text-slate-700 text-xs font-mono">
                        {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Executive Metrics Ledger */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Weekly Summits', val: comprehensiveData.summary.totalSummits },
                    { label: 'Programs Held', val: comprehensiveData.summary.totalPrograms },
                    { label: 'Audited Students', val: displayStudentReports.length },
                    { label: 'Total Score', val: `${comprehensiveData.summary.totalMarks.toFixed(1)} pts` },
                    { label: 'Average Marks %', val: `${comprehensiveData.summary.averageMarksPercentage.toFixed(1)}%` },
                    { label: 'Average Att %', val: `${comprehensiveData.summary.averageAttendancePercentage.toFixed(0)}%` }
                  ].map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block truncate">{m.label}</span>
                      <strong className="text-sm font-bold text-[#0F2A4A] font-mono">{m.val}</strong>
                    </div>
                  ))}
                </div>

                {/* 4. Filtered Section Views */}
                {/* Class-wise evaluations */}
                {(previewTab === 'class_wise' || viewMode === 'class_wise' || previewTab === 'summary') && (
                  <div className="space-y-6 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] border-b pb-1">
                      Academic Class Evaluations &bull; Per-Student Event Scores
                    </h3>
                    {comprehensiveData.classReports.map(cr => {
                      const classStudents = searchStudent.trim()
                        ? cr.students.filter(st =>
                            st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                            st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                            st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                          )
                        : cr.students;

                      if (searchStudent.trim() && classStudents.length === 0) return null;

                      return (
                        <div key={cr.classId} className="printable-card border border-slate-300 rounded-lg overflow-hidden">
                          <div className="bg-slate-100 p-2.5 flex items-center justify-between border-b border-slate-300 text-xs">
                            <div>
                              <strong className="text-[#0F2A4A] text-sm font-serif">{cr.className}</strong>
                              <span className="text-slate-500 ml-2 font-mono">({cr.sectionName} Division &bull; Rank #{cr.classRank})</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono font-bold text-slate-700">
                              <span>Total: {cr.totalMarks.toFixed(1)} pts</span>
                              <span>Marks: {cr.marksPercentage.toFixed(1)}%</span>
                              <span>Att: {cr.attendancePercentage.toFixed(0)}%</span>
                            </div>
                          </div>

                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 text-[10px] uppercase">
                              <tr>
                                <th className="p-2 border-r border-slate-200 w-12 text-center">Rank</th>
                                <th className="p-2 border-r border-slate-200">Student Details</th>
                                <th className="p-2 border-r border-slate-200">House</th>
                                {comprehensiveData.activePeriodSummits.map(sm => (
                                  <th key={sm.id} className="p-2 border-r border-slate-200 min-w-[130px]">
                                    {comprehensiveData.summitRunningMap[sm.id]?.label || sm.name}
                                  </th>
                                ))}
                                <th className="p-2 border-r border-slate-200 text-center">Total Marks</th>
                                <th className="p-2 border-r border-slate-200 text-center">Marks %</th>
                                <th className="p-2 text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {classStudents.map(st => (
                                <tr key={st.id} className="hover:bg-slate-50">
                                  <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">#{st.classRank}</td>
                                  <td className="p-2 border-r border-slate-200">
                                    <div className="font-bold text-slate-900">{st.name}</div>
                                    <div className="text-[9px] text-slate-500 font-mono">{st.cicNo} &bull; {st.chestNo}</div>
                                  </td>
                                  <td className="p-2 border-r border-slate-200 font-semibold">{st.teamName}</td>
                                  {comprehensiveData.activePeriodSummits.map(sm => {
                                    const sp = st.summitPerformances.find(p => p.summitId === sm.id);
                                    if (!sp || sp.programs.length === 0) {
                                      return <td key={sm.id} className="p-2 border-r border-slate-200 text-slate-400 italic text-center">&mdash;</td>;
                                    }
                                    return (
                                      <td key={sm.id} className="p-2 border-r border-slate-200">
                                        <div className="space-y-1">
                                          {sp.programs.map((prog, pIdx) => (
                                            <div key={pIdx} className="flex items-center justify-between text-[10px] leading-tight">
                                              <span className="truncate max-w-[90px] font-medium" title={prog.programName}>{prog.programName}:</span>
                                              <strong className="font-mono text-[#0E7C86] ml-1">{prog.marksObtained.toFixed(1)}/10</strong>
                                            </div>
                                          ))}
                                          <div className="text-[9px] font-mono font-bold text-slate-500 border-t border-slate-100 pt-0.5 text-right">
                                            Sub: {sp.obtainedMarks.toFixed(1)}
                                          </div>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">
                                    {st.totalMarksObtained.toFixed(1)} / {st.totalMaxMarks}
                                  </td>
                                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-emerald-700">
                                    {st.overallMarksPercentage.toFixed(1)}%
                                  </td>
                                  <td className="p-2 text-center font-bold">{st.overallGrade}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* House-wise standings */}
                {(previewTab === 'team_wise' || viewMode === 'team_wise') && (
                  <div className="space-y-6 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] border-b pb-1">
                      House Standings &amp; Member Contributions
                    </h3>
                    {comprehensiveData.teamReports.map(tr => {
                      const teamMembers = searchStudent.trim()
                        ? tr.members.filter(st =>
                            st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                            st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                            st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                          )
                        : tr.members;

                      if (searchStudent.trim() && teamMembers.length === 0) return null;

                      return (
                        <div key={tr.teamId} className="printable-card border border-slate-300 rounded-lg overflow-hidden">
                          <div className="bg-slate-100 p-2.5 flex items-center justify-between border-b border-slate-300 text-xs">
                            <strong className="text-[#0F2A4A] text-sm font-serif">{tr.teamName} (Rank #{tr.teamRank} in College)</strong>
                            <div className="flex items-center gap-3 font-mono font-bold text-slate-700">
                              <span>Total: {tr.totalMarks.toFixed(1)} pts</span>
                              <span>Marks: {tr.marksPercentage.toFixed(1)}%</span>
                              <span>Att: {tr.attendancePercentage.toFixed(0)}%</span>
                            </div>
                          </div>
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300 text-[10px] uppercase">
                              <tr>
                                <th className="p-2 border-r border-slate-200 w-12 text-center">Rank</th>
                                <th className="p-2 border-r border-slate-200">Member Name</th>
                                <th className="p-2 border-r border-slate-200">Class</th>
                                <th className="p-2 border-r border-slate-200 text-center">Total Marks</th>
                                <th className="p-2 border-r border-slate-200 text-center">Marks %</th>
                                <th className="p-2 text-center">Attendance %</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {teamMembers.map(st => (
                                <tr key={st.id}>
                                  <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">#{st.teamRank}</td>
                                  <td className="p-2 border-r border-slate-200 font-bold">{st.name} <span className="text-[9px] text-slate-500 font-mono">({st.cicNo})</span></td>
                                  <td className="p-2 border-r border-slate-200">{st.className}</td>
                                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)}</td>
                                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">{st.overallMarksPercentage.toFixed(1)}%</td>
                                  <td className="p-2 text-center font-mono">{st.overallAttendancePercentage.toFixed(0)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Top 10 Leaders View */}
                {previewTab === 'top10' && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] border-b pb-1">
                      Period Top 10 Academic Leaders
                    </h3>
                    <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                      <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-300">
                        <tr>
                          <th className="p-2 border-r border-slate-200 text-center">Rank</th>
                          <th className="p-2 border-r border-slate-200">Student Name</th>
                          <th className="p-2 border-r border-slate-200">CIC No.</th>
                          <th className="p-2 border-r border-slate-200">Class</th>
                          <th className="p-2 border-r border-slate-200">House</th>
                          <th className="p-2 border-r border-slate-200 text-center">Progs</th>
                          <th className="p-2 border-r border-slate-200 text-center">Total Marks</th>
                          <th className="p-2 border-r border-slate-200 text-center">Marks %</th>
                          <th className="p-2 text-center">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeTop10List.map((st, idx) => (
                          <tr key={st.id}>
                            <td className="p-2 border-r border-slate-200 text-center font-bold">#{idx + 1}</td>
                            <td className="p-2 border-r border-slate-200 font-bold">{st.name}</td>
                            <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{st.cicNo}</td>
                            <td className="p-2 border-r border-slate-200">{st.className}</td>
                            <td className="p-2 border-r border-slate-200 font-semibold">{st.teamName}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-mono">{st.totalProgramsPerformed}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">{st.overallMarksPercentage.toFixed(1)}%</td>
                            <td className="p-2 text-center font-mono">{st.overallAttendancePercentage.toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Matrix View */}
                {previewTab === 'matrix' && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] border-b pb-1">
                      Multi-Summit Cross-Performance Matrix
                    </h3>
                    <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                      <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-300">
                        <tr>
                          <th className="p-2 border-r border-slate-200 text-center">Sec Rank</th>
                          <th className="p-2 border-r border-slate-200">Student Name</th>
                          <th className="p-2 border-r border-slate-200">Class</th>
                          <th className="p-2 border-r border-slate-200">House</th>
                          {comprehensiveData.activePeriodSummits.map(sm => (
                            <th key={sm.id} className="p-2 border-r border-slate-200 text-center">
                              {comprehensiveData.summitRunningMap[sm.id]?.runningNumber ? `Summit ${comprehensiveData.summitRunningMap[sm.id].runningNumber}` : sm.name}
                            </th>
                          ))}
                          <th className="p-2 border-r border-slate-200 text-center font-bold">Total</th>
                          <th className="p-2 border-r border-slate-200 text-center">Marks %</th>
                          <th className="p-2 text-center">Att %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {displayStudentReports.map(st => (
                          <tr key={st.id}>
                            <td className="p-2 border-r border-slate-200 text-center font-bold font-mono">#{st.overallSectionRank}</td>
                            <td className="p-2 border-r border-slate-200 font-bold">{st.name}</td>
                            <td className="p-2 border-r border-slate-200">{st.className}</td>
                            <td className="p-2 border-r border-slate-200">{st.teamName}</td>
                            {comprehensiveData.activePeriodSummits.map(sm => {
                              const perf = st.summitPerformances.find(p => p.summitId === sm.id);
                              return (
                                <td key={sm.id} className="p-2 border-r border-slate-200 text-center font-mono">
                                  {perf && perf.programs.length > 0 ? perf.obtainedMarks.toFixed(1) : '-'}
                                </td>
                              );
                            })}
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">{st.overallMarksPercentage.toFixed(1)}%</td>
                            <td className="p-2 text-center font-mono">{st.overallAttendancePercentage.toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 5. Institutional Signatures Certification Block */}
                <div className="pt-8 border-t-2 border-slate-400 mt-10 space-y-6">
                  <div className="grid grid-cols-3 gap-6 text-center text-xs">
                    <div>
                      <div className="border-b border-slate-400 pb-1 mb-2 font-mono font-bold text-slate-400">
                        &nbsp;
                      </div>
                      <strong className="text-slate-800 uppercase block">Summit Convener</strong>
                      <span className="text-[10px] text-slate-500">Majlis Umariyya Wafy College</span>
                    </div>

                    <div>
                      <div className="border-b border-slate-400 pb-1 mb-2 font-mono font-bold text-slate-400">
                        &nbsp;
                      </div>
                      <strong className="text-slate-800 uppercase block">Academic Controller</strong>
                      <span className="text-[10px] text-slate-500">Department of Evaluation</span>
                    </div>

                    <div>
                      <div className="border-b border-slate-400 pb-1 mb-2 font-mono font-bold text-slate-400">
                        &nbsp;
                      </div>
                      <strong className="text-slate-800 uppercase block">Principal / Head of Institution</strong>
                      <span className="text-[10px] text-slate-500">Official Institutional Seal</span>
                    </div>
                  </div>

                  <div className="text-center text-[9px] text-slate-400 font-mono pt-4 border-t border-slate-200">
                    This official academic audit report is computer-generated by MUSF Summit Register for Majlis Umariyya Wafy College.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIRECT PRINT CONTAINER (Triggered on window.print()) */}
      {/* ======================================================== */}
      <div id="printable-report" className="print-only">
        <div className="bg-white text-slate-900 w-full p-4 font-sans space-y-4">
          {/* Header */}
          <div className="text-center border-b-2 border-[#0F2A4A] pb-3 space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-[#0E7C86] uppercase">
              Majlis Umariyya Student Federation &bull; Academic Directorate
            </div>
            <h1 className="text-2xl font-serif font-black tracking-wide text-[#0F2A4A] uppercase">
              {settings.collegeName || "MAJLIS UMARIYYA WAFY COLLEGE"}
            </h1>
            <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              MUSF SUMMIT REGISTER &mdash; OFFICIAL ACADEMIC EVALUATION AUDIT REPORT
            </h2>
            <div className="h-0.5 w-24 bg-[#C9A227] mx-auto my-1 rounded-full" />
          </div>

          {/* Parameters */}
          <div className="p-3 rounded-lg border border-slate-300 text-[11px] grid grid-cols-3 gap-2 bg-slate-50">
            <div><strong>Period:</strong> {periodTitle}</div>
            <div><strong>Section:</strong> {filterSection === 'all' ? 'All (Thamheediyya & Aliya)' : (filterSection === 'aliya' ? 'Aliya' : 'Thamheediyya')}</div>
            <div><strong>Class:</strong> {filterClass !== 'all' ? (classes.find(c => c.id === filterClass)?.name || filterClass) : 'All Classes'}</div>
            <div><strong>House:</strong> {filterTeam !== 'all' ? (teams.find(t => t.id === filterTeam)?.name || filterTeam) : 'All Houses'}</div>
            <div><strong>Search:</strong> {searchStudent.trim() ? searchStudent : 'None'}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>

          {/* Tables */}
          {(previewTab === 'class_wise' || viewMode === 'class_wise' || previewTab === 'summary') && (
            <div className="space-y-4">
              {comprehensiveData.classReports.map(cr => {
                const classStudents = searchStudent.trim()
                  ? cr.students.filter(st =>
                      st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                    )
                  : cr.students;

                if (searchStudent.trim() && classStudents.length === 0) return null;

                return (
                  <div key={cr.classId} className="printable-card border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 p-2 flex items-center justify-between border-b border-slate-300 text-xs">
                      <strong className="text-sm font-serif text-[#0F2A4A]">{cr.className} (Rank #{cr.classRank})</strong>
                      <div className="font-mono text-xs font-bold">
                        Total: {cr.totalMarks.toFixed(1)} pts | Marks: {cr.marksPercentage.toFixed(1)}% | Att: {cr.attendancePercentage.toFixed(0)}%
                      </div>
                    </div>

                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead className="bg-slate-50 font-bold border-b border-slate-300 uppercase">
                        <tr>
                          <th className="p-1.5 border-r border-slate-200 text-center w-10">Rank</th>
                          <th className="p-1.5 border-r border-slate-200">Student Name</th>
                          <th className="p-1.5 border-r border-slate-200">CIC No.</th>
                          <th className="p-1.5 border-r border-slate-200">House</th>
                          {comprehensiveData.activePeriodSummits.map(sm => (
                            <th key={sm.id} className="p-1.5 border-r border-slate-200 min-w-[100px]">
                              {comprehensiveData.summitRunningMap[sm.id]?.label || sm.name}
                            </th>
                          ))}
                          <th className="p-1.5 border-r border-slate-200 text-center">Marks</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">%</th>
                          <th className="p-1.5 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {classStudents.map(st => (
                          <tr key={st.id}>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold font-mono">#{st.classRank}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold">{st.name}</td>
                            <td className="p-1.5 border-r border-slate-200 font-mono">{st.cicNo}</td>
                            <td className="p-1.5 border-r border-slate-200">{st.teamName}</td>
                            {comprehensiveData.activePeriodSummits.map(sm => {
                              const sp = st.summitPerformances.find(p => p.summitId === sm.id);
                              if (!sp || sp.programs.length === 0) {
                                return <td key={sm.id} className="p-1.5 border-r border-slate-200 text-center text-slate-400">-</td>;
                              }
                              return (
                                <td key={sm.id} className="p-1.5 border-r border-slate-200">
                                  {sp.programs.map((prog, pIdx) => (
                                    <div key={pIdx} className="leading-tight">
                                      {prog.programName}: <strong className="font-mono">{prog.marksObtained.toFixed(1)}</strong>
                                    </div>
                                  ))}
                                  <div className="font-mono font-bold text-[9px] text-slate-500 border-t pt-0.5">
                                    Sub: {sp.obtainedMarks.toFixed(1)}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">
                              {st.totalMarksObtained.toFixed(1)}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold">
                              {st.overallMarksPercentage.toFixed(1)}%
                            </td>
                            <td className="p-1.5 text-center font-bold">{st.overallGrade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* House Standings View if team_wise */}
          {(previewTab === 'team_wise' || viewMode === 'team_wise') && (
            <div className="space-y-4">
              {comprehensiveData.teamReports.map(tr => {
                const teamMembers = searchStudent.trim()
                  ? tr.members.filter(st =>
                      st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.cicNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                      st.chestNo.toLowerCase().includes(searchStudent.toLowerCase())
                    )
                  : tr.members;

                if (searchStudent.trim() && teamMembers.length === 0) return null;

                return (
                  <div key={tr.teamId} className="printable-card border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-100 p-2 flex items-center justify-between border-b border-slate-300 text-xs">
                      <strong className="text-sm font-serif text-[#0F2A4A]">{tr.teamName} (Rank #{tr.teamRank})</strong>
                      <div className="font-mono text-xs font-bold">
                        Total: {tr.totalMarks.toFixed(1)} pts | Marks: {tr.marksPercentage.toFixed(1)}% | Att: {tr.attendancePercentage.toFixed(0)}%
                      </div>
                    </div>
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead className="bg-slate-50 font-bold border-b border-slate-300 uppercase">
                        <tr>
                          <th className="p-1.5 border-r border-slate-200 text-center w-10">Rank</th>
                          <th className="p-1.5 border-r border-slate-200">Member</th>
                          <th className="p-1.5 border-r border-slate-200">Class</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Marks</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">%</th>
                          <th className="p-1.5 text-center">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {teamMembers.map(st => (
                          <tr key={st.id}>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">#{st.teamRank}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold">{st.name}</td>
                            <td className="p-1.5 border-r border-slate-200">{st.className}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono">{st.overallMarksPercentage.toFixed(1)}%</td>
                            <td className="p-1.5 text-center font-mono">{st.overallAttendancePercentage.toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top 10 Leaders View */}
          {previewTab === 'top10' && (
            <div className="space-y-3">
              <table className="w-full text-left text-[10px] border border-slate-300 border-collapse">
                <thead className="bg-slate-100 font-bold uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 border-r border-slate-200 text-center">Rank</th>
                    <th className="p-1.5 border-r border-slate-200">Student Name</th>
                    <th className="p-1.5 border-r border-slate-200">Class</th>
                    <th className="p-1.5 border-r border-slate-200">House</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">Progs</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">Marks</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">%</th>
                    <th className="p-1.5 text-center">Att %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeTop10List.map((st, idx) => (
                    <tr key={st.id}>
                      <td className="p-1.5 border-r border-slate-200 text-center font-bold">#{idx + 1}</td>
                      <td className="p-1.5 border-r border-slate-200 font-bold">{st.name}</td>
                      <td className="p-1.5 border-r border-slate-200">{st.className}</td>
                      <td className="p-1.5 border-r border-slate-200">{st.teamName}</td>
                      <td className="p-1.5 border-r border-slate-200 text-center font-mono">{st.totalProgramsPerformed}</td>
                      <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)}</td>
                      <td className="p-1.5 border-r border-slate-200 text-center font-mono">{st.overallMarksPercentage.toFixed(1)}%</td>
                      <td className="p-1.5 text-center font-mono">{st.overallAttendancePercentage.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Matrix View */}
          {previewTab === 'matrix' && (
            <div className="space-y-3">
              <table className="w-full text-left text-[10px] border border-slate-300 border-collapse">
                <thead className="bg-slate-100 font-bold uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 border-r border-slate-200 text-center">Rank</th>
                    <th className="p-1.5 border-r border-slate-200">Student Name</th>
                    <th className="p-1.5 border-r border-slate-200">Class</th>
                    <th className="p-1.5 border-r border-slate-200">House</th>
                    {comprehensiveData.activePeriodSummits.map(sm => (
                      <th key={sm.id} className="p-1.5 border-r border-slate-200 text-center">
                        {comprehensiveData.summitRunningMap[sm.id]?.runningNumber ? `S${comprehensiveData.summitRunningMap[sm.id].runningNumber}` : sm.name}
                      </th>
                    ))}
                    <th className="p-1.5 border-r border-slate-200 text-center font-bold">Total</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">%</th>
                    <th className="p-1.5 text-center">Att %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayStudentReports.map(st => (
                    <tr key={st.id}>
                      <td className="p-1.5 border-r border-slate-200 text-center font-bold">#{st.overallSectionRank}</td>
                      <td className="p-1.5 border-r border-slate-200 font-bold">{st.name}</td>
                      <td className="p-1.5 border-r border-slate-200">{st.className}</td>
                      <td className="p-1.5 border-r border-slate-200">{st.teamName}</td>
                      {comprehensiveData.activePeriodSummits.map(sm => {
                        const perf = st.summitPerformances.find(p => p.summitId === sm.id);
                        return (
                          <td key={sm.id} className="p-1.5 border-r border-slate-200 text-center font-mono">
                            {perf && perf.programs.length > 0 ? perf.obtainedMarks.toFixed(1) : '-'}
                          </td>
                        );
                      })}
                      <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold text-[#0E7C86]">{st.totalMarksObtained.toFixed(1)}</td>
                      <td className="p-1.5 border-r border-slate-200 text-center font-mono">{st.overallMarksPercentage.toFixed(1)}%</td>
                      <td className="p-1.5 text-center font-mono">{st.overallAttendancePercentage.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 border-t-2 border-slate-400 mt-6 grid grid-cols-3 gap-6 text-center text-[10px]">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-mono">&nbsp;</div>
              <strong>Summit Convener</strong>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-mono">&nbsp;</div>
              <strong>Academic Controller</strong>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-mono">&nbsp;</div>
              <strong>Principal / Head of Institution</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
