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
  Trophy,
  Menu,
  FileCheck
} from 'lucide-react';

export const MobileTabBar = ({ activeTab, setActiveTab, onOpenMore, isMoreOpen }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Primary tabs for mobile bottom bar (4-5 key items)
  const adminMobile = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'programs', label: 'Events', icon: Layers },
    { id: 'marks', label: 'Marks', icon: Scale }
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
    { id: 'certificates', label: 'Awards', icon: FileCheck }
  ];

  const tabs = currentUser.role === 'admin' ? adminMobile
    : currentUser.role === 'leader' ? leaderMobile
    : currentUser.role === 'judge' ? judgeMobile
    : studentMobile;

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[10px] shadow-lg"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl font-semibold transition active:scale-95 ${
              isActive
                ? 'text-[#0E7C86] dark:text-teal-400 font-bold bg-teal-50/60 dark:bg-teal-950/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="leading-tight truncate max-w-[64px]">{tab.label}</span>
          </button>
        );
      })}

      {/* "More" Drawer Trigger: toggles open/close on tap */}
      {onOpenMore && (
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2 rounded-xl font-semibold transition active:scale-95 ${
            isMoreOpen
              ? 'text-[#0E7C86] dark:text-teal-400 font-bold bg-teal-50/80 dark:bg-teal-950/60 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title={isMoreOpen ? "Close Menu" : "More Sections"}
        >
          <Menu className={`w-5 h-5 mb-0.5 shrink-0 ${isMoreOpen ? 'rotate-90 text-[#0E7C86]' : ''} transition-transform duration-200`} />
          <span className="leading-tight">{isMoreOpen ? 'Close' : 'More'}</span>
        </button>
      )}
    </nav>
  );
};
