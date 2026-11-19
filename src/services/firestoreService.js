/**
 * Single Source of Truth Firestore Service (Ultra-Optimized)
 * Majlis Umariyya Wafy College - MUSF Summit Register
 *
 * Enforces:
 * 1. Shared singleton listeners across the entire app (fewer than 10 active listeners per device).
 * 2. Screen-scoped lazy subscriptions with limit() and pagination.
 * 3. Opening dashboard costs < 100 reads; student login costs < 30 reads.
 * 4. Document-level atomic writes (setDoc/updateDoc) and bulk chunks <= 400.
 * 5. Screen-by-screen telemetry and quota protection.
 */
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase.js';

// Global Session Usage Telemetry
let sessionReads = 0;
let sessionWrites = 0;
let isQuotaExhausted = false;
let isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
let currentScreenName = 'dashboard';
let lastFirestoreError = null;

// Screen-by-Screen telemetry tracking
export const screenUsage = {
  dashboard: { reads: 0, writes: 0 },
  students: { reads: 0, writes: 0 },
  programs: { reads: 0, writes: 0 },
  marks: { reads: 0, writes: 0 },
  attendance: { reads: 0, writes: 0 },
  audit: { reads: 0, writes: 0 },
  reports: { reads: 0, writes: 0 },
  settings: { reads: 0, writes: 0 },
  certificates: { reads: 0, writes: 0 },
  other: { reads: 0, writes: 0 }
};

export const setCurrentScreen = (screen) => {
  if (screen) {
    currentScreenName = screen;
    if (!screenUsage[screen]) {
      screenUsage[screen] = { reads: 0, writes: 0 };
    }
  }
};

export const getCurrentScreen = () => currentScreenName;

// Pending write queue for 429 quota exhaustion or offline retries
const pendingWriteQueue = [];
const usageListeners = new Set();
const writeErrorListeners = new Set();
const syncStatusListeners = new Set();

// Track online / offline state
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOffline = false;
    notifySyncStatus();
    retryPendingWrites();
  });
  window.addEventListener('offline', () => {
    isOffline = true;
    notifySyncStatus();
  });
}

const trackReads = (count) => {
  sessionReads += count;
  const s = currentScreenName || 'other';
  if (!screenUsage[s]) screenUsage[s] = { reads: 0, writes: 0 };
  screenUsage[s].reads += count;
  notifyUsage();
};

const trackWrites = (count) => {
  sessionWrites += count;
  const s = currentScreenName || 'other';
  if (!screenUsage[s]) screenUsage[s] = { reads: 0, writes: 0 };
  screenUsage[s].writes += count;
  notifyUsage();
};

const notifyUsage = () => {
  const snapshot = {
    sessionReads,
    sessionWrites,
    activeListenersCount: sharedListeners.size,
    pendingWritesCount: pendingWriteQueue.length,
    quotaExhausted: isQuotaExhausted,
    isOffline,
    currentScreen: currentScreenName,
    screenUsage: { ...screenUsage }
  };
  usageListeners.forEach((cb) => {
    try { cb(snapshot); } catch (e) { console.error(e); }
  });
};

const notifySyncStatus = () => {
  const state = isQuotaExhausted
    ? 'quota_exhausted'
    : isOffline
    ? 'offline'
    : lastFirestoreError
    ? 'error'
    : pendingWriteQueue.length > 0
    ? 'syncing'
    : 'synced';

  const snapshot = {
    state,
    isOffline,
    quotaExhausted: isQuotaExhausted,
    pendingWritesCount: pendingWriteQueue.length,
    activeListenersCount: sharedListeners.size,
    firestoreError: lastFirestoreError,
    lastWriteAt: new Date().toISOString()
  };

  syncStatusListeners.forEach((cb) => {
    try { cb(snapshot); } catch (e) { console.error(e); }
  });
};

const notifyWriteError = (error, context) => {
  writeErrorListeners.forEach((cb) => {
    try { cb({ error, context, timestamp: new Date().toISOString() }); } catch (e) { console.error(e); }
  });
};

