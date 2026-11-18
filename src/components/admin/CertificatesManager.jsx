import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { generateCertificatePDF, bulkGenerateCertificatesPDF } from '../../utils/certificate';
import { Award, Download, Printer, Sparkles } from 'lucide-react';

export const CertificatesManager = () => {
  const { programs, programResultsMap, settings, students, teams } = useApp();

  // Extract all certificates for top 3 winners of all declared programs
  const certificatesList = useMemo(() => {
    const list = [];
    programs.forEach(prog => {
      const results = programResultsMap[prog.id] || [];
      const top3 = results.filter(r => r.rank <= 3);

      top3.forEach(winner => {
        const student = students.find(s => s.id === winner.studentId);
        const team = teams.find(t => t.id === winner.teamId);

        list.push({
          studentName: winner.participantName,
          chestNo: winner.chestNo,
          cicNo: student?.cicNo || 'WAFY',
          teamName: winner.teamName,
          programName: prog.name,
          position: winner.position,
          grade: winner.grade,
          date: prog.date,
          collegeName: settings.collegeName,
          summitName: settings.appTitle || "MUSF Summit Register"
        });
      });
    });
    return list;
  }, [programs, programResultsMap, settings, students, teams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Merit Certificate Generator</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {certificatesList.length} Certificates Ready
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Auto-generate official college merit certificates for 1st, 2nd, and 3rd place winners with college seal and signatures.
          </p>
        </div>

        <button
          onClick={() => bulkGenerateCertificatesPDF(certificatesList)}
          disabled={certificatesList.length === 0}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-900/10 disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Bulk Download All Certificates (PDF)</span>
        </button>
      </div>

      {certificatesList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm font-semibold">No Top 3 results declared yet.</p>
          <p className="text-xs">Once events are evaluated, their merit certificates appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificatesList.map((cert, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 hover:border-amber-500/60 shadow-xs space-y-3 transition flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {cert.position}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{cert.date}</span>
                </div>

                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {cert.studentName}
                </h4>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div>Event: <strong className="text-slate-700 dark:text-slate-300">{cert.programName}</strong></div>
                  <div>Team: <strong className="text-slate-700 dark:text-slate-300">{cert.teamName}</strong> • Chest: {cert.chestNo}</div>
                  <div>Grade: <strong className="text-emerald-700 dark:text-amber-400">{cert.grade}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => generateCertificatePDF(cert)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
