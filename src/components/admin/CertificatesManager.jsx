import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateCertificatePDF, bulkGenerateCertificatesPDF } from '../../utils/certificate';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Award,
  Download,
  Sparkles,
  Zap,
  Plus,
  Send,
  Edit,
  Trash2,
  CheckCircle2,
  Filter,
  Search,
  Check,
  Eye,
  GraduationCap,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';

export const CertificatesManager = () => {
  const {
    certificates,
    students,
    classes,
    teams,
    summits,
    settings,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    togglePublishCertificate,
    publishAllMonthCertificates,
    autoAllocateTopPerformerCertificates,
    formatMonthLabel
  } = useApp();
  const { currentUser } = useAuth();

  // Distinct months derived from summits or default to current / recent months
  const availableMonths = useMemo(() => {
    const set = new Set();
    summits.forEach(s => {
      const m = s.month || (s.date ? s.date.slice(0, 7) : '');
      if (m) set.add(m);
    });
    if (set.size === 0) {
      set.add('2026-11');
      set.add('2026-10');
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [summits]);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || '2026-11');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all', 'top_performer', 'class_topper', 'published', 'draft'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Modals state
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [deletingCertId, setDeletingCertId] = useState(null);

  // Allocate / Edit Form State
  const [formStudentId, setFormStudentId] = useState('');
  const [formCategory, setFormCategory] = useState('TOP_PERFORMER_MONTH');
  const [formMonth, setFormMonth] = useState(selectedMonth);
  const [formAwardTitle, setFormAwardTitle] = useState('');
  const [formCitation, setFormCitation] = useState('');
  const [formMarksPct, setFormMarksPct] = useState('95');
  const [formAttendancePct, setFormAttendancePct] = useState('100');
  const [formGrade, setFormGrade] = useState('A');
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [formIsPublished, setFormIsPublished] = useState(false);

  // Filtered Certificates
  const filteredCertificates = useMemo(() => {
    return (certificates || []).filter(c => {
      // Month Filter
      if (selectedMonth !== 'all' && c.month !== selectedMonth) return false;

      // Tab Category Filter
      if (activeTabFilter === 'top_performer' && c.category !== 'TOP_PERFORMER_MONTH') return false;
      if (activeTabFilter === 'class_topper' && c.category !== 'CLASS_TOPPER') return false;
      if (activeTabFilter === 'published' && !c.isPublished) return false;
      if (activeTabFilter === 'draft' && c.isPublished) return false;

      // Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.studentName?.toLowerCase().includes(q) ||
          c.cicNo?.toLowerCase().includes(q) ||
          c.className?.toLowerCase().includes(q) ||
          c.teamName?.toLowerCase().includes(q) ||
          c.awardTitle?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [certificates, selectedMonth, activeTabFilter, searchQuery]);

  // Statistics for the selected month
  const monthStats = useMemo(() => {
    const list = selectedMonth === 'all'
      ? (certificates || [])
      : (certificates || []).filter(c => c.month === selectedMonth);

    return {
      total: list.length,
      topMonth: list.filter(c => c.category === 'TOP_PERFORMER_MONTH').length,
      classToppers: list.filter(c => c.category === 'CLASS_TOPPER').length,
      published: list.filter(c => c.isPublished).length,
      drafts: list.filter(c => !c.isPublished).length
    };
  }, [certificates, selectedMonth]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // 1-Click Auto Allocation Handler
  const handleAutoAllocate = () => {
    if (selectedMonth === 'all') {
      triggerToast('Please select a specific month to auto-allocate.');
      return;
    }
    const count = autoAllocateTopPerformerCertificates({
      month: selectedMonth,
      topMonthCount: 3,
      classTopperCount: 1
    }, currentUser?.username || 'admin');

    triggerToast(`Auto-allocated ${count} certificates for ${formatMonthLabel(selectedMonth)}!`);
  };

  // 1-Click Publish All for Month
  const handlePublishAll = () => {
    const count = publishAllMonthCertificates(selectedMonth, currentUser?.username || 'admin');
    triggerToast(`Published ${count} certificate(s) to student dashboards!`);
  };

  // Open Edit Modal
  const openEditModal = (cert) => {
    setEditingCert(cert);
    setFormStudentId(cert.studentId);
    setFormCategory(cert.category || 'TOP_PERFORMER_MONTH');
    setFormMonth(cert.month);
    setFormAwardTitle(cert.awardTitle || '');
    setFormCitation(cert.citation || '');
    setFormMarksPct(String(cert.marksPercentage || 95));
    setFormAttendancePct(String(cert.attendancePercentage || 100));
    setFormGrade(cert.grade || 'A');
    setFormIssueDate(cert.issueDate || new Date().toISOString().slice(0, 10));
    setFormIsPublished(Boolean(cert.isPublished));
  };

  // Open Add Modal
  const openAddModal = () => {
    const defaultStudent = students[0];
    setEditingCert(null);
    setFormStudentId(defaultStudent?.id || '');
    setFormCategory('TOP_PERFORMER_MONTH');
    setFormMonth(selectedMonth !== 'all' ? selectedMonth : '2026-11');
    setFormAwardTitle('Top Performer of the Month (1st Rank)');
    setFormCitation('Conferred in recognition of exemplary academic distinction, eloquent summit presentations, and leadership.');
    setFormMarksPct('96.0');
    setFormAttendancePct('100');
    setFormGrade('A');
    setFormIssueDate(new Date().toISOString().slice(0, 10));
    setFormIsPublished(false);
    setIsAllocateOpen(true);
  };

  // Save Add or Edit Certificate Form
  const handleSaveForm = (e) => {
    e.preventDefault();
    const st = students.find(s => s.id === formStudentId);
    if (!st) return;

    const cl = classes.find(c => c.id === st.classId);
    const tm = teams.find(t => t.id === st.teamId);
    const mLabel = formatMonthLabel(formMonth);

    const payload = {
      month: formMonth,
      monthLabel: mLabel,
      studentId: st.id,
      studentName: st.name,
      cicNo: st.cicNo,
      chestNo: st.chestNo,
      classId: st.classId,
      className: cl?.name || st.classId,
      teamId: st.teamId,
      teamName: tm?.name || 'House Team',
      sectionId: st.sectionId || cl?.sectionId || 'thamheediyya',
      category: formCategory,
      awardTitle: formAwardTitle,
      citation: formCitation,
      marksPercentage: Number(formMarksPct) || 0,
      attendancePercentage: Number(formAttendancePct) || 0,
      grade: formGrade,
      issueDate: formIssueDate,
      isPublished: formIsPublished
    };

    if (editingCert) {
      updateCertificate(editingCert.id, payload, currentUser?.username || 'admin');
      triggerToast(`Updated certificate for ${st.name}`);
      setEditingCert(null);
    } else {
      addCertificate(payload, currentUser?.username || 'admin');
      triggerToast(`Allocated new certificate to ${st.name}`);
      setIsAllocateOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[11px] font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Merit Credentials &amp; Honors</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Monthly &amp; Class-wise Merit Certificates</h2>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            Certificates are strictly designated for <strong>Top Performers of the Month</strong> and <strong>Class-Wise Toppers</strong>. Allocate automatically, edit citations, and publish directly to students&apos; portals.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Custom</span>
          </button>
          <button
            onClick={() => bulkGenerateCertificatesPDF(filteredCertificates)}
            disabled={filteredCertificates.length === 0}
            className="py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Bulk PDF ({filteredCertificates.length})</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Control Bar: Month Picker & Actions */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0E7C86]" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Month:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-[#0F2A4A] dark:text-white"
          >
            <option value="all">All Months (Overview)</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons for Selected Month */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAutoAllocate}
            className="py-2 px-3.5 rounded-xl bg-[#0E7C86] hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            title="Automatically detect Top Performers and Class Toppers from month results"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Auto-Allocate for {selectedMonth === 'all' ? 'Month' : formatMonthLabel(selectedMonth)}</span>
          </button>

          <button
            onClick={handlePublishAll}
            disabled={monthStats.drafts === 0}
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            title="Publish all drafted certificates for this month to student portals"
          >
            <Send className="w-4 h-4" />
            <span>Publish All Drafts ({monthStats.drafts})</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTabFilter === 'all'
                ? 'bg-white dark:bg-[#0F1B2B] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({monthStats.total})
          </button>
          <button
            onClick={() => setActiveTabFilter('top_performer')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              activeTabFilter === 'top_performer'
                ? 'bg-white dark:bg-[#0F1B2B] text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Top Performers ({monthStats.topMonth})</span>
          </button>
          <button
            onClick={() => setActiveTabFilter('class_topper')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
              activeTabFilter === 'class_topper'
                ? 'bg-white dark:bg-[#0F1B2B] text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>Class Toppers ({monthStats.classToppers})</span>
          </button>
          <button
            onClick={() => setActiveTabFilter('published')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTabFilter === 'published'
                ? 'bg-white dark:bg-[#0F1B2B] text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Published ({monthStats.published})
          </button>
          <button
            onClick={() => setActiveTabFilter('draft')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTabFilter === 'draft'
                ? 'bg-white dark:bg-[#0F1B2B] text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Drafts ({monthStats.drafts})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search student, CIC, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Certificates Cards Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0F1B2B] rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
          <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Certificates Allocated</h4>
          <p className="text-xs max-w-md mx-auto">
            Click <strong>&quot;Auto-Allocate for Month&quot;</strong> to automatically generate merit certificates for the month&apos;s toppers, or click <strong>&quot;Allocate Custom&quot;</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map(cert => {
            const isTopMonth = cert.category === 'TOP_PERFORMER_MONTH';

            return (
              <div
                key={cert.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border-2 shadow-xs space-y-3 transition flex flex-col justify-between ${
                  cert.isPublished
                    ? isTopMonth
                      ? 'border-amber-400/50 hover:border-amber-500'
                      : 'border-blue-400/50 hover:border-blue-500'
                    : 'border-dashed border-slate-300 dark:border-slate-700 opacity-90'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Category & Publish Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isTopMonth
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                        : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                    }`}>
                      {isTopMonth ? <Sparkles className="w-3 h-3 text-amber-500" /> : <GraduationCap className="w-3 h-3 text-blue-500" />}
                      <span>{isTopMonth ? 'Top Performer (Month)' : 'Class Topper'}</span>
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      cert.isPublished
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cert.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{cert.isPublished ? 'Published' : 'Draft'}</span>
                    </span>
                  </div>

                  {/* Recipient Details */}
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {cert.studentName}
                    </h4>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5 font-medium">
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{cert.cicNo}</span>
                      <span>•</span>
                      <span>{cert.className}</span>
                      <span>•</span>
                      <span>{cert.teamName}</span>
                    </div>
                  </div>

                  {/* Award Title & Citation */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      {cert.awardTitle}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 italic">
                      &quot;{cert.citation}&quot;
                    </p>
                  </div>

                  {/* Metrics Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Month: <strong className="text-slate-800 dark:text-slate-200">{cert.monthLabel || cert.month}</strong></span>
                    <span>Score: <strong className="text-emerald-700 dark:text-emerald-400">{Number(cert.marksPercentage).toFixed(1)}%</strong> (Grade {cert.grade || 'A'})</span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cert)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                      title="Edit Certificate Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCertId(cert.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 transition"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => togglePublishCertificate(cert.id, currentUser?.username || 'admin')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        cert.isPublished
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title={cert.isPublished ? 'Unpublish certificate from student view' : 'Publish certificate to student portal'}
                    >
                      {cert.isPublished ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => generateCertificatePDF(cert)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      title="Download Official PDF Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Allocate / Edit Certificate Modal */}
      {(isAllocateOpen || editingCert) && (
        <Modal
          isOpen={Boolean(isAllocateOpen || editingCert)}
          onClose={() => {
            setIsAllocateOpen(false);
            setEditingCert(null);
          }}
          title={editingCert ? `Edit Certificate: ${editingCert.studentName}` : 'Allocate Merit Certificate'}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
            {/* Student Selector */}
            <div>
              <label className="block font-semibold mb-1">Recipient Student</label>
              <select
                required
                value={formStudentId}
                onChange={(e) => setFormStudentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {students.map(s => {
                  const cl = classes.find(c => c.id === s.classId);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.cicNo}) • {cl?.name || s.classId}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block font-semibold mb-1">Honor Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="TOP_PERFORMER_MONTH">🌟 Top Performer of the Month</option>
                  <option value="CLASS_TOPPER">🎓 Class-Wise Topper</option>
                </select>
              </div>

              {/* Target Month */}
              <div>
                <label className="block font-semibold mb-1">Academic Month</label>
                <select
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{formatMonthLabel(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Award Title */}
            <div>
              <label className="block font-semibold mb-1">Award Title</label>
              <input
                type="text"
                required
                value={formAwardTitle}
                onChange={(e) => setFormAwardTitle(e.target.value)}
                placeholder="e.g. Top Performer of the Month (1st Rank - Overall)"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            {/* Citation Text */}
            <div>
              <label className="block font-semibold mb-1">Citation / Commendation Text</label>
              <textarea
                rows={3}
                required
                value={formCitation}
                onChange={(e) => setFormCitation(e.target.value)}
                placeholder="Official citation printed on the certificate..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block font-semibold mb-1">Score %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formMarksPct}
                  onChange={(e) => setFormMarksPct(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Attendance %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formAttendancePct}
                  onChange={(e) => setFormAttendancePct(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Grade</label>
                <select
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold font-mono"
                >
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>
            </div>

            {/* Issue Date & Published Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold mb-1">Issue Date</label>
                <input
                  type="date"
                  value={formIssueDate}
                  onChange={(e) => setFormIssueDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-5">
                <input
                  type="checkbox"
                  id="certPublishedToggle"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="certPublishedToggle" className="font-semibold cursor-pointer text-slate-800 dark:text-slate-200">
                  Publish to Student Portal Immediately
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-4 transition shadow-xs"
            >
              {editingCert ? 'Save & Update Certificate' : 'Allocate Certificate'}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCertId)}
        onClose={() => setDeletingCertId(null)}
        onConfirm={() => {
          if (deletingCertId) {
            deleteCertificate(deletingCertId, currentUser?.username || 'admin');
            setDeletingCertId(null);
            triggerToast('Certificate removed.');
          }
        }}
        title="Remove Certificate"
        message="Are you sure you want to delete this certificate allocation? The student will no longer see it."
      />
    </div>
  );
};
