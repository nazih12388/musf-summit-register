import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
  XCircle,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  Lock,
  Check,
  UserCheck,
  UserX
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { OfficialMalayalamReportModal } from '../reports/OfficialMalayalamReportModal';
import { SportsWingManager } from '../sports/SportsWingManager';
import { isMandatoryWing } from '../../utils/wingHelper';

const ICON_MAP = {
  Palette,
  BookOpen,
  HeartHandshake,
  Trophy,
  GraduationCap,
  Camera,
  Folder
};

export const UnionWingsManager = ({ onOpenSummitModule, onOpenSportsModule }) => {
  const { currentUser } = useAuth();
  const { lang, tr } = useLanguage();
  const {
    wings = [],
    addWing,
    updateWing,
    deleteWing,
    wingPrograms = [],
    addWingProgram,
    updateWingProgram,
    deleteWingProgram,
    toggleProgramRegistration,
    markWingProgramAttendance,
    markAllWingProgramAttendance,
    unionOfficials = [],
    students = [],
    programs = [],
    certificates = [],
    addCertificate,
    classes = [],
    teams = []
  } = useApp();

  const [selectedWingId, setSelectedWingId] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isWingModalOpen, setIsWingModalOpen] = useState(false);
  const [editingWing, setEditingWing] = useState(null);
  const [wingFormData, setWingFormData] = useState({
    name: '',
    shortName: '',
    code: '',
    description: '',
    icon: 'Folder',
    color: '#0E7C86'
  });

  // Certificate Allocation Modal State (Admin can issue certificates for ANY wing)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    wingId: wings[0]?.id || 'fine_arts',
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

  // Program Modal State (Add & Edit)
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [progFormData, setProgFormData] = useState({
    wingId: wings[0]?.id || 'fine_arts',
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'activity',
    venue: '',
    description: '',
    isRegistrationOpen: true,
    maxRegistrations: 0
  });

  // Attendance & Registrations Modal State
  const [attendanceProgId, setAttendanceProgId] = useState(null);
  const activeAttendanceProg = wingPrograms.find(p => p.id === attendanceProgId) || null;

  const openAddWing = () => {
    setEditingWing(null);
    setWingFormData({
      name: '',
      shortName: '',
      code: '',
      description: '',
      icon: 'Folder',
      color: '#0E7C86'
    });
    setIsWingModalOpen(true);
  };

  const openEditWing = (w) => {
    setEditingWing(w);
    setWingFormData({
      name: w.name,
      shortName: w.shortName || w.name,
      code: w.code || '',
      description: w.description || '',
      icon: w.icon || 'Folder',
      color: w.color || '#0E7C86'
    });
    setIsWingModalOpen(true);
  };

  const handleSaveWing = (e) => {
    e.preventDefault();
    if (editingWing) {
      updateWing(editingWing.id, wingFormData, currentUser?.username || 'admin');
    } else {
      addWing(wingFormData, currentUser?.username || 'admin');
    }
    setIsWingModalOpen(false);
  };

  const handleDeleteWing = (id) => {
    const target = wings.find(x => x.id === id);
    if (isMandatoryWing(target)) {
      alert('Fine Arts and Sports are mandatory core wings and cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this Union Wing? Associated programs will remain.')) {
      try {
        deleteWing(id, currentUser?.username || 'admin');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleOpenAddProgram = () => {
    setEditingProg(null);
    setProgFormData({
      wingId: selectedWingId === 'all' ? (wings[0]?.id || 'sports') : selectedWingId,
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      type: 'activity',
      venue: '',
      description: '',
      isRegistrationOpen: true,
      maxRegistrations: 0
    });
    setIsProgModalOpen(true);
  };

  const handleOpenEditProgram = (p) => {
    setEditingProg(p);
    setProgFormData({
      wingId: p.wingId || wings[0]?.id || 'sports',
      title: p.title || '',
      date: p.date || new Date().toISOString().split('T')[0],
      time: p.time || '10:00 AM',
      type: p.type || 'activity',
      venue: p.venue || '',
      description: p.description || '',
      isRegistrationOpen: p.isRegistrationOpen !== undefined ? Boolean(p.isRegistrationOpen) : true,
      maxRegistrations: p.maxRegistrations || 0
    });
    setIsProgModalOpen(true);
  };

  const handleDeleteProgram = (p) => {
    if (window.confirm(`Are you sure you want to delete the program "${p.title}"?`)) {
      deleteWingProgram(p.id, currentUser?.username || 'admin');
    }
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!progFormData.title.trim()) return;

    if (editingProg) {
      updateWingProgram(editingProg.id, progFormData, currentUser?.username || 'admin');
    } else {
      addWingProgram(progFormData, currentUser?.username || 'admin');
    }
    setIsProgModalOpen(false);
    setEditingProg(null);
  };

  const handleSaveCertificate = (e) => {
    e.preventDefault();
    if (!certForm.studentId) {
      alert('Please select a recipient student.');
      return;
    }
    const student = students.find(s => s.id === certForm.studentId);
    if (!student) {
      alert('Selected student not found.');
      return;
    }
    const wing = wings.find(w => w.id === certForm.wingId);
    const prog = wingPrograms.find(p => p.id === certForm.programId);
    const cl = classes.find(c => c.id === student.classId);
    const tm = teams.find(t => t.id === student.teamId);

    const certificatePayload = {
      studentId: student.id,
      studentName: student.name,
      cicNo: student.cicNo,
      classId: student.classId,
      className: cl?.name || student.className || 'Class',
      teamId: wing?.isSummitModule ? student.teamId : null,
      teamName: wing?.isSummitModule ? (tm?.name || student.teamName || 'Summit House') : '',
      sectionId: student.sectionId || cl?.sectionId || 'thamheediyya',
      wingId: certForm.wingId,
      wingName: wing?.name || 'Union Wing',
      wingShortName: wing?.shortName || wing?.name || 'Wing',
      programId: certForm.programId || null,
      programTitle: prog?.title || 'Union Wing Activity',
      category: certForm.category,
      place: certForm.place || '',
      rank: certForm.place ? (certForm.place === '1st' ? 1 : certForm.place === '2nd' ? 2 : certForm.place === '3rd' ? 3 : null) : null,
      awardTitle: certForm.awardTitle || `${wing?.shortName || 'Wing'} Certificate`,
      citation: certForm.citation || `Awarded for commendable achievement under ${wing?.name || 'the Union'}.`,
      issueDate: certForm.issueDate || new Date().toISOString().slice(0, 10),
      month: (certForm.issueDate || new Date().toISOString()).slice(0, 7),
      monthLabel: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isPublished: true,
      issuedBy: currentUser?.name || currentUser?.username || 'Union Administration'
    };

    addCertificate(certificatePayload, currentUser?.username || 'admin');

    setCertToast(`Certificate issued successfully to ${student.name}!`);
    setTimeout(() => setCertToast(''), 5000);
    setIsCertModalOpen(false);

    // Reset form
    setCertForm({
      wingId: wings[0]?.id || 'fine_arts',
      programId: '',
      studentId: '',
      category: 'WING_WINNER',
      place: '1st',
      awardTitle: '',
      citation: '',
      issueDate: new Date().toISOString().slice(0, 10)
    });
    setCertStudentSearch('');
  };

  const filteredPrograms = selectedWingId === 'all'
    ? wingPrograms
    : wingPrograms.filter(p => p.wingId === selectedWingId);

  return (
    <div className="space-y-6">
      {/* Toast Alert for Certificate Allocation */}
      {certToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-medium text-xs flex items-center justify-between border border-emerald-200 dark:border-emerald-800 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{certToast}</span>
          </div>
          <button
            onClick={() => setCertToast('')}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 text-sm font-bold ml-3 px-2 py-0.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <span>Students' Union Wings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] dark:bg-[#0E7C86]/20 dark:text-teal-300 font-bold">
              {wings.length} Wings
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Manage distinct Union Wings, allocate conveners, create specialized workshops, debates, sports meets, and competitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (selectedWingId === 'all') {
                setSelectedWingId(wings[0]?.id || 'fine_arts');
              }
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-[#0E7C86] dark:text-teal-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            title="Generate Official Malayalam Monthly Report"
          >
            <FileText className="w-4 h-4 text-[#0E7C86] dark:text-teal-400" />
            <span>{tr('Monthly Report (Print PDF)', 'പ്രതിമാസ റിപ്പോർട്ട് (Print PDF)')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCertForm({
                wingId: wings[0]?.id || 'fine_arts',
                programId: '',
                studentId: '',
                category: 'WING_WINNER',
                place: '1st',
                awardTitle: '',
                citation: '',
                issueDate: new Date().toISOString().slice(0, 10)
              });
              setCertStudentSearch('');
              setIsCertModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
            title="Issue Certificate to any student under any wing"
          >
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Issue Wing Certificate</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddProgram}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#0E7C86]" />
            <span>Add Wing Program</span>
          </button>

          <button
            type="button"
            onClick={openAddWing}
            className="px-4 py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Wing</span>
          </button>
        </div>
      </div>

      {/* Wings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wings.map((w, idx) => {
          const Icon = ICON_MAP[w.icon] || Folder;
          const wingProgramsCount = wingPrograms.filter(p => p.wingId === w.id).length;
          const wingMembers = unionOfficials.filter(o => o.assignedWingId === w.id);
          const member1 = wingMembers.find(o => o.wingSlot === 1 || !o.designation?.toLowerCase().includes('joint')) || wingMembers[0];
          const member2 = wingMembers.find(o => (o.wingSlot === 2 || o.designation?.toLowerCase().includes('joint')) && o.id !== member1?.id) || (wingMembers.length > 1 ? wingMembers.find(o => o.id !== member1?.id) : null);

          return (
            <div
              key={w.id}
              style={{ animationDelay: `${Math.min(idx * 70, 420)}ms` }}
              className="animate-bottom-up bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: w.color || '#0E7C86' }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditWing(w)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0E7C86] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Wing"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isMandatoryWing(w) ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 text-[10px] font-bold"
                        title="Mandatory System Wing (Cannot be deleted)"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>Mandatory</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteWing(w.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete Wing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                    {w.name}
                  </h3>
                  {w.code && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 font-semibold">
                      {w.code}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {w.description}
                </p>

                {/* 2 Members per Wing Section */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-slate-500">Convener (Lead):</span>
                      {member1 ? (
                        <strong className="text-slate-800 dark:text-slate-200 truncate">{member1.name}</strong>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 italic">Vacant</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                      {wingProgramsCount} Events
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-500/70 shrink-0" />
                      <span className="text-slate-500">Joint Convener:</span>
                      {member2 ? (
                        <strong className="text-slate-800 dark:text-slate-200 truncate">{member2.name}</strong>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 italic">Vacant</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">Slot 2</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {w.isSummitModule ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof onOpenSummitModule === 'function') {
                        onOpenSummitModule();
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A5F] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Palette className="w-3.5 h-3.5 text-teal-300" />
                    <span>Summit register ({programs.length}) &rarr;</span>
                  </button>
                ) : w.id === 'sports' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof onOpenSportsModule === 'function') {
                        onOpenSportsModule();
                      } else {
                        setSelectedWingId('sports');
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-slate-950" />
                    <span>College Sports ({wingProgramsCount}) &rarr;</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedWingId(w.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Activities ({wingProgramsCount})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedWingId(w.id);
                    setIsReportModalOpen(true);
                  }}
                  className="py-2 px-2.5 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-[#0E7C86] dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 shrink-0"
                  title={`Generate Monthly Report for ${w.name}`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#0E7C86] dark:text-teal-400" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Specialized Sports Wing Manager when Sports is selected */}
      {selectedWingId === 'sports' && (
        <SportsWingManager onOpenCertificateModal={() => setIsCertModalOpen(true)} />
      )}

      {/* Wing Programs & Activities Section */}
      <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <span>Union Activities &amp; Competitions</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                {filteredPrograms.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workshops, seminars, and competitive tourneys conducted across union wings.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedWingId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${selectedWingId === 'all'
                ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
            >
              All Wings
            </button>
            {wings.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWingId(w.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${selectedWingId === w.id
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
              >
                {w.shortName || w.name}
              </button>
            ))}
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No events found for this wing. Click <strong>"Add Wing Program"</strong> above to record the first activity or competition.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPrograms.map((p) => {
              const wing = wings.find(w => w.id === p.wingId);
              const isComp = p.type === 'competition';
              const isMeeting = p.type === 'meeting';

              return (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: wing?.color || '#0E7C86' }}
                      >
                        {wing?.shortName || 'Wing'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isMeeting
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1'
                          : isComp
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                          }`}
                      >
                        {isMeeting ? (
                          <>
                            <Lock className="w-2.5 h-2.5" />
                            <span>{tr('Confidential Meeting Minutes', 'രഹസ്യ മീറ്റിംഗ് മിനിറ്റ്സ്')}</span>
                          </>
                        ) : isComp ? (
                          'Competition'
                        ) : (
                          'Activity / Workshop'
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {p.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white">
                      {p.title}
                    </h4>

                    {p.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-2xl">
                        {p.description}
                      </p>
                    )}

                    {/* Meeting Specifics */}
                    {isMeeting && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs space-y-1">
                        {p.agenda && (
                          <p className="text-slate-700 dark:text-slate-300">
                            <strong>{tr('Agenda:', 'അജണ്ട:')}</strong> {p.agenda}
                          </p>
                        )}
                        {p.decisions && (
                          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                            <strong>{tr('Resolutions:', 'തീരുമാനങ്ങൾ:')}</strong> {p.decisions}
                          </p>
                        )}
                        {p.attendees && (
                          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                            <strong>{tr('Attendees:', 'പങ്കെടുത്തവർ:')}</strong> {Array.isArray(p.attendees) ? p.attendees.join(', ') : p.attendees}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Winners Ribbon if Competition */}
                    {isComp && p.winners && (
                      <div className="pt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        {p.winners.firstPlace && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold text-[11px]">
                            1st: {p.winners.firstPlace.name} ({p.winners.firstPlace.classId?.toUpperCase()})
                          </span>
                        )}
                        {p.winners.secondPlace && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                            2nd: {p.winners.secondPlace.name}
                          </span>
                        )}
                        {p.winners.thirdPlace && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200 font-semibold text-[11px]">
                            3rd: {p.winners.thirdPlace.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 self-start sm:self-center shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                      {p.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>

                    {/* Registration Toggle Switch */}
                    {!isMeeting && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className={`text-[10px] font-bold ${p.isRegistrationOpen ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400'}`}>
                          {p.isRegistrationOpen ? 'Reg. ON' : 'Reg. OFF'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={Boolean(p.isRegistrationOpen)}
                          onClick={() => toggleProgramRegistration(p.id, currentUser?.username || 'admin')}
                          className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            p.isRegistrationOpen ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={p.isRegistrationOpen ? "Turn Registration OFF" : "Turn Registration ON"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              p.isRegistrationOpen ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {/* Attendance / Registered Students Button */}
                    {!isMeeting && (
                      <button
                        type="button"
                        onClick={() => setAttendanceProgId(p.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100 text-[#0E7C86] dark:text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                        title="View registered students and mark attendance"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{tr('Attendance', 'ഹാജർ')} ({Array.isArray(p.registeredStudents) ? p.registeredStudents.length : 0})</span>
                      </button>
                    )}

                    {/* Edit Program Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditProgram(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E7C86] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Program Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Program Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteProgram(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Wing */}
      <Modal
        isOpen={isWingModalOpen}
        onClose={() => setIsWingModalOpen(false)}
        title={editingWing ? 'Edit Union Wing' : 'Create New Union Wing'}
      >
        <form onSubmit={handleSaveWing} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Wing Name *
            </label>
            <input
              type="text"
              required
              value={wingFormData.name}
              onChange={(e) => setWingFormData({ ...wingFormData, name: e.target.value })}
              placeholder="e.g. Environmental & Hygiene Wing"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Short Name
              </label>
              <input
                type="text"
                value={wingFormData.shortName}
                onChange={(e) => setWingFormData({ ...wingFormData, shortName: e.target.value })}
                placeholder="e.g. Environment"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Code
              </label>
              <input
                type="text"
                value={wingFormData.code}
                onChange={(e) => setWingFormData({ ...wingFormData, code: e.target.value })}
                placeholder="e.g. EHW"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description &amp; Objectives
            </label>
            <textarea
              rows="3"
              value={wingFormData.description}
              onChange={(e) => setWingFormData({ ...wingFormData, description: e.target.value })}
              placeholder="What activities, workshops, or competitions does this wing govern?"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Theme Color
              </label>
              <input
                type="color"
                value={wingFormData.color}
                onChange={(e) => setWingFormData({ ...wingFormData, color: e.target.value })}
                className="w-full h-10 p-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Icon
              </label>
              <select
                value={wingFormData.icon}
                onChange={(e) => setWingFormData({ ...wingFormData, icon: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="Folder">Folder</option>
                <option value="Palette">Palette (Arts)</option>
                <option value="BookOpen">Book (Literary)</option>
                <option value="HeartHandshake">Heart / Handshake (Da'wah)</option>
                <option value="Trophy">Trophy (Sports)</option>
                <option value="GraduationCap">Graduation Cap (Academic)</option>
                <option value="Camera">Camera (Media)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsWingModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white text-xs font-bold shadow-xs"
            >
              {editingWing ? 'Save Changes' : 'Create Wing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add / Edit Wing Program */}
      <Modal
        isOpen={isProgModalOpen}
        onClose={() => {
          setIsProgModalOpen(false);
          setEditingProg(null);
        }}
        title={editingProg ? 'Edit Union Program' : 'Add Union Program / Event'}
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Union Wing *
            </label>
            <select
              required
              value={progFormData.wingId}
              onChange={(e) => setProgFormData({ ...progFormData, wingId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
            >
              {wings.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Program Title *
            </label>
            <input
              type="text"
              required
              value={progFormData.title}
              onChange={(e) => setProgFormData({ ...progFormData, title: e.target.value })}
              placeholder="e.g. Annual Campus Debate Colloquium"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Program Type *
              </label>
              <select
                value={progFormData.type}
                onChange={(e) => setProgFormData({ ...progFormData, type: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
              >
                <option value="activity">General Activity / Workshop</option>
                <option value="competition">Competition (1st, 2nd, 3rd Place)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={progFormData.date}
                onChange={(e) => setProgFormData({ ...progFormData, date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                type="text"
                value={progFormData.time}
                onChange={(e) => setProgFormData({ ...progFormData, time: e.target.value })}
                placeholder="e.g. 10:00 AM"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Venue / Location
              </label>
              <input
                type="text"
                value={progFormData.venue}
                onChange={(e) => setProgFormData({ ...progFormData, venue: e.target.value })}
                placeholder="e.g. Main Auditorium"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
              />
            </div>
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
              aria-checked={Boolean(progFormData.isRegistrationOpen)}
              onClick={() => setProgFormData(prev => ({ ...prev, isRegistrationOpen: !prev.isRegistrationOpen }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                progFormData.isRegistrationOpen ? 'bg-[#0E7C86]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  progFormData.isRegistrationOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Objectives
            </label>
            <textarea
              rows="3"
              value={progFormData.description}
              onChange={(e) => setProgFormData({ ...progFormData, description: e.target.value })}
              placeholder="Provide program brief, rules, or agenda..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsProgModalOpen(false);
                setEditingProg(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0E7C86] hover:bg-[#14919D] text-white text-xs font-bold shadow-xs"
            >
              {editingProg ? 'Save Changes' : 'Add Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Registered Students & Attendance Marking */}
      <Modal
        isOpen={Boolean(attendanceProgId)}
        onClose={() => setAttendanceProgId(null)}
        title={activeAttendanceProg ? `${activeAttendanceProg.title} — ${tr('Registered Students & Attendance', 'രജിസ്ട്രേഷൻ & ഹാജർ')}` : 'Attendance'}
        maxWidth="max-w-2xl"
      >
        {activeAttendanceProg && (
          <div className="space-y-4">
            {/* Summary & Bulk Actions */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0F2A4A] dark:text-white">
                    {activeAttendanceProg.registeredStudents?.length || 0} Students Registered
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    activeAttendanceProg.isRegistrationOpen
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

              {/* Bulk Attendance Buttons */}
              {activeAttendanceProg.registeredStudents?.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => markAllWingProgramAttendance(activeAttendanceProg.id, true, currentUser?.username || 'admin')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95"
                    title="Mark all registered students as Present"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>All Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllWingProgramAttendance(activeAttendanceProg.id, false, currentUser?.username || 'admin')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95"
                    title="Mark all registered students as Absent"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>All Absent</span>
                  </button>
                </div>
              )}
            </div>

            {/* Students List */}
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

                      {/* Attendance Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => markWingProgramAttendance(activeAttendanceProg.id, st.studentId, true, currentUser?.username || 'admin')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                            isPresent
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
                          onClick={() => markWingProgramAttendance(activeAttendanceProg.id, st.studentId, false, currentUser?.username || 'admin')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                            isAbsent
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

      {/* MODAL: ADMIN CERTIFICATE ALLOCATION FOR ANY WING */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title="Allocate Certificate (Any Union Wing)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveCertificate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Union Wing *
            </label>
            <select
              value={certForm.wingId}
              onChange={(e) => {
                const wId = e.target.value;
                const w = wings.find(x => x.id === wId);
                setCertForm(prev => ({
                  ...prev,
                  wingId: wId,
                  programId: '',
                  awardTitle: w ? `${w.shortName} Certificate of Honor` : prev.awardTitle
                }));
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            >
              {wings.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.shortName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Program / Activity
            </label>
            <select
              value={certForm.programId}
              onChange={(e) => {
                const pId = e.target.value;
                const p = wingPrograms.find(x => x.id === pId);
                const w = wings.find(x => x.id === certForm.wingId);
                setCertForm(prev => ({
                  ...prev,
                  programId: pId,
                  awardTitle: p ? (prev.place ? `${prev.place} Place - ${p.title}` : `Participation - ${p.title}`) : `${w?.shortName || 'Wing'} Award of Merit`,
                  citation: p ? `Awarded for commendable performance in "${p.title}" organized by ${w?.name || 'the Union'}.` : prev.citation
                }));
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7C86] focus:outline-none"
            >
              <option value="">General Wing Activity / Special Recognition</option>
              {wingPrograms
                .filter(p => p.wingId === certForm.wingId && p.type !== 'meeting')
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.date})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={certForm.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  const prog = wingPrograms.find(x => x.id === certForm.programId);
                  const w = wings.find(x => x.id === certForm.wingId);
                  setCertForm(prev => ({
                    ...prev,
                    category: cat,
                    place: cat === 'WING_WINNER' ? (prev.place || '1st') : '',
                    awardTitle: cat === 'WING_WINNER'
                      ? `${prev.place || '1st'} Place - ${prog?.title || w?.shortName}`
                      : cat === 'WING_PARTICIPATION'
                        ? `Certificate of Participation - ${prog?.title || w?.shortName}`
                        : `Certificate of Appreciation - ${w?.name}`
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
                    const w = wings.find(x => x.id === certForm.wingId);
                    setCertForm(prev => ({
                      ...prev,
                      place: pl,
                      awardTitle: `${pl} Place - ${prog?.title || w?.shortName}`
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

          {/* Student Recipient Selection with live search */}
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
              placeholder="e.g. 1st Place - Campus Photography Contest"
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

      {/* Official Malayalam Monthly Report Generator */}
      <OfficialMalayalamReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultWingId={selectedWingId !== 'all' ? selectedWingId : (wings[0]?.id || 'fine_arts')}
        restrictToWingId={selectedWingId !== 'all' ? selectedWingId : null}
      />
    </div>
  );
};
