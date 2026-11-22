import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ClassWiseActivityReportModal } from '../reports/ClassWiseActivityReportModal';
import {
  downloadStudentTemplate,
  parseStudentExcel,
  exportCredentialsExcel
} from '../../utils/excel';
import { printHtmlDocument } from '../../utils/printHelper';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Key,
  Hash,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit,
  RotateCcw,
  Archive,
  ArrowRightLeft,
  CheckCircle,
  CheckCircle2,
  MapPin,
  AlertCircle,
  Printer,
  BookOpen,
  Shield,
  Layers,
  Sparkles,
  Info,
  Check
} from 'lucide-react';

export const StudentManagement = () => {
  const {
    students = [],
    archivedStudents = [],
    classes = [],
    teams = [],
    fields = [],
    sections = [],
    addStudent,
    updateStudent,
    removeStudent,
    restoreStudent,
    restoreDefaultStudents,
    autoGenerateAllCredentials,
    autoGenerateChestNumbers,
    bulkImportStudents
  } = useApp();
  const { currentUser } = useAuth();
  const { lang, t, tr } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState('all'); // 'all', 'thamheediyya', 'aliya'
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Auto-restore default college students if directory is empty on load
  React.useEffect(() => {
    if (students.length === 0 && typeof restoreDefaultStudents === 'function') {
      restoreDefaultStudents('system');
    }
  }, [students.length, restoreDefaultStudents]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isClassReportOpen, setIsClassReportOpen] = useState(false);
  const [credentialsProgress, setCredentialsProgress] = useState(null);
  const [generatedSheet, setGeneratedSheet] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  // Maps for quick lookups
  const classesMap = useMemo(() => Object.fromEntries((classes || []).map(c => [c.id, c])), [classes]);
  const teamsMap = useMemo(() => Object.fromEntries((teams || []).map(t => [t.id, t])), [teams]);
  const fieldsMap = useMemo(() => Object.fromEntries((fields || []).map(f => [f.id, f])), [fields]);
  const aliyaFields = useMemo(() => (fields || []).filter(f => f?.sectionId === 'aliya'), [fields]);

  // Add Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    cicNo: '',
    classId: classes[0]?.id || 'c1',
    teamId: teams[0]?.id || 'team_a',
    fieldId: '',
    chestNo: '',
    password: 'student123',
    phone: '',
    place: '',
    address: '',
    photoUrl: ''
  });

  // Check if selected class in Add Modal belongs to Aliya
  const isNewStudentAliya = useMemo(() => {
    return classesMap[newStudent.classId]?.sectionId === 'aliya';
  }, [newStudent.classId, classesMap]);

  // Bulk Upload State
  const [bulkMode, setBulkMode] = useState('file'); // 'file' or 'paste'
  const [pastedText, setPastedText] = useState('');
  const [previewList, setPreviewList] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Filtered students with lenient, resilient attribute matching
  const filteredStudents = useMemo(() => {
    const list = showArchived ? (archivedStudents || []) : (students || []);
    const q = String(search || '').toLowerCase().trim();

    return list.filter(s => {
      if (!s) return false;
      const sName = String(s.name || '').toLowerCase();
      const sCic = String(s.cicNo || '').toLowerCase();
      const sChest = String(s.chestNo || '').toLowerCase();
      const sUser = String(s.username || '').toLowerCase();

      const matchSearch = !q || sName.includes(q) || sCic.includes(q) || sChest.includes(q) || sUser.includes(q);

      const cl = classesMap[s.classId];
      const studentSec = s.sectionId || cl?.sectionId || (['c1', 'c2', 'class 1', 'class 2'].includes(String(s.classId || s.className || '').toLowerCase().trim()) ? 'thamheediyya' : 'aliya');

      const matchSection = selectedSection === 'all' || studentSec === selectedSection;

      const matchClass = selectedClass === 'all' ||
        s.classId === selectedClass ||
        cl?.id === selectedClass ||
        (cl?.name && classesMap[selectedClass]?.name && cl.name.toLowerCase() === classesMap[selectedClass].name.toLowerCase()) ||
        String(s.className || '').toLowerCase() === String(classesMap[selectedClass]?.name || selectedClass).toLowerCase();

      const matchTeam = selectedTeam === 'all' ||
        s.teamId === selectedTeam ||
        teamsMap[s.teamId]?.id === selectedTeam;

      const matchField = selectedField === 'all' ||
        s.fieldId === selectedField ||
        fieldsMap[s.fieldId]?.id === selectedField;

      return matchSearch && matchSection && matchClass && matchTeam && matchField;
    });
  }, [students, archivedStudents, showArchived, search, selectedSection, selectedClass, selectedTeam, selectedField, classesMap, teamsMap, fieldsMap]);

  // Handle single student submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.cicNo) return;
    const finalFieldId = isNewStudentAliya
      ? (newStudent.fieldId || aliyaFields[0]?.id || '')
      : 'f_foundation';

    const created = await addStudent({
      ...newStudent,
      name: newStudent.name.trim(),
      cicNo: newStudent.cicNo.trim(),
      phone: newStudent.phone?.trim() || '',
      place: newStudent.place?.trim() || '',
      address: newStudent.address?.trim() || '',
      dob: newStudent.dob || '',
      bloodGroup: newStudent.bloodGroup?.trim() || '',
      fieldId: finalFieldId,
      teamId: newStudent.teamId || teams[0]?.id || 'team_a'
    }, currentUser?.username);
    setIsAddOpen(false);

    // Auto-reset all filters so newly added student immediately appears at top
    setSearch('');
    setSelectedSection('all');
    setSelectedClass('all');
    setSelectedField('all');
    setShowArchived(false);

    if (created?.id) {
      setRecentlyAddedId(created.id);
      setTimeout(() => setRecentlyAddedId(null), 8000);
    }
    setToastMsg(`Enrolled ${newStudent.name} (${newStudent.cicNo}) successfully!`);
    setTimeout(() => setToastMsg(''), 5000);

    setNewStudent({
      name: '',
      cicNo: '',
      classId: classes[0]?.id || 'c1',
      teamId: teams[0]?.id || 'team_a',
      fieldId: '',
      chestNo: '',
      password: 'student123',
      phone: '',
      place: '',
      address: '',
      dob: '',
      bloodGroup: '',
      photoUrl: ''
    });
  };

  // Handle edit submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    const cl = classesMap[editingStudent.classId];
    const isAliya = cl?.sectionId === 'aliya';
    const fieldId = isAliya ? (editingStudent.fieldId || aliyaFields[0]?.id || '') : 'f_foundation';

    updateStudent(editingStudent.id, {
      ...editingStudent,
      name: editingStudent.name?.trim(),
      cicNo: editingStudent.cicNo?.trim(),
      fieldId,
      phone: editingStudent.phone?.trim() || '',
      place: editingStudent.place?.trim() || '',
      address: editingStudent.address?.trim() || '',
      dob: editingStudent.dob || '',
      bloodGroup: editingStudent.bloodGroup?.trim() || '',
      photoUrl: editingStudent.photoUrl?.trim() || ''
    }, currentUser?.username);
    setToastMsg(`Updated details for ${editingStudent.name} (${editingStudent.cicNo})!`);
    setTimeout(() => setToastMsg(''), 5000);
    setEditingStudent(null);
  };

  // Handle Excel File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkErrors([]);

    try {
      const rows = await parseStudentExcel(file);
      processRowsForImport(rows);
    } catch (err) {
      setBulkErrors(["Failed to read file: " + (err?.message || "Invalid file format")]);
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Parse Pasted Text: Format: Name, CIC Number, Class, Group/Team, Field (tab or comma separated)
  const handleProcessPastedText = () => {
    const lines = pastedText.trim().split('\n');
    const parsedRows = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        parsedRows.push({
          "Name": parts[0]?.trim(),
          "CIC Number": parts[1]?.trim(),
          "Class": parts[2]?.trim() || "Class 1",
          "Group": parts[3]?.trim() || teams[0]?.name || "Team A",
          "Field": parts[4]?.trim() || ""
        });
      }
    });

    processRowsForImport(parsedRows);
  };

  // Validate and match imported rows against classes, teams, and fields without blocking existing records
  const processRowsForImport = (rows) => {
    const validated = [];
    const errs = [];
    const existingCicMap = new Map((students || []).map(s => [String(s?.cicNo || '').toLowerCase().trim(), s]));
    const seenCicInBatch = new Set();

    rows.forEach((r, idx) => {
      // Normalize object keys to lowercase trimmed
      const norm = {};
      Object.keys(r || {}).forEach(k => {
        norm[String(k).trim().toLowerCase()] = r[k];
      });

      const name = norm['name'] || norm['student name'] || norm['student_name'] || norm['student'] || norm['fullname'] || r["Name"] || r["name"];
      const cic = norm['cic number'] || norm['cic no'] || norm['cicno'] || norm['cic_no'] || norm['cic'] || norm['reg no'] || norm['registration no'] || norm['roll no'] || r["CIC Number"] || r["cicNo"];
      const className = norm['class'] || norm['class name'] || norm['classname'] || norm['class_name'] || norm['standard'] || norm['batch'] || r["Class"] || r["class"];
      const teamName = norm['group'] || norm['team'] || norm['house'] || norm['team name'] || norm['group name'] || norm['house team'] || r["Group"] || r["group"];
      const fieldVal = norm['field'] || norm['specialization'] || norm['field of study'] || norm['field_name'] || norm['stream'] || r["Field"] || r["field"];

      if (!name || !cic) {
        errs.push(`Row ${idx + 1}: Name and CIC Number are required.`);
        return;
      }

      const cicKey = String(cic).trim().toLowerCase();
      if (seenCicInBatch.has(cicKey)) {
        // Silently skip duplicate within the same batch
        return;
      }
      seenCicInBatch.add(cicKey);

      const existingStudent = existingCicMap.get(cicKey);

      // Match class
      const matchedClass = (classes || []).find(c =>
        c?.name?.toLowerCase().trim() === String(className || '').toLowerCase().trim() ||
        c?.id?.toLowerCase().trim() === String(className || '').toLowerCase().trim() ||
        c?.name?.toLowerCase().includes(String(className || '').toLowerCase().trim())
      ) || classes[0] || { id: 'c1', name: 'Class 1', sectionId: 'thamheediyya' };

      // Match team/group (matches "A", "Team A", "team_a", etc.)
      const rawGroup = String(teamName || '').trim().toLowerCase();
      const matchedTeam = (teams || []).find(t =>
        t?.id?.toLowerCase() === rawGroup ||
        t?.name?.toLowerCase() === rawGroup ||
        t?.name?.toLowerCase() === `team ${rawGroup}` ||
        t?.name?.toLowerCase().endsWith(` ${rawGroup}`) ||
        rawGroup.includes(t?.name?.toLowerCase())
      ) || teams[0] || { id: 'team_a', name: 'Team A', color: '#0E7C86' };

      const isAliya = matchedClass.sectionId === 'aliya';
      let matchedField = null;

      if (fieldVal) {
        matchedField = (fields || []).find(f =>
          f?.name?.toLowerCase().includes(String(fieldVal).toLowerCase().trim()) ||
          f?.id?.toLowerCase() === String(fieldVal).toLowerCase().trim()
        );
      }

      if (!matchedField) {
        if (isAliya) {
          // Default to first Aliya field
          matchedField = (fields || []).find(f => f?.sectionId === 'aliya') || fields[0];
        } else {
          matchedField = (fields || []).find(f => f?.id === 'f_foundation' || f?.id === 'f_general') || fields[0];
        }
      }

      validated.push({
        id: existingStudent ? existingStudent.id : undefined,
        isUpdate: Boolean(existingStudent),
        name: String(name).trim(),
        cicNo: String(cic).trim(),
        classId: matchedClass.id,
        className: matchedClass.name,
        sectionId: matchedClass.sectionId || 'thamheediyya',
        teamId: matchedTeam.id,
        teamName: matchedTeam.name,
        teamColor: matchedTeam.color,
        fieldId: matchedField ? matchedField.id : '',
        fieldName: matchedField ? matchedField.name : (isAliya ? 'Communicative' : 'Foundational Academic')
      });
    });

    setPreviewList(validated);
    setBulkErrors(errs);
  };

  // Update a single row's field in the preview table before import
  const handleUpdatePreviewField = (index, newFieldId) => {
    setPreviewList(prev => prev.map((item, idx) => {
      if (idx === index) {
        const fld = fieldsMap[newFieldId];
        return {
          ...item,
          fieldId: newFieldId,
          fieldName: fld ? fld.name : ''
        };
      }
      return item;
    }));
  };

  const handleConfirmImport = async () => {
    if (previewList.length === 0) return;
    const count = previewList.length;
    const res = await bulkImportStudents(previewList, currentUser?.username);
    const addedCount = res?.addedCount ?? count;
    const updatedCount = res?.updatedCount ?? 0;

    // Reset filters so imported students appear at top immediately
    setSearch('');
    setSelectedSection('all');
    setSelectedClass('all');
    setSelectedTeam('all');
    setSelectedField('all');
    setShowArchived(false);

    const msg = updatedCount > 0
      ? `Successfully processed ${count} students (${addedCount} added, ${updatedCount} updated)!`
      : `Successfully imported ${count} students!`;

    setBulkSuccessMsg(msg);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 6000);
    setPreviewList([]);
    setPastedText('');
    setTimeout(() => {
      setBulkSuccessMsg('');
      setIsBulkOpen(false);
    }, 1500);
  };

  const handlePrintStudentCredentials = () => {
    const dataList = generatedSheet.length > 0 ? generatedSheet : students;
    const contentHtml = `
      <div style="padding: 10px;">
        <div style="text-align: center; border-bottom: 2px solid #0f2a4a; padding-bottom: 12px; margin-bottom: 16px;">
          <h1 style="font-size: 20px; font-weight: 900; margin: 0 0 4px 0; color: #0f2a4a; text-transform: uppercase;">MAJLIS UMARIYYA WAFY COLLEGE</h1>
          <h2 style="font-size: 15px; font-weight: 800; margin: 0; color: #0e7c86; text-transform: uppercase;">Student Portal Credentials Roster</h2>
          <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Total Accounts: ${dataList.length} &bull; Generated on ${new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 6px;">#</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Student Name</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">CIC No</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Class</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Group / Team</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Username</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Password</th>
            </tr>
          </thead>
          <tbody>
            ${dataList.map((s, idx) => {
              const cl = classesMap[s.classId];
              const tm = teamsMap[s.teamId];
              return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="border: 1px solid #cbd5e1; padding: 5px 6px; text-align: center;">${idx + 1}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px 6px;"><strong>${s.name}</strong></td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px 6px; font-family: monospace;">${s.cicNo}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px 6px;">${cl ? cl.name : (s.className || 'Class')}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px 6px;">${tm ? tm.name : (s.teamName || 'Team')}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px 6px; font-family: monospace; font-weight: bold; color: #0f2a4a;">${s.username || s.cicNo}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px 6px; font-family: monospace; font-weight: bold; color: #16a34a;">${s.initialPassword || s.password || 'student123'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    printHtmlDocument({
      title: 'Student Credentials Roster',
      contentHtml
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {showArchived 
                ? (lang === 'ml' ? "ആർക്കൈവ് ചെയ്ത വിദ്യാർത്ഥികൾ" : "Archived Students") 
                : (lang === 'ml' ? "വിദ്യാർത്ഥികളുടെ പട്ടിക" : "Students Directory & Roster")}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredStudents.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage students, generate credentials, assign teams, and maintain registration.
          </p>
        </div>

        {/* Buttons row */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          {!showArchived ? (
            <>
              {students.length === 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    await restoreDefaultStudents(currentUser?.username);
                    setToastMsg('Restored official college roster (117 students) successfully!');
                    setTimeout(() => setToastMsg(''), 5000);
                  }}
                  className="min-h-[44px] py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Official Students (117)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsClassReportOpen(true)}
                className="min-h-[44px] py-2 px-3.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98 cursor-pointer"
                title="Class-Wise Detailed Activity & Participation Report"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Class Activity Report</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="min-h-[44px] py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.common?.add || "Add"} Student</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkOpen(true)}
                className="min-h-[44px] py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-300 dark:border-slate-700 active:scale-98"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsCredentialsModalOpen(true);
                  setCredentialsProgress({ current: 0, total: students.length, percent: 0, statusText: 'Initializing account creation...' });
                  try {
                    const sheet = await autoGenerateAllCredentials(currentUser?.username, (p) => {
                      setCredentialsProgress({
                        current: p.current,
                        total: p.total,
                        percent: p.percent,
                        statusText: `Processed account ${p.result.username} (${p.current}/${p.total})`
                      });
                    });
                    if (sheet && sheet.length > 0) {
                      setGeneratedSheet(sheet);
                    }
                  } catch (e) {
                    console.error('Credentials generation error:', e);
                  } finally {
                    setCredentialsProgress(null);
                  }
                }}
                className="min-h-[44px] py-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-indigo-200 dark:border-indigo-800 active:scale-98 cursor-pointer"
                title="Generate Usernames/Passwords and print sheet"
              >
                <Key className="w-4 h-4" />
                <span>Credentials Sheet</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className="min-h-[44px] py-2 px-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>Back to Active Directory</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert for Added / Imported Student */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-medium text-xs flex items-center justify-between border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg('')}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 text-sm font-bold ml-3 px-2 py-0.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="relative lg:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name, CIC, Chest..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value="all">All Sections (Stages)</option>
            {(sections || []).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Classes</option>
            {(classes || [])
              .filter(c => selectedSection === 'all' || c?.sectionId === selectedSection)
              .map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'})</option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Fields / Specializations</option>
            {(fields || []).map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.sectionId === 'aliya' ? 'Aliya' : 'Foundation'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Summary Pill */}
      {(selectedSection !== 'all' || selectedClass !== 'all' || selectedTeam !== 'all' || selectedField !== 'all' || search) && (
        <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
          <span>
            Showing <strong className="text-emerald-700 dark:text-emerald-400">{filteredStudents.length}</strong> of {showArchived ? archivedStudents.length : students.length} students matching filters
          </span>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSection('all');
              setSelectedClass('all');
              setSelectedTeam('all');
              setSelectedField('all');
            }}
            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* MOBILE STUDENT FEED (Screens < 768px): Zero Horizontal Scroll, Fast Native Layout */}
      <div className="md:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs space-y-3">
            <p>
              {students.length === 0
                ? "No student records found in directory."
                : "No students match current search or filters."}
            </p>
            {students.length === 0 ? (
              <button
                type="button"
                onClick={() => restoreDefaultStudents(currentUser?.username)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Official College Students (117)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedSection('all');
                  setSelectedClass('all');
                  setSelectedTeam('all');
                  setSelectedField('all');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          filteredStudents.map((student, idx) => {
            const team = teamsMap[student.teamId];
            const cl = classesMap[student.classId];
            const isAliya = student.sectionId === 'aliya' || cl?.sectionId === 'aliya';
            const field = fieldsMap[student.fieldId];
            const isRecentlyAdded = student.id === recentlyAddedId;

            return (
              <div
                key={student.id}
                style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                className={`animate-bottom-up p-3.5 rounded-2xl border shadow-xs space-y-3 transition duration-300 ${
                  isRecentlyAdded
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                    : 'bg-white dark:bg-[#0F1B2B] border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Name + Leader Badge + House Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {student.name}
                      </h4>
                      {isRecentlyAdded && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          New
                        </span>
                      )}
                      {student.isLeader && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          Leader
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      CIC: {student.cicNo}
                    </div>
                  </div>

                  {student.place && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium shrink-0 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{student.place}</span>
                    </span>
                  )}
                </div>

                {/* Details Row: Class, Section, Field */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    {cl?.name || student.classId}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    isAliya
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  }`}>
                    {isAliya ? 'Aliya' : 'Thamheediyya'}
                  </span>
                  {isAliya && field?.name && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {field.name}
                    </span>
                  )}
                  {student.username && (
                    <span className="text-[10px] font-mono text-slate-400 ml-auto">
                      @{student.username}
                    </span>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setEditingStudent({ ...student })}
                    className="min-h-[38px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#0E7C86]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingStudentId(student.id)}
                    className="min-h-[38px] px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP STUDENTS TABLE (Screens >= 768px) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs min-w-[680px] sm:min-w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 sticky left-0 bg-slate-50 dark:bg-[#0B1522] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">Student Name</th>
                <th className="py-3 px-3">CIC Number</th>
                <th className="py-3 px-3">Class & Section</th>
                <th className="py-3 px-3">Place & Contact</th>
                <th className="py-3 px-3">Field (Specialization)</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <p className="text-xs">
                        {students.length === 0
                          ? "No student records found in directory."
                          : "No students match current search or filters."}
                      </p>
                      {students.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => restoreDefaultStudents(currentUser?.username)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Load Official College Students (117)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setSelectedSection('all');
                            setSelectedClass('all');
                            setSelectedTeam('all');
                            setSelectedField('all');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Reset Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const team = teamsMap[student.teamId];
                  const cl = classesMap[student.classId];
                  const isAliya = student.sectionId === 'aliya' || cl?.sectionId === 'aliya';
                  const field = fieldsMap[student.fieldId];
                  const isRecentlyAdded = student.id === recentlyAddedId;

                  return (
                    <tr
                      key={student.id}
                      className={`transition duration-200 ${
                        isRecentlyAdded
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className={`py-3 px-3 font-semibold text-slate-900 dark:text-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] ${
                        isRecentlyAdded
                          ? 'bg-emerald-100/80 dark:bg-emerald-950'
                          : 'bg-white dark:bg-slate-900'
                      }`}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{student.name}</span>
                          {isRecentlyAdded && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              New
                            </span>
                          )}
                          {student.isLeader && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Leader
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {student.cicNo}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{cl?.name || student.classId}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isAliya 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}>
                            {isAliya ? 'Aliya' : 'Thamheediyya'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {student.place || '—'}
                          </div>
                          {student.phone && (
                            <div className="text-[11px] font-mono text-slate-500">
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isAliya ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            {field?.name || 'Unassigned'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Foundation
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {student.username || '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => setEditingStudent({ ...student })}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title="Edit Student"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingStudentId(student.id)}
                            className="px-2 py-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 border border-rose-200/80 dark:border-rose-900/60 transition text-xs font-semibold inline-flex items-center gap-1"
                            title="Delete Student Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Student" maxWidth="max-w-md">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newStudent.name}
              onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Rayyan Zakariya"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">CIC Number (Unique)</label>
            <input
              type="text"
              required
              value={newStudent.cicNo}
              onChange={(e) => setNewStudent(prev => ({ ...prev, cicNo: e.target.value }))}
              placeholder="e.g. WAFY-2024-125"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">{tr('Phone Number', 'ഫോൺ നമ്പർ')}</label>
              <input
                type="tel"
                value={newStudent.phone || ''}
                onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. 9847123456"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">{tr('Place', 'സ്ഥലം')}</label>
              <input
                type="text"
                value={newStudent.place || ''}
                onChange={(e) => setNewStudent(prev => ({ ...prev, place: e.target.value }))}
                placeholder="e.g. Malappuram, Kondotty"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">{tr('Full Address', 'മേൽവിലാസം')}</label>
            <textarea
              rows="2"
              value={newStudent.address || ''}
              onChange={(e) => setNewStudent(prev => ({ ...prev, address: e.target.value }))}
              placeholder="House Name, Post Office, District, PIN Code..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Academic Class &amp; Section</label>
              <select
                value={newStudent.classId}
                onChange={(e) => {
                  const cid = e.target.value;
                  const isAliya = classesMap[cid]?.sectionId === 'aliya';
                  setNewStudent(prev => ({ 
                    ...prev, 
                    classId: cid,
                    fieldId: isAliya ? (prev.fieldId || aliyaFields[0]?.id || '') : 'f_foundation'
                  }));
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {(classes || []).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Summit Team <span className="text-[10px] text-slate-400 font-normal">(Summit Only)</span>
              </label>
              <select
                value={newStudent.teamId || teams[0]?.id || 'team_a'}
                onChange={(e) => setNewStudent(prev => ({ ...prev, teamId: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {(teams || []).map(t => (
                  <option key={t.id} value={t.id}>{t.name} (Summit House)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">{tr('Date of Birth', 'ജനനത്തീയതി')}</label>
              <input
                type="date"
                value={newStudent.dob || ''}
                onChange={(e) => setNewStudent(prev => ({ ...prev, dob: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">{tr('Photo URL (Optional)', 'ചിത്രം (ഓപ്ഷണൽ)')}</label>
              <input
                type="url"
                value={newStudent.photoUrl || ''}
                onChange={(e) => setNewStudent(prev => ({ ...prev, photoUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Conditional Field Selection for Aliya Students */}
          {isNewStudentAliya ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <label className="block font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Aliya Field of Specialization <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newStudent.fieldId}
                onChange={(e) => setNewStudent(prev => ({ ...prev, fieldId: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
              >
                <option value="">-- Select Field (Communicative / Creative / etc.) --</option>
                {(aliyaFields || []).map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
                Aliya students belong to a specialized field for summits and programs.
              </p>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thamheediyya section (Class 1 & 2): Foundation / General Curriculum</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition mt-4"
          >
            Save Student
          </button>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal isOpen={Boolean(editingStudent)} onClose={() => setEditingStudent(null)} title="Edit Student" maxWidth="max-w-md">
          <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editingStudent.name}
                onChange={(e) => setEditingStudent(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">CIC Number</label>
              <input
                type="text"
                required
                value={editingStudent.cicNo}
                onChange={(e) => setEditingStudent(prev => ({ ...prev, cicNo: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">{tr('Phone Number', 'ഫോൺ നമ്പർ')}</label>
                <input
                  type="tel"
                  value={editingStudent.phone || ''}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 9847123456"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{tr('Place', 'സ്ഥലം')}</label>
                <input
                  type="text"
                  value={editingStudent.place || ''}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, place: e.target.value }))}
                  placeholder="e.g. Malappuram, Kondotty"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">{tr('Full Address', 'മേൽവിലാസം')}</label>
              <textarea
                rows="2"
                value={editingStudent.address || ''}
                onChange={(e) => setEditingStudent(prev => ({ ...prev, address: e.target.value }))}
                placeholder="House Name, Post Office, District, PIN Code..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Academic Class & Section</label>
                <select
                  value={editingStudent.classId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const isAliya = classesMap[cid]?.sectionId === 'aliya';
                    setEditingStudent(prev => ({ 
                      ...prev, 
                      classId: cid,
                      fieldId: isAliya ? (prev.fieldId || aliyaFields[0]?.id || '') : 'f_foundation'
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {(classes || []).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sectionId === 'aliya' ? 'Aliya' : 'Thamheediyya'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Summit Team <span className="text-[10px] text-slate-400 font-normal">(Summit Only)</span>
                </label>
                <select
                  value={editingStudent.teamId || teams[0]?.id || 'team_a'}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {(teams || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Summit House)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">{tr('Blood Group', 'രക്തഗ്രൂപ്പ്')}</label>
                <input
                  type="text"
                  value={editingStudent.bloodGroup || ''}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  placeholder="e.g. O+, A+, B+, AB+"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">{tr('Date of Birth', 'ജനനത്തീയതി')}</label>
                <input
                  type="date"
                  value={editingStudent.dob || ''}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{tr('Photo URL (Optional)', 'ചിത്രം (ഓപ്ഷണൽ)')}</label>
                <input
                  type="url"
                  value={editingStudent.photoUrl || ''}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Conditional Field Selection for Aliya in Edit Modal */}
            {classesMap[editingStudent.classId]?.sectionId === 'aliya' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                <label className="block font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Aliya Field of Specialization <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editingStudent.fieldId || ''}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, fieldId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="">-- Select Field (Communicative / Creative / etc.) --</option>
                  {(aliyaFields || []).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thamheediyya section: Foundational Curriculum</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition mt-4"
            >
              Update Student
            </button>
          </form>
        </Modal>
      )}

      {/* Bulk Import Modal */}
      <Modal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Bulk Import Students (Class, Group & Aliya Field)" maxWidth="max-w-3xl">
        <div className="space-y-4 text-xs">
          {bulkSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{bulkSuccessMsg}</span>
            </div>
          )}

          {bulkErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Import Validation Issues ({bulkErrors.length}):</span>
              </div>
              <ul className="list-disc list-inside max-h-24 overflow-y-auto pl-1">
                {bulkErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* Guidelines Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-slate-600 dark:text-slate-300">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px]">
              <p>
                <strong>Supported Columns / Fields:</strong> <code>Student Name</code>, <code>CIC Number</code>, <code>Class</code>, <code>Group (House Team)</code>, and <code>Field</code> (for Aliya students: Communicative, Creative, etc.).
              </p>
              <p className="text-slate-500">
                • Thamheediyya (Class 1 & 2) students follow the common foundational curriculum.<br />
                • Aliya (Class 3, 4, 5) students specialize in fields. You can also change the field interactively in the preview table before clicking Import.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkMode('file')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${bulkMode === 'file' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Upload Excel / CSV
              </button>
              <button
                onClick={() => setBulkMode('paste')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${bulkMode === 'paste' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Paste List
              </button>
            </div>

            <button
              onClick={downloadStudentTemplate}
              className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Template</span>
            </button>
          </div>

          {bulkMode === 'file' ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold mb-1 text-slate-800 dark:text-slate-200">Select Excel (.xlsx) or CSV file</p>
              <p className="text-[11px] text-slate-400 mb-4">Required columns: Name, CIC Number, Class, Group, Field (for Aliya)</p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-500 text-[11px]">
                Paste student records below (comma-separated or tab-separated, one student per line). Format: <code>Name, CIC Number, Class, Group, Field</code>
              </p>
              <textarea
                rows="5"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Ahmad Faris, 23980, Class 1, A, General&#10;Ammar Farooq, 21724, Class 3, C, Communicative&#10;Rashid Hashmi, 21015, Class 4, A, Creative & Media"
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleProcessPastedText}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
              >
                Parse & Preview
              </button>
            </div>
          )}

          {/* Preview Table with Interactive Aliya Field Selector */}
          {previewList.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Validated Preview ({previewList.length} ready to import):
                </h4>
                <span className="text-[11px] text-slate-400">
                  Tip: You can change any Aliya student's field directly in the dropdown below.
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">CIC Number</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">Class & Section</th>
                      <th className="p-2">House / Group</th>
                      <th className="p-2">Field (Specialization)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {previewList.map((row, idx) => {
                      const isAliya = row.sectionId === 'aliya';

                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                          <td className="p-2 font-mono text-[11px] text-slate-500">{row.cicNo}</td>
                          <td className="p-2">
                            {row.isUpdate ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                                Update
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                New
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <span className="font-semibold">{row.className}</span>
                            <span className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isAliya ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isAliya ? 'Aliya' : 'Thamheediyya'}
                            </span>
                          </td>
                          <td className="p-2">
                            <span 
                              className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: row.teamColor || '#059669' }}
                            >
                              {row.teamName}
                            </span>
                          </td>
                          <td className="p-2">
                            {isAliya ? (
                              <select
                                value={row.fieldId}
                                onChange={(e) => handleUpdatePreviewField(idx, e.target.value)}
                                className="px-2 py-1 text-xs rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                              >
                                {(aliyaFields || []).map(f => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Foundation</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmImport}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl mt-3 shadow-md transition flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Import All {previewList.length} Students</span>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Credentials Sheet Modal (Print & Export) */}
      <Modal isOpen={isCredentialsModalOpen} onClose={() => setIsCredentialsModalOpen(false)} title="Student Credentials Sheet" maxWidth="max-w-3xl">
        <div className="space-y-4 text-xs">
          {credentialsProgress && (
            <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900 dark:text-teal-200">
                <span>Creating Firebase Authentication Accounts ({credentialsProgress.current}/{credentialsProgress.total})</span>
                <span>{credentialsProgress.percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all duration-200" style={{ width: `${credentialsProgress.percent}%` }} />
              </div>
              <p className="text-[11px] text-teal-700 dark:text-teal-300 font-mono truncate">{credentialsProgress.statusText}</p>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-slate-600 dark:text-slate-300">
              Bulk auto-generated usernames &amp; secure temporary passwords for all active students.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => exportCredentialsExcel(generatedSheet.length > 0 ? generatedSheet : students, teamsMap, classesMap)}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={handlePrintStudentCredentials}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold sticky top-0">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">CIC Number</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Team</th>
                  <th className="p-2">Username</th>
                  <th className="p-2">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(generatedSheet.length > 0 ? generatedSheet : students || []).map(s => (
                  <tr key={s.id || s.cicNo}>
                    <td className="p-2 font-semibold">{s.name}</td>
                    <td className="p-2 font-mono text-slate-500">{s.cicNo}</td>
                    <td className="p-2">{s.className || classesMap[s.classId]?.name || s.classId}</td>
                    <td className="p-2">{s.teamName || teamsMap[s.teamId]?.name || s.teamId}</td>
                    <td className="p-2 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{s.username || s.cicNo}</td>
                    <td className="p-2 font-mono text-slate-700 dark:text-slate-300 font-semibold">{s.password || s.initialPassword || s.cicNo || 'student123'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingStudentId)}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={() => {
          if (deletingStudentId) {
            removeStudent(deletingStudentId, currentUser?.username);
            setDeletingStudentId(null);
          }
        }}
        title="Delete Student Permanently"
        message="Are you sure you want to permanently delete this student? All their registrations, marks, and profile details will be completely removed from the institution."
        confirmLabel="Delete Permanently"
        isDestructive={true}
      />

      {/* Class-Wise Student Activity & Participation Report Modal */}
      <ClassWiseActivityReportModal
        isOpen={isClassReportOpen}
        onClose={() => setIsClassReportOpen(false)}
        defaultClassId={selectedClass !== 'all' ? selectedClass : 'all'}
      />
    </div>
  );
};
