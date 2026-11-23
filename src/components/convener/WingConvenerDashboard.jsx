import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { OfficialMalayalamReportModal } from '../reports/OfficialMalayalamReportModal';
import { SummitRegisterModule } from '../admin/SummitRegisterModule';
import { SportsWingManager } from '../sports/SportsWingManager';
import { generateCertificatePDF } from '../../utils/certificate';
import { BannerCarousel } from '../student/ui/BannerCarousel';
import { BannerSlideManagerModal } from '../common/BannerSlideManagerModal';
import { PostNotificationModal } from '../common/PostNotificationModal';
import { Modal } from '../common/Modal';
import { resolveConvenerWing } from '../../utils/wingHelper';
import {
  Palette,
  BookOpen,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Folder,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Award,
  Search,
  Sparkles,
  ChevronRight,
  Shield,
  ShieldCheck,
  FileText,
  Lock,
  Printer,
  Check,
  XCircle,
  UserCheck,
  UserX,
  Download,
  Megaphone,
  LayoutDashboard,
  ArrowRight,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const ICON_MAP = {
  Palette,
  BookOpen,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Folder
};

export const WingConvenerDashboard = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, switchRole } = useAuth();
  const { lang, tr } = useLanguage();
  const {
    wings = [],
    wingPrograms = [],
    addWingProgram,
    updateWingProgram,
    deleteWingProgram,
    toggleProgramRegistration,
    markWingProgramAttendance,
    markAllWingProgramAttendance,
    saveCompetitionResults,
    students = [],
    unionOfficials = [],
    settings = {},
    certificates = [],
    addCertificate,
    deleteCertificate,
    classes = [],
    teams = [],
    banners = [],
    addBanner,
    deleteBanner
  } = useApp();

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPostNotifOpen, setIsPostNotifOpen] = useState(false);

  // Determine current convener's wing with safe resolution
  const myWing = useMemo(() => {
    return resolveConvenerWing(currentUser, wings, unionOfficials);
  }, [currentUser, wings, unionOfficials]);

  const myWingId = String(myWing?.id || '').toLowerCase().trim();
  const myWingCode = String(myWing?.code || '').toLowerCase().trim();
  const myWingName = String(myWing?.name || '').toLowerCase().trim();

  const isSportsWing = myWingId === 'sports' || myWingId === 'sports-wing' || myWingCode === 'sgw' || myWingName.includes('sport');
  const isFineArts = !isSportsWing && (myWing?.isSummitModule === true || myWingId === 'fine_arts' || myWingId === 'fine-arts' || myWingCode === 'faw' || myWingName.includes('fine art') || myWingName.includes('summit'));
  const isGeneralWing = !isSportsWing && !isFineArts;

  const Icon = ICON_MAP[myWing.icon] || (isSportsWing ? Trophy : isFineArts ? Palette : Folder);

  // Local navigation state: default to 'dashboard' (Bento layout)
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  // Sync with activeTab prop if explicitly provided
  useEffect(() => {
    if (!activeTab || activeTab === 'dashboard') {
      setActiveSubTab('dashboard');
    } else if (activeTab === 'reports') {
      setIsReportModalOpen(true);
    } else if (['programs', 'competitions', 'certificates', 'summit_register', 'college_sports'].includes(activeTab)) {
      setActiveSubTab(activeTab);
    }
  }, [activeTab]);

  // Attendance & Registrations Modal State
  const [attendanceProgId, setAttendanceProgId] = useState(null);
  const activeAttendanceProg = wingPrograms.find(p => p.id === attendanceProgId) || null;

  // Program Add / Edit Modal State
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [progForm, setProgForm] = useState({
    title: '',
    type: 'activity',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    venue: 'College Campus',
    description: '',
    reportUrl: '',
    status: 'upcoming',
    isRegistrationOpen: true
  });

  // Results Entry Modal State
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [targetProgram, setTargetProgram] = useState(null);
  const [resultForm, setResultForm] = useState({
    firstPlaceId: '',
    secondPlaceId: '',
    thirdPlaceId: '',
    pointsFirst: 10,
    pointsSecond: 6,
    pointsThird: 3,
    remarks: ''
  });

  // Certificate Allocation Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    programId: '',
    studentId: '',
    category: 'WING_WINNER',
    place: '1st',
    awardTitle: '',
    citation: '',
    issueDate: new Date().toISOString().slice(0, 10)
  });
  const [certStudentSearch, setCertStudentSearch] = useState('');
  const [certToast, setCertToast] = useState('');

  // Programs strictly for this convener's wing
  const myEntries = useMemo(() => {
    return wingPrograms.filter(p => p.wingId === myWing.id);
  }, [wingPrograms, myWing.id]);

  const generalPrograms = useMemo(() => {
    return myEntries.filter(p => p.type === 'activity' || p.type === 'program');
  }, [myEntries]);

  const competitions = useMemo(() => {
    return myEntries.filter(p => p.type === 'competition');
  }, [myEntries]);

  // Certificates allocated under this wing
  const myWingCertificates = useMemo(() => {
    return (certificates || []).filter(c => c.wingId === myWing.id);
  }, [certificates, myWing.id]);

  // Handlers for Certificates
  const handleOpenAllocateCert = (prog = null, student = null, category = 'WING_WINNER', place = '1st') => {
    const pTitle = prog?.title || '';
    const defaultAwardTitle = prog
      ? (place ? `${place} Place - ${pTitle}` : `Certificate of Participation - ${pTitle}`)
      : `${myWing.shortName} Award of Merit`;

    const defaultCitation = prog
      ? (place
        ? `In high commendation for securing ${place} place in "${pTitle}" organized by the ${myWing.name}.`
        : `For enthusiastic and valuable participation in "${pTitle}" conducted under the auspices of ${myWing.name}.`)
      : `Awarded in recognition of distinguished co-curricular contribution to ${myWing.name} activities.`;

    setCertForm({
      programId: prog?.id || '',
      studentId: student?.id || '',
      category,
      place: category === 'WING_WINNER' ? place : '',
      awardTitle: defaultAwardTitle,
      citation: defaultCitation,
      issueDate: new Date().toISOString().slice(0, 10)
    });
    setCertStudentSearch('');
    setIsCertModalOpen(true);
  };

  const handleSaveCertificate = (e) => {
    e.preventDefault();
    if (!certForm.studentId) {
      alert('Please select a student recipient');
      return;
    }
    const student = students.find(s => s.id === certForm.studentId);
    if (!student) return;

    const prog = wingPrograms.find(p => p.id === certForm.programId);
    const cl = (classes || []).find(c => c.id === student.classId);
    const tm = (teams || []).find(t => t.id === student.teamId);

    addCertificate({
      studentId: student.id,
      studentName: student.name,
      cicNo: student.cicNo,
      classId: student.classId,
      className: cl?.name || student.className || 'Class',
      teamId: student.teamId,
      teamName: tm?.name || student.teamName || 'House',
      sectionId: student.sectionId || 'aliya',
      wingId: myWing.id,
      wingName: myWing.name,
      programId: prog?.id || null,
      programTitle: prog?.title || 'Union Program',
      category: certForm.category,
      place: certForm.place || '',
      awardTitle: certForm.awardTitle || `${myWing.shortName} Certificate of Honor`,
      citation: certForm.citation,
      issueDate: certForm.issueDate || new Date().toISOString().slice(0, 10),
      month: new Date().toISOString().slice(0, 7),
      monthLabel: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      isPublished: true,
      publishedAt: new Date().toISOString()
    }, currentUser?.name || 'Convener');

    setIsCertModalOpen(false);
    setCertToast(`Certificate issued to ${student.name}!`);
    setTimeout(() => setCertToast(''), 4000);
  };

  // Handlers for General Program
  const handleOpenAddProg = (type = 'activity') => {
    setEditingProg(null);
    setProgForm({
      title: '',
      type,
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      venue: 'College Campus',
      description: '',
      reportUrl: '',
      status: 'upcoming',
      isRegistrationOpen: true
    });
    setIsProgModalOpen(true);
  };

  const handleOpenEditProg = (prog) => {
    setEditingProg(prog);
    setProgForm({
      title: prog.title || '',
      type: prog.type || 'activity',
      date: prog.date || new Date().toISOString().split('T')[0],
      time: prog.time || '10:00 AM',
      venue: prog.venue || 'College Campus',
      description: prog.description || '',
      reportUrl: prog.reportUrl || '',
      status: prog.status || 'upcoming',
      isRegistrationOpen: prog.isRegistrationOpen !== undefined ? prog.isRegistrationOpen : true
    });
    setIsProgModalOpen(true);
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!progForm.title.trim()) return;

    if (editingProg) {
      updateWingProgram(editingProg.id, {
        ...progForm,
        updatedBy: currentUser?.name || 'Convener'
      });
    } else {
      addWingProgram({
        ...progForm,
        wingId: myWing.id,
        wingName: myWing.name,
        registeredStudents: [],
        createdBy: currentUser?.name || 'Convener'
      });
    }
    setIsProgModalOpen(false);
  };

  // Handlers for Results
  const handleOpenResults = (prog) => {
    setTargetProgram(prog);
    const existing = prog.winners || {};
    setResultForm({
      firstPlaceId: existing.firstPlace?.studentId || '',
      secondPlaceId: existing.secondPlace?.studentId || '',
      thirdPlaceId: existing.thirdPlace?.studentId || '',
      pointsFirst: existing.firstPlace?.points || 10,
      pointsSecond: existing.secondPlace?.points || 6,
      pointsThird: existing.thirdPlace?.points || 3,
      remarks: existing.remarks || ''
    });
    setIsResultModalOpen(true);
  };

  const handleSaveResults = (e) => {
    e.preventDefault();
    if (!targetProgram || !resultForm.firstPlaceId) {
      alert('Please select at least a 1st place winner');
      return;
    }

    const firstStudent = students.find(s => s.id === resultForm.firstPlaceId);
    const secondStudent = students.find(s => s.id === resultForm.secondPlaceId);
    const thirdStudent = students.find(s => s.id === resultForm.thirdPlaceId);

    const winnersPayload = {
      firstPlace: firstStudent ? {
        studentId: firstStudent.id,
        name: firstStudent.name,
        cicNo: firstStudent.cicNo,
        classId: firstStudent.classId,
        teamId: firstStudent.teamId,
        points: Number(resultForm.pointsFirst) || 10
      } : null,
      secondPlace: secondStudent ? {
        studentId: secondStudent.id,
        name: secondStudent.name,
        cicNo: secondStudent.cicNo,
        classId: secondStudent.classId,
        teamId: secondStudent.teamId,
        points: Number(resultForm.pointsSecond) || 6
      } : null,
      thirdPlace: thirdStudent ? {
        studentId: thirdStudent.id,
        name: thirdStudent.name,
        cicNo: thirdStudent.cicNo,
        classId: thirdStudent.classId,
        teamId: thirdStudent.teamId,
        points: Number(resultForm.pointsThird) || 3
      } : null,
      remarks: resultForm.remarks || ''
    };

    saveCompetitionResults(targetProgram.id, winnersPayload, currentUser?.name || 'Convener');
    setIsResultModalOpen(false);
  };

  // Dock Tabs
  const dockTabs = [
    { id: 'dashboard', label: tr('Home', 'ഹോം'), icon: LayoutDashboard },
    { id: 'programs', label: tr('Activities', 'പരിപാടികൾ'), icon: Calendar, badge: generalPrograms.length },
    { id: 'competitions', label: tr('Competitions', 'മത്സരങ്ങൾ'), icon: Trophy, badge: competitions.length },
    { id: 'certificates', label: tr('Certs', 'സർട്ടിഫിക്കറ്റ്'), icon: Award, badge: myWingCertificates.length },
    ...(isFineArts && !isSportsWing && !isGeneralWing ? [
      { id: 'summit_register', label: 'Summit', icon: Palette }
    ] : []),
    ...(isSportsWing && !isFineArts && !isGeneralWing ? [
      { id: 'college_sports', label: 'Sports', icon: Trophy }
    ] : []),
  ];

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100">
      
      {/* =========================================================================
          MAX-WIDTH CENTERED CONTAINER (max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6)
         ========================================================================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-28 sm:pb-32">
        
        {/* =========================================================================
            BENTO HOME DASHBOARD (When activeSubTab === 'dashboard')
           ========================================================================= */}
        {activeSubTab === 'dashboard' ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* 1. APEX WING HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2A4A] via-[#12365C] to-[#0E7C86] text-white p-6 sm:p-8 shadow-xl shadow-blue-950/15 border border-white/10">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-400/10 pointer-events-none blur-2xl" />

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-teal-200 uppercase tracking-wider">
                      <Icon className="w-3.5 h-3.5 text-teal-300" />
                      <span>{myWing.name} Portfolio</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Convener Console</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200/90 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      Academic Year {settings.academicYear || '2026–2027'}
                    </span>
                    {currentUser?.availableRoles?.includes('student') && (
                      <button
                        type="button"
                        onClick={() => switchRole('student')}
                        className="text-xs font-semibold text-teal-200 bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                        title="Switch to your personal Student portal"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Student View</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to sign out?')) {
                          logout();
                        }
                      }}
                      className="text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/35 px-3 py-1 rounded-full backdrop-blur-sm border border-rose-400/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                      title="Sign out of Convener session"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-300" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                    <span>{myWing.name}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
                    Convener: <strong className="text-white font-bold">{currentUser?.name || 'Wing Convener'}</strong> &bull; Majlis Umariyya Students' Federation (MUSF). Dedicated to student leadership and co-curricular distinction.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. PRIMARY QUICK ACTIONS BAR (5 Direct Triggers) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0D1929] border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400" />
                  <span>Wing Quick Actions</span>
                </span>
                <span className="text-[11px] text-slate-400">Direct Portfolio Triggers</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                {/* 1. Add Activity */}
                <button
                  type="button"
                  onClick={() => handleOpenAddProg('activity')}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-teal-100 dark:border-teal-950/60 hover:border-teal-300 dark:hover:border-teal-700 bg-gradient-to-br from-teal-50/50 via-white to-teal-50/30 dark:from-[#111C2E] dark:to-teal-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#0E7C86] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">+ Add Activity</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Schedule workshop</span>
                  </div>
                </button>

                {/* 2. Add Competition */}
                <button
                  type="button"
                  onClick={() => handleOpenAddProg('competition')}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-amber-100 dark:border-amber-950/60 hover:border-amber-300 dark:hover:border-amber-700 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-[#111C2E] dark:to-amber-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">+ Competition</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Add contest &amp; prizes</span>
                  </div>
                </button>

                {/* 3. Issue Certificate */}
                <button
                  type="button"
                  onClick={() => handleOpenAllocateCert(null, null, 'WING_MERIT', '')}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 dark:from-[#111C2E] dark:to-indigo-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Certificate</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Issue merit honor</span>
                  </div>
                </button>

                {/* 4. Post Notice */}
                <button
                  type="button"
                  onClick={() => setIsPostNotifOpen(true)}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-rose-100 dark:border-rose-950/60 hover:border-rose-300 dark:hover:border-rose-700 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 dark:from-[#111C2E] dark:to-rose-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px]"
                >
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Post Notice</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Wing bulletin</span>
                  </div>
                </button>

                {/* 5. Posters / Report */}
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="group p-3 sm:p-3.5 rounded-2xl border border-purple-100 dark:border-purple-950/60 hover:border-purple-300 dark:hover:border-purple-700 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 dark:from-[#111C2E] dark:to-purple-950/30 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[82px] col-span-2 sm:col-span-1"
                >
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Monthly Report</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Official Malayalam PDF</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. FEATURED BANNER POSTERS CAROUSEL */}
            <div className="rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0D1929] shadow-sm p-3 sm:p-4">
              <BannerCarousel
                banners={banners}
                wings={wings}
                onNavigate={setActiveSubTab}
                canManage={true}
                onOpenManageModal={() => setIsBannerModalOpen(true)}
              />
            </div>

            {/* 4. PRIMARY TEAL / CREAM BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* BENTO CARD 1: WING ACTIVITIES & WORKSHOPS (TEAL THEME) */}
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0E7C86]/8 via-[#FFFDF9] to-[#0E7C86]/4 dark:from-teal-950/40 dark:via-[#0D1929] dark:to-teal-950/20 border border-teal-200/90 dark:border-teal-800/70 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-teal-900/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-[#0E7C86] text-white flex items-center justify-center shadow-sm">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Wing Activities &amp; Workshops
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Programs, workshops, training &amp; attendance
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 text-[#0E7C86] dark:text-teal-300 text-xs font-extrabold border border-teal-200 dark:border-teal-800">
                      {generalPrograms.length} Activities
                    </span>
                  </div>

                  {/* Program Spotlight */}
                  <div className="pt-4 space-y-2.5">
                    {generalPrograms.length > 0 ? (
                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-teal-100/90 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {generalPrograms[0].title}
                          </span>
                          <span className="text-[11px] font-mono text-teal-700 dark:text-teal-300 font-semibold shrink-0">
                            {generalPrograms[0].date}
                          </span>
                        </div>
                        {generalPrograms[0].venue && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{generalPrograms[0].venue}</span>
                          </p>
                        )}
                        <div className="pt-1 flex items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300 font-bold">
                            {generalPrograms[0].registeredStudents?.length || 0} Registered
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold ${generalPrograms[0].isRegistrationOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {generalPrograms[0].isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3 italic">
                        No general programs recorded yet. Click "+ Add Activity" above to schedule one.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-100/80 dark:border-teal-900/40 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('programs')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#0E7C86] hover:bg-[#0c6b73] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <span>Manage Activities &amp; Attendance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BENTO CARD 2: COMPETITIONS & WINNERS (AMBER THEME) */}
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-[#0D1929] dark:via-amber-950/15 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-950/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                        <Trophy className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Competitions &amp; Winners
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Contests, podium points &amp; evaluations
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-800">
                      {competitions.length} Contests
                    </span>
                  </div>

                  {/* Competition Spotlight */}
                  <div className="pt-4 space-y-2.5">
                    {competitions.length > 0 ? (
                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {competitions[0].title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${competitions[0].winners?.firstPlace ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {competitions[0].winners?.firstPlace ? 'Winners Decided' : 'Pending Evaluation'}
                          </span>
                        </div>
                        {competitions[0].winners?.firstPlace && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold pt-0.5">
                            🥇 1st: {competitions[0].winners.firstPlace.name} (CIC: {competitions[0].winners.firstPlace.cicNo})
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3 italic">
                        No competitions created yet. Click "+ Add Competition" above.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-100/80 dark:border-amber-950/40 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('competitions')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <span>Record Results &amp; Winners</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BENTO CARD 3: CERTIFICATES ALLOCATION (INDIGO THEME) */}
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#FFFDF9] via-indigo-50/25 to-white dark:from-[#0D1929] dark:via-indigo-950/20 dark:to-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-950/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Award className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Certificates &amp; Honors
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Merit, participation &amp; PDF generation
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
                      {myWingCertificates.length} Issued
                    </span>
                  </div>

                  {/* Certificates Preview */}
                  <div className="pt-4 space-y-2">
                    {myWingCertificates.length > 0 ? (
                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-indigo-100/90 dark:border-slate-800 space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {myWingCertificates[0].studentName} &bull; {myWingCertificates[0].awardTitle}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          CIC {myWingCertificates[0].cicNo} &bull; Issued on {myWingCertificates[0].issueDate}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3 italic">
                        No certificates issued under this wing yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-indigo-100/80 dark:border-indigo-950/40 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('certificates')}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <span>Manage All Certificates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BENTO CARD 4: SPECIALIZED WING CONSOLES & REPORTS */}
              <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0D1929] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-[#0F2A4A] text-white flex items-center justify-center shadow-sm">
                        <FileText className="w-4.5 h-4.5 text-teal-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                          Reports &amp; Dedicated Consoles
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Official documentation &amp; specialized tools
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
                    {/* Monthly Report */}
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left transition cursor-pointer flex flex-col justify-between"
                    >
                      <Printer className="w-4 h-4 text-[#0E7C86] mb-1" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Malayalam Report</span>
                      <span className="text-[10px] text-slate-400 block truncate">Official narrative PDF</span>
                    </button>

                    {/* Fine Arts Summit Shortcut if Fine Arts */}
                    {isFineArts && !isSportsWing && (
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('summit_register')}
                        className="p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <Palette className="w-4 h-4 text-amber-600 mb-1" />
                        <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block">Summit Register</span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 block truncate">Fine arts candidate list</span>
                      </button>
                    )}

                    {/* Sports Wing Shortcut if Sports Wing */}
                    {isSportsWing && !isFineArts && (
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('college_sports')}
                        className="p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-left transition cursor-pointer flex flex-col justify-between"
                      >
                        <Trophy className="w-4 h-4 text-amber-600 mb-1" />
                        <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block">College Sports</span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 block truncate">Teams, points &amp; rosters</span>
                      </button>
                    )}

                    {/* Posters Slide Manager */}
                    <button
                      type="button"
                      onClick={() => setIsBannerModalOpen(true)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left transition cursor-pointer flex flex-col justify-between"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600 mb-1" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Posters &amp; Slides</span>
                      <span className="text-[10px] text-slate-400 block truncate">Campus event slides</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block">
                    Affiliated to Coordination of Islamic Colleges (CIC)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              ACTIVE SUB-MODULE VIEW WITH TOP BREADCRUMB
             ========================================================================= */
          <div className="space-y-5 animate-fade-in">
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveSubTab('dashboard')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Wing Bento Dashboard</span>
              </button>

              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {myWing.name} &bull; {activeSubTab}
              </span>
            </div>

            {/* FULL SUMMIT REGISTER MODULE (FINE ARTS ONLY) */}
            {isFineArts && !isSportsWing && activeSubTab === 'summit_register' && (
              <SummitRegisterModule onBack={() => setActiveSubTab('dashboard')} />
            )}

            {/* FULL SPORTS WING MODULE (SPORTS WING ONLY) */}
            {isSportsWing && !isFineArts && activeSubTab === 'college_sports' && (
              <SportsWingManager
                embedded={true}
                defaultMode="teams"
                onOpenCertificateModal={() => handleOpenAllocateCert(null, null, 'SPORTS_ACHIEVEMENT', 'Winner')}
              />
            )}

            {/* PROGRAMS & ACTIVITIES SUB-TAB */}
            {activeSubTab === 'programs' && (
              <div className="bg-white dark:bg-[#0D1929] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                      <span>{tr('General Programs & Workshops', 'പൊതുപരിപാടികളും വർക്ക്ഷോപ്പുകളും')}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 font-bold text-[#0E7C86] dark:text-teal-300">
                        {generalPrograms.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tr('Seminars, training sessions, workshops, and awareness programs.', 'സെമിനാറുകൾ, ക്ലാസുകൾ, ശിൽപ്പശാലകൾ, ബോധവൽക്കരണ പരിപാടികൾ.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddProg('activity')}
                    className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ {tr('Add Program', 'പുതിയ പരിപാടി ചേർക്കുക')}</span>
                  </button>
                </div>

                {generalPrograms.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    {tr('No general programs recorded for this wing yet. Click the button above to add one.', 'ഈ വിംഗിൽ പൊതുപരിപാടികൾ ഒന്നും ചേർത്തിട്ടില്ല. മുകളിലുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്തു പുതിയ പരിപാടി രേഖപ്പെടുത്താം.')}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {generalPrograms.map(p => (
                      <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                              {tr('Program', 'പൊതുപരിപാടി')}
                            </span>
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {p.date}
                            </span>
                            {p.venue && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {p.venue}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                            {p.title}
                          </h4>

                          {p.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">
                              {p.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 self-start md:self-center shrink-0">
                          {/* Registration Toggle Switch */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                            <span className={`text-[10px] font-bold ${p.isRegistrationOpen ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400'}`}>
                              {p.isRegistrationOpen ? 'Reg. ON' : 'Reg. OFF'}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(p.isRegistrationOpen)}
                              onClick={() => toggleProgramRegistration(p.id, currentUser?.name || 'Convener')}
                              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${p.isRegistrationOpen ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'}`}
                              title={p.isRegistrationOpen ? "Turn Registration OFF" : "Turn Registration ON"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${p.isRegistrationOpen ? 'translate-x-3' : 'translate-x-0'}`}
                              />
                            </button>
                          </div>

                          {/* Attendance Button */}
                          <button
                            type="button"
                            onClick={() => setAttendanceProgId(p.id)}
                            className="px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100 text-[#0E7C86] dark:text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                            title="View registered students and mark attendance"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{tr('Attendance', 'ഹാജർ')} ({Array.isArray(p.registeredStudents) ? p.registeredStudents.length : 0})</span>
                          </button>

                          {/* Issue Certificate Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAllocateCert(p, null, 'WING_PARTICIPATION', '')}
                            className="px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
                            title="Issue Certificate to participants"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{tr('Certificate', 'സർട്ടിഫിക്കറ്റ്')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditProg(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0E7C86] transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(tr(`Delete program "${p.title}"?`, `പരിപാടി "${p.title}" നീക്കം ചെയ്യണോ?`))) {
                                deleteWingProgram(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COMPETITIONS SUB-TAB */}
            {activeSubTab === 'competitions' && (
              <div className="bg-white dark:bg-[#0D1929] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span>{tr('Competitions & Winners', 'മത്സരങ്ങളും വിജയികളും')}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 font-bold text-amber-800 dark:text-amber-300">
                        {competitions.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tr('Select 1st, 2nd, and 3rd place winners from the student list. Results reflect directly in student profiles.', '1st, 2nd, 3rd സ്ഥാനക്കാരെ വിദ്യാർത്ഥി ലിസ്റ്റിൽ നിന്ന് തെരഞ്ഞെടുക്കുക. ഫലങ്ങൾ വിദ്യാർത്ഥിയുടെ പ്രൊഫൈലിൽ കാണാം.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddProg('competition')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ {tr('Add Competition', 'പുതിയ മത്സരം ചേർക്കുക')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {competitions.map(comp => {
                    const hasWinners = Boolean(comp.winners?.firstPlace);

                    return (
                      <div
                        key={comp.id}
                        className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {comp.date}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${hasWinners
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                              {hasWinners ? tr('Results Announced', 'ഫലം പ്രഖ്യാപിച്ചു') : tr('Pending Results', 'ഫലം നിർണയിച്ചിട്ടില്ല')}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                            {comp.title}
                          </h4>
                          {comp.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {comp.description}
                            </p>
                          )}

                          {/* Winners Box */}
                          <div className="mt-4 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                            {hasWinners ? (
                              <>
                                <div className="flex items-center justify-between font-semibold">
                                  <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                                    <span>{tr('1st Place:', 'ഒന്നാം സ്ഥാനം:')}</span>
                                    <strong>{comp.winners.firstPlace.name}</strong>
                                  </span>
                                  <span className="font-mono text-slate-500">
                                    {comp.winners.firstPlace.cicNo}
                                  </span>
                                </div>
                                {comp.winners.secondPlace && (
                                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                      <span>{tr('2nd Place:', 'രണ്ടാം സ്ഥാനം:')}</span>
                                      <strong>{comp.winners.secondPlace.name}</strong>
                                    </span>
                                    <span className="font-mono text-slate-500">
                                      {comp.winners.secondPlace.cicNo}
                                    </span>
                                  </div>
                                )}
                                {comp.winners.thirdPlace && (
                                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                      <span>{tr('3rd Place:', 'മൂന്നാം സ്ഥാനം:')}</span>
                                      <strong>{comp.winners.thirdPlace.name}</strong>
                                    </span>
                                    <span className="font-mono text-slate-500">
                                      {comp.winners.thirdPlace.cicNo}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center py-2 text-slate-400 italic">
                                {tr('Winners not announced yet. Click below to assign.', 'വിജയികളെ തെരഞ്ഞെടുത്തിട്ടില്ല. താഴെയുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProg(comp)}
                            className="text-xs text-slate-500 hover:text-[#0E7C86] font-semibold cursor-pointer"
                          >
                            {tr('Edit Event', 'എഡിറ്റ് വിവരങ്ങൾ')}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAllocateCert(comp, null, 'WING_WINNER', '1st')}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                              title="Issue Certificates to winners"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>{tr('Certificate', 'സർട്ടിഫിക്കറ്റ്')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenResults(comp)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                            >
                              <Trophy className="w-3.5 h-3.5 text-amber-300" />
                              <span>{hasWinners ? tr('Edit Winners', 'വിജയികളെ തിരുത്തുക') : tr('Assign Winners', 'വിജയികളെ നൽകുക')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CERTIFICATES SUB-TAB */}
            {activeSubTab === 'certificates' && (
              <div className="bg-white dark:bg-[#0D1929] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>{tr('Wing Merit & Participation Certificates', 'വിംഗ് സർട്ടിഫിക്കറ്റ് വിതരണം')}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 font-bold text-amber-800 dark:text-amber-300">
                        {myWingCertificates.length} Issued
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tr('Allocate and print official merit or participation certificates for students under this wing.', 'ഈ വിംഗിന് കീഴിൽ നടന്ന പരിപാടികളിലും മത്സരങ്ങളിലും പങ്കെടുത്ത വിദ്യാർത്ഥികൾക്ക് സർട്ടിഫിക്കറ്റുകൾ നൽകാം.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAllocateCert(null, null, 'WING_MERIT', '')}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ {tr('Issue New Certificate', 'പുതിയ സർട്ടിഫിക്കറ്റ് നൽകുക')}</span>
                  </button>
                </div>

                {certToast && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{certToast}</span>
                  </div>
                )}

                {myWingCertificates.length === 0 ? (
                  <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                    <Award className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {tr('No certificates issued under this wing yet.', 'ഈ വിംഗിൽ ഇതുവരെ സർട്ടിഫിക്കറ്റുകൾ നൽകിയിട്ടില്ല.')}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAllocateCert(null, null, 'WING_MERIT', '')}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#0E7C86] text-white text-xs font-bold hover:bg-[#0c6b74] transition cursor-pointer"
                    >
                      + Issue First Certificate
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {myWingCertificates.map(cert => (
                      <div
                        key={cert.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                              {cert.place ? `${cert.place} Place` : 'Honors'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {cert.issueDate}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                            {cert.studentName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            CIC: {cert.cicNo} &bull; {cert.className || 'Class'} {cert.teamName ? `• ${cert.teamName}` : ''}
                          </p>
                          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 pt-0.5">
                            {cert.awardTitle}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => generateCertificatePDF(cert)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-[#0E7C86]" />
                            <span>Download PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Revoke / Delete certificate for ${cert.studentName}?`)) {
                                deleteCertificate(cert.id, currentUser?.name || 'Convener');
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          FLOATING BOTTOM PILL DOCK (Institutional Glassmorphism Navigation)
         ========================================================================= */}
      <nav
        aria-label="Convener Navigation Dock"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 select-none pointer-events-auto"
      >
        <div className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/92 dark:bg-[#0B1522]/92 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-[0_12px_36px_rgba(15,42,74,0.18)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.6)]">
          {dockTabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
                title={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="convenerActiveDockPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0F2A4A] to-[#0E7C86] shadow-md shadow-blue-950/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <TabIcon className={`relative z-10 w-4 h-4 shrink-0 ${isActive ? 'text-teal-300' : 'text-slate-500 dark:text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
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

          {/* Direct Report Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition cursor-pointer"
            title="Monthly Report (PDF)"
          >
            <Printer className="w-4 h-4 text-purple-600" />
            <span className="hidden md:inline">Report</span>
          </button>

          {/* Direct Post Notice Trigger */}
          <button
            type="button"
            onClick={() => setIsPostNotifOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition cursor-pointer"
            title="Post Notice"
          >
            <Megaphone className="w-4 h-4 text-rose-500" />
            <span className="hidden md:inline">Notice</span>
          </button>

          {/* Direct Sign Out Trigger */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                logout();
              }
            }}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          MODALS PRESERVED: PROGRAM, ATTENDANCE, RESULTS, CERTIFICATE & REPORT
         ========================================================================= */}
      
      {/* Program Add / Edit Modal */}
      <Modal
        isOpen={isProgModalOpen}
        onClose={() => setIsProgModalOpen(false)}
        title={editingProg ? `Edit Entry: ${myWing.name}` : `New Entry: ${myWing.name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Event Title *', 'പരിപാടിയുടെ പേര് *')}
            </label>
            <input
              type="text"
              required
              value={progForm.title}
              onChange={(e) => setProgForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Football Tourney, Arabic Calligraphy Workshop..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                {tr('Category / Type', 'വിഭാഗം')}
              </label>
              <select
                value={progForm.type}
                onChange={(e) => setProgForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              >
                <option value="activity">{tr('General Program / Workshop', 'പൊതുപരിപാടി / വർക്ക്ഷോപ്പ്')}</option>
                <option value="competition">{tr('Competition & Prizes', 'മത്സരം & സമ്മാനങ്ങൾ')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={progForm.status}
                onChange={(e) => setProgForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                {tr('Date', 'തീയതി')}
              </label>
              <input
                type="date"
                value={progForm.date}
                onChange={(e) => setProgForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                {tr('Time', 'സമയം')}
              </label>
              <input
                type="text"
                value={progForm.time}
                onChange={(e) => setProgForm(prev => ({ ...prev, time: e.target.value }))}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Venue', 'വേദി')}
            </label>
            <input
              type="text"
              value={progForm.venue}
              onChange={(e) => setProgForm(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="e.g. Campus Ground, Seminar Hall..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Description / Summary', 'വിവരണം / ലഘുകുറിപ്പ്')}
            </label>
            <textarea
              rows={3}
              value={progForm.description}
              onChange={(e) => setProgForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder={tr('Event objectives and key highlights...', 'പരിപാടിയുടെ ലക്ഷ്യങ്ങളും പ്രധാന വിവരങ്ങളും...')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          {/* Student Self-Registration Switch */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {tr('Allow Student Self-Registration', 'വിദ്യാർത്ഥികൾക്ക് സ്വയം രജിസ്റ്റർ ചെയ്യാം')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {tr('When ON, students can register directly from their portal', 'ഇത് ഓൺ ആക്കിയാൽ കുട്ടികൾക്ക് അവരുടെ പോർട്ടലിൽ നിന്ന് നേരിട്ട് രജിസ്റ്റർ ചെയ്യാം')}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(progForm.isRegistrationOpen)}
              onClick={() => setProgForm(prev => ({ ...prev, isRegistrationOpen: !prev.isRegistrationOpen }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${progForm.isRegistrationOpen ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${progForm.isRegistrationOpen ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsProgModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white text-xs font-bold transition shadow-xs"
            >
              Save Program
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Competition Winners Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Enter Competition Winners: ${targetProgram?.title || ''}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveResults} className="space-y-4">
          <p className="text-xs text-slate-500">
            {tr('Select 1st, 2nd, and 3rd place winners from students. Official union points and certificate honors will be awarded.', 'കോളേജ് വിദ്യാർത്ഥികളിൽ നിന്ന് 1, 2, 3 സ്ഥാനക്കാരെ തെരഞ്ഞെടുക്കുക. ഇവർക്ക് യൂണിയൻ മെഡലുകളും സർട്ടിഫിക്കറ്റ് പോർട്ട്ഫോളിയോയും നൽകപ്പെടും.')}
          </p>

          {/* 1st Place */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300">
                {tr('1st Place Winner *', 'ഒന്നാം സ്ഥാനം *')}
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span>{tr('Points:', 'പോയിന്റ്:')}</span>
                <input
                  type="number"
                  value={resultForm.pointsFirst}
                  onChange={(e) => setResultForm(prev => ({ ...prev, pointsFirst: e.target.value }))}
                  className="w-12 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-center font-bold"
                />
              </div>
            </div>
            <select
              required
              value={resultForm.firstPlaceId}
              onChange={(e) => setResultForm(prev => ({ ...prev, firstPlaceId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">{tr('-- Select Student --', '-- വിദ്യാർത്ഥിയെ തെരഞ്ഞെടുക്കുക --')}</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cicNo}) - {s.classId?.toUpperCase()} {s.place ? `• ${s.place}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2nd Place */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {tr('2nd Place Winner (Optional)', 'രണ്ടാം സ്ഥാനം (Optional)')}
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span>{tr('Points:', 'പോയിന്റ്:')}</span>
                <input
                  type="number"
                  value={resultForm.pointsSecond}
                  onChange={(e) => setResultForm(prev => ({ ...prev, pointsSecond: e.target.value }))}
                  className="w-12 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-center font-bold"
                />
              </div>
            </div>
            <select
              value={resultForm.secondPlaceId}
              onChange={(e) => setResultForm(prev => ({ ...prev, secondPlaceId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            >
              <option value="">{tr('-- Select Student (Optional) --', '-- വിദ്യാർത്ഥിയെ തെരഞ്ഞെടുക്കുക (Optional) --')}</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cicNo}) - {s.classId?.toUpperCase()} {s.place ? `• ${s.place}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 3rd Place */}
          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-orange-900 dark:text-orange-300">
                {tr('3rd Place Winner (Optional)', 'മൂന്നാം സ്ഥാനം (Optional)')}
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span>{tr('Points:', 'പോയിന്റ്:')}</span>
                <input
                  type="number"
                  value={resultForm.pointsThird}
                  onChange={(e) => setResultForm(prev => ({ ...prev, pointsThird: e.target.value }))}
                  className="w-12 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-center font-bold"
                />
              </div>
            </div>
            <select
              value={resultForm.thirdPlaceId}
              onChange={(e) => setResultForm(prev => ({ ...prev, thirdPlaceId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-orange-300 dark:border-orange-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">{tr('-- Select Student (Optional) --', '-- വിദ്യാർത്ഥിയെ തെരഞ്ഞെടുക്കുക (Optional) --')}</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cicNo}) - {s.classId?.toUpperCase()} {s.place ? `• ${s.place}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Remarks / Performance Notes', 'കുറിപ്പ് / Remarks')}
            </label>
            <input
              type="text"
              value={resultForm.remarks}
              onChange={(e) => setResultForm(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder={tr('e.g. Outstanding performance, final score 3-1', 'e.g. മികച്ച പ്രകടനം, ഫൈനൽ സ്കോർ 3-1')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsResultModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {tr('Save Results', 'ഫലം സൂക്ഷിക്കുക')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={Boolean(attendanceProgId)}
        onClose={() => setAttendanceProgId(null)}
        title={activeAttendanceProg ? `${activeAttendanceProg.title} — ${tr('Registered Students & Attendance', 'രജിസ്ട്രേഷൻ & ഹാജർ')}` : 'Attendance'}
        maxWidth="max-w-2xl"
      >
        {activeAttendanceProg && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0F2A4A] dark:text-white">
                    {activeAttendanceProg.registeredStudents?.length || 0} Students Registered
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${activeAttendanceProg.isRegistrationOpen
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {activeAttendanceProg.isRegistrationOpen ? 'Registration Active' : 'Registration Closed'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tr('Mark attendance for participants who attended this wing activity.', 'ഈ പരിപാടിയിൽ പങ്കെടുത്ത വിദ്യാർത്ഥികളുടെ ഹാജർ ഇവിടെ രേഖപ്പെടുത്തുക.')}
                </p>
              </div>

              {activeAttendanceProg.registeredStudents?.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => markAllWingProgramAttendance(activeAttendanceProg.id, true, currentUser?.name || 'Convener')}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95 cursor-pointer"
                    title="Mark all registered students as Present"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>All Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllWingProgramAttendance(activeAttendanceProg.id, false, currentUser?.name || 'Convener')}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95 cursor-pointer"
                    title="Mark all registered students as Absent"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>All Absent</span>
                  </button>
                </div>
              )}
            </div>

            {(!activeAttendanceProg.registeredStudents || activeAttendanceProg.registeredStudents.length === 0) ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {tr('No students have registered yet.', 'ഇതുവരെ ആരും രജിസ്റ്റർ ചെയ്തിട്ടില്ല.')}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {tr('Ensure "Reg. ON" is enabled. Students can then register directly from their student dashboard.', 'രജിസ്ട്രേഷൻ "Reg. ON" ആണെന്ന് ഉറപ്പാക്കുക. കുട്ടികൾക്ക് അവരുടെ പോർട്ടലിൽ നിന്ന് നേരിട്ട് രജിസ്റ്റർ ചെയ്യാം.')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {activeAttendanceProg.registeredStudents.map((st, sIdx) => {
                  const isPresent = st.attended === true;
                  const isAbsent = st.attended === false;

                  return (
                    <div key={st.studentId || sIdx} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {st.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            CIC {st.cicNo}
                          </span>
                          {st.className && (
                            <span className="text-[10px] text-slate-400">
                              &bull; {st.className}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tr('Registered on:', 'രജിസ്റ്റർ ചെയ്തത്:')} {st.registeredAt ? new Date(st.registeredAt).toLocaleDateString() : 'Active'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => markWingProgramAttendance(activeAttendanceProg.id, st.studentId, true, currentUser?.name || 'Convener')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${isPresent
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/40'
                            }`}
                          title="Mark Attended / Present"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{tr('Present', 'ഹാജർ')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => markWingProgramAttendance(activeAttendanceProg.id, st.studentId, false, currentUser?.name || 'Convener')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${isAbsent
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40'
                            }`}
                          title="Mark Absent"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{tr('Absent', 'അഭാവം')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setAttendanceProgId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Issue Certificate Modal */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title={`Issue Certificate: ${myWing.name}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveCertificate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Program / Event
            </label>
            <select
              value={certForm.programId}
              onChange={(e) => {
                const pId = e.target.value;
                const p = wingPrograms.find(x => x.id === pId);
                setCertForm(prev => ({
                  ...prev,
                  programId: pId,
                  awardTitle: p ? (prev.place ? `${prev.place} Place - ${p.title}` : `Participation - ${p.title}`) : `${myWing.shortName} Award of Merit`,
                  citation: p ? `Awarded for active participation in "${p.title}" organized by ${myWing.name}.` : prev.citation
                }));
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            >
              <option value="">General Wing Activity / Special Recognition</option>
              {myEntries.filter(p => p.type !== 'meeting').map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.date})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Certificate Category
              </label>
              <select
                value={certForm.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  const prog = wingPrograms.find(x => x.id === certForm.programId);
                  setCertForm(prev => ({
                    ...prev,
                    category: cat,
                    place: cat === 'WING_WINNER' ? (prev.place || '1st') : '',
                    awardTitle: cat === 'WING_WINNER'
                      ? `${prev.place || '1st'} Place - ${prog?.title || myWing.shortName}`
                      : cat === 'WING_PARTICIPATION'
                        ? `Certificate of Participation - ${prog?.title || myWing.shortName}`
                        : `Certificate of Appreciation - ${myWing.name}`
                  }));
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              >
                <option value="WING_WINNER">Competition Winner (1st, 2nd, 3rd)</option>
                <option value="WING_PARTICIPATION">Certificate of Participation</option>
                <option value="WING_MERIT">Special Appreciation / Merit</option>
              </select>
            </div>

            {certForm.category === 'WING_WINNER' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Prize / Rank
                </label>
                <select
                  value={certForm.place}
                  onChange={(e) => {
                    const pl = e.target.value;
                    const prog = wingPrograms.find(x => x.id === certForm.programId);
                    setCertForm(prev => ({
                      ...prev,
                      place: pl,
                      awardTitle: `${pl} Place - ${prog?.title || myWing.shortName}`
                    }));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
                >
                  <option value="1st">1st Place (First)</option>
                  <option value="2nd">2nd Place (Second)</option>
                  <option value="3rd">3rd Place (Third)</option>
                  <option value="Special Jury">Special Jury Award</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={certForm.issueDate}
                  onChange={(e) => setCertForm(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Recipient Student *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search student by Name, CIC No, Class, or House Team..."
                value={certStudentSearch}
                onChange={(e) => setCertStudentSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />

              <select
                required
                value={certForm.studentId}
                onChange={(e) => setCertForm(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
                size={4}
              >
                {students
                  .filter(s => {
                    if (!certStudentSearch.trim()) return true;
                    const q = certStudentSearch.toLowerCase();
                    return (
                      s.name?.toLowerCase().includes(q) ||
                      s.cicNo?.toLowerCase().includes(q) ||
                      s.className?.toLowerCase().includes(q) ||
                      s.teamName?.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 30)
                  .map(s => (
                    <option key={s.id} value={s.id} className="py-1 px-2">
                      {s.name} (CIC: {s.cicNo} • {s.className || 'Class'} • {s.teamName || 'House'})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Certificate Title / Award Heading
            </label>
            <input
              type="text"
              required
              value={certForm.awardTitle}
              onChange={(e) => setCertForm(prev => ({ ...prev, awardTitle: e.target.value }))}
              placeholder="e.g. 1st Place - Inter-Class Football League 2026"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Official Citation Text
            </label>
            <textarea
              rows={2}
              value={certForm.citation}
              onChange={(e) => setCertForm(prev => ({ ...prev, citation: e.target.value }))}
              placeholder="Citation honoring the student's achievement or participation..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCertModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Issue &amp; Save Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Malayalam Monthly Report Modal */}
      <OfficialMalayalamReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultWingId={myWing.id}
        restrictToWingId={myWing.id}
      />

      {/* Post Notification Modal */}
      <PostNotificationModal
        isOpen={isPostNotifOpen}
        onClose={() => setIsPostNotifOpen(false)}
        defaultWingId={myWing.id}
      />

      {/* Banner Slide Manager Modal */}
      <BannerSlideManagerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        banners={banners}
        onAddBanner={addBanner}
        onDeleteBanner={deleteBanner}
        wings={wings}
        currentUser={{ ...currentUser, wingId: myWing?.id }}
      />
    </div>
  );
};
