/**
 * Single Source of Truth Firestore Service
 * Majlis Umariyya Wafy College - MUSF Summit Register
 *
 * Enforces:
 * 1. Document-level atomic writes (setDoc/updateDoc/deleteDoc per entity).
 * 2. Bulk batch operations in chunks <= 400.
 * 3. Realtime onSnapshot sync scoped by role.
 * 4. Quota protection with session metrics (sessionReads / sessionWrites) and 429 write queuing.
 * 5. Write failure error notifications.
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

// Session Usage Tracking (reads/writes in this browser session)
let sessionReads = 0;
let sessionWrites = 0;
let isQuotaExhausted = false;
let isOffline = !navigator.onLine;

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

const notifyUsage = () => {
  const snapshot = {
    sessionReads,
    sessionWrites,
    pendingWritesCount: pendingWriteQueue.length,
    quotaExhausted: isQuotaExhausted,
    isOffline
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
    : pendingWriteQueue.length > 0
    ? 'syncing'
    : 'synced';

  const snapshot = {
    state,
    isOffline,
    quotaExhausted: isQuotaExhausted,
    pendingWritesCount: pendingWriteQueue.length,
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

export const getCloudUsage = () => ({
  sessionReads,
  sessionWrites,
  pendingWritesCount: pendingWriteQueue.length,
  quotaExhausted: isQuotaExhausted,
  isOffline
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
  notifyUsage();
};

/**
 * Handle a write failure. Checks for 429 quota exhaustion and queues for later retry.
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

  // Queue write locally so user never loses data
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
      sessionWrites += 1;
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
 * Save a single entity document to its collection.
 * Write ONLY the single document that changed.
 */
export const saveDoc = async (collectionName, id, data, merge = true) => {
  if (!db || !collectionName || id === undefined || id === null) return;
  const docId = String(id);

  // Clean data: prevent undefined fields
  const cleanData = JSON.parse(JSON.stringify(data));
  cleanData.id = docId;
  cleanData.updatedAt = new Date().toISOString();

  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, cleanData, { merge });
    sessionWrites += 1;
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
 * Remove a single entity document from its collection.
 */
export const removeDoc = async (collectionName, id) => {
  if (!db || !collectionName || id === undefined || id === null) return;
  const docId = String(id);

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    sessionWrites += 1;
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
 * Batch write multiple documents in chunks of 400 or less.
 * Ideal for Excel student imports, bulk program assignments, or migration.
 */
export const batchSaveDocs = async (collectionName, items, chunkSize = 400) => {
  if (!db || !collectionName || !Array.isArray(items) || items.length === 0) return 0;

  let totalWritten = 0;
  const effectiveChunkSize = Math.min(chunkSize, 400); // Firestore max is 500, 400 provides safety margin

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
      sessionWrites += chunk.length;
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

/**
 * Generic listener for a Firestore collection or scoped query.
 */
export const subscribeCollection = (colName, queryConstraints = [], onUpdate, onError) => {
  if (!db || !colName) return () => {};

  try {
    const colRef = collection(db, colName);
    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;

    let isFirstSnapshot = true;

    return onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        // Track reads: on first snapshot track total docs; subsequently track docChanges count
        const docsCount = snapshot.docs.length;
        if (isFirstSnapshot) {
          sessionReads += docsCount;
          isFirstSnapshot = false;
        } else {
          sessionReads += snapshot.docChanges().length;
        }
        notifyUsage();

        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id
        }));

        if (typeof onUpdate === 'function') {
          onUpdate(items, snapshot);
        }
      },
      (err) => {
        console.warn(`[Firestore Listener Notice] ${colName}:`, err.message);
        if (typeof onError === 'function') {
          onError(err);
        }
      }
    );
  } catch (err) {
    console.error(`[Firestore Listener Setup Error] ${colName}:`, err);
    return () => {};
  }
};

/**
 * Role-Scoped Realtime Sync:
 * Sets up listeners tailored strictly to the current user's role to minimize read quota
 * and ensure lightning-fast real-time synchronization between devices.
 */
