import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  BookOpen,
  FolderPlus,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Power,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  Building,
  Users,
  User,
  SlidersHorizontal,
  FileText,
  Upload,
  Download,
  Check,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const ProgramLibraryManagement = () => {
  const {
    sections = [],
    fields = [],
    programLibrary = [],
    addField,
    updateField,
    deleteField,
    addLibraryProgram,
    updateLibraryProgram,
    deleteLibraryProgram,
    duplicateLibraryProgram,
    bulkImportLibraryPrograms,
    toggleLibraryProgramActive
  } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'fields'

  // Library Filters
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Program Modal State
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);

  // Bulk Import State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportStatus, setBulkImportStatus] = useState('');

  const [programForm, setProgramForm] = useState({
    name: '',
    fieldId: fields[0]?.id || '',
    sectionId: 'aliya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: '',
    rules: ''
  });

  // Field Modal State
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [deletingField, setDeletingField] = useState(null);

  const [fieldForm, setFieldForm] = useState({
    name: '',
    sectionId: 'aliya',
    description: ''
  });

  // Counts
  const countsBySection = useMemo(() => {
    const map = { all: programLibrary.length, thamheediyya: 0, aliya: 0, both: 0 };
    programLibrary.forEach(p => {
      if (map[p.sectionId] != null) map[p.sectionId]++;
    });
    return map;
  }, [programLibrary]);

  const countsByField = useMemo(() => {
    const map = {};
    fields.forEach(f => {
      map[f.id] = programLibrary.filter(p => p.fieldId === f.id).length;
    });
    return map;
  }, [fields, programLibrary]);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programLibrary.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

      const matchSection = selectedSection === 'all' || p.sectionId === selectedSection || p.sectionId === 'both';
      const matchField = selectedField === 'all' || p.fieldId === selectedField;
      const matchType = selectedType === 'all' || p.type === selectedType;

      return matchSearch && matchSection && matchField && matchType;
    });
  }, [programLibrary, search, selectedSection, selectedField, selectedType]);

  // Program Handlers
  const handleOpenAddProgram = () => {
    setProgramForm({
      name: '',
      fieldId: fields[0]?.id || '',
      sectionId: selectedSection !== 'all' ? selectedSection : 'aliya',
      type: 'individual',
      maxMarks: 10,
      defaultAllowedPerTeam: 1,
      description: '',
      rules: ''
    });
    setIsAddProgramOpen(true);
  };

  const handleOpenEditProgram = (prog) => {
    setEditingProgram(prog);
    setProgramForm({
      name: prog.name,
      fieldId: prog.fieldId,
      sectionId: prog.sectionId,
      type: prog.type,
      maxMarks: prog.maxMarks || 10,
      defaultAllowedPerTeam: prog.defaultAllowedPerTeam || 1,
      description: prog.description || '',
      rules: prog.rules || ''
    });
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!programForm.name.trim()) return;

    if (editingProgram) {
      updateLibraryProgram(editingProgram.id, programForm, currentUser?.username);
      setEditingProgram(null);
    } else {
      addLibraryProgram(programForm, currentUser?.username);
      setIsAddProgramOpen(false);
    }
  };

  // Field Handlers
  const handleOpenAddField = () => {
    setFieldForm({
      name: '',
      sectionId: 'aliya',
      description: ''
    });
    setIsAddFieldOpen(true);
  };

  const handleOpenEditField = (f) => {
    setEditingField(f);
    setFieldForm({
      name: f.name,
      sectionId: f.sectionId,
      description: f.description || ''
    });
  };

  const handleSaveField = (e) => {
    e.preventDefault();
    if (!fieldForm.name.trim()) return;

    if (editingField) {
      updateField(editingField.id, fieldForm, currentUser?.username);
      setEditingField(null);
    } else {
      addField(fieldForm, currentUser?.username);
      setIsAddFieldOpen(false);
    }
  };

  // Parse CSV text for Programs
  const parsedBulkPrograms = useMemo(() => {
    if (!bulkImportText.trim()) return [];
    const lines = bulkImportText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed = [];

    const hasHeader = /program|name|category|section|field|type/i.test(lines[0]);
    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line) => {
      const parts = line.split(/[,\t;]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (!parts[0]) return;

      const name = parts[0];
      const rawSection = (parts[1] || '').toLowerCase();
      const rawField = (parts[2] || '').toLowerCase();
      const rawType = (parts[3] || '').toLowerCase();
      const rawSlots = parseInt(parts[4], 10);
      const rawMarks = parseInt(parts[5], 10);

      let sectionId = 'aliya';
      if (/tham|thameed|thamheed/i.test(rawSection)) {
        sectionId = 'thamheediyya';
      } else if (/both|all|common/i.test(rawSection)) {
        sectionId = 'both';
      } else if (/ali|aliya/i.test(rawSection)) {
        sectionId = 'aliya';
      }

      let fieldObj = fields.find(f => f.name.toLowerCase().includes(rawField) || (rawField && rawField.includes(f.name.toLowerCase())));
      if (!fieldObj) {
        fieldObj = fields[0];
      }

      const type = /group/i.test(rawType) ? 'group' : 'individual';

      parsed.push({
        name,
        sectionId,
        fieldId: fieldObj?.id || fields[0]?.id || 'f_communicative',
        fieldName: fieldObj?.name || 'General',
        type,
        defaultAllowedPerTeam: isNaN(rawSlots) || rawSlots < 1 ? 1 : rawSlots,
        maxMarks: isNaN(rawMarks) || rawMarks < 1 ? 10 : rawMarks,
        description: `Institutional catalog program for ${sectionId.toUpperCase()}`
      });
    });

    return parsed;
  }, [bulkImportText, fields]);

  const handleExecuteBulkImport = () => {
    if (parsedBulkPrograms.length === 0) return;
    bulkImportLibraryPrograms(parsedBulkPrograms, currentUser?.username || 'admin');
    setBulkImportStatus(`Successfully imported ${parsedBulkPrograms.length} programs!`);
    setTimeout(() => {
      setBulkImportStatus('');
      setIsBulkImportOpen(false);
      setBulkImportText('');
    }, 1200);
  };

  const handleCopySampleCSV = () => {
    const sample = `Program Name,Category / Section,Field Group,Type,Slots Per Team\nQuran Recitation & Tajweed,thamheediyya,Foundational,individual,1\nContemporary Islamic Research,aliya,Foundational,individual,1\nBilingual Debate Championship,aliya,Communicative,group,3\nUrdu Ghazal & Eloquence,both,Creative,individual,1\nAcademic Quiz Bowl,aliya,Foundational,group,4`;
    navigator.clipboard.writeText(sample);
    setBulkImportStatus('Sample template copied to clipboard!');
    setTimeout(() => setBulkImportStatus(''), 2500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        setBulkImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-teal-200 text-[10px] font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Institutional Catalog</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Program Library & Field Groups
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl">
            Standardized catalog of collegiate events grouped by Section (Thamheediyya &amp; Aliya) and Field (Communicative, Creative, Foundational). These act as the master template for all monthly summits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {activeTab === 'library' && (
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              title="Bulk import programs with category/section (Aliya / Thamheediyya) and fields"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Import Programs</span>
            </button>
          )}

          {activeTab === 'library' ? (
            <button
              onClick={handleOpenAddProgram}
              className="px-4 py-2.5 rounded-xl bg-white text-[#0F2A4A] hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#0E7C86]" />
              <span>Add to Library</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddField}
              className="px-4 py-2.5 rounded-xl bg-white text-[#0F2A4A] hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <FolderPlus className="w-4 h-4 text-[#0E7C86]" />
              <span>Add New Field</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'library'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#0E7C86]" />
            <span>Master Program Library ({programLibrary.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'fields'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C9A227]" />
            <span>Fields Management ({fields.length})</span>
          </button>
        </div>

        {/* Section counts summary badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] font-bold font-mono">
            Thamheediyya: {countsBySection.thamheediyya}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#C9A227] font-bold font-mono">
            Aliya: {countsBySection.aliya}
          </span>
        </div>
      </div>

      {/* VIEW 1: MASTER PROGRAM LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search library programs..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              {/* Section Filter */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Sections ({programLibrary.length})</option>
                <option value="thamheediyya">Thamheediyya ({countsBySection.thamheediyya})</option>
                <option value="aliya">Aliya ({countsBySection.aliya})</option>
              </select>

              {/* Field Filter */}
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Fields ({fields.length})</option>
                {fields.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({countsByField[f.id] || 0})</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="all">Individual &amp; Group</option>
                <option value="individual">Individual Only</option>
                <option value="group">Group Events Only</option>
              </select>
            </div>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">No programs matching criteria.</p>
                <p className="text-xs">Try adjusting your section, field, or search filter.</p>
              </div>
            ) : (
              filteredPrograms.map(prog => {
                const fieldObj = fields.find(f => f.id === prog.fieldId);
                const sectionObj = sections.find(s => s.id === prog.sectionId);

                return (
                  <div
                    key={prog.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border transition shadow-xs flex flex-col justify-between ${
                      prog.active
                        ? 'border-slate-200 dark:border-slate-800 hover:border-[#0E7C86]/50'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                            prog.sectionId === 'thamheediyya'
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-400'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-[#334E73] dark:text-blue-300'
                          }`}>
                            {prog.sectionId === 'both' ? 'Both Sections' : (sectionObj?.name?.split(' ')[0] || prog.sectionId)}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {fieldObj?.name || 'General Field'}
                          </span>
                        </div>

                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          {prog.type === 'group' ? (
                            <><Users className="w-3.5 h-3.5 text-amber-500" /> Group ({prog.defaultAllowedPerTeam} slots)</>
                          ) : (
                            <><User className="w-3.5 h-3.5 text-teal-500" /> Individual ({prog.defaultAllowedPerTeam}/team)</>
                          )}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {prog.name}
                        </h4>
                        {prog.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {prog.description}
                          </p>
                        )}
                      </div>

                      {/* Rules Note */}
                      {prog.rules && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                          <strong className="text-slate-700 dark:text-slate-300">Guidelines: </strong>
                          {prog.rules}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => toggleLibraryProgramActive(prog.id, currentUser?.username)}
                        className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                          prog.active
                            ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Toggle active status"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{prog.active ? 'Active' : 'Inactive'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateLibraryProgram(prog.id, currentUser?.username)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                          title="Duplicate Program"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditProgram(prog)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                          title="Edit Program"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProgram(prog)}
                          className="px-2 py-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 border border-rose-200/80 dark:border-rose-900/60 transition text-xs font-semibold inline-flex items-center gap-1"
                          title="Delete Permanently from Library"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: FIELDS MANAGEMENT */}
      {activeTab === 'fields' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map((f, idx) => {
              const progCount = countsByField[f.id] || 0;
              const sec = sections.find(s => s.id === f.sectionId);

              return (
                <div
                  key={f.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        {sec?.name?.split(' ')[0] || (f.sectionId === 'both' ? 'All Sections' : f.sectionId)}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#0E7C86]">
                        {progCount} Program{progCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {f.name}
                    </h4>

                    {f.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {f.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEditField(f)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingField(f)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Program Add / Edit Modal */}
      {(isAddProgramOpen || editingProgram) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddProgramOpen(false);
            setEditingProgram(null);
          }}
          title={editingProgram ? `Edit Program: ${editingProgram.name}` : 'Add New Program to Master Library'}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Program Name *
              </label>
              <input
                type="text"
                required
                value={programForm.name}
                onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Parliamentary Debate Championship"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Section *
                </label>
                <select
                  value={programForm.sectionId}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, sectionId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="thamheediyya">Thamheediyya (Class 1 &amp; 2)</option>
                  <option value="aliya">Aliya (Class 3, 4 &amp; 5)</option>
                  <option value="both">Both Sections (Open)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Field (Program Group) *
                </label>
                <select
                  value={programForm.fieldId}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, fieldId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.sectionId})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Format Type
                </label>
                <select
                  value={programForm.type}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="individual">Individual Event</option>
                  <option value="group">Group Event</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Default Allowed per Team (Slots / Group Size)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={programForm.defaultAllowedPerTeam}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, defaultAllowedPerTeam: Number(e.target.value) || 1 }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Description &amp; Syllabus
              </label>
              <textarea
                rows={2}
                value={programForm.description}
                onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Academic scope, thematic motifs, and criteria..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Rules &amp; Evaluation Guidelines
              </label>
              <textarea
                rows={2}
                value={programForm.rules}
                onChange={(e) => setProgramForm(prev => ({ ...prev, rules: e.target.value }))}
                placeholder="Time limits, materials allowed, submission format..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddProgramOpen(false);
                  setEditingProgram(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
              >
                {editingProgram ? 'Save Changes' : 'Add to Library'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Field Add / Edit Modal */}
      {(isAddFieldOpen || editingField) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddFieldOpen(false);
            setEditingField(null);
          }}
          title={editingField ? `Edit Field: ${editingField.name}` : 'Create New Program Field'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveField} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Field Name *
              </label>
              <input
                type="text"
                required
                value={fieldForm.name}
                onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Communicative, Creative, Discourse"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Belongs to Section *
              </label>
              <select
                value={fieldForm.sectionId}
                onChange={(e) => setFieldForm(prev => ({ ...prev, sectionId: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="thamheediyya">Thamheediyya (Class 1 &amp; 2)</option>
                <option value="aliya">Aliya (Class 3, 4 &amp; 5)</option>
                <option value="both">Both Sections</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={2}
                value={fieldForm.description}
                onChange={(e) => setFieldForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief summary of programs under this field..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddFieldOpen(false);
                  setEditingField(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F2A4A] text-white rounded-xl font-semibold"
              >
                {editingField ? 'Save Field' : 'Create Field'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* BULK IMPORT PROGRAMS MODAL */}
      {isBulkImportOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsBulkImportOpen(false);
            setBulkImportText('');
            setBulkImportStatus('');
          }}
          title="Bulk Import Programs (Category &amp; Fields)"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 text-teal-900 dark:text-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#0E7C86]" />
                  <span>CSV / Spreadsheet Format Guide</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySampleCSV}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Sample Template</span>
                </button>
              </div>
              <p className="text-[11px] leading-relaxed">
                Paste or upload programs with columns: <strong>Program Name, Category (Aliya / Thamheediyya / Both), Field Group, Type (individual / group), Slots Per Team</strong>.
              </p>
              <div className="font-mono text-[10px] bg-white/70 dark:bg-black/30 p-2 rounded border border-teal-200/60 overflow-x-auto whitespace-pre">
{`Program Name, Category, Field, Type, Slots
Quran Recitation & Tajweed, thamheediyya, Foundational, individual, 1
Contemporary Islamic Research, aliya, Foundational, individual, 1
Bilingual Debate Championship, aliya, Communicative, group, 3
Academic Quiz Bowl, aliya, Foundational, group, 4`}
              </div>
            </div>

            {/* File Upload or Direct Paste */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Paste CSV Lines OR Upload CSV File:
                </label>
                <label className="cursor-pointer px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 font-semibold text-[11px] flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-[#0E7C86]" />
                  <span>Upload .CSV File</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={7}
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                placeholder="Paste CSV data here... (e.g. Speech Elocution, aliya, Communicative, individual, 1)"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs focus:ring-2 focus:ring-[#0E7C86] focus:border-[#0E7C86]"
              />
            </div>

            {bulkImportStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-2 border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{bulkImportStatus}</span>
              </div>
            )}

            {/* Live Parsing Preview */}
            {parsedBulkPrograms.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Preview: {parsedBulkPrograms.length} Programs Detected
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 font-bold">
                      Aliya: {parsedBulkPrograms.filter(p => p.sectionId === 'aliya').length}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200 font-bold">
                      Thamheediyya: {parsedBulkPrograms.filter(p => p.sectionId === 'thamheediyya').length}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 font-bold">
                      Both: {parsedBulkPrograms.filter(p => p.sectionId === 'both').length}
                    </span>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-500 border-b">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Program Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Field</th>
                        <th className="py-2 px-3 text-center">Format</th>
                        <th className="py-2 px-3 text-center">Slots</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedBulkPrograms.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.sectionId === 'aliya'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : p.sectionId === 'thamheediyya'
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            }`}>
                              {p.sectionId}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-medium">{p.fieldName}</td>
                          <td className="py-2 px-3 text-center font-mono capitalize">{p.type}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold">{p.defaultAllowedPerTeam}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsBulkImportOpen(false);
                  setBulkImportText('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedBulkPrograms.length === 0}
                onClick={handleExecuteBulkImport}
                className="px-5 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] disabled:opacity-50 text-white font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Import {parsedBulkPrograms.length} Programs Now</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Program Confirm */}
      {deletingProgram && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Program Permanently from Master Library"
          message={`Are you sure you want to permanently delete "${deletingProgram.name}" from the master library? This action cannot be undone.`}
          confirmLabel="Delete Permanently"
          isDestructive={true}
          onConfirm={() => {
            deleteLibraryProgram(deletingProgram.id, currentUser?.username);
            setDeletingProgram(null);
          }}
          onClose={() => setDeletingProgram(null)}
        />
      )}

      {/* Delete Field Confirm */}
      {deletingField && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Field Group Permanently"
          message={`Are you sure you want to permanently delete the field "${deletingField.name}"?`}
          confirmLabel="Delete Permanently"
          isDestructive={true}
          onConfirm={() => {
            deleteField(deletingField.id, currentUser?.username);
            setDeletingField(null);
          }}
          onClose={() => setDeletingField(null)}
        />
      )}
    </div>
  );
};
