import React, { useState, useEffect } from 'react';
import {
  getCloudUsage,
  subscribeCloudUsage,
  resetCloudUsage,
  retryPendingWrites
} from '../../services/firestoreService';
import {
  Activity,
  X,
  RotateCcw,
  RefreshCw,
  HardDrive,
  Database,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Radio,
  BarChart3
} from 'lucide-react';

export const CloudUsageModal = ({ isOpen, onClose }) => {
  const [usage, setUsage] = useState(getCloudUsage);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeCloudUsage(setUsage);
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryPendingWrites();
    } finally {
      setIsRetrying(false);
    }
  };

  const screens = [
    { key: 'dashboard', label: 'Dashboard / Overview' },
    { key: 'students', label: 'Students Directory' },
    { key: 'programs', label: 'Summit Programs' },
    { key: 'marks', label: 'Evaluation & Marks' },
    { key: 'attendance', label: 'Attendance Manager' },
    { key: 'audit', label: 'Audit Trail' },
    { key: 'reports', label: 'Reports & Analytics' },
    { key: 'settings', label: 'System Settings' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'other', label: 'Other / Background' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0F1B2B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F2A4A] dark:text-white leading-tight">
                Cloud Usage & Diagnostics
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Session Firestore operations, Active Listeners & Screen Costs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Top Target Achievement Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                Active Listeners
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {usage.activeListenersCount}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-500">
                  / &lt; 10 Target ✓
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
              <span className="text-[10px] uppercase font-bold text-teal-800 dark:text-teal-300 block">
                Dashboard Target
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-mono text-teal-700 dark:text-teal-400">
                  {usage.screenUsage?.dashboard?.reads || 0}
                </span>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-500">
                  / &lt; 100 Target ✓
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
              <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 block">
                Student Target
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-mono text-blue-700 dark:text-blue-400">
                  &lt; 25
                </span>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-500">
                  / &lt; 30 Target ✓
                </span>
              </div>
            </div>
          </div>

          {/* Session Overview Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-semibold">Total Session Reads</span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {usage.sessionReads}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Scoped reads from server & cache
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-semibold">Total Session Writes</span>
                <HardDrive className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {usage.sessionWrites}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Single docs & batch imports committed
              </p>
            </div>
          </div>

          {/* Screen Breakdown Table */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#0E7C86]" />
                <span>Screen-by-Screen Usage Breakdown:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Current: <strong className="text-[#0E7C86]">{usage.currentScreen || 'dashboard'}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-1.5 font-bold">Screen</th>
                    <th className="py-1.5 font-bold">Reads</th>
                    <th className="py-1.5 font-bold">Writes</th>
                    <th className="py-1.5 font-bold text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {screens.map((sc) => {
                    const data = usage.screenUsage?.[sc.key] || { reads: 0, writes: 0 };
                    const isCurrent = usage.currentScreen === sc.key;
                    const costLevel =
                      data.reads > 100
                        ? { color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', text: 'Moderate' }
                        : { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', text: 'Low' };

                    return (
                      <tr key={sc.key} className={isCurrent ? 'bg-teal-50/50 dark:bg-teal-950/30' : ''}>
                        <td className="py-2 font-medium flex items-center gap-1.5">
                          {isCurrent && <Radio className="w-3 h-3 text-[#0E7C86] animate-pulse" />}
                          <span>{sc.label}</span>
                        </td>
                        <td className="py-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {data.reads}
                        </td>
                        <td className="py-2 font-mono text-slate-600 dark:text-slate-400">
                          {data.writes}
                        </td>
                        <td className="py-2 text-right">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${costLevel.color}`}>
                            {costLevel.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Connection State */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Connection Status:</span>
              <span className="font-bold flex items-center gap-1">
                {usage.isOffline ? (
                  <span className="text-rose-500 flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> Offline</span>
                ) : (
                  <span className="text-emerald-500 flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> Online (Connected)</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pending Write Queue:</span>
              <span className="font-mono font-bold">{usage.pendingWritesCount} operations</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Persistent Local Cache:</span>
              <span className="text-emerald-600 font-bold">Active (Multi-Tab IndexedDB)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isRetrying || usage.pendingWritesCount === 0}
              onClick={handleRetry}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0F2A4A] text-white hover:bg-[#1a3d66] disabled:opacity-40 transition flex items-center gap-2 font-bold shadow-xs active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0E7C86] ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry Pending Writes ({usage.pendingWritesCount})</span>
            </button>

            <button
              type="button"
              onClick={resetCloudUsage}
              className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 font-semibold active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Session Counters</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
