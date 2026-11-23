import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { useLanguage } from './context/LanguageContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileTabBar } from './components/common/MobileTabBar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeamLeaderDashboard } from './components/leader/TeamLeaderDashboard';
import { JudgeDashboard } from './components/judge/JudgeDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { UnionExecutiveDashboard } from './components/executive/UnionExecutiveDashboard';
import { WingConvenerDashboard } from './components/convener/WingConvenerDashboard';
import { PublicUnionHome } from './components/public/PublicUnionHome';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SplashScreen } from './components/common/SplashScreen';
import { QuotaBanner } from './components/common/QuotaBanner';
import { WriteErrorToast } from './components/common/WriteErrorToast';
import { UpdatePrompt } from './components/common/UpdatePrompt';
import { BroadcastNotificationPopup } from './components/common/BroadcastNotificationPopup';
import { FloatingNotificationTicker } from './components/common/FloatingNotificationTicker';
import { DesignSystemPage } from './components/dev/DesignSystemPage';
import { isSportsWingConvener, isFineArtsWingConvener } from './utils/wingHelper';

export function AppContent() {
  const { currentUser } = useAuth();
  const { setActiveScreen, wings = [], unionOfficials = [] } = useApp();
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

  // Synchronize active navigation screen to lazy Firestore sync manager
  useEffect(() => {
    if (typeof setActiveScreen === 'function') {
      setActiveScreen(activeTab);
    }
  }, [activeTab, setActiveScreen]);
  // Track last handled user ID to ensure active tab is only initialized on session change/login, preventing unexpected bounce-backs
  const lastAuthUserIdRef = useRef(null);
  useEffect(() => {
    if (currentUser) {
      const currentAuthKey = currentUser.id || currentUser.username || currentUser.role;
      if (lastAuthUserIdRef.current !== currentAuthKey) {
        lastAuthUserIdRef.current = currentAuthKey;
        if (currentUser.role === 'admin') setActiveTab('dashboard');
        else if (currentUser.role === 'executive') setActiveTab('overview');
        else if (currentUser.role === 'convener') {
          const isFineArts = isFineArtsWingConvener(currentUser, wings, unionOfficials);
          const isSports = isSportsWingConvener(currentUser, wings, unionOfficials);
          if (isFineArts) {
            setActiveTab('summit_register');
          } else if (isSports) {
            setActiveTab('college_sports');
          } else {
            setActiveTab('dashboard');
          }
        }
        else if (currentUser.role === 'leader') setActiveTab('overview');
        else if (currentUser.role === 'judge') setActiveTab('evaluation');
        else if (currentUser.role === 'student') setActiveTab('overview');
      }
    } else {
      lastAuthUserIdRef.current = null;
    }
  }, [currentUser, wings, unionOfficials]);

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

  // Opening Splash Animation State (plays on initial app launch)
  const [showSplash, setShowSplash] = useState(() => {
    try {
      if (window.location.search.includes('nosplash')) return false;
      return !sessionStorage.getItem('musf_splash_seen');
    } catch {
      return true;
    }
  });

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinished={() => {
            setShowSplash(false);
            try {
              sessionStorage.setItem('musf_splash_seen', 'true');
            } catch {}
          }}
        />
      )}
      <UpdatePrompt />

      {!currentUser ? (
        (window.location.search.includes('dev=1') || window.location.pathname.includes('/dev')) ? (
          <div className="min-h-screen p-4 sm:p-8 bg-[#F6F8FB] dark:bg-[#080E18]">
            <div className="max-w-[1200px] mx-auto">
              <DesignSystemPage isDark={isDark} setIsDark={setIsDark} />
            </div>
          </div>
        ) : (
          <LoginPage
            isDark={isDark}
            setIsDark={setIsDark}
          />
        )
      ) : (
        <div className="min-h-[100dvh] flex flex-col bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
          {/* Top Navbar: hidden on mobile for student role to let the colored Hero touch the top edge */}
          {currentUser?.role === 'student' ? (
            <div className="hidden md:block">
              <Navbar
                isDark={isDark}
                setIsDark={setIsDark}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                mobileDrawerOpen={mobileDrawerOpen}
                setMobileDrawerOpen={setMobileDrawerOpen}
              />
            </div>
          ) : (
            <Navbar
              isDark={isDark}
              setIsDark={setIsDark}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              mobileDrawerOpen={mobileDrawerOpen}
              setMobileDrawerOpen={setMobileDrawerOpen}
            />
          )}

          {/* Quota & Offline Alert Banner */}
          <QuotaBanner />

          <div className="flex-1 flex w-full">
            {/* Desktop Left Sidebar: Removed for admin, executive, student, and convener to eliminate sidebar clutter and route through front Bento and floating pill dock */}
            {currentUser?.role !== 'admin' && currentUser?.role !== 'executive' && currentUser?.role !== 'student' && currentUser?.role !== 'convener' && (
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {/* Main Content Viewport with centered container max-w-[1200px] */}
            <main className={`flex-1 overflow-y-auto min-w-0 bg-[#F6F8FB] dark:bg-[#080E18] ${
              currentUser?.role === 'student' || currentUser?.role === 'executive' || currentUser?.role === 'admin' || currentUser?.role === 'convener'
                ? 'p-0 pb-24 md:pb-28'
                : 'p-3 sm:p-6 lg:p-8 pb-24 md:pb-8'
            }`}>
              <div className="max-w-[1200px] mx-auto w-full">
                {/* Floating Animated Running Announcement Ticker */}
                {currentUser?.role !== 'student' && (
                  <FloatingNotificationTicker setActiveTab={setActiveTab} />
                )}

                <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
                  <div key={activeTab} className="animate-slide-up">
                    {activeTab === 'dev_design_system' ? (
                      <DesignSystemPage isDark={isDark} setIsDark={setIsDark} />
                    ) : (
                      <>
                        {currentUser.role === 'admin' && (
                          <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
                        )}
                        {currentUser.role === 'executive' && (
                          <UnionExecutiveDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
                        )}
                        {currentUser.role === 'convener' && (
                          <WingConvenerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
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
                      </>
                    )}
                  </div>
                </ErrorBoundary>
              </div>
            </main>
          </div>

          {/* Persistent Mobile Bottom Navigation Bar (< 1024px) - hidden for students, executives, admins, and conveners as per unified design spec */}
          {currentUser?.role !== 'student' && currentUser?.role !== 'executive' && currentUser?.role !== 'admin' && currentUser?.role !== 'convener' && (
            <MobileTabBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenMore={() => setMobileDrawerOpen(prev => !prev)}
              isMoreOpen={mobileDrawerOpen}
            />
          )}

          {/* Realtime Write Error Toast */}
          <WriteErrorToast />

          {/* Animated Broadcast Notification Pop-up Window */}
          <BroadcastNotificationPopup setActiveTab={setActiveTab} />

          {/* Service Worker Update Prompt */}
          <UpdatePrompt />
        </div>
      )}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
