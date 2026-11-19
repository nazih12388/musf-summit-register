import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'musf_summit_data_v6';

// Cache hashes/strings of payload to prevent ping-pong loops
const lastSyncedStrings = {};
const lastReceivedStrings = {};
const debounceTimers = {};

// Cloud Sync Status Tracking
let currentStatus = {
  state: 'idle', // 'idle' | 'syncing' | 'synced' | 'quota_exhausted' | 'error'
  message: 'Cloud sync ready',
  lastSyncedAt: null,
  quotaExhausted: false,
  errorCount: 0
};

const statusListeners = new Set();

const notifyStatus = () => {
  const snapshot = { ...currentStatus };
  statusListeners.forEach((cb) => {
    try {
      cb(snapshot);
    } catch (e) {
      console.error('[Firestore Sync] Status listener callback error:', e);
    }
  });
};

export const getSyncStatus = () => ({ ...currentStatus });

export const subscribeSyncStatus = (cb) => {
  statusListeners.add(cb);
  cb(getSyncStatus());
  return () => statusListeners.delete(cb);
};

const handleSyncError = (key, err) => {
  const msg = err?.message || String(err);
  const isQuota = msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded') || err?.code === 'resource-exhausted';
  
  if (isQuota) {
    currentStatus = {
      state: 'quota_exhausted',
      message: 'Firebase Spark daily quota reached. Direct Device Transfer is active.',
      lastSyncedAt: currentStatus.lastSyncedAt,
      quotaExhausted: true,
      errorCount: currentStatus.errorCount + 1
    };
    console.warn(`[Firestore Sync] Quota exceeded on ${key}. App continues safely in Local & Direct Transfer mode.`);
  } else {
    currentStatus = {
      state: 'error',
      message: msg,
      lastSyncedAt: currentStatus.lastSyncedAt,
      quotaExhausted: currentStatus.quotaExhausted,
      errorCount: currentStatus.errorCount + 1
    };
    console.warn(`[Firestore Sync] Failed to sync ${key} to cloud:`, msg);
  }
  notifyStatus();
};

/**
 * Synchronize a state slice to Cloud Firestore
 * Deduplicates identical payloads and debounces writes to prevent quota exhaustion and loops.
 */
export const syncToCloud = (key, data) => {
  if (!db || data === undefined) return;

  try {
    const json = JSON.stringify(data);

    // If identical to what we recently received or sent, don't re-upload
    if (json === lastReceivedStrings[key] || json === lastSyncedStrings[key]) {
      return;
    }

    if (debounceTimers[key]) clearTimeout(debounceTimers[key]);

    currentStatus = {
      ...currentStatus,
      state: 'syncing',
      message: `Syncing ${key}...`
    };
    notifyStatus();

    debounceTimers[key] = setTimeout(async () => {
      try {
        lastSyncedStrings[key] = json;
        const docRef = doc(db, COLLECTION_NAME, key);
        await setDoc(docRef, {
          payload: json,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        currentStatus = {
          state: 'synced',
          message: 'All changes saved to cloud',
          lastSyncedAt: new Date().toISOString(),
          quotaExhausted: false,
          errorCount: 0
        };
        notifyStatus();
      } catch (err) {
        handleSyncError(key, err);
      }
    }, 1200);
  } catch (err) {
    console.warn(`[Firestore Sync] Error serializing ${key}:`, err);
  }
};

/**
 * Force manual sync of essential state to Cloud
 */
export const forceSyncAllToCloud = async (stateMap) => {
  if (!db || !stateMap) return false;

  currentStatus = {
    ...currentStatus,
    state: 'syncing',
    message: 'Manual cloud sync in progress...'
  };
  notifyStatus();

  let hasError = false;
  for (const [key, data] of Object.entries(stateMap)) {
    if (data === undefined) continue;
    try {
      const json = JSON.stringify(data);
      lastSyncedStrings[key] = json;
      const docRef = doc(db, COLLECTION_NAME, key);
      await setDoc(docRef, {
        payload: json,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      hasError = true;
      handleSyncError(key, err);
      break;
    }
  }

  if (!hasError) {
    currentStatus = {
      state: 'synced',
      message: 'Cloud sync complete',
      lastSyncedAt: new Date().toISOString(),
      quotaExhausted: false,
      errorCount: 0
    };
    notifyStatus();
    return true;
  }
  return false;
};

/**
 * Listen to real-time Cloud Firestore updates for a specific state slice.
 * Ignores pending local writes and identical payloads to prevent infinite echo loops.
 */
export const subscribeToCloud = (key, onUpdate) => {
  if (!db) return () => {};

  try {
    const docRef = doc(db, COLLECTION_NAME, key);
    return onSnapshot(docRef, { includeMetadataChanges: true }, (snap) => {
      // 1. Skip our own local uncommitted writes to prevent ping-pong
      if (snap.metadata.hasPendingWrites) {
        return;
      }

      if (snap.exists()) {
        const data = snap.data();
        if (data?.payload) {
          try {
            // 2. Skip if identical to what we already received or synced
            if (data.payload === lastReceivedStrings[key] || data.payload === lastSyncedStrings[key]) {
              return;
            }

            lastReceivedStrings[key] = data.payload;
            const parsed = JSON.parse(data.payload);
            onUpdate(parsed);
          } catch (e) {
            console.error(`[Firestore Sync] Failed to parse payload for ${key}:`, e);
          }
        }
      }
    }, (err) => {
      console.warn(`[Firestore Sync] Listener notice on ${key}:`, err.message);
    });
  } catch (err) {
    console.warn(`[Firestore Sync] Error setting up listener on ${key}:`, err);
    return () => {};
  }
};
