import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { LoginModal } from '../auth/LoginModal';
import {
  Trophy,
  Moon,
  Sun,
  Globe,
  LogIn,
  LogOut,
  KeyRound,
  Download,
  User,
  Shield,
  Radio,
  CheckCircle2
} from 'lucide-react';

export const Header = ({ currentView, setCurrentView, isDark, setIsDark, deferredPrompt, installPWA }) => {
  const { currentUser, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { settings } = useApp();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-amber-500/20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & College Crest */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('scoreboard')}>
            {/* Official College Crest */}
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-amber-400/90 flex items-center justify-center shadow-md shadow-emerald-950/20 shrink-0 bg-white">
              <img
                src="/amu-crest-square.png"
                alt="Majlis Umariyya Wafy College"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/college-campus.jpg'; }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-emerald-950 dark:text-white leading-tight">
                  {settings.collegeName || "Majlis Umariyya Wafy College"}
                </h1>
              </div>
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                {t.appTitle}
              </p>
            </div>
          </div>

          {/* Center Navigation Shortcuts */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentView('scoreboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                currentView === 'scoreboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
              <span>{t.scoreboard.title}</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/10'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {currentUser.role === 'admin' ? 'Admin Console' :
                   currentUser.role === 'leader' ? 'Team Dashboard' :
                   currentUser.role === 'judge' ? 'Judge Evaluation' : 'My Dashboard'}
                </span>
              </button>
            )}
          </div>

          {/* Right Action Icons: Language, Dark Mode, PWA, User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                onClick={installPWA}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition"
                title="Install MUSF Summit App on device"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            )}

            {/* Language Toggle (English / Malayalam) */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              title={lang === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
              <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
            </button>

            {/* Login or User Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-emerald-800/10 dark:bg-slate-800 border border-emerald-800/20 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-800/15 transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-bold truncate max-w-[100px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-400 text-slate-950 uppercase">
                    {currentUser.role}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 text-xs text-slate-700 dark:text-slate-300 z-50 animate-in fade-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.nav.dashboard}</span>
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.login}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <button
            onClick={() => setCurrentView('scoreboard')}
            className={`flex items-center gap-1.5 font-bold py-1 px-3 rounded-lg ${
              currentView === 'scoreboard' ? 'text-amber-600 font-black' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Radio className="w-3 h-3 text-red-500" />
            <span>Scoreboard</span>
          </button>

          {currentUser ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 font-bold py-1 px-3 rounded-lg ${
                currentView === 'dashboard' ? 'text-emerald-700 dark:text-emerald-400 font-black' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Dashboard ({currentUser.role})</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1.5 font-bold py-1 px-3 text-emerald-700 dark:text-emerald-400"
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
};
