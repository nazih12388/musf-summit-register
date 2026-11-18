import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Sparkles,
  CalendarDays,
  Users,
  BookOpen
} from 'lucide-react';
import { formatMonthLabel, getSummitRunningInfo } from '../../utils/reportCalculations';

export const SummitManagement = () => {
  const {
    summits,
    programs,
    entries,
    addSummit,
    bulkCreateWeeklySummits,
    bulkCreateAcademicYearSummits,
    updateSummit,
    deleteSummit,
    toggleSummitRegistrationLock
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [is12MonthOpen, setIs12MonthOpen] = useState(false);
  const [editingSummit, setEditingSummit] = useState(null);
  const [deletingSummitId, setDeletingSummitId] = useState(null);

  // Month filter for Month Overview Screen
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');

  // Single Form states
  const [name, setName] = useState('');
  const [month, setMonth] = useState('2026-12');
  const [date, setDate] = useState('2026-12-04');
  const [venue, setVenue] = useState('Wafy Central Auditorium');
  const [status, setStatus] = useState('open');

  // Bulk Form states (Single Month)
  const [bulkMonth, setBulkMonth] = useState('2026-12');
  const [bulkDayOfWeek, setBulkDayOfWeek] = useState(5); // 5 = Friday
  const [bulkVenue, setBulkVenue] = useState('Wafy Central Auditorium');
  const [bulkBaseTitle, setBulkBaseTitle] = useState('Weekly Academic Summit');

  // 12-Month Academic Year States
  const [academicStartYear, setAcademicStartYear] = useState(2026);
  const [academicStartMonth, setAcademicStartMonth] = useState(6); // 6 = June
  const [academicVenue, setAcademicVenue] = useState('Wafy Central Auditorium');
  const [academicDayOfWeek, setAcademicDayOfWeek] = useState(5);
  const [academicBaseTitle, setAcademicBaseTitle] = useState('Weekly Academic Gathering');

  // Distinct available months
  const availableMonths = useMemo(() => {
    const set = new Set();
    summits.forEach(s => {
      const m = s.month || (s.date ? s.date.slice(0, 7) : '');
      if (m) set.add(m);
    });
    return Array.from(set).sort();
  }, [summits]);

  // Filtered summits sorted by date
  const filteredSummits = useMemo(() => {
    return summits
      .filter(s => {
        if (selectedMonthFilter === 'all') return true;
        const m = s.month || (s.date ? s.date.slice(0, 7) : '');
        return m === selectedMonthFilter;
      })
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [summits, selectedMonthFilter]);

  // Preview dates for Bulk creation
  const bulkPreviewDates = useMemo(() => {
    if (!bulkMonth) return [];
    const [yearStr, monthStr] = bulkMonth.split('-');
    const year = parseInt(yearStr, 10);
    const mIndex = parseInt(monthStr, 10) - 1;

    const dates = [];
    const d = new Date(year, mIndex, 1);
    while (d.getMonth() === mIndex) {
      if (d.getDay() === Number(bulkDayOfWeek)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [bulkMonth, bulkDayOfWeek]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addSummit({ name, month, date, venue, status }, currentUser?.username);
    setIsAddOpen(false);
    setName('');
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    bulkCreateWeeklySummits({
      month: bulkMonth,
      dayOfWeek: Number(bulkDayOfWeek),
      venue: bulkVenue,
      baseTitle: bulkBaseTitle
    }, currentUser?.username);
    setIsBulkOpen(false);
    setSelectedMonthFilter(bulkMonth);
  };

  const handle12MonthSubmit = (e) => {
    e.preventDefault();
    bulkCreateAcademicYearSummits({
      startYear: Number(academicStartYear),
      startMonth: Number(academicStartMonth),
      dayOfWeek: Number(academicDayOfWeek),
      venue: academicVenue,
      baseTitle: academicBaseTitle
    }, currentUser?.username);
    setIs12MonthOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingSummit) return;
    updateSummit(editingSummit.id, editingSummit, currentUser?.username);
    setEditingSummit(null);
  };

  // Month summary metrics for active filter
  const monthMetrics = useMemo(() => {
    if (selectedMonthFilter === 'all') {
      const totalPrograms = programs.length;
      const totalParticipants = entries.length;
      return { totalSummits: summits.length, totalPrograms, totalParticipants };
    }
    const monthSummits = summits.filter(s => (s.month || s.date?.slice(0, 7)) === selectedMonthFilter);
    const mSummitIds = new Set(monthSummits.map(s => s.id));
    const mPrograms = programs.filter(p => mSummitIds.has(p.summitId));
    const mEntries = entries.filter(e => mPrograms.some(p => p.id === e.programId));
    return {
      totalSummits: monthSummits.length,
      totalPrograms: mPrograms.length,
      totalParticipants: mEntries.length
    };
  }, [summits, programs, entries, selectedMonthFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] font-mono text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Summit Scheduling</span>
          </div>
          <h3 className="text-xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <span>Weekly Summits &amp; Month Overview</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-normal">
              {summits.length} Gatherings Total
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Summits are held every week and automatically assigned a running number (Summit 1 to 5) per month. Manage dates, participant limits, registration locks, and 3-session checkpoints (Start/Mid/End).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setIs12MonthOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center gap-1.5 transition border border-purple-200 dark:border-purple-800"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>12-Month Academic Schedule</span>
          </button>

          <button
            onClick={() => setIsBulkOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-[#0E7C86] font-semibold text-xs flex items-center gap-1.5 transition border border-teal-200 dark:border-teal-800"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bulk Weekly Create</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] dark:bg-[#0E7C86] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Summit</span>
          </button>
        </div>
      </div>

      {/* Month Overview Screen Selector Tabs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            <span className="font-bold text-slate-500 shrink-0">Month Overview:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-xs"
            >
              <option value="all">All Gatherings ({summits.length})</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)} ({summits.filter(s => (s.month || s.date?.slice(0, 7)) === m).length} summits)
                </option>
              ))}
            </select>
            <button
              onClick={() => setSelectedMonthFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                selectedMonthFilter === 'all'
                  ? 'bg-[#0F2A4A] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All ({summits.length})
            </button>
            {availableMonths.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonthFilter(m)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  selectedMonthFilter === m
                    ? 'bg-[#0E7C86] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {formatMonthLabel(m)} ({summits.filter(s => (s.month || s.date?.slice(0, 7)) === m).length})
              </button>
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 text-slate-600 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-[#0E7C86]" />
              {monthMetrics.totalSummits} Summits
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              {monthMetrics.totalPrograms} Programs
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              {monthMetrics.totalParticipants} Participants
            </span>
          </div>
        </div>
      </div>

      {/* Summits Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSummits.map(summit => {
          const summitPrograms = programs.filter(p => p.summitId === summit.id);
          const summitEntries = entries.filter(e => summitPrograms.some(p => p.id === e.programId));
          const runningInfo = getSummitRunningInfo(summit, summits);

          // Status badge styling
          const isLocked = Boolean(summit.registrationLocked);
          const statusText = summit.status || 'open';

          return (
            <div
              key={summit.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                {/* Header: Running Tag & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg font-mono font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-[#0F2A4A] dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      Summit {runningInfo.runningNumber}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      statusText === 'published'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : statusText === 'completed'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {statusText}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      isLocked
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                      <span>{isLocked ? 'Locked' : 'Open'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      title={isLocked ? "Unlock Registration" : "Lock Registration"}
                      onClick={() => toggleSummitRegistrationLock(summit.id, currentUser?.username)}
                      className={`p-1.5 rounded-lg border transition ${
                        isLocked
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60'
                          : 'border-teal-200 text-[#0E7C86] hover:bg-teal-50 dark:border-teal-900/60'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setEditingSummit({ ...summit })}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Edit Summit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingSummitId(summit.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600"
                      title="Delete Summit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Summit Title */}
                <div>
                  <div className="text-[11px] font-semibold text-[#0E7C86] dark:text-teal-400">
                    {runningInfo.label}
                  </div>
                  <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white leading-snug">
                    {summit.name}
                  </h4>
                </div>

                {/* Details */}
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span><strong>Date:</strong> {summit.date} ({new Date(summit.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long' })})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span><strong>Venue:</strong> {summit.venue}</span>
                  </div>
                  {summit.registrationDeadline && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>Deadline:</strong> {new Date(summit.registrationDeadline).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Metrics */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-[#0F2A4A] dark:text-slate-200">
                  {summitPrograms.length} Programs &bull; {summitEntries.length} Nominees
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  3 Sessions (S/M/E)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Single Summit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Weekly Summit" maxWidth="max-w-md">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Summit Title (Optional - auto-named if blank)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. December 2026 - Summit 1: Discourse & Rhetoric"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If left blank, the system will automatically assign running title "{formatMonthLabel(month)} - Summit X".
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Month (YYYY-MM)</label>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (e.target.value) setMonth(e.target.value.slice(0, 7));
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Venue</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Wafy Central Auditorium"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="open">Registration Open</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold rounded-xl mt-3 shadow-xs"
          >
            Create Summit Gathering
          </button>
        </form>
      </Modal>

      {/* Bulk Create Weekly Summits Modal */}
      <Modal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Bulk Create Weekly Summits for Month" maxWidth="max-w-lg">
        <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-[#0E7C86] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Automated Weekly Date Calculation</span>
            </p>
            <p className="text-[11px]">
              Select a month and recurring day. The system will calculate every recurring date (4 or 5 summits) and create Summit 1 through Summit 4/5 automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Month (YYYY-MM)</label>
              <input
                type="month"
                required
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Weekly Day</label>
              <select
                value={bulkDayOfWeek}
                onChange={(e) => setBulkDayOfWeek(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value={5}>Every Friday (Standard)</option>
                <option value={6}>Every Saturday</option>
                <option value={0}>Every Sunday</option>
                <option value={1}>Every Monday</option>
                <option value={2}>Every Tuesday</option>
                <option value={3}>Every Wednesday</option>
                <option value={4}>Every Thursday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Venue</label>
            <input
              type="text"
              required
              value={bulkVenue}
              onChange={(e) => setBulkVenue(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Theme / Base Title (Optional)</label>
            <input
              type="text"
              value={bulkBaseTitle}
              onChange={(e) => setBulkBaseTitle(e.target.value)}
              placeholder="e.g. Research &amp; Academic Colloquium"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          {/* Date Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Generated Weekly Schedule ({bulkPreviewDates.length} Summits):
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              {bulkPreviewDates.map((dStr, idx) => (
                <div key={dStr} className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-[#0E7C86]">
                    Summit {idx + 1}: {dStr}
                  </span>
                  <span className="text-slate-500">
                    {formatMonthLabel(bulkMonth)} - Summit {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={bulkPreviewDates.length === 0}
            className="w-full py-2.5 bg-[#0E7C86] hover:bg-[#0B6770] text-white font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
          >
            Create All {bulkPreviewDates.length} Weekly Summits
          </button>
        </form>
      </Modal>

      {/* Edit Summit Modal */}
      {editingSummit && (
        <Modal isOpen={Boolean(editingSummit)} onClose={() => setEditingSummit(null)} title="Edit Summit Details" maxWidth="max-w-md">
          <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Summit Title</label>
              <input
                type="text"
                required
                value={editingSummit.name}
                onChange={(e) => setEditingSummit(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Month (YYYY-MM)</label>
                <input
                  type="month"
                  required
                  value={editingSummit.month}
                  onChange={(e) => setEditingSummit(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={editingSummit.date}
                  onChange={(e) => setEditingSummit(prev => ({ ...prev, date: e.target.value, month: e.target.value.slice(0, 7) }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Venue</label>
              <input
                type="text"
                required
                value={editingSummit.venue}
                onChange={(e) => setEditingSummit(prev => ({ ...prev, venue: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                value={editingSummit.status}
                onChange={(e) => setEditingSummit(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="open">Registration Open</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Registration Lock</label>
              <select
                value={editingSummit.registrationLocked ? 'locked' : 'unlocked'}
                onChange={(e) => setEditingSummit(prev => ({ ...prev, registrationLocked: e.target.value === 'locked' }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="unlocked">Registration Unlocked (Leaders can nominate)</option>
                <option value="locked">Registration Locked (Finalized)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold rounded-xl mt-3 shadow-xs"
            >
              Update Summit
            </button>
          </form>
        </Modal>
      )}

      {/* 12-Month Academic Year Schedule Modal */}
      {is12MonthOpen && (
        <Modal isOpen={true} onClose={() => setIs12MonthOpen(false)} title="Generate 12-Month Academic Year (48 Summits)" maxWidth="max-w-md">
          <form onSubmit={handle12MonthSubmit} className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Generates a full 12-month calendar schedule with <strong>4 weekly summits per month</strong> (48 total gatherings), automatically numbered Summit 1 through Summit 4 inside each month.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Academic Start Year</label>
                <input
                  type="number"
                  min="2025"
                  max="2035"
                  value={academicStartYear}
                  onChange={(e) => setAcademicStartYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Starting Month</label>
                <select
                  value={academicStartMonth}
                  onChange={(e) => setAcademicStartMonth(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="6">June (Wafy Academic Term)</option>
                  <option value="1">January (Calendar Year)</option>
                  <option value="10">October</option>
                  <option value="7">July</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Day of Week</label>
                <select
                  value={academicDayOfWeek}
                  onChange={(e) => setAcademicDayOfWeek(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="5">Every Friday</option>
                  <option value="6">Every Saturday</option>
                  <option value="0">Every Sunday</option>
                  <option value="4">Every Thursday</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Default Venue</label>
                <input
                  type="text"
                  required
                  value={academicVenue}
                  onChange={(e) => setAcademicVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Theme / Base Title (Optional)</label>
              <input
                type="text"
                value={academicBaseTitle}
                onChange={(e) => setAcademicBaseTitle(e.target.value)}
                placeholder="Weekly Academic Summit"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold rounded-xl shadow-xs transition hover:bg-[#1E3A5F]"
            >
              Generate 48 Weekly Summits (12 Months)
            </button>
          </form>
        </Modal>
      )}

      {/* Enhanced Delete / Remove Summit Dialog */}
      {deletingSummitId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingSummitId(null)}
          title="Remove or Cancel Weekly Summit"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Is this weekly summit not taking place (e.g. vacation week, exams, or cancelled)?
              Choose an action below:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  deleteSummit(deletingSummitId, currentUser?.username);
                  setDeletingSummitId(null);
                }}
                className="w-full p-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-left font-semibold flex items-center justify-between transition"
              >
                <div>
                  <div className="font-bold">Remove Summit Completely</div>
                  <div className="text-[10px] text-slate-500 font-normal">Permanently remove this gathering from the month schedule.</div>
                </div>
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  updateSummit(deletingSummitId, { status: 'cancelled' }, currentUser?.username);
                  setDeletingSummitId(null);
                }}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-left font-semibold flex items-center justify-between transition"
              >
                <div>
                  <div className="font-bold">Mark as Cancelled / No Summit (Holiday/Exams)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Keep the gathering on record marked as skipped/cancelled.</div>
                </div>
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeletingSummitId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
