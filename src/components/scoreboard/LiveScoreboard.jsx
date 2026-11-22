import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  Maximize2,
  Minimize2,
  Share2,
  RefreshCw,
  Flame,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const LiveScoreboard = () => {
  const { teamStandings = [], programResultsMap = {}, programs = [], settings = {}, notices = [] } = useApp();
  const { t } = useLanguage();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedResultToShare, setSelectedResultToShare] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, teams, results
  const [pulseSync, setPulseSync] = useState(false);

  // Trigger celebratory confetti once on mount or when 1st place updates
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#059669', '#d97706', '#fbbf24', '#2563eb']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Periodic heartbeat sync pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseSync(prev => !prev);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // If public scoreboard is disabled by admin
  if (!settings.publicScoreboardEnabled) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white rounded-3xl border border-amber-500/20 my-6 shadow-2xl">
        <Trophy className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-amber-400 mb-2">Live Scoreboard Paused</h2>
        <p className="text-slate-400 max-w-md">
          The summit committee has temporarily paused the live scoreboard for result tabulation. It will resume shortly!
        </p>
      </div>
    );
  }

  // Find maximum team points for proportional bar width
  const maxTeamPoints = Math.max(...teamStandings.map(t => t.totalPoints), 10);

  // Collect declared results (programs with results)
  const declaredPrograms = programs.filter(p => programResultsMap[p.id] && programResultsMap[p.id].length > 0);

  // Latest notice
  const latestNotice = notices[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Control Bar */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white p-6 sm:p-8 shadow-2xl border-2 border-amber-500/30">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE SCOREBOARD & PROJECTOR</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
              <span>{settings.collegeName || "Majlis Umariyya Wafy College"}</span>
            </h1>
            <p className="text-amber-400 font-semibold text-lg sm:text-xl">
              {settings.summitName || "MUSF Summit Register 2026"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }}
              title="Celebrate"
              className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition flex items-center gap-2 text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Celebrate</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-2xl bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-600/40 text-white transition flex items-center gap-2 text-sm font-semibold"
              title="Toggle Projector Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">Projector Mode</span>
            </button>
          </div>
        </div>

        {/* Ticker for latest announcement */}
        {latestNotice && (
          <div className="mt-6 pt-4 border-t border-emerald-800/60 flex items-center gap-3 text-xs sm:text-sm text-emerald-200/90">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black shrink-0 text-[11px] uppercase tracking-wider">
              FLASH
            </span>
            <marquee className="font-medium">
              {latestNotice.title}: {latestNotice.message} ({latestNotice.date})
            </marquee>
          </div>
        )}
      </div>

      {/* Podium for Top 3 Teams */}
      {teamStandings.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto pt-4 items-end">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border-t-4 border-slate-400 shadow-md text-center flex flex-col items-center transition hover:scale-102">
              <span className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">2nd Place</span>
              <div 
                className="w-4 h-4 rounded-full mb-1" 
                style={{ backgroundColor: teamStandings[1].color }} 
              />
              <span className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate max-w-full">
                {teamStandings[1].name}
              </span>
              <span className="text-sm sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {teamStandings[1].totalPoints.toFixed(1)} <span className="text-[10px] font-normal">pts</span>
              </span>
            </div>
            <div className="w-full h-16 sm:h-20 bg-slate-300 dark:bg-slate-700 rounded-b-xl flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-xl">
              2
            </div>
          </div>

          {/* 1st Place (Taller) */}
          <div className="flex flex-col items-center -mt-6">
            <div className="w-full bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-4 sm:p-5 border-t-4 border-amber-400 shadow-xl text-center flex flex-col items-center relative transition hover:scale-105">
              <span className="absolute -top-4 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                CHAMPION
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#C9A227] mb-1">1st Place</span>
              <div 
                className="w-5 h-5 rounded-full mb-1" 
                style={{ backgroundColor: teamStandings[0].color }} 
              />
              <span className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-amber-200 truncate max-w-full">
                {teamStandings[0].name}
              </span>
              <span className="text-base sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {teamStandings[0].totalPoints.toFixed(1)} <span className="text-xs font-normal">pts</span>
              </span>
            </div>
            <div className="w-full h-24 sm:h-28 bg-gradient-to-b from-amber-400 to-amber-500 rounded-b-xl flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg">
              1
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border-t-4 border-amber-700 shadow-md text-center flex flex-col items-center transition hover:scale-102">
              <span className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">3rd Place</span>
              <div 
                className="w-4 h-4 rounded-full mb-1" 
                style={{ backgroundColor: teamStandings[2].color }} 
              />
              <span className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate max-w-full">
                {teamStandings[2].name}
              </span>
              <span className="text-sm sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {teamStandings[2].totalPoints.toFixed(1)} <span className="text-[10px] font-normal">pts</span>
              </span>
            </div>
            <div className="w-full h-12 sm:h-14 bg-amber-800/40 dark:bg-amber-900/60 rounded-b-xl flex items-center justify-center font-black text-amber-700 dark:text-amber-400 text-xl">
              3
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Animated Team Progress Bars & Declared Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Leaderboard & Animated Bars (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{t.scoreboard.teamStandings}</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {teamStandings.length} Teams Competing
              </span>
            </div>

            <div className="space-y-4">
              {teamStandings.map((team, index) => {
                const percentage = Math.round((team.totalPoints / maxTeamPoints) * 100);
                return (
                  <div key={team.id} className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-400 text-slate-950' :
                          index === 1 ? 'bg-slate-300 text-slate-800' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {team.rank}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {team.name}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                            ({team.memberCount} members)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-700 dark:text-amber-400">
                          {team.totalPoints.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">pts</span>
                      </div>
                    </div>

                    {/* Progress Bar with Team Color */}
                    <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-xs"
                        style={{
                          width: `${Math.max(percentage, 6)}%`,
                          backgroundColor: team.color || '#059669'
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>1st: {team.firstPlaces}  •  2nd: {team.secondPlaces}  •  3rd: {team.thirdPlaces}</span>
                      <span>A Grades: {team.aGrades}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Latest Declared Results (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{t.scoreboard.recentResults}</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {declaredPrograms.length} Declared
              </span>
            </div>

            {declaredPrograms.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm">{t.scoreboard.noResultsYet}</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[560px] pr-1">
                {declaredPrograms.map(prog => {
                  const results = programResultsMap[prog.id] || [];
                  const top3 = results.slice(0, 3);

                  return (
                    <div 
                      key={prog.id} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 transition hover:border-amber-500/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {prog.category}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                            {prog.name}
                          </h3>
                        </div>

                        {/* WhatsApp Share Action Button */}
                        <button
                          onClick={() => {
                            setSelectedResultToShare({
                              programName: prog.name,
                              category: prog.category,
                              date: prog.date,
                              winners: top3.map(r => ({
                                position: r.position,
                                name: r.participantName,
                                chestNo: r.chestNo,
                                teamName: r.teamName,
                                teamColor: r.teamColor,
                                mark: r.finalMark,
                                grade: r.grade
                              })),
                              collegeName: settings.collegeName,
                              festName: settings.festName
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition shrink-0"
                          title="Share Official Card on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Top 3 List */}
                      <div className="space-y-1.5 pt-1">
                        {top3.map((r, rIdx) => (
                          <div 
                            key={r.entryId || rIdx}
                            className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${
                                rIdx === 0 ? 'text-[#C9A227]' : 'text-slate-500'
                              }`}>
                                #{rIdx + 1}
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {r.participantName}
                              </span>
                              <span className="text-[11px] text-slate-400">({r.chestNo})</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span 
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                                style={{ backgroundColor: r.teamColor }}
                              >
                                {r.teamName}
                              </span>
                              <span className="font-black text-emerald-700 dark:text-amber-400">
                                {r.finalMark.toFixed(1)}/10
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Share Card Modal */}
      {selectedResultToShare && (
        <WhatsAppShareModal
          isOpen={Boolean(selectedResultToShare)}
          onClose={() => setSelectedResultToShare(null)}
          resultData={selectedResultToShare}
        />
      )}
    </div>
  );
};
