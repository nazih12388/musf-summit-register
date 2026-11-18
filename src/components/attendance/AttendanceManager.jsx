import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Lock,
  Unlock,
  Users,
  Search,
  Filter,
  AlertTriangle,
  Send,
  Save,
  CheckCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AttendanceManager = ({ isLeaderView = false, leaderTeamId = null }) => {
  const {
    summits,
    students,
    classes,
    teams,
    attendance,
    settings,
    studentAttendanceMap,
    recordAttendance,
    bulkRecordAttendance,
    toggleAttendanceSessionLock,
    sendNotification,
    isConsideredPresent
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Summit selection: EMPTY BY DEFAULT so user must explicitly select a summit
  const [selectedSummitId, setSelectedSummitId] = useState('');
  const [selectedSession, setSelectedSession] = useState('START'); // 'START', 'MID', 'END'
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  // Available summits list
  const availableSummits = useMemo(() => {
    return (summits || []).filter(s => {
      if (s.status === 'cancelled') return false;
      // In leader view, hide un-published / planned summits
      if (isLeaderView && s.status === 'planned') return false;
      return true;
    });
  }, [summits, isLeaderView]);

  // Local statuses being marked: { [studentId]: 'Present' | 'Absent' | 'Late' | 'Excused' | null }
  const [statusMap, setStatusMap] = useState({});

  // Check if current session in current summit is locked
  const currentSummit = (summits || []).find(s => s.id === selectedSummitId);
  const sessionRecords = selectedSummitId
    ? (attendance || []).filter(a => a.summitId === selectedSummitId && a.session === selectedSession)
    : [];
  const isSessionLocked = sessionRecords.some(a => a.locked);

  // Target students list (If leader, only own team)
  const targetStudents = useMemo(() => {
    if (!selectedSummitId) return [];
    return (students || []).filter(s => {
      if (isLeaderView && leaderTeamId && s.teamId !== leaderTeamId) return false;
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.cicNo.toLowerCase().includes(search.toLowerCase()) ||
        (s.chestNo && s.chestNo.toLowerCase().includes(search.toLowerCase()));
      const matchClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchTeam = selectedTeam === 'all' || s.teamId === selectedTeam;
      return matchSearch && matchClass && matchTeam;
    });
  }, [students, isLeaderView, leaderTeamId, search, selectedClass, selectedTeam, selectedSummitId]);

  // Load existing statuses ONLY when a summit is selected
  useEffect(() => {
    if (!selectedSummitId) {
      setStatusMap({});
      return;
    }

    const initial = {};
    (students || []).forEach(st => {
      const rec = (attendance || []).find(
        a => a.summitId === selectedSummitId && a.session === selectedSession && a.studentId === st.id
      );
      // If record exists, load it; otherwise leave as null/unmarked (do not fake default to Present)
      initial[st.id] = rec ? rec.status : null;
    });
    setStatusMap(initial);
  }, [selectedSummitId, selectedSession, attendance, students]);

  // Real-time status toggle (Present, Absent, Late, Excused)
  const handleStatusChange = (studentId, status) => {
    if (!selectedSummitId) return;
    if (isLeaderView && isSessionLocked && currentUser?.role !== 'admin') return;

    setStatusMap(prev => ({ ...prev, [studentId]: status }));
    recordAttendance(
      selectedSummitId,
      selectedSession,
      studentId,
      status,
      currentUser?.username || `${currentUser?.role}:${currentUser?.name}`
    );
  };

  const handleMarkAllPresent = () => {
    if (!selectedSummitId) return;
    if (isLeaderView && isSessionLocked && currentUser?.role !== 'admin') return;

    const updated = {};
    targetStudents.forEach(st => {
      updated[st.id] = 'Present';
    });
    setStatusMap(prev => ({ ...prev, ...updated }));
    bulkRecordAttendance(
      selectedSummitId,
      selectedSession,
      updated,
      currentUser?.username || `${currentUser?.role}:${currentUser?.name}`
    );
    setToastMsg(`Marked all ${targetStudents.length} students as Present for ${selectedSession}!`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleMarkAllAbsent = () => {
    if (!selectedSummitId) return;
    if (isLeaderView && isSessionLocked && currentUser?.role !== 'admin') return;

    const updated = {};
    targetStudents.forEach(st => {
      updated[st.id] = 'Absent';
    });
    setStatusMap(prev => ({ ...prev, ...updated }));
    bulkRecordAttendance(
      selectedSummitId,
      selectedSession,
      updated,
      currentUser?.username || `${currentUser?.role}:${currentUser?.name}`
    );
    setToastMsg(`Marked all ${targetStudents.length} students as Absent for ${selectedSession}!`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleSaveAttendance = () => {
    if (!selectedSummitId) return;
    if (isLeaderView && isSessionLocked && currentUser?.role !== 'admin') return;

    // Filter out null entries
    const toSave = {};
    Object.keys(statusMap).forEach(sId => {
      if (statusMap[sId]) {
        toSave[sId] = statusMap[sId];
      }
    });

    bulkRecordAttendance(
      selectedSummitId,
      selectedSession,
      toSave,
      currentUser?.username || `${currentUser?.role}:${currentUser?.name}`
    );
    setToastMsg(`Saved ${selectedSession} session attendance successfully!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleToggleLock = () => {
    if (!selectedSummitId) return;
    toggleAttendanceSessionLock(selectedSummitId, selectedSession, !isSessionLocked, currentUser?.username);
  };

  const handleSendLowAttendanceAlert = (student) => {
    sendNotification(
      student.id,
      'Low Attendance Warning',
      `Your cumulative summit attendance is currently below ${settings.lowAttendanceThreshold}%. Please meet your faculty advisor.`,
      'alert'
    );
    setToastMsg(`Sent low attendance alert to ${student.name}`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0E7C86]" />
            <span>{t.attendance.title}</span>
            {selectedSummitId && (
              isSessionLocked ? (
                <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Open for marking
                </span>
              )
            )}
          </h3>
          <p className="text-xs text-slate-500">
            Every summit tracks 3 mandatory sessions: <strong>START, MID, and END</strong>.
          </p>
        </div>

        {/* Action Controls - Only shown when a summit is selected */}
        {selectedSummitId && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {currentUser?.role === 'admin' && (
              <button
                onClick={handleToggleLock}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 ${
                  isSessionLocked
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950'
                }`}
              >
                {isSessionLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isSessionLocked ? t.attendance.unlockSession : t.attendance.lockSession}</span>
              </button>
            )}

            {(!isSessionLocked || currentUser?.role === 'admin') && (
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
                  title="Mark all filtered students as Present"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>All Present</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkAllAbsent}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
                  title="Mark all filtered students as Absent"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>All Absent</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="col-span-2 sm:col-span-1 min-h-[44px] px-5 py-2 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] dark:bg-[#0E7C86] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.common.save}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {selectedSummitId && isLeaderView && isSessionLocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>{t.attendance.sessionLockedNotice}</span>
        </div>
      )}

      {/* Select Summit & Select Session Section */}
      <div className="bg-white dark:bg-[#0F1B2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0E7C86]" />
              <span>Select Summit Gathering:</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <select
              value={selectedSummitId}
              onChange={(e) => setSelectedSummitId(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs font-semibold transition ${
                !selectedSummitId
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-white ring-2 ring-amber-300/40'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white'
              }`}
            >
              <option value="">-- Please Select a Summit Gathering --</option>
              {availableSummits.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.date || 'Scheduled'} - {s.venue || 'Venue'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0E7C86]" />
              <span>Select Attendance Session:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['START', 'MID', 'END'].map(sess => (
                <button
                  key={sess}
                  type="button"
                  disabled={!selectedSummitId}
                  onClick={() => setSelectedSession(sess)}
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98 ${
                    !selectedSummitId
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                      : selectedSession === sess
                        ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{sess}</span>
                  <span className="hidden sm:inline">Session</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Summit Details Pill */}
        {currentSummit && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="font-bold text-teal-900 dark:text-teal-200">{currentSummit.name}</span>
            </div>
            <div className="flex items-center gap-3 text-teal-800 dark:text-teal-300 font-medium">
              <span>Date: <strong>{currentSummit.date || 'TBD'}</strong></span>
              <span>•</span>
              <span>Venue: <strong>{currentSummit.venue || 'Campus'}</strong></span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px] uppercase">
                {selectedSession} Session
              </span>
            </div>
          </div>
        )}
      </div>

      {/* WARNING BANNER: Shown when NO Summit is Selected */}
      {!selectedSummitId && (
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border-2 border-dashed border-amber-300 dark:border-amber-800 text-center space-y-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-xs animate-bounce">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base sm:text-lg text-amber-950 dark:text-amber-200">
              Please Select a Summit Gathering
            </h4>
            <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-300/80 max-w-md mx-auto">
              Attendance records and session markings are strictly organized by summit. Select a scheduled gathering from the dropdown above to view or mark attendance.
            </p>
          </div>
          {availableSummits.length === 0 && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold pt-2">
              No active summits found. Please create or schedule a summit first in <strong>Summits &amp; Sessions</strong>.
            </p>
          )}
        </div>
      )}

      {/* ATTENDANCE MARKING CONSOLE: Shown ONLY when Summit IS Selected */}
      {selectedSummitId && (
        <>
          {/* Filter and Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student name, CIC or chest no..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">All Academic Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {!isLeaderView && (
              <div>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="all">All House Teams</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* MOBILE ATTENDANCE FEED (Screens < 768px): Native Touch Toggles */}
          <div className="md:hidden space-y-3">
            {targetStudents.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs">
                No students match your search or filter.
              </div>
            ) : (
              targetStudents.map((student, idx) => {
                const team = teams.find(t => t.id === student.teamId);
                const cl = classes.find(c => c.id === student.classId);
                const attData = studentAttendanceMap[student.id];
                const summitAttData = attData?.summitStats?.[selectedSummitId];
                const hasRecordedInSummit = (summitAttData?.total || 0) > 0;
                const summitAttPct = hasRecordedInSummit ? summitAttData.percentage : 0;
                const overallAttPct = attData?.percentage || 0;
                const isLow = attData?.isLowAttendance && (attData?.totalSessions || 0) > 0;
                const currentStatus = statusMap[student.id];

                return (
                  <div
                    key={student.id}
                    className="p-3.5 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition"
                  >
                    {/* Header: Index + Avatar + Name + CIC + Class & House */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: team?.color || '#0E7C86' }}
                        >
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {student.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">CIC: {student.cicNo}</span>
                            <span>•</span>
                            <span>{cl?.name || student.classId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: team?.color || '#0E7C86' }}
                        >
                          {team?.name || 'House'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          currentStatus
                            ? currentStatus === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : currentStatus === 'Absent'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {currentStatus || 'Not Marked'}
                        </span>
                      </div>
                    </div>

                    {/* Status Toggles Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Mark for {selectedSession} Session:</span>
                        <span className="font-mono text-[#0E7C86]">
                          Summit: {hasRecordedInSummit ? `${summitAttPct.toFixed(0)}%` : '—'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-black transition flex flex-col items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 dark:ring-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <span className="text-sm leading-none">P</span>
                          <span className="text-[9px] font-medium leading-tight">Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Absent')}
                          className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-black transition flex flex-col items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white ring-2 ring-rose-300 dark:ring-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <span className="text-sm leading-none">A</span>
                          <span className="text-[9px] font-medium leading-tight">Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Late')}
                          className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-black transition flex flex-col items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                            currentStatus === 'Late'
                              ? 'bg-amber-600 text-white ring-2 ring-amber-300 dark:ring-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <span className="text-sm leading-none">L</span>
                          <span className="text-[9px] font-medium leading-tight">Late</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Excused')}
                          className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-black transition flex flex-col items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                            currentStatus === 'Excused'
                              ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <span className="text-sm leading-none">E</span>
                          <span className="text-[9px] font-medium leading-tight">Excused</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP ATTENDANCE TABLE (Screens >= 768px) */}
          <div className="hidden md:block bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left text-xs min-w-[620px] sm:min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 sm:px-4 sticky left-0 bg-slate-50 dark:bg-[#0B1522] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">Student Participant (Name &amp; CIC No)</th>
                    <th className="py-2.5 px-3">Class &amp; House Team</th>
                    <th className="py-2.5 px-3 text-center min-w-[210px]">Status for {selectedSession}</th>
                    <th className="py-2.5 px-3 text-center">Summit Att %</th>
                    <th className="py-2.5 px-3 text-center">Overall Att %</th>
                    <th className="py-2.5 px-3 text-right">Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {targetStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                        No students match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    targetStudents.map((student, idx) => {
                      const team = teams.find(t => t.id === student.teamId);
                      const cl = classes.find(c => c.id === student.classId);
                      const attData = studentAttendanceMap[student.id];
                      const summitAttData = attData?.summitStats?.[selectedSummitId];
                      const hasRecordedInSummit = (summitAttData?.total || 0) > 0;
                      const summitAttPct = hasRecordedInSummit ? summitAttData.percentage : 0;
                      const overallAttPct = (attData?.totalSessions || 0) > 0 ? attData.percentage : 0;
                      const isLow = attData?.isLowAttendance && (attData?.totalSessions || 0) > 0;
                      const currentStatus = statusMap[student.id];

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 sticky left-0 bg-white dark:bg-[#0F1B2B] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                                style={{ backgroundColor: team?.color || '#0E7C86' }}
                              >
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {student.name}
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                                  CIC: {student.cicNo}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs" style={{ backgroundColor: team?.color }}>
                                {team?.name || 'House'}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                • {cl?.name || student.classId}
                              </span>
                            </div>
                          </td>

                          {/* Status Toggles: Present, Absent, Late, Excused - 40px touch targets */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Present')}
                                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl text-xs font-black transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                                  currentStatus === 'Present'
                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 dark:ring-emerald-800 scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                                title="Mark Present (P)"
                              >
                                P
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Absent')}
                                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl text-xs font-black transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                                  currentStatus === 'Absent'
                                    ? 'bg-rose-600 text-white ring-2 ring-rose-300 dark:ring-rose-800 scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                                title="Mark Absent (A)"
                              >
                                A
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Late')}
                                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl text-xs font-black transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                                  currentStatus === 'Late'
                                    ? 'bg-amber-600 text-white ring-2 ring-amber-300 dark:ring-amber-800 scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                                title="Mark Late (L)"
                              >
                                L
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Excused')}
                                className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl text-xs font-black transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                                  currentStatus === 'Excused'
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-800 scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                                title="Mark Excused (E)"
                              >
                                E
                              </button>
                            </div>
                            {!currentStatus && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">Not Marked</div>
                            )}
                          </td>

                          <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                            {hasRecordedInSummit ? `${summitAttPct.toFixed(0)}%` : '—'}
                          </td>

                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                              isLow ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {(attData?.totalSessions || 0) > 0 ? `${overallAttPct.toFixed(0)}%` : '—'}
                            </span>
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            {isLow ? (
                              <button
                                onClick={() => handleSendLowAttendanceAlert(student)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900 transition"
                                title="Send Low Attendance Alert Notification"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
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
    </div>
  );
};
