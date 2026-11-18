import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Award, Save, RotateCcw, Check } from 'lucide-react';

export const GradesSettings = () => {
  const { settings, updateSettings } = useApp();
  const { currentUser } = useAuth();

  const [ranges, setRanges] = useState(() => settings.gradeRanges || [
    { grade: 'A', min: 9.0, max: 10.0, label: 'Outstanding (A)' },
    { grade: 'B', min: 7.0, max: 8.99, label: 'Very Good (B)' },
    { grade: 'C', min: 5.0, max: 6.99, label: 'Good (C)' },
    { grade: 'No Grade', min: 0.0, max: 4.99, label: 'Below Minimum' }
  ]);

  const [savedMsg, setSavedMsg] = useState(false);

  const handleRangeChange = (index, field, val) => {
    const num = parseFloat(val) || 0;
    setRanges(prev => prev.map((r, i) => i === index ? { ...r, [field]: num } : r));
  };

  const handleSave = () => {
    updateSettings({ gradeRanges: ranges }, currentUser?.username);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleResetDefaults = () => {
    const defaults = [
      { grade: 'A', min: 9.0, max: 10.0, label: 'Outstanding (A)' },
      { grade: 'B', min: 7.0, max: 8.99, label: 'Very Good (B)' },
      { grade: 'C', min: 5.0, max: 6.99, label: 'Good (C)' },
      { grade: 'No Grade', min: 0.0, max: 4.99, label: 'Below Minimum' }
    ];
    setRanges(defaults);
    updateSettings({ gradeRanges: defaults }, currentUser?.username);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Automatic Grade Scale Ranges</span>
        </h3>
        <p className="text-xs text-slate-500">
          Configure the mark thresholds for automatic grade assignments (out of 10 max marks).
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Grade scales successfully updated and applied across all events!</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div className="space-y-3">
          {ranges.map((r, idx) => (
            <div key={r.grade} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  r.grade === 'A' ? 'bg-amber-400 text-slate-950 font-black' :
                  r.grade === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                  r.grade === 'C' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}>
                  {r.grade === 'No Grade' ? '-' : r.grade}
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{r.label}</div>
                  <div className="text-[11px] text-slate-400">Grade: {r.grade}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Min:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={r.min}
                    onChange={(e) => handleRangeChange(idx, 'min', e.target.value)}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-center font-bold"
                  />
                </div>
                <span className="text-slate-400">to</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Max:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={r.max}
                    onChange={(e) => handleRangeChange(idx, 'max', e.target.value)}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-center font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Wafy Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Grade Scales</span>
          </button>
        </div>
      </div>
    </div>
  );
};
