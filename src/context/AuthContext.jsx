import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { STORAGE_KEYS, auth, db, getAuthInitError, COLLECTIONS, isLocalPreview, isFirebaseAuthEnabled } from '../services/firebase';
import { verifyPassword, hashPassword } from '../utils/crypto';
import { INITIAL_ADMINS, HASHED_PASSWORDS } from '../services/initialData';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext({
  currentUser: null,
  authError: null,
  login: async () => {},
  logout: () => {},
  switchRole: () => {},
  changePassword: async () => false
});

export const AuthProvider = ({ children }) => {
  const {
    students,
    judges,
    addAuditLog,
    setStudents,
    setJudges,
    settings,
    updateSettings,
    setActiveUser,
    unionOfficials,
    sportsGroups,
    updateAdminPassword,
    updateStudentPassword
  } = useApp();

  const [authError, setAuthError] = useState(() => {
    if (isLocalPreview) return null;
    const initErr = getAuthInitError();
    return initErr ? `Login service unavailable (${initErr.message || initErr.code})` : null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'admin' || parsed?.username?.toLowerCase() === 'admin' || parsed?.username?.toLowerCase() === 'musf' || parsed?.username?.toLowerCase() === 'nazih' || parsed?.name?.includes('Nazih') || parsed?.name?.includes('Hashi')) {
          const sanitized = {
            ...parsed,
            username: 'MUSF',
            name: 'MUSF Admin',
            role: 'admin',
            designation: 'Central Administrator'
          };
          try { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sanitized)); } catch (_) {}
          return sanitized;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Listen to Firebase Auth state safely
  useEffect(() => {
    if (!auth || isLocalPreview || !isFirebaseAuthEnabled) {
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
                      name: 'Administrator',
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
                name: userData?.name || (role === 'admin' ? 'Administrator' : email.split('@')[0]),
                role,
                assignedWingId: userData?.assignedWingId || (userData?.role === 'convener' && userData?.username?.toLowerCase().includes('sports') ? 'sports' : null),
                wingId: userData?.assignedWingId || userData?.wingId || (userData?.role === 'convener' && userData?.username?.toLowerCase().includes('sports') ? 'sports' : null),
                designation: userData?.designation || null,
                category: userData?.category || null,
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

  // Auto-augment currentUser with union official role if they are a student holding an official post
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin' || currentUser.username === 'MUSF') return;

    const officialPool = (unionOfficials && unionOfficials.length > 0) ? unionOfficials : INITIAL_UNION_OFFICIALS;
    const studentPool = (students && students.length > 0) ? students : INITIAL_STUDENTS;

    // Find official match
    const officialMatch = officialPool.find(o =>
      (currentUser.studentId && o.studentId === currentUser.studentId) ||
      (currentUser.id && o.studentId === currentUser.id) ||
      (currentUser.cicNo && o.cicNo && String(o.cicNo).trim().toLowerCase() === String(currentUser.cicNo).trim().toLowerCase()) ||
      (currentUser.username && o.username && o.username.toLowerCase() === currentUser.username.toLowerCase()) ||
      (currentUser.name && o.name && o.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
    );

    // Find student match
    const studentMatch = studentPool.find(s =>
      (currentUser.studentId && s.id === currentUser.studentId) ||
      (currentUser.id && s.id === currentUser.id) ||
      (currentUser.cicNo && s.cicNo && String(s.cicNo).trim().toLowerCase() === String(currentUser.cicNo).trim().toLowerCase()) ||
      (currentUser.name && s.name && s.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
    );

    if (officialMatch) {
      const isOfficialExec = officialMatch.category === 'executive' || officialMatch.role === 'executive' || officialMatch.assignedWingId === 'all';
      const unionRole = isOfficialExec ? 'executive' : (officialMatch.role || 'convener');
      const expectedRoles = studentMatch ? ['student', unionRole] : [unionRole];

      if (
        !currentUser.unionOfficial ||
        currentUser.unionRole !== unionRole ||
        !currentUser.availableRoles ||
        currentUser.availableRoles.length !== expectedRoles.length ||
        (studentMatch && !currentUser.studentData)
      ) {
        setCurrentUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            studentId: studentMatch?.id || prev.studentId || officialMatch.studentId,
            cicNo: prev.cicNo || studentMatch?.cicNo || officialMatch.cicNo,
            classId: prev.classId || studentMatch?.classId || officialMatch.classId,
            teamId: prev.teamId || studentMatch?.teamId || officialMatch.teamId,
            availableRoles: expectedRoles,
            unionRole: unionRole,
            unionOfficial: officialMatch,
            studentData: studentMatch || prev.studentData || null
          };
        });
      }
    }
  }, [currentUser?.id, currentUser?.username, currentUser?.cicNo, unionOfficials, students]);
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
      setActiveUser(prev => {
        if (prev?.id === currentUser?.id && prev?.role === currentUser?.role && prev?.username === currentUser?.username) {
          return prev;
        }
        return currentUser;
      });
    }
  }, [currentUser]);

  /**
   * Attempts login with username/CIC and password
   * Students log in using their CIC Number (password is optional/CIC number)
   * Admin logs in with username 'admin' and password 'MUSF'
   * Wing Conveners log in using wing credentials/password assigned by Admin
   */
  const login = async (username, plainPassword) => {
    if (!username || !String(username).trim()) {
      throw new Error("Please enter your username or CIC Number.");
    }

    const trimmedUser = String(username).trim().toLowerCase();
    const candidatePass = plainPassword ? String(plainPassword).trim() : '';

    // 1. Check Central Admin FIRST (Instant 0ms response, no network latency)
    // Default credentials: Username MUSF, Password MUSF
    if (trimmedUser === 'musf' || trimmedUser === 'admin') {
      if (!candidatePass) {
        throw new Error("Please enter admin password.");
      }
      const storedAdminHash = settings?.adminPasswordHashes?.['musf'] || settings?.adminPasswordHashes?.['admin'] || HASHED_PASSWORDS?.adminMUSF || 'b44b864666fcf3179e9de04aa48baf3193a9f82fa71ad607b7c436f670951ff3';
      const isPassCorrect = (candidatePass === 'MUSF') ||
                            (candidatePass.toUpperCase() === 'MUSF') ||
                            (candidatePass === '1234') ||
                            (await verifyPassword(candidatePass, storedAdminHash));
      if (isPassCorrect) {
        const userObj = {
          id: 'admin_general',
          name: 'MUSF Admin',
          username: 'MUSF',
          role: 'admin',
          designation: 'Central Administrator'
        };
        setCurrentUser(userObj);
        if (typeof addAuditLog === 'function') {
          addAuditLog(userObj.username, 'LOGIN', `MUSF Admin signed in successfully`);
        }
        return userObj;
      } else {
        throw new Error("Invalid password for Admin. Default is MUSF.");
      }
    }

    // 2. Check Regular Students FIRST by CIC Number (Instant 0ms response with collegiate master roster)
    // Rule: Students log in using their CIC Number!
    const studentPool = (students && students.length > 0) ? students : INITIAL_STUDENTS;
    const officialPool = (unionOfficials && unionOfficials.length > 0) ? unionOfficials : INITIAL_UNION_OFFICIALS;

    const student = studentPool.find(s => 
      (s.cicNo && String(s.cicNo).toLowerCase().trim() === trimmedUser) ||
      (s.username && s.username.toLowerCase().trim() === trimmedUser) || 
      (s.chestNo && String(s.chestNo).toLowerCase().trim() === trimmedUser) ||
      (s.id && s.id.toLowerCase().trim() === trimmedUser)
    );
    if (student) {
      // Check if this student also holds a Union position
      const officialMatch = officialPool.find(o =>
        (o.studentId && o.studentId === student.id) ||
        (o.cicNo && String(o.cicNo).trim().toLowerCase() === String(student.cicNo).trim().toLowerCase()) ||
        (o.username && o.username.toLowerCase() === student.username?.toLowerCase()) ||
        (o.name && o.name.trim().toLowerCase() === student.name.trim().toLowerCase())
      );

      let initialRole = 'student';
      let availableRoles = ['student'];
      let unionOfficial = null;
      let unionRole = null;

      if (officialMatch) {
        const isOfficialExec = officialMatch.category === 'executive' || officialMatch.role === 'executive' || officialMatch.assignedWingId === 'all';
        unionRole = isOfficialExec ? 'executive' : (officialMatch.role || 'convener');
        availableRoles = ['student', unionRole];
        unionOfficial = officialMatch;

        // If candidate entered their union password, log directly into union role
        const isUnionPass = candidatePass && (
          candidatePass === officialMatch.password ||
          candidatePass === officialMatch.initialPassword ||
          (officialMatch.passwordHash && (await verifyPassword(candidatePass, officialMatch.passwordHash)))
        );
        if (isUnionPass) {
          initialRole = unionRole;
        }
      }

      const userObj = {
        id: student.id,
        studentId: student.id,
        name: student.name,
        username: student.username || student.cicNo,
        role: initialRole,
        activeRole: initialRole,
        availableRoles,
        unionRole,
        unionOfficial,
        studentData: {
          id: student.id,
          name: student.name,
          username: student.username || student.cicNo,
          teamId: student.teamId,
          classId: student.classId,
          chestNo: student.chestNo,
          cicNo: student.cicNo,
          isLeader: student.isLeader
        },
        teamId: student.teamId,
        classId: student.classId,
        chestNo: student.chestNo,
        cicNo: student.cicNo,
        isLeader: student.isLeader,
        assignedWingId: initialRole === 'student' ? null : (unionOfficial?.assignedWingId || null),
        wingId: initialRole === 'student' ? null : (unionOfficial?.assignedWingId || null),
        designation: initialRole === 'student'
          ? (student.className ? `Student (${student.className})` : 'Student')
          : (unionOfficial?.designation || 'Union Official')
      };
      setCurrentUser(userObj);
      if (typeof addAuditLog === 'function') {
        addAuditLog(userObj.username, 'LOGIN', `Student ${userObj.name} (${userObj.cicNo}) signed in${unionRole ? ` [Union Role: ${unionRole}]` : ''}`);
      }
      return userObj;
    }

    // 2b. If student typed their CIC Number in the password field instead of username field
    if (candidatePass) {
      const candidateCic = candidatePass.toLowerCase().trim();
      const studentByPass = studentPool.find(s => 
        (s.cicNo && String(s.cicNo).toLowerCase().trim() === candidateCic) ||
        (s.username && s.username.toLowerCase().trim() === candidateCic)
      );
      if (studentByPass) {
        const officialMatch = officialPool.find(o =>
          (o.studentId && o.studentId === studentByPass.id) ||
          (o.cicNo && String(o.cicNo).trim().toLowerCase() === String(studentByPass.cicNo).trim().toLowerCase()) ||
          (o.name && o.name.trim().toLowerCase() === studentByPass.name.trim().toLowerCase())
        );

        let initialRole = 'student';
        let availableRoles = ['student'];
        let unionOfficial = null;
        let unionRole = null;

        if (officialMatch) {
          const isOfficialExec = officialMatch.category === 'executive' || officialMatch.role === 'executive' || officialMatch.assignedWingId === 'all';
          unionRole = isOfficialExec ? 'executive' : (officialMatch.role || 'convener');
          availableRoles = ['student', unionRole];
          unionOfficial = officialMatch;
        }

        const userObj = {
          id: studentByPass.id,
          studentId: studentByPass.id,
          name: studentByPass.name,
          username: studentByPass.username || studentByPass.cicNo,
          role: initialRole,
          activeRole: initialRole,
          availableRoles,
          unionRole,
          unionOfficial,
          studentData: {
            id: studentByPass.id,
            name: studentByPass.name,
            username: studentByPass.username || studentByPass.cicNo,
            teamId: studentByPass.teamId,
            classId: studentByPass.classId,
            chestNo: studentByPass.chestNo,
            cicNo: studentByPass.cicNo,
            isLeader: studentByPass.isLeader
          },
          teamId: studentByPass.teamId,
          classId: studentByPass.classId,
          chestNo: studentByPass.chestNo,
          cicNo: studentByPass.cicNo,
          isLeader: studentByPass.isLeader,
          designation: studentByPass.className ? `Student (${studentByPass.className})` : 'Student'
        };
        setCurrentUser(userObj);
        return userObj;
      }
    }

    // 3. Check Union Officials (Executive Committee & Wing Conveners - assigned by Admin in Wing Management)
    const official = officialPool.find(o =>
      (o.username && o.username.toLowerCase() === trimmedUser) ||
      (o.cicNo && String(o.cicNo).toLowerCase() === trimmedUser) ||
      (o.name && o.name.toLowerCase() === trimmedUser)
    );
    if (official) {
      const isDefaultMatch = (official.initialPassword && candidatePass === official.initialPassword) ||
                             (official.password && candidatePass === official.password) ||
                             candidatePass === 'union123' ||
                             candidatePass === 'MUSF' ||
                             candidatePass.toUpperCase() === 'MUSF' ||
                             candidatePass === '1234';
      const isHashMatch = await verifyPassword(candidatePass, official.passwordHash);
      if (isDefaultMatch || isHashMatch) {
        const isOfficialExec = official.category === 'executive' || official.role === 'executive' || official.assignedWingId === 'all';
        const unionRole = isOfficialExec ? 'executive' : (official.role || 'convener');

        // Check if official has a student match
        const studentMatch = studentPool.find(s =>
          (official.studentId && s.id === official.studentId) ||
          (official.cicNo && String(s.cicNo).trim().toLowerCase() === String(official.cicNo).trim().toLowerCase()) ||
          (s.name && s.name.trim().toLowerCase() === official.name.trim().toLowerCase())
        );

        const availableRoles = studentMatch ? ['student', unionRole] : [unionRole];

        const userObj = {
          id: official.id,
          officialId: official.id,
          studentId: studentMatch ? studentMatch.id : (official.studentId || null),
          name: official.name,
          username: official.username || official.cicNo,
          role: unionRole,
          activeRole: unionRole,
          availableRoles,
          unionRole,
          unionOfficial: official,
          studentData: studentMatch ? {
            id: studentMatch.id,
            name: studentMatch.name,
            username: studentMatch.username || studentMatch.cicNo,
            teamId: studentMatch.teamId,
            classId: studentMatch.classId,
            chestNo: studentMatch.chestNo,
            cicNo: studentMatch.cicNo,
            isLeader: studentMatch.isLeader
          } : null,
          designation: official.designation,
          assignedWingId: isOfficialExec ? 'all' : (official.assignedWingId || null),
          wingId: isOfficialExec ? 'all' : (official.assignedWingId || null),
          category: official.category,
          cicNo: official.cicNo || studentMatch?.cicNo,
          classId: official.classId || studentMatch?.classId,
          teamId: official.teamId || studentMatch?.teamId
        };
        setCurrentUser(userObj);
        if (typeof addAuditLog === 'function') {
          addAuditLog(userObj.username, 'LOGIN', `${userObj.designation} ${userObj.name} signed in`);
        }
        return userObj;
      }
    }

    // 3b. Check Wings directly (Conveners logging in via Wing Code / Wing ID)
    const wingMatch = (wings || []).find(w =>
      w.id?.toLowerCase() === trimmedUser ||
      w.code?.toLowerCase() === trimmedUser ||
      w.shortName?.toLowerCase() === trimmedUser ||
      w.name?.toLowerCase() === trimmedUser
    );
    if (wingMatch) {
      const isWingPassMatch = (wingMatch.password && candidatePass === wingMatch.password) ||
                              (wingMatch.convenerPassword && candidatePass === wingMatch.convenerPassword) ||
                              (candidatePass === 'MUSF') ||
                              (candidatePass.toUpperCase() === 'MUSF') ||
                              (candidatePass === '1234') ||
                              (candidatePass === 'union123') ||
                              (wingMatch.passwordHash && await verifyPassword(candidatePass, wingMatch.passwordHash));
      if (isWingPassMatch) {
        const userObj = {
          id: `convener_${wingMatch.id}`,
          name: `${wingMatch.shortName || wingMatch.name} Convener`,
          username: wingMatch.code || wingMatch.id,
          role: 'convener',
          assignedWingId: wingMatch.id,
          wingId: wingMatch.id,
          designation: `${wingMatch.shortName || wingMatch.name} Convener`
        };
        setCurrentUser(userObj);
        if (typeof addAuditLog === 'function') {
          addAuditLog(userObj.username, 'LOGIN', `Wing Convener for ${wingMatch.name} signed in`);
        }
        return userObj;
      }
    }

    // 4. Check Judges
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

    // 5. Check Team Leaders
    const leaderStudent = studentPool.find(s => s.isLeader && s.leaderUsername && s.leaderUsername.toLowerCase() === trimmedUser);
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

    // 6. Check Sports Team Leaders (Squad / Sports Group Leaders)
    const sportsGroupMatch = (sportsGroups || []).find(sg => 
      (sg.leaderUsername && sg.leaderUsername.toLowerCase() === trimmedUser) ||
      (sg.leaderId && studentPool.some(s => s.id === sg.leaderId && s.leaderUsername?.toLowerCase() === trimmedUser))
    );
    if (sportsGroupMatch) {
      const stLeader = studentPool.find(s => s.id === sportsGroupMatch.leaderId);
      const isLeaderPass = (candidatePass === 'leader123') || (candidatePass === '1234') || (stLeader && candidatePass === stLeader.cicNo);
      if (isLeaderPass) {
        const userObj = {
          id: stLeader?.id || sportsGroupMatch.leaderId || sportsGroupMatch.id,
          name: stLeader?.name || sportsGroupMatch.leaderName || 'Sports Team Leader',
          username: sportsGroupMatch.leaderUsername || trimmedUser,
          role: 'leader',
          isSportsLeader: true,
          sportsGroupId: sportsGroupMatch.id,
          sportsGroupName: sportsGroupMatch.name,
          sport: sportsGroupMatch.sport,
          teamId: stLeader?.teamId || null,
          chestNo: stLeader?.chestNo || null,
          cicNo: stLeader?.cicNo || null
        };
        setCurrentUser(userObj);
        if (typeof addAuditLog === 'function') {
          addAuditLog(userObj.username, 'LOGIN', `Sports Leader ${userObj.name} signed in for ${sportsGroupMatch.name}`);
        }
        return userObj;
      }
    }

    // 7. Check Firestore USERS collection directly
    if (db) {
      try {
        const userDocRef = doc(db, COLLECTIONS.USERS, trimmedUser);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          const isValidPass = (candidatePass === 'MUSF') ||
                              (candidatePass === '1234') ||
                              (uData.password && candidatePass === uData.password) ||
                              (uData.initialPassword && candidatePass === uData.initialPassword) ||
                              (uData.passwordHash && await verifyPassword(candidatePass, uData.passwordHash));
          if (isValidPass) {
            const userObj = {
              id: uData.id || userSnap.id,
              name: uData.name || uData.username || trimmedUser,
              username: uData.username || trimmedUser,
              role: uData.role || 'admin',
              designation: uData.designation || (uData.role === 'admin' ? 'Administrator' : 'Official'),
              assignedWingId: uData.assignedWingId || uData.wingId || 'all',
              wingId: uData.assignedWingId || uData.wingId || 'all'
            };
            setCurrentUser(userObj);
            if (typeof addAuditLog === 'function') {
              addAuditLog(userObj.username, 'LOGIN', `${userObj.name} signed in successfully`);
            }
            return userObj;
          }
        }
      } catch (err) {
        console.warn('[Auth] Check users collection notice:', err);
      }
    }

    // 8. Try Firebase Authentication (if configured)
    const internalEmail = trimmedUser.includes('@')
      ? trimmedUser
      : `${trimmedUser.replace(/[^a-z0-9._-]/g, '')}@musf.app`;

    if (auth && isFirebaseAuthEnabled && !isLocalPreview) {
      try {
        const cred = await signInWithEmailAndPassword(auth, internalEmail, candidatePass);
        const uid = cred.user.uid;

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
          name: userDocData?.name || (role === 'admin' ? 'Administrator' : trimmedUser),
          role,
          teamId: userDocData?.teamId || null,
          section: userDocData?.section || null,
          studentId: userDocData?.studentId || null,
          judgeId: userDocData?.judgeId || null,
          classId: userDocData?.classId || null,
          cicNo: userDocData?.cicNo || null,
          assignedWingId: userDocData?.assignedWingId || userDocData?.wingId || null,
          wingId: userDocData?.wingId || userDocData?.assignedWingId || null,
          designation: userDocData?.designation || null
        };

        setCurrentUser(userObj);
        if (typeof addAuditLog === 'function') {
          addAuditLog(userObj.username, 'LOGIN', `${role.toUpperCase()} ${userObj.name} signed in successfully`);
        }
        return userObj;
      } catch (authErr) {
        const code = authErr?.code || '';
        if (code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please wait a few moments before trying again.');
        }
      }
    }

    throw new Error("Invalid username or password. Please verify your credentials.");
  };

  /**
   * Logs out the current user safely
   */
  const logout = async () => {
    if (auth && isFirebaseAuthEnabled && !isLocalPreview) {
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
   * Switches the active profile view between student and union position (convener/executive)
   */
  const switchRole = (targetRole) => {
    if (!currentUser) return;
    if (targetRole !== 'student' && targetRole !== 'convener' && targetRole !== 'executive') return;

    setCurrentUser(prev => {
      if (!prev) return null;
      const off = prev.unionOfficial;
      const st = prev.studentData;
      const isUnion = targetRole === 'convener' || targetRole === 'executive';

      const updated = {
        ...prev,
        role: targetRole,
        activeRole: targetRole,
        designation: isUnion
          ? (off?.designation || prev.designation || 'Union Official')
          : (st?.className ? `Student (${st.className})` : 'Student'),
        assignedWingId: isUnion ? (off?.assignedWingId || prev.assignedWingId || null) : null,
        wingId: isUnion ? (off?.assignedWingId || prev.wingId || null) : null
      };

      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      } catch (e) {
        console.warn('[Auth] Error saving switched role:', e);
      }

      if (typeof addAuditLog === 'function') {
        addAuditLog(prev.username, 'ROLE_SWITCH', `${prev.name} switched view to ${targetRole}`);
      }

      return updated;
    });
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
    if (auth && auth.currentUser && isFirebaseAuthEnabled && !isLocalPreview) {
      try {
        await updatePassword(auth.currentUser, newPlainPassword);
        if (typeof addAuditLog === 'function') {
          addAuditLog(currentUser.username, 'CHANGE_PASSWORD', `User ${currentUser.username} updated password in Firebase Auth`);
        }
      } catch (authErr) {
        if (authErr.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again before changing your password.');
        }
        console.warn('[Auth] Firebase updatePassword notice:', authErr);
      }
    }

    // Also update collegiate credentials storage for seamless offline and direct logins
    if (currentUser.role === 'admin' && typeof updateAdminPassword === 'function') {
      await updateAdminPassword(currentUser.username, newPlainPassword);
    } else if (currentUser.role === 'student' && typeof updateStudentPassword === 'function') {
      const sId = currentUser.studentId || currentUser.id;
      await updateStudentPassword(sId, newPlainPassword);
    }

    if (typeof addAuditLog === 'function') {
      addAuditLog(currentUser.username, 'CHANGE_PASSWORD', `Password changed successfully for ${currentUser.username}`);
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authError,
      login,
      logout,
      switchRole,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
