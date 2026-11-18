import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  Scale,
  Award,
  Users,
  Gavel,
  Trophy
} from 'lucide-react';

export const MobileTabBar = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Primary tabs for mobile bottom bar
  const adminMobile = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'programs', label: 'Events', icon: Layers },
    { id: 'marks', label: 'Marks', icon: Scale },
    { id: 'reports', label: 'Reports', icon: Award }
  ];

  const leaderMobile = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'nominations', label: 'Nominate', icon: Award },
    { id: 'members', label: 'Team', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'results', label: 'Results', icon: Trophy }
  ];

  const judgeMobile = [
    { id: 'evaluation', label: 'Evaluate', icon: Gavel },
    { id: 'history', label: 'History', icon: Scale }
  ];

  const studentMobile = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'programs', label: 'Programs', icon: Layers },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'certificates', label: 'Certificates', icon: Award }
  ];

  const tabs = currentUser.role === 'admin' ? adminMobile
    : currentUser.role === 'leader' ? leaderMobile
    : currentUser.role === 'judge' ? judgeMobile
    : studentMobile;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] text-[10px] shadow-lg">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold transition ${
              isActive
                ? 'text-[#0E7C86] dark:text-teal-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
