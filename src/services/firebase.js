/**
 * Backend Storage and Firebase Config for MUSF Summit Register
 * Majlis Umariyya Wafy College
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyBgKOir8nkDRRt5JJcDcfaJIBHBLGjb5qI",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "musf-summit-reg.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "musf-summit-reg",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "musf-summit-reg.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "14502064606",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:14502064606:web:e4da5c514fe579d6bdad4f"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with robust multi-tab persistent offline cache
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // If already initialized (e.g. during HMR or multiple imports)
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

// Collections: each entity is its OWN first-class Firestore collection
export const COLLECTIONS = {
  STUDENTS: 'students',
  CLASSES: 'classes',
  TEAMS: 'teams',
  SUMMITS: 'summits',
  PROGRAMS: 'programs',
  PROGRAM_LIBRARY: 'programLibrary',
  ENTRIES: 'entries',
  MARKS: 'marks',
  ATTENDANCE: 'attendance',
  NOTICES: 'notices',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
  JUDGES: 'judges',
  SECTIONS: 'sections',
  FIELDS: 'fields',
  CATEGORIES: 'categories',
  CERTIFICATES: 'certificates',
  REPORT_HISTORY: 'reportHistory'
};

// Legacy storage keys retained strictly for one-time backward migration & direct backup
export const STORAGE_KEYS = {
  SECTIONS: 'musf_summit_sections_v6',
  FIELDS: 'musf_summit_fields_v6',
  PROGRAM_LIBRARY: 'musf_summit_program_library_v6',
  SUMMITS: 'musf_summit_summits_v6',
  PROGRAMS: 'musf_summit_programs_v6',
  CATEGORIES: 'musf_summit_categories_v6',
  ATTENDANCE: 'musf_summit_attendance_v6',
  MARKS: 'musf_summit_marks_v6',
  ENTRIES: 'musf_summit_entries_v6',
  STUDENTS: 'musf_summit_students_v6',
  ARCHIVED_STUDENTS: 'musf_summit_archived_students_v6',
  CLASSES: 'musf_summit_classes_v6',
  TEAMS: 'musf_summit_teams_v6',
  JUDGES: 'musf_summit_judges_v6',
  NOTICES: 'musf_summit_notices_v6',
  NOTIFICATIONS: 'musf_summit_notifications_v6',
  AUDIT_LOGS: 'musf_summit_audit_logs_v6',
  SETTINGS: 'musf_summit_settings_v6',
  CERTIFICATES: 'musf_summit_certificates_v6',
  CURRENT_USER: 'musf_summit_current_user_v6'
};
