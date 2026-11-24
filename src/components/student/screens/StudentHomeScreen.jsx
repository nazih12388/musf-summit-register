import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  Calendar,
  Trophy,
  Award,
  Users,
  Bell,
  Palette,
  User,
  Clock,
  MapPin,
  Check,
  Sparkles,
  ArrowRight,
  Medal,
  Shield,
  Layers,
  CheckCircle2,
  ChevronRight,
  Crown,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

import { Hero } from '../ui/Hero';
import { OverlapCard } from '../ui/OverlapCard';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { IconTile } from '../ui/IconTile';
import { AvatarRing } from '../ui/AvatarRing';
import { SectionHeader } from '../ui/SectionHeader';
import { ProfileBottomSheet } from '../ui/ProfileBottomSheet';
import { BannerCarousel } from '../ui/BannerCarousel';
import { BannerSlideManagerModal } from '../../common/BannerSlideManagerModal';
import { triggerStudentConfetti } from '../ui/ConfettiHelper';
import { computeStudentAchievements } from '../achievementsConfig';
import { EASING, SPRING_POP, isReducedMotion } from '../motion';
import { useLanguage } from '../../../context/LanguageContext';

export const StudentHomeScreen = ({
  student,
  cl,
  sec,
  wings = [],
  wingPrograms = [],
  unionOfficials = [],
  students = [],
  myRegisteredWingPrograms = [],
  myUnionWins = [],
  myCertificates = [],
  mySummitEntries = [],
  notifications = [],
  unreadCount = 0,
  team,
  banners = [],
  addBanner,
  deleteBanner,
  currentUser: propCurrentUser,
  onNavigate,
  onOpenDrawer,
  onOpenNotifications,
  registerForWingProgram,
  cancelWingProgramRegistration
}) => {
  const { currentUser: authUser, switchRole } = useAuth();
  const currentUser = authUser || propCurrentUser;
  const { tr } = useLanguage();
  const reduced = isReducedMotion();

  // State for selected leader bottom sheet
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Only Admin, Executive, and Wing Convener roles can manage poster slides (students cannot)
  const canManageBanners = currentUser?.role === 'admin' ||
    currentUser?.role === 'executive' ||
    currentUser?.role === 'convener';

  // State for registering programs (button morphing animation)
  const [registeringProgId, setRegisteringProgId] = useState(null);
  const [justRegisteredIds, setJustRegisteredIds] = useState(new Set());

  // Only Central Union Executives displayed on Dashboard
  const executiveOfficials = useMemo(() => {
    return (unionOfficials || []).filter(o =>
      o.category === 'executive' || o.role === 'executive' || o.assignedWingId === 'all' || !o.assignedWingId
    );
  }, [unionOfficials]);

  // Transient Toast notification
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Compute Achievements
  const achievements = useMemo(() => {
    return computeStudentAchievements({
      student,
      myRegisteredWingPrograms,
      myUnionWins,
      myCertificates,
      mySummitEntries,
      team
    });
  }, [student, myRegisteredWingPrograms, myUnionWins, myCertificates, mySummitEntries, team]);

  const earnedAchievements = useMemo(() => achievements.filter(a => a.earned), [achievements]);

  // Filter Programs for "This week"
  const thisWeekPrograms = useMemo(() => {
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = in7Days.toISOString().split('T')[0];

    return (wingPrograms || [])
      .filter(p => p.type !== 'meeting' && p.date >= todayStr && p.date <= nextWeekStr)
      .slice(0, 3);
  }, [wingPrograms]);

  // If none strictly in next 7 days, take closest upcoming
  const upcomingProgramsList = useMemo(() => {
    if (thisWeekPrograms.length > 0) return thisWeekPrograms;
    const todayStr = new Date().toISOString().split('T')[0];
    return (wingPrograms || [])
      .filter(p => p.type !== 'meeting' && (p.status === 'upcoming' || p.date >= todayStr))
      .slice(0, 3);
  }, [thisWeekPrograms, wingPrograms]);

  // Filter 2 wings to "Discover wings" that student is not yet active in
  const discoverWings = useMemo(() => {
    return (wings || []).slice(0, 2);
  }, [wings]);

  // Celebrating winners (recent winners from competition results)
  const recentWinnersList = useMemo(() => {
    const list = [];
    (wingPrograms || []).forEach(p => {
      if (p.winners?.firstPlace?.name) {
        list.push({
          program: p,
          winnerName: p.winners.firstPlace.name,
          cicNo: p.winners.firstPlace.cicNo,
          points: p.winners.firstPlace.points || 10,
          place: '1st',
          teamName: p.winners.firstPlace.teamName
        });
      }
      if (p.winners?.secondPlace?.name) {
        list.push({
          program: p,
          winnerName: p.winners.secondPlace.name,
          cicNo: p.winners.secondPlace.cicNo,
          points: p.winners.secondPlace.points || 6,
          place: '2nd',
          teamName: p.winners.secondPlace.teamName
        });
      }
    });
    return list.slice(0, 3);
  }, [wingPrograms]);

  // Handle program registration with morphing animation
  const handleRegisterProgram = async (prog) => {
    if (registeringProgId) return;
    setRegisteringProgId(prog.id);

    try {
      if (typeof registerForWingProgram === 'function') {
        await registerForWingProgram(prog.id, student);
      }
      setJustRegisteredIds(prev => new Set([...prev, prog.id]));
      showToast(`Successfully registered for "${prog.title}"!`);
      triggerStudentConfetti();
    } catch (err) {
      console.error(err);
      showToast('Registration failed. Please try again.');
    } finally {
      setTimeout(() => setRegisteringProgId(null), 700);
    }
  };

  // Handle reminder toast
  const handleSetReminder = (prog) => {
    showToast(`Reminder set for "${prog.title}" on ${prog.date || 'scheduled date'}.`);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. COLORED HERO */}
      <Hero
        variant="home"
        student={student}
        className={cl?.name || student?.className}
        sectionName={sec?.name}
        wings={wings}
        unreadCount={unreadCount}
        onOpenDrawer={onOpenDrawer}
        onOpenNotifications={onOpenNotifications}
        dualRoleInfo={
          currentUser?.availableRoles?.length > 1
            ? {
                roleTitle: currentUser.unionOfficial?.designation || 'Union Leader',
                shortLabel: currentUser.unionRole === 'executive' ? 'Executive' : 'Wing Console'
              }
            : null
        }
        onSwitchRole={
          currentUser?.availableRoles?.length > 1
            ? () => switchRole(currentUser.unionRole || 'convener')
            : undefined
        }
      />

      {/* TOAST NOTIFICATION SLIDING FROM TOP */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={SPRING_POP}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[150] px-4 py-2.5 rounded-[12px] bg-slate-900 text-white text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2 max-w-[90vw]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. OVERLAPPING QUICK ACCESS CARD (8 ICON TILES, 4 PER ROW) */}
      <OverlapCard>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <IconTile
            icon={Folder}
            label={tr('Wings', 'വിംഗുകൾ')}
            iconColor="#0E7C86"
            bgColor="#0E7C8615"
            animationType="pulse"
            onClick={() => onNavigate('wings')}
            index={0}
          />
          <IconTile
            icon={Calendar}
            label={tr('Programs', 'പരിപാടികൾ')}
            iconColor="#6366F1"
            bgColor="#6366F115"
            animationType="flip"
            badge={upcomingProgramsList.length}
            onClick={() => onNavigate('programs')}
            index={1}
          />
          <IconTile
            icon={Trophy}
            label={tr('Prizes', 'നേട്ടങ്ങൾ')}
            iconColor="#F59E0B"
            bgColor="#F59E0B15"
            animationType="tilt"
            badge={myUnionWins.length}
            onClick={() => onNavigate('prizes')}
            index={2}
          />
          <IconTile
            icon={Award}
            label={tr('Certificates', 'സർട്ടിഫിക്കറ്റ്')}
            iconColor="#10B981"
            bgColor="#10B98115"
            animationType="pulse"
            badge={myCertificates.length}
            onClick={() => onNavigate('certificates')}
            index={3}
          />
          <IconTile
            icon={Users}
            label={tr('Leaders', 'ഭാരവാഹികൾ')}
            iconColor="#0F2A4A"
            bgColor="#0F2A4A15"
            animationType="bounce"
            onClick={() => onNavigate('leaders')}
            index={4}
          />
          <IconTile
            icon={Bell}
            label={tr('Notices', 'അറിയിപ്പുകൾ')}
            iconColor="#EC4899"
            bgColor="#EC489915"
            animationType="ring"
            badge={notifications.length}
            onClick={() => onNavigate('notices')}
            index={5}
          />
          <IconTile
            icon={Palette}
            label={tr('Summit', 'സമ്മിറ്റ്')}
            iconColor="#8B5CF6"
            bgColor="#8B5CF615"
            animationType="pulse"
            onClick={() => onNavigate('summit')}
            index={6}
          />
          <IconTile
            icon={User}
            label={tr('Profile', 'പ്രൊഫൈൽ')}
            iconColor="#0E7C86"
            bgColor="#0E7C8615"
            animationType="pulse"
            onClick={() => onNavigate('profile')}
            index={7}
          />
        </div>
      </OverlapCard>

      {/* ANIMATED POSTER SLIDES CAROUSEL */}
      <BannerCarousel
        banners={banners}
        wings={wings}
        onNavigate={onNavigate}
        canManage={canManageBanners}
        onOpenManageModal={() => setIsBannerModalOpen(true)}
      />

      {/* 3. UNION LEADERS SECTION (ONLY EXECUTIVES ON DASHBOARD) */}
      <div className="px-4 sm:px-6 space-y-2">
        <SectionHeader
          title={tr('Union executives', 'യൂണിയൻ എക്സിക്യൂട്ടീവ്സ്')}
          subtitle={tr('Apex Central Executive Council', 'കേന്ദ്ര ഭരണസമിതി')}
          actionLabel={tr('Explore more', 'കൂടുതൽ കാണുക')}
          onAction={() => onNavigate('leaders')}
          icon={Users}
        />

        {/* Horizontal Scrollable Avatars with Conic Ring (Shows only Union Executives on Dashboard) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {executiveOfficials.map((official, idx) => {
            const studentObj = (students || []).find(s => s.id === official.studentId || s.cicNo === official.cicNo);
            const isChairman = official.designation?.toLowerCase().includes('chairman');
            const hasRecentPost = official.lastActive ? (Date.now() - new Date(official.lastActive).getTime() < 86400000) : (idx < 2);

            return (
              <AvatarRing
                key={official.id || idx}
                official={official}
                studentObj={studentObj}
                isChairman={isChairman}
                hasRecentPost={hasRecentPost}
                onClick={(off) => setSelectedLeader(off)}
                index={idx}
              />
            );
          })}
        </div>
      </div>

      {/* 4. THIS WEEK SECTION */}
      <div className="px-4 sm:px-6 space-y-3">
        <SectionHeader
          title={tr('This week', 'ഈ ആഴ്ചയിലെ പരിപാടികൾ')}
          subtitle={tr('Campus programs and activities', 'കോളേജ് പരിപാടികൾ')}
          actionLabel={tr('All programs', 'എല്ലാ പരിപാടികളും')}
          onAction={() => onNavigate('programs')}
          icon={Calendar}
        />

        {upcomingProgramsList.length === 0 ? (
          <Card className="text-center py-6 text-slate-400 text-xs">
            {tr('No programs scheduled for this week.', 'ഈ ആഴ്ച പുതിയ പരിപാടികൾ ഇല്ല.')}
          </Card>
        ) : (
          <div className="space-y-2.5">
            {upcomingProgramsList.map((prog, idx) => {
              const wing = wings.find(w => w.id === prog.wingId);
              const isRegistered = (prog.registeredStudents || []).some(r => r.studentId === student?.id || r.cicNo === student?.cicNo) || justRegisteredIds.has(prog.id);
              const isRegistering = registeringProgId === prog.id;

              const dateObj = prog.date ? new Date(prog.date) : new Date();
              const dayStr = !isNaN(dateObj.getTime()) ? dateObj.getDate() : '—';
              const monthStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-GB', { month: 'short' }) : 'Event';

              return (
                <Card key={prog.id || idx} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Date Block with rotateX flip-in */}
                      <motion.div
                        initial={reduced ? { opacity: 1 } : { rotateX: 90, opacity: 0 }}
                        whileInView={{ rotateX: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.05 }}
                        className="w-12 h-13 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 text-center leading-none select-none"
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {monthStr}
                        </span>
                        <span className="text-base font-black text-[#0F2A4A] dark:text-white mt-0.5">
                          {dayStr}
                        </span>
                      </motion.div>

                      {/* Program Title & Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#0F2A4A] dark:text-white leading-tight">
                            {prog.title}
                          </h4>
                          {/* Exactly ONE grey wing tag as specified */}
                          <Tag variant="grey" size="sm">
                            {wing?.shortName || wing?.name || 'Union'}
                          </Tag>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          {prog.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{prog.time}</span>
                            </span>
                          )}
                          {prog.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{prog.venue}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Register or Remind Action Button with morphing animation */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {isRegistered ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Registered</span>
                        </div>
                      ) : prog.isRegistrationOpen ? (
                        <motion.button
                          type="button"
                          disabled={isRegistering}
                          whileTap={reduced ? undefined : { scale: 0.94 }}
                          onClick={() => handleRegisterProgram(prog)}
                          className="px-3 py-1.5 rounded-[10px] bg-[#0E7C86] hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {isRegistering ? (
                            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <span>Register</span>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          type="button"
                          whileTap={reduced ? undefined : { scale: 0.94 }}
                          onClick={() => handleSetReminder(prog)}
                          className="px-2.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <Bell className="w-3 h-3 text-slate-500" />
                          <span>Remind</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. ACHIEVEMENTS SECTION (SHOW ONLY EARNED ACHIEVEMENTS; HIDDEN IF 0) */}
      {earnedAchievements.length > 0 && (
        <div className="px-4 sm:px-6 space-y-3">
          <SectionHeader
            title={tr('Achievements', 'നേട്ടങ്ങൾ & ബാഡ്ജുകൾ')}
            icon={Medal}
          />

          {/* Grid of Badges (Earned Only) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {earnedAchievements.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...SPRING_POP, delay: idx * 0.04 }}
                whileTap={reduced ? undefined : { scale: 0.96 }}
                onClick={() => showToast(`${badge.title}: ${badge.description}`)}
                className="relative p-3 rounded-[12px] border text-center select-none cursor-pointer flex flex-col items-center justify-between min-h-[105px] transition-colors bg-white dark:bg-[#0F1B2B] border-slate-200 dark:border-slate-800 hover:border-teal-500/50"
              >
                <div className="flex flex-col items-center gap-1.5 w-full">
                  {/* Badge Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform"
                    style={{
                      backgroundColor: `${badge.color}15`,
                      color: badge.color
                    }}
                  >
                    <Medal className="w-5 h-5" />
                  </div>

                  <h4 className="text-xs font-bold truncate max-w-full leading-tight text-[#0F2A4A] dark:text-white">
                    {badge.title}
                  </h4>
                </div>

                <span className="text-[10px] font-semibold mt-1 text-teal-600 dark:text-teal-400">
                  Unlocked ✓
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DISCOVER WINGS (2 CARDS WITH REQUEST TO JOIN) */}
      <div className="px-4 sm:px-6 space-y-3">
        <SectionHeader
          title={tr('Discover wings', 'വിംഗുകൾ പരിചയപ്പെടാം')}
          subtitle={tr('Join autonomous co-curricular wings', 'യൂണിയൻ പ്രവർത്തനങ്ങളിൽ പങ്കാളിയാകൂ')}
          actionLabel={tr('All wings', 'എല്ലാ വിംഗുകളും')}
          onAction={() => onNavigate('wings')}
          icon={Folder}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {discoverWings.map((wing, idx) => (
            <Card key={wing.id || idx} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Floating Icon on press/hover */}
                    <motion.div
                      whileHover={reduced ? undefined : { y: -3 }}
                      whileTap={reduced ? undefined : { scale: 0.9 }}
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${wing.color || '#0E7C86'}18`,
                        color: wing.color || '#0E7C86'
                      }}
                    >
                      <Folder className="w-5 h-5" />
                    </motion.div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#0F2A4A] dark:text-white truncate">
                        {wing.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {wing.shortName} Wing
                      </p>
                    </div>
                  </div>

                  <Tag variant="grey" size="sm">
                    Autonomous
                  </Tag>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {wing.description || 'Active campus operations and co-curricular programs.'}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigate('wings')}
                    className="text-xs font-bold text-[#0E7C86] dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View activities</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <motion.button
                    type="button"
                    whileTap={reduced ? undefined : { scale: 0.94 }}
                    onClick={() => onNavigate('wings')}
                    className="px-3.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    {tr('Explore wing', 'വിംഗ് കാണുക')}
                  </motion.button>
                </div>
              </Card>
            ))}
          </div>
      </div>

      {/* 7. CELEBRATING WINNERS */}
      <div className="px-4 sm:px-6 space-y-3">
        <SectionHeader
          title={tr('Celebrating winners', 'വിജയികളെ ആദരിക്കുന്നു')}
          subtitle={tr('Recent contest honors and point leaders', 'മത്സര വിജയികൾ')}
          actionLabel={tr('View my prizes', 'എന്റെ നേട്ടങ്ങൾ')}
          onAction={() => onNavigate('prizes')}
          icon={Trophy}
        />

        {recentWinnersList.length === 0 ? (
          <Card className="text-center py-6 text-slate-400 text-xs">
            {tr('No recent contest winners recorded yet.', 'വിജയികളുടെ വിവരങ്ങൾ ഉടൻ ചേർക്കുന്നതാണ്.')}
          </Card>
        ) : (
          <div className="space-y-2.5">
            {recentWinnersList.map((win, idx) => (
              <Card key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      initial={reduced ? { scale: 1 } : { scale: 0 }}
                      whileInView={{ scale: [1, 1.25, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0"
                    >
                      <Trophy className="w-5 h-5" />
                    </motion.div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F2A4A] dark:text-white truncate">
                          {win.winnerName}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black">
                          {win.place} Place
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {win.program?.title} &bull; {win.cicNo ? `CIC ${win.cicNo}` : (win.teamName || 'House')}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    +{win.points} pts
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* EXPANDABLE LEADER PROFILE BOTTOM SHEET */}
      <ProfileBottomSheet
        isOpen={Boolean(selectedLeader)}
        onClose={() => setSelectedLeader(null)}
        official={selectedLeader}
        studentObj={(students || []).find(s => s.id === selectedLeader?.studentId || s.cicNo === selectedLeader?.cicNo)}
      />

      {/* BANNER SLIDE MANAGER MODAL (Admin, Executives, Wing Members) */}
      <BannerSlideManagerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        banners={banners}
        onAddBanner={addBanner}
        onDeleteBanner={deleteBanner}
        wings={wings}
        currentUser={currentUser || { name: student?.name, role: isOfficial ? 'executive' : 'student' }}
      />
    </div>
  );
};
