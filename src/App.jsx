import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileTabBar } from './components/common/MobileTabBar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeamLeaderDashboard } from './components/leader/TeamLeaderDashboard';
import { JudgeDashboard } from './components/judge/JudgeDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SplashScreen } from './components/common/SplashScreen';

export function AppContent() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Dark Mode State with strict localStorage priority
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('musf_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('musf_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('musf_theme', 'light');
    }
  }, [isDark]);

  // Active Tab state for navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Set default active tab when role changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') setActiveTab('dashboard');
      else if (currentUser.role === 'leader') setActiveTab('overview');
      else if (currentUser.role === 'judge') setActiveTab('evaluation');
      else if (currentUser.role === 'student') setActiveTab('overview');
    }
  }, [currentUser]);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Opening Splash Animation State (plays on app launch)
  const [showSplash, setShowSplash] = useState(true);

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}

      {!currentUser ? (
        <LoginPage isDark={isDark} setIsDark={setIsDark} />
      ) : (
        <div className="min-h-[100dvh] flex flex-col bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
          {/* Top Navbar */}
          <Navbar
            isDark={isDark}
            setIsDark={setIsDark}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mobileDrawerOpen={mobileDrawerOpen}
            setMobileDrawerOpen={setMobileDrawerOpen}
          />

          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Desktop Left Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Viewport with ErrorBoundary */}
            <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto max-w-full min-w-0">
              <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
                {currentUser.role === 'admin' && (
                  <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
                )}
                {currentUser.role === 'leader' && (
                  <TeamLeaderDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
                )}
                {currentUser.role === 'judge' && (
                  <JudgeDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
                )}
                {currentUser.role === 'student' && (
                  <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
                )}
              </ErrorBoundary>
            </main>
          </div>

          {/* Persistent Mobile Bottom Navigation Bar (< 1024px) */}
          <MobileTabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenMore={() => setMobileDrawerOpen(true)}
          />
        </div>
      )}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
