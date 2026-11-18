import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  Shield,
  Crown,
  Gavel,
  Scale,
  Award,
  Bell,
  BarChart3,
  FileCheck,
  Settings,
  Clock,
  CheckCircle2,
  Trophy,
  BookOpen,
  UserPlus
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  if (!currentUser) return null;

  // Tabs by Role
  const adminTabs = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'summits', label: t.nav.summits, icon: Calendar },
    { id: 'library', label: 'Program Library & Fields', icon: BookOpen },
    { id: 'programs', label: 'Summit Program Matrix', icon: Layers },
    { id: 'attendance', label: t.nav.attendance, icon: Clock },
    { id: 'marks', label: t.nav.marks, icon: Scale },
    { id: 'students', label: t.nav.students, icon: Users },
    { id: 'teams', label: 'Team Management', icon: Shield },
    { id: 'leaders', label: t.nav.leaders, icon: Crown },
    { id: 'judges', label: t.nav.judges, icon: Gavel },
    { id: 'notices', label: t.nav.notifications, icon: Bell },
    { id: 'reports', label: t.nav.reports, icon: BarChart3 },
    { id: 'certificates', label: t.nav.certificates, icon: FileCheck },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const leaderTabs = [
    { id: 'overview', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'nominations', label: 'Summit Nominations', icon: UserPlus },
    { id: 'members', label: 'Team Members', icon: Users },
    { id: 'attendance', label: 'Take Attendance', icon: Clock },
    { id: 'mark_upload', label: 'Upload Marks', icon: Scale },
    { id: 'results', label: 'Published Marks', icon: Award },
    { id: 'leaderboard', label: 'House Standings', icon: Trophy }
  ];

  const judgeTabs = [
    { id: 'evaluation', label: 'Scoring Console', icon: Gavel },
    { id: 'history', label: 'Evaluation History', icon: Scale },
  ];

  const studentTabs = [
    { id: 'overview', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'programs', label: 'My Programs', icon: Layers },
    { id: 'marks', label: 'My Marks & Grades', icon: Award },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'certificates', label: 'Certificates', icon: FileCheck }
  ];

  const currentTabs = currentUser.role === 'admin' ? adminTabs
    : currentUser.role === 'leader' ? leaderTabs
    : currentUser.role === 'judge' ? judgeTabs
    : studentTabs;

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white dark:bg-[#0B1522] border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100dvh-4rem)]">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation ({currentUser.role})
        </div>

        {currentTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
