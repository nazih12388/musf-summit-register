import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Globe,
  Sparkles,
  MessageSquare,
  ArrowRight,
  X,
  Check,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

export const LoginPage = ({ isDark, setIsDark }) => {
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem('musf_saved_username') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('musf_remember_user') !== 'false';
    } catch {
      return true;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { login, authError } = useAuth();
  const { lang, toggleLanguage, tr, t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(t.common?.fillRequired || 'Please enter your username or CIC Number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Save or clear remembered username
      try {
        if (rememberMe) {
          localStorage.setItem('musf_remember_user', 'true');
          localStorage.setItem('musf_saved_username', username.trim());
        } else {
          localStorage.setItem('musf_remember_user', 'false');
          localStorage.removeItem('musf_saved_username');
        }
      } catch (storageErr) {
        console.warn('[Login] Remember me localStorage notice:', storageErr);
      }

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

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden relative flex flex-col justify-between bg-gradient-to-br from-[#E2EDFD] via-[#ECF3FE] to-[#D5E6FC] dark:from-[#081220] dark:via-[#0C1B30] dark:to-[#07101C] text-slate-800 dark:text-slate-100 font-sans select-none selection:bg-[#07244C] selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. DEDICATED MOBILE FULL-SCREEN BACKGROUND (Reference: media_de63d4bb)    */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 md:hidden overflow-hidden pointer-events-none select-none">
        {/* Full-bleed College Campus Photograph / Illustration */}
        <img
          src="/majlis-college-building.jpg"
          alt="Majlis Umariyya Wafy College Campus"
          className="w-full h-full object-cover object-[center_32%] scale-105"
        />

        {/* Soft Blue Atmospheric Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#BEE1FD]/82 via-[#D3E8FC]/68 to-[#A7D2F8]/88 dark:from-[#071322]/88 dark:via-[#091A2E]/82 dark:to-[#06101D]/92 backdrop-blur-[0.5px]" />

        {/* Subtle Watermark MUSF Emblem in Sky (10-18% opacity) */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-64 h-64 opacity-[0.16] dark:opacity-[0.20] pointer-events-none mix-blend-multiply dark:mix-blend-screen">
          <img
            src="/musf-official-emblem.png"
            alt="MUSF Emblem Watermark"
            className="w-full h-full object-contain filter drop-shadow-sm"
          />
        </div>

        {/* Flying Birds in Sky (Top Right) */}
        <svg
          className="absolute top-10 right-8 w-20 h-14 text-[#6384AD]/60 dark:text-blue-300/30"
          viewBox="0 0 100 60"
          fill="currentColor"
        >
          <path d="M10,25 Q16,18 22,23 Q28,18 34,25 Q28,21 22,26 Q16,21 10,25 Z" />
          <path d="M50,12 Q54,6 58,10 Q62,6 66,12 Q62,9 58,13 Q54,9 50,12 Z" />
          <path d="M78,20 Q81,15 84,18 Q87,15 90,20 Q87,18 84,21 Q81,18 78,20 Z" />
        </svg>

        {/* Soft Foliage Silhouette Curves at Bottom Corners */}
        <svg
          className="absolute -bottom-6 -left-6 w-52 h-auto text-[#133868]/70 dark:text-[#0C2242]/70 drop-shadow-md"
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
        </svg>

        <svg
          className="absolute -bottom-6 -right-6 w-44 h-auto text-[#274D80]/20 dark:text-blue-950/20"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M210,210 Q160,160 130,110 Q110,80 100,40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M180,180 Q145,165 135,140 Q155,145 180,180 Z" />
          <path d="M155,145 Q120,130 110,105 Q130,110 155,145 Z" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP BACKGROUND GRAPHICS (1024px+ Untouched)                        */}
      {/* ========================================================================= */}
      <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden z-0">
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

        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] rounded-full bg-blue-300/20 dark:bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-300/15 dark:bg-indigo-600/5 blur-3xl" />

        <svg
          className="absolute top-12 right-[15%] w-24 h-16 text-[#6B8BB4]/60 dark:text-blue-300/30"
          viewBox="0 0 100 60"
          fill="currentColor"
        >
          <path d="M10,25 Q16,18 22,23 Q28,18 34,25 Q28,21 22,26 Q16,21 10,25 Z" />
          <path d="M50,12 Q54,6 58,10 Q62,6 66,12 Q62,9 58,13 Q54,9 50,12 Z" />
          <path d="M78,20 Q81,15 84,18 Q87,15 90,20 Q87,18 84,21 Q81,18 78,20 Z" />
        </svg>

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
        </svg>

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

      {/* ========================================================================= */}
      {/* 3. TOP UTILITY HEADER: MUSF Portal, Malayalam/English & Theme             */}
      {/* ========================================================================= */}
      <header className="shrink-0 relative z-20 w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1E56A0] dark:text-blue-300 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-blue-200/90 dark:border-blue-800/80 shadow-2xs backdrop-blur-md">
            MUSF Portal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3.5 py-1.5 rounded-full border border-blue-200/90 dark:border-blue-800/80 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-blue-950 dark:text-blue-200 font-bold text-xs flex items-center gap-1.5 transition-all duration-200 shadow-2xs hover:shadow hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md"
            title={lang === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക'}
          >
            <Globe className="w-3.5 h-3.5 text-[#1E56A0] dark:text-blue-400" />
            <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
            <ChevronDown className="w-3 h-3 text-[#1E56A0] dark:text-blue-400 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => setIsDark(prev => !prev)}
            className="p-2 rounded-full border border-blue-200/90 dark:border-blue-800/80 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all duration-200 shadow-2xs hover:shadow hover:scale-102 active:scale-95 cursor-pointer backdrop-blur-md"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1E56A0]" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. MAIN CARD VIEWPORT: Responsive Glass Card (Mobile) & Split (Desktop)   */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto px-3.5 sm:px-6 flex-1 min-h-0 flex items-center justify-center py-2 sm:py-4 overflow-y-auto">
        <div className="w-[92%] sm:w-[88%] max-w-[390px] md:max-w-none md:w-full rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-white/50 dark:bg-[#0C1A2E]/70 md:bg-white md:dark:bg-[#0D1929] backdrop-blur-md md:backdrop-blur-none shadow-2xl shadow-blue-900/15 border border-white/75 dark:border-white/10 md:border-white/90 md:dark:border-slate-800/80 overflow-hidden flex flex-col md:flex-row transition-all duration-300">
          
          {/* ===================================================================== */}
          {/* DESKTOP ONLY LEFT SECTION: Campus & Watermark Art (Hidden on mobile)  */}
          {/* ===================================================================== */}
          <div className="hidden md:flex relative md:w-[46%] lg:w-[48%] shrink-0 bg-[#CFE3FB] dark:bg-[#0B1A2F] items-center justify-center overflow-hidden">
            <img
              src="/musf-login-hero.jpg"
              alt="Majlis Umariyya Wafy College Campus & MUSF Emblem"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
              loading="eager"
            />
          </div>

          {/* ===================================================================== */}
          {/* LOGIN FORM SECTION (Clean Glass on Mobile, Solid Card on Desktop)     */}
          {/* ===================================================================== */}
          <div className="w-full md:w-[54%] lg:w-[52%] bg-transparent md:bg-white md:dark:bg-[#0D1929] p-5 sm:p-7 md:p-8 lg:p-10 flex flex-col justify-center">
            
            {/* Heading & Subtitle */}
            <div className="mb-4 sm:mb-5 text-center md:text-left">
              <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-black text-[#0D244D] dark:text-white tracking-tight leading-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-[13px] font-semibold text-[#5A7396] dark:text-slate-400 mt-1">
                Sign in to continue to MUSF
              </p>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="mb-3.5 p-2.5 sm:p-3 bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/80 rounded-xl sm:rounded-2xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-shake backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {error && (
              <div className="mb-3.5 p-2.5 sm:p-3 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/80 rounded-xl sm:rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-shake backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              
              {/* Username / CIC Field */}
              <div className="space-y-1">
                <div className="relative rounded-2xl border border-white/80 dark:border-slate-700 bg-[#E8F2FD]/80 dark:bg-slate-800/80 focus-within:border-[#1E56A0] focus-within:bg-white/95 dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <User className="w-4.5 h-4.5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#5F789D] dark:text-slate-400 pointer-events-none transition-colors" />
                  <input
                    type="text"
                    required
                    autoFocus
                    autoCapitalize="none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={tr('Username / Student ID', 'യൂസർനെയിം / CIC നമ്പർ')}
                    className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm md:text-base text-slate-800 dark:text-white placeholder-[#8AA0BE] dark:placeholder-slate-500 bg-transparent outline-none font-medium rounded-2xl"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="relative rounded-2xl border border-white/80 dark:border-slate-700 bg-[#E8F2FD]/80 dark:bg-slate-800/80 focus-within:border-[#1E56A0] focus-within:bg-white/95 dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <Lock className="w-4.5 h-4.5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#5F789D] dark:text-slate-400 pointer-events-none transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tr('Password', 'പാസ്‌വേഡ്')}
                    className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-11 sm:pr-12 text-xs sm:text-sm md:text-base text-slate-800 dark:text-white placeholder-[#8AA0BE] dark:placeholder-slate-500 bg-transparent outline-none font-medium rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8AA0BE] hover:text-[#5F789D] dark:hover:text-slate-300 transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Row: Remember Me & Forgot Password? */}
              <div className="flex items-center justify-between text-xs pt-0.5 px-0.5 select-none">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-[5px] flex items-center justify-center transition-all ${
                    rememberMe ? 'bg-[#0E4B92] text-white shadow-xs' : 'border border-[#A8C2E2] dark:border-slate-600 bg-white/80 dark:bg-slate-800'
                  }`}>
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-[12px] font-semibold text-[#3D5677] dark:text-slate-300">
                    {tr('Remember Me', 'ഓർത്തു വെക്കുക')}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[12px] font-bold text-[#1E56A0] dark:text-blue-400 hover:underline transition cursor-pointer"
                >
                  {tr('Forgot Password?', 'പാസ്‌വേഡ് മറന്നോ?')}
                </button>
              </div>

              {/* Full-Width Navy Gradient Login Button */}
              <div className="pt-1.5 sm:pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#07244C] via-[#092B57] to-[#0D3870] hover:from-[#0A2F5E] hover:to-[#104484] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-950/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60"
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
              <div className="relative my-2 sm:my-3 flex items-center justify-center">
                <div className="border-t border-[#D5E4F5] dark:border-slate-700/80 w-full" />
                <span className="bg-[#EBF3FC]/90 dark:bg-slate-800/90 px-3 py-0.5 rounded-full text-[10px] text-[#7890B2] dark:text-slate-400 font-bold select-none">
                  or
                </span>
              </div>

              {/* Footer text */}
              <div className="text-center">
                <p className="text-[11px] sm:text-xs text-[#6680A4] dark:text-slate-400 font-semibold tracking-wide">
                  Powered by MUSF
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. INSTITUTIONAL BOTTOM FOOTER & BATCH 7 DEDICATION                       */}
      {/* ========================================================================= */}
      <footer className="shrink-0 relative z-20 w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pb-2.5 sm:pb-3 flex flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-[#5D779B] dark:text-slate-400">
        <div className="flex items-center gap-1.5 truncate max-w-[50%] sm:max-w-none">
          <span className="truncate">&copy; {new Date().getFullYear()} Majlis Umariyya Wafy College &bull; Puramannur</span>
        </div>

        {/* Batch 7 Dedication Modal Opener */}
        <button
          type="button"
          onClick={() => setIsBatchModalOpen(true)}
          className="shrink-0 group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/75 dark:bg-slate-900/75 hover:bg-white dark:hover:bg-slate-900 border border-white/80 dark:border-blue-800/80 shadow-2xs backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-[#486284] dark:text-slate-300 hover:text-[#1E56A0] dark:hover:text-blue-400 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Click to view Batch 7 dedication, Dua & feedback"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 animate-pulse transition-transform" />
          <span>Created by <strong className="text-[#0D244D] dark:text-blue-300 font-bold group-hover:underline">Swada Union Batch 7</strong></span>
          <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
        </button>
      </footer>

      {/* ========================================================================= */}
      {/* 6. FORGOT PASSWORD DIALOG                                                 */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
          onClick={() => setIsForgotModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white dark:bg-[#0D1829] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-400 to-indigo-600" />

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1E56A0] dark:text-blue-300 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    {tr('Password Assistance', 'പാസ്‌വേഡ് സഹായം')}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Majlis Umariyya Wafy College
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {tr(
                'If you have forgotten your password or need an account password reset, please contact the College Union Admin or your Wing Convener at the MUSF Central Office.',
                'പാസ്‌വേഡ് മറന്നുപോയെങ്കിൽ റീസെറ്റ് ചെയ്യുന്നതിനായി കോളേജ് യൂണിയൻ അഡ്മിനുമായോ നിങ്ങളുടെ വിംഗ് കൺവീനറുമായോ ബന്ധപ്പെടുക.'
              )}
            </p>

            <div className="pt-1 space-y-2">
              <a
                href="https://wa.me/916238557807?text=Assalamu%20Alaikum%2C%20I%20need%20assistance%20recovering%20my%20MUSF%20portal%20password."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#092853] hover:bg-[#0D3870] active:scale-[0.98] text-white font-bold text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer no-underline text-center"
              >
                <MessageSquare className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{tr('Contact Admin via WhatsApp', 'അഡ്മിനെ വാട്സാപ്പിൽ ബന്ധപ്പെടുക')}</span>
              </a>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                {tr('Dismiss', 'മടങ്ങുക')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CREATOR DEDICATION, DUA & FEEDBACK MODAL                                */}
      {/* ========================================================================= */}
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
