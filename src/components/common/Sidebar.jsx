import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { resolveConvenerWing, isSportsWingConvener, isFineArtsWingConvener } from '../../utils/wingHelper';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  User,
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
  UserPlus,
  Plus,
  Folder,
  Palette,
  Lock,
  FileText,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const { lang, tr } = useLanguage();
  const { wings = [], unionOfficials = [] } = useApp();

  if (!currentUser) return null;

  const currentWing = resolveConvenerWing(currentUser, wings, unionOfficials);
  const isFineArtsConvener = currentUser.role === 'convener' && isFineArtsWingConvener(currentUser, wings, unionOfficials);
  const isSportsConvener = currentUser.role === 'convener' && isSportsWingConvener(currentUser, wings, unionOfficials);

  // Tabs by Role — Clean Institutional Architecture
  const adminSections = [
    {
      title: tr('Overview', 'പൊതു അവലോകനം'),
      tabs: [
        { id: 'dashboard', label: tr('Dashboard', 'ഡാഷ്‌ബോർഡ്'), icon: LayoutDashboard },
        { id: 'wings', label: tr('Union wings', 'യൂണിയൻ വിംഗുകൾ'), icon: Folder },
        { id: 'college_sports', label: tr('College Sports', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy },
      ]
    },
    {
      title: tr('Governance', 'ഭരണകാര്യങ്ങൾ'),
      tabs: [
        { id: 'officials', label: tr('Office bearers', 'യൂണിയൻ ഭാരവാഹികൾ'), icon: Crown },
        { id: 'meetings', label: tr('Minutes & resolutions', 'മീറ്റിംഗുകളും മിനിറ്റ്സും'), icon: Lock },
        { id: 'reports', label: tr('Monthly reports', 'പ്രതിമാസ റിപ്പോർട്ടുകൾ'), icon: FileText },
      ]
    },
    {
      title: tr('Administration', 'അഡ്മിനിസ്ട്രേഷൻ'),
      tabs: [
        { id: 'students', label: tr('Students directory', 'വിദ്യാർത്ഥികൾ'), icon: Users },
        { id: 'notices', label: tr('Notices', 'അറിയിപ്പുകൾ'), icon: Bell },
        { id: 'settings', label: tr('Settings & log', 'ക്രമീകരണങ്ങൾ'), icon: Settings },
      ]
    }
  ];

  const executiveSections = [
    {
      title: tr('Council', 'കൗൺസിൽ'),
      tabs: [
        { id: 'dashboard', label: tr('Dashboard', 'ഡാഷ്‌ബോർഡ്'), icon: LayoutDashboard },
        { id: 'exec_panel', label: tr('Executive Panel', 'എക്സിക്യൂട്ടീവ് പാനൽ'), icon: Crown },
        { id: 'wings', label: tr('Manage Wings', 'വിംഗുകൾ നിയന്ത്രിക്കുക'), icon: Folder },
        { id: 'officials', label: tr('Office bearers', 'ഭാരവാഹികളുടെ പട്ടിക'), icon: Users },
      ]
    },
    {
      title: tr('Operations', 'പ്രവർത്തനങ്ങൾ'),
      tabs: [
        { id: 'college_sports', label: tr('College Sports', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy },
        { id: 'programs', label: tr('Union programs', 'പൊതുപരിപാടികൾ'), icon: Layers },
        { id: 'competitions', label: tr('Competitions', 'മത്സരങ്ങൾ'), icon: Trophy },
        { id: 'meetings', label: tr('Minutes', 'മിനിറ്റ്സുകൾ'), icon: Lock },
        { id: 'reports', label: tr('Reports', 'റിപ്പോർട്ടുകൾ'), icon: FileText }
      ]
    }
  ];

  const fineArtsConvenerSections = [
    {
      title: tr('Fine Arts & Summit', 'ഫൈൻ ആർട്സ് & സമ്മിറ്റ്'),
      tabs: [
        { id: 'summit_register', label: tr('Summit (Fine Arts)', 'സമ്മിറ്റ് (ഫൈൻ ആർട്സ്)'), icon: Palette },
        { id: 'programs', label: tr('Fine Arts Programs', 'ഫൈൻ ആർട്സ് പരിപാടികൾ'), icon: Layers },
      ]
    },
    {
      title: tr('Records & Results', 'രേഖകൾ'),
      tabs: [
        { id: 'competitions', label: tr('Competitions & Winners', 'മത്സരങ്ങൾ & വിജയികൾ'), icon: Trophy },
        { id: 'certificates', label: tr('Certificates', 'സർട്ടിഫിക്കറ്റുകൾ'), icon: Award },
        { id: 'reports', label: tr('Monthly Report', 'പ്രതിമാസ റിപ്പോർട്ട്'), icon: FileText }
      ]
    }
  ];

  const sportsConvenerSections = [
    {
      title: tr('Sports Wing Console', 'സ്പോർട്സ് വിംഗ് കൺസോൾ'),
      tabs: [
        { id: 'college_sports', label: tr('College Sports (Teams & Points)', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy },
        { id: 'add_events', label: tr('Add Events (Single & Bulk)', 'ഇവന്റുകൾ ചേർക്കുക'), icon: Plus },
      ]
    },
    {
      title: tr('Wing Operations', 'പ്രവർത്തനങ്ങൾ'),
      tabs: [
        { id: 'programs', label: tr('Sports Programs & Matches', 'സ്പോർട്സ് മത്സരങ്ങൾ'), icon: Layers },
        { id: 'certificates', label: tr('Sports Certificates', 'സർട്ടിഫിക്കറ്റുകൾ'), icon: Award },
        { id: 'reports', label: tr('Monthly Report', 'പ്രതിമാസ റിപ്പോർട്ട്'), icon: FileText }
      ]
    }
  ];

  const genericConvenerSections = [
    {
      title: tr(`${currentWing?.shortName || 'Wing'} Console`, 'വിംഗ് കൺസോൾ'),
      tabs: [
        { id: 'dashboard', label: tr('Dashboard', 'ഡാഷ്‌ബോർഡ്'), icon: LayoutDashboard },
        { id: 'programs', label: tr(`${currentWing?.shortName || 'Wing'} Activities`, 'പ്രവർത്തനങ്ങൾ'), icon: Layers },
      ]
    },
    {
      title: tr('Records & Governance', 'രേഖകൾ'),
      tabs: [
        { id: 'competitions', label: tr('Prizes & Winners', 'വിജയികൾ'), icon: Trophy },
        { id: 'certificates', label: tr('Certificates', 'സർട്ടിഫിക്കറ്റുകൾ'), icon: Award },
        { id: 'reports', label: tr('Monthly Report', 'പ്രതിമാസ റിപ്പോർട്ട്'), icon: FileText }
      ]
    }
  ];

  const convenerSections = isFineArtsConvener
    ? fineArtsConvenerSections
    : isSportsConvener
      ? sportsConvenerSections
      : genericConvenerSections;

  const leaderSections = [
    {
      title: tr('House Team', 'ഹൗസ് ടീം'),
      tabs: [
        { id: 'overview', label: tr('House standings', 'നിലവാരം'), icon: LayoutDashboard },
        { id: 'members', label: tr('Members', 'അംഗങ്ങൾ'), icon: Users },
      ]
    },
    {
      title: tr('Participation', 'പങ്കാളിത്തം'),
      tabs: [
        { id: 'nominations', label: tr('Nominations', 'നോമിനേഷൻസ്'), icon: UserPlus },
        { id: 'attendance', label: tr('Attendance', 'ഹാജർ'), icon: Clock },
        { id: 'results', label: tr('Results', 'ഫലങ്ങൾ'), icon: Award }
      ]
    }
  ];

  const judgeSections = [
    {
      title: tr('Evaluation', 'മൂല്യനിർണ്ണയം'),
      tabs: [
        { id: 'evaluation', label: tr('Scoring console', 'മാർക്ക് നൽകൽ'), icon: Gavel },
        { id: 'history', label: tr('Evaluation history', 'ചരിത്രം'), icon: Scale },
      ]
    }
  ];

  const studentSections = [
    {
      title: tr('Portal', 'പോർട്ടൽ'),
      tabs: [
        { id: 'overview', label: tr('Home', 'ഹോം'), icon: LayoutDashboard },
        { id: 'wings', label: tr('Union Wings', 'യൂണിയൻ വിംഗുകൾ'), icon: Folder },
        { id: 'programs', label: tr('Programs', 'പരിപാടികൾ'), icon: Calendar },
        { id: 'prizes', label: tr('My Prizes', 'എന്റെ നേട്ടങ്ങൾ'), icon: Trophy },
        { id: 'certificates', label: tr('Certificates', 'സർട്ടിഫിക്കറ്റുകൾ'), icon: Award },
        { id: 'sports', label: tr('College Sports', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy },
        { id: 'leaders', label: tr('Union Leaders', 'യൂണിയൻ ഭാരവാഹികൾ'), icon: Crown },
        { id: 'notices', label: tr('Notices', 'അറിയിപ്പുകൾ'), icon: Bell },
        { id: 'summit', label: tr('Fine Arts Summit', 'ഫൈൻ ആർട്സ് സമ്മിറ്റ്'), icon: Palette },
        { id: 'profile', label: tr('Profile', 'എന്റെ വിവരങ്ങൾ'), icon: User },
      ]
    }
  ];

  const currentSections = currentUser.role === 'admin' ? adminSections
    : currentUser.role === 'executive' ? executiveSections
      : currentUser.role === 'convener' ? convenerSections
        : currentUser.role === 'leader' ? leaderSections
          : currentUser.role === 'judge' ? judgeSections
            : studentSections;

  const sectionBulletColors = [
    'bg-indigo-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-purple-500'
  ];

  return (
    <aside className="hidden md:flex flex-col w-[250px] bg-white dark:bg-[#0B1522] border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100dvh-4rem)] shadow-2xs">
      <div className="flex-1 p-3.5 space-y-4 overflow-y-auto">
        {currentSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {sec.title && (
              <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${sectionBulletColors[secIdx % sectionBulletColors.length]}`} />
                <span>{sec.title}</span>
              </div>
            )}

            {sec.tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition text-left select-none ${
                    isActive
                      ? 'text-[#0E7C86] dark:text-teal-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-indigo-500/5 dark:from-teal-950/70 dark:to-indigo-950/40 border-l-[3px] border-[#0E7C86] dark:border-teal-400 shadow-2xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <div className={`relative z-10 w-6 h-6 rounded-lg flex items-center justify-center transition ${
                    isActive 
                      ? 'bg-[#0E7C86]/10 dark:bg-teal-400/20 text-[#0E7C86] dark:text-teal-300' 
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.2 : 1.75} />
                  </div>
                  <span className="relative z-10 truncate">{tab.label}</span>
                </button>
              );
            })}

            {secIdx < currentSections.length - 1 && (
              <div className="my-2 border-t border-slate-100 dark:border-slate-800/60" />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};
