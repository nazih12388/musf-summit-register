/**
 * One-Time Local-to-Firestore Migration Service
 * MUSF Summit Register - Majlis Umariyya Wafy College
 *
 * Reads existing data stored in localStorage / initial data
 * and migrates it into individual first-class Firestore documents.
 *
 * Characteristics:
 * - Uses writeBatch in chunks <= 400.
 * - Idempotent: safe to run multiple times with zero duplicates.
 * - Preserves existing localStorage data intact (never deletes automatically).
 */
import { STORAGE_KEYS, COLLECTIONS } from './firebase.js';
import { batchSaveDocs, saveDoc } from './firestoreService.js';
import { touchSyncModule } from './syncManager.js';
import {
  INITIAL_SECTIONS,
  INITIAL_CLASSES,
  INITIAL_TEAMS,
  INITIAL_FIELDS,
  INITIAL_PROGRAM_LIBRARY,
  INITIAL_SUMMITS,
  INITIAL_CATEGORIES,
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
  INITIAL_ADMINS
} from './initialData.js';

const readLocalArray = (storageKey, fallback) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn(`[Migration] Failed to read ${storageKey}:`, e);
  }
  return Array.isArray(fallback) ? fallback : [];
};

const readLocalObject = (storageKey, fallback) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn(`[Migration] Failed to read ${storageKey}:`, e);
  }
  return fallback && typeof fallback === 'object' ? fallback : {};
};

/**
 * Execute migration of local data to individual Firestore documents
 */
