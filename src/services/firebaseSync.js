import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'musf_summit_data_v6';

// Cache hashes/strings of payload to prevent ping-pong loops
const lastSyncedStrings = {};
const lastReceivedStrings = {};
const debounceTimers = {};

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

    debounceTimers[key] = setTimeout(async () => {
      try {
        lastSyncedStrings[key] = json;
        const docRef = doc(db, COLLECTION_NAME, key);
        await setDoc(docRef, {
          payload: json,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn(`[Firestore Sync] Failed to sync ${key} to cloud:`, err.message);
      }
    }, 600);
  } catch (err) {
    console.warn(`[Firestore Sync] Error serializing ${key}:`, err);
  }
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
