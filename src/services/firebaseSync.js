import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'musf_summit_data_v3';
const debounceTimers = {};

/**
 * Synchronize a state slice to Cloud Firestore
 * Uses debouncing so fast edits (e.g. typing marks) batch gracefully.
 */
export const syncToCloud = (key, data) => {
  if (!db || data === undefined) return;
  if (debounceTimers[key]) clearTimeout(debounceTimers[key]);

  debounceTimers[key] = setTimeout(async () => {
    try {
      const docRef = doc(db, COLLECTION_NAME, key);
      await setDoc(docRef, {
        payload: JSON.stringify(data),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn(`[Firestore Sync] Failed to sync ${key}:`, err);
    }
  }, 400);
};

/**
 * Listen to real-time Cloud Firestore updates for a specific state slice.
 */
export const subscribeToCloud = (key, onUpdate) => {
  if (!db) return () => {};
  try {
    const docRef = doc(db, COLLECTION_NAME, key);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.payload) {
          try {
            const parsed = JSON.parse(data.payload);
            onUpdate(parsed);
          } catch (e) {
            console.error(`[Firestore Sync] Failed to parse ${key}:`, e);
          }
        }
      }
    }, (err) => {
      console.warn(`[Firestore Sync] Listener warning on ${key}:`, err);
    });
  } catch (err) {
    console.warn(`[Firestore Sync] Error setting up listener on ${key}:`, err);
    return () => {};
  }
};
