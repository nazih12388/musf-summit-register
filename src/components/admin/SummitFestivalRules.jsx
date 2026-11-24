import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CalendarCheck2,
  TrendingUp,
  Percent,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Eye,
  EyeOff,
  Sliders,
  Award,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const SummitFestivalRules = ({ onBack }) => {
  const { lang, tr } = useLanguage();
  const { settings = {}, updateSettings, students = [], studentAttendanceMap = {} } = useApp();
  const { currentUser } = useAuth();

  const [activeSection, setActiveSection] = useState('attendance'); // 'attendance', 'ops', 'judging'
  const [saveToast, setSaveToast] = useState(false);

  const [formData, setFormData] = useState({
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

  const triggerToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  const handleToggle = (key) => {
    const newVal = !formData[key];
    const updates = { [key]: newVal };
    if (key === 'fairJudgingMode') {
      updates.hideTeamFromJudges = newVal;
    }
    setFormData(prev => ({ ...prev, ...updates }));
    if (updateSettings) {
      updateSettings(updates, currentUser?.name || 'Fine Arts Convener');
    }
    triggerToast();
  };

  const handleNumberChange = (key, val) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    let updates = { [key]: num };

    if (key === 'overallMarksWeight') {
      updates.overallAttendanceWeight = 100 - num;
    } else if (key === 'overallAttendanceWeight') {
      updates.overallMarksWeight = 100 - num;
    }

    setFormData(prev => ({ ...prev, ...updates }));
    if (updateSettings) {
      updateSettings(updates, currentUser?.name || 'Fine Arts Convener');
    }
    triggerToast();
  };

  const lowAttendanceCount = students.filter(st => {
    const att = studentAttendanceMap[st.id]?.percentage || 0;
    return att < formData.lowAttendanceThreshold;
  }).length;

  return (
    <div className="space-y-6">
      {onBack && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>&larr; Back to Wing Dashboard</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0F2A4A] via-[#12365C] to-[#0E7C86] text-white shadow-lg shadow-blue-950/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-300" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Summit Festival Rules &amp; Performance Engine
              </h2>
            </div>
            <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
              Fine Arts portfolio rules for 3-tier attendance accreditation, Overall Performance Score (OPS) weighting, and objective fair-judging governance.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-amber-300 self-start sm:self-auto uppercase tracking-wider">
            Fine Arts Exclusive
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSection('attendance')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-98 cursor-pointer ${
            activeSection === 'attendance'
              ? 'bg-[#0E7C86] text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
          <span>Attendance Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('ops')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-98 cursor-pointer ${
            activeSection === 'ops'
              ? 'bg-[#0E7C86] text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Overall Performance Score (OPS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('judging')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-98 cursor-pointer ${
            activeSection === 'judging'
              ? 'bg-[#0E7C86] text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Fair Judging &amp; Limits</span>
        </button>
      </div>

      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white border border-teal-500/40 shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Settings successfully synchronized &amp; saved!</span>
        </div>
      )}

      {/* 1. ATTENDANCE RULES */}
      {activeSection === 'attendance' && (
        <div className="space-y-4 max-w-3xl">
          {/* Late Rule */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                Count &quot;Late&quot; as Present
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When active, participants marked &quot;Late&quot; during START, MID, or END festival sessions receive present credit towards their attendance percentage.
              </p>
            </div>
            <button
              type="button"
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

          {/* Excused Rule */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                Count &quot;Excused&quot; (Medical/Duty Leave) as Present
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When active, students with approved official leave during summit hours are counted as present for festival rankings.
              </p>
            </div>
            <button
              type="button"
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
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <span>Low Attendance Warning Threshold</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
                  {lowAttendanceCount} Students at Risk
                </span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Flags students whose attendance dips below this target percentage across summit sessions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.lowAttendanceThreshold}
                onChange={(e) => handleNumberChange('lowAttendanceThreshold', e.target.value)}
                className="w-16 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold font-mono text-sm"
              />
              <span className="text-xs text-slate-400 font-semibold">% Required</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. OVERALL PERFORMANCE SCORE (OPS) */}
      {activeSection === 'ops' && (
        <div className="space-y-4 max-w-3xl">
          {/* OPS Master Toggle */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                  Enable Overall Performance Score (OPS) Engine
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Combines <strong>Summit Event Marks</strong> and <strong>Attendance Records</strong> into a unified ranking index used for Best Outgoing Student and House Championship scoring.
              </p>
            </div>
            <button
              type="button"
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

          {/* Weight Balancing Visual Slider */}
          <div className={`p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 ${
            !formData.enableOverallPerformanceScore ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#0E7C86]" />
              <span>Weight Distribution Formula</span>
            </h4>

            {/* Split Bar */}
            <div className="h-6 w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex text-[10px] font-black text-white text-center leading-6">
              <div
                className="bg-[#0E7C86] transition-all duration-300 flex items-center justify-center truncate px-1"
                style={{ width: `${formData.overallMarksWeight}%` }}
              >
                {formData.overallMarksWeight}% Marks
              </div>
              <div
                className="bg-amber-500 transition-all duration-300 flex items-center justify-center truncate px-1"
                style={{ width: `${formData.overallAttendanceWeight}%` }}
              >
                {formData.overallAttendanceWeight}% Attendance
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Marks Weight */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Summit Event Marks</span>
                  <span className="text-[10px] text-slate-400">Competitive evaluation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.overallMarksWeight}
                    onChange={(e) => handleNumberChange('overallMarksWeight', e.target.value)}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-xs"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>

              {/* Attendance Weight */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Summit Attendance</span>
                  <span className="text-[10px] text-slate-400">Session presence record</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.overallAttendanceWeight}
                    onChange={(e) => handleNumberChange('overallAttendanceWeight', e.target.value)}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-xs"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Formula: OPS = (Marks % &times; {formData.overallMarksWeight / 100}) + (Attendance % &times; {formData.overallAttendanceWeight / 100})
            </p>
          </div>
        </div>
      )}

      {/* 3. FAIR JUDGING & NOMINATIONS */}
      {activeSection === 'judging' && (
        <div className="space-y-4 max-w-3xl">
          {/* Fair Judging Toggle */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0E7C86]" />
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                  Fair Judging Mode (Mask Team Names)
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When enabled, judges only see candidate <strong>Chest Numbers</strong>. Team names and colors are 100% hidden to ensure objective evaluation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('fairJudgingMode')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.fairJudgingMode ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.fairJudgingMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Enforce Judge Program Restrictions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {formData.enforceJudgeRestrictions ? <Lock className="w-5 h-5 text-amber-600" /> : <Unlock className="w-5 h-5 text-emerald-600" />}
                <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                  Enforce Judge Program Restrictions
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When restricted, judges can only score programs explicitly assigned to them. When unrestricted, any judge can evaluate all events.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('enforceJudgeRestrictions')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.enforceJudgeRestrictions ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.enforceJudgeRestrictions ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Max Programs Limit */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                Maximum Programs per Student (per Summit)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Limits how many events a single student can take part in within a summit. Set to 0 for unlimited participation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10"
                value={formData.maxProgramsPerStudent}
                onChange={(e) => handleNumberChange('maxProgramsPerStudent', e.target.value)}
                className="w-16 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold font-mono text-sm"
              />
              <span className="text-xs text-slate-400 font-semibold">{formData.maxProgramsPerStudent === 0 ? '(Unlimited)' : 'Events Max'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
