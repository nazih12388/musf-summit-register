import React from 'react';
import { CardSkeleton } from './CardSkeleton';
import { FileText, FileSpreadsheet, Download, Clock } from 'lucide-react';

export const ReportCard = ({
  title = 'Monthly Performance Report',
  period = 'November 2026',
  formats = ['pdf', 'excel'],
  lastGenerated = 'Today, 2:30 PM',
  onGenerate,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  return (
    <div
      className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-white to-slate-50/70 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-slate-900/60 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4 ${className}`}
    >
      {/* 3px Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-teal-500" />

      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="space-y-1">
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug">
            {title}
          </h3>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
            Period: <strong className="font-bold text-slate-800 dark:text-slate-200">{period}</strong>
          </p>
        </div>

        {/* Format Icons with Rich Micro-Gradients */}
        <div className="flex items-center gap-1.5 shrink-0">
          {formats.includes('pdf') && (
            <span
              title="PDF Document"
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xs shadow-rose-500/20 flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider"
            >
              PDF
            </span>
          )}
          {formats.includes('excel') && (
            <span
              title="Excel Spreadsheet"
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs shadow-emerald-500/20 flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider"
            >
              XLS
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{lastGenerated ? `Generated: ${lastGenerated}` : 'Ready'}</span>
        </div>

        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0E7C86] via-[#14919D] to-[#1E3A8A] hover:from-[#11919D] hover:to-[#2563EB] text-white text-xs font-bold transition active:scale-95 shadow-md shadow-teal-900/15 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>
        )}
      </div>
    </div>
  );
};
