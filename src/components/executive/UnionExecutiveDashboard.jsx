import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UnionCommonOverview } from '../common/UnionCommonOverview';
import { OfficialMalayalamReportModal } from '../reports/OfficialMalayalamReportModal';
import { InstagramPosterGallery } from '../instagram/InstagramPosterGallery';
import { UnionOfficialsManager } from '../admin/UnionOfficialsManager';
import { UnionWingsManager } from '../admin/UnionWingsManager';
import { SportsWingManager } from '../sports/SportsWingManager';
import {
  LayoutDashboard,
  Crown,
  Award,
  Layers,
  Users,
  Calendar,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Palette,
  BookOpen,
  HeartHandshake,
  GraduationCap,
  Camera,
  Folder,
  Shield,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Lock,
  Printer,
  FileText,
  MapPin,
  Phone,
  MessageCircle,
  Megaphone
} from 'lucide-react';
import { PostNotificationModal } from '../common/PostNotificationModal';
import { Modal } from '../common/Modal';
import { WingCard } from '../cards/WingCard';
import { StatusBadge } from '../common/Badge';
import { BannerSlideManagerModal } from '../common/BannerSlideManagerModal';
import { OverlapCard } from '../student/ui/OverlapCard';
import { IconTile } from '../student/ui/IconTile';
import { Card } from '../student/ui/Card';
import { SectionHeader } from '../student/ui/SectionHeader';
import { Tag } from '../student/ui/Tag';

const ICON_MAP = {
  Palette,
  BookOpen,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Folder
};

