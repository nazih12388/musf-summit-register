import React, { useState, useEffect } from 'react';
import { subscribeSyncStatus, retryPendingWrites } from '../../services/firestoreService';
import { migrateLocalDataToCloud } from '../../services/migrationService';
import { STORAGE_KEYS } from '../../services/firebase';
import { AlertTriangle, RefreshCw, X, HardDrive, Cloud, Upload, CheckCircle2 } from 'lucide-react';

export const QuotaBanner = ({ onOpenDirectSync, onOpenCloudUsage }) => {
  const [syncStatus, setSyncStatus] = useState({
    state: 'synced',
    quotaExhausted: false,
    pendingWritesCount: 0,
    isOffline: false
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [needsCloudUpload, setNeedsCloudUpload] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateMessage, setMigrateMessage] = useState('');
  const [migrateSuccess, setMigrateSuccess] = useState(false);

  useEffect(() => {
    const unsub = subscribeSyncStatus(setSyncStatus);
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const alreadyUploaded = localStorage.getItem('musf_cloud_migrated_v1');
      if (!alreadyUploaded) {
        const hasStudents = Boolean(localStorage.getItem(STORAGE_KEYS.STUDENTS));
        const hasSummits = Boolean(localStorage.getItem(STORAGE_KEYS.SUMMITS));
        const hasTeams = Boolean(localStorage.getItem(STORAGE_KEYS.TEAMS));
        if (hasStudents || hasSummits || hasTeams) {
          setNeedsCloudUpload(true);
        }
      }
    } catch {}
  }, []);

  const handleCloudUpload = async () => {
    setIsMigrating(true);
    setMigrateMessage('Uploading local data to Firestore...');
    try {
      const stats = await migrateLocalDataToCloud((step, percent, msg) => {
        setMigrateMessage(`${msg} (${percent}%)`);
      });
      localStorage.setItem('musf_cloud_migrated_v1', 'true');
      setMigrateSuccess(true);
      setMigrateMessage(`Uploaded ${stats.totalMigrated} items to Cloud! Other devices can now see this data.`);
      setTimeout(() => {
        setNeedsCloudUpload(false);
      }, 5000);
    } catch (e) {
      setMigrateMessage('Upload paused: ' + (e.message || 'Error'));
    } finally {
      setIsMigrating(false);
    }
  };

  // 1. Show Cloud Upload Migration Banner if local data needs to be pushed to cloud
  if (needsCloudUpload && !isDismissed && !syncStatus.quotaExhausted) {
    return (
      <div className="bg-[#0E7C86] text-white px-3.5 py-2.5 text-xs font-medium shadow-md sticky top-14 sm:top-16 z-30 transition-all flex flex-wrap items-center justify-between gap-2 border-b border-teal-700">
        <div className="flex items-center gap-2 min-w-0">
          {migrateSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <Cloud className="w-4 h-4 text-teal-200 shrink-0" />
          )}
          <span className="leading-tight">
            {migrateMessage ? (
              <strong>{migrateMessage}</strong>
            ) : (
              <>
                <strong>മറ്റ് ഫോണുകളിലും കാണാൻ:</strong> ഈ ഫോണിലുള്ള വിവരങ്ങൾ ക്ലൗഡിലേക്ക് അപ്‌ലോഡ് ചെയ്യുക (അല്ലെങ്കിൽ മറ്റ് ഫോണുകളിൽ ഡെമോ ഡാറ്റ മാത്രമേ കാണൂ).
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!migrateSuccess && (
            <button
              type="button"
              disabled={isMigrating}
              onClick={handleCloudUpload}
              className="min-h-[30px] px-3 py-1 rounded-lg bg-white text-[#0E7C86] hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Upload className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
              <span>{isMigrating ? 'Uploading...' : 'Upload to Cloud Now'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setNeedsCloudUpload(false)}
            className="p-1 rounded-lg hover:bg-teal-700 text-white/80 hover:text-white transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Show Quota / Offline / Error Banner
  if (isDismissed || (!syncStatus.quotaExhausted && !syncStatus.isOffline && !syncStatus.firestoreError && syncStatus.pendingWritesCount === 0)) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryPendingWrites();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-medium shadow-md sticky top-14 sm:top-16 z-30 transition-all flex flex-wrap items-center justify-between gap-2 border-b border-amber-600/40">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
        <span className="leading-tight">
          {syncStatus.firestoreError ? (
            <>
              <strong>ക്ലൗഡ് കണക്ഷൻ ശ്രദ്ധിക്കുക:</strong> {syncStatus.firestoreError === 'permission-denied' ? 'Permission denied in Firestore rules. Please sign in.' : syncStatus.firestoreError}
            </>
          ) : syncStatus.quotaExhausted ? (
            <>
              <strong>ക്വാട്ട പരിധി (429 Quota Paused):</strong> മാറ്റങ്ങൾ ലോക്കലായി ക്യൂവിൽ സുരക്ഷിതമാണ് ({syncStatus.pendingWritesCount} pending).
            </>
          ) : syncStatus.isOffline ? (
            <>
              <strong>ഓഫ്‌ലൈൻ മോഡ്:</strong> ഇന്റർനെറ്റ് ലഭ്യമല്ല. മാറ്റങ്ങൾ ലോക്കൽ കാഷെയിൽ സുരക്ഷിതമാണ്.
            </>
          ) : (
            <>
              <strong>സമന്വയിപ്പിക്കുന്നു:</strong> {syncStatus.pendingWritesCount} മാറ്റങ്ങൾ ക്ലൗഡിലേക്ക് അയക്കുന്നു...
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="min-h-[30px] px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-bold hover:bg-slate-800 transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 text-amber-400 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry Now'}</span>
        </button>

        {onOpenDirectSync && (
          <button
            type="button"
            onClick={onOpenDirectSync}
            className="min-h-[30px] px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-slate-950 text-[11px] font-bold transition flex items-center gap-1 active:scale-95"
          >
            <HardDrive className="w-3 h-3" />
            <span>Direct Sync / ബാക്കപ്പ്</span>
          </button>
        )}

        {onOpenCloudUsage && (
          <button
            type="button"
            onClick={onOpenCloudUsage}
            className="min-h-[30px] px-2 py-1 rounded-lg hover:bg-amber-600/20 text-slate-900 text-[11px] font-bold transition"
          >
            Usage
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg hover:bg-amber-600/30 text-slate-950 transition"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
