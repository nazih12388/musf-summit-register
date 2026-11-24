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
import { OverlapCard } from '../student/ui/OverlapCard';
import { IconTile } from '../student/ui/IconTile';
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
  Unlock,
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
  LogOut,
  Eye,
  EyeOff,
  Sliders
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
    updateSettings,
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

  // Fair Judging & Summit rules settings state helpers
  const fairJudgingModeActive = Boolean(settings?.fairJudgingMode);
  const judgeRestrictionsEnforced = settings?.enforceJudgeRestrictions !== false;
  const maxProgramsLimit = settings?.maxProgramsPerStudent || 0;

  const handleToggleFairJudging = () => {
    const nextVal = !fairJudgingModeActive;
    if (updateSettings) {
      updateSettings({
        fairJudgingMode: nextVal,
        hideTeamFromJudges: nextVal
      }, currentUser?.name || 'Fine Arts Convener');
    }
  };

  const handleToggleJudgeRestrictions = () => {
    const nextVal = !judgeRestrictionsEnforced;
    if (updateSettings) {
      updateSettings({
        enforceJudgeRestrictions: nextVal
      }, currentUser?.name || 'Fine Arts Convener');
    }
  };

  const handleMaxProgramsChange = (val) => {
    const num = Math.max(0, Math.min(10, Number(val) || 0));
    if (updateSettings) {
      updateSettings({ maxProgramsPerStudent: num }, currentUser?.name || 'Fine Arts Convener');
    }
  };

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
    <div className="space-y-6 pb-28 sm:pb-32 select-none">
      {/* 1. SOLID ACCENT WING HERO (Student Design System) */}
      <div className="bg-[#0E7C86] dark:bg-[#071F2C] text-white pt-5 pb-12 sm:pb-14 px-4 sm:px-6 rounded-b-[24px] shadow-sm select-none">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Top Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-teal-100 uppercase tracking-wider">
                <Icon className="w-3.5 h-3.5 text-teal-200" />
                <span>{myWing.name}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[11px] font-bold">
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
                  title="Switch to Student Dashboard"
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

          {/* Hero Main Heading & Convener Info */}
          <div className="space-y-1 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {myWing.name}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 font-medium max-w-2xl leading-relaxed">
              Convener: <strong className="text-white font-bold">{currentUser?.name || 'Wing Convener'}</strong> &bull; Majlis Umariyya Students' Federation (MUSF). Dedicated to student leadership and co-curricular distinction.
            </p>
          </div>
        </div>
      </div>

      {activeSubTab === 'dashboard' ? (
        <div className="space-y-6 animate-fade-in">
          {/* 2. OVERLAPPING QUICK ACTIONS GRID (IconTiles matching Student Interface) */}
          <OverlapCard>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
              <IconTile
                icon={Plus}
                label={tr('Activity', 'പ്രവർത്തനം')}
                iconColor="#0E7C86"
                bgColor="#0E7C8615"
                animationType="bounce"
                badge={generalPrograms.length}
                onClick={() => handleOpenAddProg('activity')}
                index={0}
              />
              <IconTile
                icon={Trophy}
                label={tr('Contest', 'മത്സരം')}
                iconColor="#F59E0B"
                bgColor="#F59E0B15"
                animationType="pulse"
                badge={competitions.length}
                onClick={() => handleOpenAddProg('competition')}
                index={1}
              />
              <IconTile
                icon={Award}
                label={tr('Certs', 'സർട്ടിഫിക്കറ്റ്')}
                iconColor="#6366F1"
                bgColor="#6366F115"
                animationType="bounce"
                badge={myWingCertificates.length}
                onClick={() => handleOpenAllocateCert(null, null, 'WING_MERIT', '')}
                index={2}
              />
              <IconTile
                icon={Megaphone}
                label={tr('Notice', 'അറിയിപ്പ്')}
                iconColor="#EC4899"
                bgColor="#EC489915"
                animationType="pulse"
                onClick={() => setIsPostNotifOpen(true)}
                index={3}
              />
              <IconTile
                icon={Printer}
                label={tr('Report', 'റിപ്പോർട്ട്')}
                iconColor="#8B5CF6"
                bgColor="#8B5CF615"
                animationType="bounce"
                onClick={() => setIsReportModalOpen(true)}
                index={4}
              />
              <IconTile
                icon={Sparkles}
                label={tr('Posters', 'പോസ്റ്റർ')}
                iconColor="#06B6D4"
                bgColor="#06B6D415"
                animationType="pulse"
                badge={banners.length}
                onClick={() => setIsBannerModalOpen(true)}
                index={5}
              />
              {isFineArts && !isSportsWing && (
                <IconTile
                  icon={Palette}
                  label={tr('Summit', 'സമ്മിറ്റ്')}
                  iconColor="#10B981"
                  bgColor="#10B98115"
                  animationType="pulse"
                  onClick={() => setActiveSubTab('summit_register')}
                  index={6}
                />
              )}
              {isSportsWing && !isFineArts && (
                <IconTile
                  icon={Trophy}
                  label={tr('Sports', 'സ്പോർട്സ്')}
                  iconColor="#EA580C"
                  bgColor="#EA580C15"
                  animationType="pulse"
                  onClick={() => setActiveSubTab('college_sports')}
                  index={6}
                />
              )}
            </div>
          </OverlapCard>

          {/* 3. CENTERED CONTENT CONTAINER */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-5">
            {/* FEATURED BANNER POSTERS CAROUSEL */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0D1929] shadow-sm p-3">
              <BannerCarousel
                banners={banners}
                wings={wings}
                onNavigate={setActiveSubTab}
                canManage={true}
                onOpenManageModal={() => setIsBannerModalOpen(true)}
              />
            </div>

            {/* BENTO GRID (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* CARD 1: ACTIVITIES & WORKSHOPS */}
              <div className="rounded-2xl p-5 bg-white dark:bg-[#0D1929] border border-teal-200/80 dark:border-teal-900/60 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0E7C86] text-white flex items-center justify-center shadow-xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          Activities &amp; Workshops
                        </h3>
                        <p className="text-[10px] text-slate-400">Programs, attendance &amp; sessions</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-[#0E7C86] dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
                      {generalPrograms.length}
                    </span>
                  </div>

                  {generalPrograms.length > 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-white truncate">{generalPrograms[0].title}</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400 text-[11px] shrink-0">{generalPrograms[0].date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-teal-100/60 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300">
                          {generalPrograms[0].registeredStudents?.length || 0} Registered
                        </span>
                        <span className={`px-2 py-0.5 rounded-md ${generalPrograms[0].isRegistrationOpen ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {generalPrograms[0].isRegistrationOpen ? 'Registration Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2 italic">No activities scheduled yet.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('programs')}
                  className="w-full py-2 px-3 rounded-xl bg-[#0E7C86] hover:bg-[#0c6b73] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                >
                  <span>Manage Activities &amp; Attendance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CARD 2: COMPETITIONS & WINNERS */}
              <div className="rounded-2xl p-5 bg-white dark:bg-[#0D1929] border border-amber-200/80 dark:border-amber-900/60 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          Competitions &amp; Winners
                        </h3>
                        <p className="text-[10px] text-slate-400">Podium results &amp; evaluations</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                      {competitions.length}
                    </span>
                  </div>

                  {competitions.length > 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-white truncate">{competitions[0].title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${competitions[0].winners?.firstPlace ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {competitions[0].winners?.firstPlace ? 'Winners Decided' : 'Pending Evaluation'}
                        </span>
                      </div>
                      {competitions[0].winners?.firstPlace && (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                          🥇 1st: {competitions[0].winners.firstPlace.name} (CIC: {competitions[0].winners.firstPlace.cicNo})
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2 italic">No competitions scheduled yet.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('competitions')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                >
                  <span>Record Results &amp; Winners</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CARD 3: CERTIFICATES & HONORS */}
              <div className="rounded-2xl p-5 bg-white dark:bg-[#0D1929] border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          Certificates &amp; Honors
                        </h3>
                        <p className="text-[10px] text-slate-400">Merit citations &amp; PDF honor</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      {myWingCertificates.length}
                    </span>
                  </div>

                  {myWingCertificates.length > 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {myWingCertificates[0].studentName} &bull; {myWingCertificates[0].awardTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        CIC: {myWingCertificates[0].cicNo} &bull; {myWingCertificates[0].issueDate}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2 italic">No certificates issued yet.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('certificates')}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                >
                  <span>Manage All Certificates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CARD 4: SPECIALIZED WING CONSOLE / FAIR JUDGING (FINE ARTS) */}
              {isFineArts && !isSportsWing && (
                <div className="rounded-2xl p-5 bg-gradient-to-br from-teal-50/50 via-white to-amber-50/30 dark:from-[#0D1929] dark:to-teal-950/30 border border-teal-300/80 dark:border-teal-800/70 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#0E7C86] text-white flex items-center justify-center shadow-xs">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            Fair Judging &amp; Summit Rules
                          </h3>
                          <p className="text-[10px] text-slate-500">Fine Arts Summit festival policies</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 text-[10px] font-bold">
                        Fine Arts Exclusive
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Fair Judging Toggle */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0E7C86]" />
                            <span>Fair Judging (Mask Teams)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {fairJudgingModeActive ? 'Active: Judges see only Chest numbers' : 'Disabled: Team names visible'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleFairJudging}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            fairJudgingModeActive ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              fairJudgingModeActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Judge Restriction Toggle */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                            {judgeRestrictionsEnforced ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>Judge Event Restriction</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {judgeRestrictionsEnforced ? 'Restricted: Assigned programs only' : 'Unrestricted: All programs open'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleJudgeRestrictions}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            judgeRestrictionsEnforced ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              judgeRestrictionsEnforced ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Max Programs Per Student */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">Max Events / Student:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={maxProgramsLimit}
                            onChange={(e) => handleMaxProgramsChange(e.target.value)}
                            className="w-12 p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-xs"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">{maxProgramsLimit === 0 ? '(Unlimited)' : 'Events'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Rules & OPS Formula Quick Pill */}
                    <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-[#0E7C86] dark:text-teal-300 text-xs">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Attendance Rules &amp; OPS Formula</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Late/Excused credit, {settings?.overallMarksWeight || 80}% marks + {settings?.overallAttendanceWeight || 20}% attendance
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('summit_register')}
                        className="px-2.5 py-1 rounded-lg bg-[#0E7C86] text-white text-[10px] font-bold shrink-0 hover:bg-[#0c6b73] transition cursor-pointer"
                      >
                        Configure
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('summit_register')}
                    className="w-full py-2 px-3 rounded-xl bg-[#0E7C86] hover:bg-[#0c6b73] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <span>Open Full Summit Register &amp; Scoring</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* CARD 4 ALTERNATIVE: SPORTS WING */}
              {isSportsWing && !isFineArts && (
                <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 dark:from-[#0D1929] dark:to-orange-950/30 border border-amber-300/80 dark:border-amber-800/70 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            College Sports Championship
                          </h3>
                          <p className="text-[10px] text-slate-500">Fixtures, teams &amp; house standings</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                        Sports Console
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Manage college sports house tournaments, team allocations, point systems, match fixtures, and championship trophy records.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('college_sports')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <span>Open College Sports Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* CARD 4 ALTERNATIVE: GENERAL WING NOTICES */}
              {isGeneralWing && (
                <div className="rounded-2xl p-5 bg-white dark:bg-[#0D1929] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            Campus Bulletin &amp; Notices
                          </h3>
                          <p className="text-[10px] text-slate-500">Official circulars &amp; announcements</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                        Live Feed
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Publish official wing circulars, event agendas, and important notifications instantly to student feeds and noticeboards.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPostNotifOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <span>+ Post Campus Notice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 space-y-5 animate-fade-in">
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

      {/* =========================================================================
          NATIVE APP BOTTOM NAVIGATION BAR (Full Width Docked Bar, No Side Menus)
         ========================================================================= */}
      <nav
        aria-label="Wing Convener Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 select-none bg-white/95 dark:bg-[#091320]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-safe"
      >
        <div className="max-w-md md:max-w-xl mx-auto h-16 px-1 flex items-center justify-around">
          {dockTabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#0E7C86] dark:text-teal-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="wingBottomBarActive"
                    className="absolute top-0 w-8 h-1 rounded-full bg-[#0E7C86] dark:bg-teal-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative">
                  <TabIcon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.4 : 1.8} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] mt-1 leading-none tracking-tight truncate max-w-[64px]">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Quick Malayalam Monthly Report Trigger */}
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 cursor-pointer"
            title="Monthly Malayalam Report (PDF)"
          >
            <div className="relative">
              <Printer className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-1 leading-none tracking-tight">
              Report
            </span>
          </button>

          {/* Quick Post Notice Trigger */}
          <button
            type="button"
            onClick={() => setIsPostNotifOpen(true)}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer"
            title="Post Notice"
          >
            <div className="relative">
              <Megaphone className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-1 leading-none tracking-tight">
              Notice
            </span>
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
