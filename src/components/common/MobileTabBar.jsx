import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { resolveConvenerWing, isSportsWingConvener, isFineArtsWingConvener } from '../../utils/wingHelper';
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
  FileCheck,
  Folder,
  Palette,
  Crown,
  Lock,
  Plus,
  FileText,
  User
} from 'lucide-react';

export const MobileTabBar = ({ activeTab, setActiveTab, onOpenMore, isMoreOpen }) => {
  const { currentUser } = useAuth();
  const { wings = [], unionOfficials = [] } = useApp();

  if (!currentUser) return null;

  const currentWing = resolveConvenerWing(currentUser, wings, unionOfficials);
  const isFineArtsConvener = currentUser?.role === 'convener' && isFineArtsWingConvener(currentUser, wings, unionOfficials);
  const isSportsConvener = currentUser?.role === 'convener' && isSportsWingConvener(currentUser, wings, unionOfficials);

  // Max 5 items total on mobile (4 role tabs + 1 'More' button)
  const adminMobile = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'wings', label: 'Wings', icon: Folder },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'students', label: 'Students', icon: Users }
  ];

  const executiveMobile = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'exec_panel', label: 'Council', icon: Crown },
    { id: 'programs', label: 'Programs', icon: Layers },
    { id: 'competitions', label: 'Results', icon: Trophy }
  ];

  const fineArtsConvenerMobile = [
    { id: 'summit_register', label: 'Summit', icon: Palette },
    { id: 'programs', label: 'Events', icon: Layers },
    { id: 'competitions', label: 'Winners', icon: Trophy },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const sportsConvenerMobile = [
    { id: 'college_sports', label: 'Sports', icon: Trophy },
    { id: 'add_events', label: 'Events', icon: Plus },
    { id: 'programs', label: 'Programs', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const generalConvenerMobile = [
    { id: 'dashboard', label: 'Console', icon: LayoutDashboard },
    { id: 'programs', label: 'Events', icon: Layers },
    { id: 'competitions', label: 'Winners', icon: Trophy },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const convenerMobile = isFineArtsConvener 
    ? fineArtsConvenerMobile 
    : isSportsConvener 
      ? sportsConvenerMobile 
      : generalConvenerMobile;

  const leaderMobile = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'nominations', label: 'Nominate', icon: Award },
    { id: 'members', label: 'Team', icon: Users },
    { id: 'results', label: 'Results', icon: Trophy }
  ];

  const judgeMobile = [
    { id: 'evaluation', label: 'Evaluate', icon: Gavel },
    { id: 'history', label: 'History', icon: Scale }
  ];

  const studentMobile = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'wings', label: 'Wings', icon: Folder },
    { id: 'certificates', label: 'Certs', icon: Award }
  ];

  const tabs = currentUser.role === 'admin' ? adminMobile
    : currentUser.role === 'executive' ? executiveMobile
    : currentUser.role === 'convener' ? convenerMobile
    : currentUser.role === 'leader' ? leaderMobile
    : currentUser.role === 'judge' ? judgeMobile
    : studentMobile;

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_25px_rgba(15,42,74,0.08)] flex items-center justify-around px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] select-none"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center min-w-[54px] min-h-[46px] py-1 px-1.5 rounded-xl transition ${
              isActive
                ? 'text-[#0E7C86] dark:text-teal-300 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isActive && (
              <>
                <motion.div
                  layoutId="mobileTabIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-indigo-500/10 dark:from-teal-950/70 dark:to-indigo-950/50 border border-teal-300/40 dark:border-teal-700/40"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
                <span className="w-4 h-1 rounded-full bg-gradient-to-r from-[#0E7C86] to-[#1E3A8A] dark:from-teal-400 dark:to-indigo-400 shadow-xs absolute top-0" />
              </>
            )}
            <Icon className={`relative z-10 w-5 h-5 mb-0.5 shrink-0 ${isActive ? 'text-[#0E7C86] dark:text-teal-300' : 'text-slate-400'}`} strokeWidth={isActive ? 2.2 : 1.75} />
            <span className="relative z-10 text-xs leading-tight truncate max-w-[66px]">{tab.label}</span>
          </button>
        );
      })}

      {/* 5th item: "More" Drawer Trigger */}
      {onOpenMore && (
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[46px] py-1 px-1.5 rounded-xl transition ${
            isMoreOpen
              ? 'text-[#0E7C86] dark:text-teal-300 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={isMoreOpen ? "Close Menu" : "More Sections"}
        >
          <Menu className={`w-5 h-5 mb-0.5 shrink-0 transition-transform ${isMoreOpen ? 'rotate-90 text-[#0E7C86] dark:text-teal-300' : 'text-slate-400'}`} />
          <span className="text-xs leading-tight">{isMoreOpen ? 'Close' : 'More'}</span>
        </button>
      )}
    </nav>
  );
};