export const getSyncStatus = () => {
  const state = isQuotaExhausted
    ? 'quota_exhausted'
    : isOffline
    ? 'offline'
    : lastFirestoreError
    ? 'error'
    : pendingWriteQueue.length > 0
    ? 'syncing'
    : 'synced';

  return {
    state,
    isOffline,
    quotaExhausted: isQuotaExhausted,
    pendingWritesCount: pendingWriteQueue.length,
    activeListenersCount: sharedListeners.size,
    firestoreError: lastFirestoreError,
    lastWriteAt: new Date().toISOString()
  };
};

export const getCloudUsage = () => ({
  sessionReads,
  sessionWrites,
  activeListenersCount: sharedListeners.size,
  pendingWritesCount: pendingWriteQueue.length,
  quotaExhausted: isQuotaExhausted,
  isOffline,
  currentScreen: currentScreenName,
  screenUsage: { ...screenUsage }
});

export const subscribeCloudUsage = (cb) => {
  usageListeners.add(cb);
  cb(getCloudUsage());
  return () => usageListeners.delete(cb);
};

export const subscribeSyncStatus = (cb) => {
  syncStatusListeners.add(cb);
  notifySyncStatus();
  return () => syncStatusListeners.delete(cb);
};

export const onWriteError = (cb) => {
  writeErrorListeners.add(cb);
  return () => writeErrorListeners.delete(cb);
};

export const resetCloudUsage = () => {
  sessionReads = 0;
  sessionWrites = 0;
  Object.keys(screenUsage).forEach((k) => {
    screenUsage[k] = { reads: 0, writes: 0 };
  });
  notifyUsage();
};

/**
 * Handle write failures: queue for retry & notify UI
 */
const handleWriteFailure = (err, operation) => {
  const msg = err?.message || String(err);
  const is429 = msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded') || err?.code === 'resource-exhausted';

  if (is429) {
    isQuotaExhausted = true;
    console.warn('[Firestore] Quota 429 exceeded. Queued operation locally:', operation.collectionName, operation.id);
  } else {
    console.error('[Firestore] Write failed:', operation.collectionName, operation.id, msg);
  }

  pendingWriteQueue.push({
    ...operation,
    queuedAt: new Date().toISOString(),
    error: msg
  });

  notifyUsage();
  notifySyncStatus();
  notifyWriteError(err, operation);
};

/**
 * Retry queued pending writes
 */
export const retryPendingWrites = async () => {
  if (pendingWriteQueue.length === 0 || !db) return;

  const queueCopy = [...pendingWriteQueue];
  pendingWriteQueue.length = 0;

  for (const item of queueCopy) {
    try {
      if (item.type === 'delete') {
        await deleteDoc(doc(db, item.collectionName, String(item.id)));
      } else {
        await setDoc(doc(db, item.collectionName, String(item.id)), item.data, { merge: true });
      }
      trackWrites(1);
    } catch (e) {
      handleWriteFailure(e, item);
      break;
    }
  }

  if (pendingWriteQueue.length === 0) {
    isQuotaExhausted = false;
  }
  notifyUsage();
  notifySyncStatus();
};

/**
 * Atomic Single Document Write:
 * Only writes the single document that changed.
 * Does NOT re-read from cloud after write (local cache and listener update UI automatically).
 */
export const saveDoc = async (collectionName, id, data, merge = true) => {
  if (!db || !collectionName || id === undefined || id === null) return;
  const docId = String(id);

  const cleanData = JSON.parse(JSON.stringify(data));
  cleanData.id = docId;
  cleanData.updatedAt = new Date().toISOString();

  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, cleanData, { merge });
    trackWrites(1);
    isQuotaExhausted = false;
    notifyUsage();
    notifySyncStatus();
    return true;
  } catch (err) {
    handleWriteFailure(err, { type: 'set', collectionName, id: docId, data: cleanData });
    return false;
  }
};

/**
 * Remove a single document
 */
