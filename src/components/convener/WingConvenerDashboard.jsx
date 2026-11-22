import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UnionCommonOverview } from '../common/UnionCommonOverview';
import { OfficialMalayalamReportModal } from '../reports/OfficialMalayalamReportModal';
import { InstagramPosterGallery } from '../instagram/InstagramPosterGallery';
import { SummitRegisterModule } from '../admin/SummitRegisterModule';
import { SportsWingManager } from '../sports/SportsWingManager';
import { generateCertificatePDF } from '../../utils/certificate';
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
  Megaphone
} from 'lucide-react';
import { PostNotificationModal } from '../common/PostNotificationModal';
import { Modal } from '../common/Modal';
import { RoleBadge, StatusBadge } from '../common/Badge';
import { BannerSlideManagerModal } from '../common/BannerSlideManagerModal';
import { resolveConvenerWing } from '../../utils/wingHelper';

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
  const { currentUser } = useAuth();
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

  // Determine current convener's wing with comprehensive, safe resolution
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

  // Local navigation state: Summit Register (default for Fine Arts), College Sports (for Sports Wing), or Programs (default for general wings)
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (isFineArts) {
      if (['programs', 'competitions', 'certificates'].includes(activeTab)) {
        return activeTab;
      }
      return 'summit_register';
    }
    if (isSportsWing) {
      if (['programs', 'competitions', 'certificates'].includes(activeTab)) {
        return activeTab;
      }
      return 'college_sports';
    }
    // General wing: can never have summit_register or college_sports
    if (['competitions', 'certificates'].includes(activeTab)) {
      return activeTab;
    }
    return 'programs';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Attendance & Registrations Modal
  const [attendanceProgId, setAttendanceProgId] = useState(null);
  const activeAttendanceProg = wingPrograms.find(p => p.id === attendanceProgId) || null;

  useEffect(() => {
    if (activeTab === 'reports') {
      setIsReportModalOpen(true);
      return;
    }

    if (isFineArts) {
      if (['programs', 'competitions', 'certificates'].includes(activeTab)) {
        setActiveSubTab(activeTab);
      } else {
        setActiveSubTab('summit_register');
      }
    } else if (isSportsWing) {
      if (['programs', 'competitions', 'certificates'].includes(activeTab)) {
        setActiveSubTab(activeTab);
      } else {
        setActiveSubTab('college_sports');
      }
    } else {
      if (['competitions', 'certificates'].includes(activeTab)) {
        setActiveSubTab(activeTab);
      } else {
        setActiveSubTab('programs');
      }
    }
  }, [activeTab, isFineArts, isSportsWing, isGeneralWing]);

  // General Program Modal
  const [isPostNotifOpen, setIsPostNotifOpen] = useState(false);
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

  // Results Entry Modal
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

  const handleOpenEditProg = (p) => {
    setEditingProg(p);
    setProgForm({
      title: p.title || '',
      type: p.type || 'activity',
      date: p.date || new Date().toISOString().split('T')[0],
      time: p.time || '10:00 AM',
      venue: p.venue || '',
      description: p.description || '',
      reportUrl: p.reportUrl || '',
      status: p.status || 'upcoming',
      isRegistrationOpen: p.isRegistrationOpen !== undefined ? Boolean(p.isRegistrationOpen) : true
    });
    setIsProgModalOpen(true);
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!progForm.title.trim()) return;

    if (editingProg) {
      updateWingProgram(editingProg.id, {
        ...progForm,
        wingId: myWing.id,
        updatedBy: currentUser?.name || 'Convener'
      });
    } else {
      addWingProgram({
        ...progForm,
        wingId: myWing.id,
        createdBy: currentUser?.name || 'Convener'
      });
    }
    setIsProgModalOpen(false);
  };

  // Handlers for Competition Results
  const handleOpenResults = (p) => {
    setTargetProgram(p);
    setResultForm({
      firstPlaceId: p.winners?.firstPlace?.id || '',
      secondPlaceId: p.winners?.secondPlace?.id || '',
      thirdPlaceId: p.winners?.thirdPlace?.id || '',
      pointsFirst: p.winners?.firstPlace?.points || 10,
      pointsSecond: p.winners?.secondPlace?.points || 6,
      pointsThird: p.winners?.thirdPlace?.points || 3,
      remarks: p.winners?.remarks || ''
    });
    setIsResultModalOpen(true);
  };

  const handleSaveResults = (e) => {
    e.preventDefault();
    if (!targetProgram) return;

    const firstStudent = students.find(s => s.id === resultForm.firstPlaceId);
    const secondStudent = students.find(s => s.id === resultForm.secondPlaceId);
    const thirdStudent = students.find(s => s.id === resultForm.thirdPlaceId);

    const winnersPayload = {
      remarks: resultForm.remarks,
      firstPlace: firstStudent ? {
        id: firstStudent.id,
        name: firstStudent.name,
        cicNo: firstStudent.cicNo,
        classId: firstStudent.classId,
        teamId: firstStudent.teamId,
        points: Number(resultForm.pointsFirst) || 10
      } : null,
      secondPlace: secondStudent ? {
        id: secondStudent.id,
        name: secondStudent.name,
        cicNo: secondStudent.cicNo,
        classId: secondStudent.classId,
        teamId: secondStudent.teamId,
        points: Number(resultForm.pointsSecond) || 6
      } : null,
      thirdPlace: thirdStudent ? {
        id: thirdStudent.id,
        name: thirdStudent.name,
        cicNo: thirdStudent.cicNo,
        classId: thirdStudent.classId,
        teamId: thirdStudent.teamId,
        points: Number(resultForm.pointsThird) || 3
      } : null,
      announcedAt: new Date().toISOString(),
      announcedBy: currentUser?.name || 'Wing Convener'
    };

    saveCompetitionResults(targetProgram.id, winnersPayload);
    setIsResultModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Radiant Wing Convener Header Hero Banner */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0F2A4A] via-[#1E3A8A] to-[#0E7C86] text-white shadow-xl shadow-teal-900/15">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-60 h-60 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-sm">
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-teal-200 uppercase tracking-wide whitespace-nowrap">
                  <Shield className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>{currentUser?.designation || 'Wing Convener'} &bull; {myWing.shortName}</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                {myWing.name}
              </h1>
              <p className="text-xs text-teal-100/90 max-w-xl font-medium line-clamp-1 sm:line-clamp-none">
                {myWing.description}
              </p>
            </div>
          </div>

          {/* Compact Structured Icon Action Buttons Row */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setIsBannerModalOpen(true)}
              className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Publish Poster</span>
            </button>

            {/* Fine Arts Summit Register Quick Console Button */}
            {isFineArts && !isSportsWing && !isGeneralWing && (
              <button
                type="button"
                onClick={() => setActiveSubTab(activeSubTab === 'summit_register' ? 'programs' : 'summit_register')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${activeSubTab === 'summit_register'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25'
                  }`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeSubTab === 'summit_register' ? '← Fine Arts Activities' : 'Summit Register →'}</span>
              </button>
            )}

            {/* Sports Wing Direct Quick Mode Button */}
            {isSportsWing && !isFineArts && !isGeneralWing && (
              <button
                type="button"
                onClick={() => setActiveSubTab(activeSubTab === 'college_sports' ? 'programs' : 'college_sports')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${activeSubTab === 'college_sports'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30'
                  }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeSubTab === 'college_sports' ? '← Sports Dashboard' : 'College Sports →'}</span>
              </button>
            )}

            {/* Monthly Report Button */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
              title={tr('Monthly Report (PDF)', 'പ്രതിമാസ റിപ്പോർട്ട് (PDF)')}
            >
              <FileText className="w-3.5 h-3.5 text-teal-300" />
              <span>{tr('Report (PDF)', 'റിപ്പോർട്ട്')}</span>
            </button>

            {/* Post Wing Notice Button */}
            <button
              type="button"
              onClick={() => setIsPostNotifOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              title={tr('Post Wing Notice', 'വിംഗ് അറിയിപ്പ്')}
            >
              <Megaphone className="w-3.5 h-3.5 text-slate-950" />
              <span>{tr('Notice', 'അറിയിപ്പ്')}</span>
            </button>

            {/* Add Event Button */}
            <button
              type="button"
              onClick={() => handleOpenAddProg('activity')}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-200" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Categories Navigation Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            ...(isFineArts && !isSportsWing && !isGeneralWing ? [{ id: 'summit_register', label: tr('Fine Arts Summit Register', 'സമ്മിറ്റ് രജിസ്റ്റർ'), icon: Palette }] : []),
            { id: 'programs', label: isFineArts ? tr('Fine Arts Activities', 'വിംഗ് പരിപാടികൾ') : isSportsWing ? tr('Sports Programs', 'സ്പോർട്സ് മത്സരങ്ങൾ') : tr(`${myWing.shortName} Activities`, `${myWing.shortName} പരിപാടികൾ`), icon: Calendar },
            ...(isSportsWing && !isFineArts && !isGeneralWing ? [
              { id: 'college_sports', label: tr('College Sports (Teams & Points)', 'കോളേജ് സ്പോർട്സ് (ടീമുകൾ & പോയിന്റുകൾ)'), icon: Trophy }
            ] : []),
            { id: 'competitions', label: tr('Competitions & Winners', 'മത്സരങ്ങൾ & വിജയികൾ'), icon: Trophy },
            { id: 'certificates', label: isSportsWing ? tr('Sports Certificates', 'സ്പോർട്സ് സർട്ടിഫിക്കറ്റുകൾ') : tr('Wing Certificates', 'സർട്ടിഫിക്കറ്റുകൾ'), icon: Award, count: myWingCertificates.length }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`min-h-[34px] px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
                  }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
                    }`}>
                  {tab.count}
                  </span>
                )}
                {tab.confidential && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-semibold border border-amber-400/30">
                    Official
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORY 0: FULL SUMMIT REGISTER MODULE (FINE ARTS CONVENER ONLY) */}
      {isFineArts && !isSportsWing && !isGeneralWing && activeSubTab === 'summit_register' && (
        <div className="space-y-4">
          <SummitRegisterModule />
        </div>
      )}

      {/* CATEGORY 0.6: FULL SPORTS WING MODULE - COLLEGE SPORTS MODE (SPORTS WING ONLY) */}
      {isSportsWing && !isFineArts && !isGeneralWing && (activeSubTab === 'college_sports' || activeSubTab === 'sports_manager' || activeSubTab === 'sports') && (
        <div className="space-y-4">
          <SportsWingManager
            embedded={true}
            defaultMode="teams"
            onOpenCertificateModal={() => handleOpenAllocateCert(null, null, 'SPORTS_ACHIEVEMENT', 'Winner')}
          />
        </div>
      )}

      {/* CATEGORY 1: GENERAL PROGRAMS & WORKSHOPS */}
      {activeSubTab === 'programs' && (
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          {/* Quick Access Banner to College Sports for Sports Wing Convener */}
          {isSportsWing && !isFineArts && !isGeneralWing && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
                    College Sports Management Console
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Manage sports squads, rosters, managers, 10-event bulk setups, match points & athlete marks in the dedicated College Sports console.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('college_sports')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-xs cursor-pointer"
              >
                <span>Open College Sports &rarr;</span>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <span>{tr('General Programs & Workshops', 'പൊതുപരിപാടികളും വർക്ക്ഷോപ്പുകളും')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                  {generalPrograms.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {tr('Seminars, training sessions, workshops, and awareness programs.', 'സെമിനാറുകൾ, ക്ലാസുകൾ, ശിൽപ്പശാലകൾ, ബോധവൽക്കരണ പരിപാടികൾ.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddProg('activity')}
              className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ {tr('Add Program', 'പുതിയ പരിപാടി ചേർക്കുക')}</span>
            </button>
          </div>

          {generalPrograms.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
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
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className={`text-[10px] font-bold ${p.isRegistrationOpen ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400'}`}>
                        {p.isRegistrationOpen ? 'Reg. ON' : 'Reg. OFF'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(p.isRegistrationOpen)}
                        onClick={() => toggleProgramRegistration(p.id, currentUser?.name || 'Convener')}
                        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${p.isRegistrationOpen ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        title={p.isRegistrationOpen ? "Turn Registration OFF" : "Turn Registration ON"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${p.isRegistrationOpen ? 'translate-x-3' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Attendance / Registered Students Button */}
                    <button
                      type="button"
                      onClick={() => setAttendanceProgId(p.id)}
                      className="px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100 text-[#0E7C86] dark:text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                      title="View registered students and mark attendance"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{tr('Attendance', 'ഹാജർ')} ({Array.isArray(p.registeredStudents) ? p.registeredStudents.length : 0})</span>
                    </button>

                    {/* Issue Wing Certificate Button */}
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
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0E7C86] transition"
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
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
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

      {/* CATEGORY 2: COMPETITIONS & WINNERS */}
      {activeSubTab === 'competitions' && (
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{tr('Competitions & Winners', 'മത്സരങ്ങളും വിജയികളും')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                  {competitions.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {tr('Select 1st, 2nd, and 3rd place winners from the student list. Results reflect directly in student profiles.', '1st, 2nd, 3rd സ്ഥാനക്കാരെ വിദ്യാർത്ഥി ലിസ്റ്റിൽ നിന്ന് തെരഞ്ഞെടുക്കുക. ഫലങ്ങൾ വിദ്യാർത്ഥിയുടെ പ്രൊഫൈലിൽ കാണാം.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddProg('competition')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
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
                  className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4"
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
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {comp.description}
                    </p>

                    {/* Winners Box */}
                    <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
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
                          {tr('Winners not announced yet. Click the button below to assign.', 'വിജയികളെ തെരഞ്ഞെടുത്തിട്ടില്ല. താഴെയുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProg(comp)}
                      className="text-xs text-slate-500 hover:text-[#0E7C86] font-semibold"
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
                        className="px-3.5 py-1.5 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
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

      {/* CATEGORY 4: WING CERTIFICATES & HONORS ALLOCATION */}
      {activeSubTab === 'certificates' && (
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{tr('Wing Merit & Participation Certificates', 'വിംഗ് സർട്ടിഫിക്കറ്റ് വിതരണം')}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 font-mono text-amber-800 dark:text-amber-300 font-bold">
                  {myWingCertificates.length} Issued
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {tr(
                  'Allocate and print official merit or participation certificates for students under this wing.',
                  'ഈ വിംഗിന് കീഴിൽ നടന്ന പരിപാടികളിലും മത്സരങ്ങളിലും പങ്കെടുത്ത വിദ്യാർത്ഥികൾക്ക് സർട്ടിഫിക്കറ്റുകൾ നൽകാം.'
                )}
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
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{certToast}</span>
            </div>
          )}

          {myWingCertificates.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Award className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {tr('No certificates issued under this wing yet.', 'ഈ വിംഗിൽ ഇതുവരെ സർട്ടിഫിക്കറ്റുകൾ നൽകിയിട്ടില്ല.')}
              </p>
              <p className="text-slate-500 max-w-sm mx-auto">
                {tr(
                  'Click the button above to award winners, participants, or active volunteers with official certificates.',
                  'മുകളിലെ ബട്ടൺ ഉപയോഗിച്ച് വിദ്യാർത്ഥികൾക്ക് വിജയി സർട്ടിഫിക്കറ്റുകളോ പങ്കാളിത്ത സർട്ടിഫിക്കറ്റുകളോ നൽകാം.'
                )}
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
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col justify-between gap-3 shadow-2xs"
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
                    {cert.citation && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                        "{cert.citation}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => generateCertificatePDF(cert)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
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

      {/* MODAL: ADD / EDIT GENERAL PROGRAM */}
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
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${progForm.isRegistrationOpen ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${progForm.isRegistrationOpen ? 'translate-x-5' : 'translate-x-0'
                  }`}
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

      {/* MODAL: RECORD COMPETITION WINNERS */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Enter Competition Winners: ${targetProgram?.title || ''}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveResults} className="space-y-4">
          <p className="text-xs text-slate-500">
            {tr(
              'Select 1st, 2nd, and 3rd place winners from students. Official union points and certificate honors will be awarded.',
              'കോളേജ് വിദ്യാർത്ഥികളിൽ നിന്ന് 1, 2, 3 സ്ഥാനക്കാരെ തെരഞ്ഞെടുക്കുക. ഇവർക്ക് യൂണിയൻ മെഡലുകളും സർട്ടിഫിക്കറ്റ് പോർട്ട്ഫോളിയോയും നൽകപ്പെടും.'
            )}
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs"
            >
              {tr('Save Results', 'ഫലം സൂക്ഷിക്കുക')}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REGISTERED PARTICIPANTS & ATTENDANCE */}
      <Modal
        isOpen={Boolean(attendanceProgId)}
        onClose={() => setAttendanceProgId(null)}
        title={activeAttendanceProg ? `${activeAttendanceProg.title} — ${tr('Registered Students & Attendance', 'രജിസ്ട്രേഷൻ & ഹാജർ')}` : 'Attendance'}
        maxWidth="max-w-2xl"
      >
        {activeAttendanceProg && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95"
                    title="Mark all registered students as Present"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>All Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllWingProgramAttendance(activeAttendanceProg.id, false, currentUser?.name || 'Convener')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95"
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
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${isPresent
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
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${isAbsent
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
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: ISSUE / ALLOCATE WING CERTIFICATE */}
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

          {/* Student Recipient Selection with instant live search */}
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
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Issue & Save Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL MALAYALAM MONTHLY REPORT MODAL */}
      <OfficialMalayalamReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultWingId={myWing.id}
        restrictToWingId={myWing.id}
      />

      {/* Role-Based Post Notification Modal */}
      <PostNotificationModal
        isOpen={isPostNotifOpen}
        onClose={() => setIsPostNotifOpen(false)}
        defaultWingId={myWing.id}
      />

      {/* BANNER SLIDE MANAGER MODAL */}
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