export const UnionExecutiveDashboard = ({ activeTab: parentActiveTab, setActiveTab: parentSetActiveTab }) => {
  const { currentUser } = useAuth();
  const { lang, tr } = useLanguage();
  const {
    wings = [],
    wingPrograms = [],
    addWingProgram,
    updateWingProgram,
    deleteWingProgram,
    saveCompetitionResults,
    unionOfficials = [],
    students = [],
    teams = [],
    teamStandings = [],
    settings = {},
    banners = [],
    addBanner,
    deleteBanner
  } = useApp();

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('executive_panel'); // 'executive_panel', 'overview', 'programs', 'competitions', 'meetings', 'summit_monitor', 'officials'
  const [execSubTab, setExecSubTab] = useState('programs'); // 'programs' (Executive programs) | 'minutes' (Council meetings)
  const [selectedWingFilter, setSelectedWingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPostNotifOpen, setIsPostNotifOpen] = useState(false);

  useEffect(() => {
    if (parentActiveTab === 'exec_panel') setActiveSection('executive_panel');
    else if (parentActiveTab === 'college_sports' || parentActiveTab === 'sports') setActiveSection('college_sports');
    else if (parentActiveTab === 'meetings') {
      setActiveSection('executive_panel');
      setExecSubTab('minutes');
    }
    else if (parentActiveTab === 'wings') setActiveSection('wings_control');
    else if (parentActiveTab === 'summit_register') setActiveSection('summit_monitor');
    else if (parentActiveTab === 'reports') setIsReportModalOpen(true);
    else if (parentActiveTab === 'officials') setActiveSection('officials');
    else if (parentActiveTab === 'dashboard') setActiveSection('executive_panel');
  }, [parentActiveTab]);

  // General Program Modal
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState({
    title: '',
    wingId: wings[0]?.id || 'fine_arts',
    type: 'activity',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    venue: 'College Auditorium',
    description: '',
    reportUrl: '',
    status: 'upcoming'
  });

  // Confidential Meeting Modal
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    wingId: wings[0]?.id || 'fine_arts',
    date: new Date().toISOString().split('T')[0],
    time: '04:30 PM',
    venue: 'Union Council Chamber',
    agenda: '',
    decisions: '',
    attendeesText: tr('Union Chairman, General Secretary, Wing Conveners', 'യൂണിയൻ ചെയർമാൻ, ജനറൽ സെക്രട്ടറി, വിംഗ് കൺവീനർമാർ'),
    status: 'completed',
    isConfidential: true
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

  // KPI calculations
  const totalPrograms = wingPrograms.filter(p => p.type !== 'meeting').length;
  const totalCompetitions = wingPrograms.filter(p => p.type === 'competition').length;
  const totalMeetings = wingPrograms.filter(p => p.type === 'meeting').length;
  const announcedResults = wingPrograms.filter(p => p.type === 'competition' && p.winners?.firstPlace).length;

  // Filtered lists
  const filteredGeneralPrograms = useMemo(() => {
    return wingPrograms.filter(p => {
      if (p.type !== 'activity' && p.type !== 'program') return false;
      const matchWing = selectedWingFilter === 'all' || p.wingId === selectedWingFilter;
      const matchSearch = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchWing && matchSearch;
    });
  }, [wingPrograms, selectedWingFilter, searchQuery]);

  const filteredCompetitions = useMemo(() => {
    return wingPrograms.filter(p => {
      if (p.type !== 'competition') return false;
      const matchWing = selectedWingFilter === 'all' || p.wingId === selectedWingFilter;
      const matchSearch = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchWing && matchSearch;
    });
  }, [wingPrograms, selectedWingFilter, searchQuery]);

  const filteredMeetings = useMemo(() => {
    return wingPrograms.filter(p => {
      if (p.type !== 'meeting') return false;
      const matchWing = selectedWingFilter === 'all' || p.wingId === selectedWingFilter;
      const matchSearch = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.agenda?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.decisions?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchWing && matchSearch;
    });
  }, [wingPrograms, selectedWingFilter, searchQuery]);

  // Executive Programs & Central Initiatives
  const executivePrograms = useMemo(() => {
    return wingPrograms.filter(p => {
      if (p.type === 'meeting') return false;
      const isCentral = p.wingId === 'all' || p.wingId === 'executive' || !p.wingId;
      const matchSearch = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return isCentral && matchSearch;
    });
  }, [wingPrograms, searchQuery]);

  // Council Meetings
  const councilMeetingsList = useMemo(() => {
    return wingPrograms.filter(p => {
      if (p.type !== 'meeting') return false;
      const matchSearch = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.agenda?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.decisions?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [wingPrograms, searchQuery]);

  // Handlers
  const handleOpenAddExecutiveProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      title: '',
      wingId: 'all',
      type: 'activity',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      venue: 'College Main Auditorium',
      description: '',
      reportUrl: '',
      status: 'upcoming'
    });
    setIsProgramModalOpen(true);
  };

  const handleOpenAddProgram = (type = 'activity') => {
    setEditingProgram(null);
    setProgramForm({
      title: '',
      wingId: selectedWingFilter !== 'all' ? selectedWingFilter : (wings[0]?.id || 'sports'),
      type,
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      venue: 'Main Seminar Hall',
      description: '',
      reportUrl: '',
      status: 'upcoming'
    });
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog) => {
    setEditingProgram(prog);
    setProgramForm({
      title: prog.title || '',
      wingId: prog.wingId || wings[0]?.id,
      type: prog.type || 'activity',
      date: prog.date || new Date().toISOString().split('T')[0],
      time: prog.time || '10:00 AM',
      venue: prog.venue || '',
      description: prog.description || '',
      reportUrl: prog.reportUrl || '',
      status: prog.status || 'upcoming'
    });
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!programForm.title.trim()) return;

    if (editingProgram) {
      updateWingProgram(editingProgram.id, {
        ...programForm,
        updatedBy: currentUser?.name || 'Executive'
      });
    } else {
      addWingProgram({
        ...programForm,
        createdBy: currentUser?.name || 'Executive'
      });
    }
    setIsProgramModalOpen(false);
  };

  const handleOpenAddMeeting = () => {
    setEditingMeeting(null);
    setMeetingForm({
      title: tr('Union Executive Council Meeting', 'യൂണിയൻ എക്സിക്യൂട്ടീവ് കൗൺസിൽ യോഗം'),
      wingId: selectedWingFilter !== 'all' ? selectedWingFilter : (wings[0]?.id || 'fine_arts'),
      date: new Date().toISOString().split('T')[0],
      time: '04:30 PM',
      venue: tr('Union Council Chamber', 'യൂണിയൻ ഓഫീസ്'),
      agenda: '',
      decisions: '',
      attendeesText: tr('Union Chairman, General Secretary, Vice Chairman, Wing Conveners', 'യൂണിയൻ ചെയർമാൻ, ജനറൽ സെക്രട്ടറി, വൈസ് ചെയർമാൻ, വിംഗ് കൺവീനർമാർ'),
      status: 'completed',
      isConfidential: true
    });
    setIsMeetingModalOpen(true);
  };

  const handleOpenEditMeeting = (m) => {
    setEditingMeeting(m);
    setMeetingForm({
      title: m.title || '',
      wingId: m.wingId || wings[0]?.id,
      date: m.date || new Date().toISOString().split('T')[0],
      time: m.time || '04:30 PM',
      venue: m.venue || '',
      agenda: m.agenda || '',
      decisions: m.decisions || '',
      attendeesText: Array.isArray(m.attendees) ? m.attendees.join(', ') : (m.attendeesText || ''),
      status: m.status || 'completed',
      isConfidential: true
    });
    setIsMeetingModalOpen(true);
  };

  const handleSaveMeeting = (e) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) return;

    const attendeesArray = meetingForm.attendeesText
      ? meetingForm.attendeesText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...meetingForm,
      type: 'meeting',
      isConfidential: true,
      attendees: attendeesArray
    };

    if (editingMeeting) {
      updateWingProgram(editingMeeting.id, {
        ...payload,
        updatedBy: currentUser?.name || 'Executive'
      });
    } else {
      addWingProgram({
        ...payload,
        createdBy: currentUser?.name || 'Executive'
      });
    }
    setIsMeetingModalOpen(false);
  };

  const handleOpenResultsModal = (prog) => {
    setTargetProgram(prog);
    setResultForm({
      firstPlaceId: prog.winners?.firstPlace?.id || '',
      secondPlaceId: prog.winners?.secondPlace?.id || '',
      thirdPlaceId: prog.winners?.thirdPlace?.id || '',
      pointsFirst: prog.winners?.firstPlace?.points || 10,
      pointsSecond: prog.winners?.secondPlace?.points || 6,
      pointsThird: prog.winners?.thirdPlace?.points || 3,
      remarks: prog.winners?.remarks || ''
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
      announcedBy: currentUser?.name || 'Union Executive'
    };

    saveCompetitionResults(targetProgram.id, winnersPayload);
    setIsResultModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. SOLID ACCENT EXECUTIVE HERO (Student Design System) */}
      <div className="bg-[#0F2A4A] dark:bg-[#07131F] text-white pt-6 pb-12 px-4 sm:px-6 rounded-b-[24px] shadow-sm">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentUser?.designation || 'Union Executive Committee'}</span>
            </span>

            <span className="text-xs text-slate-300 font-medium">
              Academic Year {settings.academicYear || '2026–2027'}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Executive Council Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Supervision across all {wings.length} Autonomous Union Wings, program allocations, and official reports.
            </p>
          </div>
        </div>
      </div>

      {/* 2. OVERLAPPING QUICK ACTIONS GRID (8 IconTiles - No Duplicates) */}
      <OverlapCard>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          <IconTile
            icon={Crown}
            label={tr('Council', 'കൗൺസിൽ')}
            iconColor="#F59E0B"
            bgColor="#F59E0B15"
            animationType="bounce"
            onClick={() => setActiveSection('executive_panel')}
            index={0}
          />
          <IconTile
            icon={Folder}
            label={tr('Wings', 'വിംഗുകൾ')}
            iconColor="#0E7C86"
            bgColor="#0E7C8615"
            animationType="pulse"
            badge={wings.length}
            onClick={() => setActiveSection('wings_control')}
            index={1}
          />
          <IconTile
            icon={Trophy}
            label={tr('Sports', 'സ്പോർട്സ്')}
            iconColor="#10B981"
            bgColor="#10B98115"
            animationType="tilt"
            onClick={() => setActiveSection('college_sports')}
            index={2}
          />
          <IconTile
            icon={Layers}
            label={tr('Programs', 'പരിപാടികൾ')}
            iconColor="#6366F1"
            bgColor="#6366F115"
            animationType="flip"
            badge={totalPrograms}
            onClick={() => setActiveSection('programs')}
            index={3}
          />
          <IconTile
            icon={Megaphone}
            label={tr('Notice', 'അറിയിപ്പ്')}
            iconColor="#EC4899"
            bgColor="#EC489915"
            animationType="ring"
            onClick={() => setIsPostNotifOpen(true)}
            index={4}
          />
          <IconTile
            icon={FileText}
            label={tr('Report', 'റിപ്പോർട്ട്')}
            iconColor="#F97316"
            bgColor="#F9731615"
            animationType="bounce"
            onClick={() => setIsReportModalOpen(true)}
            index={5}
          />
          <IconTile
            icon={Plus}
            label={tr('+ Program', '+ പ്രോഗ്രാം')}
            iconColor="#06B6D4"
            bgColor="#06B6D415"
            animationType="pulse"
            onClick={() => handleOpenAddProgram('activity')}
            index={6}
          />
          <IconTile
            icon={Sparkles}
            label={tr('Posters', 'പോസ്റ്ററുകൾ')}
            iconColor="#8B5CF6"
            bgColor="#8B5CF615"
            animationType="bounce"
            badge={banners.length}
            onClick={() => setIsBannerModalOpen(true)}
            index={7}
          />
        </div>
      </OverlapCard>

      {/* Internal Navigation Sub-Tabs Bar */}
      <div className="px-4 sm:px-6">
        <div className="bg-white dark:bg-[#0F1B2B] p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'executive_panel', label: tr('Executive Council Panel (Programs & Minutes)', 'എക്സിക്യൂട്ടീവ് പാനൽ (പ്രോഗ്രാം & മിനിറ്റ്സ്)'), icon: Crown, isHighlight: true },
            { id: 'wings_control', label: tr('Manage & Control Wings', 'വിംഗുകൾ നിയന്ത്രിക്കുക'), icon: Folder, isHighlight: true },
            { id: 'college_sports', label: tr('College Sports (Teams & Points)', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy, isHighlight: true },
            { id: 'overview', label: tr('Overview & Analytics', 'പൊതു അവലോകനം'), icon: LayoutDashboard },
            { id: 'programs', label: tr('General Programs', 'പൊതുപരിപാടികൾ'), icon: Layers, badge: totalPrograms },
            { id: 'competitions', label: tr('Competitions & Results', 'മത്സരങ്ങൾ'), icon: Trophy, badge: totalCompetitions },
            { id: 'meetings', label: tr('Council Minutes', 'മീറ്റിംഗ് മിനിറ്റ്സ്'), icon: Lock, badge: totalMeetings },
            { id: 'summit_monitor', label: tr('Fine Arts Standings', 'സമ്മിറ്റ് സ്കോർബോർഡ്'), icon: Palette },
            { id: 'officials', label: tr('Office Bearers', 'ഭാരവാഹികളുടെ പട്ടിക'), icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${isActive
                  ? tab.isHighlight ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'bg-[#0E7C86] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.isHighlight ? 'text-slate-950' : 'text-white') : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? (tab.isHighlight ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-white/30 text-white') : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </div>

      {/* Filter by Wing (Shown for general programs, competitions, meetings) */}
      {(activeSection === 'programs' || activeSection === 'competitions' || activeSection === 'meetings') && (
        <div className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0F1B2B] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedWingFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${selectedWingFilter === 'all'
                ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              All Wings
            </button>
            {wings.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWingFilter(w.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${selectedWingFilter === w.id
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
              >
                {w.shortName || w.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, agenda..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>
        </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: DEDICATED EXECUTIVE COUNCIL PANEL (PROGRAMS & MINUTES)
         ========================================================================= */}
      {activeSection === 'executive_panel' && (
        <div className="px-4 sm:px-6 space-y-4">
          {/* Executive Panel Header Card */}
          <Card className="!p-4 sm:!p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F2A4A] dark:text-white">
                      {tr('Executive Council Panel', 'എക്സിക്യൂട്ടീവ് കൗൺസിൽ പാനൽ')}
                    </h2>
                    <Tag variant="amber" size="sm">
                      {tr('Authorized Governance', 'ഔദ്യോഗിക ഭരണസമിതി')}
                    </Tag>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    {tr(
                      'Dedicated console for Union Executive members to supervise central initiatives and record council meeting resolutions.',
                      'കേന്ദ്ര പ്രോഗ്രാമുകളും കൗൺസിൽ മീറ്റിംഗ് മിനിറ്റ്സുകളും നിയന്ത്രിക്കാനുള്ള ഔദ്യോഗിക പാനൽ.'
                    )}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons: 3 clean buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400" />
                  <span>{tr('Report (PDF)', 'റിപ്പോർട്ട്')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddExecutiveProgram}
                  className="px-3 py-1.5 rounded-lg bg-[#0E7C86] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tr('+ Add Program', '+ പ്രോഗ്രാം')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddMeeting}
                  className="px-3 py-1.5 rounded-lg bg-[#0F2A4A] hover:bg-[#1A3F6B] text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>{tr('+ Record Minutes', '+ മിനിറ്റ്സ്')}</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Sub-Tab Segmented Control Bar */}
          <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setExecSubTab('programs')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                execSubTab === 'programs'
                  ? 'bg-white dark:bg-[#0F1B2B] text-[#0F2A4A] dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${execSubTab === 'programs' ? 'text-[#0E7C86]' : 'text-slate-400'}`} />
              <span>{tr('Central Initiatives & Programs', 'കേന്ദ്ര പരിപാടികൾ')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  execSubTab === 'programs'
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-teal-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {executivePrograms.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setExecSubTab('minutes')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                execSubTab === 'minutes'
                  ? 'bg-white dark:bg-[#0F1B2B] text-[#0F2A4A] dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${execSubTab === 'minutes' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{tr('Council Meeting Minutes', 'കൗൺസിൽ മിനിറ്റ്സ്')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  execSubTab === 'minutes'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {councilMeetingsList.length}
              </span>
            </button>
          </div>

          {/* Sub-View 1: Executive Programs List */}
          {execSubTab === 'programs' && (
            <div className="space-y-3">
              <SectionHeader
                title={tr('Executive Central Programs', 'കേന്ദ്ര പ്രോഗ്രാമുകൾ')}
                badge={executivePrograms.length}
                subtitle={tr('Campus-wide events, assemblies & orientation drives organized by the Executive Council', 'യൂണിയൻ നേരിട്ട് നടത്തുന്ന ക്യാമ്പസ് പരിപാടികൾ')}
                actionLabel={tr('+ Add Program', '+ പ്രോഗ്രാം')}
                onAction={handleOpenAddExecutiveProgram}
                icon={Layers}
              />

              {executivePrograms.length === 0 ? (
                <Card className="text-center py-10 sm:py-12 border-dashed">
                  <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-[#0E7C86] mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {tr('No central programs scheduled yet', 'കേന്ദ്ര പ്രോഗ്രാമുകൾ ഒന്നും ചേർത്തിട്ടില്ല')}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    {tr(
                      'Schedule college assemblies, orientation drives, or central union programs.',
                      'കോളേജ് അസംബ്ലികൾ, ഓറിയന്റേഷൻ, തുടങ്ങിയവ ഷെഡ്യൂൾ ചെയ്യുക.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddExecutiveProgram}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{tr('+ Add First Program', '+ ആദ്യ പ്രോഗ്രാം ചേർക്കുക')}</span>
                  </button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {executivePrograms.map(prog => (
                    <Card key={prog.id} className="!p-4 sm:!p-5 hover:border-teal-300 dark:hover:border-teal-800 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Tag variant="amber" size="sm">
                              {tr('Executive Council', 'എക്സിക്യൂട്ടീവ്')}
                            </Tag>
                            <Tag
                              variant={
                                prog.status === 'completed'
                                  ? 'emerald'
                                  : prog.status === 'ongoing'
                                  ? 'indigo'
                                  : 'teal'
                              }
                              size="sm"
                            >
                              {prog.status || 'Upcoming'}
                            </Tag>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#0E7C86]" />
                              {prog.date}
                            </span>
                            {prog.time && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {prog.time}
                              </span>
                            )}
                            {prog.venue && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                {prog.venue}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-sm sm:text-base text-[#0F2A4A] dark:text-white">
                            {prog.title}
                          </h4>

                          {prog.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {prog.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              <strong>{prog.registeredStudents?.length || 0}</strong> registered
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProgram(prog)}
                            className="p-1.5 text-slate-500 hover:text-[#0E7C86] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit Program"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete program "${prog.title}"?`)) {
                                deleteWingProgram(prog.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Program"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-View 2: Council Meeting Minutes List */}
          {execSubTab === 'minutes' && (
            <div className="space-y-3">
              <SectionHeader
                title={tr('Council Meeting Minutes & Resolutions', 'കൗൺസിൽ മിനിറ്റ്സ് & തീരുമാനങ്ങൾ')}
                badge={councilMeetingsList.length}
                subtitle={tr('Official records, resolutions, agendas & attendance logs', 'ഔദ്യോഗിക മീറ്റിംഗ് രേഖകളും കൗൺസിൽ തീരുമാനങ്ങളും')}
                actionLabel={tr('+ Record Minutes', '+ മിനിറ്റ്സ്')}
                onAction={handleOpenAddMeeting}
                icon={Lock}
              />

              {councilMeetingsList.length === 0 ? (
                <Card className="text-center py-10 sm:py-12 border-dashed">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {tr('No council meeting minutes recorded yet', 'മീറ്റിംഗ് മിനിറ്റ്സുകൾ ഒന്നും ചേർത്തിട്ടില്ല')}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    {tr(
                      'Record executive council sessions, agendas, attendees, and formal resolutions.',
                      'കൗൺസിൽ യോഗങ്ങളും അവയിലെ തീരുമാനങ്ങളും രേഖപ്പെടുത്തുക.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddMeeting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F2A4A] hover:bg-[#1A3F6B] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>{tr('+ Record First Meeting', '+ ആദ്യ മീറ്റിംഗ് രേഖപ്പെടുത്തുക')}</span>
                  </button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {councilMeetingsList.map(m => (
                    <Card key={m.id} className="!p-4 sm:!p-5 hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
                      <div className="space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Tag variant="amber" size="sm">
                                {tr('Executive Council', 'എക്സിക്യൂട്ടീവ്')}
                              </Tag>
                              <Tag variant="indigo" size="sm">
                                <Lock className="w-3 h-3 inline mr-0.5 text-indigo-500" />
                                {tr('Official Minutes', 'ഔദ്യോഗിക മിനിറ്റ്സ്')}
                              </Tag>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#0E7C86]" />
                                {m.date}
                              </span>
                              {m.time && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {m.time}
                                </span>
                              )}
                              {m.venue && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-rose-500" />
                                  {m.venue}
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm sm:text-base text-[#0F2A4A] dark:text-white pt-0.5">
                              {m.title}
                            </h4>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMeeting(m)}
                              className="p-1.5 text-slate-500 hover:text-[#0E7C86] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Edit Meeting"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete meeting "${m.title}"?`)) {
                                  deleteWingProgram(m.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                              title="Delete Meeting"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Attendees */}
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-slate-800 dark:text-slate-200">Attendees: </strong>
                            {Array.isArray(m.attendees) && m.attendees.length > 0
                              ? m.attendees.join(', ')
                              : (m.attendeesText || 'Union Executive Council Members')}
                          </span>
                        </div>

                        {/* Agenda */}
                        {m.agenda && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-800 dark:text-slate-200">Agenda: </strong>
                            <span>{m.agenda}</span>
                          </div>
                        )}

                        {/* Resolutions */}
                        {m.decisions && (
                          <div className="pt-1">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">
                              Key Resolutions &amp; Decisions:
                            </span>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                              {m.decisions}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION: OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="px-4 sm:px-6 space-y-6">
          {/* CONSOLIDATED UNIFIED STAT BADGE CONTAINER (Small Crisp Icons & Micro-Animations) */}
          <div className="animate-bottom-up rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0F1B2B]/95 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80 gap-y-3 sm:gap-y-0">
              {/* 1. Union Wings */}
              <button
                type="button"
                onClick={() => setActiveSection('programs')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Folder className="w-4 h-4 text-[#0E7C86] dark:text-teal-400 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {wings.length}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('Union Wings', 'യൂണിയൻ വിംഗുകൾ')}
                </span>
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 block truncate leading-none mt-1">
                  autonomous wings
                </span>
              </button>

              {/* 2. Total Programs */}
              <button
                type="button"
                onClick={() => setActiveSection('programs')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Layers className="w-4 h-4 text-blue-600 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {totalPrograms}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('Total Programs', 'പരിപാടികൾ')}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block truncate leading-none mt-1">
                  logged activities
                </span>
              </button>

              {/* 3. Competitions */}
              <button
                type="button"
                onClick={() => setActiveSection('competitions')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center pt-3 sm:pt-2.5"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Trophy className="w-4 h-4 text-amber-500 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {totalCompetitions}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('Competitions', 'മത്സരങ്ങൾ')}
                </span>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block truncate leading-none mt-1">
                  {announcedResults} {tr('published', 'പ്രഖ്യാപിച്ചു')}
                </span>
              </button>

              {/* 4. Council Meetings */}
              <button
                type="button"
                onClick={() => setActiveSection('meetings')}
                className="p-2 sm:p-2.5 text-center group cursor-pointer active:scale-95 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-200 focus:outline-none flex flex-col items-center justify-center pt-3 sm:pt-2.5"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800/60 flex items-center justify-center mb-1.5 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 shadow-2xs">
                  <Lock className="w-4 h-4 text-purple-500 animate-float-slow" />
                </div>
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white block tracking-tight leading-none mb-1 tabular-nums">
                  {totalMeetings}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block truncate leading-tight">
                  {tr('Council Meetings', 'കൗൺസിൽ മീറ്റിംഗുകൾ')}
                </span>
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block truncate leading-none mt-1">
                  minutes recorded
                </span>
              </button>
            </div>
          </div>

          {/* Quick Wings Snapshot Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center justify-between">
              <span>Union Wings Operations Snapshot</span>
              <button
                type="button"
                onClick={() => setActiveSection('programs')}
                className="text-xs text-[#0E7C86] dark:text-teal-400 hover:underline font-bold"
              >
                View All Programs &rarr;
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wings.map(wing => {
                const wingProgs = wingPrograms.filter(p => p.wingId === wing.id);
                const wingMembers = unionOfficials.filter(o => o.assignedWingId === wing.id);

                return (
                  <WingCard
                    key={wing.id}
                    name={wing.name}
                    code={wing.shortName || wing.id.slice(0, 2).toUpperCase()}
                    color={wing.color || '#0E7C86'}
                    description={wing.description}
                    memberCount={wingMembers.length}
                    programsCount={wingProgs.length}
                    conveners={wingMembers.map(m => ({ name: m.name }))}
                    onOpen={() => {
                      setSelectedWingFilter(wing.id);
                      setActiveSection('programs');
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: GENERAL PROGRAMS */}
      {activeSection === 'programs' && (
        <div className="px-4 sm:px-6">
          <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
                {tr('General Programs & Workshops', 'പൊതുപരിപാടികളും ശിൽപ്പശാലകളും')}
              </h3>
              <p className="text-xs text-slate-500">
                {tr('Seminars, workshops, classes, and cultural gatherings.', 'സെമിനാറുകൾ, ക്ലാസുകൾ, സാംസ്കാരിക കൂട്ടായ്മകൾ.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddProgram('activity')}
              className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Program</span>
            </button>
          </div>

          {filteredGeneralPrograms.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No general programs found matching filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGeneralPrograms.map(prog => {
                const wing = wings.find(w => w.id === prog.wingId);

                return (
                  <div key={prog.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-bold uppercase text-white"
                          style={{ backgroundColor: wing?.color || '#0E7C86' }}
                        >
                          {wing?.shortName || 'Wing'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {prog.date}
                        </span>
                        {prog.venue && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {prog.venue}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                        {prog.title}
                      </h4>

                      {prog.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">
                          {prog.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProgram(prog)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0E7C86] transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete program "${prog.title}"?`)) {
                            deleteWingProgram(prog.id);
                          }
                        }}
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      )}

      {/* SECTION: COMPETITIONS */}
      {activeSection === 'competitions' && (
        <div className="px-4 sm:px-6">
          <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{tr('Inter-Wing Competitions & Winners', 'മത്സരങ്ങളും ഫലപ്രഖ്യാപനവും')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {tr('Assign 1st, 2nd, and 3rd place winners. Results will reflect in real time on student profiles.', '1st, 2nd, 3rd സ്ഥാനക്കാരെ നൽകുക. ഫലങ്ങൾ വിദ്യാർത്ഥിയുടെ പ്രൊഫൈലിൽ തത്സമയം ലഭ്യമാകും.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddProgram('competition')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Competition</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredCompetitions.map(comp => {
              const wing = wings.find(w => w.id === comp.wingId);
              const hasWinners = Boolean(comp.winners?.firstPlace);

              return (
                <div
                  key={comp.id}
                  className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase text-white"
                        style={{ backgroundColor: wing?.color || '#0E7C86' }}
                      >
                        {wing?.name || 'Wing'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasWinners
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
                              <span>1st:</span>
                              <strong>{comp.winners.firstPlace.name}</strong>
                            </span>
                            <span className="font-mono text-slate-500">
                              {comp.winners.firstPlace.cicNo}
                            </span>
                          </div>
                          {comp.winners.secondPlace && (
                            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <span>2nd:</span>
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
                                <span>3rd:</span>
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
                          {tr('No winners assigned yet. Click the button below.', 'വിജയികളെ തെരഞ്ഞെടുത്തിട്ടില്ല. താഴെയുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProgram(comp)}
                      className="text-xs text-slate-500 hover:text-[#0E7C86] font-semibold"
                    >
                      {tr('Edit Details', 'എഡിറ്റ് വിവരങ്ങൾ')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenResultsModal(comp)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>{hasWinners ? tr('Update Winners', 'വിജയികളെ തിരുത്തുക') : tr('Enter Winners', 'വിജയികളെ നൽകുക')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* SECTION: CONFIDENTIAL MEETINGS */}
      {activeSection === 'meetings' && (
        <div className="px-4 sm:px-6">
          <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{tr('Official Confidential Minutes', 'ഔദ്യോഗിക രഹസ്യരേഖ')}</span>
              </div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <span>{tr('Union & Wing Council Meetings & Resolutions', 'യൂണിയൻ & വിംഗ് കൗൺസിൽ മീറ്റിംഗുകൾ')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                  {filteredMeetings.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {tr('Council meeting minutes, attendance register, and key resolutions. Strictly hidden from student portal.', 'കൗൺസിൽ യോഗങ്ങളുടെ മിനിറ്റ്സുകൾ, പങ്കെടുത്തവരുടെ ലിസ്റ്റ്, എടുത്ത പ്രധാന തീരുമാനങ്ങൾ. വിദ്യാർത്ഥി പോർട്ടലിൽ പൂർണ്ണമായും മറച്ചിരിക്കും.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddMeeting}
              className="px-4 py-2 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Meeting Minutes</span>
            </button>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No meetings found matching filters.
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {filteredMeetings.map((m, idx) => {
                const wing = wings.find(w => w.id === m.wingId);

                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded font-bold uppercase text-white"
                            style={{ backgroundColor: wing?.color || '#0E7C86' }}
                          >
                            {wing?.shortName || 'Union'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {m.date} {m.time ? `• ${m.time}` : ''}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-[#0F2A4A] dark:text-white">
                          {m.title}
                        </h4>
                        {m.venue && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{m.venue}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMeeting(m)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-[#0E7C86] transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete meeting "${m.title}"?`)) {
                              deleteWingProgram(m.id);
                            }
                          }}
                          className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Attendees */}
                    <div className="text-xs">
                      <strong className="text-slate-800 dark:text-slate-200">{tr('Attendees: ', 'പങ്കെടുത്തവർ: ')}</strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        {Array.isArray(m.attendees) && m.attendees.length > 0
                          ? m.attendees.join(', ')
                          : (m.attendeesText || tr('Union Officials', 'യൂണിയൻ ഭാരവാഹികൾ'))}
                      </span>
                    </div>

                    {/* Agenda */}
                    {m.agenda && (
                      <div className="text-xs">
                        <strong className="text-slate-800 dark:text-slate-200">{tr('Agenda: ', 'അജണ്ട: ')}</strong>
                        <span className="text-slate-600 dark:text-slate-400">{m.agenda}</span>
                      </div>
                    )}

                    {/* Resolutions */}
                    {m.decisions && (
                      <div className="text-xs pt-1">
                        <strong className="text-slate-900 dark:text-white block mb-1">
                          {tr('Key Resolutions Taken:', 'എടുത്ത പ്രധാന തീരുമാനങ്ങൾ:')}
                        </strong>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                          {m.decisions}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      )}

      {/* SECTION: SUMMIT STANDINGS */}
      {activeSection === 'summit_monitor' && (
        <div className="px-4 sm:px-6">
          <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-teal-600" />
                <span>Fine Arts Wing &bull; MUSF Summit Register Standings</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live leaderboard snapshot for the 3 competing houses: <strong>Team A, Team B, Team C</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {teamStandings.map((team, idx) => (
                <div
                  key={team.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-xs relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full text-white uppercase ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-500' : 'bg-orange-600'
                      }`}>
                      Rank #{idx + 1}
                    </span>
                    <span className="text-2xl font-black font-mono text-[#0F2A4A] dark:text-white">
                      {team.totalScore?.toFixed(1) || '0.0'} pts
                    </span>
                  </div>

                  <h4 className="font-bold text-lg text-[#0F2A4A] dark:text-white">
                    {team.name}
                  </h4>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Wins</span>
                      <strong className="text-slate-800 dark:text-slate-200">{team.firstPlaces || 0} 1st / {team.secondPlaces || 0} 2nd</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Programs</span>
                      <strong className="text-slate-800 dark:text-slate-200">{team.participationsCount || 0} entries</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: OFFICE BEARERS */}
      {activeSection === 'officials' && (
        <div className="px-4 sm:px-6">
          <UnionOfficialsManager />
        </div>
      )}

      {/* SECTION: WINGS CONTROL */}
      {(activeSection === 'wings_control' || activeSection === 'wings') && (
        <div className="px-4 sm:px-6">
          <UnionWingsManager
            onOpenSummitModule={() => setActiveSection('summit_monitor')}
            onOpenSportsModule={() => setActiveSection('college_sports')}
          />
        </div>
      )}

      {/* SECTION: COLLEGE SPORTS */}
      {activeSection === 'college_sports' && (
        <div className="px-4 sm:px-6 space-y-6">
          <SportsWingManager
            onOpenCertificateModal={() => {}}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenPostNotice={() => setIsPostNotifOpen(true)}
          />
        </div>
      )}

      {/* MODAL: GENERAL PROGRAM */}
      <Modal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        title={editingProgram ? 'Edit Program' : 'Add Program'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Program Title *
            </label>
            <input
              type="text"
              required
              value={programForm.title}
              onChange={(e) => setProgramForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. All Kerala Inter-Collegiate Quiz, Football Tourney..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Conducting Wing
              </label>
              <select
                value={programForm.wingId}
                onChange={(e) => setProgramForm(prev => ({ ...prev, wingId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              >
                {wings.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={programForm.type}
                onChange={(e) => setProgramForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              >
                <option value="activity">General Activity / Workshop</option>
                <option value="competition">Competitive Event (Prizes)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={programForm.date}
                onChange={(e) => setProgramForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={programForm.time}
                onChange={(e) => setProgramForm(prev => ({ ...prev, time: e.target.value }))}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Venue
            </label>
            <input
              type="text"
              value={programForm.venue}
              onChange={(e) => setProgramForm(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="e.g. Campus Football Ground, Seminar Hall..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description &amp; Highlights
            </label>
            <textarea
              rows={3}
              value={programForm.description}
              onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Outline the objectives, rules, and outcomes..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsProgramModalOpen(false)}
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

      {/* MODAL: CONFIDENTIAL MEETING */}
      <Modal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        title={editingMeeting ? 'Edit Council Meeting Minutes' : 'Record Union / Wing Meeting Minutes'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveMeeting} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{tr('This is an official confidential document. Visible only to authorized officials.', 'ഇത് ഔദ്യോഗിക രഹസ്യരേഖയാണ്. ഭാരവാഹികൾക്ക് മാത്രമേ കാണാൻ സാധിക്കൂ.')}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Meeting Title *', 'യോഗത്തിന്റെ തലക്കെട്ട് *')}
            </label>
            <input
              type="text"
              required
              value={meetingForm.title}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder={tr("e.g. Union Executive Council Meeting", "ഉദാ: യൂണിയൻ എക്സിക്യൂട്ടീവ് കൗൺസിൽ യോഗം")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                {tr('Wing', 'വിഭാഗം')}
              </label>
              <select
                value={meetingForm.wingId}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, wingId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              >
                {wings.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                {tr('Meeting Date *', 'തീയതി *')}
              </label>
              <input
                type="date"
                value={meetingForm.date}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                {tr('Meeting Time', 'സമയം')}
              </label>
              <input
                type="text"
                value={meetingForm.time}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                placeholder="04:30 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Venue', 'സ്ഥലം / വേദി')}
            </label>
            <input
              type="text"
              value={meetingForm.venue}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, venue: e.target.value }))}
              placeholder={tr("Union Council Chamber / Seminar Hall", "യൂണിയൻ ഓഫീസ് / സെമിനാർ ഹാൾ")}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Attendees (Comma-separated)', 'പങ്കെടുത്തവർ (കോമയിട്ട് നൽകുക)')}
            </label>
            <input
              type="text"
              value={meetingForm.attendeesText}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, attendeesText: e.target.value }))}
              placeholder={tr("Chairman, General Secretary, Wing Conveners...", "ചെയർമാൻ, ജനറൽ സെക്രട്ടറി, വിംഗ് കൺവീനർമാർ...")}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Meeting Agenda', 'അജണ്ട')}
            </label>
            <input
              type="text"
              value={meetingForm.agenda}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, agenda: e.target.value }))}
              placeholder={tr("Performance review, sanctions, upcoming events...", "പ്രവർത്തനങ്ങൾ വിലയിരുത്തൽ, അനുമതി നൽകൽ...")}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Key Resolutions Taken *', 'എടുത്ത പ്രധാന തീരുമാനങ്ങൾ *')}
            </label>
            <textarea
              rows={4}
              required
              value={meetingForm.decisions}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, decisions: e.target.value }))}
              placeholder={tr("1. Scheduled upcoming summit programs...\n2. Approved budget...", "1. അടുത്ത പരിപാടിയുടെ തീയതി നിശ്ചയിച്ചു...\n2. ബജറ്റ് അംഗീകരിച്ചു...")}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMeetingModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F2A4A] dark:bg-[#0E7C86] text-white text-xs font-bold transition shadow-xs"
            >
              {tr('Save Minutes', 'സൂക്ഷിക്കുക (Save Minutes)')}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: COMPETITION RESULTS ENTRY */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Enter Winners: ${targetProgram?.title || 'Competition'}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveResults} className="space-y-4">
          <p className="text-xs text-slate-500">
            {tr('Winning students will be awarded official union medals and certificate honors.', 'വിജയികളായ വിദ്യാർത്ഥികൾക്ക് യൂണിയൻ മെഡലുകളും സർട്ടിഫിക്കറ്റ് പോയിന്റുകളും നൽകപ്പെടും.')}
          </p>

          {/* 1st Place */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300">
                {tr('1st Place Winner *', 'ഒന്നാം സ്ഥാനം *')}
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span>{tr("Points:", "പോയിന്റ്:")}</span>
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
              <option value="">-- {tr("Select Student", "വിദ്യാർത്ഥിയെ തെരഞ്ഞെടുക്കുക")} --</option>
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
                <span>{tr("Points:", "പോയിന്റ്:")}</span>
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
              <option value="">-- {tr("Select Student (Optional)", "വിദ്യാർത്ഥിയെ തെരഞ്ഞെടുക്കുക (Optional)")} --</option>
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
                <span>{tr("Points:", "പോയിന്റ്:")}</span>
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
              <option value="">-- {tr("Select Student (Optional)", "വിദ്യാർത്ഥിയെ തെരഞ്ഞെടുക്കുക (Optional)")} --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cicNo}) - {s.classId?.toUpperCase()} {s.place ? `• ${s.place}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              {tr('Remarks / Official Notes', 'കുറിപ്പ് / Official Remarks')}
            </label>
            <input
              type="text"
              value={resultForm.remarks}
              onChange={(e) => setResultForm(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="e.g. Unanimous decision by jury..."
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
              Save &amp; Announce Winners
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL MALAYALAM MONTHLY REPORT MODAL */}
      <OfficialMalayalamReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultWingId={selectedWingFilter !== 'all' ? selectedWingFilter : (wings[0]?.id || 'fine_arts')}
      />

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
