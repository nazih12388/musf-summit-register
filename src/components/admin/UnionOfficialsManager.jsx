import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  Plus,
  Key,
  Edit2,
  Trash2,
  Printer,
  Copy,
  Check,
  Search,
  ExternalLink,
  Crown,
  Award,
  Sparkles,
  Phone,
  MessageCircle,
  Building,
  UserCheck,
  UserPlus,
  Layers,
  ChevronRight,
  Camera,
  Upload,
  User
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { printHtmlDocument } from '../../utils/printHelper';

// Central Executive Council Roles
const CENTRAL_EXECUTIVE_ROLES = [
  { title: 'Chairman', role: 'executive', category: 'executive', username: 'chairman' },
  { title: 'Vice Chairman', role: 'executive', category: 'executive', username: 'vice_chairman' },
  { title: 'General Secretary', role: 'executive', category: 'executive', username: 'gensec' },
  { title: 'Joint Secretary', role: 'executive', category: 'executive', username: 'joint_sec' },
  { title: 'Treasurer', role: 'executive', category: 'executive', username: 'treasurer' },
  { title: 'Executive Member', role: 'executive', category: 'executive', username: 'exec_member' },
  { title: 'General Convener', role: 'executive', category: 'executive', username: 'gen_convener' },
  { title: 'Custom Designation...', role: 'executive', category: 'executive', username: 'official_custom' }
];

