import React, { useState, useMemo } from 'react';
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
  CheckCheck
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

  const [selectedSummitId, setSelectedSummitId] = useState(summits[0]?.id || '');
  const [selectedSession, setSelectedSession] = useState('START'); // 'START', 'MID', 'END'
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  // Local statuses being marked before save: { [studentId]: 'Present' | 'Absent' | 'Late' | 'Excused' }
  const [statusMap, setStatusMap] = useState({});

  // Check if current session in current summit is locked
  const currentSummit = summits.find(s => s.id === selectedSummitId);
  const sessionRecords = attendance.filter(a => a.summitId === selectedSummitId && a.session === selectedSession);
  const isSessionLocked = sessionRecords.some(a => a.locked);

  // Target students list (If leader, only own team)
  const targetStudents = useMemo(() => {
    return students.filter(s => {
      if (isLeaderView && leaderTeamId && s.teamId !== leaderTeamId) return false;
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.cicNo.toLowerCase().includes(search.toLowerCase()) ||
        (s.chestNo && s.chestNo.toLowerCase().includes(search.toLowerCase()));
      const matchClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchTeam = selectedTeam === 'all' || s.teamId === selectedTeam;
      return matchSearch && matchClass && matchTeam;
    });
  }, [students, isLeaderView, leaderTeamId, search, selectedClass, selectedTeam]);

  // Load existing statuses for this summit & session
  React.useEffect(() => {
    const initial = {};
    students.forEach(st => {
      const rec = attendance.find(a => a.summitId === selectedSummitId && a.session === selectedSession && a.studentId === st.id);
      initial[st.id] = rec ? rec.status : 'Present';
    });
    setStatusMap(initial);
  }, [selectedSummitId, selectedSession, attendance, students]);

  // Real-time status toggle (Present, Absent, Late, Excused)
  const handleStatusChange = (studentId, status) => {
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
    setToastMsg(`Marked all ${targetStudents.length} students as Present!`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleMarkAllAbsent = () => {
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
    setToastMsg(`Marked all ${targetStudents.length} students as Absent!`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleSaveAttendance = () => {
    if (isLeaderView && isSessionLocked && currentUser?.role !== 'admin') return;
    bulkRecordAttendance(
      selectedSummitId,
      selectedSession,
      statusMap,
      currentUser?.username || `${currentUser?.role}:${currentUser?.name}`
    );
    setToastMsg(`Saved ${selectedSession} session attendance successfully!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleToggleLock = () => {
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
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0E7C86]" />
            <span>{t.attendance.title}</span>
            {isSessionLocked ? (
              <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Open for marking
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">
            Every summit tracks 3 mandatory sessions: <strong>START, MID, and END</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleToggleLock}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isSessionLocked
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950'
              }`}
            >
              {isSessionLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isSessionLocked ? t.attendance.unlockSession : t.attendance.lockSession}</span>
            </button>
          )}

          {(!isSessionLocked || currentUser?.role === 'admin') && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1 shadow-xs"
                title="Mark all filtered students as Present"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All Present</span>
              </button>

              <button
                type="button"
                onClick={handleMarkAllAbsent}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1 shadow-xs"
                title="Mark all filtered students as Absent"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Mark All Absent</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 rounded-lg bg-[#0F2A4A] dark:bg-[#0E7C86] text-white text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.common.save}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {isLeaderView && isSessionLocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>{t.attendance.sessionLockedNotice}</span>
        </div>
      )}

      {/* Select Summit & Select Session Pills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#0F1B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Summit Gathering:
          </label>
          <select
            value={selectedSummitId}
            onChange={(e) => setSelectedSummitId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            {summits.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.date} - {s.venue})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Attendance Session:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['START', 'MID', 'END'].map(sess => (
              <button
                key={sess}
                onClick={() => setSelectedSession(sess)}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedSession === sess
                    ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{sess} Session</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or CIC..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
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
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="all">All House Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 sm:px-4">Student Participant (Name &amp; CIC No)</th>
                <th className="py-2.5 px-3">Class &amp; House Team</th>
                <th className="py-2.5 px-3 text-center min-w-[150px]">Status for {selectedSession}</th>
                <th className="py-2.5 px-3 text-center">Summit Att %</th>
                <th className="py-2.5 px-3 text-center">Overall Att %</th>
                <th className="py-2.5 px-3 text-right">Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {targetStudents.map((student, idx) => {
                const team = teams.find(t => t.id === student.teamId);
                const cl = classes.find(c => c.id === student.classId);
                const attData = studentAttendanceMap[student.id];
                const summitAttPct = attData?.summitStats?.[selectedSummitId]?.percentage || 0;
                const overallAttPct = attData?.percentage || 0;
                const isLow = attData?.isLowAttendance;
                const currentStatus = statusMap[student.id] || 'Present';

                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
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

                    {/* Status Toggles: Present, Absent, Late, Excused */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer ${
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
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer ${
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
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer ${
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
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer ${
                            currentStatus === 'Excused'
                              ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-800 scale-105'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          title="Mark Excused (E)"
                        >
                          E
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {summitAttPct.toFixed(0)}%
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        isLow ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {overallAttPct.toFixed(0)}%
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
                        <span className="text-[11px] text-slate-400">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
