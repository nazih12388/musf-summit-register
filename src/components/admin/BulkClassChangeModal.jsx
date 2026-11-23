import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  ArrowRightLeft,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter
} from 'lucide-react';

export const BulkClassChangeModal = ({
  isOpen,
  onClose,
  preSelectedStudentIds = [],
  onSuccess
}) => {
  const {
    students = [],
    classes = [],
    fields = [],
    bulkChangeStudentClass
  } = useApp();
  const { currentUser } = useAuth();

  // Mode: 'byClass' (Promote/transfer by class) vs 'selected' (Custom selected students)
  const [activeTab, setActiveTab] = useState(
    preSelectedStudentIds && preSelectedStudentIds.length > 0 ? 'selected' : 'byClass'
  );

  // By Class State
  const [fromClassId, setFromClassId] = useState('');
  const [toClassId, setToClassId] = useState('');
  const [selectedInClass, setSelectedInClass] = useState([]);
  const [targetFieldId, setTargetFieldId] = useState('');

  // Custom Selected State
  const [customSelectedIds, setCustomSelectedIds] = useState([]);
  const [customTargetClassId, setCustomTargetClassId] = useState('');
  const [customSearch, setCustomSearch] = useState('');

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Maps
  const classesMap = useMemo(() => Object.fromEntries(classes.map(c => [c.id, c])), [classes]);
  const fieldsMap = useMemo(() => Object.fromEntries(fields.map(f => [f.id, f])), [fields]);
  const aliyaFields = useMemo(() => fields.filter(f => f.sectionId === 'aliya'), [fields]);

  // Initialize defaults on open or class change
  useEffect(() => {
    if (isOpen) {
      if (classes.length > 0) {
        const defaultFrom = classes[0]?.id || '';
        const defaultTo = classes[1]?.id || classes[0]?.id || '';
        setFromClassId(defaultFrom);
        setToClassId(defaultTo);
        setCustomTargetClassId(defaultTo);
      }
      if (preSelectedStudentIds && preSelectedStudentIds.length > 0) {
        setCustomSelectedIds(preSelectedStudentIds);
        setActiveTab('selected');
      } else {
        setActiveTab('byClass');
      }
    }
  }, [isOpen, classes, preSelectedStudentIds]);

  // Students in selected 'fromClass'
  const studentsInFromClass = useMemo(() => {
    if (!fromClassId) return [];
    return students.filter(s => s.classId === fromClassId);
  }, [students, fromClassId]);

  // When fromClass changes, select all students in that class by default
  useEffect(() => {
    if (fromClassId) {
      const allIds = students.filter(s => s.classId === fromClassId).map(s => s.id);
      setSelectedInClass(allIds);
    }
  }, [fromClassId, students]);

  // Target class metadata
  const targetClass = classesMap[toClassId];
  const isTargetAliya = targetClass?.sectionId === 'aliya';

  const customTargetClass = classesMap[customTargetClassId];
  const isCustomTargetAliya = customTargetClass?.sectionId === 'aliya';

  // Toggle select in fromClass
  const toggleStudentInClass = (id) => {
    setSelectedInClass(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllInClass = () => {
    setSelectedInClass(studentsInFromClass.map(s => s.id));
  };

  const deselectAllInClass = () => {
    setSelectedInClass([]);
  };

  // Custom tab filtered students
  const customFilteredStudents = useMemo(() => {
    const q = customSearch.trim().toLowerCase();
    return students.filter(s => {
      if (!s) return false;
      const matchSearch = !q ||
        String(s.name || '').toLowerCase().includes(q) ||
        String(s.cicNo || '').toLowerCase().includes(q);
      return matchSearch;
    });
  }, [students, customSearch]);

  const toggleCustomStudent = (id) => {
    setCustomSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Execution Handlers
  const handleInitiateByClassTransfer = () => {
    if (!toClassId) return;
    if (fromClassId === toClassId) {
      alert('Source class and Target class cannot be the same!');
      return;
    }
    if (selectedInClass.length === 0) {
      alert('Please select at least one student to transfer.');
      return;
    }

    const fromName = classesMap[fromClassId]?.name || fromClassId;
    const toName = classesMap[toClassId]?.name || toClassId;

    setPendingAction({
      type: 'byClass',
      studentIds: selectedInClass,
      targetClassId: toClassId,
      targetFieldId: isTargetAliya ? targetFieldId : null,
      fromName,
      toName,
      count: selectedInClass.length
    });
    setIsConfirmOpen(true);
  };

  const handleInitiateCustomTransfer = () => {
    if (!customTargetClassId) return;
    if (customSelectedIds.length === 0) {
      alert('Please select at least one student to transfer.');
      return;
    }

    const toName = classesMap[customTargetClassId]?.name || customTargetClassId;

    setPendingAction({
      type: 'custom',
      studentIds: customSelectedIds,
      targetClassId: customTargetClassId,
      targetFieldId: isCustomTargetAliya ? targetFieldId : null,
      fromName: 'Various Classes',
      toName,
      count: customSelectedIds.length
    });
    setIsConfirmOpen(true);
  };

  const handleConfirmExecute = () => {
    if (!pendingAction) return;

    const count = bulkChangeStudentClass(
      pendingAction.studentIds,
      pendingAction.targetClassId,
      pendingAction.targetFieldId,
      currentUser?.username || 'admin'
    );

    setIsConfirmOpen(false);
    onClose();

    if (typeof onSuccess === 'function') {
      onSuccess(count, pendingAction.toName);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                Bulk Class Promotion & Transfer
              </span>
              <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">
                ബാച്ച് / ക്ലാസ്സ് അടിസ്ഥാനത്തിൽ കൂട്ടത്തോടെ മാറ്റാം
              </span>
            </div>
          </div>
        }
        maxWidth="max-w-2xl"
      >
        <div className="p-4 sm:p-6 space-y-5">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('byClass')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'byClass'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>By Class / Promotion (മുഴുവൻ ബാച്ച്)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('selected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'selected'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                Selected Students ({customSelectedIds.length})
              </span>
            </button>
          </div>

          {/* TAB 1: BY CLASS (PROMOTION) */}
          {activeTab === 'byClass' && (
            <div className="space-y-4">
              {/* Class Selection Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                {/* From Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Current Class (നിലവിലെ ക്ലാസ്സ്)</span>
                  </label>
                  <select
                    value={fromClassId}
                    onChange={(e) => setFromClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {classes.map(c => {
                      const count = students.filter(s => s.classId === c.id).length;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} ({count} Students)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* To Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Target Class (മാറ്റേണ്ട പുതിയ ക്ലാസ്സ്)</span>
                  </label>
                  <select
                    value={toClassId}
                    onChange={(e) => setToClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id} disabled={c.id === fromClassId}>
                        {c.name} {c.id === fromClassId ? '(Current Class)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Target is Aliya, option for Field / Specialization */}
                {isTargetAliya && (
                  <div className="sm:col-span-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/60 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      <span>Aliya Specialization / Field (ഓപ്ഷണൽ)</span>
                    </label>
                    <select
                      value={targetFieldId}
                      onChange={(e) => setTargetFieldId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Keep current field or auto-assign Communicative</option>
                      {aliyaFields.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.description || 'Specialization'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Students Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>
                      Students in {classesMap[fromClassId]?.name || fromClassId} ({studentsInFromClass.length})
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllInClass}
                      className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                    <button
                      type="button"
                      onClick={deselectAllInClass}
                      className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {studentsInFromClass.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
                    No students currently enrolled in this class.
                  </div>
                ) : (
                  <div className="max-h-[260px] overflow-y-auto space-y-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pr-1">
                    {studentsInFromClass.map((student) => {
                      const isSelected = selectedInClass.includes(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentInClass(student.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="font-bold text-slate-800 dark:text-white">
                                {student.name}
                              </span>
                              <span className="ml-2 font-mono text-[10px] text-slate-400">
                                #{student.cicNo || 'No CIC'}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {student.className || classesMap[student.classId]?.name || 'Current'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Transfer Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-purple-600">{selectedInClass.length}</span> of{' '}
                  <span className="font-bold">{studentsInFromClass.length}</span> students selected
                </div>

                <button
                  type="button"
                  disabled={selectedInClass.length === 0 || fromClassId === toClassId}
                  onClick={handleInitiateByClassTransfer}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>
                    Transfer {selectedInClass.length} Students to {classesMap[toClassId]?.name}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SELECTED / CUSTOM STUDENTS */}
          {activeTab === 'selected' && (
            <div className="space-y-4">
              {/* Target Class Selector */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>New Target Class for Selected Students</span>
                  </label>
                  <select
                    value={customTargetClassId}
                    onChange={(e) => setCustomTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isCustomTargetAliya && (
                  <div className="space-y-1.5 pt-2 border-t border-purple-200/60 dark:border-purple-900/60">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Aliya Specialization / Field (Optional)
                    </label>
                    <select
                      value={targetFieldId}
                      onChange={(e) => setTargetFieldId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Keep current field or auto-assign</option>
                      {aliyaFields.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Search Bar for Custom Students */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Select Students to Change Class ({customSelectedIds.length} Selected)
                  </span>
                  {customSelectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomSelectedIds([])}
                      className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear All Selected
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    placeholder="Search name or CIC number to add to selection..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pr-1">
                  {customFilteredStudents.map(student => {
                    const isSelected = customSelectedIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleCustomStudent(student.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-800 dark:text-white">
                              {student.name}
                            </span>
                            <span className="ml-2 font-mono text-[10px] text-slate-400">
                              #{student.cicNo}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                          {classesMap[student.classId]?.name || student.className || 'Class'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Transfer Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-purple-600">{customSelectedIds.length}</span> students will be moved to{' '}
                  <span className="font-bold">{classesMap[customTargetClassId]?.name}</span>
                </div>

                <button
                  type="button"
                  disabled={customSelectedIds.length === 0 || !customTargetClassId}
                  onClick={handleInitiateCustomTransfer}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Update Class for {customSelectedIds.length} Students</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmExecute}
        title="Confirm Bulk Class Change"
        message={
          pendingAction ? (
            <div className="space-y-2 text-xs">
              <p>
                Are you sure you want to move <strong>{pendingAction.count} students</strong> to{' '}
                <strong className="text-purple-600">{pendingAction.toName}</strong>?
              </p>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>All changes will be updated in real-time and saved to Firestore.</span>
              </div>
            </div>
          ) : ''
        }
        confirmText="Confirm & Move Students"
        cancelText="Cancel"
      />
    </>
  );
};
