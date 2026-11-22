import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { CloudUsageModal } from '../admin/CloudUsageModal';
import { Instagram } from './InstagramIcon';
import {
  Activity,
  Bell,
  Moon,
  Sun,
  Globe,
  LogOut,
  KeyRound,
  User,
  Shield,
  CheckCircle2,
  CheckCheck,
  BookOpen,
  Menu,
  X,
  Users,
  Calendar,
  Layers,
  Clock,
  Scale,
  Crown,
  Gavel,
  BarChart3,
  FileCheck,
  Settings,
  LayoutDashboard,
  Trash2,
  Share2,
  Folder,
  Palette,
  Trophy,
  Award,
  Lock,
  FileText,
  Sparkles
} from 'lucide-react';
import { useReducedMotionPreference } from '../../utils/motion';
import { resolveConvenerWing } from '../../utils/wingHelper';

export const Navbar = ({
  isDark,
  setIsDark,
  activeTab,
  setActiveTab,
  mobileDrawerOpen: externalDrawerOpen,
  setMobileDrawerOpen: setExternalDrawerOpen
}) => {
  const { currentUser, logout } = useAuth();
  const { lang, toggleLanguage, t, tr: ctxTr } = useLanguage();
  const tr = ctxTr || ((en, ml) => (lang === 'ml' ? (ml || en) : en));
  const {
    notifications = [],
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    settings = {},
    cloudSyncStatus,
    wings = [],
    unionOfficials = []
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [isCloudUsageOpen, setIsCloudUsageOpen] = useState(false);

  const mobileDrawerOpen = externalDrawerOpen !== undefined ? externalDrawerOpen : internalDrawerOpen;
  const setMobileDrawerOpen = setExternalDrawerOpen || setInternalDrawerOpen;
  const { reduceMotion, toggleReduceMotion } = useReducedMotionPreference();

  // Filter notifications for current user (or general/all)
  const myNotifications = notifications.filter(n => {
    return !n.userId ||
      n.userId === 'all' ||
      n.userId === currentUser?.id ||
      n.userId === currentUser?.studentId ||
      n.userId === currentUser?.username ||
      n.userId === currentUser?.role ||
      (n.userId === 'students' && currentUser?.role === 'student') ||
      (n.userId === 'leaders' && currentUser?.role === 'leader') ||
      currentUser?.role === 'admin';
  });

  const isNotifUnread = (n) => {
    const readBy = Array.isArray(n.readBy) ? n.readBy : [];
    const hasRead = readBy.includes(currentUser?.id) ||
      readBy.includes(currentUser?.studentId) ||
      readBy.includes(currentUser?.username);
    const isBroadcast = !n.userId || n.userId === 'all' || n.userId === 'students' || n.userId === 'leaders';
    return isBroadcast ? !hasRead : (!n.read && !hasRead);
  };

  const unreadCount = myNotifications.filter(isNotifUnread).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-[env(safe-area-inset-top,0px)] shadow-xs">
      {/* Radiant Multi-Hue Iridescent Brand Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0E7C86] via-indigo-500 via-amber-400 via-rose-500 to-[#0E7C86] bg-[length:200%_100%] animate-shimmer" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Mobile Menu Trigger & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {currentUser && setActiveTab && (
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 transition active:scale-95"
                title="Open All Navigation Sections"
                aria-label="Navigation Menu"
              >
                <Menu className="w-5 h-5 text-[#0F2A4A] dark:text-white" />
              </button>
            )}

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden ring-2 ring-[#0E7C86]/60 dark:ring-teal-400/60 shadow-sm shrink-0 bg-white relative">
              <img
                src="/amu-crest-square.png"
                alt="Majlis Umariyya Wafy College"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/college-campus.jpg'; }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="sm:hidden text-sm font-bold text-[#0F2A4A] dark:text-white leading-tight">
                  MUSF Union
                </h1>
                <h1 className="hidden sm:block text-xs sm:text-sm font-bold text-[#0F2A4A] dark:text-white leading-tight truncate">
                  {settings.collegeName || "Majlis Umariyya Wafy College"}
                </h1>
              </div>
              <p className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {t.unionFullName || "Majlis Umariyya Students' Federation"}
              </p>
            </div>
          </div>

          {/* Right Action Icons: Notification Bell, Language, Dark Mode, User Profile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifDropdownOpen(prev => !prev);
                  setUserDropdownOpen(false);
                }}
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition active:scale-95"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown */}
              {notifDropdownOpen && (
                <>
                  {/* Backdrop to dismiss on tap anywhere on mobile or desktop */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                    onClick={() => setNotifDropdownOpen(false)}
                    onTouchStart={() => setNotifDropdownOpen(false)}
                  />
                  <div
                    className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 max-w-full bg-white dark:bg-[#0F1B2B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 text-xs z-50 animate-in fade-in max-h-[80vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-[#0F2A4A] dark:text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0E7C86]" />
                        <span>Notifications ({unreadCount} new)</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsRead(currentUser?.id)}
                            className="text-[11px] text-[#0E7C86] hover:underline flex items-center gap-1 font-semibold"
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-3 h-3" />
                            <span>Mark read</span>
                          </button>
                        )}
                        {myNotifications.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Clear all notifications?')) {
                                clearAllNotifications(currentUser?.role === 'admin' ? null : currentUser?.id);
                              }
                            }}
                            className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1 font-semibold"
                            title="Clear all notifications"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {myNotifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        myNotifications.map(n => {
                          const unread = isNotifUnread(n);
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id, currentUser?.id || currentUser?.username);
                                setNotifDropdownOpen(false);
                                window.dispatchEvent(new CustomEvent('musf:open-notifications', { detail: { notifId: n.id } }));
                              }}
                              className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-start justify-between gap-2.5 group ${unread ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                                }`}
                            >
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${unread ? 'bg-[#0E7C86] animate-ping' : 'bg-transparent'}`} />
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="font-semibold text-slate-900 dark:text-white leading-tight truncate">
                                    {n.title}
                                  </div>
                                  {n.author && (
                                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block">
                                      {n.author} {n.wingName ? `• ${n.wingName}` : (n.authorDesignation ? `• ${n.authorDesignation}` : '')}
                                    </span>
                                  )}
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug break-words">
                                    {n.message}
                                  </p>
                                  <span className="text-[10px] text-slate-400 block pt-0.5 font-mono">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                                title="Delete notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(prev => !prev);
                    setNotifDropdownOpen(false);
                  }}
                  className="min-h-[44px] flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-gradient-to-r from-teal-50/50 via-white to-indigo-50/30 dark:from-[#0F1B2B] dark:to-[#112338] text-xs hover:border-teal-400 dark:hover:border-teal-600 transition active:scale-95 shadow-2xs"
                  aria-label="User Profile Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0E7C86] via-[#14919D] to-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-1 ring-white dark:ring-slate-700">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 max-w-[120px] truncate leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#0E7C86] dark:text-teal-400 font-bold uppercase tracking-wider leading-none">
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#0F1B2B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 text-xs z-50 animate-in fade-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{currentUser.designation || currentUser.role || 'Member'}</div>
                    </div>

                    {/* Integrated Preferences: Language & Theme */}
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLanguage();
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-200 active:scale-95 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                        title={lang === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക'}
                      >
                        <Globe className="w-3.5 h-3.5 text-[#0E7C86]" />
                        <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDark(prev => !prev);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-200 active:scale-95 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                      >
                        {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#334E73]" />}
                        <span>{isDark ? 'Light' : 'Dark'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReduceMotion();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs"
                    >
                      <span>Reduce Animations</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        reduceMotion ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {reduceMotion ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CloudUsageModal
        isOpen={isCloudUsageOpen}
        onClose={() => setIsCloudUsageOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            onTouchStart={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content - Fixed 100dvh with min-h-0 so navigation modules always scroll and never collapse */}
          <div className="relative w-[85%] max-w-xs h-[100dvh] bg-white dark:bg-[#0B1522] shadow-2xl flex flex-col z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0B1522]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#0E7C86]/50 shadow-xs shrink-0 bg-white">
                  <img
                    src="/amu-crest-square.png"
                    alt="Majlis Umariyya Wafy College"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/college-campus.jpg'; }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-[#0F2A4A] dark:text-white leading-tight truncate">
                    {settings.collegeName}
                  </h3>
                  <span className="text-[10px] text-[#0E7C86] font-semibold block">
                    {currentUser?.role?.toUpperCase()} Console
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1 text-xs font-semibold">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                Navigation Modules
              </div>

              {(() => {
                const adminNav = [
                  { id: 'dashboard', label: tr('Union Home', 'യൂണിയൻ ഹോം'), icon: LayoutDashboard },
                  { id: 'wings', label: tr('Union Wings', 'യൂണിയൻ വിംഗുകൾ'), icon: Folder },
                  { id: 'meetings', label: tr('Meetings & Resolutions', 'മീറ്റിംഗുകളും തീരുമാനങ്ങളും'), icon: Lock },
                  { id: 'reports', label: tr('Official Reports', 'ഔദ്യോഗിക റിപ്പോർട്ടുകൾ'), icon: FileText },
                  { id: 'students', label: tr('Students Directory', 'വിദ്യാർത്ഥി പട്ടിക'), icon: Users },
                  { id: 'officials', label: tr('Union Office Bearers', 'യൂണിയൻ ഭാരവാഹികൾ'), icon: Crown },
                  { id: 'notices', label: tr('Announcements & Notices', 'അറിയിപ്പുകൾ'), icon: Bell },
                  { id: 'settings', label: tr('Settings & Audit Log', 'സെറ്റിംഗ്സ്'), icon: Settings }
                ];

                const executiveNav = [
                  { id: 'dashboard', label: tr('Union Executive Home', 'എക്സിക്യൂട്ടീവ് ഹോം'), icon: Crown },
                  { id: 'exec_panel', label: tr('Executive Panel', 'എക്സിക്യൂട്ടീവ് പാനൽ'), icon: Sparkles },
                  { id: 'programs', label: tr('General Programs', 'പൊതുപരിപാടികൾ'), icon: Layers },
                  { id: 'competitions', label: tr('Competitions & Results', 'മത്സരങ്ങൾ'), icon: Trophy },
                  { id: 'meetings', label: tr('Meetings & Resolutions', 'മീറ്റിംഗുകളും തീരുമാനങ്ങളും'), icon: Lock },
                  { id: 'officials', label: tr('Office Bearers Roster', 'ഭാരവാഹികളുടെ പട്ടിക'), icon: Users },
                  { id: 'reports', label: tr('Official Reports', 'ഔദ്യോഗിക റിപ്പോർട്ടുകൾ'), icon: FileText }
                ];

                const currentWing = resolveConvenerWing(currentUser, wings, unionOfficials);
                const isFineArtsConvener = currentUser?.role === 'convener' && (currentWing?.id === 'fine_arts' || currentWing?.isSummitModule);
                const isSportsConvener = currentUser?.role === 'convener' && currentWing?.id === 'sports';

                const convenerNav = [
                  ...(isFineArtsConvener ? [{ id: 'summit_register', label: tr('Summit Register (Arts)', 'സമ്മിറ്റ് രജിസ്റ്റർ'), icon: Palette }] : []),
                  ...(isSportsConvener ? [
                    { id: 'college_sports', label: tr('College Sports (Teams & Points)', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy },
                    { id: 'add_events', label: tr('Add Events (Single & Bulk)', 'ഇവന്റുകൾ ചേർക്കുക'), icon: Plus }
                  ] : []),
                  { id: 'dashboard', label: tr(`${currentWing?.shortName || 'Wing'} Console`, 'വിംഗ് കൺസോൾ'), icon: LayoutDashboard },
                  { id: 'programs', label: isSportsConvener ? tr('Sports Programs & Matches', 'സ്പോർട്സ് മത്സരങ്ങൾ') : isFineArtsConvener ? tr('Fine Arts Programs', 'ഫൈൻ ആർട്സ് പരിപാടികൾ') : tr(`${currentWing?.shortName || 'Wing'} Activities & Events`, 'പ്രവർത്തനങ്ങൾ'), icon: Layers },
                  ...(!isSportsConvener ? [{ id: 'competitions', label: tr('Competition Winners', 'വിജയികൾ'), icon: Trophy }] : []),
                  { id: 'certificates', label: isSportsConvener ? tr('Sports Certificates', 'സ്പോർട്സ് സർട്ടിഫിക്കറ്റുകൾ') : tr('Wing Certificates', 'സർട്ടിഫിക്കറ്റുകൾ'), icon: Award },
                  { id: 'reports', label: tr('Official Report', 'ഔദ്യോഗിക റിപ്പോർട്ട്'), icon: FileText }
                ];

                const leaderNav = [
                  { id: 'overview', label: 'House Standings & Roster', icon: LayoutDashboard },
                  { id: 'nominations', label: 'Summit Event Nominations', icon: Layers },
                  { id: 'members', label: 'House Members List', icon: Users },
                  { id: 'attendance', label: 'Take Attendance', icon: Clock },
                  { id: 'mark_upload', label: 'Upload Event Marks', icon: Scale },
                  { id: 'results', label: 'Published Marks', icon: Award }
                ];

                const judgeNav = [
                  { id: 'evaluation', label: 'Evaluation Scoring Console', icon: Gavel },
                  { id: 'history', label: 'Scoring History & Audit', icon: Scale },
                  { id: 'notices', label: 'Notices & Announcements', icon: Bell }
                ];

                const studentNav = [
                  { id: 'overview', label: tr('Student Home', 'ഹോം'), icon: LayoutDashboard },
                  { id: 'sports', label: tr('College Sports', 'കോളേജ് സ്പോർട്സ്'), icon: Trophy },
                  { id: 'wings', label: tr('Union Wings', 'വിംഗുകൾ'), icon: Folder },
                  { id: 'fine_arts_summit', label: tr('Fine Arts Summit', 'സമ്മിറ്റ്'), icon: Palette },
                  { id: 'executives', label: tr('Union Executives', 'ഭാരവാഹികൾ'), icon: Crown },
                  { id: 'union_prizes', label: tr('My Achievements', 'നേട്ടങ്ങൾ'), icon: Award },
                  { id: 'profile', label: tr('About Me', 'എന്റെ വിവരങ്ങൾ'), icon: User }
                ];

                const navItems = currentUser?.role === 'admin' ? adminNav :
                  currentUser?.role === 'executive' ? executiveNav :
                    currentUser?.role === 'convener' ? convenerNav :
                      currentUser?.role === 'leader' ? leaderNav :
                        currentUser?.role === 'judge' ? judgeNav : studentNav;

                return navItems.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${isActive
                        ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-[#0B1522] pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-slate-500">Theme Mode</span>
                <button
                  onClick={() => setIsDark(prev => !prev)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#334E73]" />}
                  <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>

              <button
                onClick={logout}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser?.username})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
