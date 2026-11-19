/**
 * Account Creation Service
 * Majlis Umariyya Wafy College - MUSF Summit Register
 *
 * Enforces:
 * 1. Uses secondary Firebase App instance (never logs out current admin).
 * 2. Never stores plain passwords in Firestore.
 * 3. Saves user metadata to users/{uid} for Firestore Security Rules.
 * 4. Supports single and bulk creation (~5 accounts/sec) with per-row reports.
 */
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, getSecondaryAuth, COLLECTIONS } from './firebase';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a friendly secure temporary password (e.g., MUSF#8421)
 */
export const generateSecurePassword = (prefix = 'MUSF') => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}#${num}`;
};

/**
 * Create a single user account using Secondary Auth (safe for admin session)
 */
export const createAccountSecondary = async ({
  username,
  password,
  role, // 'admin' | 'leader' | 'judge' | 'student'
  name,
  teamId = null,
  section = null,
  studentId = null,
  judgeId = null,
  classId = null,
  cicNo = null
}) => {
  if (!username) throw new Error('Username is required for account creation');
  if (!role) throw new Error('Role is required for account creation');

  const normalizedUser = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (!normalizedUser) throw new Error('Username contains invalid characters');

  const effectivePassword = password ? String(password).trim() : generateSecurePassword();
  if (effectivePassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const internalEmail = `${normalizedUser}@musf.app`;
  const secondaryAuth = getSecondaryAuth();

  let uid = null;

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, internalEmail, effectivePassword);
    uid = cred.user.uid;
  } catch (authErr) {
    // If user already exists in Firebase Auth, see if we can find their UID or report friendly error
    if (authErr.code === 'auth/email-already-in-use') {
      throw new Error(`An account with username @${normalizedUser} already exists.`);
    } else if (authErr.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (authErr.code === 'auth/operation-not-allowed') {
      throw new Error('Email/Password sign-in is disabled in Firebase Console.');
    }
    throw authErr;
  } finally {
    try {
      await signOut(secondaryAuth);
    } catch (e) {
      // ignore secondary signout errors
    }
  }

  // Write role, team, section to users/{uid} document in Firestore
  if (db && uid) {
    const userDocData = {
      uid,
      id: uid,
      username: normalizedUser,
      email: internalEmail,
      role,
      name: name || normalizedUser,
      teamId: teamId || null,
      section: section || null,
      studentId: studentId || null,
      judgeId: judgeId || null,
      classId: classId || null,
      cicNo: cicNo || null,
      createdAt: new Date().toISOString()
    };

    const userDocRef = doc(db, COLLECTIONS.USERS, uid);
    await setDoc(userDocRef, userDocData, { merge: true });

    // Link back to Student or Judge document if provided (NO PASSWORDS STORED!)
    if (studentId) {
      try {
        const studentRef = doc(db, COLLECTIONS.STUDENTS, String(studentId));
        await updateDoc(studentRef, {
          authUid: uid,
          username: normalizedUser,
          hasAccount: true,
          accountCreatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[AccountCreation] Could not link student document:', err);
      }
    }

    if (judgeId) {
      try {
        const judgeRef = doc(db, COLLECTIONS.JUDGES, String(judgeId));
        await updateDoc(judgeRef, {
          authUid: uid,
          username: normalizedUser,
          hasAccount: true,
          accountCreatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[AccountCreation] Could not link judge document:', err);
      }
    }
  }

  return {
    success: true,
    uid,
    username: normalizedUser,
    email: internalEmail,
    password: effectivePassword, // Returned ONLY for printable sheet; never written to DB!
    role,
    name: name || normalizedUser,
    teamId,
    cicNo
  };
};

/**
 * Bulk Account Creator (~5 accounts/sec with progress callback)
 */
export const createBulkAccounts = async (accounts, onProgress = () => {}) => {
  if (!Array.isArray(accounts) || accounts.length === 0) return [];

  const results = [];
  const total = accounts.length;

  for (let i = 0; i < total; i++) {
    const item = accounts[i];
    try {
      const created = await createAccountSecondary(item);
      results.push(created);
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
        result: {
          username: item.username,
          status: 'success',
          role: item.role,
          name: item.name
        }
      });
    } catch (err) {
      const errorMsg = err?.message || String(err);
      results.push({
        success: false,
        username: item.username,
        role: item.role,
        name: item.name,
        error: errorMsg
      });
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
        result: {
          username: item.username,
          status: 'error',
          error: errorMsg
        }
      });
    }

    // Rate-limit to ~5 accounts per second (200ms delay)
    if (i < total - 1) {
      await sleep(200);
    }
  }

  return results;
};