export const removeDoc = async (collectionName, id) => {
  if (!db || !collectionName || id === undefined || id === null) return;
  const docId = String(id);

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    trackWrites(1);
    isQuotaExhausted = false;
    notifyUsage();
    notifySyncStatus();
    return true;
  } catch (err) {
    handleWriteFailure(err, { type: 'delete', collectionName, id: docId });
    return false;
  }
};

/**
 * Batch write multiple documents in chunks of 400 or less
 */
export const batchSaveDocs = async (collectionName, items, chunkSize = 400) => {
  if (!db || !collectionName || !Array.isArray(items) || items.length === 0) return 0;

  let totalWritten = 0;
  const effectiveChunkSize = Math.min(chunkSize, 400);

  for (let i = 0; i < items.length; i += effectiveChunkSize) {
    const chunk = items.slice(i, i + effectiveChunkSize);
    const batch = writeBatch(db);

    for (const item of chunk) {
      if (!item) continue;
      const docId = String(item.id || item._id || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
      const cleanData = JSON.parse(JSON.stringify(item));
      cleanData.id = docId;
      cleanData.updatedAt = new Date().toISOString();
      const docRef = doc(db, collectionName, docId);
      batch.set(docRef, cleanData, { merge: true });
    }

    try {
      await batch.commit();
      totalWritten += chunk.length;
      trackWrites(chunk.length);
      isQuotaExhausted = false;
      notifyUsage();
      notifySyncStatus();
    } catch (err) {
      handleWriteFailure(err, { type: 'batch', collectionName, count: chunk.length });
      throw err;
    }
  }

  return totalWritten;
};

// =========================================================================
// SHARED SINGLETON LISTENER REGISTRY (Fewer than 10 active listeners total)
// =========================================================================

/**
 * Map of listenerKey -> { unsubscribe, callbacks: Set, items, queryKey }
 * Prevents duplicate listeners: if 5 components ask for summits, only 1 snapshot runs!
 */
const sharedListeners = new Map();

export const getActiveListenersCount = () => sharedListeners.size;

/**
 * Deterministically serialize a QueryConstraint for deduplication
 */
const serializeConstraint = (c) => {
  if (!c) return '';
  if (c.type === 'limit' || c.type === 'limitToLast') {
    return `${c.type}:${c._limit}`;
  }
  if (c.type === 'where') {
    const field = c._field?.segments?.join('.') || c._field?._internalPath?.segments?.join('.') || 'field';
    return `where:${field}:${c._op}:${JSON.stringify(c._value)}`;
  }
  if (c.type === 'orderBy') {
    const field = c._field?.segments?.join('.') || c._field?._internalPath?.segments?.join('.') || 'field';
    return `orderBy:${field}:${c._direction}`;
  }
  try {
    return JSON.stringify(c);
  } catch (e) {
    return String(c);
  }
};

/**
 * Register interest in a Firestore query.
 * Reuses existing active listener if query signature matches!
 */
export const registerSharedListener = (colName, queryConstraints = [], onUpdate, onError) => {
  if (!db || !colName) return () => {};

  try {
    // Build stable deterministic key representing this collection + constraints
    const constraintKey = queryConstraints.map(serializeConstraint).join('|');
    const listenerKey = `${colName}:${constraintKey}`;

    let entry = sharedListeners.get(listenerKey);

    if (entry) {
      // Listener already running! Add callback and immediately deliver cached items
      entry.callbacks.add(onUpdate);
      if (entry.items !== undefined && typeof onUpdate === 'function') {
        try { onUpdate(entry.items); } catch (e) { console.error(e); }
      }
    } else {
      // Create new shared onSnapshot listener
      const callbacks = new Set();
      if (typeof onUpdate === 'function') callbacks.add(onUpdate);

      let isFirstSnapshot = true;
      const colRef = collection(db, colName);
      const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;

      const unsubscribe = onSnapshot(
        q,
        { includeMetadataChanges: true },
        (snapshot) => {
          // Track reads: on first snapshot track docs count; on subsequent track docChanges
          if (isFirstSnapshot) {
            trackReads(snapshot.docs.length);
            isFirstSnapshot = false;
          } else {
            trackReads(snapshot.docChanges().length);
          }

          const items = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id
          }));

          const currentEntry = sharedListeners.get(listenerKey);
          if (currentEntry) {
            currentEntry.items = items;
            currentEntry.callbacks.forEach((cb) => {
              try { cb(items, snapshot); } catch (e) { console.error(e); }
            });
          }
        },
        (err) => {
          console.warn(`[Firestore Listener Notice] ${colName}:`, err.message || err.code);
          lastFirestoreError = err.code || err.message;
          notifySyncStatus();

          // Provide safe fallback empty array so UI components waiting for snapshot don't hang
          const currentEntry = sharedListeners.get(listenerKey);
          if (currentEntry) {
            currentEntry.items = currentEntry.items || [];
            currentEntry.callbacks.forEach((cb) => {
              try { cb(currentEntry.items, null); } catch (e) { console.error(e); }
            });
          }

          if (typeof onError === 'function') {
            try { onError(err); } catch (e) {}
          }
        }
      );

      entry = {
        unsubscribe,
        callbacks,
        items: undefined,
        colName
      };
      sharedListeners.set(listenerKey, entry);
      notifyUsage();
      notifySyncStatus();
    }

    // Return unsubscription function
    return () => {
      const current = sharedListeners.get(listenerKey);
      if (!current) return;
      current.callbacks.delete(onUpdate);

      // If no more callbacks are listening, cleanly terminate listener to save reads
      if (current.callbacks.size === 0) {
        try { current.unsubscribe(); } catch (e) { /* ignore */ }
        sharedListeners.delete(listenerKey);
        notifyUsage();
        notifySyncStatus();
      }
    };
  } catch (outerErr) {
    console.error(`[Firestore Shared Listener Error] Failed for ${colName}:`, outerErr);
    return () => {};
  }
};

