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
  WifiOff
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0F1B2B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
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
                Session Firestore operations & Quota telemetry
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
          {/* Counters Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-semibold">Session Reads</span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {usage.sessionReads}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Documents read via scoped real-time listeners
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-semibold">Session Writes</span>
                <HardDrive className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {usage.sessionWrites}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Atomic single-document & batch writes committed
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Connection & Quota State:</span>
              <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                {usage.isOffline ? (
                  <span className="text-rose-500 flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" /> Offline
                  </span>
                ) : (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> Online
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Firestore 429 Status:</span>
              <span className={`font-bold ${usage.quotaExhausted ? 'text-amber-500' : 'text-emerald-500'}`}>
                {usage.quotaExhausted ? '⚠️ Daily Quota Exceeded (Queued)' : '✓ Normal'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Pending Write Queue:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {usage.pendingWritesCount} operations
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Multi-Tab Persistence:</span>
              <span className="font-bold text-emerald-500">Enabled (IndexedDB)</span>
            </div>
          </div>

          {/* Quota Advisory */}
          {usage.quotaExhausted && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Firebase Spark Free Limit Reached
              </span>
              <p className="text-[11px] leading-relaxed">
                Changes made right now are queued in local browser persistence and will push automatically once quota resets at 1:30 PM IST or when upgraded to Blaze plan.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
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
              <span>Reset Counters</span>
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
