import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  User,
  LogIn,
  AlertCircle,
  Globe,
  Moon,
  Sun,
  Shield,
  BookOpen
} from 'lucide-react';

export const LoginPage = ({ isDark, setIsDark }) => {
  const { login, authError } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { settings } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100 transition-colors duration-200 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3 sm:px-6">
      {/* Top Utility Bar */}
      <div className="w-full max-w-7xl mx-auto py-2 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-[#0E7C86]/50 shadow-xs bg-[#0F2A4A] shrink-0">
            <img src="/college-campus.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight text-[#0F2A4A] dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
            {settings.collegeName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 active:scale-95"
            title="Toggle Language / ഭാഷ മാറ്റുക"
            aria-label="Toggle Language"
          >
            <Globe className="w-4 h-4 text-[#0E7C86]" />
            <span className="hidden sm:inline">{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsDark(prev => !prev)}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center active:scale-95"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#334E73]" />}
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center py-4 px-1 sm:p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 sm:p-8 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full p-1 bg-gradient-to-br from-[#C9A227] via-[#0E7C86] to-[#0F2A4A] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800 bg-[#0F2A4A]">
                <img
                  src="/college-campus.jpg"
                  alt="Majlis Umariyya Wafy College"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                {t.appTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {settings.collegeName}
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {authError && (
              <div className="p-3 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="font-medium">{authError}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t.common.username} / {t.common.cicNo}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or CIC Number..."
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-base sm:text-xs min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#0E7C86] transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t.common.password}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password..."
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-base sm:text-xs min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#0E7C86] transition shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 min-h-[48px] bg-[#0F2A4A] hover:bg-[#1E3A5F] dark:bg-[#0E7C86] dark:hover:bg-[#14919D] text-white font-bold text-sm sm:text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.nav.login}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-2 sm:py-3 text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} {settings.collegeName} • MUSF Summit Register
      </div>
    </div>
  );
};
