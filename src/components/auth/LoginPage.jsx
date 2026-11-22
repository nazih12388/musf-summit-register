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
  Building2,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Crown,
  Palette,
  Award,
  MessageSquare,
  X
} from 'lucide-react';

export const LoginPage = ({ isDark, setIsDark }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
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
    <div className="min-h-[100dvh] relative flex flex-col justify-between bg-[#F1F4F9] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Soft Ambient Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      {/* Top Header Controls (Auditorium Mode, Language, Theme) */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAuditoriumMode}
            className="px-3.5 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-600/40 bg-white/80 dark:bg-amber-950/40 hover:bg-amber-50 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold text-xs flex items-center gap-2 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="Auditorium Projector Display"
          >
            <Tv className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Auditorium Mode</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title={lang === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDark(prev => !prev)}
            className="p-2 rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Main Centered Split-Screen Hero & Login Showcase */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 my-auto py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row overflow-hidden rounded-[32px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0F1B2B] shadow-2xl shadow-blue-950/15 backdrop-blur-xl">

          {/* ========================================================= */}
          {/* LEFT PANEL: Deep Royal Blue Brand & Glass Actions Panel  */}
          {/* ========================================================= */}
          <div className="relative overflow-hidden lg:w-[42%] bg-gradient-to-br from-[#1E5AE6] via-[#1A48D2] to-[#1236A6] text-white p-6 sm:p-9 flex flex-col justify-between items-center text-center animate-slide-in-left">
            {/* Geometric Concentric Watermark Rings (Exact Reference Style) */}
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute -top-8 -left-8 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute top-1/2 -right-24 w-88 h-88 rounded-full border border-white/10 pointer-events-none animate-float-slow" />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/15 pointer-events-none" />

            {/* Crest & Identity */}
            <div className="relative z-10 w-full flex flex-col items-center space-y-3.5 pt-2">
              <div className="relative w-24 h-24 rounded-full p-1.5 bg-white/20 backdrop-blur-md border border-white/40 shadow-xl group">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-1 flex items-center justify-center">
                  <img
                    src="/amu-crest-square.png"
                    alt="Majlis Umariyya Wafy College"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/college-crest.jpg';
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  WafyMajlis
                </h1>
                <p className="text-sm font-serif tracking-widest text-blue-100 font-semibold" dir="rtl">
                  إيمان • علم • عمل
                </p>
                <div className="pt-0.5">
                  <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                    MUSF &bull; Majlis Umariyya
                  </span>
                </div>
              </div>
            </div>

            {/* Three Exact MUSF Glass Action Pills */}
            <div className="relative z-10 w-full space-y-2.5 pt-7 pb-4">
              <button
                type="button"
                onClick={() => setInfoModal('know_executives')}
                className="w-full py-3 px-4 rounded-2xl bg-white/12 hover:bg-white/22 active:scale-97 border border-white/25 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer hover:shadow-md group"
              >
                <Crown className="w-4 h-4 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Know Executives</span>
              </button>

              <button
                type="button"
                onClick={() => setInfoModal('summit')}
                className="w-full py-3 px-4 rounded-2xl bg-white/12 hover:bg-white/22 active:scale-97 border border-white/25 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer hover:shadow-md group"
              >
                <Palette className="w-4 h-4 text-cyan-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Summit</span>
              </button>

              <button
                type="button"
                onClick={() => setInfoModal('review_certificates')}
                className="w-full py-3 px-4 rounded-2xl bg-white/12 hover:bg-white/22 active:scale-97 border border-white/25 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer hover:shadow-md group"
              >
                <Award className="w-4 h-4 text-emerald-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Review Certificates</span>
              </button>
            </div>

            {/* Left Footer Note */}
            <div className="relative z-10 text-[11px] text-white/70 font-medium">
              Affiliated to Coordination of Islamic Colleges (CIC)
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: Welcome Showcase & Fluid Sign-In Form        */}
          {/* ========================================================= */}
          <div className="lg:w-[58%] p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-[#0F1B2B] animate-slide-in-right">
            {!showLoginForm ? (
              /* VIEW 1: THE WELCOME SHOWCASE (Matches Screenshot Exactly) */
              <div className="space-y-6">
                {/* Top Mini Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl border border-blue-200/80 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold text-xs font-serif" dir="rtl">
                    السَّلَامُ عَلَيْكُمْ
                  </span>
                  <span className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <span>☀️ 32° C</span>
                    <span className="text-slate-400">• Puramannur</span>
                  </span>
                </div>

                {/* Welcome Heading & Student-Focused MUSF Union Description */}
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Welcome</span>
                    <span className="animate-wave-hand">👋</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                    {lang === 'ml'
                      ? 'മജ്‌ലിസ് ഉമരിയ്യ സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ (MUSF) ഔദ്യോഗിക പോർട്ടലിലേക്ക് സ്വാഗതം. വിദ്യാർത്ഥി ഐക്യം, നേതൃപാടവം, സർഗ്ഗാത്മക മികവ്, അക്കാദമിക മുന്നേറ്റം എന്നിവയെ മുൻനിർത്തി സമ്മിറ്റ് മത്സരങ്ങൾ, വിംഗ് പ്രവർത്തനങ്ങൾ, സർട്ടിഫിക്കറ്റ് വിതരണങ്ങൾ എന്നിവ സമഗ്രമായി ഏകോപിപ്പിക്കുന്നു.'
                      : "Welcome to the official portal of Majlis Umariyya Students' Federation (MUSF). Dedicated to fostering student unity, creative leadership, and academic distinction across all batches. Experience streamlined access to your Fine Arts Summit standings, autonomous wing programs, and verified merit achievements."}
                  </p>
                </div>

                {/* Three Spiritual Action Cards (Begin with Bismillah, Live by Sunnah, End with Shukr) */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
                  {/* Card 1: Bismillah */}
                  <div className="p-3 sm:p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-400/40 hover:shadow-md transition-all duration-300 text-center space-y-1.5 group cursor-default">
                    <div className="w-8 h-8 mx-auto rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Begin with
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                      Bismillah
                    </span>
                  </div>

                  {/* Card 2: Sunnah */}
                  <div className="p-3 sm:p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-400/40 hover:shadow-md transition-all duration-300 text-center space-y-1.5 group cursor-default">
                    <div className="w-8 h-8 mx-auto rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      Live by
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                      Sunnah
                    </span>
                  </div>

                  {/* Card 3: Shukr */}
                  <div className="p-3 sm:p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-400/40 hover:shadow-md transition-all duration-300 text-center space-y-1.5 group cursor-default">
                    <div className="w-8 h-8 mx-auto rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block truncate">
                      End with
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                      Shukr
                    </span>
                  </div>
                </div>

                {/* Primary Action Button (Fluidly opens Sign In credentials) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLoginForm(true)}
                    className="w-full py-4 px-6 rounded-2xl bg-[#1A253D] hover:bg-[#11192C] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group"
                  >
                    <span>Sign in with WafyMajlis</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </button>
                </div>

                {/* Sublink Note */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowLoginForm(true)}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    <span>Join </span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold">Wafy way</span>
                    <span className="text-slate-400 font-normal"> &bull; Majlis Umariyya Wafy College</span>
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW 2: CREDENTIALS INPUT FORM (Smooth Staggered Inputs) */
              <div className="space-y-5 animate-slide-in-right">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLoginForm(false)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Overview</span>
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">MUSF Auth v2.0</span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Sign in to Portal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enter your CIC Number or username and password to access student and union services.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  {/* Error Notification */}
                  {authError && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Username / CIC */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.common?.username || 'Username'} or {t.common?.cicNo || 'CIC Number'}
                    </label>
                    <div className="relative group focus-within:ring-2 focus-within:ring-blue-600 rounded-xl transition-all">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 group-focus-within:scale-110 pointer-events-none transition-all duration-200" />
                      <input
                        type="text"
                        required
                        autoFocus
                        autoCapitalize="none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username or CIC number"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm min-h-[44px] focus:outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.common?.password || 'Password'}
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">
                        (Students: optional)
                      </span>
                    </div>
                    <div className="relative group focus-within:ring-2 focus-within:ring-blue-600 rounded-xl transition-all">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 group-focus-within:scale-110 pointer-events-none transition-all duration-200" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm min-h-[44px] focus:outline-none transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1E5AE6] to-[#1236A6] hover:from-[#194ec7] hover:to-[#0f2c8a] active:scale-[0.98] text-white font-extrabold text-sm transition-all duration-200 shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[46px] cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Clean Bottom Institutional Footer & Creator Credit */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Majlis Umariyya Wafy College &bull; Puramannur.</span>
        </div>

        {/* Interactive Creator Credit Badge */}
        <button
          type="button"
          onClick={() => setIsBatchModalOpen(true)}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-slate-200/90 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-2xs hover:shadow-xs backdrop-blur-md text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Click to view Batch 7 dedication, Dua, mentorship credit & feedback"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 animate-pulse transition-transform" />
          <span>Created by <strong className="text-[#1E5AE6] dark:text-blue-400 font-extrabold tracking-wide group-hover:underline">Swada Union Batch 7</strong></span>
          <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
        </button>
      </footer>

      {/* ========================================================= */}
      {/* CREATOR DEDICATION, DUA & FEEDBACK (ONE UNIFIED CARD)       */}
      {/* ========================================================= */}
      {isBatchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setIsBatchModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#0D1829] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up-center space-y-5"
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

            {/* Single Clean Action Button — Send Feedback */}
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

      {/* ========================================================= */}
      {/* INFORMATIONAL MODAL FOR LEFT PILL BUTTONS                  */}
      {/* ========================================================= */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0F1B2B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-up-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  {infoModal === 'know_executives' && <Crown className="w-5 h-5 text-amber-500" />}
                  {infoModal === 'summit' && <Palette className="w-5 h-5 text-cyan-500" />}
                  {infoModal === 'review_certificates' && <Award className="w-5 h-5 text-emerald-500" />}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {infoModal === 'know_executives' && 'Know Executives • Union Leadership'}
                  {infoModal === 'summit' && 'Fine Arts Summit • Cultural Arena'}
                  {infoModal === 'review_certificates' && 'Review Certificates & Verified Awards'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              {infoModal === 'know_executives' && (
                <>
                  <p>
                    The <strong>Majlis Umariyya Students' Federation (MUSF)</strong> is governed by an elected Central Executive Council comprising the Chairman, General Secretary, Vice Chairmen, Joint Secretaries, and Wing Conveners.
                  </p>
                  <p>
                    The Executive Council supervises autonomous wing initiatives, campus assemblies, student welfare, and collegiate representations across the academic year.
                  </p>
                </>
              )}
              {infoModal === 'summit' && (
                <>
                  <p>
                    The <strong>Fine Arts Summit</strong> is the premier annual creative and literary cultural festival of Majlis Umariyya Wafy College.
                  </p>
                  <p>
                    Students compete across stage and off-stage artistic disciplines representing their official house teams (Sahara, Alps, etc.) with real-time mark tabulation and standings.
                  </p>
                </>
              )}
              {infoModal === 'review_certificates' && (
                <>
                  <p>
                    All merit certificates and competition achievements earned under MUSF are verified, registered, and archived digitally.
                  </p>
                  <p>
                    Students can inspect and download their official tamper-proof PDF merit certificates directly from their Student Dashboard anytime.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer active:scale-95 transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