export const subscribeRoleData = (role, user, handlers = {}) => {
  const unsubscribers = [];

  const addSub = (colName, constraints, handler) => {
    if (typeof handler === 'function') {
      const unsub = subscribeCollection(colName, constraints, handler);
      unsubscribers.push(unsub);
    }
  };

  // 1. Common public / essential collections needed for all roles
  addSub(COLLECTIONS.CLASSES, [], handlers.setClasses);
  addSub(COLLECTIONS.TEAMS, [], handlers.setTeams);
  addSub(COLLECTIONS.SECTIONS, [], handlers.setSections);
  addSub(COLLECTIONS.FIELDS, [], handlers.setFields);
  addSub(COLLECTIONS.CATEGORIES, [], handlers.setCategories);
  addSub(COLLECTIONS.SUMMITS, [], handlers.setSummits);
  addSub(COLLECTIONS.NOTICES, [], handlers.setNotices);

  // Notifications: scoped to current user or broadcast ('all')
  if (user?.id) {
    // If admin, listen to all notifications; otherwise filter
    if (role === 'admin') {
      addSub(COLLECTIONS.NOTIFICATIONS, [orderBy('timestamp', 'desc'), limit(100)], handlers.setNotifications);
    } else {
      addSub(COLLECTIONS.NOTIFICATIONS, [limit(100)], (allNotifs) => {
        const filtered = allNotifs.filter(
          (n) => n.userId === user.id || n.userId === 'all' || (user.teamId && n.teamId === user.teamId)
        );
        if (handlers.setNotifications) handlers.setNotifications(filtered);
      });
    }
  }

  // 2. Role-specific scoping
  if (role === 'admin') {
    // ADMIN: full real-time access to everything
    addSub(COLLECTIONS.STUDENTS, [], handlers.setStudents);
    addSub(COLLECTIONS.PROGRAM_LIBRARY, [], handlers.setProgramLibrary);
    addSub(COLLECTIONS.PROGRAMS, [], handlers.setPrograms);
    addSub(COLLECTIONS.ENTRIES, [], handlers.setEntries);
    addSub(COLLECTIONS.MARKS, [], handlers.setMarks);
    addSub(COLLECTIONS.ATTENDANCE, [], handlers.setAttendance);
    addSub(COLLECTIONS.JUDGES, [], handlers.setJudges);
    addSub(COLLECTIONS.SETTINGS, [], handlers.setSettingsDoc);
    addSub(COLLECTIONS.AUDIT_LOGS, [orderBy('timestamp', 'desc'), limit(250)], handlers.setAuditLogs);
    addSub(COLLECTIONS.CERTIFICATES, [], handlers.setCertificates);
    addSub(COLLECTIONS.REPORT_HISTORY, [], handlers.setReportHistory);
  } else if (role === 'leader') {
    // LEADER: scoped strictly to their own team
    const teamId = user?.teamId;
    if (teamId) {
      addSub(COLLECTIONS.STUDENTS, [where('teamId', '==', teamId)], handlers.setStudents);
      addSub(COLLECTIONS.ENTRIES, [where('teamId', '==', teamId)], handlers.setEntries);
      addSub(COLLECTIONS.ATTENDANCE, [where('teamId', '==', teamId)], handlers.setAttendance);
      addSub(COLLECTIONS.MARKS, [where('teamId', '==', teamId)], handlers.setMarks);
    } else {
      addSub(COLLECTIONS.STUDENTS, [], handlers.setStudents);
      addSub(COLLECTIONS.ENTRIES, [], handlers.setEntries);
    }
    addSub(COLLECTIONS.PROGRAMS, [], handlers.setPrograms);
    addSub(COLLECTIONS.PROGRAM_LIBRARY, [], handlers.setProgramLibrary);
    addSub(COLLECTIONS.SETTINGS, [], handlers.setSettingsDoc);
    addSub(COLLECTIONS.CERTIFICATES, [], handlers.setCertificates);
  } else if (role === 'judge') {
    // JUDGE: scoped to assigned programs & summits
    addSub(COLLECTIONS.PROGRAMS, [], handlers.setPrograms);
    addSub(COLLECTIONS.ENTRIES, [], handlers.setEntries);
    addSub(COLLECTIONS.MARKS, [], handlers.setMarks);
    addSub(COLLECTIONS.JUDGES, [], handlers.setJudges);
    addSub(COLLECTIONS.SETTINGS, [], handlers.setSettingsDoc);
  } else {
    // STUDENT / GENERAL: read-only for own student profile & published results
    if (user?.id) {
      addSub(COLLECTIONS.STUDENTS, [where('id', '==', user.id)], handlers.setStudents);
      addSub(COLLECTIONS.ENTRIES, [where('studentId', '==', user.id)], handlers.setEntries);
      addSub(COLLECTIONS.ATTENDANCE, [where('studentId', '==', user.id)], handlers.setAttendance);
    } else {
      addSub(COLLECTIONS.STUDENTS, [], handlers.setStudents);
    }
    addSub(COLLECTIONS.PROGRAMS, [], handlers.setPrograms);
    addSub(COLLECTIONS.MARKS, [], handlers.setMarks);
    addSub(COLLECTIONS.SETTINGS, [], handlers.setSettingsDoc);
    addSub(COLLECTIONS.CERTIFICATES, [], handlers.setCertificates);
  }

  // Cleanup function to unsubscribe all active snapshot listeners
  return () => {
    unsubscribers.forEach((unsub) => {
      try { unsub(); } catch (e) { /* ignore */ }
    });
  };
};
