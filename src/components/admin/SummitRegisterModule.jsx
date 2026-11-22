import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SummitManagement } from './SummitManagement';
import { ProgramLibraryManagement } from './ProgramLibraryManagement';
import { ProgramManagement } from './ProgramManagement';
import { AttendanceManager } from '../attendance/AttendanceManager';
import { MarksManagement } from './MarksManagement';
import { TeamAndClassManagement } from './TeamAndClassManagement';
import { BulkTeamAssignment } from './BulkTeamAssignment';
import { LeaderManagement } from './LeaderManagement';
import { JudgeManagement } from './JudgeManagement';
import { ReportsAnalytics } from './ReportsAnalytics';
import { CertificatesManager } from './CertificatesManager';
import { LiveScoreboard } from '../scoreboard/LiveScoreboard';
import {
  Calendar,
  BookOpen,
  Layers,
  Clock,
  Scale,
  Award,
  FileCheck,
  Trophy,
  Users,
  Palette,
  ShieldAlert,
  ArrowRightLeft,
  Lock,
  ShieldCheck
} from 'lucide-react';

export const SummitRegisterModule = ({ onBack }) => {
  const { t, tr } = useLanguage();
  const { currentUser } = useAuth();
  const { summits = [], programs = [], programLibrary = [], students = [], teams = [] } = useApp();
  const [subTab, setSubTab] = useState('summits');

  // Permission Check: Strictly Admin & Fine Arts Wing Members
  const isAdmin = currentUser?.role === 'admin';
  const isFineArtsMember = (
    currentUser?.role === 'convener' && (
      currentUser?.assignedWingId === 'fine_arts' ||
      currentUser?.username === 'convener_finearts' ||
      currentUser?.username?.toLowerCase().includes('fine') ||
      currentUser?.designation?.toLowerCase().includes('fine') ||
      currentUser?.cicNo === '21724'
    )
  ) || (
    currentUser?.role === 'executive' && (
      currentUser?.assignedWingId === 'fine_arts' ||
      currentUser?.designation?.toLowerCase().includes('fine')
    )
  );

  const canEditSummit = isAdmin || isFineArtsMember;

  const unassignedCount = useMemo(() => {
    return students.filter(s => !s.teamId).length;
  }, [students]);

  const tabs = [
    { id: 'summits', label: 'Summits', icon: Calendar, badge: summits?.length || 0, isEdit: true },
    { id: 'bulk_team_assign', label: 'Bulk Team Assignment', icon: ArrowRightLeft, badge: unassignedCount > 0 ? `${unassignedCount} Unassigned` : undefined, isEdit: true },
    { id: 'teams', label: 'House Teams (A, B, C)', icon: Users, isEdit: true },
    { id: 'library', label: '101 Events Library', icon: BookOpen, badge: programLibrary?.length || 0, isEdit: true },
    { id: 'programs', label: 'Summit Programs', icon: Layers, badge: programs?.length || 0, isEdit: true },
    { id: 'marks', label: 'Marks Moderation', icon: Award, isEdit: true },
    { id: 'attendance', label: '3-Tier Attendance', icon: Clock, isEdit: true },
    { id: 'leaders', label: 'Team Leaders', icon: Users, isEdit: true },
    { id: 'judges', label: 'Judges & Blind Mode', icon: Scale, isEdit: true },
    { id: 'scoreboard', label: 'Live Leaderboard', icon: Trophy, isEdit: false },
    { id: 'certificates', label: 'Certificates', icon: FileCheck, isEdit: true },
    { id: 'reports', label: 'Reports', icon: FileCheck, isEdit: false }
  ];

  return (
    <div className="space-y-6">
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <span>&larr; Back to Union wings</span>
          </button>
        </div>
      )}

      {/* Module Pillar Header - Clean Institutional Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-[#0F2A4A] dark:text-white">
              Fine Arts Summit register
            </h2>
            {canEditSummit ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full Editing Authorized</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Read-Only View</span>
              </span>
            )}
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Collegiate arts evaluations: {programLibrary?.length || 0} events library across batches, house teams, nominations, and scoring.
            {!canEditSummit && " (Editing restricted strictly to Admin and Fine Arts Wing officials)."}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <div className="px-3 py-0.5 border-r border-slate-200 dark:border-slate-700">
            <div className="text-xl font-semibold text-[#0F2A4A] dark:text-white tabular-nums">{summits?.length || 0}</div>
            <div className="text-xs text-slate-500">Summits</div>
          </div>
          <div className="px-3 py-0.5 border-r border-slate-200 dark:border-slate-700">
            <div className="text-xl font-semibold text-[#0F2A4A] dark:text-white tabular-nums">{programLibrary?.length || 0}</div>
            <div className="text-xs text-slate-500">Events</div>
          </div>
          <div className="px-3 py-0.5">
            <div className="text-xl font-semibold text-[#0E7C86] tabular-nums">{teams?.length || 3}</div>
            <div className="text-xs text-slate-500">Teams</div>
          </div>
        </div>
      </div>

      {!canEditSummit && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Summit Editing Restricted: </span>
            <span>Summit scheduling, programs, team grouping, and marks moderation are strictly reserved for College Administration and Fine Arts Wing officials.</span>
          </div>
        </div>
      )}

      {/* Internal Navigation Sub-Tabs */}
      <div className="bg-white dark:bg-[#0F1B2B] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#0E7C86] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.isEdit && !canEditSummit && (
                  <Lock className="w-2.5 h-2.5 text-amber-500" />
                )}
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Viewport */}
      <div>
        {!canEditSummit && tabs.find(t => t.id === subTab)?.isEdit ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-3">
            <Lock className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
              Editing Restricted to Admin & Fine Arts Wing
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All Summit management, program allocation, team assignment, and marks moderation are reserved for Admin and Fine Arts Wing conveners/members. You can inspect the Live Leaderboard and Reports.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setSubTab('scoreboard')}
                className="px-4 py-2 rounded-xl bg-[#0E7C86] text-white text-xs font-bold hover:bg-[#0c6b74] transition"
              >
                View Live Leaderboard
              </button>
              <button
                type="button"
                onClick={() => setSubTab('reports')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                View Reports
              </button>
            </div>
          </div>
        ) : (
          <div>
            {subTab === 'summits' && <SummitManagement />}
            {subTab === 'bulk_team_assign' && <BulkTeamAssignment />}
            {subTab === 'library' && <ProgramLibraryManagement />}
            {subTab === 'programs' && <ProgramManagement />}
            {subTab === 'marks' && <MarksManagement />}
            {subTab === 'attendance' && <AttendanceManager />}
            {subTab === 'leaders' && <LeaderManagement />}
            {subTab === 'judges' && <JudgeManagement />}
            {subTab === 'scoreboard' && <LiveScoreboard />}
            {subTab === 'certificates' && <CertificatesManager />}
            {subTab === 'teams' && <TeamAndClassManagement />}
            {subTab === 'reports' && <ReportsAnalytics />}
          </div>
        )}
      </div>
    </div>
  );
};
