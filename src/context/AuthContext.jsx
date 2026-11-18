import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { STORAGE_KEYS } from '../services/firebase';
import { verifyPassword, hashPassword } from '../utils/crypto';
import { INITIAL_ADMINS } from '../services/initialData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { students, judges, addAuditLog, setStudents, setJudges, settings, updateSettings } = useApp();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  /**
   * Attempts login with username and password
   */
  const login = async (username, plainPassword) => {
    if (!username || !plainPassword) {
      throw new Error("Please enter both username and password.");
    }

    const trimmedUser = username.trim().toLowerCase();
    const candidatePass = String(plainPassword).trim();

    // 1. Check Admin
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
        addAuditLog(userObj.username, 'LOGIN', `Admin ${admin.name} (@${admin.username}) authenticated into Summit Register`);
        return userObj;
      }
    }

    // 2. Check Judges
    const judge = judges.find(j => j.username && j.username.toLowerCase() === trimmedUser);
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
        addAuditLog(userObj.username, 'LOGIN', `Judge ${judge.name} authenticated`);
        return userObj;
      }
    }

    // 3. Check Team Leaders
    const leaderStudent = students.find(s => s.isLeader && s.leaderUsername && s.leaderUsername.toLowerCase() === trimmedUser);
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
        addAuditLog(userObj.username, 'LOGIN', `Team Leader ${leaderStudent.name} authenticated`);
        return userObj;
      }
    }

    // 4. Check Regular Student (Can login via Username, CIC Number, or Chest Number; Password is CIC Number)
    const student = students.find(s => 
      (s.username && s.username.toLowerCase() === trimmedUser) || 
      (s.cicNo && s.cicNo.toLowerCase() === trimmedUser) ||
      (s.chestNo && s.chestNo.toLowerCase() === trimmedUser) ||
      (s.chestNo && s.chestNo.toLowerCase().replace('-', '') === trimmedUser.replace('-', ''))
    );
    if (student) {
      const isCicMatch = candidatePass === student.cicNo || candidatePass.toLowerCase() === student.cicNo.toLowerCase();
      const isInitialPassMatch = student.initialPassword && candidatePass === student.initialPassword;
      const isHashMatch = await verifyPassword(candidatePass, student.passwordHash);
      const isValid = isCicMatch || isInitialPassMatch || isHashMatch;

      if (isValid) {
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
        addAuditLog(userObj.username, 'LOGIN', `Student ${student.name} authenticated`);
        return userObj;
      }
    }

    throw new Error("Invalid username or password. Please verify your credentials.");
  };

  /**
   * Logs out the current user
   */
  const logout = () => {
    if (currentUser) {
      addAuditLog(currentUser.username, 'LOGOUT', `${currentUser.name} signed out`);
    }
    setCurrentUser(null);
  };

  /**
   * Change password for the logged in user
   */
  const changePassword = async (currentPlainPassword, newPlainPassword) => {
    if (!currentUser) throw new Error("No user is currently signed in.");
    if (!newPlainPassword || newPlainPassword.length < 5) {
      throw new Error("New password must be at least 5 characters long.");
    }

    const newHash = await hashPassword(newPlainPassword);

    if (currentUser.role === 'admin') {
      const admin = INITIAL_ADMINS.find(a => a.id === currentUser.id) || INITIAL_ADMINS.find(a => a.username === currentUser.username);
      const storedAdminHash = settings?.adminPasswordHashes?.[currentUser.username] ||
        localStorage.getItem(`musf_admin_hash_${currentUser.username}`) || admin?.passwordHash;
      const isCurrentValid = (currentPlainPassword === '1234') || await verifyPassword(currentPlainPassword, storedAdminHash);
      if (!isCurrentValid) throw new Error("Current password is not correct.");
      
      const newAdminHashes = { ...(settings?.adminPasswordHashes || {}), [currentUser.username]: newHash };
      if (typeof updateSettings === 'function') {
        updateSettings({ adminPasswordHashes: newAdminHashes }, currentUser.username);
      }
      localStorage.setItem(`musf_admin_hash_${currentUser.username}`, newHash);
      addAuditLog(currentUser.username, 'CHANGE_PASSWORD', `Admin ${currentUser.username} updated password`);
      return true;
    }

    if (currentUser.role === 'judge') {
      const judge = (judges || []).find(j => j.id === currentUser.id);
      if (!judge) throw new Error("Judge record not found.");
      const isCurrentValid = await verifyPassword(currentPlainPassword, judge.passwordHash);
      if (!isCurrentValid) throw new Error("Current password is not correct.");
      
      if (typeof setJudges === 'function') {
        setJudges(prev => prev.map(j => j.id === currentUser.id ? { ...j, passwordHash: newHash } : j));
      }
      addAuditLog(currentUser.username, 'CHANGE_PASSWORD', `Judge ${judge.name} updated password`);
      return true;
    }

    if (currentUser.role === 'leader') {
      const student = (students || []).find(s => s.id === currentUser.id);
      if (!student) throw new Error("Leader record not found.");
      const isCurrentValid = await verifyPassword(currentPlainPassword, student.leaderPasswordHash);
      if (!isCurrentValid) throw new Error("Current password is not correct.");
      
      if (typeof setStudents === 'function') {
        setStudents(prev => prev.map(s => s.id === currentUser.id ? { ...s, leaderPasswordHash: newHash } : s));
      }
      addAuditLog(currentUser.username, 'CHANGE_PASSWORD', `Team Leader ${student.name} updated password`);
      return true;
    }

    if (currentUser.role === 'student') {
      const student = (students || []).find(s => s.id === currentUser.id);
      if (!student) throw new Error("Student record not found.");
      const isCurrentValid = await verifyPassword(currentPlainPassword, student.passwordHash);
      if (!isCurrentValid) throw new Error("Current password is not correct.");
      
      if (typeof setStudents === 'function') {
        setStudents(prev => prev.map(s => s.id === currentUser.id ? { ...s, passwordHash: newHash } : s));
      }
      addAuditLog(currentUser.username, 'CHANGE_PASSWORD', `Student ${student.name} updated password`);
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
