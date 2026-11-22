/**
 * Single-Pointer Auto-Sync & Incremental Cache Architecture
 * Majlis Umariyya Wafy College - MUSF Students' Union & Summit Register
 *
 * Firebase Free Plan Protection:
 * 1. Exactly ONE tiny onSnapshot listener attached to 'meta/sync'.
 * 2. Modules update their respective '*UpdatedAt' timestamp in 'meta/sync'.
 * 3. Client compares remote timestamps against localStorage cached timestamps.
 * 4. Incremental fetch: ONLY modified modules are fetched when data actually changes.
 * 5. On page refresh (F5): Instant local cache render, ZERO collection refetches if unchanged.
 */

import {
  doc,
  setDoc,
  onSnapshot,
  getDocs,
  collection,
  query,
  limit
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase.js';

export const SYNC_POINTER_PATH = { col: 'meta', doc: 'sync' };
export const SYNC_STORAGE_KEY = 'musf_sync_meta_v2';

// Declarative mapping of sync module keys -> timestamp field & collection
export const MODULE_REGISTRY = {
  notifications: {
    field: 'notificationsUpdatedAt',
    collection: COLLECTIONS.NOTIFICATIONS,
    storageKey: 'musf_summit_notifications_v6',
    maxFetch: 50
  },
  wingPrograms: {
    field: 'wingProgramsUpdatedAt',
    collection: COLLECTIONS.WING_PROGRAMS,
    storageKey: 'musf_union_wing_programs_v1',
    maxFetch: 250
  },
  programs: {
    field: 'programsUpdatedAt',
    collection: COLLECTIONS.PROGRAMS,
    storageKey: 'musf_summit_programs_v6',
    maxFetch: 250
  },
  results: {
    field: 'resultsUpdatedAt',
    collection: COLLECTIONS.MARKS,
    storageKey: 'musf_summit_marks_v6',
    maxFetch: 300
  },
  entries: {
    field: 'entriesUpdatedAt',
    collection: COLLECTIONS.ENTRIES,
    storageKey: 'musf_summit_entries_v6',
    maxFetch: 300
  },
  students: {
    field: 'studentsUpdatedAt',
    collection: COLLECTIONS.STUDENTS,
    storageKey: 'musf_summit_students_v6',
    maxFetch: 300
  },
  wings: {
    field: 'wingsUpdatedAt',
    collection: COLLECTIONS.WINGS,
    storageKey: 'musf_union_wings_v1',
    maxFetch: 50
  },
  officials: {
    field: 'officialsUpdatedAt',
    collection: COLLECTIONS.UNION_OFFICIALS,
    storageKey: 'musf_union_officials_v1',
    maxFetch: 50
  },
  notices: {
    field: 'noticesUpdatedAt',
    collection: COLLECTIONS.NOTICES,
    storageKey: 'musf_summit_notices_v6',
    maxFetch: 50
  },
  sportsFixtures: {
    field: 'sportsFixturesUpdatedAt',
    collection: COLLECTIONS.SPORTS_FIXTURES,
    storageKey: 'musf_sports_fixtures_v1',
    maxFetch: 100
  },
  sportsGroups: {
    field: 'sportsGroupsUpdatedAt',
    collection: COLLECTIONS.SPORTS_GROUPS,
    storageKey: 'musf_sports_groups_v1',
    maxFetch: 50
  },
  certificates: {
    field: 'certificatesUpdatedAt',
    collection: COLLECTIONS.CERTIFICATES,
    storageKey: 'musf_summit_certificates_v6',
    maxFetch: 150
  },
  settings: {
    field: 'settingsUpdatedAt',
    collection: COLLECTIONS.SETTINGS,
    storageKey: 'musf_summit_settings_v6',
    maxFetch: 5
  }
};

// Map collection name directly to module key for instant lookups
const COLLECTION_TO_MODULE = {};
Object.entries(MODULE_REGISTRY).forEach(([modKey, conf]) => {
  COLLECTION_TO_MODULE[conf.collection] = modKey;
});

/**
 * Retrieve local cached timestamps from localStorage
 */
export const getLocalTimestamps = () => {
  try {
    const raw = localStorage.getItem(SYNC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Update a specific timestamp in local cache
 */
export const updateLocalTimestamp = (field, timestamp) => {
  try {
    const current = getLocalTimestamps();
    current[field] = timestamp;
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('[SyncManager] Failed to save local timestamp:', e);
  }
};

/**
 * Touch a module's timestamp in Firestore 'meta/sync'.
 * When called, all other devices receive the update via their single onSnapshot listener.
 */
export const touchSyncModule = async (moduleOrCollection) => {
  if (!db) return;

  let modKey = MODULE_REGISTRY[moduleOrCollection] ? moduleOrCollection : COLLECTION_TO_MODULE[moduleOrCollection];
  if (!modKey && moduleOrCollection === 'marks') modKey = 'results';
  if (!modKey) return;

  const conf = MODULE_REGISTRY[modKey];
  if (!conf) return;

  const now = new Date().toISOString();

  // Optimistically set locally so writer does not re-fetch its own changes
  updateLocalTimestamp(conf.field, now);

  try {
    const syncDocRef = doc(db, SYNC_POINTER_PATH.col, SYNC_POINTER_PATH.doc);
    await setDoc(syncDocRef, {
      [conf.field]: now,
      lastTouch: now,
      lastTouchedModule: modKey
    }, { merge: true });
    console.log(`[SyncManager] Touched ${conf.field} at ${now}`);
  } catch (err) {
    console.warn(`[SyncManager] Failed to touch ${conf.field}:`, err?.message || err);
  }
};

/**
 * Fetch all documents in a collection with safe limits
 */
const fetchCollectionDocs = async (colName, maxFetch = 250) => {
  if (!db || !colName) return [];
  const colRef = collection(db, colName);
  const q = query(colRef, limit(maxFetch));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
};

/**
 * Initialize the Single onSnapshot Listener on 'meta/sync'.
 * - Attaches ONE listener to the tiny 'meta/sync' document.
 * - On first load / F5: Compares timestamps with localStorage. If identical, 0 collections fetched!
 * - When remote timestamp > local timestamp: Fetches ONLY that specific collection and updates UI.
 */
export const startSyncPointerListener = (handlers = {}) => {
  if (!db) return () => {};

  const syncDocRef = doc(db, SYNC_POINTER_PATH.col, SYNC_POINTER_PATH.doc);
  let isInitialSnapshot = true;

  const unsubscribe = onSnapshot(
    syncDocRef,
    async (docSnap) => {
      if (!docSnap.exists()) {
        // Document does not exist yet: initialize with current baseline timestamps
        try {
          const initPayload = { lastTouch: new Date().toISOString() };
          const now = new Date().toISOString();
          Object.values(MODULE_REGISTRY).forEach(m => {
            initPayload[m.field] = now;
          });
          await setDoc(syncDocRef, initPayload, { merge: true });
          localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(initPayload));
        } catch (e) {
          console.warn('[SyncManager] Init meta/sync notice:', e?.message || e);
        }
        return;
      }

      const remoteData = docSnap.data() || {};
      const localData = getLocalTimestamps();

      // Find which modules have been updated since local cache
      const changedModules = [];
      for (const [modKey, conf] of Object.entries(MODULE_REGISTRY)) {
        const remoteTime = remoteData[conf.field];
        const localTime = localData[conf.field];

        if (remoteTime && (!localTime || remoteTime > localTime)) {
          changedModules.push({ modKey, conf, remoteTime });
        }
      }

      if (changedModules.length === 0) {
        if (isInitialSnapshot) {
          console.log('[Auto-Sync] Local cache is fresh. Instant load from localStorage: 0 collection reads consumed!');
          isInitialSnapshot = false;
        }
        return;
      }

      // Incrementally fetch ONLY the changed collections in parallel
      console.log(`[Auto-Sync] Changes detected in ${changedModules.length} module(s):`, changedModules.map(m => m.modKey).join(', '));

      await Promise.allSettled(
        changedModules.map(async ({ modKey, conf, remoteTime }) => {
          try {
            const items = await fetchCollectionDocs(conf.collection, conf.maxFetch);
            
            // Deliver live to AppContext state handler
            const handler = handlers[modKey];
            if (typeof handler === 'function') {
              handler(items);
            }

            // Persist to local storage
            try {
              localStorage.setItem(conf.storageKey, JSON.stringify(items));
            } catch (_) {}

            // Update local timestamp so this client is up to date
            updateLocalTimestamp(conf.field, remoteTime);
            console.log(`[Auto-Sync] Live synced ${modKey}: ${items.length} records updated.`);
          } catch (fetchErr) {
            console.warn(`[Auto-Sync] Failed to fetch ${modKey}:`, fetchErr?.message || fetchErr);
          }
        })
      );

      isInitialSnapshot = false;
    },
    (err) => {
      console.warn('[Auto-Sync Pointer Notice]:', err?.message || err);
    }
  );

  return unsubscribe;
};
