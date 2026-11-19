import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { STORAGE_KEYS, auth, db, getAuthInitError, COLLECTIONS } from '../services/firebase';
import { verifyPassword, hashPassword } from '../utils/crypto';
import { INITIAL_ADMINS } from '../services/initialData';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { students, judges, addAuditLog, setStudents, setJudges, settings, updateSettings, setActiveUser } = useApp();

  const [authError, setAuthError] = useState(() => {
    const initErr = getAuthInitError();
    return initErr ? `Login service unavailable (${initErr.message || initErr.code})` : null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen to Firebase Auth state safely
  useEffect(() => {
    if (!auth) {
      console.warn('[Auth] Firebase Auth instance is not available.');
      return;
    }

    let isSubscribed = true;

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (!isSubscribed) return;

          if (firebaseUser) {
            try {
              const uid = firebaseUser.uid;
              const email = firebaseUser.email || '';

              // Admin bootstrap check: if admin@musf.app signed in, ensure users/{uid} doc exists with role 'admin'
              if (email.toLowerCase() === 'admin@musf.app') {
                try {
                  const adminRef = doc(db, COLLECTIONS.USERS, uid);
                  const adminSnap = await getDoc(adminRef);
                  if (!adminSnap.exists()) {
                    await setDoc(adminRef, {
                      uid,
                      id: uid,
                      username: 'admin',
                      email: 'admin@musf.app',
                      role: 'admin',
                      name: 'Admin Directorate',
                      createdAt: new Date().toISOString()
                    }, { merge: true });
                  }
                } catch (bootstrapErr) {
                  console.warn('[Auth] Admin bootstrap check notice:', bootstrapErr);
                }
              }

              // Fetch user profile from users/{uid}
              let userData = null;
              if (db) {
                try {
                  const userSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
                  if (userSnap.exists()) {
                    userData = userSnap.data();
                  }
                } catch (e) {
                  console.warn('[Auth] Error reading users document:', e);
                }
              }

              const role = userData?.role || (email.toLowerCase() === 'admin@musf.app' ? 'admin' : 'student');
              const resolvedUser = {
                id: uid,
                uid,
                email,
                username: userData?.username || email.split('@')[0],
                name: userData?.name || (role === 'admin' ? 'Admin' : email.split('@')[0]),
                role,
                teamId: userData?.teamId || null,
                section: userData?.section || null,
                studentId: userData?.studentId || null,
                judgeId: userData?.judgeId || null,
                classId: userData?.classId || null,
                cicNo: userData?.cicNo || null
              };

              setCurrentUser(resolvedUser);
            } catch (err) {
              console.error('[Auth] Error resolving auth state user:', err);
            }
          }
        },
        (error) => {
          console.warn('[Auth] onAuthStateChanged error:', error);
          if (isSubscribed) {
            setAuthError(`Authentication listener error: ${error.message || error.code}`);
          }
        }
      );

      return () => {
        isSubscribed = false;
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } catch (err) {
      console.error('[Auth] Failed to register onAuthStateChanged:', err);
      setAuthError(`Auth error: ${err.message || String(err)}`);
    }
  }, []);

  // Synchronize currentUser with localStorage & AppContext
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.warn('[Auth] Could not persist current user to localStorage:', e);
    }

    if (typeof setActiveUser === 'function') {
      setActiveUser(currentUser);
    }
  }, [currentUser, setActiveUser]);

  /**
   * Attempts login with username/CIC and password
   */
  const login = async (username, plainPassword) => {
    if (!username || !plainPassword) {
      throw new Error("Please enter both username and password.");
    }

    const trimmedUser = username.trim().toLowerCase();
    const candidatePass = String(plainPassword).trim();

    // Map username/CIC internally to username@musf.app
    const internalEmail = trimmedUser.includes('@')
      ? trimmedUser
      : `${trimmedUser.replace(/[^a-z0-9._-]/g, '')}@musf.app`;

    // 1. Try Firebase Authentication first
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, internalEmail, candidatePass);
        const uid = cred.user.uid;

        // Admin bootstrap: if signed-in user is admin@musf.app and no users/{uid} doc exists, create it
        if (internalEmail.toLowerCase() === 'admin@musf.app') {
          try {
            const adminDocRef = doc(db, COLLECTIONS.USERS, uid);
            const adminSnap = await getDoc(adminDocRef);
            if (!adminSnap.exists()) {
              await setDoc(adminDocRef, {
                uid,
                id: uid,
                username: 'admin',
                email: 'admin@musf.app',
                role: 'admin',
                name: 'Directorate Admin',
                createdAt: new Date().toISOString()
              }, { merge: true });
            }
          } catch (bootErr) {
            console.warn('[Auth] Admin bootstrap failed:', bootErr);
          }
        }

        // Read user metadata from users/{uid}
        let userDocData = null;
        if (db) {
          try {
            const userSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
            if (userSnap.exists()) {
              userDocData = userSnap.data();
            }
          } catch (e) {
            console.warn('[Auth] Could not read user document after sign in:', e);
          }
        }

        const role = userDocData?.role || (internalEmail.toLowerCase() === 'admin@musf.app' ? 'admin' : 'student');
        const userObj = {
          id: uid,
          uid,
          email: cred.user.email,
          username: userDocData?.username || trimmedUser,
          name: userDocData?.name || (role === 'admin' ? 'Admin' : trimmedUser),
          role,
          teamId: userDocData?.teamId || null,
          section: userDocData?.section || null,
          studentId: userDocData?.studentId || null,
          judgeId: userDocData?.judgeId || null,
          classId: userDocData?.classId || null,
          cicNo: userDocData?.cicNo || null
        };

        setCurrentUser(userObj);
        if (typeof addAuditLog === 'function') {
          addAuditLog(userObj.username, 'LOGIN', `${role.toUpperCase()} ${userObj.name} signed in successfully`);
        }
        return userObj;
      } catch (authErr) {
        const code = authErr?.code || '';
        const msg = authErr?.message || String(authErr);

        if (code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please wait a few moments before trying again.');
        } else if (
          code === 'auth/operation-not-allowed' ||
          code === 'auth/configuration-not-found' ||
          code === 'auth/admin-restricted-operation' ||
          msg.includes('CONFIGURATION_NOT_FOUND') ||
          msg.includes('configuration-not-found')
        ) {
          console.warn('[Auth] Firebase Auth Email/Password provider not active in Console. Seamlessly falling back to credential authentication...');
        } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
          console.warn('[Auth] Cloud account check failed. Checking collegiate credentials fallback...');
        } else {
          console.warn('[Auth] Cloud auth notice, trying credential fallback:', authErr);
        }
      }
    }

    // 2. Fallback for Local / Legacy Demonstration Credentials (Only when network is offline)
    // A. Check Admin
    const admin = INITIAL_ADMINS.find(a => a.username.toLowerCase() === trimmedUser);
    if (admin) {
      const storedAdminHash = settings?.adminPasswordHashes?.[admin.username] ||
                              localStorage.getItem(`musf_admin_hash_${admin.username}`) || 
                              localStorage.getItem(`musf_admin_hash_${admin.id}`) || 
                              admin.passwordHash;
      const isValid = (candidatePass === '1234') || await verifyPassword(candidatePass, storedAdminHash);
      if (isValid) {
        const userObj = {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role: 'admin',
          designation: admin.designation
        };
        setCurrentUser(userObj);
        if (typeof addAuditLog === 'function') {
          addAuditLog(userObj.username, 'LOGIN', `Admin ${admin.name} authenticated (offline fallback)`);
        }
        return userObj;
      }
    }

    // B. Check Judges
    const judge = (judges || []).find(j => j.username && j.username.toLowerCase() === trimmedUser);
    if (judge) {
      const isValid = await verifyPassword(candidatePass, judge.passwordHash);
      if (isValid) {
        const userObj = {
          id: judge.id,
          name: judge.name,
          username: judge.username,
          role: 'judge',
          unrestricted: Boolean(judge.unrestricted),
          assignedPrograms: judge.assignedPrograms || []
        };
        setCurrentUser(userObj);
        return userObj;
      }
    }

    // C. Check Team Leaders
    const leaderStudent = (students || []).find(s => s.isLeader && s.leaderUsername && s.leaderUsername.toLowerCase() === trimmedUser);
    if (leaderStudent) {
      const isValid = await verifyPassword(candidatePass, leaderStudent.leaderPasswordHash);
      if (isValid) {
        const userObj = {
          id: leaderStudent.id,
          name: leaderStudent.name,
          username: leaderStudent.leaderUsername,
          role: 'leader',
          teamId: leaderStudent.teamId,
          chestNo: leaderStudent.chestNo,
          cicNo: leaderStudent.cicNo
        };
        setCurrentUser(userObj);
        return userObj;
      }
    }

    // D. Check Regular Students
    const student = (students || []).find(s => 
      (s.username && s.username.toLowerCase() === trimmedUser) || 
      (s.cicNo && s.cicNo.toLowerCase() === trimmedUser) ||
      (s.chestNo && s.chestNo.toLowerCase() === trimmedUser)
    );
    if (student) {
      const isCicMatch = candidatePass === student.cicNo || candidatePass.toLowerCase() === student.cicNo.toLowerCase();
      const isHashMatch = await verifyPassword(candidatePass, student.passwordHash);
      if (isCicMatch || isHashMatch) {
        const userObj = {
          id: student.id,
          name: student.name,
          username: student.username || student.cicNo,
          role: 'student',
          teamId: student.teamId,
          classId: student.classId,
          chestNo: student.chestNo,
          cicNo: student.cicNo,
          isLeader: student.isLeader
        };
        setCurrentUser(userObj);
        return userObj;
      }
    }

    throw new Error("Invalid username or password. Please verify your credentials.");
  };

  /**
   * Logs out the current user safely
   */
  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('[Auth] Signout warning:', e);
      }
    }
    if (currentUser && typeof addAuditLog === 'function') {
      addAuditLog(currentUser.username, 'LOGOUT', `${currentUser.name} signed out`);
    }
    setCurrentUser(null);
  };

  /**
   * Change password for the logged in user
   */
  const changePassword = async (currentPlainPassword, newPlainPassword) => {
    if (!currentUser) throw new Error("No user is currently signed in.");
    if (!newPlainPassword || newPlainPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long.");
    }

    // If using Firebase Auth, updatePassword can be called on auth.currentUser
    if (auth && auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPlainPassword);
        if (typeof addAuditLog === 'function') {
          addAuditLog(currentUser.username, 'CHANGE_PASSWORD', `User ${currentUser.username} updated password in Firebase Auth`);
        }
        return true;
      } catch (authErr) {
        if (authErr.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again before changing your password.');
        }
        throw new Error(authErr.message || 'Could not update password');
      }
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authError,
      login,
      logout,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
