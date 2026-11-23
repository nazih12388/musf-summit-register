import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Tv,
  Moon,
  Sun,
  Globe,
  Sparkles,
  MessageSquare,
  ArrowRight,
  X
} from 'lucide-react';

export const LoginPage = ({ isDark, setIsDark }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const { login, authError } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(t.common?.fillRequired || 'Please enter your username or CIC Number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(username.trim(), password ? password.trim() : '');
    } catch (err) {
      console.error('[Login] Submission failed:', err);
      const code = err?.code || '';
      let msg = err?.message || 'Invalid credentials. Please verify and try again.';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        msg = 'Invalid username or password. Please verify and try again.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please wait a few moments before trying again.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network connection error. Checking offline credentials...';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditoriumMode = () => {
    try {
      const publicViewer = {
        id: 'auditorium_guest',
        username: 'guest_display',
        name: 'Auditorium Projector Display',
        role: 'student'
      };
      localStorage.setItem('musf_current_user_v1', JSON.stringify(publicViewer));
      window.location.reload();
    } catch (e) {
      console.warn('Auditorium mode notice:', e);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden relative flex flex-col justify-between bg-gradient-to-br from-[#E2EDFD] via-[#ECF3FE] to-[#D5E6FC] dark:from-[#081220] dark:via-[#0C1B30] dark:to-[#07101C] text-slate-800 dark:text-slate-100 font-sans select-none selection:bg-[#07244C] selection:text-white">
      
      {/* ========================================================= */}
      {/* BACKGROUND GRAPHICS: Soft Curves, Foliage & Distant Birds  */}
      {/* ========================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Background Wave Layers */}
        <svg
          className="absolute -top-1/4 -right-1/4 w-[80vw] h-[80vw] text-blue-200/30 dark:text-blue-900/10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M0,50 Q25,20 50,50 T100,50 L100,0 L0,0 Z" />
        </svg>

        <svg
          className="absolute -bottom-1/4 -left-1/4 w-[85vw] h-[85vw] text-blue-200/25 dark:text-blue-950/20"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M0,50 Q25,80 50,50 T100,50 L100,100 L0,100 Z" />
        </svg>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] rounded-full bg-blue-300/20 dark:bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-300/15 dark:bg-indigo-600/5 blur-3xl" />

        {/* Flying Birds in Sky (Top Right) */}
        <svg
          className="absolute top-12 right-[15%] w-24 h-16 text-[#6B8BB4]/60 dark:text-blue-300/30"
          viewBox="0 0 100 60"
          fill="currentColor"
        >
          <path d="M10,25 Q16,18 22,23 Q28,18 34,25 Q28,21 22,26 Q16,21 10,25 Z" />
          <path d="M50,12 Q54,6 58,10 Q62,6 66,12 Q62,9 58,13 Q54,9 50,12 Z" />
          <path d="M78,20 Q81,15 84,18 Q87,15 90,20 Q87,18 84,21 Q81,18 78,20 Z" />
        </svg>

        {/* Bottom-Left Foliage Silhouette (Matching Reference) */}
        <svg
          className="absolute -bottom-6 -left-6 w-52 sm:w-72 md:w-80 h-auto text-[#133868]/85 dark:text-[#0C2242]/70 drop-shadow-xl"
          viewBox="0 0 240 240"
          fill="currentColor"
        >
          <path d="M-10,250 Q40,190 90,130 Q120,90 140,40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M30,210 Q65,195 75,170 Q55,175 30,210 Z" />
          <path d="M20,185 Q45,155 70,150 Q55,170 20,185 Z" />
          <path d="M55,165 Q95,145 105,115 Q80,125 55,165 Z" />
          <path d="M70,140 Q110,120 120,90 Q95,100 70,140 Z" />
          <path d="M85,115 Q125,95 138,65 Q115,75 85,115 Z" />
          <path d="M105,90 Q145,65 155,35 Q135,48 105,90 Z" />
          <path d="M125,60 Q155,35 160,10 Q145,28 125,60 Z" />
          <path d="M-5,160 Q25,120 60,100 Q40,130 -5,160 Z" opacity="0.9" />
          <path d="M-10,210 Q20,165 45,145 Q25,180 -10,210 Z" opacity="0.95" />
          <path d="M45,240 Q75,190 110,175 Q85,210 45,240 Z" opacity="0.8" />
        </svg>

        {/* Bottom-Right Foliage Silhouette */}
        <svg
          className="absolute -bottom-8 -right-8 w-44 sm:w-60 h-auto text-[#274D80]/20 dark:text-blue-950/20"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M210,210 Q160,160 130,110 Q110,80 100,40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M180,180 Q145,165 135,140 Q155,145 180,180 Z" />
          <path d="M155,145 Q120,130 110,105 Q130,110 155,145 Z" />
          <path d="M130,110 Q95,95 85,70 Q105,75 130,110 Z" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* TOP UTILITY HEADER: Auditorium Mode, Language, Theme      */}
      {/* ========================================================= */}
      <header className="shrink-0 relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAuditoriumMode}
          className="px-3 py-1.5 rounded-full border border-blue-200/90 dark:border-blue-800/80 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 text-blue-950 dark:text-blue-200 font-semibold text-xs flex items-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Auditorium Projector Display Mode"
        >
          <Tv className="w-3.5 h-3.5 text-[#1E56A0] dark:text-blue-400 shrink-0" />
          <span className="hidden sm:inline">Auditorium Mode</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full border border-blue-200/90 dark:border-blue-800/80 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 text-blue-950 dark:text-blue-200 font-semibold text-xs flex items-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md"
            title={lang === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക'}
          >
            <Globe className="w-3.5 h-3.5 text-[#1E56A0] dark:text-blue-400" />
            <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDark(prev => !prev)}
            className="p-1.5 rounded-full border border-blue-200/90 dark:border-blue-800/80 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all duration-200 shadow-sm hover:shadow hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1E56A0]" />}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CARD: Exact Reference Layout (Fitted / No Scroll)    */}
      {/* ========================================================= */}
      <main className="relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto px-3.5 sm:px-6 flex-1 min-h-0 flex items-center justify-center py-1 sm:py-2">
        <div className="w-full max-h-full rounded-2xl sm:rounded-3xl md:rounded-[32px] bg-white dark:bg-[#0D1929] shadow-2xl shadow-blue-900/12 border border-white/90 dark:border-slate-800/80 overflow-hidden flex flex-col md:flex-row transition-all duration-300">
          
          {/* ===================================================== */}
          {/* LEFT SECTION: Campus & Watermark Art                  */}
          {/* ===================================================== */}
          <div className="relative w-full h-24 sm:h-32 md:h-auto md:w-[46%] lg:w-[48%] shrink-0 bg-[#CFE3FB] dark:bg-[#0B1A2F] flex flex-col justify-end overflow-hidden">
            <img
              src="/musf-login-hero.jpg"
              alt="Majlis Umariyya Wafy College Campus & MUSF Emblem"
              className="w-full h-full object-cover object-bottom select-none pointer-events-none"
              loading="eager"
            />
          </div>

          {/* ===================================================== */}
          {/* RIGHT SECTION: Clean Modern Login Form                */}
          {/* ===================================================== */}
          <div className="w-full md:w-[54%] lg:w-[52%] bg-white dark:bg-[#0D1929] p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center">
            
            {/* Heading & Subtitle */}
            <div className="mb-3.5 sm:mb-5 text-center md:text-left">
              <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-extrabold text-[#0D244D] dark:text-white tracking-tight leading-tight">
                Welcome Back
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#5F7597] dark:text-slate-400 mt-1">
                Sign in to continue to MUSF
              </p>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="mb-3 p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-xl sm:rounded-2xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {error && (
              <div className="mb-3 p-2.5 sm:p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-xl sm:rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3.5">
              
              {/* Username / CIC Field */}
              <div className="space-y-1">
                <div className="relative rounded-xl sm:rounded-2xl border border-[#D5E1F0] dark:border-slate-700 bg-[#F7FAFD] dark:bg-slate-800/60 focus-within:border-[#1E56A0] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <User className="w-4.5 h-4.5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#5F789D] dark:text-slate-400 pointer-events-none transition-colors" />
                  <input
                    type="text"
                    required
                    autoFocus
                    autoCapitalize="none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm md:text-base text-slate-800 dark:text-white placeholder-[#8FA3C0] dark:placeholder-slate-500 bg-transparent outline-none font-medium rounded-xl sm:rounded-2xl"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="relative rounded-xl sm:rounded-2xl border border-[#D5E1F0] dark:border-slate-700 bg-[#F7FAFD] dark:bg-slate-800/60 focus-within:border-[#1E56A0] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <Lock className="w-4.5 h-4.5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#5F789D] dark:text-slate-400 pointer-events-none transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-11 sm:pr-12 text-xs sm:text-sm md:text-base text-slate-800 dark:text-white placeholder-[#8FA3C0] dark:placeholder-slate-500 bg-transparent outline-none font-medium rounded-xl sm:rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8FA3C0] hover:text-[#5F789D] dark:hover:text-slate-300 transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Direct Full-Width Navy Gradient Login Button */}
              <div className="pt-1 sm:pt-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#07244C] via-[#0A2F5E] to-[#0D3870] hover:from-[#0A2F5E] hover:to-[#104484] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm md:text-base shadow-lg shadow-blue-950/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-200" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <span className="text-base sm:text-lg leading-none font-light">→</span>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-2.5 sm:my-3.5 flex items-center justify-center">
                <div className="border-t border-[#E2EAF4] dark:border-slate-700/80 w-full" />
                <span className="bg-white dark:bg-[#0D1929] px-3 text-[11px] sm:text-xs text-[#8FA3C0] dark:text-slate-500 font-medium select-none">
                  or
                </span>
              </div>

              {/* Footer text */}
              <div className="text-center">
                <p className="text-[11px] sm:text-xs text-[#7186A4] dark:text-slate-400 font-medium tracking-wide">
                  Powered by MUSF
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* INSTITUTIONAL BOTTOM FOOTER & BATCH 7 DEDICATION          */}
      {/* ========================================================= */}
      <footer className="shrink-0 relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pb-2 sm:pb-3 flex flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-[#6B82A6] dark:text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <span>&copy; {new Date().getFullYear()} Majlis Umariyya Wafy College &bull; Puramannur</span>
        </div>

        {/* Batch 7 Dedication Modal Opener */}
        <button
          type="button"
          onClick={() => setIsBatchModalOpen(true)}
          className="shrink-0 group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 border border-blue-200/90 dark:border-blue-800/80 shadow-2xs backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-[#486284] dark:text-slate-300 hover:text-[#1E56A0] dark:hover:text-blue-400 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Click to view Batch 7 dedication, Dua & feedback"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 animate-pulse transition-transform" />
          <span>Created by <strong className="text-[#0D244D] dark:text-blue-300 font-bold group-hover:underline">Swada Union Batch 7</strong></span>
          <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
        </button>
      </footer>

      {/* ========================================================= */}
      {/* CREATOR DEDICATION, DUA & FEEDBACK MODAL                   */}
      {/* ========================================================= */}
      {isBatchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setIsBatchModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#0D1829] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-400 to-indigo-600" />

            {/* Header: Title & Close Button */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    Swada Union — Batch 7
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Majlis Umariyya Wafy College
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guidance & Mentorship Credit */}
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Conceptualized, designed, and developed under the valuable guidance and mentorship of <strong className="font-bold text-slate-900 dark:text-white">Jabir Hudawi</strong> for the students of Majlis Umariyya.
            </p>

            {/* Dua specifically for the creators, developers & team */}
            <div className="pt-3 pb-2 border-y border-slate-100 dark:border-slate-800/80 space-y-2">
              <p className="text-base sm:text-lg font-arabic font-bold text-blue-900 dark:text-blue-200 leading-relaxed text-center" dir="rtl">
                رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center italic">
                &ldquo;O Allah, accept this work from its creators and mentors, bless their knowledge, sincerity, and efforts, and grant them goodness and success in this world and the Hereafter.&rdquo;
              </p>
            </div>

            {/* Action Button — Send Feedback */}
            <div className="pt-1">
              <a
                href="https://wa.me/916238557807?text=Assalamu%20Alaikum%2C%20feedback%20regarding%20the%20MUSF%20App%3A%20"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer no-underline text-center group"
              >
                <MessageSquare className="w-4 h-4 text-emerald-200 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Send Feedback</span>
                <ArrowRight className="w-4 h-4 text-emerald-200 shrink-0 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
