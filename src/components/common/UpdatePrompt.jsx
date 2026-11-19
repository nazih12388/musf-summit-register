import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export const UpdatePrompt = () => {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Listen to existing registrations
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowUpdate(true);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowUpdate(true);
          }
        });
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0F2A4A] text-white rounded-2xl shadow-2xl border border-teal-500/40 backdrop-blur-md">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0 animate-spin" />
        <span className="text-xs font-semibold">Update available</span>
        <button
          type="button"
          onClick={handleUpdate}
          className="ml-1 px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tap to refresh</span>
        </button>
      </div>
    </div>
  );
};
