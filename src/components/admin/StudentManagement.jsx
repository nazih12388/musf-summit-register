import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  downloadStudentTemplate,
  parseStudentExcel,
  exportCredentialsExcel
} from '../../utils/excel';
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
    autoGenerateAllCredentials,
    autoGenerateChestNumbers,
    bulkImportStudents
  } = useApp();
  const { currentUser } = useAuth();
  const { lang, t } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState('all'); // 'all', 'thamheediyya', 'aliya'
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
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
    teamId: teams[0]?.id || 't1',
    fieldId: '',
    chestNo: '',
    password: ''
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

  // Filtered students
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
      const studentSec = s.sectionId || cl?.sectionId;

      const matchSection = selectedSection === 'all' || studentSec === selectedSection;
      const matchClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchTeam = selectedTeam === 'all' || s.teamId === selectedTeam;
      const matchField = selectedField === 'all' || s.fieldId === selectedField;

      return matchSearch && matchSection && matchClass && matchTeam && matchField;
    });
  }, [students, archivedStudents, showArchived, search, selectedSection, selectedClass, selectedTeam, selectedField, classesMap]);

  // Handle single student submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.cicNo) return;
    const finalFieldId = isNewStudentAliya
      ? (newStudent.fieldId || aliyaFields[0]?.id || '')
      : 'f_foundation';

    await addStudent({ ...newStudent, fieldId: finalFieldId }, currentUser?.username);
    setIsAddOpen(false);
    setNewStudent({
      name: '',
      cicNo: '',
      classId: classes[0]?.id || 'c1',
      teamId: teams[0]?.id || 't1',
      fieldId: '',
      chestNo: '',
      password: 'student123'
    });
  };

  // Handle edit submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    const cl = classesMap[editingStudent.classId];
    const isAliya = cl?.sectionId === 'aliya';
    const fieldId = isAliya ? (editingStudent.fieldId || aliyaFields[0]?.id || '') : 'f_foundation';

    updateStudent(editingStudent.id, { ...editingStudent, fieldId }, currentUser?.username);
    setEditingStudent(null);
  };

  // Handle Excel File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await parseStudentExcel(file);
      processRowsForImport(rows);
    } catch (err) {
      setBulkErrors(["Failed to read file: " + err.message]);
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
          "Group": parts[3]?.trim() || teams[0]?.name || "Al-Bayan",
          "Field": parts[4]?.trim() || ""
        });
      }
    });

    processRowsForImport(parsedRows);
  };

  // Validate and match imported rows against classes, teams, and fields
  const processRowsForImport = (rows) => {
    const validated = [];
    const errs = [];
    const seenCic = new Set((students || []).map(s => String(s?.cicNo || '').toLowerCase()));

    rows.forEach((r, idx) => {
      const name = r["Name"] || r["name"] || r["Student Name"] || r["student_name"];
      const cic = r["CIC Number"] || r["cicNo"] || r["CIC"] || r["CIC No"] || r["cic_no"];
      const className = r["Class"] || r["class"] || r["Class Name"] || r["class_name"];
      const teamName = r["Group"] || r["group"] || r["Team"] || r["team"] || r["House"] || r["house"];
      const fieldVal = r["Field"] || r["field"] || r["Specialization"] || r["specialization"] || r["Field of Study"] || r["field_name"];

      if (!name || !cic) {
        errs.push(`Row ${idx + 1}: Name and CIC Number are required.`);
        return;
      }

      const cicKey = String(cic).trim().toLowerCase();
      if (seenCic.has(cicKey)) {
        errs.push(`Row ${idx + 1}: Duplicate CIC "${cic}" already exists in system.`);
        return;
      }
      seenCic.add(cicKey);

      // Match class
      const matchedClass = (classes || []).find(c =>
        c?.name?.toLowerCase().includes(String(className || '').toLowerCase()) ||
        c?.id?.toLowerCase() === String(className || '').toLowerCase()
      ) || classes[0] || { id: 'c1', name: 'Class 1', sectionId: 'thamheediyya' };

      // Match team/group
      const matchedTeam = (teams || []).find(t =>
        t?.name?.toLowerCase().includes(String(teamName || '').toLowerCase()) ||
        t?.id?.toLowerCase() === String(teamName || '').toLowerCase()
      ) || teams[0] || { id: 't1', name: 'Team Al-Bayan', color: '#0E7C86' };

      const isAliya = matchedClass.sectionId === 'aliya';
      let matchedField = null;

      if (fieldVal) {
        matchedField = (fields || []).find(f =>
          f?.name?.toLowerCase().includes(String(fieldVal).toLowerCase()) ||
          f?.id?.toLowerCase() === String(fieldVal).toLowerCase()
        );
      }

      if (!matchedField) {
        if (isAliya) {
          // Default to first Aliya field
          matchedField = (fields || []).find(f => f?.sectionId === 'aliya') || fields[0];
        } else {
          matchedField = (fields || []).find(f => f?.id === 'f_foundation') || fields[0];
        }
      }

      validated.push({
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
    await bulkImportStudents(previewList, currentUser?.username);
    setBulkSuccessMsg(`Successfully imported ${previewList.length} students with their Class, Group and Field!`);
    setPreviewList([]);
    setPastedText('');
    setTimeout(() => {
      setBulkSuccessMsg('');
      setIsBulkOpen(false);
    }, 1500);
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
                : (lang === 'ml' ? "വിദ്യാർത്ഥികളുടെ പട്ടിക (Students Directory)" : "Students Directory & Roster")}
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
                onClick={() => {
                  autoGenerateAllCredentials(currentUser?.username);
                  setIsCredentialsModalOpen(true);
                }}
                className="min-h-[44px] py-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-indigo-200 dark:border-indigo-800 active:scale-98"
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

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
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
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All House Teams</option>
            {(teams || []).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
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
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs">
            No students match current search or filters.
          </div>
        ) : (
          filteredStudents.map(student => {
            const team = teamsMap[student.teamId];
            const cl = classesMap[student.classId];
            const isAliya = student.sectionId === 'aliya' || cl?.sectionId === 'aliya';
            const field = fieldsMap[student.fieldId];

            return (
              <div
                key={student.id}
                className="p-3.5 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition"
              >
                {/* Header: Name + Leader Badge + House Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {student.name}
                      </h4>
                      {student.isLeader && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Leader
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                      CIC: {student.cicNo}
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs shrink-0"
                    style={{ backgroundColor: team?.color || '#059669' }}
                  >
                    {team?.name || student.teamId}
                  </span>
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
                <th className="py-3 px-3">House / Group</th>
                <th className="py-3 px-3">Field (Specialization)</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No students match current search or filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const team = teamsMap[student.teamId];
                  const cl = classesMap[student.classId];
                  const isAliya = student.sectionId === 'aliya' || cl?.sectionId === 'aliya';
                  const field = fieldsMap[student.fieldId];

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        {student.name}
                        {student.isLeader && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Leader
                          </span>
                        )}
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
                        <span 
                          className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs inline-block"
                          style={{ backgroundColor: team?.color || '#059669' }}
                        >
                          {team?.name || student.teamId}
                        </span>
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
              <label className="block font-semibold mb-1">Class</label>
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
              <label className="block font-semibold mb-1">House / Group</label>
              <select
                value={newStudent.teamId}
                onChange={(e) => setNewStudent(prev => ({ ...prev, teamId: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {(teams || []).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
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
                <label className="block font-semibold mb-1">Move Class</label>
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
                <label className="block font-semibold mb-1">Move House / Group</label>
                <select
                  value={editingStudent.teamId}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {(teams || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
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
                placeholder="Ahmad Faris, WAFY-2024-201, Class 1, Al-Bayan&#10;Ammar Farooq, WAFY-2024-203, Class 3, Al-Ihsan, Communicative&#10;Rashid Hashmi, WAFY-2024-204, Class 4, Al-Hikmah, Creative"
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
          <div className="flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-300">
              Bulk auto-generated usernames & secure temporary passwords for all active students.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => exportCredentialsExcel(students, teamsMap, classesMap)}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => window.print()}
                className="py-1.5 px-3 rounded-xl bg-slate-800 text-white font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-xl">
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
              <tbody className="divide-y">
                {(students || []).map(s => (
                  <tr key={s.id}>
                    <td className="p-2 font-semibold">{s.name}</td>
                    <td className="p-2 font-mono text-slate-500">{s.cicNo}</td>
                    <td className="p-2">{classesMap[s.classId]?.name || s.classId}</td>
                    <td className="p-2">{teamsMap[s.teamId]?.name || s.teamId}</td>
                    <td className="p-2 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{s.username || s.cicNo}</td>
                    <td className="p-2 font-mono text-slate-700 dark:text-slate-300 font-semibold">{s.initialPassword || s.cicNo || 'student123'}</td>
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
    </div>
  );
};
