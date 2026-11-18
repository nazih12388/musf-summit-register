import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import {
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
  LayoutDashboard
} from 'lucide-react';

export const Navbar = ({ isDark, setIsDark, activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { notifications, markNotificationRead, markAllNotificationsRead, settings } = useApp();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filter notifications for current user (or general/all)
  const myNotifications = notifications.filter(
    n => n.userId === currentUser?.id || n.userId === 'all' || currentUser?.role === 'admin'
  );
  const unreadCount = myNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Trigger & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && setActiveTab && (
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Open All Navigation Sections"
              >
                <Menu className="w-5 h-5 text-[#0F2A4A] dark:text-white" />
              </button>
            )}

            <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#0E7C86]/50 shadow-xs shrink-0 bg-[#0F2A4A] relative">
              <img src="/college-campus.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>

            <div>
              <h1 className="text-xs sm:text-sm font-bold text-[#0F2A4A] dark:text-white leading-tight">
                {settings.collegeName}
              </h1>
              <p className="text-[11px] font-semibold text-[#0E7C86] dark:text-teal-400">
                {t.appTitle}
              </p>
            </div>
          </div>

          {/* Right Action Icons: Notification Bell, Language, Dark Mode, User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(prev => !prev);
                  setUserDropdownOpen(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown */}
              {notifDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0F1B2B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 text-xs z-50 animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-[#0F2A4A] dark:text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>Notifications ({unreadCount} new)</span>
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead(currentUser?.id)}
                        className="text-[11px] text-[#0E7C86] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {myNotifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      myNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-start gap-2.5 ${
                            !n.read ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#0E7C86]' : 'bg-transparent'}`} />
                          <div className="space-y-0.5 flex-1">
                            <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {n.title}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 block pt-0.5 font-mono">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              title="Toggle Language / ഭാഷ മാറ്റുക"
            >
              <Globe className="w-3.5 h-3.5 text-[#0E7C86]" />
              <span className="hidden sm:inline">{lang === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#334E73]" />}
            </button>

            {/* User Profile Pill & Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(prev => !prev);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold hover:bg-slate-100 transition"
                >
                  <div className="w-6 h-6 rounded bg-[#0F2A4A] dark:bg-[#0E7C86] text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline font-bold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#334E73] text-white">
                    {currentUser.role}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0F1B2B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs z-50 animate-in fade-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</div>
                    </div>

                    <button
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>{t.nav.changePassword}</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-[#0B1522] shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#0E7C86]/50 shadow-xs shrink-0 bg-[#0F2A4A]">
                  <img src="/college-campus.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#0F2A4A] dark:text-white leading-tight">
                    {settings.collegeName}
                  </h3>
                  <span className="text-[10px] text-[#0E7C86] font-semibold">
                    {currentUser?.role?.toUpperCase()} Console
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-semibold">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                Navigation Modules
              </div>

              {[
                { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
                { id: 'students', label: 'Students & Bulk Import', icon: Users, badge: 'Key' },
                { id: 'summits', label: 'Summits Calendar (48 Wks)', icon: Calendar },
                { id: 'library', label: 'Program Library & Fields', icon: BookOpen },
                { id: 'programs', label: 'Summit Program Matrix', icon: Layers },
                { id: 'attendance', label: 'Attendance Tracker', icon: Clock },
                { id: 'marks', label: 'Marks & Scoring Console', icon: Scale },
                { id: 'teams', label: 'Sections, Classes & Teams', icon: Shield },
                { id: 'leaders', label: 'Team Leaders (2/Team)', icon: Crown },
                { id: 'judges', label: 'Judges & Evaluators', icon: Gavel },
                { id: 'reports', label: 'Reports & Academic Audit', icon: BarChart3 },
                { id: 'certificates', label: 'Academic Certificates', icon: FileCheck },
                { id: 'notices', label: 'Notifications & Notices', icon: Bell },
                { id: 'settings', label: 'System Settings & Audit', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                      isActive
                        ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-white">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
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
