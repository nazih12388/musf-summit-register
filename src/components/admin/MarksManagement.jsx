import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import {
  Scale,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  UserCheck,
  Award
} from 'lucide-react';

export const MarksManagement = () => {
  const {
    summits = [],
    programs = [],
    entries = [],
    marks = [],
    judges = [],
    students = [],
    teams = [],
    programResultsMap = {},
    submitJudgeMark,
    adminApproveOrEditMark,
    deleteMark,
    toggleProgramStatus
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [selectedSummitId, setSelectedSummitId] = useState(summits[0]?.id || '');
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || '');
  const [editMarkModal, setEditMarkModal] = useState(null);
  const [newMarkValue, setNewMarkValue] = useState('');
  const [editStatus, setEditStatus] = useState('approved');
  const [toastMsg, setToastMsg] = useState('');

  // Current program & results
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];
  const currentEntries = entries.filter(e => e.programId === currentProgram?.id);
  const currentResults = programResultsMap[currentProgram?.id] || [];

  const handleOpenEdit = (existingMark, entry, participantName) => {
    setEditMarkModal({
      mark: existingMark,
      entry,
      participantName
    });
    setNewMarkValue(existingMark ? String(existingMark.marks) : '8.5');
    setEditStatus(existingMark?.status || 'approved');
  };

  const handleSaveMarkEdit = (e) => {
    e.preventDefault();
    if (!editMarkModal) return;

    if (editMarkModal.mark) {
      // Edit existing
      adminApproveOrEditMark(
        editMarkModal.mark.id,
        newMarkValue,
        editStatus,
        currentUser?.username
      );
    } else {
      // Enter new mark as admin
      submitJudgeMark(
        currentProgram.id,
        editMarkModal.entry.id,
        editMarkModal.entry.studentId,
        currentUser.id,
        `Admin: ${currentUser.name}`,
        newMarkValue,
        currentUser?.username
      );
    }

    setEditMarkModal(null);
    setToastMsg("Mark saved and logged in audit history!");
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleTogglePublish = () => {
    if (!currentProgram) return;
    const next = currentProgram.status === 'published' ? 'locked' : 'published';
    toggleProgramStatus(currentProgram.id, next, currentUser?.username);
    setToastMsg(next === 'published' ? 'Official results published!' : 'Results unpublished (hidden from students)');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleBulkPublishSummit = () => {
    programs.filter(p => p.summitId === selectedSummitId).forEach(p => {
      toggleProgramStatus(p.id, 'published', currentUser?.username);
    });
    setToastMsg(`Published all results for ${summits.find(s => s.id === selectedSummitId)?.name}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#0E7C86]" />
            <span>Marks & Result Publishing Console</span>
          </h3>
          <p className="text-xs text-slate-500">
            Review multi-judge averages, approve leader-submitted scores, and release official results to students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkPublishSummit}
            className="px-3 py-1.5 rounded-lg border border-[#0E7C86] text-[#0E7C86] dark:text-teal-300 text-xs font-semibold hover:bg-teal-50 dark:hover:bg-slate-800 transition"
          >
            Bulk Publish Summit
          </button>

          {currentProgram && (
            <button
              onClick={handleTogglePublish}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentProgram.status === 'published'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {currentProgram.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{currentProgram.status === 'published' ? "Unpublish Results" : "Publish Official Results"}</span>
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summit & Program Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#0F1B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            1. Select Summit Gathering:
          </label>
          <select
            value={selectedSummitId}
            onChange={(e) => {
              setSelectedSummitId(e.target.value);
              const progs = programs.filter(p => p.summitId === e.target.value);
              if (progs.length > 0) setSelectedProgramId(progs[0].id);
            }}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            {summits.map(s => <option key={s.id} value={s.id}>{s.name} ({s.month})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            2. Select Program Event:
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            {programs.filter(p => p.summitId === selectedSummitId).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.status.toUpperCase()}] ({p.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Program Summary Bar */}
      {currentProgram && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentProgram.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue & Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentProgram.stage} • {currentProgram.date}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
              <span className={`font-bold ${
                currentProgram.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {currentProgram.status === 'published' ? 'Published (Visible to Students)' : 'Draft / Locked (Hidden)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Judges / Source:</span>
            {currentProgram.allowLeaderMarkEntry ? (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                Team Leader Upload Enabled
              </span>
            ) : (
              judges.map(j => (
                <span key={j.id} className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold">
                  {j.name.split(' ')[0]}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {!currentProgram ? (
        <div className="p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-bold text-base text-slate-700 dark:text-slate-300">No Programs Available for Mark Evaluation</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Assign programs to a summit in the Summit Program Matrix to begin recording and publishing scores.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE MARKS FEED (Screens < 768px): Zero Horizontal Scroll, Fast Native Layout */}
          <div className="md:hidden space-y-3">
        {currentEntries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs">
            No participants assigned to this program yet.
          </div>
        ) : (
          currentEntries.map(entry => {
            let participantName = '';
            let team = teams.find(t => t.id === entry.teamId);

            if (currentProgram.type === 'individual') {
              const st = students.find(s => s.id === entry.studentId);
              participantName = st ? st.name : 'Unknown';
              team = teams.find(t => t.id === st?.teamId) || team;
            } else {
              participantName = entry.groupName;
            }

            const res = currentResults.find(r => r.entryId === entry.id || r.studentId === entry.studentId);
            const entryMarks = marks.filter(m => m.programId === currentProgram.id && (m.entryId === entry.id || m.studentId === entry.studentId));

            return (
              <div
                key={entry.id}
                className="p-3.5 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition"
              >
                {/* Header: Name + House + Position */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {participantName}
                    </h4>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: team?.color || '#0E7C86' }}
                    >
                      {team?.name || 'House'}
                    </span>
                  </div>

                  <div className="text-right">
                    {res?.position ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        res.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        res.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        res.rank === 3 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                        'text-slate-600 bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {res.position}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Unranked</span>
                    )}
                  </div>
                </div>

                {/* Score Summary Row */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Final Mark</span>
                    <span className="font-mono font-black text-sm text-[#0F2A4A] dark:text-teal-400">
                      {res ? `${res.finalMark.toFixed(2)}/10` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Marks %</span>
                    <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">
                      {res ? `${res.percentage.toFixed(1)}%` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Grade</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      {res?.grade || '-'}
                    </span>
                  </div>
                </div>

                {/* Breakdown & Edit Action */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-wrap gap-1 items-center">
                    {entryMarks.length === 0 ? (
                      <span className="text-slate-400 text-[11px] italic">Pending Score Entry</span>
                    ) : (
                      entryMarks.map(em => (
                        <span key={em.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300 font-mono text-[11px] font-bold">
                          <span>{em.marks}/10</span>
                          <span className="text-[9px] opacity-70">({em.sourceRole || 'judge'})</span>
                        </span>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenEdit(entryMarks[0], entry, participantName)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>{entryMarks.length > 0 ? "Edit" : "Enter"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP SCORING TABLE (Screens >= 768px) */}
      <div className="hidden md:block bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px] sm:min-w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">Participant / Group</th>
                <th className="py-3 px-4">House Team</th>
                <th className="py-3 px-4 text-center">Marks Breakdown / Source</th>
                <th className="py-3 px-4 text-center">Final Mark</th>
                <th className="py-3 px-4 text-center">Marks %</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Position</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No participants assigned to this program yet.
                  </td>
                </tr>
              ) : (
                currentEntries.map(entry => {
                  let participantName = '';
                  let team = teams.find(t => t.id === entry.teamId);

                  if (currentProgram.type === 'individual') {
                    const st = students.find(s => s.id === entry.studentId);
                    participantName = st ? st.name : 'Unknown';
                    team = teams.find(t => t.id === st?.teamId) || team;
                  } else {
                    participantName = entry.groupName;
                  }

                  const res = currentResults.find(r => r.entryId === entry.id || r.studentId === entry.studentId);
                  const entryMarks = marks.filter(m => m.programId === currentProgram.id && (m.entryId === entry.id || m.studentId === entry.studentId));

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-[#0F1B2B] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        {participantName}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: team?.color }}>
                          {team?.name}
                        </span>
                      </td>

                      {/* Source & Marks Breakdown */}
                      <td className="py-2.5 px-4 text-center">
                        {entryMarks.length === 0 ? (
                          <span className="text-slate-400 italic">Pending Entry</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {entryMarks.map(em => (
                              <div key={em.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                                <span className="font-mono font-bold">{em.marks}/10</span>
                                <span className="text-[10px] text-slate-400">({em.enteredByName || em.sourceRole})</span>
                                <span className={`text-[9px] px-1 rounded uppercase font-bold ${
                                  em.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                  em.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {em.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Final Mark */}
                      <td className="py-2.5 px-4 text-center font-mono font-black text-sm text-[#0F2A4A] dark:text-teal-400">
                        {res ? `${res.finalMark.toFixed(2)}/10` : '-'}
                      </td>

                      {/* Percentage */}
                      <td className="py-2.5 px-4 text-center font-mono font-bold">
                        {res ? `${res.percentage.toFixed(1)}%` : '-'}
                      </td>

                      {/* Grade */}
                      <td className="py-2.5 px-4 text-center font-bold">
                        {res?.grade || '-'}
                      </td>

                      {/* Position */}
                      <td className="py-2.5 px-4 text-center font-bold">
                        {res?.position ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] ${
                            res.rank === 1 ? 'bg-amber-100 text-amber-800 font-black' :
                            res.rank === 2 ? 'bg-slate-200 text-slate-800' :
                            res.rank === 3 ? 'bg-amber-50 text-amber-900 border border-amber-300' :
                            'text-slate-500'
                          }`}>
                            {res.position}
                          </span>
                        ) : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(entryMarks[0], entry, participantName)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 ml-auto"
                        >
                          <Edit2 className="w-3 h-3 text-[#0E7C86]" />
                          <span>{entryMarks.length > 0 ? "Edit" : "Enter"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

      {/* Edit / Approve Mark Modal */}
      {editMarkModal && (
        <Modal isOpen={Boolean(editMarkModal)} onClose={() => setEditMarkModal(null)} title="Admin Mark Review & Override" maxWidth="max-w-md">
          <form onSubmit={handleSaveMarkEdit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1">
              <div><strong>Event:</strong> {currentProgram.name}</div>
              <div><strong>Participant:</strong> {editMarkModal.participantName}</div>
              {editMarkModal.mark && (
                <div><strong>Current Source:</strong> {editMarkModal.mark.enteredByName} ({editMarkModal.mark.sourceRole})</div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Score (out of 10.0 max):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                inputMode="decimal"
                required
                autoFocus
                value={newMarkValue}
                onChange={(e) => setNewMarkValue(e.target.value)}
                placeholder="e.g. 9.4"
                className="w-full p-3 text-center text-lg font-bold min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Approval Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="approved">Approved</option>
                <option value="edited_by_admin">Edited by Admin</option>
                <option value="submitted">Pending Review (Submitted)</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              All admin corrections and approvals are automatically recorded in the system audit trail.
            </p>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold rounded-lg"
            >
              Confirm & Save Mark
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
