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
  INITIAL_WINGS,
  INITIAL_UNION_OFFICIALS,
  INITIAL_WING_PROGRAMS,
  INITIAL_BANNERS,
  INITIAL_SPORTS_GROUPS,
  INITIAL_SPORTS_FIXTURES,
  HASHED_PASSWORDS
} from '../services/initialData';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, STORAGE_KEYS, COLLECTIONS } from '../services/firebase';
import {
  saveDoc,
  removeDoc,
  batchSaveDocs,
  setCurrentScreen,
  subscribeSyncStatus,
  getSyncStatus,
  getCloudUsage,
  retryPendingWrites
} from '../services/firestoreService';
import { migrateLocalDataToCloud } from '../services/migrationService';
import { touchSyncModule } from '../services/syncManager';
import { createAccountSecondary, createBulkAccounts, generateSecurePassword } from '../services/accountCreationService';
import { hashPassword } from '../utils/crypto';
import { getSummitRunningInfo, formatMonthLabel, computeComprehensiveReport } from '../utils/reportCalculations';
import { INITIAL_INSTAGRAM_POSTS } from '../services/instagramFeedService';

export const DEFAULT_MANDATORY_WINGS = [
  {
    id: 'fine_arts',
    name: 'Fine Arts Wing',
    shortName: 'Fine Arts',
    code: 'FAW',
    description: 'Arts, cultural summits, creative performances, master literary & stage competitions',
    icon: 'Palette',
    color: '#0E7C86',
    isSummitModule: true,
    isMandatory: true,
    order: 1
  },
  {
    id: 'sports',
    name: 'Sports & Games Wing',
    shortName: 'Sports',
    code: 'SGW',
    description: 'Annual athletic meets, football, cricket, badminton, volleyball, and physical wellness',
    icon: 'Trophy',
    color: '#D97706',
    isSummitModule: false,
    isMandatory: true,
    order: 4
  }
];

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Shared collegiate collections (Single Source of Truth: Firebase Firestore via onSnapshot)
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [programLibrary, setProgramLibrary] = useState(INITIAL_PROGRAM_LIBRARY);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // Collegiate Master Datasets (with live Firestore onSnapshot streaming)
  const [summits, setSummits] = useState(INITIAL_SUMMITS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [entries, setEntries] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [judges, setJudges] = useState(INITIAL_JUDGES);

  // Multi-Wing Union Hierarchy State (Guaranteed Core Wings: Fine Arts & Sports)
  const [wings, setWings] = useState(DEFAULT_MANDATORY_WINGS);
  const [unionOfficials, setUnionOfficials] = useState(INITIAL_UNION_OFFICIALS);
  const [wingPrograms, setWingPrograms] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [sportsGroups, setSportsGroups] = useState([]);
  const [sportsFixtures, setSportsFixtures] = useState([]);

  // User state for logged-in session (only session is stored in localStorage)
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [activeScreen, setActiveScreen] = useState('dashboard');

  // Purge any stale shared collection keys from localStorage
  useEffect(() => {
    try {
      // 1. If any non-demo officials or wings were created locally in older sessions, safely push to Firestore first
      const syncLocalCustomData = async () => {
        if (!db) return;
        const rawOfficials = localStorage.getItem(STORAGE_KEYS.UNION_OFFICIALS);
        if (rawOfficials) {
          try {
            const parsed = JSON.parse(rawOfficials);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const off of parsed) {
                if (off && off.id && off.name) {
                  await saveDoc(COLLECTIONS.UNION_OFFICIALS, off.id, off);
                }
              }
            }
          } catch (_) {}
        }

        const rawWings = localStorage.getItem(STORAGE_KEYS.WINGS);
        if (rawWings) {
          try {
            const parsed = JSON.parse(rawWings);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const w of parsed) {
                if (w && w.id && w.name) {
                  await saveDoc(COLLECTIONS.WINGS, w.id, w);
                }
              }
            }
          } catch (_) {}
        }
      };

      syncLocalCustomData();

      // 2. Clear all shared keys so localStorage never overrides Firestore
      const keysToPurge = [
        STORAGE_KEYS.STUDENTS,
        STORAGE_KEYS.ARCHIVED_STUDENTS,
        STORAGE_KEYS.SUMMITS,
        STORAGE_KEYS.PROGRAMS,
        STORAGE_KEYS.ENTRIES,
        STORAGE_KEYS.MARKS,
        STORAGE_KEYS.ATTENDANCE,
        STORAGE_KEYS.NOTICES,
        STORAGE_KEYS.NOTIFICATIONS,
        STORAGE_KEYS.AUDIT_LOGS,
        STORAGE_KEYS.CERTIFICATES,
        STORAGE_KEYS.WINGS,
        STORAGE_KEYS.UNION_OFFICIALS,
        STORAGE_KEYS.WING_PROGRAMS,
        STORAGE_KEYS.SPORTS_GROUPS,
        STORAGE_KEYS.SPORTS_FIXTURES,
        STORAGE_KEYS.BANNERS,
        STORAGE_KEYS.INSTAGRAM_POSTS,
        STORAGE_KEYS.JUDGES,
        STORAGE_KEYS.CLASSES,
        STORAGE_KEYS.TEAMS,
        STORAGE_KEYS.SECTIONS,
        STORAGE_KEYS.FIELDS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.PROGRAM_LIBRARY,
        'musf_official_v2026_11_117students',
        'musf_official_v2026_11',
        'musf_report_history'
      ];
      keysToPurge.forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });
    } catch (_) {}
  }, []);

  // Real-Time Firestore Sync (Single Source of Truth across all devices)
  useEffect(() => {
    if (!db) {
      console.warn('[Firestore] Database instance not available, skipping realtime listeners.');
      return;
    }

    const unsubs = [];

    // 0. Automatic Bootstrap Seeding for musf-union-app Firestore Database
    const seedFirestoreIfEmpty = async () => {
      try {
        // Wings
        const wingsCol = collection(db, COLLECTIONS.WINGS);
        const wingsSnap = await getDocs(wingsCol).catch(err => {
          console.error('[Firestore Error] Reading wings:', err);
          return null;
        });
        if (wingsSnap && wingsSnap.empty) {
          console.log('[Firestore] Initializing mandatory wings in musf-union-app...');
          for (const w of DEFAULT_MANDATORY_WINGS) {
            await setDoc(doc(db, COLLECTIONS.WINGS, w.id), w, { merge: true }).catch(err => {
              console.error('[Firestore Write Error] Failed to write wing:', w.id, err);
            });
          }
        }

        // Default Admin (users/admin)
        const adminDocRef = doc(db, COLLECTIONS.USERS, 'admin');
        const adminSnap = await getDoc(adminDocRef).catch(err => {
          console.error('[Firestore Error] Reading users/admin:', err);
          return null;
        });
        if (adminSnap && !adminSnap.exists()) {
          console.log('[Firestore] Initializing default admin in users/admin...');
          await setDoc(adminDocRef, {
            id: 'admin_general',
            username: 'MUSF',
            name: 'MUSF Admin',
            role: 'admin',
            designation: 'Central Administrator',
            email: 'admin@musf.app',
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(err => {
            console.error('[Firestore Write Error] Failed to write default admin:', err);
          });
        }

        // Students (117 collegiate students)
        const studentsCol = collection(db, COLLECTIONS.STUDENTS);
        const studentsSnap = await getDocs(studentsCol).catch(err => {
          console.error('[Firestore Error] Reading students:', err);
          return null;
        });
        if (studentsSnap && studentsSnap.empty && INITIAL_STUDENTS.length > 0) {
          console.log('[Firestore] Seeding 117 students to musf-union-app...');
          await batchSaveDocs(COLLECTIONS.STUDENTS, INITIAL_STUDENTS, 100).catch(err => {
            console.error('[Firestore Write Error] Batch writing students:', err);
          });
          console.log('[Firestore] 117 students successfully created in musf-union-app!');
        }

        // Classes
        const classesSnap = await getDocs(collection(db, COLLECTIONS.CLASSES)).catch(() => null);
        if (classesSnap && classesSnap.empty && INITIAL_CLASSES.length > 0) {
          await batchSaveDocs(COLLECTIONS.CLASSES, INITIAL_CLASSES, 50).catch(err => {
            console.error('[Firestore Write Error] Batch writing classes:', err);
          });
        }

        // Teams
        const teamsSnap = await getDocs(collection(db, COLLECTIONS.TEAMS)).catch(() => null);
        if (teamsSnap && teamsSnap.empty && INITIAL_TEAMS.length > 0) {
          await batchSaveDocs(COLLECTIONS.TEAMS, INITIAL_TEAMS, 50).catch(err => {
            console.error('[Firestore Write Error] Batch writing teams:', err);
          });
        }

        // Summits
        const summitsSnap = await getDocs(collection(db, COLLECTIONS.SUMMITS)).catch(() => null);
        if (summitsSnap && summitsSnap.empty && INITIAL_SUMMITS.length > 0) {
          await batchSaveDocs(COLLECTIONS.SUMMITS, INITIAL_SUMMITS, 50).catch(err => {
            console.error('[Firestore Write Error] Batch writing summits:', err);
          });
        }

        // Sections
        const sectionsSnap = await getDocs(collection(db, COLLECTIONS.SECTIONS)).catch(() => null);
        if (sectionsSnap && sectionsSnap.empty && INITIAL_SECTIONS.length > 0) {
          await batchSaveDocs(COLLECTIONS.SECTIONS, INITIAL_SECTIONS, 50).catch(err => {
            console.error('[Firestore Write Error] Batch writing sections:', err);
          });
        }

        // Fields
        const fieldsSnap = await getDocs(collection(db, COLLECTIONS.FIELDS)).catch(() => null);
        if (fieldsSnap && fieldsSnap.empty && INITIAL_FIELDS.length > 0) {
          await batchSaveDocs(COLLECTIONS.FIELDS, INITIAL_FIELDS, 50).catch(err => {
            console.error('[Firestore Write Error] Batch writing fields:', err);
          });
        }

        // Union Officials
        const officialsSnap = await getDocs(collection(db, COLLECTIONS.UNION_OFFICIALS)).catch(() => null);
        if (officialsSnap && officialsSnap.empty && INITIAL_UNION_OFFICIALS.length > 0) {
          await batchSaveDocs(COLLECTIONS.UNION_OFFICIALS, INITIAL_UNION_OFFICIALS, 50).catch(err => {
            console.error('[Firestore Write Error] Batch writing union officials:', err);
          });
        }

        // Settings
        const settingsSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general')).catch(() => null);
        if (settingsSnap && !settingsSnap.exists()) {
          await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), INITIAL_SETTINGS, { merge: true }).catch(err => {
            console.error('[Firestore Write Error] Writing settings/general:', err);
          });
        }
      } catch (seedErr) {
        console.error('[Firestore Bootstrap Error]:', seedErr);
      }
    };

    seedFirestoreIfEmpty();

    const bindCollection = (colName, setter, fallbackDefault = null, transformFn = null) => {
      try {
        const colRef = collection(db, colName);
        const unsub = onSnapshot(colRef, (snapshot) => {
          let docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
          if (typeof transformFn === 'function') {
            docs = transformFn(docs);
          }
          if (docs.length === 0 && fallbackDefault && fallbackDefault.length > 0) {
            return;
          }
          setter(prev => {
            if (Array.isArray(prev) && prev.length === docs.length) {
              const unchanged = prev.every((p, idx) => p.id === docs[idx]?.id && p.updatedAt === docs[idx]?.updatedAt);
              if (unchanged) return prev;
            }
            return docs;
          });
        }, (err) => {
          console.warn(`[Firestore Sync] Listener notice (${colName}):`, err?.message || err);
        });
        unsubs.push(unsub);
      } catch (e) {
        console.warn(`[Firestore Sync] Setup notice (${colName}):`, e);
      }
    };

    // 1. Wings (Real-time listener + Safe Initialization for Fine Arts & Sports)
    try {
      let wingsInitialized = false;
      const wingsColRef = collection(db, COLLECTIONS.WINGS);
      const unsubWings = onSnapshot(wingsColRef, (snapshot) => {
        let items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));

        const hasFineArts = items.some(w => w.id === 'fine_arts' || w.id === 'fine-arts' || w.isSummitModule || w.name?.toLowerCase().includes('fine art'));
        const hasSports = items.some(w => w.id === 'sports' || w.id === 'sports-wing' || w.name?.toLowerCase().includes('sport'));

        if (!wingsInitialized) {
          wingsInitialized = true;
          if (!hasFineArts) {
            const defaultFineArts = {
              id: 'fine_arts',
              name: 'Fine Arts Wing',
              shortName: 'Fine Arts',
              code: 'FAW',
              description: 'Arts, cultural summits, creative performances, master literary & stage competitions',
              icon: 'Palette',
              color: '#0E7C86',
              isSummitModule: true,
              isMandatory: true,
              order: 1
            };
            setDoc(doc(db, COLLECTIONS.WINGS, 'fine_arts'), defaultFineArts, { merge: true }).catch(err => {
              console.error('[Firestore Write Error] fine_arts wing:', err);
            });
          }

          if (!hasSports) {
            const defaultSports = {
              id: 'sports',
              name: 'Sports & Games Wing',
              shortName: 'Sports',
              code: 'SGW',
              description: 'Annual athletic meets, football, cricket, badminton, volleyball, and physical wellness',
              icon: 'Trophy',
              color: '#D97706',
              isSummitModule: false,
              isMandatory: true,
              order: 4
            };
            setDoc(doc(db, COLLECTIONS.WINGS, 'sports'), defaultSports, { merge: true }).catch(err => {
              console.error('[Firestore Write Error] sports wing:', err);
            });
          }
        }

        if (items.length === 0) {
          items = DEFAULT_MANDATORY_WINGS;
        }

        const sanitizedWings = items.map(w => {
          if (w.id === 'fine_arts' || w.id === 'fine-arts' || w.isSummitModule || w.name?.toLowerCase().includes('fine art')) {
            return { ...w, isMandatory: true, isSummitModule: true };
          }
          if (w.id === 'sports' || w.id === 'sports-wing' || w.name?.toLowerCase().includes('sport')) {
            return { ...w, isMandatory: true };
          }
          return w;
        });

        setWings(prev => {
          if (prev.length === sanitizedWings.length && prev.every((w, i) => w.id === sanitizedWings[i]?.id)) {
            return prev;
          }
          return sanitizedWings;
        });
      }, (err) => {
        console.warn('[Firestore Sync] Wings listener notice:', err);
      });
      unsubs.push(unsubWings);
    } catch (e) {
      console.warn('[Firestore Sync] Wings setup notice:', e);
    }

    // 2. Default Admin Safe Initialization in Firestore ('users/admin')
    try {
      const adminDocRef = doc(db, COLLECTIONS.USERS, 'admin');
      getDoc(adminDocRef).then((adminSnap) => {
        if (!adminSnap.exists()) {
          setDoc(adminDocRef, {
            id: 'admin_general',
            username: 'MUSF',
            name: 'MUSF Admin',
            role: 'admin',
            designation: 'Central Administrator',
            email: 'admin@musf.app',
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(err => {
            console.error('[Firestore Write Error] admin user doc:', err);
          });
        }
      }).catch(err => {
        console.error('[Firestore Error] adminDocRef:', err);
      });
    } catch (e) {
      console.error('[Firestore Setup Error] Admin user doc:', e);
    }

    // 3. Bind all shared collections with collegiate defaults
    bindCollection(COLLECTIONS.STUDENTS, setStudents, INITIAL_STUDENTS);
    bindCollection(COLLECTIONS.UNION_OFFICIALS, setUnionOfficials, INITIAL_UNION_OFFICIALS);
    bindCollection(COLLECTIONS.SUMMITS, setSummits, INITIAL_SUMMITS);
    bindCollection(COLLECTIONS.PROGRAMS, setPrograms, INITIAL_PROGRAMS);
    bindCollection(COLLECTIONS.PROGRAM_LIBRARY, setProgramLibrary, INITIAL_PROGRAM_LIBRARY);
    bindCollection(COLLECTIONS.CLASSES, setClasses, INITIAL_CLASSES);
    bindCollection(COLLECTIONS.TEAMS, setTeams, INITIAL_TEAMS);
    bindCollection(COLLECTIONS.SECTIONS, setSections, INITIAL_SECTIONS);
    bindCollection(COLLECTIONS.FIELDS, setFields, INITIAL_FIELDS);
    bindCollection(COLLECTIONS.JUDGES, setJudges, INITIAL_JUDGES);
    bindCollection(COLLECTIONS.NOTICES, setNotices, [], (docs) => {
      return (docs || []).filter(n =>
        n &&
        !n.id?.startsWith('notice_0') &&
        !n.id?.startsWith('notice_demo') &&
        !n.title?.includes('Fine Arts Summit 2026: 101 Master Events') &&
        !n.title?.includes('Inter-Squad Football Championship') &&
        !n.title?.includes('College Literary Journal')
      );
    });
    bindCollection(COLLECTIONS.WING_PROGRAMS, setWingPrograms);
    bindCollection(COLLECTIONS.SPORTS_GROUPS, setSportsGroups);
    bindCollection(COLLECTIONS.SPORTS_FIXTURES, setSportsFixtures);
    bindCollection(COLLECTIONS.BANNERS, setBanners);
    bindCollection(COLLECTIONS.ENTRIES, setEntries);
    bindCollection(COLLECTIONS.MARKS, setMarks);
    bindCollection(COLLECTIONS.ATTENDANCE, setAttendance);
    bindCollection(COLLECTIONS.CERTIFICATES, setCertificates);
    bindCollection(COLLECTIONS.NOTIFICATIONS, setNotifications, null, (docs) => {
      return (docs || []).filter(n =>
        n &&
        !n.id?.startsWith('notif_demo') &&
        n.id !== 'notif-1' &&
        n.id !== 'notif-2' &&
        !n.title?.includes('October Summit 1 Calligraphy')
      );
    });
    bindCollection(COLLECTIONS.CATEGORIES, (items) => {
      if (items && items.length > 0) {
        setCategories(items.map(c => c.name || c.id || c));
      }
    }, INITIAL_CATEGORIES);

    // 4. Settings Document ('settings/general')
    try {
      const settingsDocRef = doc(db, COLLECTIONS.SETTINGS, 'general');
      const unsubSettings = onSnapshot(settingsDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings(prev => ({ ...prev, ...data }));
        }
      }, (err) => {
        console.warn('[Firestore Sync] Settings listener notice:', err);
      });
      unsubs.push(unsubSettings);
    } catch (e) {
      console.warn('[Firestore Sync] Settings listener setup notice:', e);
    }

    return () => {
      unsubs.forEach(unsub => {
        try { if (typeof unsub === 'function') unsub(); } catch (_) {}
      });
    };
  }, []);


  // 1-Click Multi-Device Backup & Direct Sync Tools
  const exportFullAppData = () => {
    const data = {
      app: 'MUSF Students Union & Summit Register',
      college: 'Majlis Umariyya Wafy College',
      version: '7.0',
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
      sections,
      fields,
      settings,
      notices,
      certificates,
      wings,
      unionOfficials,
      wingPrograms,
      sportsGroups,
      sportsFixtures,
      banners
    };
    return JSON.stringify(data, null, 2);
  };

  const importFullAppData = async (jsonString) => {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
      if (Array.isArray(data.summits)) { setSummits(data.summits); await batchSaveDocs(COLLECTIONS.SUMMITS, data.summits); }
      if (Array.isArray(data.programs)) { setPrograms(data.programs); await batchSaveDocs(COLLECTIONS.PROGRAMS, data.programs); }
      if (Array.isArray(data.programLibrary)) { setProgramLibrary(data.programLibrary); await batchSaveDocs(COLLECTIONS.PROGRAM_LIBRARY, data.programLibrary); }
      if (Array.isArray(data.students)) { setStudents(data.students); await batchSaveDocs(COLLECTIONS.STUDENTS, data.students); }
      if (Array.isArray(data.entries)) { setEntries(data.entries); await batchSaveDocs(COLLECTIONS.ENTRIES, data.entries); }
      if (Array.isArray(data.marks)) { setMarks(data.marks); await batchSaveDocs(COLLECTIONS.MARKS, data.marks); }
      if (Array.isArray(data.attendance)) { setAttendance(data.attendance); await batchSaveDocs(COLLECTIONS.ATTENDANCE, data.attendance); }
      if (Array.isArray(data.judges)) { setJudges(data.judges); await batchSaveDocs(COLLECTIONS.JUDGES, data.judges); }
      if (Array.isArray(data.teams)) { setTeams(data.teams); await batchSaveDocs(COLLECTIONS.TEAMS, data.teams); }
      if (Array.isArray(data.classes)) { setClasses(data.classes); await batchSaveDocs(COLLECTIONS.CLASSES, data.classes); }
      if (Array.isArray(data.sections)) { setSections(data.sections); await batchSaveDocs(COLLECTIONS.SECTIONS, data.sections); }
      if (Array.isArray(data.fields)) { setFields(data.fields); await batchSaveDocs(COLLECTIONS.FIELDS, data.fields); }
      if (Array.isArray(data.wings)) { setWings(data.wings); await batchSaveDocs(COLLECTIONS.WINGS, data.wings); }
      if (Array.isArray(data.unionOfficials)) { setUnionOfficials(data.unionOfficials); await batchSaveDocs(COLLECTIONS.UNION_OFFICIALS, data.unionOfficials); }
      if (Array.isArray(data.wingPrograms)) { setWingPrograms(data.wingPrograms); await batchSaveDocs(COLLECTIONS.WING_PROGRAMS, data.wingPrograms); }
      if (Array.isArray(data.sportsGroups)) { setSportsGroups(data.sportsGroups); await batchSaveDocs(COLLECTIONS.SPORTS_GROUPS, data.sportsGroups); }
      if (Array.isArray(data.sportsFixtures)) { setSportsFixtures(data.sportsFixtures); await batchSaveDocs(COLLECTIONS.SPORTS_FIXTURES, data.sportsFixtures); }
      if (Array.isArray(data.banners)) { setBanners(data.banners); await batchSaveDocs(COLLECTIONS.BANNERS, data.banners); }
      if (data.settings && typeof data.settings === 'object') {
        setSettings(prev => ({ ...prev, ...data.settings }));
        await saveDoc(COLLECTIONS.SETTINGS, 'general', data.settings);
      }
      if (Array.isArray(data.notices)) { setNotices(data.notices); await batchSaveDocs(COLLECTIONS.NOTICES, data.notices); }
      if (Array.isArray(data.certificates)) { setCertificates(data.certificates); await batchSaveDocs(COLLECTIONS.CERTIFICATES, data.certificates); }

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
      if (!status) return;
      setCloudSyncStatus(prev => {
        if (
          prev?.state === status.state &&
          prev?.isOffline === status.isOffline &&
          prev?.quotaExhausted === status.quotaExhausted &&
          prev?.pendingWritesCount === status.pendingWritesCount
        ) {
          return prev;
        }
        return status;
      });
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
      try { localStorage.removeItem(k); } catch { }
    });
    try { localStorage.removeItem('musf_admin_hash'); } catch { }
    try { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); } catch { }
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

  // Notification Dispatcher (Explicitly Created by Admin, Chairman, or Wing Members)
  const sendNotification = (userId = 'all', title = 'Official Announcement', message = '', type = 'broadcast', metadata = {}, creatorInfo = null) => {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: userId || 'all',
      title: title || 'Official Announcement',
      message: message || '',
      type: type || 'broadcast',
      read: false,
      readBy: [],
      author: creatorInfo?.name || creatorInfo?.author || 'Administration',
      authorRole: creatorInfo?.role || 'admin',
      authorDesignation: creatorInfo?.designation || '',
      wingId: creatorInfo?.wingId || metadata?.wingId || null,
      wingName: creatorInfo?.wingName || metadata?.wingName || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };
    saveDoc(COLLECTIONS.NOTIFICATIONS, newNotif.id, newNotif);
    touchSyncModule('notifications').catch(() => {});
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationRead = (notifId, userId) => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        if (n.id === notifId) {
          const currentReadBy = Array.isArray(n.readBy) ? n.readBy : [];
          const nextReadBy = userId && !currentReadBy.includes(userId) ? [...currentReadBy, userId] : currentReadBy;
          const isBroadcast = !n.userId || n.userId === 'all' || n.userId === 'students' || n.userId === 'leaders' || n.userId === 'judges';
          const upd = {
            ...n,
            readBy: nextReadBy,
            read: isBroadcast ? n.read : true
          };
          saveDoc(COLLECTIONS.NOTIFICATIONS, notifId, upd);
          return upd;
        }
        return n;
      });
      return updated;
    });
  };

  const markAllNotificationsRead = (userId) => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        const isBroadcast = !n.userId || n.userId === 'all' || n.userId === 'students' || n.userId === 'leaders' || n.userId === 'judges';
        const currentReadBy = Array.isArray(n.readBy) ? n.readBy : [];
        const nextReadBy = userId && !currentReadBy.includes(userId) ? [...currentReadBy, userId] : currentReadBy;
        return {
          ...n,
          readBy: nextReadBy,
          read: isBroadcast ? n.read : (n.userId === userId ? true : n.read)
        };
      });
      return updated;
    });
  };

  const deleteNotification = (notifId, actor = 'admin') => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    removeDoc(COLLECTIONS.NOTIFICATIONS, notifId);
    touchSyncModule('notifications').catch(() => {});
    addAuditLog(actor, 'DELETE_NOTIFICATION', `Deleted notification ID: ${notifId}`);
  };

  const clearAllNotifications = (userId = null, actor = 'admin') => {
    if (userId && userId !== 'all') {
      const toRemove = notifications.filter(n => n.userId === userId || n.userId === 'all');
      toRemove.forEach(n => removeDoc(COLLECTIONS.NOTIFICATIONS, n.id));
      setNotifications(prev => prev.filter(n => n.userId !== userId && n.userId !== 'all'));
    } else {
      notifications.forEach(n => removeDoc(COLLECTIONS.NOTIFICATIONS, n.id));
      setNotifications([]);
    }
    touchSyncModule('notifications').catch(() => {});
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
      let nextSec = null;
      setSections(prev => prev.map(s => {
        if (s.id === id) {
          nextSec = { ...s, ...updates };
          return nextSec;
        }
        return s;
      }));
      if (nextSec) {
        saveDoc(COLLECTIONS.SECTIONS, id, nextSec);
      }
      addAuditLog(actor, 'UPDATE_SECTION', `Updated section ${id}: ${Object.keys(updates).join(', ')}`);
    };

    const addSection = (secData, actor) => {
      const newSec = {
        id: secData.id || ('sec_' + Date.now()),
        name: secData.name,
        order: sections.length + 1,
        description: secData.description || ''
      };
      setSections(prev => [...prev, newSec]);
      saveDoc(COLLECTIONS.SECTIONS, newSec.id, newSec);
      addAuditLog(actor, 'ADD_SECTION', `Created new section: ${newSec.name}`);
      return newSec;
    };

    // CLASSES CRUD (including section assignment & moving)
    const addClass = (classData, actor) => {
      const newClass = {
        id: classData.id || ('cls_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
        name: classData.name,
        sectionId: classData.sectionId || 'thamheediyya',
        order: classes.length + 1
      };
      setClasses(prev => [...prev, newClass]);
      saveDoc(COLLECTIONS.CLASSES, newClass.id, newClass);
      addAuditLog(actor, 'ADD_CLASS', `Added academic class: ${newClass.name} (${newClass.sectionId})`);
      return newClass;
    };

    const updateClass = (id, updates, actor) => {
      let updatedClass = null;
      setClasses(prev => prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          updatedClass = updated;
          addAuditLog(actor, 'UPDATE_CLASS', `Updated class ${c.name} (${Object.keys(updates).join(', ')})`);
          return updated;
        }
        return c;
      }));

      if (updatedClass) {
        saveDoc(COLLECTIONS.CLASSES, id, updatedClass);
      }

      // If section changed, update all students belonging to this class
      if (updates.sectionId) {
        setStudents(prev => prev.map(s => {
          if (s.classId === id) {
            const updatedStudent = { ...s, sectionId: updates.sectionId };
            saveDoc(COLLECTIONS.STUDENTS, s.id, updatedStudent);
            return updatedStudent;
          }
          return s;
        }));
      }
    };

    const deleteClass = (id, targetMoveClassId, actor) => {
      if (targetMoveClassId) {
        setStudents(prev => prev.map(s => {
          if (s.classId === id) {
            const updatedStudent = { ...s, classId: targetMoveClassId };
            saveDoc(COLLECTIONS.STUDENTS, s.id, updatedStudent);
            return updatedStudent;
          }
          return s;
        }));
      }
      const c = classes.find(x => x.id === id);
      setClasses(prev => prev.filter(x => x.id !== id));
      removeDoc(COLLECTIONS.CLASSES, id);
      addAuditLog(actor, 'DELETE_CLASS', `Deleted class: ${c?.name || id}`);
    };

    // FIELDS CRUD
    const addField = (fieldData, actor) => {
      const newField = {
        id: fieldData.id || ('f_' + Date.now()),
        name: fieldData.name,
        sectionId: fieldData.sectionId || 'aliya',
        order: fields.length + 1,
        description: fieldData.description || ''
      };
      setFields(prev => [...prev, newField]);
      saveDoc(COLLECTIONS.FIELDS, newField.id, newField);
      addAuditLog(actor, 'ADD_FIELD', `Created field "${newField.name}" for section ${newField.sectionId}`);
      return newField;
    };

    const updateField = (id, updates, actor) => {
      let nextField = null;
      setFields(prev => prev.map(f => {
        if (f.id === id) {
          nextField = { ...f, ...updates };
          return nextField;
        }
        return f;
      }));
      if (nextField) {
        saveDoc(COLLECTIONS.FIELDS, id, nextField);
      }
      addAuditLog(actor, 'UPDATE_FIELD', `Updated field ${id}`);
    };

    const deleteField = (id, actor) => {
      const f = fields.find(x => x.id === id);
      setFields(prev => prev.filter(x => x.id !== id));
      removeDoc(COLLECTIONS.FIELDS, id);
      addAuditLog(actor, 'DELETE_FIELD', `Deleted field: ${f?.name || id}`);
    };

    const reorderFields = (newOrderList, actor) => {
      setFields(newOrderList);
      batchSaveDocs(COLLECTIONS.FIELDS, newOrderList);
      addAuditLog(actor, 'REORDER_FIELDS', 'Reordered program fields');
    };

    // MASTER PROGRAM LIBRARY CRUD
    const addLibraryProgram = (data, actor) => {
      const newProg = {
        id: data.id || ('lib_' + Date.now()),
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
      saveDoc(COLLECTIONS.PROGRAM_LIBRARY, newProg.id, newProg);
      addAuditLog(actor, 'ADD_LIBRARY_PROGRAM', `Added program to library: ${newProg.name} (${newProg.sectionId})`);
      return newProg;
    };

    const updateLibraryProgram = (id, updates, actor) => {
      let nextProg = null;
      setProgramLibrary(prev => prev.map(p => {
        if (p.id === id) {
          nextProg = { ...p, ...updates };
          return nextProg;
        }
        return p;
      }));
      if (nextProg) {
        saveDoc(COLLECTIONS.PROGRAM_LIBRARY, id, nextProg);
      }
      addAuditLog(actor, 'UPDATE_LIBRARY_PROGRAM', `Updated library program ${id}`);
    };

    const deleteLibraryProgram = (id, actor) => {
      const p = programLibrary.find(x => x.id === id);
      setProgramLibrary(prev => prev.filter(x => x.id !== id));
      removeDoc(COLLECTIONS.PROGRAM_LIBRARY, id);
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
      saveDoc(COLLECTIONS.PROGRAM_LIBRARY, duplicated.id, duplicated);
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
      batchSaveDocs(COLLECTIONS.PROGRAM_LIBRARY, newItems);
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

      // Auto-dispatch broadcast notification to all students & dashboards for new committee/summit program
      try {
        const summitObj = summitsMap[summitId] || summits.find(s => s.id === summitId);
        const sectionLabel = newProg.sectionId === 'both' ? 'All Sections' : (newProg.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya');
        sendNotification(
          'all',
          `🎨 [Fine Arts / Summit] New Program: ${newProg.name}`,
          `New competition "${newProg.name}" (${sectionLabel}) added to ${summitObj?.name || 'Summit Register'}. Student nominations are now open!`,
          'broadcast',
          { summitId, programId: newProg.id, wingId: 'fine_arts', linkTab: 'programs' }
        );
      } catch (e) {
        console.warn('Summit program notification dispatch skipped:', e);
      }

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

      const isAdmin = actor === 'admin' || actor?.role === 'admin' || actor?.includes?.('admin') || actor?.includes?.('convener') || actor?.role === 'convener' || actor?.includes?.('secretary') || actor?.includes?.('chairman') || actor?.role === 'executive';
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

        saveDoc(COLLECTIONS.ENTRIES, newEntry.id, newEntry);
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
      const isAdmin = actor === 'admin' || actor?.role === 'admin' || actor?.includes?.('admin') || actor?.includes?.('convener') || actor?.role === 'convener' || actor?.includes?.('secretary') || actor?.includes?.('chairman') || actor?.role === 'executive';

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
        className: cl?.name || studentData.className || 'Class 1',
        teamId: studentData.teamId || '',
        sectionId: studentSectionId,
        fieldId: studentData.fieldId || (studentSectionId === 'aliya' ? (fields.find(f => f.sectionId === 'aliya')?.id || '') : 'f_foundation'),
        username: studentData.username || studentData.cicNo,
        initialPassword: password,
        passwordHash,
        chestNo,
        phone: studentData.phone || '',
        place: studentData.place || '',
        address: studentData.address || '',
        dob: studentData.dob || '',
        bloodGroup: studentData.bloodGroup || '',
        photoUrl: studentData.photoUrl || '',
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
          if (updates.cicNo) {
            if (!s.username || s.username === s.cicNo) {
              updated.username = updates.cicNo;
            }
          }
          if (updates.classId && classesMap[updates.classId]) {
            updated.sectionId = classesMap[updates.classId].sectionId;
            updated.className = classesMap[updates.classId].name;
          }
          if (updates.fieldId !== undefined) {
            updated.fieldId = updates.fieldId;
          }
          saveDoc(COLLECTIONS.STUDENTS, id, updated);
          addAuditLog(actor, 'UPDATE_STUDENT', `Updated student ${updated.name} (${updated.cicNo})`);
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
      if (!Array.isArray(list) || list.length === 0) return { addedCount: 0, updatedCount: 0, total: 0 };

      const toSaveInFirestore = [];
      let addedCount = 0;
      let updatedCount = 0;

      const existingByCic = new Map((students || []).map(s => [String(s?.cicNo || '').toLowerCase().trim(), s]));
      const existingById = new Map((students || []).map(s => [s.id, s]));
      const processedList = [];

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const cicKey = String(item.cicNo || '').toLowerCase().trim();
        const existing = (item.id && existingById.get(item.id)) || existingByCic.get(cicKey);
        const cl = classesMap[item.classId];
        const studentPass = item.password || item.cicNo || 'student123';

        if (existing) {
          // Update existing student record without blocking
          updatedCount++;
          const updatedStudent = {
            ...existing,
            name: item.name || existing.name,
            classId: item.classId || existing.classId,
            className: cl?.name || item.className || existing.className || 'Class 1',
            sectionId: cl?.sectionId || item.sectionId || existing.sectionId || 'thamheediyya',
            teamId: item.teamId !== undefined ? item.teamId : existing.teamId,
            fieldId: item.fieldId !== undefined ? item.fieldId : existing.fieldId,
            phone: item.phone || existing.phone || '',
            place: item.place || existing.place || '',
            address: item.address || existing.address || '',
            dob: item.dob || existing.dob || '',
            bloodGroup: item.bloodGroup || existing.bloodGroup || '',
            photoUrl: item.photoUrl || existing.photoUrl || '',
            updatedAt: new Date().toISOString()
          };
          processedList.push(updatedStudent);
          toSaveInFirestore.push(updatedStudent);
        } else {
          // Create new student
          addedCount++;
          const newId = item.id || ('s_' + Date.now() + '_' + i + '_' + Math.floor(Math.random() * 1000));
          const passwordHash = await hashPassword(studentPass);
          const chestNo = item.chestNo || `C-${100 + (students || []).length + addedCount}`;

          const newStudent = {
            id: newId,
            name: item.name,
            cicNo: item.cicNo,
            classId: item.classId,
            className: cl?.name || item.className || 'Class 1',
            teamId: item.teamId || '',
            sectionId: cl?.sectionId || item.sectionId || 'thamheediyya',
            fieldId: item.fieldId || (cl?.sectionId === 'aliya' ? (fields.find(f => f.sectionId === 'aliya')?.id || '') : 'f_foundation'),
            username: item.username || item.cicNo,
            initialPassword: studentPass,
            passwordHash,
            chestNo,
            phone: item.phone || '',
            place: item.place || '',
            address: item.address || '',
            dob: item.dob || '',
            bloodGroup: item.bloodGroup || '',
            photoUrl: item.photoUrl || '',
            isLeader: false,
            createdAt: new Date().toISOString()
          };
          processedList.push(newStudent);
          toSaveInFirestore.push(newStudent);
        }
      }

      setStudents(prev => {
        const map = new Map((prev || []).map(s => [String(s.cicNo || '').toLowerCase().trim(), s]));
        for (const p of processedList) {
          map.set(String(p.cicNo || '').toLowerCase().trim(), p);
        }
        const combined = Array.from(map.values());
        return combined;
      });

      try {
        await batchSaveDocs(COLLECTIONS.STUDENTS, toSaveInFirestore);
      } catch (e) {
        console.warn('[Students] Batch save notice:', e);
      }

      addAuditLog(actor, 'BULK_IMPORT_STUDENTS', `Processed ${list.length} students (${addedCount} added, ${updatedCount} updated) via import`);
      return { addedCount, updatedCount, total: list.length };
    };

    const restoreDefaultStudents = async (actor = 'admin') => {
      setStudents(INITIAL_STUDENTS);
      try {
        await batchSaveDocs(COLLECTIONS.STUDENTS, INITIAL_STUDENTS);
      } catch (e) {
        console.warn('[Students] Restore batch save notice:', e);
      }
      addAuditLog(actor, 'RESTORE_DEFAULT_STUDENTS', `Restored ${INITIAL_STUDENTS.length} official collegiate students to directory`);
      return INITIAL_STUDENTS.length;
    };

    const autoGenerateAllCredentials = async (actor, onProgress) => {
      const updated = [];
      const credentialsSheet = [];
      const accountsToCreate = [];

      for (const s of students) {
        const genUsername = s.cicNo ? s.cicNo.toLowerCase().replace(/[^a-z0-9]/g, '') : `student_${s.id}`;
        const genPassword = generateSecurePassword('Wafy');

        updated.push({
          ...s,
          username: genUsername,
          hasAccount: true
        });

        accountsToCreate.push({
          username: genUsername,
          password: genPassword,
          role: 'student',
          name: s.name,
          teamId: s.teamId,
          section: s.sectionId,
          studentId: s.id,
          classId: s.classId,
          cicNo: s.cicNo
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

      // Create Firebase Auth accounts asynchronously via secondary auth
      try {
        await createBulkAccounts(accountsToCreate, onProgress);
      } catch (e) {
        console.warn('[autoGenerateAllCredentials] Bulk creation notice:', e);
      }

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
        id: teamData.id || ('t_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
        name: teamData.name,
        color: teamData.color || '#0E7C86',
        leaderId: null,
        leader1Id: null,
        leader2Id: null
      };
      setTeams(prev => [...prev, newTeam]);
      saveDoc(COLLECTIONS.TEAMS, newTeam.id, newTeam);
      addAuditLog(actor, 'ADD_TEAM', `Created house team: ${newTeam.name}`);
      return newTeam;
    };

    const updateTeam = (id, updates, actor) => {
      let nextTeam = null;
      setTeams(prev => prev.map(t => {
        if (t.id === id) {
          nextTeam = { ...t, ...updates };
          return nextTeam;
        }
        return t;
      }));
      if (nextTeam) {
        saveDoc(COLLECTIONS.TEAMS, id, nextTeam);
      }
      if (updates.name) {
        setStudents(prev => prev.map(s => {
          if (s.teamId === id) {
            const upd = { ...s, teamName: updates.name };
            saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
            return upd;
          }
          return s;
        }));
      }
      addAuditLog(actor, 'UPDATE_TEAM', `Updated team ${id}: ${Object.keys(updates).join(', ')}`);
    };

    const deleteTeam = (id, targetMoveTeamId, actor) => {
      const targetTeam = teams.find(t => t.id === targetMoveTeamId);
      if (targetMoveTeamId && targetTeam) {
        setStudents(prev => prev.map(s => {
          if (s.teamId === id) {
            const upd = { ...s, teamId: targetMoveTeamId, teamName: targetTeam.name };
            saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
            return upd;
          }
          return s;
        }));
      } else {
        setStudents(prev => prev.map(s => {
          if (s.teamId === id) {
            const upd = { ...s, teamId: null, teamName: null, isLeader: false, leaderRole: null };
            saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
            return upd;
          }
          return s;
        }));
      }
      const t = teams.find(x => x.id === id);
      setTeams(prev => prev.filter(x => x.id !== id));
      removeDoc(COLLECTIONS.TEAMS, id);
      addAuditLog(actor, 'DELETE_TEAM', `Deleted team ${t?.name || id}`);
    };

    const bulkAssignTeams = (assignments, actor) => {
      const updated = [];
      setStudents(prev => prev.map(s => {
        if (assignments[s.id] !== undefined) {
          const upd = { ...s, teamId: assignments[s.id] };
          updated.push(upd);
          return upd;
        }
        return s;
      }));
      if (updated.length > 0) {
        batchSaveDocs(COLLECTIONS.STUDENTS, updated);
      }
      addAuditLog(actor, 'BULK_ASSIGN_TEAMS', `Reassigned teams for ${Object.keys(assignments).length} students`);
    };

    // TWO LEADERS PER TEAM CRUD & SWAP
    const appointTeamLeader = async ({ teamId, leaderRole = 'leader1', studentId, leaderUsername, leaderPassword, sectionRestriction = 'all' }, actor) => {
      const passwordHash = await hashPassword(leaderPassword || 'leader123');
      const team = teams.find(t => t.id === teamId);
      const targetStudent = students.find(s => s.id === studentId);

      // Update Team leaders (leader1Id & leader2Id)
      let updatedTeam = null;
      setTeams(prev => prev.map(t => {
        if (t.id === teamId) {
          if (leaderRole === 'leader2') {
            updatedTeam = { ...t, leader2Id: studentId };
          } else {
            updatedTeam = { ...t, leader1Id: studentId, leaderId: studentId };
          }
          return updatedTeam;
        }
        return t;
      }));
      if (updatedTeam) {
        saveDoc(COLLECTIONS.TEAMS, teamId, updatedTeam);
      }

      // Update Students:
      // Any existing student holding this leaderRole in this team reverts to normal member
      setStudents(prev => prev.map(s => {
        if (s.teamId === teamId) {
          if (s.id === studentId) {
            const upd = {
              ...s,
              isLeader: true,
              leaderRole,
              leaderUsername: leaderUsername || `leader_${s.username}`,
              leaderPasswordHash: passwordHash,
              leaderSectionRestriction: sectionRestriction || 'all'
            };
            saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
            return upd;
          } else if (s.isLeader && s.leaderRole === leaderRole) {
            // Replaced leader becomes a normal member
            const upd = {
              ...s,
              isLeader: false,
              leaderRole: null,
              leaderUsername: null,
              leaderPasswordHash: null,
              leaderSectionRestriction: null
            };
            saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
            return upd;
          }
        }
        return s;
      }));

      // Create Secondary Auth Account for Leader (without logging out admin)
      try {
        await createAccountSecondary({
          username: leaderUsername || `leader_${targetStudent?.username || studentId}`,
          password: leaderPassword || 'leader123',
          role: 'leader',
          name: targetStudent?.name || 'Leader',
          teamId,
          section: sectionRestriction || 'all',
          studentId
        });
      } catch (authErr) {
        console.warn('[appointTeamLeader] Secondary Auth creation notice:', authErr);
      }

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

      let updatedTeam = null;
      setTeams(prev => prev.map(t => {
        if (t.id === teamId) {
          updatedTeam = {
            ...t,
            leader1Id: leader2.id,
            leader2Id: leader1.id,
            leaderId: leader2.id
          };
          return updatedTeam;
        }
        return t;
      }));
      if (updatedTeam) {
        saveDoc(COLLECTIONS.TEAMS, teamId, updatedTeam);
      }

      setStudents(prev => prev.map(s => {
        if (s.id === leader1.id) {
          const upd = { ...s, leaderRole: 'leader2' };
          saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
          return upd;
        }
        if (s.id === leader2.id) {
          const upd = { ...s, leaderRole: 'leader1' };
          saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
          return upd;
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
        addAuditLog('system', 'DEADLINE_ALERT', `Unfilled slot alert noted for "${summit.name}" (${summaryMsg})`);
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
      saveDoc(COLLECTIONS.JUDGES, newJudge.id, newJudge);

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

      // Create Secondary Auth Account for Judge (without logging out admin)
      try {
        await createAccountSecondary({
          username: judgeData.username,
          password: judgeData.password || 'judge123',
          role: 'judge',
          name: judgeData.name,
          judgeId: newId
        });
      } catch (authErr) {
        console.warn('[addJudge] Secondary Auth creation notice:', authErr);
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
      let updatedJudge = null;
      setJudges(prev => prev.map(j => {
        if (j.id === id) {
          updatedJudge = { ...j, ...finalUpdates };
          return updatedJudge;
        }
        return j;
      }));
      if (updatedJudge) {
        saveDoc(COLLECTIONS.JUDGES, id, updatedJudge);
      }

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
      removeDoc(COLLECTIONS.JUDGES, id);
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
      let updatedMark = null;
      setMarks(prev => prev.map(m => {
        if (m.id === markId) {
          const oldVal = m.marks;
          const updated = {
            ...m,
            marks: newMarkVal != null ? Math.min(10, Math.max(0, parseFloat(newMarkVal))) : m.marks,
            status: status === 'approved' ? (newMarkVal != null && newMarkVal !== oldVal ? 'edited_by_admin' : 'approved') : status,
            adminEditedAt: new Date().toISOString()
          };
          updatedMark = updated;
          addAuditLog(actor, 'ADMIN_EDIT_MARK', `Admin approved/edited mark ID ${markId} from ${oldVal} to ${updated.marks} (${status})`);
          return updated;
        }
        return m;
      }));
      if (updatedMark) {
        saveDoc(COLLECTIONS.MARKS, markId, updatedMark);
      }
    };

    const deleteMark = (markId, actor) => {
      removeDoc(COLLECTIONS.MARKS, markId);
      setMarks(prev => prev.filter(m => m.id !== markId));
      addAuditLog(actor, 'DELETE_MARK', `Deleted mark ID: ${markId}`);
    };

    // ATTENDANCE
    const recordAttendance = (summitId, session, studentId, status, actor) => {
      let savedItem = null;
      setAttendance(prev => {
        const idx = prev.findIndex(a => a.summitId === summitId && a.session === session && a.studentId === studentId);
        if (idx >= 0) {
          const updated = { ...prev[idx], status, markedBy: actor, timestamp: new Date().toISOString() };
          savedItem = updated;
          return prev.map((item, i) => i === idx ? updated : item);
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
          savedItem = newItem;
          return [...prev, newItem];
        }
      });
      if (savedItem) {
        saveDoc(COLLECTIONS.ATTENDANCE, savedItem.id, savedItem);
      }
      addAuditLog(actor, 'MARK_ATTENDANCE', `Marked attendance ${status} for student ${studentId} in session ${session}`);
    };

    const bulkRecordAttendance = (summitId, session, studentStatuses, actor) => {
      const itemsToSave = [];
      setAttendance(prev => {
        const next = [...prev];
        Object.entries(studentStatuses).forEach(([sId, stat]) => {
          const existingIdx = next.findIndex(a => a.summitId === summitId && a.session === session && a.studentId === sId);
          if (existingIdx >= 0) {
            const upd = { ...next[existingIdx], status: stat, markedBy: actor, timestamp: new Date().toISOString() };
            next[existingIdx] = upd;
            itemsToSave.push(upd);
          } else {
            const newItem = {
              id: `att_${summitId}_${session}_${sId}`,
              summitId,
              session,
              studentId: sId,
              status: stat,
              markedBy: actor,
              locked: false,
              timestamp: new Date().toISOString()
            };
            next.push(newItem);
            itemsToSave.push(newItem);
          }
        });
        return next;
      });
      if (itemsToSave.length > 0) {
        batchSaveDocs(COLLECTIONS.ATTENDANCE, itemsToSave);
      }
      addAuditLog(actor, 'BULK_ATTENDANCE', `Saved attendance for session ${session} (${Object.keys(studentStatuses).length} students)`);
    };

    const toggleAttendanceSessionLock = (summitId, session, lockStatus, actor) => {
      setAttendance(prev => prev.map(a => {
        if (a.summitId === summitId && a.session === session) {
          const upd = { ...a, locked: lockStatus };
          saveDoc(COLLECTIONS.ATTENDANCE, a.id, upd);
          return upd;
        }
        return a;
      }));
      addAuditLog(actor, lockStatus ? 'LOCK_SESSION' : 'UNLOCK_SESSION', `Set lock=${lockStatus} for Summit ${summitId} session ${session}`);
    };

    // NOTICES
    const addNotice = (data, actor) => {
      const newNotice = {
        id: data.id || ('n_' + Date.now()),
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
      saveDoc(COLLECTIONS.NOTICES, newNotice.id, newNotice);
      addAuditLog(actor, 'CREATE_NOTICE', `Created announcement: "${newNotice.title}" (${newNotice.status})`);

      // Auto-dispatch notification so everyone receives it and sees it in popup & ticker
      try {
        sendNotification(
          newNotice.audience || 'all',
          `📢 Notice: ${newNotice.title}`,
          newNotice.message,
          'broadcast',
          { noticeId: newNotice.id, audience: newNotice.audience, linkTab: 'notices' }
        );
      } catch (e) {
        console.warn('Notice notification dispatch skipped:', e);
      }

      return newNotice;
    };

    const updateNotice = (id, updates, actor) => {
      let nextNotice = null;
      setNotices(prev => prev.map(n => {
        if (n.id === id) {
          nextNotice = { ...n, ...updates };
          return nextNotice;
        }
        return n;
      }));
      if (nextNotice) {
        saveDoc(COLLECTIONS.NOTICES, id, nextNotice);
      }
      addAuditLog(actor, 'UPDATE_NOTICE', `Updated notice ${id}`);
    };

    const deleteNotice = (id, actor) => {
      setNotices(prev => prev.filter(n => n.id !== id));
      removeDoc(COLLECTIONS.NOTICES, id);
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
        id: certData.id || ('cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
        createdAt: new Date().toISOString(),
        isPublished: Boolean(certData.isPublished),
        publishedAt: certData.isPublished ? new Date().toISOString() : null,
        ...certData
      };
      setCertificates(prev => [newCert, ...prev]);
      saveDoc(COLLECTIONS.CERTIFICATES, newCert.id, newCert);
      addAuditLog(actor, 'ADD_CERTIFICATE', `Allocated certificate to ${newCert.studentName}: ${newCert.awardTitle}`);
      return newCert;
    };

    const updateCertificate = (id, updates, actor = 'admin') => {
      let nextCert = null;
      setCertificates(prev => prev.map(c => {
        if (c.id === id) {
          const next = { ...c, ...updates };
          if (updates.isPublished === true && !c.isPublished) {
            next.publishedAt = new Date().toISOString();
          }
          nextCert = next;
          return next;
        }
        return c;
      }));
      if (nextCert) {
        saveDoc(COLLECTIONS.CERTIFICATES, id, nextCert);
      }
      addAuditLog(actor, 'UPDATE_CERTIFICATE', `Updated certificate ${id}`);
    };

    const deleteCertificate = (id, actor = 'admin') => {
      const cert = certificates.find(c => c.id === id);
      setCertificates(prev => prev.filter(c => c.id !== id));
      removeDoc(COLLECTIONS.CERTIFICATES, id);
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

    // ==========================================
    // MULTI-WING UNION HIERARCHY OPERATIONS
    // ==========================================

    // WINGS CRUD
    const addWing = (wingData, actor = 'admin') => {
      const newWing = {
        id: wingData.id || `wing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: wingData.name,
        shortName: wingData.shortName || wingData.name,
        code: (wingData.code || wingData.name.substring(0, 3)).toUpperCase(),
        description: wingData.description || '',
        icon: wingData.icon || 'Folder',
        color: wingData.color || '#0E7C86',
        isSummitModule: Boolean(wingData.isSummitModule),
        order: wings.length + 1
      };
      setWings(prev => [...prev, newWing]);
      saveDoc(COLLECTIONS.WINGS, newWing.id, newWing);
      addAuditLog(actor, 'ADD_WING', `Created Union Wing: ${newWing.name}`);
      return newWing;
    };

    const updateWing = (id, updates, actor = 'admin') => {
      setWings(prev => prev.map(w => {
        if (w.id === id) {
          const isCoreFineArts = w.id === 'fine_arts' || w.id === 'fine-arts' || w.isSummitModule;
          const isCoreSports = w.id === 'sports' || w.id === 'sports-wing';
          const isMandatory = w.isMandatory || isCoreFineArts || isCoreSports;
          const upd = {
            ...w,
            ...updates,
            id: w.id, // Never mutate core wing ID
            isMandatory: isMandatory ? true : Boolean(updates.isMandatory),
            isSummitModule: isCoreFineArts ? true : Boolean(updates.isSummitModule)
          };
          saveDoc(COLLECTIONS.WINGS, id, upd);
          addAuditLog(actor, 'UPDATE_WING', `Updated Union Wing: ${upd.name}`);
          return upd;
        }
        return w;
      }));
    };

    const deleteWing = (id, actor = 'admin') => {
      const w = wings.find(x => x.id === id);
      const isMandatory = (
        w?.isMandatory === true ||
        w?.isSummitModule === true ||
        w?.id === 'fine_arts' ||
        w?.id === 'fine-arts' ||
        w?.id === 'sports' ||
        w?.id === 'sports-wing' ||
        w?.code?.toLowerCase() === 'faw' ||
        w?.code?.toLowerCase() === 'sgw' ||
        w?.name?.toLowerCase().includes('fine art') ||
        w?.name?.toLowerCase().includes('sport')
      );
      if (isMandatory) {
        throw new Error('Fine Arts and Sports are mandatory core wings and cannot be deleted.');
      }
      setWings(prev => prev.filter(x => x.id !== id));
      removeDoc(COLLECTIONS.WINGS, id);
      addAuditLog(actor, 'DELETE_WING', `Deleted Union Wing: ${w?.name}`);
    };

    // UNION OFFICE BEARERS / EXECUTIVE COMMITTEE
    const appointUnionOfficial = async (officialData, actor = 'admin') => {
      const pass = officialData.password || officialData.initialPassword || 'union123';
      const passHash = await hashPassword(pass);
      const wingSlotNum = officialData.wingSlot ? Number(officialData.wingSlot) : (officialData.designation?.toLowerCase().includes('joint') ? 2 : 1);

      // Compute unique username to prevent overwriting or collision
      let baseUsername = (officialData.username || officialData.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'official').trim().toLowerCase();
      if (!baseUsername) baseUsername = 'official';
      let finalUsername = baseUsername;
      let counter = 1;
      while (unionOfficials.some(o => o.id !== officialData.id && o.username === finalUsername)) {
        finalUsername = `${baseUsername}_${counter}`;
        counter++;
      }

      const isExecutive = officialData.category === 'executive' ||
        officialData.role === 'executive' ||
        officialData.assignedWingId === 'all' ||
        ['Chairman', 'General Secretary', 'Vice Chairman', 'Joint Secretary', 'Treasurer', 'Executive Member'].some(d => officialData.designation?.includes(d));

      const newOfficial = {
        id: officialData.id || `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: officialData.studentId || null,
        name: officialData.name?.trim() || 'Union Official',
        cicNo: officialData.cicNo || '',
        classId: officialData.classId || '',
        className: officialData.className || '',
        teamId: officialData.teamId || '',
        designation: officialData.designation?.trim() || (isExecutive ? 'Executive Member' : 'Wing Convener'),
        wingSlot: !isExecutive && officialData.assignedWingId && officialData.assignedWingId !== 'all' ? wingSlotNum : null,
        category: isExecutive ? 'executive' : 'convener',
        role: isExecutive ? 'executive' : 'convener',
        assignedWingId: isExecutive ? 'all' : (officialData.assignedWingId || 'all'),
        username: finalUsername,
        initialPassword: pass,
        passwordHash: passHash,
        phone: officialData.phone || '',
        photo: officialData.photoUrl || officialData.photo || null,
        photoUrl: officialData.photoUrl || officialData.photo || '',
        order: unionOfficials.length + 1
      };

      setUnionOfficials(prev => {
        const filtered = prev.filter(o => {
          if (o.id === newOfficial.id) return false;
          // Only replace singleton executive posts (Chairman, General Secretary) if explicitly re-appointed
          const isSingletonRole = ['Chairman', 'General Secretary', 'Treasurer'].includes(newOfficial.designation);
          if (isSingletonRole && o.designation === newOfficial.designation) return false;

          // If appointing to a specific wing and slot, replace existing occupant of that specific slot in that wing
          if (
            !isExecutive &&
            newOfficial.assignedWingId &&
            newOfficial.assignedWingId !== 'all' &&
            newOfficial.wingSlot &&
            o.assignedWingId === newOfficial.assignedWingId &&
            (o.wingSlot === newOfficial.wingSlot || (newOfficial.wingSlot === 2 && o.designation?.toLowerCase().includes('joint')) || (newOfficial.wingSlot === 1 && !o.designation?.toLowerCase().includes('joint') && o.wingSlot !== 2))
          ) {
            return false;
          }
          return true;
        });
        return [...filtered, newOfficial];
      });
      saveDoc(COLLECTIONS.UNION_OFFICIALS, newOfficial.id, newOfficial);
      addAuditLog(actor, 'APPOINT_OFFICIAL', `Appointed ${newOfficial.name} as ${newOfficial.designation} (Username: ${newOfficial.username})`);
      return newOfficial;
    };

    const updateUnionOfficial = async (id, updates, actor = 'admin') => {
      let finalUpdates = { ...updates };
      if (updates.password) {
        finalUpdates.passwordHash = await hashPassword(updates.password);
        finalUpdates.initialPassword = updates.password;
      }
      if (updates.username) {
        finalUpdates.username = updates.username.trim().toLowerCase();
      }
      if (updates.photoUrl !== undefined) {
        finalUpdates.photoUrl = updates.photoUrl;
        finalUpdates.photo = updates.photoUrl;
      } else if (updates.photo !== undefined) {
        finalUpdates.photoUrl = updates.photo;
        finalUpdates.photo = updates.photo;
      }
      setUnionOfficials(prev => prev.map(o => {
        if (o.id === id) {
          const upd = { ...o, ...finalUpdates };
          saveDoc(COLLECTIONS.UNION_OFFICIALS, id, upd);
          addAuditLog(actor, 'UPDATE_OFFICIAL', `Updated official ${upd.name} (${upd.designation})`);
          return upd;
        }
        return o;
      }));
    };

    const removeUnionOfficial = (id, actor = 'admin') => {
      const off = unionOfficials.find(o => o.id === id);
      setUnionOfficials(prev => prev.filter(o => o.id !== id));
      removeDoc(COLLECTIONS.UNION_OFFICIALS, id);
      addAuditLog(actor, 'REMOVE_OFFICIAL', `Removed official: ${off?.name} (${off?.designation})`);
    };

    // WING PROGRAMS & COMPETITIONS
    const addWingProgram = (progData, actor = 'Convener') => {
      const newProg = {
        id: `wp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        wingId: progData.wingId,
        title: progData.title,
        date: progData.date || new Date().toISOString().split('T')[0],
        time: progData.time || '10:00 AM',
        type: progData.type || 'activity', // 'activity' | 'competition' | 'meeting'
        venue: progData.venue || '',
        status: progData.status || 'upcoming',
        description: progData.description || '',
        report: progData.report || '',
        winners: progData.winners || null,
        isRegistrationOpen: progData.isRegistrationOpen !== undefined ? Boolean(progData.isRegistrationOpen) : true,
        maxRegistrations: Number(progData.maxRegistrations) || 0,
        registeredStudents: Array.isArray(progData.registeredStudents) ? progData.registeredStudents : [],
        createdBy: actor,
        createdAt: new Date().toISOString()
      };
      setWingPrograms(prev => [newProg, ...prev]);
      saveDoc(COLLECTIONS.WING_PROGRAMS, newProg.id, newProg);
      const targetWing = wings.find(w => w.id === newProg.wingId);
      const wingName = targetWing?.name || targetWing?.shortName || 'Union Wing';
      addAuditLog(actor, 'ADD_WING_PROGRAM', `Added ${newProg.type} "${newProg.title}" under ${wingName}`);

      // Auto-dispatch broadcast notification to all students & dashboards
      try {
        const typeLabel = newProg.type === 'competition' ? 'Competition' : 'Program';
        sendNotification(
          'all',
          `[${wingName}] New ${typeLabel}: ${newProg.title}`,
          `${newProg.title} organized by ${wingName} is scheduled on ${newProg.date} at ${newProg.venue || 'Campus Auditorium'}. ${newProg.isRegistrationOpen ? 'Registration is now open on your dashboard!' : ''}`,
          'broadcast',
          { wingId: newProg.wingId, programId: newProg.id, type: newProg.type, linkTab: 'programs' }
        );
      } catch (e) {
        console.warn('Wing program notification dispatch skipped:', e);
      }

      return newProg;
    };

    const updateWingProgram = (id, updates, actor = 'Convener') => {
      setWingPrograms(prev => prev.map(p => {
        if (p.id === id) {
          const upd = { ...p, ...updates, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.WING_PROGRAMS, id, upd);
          addAuditLog(actor, 'UPDATE_WING_PROGRAM', `Updated program "${upd.title}"`);
          return upd;
        }
        return p;
      }));
    };

    const deleteWingProgram = (id, actor = 'Convener') => {
      const p = wingPrograms.find(x => x.id === id);
      setWingPrograms(prev => prev.filter(x => x.id !== id));
      removeDoc(COLLECTIONS.WING_PROGRAMS, id);
      addAuditLog(actor, 'DELETE_WING_PROGRAM', `Deleted program "${p?.title}"`);
    };

    const toggleProgramRegistration = (programId, actor = 'Admin') => {
      setWingPrograms(prev => prev.map(p => {
        if (p.id === programId) {
          const nextState = !p.isRegistrationOpen;
          const upd = { ...p, isRegistrationOpen: nextState, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.WING_PROGRAMS, programId, upd);
          addAuditLog(actor, 'TOGGLE_REGISTRATION', `Turned registration ${nextState ? 'ON' : 'OFF'} for "${p.title}"`);
          return upd;
        }
        return p;
      }));
    };

    const registerForWingProgram = (programId, studentInfo) => {
      let updatedProgram = null;
      setWingPrograms(prev => prev.map(p => {
        if (p.id === programId) {
          const currentList = Array.isArray(p.registeredStudents) ? p.registeredStudents : [];
          if (currentList.some(s => s.studentId === studentInfo.id || s.cicNo === studentInfo.cicNo)) {
            return p;
          }
          const newReg = {
            studentId: studentInfo.id,
            cicNo: studentInfo.cicNo,
            name: studentInfo.name,
            classId: studentInfo.classId || '',
            className: studentInfo.className || '',
            teamId: studentInfo.teamId || '',
            registeredAt: new Date().toISOString(),
            attended: null // null = pending, true = attended, false = absent
          };
          const updatedList = [...currentList, newReg];
          updatedProgram = { ...p, registeredStudents: updatedList, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.WING_PROGRAMS, programId, updatedProgram);
          addAuditLog(studentInfo.name || 'Student', 'REGISTER_WING_PROGRAM', `Registered for program "${p.title}"`);
          return updatedProgram;
        }
        return p;
      }));
      return updatedProgram;
    };

    const cancelWingProgramRegistration = (programId, studentId) => {
      setWingPrograms(prev => prev.map(p => {
        if (p.id === programId) {
          const currentList = Array.isArray(p.registeredStudents) ? p.registeredStudents : [];
          const updatedList = currentList.filter(s => s.studentId !== studentId && s.cicNo !== studentId);
          const upd = { ...p, registeredStudents: updatedList, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.WING_PROGRAMS, programId, upd);
          addAuditLog('Student', 'CANCEL_WING_REGISTRATION', `Cancelled registration for "${p.title}"`);
          return upd;
        }
        return p;
      }));
    };

    const markWingProgramAttendance = (programId, studentId, attendedStatus, actor = 'Convener') => {
      setWingPrograms(prev => prev.map(p => {
        if (p.id === programId) {
          const currentList = Array.isArray(p.registeredStudents) ? p.registeredStudents : [];
          const updatedList = currentList.map(s => {
            if (s.studentId === studentId || s.cicNo === studentId) {
              return {
                ...s,
                attended: attendedStatus,
                markedAt: new Date().toISOString(),
                markedBy: actor
              };
            }
            return s;
          });
          const upd = { ...p, registeredStudents: updatedList, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.WING_PROGRAMS, programId, upd);
          addAuditLog(actor, 'MARK_WING_ATTENDANCE', `Marked attendance in "${p.title}" for student ${studentId}: ${attendedStatus ? 'Attended' : 'Absent'}`);
          return upd;
        }
        return p;
      }));
    };

    const markAllWingProgramAttendance = (programId, attendedStatus, actor = 'Convener') => {
      setWingPrograms(prev => prev.map(p => {
        if (p.id === programId) {
          const currentList = Array.isArray(p.registeredStudents) ? p.registeredStudents : [];
          const updatedList = currentList.map(s => ({
            ...s,
            attended: attendedStatus,
            markedAt: new Date().toISOString(),
            markedBy: actor
          }));
          const upd = { ...p, registeredStudents: updatedList, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.WING_PROGRAMS, programId, upd);
          addAuditLog(actor, 'MARK_ALL_WING_ATTENDANCE', `Marked all (${updatedList.length}) students in "${p.title}" as ${attendedStatus ? 'Attended' : 'Absent'}`);
          return upd;
        }
        return p;
      }));
    };

    const saveCompetitionResults = (programId, winnersData, actor = 'Convener') => {
      let resolvedProg = null;
      setWingPrograms(prev => prev.map(p => {
        if (p.id === programId) {
          resolvedProg = p;
          const upd = {
            ...p,
            winners: winnersData,
            status: 'completed',
            updatedAt: new Date().toISOString()
          };
          saveDoc(COLLECTIONS.WING_PROGRAMS, programId, upd);
          addAuditLog(actor, 'SAVE_COMPETITION_RESULTS', `Recorded winners for competition "${p.title}"`);
          return upd;
        }
        return p;
      }));

      if (resolvedProg) {
        try {
          const targetWing = wings.find(w => w.id === resolvedProg.wingId);
          const wingName = targetWing?.name || targetWing?.shortName || 'Union Wing';
          const firstPrize = winnersData?.first?.studentName || winnersData?.first?.name || '';
          sendNotification(
            'all',
            `🏆 Results Announced: ${resolvedProg.title}`,
            `Official results declared for ${resolvedProg.title} (${wingName}).${firstPrize ? ` 1st Prize won by ${firstPrize}!` : ''} Check the dashboard to view full results and merit honors.`,
            'result',
            { wingId: resolvedProg.wingId, programId: resolvedProg.id, linkTab: 'union_prizes' }
          );
        } catch (e) {
          console.warn('Competition result notification dispatch skipped:', e);
        }
      }
    };

    // SPORTS GROUPS & SQUADS CRUD
    const addSportsGroup = (groupData, actor = 'Sports Convener') => {
      const newGroup = {
        id: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: groupData.name || 'New Sports Squad',
        sport: groupData.sport || 'General Sports',
        category: groupData.category || 'Team Sport',
        leaderId: groupData.leaderId || null,
        leaderName: groupData.leaderName || '',
        leaderUsername: groupData.leaderUsername || `leader_${(groupData.sport || 'sports').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        color: groupData.color || '#047857',
        icon: groupData.icon || 'Trophy',
        memberIds: Array.isArray(groupData.memberIds) ? groupData.memberIds : [],
        createdAt: new Date().toISOString()
      };
      setSportsGroups(prev => [newGroup, ...prev]);
      saveDoc(COLLECTIONS.SPORTS_GROUPS, newGroup.id, newGroup);
      addAuditLog(actor, 'ADD_SPORTS_GROUP', `Created sports squad "${newGroup.name}" (${newGroup.sport})`);
      return newGroup;
    };

    const updateSportsGroup = (id, updates, actor = 'Sports Convener') => {
      setSportsGroups(prev => prev.map(sg => {
        if (sg.id === id) {
          const upd = { ...sg, ...updates, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.SPORTS_GROUPS, id, upd);
          addAuditLog(actor, 'UPDATE_SPORTS_GROUP', `Updated sports squad "${upd.name}"`);
          return upd;
        }
        return sg;
      }));
    };

    const deleteSportsGroup = (id, actor = 'Sports Convener') => {
      const target = sportsGroups.find(sg => sg.id === id);
      setSportsGroups(prev => prev.filter(sg => sg.id !== id));
      removeDoc(COLLECTIONS.SPORTS_GROUPS, id);
      addAuditLog(actor, 'DELETE_SPORTS_GROUP', `Deleted sports squad "${target?.name || id}"`);
    };

    const addStudentToSportsGroup = (groupId, studentId, actor = 'Sports Convener') => {
      setSportsGroups(prev => prev.map(sg => {
        if (sg.id === groupId) {
          const curMembers = Array.isArray(sg.memberIds) ? sg.memberIds : [];
          if (curMembers.includes(studentId)) return sg;
          const upd = { ...sg, memberIds: [...curMembers, studentId], updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.SPORTS_GROUPS, groupId, upd);
          const st = students.find(s => s.id === studentId);
          addAuditLog(actor, 'ADD_STUDENT_SPORTS_GROUP', `Added student ${st?.name || studentId} to ${sg.name}`);
          return upd;
        }
        return sg;
      }));
    };

    const removeStudentFromSportsGroup = (groupId, studentId, actor = 'Sports Convener') => {
      setSportsGroups(prev => prev.map(sg => {
        if (sg.id === groupId) {
          const curMembers = Array.isArray(sg.memberIds) ? sg.memberIds : [];
          const upd = { ...sg, memberIds: curMembers.filter(mId => mId !== studentId), updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.SPORTS_GROUPS, groupId, upd);
          const st = students.find(s => s.id === studentId);
          addAuditLog(actor, 'REMOVE_STUDENT_SPORTS_GROUP', `Removed student ${st?.name || studentId} from ${sg.name}`);
          return upd;
        }
        return sg;
      }));
    };

    const assignSportsGroupLeader = (groupId, studentId, leaderTitle = '', actor = 'Sports Convener') => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      setSportsGroups(prev => prev.map(sg => {
        if (sg.id === groupId) {
          const sportTag = (sg.sport || 'sports').toLowerCase().replace(/[^a-z0-9]/g, '');
          const upd = {
            ...sg,
            leaderId: student.id,
            leaderName: student.name,
            leaderUsername: `leader_${sportTag}`,
            updatedAt: new Date().toISOString()
          };
          saveDoc(COLLECTIONS.SPORTS_GROUPS, groupId, upd);
          addAuditLog(actor, 'ASSIGN_SPORTS_LEADER', `Assigned ${student.name} as Team Leader for ${sg.name}`);
          return upd;
        }
        return sg;
      }));
    };

    const assignSportsGroupManager = (groupId, studentId, managerTitle = 'Team Manager', actor = 'Sports Convener') => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      setSportsGroups(prev => prev.map(sg => {
        if (sg.id === groupId) {
          const sportTag = (sg.sport || 'sports').toLowerCase().replace(/[^a-z0-9]/g, '');
          const upd = {
            ...sg,
            managerId: student.id,
            managerName: student.name,
            managerUsername: `manager_${sportTag}`,
            updatedAt: new Date().toISOString()
          };
          saveDoc(COLLECTIONS.SPORTS_GROUPS, groupId, upd);
          addAuditLog(actor, 'ASSIGN_SPORTS_MANAGER', `Assigned ${student.name} as Team Manager for ${sg.name}`);
          return upd;
        }
        return sg;
      }));
    };

    // SPORTS FIXTURES & MARKS RECORDING
    const addSportsFixture = (fixtureData, actor = 'Sports Convener') => {
      const newFix = {
        id: `fix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: fixtureData.title || 'Sports Event',
        sport: fixtureData.sport || 'Sports',
        group1Id: fixtureData.group1Id || '',
        group1Name: fixtureData.group1Name || 'Squad 1',
        group2Id: fixtureData.group2Id || '',
        group2Name: fixtureData.group2Name || 'Squad 2',
        date: fixtureData.date || new Date().toISOString().split('T')[0],
        time: fixtureData.time || '04:00 PM',
        venue: fixtureData.venue || 'College Ground',
        status: fixtureData.status || 'scheduled',
        score1: Number(fixtureData.score1) || 0,
        score2: Number(fixtureData.score2) || 0,
        winnerGroupId: fixtureData.winnerGroupId || null,
        pointsAwarded: fixtureData.pointsAwarded || {},
        studentMarks: fixtureData.studentMarks || {},
        teamPoints: fixtureData.teamPoints || {},
        createdAt: new Date().toISOString()
      };
      setSportsFixtures(prev => [newFix, ...prev]);
      saveDoc(COLLECTIONS.SPORTS_FIXTURES, newFix.id, newFix);
      addAuditLog(actor, 'ADD_SPORTS_FIXTURE', `Scheduled match: ${newFix.title} (${newFix.group1Name} vs ${newFix.group2Name})`);

      // Auto-dispatch sports announcement to all users
      try {
        sendNotification(
          'all',
          `⚽ [Sports Wing] New Fixture: ${newFix.title}`,
          `${newFix.group1Name} vs ${newFix.group2Name} in ${newFix.sport} scheduled on ${newFix.date} at ${newFix.time} (${newFix.venue}). All students are invited to cheer!`,
          'broadcast',
          { linkTab: 'sports' }
        );
      } catch (e) {
        console.warn('Sports fixture notification dispatch skipped:', e);
      }

      return newFix;
    };

    const bulkAddSportsFixtures = (fixturesArray, actor = 'Sports Convener') => {
      if (!Array.isArray(fixturesArray) || fixturesArray.length === 0) return [];
      const newItems = fixturesArray.map((fixtureData, idx) => ({
        id: `fix_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        title: fixtureData.title || 'Sports Event',
        sport: fixtureData.sport || 'Sports',
        group1Id: fixtureData.group1Id || '',
        group1Name: fixtureData.group1Name || 'Squad 1',
        group2Id: fixtureData.group2Id || '',
        group2Name: fixtureData.group2Name || 'Squad 2',
        date: fixtureData.date || new Date().toISOString().split('T')[0],
        time: fixtureData.time || '04:00 PM',
        venue: fixtureData.venue || 'College Ground',
        status: fixtureData.status || 'scheduled',
        score1: Number(fixtureData.score1) || 0,
        score2: Number(fixtureData.score2) || 0,
        winnerGroupId: fixtureData.winnerGroupId || null,
        pointsAwarded: fixtureData.pointsAwarded || {},
        studentMarks: fixtureData.studentMarks || {},
        teamPoints: fixtureData.teamPoints || {},
        createdAt: new Date().toISOString()
      }));

      setSportsFixtures(prev => [...newItems, ...prev]);
      batchSaveDocs(COLLECTIONS.SPORTS_FIXTURES, newItems);
      addAuditLog(actor, 'BULK_ADD_SPORTS_FIXTURES', `Installed/created ${newItems.length} sports events in bulk`);

      try {
        sendNotification(
          'all',
          `⚽ [Sports Wing] ${newItems.length} Sports Events Installed`,
          `New sports events & tournament fixtures have been added to the College Sports calendar!`,
          'broadcast',
          { linkTab: 'sports' }
        );
      } catch (_) { }

      return newItems;
    };

    const updateSportsFixture = (id, updates, actor = 'Sports Convener') => {
      setSportsFixtures(prev => prev.map(f => {
        if (f.id === id) {
          const upd = { ...f, ...updates, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.SPORTS_FIXTURES, id, upd);
          addAuditLog(actor, 'UPDATE_SPORTS_FIXTURE', `Updated match: ${upd.title}`);
          return upd;
        }
        return f;
      }));
    };

    const deleteSportsFixture = (id, actor = 'Sports Convener') => {
      const target = sportsFixtures.find(f => f.id === id);
      setSportsFixtures(prev => prev.filter(f => f.id !== id));
      removeDoc(COLLECTIONS.SPORTS_FIXTURES, id);
      addAuditLog(actor, 'DELETE_SPORTS_FIXTURE', `Deleted match: ${target?.title || id}`);
    };

    const recordSportsMarks = (fixtureId, { score1, score2, winnerGroupId, pointsAwarded, studentMarks, teamPoints, status = 'completed', isResultPublished }, actor = 'Sports Convener') => {
      setSportsFixtures(prev => prev.map(f => {
        if (f.id === fixtureId) {
          const shouldPublish = isResultPublished !== undefined ? Boolean(isResultPublished) : Boolean(f.isResultPublished);
          const upd = {
            ...f,
            score1: Number(score1) || 0,
            score2: Number(score2) || 0,
            winnerGroupId: winnerGroupId || null,
            pointsAwarded: pointsAwarded || f.pointsAwarded || {},
            studentMarks: studentMarks || f.studentMarks || {},
            teamPoints: teamPoints || f.teamPoints || {},
            status,
            isResultPublished: shouldPublish,
            publishedAt: shouldPublish ? (f.publishedAt || new Date().toISOString()) : null,
            updatedAt: new Date().toISOString()
          };
          saveDoc(COLLECTIONS.SPORTS_FIXTURES, fixtureId, upd);
          addAuditLog(actor, 'RECORD_SPORTS_MARKS', `Recorded score & points for ${upd.title} (${upd.score1} - ${upd.score2}) [Published: ${shouldPublish}]`);

          // Only dispatch broadcast notification if results are explicitly published!
          if (shouldPublish) {
            try {
              sendNotification(
                'all',
                `🏆 [Sports Result Published] ${upd.title}`,
                `Official match results declared for ${upd.title}! ${upd.group1Name} (${upd.score1}) - ${upd.group2Name} (${upd.score2}). Check the sports standings!`,
                'result',
                { linkTab: 'sports', fixtureId: upd.id }
              );
            } catch (e) {
              console.warn('Sports result notification dispatch skipped:', e);
            }
          }

          return upd;
        }
        return f;
      }));
    };

    const togglePublishSportsFixture = (fixtureId, actor = 'Sports Convener') => {
      setSportsFixtures(prev => prev.map(f => {
        if (f.id === fixtureId) {
          const nextPublished = !f.isResultPublished;
          const upd = {
            ...f,
            isResultPublished: nextPublished,
            publishedAt: nextPublished ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
          };
          saveDoc(COLLECTIONS.SPORTS_FIXTURES, fixtureId, upd);
          addAuditLog(actor, nextPublished ? 'PUBLISH_SPORTS_RESULT' : 'UNPUBLISH_SPORTS_RESULT', `${nextPublished ? 'Published' : 'Unpublished'} match results for "${upd.title}"`);

          if (nextPublished) {
            try {
              sendNotification(
                'all',
                `🏆 [Sports Result Published] ${upd.title}`,
                `Official match results declared for ${upd.title}! ${upd.group1Name} (${upd.score1}) - ${upd.group2Name} (${upd.score2}). Check the updated sports leaderboard!`,
                'result',
                { linkTab: 'sports', fixtureId: upd.id }
              );
            } catch (e) {
              console.warn('Sports result notification dispatch skipped:', e);
            }
          }

          return upd;
        }
        return f;
      }));
    };

    // BANNER SLIDES FOR HOME SCREEN CAROUSEL
    const addBanner = (slideData, actor = 'admin') => {
      const newBanner = {
        id: `banner_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        badge: slideData.badge || '📌 Program',
        tag: slideData.tag || 'Union Program',
        title: slideData.title,
        subtitle: slideData.subtitle || '',
        imageUrl: slideData.imageUrl || '',
        bgGradient: slideData.bgGradient || 'from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86]',
        wingId: slideData.wingId || 'fine_arts',
        actionText: slideData.actionText || 'View Details',
        actionTab: slideData.actionTab || 'wings',
        linkUrl: slideData.linkUrl || '',
        isPinned: Boolean(slideData.isPinned),
        createdBy: actor,
        createdAt: new Date().toISOString()
      };
      setBanners(prev => [newBanner, ...prev]);
      saveDoc(COLLECTIONS.BANNERS, newBanner.id, newBanner);
      addAuditLog(actor, 'ADD_BANNER_SLIDE', `Added Home banner slide "${newBanner.title}"`);
      return newBanner;
    };

    const updateBanner = (id, updates, actor = 'admin') => {
      setBanners(prev => prev.map(b => {
        if (b.id === id) {
          const upd = { ...b, ...updates, updatedAt: new Date().toISOString() };
          saveDoc(COLLECTIONS.BANNERS, id, upd);
          addAuditLog(actor, 'UPDATE_BANNER_SLIDE', `Updated Home banner "${upd.title}"`);
          return upd;
        }
        return b;
      }));
    };

    const deleteBanner = (id, actor = 'admin') => {
      setBanners(prev => prev.filter(b => b.id !== id));
      removeDoc(COLLECTIONS.BANNERS, id);
      addAuditLog(actor, 'DELETE_BANNER_SLIDE', `Deleted Home banner slide ID ${id}`);
    };

    // PASSWORD CHANGES
    const updateAdminPassword = async (username, newPassword, actor = 'admin') => {
      const newHash = await hashPassword(newPassword);
      setSettings(prev => {
        const hashes = prev.adminPasswordHashes || {};
        hashes[username] = newHash;
        const next = { ...prev, adminPasswordHashes: hashes };
        saveDoc(COLLECTIONS.SETTINGS, 'general', next);
        return next;
      });
      addAuditLog(actor, 'CHANGE_ADMIN_PASSWORD', `Changed password for administrator ${username}`);
    };

    const updateStudentPassword = async (studentId, newPassword, actor = 'student') => {
      const newHash = await hashPassword(newPassword);
      setStudents(prev => prev.map(s => {
        if (s.id === studentId || s.cicNo === studentId) {
          const upd = { ...s, passwordHash: newHash, initialPassword: newPassword };
          saveDoc(COLLECTIONS.STUDENTS, s.id, upd);
          addAuditLog(actor, 'CHANGE_STUDENT_PASSWORD', `Updated password for student ${s.name} (${s.cicNo})`);
          return upd;
        }
        return s;
      }));
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
        addClass,
        updateClass,
        deleteClass,
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
        restoreDefaultStudents,
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
        wings,
        setWings,
        addWing,
        updateWing,
        deleteWing,
        unionOfficials,
        setUnionOfficials,
        appointUnionOfficial,
        updateUnionOfficial,
        removeUnionOfficial,
        wingPrograms,
        setWingPrograms,
        instagramPosts,
        setInstagramPosts,
        banners,
        setBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        addWingProgram,
        updateWingProgram,
        deleteWingProgram,
        toggleProgramRegistration,
        registerForWingProgram,
        cancelWingProgramRegistration,
        markWingProgramAttendance,
        markAllWingProgramAttendance,
        saveCompetitionResults,
        sportsGroups,
        setSportsGroups,
        addSportsGroup,
        updateSportsGroup,
        deleteSportsGroup,
        addStudentToSportsGroup,
        removeStudentFromSportsGroup,
        assignSportsGroupLeader,
        assignSportsGroupManager,
        sportsFixtures,
        setSportsFixtures,
        addSportsFixture,
        bulkAddSportsFixtures,
        updateSportsFixture,
        deleteSportsFixture,
        recordSportsMarks,
        togglePublishSportsFixture,
        updateAdminPassword,
        updateStudentPassword,
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