export const migrateLocalDataToCloud = async (onProgress = () => {}) => {
  const stats = {
    totalMigrated: 0,
    breakdown: {}
  };

  const entities = [
    { name: 'Sections', col: COLLECTIONS.SECTIONS, key: STORAGE_KEYS.SECTIONS, fallback: INITIAL_SECTIONS },
    { name: 'Classes', col: COLLECTIONS.CLASSES, key: STORAGE_KEYS.CLASSES, fallback: INITIAL_CLASSES },
    { name: 'Teams', col: COLLECTIONS.TEAMS, key: STORAGE_KEYS.TEAMS, fallback: INITIAL_TEAMS },
    { name: 'Fields', col: COLLECTIONS.FIELDS, key: STORAGE_KEYS.FIELDS, fallback: INITIAL_FIELDS },
    { name: 'Categories', col: COLLECTIONS.CATEGORIES, key: STORAGE_KEYS.CATEGORIES, fallback: INITIAL_CATEGORIES },
    { name: 'Summits', col: COLLECTIONS.SUMMITS, key: STORAGE_KEYS.SUMMITS, fallback: INITIAL_SUMMITS },
    { name: 'Program Library', col: COLLECTIONS.PROGRAM_LIBRARY, key: STORAGE_KEYS.PROGRAM_LIBRARY, fallback: INITIAL_PROGRAM_LIBRARY },
    { name: 'Programs', col: COLLECTIONS.PROGRAMS, key: STORAGE_KEYS.PROGRAMS, fallback: INITIAL_PROGRAMS },
    { name: 'Students', col: COLLECTIONS.STUDENTS, key: STORAGE_KEYS.STUDENTS, fallback: INITIAL_STUDENTS },
    { name: 'Judges', col: COLLECTIONS.JUDGES, key: STORAGE_KEYS.JUDGES, fallback: INITIAL_JUDGES },
    { name: 'Entries', col: COLLECTIONS.ENTRIES, key: STORAGE_KEYS.ENTRIES, fallback: INITIAL_ENTRIES },
    { name: 'Marks', col: COLLECTIONS.MARKS, key: STORAGE_KEYS.MARKS, fallback: INITIAL_MARKS },
    { name: 'Attendance', col: COLLECTIONS.ATTENDANCE, key: STORAGE_KEYS.ATTENDANCE, fallback: INITIAL_ATTENDANCE },
    { name: 'Notices', col: COLLECTIONS.NOTICES, key: STORAGE_KEYS.NOTICES, fallback: INITIAL_NOTICES },
    { name: 'Notifications', col: COLLECTIONS.NOTIFICATIONS, key: STORAGE_KEYS.NOTIFICATIONS, fallback: INITIAL_NOTIFICATIONS },
    { name: 'Certificates', col: COLLECTIONS.CERTIFICATES, key: STORAGE_KEYS.CERTIFICATES, fallback: INITIAL_CERTIFICATES },
    { name: 'Audit Logs', col: COLLECTIONS.AUDIT_LOGS, key: STORAGE_KEYS.AUDIT_LOGS, fallback: INITIAL_AUDIT_LOGS },
    { name: 'Report History', col: COLLECTIONS.REPORT_HISTORY, key: 'musf_report_history', fallback: [] },
    // Multi-Wing Collegiate Hierarchy Entities
    { name: 'Union Wings', col: COLLECTIONS.WINGS, key: STORAGE_KEYS.WINGS, fallback: INITIAL_WINGS },
    { name: 'Union Officials', col: COLLECTIONS.UNION_OFFICIALS, key: STORAGE_KEYS.UNION_OFFICIALS, fallback: INITIAL_UNION_OFFICIALS },
    { name: 'Wing Programs', col: COLLECTIONS.WING_PROGRAMS, key: STORAGE_KEYS.WING_PROGRAMS, fallback: INITIAL_WING_PROGRAMS },
    { name: 'Sports Groups', col: COLLECTIONS.SPORTS_GROUPS, key: STORAGE_KEYS.SPORTS_GROUPS, fallback: INITIAL_SPORTS_GROUPS },
    { name: 'Sports Fixtures', col: COLLECTIONS.SPORTS_FIXTURES, key: STORAGE_KEYS.SPORTS_FIXTURES, fallback: INITIAL_SPORTS_FIXTURES },
    { name: 'Banners', col: COLLECTIONS.BANNERS, key: STORAGE_KEYS.BANNERS, fallback: INITIAL_BANNERS }
  ];

  const totalSteps = entities.length + 2; // +1 for Settings, +1 for Admins
  let stepIndex = 0;

  for (const entity of entities) {
    stepIndex += 1;
    onProgress(stepIndex, Math.round((stepIndex / totalSteps) * 100), `Migrating ${entity.name}...`);

    const items = readLocalArray(entity.key, entity.fallback);
    if (items.length > 0) {
      // Ensure each item has a valid, stable id
      const sanitized = items.map((it, idx) => ({
        ...it,
        id: it.id ? String(it.id) : `${entity.col}_${idx + 1}`
      }));

      const written = await batchSaveDocs(entity.col, sanitized, 400);
      stats.breakdown[entity.col] = written;
      stats.totalMigrated += written;
    } else {
      stats.breakdown[entity.col] = 0;
    }
  }

  // Migrate Settings as a dedicated document in 'settings' collection with ID 'general'
  stepIndex += 1;
  onProgress(stepIndex, Math.round((stepIndex / totalSteps) * 100), 'Migrating Settings...');
  const settingsObj = readLocalObject(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  await saveDoc(COLLECTIONS.SETTINGS, 'general', settingsObj);
  stats.breakdown[COLLECTIONS.SETTINGS] = 1;
  stats.totalMigrated += 1;

  // Migrate Administrators into USERS collection
  stepIndex += 1;
  onProgress(stepIndex, 100, 'Migrating Admin Accounts...');
  for (const admin of INITIAL_ADMINS) {
    await saveDoc(COLLECTIONS.USERS, admin.username, {
      uid: admin.id,
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: 'admin',
      designation: admin.designation,
      updatedAt: new Date().toISOString()
    });
  }
  stats.breakdown[COLLECTIONS.USERS] = INITIAL_ADMINS.length;
  stats.totalMigrated += INITIAL_ADMINS.length;

  // Touch single-pointer sync so all clients immediately get fresh live data
  try {
    await touchSyncModule('all');
  } catch (syncErr) {
    console.warn('[Migration] Sync pointer touch notice:', syncErr);
  }

  onProgress(totalSteps, 100, 'Migration completed successfully!');
  return stats;
};
