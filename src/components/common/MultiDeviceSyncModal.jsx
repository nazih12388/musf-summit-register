import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { migrateLocalDataToCloud } from '../../services/migrationService';
import {
  Smartphone,
  Share2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  CloudOff,
  X,
  FileJson,
  Check,
  Database
} from 'lucide-react';

export const MultiDeviceSyncModal = ({ isOpen, onClose }) => {
  const {
    exportFullAppData,
    importFullAppData,
    cloudSyncStatus,
    manualCloudSync,
    summits,
    programs,
    entries,
    marks,
    students
  } = useApp();

  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import' | 'cloud'
  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncResult, setCloudSyncResult] = useState(null);
  const [migrationProgress, setMigrationProgress] = useState(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    try {
      const dataStr = exportFullAppData();
      navigator.clipboard.writeText(dataStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert('Could not copy to clipboard. Please use the Download Backup button.');
    }
  };

  const handleDownload = () => {
    try {
      const dataStr = exportFullAppData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MUSF_Summit_Data_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download file.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setImportJson(content);
        executeImport(content);
      }
    };
    reader.readAsText(file);
  };

  const executeImport = (textToImport) => {
    const raw = textToImport || importJson;
    if (!raw.trim()) {
      setImportStatus({ type: 'error', message: 'ദയവായി കോഡ് പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ ഫയൽ അപ്‌ലോഡ് ചെയ്യുക.' });
      return;
    }

    try {
      importFullAppData(raw);
      setImportStatus({
        type: 'success',
        message: 'ഡാറ്റ വിജയകരമായി സമന്വയിപ്പിച്ചു! എല്ലാ പ്രോഗ്രാമുകളും മാർക്കുകളും ഈ ഫോണിൽ അപ്ഡേറ്റ് ആയി.'
      });
      setImportJson('');
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: 'ഡാറ്റ ഫോർമാറ്റ് തെറ്റാണ്. ശരിയായ കോഡ് നൽകുക: ' + (err.message || '')
      });
    }
  };

  const handleManualCloudSync = async () => {
    setIsCloudSyncing(true);
    setCloudSyncResult(null);
    try {
      const success = await manualCloudSync();
      if (success) {
        setCloudSyncResult({
          type: 'success',
          message: 'എല്ലാ വിവരങ്ങളും വിജയകരമായി ക്ലൗഡിലേക്ക് അപ്‌ലോഡ് ചെയ്തു!'
        });
      } else {
        setCloudSyncResult({
          type: 'error',
          message: 'ക്ലൗഡ് അപ്‌ലോഡ് പരാജയപ്പെട്ടു. Firebase quota limit ഉള്ളതിനാൽ direct sync ഉപയോഗിക്കുക.'
        });
      }
    } catch (e) {
      setCloudSyncResult({
        type: 'error',
        message: 'ക്ലൗഡ് എറർ: ' + (e.message || '')
      });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const isQuotaExhausted = cloudSyncStatus?.quotaExhausted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0F1B2B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0E7C86]/10 text-[#0E7C86] dark:text-teal-400 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F2A4A] dark:text-white leading-tight">
                ഡിവൈസ് സമന്വയം (Multi-Device Sync)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                മറ്റ് ഫോണുകളിലേക്കും ലാപ്ടോപ്പിലേക്കും ഡാറ്റ മാറ്റുക
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

        {/* Cloud Status Banner */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {isQuotaExhausted ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Firebase ക്ലൗഡ് ക്വാട്ട താൽക്കാലികമായി കഴിഞ്ഞു</span>
                <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  Spark പ്ലാനിലെ സൗജന്യ ക്വാട്ട കഴിഞ്ഞതിനാൽ ഫോൺ A-യിലെ മാറ്റങ്ങൾ ഫോൺ B-യിൽ തനിയെ എത്തില്ല. താഴെയുള്ള <strong>Direct Device Transfer</strong> ഉപയോഗിച്ച് 1 ക്ലിക്കിൽ ഡാറ്റ മാറ്റാം.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
                <span className="font-medium">ക്ലൗഡ് കണക്ഷൻ പ്രവർത്തനക്ഷമമാണ്</span>
              </div>
              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400">
                {cloudSyncStatus?.lastSyncedAt
                  ? `Last sync: ${new Date(cloudSyncStatus.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Real-time'}
              </span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'export'
                ? 'border-[#0E7C86] text-[#0E7C86] dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. മറ്റൊരു ഫോണിലേക്ക് അയക്കാൻ (Export)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'import'
                ? 'border-[#0E7C86] text-[#0E7C86] dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>2. ഈ ഫോണിൽ ചേർക്കാൻ (Import)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'cloud'
                ? 'border-[#0E7C86] text-[#0E7C86] dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>3. ക്ലൗഡ് സമന്വയം</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>ഈ ഡിവൈസിലെ ഡാറ്റ വിവരങ്ങൾ:</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">റെഡി</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">സമ്മിറ്റുകൾ</span>
                    <span className="font-bold text-slate-800 dark:text-white">{summits?.length || 0}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">പ്രോഗ്രാമുകൾ</span>
                    <span className="font-bold text-slate-800 dark:text-white">{programs?.length || 0}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">മാർക്കുകൾ</span>
                    <span className="font-bold text-slate-800 dark:text-white">{marks?.length || 0}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">വിദ്യാർത്ഥികൾ</span>
                    <span className="font-bold text-slate-800 dark:text-white">{students?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  മറ്റൊരു ഡിവൈസിലേക്ക് കൈമാറാനുള്ള വഴികൾ:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#0F2A4A] text-white hover:bg-[#1a3d66] transition flex items-center justify-center gap-2 text-xs font-bold shadow-xs active:scale-98"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">കോപ്പി ചെയ്തു!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#0E7C86]" />
                        <span>സിങ്ക് കോഡ് കോപ്പി ചെയ്യുക</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-center gap-2 text-xs font-bold active:scale-98"
                  >
                    <Download className="w-4 h-4 text-[#0E7C86]" />
                    <span>ബാക്കപ്പ് ഫയൽ (.json)</span>
                  </button>
                </div>

                {copied && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                    ✓ കോഡ് ക്ലിപ്പ്ബോർഡിലേക്ക് കോപ്പി ചെയ്തു. ഇനി WhatsApp വഴിയോ മറ്റോ അയച്ച് മറ്റേ ഫോണിൽ പേസ്റ്റ് ചെയ്യാം.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                മറ്റേ ഫോണിൽ നിന്നോ അഡ്മിനിൽ നിന്നോ ലഭിച്ച കോഡ് താഴെ നൽകുക അല്ലെങ്കിൽ .json ഫയൽ തിരഞ്ഞെടുക്കുക:
              </p>

              <div>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="മറ്റേ ഫോണിലെ കോപ്പി ചെയ്ത സിങ്ക് കോഡ് ഇവിടെ പേസ്റ്റ് ചെയ്യുക..."
                  className="w-full h-28 p-3 text-[11px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-[#0E7C86] resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => executeImport()}
                  className="min-h-[44px] flex-1 px-4 py-2.5 rounded-xl bg-[#0E7C86] text-white hover:bg-teal-700 transition flex items-center justify-center gap-2 text-xs font-bold shadow-xs active:scale-98"
                >
                  <Upload className="w-4 h-4" />
                  <span>ഈ ഫോണിലേക്ക് സമന്വയിപ്പിക്കുക (Apply)</span>
                </button>

                <label className="min-h-[44px] px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer active:scale-98">
                  <FileJson className="w-4 h-4 text-[#0E7C86]" />
                  <span>ഫയൽ അപ്‌ലോഡ് (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                    importStatus.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLOUD SYNC */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <span className="font-bold text-[#0F2A4A] dark:text-white block">
                  Firebase Cloud Database വിവരം:
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  ഞങ്ങൾ നടപ്പിലാക്കിയ പുതിയ ഒപ്റ്റിമൈസേഷൻ വഴി പേജ് റിഫ്രഷ് ചെയ്യുമ്പോൾ ക്ലൗഡിലേക്ക് അനാവശ്യമായ ഡാറ്റ പോകുന്നത് 95% ഒഴിവാക്കിയിട്ടുണ്ട്.
                </p>
                <div className="text-[11px] space-y-1 pt-1 text-slate-600 dark:text-slate-400">
                  <div>• Spark (സൗജന്യ പ്ലാൻ): ദിവസവും 20,000 writes ലഭിക്കും (ഉച്ചയ്ക്ക് 1:30 PM-ന് വീണ്ടും റീസെറ്റ് ആകും).</div>
                  <div>• Blaze (Pay-as-you-go) പ്ലാൻ: പരിധി പൂർണ്ണമായി മാറും. ആദ്യ 20,000 എഴുത്തുകൾ 100% സൗജന്യമാണ്.</div>
                </div>
              </div>

              {/* One-Time Migration Card */}
              <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 space-y-2.5">
                <span className="font-bold text-xs text-[#0F2A4A] dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#0E7C86]" />
                  <span>One-Time Migration: Upload Local Data to Cloud</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  ഈ ഫോണിൽ നേരത്തെ സേവ് ചെയ്തിട്ടുള്ള എല്ലാ ഡാറ്റയും പുതിയ ഫയർസ്റ്റോർ സിസ്റ്റത്തിലേക്ക് അപ്‌ലോഡ് ചെയ്യുക (Zero Duplicates, safe to re-run).
                </p>

                {migrationProgress && (
                  <div className="space-y-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span>{migrationProgress.message}</span>
                      <span className="font-mono text-teal-600 font-bold">{migrationProgress.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-[#0E7C86]" style={{ width: `${migrationProgress.percent}%` }} />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={migrationProgress?.isRunning}
                  onClick={async () => {
                    if (!window.confirm('Upload local browser data to individual Firestore documents now?')) return;
                    setMigrationProgress({ step: 0, percent: 0, message: 'Starting migration...', isRunning: true });
                    try {
                      const stats = await migrateLocalDataToCloud((step, percent, msg) => {
                        setMigrationProgress({ step, percent, message: msg, isRunning: true });
                      });
                      setMigrationProgress({
                        step: 100,
                        percent: 100,
                        message: `Migrated ${stats.totalMigrated} records to Firestore!`,
                        isRunning: false,
                        result: stats
                      });
                    } catch (e) {
                      setMigrationProgress({
                        step: 0,
                        percent: 0,
                        message: 'Notice: ' + (e.message || 'Write paused'),
                        isRunning: false,
                        isError: true
                      });
                    }
                  }}
                  className="w-full min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#0E7C86] text-white hover:bg-teal-700 disabled:opacity-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{migrationProgress?.isRunning ? 'Migrating...' : 'Upload Local Data to Cloud'}</span>
                </button>
              </div>

              {cloudSyncResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                    cloudSyncResult.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {cloudSyncResult.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{cloudSyncResult.message}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            അടയ്ക്കുക (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
