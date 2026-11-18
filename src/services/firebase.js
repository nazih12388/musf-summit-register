/**
 * Backend Storage and Firebase Config for MUSF Summit Register
 * Majlis Umariyya Wafy College
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgKOir8nkDRRt5JJcDcfaJIBHBLGjb5qI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "musf-summit-reg.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "musf-summit-reg",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "musf-summit-reg.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "14502064606",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:14502064606:web:e4da5c514fe579d6bdad4f"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

export const STORAGE_KEYS = {
  SECTIONS: 'musf_summit_sections_v2',
  FIELDS: 'musf_summit_fields_v2',
  PROGRAM_LIBRARY: 'musf_summit_program_library_v2',
  SUMMITS: 'musf_summit_summits_v2',
  PROGRAMS: 'musf_summit_programs_v2',
  CATEGORIES: 'musf_summit_categories_v2',
  ATTENDANCE: 'musf_summit_attendance_v2',
  MARKS: 'musf_summit_marks_v2',
  ENTRIES: 'musf_summit_entries_v2',
  STUDENTS: 'musf_summit_students_v2',
  ARCHIVED_STUDENTS: 'musf_summit_archived_students_v2',
  CLASSES: 'musf_summit_classes_v2',
  TEAMS: 'musf_summit_teams_v2',
  JUDGES: 'musf_summit_judges_v2',
  NOTICES: 'musf_summit_notices_v2',
  NOTIFICATIONS: 'musf_summit_notifications_v2',
  AUDIT_LOGS: 'musf_summit_audit_logs_v2',
  SETTINGS: 'musf_summit_settings_v2',
  CURRENT_USER: 'musf_summit_current_user_v2'
};
