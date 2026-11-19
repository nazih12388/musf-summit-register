import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  INITIAL_SECTIONS,
  INITIAL_CLASSES,
  INITIAL_TEAMS,
  INITIAL_FIELDS,
  INITIAL_PROGRAM_LIBRARY,
  INITIAL_SUMMITS,
  INITIAL_CATEGORIES,
  INITIAL_ADMINS,
  INITIAL_JUDGES,
  INITIAL_STUDENTS,
  INITIAL_PROGRAMS,
  INITIAL_ENTRIES,
  INITIAL_MARKS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_CERTIFICATES,
  HASHED_PASSWORDS
} from '../services/initialData';
import { STORAGE_KEYS, COLLECTIONS } from '../services/firebase';
import {
  saveDoc,
  removeDoc,
  batchSaveDocs,
  syncScreenData,
  setCurrentScreen,
  subscribeSyncStatus,
  getSyncStatus,
  getCloudUsage,
  retryPendingWrites
} from '../services/firestoreService';
import { migrateLocalDataToCloud } from '../services/migrationService';
import { hashPassword } from '../utils/crypto';
import { getSummitRunningInfo, formatMonthLabel, computeComprehensiveReport } from '../utils/reportCalculations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Safe helper to parse stored arrays with fallback and seamless migration from legacy keys
  const safeParseArray = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      // Check legacy v5 key before falling back to initial defaults so entered data is NEVER lost
      const legacyKeyV5 = key.replace('_v6', '_v5');
      const rawV5 = localStorage.getItem(legacyKeyV5);
      if (rawV5 !== null) {
        try {
          const parsedV5 = JSON.parse(rawV5);
          if (Array.isArray(parsedV5) && parsedV5.length > 0) {
            localStorage.setItem(key, rawV5);
            return parsedV5;
          }
        } catch {}
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  // One-time cleanup of legacy demo caches
  useEffect(() => {
    try {
      const oldKeys = [
        
        'musf_summit_programs_v4',
        'musf_summit_summits_v4',
        'musf_summit_students_v4',
        'musf_summit_archived_students_v4',
        'musf_summit_entries_v4',
        'musf_summit_marks_v4',
        'musf_summit_attendance_v4',
        'musf_summit_certificates_v4',
        'musf_summit_teams_v4',
        'musf_summit_programs_v3',
        'musf_summit_summits_v3',
        'musf_summit_students_v3',
        'musf_summit_archived_students_v3',
        'musf_summit_entries_v3',
        'musf_summit_marks_v3',
        'musf_summit_attendance_v3',
        'musf_summit_certificates_v3',
        'musf_summit_teams_v3',
        'musf_summit_students_v2',
        'musf_summit_archived_students_v2',
        'musf_summit_entries_v2',
        'musf_summit_marks_v2',
        'musf_summit_attendance_v2',
        'musf_summit_certificates_v2',
        'musf_summit_teams_v2',
        'musf_summit_current_user_v2'
      ];
      oldKeys.forEach(k => localStorage.removeItem(k));

      // Clean fake notifications, notices & audit logs from storage
      try {
        const rawNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
        if (Array.isArray(rawNotifs)) {
          const cleaned = rawNotifs.filter(n => n.id !== 'notif-1' && n.id !== 'notif-2' && !n.title?.includes('October Summit 1 Calligraphy'));
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(cleaned));
        }
      } catch {}
      try {
        const rawNotices = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTICES) || '[]');
        if (Array.isArray(rawNotices)) {
          const cleaned = rawNotices.filter(n => n.id !== 'n1' && n.id !== 'n2');
          localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(cleaned));
        }
      } catch {}
      try {
        const rawAudit = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
        if (Array.isArray(rawAudit)) {
          const cleaned = rawAudit.filter(a => a.id !== 'al-1' && a.id !== 'al-2' && a.id !== 'al-3');
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(cleaned));
        }
      } catch {}
    } catch {}
  }, []);

  // Load State from LocalStorage or seed defaults
  const [sections, setSections] = useState(() => safeParseArray(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS));
  const [classes, setClasses] = useState(() => safeParseArray(STORAGE_KEYS.CLASSES, INITIAL_CLASSES));
  const [teams, setTeams] = useState(() => safeParseArray(STORAGE_KEYS.TEAMS, INITIAL_TEAMS));
  const [fields, setFields] = useState(() => safeParseArray(STORAGE_KEYS.FIELDS, INITIAL_FIELDS));
  const [programLibrary, setProgramLibrary] = useState(() => safeParseArray(STORAGE_KEYS.PROGRAM_LIBRARY, INITIAL_PROGRAM_LIBRARY));
  const [summits, setSummits] = useState(() => safeParseArray(STORAGE_KEYS.SUMMITS, INITIAL_SUMMITS));
  const [categories, setCategories] = useState(() => safeParseArray(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [judges, setJudges] = useState(() => safeParseArray(STORAGE_KEYS.JUDGES, INITIAL_JUDGES));
  const [students, setStudents] = useState(() => safeParseArray(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS));

  const [archivedStudents, setArchivedStudents] = useState(() => safeParseArray(STORAGE_KEYS.ARCHIVED_STUDENTS, []));
  const [programs, setPrograms] = useState(() => safeParseArray(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS));
  const [entries, setEntries] = useState(() => safeParseArray(STORAGE_KEYS.ENTRIES, INITIAL_ENTRIES));
  const [marks, setMarks] = useState(() => safeParseArray(STORAGE_KEYS.MARKS, INITIAL_MARKS));
  const [attendance, setAttendance] = useState(() => safeParseArray(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE));
  const [notices, setNotices] = useState(() => safeParseArray(STORAGE_KEYS.NOTICES, INITIAL_NOTICES).filter(n => n.id !== 'n1' && n.id !== 'n2'));
  const [notifications, setNotifications] = useState(() => safeParseArray(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS).filter(n => n.id !== 'notif-1' && n.id !== 'notif-2' && !n.title?.includes('October Summit 1 Calligraphy')));
  const [auditLogs, setAuditLogs] = useState(() => safeParseArray(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS).filter(a => a.id !== 'al-1' && a.id !== 'al-2' && a.id !== 'al-3'));

  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return s ? JSON.parse(s) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [reportHistory, setReportHistory] = useState(() => {
    try {
      const s = localStorage.getItem('musf_report_history');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [certificates, setCertificates] = useState(() => safeParseArray(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES));

  // User state for role-scoped realtime subscriptions
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  // Active Screen tracking for lazy, screen-scoped Firestore subscriptions (keeps listeners < 10)
  const [activeScreen, setActiveScreen] = useState('dashboard');

  // Realtime Screen-Scoped Sync (0 mount writes, < 100 reads on dashboard, < 30 on student login)
  useEffect(() => {
    const role = activeUser?.role || 'public';
    const currentSummitId = summits[0]?.id;
    setCurrentScreen(activeScreen);

    const unsub = syncScreenData(activeScreen, role, activeUser, currentSummitId, {
      setStudents: (items) => { if (items) setStudents(items); },
      setClasses: (items) => { if (items) setClasses(items); },
      setTeams: (items) => { if (items) setTeams(items); },
      setSections: (items) => { if (items) setSections(items); },
      setFields: (items) => { if (items) setFields(items); },
      setCategories: (items) => {
        if (Array.isArray(items) && items.length > 0) {
          setCategories(items.map(c => c.name || c.id || c));
        }
      },
      setSummits: (items) => {
        if (Array.isArray(items)) {
          const cleaned = items.filter(s => !s.id?.startsWith('summit_jun_') && !s.id?.startsWith('summit_jul_') && !s.id?.startsWith('summit_demo_'));
          if (cleaned.length > 0) setSummits(cleaned);
        }
      },
      setPrograms: (items) => {
        if (Array.isArray(items)) {
          const cleaned = items.filter(p => !p.id?.startsWith('p_oct') && !p.id?.startsWith('p_demo_'));
          if (cleaned.length > 0) setPrograms(cleaned);
        }
      },
      setProgramLibrary: (items) => {
        if (Array.isArray(items) && items.length > 0) setProgramLibrary(items);
      },
      setEntries: (items) => { if (items) setEntries(items); },
      setMarks: (items) => { if (items) setMarks(items); },
      setAttendance: (items) => { if (items) setAttendance(items); },
      setJudges: (items) => {
        if (Array.isArray(items) && items.length > 0) setJudges(items);
      },
      setSettingsDoc: (docs) => {
        if (Array.isArray(docs) && docs.length > 0) {
          const general = docs.find(d => d.id === 'general') || docs[0];
          if (general) {
            const { id, updatedAt, ...rest } = general;
            setSettings(prev => ({ ...prev, ...rest }));
          }
        }
      },
      setNotices: (items) => {
        if (Array.isArray(items)) setNotices(items.filter(n => n.id !== 'n1' && n.id !== 'n2'));
      },
      setNotifications: (items) => { if (items) setNotifications(items); },
      setAuditLogs: (items) => { if (items) setAuditLogs(items); },
      setCertificates: (items) => { if (items) setCertificates(items); },
      setReportHistory: (items) => { if (items) setReportHistory(items); }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [activeScreen, activeUser?.id, activeUser?.role, activeUser?.teamId, summits[0]?.id]);

  // Backward compatibility: Migrate any legacy cached password hashes & two leaders
  useEffect(() => {
    // 1. Migrate teams to have leader1Id and leader2Id
    setTeams(prev => {
      let changed = false;
      const updated = prev.map(t => {
        let tChanged = false;
        let newT = { ...t };
        if (!newT.leader1Id && newT.leaderId) {
          newT.leader1Id = newT.leaderId;
          tChanged = true;
        }
        if (!newT.leader2Id) {
          const initT = INITIAL_TEAMS.find(x => x.id === t.id);
          if (initT?.leader2Id) {
            newT.leader2Id = initT.leader2Id;
            tChanged = true;
          }
        }
        if (tChanged) changed = true;
        return newT;
      });
      return changed ? updated : prev;
    });

    // 2. Migrate students
    setStudents(prev => {
      let changed = false;
      const updated = prev.map(s => {
        let sChanged = false;
        let newS = { ...s };
        const initS = INITIAL_STUDENTS.find(x => x.id === s.id);
        if (initS?.isLeader && !newS.isLeader) {
          newS.isLeader = true;
          newS.leaderRole = initS.leaderRole;
          newS.leaderUsername = initS.leaderUsername;
          newS.leaderPasswordHash = initS.leaderPasswordHash;
          newS.leaderSectionRestriction = initS.leaderSectionRestriction || 'all';
          sChanged = true;
        } else if (newS.isLeader && !newS.leaderRole) {
          newS.leaderRole = initS?.leaderRole || 'leader1';
          newS.leaderSectionRestriction = initS?.leaderSectionRestriction || 'all';
          sChanged = true;
        }
        if (s.passwordHash === '667967dc7bd09d4b714126738d3fb6a7e5fab3adcd33f10191ca291548934c74') {
          newS.passwordHash = HASHED_PASSWORDS.student;
          sChanged = true;
        }
        if (s.leaderPasswordHash === '4a746b13d22c5d6574e20577705215f0537a6da3165d495d653bb3a0892b6878') {
          newS.leaderPasswordHash = HASHED_PASSWORDS.leader;
          sChanged = true;
        }
        if (sChanged) changed = true;
        return newS;
      });
      return changed ? updated : prev;
    });

    // 3. Migrate entries to have nominatedBy
    setEntries(prev => {
      let changed = false;
      const updated = prev.map(e => {
        if (!e.nominatedBy) {
          const initE = INITIAL_ENTRIES.find(x => x.id === e.id);
          changed = true;
          return {
            ...e,
            nominatedBy: initE?.nominatedBy || 'Nihal Rahman (Leader 1)',
            nominatedByUsername: initE?.nominatedByUsername || 'leader1',
            nominatedAt: initE?.nominatedAt || '2026-09-10T10:00:00Z'
          };
        }
        return e;
      });
      return changed ? updated : prev;
    });

    setJudges(prev => {
      let changed = false;
      const updated = prev.map(j => {
        if (j.passwordHash === '311d59375f6c04a45d7a8d7a204781052188cce7c4e461936b854695c95386a4') {
          changed = true;
          return { ...j, passwordHash: HASHED_PASSWORDS.judge };
        }
        return j;
      });
      return changed ? updated : prev;
    });

    // 4. Remove any demo dummy planned summits
    setSummits(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.filter(s => {
        const isDemo = s.id?.startsWith('summit_jun_') ||
          s.id?.startsWith('summit_jul_') ||
          s.id?.startsWith('summit_aug_') ||
          s.id?.startsWith('summit_sep_') ||
          s.id?.startsWith('summit_oct_') ||
          s.id?.startsWith('summit_nov_') ||
          s.id?.startsWith('summit_dec_') ||
          s.id?.startsWith('summit_jan_') ||
          s.id?.startsWith('summit_feb_') ||
          s.id?.startsWith('summit_mar_') ||
          s.id?.startsWith('summit_apr_') ||
          s.id?.startsWith('summit_may_');
        return !isDemo;
      });
    });
  }, []);

  
  // 1-Click Multi-Device Backup & Direct Sync Tools
  const exportFullAppData = () => {
    const data = {
      app: 'MUSF Summit Register',
      college: 'Majlis Umariyya Wafy College',
      version: '6.0',
      exportedAt: new Date().toISOString(),
      summits,
      programs,
      programLibrary,
      students,
      entries,
      marks,
      attendance,
      judges,
      teams,
      classes,
      settings,
      notices,
      certificates
    };
    return JSON.stringify(data, null, 2);
  };

  const importFullAppData = (jsonString) => {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
      if (Array.isArray(data.summits)) setSummits(data.summits);
      if (Array.isArray(data.programs)) setPrograms(data.programs);
      if (Array.isArray(data.programLibrary)) setProgramLibrary(data.programLibrary);
      if (Array.isArray(data.students)) setStudents(data.students);
      if (Array.isArray(data.entries)) setEntries(data.entries);
      if (Array.isArray(data.marks)) setMarks(data.marks);
      if (Array.isArray(data.attendance)) setAttendance(data.attendance);
      if (Array.isArray(data.judges)) setJudges(data.judges);
      if (Array.isArray(data.teams)) setTeams(data.teams);
      if (Array.isArray(data.classes)) setClasses(data.classes);
      if (data.settings && typeof data.settings === 'object') setSettings(prev => ({ ...prev, ...data.settings }));
      if (Array.isArray(data.notices)) setNotices(data.notices);
      if (Array.isArray(data.certificates)) setCertificates(data.certificates);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      throw e;
    }
  };

  const [cloudSyncStatus, setCloudSyncStatus] = useState(() => {
    try {
      return typeof getSyncStatus === 'function' ? getSyncStatus() : { state: 'synced', isOffline: false, pendingWritesCount: 0 };
    } catch {
      return { state: 'synced', isOffline: false, pendingWritesCount: 0 };
    }
  });
  useEffect(() => {
    const unsub = subscribeSyncStatus((status) => {
      if (status) setCloudSyncStatus(status);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const manualCloudSync = async () => {
    try {
      await retryPendingWrites();
      await migrateLocalDataToCloud();
      return true;
    } catch (e) {
      console.error('Manual sync failed:', e);
      return false;
    }
  };

  const resetAllDataToDefault = () => {
    Object.values(STORAGE_KEYS).forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
    try { localStorage.removeItem('musf_admin_hash'); } catch {}
    try { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); } catch {}
    window.location.reload();
  };

  // Lookup Maps
  const classesMap = useMemo(() => Object.fromEntries(classes.map(c => [c.id, c])), [classes]);
  const sectionsMap = useMemo(() => Object.fromEntries(sections.map(s => [s.id, s])), [sections]);
  const fieldsMap = useMemo(() => Object.fromEntries(fields.map(f => [f.id, f])), [fields]);
  const teamsMap = useMemo(() => Object.fromEntries(teams.map(t => [t.id, t])), [teams]);
  const summitsMap = useMemo(() => Object.fromEntries(summits.map(s => [s.id, s])), [summits]);

  // Audit Logging
  const addAuditLog = (actor, action, details) => {
    const newLog = {
      id: 'al-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      actor: actor || 'system',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    saveDoc(COLLECTIONS.AUDIT_LOGS, newLog.id, newLog);
    setAuditLogs(prev => [newLog, ...prev.slice(0, 499)]);
  };

  // Notification Dispatcher
  const sendNotification = (userId, title, message, type = 'general') => {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    saveDoc(COLLECTIONS.NOTIFICATIONS, newNotif.id, newNotif);
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (notifId) => {
    saveDoc(COLLECTIONS.NOTIFICATIONS, notifId, { read: true });
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = (userId) => {
    setNotifications(prev => prev.map(n => {
      if (n.userId === userId || n.userId === 'all') {
        return { ...n, read: true };
      }
      return n;
    }));
  };

  const deleteNotification = (notifId, actor = 'admin') => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    addAuditLog(actor, 'DELETE_NOTIFICATION', `Deleted notification ID: ${notifId}`);
  };

  const clearAllNotifications = (userId = null, actor = 'admin') => {
    if (userId && userId !== 'all') {
      setNotifications(prev => prev.filter(n => n.userId !== userId && n.userId !== 'all'));
    } else {
      setNotifications([]);
    }
    addAuditLog(actor, 'CLEAR_NOTIFICATIONS', `Cleared ${userId ? `notifications for ${userId}` : 'all notifications'}`);
  };

  const deleteAuditLog = (logId) => {
    setAuditLogs(prev => prev.filter(l => l.id !== logId));
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  // Grade Calculator
  const calculateGrade = (finalMark) => {
    if (finalMark == null || isNaN(finalMark)) return '-';
    const ranges = settings.gradeRanges || INITIAL_SETTINGS.gradeRanges;
    for (const r of ranges) {
      if (finalMark >= r.min && finalMark <= r.max) {
        return r.grade;
      }
    }
    return '-';
  };

  // Attendance rule evaluator
  const isConsideredPresent = (status) => {
    if (status === 'Present') return true;
    if (status === 'Late' && settings.lateCountsAsPresent) return true;
    if (status === 'Excused' && settings.excusedCountsAsPresent) return true;
    return false;
  };

  // ATTENDANCE STATS PER STUDENT
  const studentAttendanceMap = useMemo(() => {
    const map = {};
    students.forEach(st => {
      let totalSessions = 0;
      let presentSessions = 0;
      const summitStats = {};

      summits.forEach(sm => {
        summitStats[sm.id] = { total: 0, present: 0, percentage: 0 };
      });

      attendance.forEach(rec => {
        if (rec.studentId === st.id) {
          totalSessions++;
          if (isConsideredPresent(rec.status)) {
            presentSessions++;
          }
          if (summitStats[rec.summitId]) {
            summitStats[rec.summitId].total++;
            if (isConsideredPresent(rec.status)) {
              summitStats[rec.summitId].present++;
            }
          }
        }
      });

      Object.keys(summitStats).forEach(sId => {
        const item = summitStats[sId];
        item.percentage = item.total > 0 ? (item.present / item.total) * 100 : 0;
      });

      const percentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;
      const isLowAttendance = percentage < (settings.lowAttendanceThreshold || 75);

      map[st.id] = {
        totalSessions,
        presentSessions,
        percentage,
        isLowAttendance,
        summitStats
      };
    });

    return map;
  }, [students, attendance, summits, settings.lateCountsAsPresent, settings.excusedCountsAsPresent, settings.lowAttendanceThreshold]);

  // PROGRAM RESULTS MAP
  // Evaluates every program's entries with multi-judge average or approved leader mark
  const programResultsMap = useMemo(() => {
    const map = {};

    programs.forEach(program => {
      const progEntries = entries.filter(e => e.programId === program.id);
      if (progEntries.length === 0) {
        map[program.id] = [];
        return;
      }

      const evaluatedList = progEntries.map(entry => {
        const student = entry.studentId ? students.find(s => s.id === entry.studentId) : null;
        const team = teams.find(t => t.id === entry.teamId);

        let participantName = '';
        if (entry.groupName) {
          participantName = entry.groupName;
        } else if (student) {
          participantName = student.name;
        } else {
          participantName = `Chest #${entry.chestNo}`;
        }

        const entryMarks = marks.filter(m =>
          m.programId === program.id &&
          (m.entryId === entry.id || (entry.studentId && m.studentId === entry.studentId)) &&
          (m.status === 'approved' || m.status === 'edited_by_admin')
        );

        let finalMark = null;
        let judgeBreakdown = [];

        if (entryMarks.length > 0) {
          if (program.allowLeaderMarkEntry) {
            const leaderMark = entryMarks.find(m => m.sourceRole === 'leader');
            if (leaderMark) {
              finalMark = leaderMark.marks;
              judgeBreakdown.push({
                judgeId: leaderMark.enteredBy,
                judgeName: leaderMark.enteredByName || 'Leader',
                mark: leaderMark.marks
              });
            } else {
              finalMark = entryMarks[0].marks;
            }
          } else {
            const sum = entryMarks.reduce((acc, curr) => acc + curr.marks, 0);
            finalMark = sum / entryMarks.length;
            judgeBreakdown = entryMarks.map(m => ({
              judgeId: m.enteredBy,
              judgeName: m.enteredByName || 'Judge',
              mark: m.marks
            }));
          }
        }

        const maxMarks = program.maxMarks || 10;
        const percentage = finalMark != null ? (finalMark / maxMarks) * 100 : 0;
        const grade = finalMark != null ? calculateGrade(finalMark) : '-';

        return {
          entryId: entry.id,
          studentId: entry.studentId,
          memberIds: entry.memberIds || [],
          teamId: entry.teamId,
          teamName: team?.name || '-',
          teamColor: team?.color || '#0E7C86',
          participantName,
          chestNo: entry.chestNo,
          finalMark,
          maxMarks,
          percentage,
          grade,
          judgeBreakdown,
          hasMarks: finalMark != null
        };
      });

      // Rank participants who have marks desc
      evaluatedList.sort((a, b) => {
        if (a.finalMark == null && b.finalMark == null) return 0;
        if (a.finalMark == null) return 1;
        if (b.finalMark == null) return -1;
        return b.finalMark - a.finalMark;
      });

      // Compute ranks & positions with ties handling
      evaluatedList.forEach((item, idx) => {
        if (item.finalMark != null) {
          if (idx > 0 && evaluatedList[idx - 1].finalMark === item.finalMark) {
            item.rank = evaluatedList[idx - 1].rank;
            item.position = evaluatedList[idx - 1].position;
          } else {
            item.rank = idx + 1;
            if (item.rank === 1) item.position = '1st Place';
            else if (item.rank === 2) item.position = '2nd Place';
            else if (item.rank === 3) item.position = '3rd Place';
            else item.position = `${item.rank}th Place`;
          }
        } else {
          item.rank = null;
          item.position = '-';
        }
      });

      map[program.id] = evaluatedList;
    });

    return map;
  }, [programs, entries, marks, students, teams, settings.gradeRanges]);

  // STUDENT STANDINGS & RANKINGS (WITH SECTION-WISE RANKS)
  const studentStandings = useMemo(() => {
    const list = students.map(student => {
      let totalMarks = 0;
      let totalMaxMarks = 0;
      let programsAssignedCount = 0;
      let firstPlaces = 0;
      let secondPlaces = 0;
      let thirdPlaces = 0;

      const summitMarks = {};
      summits.forEach(sm => {
        summitMarks[sm.id] = { obtained: 0, max: 0, count: 0, percentage: 0 };
      });

      const monthMarks = {};

      Object.entries(programResultsMap).forEach(([progId, results]) => {
        const prog = programs.find(p => p.id === progId);
        if (prog && prog.status === 'published') {
          results.forEach(res => {
            if (res.studentId === student.id || (res.memberIds && res.memberIds.includes(student.id))) {
              totalMarks += res.finalMark;
              totalMaxMarks += res.maxMarks;
              programsAssignedCount++;

              if (res.rank === 1) firstPlaces++;
              else if (res.rank === 2) secondPlaces++;
              else if (res.rank === 3) thirdPlaces++;

              if (prog.summitId && summitMarks[prog.summitId]) {
                summitMarks[prog.summitId].obtained += res.finalMark;
                summitMarks[prog.summitId].max += res.maxMarks;
                summitMarks[prog.summitId].count++;
              }

              const mKey = prog.date?.slice(0, 7) || '2026-09';
              if (!monthMarks[mKey]) monthMarks[mKey] = { obtained: 0, max: 0, count: 0, percentage: 0 };
              monthMarks[mKey].obtained += res.finalMark;
              monthMarks[mKey].max += res.maxMarks;
              monthMarks[mKey].count++;
            }
          });
        }
      });

      const marksPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

      Object.keys(summitMarks).forEach(sId => {
        const sm = summitMarks[sId];
        sm.percentage = sm.max > 0 ? (sm.obtained / sm.max) * 100 : 0;
      });

      Object.keys(monthMarks).forEach(mKey => {
        const mm = monthMarks[mKey];
        mm.percentage = mm.max > 0 ? (mm.obtained / mm.max) * 100 : 0;
      });

      const team = teams.find(t => t.id === student.teamId);
      const cl = classes.find(c => c.id === student.classId);
      const studentSectionId = cl?.sectionId || student.sectionId || 'thamheediyya';
      const sectionObj = sections.find(s => s.id === studentSectionId);
      const attInfo = studentAttendanceMap[student.id] || { percentage: 0, isLowAttendance: false };

      const ops = settings.enableOverallPerformanceScore
        ? (marksPercentage * ((settings.overallMarksWeight || 80) / 100)) + (attInfo.percentage * ((settings.overallAttendanceWeight || 20) / 100))
        : marksPercentage;

      return {
        ...student,
        sectionId: studentSectionId,
        sectionName: sectionObj?.name || (studentSectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'),
        teamName: team?.name || '-',
        teamColor: team?.color || '#0E7C86',
        className: cl?.name || '-',
        totalMarks,
        totalMaxMarks,
        marksPercentage,
        attendancePercentage: attInfo.percentage,
        isLowAttendance: attInfo.isLowAttendance,
        overallPerformanceScore: ops,
        programsAssignedCount,
        firstPlaces,
        secondPlaces,
        thirdPlaces,
        summitMarks,
        monthMarks
      };
    });

    // Sort desc by score
    list.sort((a, b) => settings.enableOverallPerformanceScore
      ? (b.overallPerformanceScore - a.overallPerformanceScore)
      : (b.totalMarks - a.totalMarks)
    );

    // Compute Overall Rank (Combined)
    list.forEach((s, idx) => {
      if (idx > 0) {
        const prev = list[idx - 1];
        const sameScore = settings.enableOverallPerformanceScore
          ? prev.overallPerformanceScore === s.overallPerformanceScore
          : prev.totalMarks === s.totalMarks;
        s.rank = sameScore ? prev.rank : idx + 1;
        s.overallRank = s.rank;
      } else {
        s.rank = 1;
        s.overallRank = 1;
      }
    });

    // Compute Section-Wise Rank (Thamheediyya vs Aliya)
    sections.forEach(sec => {
      const sectionStudents = list.filter(s => s.sectionId === sec.id);
      sectionStudents.forEach((ss, secIdx) => {
        if (secIdx > 0) {
          const prev = sectionStudents[secIdx - 1];
          const same = settings.enableOverallPerformanceScore
            ? prev.overallPerformanceScore === ss.overallPerformanceScore
            : prev.totalMarks === ss.totalMarks;
          ss.sectionRank = same ? prev.sectionRank : secIdx + 1;
        } else {
          ss.sectionRank = 1;
        }
      });
    });

    // Compute Class Rank
    classes.forEach(c => {
      const classStudents = list.filter(s => s.classId === c.id);
      classStudents.forEach((cs, cIdx) => {
        if (cIdx > 0) {
          const prev = classStudents[cIdx - 1];
          const same = settings.enableOverallPerformanceScore
            ? prev.overallPerformanceScore === cs.overallPerformanceScore
            : prev.totalMarks === cs.totalMarks;
          cs.classRank = same ? prev.classRank : cIdx + 1;
        } else {
          cs.classRank = 1;
        }
      });
    });

    // Compute Team Rank
    teams.forEach(t => {
      const teamStudents = list.filter(s => s.teamId === t.id);
      teamStudents.forEach((ts, tIdx) => {
        if (tIdx > 0) {
          const prev = teamStudents[tIdx - 1];
          const same = settings.enableOverallPerformanceScore
            ? prev.overallPerformanceScore === ts.overallPerformanceScore
            : prev.totalMarks === ts.totalMarks;
          ts.teamRank = same ? prev.teamRank : tIdx + 1;
        } else {
          ts.teamRank = 1;
        }
      });
    });

    return list;
  }, [students, teams, classes, sections, summits, programs, programResultsMap, studentAttendanceMap, settings.enableOverallPerformanceScore, settings.overallMarksWeight, settings.overallAttendanceWeight]);

  // TOP 10 RANKINGS: SECTION-WISE & COMBINED
  const top10Rankings = useMemo(() => {
    const top10Overall = studentStandings.slice(0, 10);
    const top10Thamheediyya = studentStandings.filter(s => s.sectionId === 'thamheediyya').slice(0, 10);
    const top10Aliya = studentStandings.filter(s => s.sectionId === 'aliya').slice(0, 10);
    return {
      overall: top10Overall,
      thamheediyya: top10Thamheediyya,
      aliya: top10Aliya
    };
  }, [studentStandings]);

  // TEAM STANDINGS & RANKINGS (SECTION-WISE & COMBINED)
  const teamStandings = useMemo(() => {
    return teams.map(team => {
      let totalPoints = 0;
      let totalMaxPoints = 0;
      let thamheediyyaPoints = 0;
      let aliyaPoints = 0;
      let firstPlaces = 0;
      let secondPlaces = 0;
      let thirdPlaces = 0;

      // Group marks counted once per entry
      Object.entries(programResultsMap).forEach(([progId, results]) => {
        const prog = programs.find(p => p.id === progId);
        if (prog && prog.status === 'published') {
          results.forEach(res => {
            if (res.teamId === team.id) {
              totalPoints += res.finalMark;
              totalMaxPoints += res.maxMarks;
              if (prog.sectionId === 'thamheediyya') {
                thamheediyyaPoints += res.finalMark;
              } else if (prog.sectionId === 'aliya') {
                aliyaPoints += res.finalMark;
              } else {
                thamheediyyaPoints += (res.finalMark / 2);
                aliyaPoints += (res.finalMark / 2);
              }

              if (res.rank === 1) firstPlaces++;
              else if (res.rank === 2) secondPlaces++;
              else if (res.rank === 3) thirdPlaces++;
            }
          });
        }
      });

      const memberStudents = studentStandings.filter(s => s.teamId === team.id);
      const memberCount = memberStudents.length;
      const leader = students.find(s => s.id === team.leaderId);

      const avgMarksPerStudent = memberCount > 0 ? totalPoints / memberCount : 0;
      const marksPercentage = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;

      const avgAttendancePct = memberCount > 0
        ? memberStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / memberCount
        : 0;

      return {
        ...team,
        leaderName: leader ? leader.name : 'Not Appointed',
        memberCount,
        totalPoints,
        totalMaxPoints,
        thamheediyyaPoints,
        aliyaPoints,
        avgMarksPerStudent,
        marksPercentage,
        avgAttendancePct,
        firstPlaces,
        secondPlaces,
        thirdPlaces
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints).map((t, idx, arr) => {
      let rank = 1;
      if (idx > 0) {
        rank = arr[idx - 1].totalPoints === t.totalPoints ? arr[idx - 1].rank : idx + 1;
      }
      return { ...t, rank };
    });
  }, [teams, programs, programResultsMap, studentStandings, students]);

  // FIELD-WISE PERFORMANCE MAP
  // Structure: { [fieldId]: { [teamId]: { points, maxPoints, count } } }
  const fieldPerformanceMap = useMemo(() => {
    const map = {};
    fields.forEach(f => {
      map[f.id] = {};
      teams.forEach(t => {
        map[f.id][t.id] = { points: 0, maxPoints: 0, count: 0, percentage: 0 };
      });
    });

    Object.entries(programResultsMap).forEach(([progId, results]) => {
      const prog = programs.find(p => p.id === progId);
      if (prog && prog.fieldId && map[prog.fieldId] && prog.status === 'published') {
        results.forEach(res => {
          if (res.teamId && map[prog.fieldId][res.teamId]) {
            map[prog.fieldId][res.teamId].points += res.finalMark;
            map[prog.fieldId][res.teamId].maxPoints += res.maxMarks;
            map[prog.fieldId][res.teamId].count++;
          }
        });
      }
    });

    Object.keys(map).forEach(fId => {
      Object.keys(map[fId]).forEach(tId => {
        const item = map[fId][tId];
        item.percentage = item.maxPoints > 0 ? (item.points / item.maxPoints) * 100 : 0;
      });
    });

    return map;
  }, [fields, teams, programs, programResultsMap]);

  // CLASS EVALUATIONS
  const classEvaluations = useMemo(() => {
    return classes.map(c => {
      const classStudents = studentStandings.filter(s => s.classId === c.id);
      const studentCount = classStudents.length;

      let totalMarks = 0;
      let totalAttendancePct = 0;

      classStudents.forEach(s => {
        totalMarks += s.totalMarks;
        totalAttendancePct += s.attendancePercentage;
      });

      const avgMarks = studentCount > 0 ? totalMarks / studentCount : 0;
      const avgAttendance = studentCount > 0 ? totalAttendancePct / studentCount : 0;
      const section = sections.find(sec => sec.id === c.sectionId);

      return {
        ...c,
        sectionName: section?.name || (c.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'),
        studentCount,
        totalMarks,
        avgMarks,
        avgAttendance
      };
    });
  }, [classes, sections, studentStandings]);

  // ================= ACTIONS ================= //

  // SECTIONS CRUD
  const updateSection = (id, updates, actor) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addAuditLog(actor, 'UPDATE_SECTION', `Updated section ${id}: ${Object.keys(updates).join(', ')}`);
  };

  const addSection = (secData, actor) => {
    const newSec = {
      id: secData.id || 'sec_' + Date.now(),
      name: secData.name,
      order: sections.length + 1,
      description: secData.description || ''
    };
    setSections(prev => [...prev, newSec]);
    addAuditLog(actor, 'ADD_SECTION', `Created new section: ${newSec.name}`);
    return newSec;
  };

  // CLASSES UPDATE (including moving class to another section)
  const updateClass = (id, updates, actor) => {
    setClasses(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        addAuditLog(actor, 'UPDATE_CLASS', `Updated class ${c.name} (${Object.keys(updates).join(', ')})`);
        return updated;
      }
      return c;
    }));

    // If section changed, update all students belonging to this class
    if (updates.sectionId) {
      setStudents(prev => prev.map(s => s.classId === id ? { ...s, sectionId: updates.sectionId } : s));
    }
  };

  // FIELDS CRUD
  const addField = (fieldData, actor) => {
    const newField = {
      id: 'f_' + Date.now(),
      name: fieldData.name,
      sectionId: fieldData.sectionId || 'aliya',
      order: fields.length + 1,
      description: fieldData.description || ''
    };
    setFields(prev => [...prev, newField]);
    addAuditLog(actor, 'ADD_FIELD', `Created field "${newField.name}" for section ${newField.sectionId}`);
    return newField;
  };

  const updateField = (id, updates, actor) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    addAuditLog(actor, 'UPDATE_FIELD', `Updated field ${id}`);
  };

  const deleteField = (id, actor) => {
    const f = fields.find(x => x.id === id);
    setFields(prev => prev.filter(x => x.id !== id));
    addAuditLog(actor, 'DELETE_FIELD', `Deleted field: ${f?.name || id}`);
  };

  const reorderFields = (newOrderList, actor) => {
    setFields(newOrderList);
    addAuditLog(actor, 'REORDER_FIELDS', 'Reordered program fields');
  };

  // MASTER PROGRAM LIBRARY CRUD
  const addLibraryProgram = (data, actor) => {
    const newProg = {
      id: 'lib_' + Date.now(),
      name: data.name,
      fieldId: data.fieldId || fields[0]?.id || 'f_communicative',
      sectionId: data.sectionId || 'aliya',
      type: data.type || 'individual',
      maxMarks: 10,
      defaultAllowedPerTeam: Number(data.defaultAllowedPerTeam) || 1,
      description: data.description || '',
      rules: data.rules || '',
      active: true
    };
    setProgramLibrary(prev => [...prev, newProg]);
    addAuditLog(actor, 'ADD_LIBRARY_PROGRAM', `Added program to library: ${newProg.name} (${newProg.sectionId})`);
    return newProg;
  };

  const updateLibraryProgram = (id, updates, actor) => {
    setProgramLibrary(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addAuditLog(actor, 'UPDATE_LIBRARY_PROGRAM', `Updated library program ${id}`);
  };

  const deleteLibraryProgram = (id, actor) => {
    const p = programLibrary.find(x => x.id === id);
    setProgramLibrary(prev => prev.filter(x => x.id !== id));
    addAuditLog(actor, 'DELETE_LIBRARY_PROGRAM', `Deleted library program: ${p?.name}`);
  };

  const duplicateLibraryProgram = (id, actor) => {
    const p = programLibrary.find(x => x.id === id);
    if (!p) return;
    const duplicated = {
      ...p,
      id: 'lib_' + Date.now(),
      name: `${p.name} (Copy)`
    };
    setProgramLibrary(prev => [...prev, duplicated]);
    addAuditLog(actor, 'DUPLICATE_LIBRARY_PROGRAM', `Duplicated library program: ${p.name}`);
  };

  const bulkImportLibraryPrograms = (programsList, actor = 'admin') => {
    if (!Array.isArray(programsList) || programsList.length === 0) return { count: 0 };
    const newItems = programsList.map((data, idx) => ({
      id: 'lib_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
      name: (data.name || '').trim(),
      fieldId: data.fieldId || fields[0]?.id || 'f_communicative',
      sectionId: data.sectionId || 'aliya',
      type: data.type || 'individual',
      maxMarks: Number(data.maxMarks) || 10,
      defaultAllowedPerTeam: Number(data.defaultAllowedPerTeam) || 1,
      description: data.description || '',
      rules: data.rules || '',
      active: true
    })).filter(p => p.name.length > 0);

    setProgramLibrary(prev => [...prev, ...newItems]);
    addAuditLog(actor, 'BULK_IMPORT_PROGRAMS', `Bulk imported ${newItems.length} programs to master library`);
    return { count: newItems.length };
  };

  const toggleLibraryProgramActive = (id, actor) => {
    setProgramLibrary(prev => prev.map(p => {
      if (p.id === id) {
        const next = !p.active;
        addAuditLog(actor, 'TOGGLE_LIBRARY_ACTIVE', `Set program ${p.name} active=${next}`);
        return { ...p, active: next };
      }
      return p;
    }));
  };

  // SUMMIT-WISE PROGRAM ASSIGNMENT & MATRIX
  const assignProgramToSummit = (summitId, programData, actor) => {
    const isThamheediyya = programData.sectionId === 'thamheediyya';
    const allowed = Number(programData.defaultAllowedPerTeam) || 1;

    // Build team allocations
    // If teamAllocations explicitly provided, use it; otherwise assign to ALL teams
    let teamAllocations = programData.teamAllocations;
    if (!teamAllocations || Object.keys(teamAllocations).length === 0) {
      teamAllocations = {};
      teams.forEach(t => {
        teamAllocations[t.id] = {
          assigned: true,
          allowedCount: allowed
        };
      });
    }

    const newProg = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      summitId,
      libraryProgramId: programData.libraryProgramId || null,
      name: programData.name,
      fieldId: programData.fieldId || fields[0]?.id || 'f_foundation',
      sectionId: programData.sectionId || 'thamheediyya',
      type: programData.type || 'individual',
      stage: programData.stage || 'Auditorium',
      date: programData.date || summitsMap[summitId]?.date || new Date().toISOString().slice(0, 10),
      time: programData.time || '10:00 AM',
      maxMarks: 10,
      defaultAllowedPerTeam: allowed,
      teamAllocations,
      assignedJudges: programData.assignedJudges || [],
      allowLeaderMarkEntry: Boolean(programData.allowLeaderMarkEntry),
      registrationLocked: false,
      status: 'open'
    };

    saveDoc(COLLECTIONS.PROGRAMS, newProg.id, newProg);
    setPrograms(prev => [...prev, newProg]);
    if (newProg.assignedJudges && newProg.assignedJudges.length > 0) {
      setJudges(prev => prev.map(j => {
        if (newProg.assignedJudges.includes(j.id)) {
          const current = j.assignedPrograms || [];
          if (!current.includes(newProg.id)) {
            return { ...j, assignedPrograms: [...current, newProg.id] };
          }
        }
        return j;
      }));
    }
    addAuditLog(actor, 'ASSIGN_PROGRAM_TO_SUMMIT', `Assigned "${newProg.name}" to Summit ${summitId} (${newProg.sectionId})`);
    return newProg;
  };

  const updateSummitProgramAllocation = (programId, teamId, { assigned, allowedCount }, actor) => {
    let progName = '';
    let finalAllowed = 1;
    let finalAssigned = true;

    setPrograms(prev => prev.map(p => {
      if (p.id === programId) {
        progName = p.name;
        finalAssigned = assigned != null ? assigned : p.teamAllocations?.[teamId]?.assigned ?? false;
        finalAllowed = allowedCount != null ? Number(allowedCount) : p.teamAllocations?.[teamId]?.allowedCount ?? (p.defaultAllowedPerTeam || 1);
        const updatedAllocations = {
          ...(p.teamAllocations || {}),
          [teamId]: {
            assigned: finalAssigned,
            allowedCount: finalAllowed
          }
        };
        addAuditLog(actor, 'UPDATE_SUMMIT_ALLOCATION', `Updated allocation for Program ${p.name}, Team ${teamId}: assigned=${finalAssigned}, count=${finalAllowed}`);
        return { ...p, teamAllocations: updatedAllocations };
      }
      return p;
    }));

    // Notify both leaders of this team
    const teamLeaders = students.filter(s => s.teamId === teamId && s.isLeader);
    teamLeaders.forEach(ldr => {
      sendNotification(
        ldr.id,
        'Program Quota Updated',
        `Your team's allocation for "${progName}" was updated: ${finalAssigned ? `${finalAllowed} slot(s) allowed` : 'Program unassigned'}.`,
        'assignment'
      );
    });
  };

  const bulkAssignSummitProgramToAllTeams = (programId, allowedCount, actor) => {
    let progName = '';
    const count = allowedCount != null ? Number(allowedCount) : 1;
    setPrograms(prev => prev.map(p => {
      if (p.id === programId) {
        progName = p.name;
        const newAllocations = {};
        teams.forEach(t => {
          newAllocations[t.id] = { assigned: true, allowedCount: count };
        });
        addAuditLog(actor, 'ASSIGN_TO_ALL_TEAMS', `Assigned Program "${p.name}" to all teams with ${count} slots`);
        return { ...p, teamAllocations: newAllocations };
      }
      return p;
    }));

    // Notify leaders of all teams
    const allLeaders = students.filter(s => s.isLeader);
    allLeaders.forEach(ldr => {
      sendNotification(
        ldr.id,
        'Program Assigned to All Teams',
        `"${progName}" has been assigned to all teams with ${count} participant slot(s).`,
        'assignment'
      );
    });
  };

  const copyTeamAllocationsToOtherTeams = (programId, sourceTeamId, actor) => {
    setPrograms(prev => prev.map(p => {
      if (p.id === programId) {
        const src = p.teamAllocations?.[sourceTeamId] || { assigned: true, allowedCount: p.defaultAllowedPerTeam || 1 };
        const newAllocations = {};
        teams.forEach(t => {
          newAllocations[t.id] = { ...src };
        });
        addAuditLog(actor, 'COPY_TEAM_ALLOCATION', `Copied Team ${sourceTeamId} allocation across all teams for "${p.name}"`);
        return { ...p, teamAllocations: newAllocations };
      }
      return p;
    }));
  };

  const copySummitSetup = (sourceSummitId, targetSummitId, actor) => {
    const sourcePrograms = programs.filter(p => p.summitId === sourceSummitId);
    if (sourcePrograms.length === 0) return 0;

    const targetSummit = summitsMap[targetSummitId];
    const cloned = sourcePrograms.map((src, idx) => ({
      ...src,
      id: 'p_' + Date.now() + '_' + idx,
      summitId: targetSummitId,
      date: targetSummit?.date || src.date,
      status: 'open',
      registrationLocked: false
    }));

    setPrograms(prev => [...prev, ...cloned]);
    addAuditLog(actor, 'COPY_SUMMIT_SETUP', `Copied ${cloned.length} programs from Summit ${sourceSummitId} to ${targetSummitId}`);
    return cloned.length;
  };

  const toggleSummitRegistrationLock = (summitId, locked, actor) => {
    const summit = summitsMap[summitId];
    setSummits(prev => prev.map(s => s.id === summitId ? { ...s, registrationLocked: locked } : s));
    setPrograms(prev => prev.map(p => p.summitId === summitId ? { ...p, registrationLocked: locked } : p));
    addAuditLog(actor, locked ? 'LOCK_REGISTRATION' : 'UNLOCK_REGISTRATION', `Set registration lock=${locked} for Summit ${summitId}`);

    // Notify all team leaders
    const allLeaders = students.filter(s => s.isLeader);
    allLeaders.forEach(ldr => {
      sendNotification(
        ldr.id,
        locked ? 'Registration Locked' : 'Registration Re-Opened',
        `Student nomination & registration for "${summit?.name || 'Summit'}" is now ${locked ? 'LOCKED' : 'OPEN'}.`,
        'alert'
      );
    });
  };

  // STUDENT NOMINATION / REGISTRATION (WITH SECTION, SLOT LIMIT & 2-LEADER ENFORCEMENT)
  const nominateStudentForProgram = ({ programId, studentId, memberIds, teamId, groupName }, actor, actorUserId, actorTitle) => {
    const prog = programs.find(p => p.id === programId);
    if (!prog) return { success: false, error: 'Program not found.' };

    const isAdmin = actor === 'admin' || actor?.role === 'admin' || actor?.includes?.('admin');
    const summit = summitsMap[prog.summitId];
    if ((prog.registrationLocked || summit?.registrationLocked) && !isAdmin) {
      return { success: false, error: 'Registration is locked for this summit/program. Only administrators can make modifications.' };
    }

    const team = teamsMap[teamId] || teams.find(t => t.id === teamId) || teams[0];
    const alloc = prog.teamAllocations?.[teamId];

    // Check if team is assigned
    if (alloc && alloc.assigned === false) {
      return { success: false, error: `This program is not assigned to ${team.name}.` };
    }

    // Role check: Leaders can ONLY assign their own team members
    const actorLeader = students.find(s => s.id === actorUserId || s.leaderUsername === actor || (s.isLeader && s.name === actor));
    if (!isAdmin && actorLeader) {
      if (teamId !== actorLeader.teamId) {
        return { success: false, error: `Unauthorized: Team leaders can only nominate members of their own team (${teamsMap[actorLeader.teamId]?.name}).` };
      }
      // Section restriction for leaders
      if (actorLeader.leaderSectionRestriction && actorLeader.leaderSectionRestriction !== 'all') {
        if (prog.sectionId !== 'both' && prog.sectionId !== actorLeader.leaderSectionRestriction) {
          return {
            success: false,
            error: `Your leader assignment is restricted to the "${actorLeader.leaderSectionRestriction === 'aliya' ? 'Aliya' : 'Thamheediyya'}" section.`
          };
        }
      }
    }

    const allowedSlotCount = alloc ? alloc.allowedCount : (prog.defaultAllowedPerTeam || 1);
    const existingTeamEntries = entries.filter(e => e.programId === programId && e.teamId === teamId);
    const displayActor = actorTitle || (isAdmin ? 'Admin' : (actorLeader ? `${actorLeader.name} (${actorLeader.leaderRole === 'leader2' ? 'Leader 2' : 'Leader 1'})` : actor));

    // Group vs Individual
    if (prog.type === 'group') {
      if (!memberIds || memberIds.length === 0) {
        return { success: false, error: 'Please select group members.' };
      }

      // Check section and team of every member
      for (const mid of memberIds) {
        const mem = students.find(s => s.id === mid);
        if (!mem) return { success: false, error: 'Selected member not found.' };

        // Own team verification
        if (mem.teamId !== teamId) {
          return { success: false, error: `${mem.name} belongs to ${teamsMap[mem.teamId]?.name || 'another team'}, not ${team.name}.` };
        }

        const memClass = classesMap[mem?.classId];
        const memSection = memClass?.sectionId || mem?.sectionId || 'thamheediyya';

        if (prog.sectionId !== 'both' && prog.sectionId !== memSection) {
          return {
            success: false,
            error: `${mem?.name || 'Selected student'} belongs to section "${memSection}", but this program requires "${prog.sectionId}".`
          };
        }
      }

      // Check team slot limit (Per team limit, not program-wide!)
      if (existingTeamEntries.length >= allowedSlotCount && !isAdmin) {
        return {
          success: false,
          error: `Participant slot limit reached for ${team.name} in this program (Allowed: ${allowedSlotCount} group(s), Registered: ${existingTeamEntries.length}). Only admin can increase or override this limit.`
        };
      }

      const chestNo = 'G-' + (200 + entries.length + 1);
      const newEntry = {
        id: 'e_' + Date.now(),
        programId,
        groupName: groupName || `${team.name} Ensemble ${chestNo}`,
        memberIds,
        teamId,
        chestNo,
        nominatedBy: displayActor,
        nominatedByUsername: actor,
        nominatedAt: new Date().toISOString()
      };

      setEntries(prev => [...prev, newEntry]);
      memberIds.forEach(mid => {
        sendNotification(mid, 'Program Nomination', `You were registered for group event in "${prog.name}" by ${displayActor}`, 'assignment');
      });

      // Synchronize & notify Co-Leader & Admin
      if (!isAdmin) {
        const otherLeader = students.find(s => s.teamId === teamId && s.isLeader && s.id !== actorLeader?.id && s.id !== actorUserId);
        if (otherLeader) {
          sendNotification(otherLeader.id, 'Team Nomination Update', `${displayActor} nominated group "${newEntry.groupName}" for "${prog.name}"`, 'nomination');
        }
        sendNotification('admin', 'Team Nomination Update', `[${team.name}] ${displayActor} nominated group "${newEntry.groupName}" for "${prog.name}"`, 'nomination');
      }

      addAuditLog(actor, 'NOMINATE_GROUP', `[${displayActor}] Registered group "${newEntry.groupName}" for ${prog.name}`);
      return { success: true, entry: newEntry };
    } else {
      // Individual
      const st = students.find(s => s.id === studentId);
      if (!st) return { success: false, error: 'Student not found.' };

      // Own team verification
      if (st.teamId !== teamId) {
        return { success: false, error: `${st.name} belongs to ${teamsMap[st.teamId]?.name || 'another team'}, not ${team.name}.` };
      }

      // Section Check
      const stClass = classesMap[st.classId];
      const stSection = stClass?.sectionId || st.sectionId || 'thamheediyya';
      if (prog.sectionId !== 'both' && prog.sectionId !== stSection) {
        return {
          success: false,
          error: `${st.name} belongs to ${stSection === 'aliya' ? 'Aliya' : 'Thamheediyya'}, but this program is for ${prog.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'}.`
        };
      }

      // Check duplicate
      const alreadyInProg = entries.some(e => e.programId === programId && (e.studentId === studentId || e.memberIds?.includes(studentId)));
      if (alreadyInProg) {
        return { success: false, error: `${st.name} is already registered in this program.` };
      }

      // Check team slot limit (Per team limit, not program-wide!)
      if (existingTeamEntries.length >= allowedSlotCount && !isAdmin) {
        return {
          success: false,
          error: `Participant slot limit reached for ${team.name} in this program (Allowed: ${allowedSlotCount}, Registered: ${existingTeamEntries.length}). Only admin can increase or override this limit.`
        };
      }

      // Check max programs per student setting
      if (settings.maxProgramsPerStudent > 0 && !isAdmin) {
        const studentSummitCount = entries.filter(e => {
          const p = programs.find(x => x.id === e.programId);
          return p && p.summitId === prog.summitId && (e.studentId === studentId || e.memberIds?.includes(studentId));
        }).length;

        if (studentSummitCount >= settings.maxProgramsPerStudent) {
          return {
            success: false,
            error: `${st.name} has reached the maximum summit limit of ${settings.maxProgramsPerStudent} programs.`
          };
        }
      }

      const newEntry = {
        id: 'e_' + Date.now(),
        programId,
        studentId,
        teamId: st.teamId,
        chestNo: st.chestNo || `C-${100 + entries.length + 1}`,
        nominatedBy: displayActor,
        nominatedByUsername: actor,
        nominatedAt: new Date().toISOString()
      };

      saveDoc(COLLECTIONS.ENTRIES, newEntry.id, newEntry);
      setEntries(prev => [...prev, newEntry]);
      sendNotification(studentId, 'Program Nomination', `You were nominated for "${prog.name}" by ${displayActor}`, 'assignment');

      // Synchronize & notify Co-Leader & Admin
      if (!isAdmin) {
        const otherLeader = students.find(s => s.teamId === teamId && s.isLeader && s.id !== actorLeader?.id && s.id !== actorUserId);
        if (otherLeader) {
          sendNotification(otherLeader.id, 'Team Nomination Update', `${displayActor} nominated ${st.name} for "${prog.name}"`, 'nomination');
        }
        sendNotification('admin', 'Team Nomination Update', `[${team.name}] ${displayActor} nominated ${st.name} for "${prog.name}"`, 'nomination');
      }

      addAuditLog(actor, 'NOMINATE_STUDENT', `[${displayActor}] Nominated ${st.name} for ${prog.name}`);
      return { success: true, entry: newEntry };
    }
  };

  const removeStudentEntry = (entryId, actor, actorUserId, actorTitle) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return { success: false, error: 'Entry not found.' };

    const prog = programs.find(p => p.id === entry.programId);
    const summit = summitsMap[prog?.summitId];
    const isAdmin = actor === 'admin' || actor?.role === 'admin' || actor?.includes?.('admin');

    if ((prog?.registrationLocked || summit?.registrationLocked) && !isAdmin) {
      return { success: false, error: 'Registration is locked for this summit. Only administrators can remove entries.' };
    }

    const st = students.find(s => s.id === entry.studentId);
    const team = teamsMap[entry.teamId];
    const displayActor = actorTitle || (isAdmin ? 'Admin' : actor);

    removeDoc(COLLECTIONS.ENTRIES, entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
    setMarks(prev => prev.filter(m => m.entryId !== entryId));

    if (!isAdmin) {
      const otherLeader = students.find(s => s.teamId === entry.teamId && s.isLeader && s.id !== actorUserId);
      if (otherLeader) {
        sendNotification(otherLeader.id, 'Nomination Removed', `${displayActor} removed nomination of ${st?.name || 'student'} from "${prog?.name}"`, 'nomination');
      }
      sendNotification('admin', 'Nomination Removed', `[${team?.name}] ${displayActor} removed nomination of ${st?.name || 'student'} from "${prog?.name}"`, 'nomination');
    }

    addAuditLog(actor, 'REMOVE_ENTRY', `[${displayActor}] Removed nomination entry for ${st?.name || 'group'} in ${prog?.name}`);
    return { success: true };
  };

  // STUDENTS CRUD
  const addStudent = async (studentData, actor) => {
    const newId = 's_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const password = studentData.password || studentData.cicNo || 'student123';
    const passwordHash = await hashPassword(password);
    const chestNo = studentData.chestNo || `C-${100 + students.length + 1}`;

    const cl = classesMap[studentData.classId];
    const studentSectionId = cl?.sectionId || 'thamheediyya';

    const newStudent = {
      id: newId,
      name: studentData.name,
      cicNo: studentData.cicNo,
      classId: studentData.classId,
      teamId: studentData.teamId,
      sectionId: studentSectionId,
      fieldId: studentData.fieldId || (studentSectionId === 'aliya' ? (fields.find(f => f.sectionId === 'aliya')?.id || '') : 'f_foundation'),
      username: studentData.username || studentData.cicNo,
      initialPassword: password,
      passwordHash,
      chestNo,
      isLeader: false
    };

    saveDoc(COLLECTIONS.STUDENTS, newStudent.id, newStudent);
    setStudents(prev => [newStudent, ...prev]);
    addAuditLog(actor, 'ADD_STUDENT', `Added student ${newStudent.name} (${newStudent.cicNo})`);
    return newStudent;
  };

  const updateStudent = (id, updates, actor) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        saveDoc(COLLECTIONS.STUDENTS, id, updated);
        if (updates.classId && classesMap[updates.classId]) {
          updated.sectionId = classesMap[updates.classId].sectionId;
        }
        if (updates.fieldId !== undefined) {
          updated.fieldId = updates.fieldId;
        }
        addAuditLog(actor, 'UPDATE_STUDENT', `Updated student ${s.name} (${s.cicNo})`);
        return updated;
      }
      return s;
    }));
  };

  const removeStudent = (id, actor) => {
    const st = students.find(s => s.id === id) || archivedStudents.find(s => s.id === id);
    if (!st) return;
    removeDoc(COLLECTIONS.STUDENTS, id);
    setStudents(prev => prev.filter(s => s.id !== id));
    setArchivedStudents(prev => prev.filter(s => s.id !== id));
    setEntries(prev => prev.filter(e => e.studentId !== id && (!e.memberIds || !e.memberIds.includes(id))));
    setMarks(prev => prev.filter(m => m.studentId !== id));
    setCertificates(prev => prev.filter(c => c.studentId !== id));
    addAuditLog(actor, 'DELETE_STUDENT_PERMANENTLY', `Permanently deleted student ${st.name} (${st.cicNo})`);
  };

  const restoreStudent = (id, actor) => {
    const st = archivedStudents.find(s => s.id === id);
    if (!st) return;
    setArchivedStudents(prev => prev.filter(s => s.id !== id));
    const { archivedAt, ...rest } = st;
    setStudents(prev => [...prev, rest]);
    addAuditLog(actor, 'RESTORE_STUDENT', `Restored student ${st.name} from archive`);
  };

  const bulkImportStudents = async (list, actor) => {
    const imported = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const newId = 's_' + Date.now() + '_' + i + '_' + Math.floor(Math.random() * 1000);
      // Student password defaults directly to their CIC number as requested
      const studentPass = item.password || item.cicNo;
      const passwordHash = await hashPassword(studentPass);
      const chestNo = item.chestNo || `C-${100 + students.length + imported.length + 1}`;
      const cl = classesMap[item.classId];

      imported.push({
        id: newId,
        name: item.name,
        cicNo: item.cicNo,
        classId: item.classId,
        teamId: item.teamId,
        sectionId: cl?.sectionId || 'thamheediyya',
        fieldId: item.fieldId || (cl?.sectionId === 'aliya' ? (fields.find(f => f.sectionId === 'aliya')?.id || '') : 'f_foundation'),
        username: item.username || item.cicNo,
        initialPassword: studentPass,
        passwordHash,
        chestNo,
        isLeader: false
      });
    }

    setStudents(prev => [...imported, ...prev]);
    addAuditLog(actor, 'BULK_IMPORT_STUDENTS', `Imported ${imported.length} students via sheet (passwords set to CIC Number)`);
    return imported;
  };

  const autoGenerateAllCredentials = async (actor) => {
    const updated = [];
    const credentialsSheet = [];

    for (const s of students) {
      const genUsername = s.cicNo.toLowerCase().replace(/[^a-z0-9]/g, '');
      const genPassword = 'Wafy' + Math.floor(1000 + Math.random() * 9000);
      const passwordHash = await hashPassword(genPassword);

      updated.push({
        ...s,
        username: genUsername,
        passwordHash
      });

      credentialsSheet.push({
        name: s.name,
        cicNo: s.cicNo,
        className: classesMap[s.classId]?.name || s.classId,
        teamName: teamsMap[s.teamId]?.name || s.teamId,
        username: genUsername,
        password: genPassword,
        chestNo: s.chestNo
      });
    }

    setStudents(updated);
    addAuditLog(actor, 'GENERATE_CREDENTIALS', `Auto-generated credentials for ${students.length} students`);
    return credentialsSheet;
  };

  const autoGenerateChestNumbers = (actor) => {
    const updated = students.map((s, idx) => ({
      ...s,
      chestNo: `C-${101 + idx}`
    }));
    setStudents(updated);
    addAuditLog(actor, 'GENERATE_CHEST_NUMBERS', `Generated chest numbers for ${students.length} students`);
  };

  // TEAMS CRUD
  const addTeam = (teamData, actor) => {
    const newTeam = {
      id: 't' + (teams.length + 1),
      name: teamData.name,
      color: teamData.color || '#0E7C86',
      leaderId: null
    };
    setTeams(prev => [...prev, newTeam]);
    addAuditLog(actor, 'ADD_TEAM', `Created house team: ${newTeam.name}`);
    return newTeam;
  };

  const updateTeam = (id, updates, actor) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (updates.name) {
      setStudents(prev => prev.map(s => s.teamId === id ? { ...s, teamName: updates.name } : s));
    }
    addAuditLog(actor, 'UPDATE_TEAM', `Updated team ${id}: ${Object.keys(updates).join(', ')}`);
  };

  const deleteTeam = (id, targetMoveTeamId, actor) => {
    if (targetMoveTeamId) {
      setStudents(prev => prev.map(s => s.teamId === id ? { ...s, teamId: targetMoveTeamId } : s));
    }
    const t = teams.find(x => x.id === id);
    setTeams(prev => prev.filter(x => x.id !== id));
    addAuditLog(actor, 'DELETE_TEAM', `Deleted team ${t?.name || id}`);
  };

  const bulkAssignTeams = (assignments, actor) => {
    setStudents(prev => prev.map(s => {
      if (assignments[s.id]) {
        return { ...s, teamId: assignments[s.id] };
      }
      return s;
    }));
    addAuditLog(actor, 'BULK_ASSIGN_TEAMS', `Reassigned teams for ${Object.keys(assignments).length} students`);
  };

  // TWO LEADERS PER TEAM CRUD & SWAP
  const appointTeamLeader = async ({ teamId, leaderRole = 'leader1', studentId, leaderUsername, leaderPassword, sectionRestriction = 'all' }, actor) => {
    const passwordHash = await hashPassword(leaderPassword || 'leader123');
    const team = teams.find(t => t.id === teamId);
    const targetStudent = students.find(s => s.id === studentId);

    // Update Team leaders (leader1Id & leader2Id)
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        if (leaderRole === 'leader2') {
          return { ...t, leader2Id: studentId };
        } else {
          return { ...t, leader1Id: studentId, leaderId: studentId };
        }
      }
      return t;
    }));

    // Update Students:
    // Any existing student holding this leaderRole in this team reverts to normal member
    setStudents(prev => prev.map(s => {
      if (s.teamId === teamId) {
        if (s.id === studentId) {
          return {
            ...s,
            isLeader: true,
            leaderRole,
            leaderUsername: leaderUsername || `leader_${s.username}`,
            leaderPasswordHash: passwordHash,
            leaderSectionRestriction: sectionRestriction || 'all'
          };
        } else if (s.isLeader && s.leaderRole === leaderRole) {
          // Replaced leader becomes a normal member
          return {
            ...s,
            isLeader: false,
            leaderRole: null,
            leaderUsername: null,
            leaderPasswordHash: null,
            leaderSectionRestriction: null
          };
        }
      }
      return s;
    }));

    addAuditLog(actor, 'APPOINT_LEADER', `Appointed ${targetStudent?.name || studentId} as ${leaderRole === 'leader2' ? 'Leader 2' : 'Leader 1'} of ${team?.name || teamId} (${sectionRestriction === 'all' ? 'Full Team' : sectionRestriction})`);
    sendNotification(studentId, 'Leadership Appointment', `You have been appointed as ${leaderRole === 'leader2' ? 'Leader 2' : 'Leader 1'} for ${team?.name || 'your team'}.`, 'assignment');
  };

  const swapTeamLeaders = (teamId, actor) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const leader1 = students.find(s => s.teamId === teamId && s.isLeader && (s.leaderRole === 'leader1' || s.id === team.leader1Id));
    const leader2 = students.find(s => s.teamId === teamId && s.isLeader && (s.leaderRole === 'leader2' || s.id === team.leader2Id));

    if (!leader1 || !leader2) {
      throw new Error("Both Leader 1 and Leader 2 must be appointed before swapping.");
    }

    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          leader1Id: leader2.id,
          leader2Id: leader1.id,
          leaderId: leader2.id
        };
      }
      return t;
    }));

    setStudents(prev => prev.map(s => {
      if (s.id === leader1.id) {
        return { ...s, leaderRole: 'leader2' };
      }
      if (s.id === leader2.id) {
        return { ...s, leaderRole: 'leader1' };
      }
      return s;
    }));

    addAuditLog(actor, 'SWAP_LEADERS', `Swapped Leader 1 and Leader 2 for ${team.name}`);
  };

  const appointLeader = async (teamId, studentId, leaderUsername, leaderPassword, actor) => {
    return appointTeamLeader({ teamId, leaderRole: 'leader1', studentId, leaderUsername, leaderPassword }, actor);
  };

  // CHECK REGISTRATION DEADLINES & NOTIFY UNFILLED SLOTS
  const checkSummitRegistrationDeadlines = (summitId) => {
    const summit = summits.find(s => s.id === summitId);
    if (!summit) return { alertsGenerated: 0, alerts: [] };

    const summitPrograms = programs.filter(p => p.summitId === summitId);
    let alerts = [];

    teams.forEach(team => {
      let unfilledCount = 0;
      let totalAllowed = 0;
      let totalRegistered = 0;

      summitPrograms.forEach(prog => {
        const alloc = prog.teamAllocations?.[team.id];
        const isAssigned = prog.sectionId === 'thamheediyya' ? true : (alloc ? alloc.assigned : false);
        if (isAssigned) {
          const allowed = alloc ? alloc.allowedCount : (prog.defaultAllowedPerTeam || 1);
          const reg = entries.filter(e => e.programId === prog.id && e.teamId === team.id).length;
          totalAllowed += allowed;
          totalRegistered += reg;
          if (reg < allowed) {
            unfilledCount += (allowed - reg);
          }
        }
      });

      if (unfilledCount > 0) {
        alerts.push({ team, unfilledCount, totalAllowed, totalRegistered });
        // Notify both leaders of this team
        const teamLeaders = students.filter(s => s.teamId === team.id && s.isLeader);
        teamLeaders.forEach(ldr => {
          sendNotification(
            ldr.id,
            'Registration Deadline Alert',
            `Your team has ${unfilledCount} unfilled participant slot(s) for "${summit.name}". Please complete student nominations before registration locks.`,
            'alert'
          );
        });
      }
    });

    // Notify Admin
    if (alerts.length > 0) {
      const summaryMsg = alerts.map(a => `${a.team.name}: ${a.unfilledCount} unfilled`).join(', ');
      sendNotification(
        'admin',
        'Unfilled Slots Alert',
        `Summit "${summit.name}" has unfilled team slots: ${summaryMsg}.`,
        'alert'
      );
      addAuditLog('system', 'DEADLINE_ALERT', `Unfilled slot alert dispatched for "${summit.name}" (${summaryMsg})`);
    }

    return { alertsGenerated: alerts.length, alerts };
  };

  // JUDGES CRUD
  const addJudge = async (judgeData, actor) => {
    const passwordHash = await hashPassword(judgeData.password || 'judge123');
    const newId = 'j' + (judges.length + 1);
    const newJudge = {
      id: newId,
      name: judgeData.name,
      username: judgeData.username,
      passwordHash,
      role: 'judge',
      unrestricted: Boolean(judgeData.unrestricted),
      assignedPrograms: judgeData.assignedPrograms || []
    };
    setJudges(prev => [...prev, newJudge]);

    // Bidirectional sync: link judge to selected programs
    if (newJudge.assignedPrograms && newJudge.assignedPrograms.length > 0) {
      setPrograms(prev => prev.map(p => {
        if (newJudge.assignedPrograms.includes(p.id)) {
          const currentJudges = p.assignedJudges || [];
          if (!currentJudges.includes(newId)) {
            return { ...p, assignedJudges: [...currentJudges, newId] };
          }
        }
        return p;
      }));
    }

    addAuditLog(actor, 'ADD_JUDGE', `Added judge: ${newJudge.name}${newJudge.unrestricted ? ' (Unrestricted)' : ''}`);
    return newJudge;
  };

  const updateJudge = async (id, updates, actor) => {
    let finalUpdates = { ...updates };
    if (updates.password) {
      finalUpdates.passwordHash = await hashPassword(updates.password);
      delete finalUpdates.password;
    }
    setJudges(prev => prev.map(j => j.id === id ? { ...j, ...finalUpdates } : j));

    // Bidirectional sync with programs
    if (updates.assignedPrograms !== undefined) {
      const assigned = updates.assignedPrograms || [];
      setPrograms(prev => prev.map(p => {
        const curJudges = p.assignedJudges || [];
        const isAssigned = assigned.includes(p.id);
        const hasJudge = curJudges.includes(id);

        if (isAssigned && !hasJudge) {
          return { ...p, assignedJudges: [...curJudges, id] };
        } else if (!isAssigned && hasJudge) {
          return { ...p, assignedJudges: curJudges.filter(jId => jId !== id) };
        }
        return p;
      }));
    }

    addAuditLog(actor, 'UPDATE_JUDGE', `Updated judge ${id}`);
  };

  const toggleJudgeRestrictions = (id, actor = 'admin') => {
    const targetJudge = judges.find(j => j.id === id);
    if (!targetJudge) return;
    const nextVal = !targetJudge.unrestricted;
    updateJudge(id, { unrestricted: nextVal }, actor);
    addAuditLog(actor, 'TOGGLE_JUDGE_RESTRICTION', `${nextVal ? 'Removed restrictions from' : 'Restricted'} judge ${targetJudge.name}`);
  };

  const deleteJudge = (id, actor) => {
    const j = judges.find(x => x.id === id);
    setJudges(prev => prev.filter(x => x.id !== id));
    setPrograms(prev => prev.map(p => {
      if (p.assignedJudges?.includes(id)) {
        return { ...p, assignedJudges: p.assignedJudges.filter(jId => jId !== id) };
      }
      return p;
    }));
    addAuditLog(actor, 'DELETE_JUDGE', `Deleted judge: ${j?.name || id}`);
  };

  // SUMMITS CRUD
  const addSummit = (data, actor) => {
    const monthKey = data.month || (data.date ? data.date.slice(0, 7) : new Date().toISOString().slice(0, 7));
    const countInMonth = summits.filter(s => (s.month || s.date?.slice(0, 7)) === monthKey).length;
    const autoName = `${formatMonthLabel(monthKey)} - Summit ${countInMonth + 1}`;

    const newSummit = {
      id: 'summit_' + Date.now(),
      name: data.name || autoName,
      month: monthKey,
      date: data.date || new Date().toISOString().slice(0, 10),
      venue: data.venue || 'College Auditorium',
      registrationDeadline: data.registrationDeadline || `${data.date || new Date().toISOString().slice(0, 10)}T18:00`,
      registrationLocked: false,
      status: data.status || 'open'
    };
    saveDoc(COLLECTIONS.SUMMITS, newSummit.id, newSummit);
    setSummits(prev => [...prev, newSummit]);
    addAuditLog(actor, 'ADD_SUMMIT', `Created summit: ${newSummit.name}`);
    return newSummit;
  };

  const bulkCreateWeeklySummits = ({ month, dayOfWeek = 5, venue = 'Wafy Central Auditorium', baseTitle = '' }, actor = 'admin') => {
    if (!month) return [];
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const mIndex = parseInt(monthStr, 10) - 1;

    const dates = [];
    const d = new Date(year, mIndex, 1);
    while (d.getMonth() === mIndex) {
      if (d.getDay() === Number(dayOfWeek)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
      d.setDate(d.getDate() + 1);
    }

    if (dates.length === 0) return [];

    const monthLabel = formatMonthLabel(month);
    const newSummits = dates.map((dStr, idx) => {
      const runningNo = idx + 1;
      const title = baseTitle ? `${monthLabel} - Summit ${runningNo}: ${baseTitle}` : `${monthLabel} - Summit ${runningNo}`;
      return {
        id: `summit_${month.replace('-', '_')}_${runningNo}_${Date.now()}_${idx}`,
        name: title,
        month,
        date: dStr,
        venue,
        registrationDeadline: `${dStr}T18:00`,
        registrationLocked: false,
        status: 'open'
      };
    });

    batchSaveDocs(COLLECTIONS.SUMMITS, newSummits, 400);
    setSummits(prev => [...prev, ...newSummits]);
    addAuditLog(actor, 'BULK_CREATE_SUMMITS', `Bulk-created ${newSummits.length} weekly summits for month ${month}`);
    return newSummits;
  };

  const bulkCreateAcademicYearSummits = ({ startYear = 2026, startMonth = 6, dayOfWeek = 5, venue = 'Wafy Central Auditorium', baseTitle = '' }, actor = 'admin') => {
    let allNewSummits = [];
    let curYear = Number(startYear);
    let curMonth = Number(startMonth);

    for (let i = 0; i < 12; i++) {
      const monthStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;
      const monthLabel = formatMonthLabel(monthStr);

      const dates = [];
      const mIndex = curMonth - 1;
      const d = new Date(curYear, mIndex, 1);
      while (d.getMonth() === mIndex) {
        if (d.getDay() === Number(dayOfWeek)) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dates.push(`${y}-${m}-${day}`);
        }
        d.setDate(d.getDate() + 1);
      }

      // Take first 4 dates (4 weekly summits per month)
      const targetDates = dates.slice(0, 4);
      targetDates.forEach((dStr, idx) => {
        const runningNo = idx + 1;
        const title = baseTitle ? `${monthLabel} - Summit ${runningNo}: ${baseTitle}` : `${monthLabel} - Summit ${runningNo}`;
        allNewSummits.push({
          id: `summit_${monthStr.replace('-', '_')}_${runningNo}`,
          name: title,
          month: monthStr,
          date: dStr,
          venue,
          registrationDeadline: `${dStr}T18:00`,
          registrationLocked: false,
          status: 'planned'
        });
      });

      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }

    setSummits(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const filtered = allNewSummits.filter(s => !existingIds.has(s.id));
      return [...prev, ...filtered];
    });

    addAuditLog(actor, 'BULK_CREATE_ACADEMIC_YEAR', `Generated 12-month academic calendar with 4 weekly summits per month (${allNewSummits.length} total)`);
    return allNewSummits;
  };

  const addReportHistory = (report) => {
    const entry = {
      id: 'rep_' + Date.now(),
      name: report.name || 'Academic Report',
      reportType: report.reportType || 'monthly',
      months: report.months || [],
      generatedDate: new Date().toISOString(),
      generatedBy: report.generatedBy || 'admin',
      sectionFilter: report.sectionFilter || 'all',
      itemCount: report.itemCount || 0
    };
    setReportHistory(prev => [entry, ...prev.slice(0, 19)]);
    return entry;
  };

  const updateSummit = (id, updates, actor) => {
    setSummits(prev => prev.map(s => {
      if (s.id === id) {
        const next = { ...s, ...updates };
        saveDoc(COLLECTIONS.SUMMITS, id, next);
        return next;
      }
      return s;
    }));
    addAuditLog(actor, 'UPDATE_SUMMIT', `Updated summit ${id}`);
  };

  const deleteSummit = (id, actor) => {
    const s = summits.find(x => x.id === id);
    removeDoc(COLLECTIONS.SUMMITS, id);
    setSummits(prev => prev.filter(x => x.id !== id));
    addAuditLog(actor, 'DELETE_SUMMIT', `Deleted summit: ${s?.name || id}`);
  };

  const purgeEmptyPlannedSummits = (actor) => {
    setSummits(prev => {
      const remaining = prev.filter(s => {
        const hasPrograms = programs.some(p => p.summitId === s.id);
        const isDemo = s.id?.startsWith('summit_jun_') ||
          s.id?.startsWith('summit_jul_') ||
          s.id?.startsWith('summit_aug_') ||
          s.id?.startsWith('summit_sep_') ||
          s.id?.startsWith('summit_oct_') ||
          s.id?.startsWith('summit_nov_') ||
          s.id?.startsWith('summit_dec_') ||
          s.id?.startsWith('summit_jan_') ||
          s.id?.startsWith('summit_feb_') ||
          s.id?.startsWith('summit_mar_') ||
          s.id?.startsWith('summit_apr_') ||
          s.id?.startsWith('summit_may_');
        return hasPrograms && !isDemo;
      });
      return remaining;
    });
    addAuditLog(actor, 'PURGE_SUMMITS', 'Removed empty planned summits');
  };

  const addCategory = (name, actor) => {
    if (!categories.includes(name)) {
      setCategories(prev => [...prev, name]);
      addAuditLog(actor, 'ADD_CATEGORY', `Added category: ${name}`);
    }
  };

  // LEGACY/DIRECT PROGRAM CRUD
  const addProgram = (data, actor) => {
    return assignProgramToSummit(data.summitId || summits[0]?.id, data, actor);
  };

  const updateProgram = (id, updates, actor) => {
    setPrograms(prev => prev.map(p => {
      if (p.id === id) {
        const next = { ...p, ...updates };
        saveDoc(COLLECTIONS.PROGRAMS, id, next);
        addAuditLog(actor, 'UPDATE_PROGRAM', `Updated program: ${p.name}`);
        return next;
      }
      return p;
    }));

    if (updates.assignedJudges) {
      setJudges(prev => prev.map(j => {
        const isAssigned = updates.assignedJudges.includes(j.id);
        const hasProg = j.assignedPrograms?.includes(id);
        if (isAssigned && !hasProg) {
          return { ...j, assignedPrograms: [...(j.assignedPrograms || []), id] };
        } else if (!isAssigned && hasProg) {
          return { ...j, assignedPrograms: (j.assignedPrograms || []).filter(pId => pId !== id) };
        }
        return j;
      }));
    }
  };

  const duplicateProgram = (id, actor) => {
    const original = programs.find(p => p.id === id);
    if (!original) return;
    const duplicated = {
      ...original,
      id: 'p_' + Date.now(),
      name: original.name + ' (Copy)',
      status: 'draft'
    };
    setPrograms(prev => [...prev, duplicated]);
    addAuditLog(actor, 'DUPLICATE_PROGRAM', `Duplicated program: ${original.name}`);
  };

  const cancelProgram = (id, actor) => {
    const prog = programs.find(p => p.id === id);
    removeDoc(COLLECTIONS.PROGRAMS, id);
    setPrograms(prev => prev.filter(p => p.id !== id));
    addAuditLog(actor, 'CANCEL_PROGRAM', `Cancelled program ${prog?.name}`);
    const progEntries = entries.filter(e => e.programId === id);
    progEntries.forEach(e => {
      if (e.studentId) sendNotification(e.studentId, 'Program Cancelled', `The program "${prog?.name}" has been cancelled by administration.`, 'cancellation');
    });
  };

  const toggleProgramStatus = (id, nextStatus, actor) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    addAuditLog(actor, 'CHANGE_PROGRAM_STATUS', `Changed status of program ${id} to ${nextStatus}`);

    if (nextStatus === 'published') {
      const prog = programs.find(p => p.id === id);
      const progEntries = entries.filter(e => e.programId === id);
      progEntries.forEach(e => {
        if (e.studentId) sendNotification(e.studentId, 'Results Published', `Official results for "${prog?.name}" have been published!`, 'result');
      });
    }
  };

  const assignParticipantsToProgram = (programId, studentIds, isGroup = false, groupName = '', actor) => {
    if (isGroup) {
      return nominateStudentForProgram({
        programId,
        memberIds: studentIds,
        teamId: students.find(s => s.id === studentIds[0])?.teamId || 't1',
        groupName
      }, actor);
    } else {
      let lastRes = null;
      for (const sid of studentIds) {
        const st = students.find(s => s.id === sid);
        lastRes = nominateStudentForProgram({
          programId,
          studentId: sid,
          teamId: st?.teamId || 't1'
        }, actor);
      }
      return lastRes;
    }
  };

  // MARKS
  const submitJudgeMark = (programId, entryId, studentId, judgeId, judgeName, markVal, actor) => {
    const num = Math.min(10, Math.max(0, parseFloat(markVal) || 0));
    const existingIndex = marks.findIndex(m => m.programId === programId && (m.entryId === entryId || m.studentId === studentId) && m.enteredBy === judgeId);

    if (existingIndex >= 0) {
      const existing = marks[existingIndex];
      const updated = {
        ...existing,
        marks: num,
        timestamp: new Date().toISOString()
      };
      saveDoc(COLLECTIONS.MARKS, existing.id, updated);
      setMarks(prev => prev.map((m, idx) => idx === existingIndex ? updated : m));
      addAuditLog(actor, 'JUDGE_EDIT_MARK', `Judge ${judgeName} edited score to ${num} for entry ${entryId}`);
    } else {
      const newMark = {
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        programId,
        entryId,
        studentId,
        enteredBy: judgeId,
        enteredByName: judgeName,
        sourceRole: 'judge',
        marks: num,
        status: 'approved',
        timestamp: new Date().toISOString()
      };
      saveDoc(COLLECTIONS.MARKS, newMark.id, newMark);
      setMarks(prev => [...prev, newMark]);
      addAuditLog(actor, 'JUDGE_ENTER_MARK', `Judge ${judgeName} entered score ${num} for entry ${entryId}`);
    }
  };

  const submitLeaderMarksBatch = (programId, leaderId, leaderName, marksPayload, actor) => {
    const newMarks = marksPayload.map(item => ({
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      programId,
      entryId: item.entryId,
      studentId: item.studentId,
      enteredBy: leaderId,
      enteredByName: leaderName,
      sourceRole: 'leader',
      marks: Math.min(10, Math.max(0, parseFloat(item.mark) || 0)),
      status: 'submitted',
      timestamp: new Date().toISOString()
    }));

    batchSaveDocs(COLLECTIONS.MARKS, newMarks, 400);
    setMarks(prev => [...prev, ...newMarks]);
    addAuditLog(actor, 'LEADER_UPLOAD_MARKS', `Leader ${leaderName} uploaded marks for ${newMarks.length} team members`);

    INITIAL_ADMINS.forEach(a => {
      sendNotification(a.id, 'Leader Marks Uploaded', `Team Leader ${leaderName} uploaded marks for program ${programId}. Awaiting review.`, 'submission');
    });
  };

  const adminApproveOrEditMark = (markId, newMarkVal, status = 'approved', actor) => {
    setMarks(prev => prev.map(m => {
      if (m.id === markId) {
        const oldVal = m.marks;
        const updated = {
          ...m,
          marks: newMarkVal != null ? Math.min(10, Math.max(0, parseFloat(newMarkVal))) : m.marks,
          status: status === 'approved' ? (newMarkVal != null && newMarkVal !== oldVal ? 'edited_by_admin' : 'approved') : status,
          adminEditedAt: new Date().toISOString()
        };
        addAuditLog(actor, 'ADMIN_EDIT_MARK', `Admin approved/edited mark ID ${markId} from ${oldVal} to ${updated.marks} (${status})`);
        return updated;
      }
      return m;
    }));
  };

  const deleteMark = (markId, actor) => {
    removeDoc(COLLECTIONS.MARKS, markId);
    setMarks(prev => prev.filter(m => m.id !== markId));
    addAuditLog(actor, 'DELETE_MARK', `Deleted mark ID: ${markId}`);
  };

  // ATTENDANCE
  const recordAttendance = (summitId, session, studentId, status, actor) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.summitId === summitId && a.session === session && a.studentId === studentId);
      if (idx >= 0) {
        return prev.map((item, i) => i === idx ? { ...item, status, markedBy: actor, timestamp: new Date().toISOString() } : item);
      } else {
        const newItem = {
          id: `att_${summitId}_${session}_${studentId}`,
          summitId,
          session,
          studentId,
          status,
          markedBy: actor,
          locked: false,
          timestamp: new Date().toISOString()
        };
        return [...prev, newItem];
      }
    });
    addAuditLog(actor, 'MARK_ATTENDANCE', `Marked attendance ${status} for student ${studentId} in session ${session}`);
  };

  const bulkRecordAttendance = (summitId, session, studentStatuses, actor) => {
    setAttendance(prev => {
      const next = [...prev];
      Object.entries(studentStatuses).forEach(([sId, stat]) => {
        const existingIdx = next.findIndex(a => a.summitId === summitId && a.session === session && a.studentId === sId);
        if (existingIdx >= 0) {
          next[existingIdx] = { ...next[existingIdx], status: stat, markedBy: actor };
        } else {
          next.push({
            id: `att_${summitId}_${session}_${sId}`,
            summitId,
            session,
            studentId: sId,
            status: stat,
            markedBy: actor,
            locked: false
          });
        }
      });
      return next;
    });
    addAuditLog(actor, 'BULK_ATTENDANCE', `Saved attendance for session ${session} (${Object.keys(studentStatuses).length} students)`);
  };

  const toggleAttendanceSessionLock = (summitId, session, lockStatus, actor) => {
    setAttendance(prev => prev.map(a => {
      if (a.summitId === summitId && a.session === session) {
        return { ...a, locked: lockStatus };
      }
      return a;
    }));
    addAuditLog(actor, lockStatus ? 'LOCK_SESSION' : 'UNLOCK_SESSION', `Set lock=${lockStatus} for Summit ${summitId} session ${session}`);
  };

  // NOTICES
  const addNotice = (data, actor) => {
    const newNotice = {
      id: 'n_' + Date.now(),
      title: data.title,
      message: data.message,
      audience: data.audience || 'all',
      author: data.author || 'College Administration',
      date: new Date().toISOString().slice(0, 10),
      publishTime: data.publishTime || new Date().toISOString(),
      status: data.status || 'published',
      pinned: Boolean(data.pinned),
      attachment: data.attachment || null,
      readBy: []
    };
    setNotices(prev => [newNotice, ...prev]);
    addAuditLog(actor, 'CREATE_NOTICE', `Created announcement: "${newNotice.title}" (${newNotice.status})`);
    return newNotice;
  };

  const updateNotice = (id, updates, actor) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    addAuditLog(actor, 'UPDATE_NOTICE', `Updated notice ${id}`);
  };

  const deleteNotice = (id, actor) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    addAuditLog(actor, 'DELETE_NOTICE', `Deleted notice ${id}`);
  };

  const markNoticeRead = (noticeId, userId) => {
    setNotices(prev => prev.map(n => {
      if (n.id === noticeId && !n.readBy.includes(userId)) {
        return { ...n, readBy: [...n.readBy, userId] };
      }
      return n;
    }));
  };

  // CERTIFICATES CRUD & AUTO-ALLOCATION (Top Performers of Month and Class-wise Toppers)
  const addCertificate = (certData, actor = 'admin') => {
    const newCert = {
      id: 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      isPublished: Boolean(certData.isPublished),
      publishedAt: certData.isPublished ? new Date().toISOString() : null,
      ...certData
    };
    setCertificates(prev => [newCert, ...prev]);
    addAuditLog(actor, 'ADD_CERTIFICATE', `Allocated certificate to ${newCert.studentName}: ${newCert.awardTitle}`);
    return newCert;
  };

  const updateCertificate = (id, updates, actor = 'admin') => {
    setCertificates(prev => prev.map(c => {
      if (c.id === id) {
        const next = { ...c, ...updates };
        if (updates.isPublished === true && !c.isPublished) {
          next.publishedAt = new Date().toISOString();
        }
        return next;
      }
      return c;
    }));
    addAuditLog(actor, 'UPDATE_CERTIFICATE', `Updated certificate ${id}`);
  };

  const deleteCertificate = (id, actor = 'admin') => {
    const cert = certificates.find(c => c.id === id);
    setCertificates(prev => prev.filter(c => c.id !== id));
    addAuditLog(actor, 'DELETE_CERTIFICATE', `Deleted certificate of ${cert?.studentName || id}`);
  };

  const togglePublishCertificate = (id, actor = 'admin') => {
    const cert = certificates.find(c => c.id === id);
    if (!cert) return;
    const nextVal = !cert.isPublished;
    updateCertificate(id, {
      isPublished: nextVal,
      publishedAt: nextVal ? new Date().toISOString() : null
    }, actor);
    addAuditLog(actor, nextVal ? 'PUBLISH_CERTIFICATE' : 'UNPUBLISH_CERTIFICATE', `${nextVal ? 'Published' : 'Unpublished'} certificate for ${cert.studentName}`);
  };

  const publishAllMonthCertificates = (month, actor = 'admin') => {
    const nowIso = new Date().toISOString();
    let count = 0;
    setCertificates(prev => prev.map(c => {
      if ((!month || month === 'all' || c.month === month) && !c.isPublished) {
        count++;
        return { ...c, isPublished: true, publishedAt: nowIso };
      }
      return c;
    }));
    addAuditLog(actor, 'PUBLISH_ALL_CERTIFICATES', `Published ${count} certificates${month ? ` for ${month}` : ''}`);
    return count;
  };

  const autoAllocateTopPerformerCertificates = ({ month, topMonthCount = 3, classTopperCount = 1 }, actor = 'admin') => {
    const report = computeComprehensiveReport({
      summits,
      programs,
      entries,
      marks,
      attendance,
      students,
      classes,
      teams,
      fields,
      settings,
      periodMonths: month && month !== 'all' ? [month] : [],
      sectionFilter: 'all',
      classFilter: 'all',
      teamFilter: 'all'
    });

    const mLabel = month && month !== 'all' ? formatMonthLabel(month) : 'Academic Year 2026';
    const newAllocated = [];

    // 1. Top Performers of the Month (Overall Top 3)
    const topPerformers = (report.top10Overall || []).slice(0, topMonthCount);
    topPerformers.forEach((st, idx) => {
      const rankNum = idx + 1;
      const rankSuffix = rankNum === 1 ? '1st Rank' : rankNum === 2 ? '2nd Rank' : `${rankNum}rd Rank`;
      const title = `Top Performer of the Month (${rankSuffix} - Overall)`;

      newAllocated.push({
        id: `cert_${month || 'all'}_top_${st.id}_${rankNum}`,
        month: month || '2026-11',
        monthLabel: mLabel,
        studentId: st.id,
        studentName: st.name,
        cicNo: st.cicNo,
        classId: st.classId,
        className: st.className,
        teamId: st.teamId,
        teamName: st.teamName,
        sectionId: st.sectionId,
        category: 'TOP_PERFORMER_MONTH',
        rank: rankNum,
        awardTitle: title,
        citation: `Conferred with apex distinction for securing ${rankSuffix} among all collegiate participants in the ${mLabel} summits.`,
        marksObtained: st.totalMarksObtained,
        maxMarks: st.totalMaxMarks,
        marksPercentage: st.overallMarksPercentage,
        attendancePercentage: st.overallAttendancePercentage,
        grade: st.overallGrade,
        issueDate: new Date().toISOString().slice(0, 10),
        isPublished: false,
        publishedAt: null
      });
    });

    // 2. Class-Wise Top Performers (Top 1 or Top N for each of the 5 classes)
    classes.forEach(cl => {
      const clReport = (report.classReports || []).find(cr => cr.classId === cl.id);
      const clToppers = (clReport?.top3 || []).slice(0, classTopperCount);

      clToppers.forEach((topper, tIdx) => {
        const topperRank = tIdx + 1;
        const rankSuffix = topperRank === 1 ? '1st Rank' : topperRank === 2 ? '2nd Rank' : `${topperRank}rd Rank`;
        const title = `Class Topper (${rankSuffix} - ${cl.name})`;

        const existingId = `cert_${month || 'all'}_class_${cl.id}_${topper.id}_${topperRank}`;
        newAllocated.push({
          id: existingId,
          month: month || '2026-11',
          monthLabel: mLabel,
          studentId: topper.id,
          studentName: topper.name,
          cicNo: topper.cicNo,
          classId: cl.id,
          className: cl.name,
          teamId: topper.teamId,
          teamName: topper.teamName,
          sectionId: topper.sectionId || cl.sectionId || 'thamheediyya',
          category: 'CLASS_TOPPER',
          rank: topperRank,
          awardTitle: title,
          citation: `Awarded for scholastic distinction and attaining ${rankSuffix} in ${cl.name} during the ${mLabel} academic summits.`,
          marksObtained: topper.totalMarksObtained,
          maxMarks: topper.totalMaxMarks,
          marksPercentage: topper.overallMarksPercentage,
          attendancePercentage: topper.overallAttendancePercentage,
          grade: topper.overallGrade,
          issueDate: new Date().toISOString().slice(0, 10),
          isPublished: false,
          publishedAt: null
        });
      });
    });

    // Merge into existing certificates: replace if existing by ID, or append
    setCertificates(prev => {
      const map = new Map(prev.map(c => [c.id, c]));
      newAllocated.forEach(newC => {
        if (!map.has(newC.id)) {
          map.set(newC.id, newC);
        } else {
          const current = map.get(newC.id);
          if (!current.isPublished) {
            map.set(newC.id, { ...current, ...newC, awardTitle: current.awardTitle, citation: current.citation });
          }
        }
      });
      return Array.from(map.values());
    });

    addAuditLog(actor, 'AUTO_ALLOCATE_CERTIFICATES', `Auto-allocated ${newAllocated.length} certificates for ${mLabel}`);
    return newAllocated.length;
  };

  // SETTINGS
  const updateSettings = (updates, actor) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      saveDoc(COLLECTIONS.SETTINGS, 'general', next);
      return next;
    });
    addAuditLog(actor, 'UPDATE_SETTINGS', `Updated settings: ${Object.keys(updates).join(', ')}`);
  };

  return (
    <AppContext.Provider value={{
      sections,
      classes,
      teams,
      fields,
      programLibrary,
      summits,
      categories,
      judges,
      students,
      archivedStudents,
      programs,
      entries,
      marks,
      attendance,
      notices,
      notifications,
      auditLogs,
      settings,
      classesMap,
      sectionsMap,
      fieldsMap,
      teamsMap,
      summitsMap,
      studentAttendanceMap,
      programResultsMap,
      studentStandings,
      top10Rankings,
      teamStandings,
      fieldPerformanceMap,
      classEvaluations,
      calculateGrade,
      isConsideredPresent,
      updateSection,
      addSection,
      updateClass,
      addField,
      updateField,
      deleteField,
      reorderFields,
      addLibraryProgram,
      updateLibraryProgram,
      deleteLibraryProgram,
      duplicateLibraryProgram,
      bulkImportLibraryPrograms,
      toggleLibraryProgramActive,
      assignProgramToSummit,
      updateSummitProgramAllocation,
      bulkAssignSummitProgramToAllTeams,
      copyTeamAllocationsToOtherTeams,
      copySummitSetup,
      toggleSummitRegistrationLock,
      nominateStudentForProgram,
      removeStudentEntry,
      addStudent,
      updateStudent,
      removeStudent,
      restoreStudent,
      bulkImportStudents,
      autoGenerateAllCredentials,
      autoGenerateChestNumbers,
      addTeam,
      updateTeam,
      deleteTeam,
      bulkAssignTeams,
      appointLeader,
      appointTeamLeader,
      swapTeamLeaders,
      checkSummitRegistrationDeadlines,
      addJudge,
      updateJudge,
      deleteJudge,
      toggleJudgeRestrictions,
      addSummit,
      bulkCreateWeeklySummits,
      bulkCreateAcademicYearSummits,
      updateSummit,
      deleteSummit,
      purgeEmptyPlannedSummits,
      getSummitRunningInfo,
      formatMonthLabel,
      computeComprehensiveReport,
      reportHistory,
      addReportHistory,
      addCategory,
      addProgram,
      updateProgram,
      duplicateProgram,
      cancelProgram,
      toggleProgramStatus,
      assignParticipantsToProgram,
      submitJudgeMark,
      submitLeaderMarksBatch,
      adminApproveOrEditMark,
      deleteMark,
      recordAttendance,
      bulkRecordAttendance,
      toggleAttendanceSessionLock,
      addNotice,
      updateNotice,
      deleteNotice,
      markNoticeRead,
      sendNotification,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearAllNotifications,
      deleteAuditLog,
      clearAuditLogs,
      certificates,
      addCertificate,
      updateCertificate,
      deleteCertificate,
      togglePublishCertificate,
      publishAllMonthCertificates,
      autoAllocateTopPerformerCertificates,
      updateSettings,
      addAuditLog,
      resetAllDataToDefault,
      setActiveUser,
      activeUser,
      activeScreen,
      setActiveScreen,
      exportFullAppData,
      importFullAppData,
      cloudSyncStatus,
      manualCloudSync
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
