import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StudentManagement } from './StudentManagement';
import { NoticesManagement } from './NoticesManagement';
import { SettingsAuditLog } from './SettingsAuditLog';
import { UnionWingsManager } from './UnionWingsManager';
import { UnionOfficialsManager } from './UnionOfficialsManager';
import { SummitRegisterModule } from './SummitRegisterModule';
import { SportsWingManager } from '../sports/SportsWingManager';
import { OfficialMalayalamReportModal } from '../reports/OfficialMalayalamReportModal';
import { ClassWiseActivityReportModal } from '../reports/ClassWiseActivityReportModal';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import {
  Users,
  Calendar,
  Layers,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileCheck,
  Bell,
  BookOpen,
  Building,
  Crown,
  Folder,
  Palette,
  Lock,
  FileText,
  ChevronRight,
  Plus,
  UserPlus,
  FolderPlus,
  Edit2,
  Trash2,
  MapPin,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Printer,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { PostNotificationModal } from '../common/PostNotificationModal';
import { BannerSlideManagerModal } from '../common/BannerSlideManagerModal';
import { OverlapCard } from '../student/ui/OverlapCard';
import { IconTile } from '../student/ui/IconTile';

const WING_ICON_MAP = {
  Palette,
  BookOpen,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Folder
};

// Utilities for formatting
export const formatProgramTitle = (title) => {
  if (!title || !title.trim() || ['ty', 'test', 'asdf', 'abc', 'xyz'].includes(title.trim().toLowerCase())) {
    return 'Untitled program';
  }
  return title.trim();
};

export const formatProgramDate = (dateStr) => {
  if (!dateStr) return 'Date to be announced';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const {
    students = [],
    wings = [],
    wingPrograms = [],
    programs = [],
    auditLogs = [],
    addWingProgram,
    updateWingProgram,
    deleteWingProgram,
    unionOfficials = [],
    settings = {},
    banners = [],
    addBanner,
    deleteBanner
  } = useApp();
  const { t, lang, tr } = useLanguage();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPostNotifOpen, setIsPostNotifOpen] = useState(false);
  const [isClassReportModalOpen, setIsClassReportModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Auto-open modal on first navigating to reports tab
  useEffect(() => {
    if (activeTab === 'reports') {
      setIsReportModalOpen(true);
    }
  }, [activeTab]);
  const [meetingFilterWing, setMeetingFilterWing] = useState('all');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    wingId: wings[0]?.id || 'fine_arts',
    date: new Date().toISOString().split('T')[0],
    time: '04:30 PM',
    venue: 'Union Council Chamber',
    attendeesText: '',
    agenda: '',
    decisions: '',
    isConfidential: true
  });

  // Accurate Union Metrics
  const totalStudents = students.length;
  const thamheediyyaCount = students.filter(s => s?.sectionId === 'thamheediyya').length;
  const aliyaCount = students.filter(s => s?.sectionId === 'aliya').length;
  const totalWings = wings.length;

  const allActivities = useMemo(() => (wingPrograms || []).filter(p => p.type !== 'meeting'), [wingPrograms]);
  const allMeetings = useMemo(() => (wingPrograms || []).filter(p => p.type === 'meeting'), [wingPrograms]);

  // Upcoming Union Programs sorted by date
  const upcomingPrograms = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allActivities
      .filter(p => p.date >= today || p.status === 'upcoming')
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [allActivities]);

  const nextProgram = upcomingPrograms[0] || allActivities[0] || null;
  const nextWing = useMemo(() => wings.find(w => w.id === nextProgram?.wingId), [wings, nextProgram]);

  // Programs this month
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const thisMonthPrograms = useMemo(() => {
    return allActivities.filter(p => p.date && p.date.startsWith(currentMonthStr));
  }, [allActivities, currentMonthStr]);

  // "Needs attention" list queries
  const unpublishedResultsCount = useMemo(() => {
    return (programs || []).filter(p => p.status === 'draft' || p.status === 'completed_unreleased').length;
  }, [programs]);

  const compWithoutResultsCount = useMemo(() => {
    return (wingPrograms || []).filter(p => p.type === 'competition' && p.status === 'completed' && (!p.winners || !p.winners.firstPlace)).length;
  }, [wingPrograms]);

  const wingsWithoutMembers = useMemo(() => {
    return wings.filter(w => (unionOfficials || []).filter(o => o.assignedWingId === w.id).length === 0);
  }, [wings, unionOfficials]);

  const needsAttentionItems = useMemo(() => {
    const list = [];
    if (unpublishedResultsCount > 0) {
      list.push({
        id: 'unpub',
        title: 'Unpublished competition results',
        detail: `${unpublishedResultsCount} programs have draft or unreleased evaluations.`,
        count: `${unpublishedResultsCount} pending`,
        targetTab: 'wings'
      });
    }
    if (compWithoutResultsCount > 0) {
      list.push({
        id: 'no_results',
        title: 'Completed competitions without recorded winners',
        detail: `${compWithoutResultsCount} finished events are awaiting prize documentation.`,
        count: `${compWithoutResultsCount} pending`,
        targetTab: 'wings'
      });
    }
    if (wingsWithoutMembers.length > 0) {
      list.push({
        id: 'vacant_wings',
        title: 'Union wings with no appointed conveners',
        detail: `${wingsWithoutMembers.map(w => w.name).join(', ')} currently have vacant leadership.`,
        count: `${wingsWithoutMembers.length} vacant`,
        targetTab: 'officials'
      });
    }
    return list;
  }, [unpublishedResultsCount, compWithoutResultsCount, wingsWithoutMembers]);

  // Handlers for Meetings
  const handleOpenAddMeeting = () => {
    setEditingMeeting(null);
    setMeetingFormData({
      title: tr('Official Union Council Meeting', 'യൂണിയൻ കൗൺസിൽ ഔദ്യോഗിക യോഗം'),
      wingId: meetingFilterWing !== 'all' ? meetingFilterWing : (wings[0]?.id || 'fine_arts'),
      date: new Date().toISOString().split('T')[0],
      time: '04:30 PM',
      venue: tr('Union Council Chamber', 'യൂണിയൻ ഓഫീസ്'),
      attendeesText: tr('Union Chairman, General Secretary, Wing Conveners', 'യൂണിയൻ ചെയർമാൻ, ജനറൽ സെക്രട്ടറി, വിംഗ് കൺവീനർമാർ'),
      agenda: '',
      decisions: '',
      isConfidential: true
    });
    setIsMeetingModalOpen(true);
  };

  const handleOpenEditMeeting = (m) => {
    setEditingMeeting(m);
    setMeetingFormData({
      title: m.title || '',
      wingId: m.wingId || wings[0]?.id,
      date: m.date || new Date().toISOString().split('T')[0],
      time: m.time || '04:30 PM',
      venue: m.venue || '',
      attendeesText: Array.isArray(m.attendees) ? m.attendees.join(', ') : (m.attendeesText || ''),
      agenda: m.agenda || '',
      decisions: m.decisions || '',
      isConfidential: true
    });
    setIsMeetingModalOpen(true);
  };

  const handleSaveMeeting = (e) => {
    e.preventDefault();
    if (!meetingFormData.title.trim()) return;

    const attendeesArray = meetingFormData.attendeesText
      ? meetingFormData.attendeesText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...meetingFormData,
      type: 'meeting',
      isConfidential: true,
      attendees: attendeesArray
    };

    if (editingMeeting) {
      updateWingProgram(editingMeeting.id, {
        ...payload,
        updatedBy: currentUser?.username || 'admin'
      });
    } else {
      addWingProgram({
        ...payload,
        createdBy: currentUser?.username || 'admin'
      });
    }
    setIsMeetingModalOpen(false);
  };

  const handleDeleteMeeting = (id) => {
    if (window.confirm('Are you sure you want to delete this meeting record?')) {
      deleteWingProgram(id, currentUser?.username || 'admin');
    }
  };

  const filteredMeetings = meetingFilterWing === 'all'
    ? allMeetings
    : allMeetings.filter(m => m.wingId === meetingFilterWing);

  const adminDisplayName = currentUser?.name || 'MUSF Admin';

  return (
    <div className="space-y-6">
      {/* =========================================================================
          UNION HOME DASHBOARD (When activeTab === 'dashboard')
         ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 1. SOLID ACCENT CENTRAL ADMIN HERO (Student Design System) */}
          <div className="bg-[#0F2A4A] dark:bg-[#07131F] text-white pt-6 pb-12 px-4 sm:px-6 rounded-b-[24px] shadow-sm">
            <div className="max-w-7xl mx-auto space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 text-xs font-bold text-teal-300 uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-teal-300" />
                  <span>Central Administration Console</span>
                </span>

                <span className="text-xs text-slate-300 font-medium">
                  Academic Year {settings.academicYear || '2026–2027'}
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome back, {adminDisplayName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Majlis Umariyya Students' Federation (MUSF) &bull; Apex Union Management
                </p>
              </div>
            </div>
          </div>

          {/* 2. OVERLAPPING ADMIN QUICK ACTIONS GRID (8 IconTiles) */}
          <OverlapCard>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
              <IconTile
                icon={Megaphone}
                label={tr('Notice', 'അറിയിപ്പ്')}
                iconColor="#EC4899"
                bgColor="#EC489915"
                animationType="ring"
                onClick={() => setIsPostNotifOpen(true)}
                index={0}
              />
              <IconTile
                icon={Sparkles}
                label={tr('Posters', 'പോസ്റ്ററുകൾ')}
                iconColor="#8B5CF6"
                bgColor="#8B5CF615"
                animationType="bounce"
                badge={banners.length}
                onClick={() => setIsBannerModalOpen(true)}
                index={1}
              />
              <IconTile
                icon={FileText}
                label={tr('Report', 'റിപ്പോർട്ട്')}
                iconColor="#F97316"
                bgColor="#F9731615"
                animationType="bounce"
                onClick={() => setIsReportModalOpen(true)}
                index={2}
              />
              <IconTile
                icon={Folder}
                label={tr('Wings', 'വിംഗുകൾ')}
                iconColor="#0E7C86"
                bgColor="#0E7C8615"
                animationType="pulse"
                badge={wings.length}
                onClick={() => setActiveTab('wings')}
                index={3}
              />
              <IconTile
                icon={Layers}
                label={tr('Programs', 'പരിപാടികൾ')}
                iconColor="#6366F1"
                bgColor="#6366F115"
                animationType="flip"
                onClick={() => setActiveTab('programs')}
                index={4}
              />
              <IconTile
                icon={Users}
                label={tr('Students', 'വിദ്യാർത്ഥികൾ')}
                iconColor="#10B981"
                bgColor="#10B98115"
                animationType="pulse"
                badge={students.length}
                onClick={() => setActiveTab('students')}
                index={5}
              />
              <IconTile
                icon={Crown}
                label={tr('Officials', 'ഭാരവാഹികൾ')}
                iconColor="#F59E0B"
                bgColor="#F59E0B15"
                animationType="bounce"
                badge={unionOfficials.length}
                onClick={() => setActiveTab('officials')}
                index={6}
              />
              <IconTile
                icon={BookOpen}
                label={tr('Reports', 'റിപ്പോർട്ടുകൾ')}
                iconColor="#06B6D4"
                bgColor="#06B6D415"
                animationType="tilt"
                onClick={() => setActiveTab('reports')}
                index={7}
              />
            </div>
          </OverlapCard>

          <div className="px-4 sm:px-6 space-y-6">
            {/* 2. "NEEDS ATTENTION" LIST WITH VIBRANT AMBER HIGHLIGHT */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
                <span>Needs attention</span>
              </h2>
              {needsAttentionItems.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                  {needsAttentionItems.length} pending
                </span>
              )}
            </div>

            {needsAttentionItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-1 font-medium">
                All union operations, results, and wings are up to date.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {needsAttentionItems.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {item.detail}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                        {item.count}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab(item.targetTab)}
                        className="text-[#0E7C86] dark:text-teal-400 font-bold hover:underline text-xs"
                      >
                        Resolve &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. CONSOLIDATED UNIFIED STAT BADGE CONTAINER (Small Crisp Icons & Micro-Animations) */}
          <div className="animate-bottom-up rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0F1B2B]/95 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80 gap-y-3 sm:gap-y-0">
              {/* 1. Total Students */}
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Users className="w-4 h-4 text-indigo-500 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {totalStudents}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('Total students', 'വിദ്യാർത്ഥികൾ')}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate leading-none mt-1">
                  {thamheediyyaCount} Thamh &bull; {aliyaCount} Aliya
                </span>
              </button>

              {/* 2. Active Wings */}
              <button
                type="button"
                onClick={() => setActiveTab('wings')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Folder className="w-4 h-4 text-[#0E7C86] dark:text-teal-400 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {totalWings}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('Active wings', 'യൂണിയൻ വിംഗുകൾ')}
                </span>
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 block truncate leading-none mt-1">
                  {unionOfficials.length} {tr('conveners', 'കൺവീനർമാർ')}
                </span>
              </button>

              {/* 3. Programs this month */}
              <button
                type="button"
                onClick={() => setActiveTab('wings')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center pt-3 sm:pt-2.5"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Calendar className="w-4 h-4 text-amber-500 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {thisMonthPrograms.length}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('This month', 'ഈ മാസം')}
                </span>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block truncate leading-none mt-1">
                  {upcomingPrograms.length} {tr('upcoming', 'വരാനിരിക്കുന്നവ')}
                </span>
              </button>

              {/* 4. Next upcoming program */}
              <button
                type="button"
                onClick={() => setActiveTab('wings')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center pt-3 sm:pt-2.5"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Clock className="w-4 h-4 text-purple-500 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {upcomingPrograms.length}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('Upcoming programs', 'അടുത്ത പരിപാടികൾ')}
                </span>
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block truncate leading-none mt-1 max-w-[130px]">
                  {nextProgram ? formatProgramTitle(nextProgram.title).slice(0, 18) : tr('None scheduled', 'തീരുമാനിച്ചിട്ടില്ല')}
                </span>
              </button>
            </div>
          </div>

          {/* 4. VIBRANT QUICK ACTIONS */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
            <h2 className="text-sm font-bold text-[#0F2A4A] dark:text-white">
              Quick actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-gradient-to-br from-white to-indigo-50/30 dark:from-[#111B2B] dark:to-indigo-950/20 text-left text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3 transition hover:shadow-md hover:-translate-y-0.5 active:scale-97 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Add student</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wings')}
                className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 bg-gradient-to-br from-white to-teal-50/30 dark:from-[#111B2B] dark:to-teal-950/20 text-left text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3 transition hover:shadow-md hover:-translate-y-0.5 active:scale-97 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <span>Add wing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('officials')}
                className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 bg-gradient-to-br from-white to-amber-50/30 dark:from-[#111B2B] dark:to-amber-950/20 text-left text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3 transition hover:shadow-md hover:-translate-y-0.5 active:scale-97 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                  <Crown className="w-4 h-4" />
                </div>
                <span>Appoint official</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wings')}
                className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-gradient-to-br from-white to-purple-50/30 dark:from-[#111B2B] dark:to-purple-950/20 text-left text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3 transition hover:shadow-md hover:-translate-y-0.5 active:scale-97 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add program</span>
              </button>
            </div>
          </div>

          {/* 5. RECENT ACTIVITY & UPCOMING PROGRAMS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Activities */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-[#0F2A4A] dark:text-white">
                  Recent activities
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('wings')}
                  className="text-xs text-[#0E7C86] font-medium hover:underline"
                >
                  View all &rarr;
                </button>
              </div>

              {allActivities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activities recorded.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allActivities.slice(0, 5).map(prog => {
                    const wing = wings.find(w => w.id === prog.wingId);
                    return (
                      <div key={prog.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {formatProgramTitle(prog.title)}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {formatProgramDate(prog.date)} &bull; {wing?.name || 'Union'}
                          </p>
                        </div>
                        <StatusBadge
                          status={prog.status === 'completed' ? 'completed' : 'scheduled'}
                          label={prog.status === 'completed' ? 'Completed' : 'Upcoming'}
                          className="shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Audit Log */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-[#0F2A4A] dark:text-white">
                  System activity log
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="text-xs text-[#0E7C86] font-medium hover:underline"
                >
                  View full log &rarr;
                </button>
              </div>

              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent administrative logs.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.slice(0, 5).map((log, idx) => (
                    <div key={log.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {log.action || log.description || 'Administrative Action'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {log.details || log.actor || 'admin'}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                        {log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recent'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE: MEETINGS & RESOLUTIONS (When activeTab === 'meetings')
         ========================================================================= */}
      {activeTab === 'meetings' && (
        <div className="space-y-5">
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#0F2A4A] dark:text-white">
                Council meetings and resolutions
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Official minutes and executive decisions recorded across union wings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddMeeting}
              className="px-4 py-2 rounded-lg bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Record meeting</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setMeetingFilterWing('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                meetingFilterWing === 'all'
                  ? 'bg-[#0F2A4A] text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All meetings ({allMeetings.length})
            </button>
            {wings.map(w => {
              const count = allMeetings.filter(m => m.wingId === w.id).length;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setMeetingFilterWing(w.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                    meetingFilterWing === w.id
                      ? 'bg-[#0F2A4A] text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {w.shortName || w.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Meetings List */}
          <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMeetings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No meeting records found for the selected filter.
              </div>
            ) : (
              filteredMeetings.map(m => {
                const wing = wings.find(w => w.id === m.wingId);
                return (
                  <div key={m.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{wing?.name || 'Union Council'}</span>
                        <span>&bull;</span>
                        <span>{formatProgramDate(m.date)}</span>
                        {m.venue && (
                          <>
                            <span>&bull;</span>
                            <span>{m.venue}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-[#0F2A4A] dark:text-white">
                        {m.title}
                      </h3>
                      {m.decisions && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 line-clamp-2">
                          <strong>Resolutions:</strong> {m.decisions}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => handleOpenEditMeeting(m)}
                        className="p-1.5 text-slate-400 hover:text-[#0E7C86] rounded"
                        title="Edit meeting"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMeeting(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE: UNION WINGS
         ========================================================================= */}
      {activeTab === 'wings' && (
        <UnionWingsManager
          onOpenSummitModule={() => setActiveTab('summit_register')}
          onOpenSportsModule={() => setActiveTab('college_sports')}
        />
      )}

      {/* =========================================================================
          MODULE: COLLEGE SPORTS (Under Sports Wing)
         ========================================================================= */}
      {activeTab === 'college_sports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('wings')}
              className="text-xs font-bold text-[#0E7C86] hover:underline flex items-center gap-1 cursor-pointer"
            >
              &larr; Back to Union Wings
            </button>
          </div>
          <SportsWingManager
            onOpenCertificateModal={() => {}}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenPostNotice={() => setIsPostNotifOpen(true)}
          />
        </div>
      )}

      {/* =========================================================================
          SUB-MODULE: SUMMIT REGISTER (Under Fine Arts Wing)
         ========================================================================= */}
      {activeTab === 'summit_register' && (
        <SummitRegisterModule onBack={() => setActiveTab('wings')} />
      )}

      {/* =========================================================================
          MODULE: UNION OFFICIALS
         ========================================================================= */}
      {activeTab === 'officials' && <UnionOfficialsManager />}

      {/* =========================================================================
          MODULE: STUDENTS DIRECTORY
         ========================================================================= */}
      {activeTab === 'students' && <StudentManagement />}

      {/* =========================================================================
          MODULE: NOTICES & ANNOUNCEMENTS
         ========================================================================= */}
      {activeTab === 'notices' && <NoticesManagement />}

      {/* =========================================================================
          MODULE: SYSTEM SETTINGS & AUDIT LOG
         ========================================================================= */}
      {activeTab === 'settings' && <SettingsAuditLog />}

      {/* =========================================================================
          MODULE: OFFICIAL REPORTS & NARRATIVES (When activeTab === 'reports')
         ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0F2A4A] via-[#163B66] to-[#0E7C86] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Reports & Documentation</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Official Union Reports Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                Generate, review, customize, and print official letters and performance reports matching the MUSF Docx standard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95 shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Launch Report Generator</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#0F2A4A] dark:text-white">Half-Yearly Narrative Report</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Matches the MUSF Half Year Report model with Basmala, 12 committee narratives, and official signatures.
              </p>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-bold text-[#0E7C86] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Generate &amp; Print &rarr;</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#0F2A4A] dark:text-white">Class-Wise Student Activity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by class &amp; month, tracking student attendance, program enrollment, competition winners, 1st places, and certificates with PDF &amp; Excel.
              </p>
              <button
                type="button"
                onClick={() => setIsClassReportModalOpen(true)}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Class Report &rarr;</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#0F2A4A] dark:text-white">Monthly Activities Summary</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter activities, competitions, and meeting minutes for any selected month across the academic year.
              </p>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-bold text-[#0E7C86] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Select Month &rarr;</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#0F2A4A] dark:text-white">A4 Standalone Letterhead</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated A4 isolated print engine ensures zero blank pages or clipping when saving as PDF or printing.
              </p>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-bold text-[#0E7C86] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Print Document &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REPORTS MODAL
         ========================================================================= */}
      <OfficialMalayalamReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultWingId={wings[0]?.id || 'fine_arts'}
      />

      {/* =========================================================================
          CLASS-WISE ACTIVITY & PARTICIPATION REPORT MODAL
         ========================================================================= */}
      <ClassWiseActivityReportModal
        isOpen={isClassReportModalOpen}
        onClose={() => setIsClassReportModalOpen(false)}
      />

      {/* =========================================================================
          MODAL: ADD / EDIT MEETING MINUTES
         ========================================================================= */}
      <Modal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        title={editingMeeting ? 'Edit meeting minutes' : 'Record meeting minutes'}
      >
        <form onSubmit={handleSaveMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Meeting title *
            </label>
            <input
              type="text"
              required
              value={meetingFormData.title}
              onChange={(e) => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
              placeholder={tr('e.g. Union Council Meeting', 'ഉദാ: യൂണിയൻ കൗൺസിൽ യോഗം')}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Conducted under wing *
              </label>
              <select
                value={meetingFormData.wingId}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, wingId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
              >
                {wings.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meeting date *
              </label>
              <input
                type="date"
                required
                value={meetingFormData.date}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, date: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meeting time
              </label>
              <input
                type="text"
                value={meetingFormData.time}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, time: e.target.value })}
                placeholder="04:30 PM"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Venue
              </label>
              <input
                type="text"
                value={meetingFormData.venue}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, venue: e.target.value })}
                placeholder={tr('Union Council Chamber', 'യൂണിയൻ ഓഫീസ്')}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Attendees (comma-separated)
            </label>
            <input
              type="text"
              value={meetingFormData.attendeesText}
              onChange={(e) => setMeetingFormData({ ...meetingFormData, attendeesText: e.target.value })}
              placeholder={tr('Chairman, General Secretary, Wing Conveners...', 'ചെയർമാൻ, ജനറൽ സെക്രട്ടറി, വിംഗ് കൺവീനർ...')}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Key resolutions taken *
            </label>
            <textarea
              rows="3"
              required
              value={meetingFormData.decisions}
              onChange={(e) => setMeetingFormData({ ...meetingFormData, decisions: e.target.value })}
              placeholder={tr('1. Scheduled upcoming summit programs...', '1. അടുത്ത പരിപാടിയുടെ തീയതി നിശ്ചയിച്ചു...')}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMeetingModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0F2A4A] text-white font-medium text-xs shadow-xs"
            >
              Save meeting minutes
            </button>
          </div>
        </form>
      </Modal>

      {/* Role-Based Post Notification Modal */}
      <PostNotificationModal
        isOpen={isPostNotifOpen}
        onClose={() => setIsPostNotifOpen(false)}
      />

      {/* BANNER SLIDE MANAGER MODAL */}
      <BannerSlideManagerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        banners={banners}
        onAddBanner={addBanner}
        onDeleteBanner={deleteBanner}
        wings={wings}
        currentUser={currentUser}
      />
    </div>
  );
};