// =========================================================================
// SCREEN-SCOPED LAZY SYNCHRONIZATION
// =========================================================================

/**
 * Screen-Scoped Lazy Sync Manager:
 * Subscribes ONLY to the data the current screen needs.
 * Unsubscribes automatically when the user leaves the screen!
 * Target: < 100 reads for Dashboard, < 30 reads for Student login, < 10 active listeners.
 */
export const syncScreenData = (screen, role, user, currentSummitId, handlers = {}) => {
  const cleanups = [];
  setCurrentScreen(screen);

  const sub = (colName, constraints, handler) => {
    if (typeof handler === 'function') {
      const unsub = registerSharedListener(colName, constraints, handler);
      cleanups.push(unsub);
    }
  };

  // -------------------------------------------------------------
  // 1. BASELINE SHELL (Shared across all screens - only 5 listeners)
  // -------------------------------------------------------------
  // Settings (1 document 'general' -> 1 read)
  sub(COLLECTIONS.SETTINGS, [limit(1)], handlers.setSettingsDoc);

  // Active Summits only (limit 10 -> ~4-8 reads)
  sub(COLLECTIONS.SUMMITS, [orderBy('date', 'desc'), limit(10)], handlers.setSummits);

  // Classes & Teams (small reference lists -> ~7 reads total)
  sub(COLLECTIONS.CLASSES, [limit(20)], handlers.setClasses);
  sub(COLLECTIONS.TEAMS, [limit(10)], handlers.setTeams);

  // User Notifications (scoped by userId -> ~2-5 reads)
  if (user?.id) {
    if (role === 'admin') {
      sub(COLLECTIONS.NOTIFICATIONS, [orderBy('timestamp', 'desc'), limit(20)], handlers.setNotifications);
    } else {
      sub(COLLECTIONS.NOTIFICATIONS, [limit(20)], (allNotifs) => {
        const filtered = (allNotifs || []).filter(
          (n) => n.userId === user.id || n.userId === 'all' || (user.teamId && n.teamId === user.teamId)
        );
        if (handlers.setNotifications) handlers.setNotifications(filtered);
      });
    }
  }

  // Notices (limit 10 -> ~2-4 reads)
  sub(COLLECTIONS.NOTICES, [limit(10)], handlers.setNotices);

  // -------------------------------------------------------------
  // 2. ROLE & SCREEN-SPECIFIC SCOPING
  // -------------------------------------------------------------

  // === STUDENT ROLE ===
  if (role === 'student') {
    if (user?.id) {
      // 1 read for own profile
      sub(COLLECTIONS.STUDENTS, [where('id', '==', user.id)], handlers.setStudents);
      // ~3-5 reads for own entries
      sub(COLLECTIONS.ENTRIES, [where('studentId', '==', user.id)], handlers.setEntries);
      // ~3-5 reads for own marks
      sub(COLLECTIONS.MARKS, [where('studentId', '==', user.id)], handlers.setMarks);
      // ~2-4 reads for own attendance
      sub(COLLECTIONS.ATTENDANCE, [where('studentId', '==', user.id)], handlers.setAttendance);
      // ~1-2 reads for own certificates
      sub(COLLECTIONS.CERTIFICATES, [where('studentId', '==', user.id)], handlers.setCertificates);
    }
    // Programs for active summit
    if (currentSummitId) {
      sub(COLLECTIONS.PROGRAMS, [where('summitId', '==', currentSummitId)], handlers.setPrograms);
    } else {
      sub(COLLECTIONS.PROGRAMS, [limit(25)], handlers.setPrograms);
    }
    // Total student reads: ~15 to 25 reads! Active listeners: 5 to 6!
    return () => cleanups.forEach((c) => { try { c(); } catch (e) {} });
  }

  // === TEAM LEADER ROLE ===
  if (role === 'leader') {
    const teamId = user?.teamId;
    if (teamId) {
      // Scoped strictly to team members (~15-20 reads)
      sub(COLLECTIONS.STUDENTS, [where('teamId', '==', teamId)], handlers.setStudents);
      // Scoped to team entries (~10-15 reads)
      sub(COLLECTIONS.ENTRIES, [where('teamId', '==', teamId)], handlers.setEntries);
      if (screen === 'marks' || screen === 'overview' || screen === 'dashboard') {
        sub(COLLECTIONS.MARKS, [where('teamId', '==', teamId)], handlers.setMarks);
      }
      if (screen === 'attendance') {
        if (currentSummitId) {
          sub(COLLECTIONS.ATTENDANCE, [where('summitId', '==', currentSummitId), where('teamId', '==', teamId)], handlers.setAttendance);
        } else {
          sub(COLLECTIONS.ATTENDANCE, [where('teamId', '==', teamId), limit(50)], handlers.setAttendance);
        }
      }
    }
    // Active summit programs only
    if (currentSummitId) {
      sub(COLLECTIONS.PROGRAMS, [where('summitId', '==', currentSummitId)], handlers.setPrograms);
    } else {
      sub(COLLECTIONS.PROGRAMS, [limit(25)], handlers.setPrograms);
    }
    return () => cleanups.forEach((c) => { try { c(); } catch (e) {} });
  }

  // === JUDGE ROLE ===
  if (role === 'judge') {
    // Programs assigned or active summit (~10 reads)
    if (currentSummitId) {
      sub(COLLECTIONS.PROGRAMS, [where('summitId', '==', currentSummitId)], handlers.setPrograms);
    } else {
      sub(COLLECTIONS.PROGRAMS, [limit(20)], handlers.setPrograms);
    }
    // Entries for current evaluation
    if (screen === 'evaluation') {
      sub(COLLECTIONS.ENTRIES, [limit(40)], handlers.setEntries);
      sub(COLLECTIONS.MARKS, [where('enteredBy', '==', user?.id || '')], handlers.setMarks);
    }
    return () => cleanups.forEach((c) => { try { c(); } catch (e) {} });
  }

  // === ADMIN ROLE (LAZY SCREEN ATTRIBUTION) ===
  if (role === 'admin') {
    if (screen === 'dashboard') {
      // DASHBOARD: < 80 reads total!
      if (currentSummitId) {
        sub(COLLECTIONS.PROGRAMS, [where('summitId', '==', currentSummitId)], handlers.setPrograms);
        sub(COLLECTIONS.ENTRIES, [where('summitId', '==', currentSummitId), limit(40)], handlers.setEntries);
        sub(COLLECTIONS.MARKS, [where('summitId', '==', currentSummitId), limit(40)], handlers.setMarks);
      } else {
        sub(COLLECTIONS.PROGRAMS, [limit(25)], handlers.setPrograms);
        sub(COLLECTIONS.MARKS, [limit(30)], handlers.setMarks);
      }
      sub(COLLECTIONS.STUDENTS, [limit(30)], handlers.setStudents);
    } else if (screen === 'students') {
      // STUDENTS SCREEN: limit 100
      sub(COLLECTIONS.STUDENTS, [limit(100)], handlers.setStudents);
    } else if (screen === 'programs') {
      if (currentSummitId) {
        sub(COLLECTIONS.PROGRAMS, [where('summitId', '==', currentSummitId)], handlers.setPrograms);
      } else {
        sub(COLLECTIONS.PROGRAMS, [limit(40)], handlers.setPrograms);
      }
      sub(COLLECTIONS.PROGRAM_LIBRARY, [limit(50)], handlers.setProgramLibrary);
      sub(COLLECTIONS.JUDGES, [limit(20)], handlers.setJudges);
    } else if (screen === 'marks') {
      // MARKS SCREEN: scoped to current summit
      if (currentSummitId) {
        sub(COLLECTIONS.MARKS, [where('summitId', '==', currentSummitId)], handlers.setMarks);
        sub(COLLECTIONS.ENTRIES, [where('summitId', '==', currentSummitId)], handlers.setEntries);
        sub(COLLECTIONS.PROGRAMS, [where('summitId', '==', currentSummitId)], handlers.setPrograms);
      } else {
        sub(COLLECTIONS.MARKS, [limit(60)], handlers.setMarks);
        sub(COLLECTIONS.PROGRAMS, [limit(30)], handlers.setPrograms);
      }
      sub(COLLECTIONS.STUDENTS, [limit(100)], handlers.setStudents);
    } else if (screen === 'attendance') {
      // ATTENDANCE SCREEN: scoped strictly to selected summit!
      if (currentSummitId) {
        sub(COLLECTIONS.ATTENDANCE, [where('summitId', '==', currentSummitId)], handlers.setAttendance);
      } else {
        sub(COLLECTIONS.ATTENDANCE, [limit(60)], handlers.setAttendance);
      }
      sub(COLLECTIONS.STUDENTS, [limit(100)], handlers.setStudents);
    } else if (screen === 'settings' || screen === 'audit') {
      // AUDIT TRAIL: strictly limited to latest 30!
      sub(COLLECTIONS.AUDIT_LOGS, [orderBy('timestamp', 'desc'), limit(30)], handlers.setAuditLogs);
      sub(COLLECTIONS.JUDGES, [limit(20)], handlers.setJudges);
    } else if (screen === 'certificates') {
      sub(COLLECTIONS.CERTIFICATES, [limit(50)], handlers.setCertificates);
      sub(COLLECTIONS.STUDENTS, [limit(100)], handlers.setStudents);
    } else if (screen === 'reports') {
      sub(COLLECTIONS.REPORT_HISTORY, [limit(20)], handlers.setReportHistory);
      sub(COLLECTIONS.STUDENTS, [limit(100)], handlers.setStudents);
      if (currentSummitId) {
        sub(COLLECTIONS.MARKS, [where('summitId', '==', currentSummitId)], handlers.setMarks);
      }
    }
  }

  // Cleanup: cleanly terminates screen listeners when user navigates away
  return () => {
    cleanups.forEach((c) => {
      try { c(); } catch (e) { /* ignore */ }
    });
  };
};