export const UnionOfficialsManager = () => {
  const { currentUser } = useAuth();
  const {
    unionOfficials = [],
    appointUnionOfficial,
    updateUnionOfficial,
    removeUnionOfficial,
    students = [],
    wings = []
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [manualName, setManualName] = useState('');
  const [customDesignation, setCustomDesignation] = useState('');
  const [toastFeedback, setToastFeedback] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Quick Password Reset Modal
  const [passwordModalOfficial, setPasswordModalOfficial] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const openPasswordModal = (off) => {
    setPasswordModalOfficial(off);
    setNewPasswordInput(off.initialPassword || '');
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordModalOfficial) return;
    if (!newPasswordInput.trim()) {
      alert('Please enter a valid password.');
      return;
    }
    await updateUnionOfficial(passwordModalOfficial.id, {
      password: newPasswordInput.trim()
    }, currentUser?.username || 'admin');
    setToastFeedback(`Password updated successfully for ${passwordModalOfficial.name}!`);
    setTimeout(() => setToastFeedback(''), 4000);
    setPasswordModalOfficial(null);
  };

  // Modal appointment scope: 'executive' (Central Council) or 'wing' (2 members per wing)
  const [scopeType, setScopeType] = useState('wing'); // 'executive' | 'wing'
  const [selectedWingId, setSelectedWingId] = useState(wings[0]?.id || 'fine_arts');
  const [selectedSlot, setSelectedSlot] = useState(1); // 1 = Convener, 2 = Joint Convener

  const [formData, setFormData] = useState({
    designation: '',
    assignedWingId: 'all',
    wingSlot: 1,
    username: '',
    password: '',
    phone: '',
    photoUrl: ''
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size should be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const [filterCategory, setFilterCategory] = useState('all');

  const filteredStudents = useMemo(() => {
    const q = (searchStudent || '').trim().toLowerCase();
    if (!q) return (students || []).slice(0, 50);
    return (students || []).filter(s => {
      if (!s) return false;
      const name = String(s.name || '').toLowerCase();
      const cic = String(s.cicNo || '').toLowerCase();
      const cls = String(s.className || '').toLowerCase();
      const ph = String(s.phone || '').toLowerCase();
      return name.includes(q) || cic.includes(q) || cls.includes(q) || ph.includes(q);
    });
  }, [students, searchStudent]);

  // Quick helper to generate designation & username for a wing slot
  const getWingSlotDefaults = (wingId, slot) => {
    const wing = wings.find(w => w.id === wingId) || wings[0];
    const baseName = wing ? (wing.shortName || wing.name) : 'Wing';
    const slug = (wing?.code || wing?.id || 'wing').toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (slot === 2) {
      return {
        designation: `${baseName} Joint Convener`,
        username: `convener_${slug}_2`
      };
    }
    return {
      designation: `${baseName} Convener`,
      username: `convener_${slug}_1`
    };
  };

  // Open Appoint Modal (General)
  const openAppointModal = () => {
    setEditingOfficial(null);
    setSelectedStudentId('');
    setSearchStudent('');
    setManualName('');
    setCustomDesignation('');
    setScopeType('wing');
    const defaultWingId = wings[0]?.id || 'fine_arts';
    setSelectedWingId(defaultWingId);
    setSelectedSlot(1);

    const defaults = getWingSlotDefaults(defaultWingId, 1);
    setFormData({
      designation: defaults.designation,
      assignedWingId: defaultWingId,
      wingSlot: 1,
      username: defaults.username,
      password: 'union123',
      phone: '',
      photoUrl: ''
    });
    setIsModalOpen(true);
  };

  // Open Appoint Modal for a Specific Wing and Member Slot
  const openAppointForWingSlot = (wingId, slot) => {
    setEditingOfficial(null);
    setSelectedStudentId('');
    setSearchStudent('');
    setManualName('');
    setCustomDesignation('');
    setScopeType('wing');
    setSelectedWingId(wingId);
    setSelectedSlot(slot);

    const defaults = getWingSlotDefaults(wingId, slot);
    setFormData({
      designation: defaults.designation,
      assignedWingId: wingId,
      wingSlot: slot,
      username: defaults.username,
      password: 'union123',
      phone: '',
      photoUrl: ''
    });
    setIsModalOpen(true);
  };

  // Open Appoint Modal for Central Executive
  const openAppointCentralExecutive = () => {
    setEditingOfficial(null);
    setSelectedStudentId('');
    setSearchStudent('');
    setManualName('');
    setCustomDesignation('');
    setScopeType('executive');
    const defaultRole = CENTRAL_EXECUTIVE_ROLES[0];
    setFormData({
      designation: defaultRole.title,
      assignedWingId: 'all',
      wingSlot: null,
      username: defaultRole.username,
      password: 'union123',
      phone: '',
      photoUrl: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (off) => {
    setEditingOfficial(off);
    setSelectedStudentId(off.studentId || '');
    setManualName(off.name || '');
    setSearchStudent(off.name ? `${off.name}${off.cicNo ? ` (${off.cicNo})` : ''}` : '');
    const isExec = off.category === 'executive' || off.role === 'executive' || off.assignedWingId === 'all';
    setScopeType(isExec ? 'executive' : 'wing');

    const isCustomRole = isExec && !CENTRAL_EXECUTIVE_ROLES.some(r => r.title === off.designation && r.title !== 'Custom Designation...');
    if (isCustomRole) {
      setCustomDesignation(off.designation || '');
    } else {
      setCustomDesignation('');
    }

    if (!isExec && off.assignedWingId) {
      setSelectedWingId(off.assignedWingId);
      const slot = off.wingSlot ? Number(off.wingSlot) : (off.designation?.toLowerCase().includes('joint') ? 2 : 1);
      setSelectedSlot(slot);
    }

    setFormData({
      designation: isCustomRole ? 'Custom Designation...' : (off.designation || 'Executive Member'),
      assignedWingId: off.assignedWingId || 'all',
      wingSlot: off.wingSlot || (off.designation?.toLowerCase().includes('joint') ? 2 : 1),
      username: off.username,
      password: off.initialPassword || '',
      phone: off.phone || '',
      photoUrl: off.photoUrl || ''
    });
    setIsModalOpen(true);
  };

  // Handle switching scope type (Executive vs Wing)
  const handleScopeChange = (newScope) => {
    setScopeType(newScope);
    if (newScope === 'executive') {
      const defaultRole = CENTRAL_EXECUTIVE_ROLES[0];
      setFormData(prev => ({
        ...prev,
        designation: defaultRole.title,
        assignedWingId: 'all',
        wingSlot: null,
        username: prev.username || defaultRole.username
      }));
    } else {
      const targetWingId = selectedWingId || wings[0]?.id || 'fine_arts';
      const defaults = getWingSlotDefaults(targetWingId, selectedSlot);
      setFormData(prev => ({
        ...prev,
        designation: defaults.designation,
        assignedWingId: targetWingId,
        wingSlot: selectedSlot,
        username: defaults.username
      }));
    }
  };

  // Handle Wing Change inside Wing Scope
  const handleWingChange = (wingId) => {
    setSelectedWingId(wingId);
    const defaults = getWingSlotDefaults(wingId, selectedSlot);
    setFormData(prev => ({
      ...prev,
      assignedWingId: wingId,
      designation: defaults.designation,
      username: defaults.username
    }));
  };

  // Handle Member Slot Change (Member 1 vs Member 2)
  const handleSlotChange = (slot) => {
    setSelectedSlot(slot);
    const defaults = getWingSlotDefaults(selectedWingId, slot);
    setFormData(prev => ({
      ...prev,
      wingSlot: slot,
      designation: defaults.designation,
      username: defaults.username
    }));
  };

  // Handle Selecting a Student
  const handleSelectStudent = (st) => {
    setSelectedStudentId(st.id);
    setManualName(st.name);
    setSearchStudent(`${st.name}${st.cicNo ? ` (${st.cicNo})` : ''}`);
    const cleanName = st.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12);
    setFormData(prev => ({
      ...prev,
      phone: st.phone || prev.phone,
      photoUrl: st.photoUrl || prev.photoUrl || '',
      username: prev.username && !prev.username.includes('convener_') && !prev.username.includes('official_')
        ? prev.username
        : `${cleanName}_${scopeType === 'executive' ? 'exec' : 'lead'}`
    }));
  };

  // Handle setting a custom / non-enrolled person name directly
  const handleSetCustomName = (name) => {
    setSelectedStudentId('');
    setManualName(name);
    setSearchStudent(name);
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12);
    setFormData(prev => ({
      ...prev,
      username: prev.username && !prev.username.includes('convener_') && !prev.username.includes('official_')
        ? prev.username
        : `${cleanName}_${scopeType === 'executive' ? 'exec' : 'lead'}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    const finalName = st ? st.name : (manualName?.trim() || searchStudent?.replace(/\s*\(.*\)$/, '').trim() || editingOfficial?.name);

    if (!finalName) {
      alert('Please select a student from the list or type an official name.');
      return;
    }

    const isExec = scopeType === 'executive';
    const finalDesignation = (formData.designation === 'Custom Designation...' ? customDesignation.trim() : formData.designation) || (isExec ? 'Executive Member' : 'Wing Convener');

    let finalUsername = (formData.username || '').trim().toLowerCase();
    if (!finalUsername) {
      const cleanName = finalName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12);
      finalUsername = `${cleanName}_${isExec ? 'exec' : 'lead'}`;
    }

    const payload = {
      ...formData,
      photoUrl: (formData.photoUrl || '').trim(),
      photo: (formData.photoUrl || '').trim(),
      name: finalName,
      designation: finalDesignation,
      username: finalUsername,
      studentId: st ? st.id : (editingOfficial?.studentId || null),
      cicNo: st ? st.cicNo : (editingOfficial?.cicNo || ''),
      classId: st ? st.classId : (editingOfficial?.classId || ''),
      className: st ? st.className : (editingOfficial?.className || ''),
      teamId: st ? st.teamId : (editingOfficial?.teamId || ''),
      category: isExec ? 'executive' : 'convener',
      role: isExec ? 'executive' : 'convener',
      assignedWingId: isExec ? 'all' : selectedWingId,
      wingSlot: isExec ? null : selectedSlot
    };

    if (editingOfficial) {
      await updateUnionOfficial(editingOfficial.id, payload, currentUser?.username || 'admin');
      setToastFeedback(`Updated official: ${finalName} (${finalDesignation})`);
    } else {
      await appointUnionOfficial(payload, currentUser?.username || 'admin');
      setToastFeedback(`Appointed official: ${finalName} as ${finalDesignation}!`);
    }
    setTimeout(() => setToastFeedback(''), 4000);
    setIsModalOpen(false);
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this union official?')) {
      removeUnionOfficial(id, currentUser?.username || 'admin');
      setToastFeedback('Removed official record successfully.');
      setTimeout(() => setToastFeedback(''), 3000);
    }
  };

  const handleCopyCredentials = (off) => {
    const text = `MUSF Students' Union Login Credentials:
Name: ${off.name} (${off.designation})
Username: ${off.username}
Password: ${off.initialPassword || 'union123'}
Portal: https://musf-union-app.web.app`;
    navigator.clipboard.writeText(text);
    setCopiedId(off.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrintSheet = () => {
    const contentHtml = `
      <div style="padding: 10px;">
        <div style="text-align: center; border-bottom: 2px solid #0f2a4a; padding-bottom: 12px; margin-bottom: 16px;">
          <h1 style="font-size: 20px; font-weight: 900; margin: 0 0 4px 0; color: #0f2a4a; text-transform: uppercase;">MAJLIS UMARIYYA WAFY COLLEGE</h1>
          <h2 style="font-size: 15px; font-weight: 800; margin: 0; color: #0e7c86; text-transform: uppercase;">Majlis Umariyya Students' Federation (MUSF)</h2>
          <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Official Union Officials &amp; Conveners Credentials Roster</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">#</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Official Name</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Designation / Wing</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">CIC No</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Username</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Password</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Phone</th>
            </tr>
          </thead>
          <tbody>
            ${unionOfficials.map((o, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="border: 1px solid #cbd5e1; padding: 7px 8px;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 8px;"><strong>${o.name}</strong></td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 8px;">${o.designation}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 8px; font-family: monospace;">${o.cicNo || 'N/A'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 8px; font-family: monospace; font-weight: bold; color: #0f2a4a;">${o.username}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 8px; font-family: monospace; font-weight: bold; color: #16a34a;">${o.initialPassword || 'union123'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 8px;">${o.phone || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-family: monospace;">
          <span>MUSF Central Directorate Administration</span>
          <span>Date Generated: ${new Date().toLocaleDateString('en-GB')}</span>
        </div>
      </div>
    `;

    printHtmlDocument({
      title: 'MUSF Union Officials Credentials',
      contentHtml
    });
  };

  const displayedOfficials = filterCategory === 'all'
    ? unionOfficials
    : filterCategory === 'executive'
    ? unionOfficials.filter(o => o.category === 'executive' || o.role === 'executive' || o.assignedWingId === 'all')
    : unionOfficials.filter(o => o.category === 'convener' || (o.assignedWingId && o.assignedWingId !== 'all'));

  // Pre-calculate appointed members per wing
  const wingRepresentation = useMemo(() => {
    return wings.map(w => {
      const assigned = unionOfficials.filter(o => o.assignedWingId === w.id);
      const member1 = assigned.find(o => o.wingSlot === 1 || !o.designation?.toLowerCase().includes('joint')) || assigned[0];
      const member2 = assigned.find(o => (o.wingSlot === 2 || o.designation?.toLowerCase().includes('joint')) && o.id !== member1?.id) || (assigned.length > 1 ? assigned.find(o => o.id !== member1?.id) : null);
      return {
        wing: w,
        member1,
        member2
      };
    });
  }, [wings, unionOfficials]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <span>Union Office Bearers &amp; Conveners</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] dark:bg-[#0E7C86]/20 dark:text-teal-300 font-bold">
              {unionOfficials.length} Appointed
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Appoint Central Executive Council members and <strong>2 Conveners per Wing</strong> (Convener &amp; Joint Convener) for every union wing you create.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrintSheet}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
            title="Print Credentials Sheet"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print Credentials</span>
          </button>

          <button
            type="button"
            onClick={openAppointCentralExecutive}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>+ Central Executive</span>
          </button>

          <button
            type="button"
            onClick={openAppointModal}
            className="px-4 py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Appoint Wing Member</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-2 animate-slide-up shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastFeedback}</span>
        </div>
      )}

      {/* 2 Members Per Wing: Representation Overview */}
      <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0E7C86]" />
              <span>Wing Representation (2 Members per Wing)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Each wing appointed by the admin holds 2 leadership slots: Member 1 (Convener) &amp; Member 2 (Joint Convener).
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#0E7C86] bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-900 self-start sm:self-auto">
            {wings.length} Total Wings ({wings.length * 2} Member Capacity)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {wingRepresentation.map(({ wing, member1, member2 }) => (
            <div
              key={wing.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold"
                    style={{ backgroundColor: wing.color || '#0E7C86' }}
                  >
                    {wing.name.charAt(0)}
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2A4A] dark:text-white truncate">
                    {wing.name}
                  </h4>
                </div>
                {wing.code && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-500 font-mono font-semibold shrink-0">
                    {wing.code}
                  </span>
                )}
              </div>

              {/* Slots 1 and 2 */}
              <div className="space-y-2 text-xs">
                {/* Member 1: Convener */}
                <div className="p-2 rounded-lg bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                      Member 1: Convener
                    </span>
                    {member1 ? (
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-[11px]">
                        {member1.name} <span className="text-slate-400 font-normal">({member1.cicNo || 'No CIC'})</span>
                      </p>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400 text-[11px] italic">Vacant</p>
                    )}
                  </div>

                  {member1 ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openPasswordModal(member1)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition"
                        title="Assign / Reset Password"
                      >
                        <Key className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(member1)}
                        className="p-1 text-slate-400 hover:text-[#0E7C86] hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                        title="Edit Member 1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAppointForWingSlot(wing.id, 1)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0E7C86] hover:bg-[#14919D] text-white shrink-0 transition"
                    >
                      + Appoint
                    </button>
                  )}
                </div>

                {/* Member 2: Joint Convener */}
                <div className="p-2 rounded-lg bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Member 2: Joint Convener
                    </span>
                    {member2 ? (
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-[11px]">
                        {member2.name} <span className="text-slate-400 font-normal">({member2.cicNo || 'No CIC'})</span>
                      </p>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400 text-[11px] italic">Vacant</p>
                    )}
                  </div>

                  {member2 ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openPasswordModal(member2)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition"
                        title="Assign / Reset Password"
                      >
                        <Key className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(member2)}
                        className="p-1 text-slate-400 hover:text-[#0E7C86] hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                        title="Edit Member 2"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAppointForWingSlot(wing.id, 2)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0E7C86] hover:bg-[#14919D] text-white shrink-0 transition"
                    >
                      + Appoint
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterCategory === 'all'
              ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          All Officials ({unionOfficials.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory('executive')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterCategory === 'executive'
              ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Executive Committee ({unionOfficials.filter(o => o.category === 'executive' || o.role === 'executive' || o.assignedWingId === 'all').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory('convener')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterCategory === 'convener'
              ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Wing Members ({unionOfficials.filter(o => o.category === 'convener' || (o.assignedWingId && o.assignedWingId !== 'all')).length})
        </button>
      </div>

      {/* Officials Grid with Bottom-Up Entrance Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedOfficials.map((off, idx) => {
          const isExec = off.category === 'executive' || off.role === 'executive' || off.assignedWingId === 'all';
          const assignedWing = wings.find(w => w.id === off.assignedWingId);
          const slot = off.wingSlot ? Number(off.wingSlot) : (off.designation?.toLowerCase().includes('joint') ? 2 : 1);

          return (
            <div
              key={off.id}
              style={{ animationDelay: `${Math.min(idx * 65, 520)}ms` }}
              className="animate-bottom-up bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isExec
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                          : 'bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-200 border border-teal-300 dark:border-teal-700'
                      }`}
                    >
                      {off.designation}
                    </span>
                    {!isExec && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {slot === 2 ? 'Member 2 (Joint)' : 'Member 1 (Lead)'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openPasswordModal(off)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                      title="Assign / Reset Password"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(off)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0E7C86] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Official"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(off.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Remove Official"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {off.photoUrl ? (
                    <img
                      src={off.photoUrl}
                      alt={off.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0E7C86] dark:ring-teal-400 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0E7C86] dark:text-teal-400 font-bold text-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      {off.name?.slice(0, 2).toUpperCase() || 'UO'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-[#0F2A4A] dark:text-white truncate">
                      {off.name}
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                  <p>CIC Number: <strong className="text-slate-700 dark:text-slate-300">{off.cicNo || 'N/A'}</strong></p>
                  <p>Class: <span className="font-semibold">{off.className || 'Senior Degree'}</span></p>
                  {off.assignedWingId && off.assignedWingId !== 'all' && (
                    <p className="text-[#0E7C86] dark:text-teal-400 font-semibold flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span>Governing Wing: {assignedWing?.name || off.assignedWingId}</span>
                    </p>
                  )}
                </div>

                {/* Credentials Preview Pill */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Username:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{off.username}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Password:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{off.initialPassword || '••••••••'}</strong>
                  </div>
                </div>

                {/* Contact Bar: Phone, Direct Call & WhatsApp Buttons */}
                {(() => {
                  const phone = off.phone || '+91 98765 43210';
                  const cleanPhone = phone.replace(/[^0-9+]/g, '');
                  const waNumber = cleanPhone.replace(/^\+/, '');
                  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Assalamu Alaikum ${off.name}, I am contacting you regarding MUSF Union matters.`)}`;
                  return (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono font-medium truncate">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{phone}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px] font-bold flex items-center gap-1 transition active:scale-95 shadow-2xs"
                          title={`Call ${off.name}`}
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[11px] font-bold flex items-center gap-1 transition active:scale-95 shadow-2xs"
                          title={`WhatsApp Message to ${off.name}`}
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Role: {isExec ? 'Global Executive' : `Wing Convener (Slot ${slot})`}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopyCredentials(off)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition flex items-center gap-1"
                >
                  {copiedId === off.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Login</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Appoint / Edit Official */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOfficial ? 'Edit Union Official' : 'Appoint Union Official'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Appointment Scope Selector: Central Executive vs Wing Representative (2 per Wing) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Official Category / Tier *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => handleScopeChange('wing')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  scopeType === 'wing'
                    ? 'bg-white dark:bg-[#0F1B2B] text-[#0E7C86] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Wing Member (2 Per Wing)</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeChange('executive')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  scopeType === 'executive'
                    ? 'bg-white dark:bg-[#0F1B2B] text-[#0F2A4A] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Central Executive</span>
              </button>
            </div>
          </div>

          {/* Conditional Role Options based on Scope */}
          {scopeType === 'executive' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Central Council Designation *
              </label>
              <select
                value={formData.designation}
                onChange={(e) => {
                  const des = e.target.value;
                  const item = CENTRAL_EXECUTIVE_ROLES.find(r => r.title === des);
                  setFormData(prev => ({
                    ...prev,
                    designation: des,
                    assignedWingId: 'all',
                    wingSlot: null,
                    username: item?.username && item.username !== 'official_custom'
                      ? item.username
                      : (prev.username || 'exec_member')
                  }));
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
              >
                {CENTRAL_EXECUTIVE_ROLES.map(r => (
                  <option key={r.title} value={r.title}>{r.title}</option>
                ))}
              </select>

              {/* If Custom Designation selected, allow typing any custom title */}
              {formData.designation === 'Custom Designation...' && (
                <div>
                  <input
                    type="text"
                    required
                    value={customDesignation}
                    onChange={(e) => setCustomDesignation(e.target.value)}
                    placeholder="Enter custom title (e.g. Media Secretary, Student Advisor)..."
                    className="w-full p-2.5 rounded-xl border border-teal-400 dark:border-teal-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-xl bg-teal-50/40 dark:bg-slate-900/60 border border-teal-200/60 dark:border-teal-900/40">
              {/* Select Dynamic Wing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Union Wing (Added by Admin) *
                </label>
                <select
                  value={selectedWingId}
                  onChange={(e) => handleWingChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 text-xs font-bold text-[#0F2A4A] dark:text-white"
                >
                  {wings.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} {w.code ? `(${w.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Slot: Member 1 vs Member 2 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Wing Position (2 Members per Wing) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSlotChange(1)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedSlot === 1
                        ? 'border-[#0E7C86] bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] ring-1 ring-[#0E7C86]'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold">Member 1: Convener</span>
                      {selectedSlot === 1 && <Check className="w-3.5 h-3.5 text-[#0E7C86]" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">Primary Wing Lead</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSlotChange(2)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedSlot === 2
                        ? 'border-[#0E7C86] bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] ring-1 ring-[#0E7C86]'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold">Member 2: Joint Convener</span>
                      {selectedSlot === 2 && <Check className="w-3.5 h-3.5 text-[#0E7C86]" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">Co-Lead / Joint Secretary</span>
                  </button>
                </div>
              </div>

              {/* Current Wing Status Display */}
              {(() => {
                const assigned = unionOfficials.filter(o => o.assignedWingId === selectedWingId);
                const m1 = assigned.find(o => o.wingSlot === 1 || !o.designation?.toLowerCase().includes('joint')) || assigned[0];
                const m2 = assigned.find(o => (o.wingSlot === 2 || o.designation?.toLowerCase().includes('joint')) && o.id !== m1?.id) || (assigned.length > 1 ? assigned.find(o => o.id !== m1?.id) : null);
                return (
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                    <span className="font-bold text-slate-600 dark:text-slate-400 block text-[10px] uppercase">
                      Current Occupancy:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Member 1 (Convener):</span>
                      <strong className={m1 ? 'text-slate-800 dark:text-slate-200' : 'text-amber-600 italic'}>
                        {m1 ? m1.name : 'Vacant'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Member 2 (Joint Convener):</span>
                      <strong className={m2 ? 'text-slate-800 dark:text-slate-200' : 'text-amber-600 italic'}>
                        {m2 ? m2.name : 'Vacant'}
                      </strong>
                    </div>
                  </div>
                );
              })()}

              {/* Designation input (Auto-filled, but customizable) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Designation Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Fine Arts Convener"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                />
              </div>
            </div>
          )}

          {/* Member Profile Photo Upload & Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Member Profile Photo
            </label>
            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
              <div className="relative shrink-0">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#0E7C86] dark:ring-teal-400"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-lg">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-[#0E7C86] hover:bg-[#0c6b74] text-white text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.photoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="Or paste photo image URL (https://...)"
                  className="w-full text-[11px] p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Select Person / Student */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Person / Student *
              </label>
              {(selectedStudentId || manualName) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentId('');
                    setManualName('');
                    setSearchStudent('');
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* If someone is currently selected, show pill */}
            {(selectedStudentId || manualName) ? (
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 block">
                    {selectedStudentId ? 'Enrolled Student Selected' : 'Custom Appointee'}
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                    {manualName || searchStudent}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentId('');
                    setManualName('');
                    setSearchStudent('');
                  }}
                  className="px-2 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg shrink-0 hover:bg-slate-100"
                >
                  Change
                </button>
              </div>
            ) : null}

            {/* Search Input Box */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => {
                  setSearchStudent(e.target.value);
                  if (selectedStudentId) {
                    setSelectedStudentId('');
                    setManualName('');
                  }
                }}
                placeholder="Search by student name, CIC number, or class..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />
            </div>

            {/* Quick Option to use whatever is typed as a Custom Name */}
            {searchStudent.trim().length > 1 && !selectedStudentId && (
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => handleSetCustomName(searchStudent.trim())}
                  className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ Use &quot;{searchStudent.trim()}&quot; as Official Name</span>
                </button>
              </div>
            )}

            {/* Dropdown Suggestions List */}
            {(!selectedStudentId || searchStudent) && filteredStudents.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.slice(0, 35).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s)}
                    className="w-full p-2.5 text-left hover:bg-teal-50 dark:hover:bg-slate-800/80 text-xs flex items-center justify-between transition gap-2"
                  >
                    <div className="min-w-0">
                      <strong className="text-slate-800 dark:text-slate-100 block truncate">{s.name}</strong>
                      <span className="text-slate-400 text-[11px] font-mono">CIC: {s.cicNo || 'N/A'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 font-semibold">
                      {s.className || 'Student'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Contact Phone / WhatsApp Number *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-semibold"
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Portal Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="e.g. convener_sports_1"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Portal Login Password *
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="e.g. union123"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              {editingOfficial ? 'Save Official' : 'Appoint Official'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK PASSWORD ASSIGN / RESET MODAL */}
      <Modal
        isOpen={Boolean(passwordModalOfficial)}
        onClose={() => setPasswordModalOfficial(null)}
        title={`Assign / Reset Password: ${passwordModalOfficial?.name || ''}`}
      >
        <form onSubmit={handleSavePassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Account Credentials</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Assigned Position: <strong className="text-slate-900 dark:text-white">{passwordModalOfficial?.designation}</strong>
            </p>
            <p className="text-[11px] font-mono">
              Username: <strong className="text-blue-900 dark:text-blue-300">{passwordModalOfficial?.username}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Login Password *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="e.g. union2026 / custom secret"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The student can use this password or their CIC number to log into their Union Convener / Executive console.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPasswordModalOfficial(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              Save New Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
