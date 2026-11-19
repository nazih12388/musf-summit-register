import React, { useState, useEffect } from 'react';
import { onWriteError } from '../../services/firestoreService';
import { AlertCircle, X } from 'lucide-react';

export const WriteErrorToast = () => {
  const [errorItem, setErrorItem] = useState(null);

  useEffect(() => {
    const unsub = onWriteError((errEvent) => {
      setErrorItem(errEvent);
      // Auto dismiss after 8 seconds
      const timer = setTimeout(() => setErrorItem(null), 8000);
      return () => clearTimeout(timer);
    });
    return () => unsub();
  }, []);

  if (!errorItem) return null;

  const is429 = errorItem.error?.message?.includes('RESOURCE_EXHAUSTED') || errorItem.error?.code === 'resource-exhausted';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {is429 ? 'Cloud Quota Paused (Queued Safely)' : 'Cloud Write Notice'}
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
            {is429
              ? `Firebase daily quota reached while writing ${errorItem.context?.collectionName}. Your changes are preserved safely in local offline queue and will sync automatically.`
              : `Could not reach cloud for ${errorItem.context?.collectionName}: ${errorItem.error?.message || 'Network delay'}. Data queued locally.`}
          </p>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            {new Date(errorItem.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <button
          onClick={() => setErrorItem(null)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
