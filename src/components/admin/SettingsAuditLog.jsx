import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Settings,
  ShieldCheck,
  History,
  Search,
  Sliders,
  CheckCircle2,
  CalendarCheck2,
  TrendingUp,
  Percent,
  Filter,
  GraduationCap,
  Lock,
  Unlock,
  Trash2,
  Check,
  AlertTriangle,
  Download
} from 'lucide-react';

export const SettingsAuditLog = () => {
  const { lang, tr } = useLanguage();
  const {
    settings,
    updateSettings,
    auditLogs,
    deleteAuditLog,
    clearAuditLogs,
    students,
    studentAttendanceMap,
    summits,
    programs,
    marks,
    entries,
    exportFullAppData,
    wings = [],
    unionOfficials = [],
    wingPrograms = [],
    sportsFixtures = []
  } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('settings'); // 'settings', 'attendance', 'ops', 'audit'
  const [auditSearch, setAuditSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [saveToast, setSaveToast] = useState(false);

  // Form local state for immediate response
  const [formData, setFormData] = useState({
    collegeName: settings.collegeName || 'Majlis Umariyya Wafy College',
    appTitle: settings.appTitle || "MUSF Students' Union",
    academicYear: settings.academicYear || '2025–2026',
    fairJudgingMode: !!settings.fairJudgingMode,
    enforceJudgeRestrictions: settings.enforceJudgeRestrictions !== false,
    lateCountsAsPresent: settings.lateCountsAsPresent !== false,
    excusedCountsAsPresent: settings.excusedCountsAsPresent !== false,
    lowAttendanceThreshold: settings.lowAttendanceThreshold || 75,
    enableOverallPerformanceScore: !!settings.enableOverallPerformanceScore,
    overallMarksWeight: settings.overallMarksWeight || 80,
    overallAttendanceWeight: settings.overallAttendanceWeight || 20,
    maxProgramsPerStudent: settings.maxProgramsPerStudent || 0
  });

  const handleToggle = (key) => {
    const newVal = !formData[key];
    const updates = { [key]: newVal };
    // Synchronize both fairJudgingMode and hideTeamFromJudges
    if (key === 'fairJudgingMode') {
      updates.hideTeamFromJudges = newVal;
    }
    setFormData(prev => ({ ...prev, ...updates }));
    updateSettings(updates, currentUser?.username || 'admin');
    triggerToast();
  };

  const handleNumberChange = (key, val) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    let updates = { [key]: num };

    // Auto balance weights if OPS
    if (key === 'overallMarksWeight') {
      updates.overallAttendanceWeight = 100 - num;
    } else if (key === 'overallAttendanceWeight') {
      updates.overallMarksWeight = 100 - num;
    }

    setFormData(prev => ({ ...prev, ...updates }));
    updateSettings(updates, currentUser?.username || 'admin');
    triggerToast();
  };

  const handleTextChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveText = (key) => {
    updateSettings({ [key]: formData[key] }, currentUser?.username || 'admin');
    triggerToast();
  };

  const triggerToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  // Low attendance count based on current threshold
  const lowAttendanceCount = students.filter(st => {
    const att = studentAttendanceMap[st.id]?.percentage || 0;
    return att < formData.lowAttendanceThreshold;
  }).length;

  // Filtered audit logs
  const filteredLogs = auditLogs.filter(log => {
    const matchSearch =
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase());

    const matchAction = actionFilter === 'all' || log.action.includes(actionFilter);
    return matchSearch && matchAction;
  });

  const exportAuditCSV = () => {
    const rows = [
      ['Timestamp', 'Actor', 'Action', 'Details'],
      ...filteredLogs.map(l => [
        `"${new Date(l.timestamp).toLocaleString()}"`,
        `"${l.actor}"`,
        `"${l.action}"`,
        `"${l.details.replace(/"/g, '""')}"`
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MUSF_Summit_AuditLogs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFullJSON = () => {
    try {
      const jsonStr = exportFullAppData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MUSF_Union_Data_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to export data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 ${
            activeTab === 'settings'
              ? 'bg-[#0F2A4A] text-white shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Settings className="w-4 h-4 text-[#0E7C86]" />
          <span>System Identity & General</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 ${
            activeTab === 'attendance'
              ? 'bg-[#0F2A4A] text-white shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4 text-emerald-500" />
          <span>Attendance Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ops')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 ${
            activeTab === 'ops'
              ? 'bg-[#0F2A4A] text-white shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#C9A227]" />
          <span>Overall Performance Score (OPS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 ${
            activeTab === 'audit'
              ? 'bg-[#0F2A4A] text-white shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <History className="w-4 h-4 text-slate-400" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white border border-teal-500/40 shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Settings successfully updated & synchronized</span>
        </div>
      )}

      {/* TAB 1: Summit & Fair Judging */}
      {activeTab === 'settings' && (
        <div className="space-y-5 max-w-3xl">
          {/* Institutional Info */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#0E7C86]" />
              <span>Institutional Identity</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  College / Institution Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => handleTextChange('collegeName', e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    onClick={() => handleSaveText('collegeName')}
                    className="px-3 py-2 bg-[#0E7C86] text-white rounded-xl font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Students' Union App Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.appTitle}
                    onChange={(e) => handleTextChange('appTitle', e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    onClick={() => handleSaveText('appTitle')}
                    className="px-3 py-2 bg-[#0E7C86] text-white rounded-xl font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Academic Session / Year
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => handleTextChange('academicYear', e.target.value)}
                    placeholder="2025–2026"
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    onClick={() => handleSaveText('academicYear')}
                    className="px-3 py-2 bg-[#0E7C86] text-white rounded-xl font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Relocation Notice: Fair Judging moved to Fine Arts Wing */}
          <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-[#0E7C86] dark:text-teal-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Summit Evaluation &amp; Fair Judging Settings Relocated
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fair Judging Mode (Mask Team Names), Judge Program Restrictions, and Student Nomination Limits have been moved directly to the <strong>Fine Arts Wing Console &bull; Summit Register</strong>. Fine Arts conveners and festival administrators can manage judging policies natively from their dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Attendance Rules */}
      {activeTab === 'attendance' && (
        <div className="space-y-5 max-w-3xl">
          {/* Late rule */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                Count &quot;Late&quot; as Present
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When active, students marked &quot;Late&quot; in START, MID, or END sessions are credited as present towards their attendance percentage.
              </p>
            </div>
            <button
              onClick={() => handleToggle('lateCountsAsPresent')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.lateCountsAsPresent ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.lateCountsAsPresent ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Excused rule */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                Count &quot;Excused&quot; as Present
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When active, official college exemptions and excused medical leaves are not penalized in the aggregate attendance calculation.
              </p>
            </div>
            <button
              onClick={() => handleToggle('excusedCountsAsPresent')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.excusedCountsAsPresent ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.excusedCountsAsPresent ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Low Attendance Threshold */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <span>Low Attendance Warning Threshold</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                    {formData.lowAttendanceThreshold}%
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Students with attendance below this percentage are highlighted in red and flagged for administrative follow-up.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[65, 75, 80, 85].map(pct => (
                  <button
                    key={pct}
                    onClick={() => handleNumberChange('lowAttendanceThreshold', pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      formData.lowAttendanceThreshold === pct
                        ? 'bg-[#0F2A4A] text-white dark:bg-teal-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={formData.lowAttendanceThreshold}
                onChange={(e) => handleNumberChange('lowAttendanceThreshold', e.target.value)}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0E7C86]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>50% Minimum</span>
                <span className="font-bold text-amber-600">Current: {formData.lowAttendanceThreshold}%</span>
                <span>95% Strict</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>Currently flagged below threshold:</span>
              <strong className="font-bold font-mono text-sm">{lowAttendanceCount} student(s)</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Overall Performance Score (OPS) */}
      {activeTab === 'ops' && (
        <div className="space-y-5 max-w-3xl">
          {/* OPS Toggle */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C9A227]" />
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                  Enable Overall Performance Score (OPS)
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When enabled, the summit ranking formula blends academic event marks and session attendance into a single composite score out of 100%.
              </p>
            </div>

            <button
              onClick={() => handleToggle('enableOverallPerformanceScore')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.enableOverallPerformanceScore ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.enableOverallPerformanceScore ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Formula weights configuration */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0E7C86]" />
              <span>Score Weight Distribution (Total = 100%)</span>
            </h4>

            {/* Visual Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-[#0F2A4A] dark:bg-teal-600 transition-all duration-300 flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ width: `${formData.overallMarksWeight}%` }}
                >
                  {formData.overallMarksWeight}% Marks
                </div>
                <div
                  className="h-full bg-[#C9A227] transition-all duration-300 flex items-center justify-center text-[10px] text-slate-950 font-bold"
                  style={{ width: `${formData.overallAttendanceWeight}%` }}
                >
                  {formData.overallAttendanceWeight}% Att
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Academic Marks Weight: <strong>{formData.overallMarksWeight}%</strong></span>
                <span>Session Attendance Weight: <strong>{formData.overallAttendanceWeight}%</strong></span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marks Weight Percentage ({formData.overallMarksWeight}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={formData.overallMarksWeight}
                  onChange={(e) => handleNumberChange('overallMarksWeight', e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0F2A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Weight Percentage ({formData.overallAttendanceWeight}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={formData.overallAttendanceWeight}
                  onChange={(e) => handleNumberChange('overallAttendanceWeight', e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
                />
              </div>
            </div>

            {/* Mathematical Equation Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1 text-slate-700 dark:text-slate-300">
              <div className="font-bold text-[#0E7C86]">Mathematical Formula Applied:</div>
              <div>
                OPS = (Marks% &times; {formData.overallMarksWeight / 100}) + (Attendance% &times; {formData.overallAttendanceWeight / 100})
              </div>
              <p className="text-[11px] text-slate-400 font-sans pt-1">
                Where Marks% = (Marks Obtained / Max Marks Possible) &times; 100. Ties are resolved by maintaining identical ranks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit trail..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="all">All Action Types</option>
                <option value="MARK">Marks Operations</option>
                <option value="ATTENDANCE">Attendance Operations</option>
                <option value="PROGRAM">Program Operations</option>
                <option value="SETTINGS">Settings Changes</option>
                <option value="STUDENT">Student Management</option>
                <option value="AUTH">Authentication</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {auditLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently clear all audit trail records?')) {
                      clearAuditLogs();
                    }
                  }}
                  className="py-2 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-semibold text-xs flex items-center gap-1.5 transition"
                  title="Clear all audit logs"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Clear Audit Trail</span>
                </button>
              )}

              <button
                onClick={exportAuditCSV}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4 text-[#0E7C86]" />
                <span>Export Audit Trail (CSV)</span>
              </button>

              <button
                onClick={handleExportFullJSON}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
                title="Download full database backup as JSON"
              >
                <Download className="w-4 h-4 text-teal-600" />
                <span>Download Backup (JSON)</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left text-xs min-w-[620px] sm:min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 sticky left-0 bg-slate-50 dark:bg-[#0B1522] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Change Details</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No audit log entries matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap sticky left-0 bg-white dark:bg-[#0F1B2B] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {log.actor}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-[#0E7C86] dark:text-teal-400">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                          {log.details}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this audit log entry?')) {
                                deleteAuditLog(log.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
