import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StudentManagement } from './StudentManagement';
import { ProgramManagement } from './ProgramManagement';
import { NoticesManagement } from './NoticesManagement';
import { SettingsAuditLog } from './SettingsAuditLog';
import { UnionWingsManager } from './UnionWingsManager';
import { UnionOfficialsManager } from './UnionOfficialsManager';
import { SummitRegisterModule } from './SummitRegisterModule';
import { SportsWingManager } from '../sports/SportsWingManager';
import { BannerCarousel } from '../student/ui/BannerCarousel';
import { OfficialMalayalamReportModal } from '../reports/OfficialMalayalamReportModal';
import { ClassWiseActivityReportModal } from '../reports/ClassWiseActivityReportModal';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { PostNotificationModal } from '../common/PostNotificationModal';
import { BannerSlideManagerModal } from '../common/BannerSlideManagerModal';
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
  Sparkles,
  LayoutDashboard,
  Settings,
  ArrowRight,
  ArrowLeft,
  X,
  ExternalLink,
  MoreHorizontal,
  Activity,
  Check,
  LogOut
} from 'lucide-react';

const WING_ICON_MAP = {
  Palette,
  BookOpen,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Folder
};

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

export const AdminDashboard = ({ activeTab = 'dashboard', setActiveTab }) => {
  const { currentUser, logout } = useAuth();
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
  const [isClassReportModalOpen, setIsClassReportModalOpen] = useState(false);
  const [isPostNotifOpen, setIsPostNotifOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isMoreDockOpen, setIsMoreDockOpen] = useState(false);
  const moreDockRef = useRef(null);

  // Auto-open modal on first navigating to reports tab
  useEffect(() => {
    if (activeTab === 'reports') {
      setIsReportModalOpen(true);
    }
  }, [activeTab]);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreDockRef.current && !moreDockRef.current.contains(event.target)) {
        setIsMoreDockOpen(false);
      }
    };
    if (isMoreDockOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreDockOpen]);

  // Meetings & Resolutions state
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

  // Metrics
  const totalStudents = students.length;
  const thamheediyyaCount = students.filter(s => s?.sectionId === 'thamheediyya').length;
  const aliyaCount = students.filter(s => s?.sectionId === 'aliya').length;
  const totalWings = wings.length;

  const allActivities = useMemo(() => (wingPrograms || []).filter(p => p.type !== 'meeting'), [wingPrograms]);
  const allMeetings = useMemo(() => (wingPrograms || []).filter(p => p.type === 'meeting'), [wingPrograms]);

  const upcomingPrograms = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allActivities
      .filter(p => p.date >= today || p.status === 'upcoming')
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [allActivities]);

  const nextProgram = upcomingPrograms[0] || allActivities[0] || null;
  const nextWing = useMemo(() => wings.find(w => w.id === nextProgram?.wingId), [wings, nextProgram]);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const thisMonthPrograms = useMemo(() => {
    return allActivities.filter(p => p.date && p.date.startsWith(currentMonthStr));
  }, [allActivities, currentMonthStr]);

  // Needs Attention calculations
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
        detail: `${unpublishedResultsCount} programs have draft evaluations awaiting release.`,
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

  // Navigation Dock Tabs Definition
  const dockTabs = [
    { id: 'dashboard', label: tr('Home', 'ഹോം'), icon: LayoutDashboard },
    { id: 'wings', label: tr('Wings', 'വിംഗുകൾ'), icon: Folder, badge: totalWings },
    { id: 'programs', label: tr('Programs', 'പരിപാടികൾ'), icon: Layers },
    { id: 'students', label: tr('Students', 'വിദ്യാർത്ഥികൾ'), icon: Users, badge: totalStudents },
    { id: 'officials', label: tr('Leaders', 'ഭാരവാഹികൾ'), icon: Crown, badge: unionOfficials.length },
    { id: 'meetings', label: tr('Minutes', 'മിനിറ്റ്സ്'), icon: Lock },
    { id: 'reports', label: tr('Reports', 'റിപ്പോർട്ട്'), icon: FileText }
  ];

  const isMoreTabActive = ['college_sports', 'notices', 'settings', 'summit_register'].includes(activeTab);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100">
      
      {/* =========================================================================
          MAX-WIDTH CENTERED CONTAINER (max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6)
         ========================================================================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-28 sm:pb-32">

        {/* =========================================================================
            BENTO HOME DASHBOARD (When activeTab === 'dashboard')
           ========================================================================= */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* 1. CENTRAL ADMIN APEX HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2A4A] via-[#12365C] to-[#0E7C86] text-white p-6 sm:p-8 shadow-xl shadow-blue-950/15 border border-white/10">
              {/* Background ambient watermarks */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-400/10 pointer-events-none blur-2xl" />

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-teal-200 uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-teal-300" />
                      <span>Apex Administration Console</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Firestore Single Source of Truth</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200/90 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      Academic Year {settings.academicYear || '2026–2027'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to sign out?')) {
                          logout();
                        }
                      }}
                      className="text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/35 px-3 py-1 rounded-full backdrop-blur-sm border border-rose-400/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                      title="Sign out of Admin session"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-300" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                    Welcome back, {adminDisplayName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
                    Majlis Umariyya Students' Federation (MUSF) &bull; Apex Union Governance, Wings Leadership & Student Records Management.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. DEDUPLICATED PRIMARY QUICK ACTIONS (5 Essential Direct Triggers) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0D1929] border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400" />
                  <span>Immediate Actions</span>
                </span>
                <span className="text-[11px] text-slate-400">Direct Module Triggers</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                {/* 1. Add Student */}
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 dark:from-[#111C2E] dark:to-indigo-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Add student</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Admit student record</span>
                  </div>
                </button>

                {/* 2. Add Wing */}
                <button
                  type="button"
                  onClick={() => setActiveTab('wings')}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-teal-100 dark:border-teal-950/60 hover:border-teal-300 dark:hover:border-teal-700 bg-gradient-to-br from-teal-50/50 via-white to-teal-50/30 dark:from-[#111C2E] dark:to-teal-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#0E7C86] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <FolderPlus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Add wing</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Charter new union wing</span>
                  </div>
                </button>

                {/* 3. Appoint Official */}
                <button
                  type="button"
                  onClick={() => setActiveTab('officials')}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-amber-100 dark:border-amber-950/60 hover:border-amber-300 dark:hover:border-amber-700 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-[#111C2E] dark:to-amber-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Appoint official</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Assign leadership post</span>
                  </div>
                </button>

                {/* 4. Add Program */}
                <button
                  type="button"
                  onClick={() => setActiveTab('programs')}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-purple-100 dark:border-purple-950/60 hover:border-purple-300 dark:hover:border-purple-700 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 dark:from-[#111C2E] dark:to-purple-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Add program</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Schedule union activity</span>
                  </div>
                </button>

                {/* 5. Post Notice */}
                <button
                  type="button"
                  onClick={() => setIsPostNotifOpen(true)}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-rose-100 dark:border-rose-950/60 hover:border-rose-300 dark:hover:border-rose-700 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 dark:from-[#111C2E] dark:to-rose-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px] col-span-2 sm:col-span-1"
                >
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Post Notice</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Broadcast to campus</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. FEATURED BANNER POSTERS CAROUSEL */}
            <div className="rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0D1929] shadow-sm p-3 sm:p-4">
              <BannerCarousel
                banners={banners}
                wings={wings}
                onNavigate={setActiveTab}
                canManage={true}
                onOpenManageModal={() => setIsBannerModalOpen(true)}
              />
            </div>

            {/* 4. PRIMARY TEAL / CREAM BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* ======================================================= */}
              {/* BENTO CARD 1: ACTIVE WINGS & ACTIVITIES (TEAL THEME)    */}
              {/* Merges Union Wings & Union Programs into one interface  */}
              {/* ======================================================= */}
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0E7C86]/8 via-[#FFFDF9] to-[#0E7C86]/4 dark:from-teal-950/40 dark:via-[#0D1929] dark:to-teal-950/20 border border-teal-200/90 dark:border-teal-800/70 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-teal-900/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-[#0E7C86] text-white flex items-center justify-center shadow-sm">
                        <Folder className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Active Union Wings
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Chartered student wings & autonomous programs
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 text-[#0E7C86] dark:text-teal-300 text-xs font-extrabold border border-teal-200 dark:border-teal-800">
                      {totalWings} Wings
                    </span>
                  </div>

                  {/* Wings Metric Quick Glance */}
                  <div className="grid grid-cols-3 gap-2 pt-4 text-center">
                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-teal-100/80 dark:border-slate-800">
                      <span className="text-lg font-black text-[#0E7C86] dark:text-teal-400 block tabular-nums">
                        {totalWings}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Wings
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-teal-100/80 dark:border-slate-800">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400 block tabular-nums">
                        {thisMonthPrograms.length}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        This Month
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-teal-100/80 dark:border-slate-800">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block tabular-nums">
                        {allActivities.length}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        All Activities
                      </span>
                    </div>
                  </div>

                  {/* Wings Chips Preview */}
                  <div className="pt-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Wing Portfolios:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {wings.slice(0, 6).map(w => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setActiveTab('wings')}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-teal-400 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86]" />
                          <span>{w.shortName || w.name}</span>
                        </button>
                      ))}
                      {wings.length > 6 && (
                        <span className="px-2 py-1 text-xs text-slate-400 font-medium">
                          +{wings.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Merged Navigation Actions */}
                <div className="pt-3 border-t border-teal-100/80 dark:border-teal-900/40 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('wings')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#0E7C86] hover:bg-[#0c6b73] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <span>Manage Wings & Conveners</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('programs')}
                    className="py-2.5 px-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition active:scale-98 cursor-pointer"
                  >
                    <span>Programs</span>
                  </button>
                </div>
              </div>

              {/* ======================================================= */}
              {/* BENTO CARD 2: TOTAL STUDENTS (CREAM & INDIGO THEME)     */}
              {/* ======================================================= */}
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#FFFDF9] via-indigo-50/25 to-white dark:from-[#0D1929] dark:via-indigo-950/20 dark:to-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-950/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Total Students Directory
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Enrollment, classes, house teams & profiles
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
                      {totalStudents} Students
                    </span>
                  </div>

                  {/* Student Metric Quick Glance */}
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-indigo-100/90 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Thamheediyya</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Years 1–2</span>
                      </div>
                      <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1 tabular-nums">
                        {thamheediyyaCount}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-indigo-100/90 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Aliya High School</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Years 3–6</span>
                      </div>
                      <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1 tabular-nums">
                        {aliyaCount}
                      </span>
                    </div>
                  </div>

                  {/* Single Source of Truth Note */}
                  <div className="pt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Active Firestore real-time sync across devices with zero local storage drift.</span>
                  </div>
                </div>

                {/* Primary Student Actions */}
                <div className="pt-3 border-t border-indigo-100/80 dark:border-indigo-950/40 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <span>Open Students Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ======================================================= */}
              {/* BENTO CARD 3: GOVERNANCE & MINUTES (CONSOLIDATED)       */}
              {/* Merges Union Office Bearers + Council Minutes           */}
              {/* ======================================================= */}
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-[#0D1929] dark:via-amber-950/15 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-950/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                        <Crown className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Governance & Council Minutes
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Central executive council & official resolutions
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800">
                      {unionOfficials.length} Officials
                    </span>
                  </div>

                  {/* Recent Meeting Spotlight */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Latest Council Resolution
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenAddMeeting}
                        className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Record Meeting</span>
                      </button>
                    </div>

                    {allMeetings.length > 0 ? (
                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {allMeetings[0].title}
                          </span>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {formatProgramDate(allMeetings[0].date)}
                          </span>
                        </div>
                        {allMeetings[0].decisions && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                            {allMeetings[0].decisions}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-2 italic">
                        No meeting minutes recorded yet for this session.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-amber-100/80 dark:border-amber-950/40 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('officials')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <span>Office Bearers Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('meetings')}
                    className="py-2.5 px-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition active:scale-98 cursor-pointer"
                  >
                    <span>All Minutes ({allMeetings.length})</span>
                  </button>
                </div>
              </div>

              {/* ======================================================= */}
              {/* BENTO CARD 4: REPORTS, SPORTS & NOTICES (CONSOLIDATED)  */}
              {/* ======================================================= */}
              <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0D1929] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-[#0F2A4A] dark:bg-slate-800 text-white flex items-center justify-center shadow-sm">
                        <FileText className="w-4.5 h-4.5 text-teal-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Reports, Sports &amp; Notices
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Consolidated institutional operations &amp; records
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                      Apex Console
                    </span>
                  </div>

                  {/* Consolidated Quick-Jump Options (No duplicate menus!) */}
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    {/* Official Malayalam Report */}
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left transition cursor-pointer flex flex-col justify-between"
                    >
                      <Printer className="w-4 h-4 text-[#0E7C86] mb-1" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Malayalam Report</span>
                      <span className="text-[10px] text-slate-400 block truncate">Official narrative Docx</span>
                    </button>

                    {/* Class-Wise Activity */}
                    <button
                      type="button"
                      onClick={() => setIsClassReportModalOpen(true)}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left transition cursor-pointer flex flex-col justify-between"
                    >
                      <Award className="w-4 h-4 text-purple-600 mb-1" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Class Activity</span>
                      <span className="text-[10px] text-slate-400 block truncate">Monthly participation</span>
                    </button>

                    {/* College Sports */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('college_sports')}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left transition cursor-pointer flex flex-col justify-between"
                    >
                      <Trophy className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">College Sports</span>
                      <span className="text-[10px] text-slate-400 block truncate">House teams &amp; standings</span>
                    </button>

                    {/* Notices & Broadcasts */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('notices')}
                      className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left transition cursor-pointer flex flex-col justify-between"
                    >
                      <Bell className="w-4 h-4 text-rose-500 mb-1" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Announcements</span>
                      <span className="text-[10px] text-slate-400 block truncate">Campus notices</span>
                    </button>
                  </div>
                </div>

                {/* Audit & Settings Shortcut */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Audit Log &amp; System Settings &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('summit_register')}
                    className="text-xs font-bold text-[#0E7C86] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fine Arts Summit &rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5. "NEEDS ATTENTION" HIGHLIGHT BANNER (If any alerts exist) */}
            {needsAttentionItems.length > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/70 dark:border-amber-800/60">
                  <h2 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                    <span>Operations Needing Attention</span>
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                    {needsAttentionItems.length} Pending Actions
                  </span>
                </div>

                <div className="divide-y divide-amber-200/60 dark:divide-amber-900/40">
                  {needsAttentionItems.map(item => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                          {item.detail}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveTab(item.targetTab)}
                          className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-900/80 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 font-bold text-xs transition cursor-pointer"
                        >
                          Resolve &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
              ACTIVE SUB-MODULE VIEW WITH CLEAN BREADCRUMB & ZERO SIDEBAR CLUTTER
             ========================================================================= */
          <div className="space-y-5 animate-fade-in">
            {/* Top Navigation Bar with Back-to-Dashboard */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Bento Dashboard</span>
              </button>

              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {activeTab === 'wings' && 'Union Wings Console'}
                {activeTab === 'programs' && 'Programs & Competitions'}
                {activeTab === 'students' && 'Students Management'}
                {activeTab === 'officials' && 'Union Leadership & Bearers'}
                {activeTab === 'meetings' && 'Council Minutes & Resolutions'}
                {activeTab === 'reports' && 'Official Reports & Prints'}
                {activeTab === 'college_sports' && 'College Sports Wing'}
                {activeTab === 'notices' && 'Notices & Announcements'}
                {activeTab === 'settings' && 'Audit Log & Settings'}
                {activeTab === 'summit_register' && 'Summit Fine Arts Register'}
              </span>
            </div>

            {/* Sub-module Dynamic Component Routing */}
            {activeTab === 'wings' && (
              <UnionWingsManager
                onOpenSummitModule={() => setActiveTab('summit_register')}
                onOpenSportsModule={() => setActiveTab('college_sports')}
              />
            )}

            {activeTab === 'programs' && <ProgramManagement />}

            {activeTab === 'students' && <StudentManagement />}

            {activeTab === 'officials' && <UnionOfficialsManager />}

            {activeTab === 'meetings' && (
              <div className="space-y-5">
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0D1929] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0F2A4A] dark:text-white">
                      Council Meetings &amp; Resolutions
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Official minutes, agendas, and executive decisions recorded across union wings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddMeeting}
                    className="px-4 py-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Meeting</span>
                  </button>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setMeetingFilterWing('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      meetingFilterWing === 'all'
                        ? 'bg-[#0F2A4A] text-white shadow-xs'
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
                        className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                          meetingFilterWing === w.id
                            ? 'bg-[#0F2A4A] text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {w.shortName || w.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Meetings List */}
                <div className="bg-white dark:bg-[#0D1929] rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
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
                              <span className="font-bold text-[#0E7C86]">{wing?.name || 'Union Council'}</span>
                              <span>&bull;</span>
                              <span>{formatProgramDate(m.date)}</span>
                              {m.venue && (
                                <>
                                  <span>&bull;</span>
                                  <span>{m.venue}</span>
                                </>
                              )}
                            </div>
                            <h3 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                              {m.title}
                            </h3>
                            {m.decisions && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                                <strong>Resolutions:</strong> {m.decisions}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMeeting(m)}
                              className="p-1.5 text-slate-400 hover:text-[#0E7C86] rounded-lg transition"
                              title="Edit meeting"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMeeting(m.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
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

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0F2A4A] via-[#163B66] to-[#0E7C86] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Executive Reports &amp; Documentation</span>
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
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1929] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] flex items-center justify-center font-bold">
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

                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1929] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
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

                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1929] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
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

                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1929] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
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

            {activeTab === 'college_sports' && (
              <SportsWingManager
                onOpenCertificateModal={() => {}}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onOpenPostNotice={() => setIsPostNotifOpen(true)}
              />
            )}

            {activeTab === 'summit_register' && (
              <SummitRegisterModule onBack={() => setActiveTab('wings')} />
            )}

            {activeTab === 'notices' && <NoticesManagement />}

            {activeTab === 'settings' && <SettingsAuditLog />}
          </div>
        )}
      </div>

      {/* =========================================================================
          FLOATING BOTTOM PILL DOCK (Institutional Glassmorphism Navigation)
          Zero Sidebar Clutter — Centered on Mobile & Windows/Desktop Alike
         ========================================================================= */}
      <nav
        aria-label="Admin Floating Dock"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 select-none pointer-events-auto"
      >
        <div className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/92 dark:bg-[#0B1522]/92 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-[0_12px_36px_rgba(15,42,74,0.18)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.6)]">
          {dockTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMoreDockOpen(false);
                }}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
                title={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminActiveDockPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0F2A4A] to-[#0E7C86] shadow-md shadow-blue-950/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className={`relative z-10 w-4 h-4 shrink-0 ${isActive ? 'text-teal-300' : 'text-slate-500 dark:text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`relative z-10 hidden md:inline leading-none ${isActive ? 'text-white' : ''}`}>
                  {tab.label}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-black leading-tight ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* 8th Item: "More" Menu Trigger */}
          <div className="relative" ref={moreDockRef}>
            <button
              type="button"
              onClick={() => setIsMoreDockOpen(prev => !prev)}
              className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                isMoreTabActive
                  ? 'bg-[#0E7C86]/20 text-[#0E7C86] dark:text-teal-300 border border-teal-400/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
              title="More Features"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline">More</span>
              {isMoreTabActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86] dark:bg-teal-400 animate-pulse" />
              )}
            </button>

            {/* Floating Popover Above Dock */}
            <AnimatePresence>
              {isMoreDockOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 mb-3 w-56 rounded-2xl bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-2 space-y-1 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Additional Modules
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('college_sports');
                      setIsMoreDockOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                      activeTab === 'college_sports'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>College Sports</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('summit_register');
                      setIsMoreDockOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                      activeTab === 'summit_register'
                        ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-teal-500" />
                    <span>Fine Arts Summit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('notices');
                      setIsMoreDockOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                      activeTab === 'notices'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-rose-500" />
                    <span>Notices &amp; Bulletins</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('settings');
                      setIsMoreDockOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings &amp; Audit Log</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreDockOpen(false);
                      if (window.confirm('Are you sure you want to sign out?')) {
                        logout();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out ({currentUser?.username})</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          MODALS PRESERVED: REPORT, NOTIFICATION, BANNER & MINUTES MODALS
         ========================================================================= */}
      <OfficialMalayalamReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultWingId={wings[0]?.id || 'fine_arts'}
      />

      <ClassWiseActivityReportModal
        isOpen={isClassReportModalOpen}
        onClose={() => setIsClassReportModalOpen(false)}
      />

      {/* Modal for Adding / Editing Meeting Minutes */}
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
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F2A4A] text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Save meeting minutes
            </button>
          </div>
        </form>
      </Modal>

      {/* Broadcast Notification Modal */}
      <PostNotificationModal
        isOpen={isPostNotifOpen}
        onClose={() => setIsPostNotifOpen(false)}
      />

      {/* Banner Slide Manager Modal */}
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
