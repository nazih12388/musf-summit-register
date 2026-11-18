import React from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { SummitManagement } from './SummitManagement';
import { ProgramLibraryManagement } from './ProgramLibraryManagement';
import { ProgramManagement } from './ProgramManagement';
import { AttendanceManager } from '../attendance/AttendanceManager';
import { MarksManagement } from './MarksManagement';
import { StudentManagement } from './StudentManagement';
import { TeamAndClassManagement } from './TeamAndClassManagement';
import { LeaderManagement } from './LeaderManagement';
import { JudgeManagement } from './JudgeManagement';
import { NoticesManagement } from './NoticesManagement';
import { ReportsAnalytics } from './ReportsAnalytics';
import { CertificatesManager } from './CertificatesManager';
import { SettingsAuditLog } from './SettingsAuditLog';
import {
  Users,
  Calendar,
  Layers,
  Clock,
  Scale,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Shield,
  FileCheck,
  Bell,
  BookOpen,
  Building
} from 'lucide-react';

export const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const {
    students,
    teams,
    programs,
    programLibrary,
    summits,
    attendance,
    marks,
    sections,
    studentAttendanceMap,
    programResultsMap,
    teamStandings,
    classEvaluations
  } = useApp();
  const { t } = useLanguage();

  // Summary Metrics
  const totalStudents = students.length;
  const thamheediyyaStudentsCount = students.filter(s => s.sectionId === 'thamheediyya').length;
  const aliyaStudentsCount = students.filter(s => s.sectionId === 'aliya').length;

  const totalTeams = teams.length;
  const totalPrograms = programs.length;
  const libraryProgramsCount = programLibrary.length;
  const completedPrograms = programs.filter(p => p.status === 'published' || p.status === 'locked').length;

  // Average Marks across evaluated programs
  let totalEvaluatedMarks = 0;
  let totalEvaluatedCount = 0;
  Object.values(programResultsMap).forEach(list => {
    list.forEach(r => {
      totalEvaluatedMarks += r.finalMark;
      totalEvaluatedCount++;
    });
  });
  const overallAvgMark = totalEvaluatedCount > 0 ? totalEvaluatedMarks / totalEvaluatedCount : 0;

  // Average Attendance percentage across all students
  let totalAttPct = 0;
  students.forEach(st => {
    totalAttPct += studentAttendanceMap[st.id]?.percentage || 0;
  });
  const overallAvgAttendance = totalStudents > 0 ? totalAttPct / totalStudents : 0;

  // Pending results
  const pendingResultsCount = programs.filter(p => p.status !== 'published').length;

  return (
    <div className="space-y-6">
      {/* If activeTab is 'dashboard', show the rich Overview & KPI summary cards */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-teal-200 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Directorate Command Center</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                Academic &amp; Summit Governance
              </h2>
              <p className="text-xs text-slate-200 mt-1 max-w-xl hidden sm:block">
                Section-wise governance across <strong>Thamheediyya</strong> (Preparatory) and <strong>Aliya</strong> (Degree), multi-judge score averaging, and house team evaluations.
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
              <button
                onClick={() => setActiveTab('students')}
                className="px-3 py-2 rounded-xl bg-white text-[#0F2A4A] hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                title="Manage students roster, section/field assignments and bulk import"
              >
                <Users className="w-4 h-4 text-[#0E7C86]" />
                <span>Students</span>
              </button>

              <button
                onClick={() => setActiveTab('certificates')}
                className="px-3 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/30 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                title="Manage and issue merit certificates"
              >
                <FileCheck className="w-4 h-4 text-amber-300" />
                <span>Certificates</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-teal-200 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                title="System settings, user permissions & audit logs"
              >
                <Shield className="w-4 h-4 text-teal-300" />
                <span>Auditing</span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/20 shrink-0"
              >
                <BookOpen className="w-4 h-4 text-teal-300" />
                <span>Library</span>
              </button>

              <button
                onClick={() => setActiveTab('programs')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
              >
                <Layers className="w-4 h-4" />
                <span>Matrix</span>
              </button>
            </div>
          </div>

          {/* 7 KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            <div
              onClick={() => setActiveTab('students')}
              className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 cursor-pointer hover:border-[#0E7C86] hover:shadow-md transition group"
              title="Click to view and manage students directory"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Students</span>
                <span className="text-[9px] font-bold text-[#0E7C86] opacity-0 group-hover:opacity-100 transition hidden sm:inline">&rarr;</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#0E7C86]" />
                <span>{totalStudents}</span>
              </div>
              <span className="text-[10px] text-[#0E7C86] font-semibold block truncate">{thamheediyyaStudentsCount} Th • {aliyaStudentsCount} Al</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">House Teams</span>
              <div className="text-lg sm:text-xl font-bold text-[#0F2A4A] dark:text-white">{totalTeams}</div>
              <span className="text-[10px] text-slate-400 block truncate">4 Leaders</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Master Library</span>
              <div className="text-lg sm:text-xl font-bold text-[#0E7C86] font-mono">{libraryProgramsCount}</div>
              <span className="text-[10px] text-slate-400 block truncate">Programs</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Scheduled</span>
              <div className="text-lg sm:text-xl font-bold text-[#0F2A4A] dark:text-white">{totalPrograms}</div>
              <span className="text-[10px] text-slate-400 block truncate">Across 3 Summits</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Completed</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedPrograms}</div>
              <span className="text-[10px] text-slate-400 block truncate">Evaluated Events</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Avg Attendance</span>
              <div className="text-lg sm:text-xl font-bold text-[#334E73] dark:text-slate-200 font-mono">{overallAvgAttendance.toFixed(0)}%</div>
              <span className="text-[10px] text-slate-400 block truncate">All Sessions</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Average Mark</span>
              <div className="text-lg sm:text-xl font-bold text-[#0E7C86] font-mono">{overallAvgMark.toFixed(1)}/10</div>
              <span className="text-[10px] text-slate-400 block truncate">Standard Metric</span>
            </div>
          </div>

          {/* Quick Chart Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team House Standings */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0E7C86]" />
                  <span>House Standings (Published Marks)</span>
                </h4>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-[#0E7C86] hover:underline font-semibold"
                >
                  View Details &rarr;
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {(() => {
                  const maxTeamPoints = Math.max(...teamStandings.map(t => t.totalPoints || 0), 0);
                  return teamStandings.map(t => {
                    const barWidth = maxTeamPoints > 0 && t.totalPoints > 0
                      ? Math.min(100, (t.totalPoints / maxTeamPoints) * 100)
                      : 0;

                    return (
                      <div key={t.id} className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-0.5">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                            <span>{t.name}</span>
                          </span>
                          <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
                            {t.totalPoints.toFixed(1)} pts <span className="text-slate-400 font-normal">(Th: {t.thamheediyyaPoints?.toFixed(1) || '0.0'} • Al: {t.aliyaPoints?.toFixed(1) || '0.0'})</span>
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%`, backgroundColor: t.color }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Academic Class Performance */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#334E73]" />
                  <span>Academic Class Distribution (5 Classes across 2 Sections)</span>
                </h4>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-[#0E7C86] hover:underline font-semibold"
                >
                  Full Evaluation &rarr;
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {(() => {
                  const maxClassMarks = Math.max(...classEvaluations.map(c => c.totalMarks || 0), 0);
                  return classEvaluations.map(c => {
                    const classBarWidth = maxClassMarks > 0 && c.totalMarks > 0
                      ? Math.min(100, (c.totalMarks / maxClassMarks) * 100)
                      : 0;

                    return (
                      <div key={c.id} className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-0.5">
                          <span className="truncate max-w-[200px]">
                            {c.name} <span className="text-[10px] text-slate-400">({c.sectionName})</span>
                          </span>
                          <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs">
                            {c.totalMarks.toFixed(1)} pts ({c.avgAttendance.toFixed(0)}% Att)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#334E73] transition-all duration-500"
                            style={{ width: `${classBarWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Student Roster & Quick Bulk Import Action Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <span>Student Directory &amp; Bulk Import Console</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {totalStudents} Enrolled
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage college students across <strong>Thamheediyya</strong> (Classes 1 &amp; 2) and <strong>Aliya</strong> (Classes 3, 4 &amp; 5 with Communicative &amp; Creative fields). Bulk import via Excel/CSV or paste list.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('students')}
                className="px-4 py-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white font-bold text-xs flex items-center gap-2 transition shadow-xs"
              >
                <Users className="w-4 h-4 text-teal-300" />
                <span>Open Students Section &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render submodules based on activeTab */}
      {activeTab === 'summits' && <SummitManagement />}
      {activeTab === 'library' && <ProgramLibraryManagement />}
      {activeTab === 'programs' && <ProgramManagement />}
      {activeTab === 'attendance' && <AttendanceManager />}
      {activeTab === 'marks' && <MarksManagement />}
      {activeTab === 'students' && <StudentManagement />}
      {activeTab === 'teams' && <TeamAndClassManagement />}
      {activeTab === 'leaders' && <LeaderManagement />}
      {activeTab === 'judges' && <JudgeManagement />}
      {activeTab === 'notices' && <NoticesManagement />}
      {activeTab === 'reports' && <ReportsAnalytics />}
      {activeTab === 'certificates' && <CertificatesManager />}
      {activeTab === 'settings' && <SettingsAuditLog />}
    </div>
  );
};
