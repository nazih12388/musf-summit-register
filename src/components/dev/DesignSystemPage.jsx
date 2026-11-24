import React, { useState } from 'react';
import {
  StatusBadge,
  RoleBadge,
  MedalBadge,
  CountBadge,
  CategoryTag,
  TrendChip,
  NewDot
} from '../common/Badge';
import {
  StatCard,
  ProfileCard,
  ProgramCard,
  ResultCard,
  WingCard,
  LeaderCard,
  NoticeCard,
  AttendanceCard,
  ReportCard,
  ListRow,
  CardSkeleton,
  EmptyState
} from '../cards';
import {
  triggerPrizeConfetti,
  useReducedMotionPreference,
  CountUp
} from '../../utils/motion';
import {
  Sparkles,
  Users,
  Award,
  Layers,
  Calendar,
  Moon,
  Sun
} from 'lucide-react';

export const DesignSystemPage = ({ isDark, setIsDark }) => {
  const { reduceMotion, toggleReduceMotion } = useReducedMotionPreference();
  const [activeSection, setActiveSection] = useState('all'); // 'all', 'badges', 'cards', 'tokens', 'motion'

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Design Tokens, Badges, Cards &amp; Motion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Institutional Design System
          </h1>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            Standardized, accessible, high-contrast design specifications covering Badges, Cards, Elevation, Typography, and Motion tokens.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {setIsDark && (
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-200" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleReduceMotion()}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
              reduceMotion
                ? 'bg-amber-500/20 text-amber-200 border-amber-300/40'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <span>Reduce Animations: {reduceMotion ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium">
        {[
          { id: 'all', label: 'All Components' },
          { id: 'tokens', label: '0. Tokens & Typography' },
          { id: 'badges', label: '1. Badge Family' },
          { id: 'cards', label: '2. Card Suite' },
          { id: 'motion', label: '3. Motion Playground' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === tab.id
                ? 'bg-white dark:bg-[#111B2B] text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
         SECTION 0: DESIGN TOKENS
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'tokens') && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              0. Design Tokens, Typography &amp; Elevation
            </h2>
            <p className="text-xs text-slate-500">
              Navy, Slate, Teal, and Semantic color palettes with 4.5:1 contrast, 4/8 grid spacing, and strict elevation layers.
            </p>
          </div>

          {/* Color Palettes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'Navy 900', hex: '#0F2A4A', bg: '#0F2A4A', text: '#FFFFFF' },
              { name: 'Navy 700', hex: '#1E3A5F', bg: '#1E3A5F', text: '#FFFFFF' },
              { name: 'Teal 600', hex: '#0E7C86', bg: '#0E7C86', text: '#FFFFFF' },
              { name: 'Indigo 600', hex: '#4F46E5', bg: '#4F46E5', text: '#FFFFFF' },
              { name: 'Emerald 500', hex: '#10B981', bg: '#10B981', text: '#FFFFFF' },
              { name: 'Purple 600', hex: '#9333EA', bg: '#9333EA', text: '#FFFFFF' },
              { name: 'Amber 500', hex: '#F59E0B', bg: '#F59E0B', text: '#FFFFFF' },
              { name: 'Rose 500', hex: '#F43F5E', bg: '#F43F5E', text: '#FFFFFF' },
              { name: 'Gold (1st)', hex: '#C9A227', bg: '#C9A227', text: '#FFFFFF' },
              { name: 'Silver (2nd)', hex: '#94A3B8', bg: '#94A3B8', text: '#FFFFFF' },
              { name: 'Bronze (3rd)', hex: '#B7791F', bg: '#B7791F', text: '#FFFFFF' },
              { name: 'Background', hex: '#F6F8FB', bg: '#F6F8FB', text: '#0F2A4A', border: true }
            ].map(col => (
              <div
                key={col.name}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-2"
              >
                <div
                  className="h-10 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shadow-xs"
                  style={{ backgroundColor: col.bg, color: col.text, border: col.border ? '1px solid #E2E8F0' : 'none' }}
                >
                  {col.hex}
                </div>
                <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {col.name}
                </div>
              </div>
            ))}
          </div>

          {/* Elevation Scale */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white dark:bg-[#111B2B] elevation-e0 text-center">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Elevation e0</div>
              <div className="text-[11px] text-slate-400">Border 1px only</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#111B2B] elevation-e1 text-center">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Elevation e1</div>
              <div className="text-[11px] text-slate-400">Card Base Shadow</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#111B2B] elevation-e2 text-center">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Elevation e2</div>
              <div className="text-[11px] text-slate-400">Card Hover Shadow</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#111B2B] elevation-e3 text-center">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Elevation e3</div>
              <div className="text-[11px] text-slate-400">Modal / Bottom Sheet</div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
         SECTION 1: PROFESSIONAL BADGE SYSTEM
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'badges') && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Professional Badge System (Strictly Encodes Data)
            </h2>
            <p className="text-xs text-slate-500">
              Only 7 distinct badge types across the app. Zero decorative noise. At most one status badge per card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Badges */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Status Badges (24px, Soft Tint Pill)
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="published" label="Published" />
                <StatusBadge status="pending" label="Pending" />
                <StatusBadge status="rejected" label="Rejected" />
                <StatusBadge status="info" label="Open" />
                <StatusBadge status="archived" label="Archived" />
              </div>
            </div>

            {/* Role Badges */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Role &amp; Position Badges (Profile Surfaces Only)
              </div>
              <div className="flex flex-wrap gap-2">
                <RoleBadge role="chairman" label="Chairman" />
                <RoleBadge role="secretary" label="Secretary" />
                <RoleBadge role="convener" label="Wing Convener" />
                <RoleBadge role="judge" label="Judge" />
                <RoleBadge role="leader" label="Team Leader" />
              </div>
            </div>

            {/* Medal Badges */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                3. Rank &amp; Medal Badges (28px with Shine Sweep)
              </div>
              <div className="flex items-center gap-3">
                <MedalBadge rank={1} size={30} />
                <MedalBadge rank={2} size={30} />
                <MedalBadge rank={3} size={30} />
                <MedalBadge rank={4} size={30} />
                <MedalBadge rank={10} size={30} />
              </div>
            </div>

            {/* Count Badge, Category Tag, Trend, New Dot */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                4. Count Badge &amp; New Dot
              </div>
              <div className="flex items-center gap-3">
                <CountBadge count={3} />
                <CountBadge count={18} />
                <CountBadge count={120} />
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <NewDot isNew={true} /> New item dot
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                5. Category Tags (Max 2 Per Card, Neutral Grey)
              </div>
              <div className="flex flex-wrap gap-2">
                <CategoryTag label="Fine Arts" icon={Layers} />
                <CategoryTag label="Literary" icon={Users} />
                <CategoryTag label="Aliya Division" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                6. Trend / Delta Chips (Stat Cards Only)
              </div>
              <div className="flex flex-wrap gap-2">
                <TrendChip value={12.4} direction="up" label="vs last week" />
                <TrendChip value={-4.2} direction="down" label="vs last week" />
                <TrendChip value={0} direction="neutral" label="unchanged" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
         SECTION 2: REUSABLE CARD SYSTEM
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'cards') && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Reusable Card Suite
            </h2>
            <p className="text-xs text-slate-500">
              Clean 12px rounded cards, 1px border + e1 shadow, hover lift 2px, press scale .98, count-up numbers.
            </p>
          </div>

          {/* Stat Cards Row */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              1. Stat Cards (Icon Tile, Count-Up, Sparkline, Delta Chip)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                colorTheme="indigo"
                label="Registered Students"
                value={384}
                delta={8.5}
                deltaDirection="up"
                deltaLabel="vs last month"
                sparklineData={[280, 310, 320, 345, 360, 375, 384]}
              />
              <StatCard
                icon={Award}
                colorTheme="amber"
                label="Active Programs"
                value={48}
                delta={3.2}
                deltaDirection="up"
                sparklineData={[30, 35, 38, 40, 42, 45, 48]}
              />
              <StatCard
                icon={Calendar}
                colorTheme="emerald"
                label="Summit Attendance"
                value={96}
                suffix="%"
                delta={-1.2}
                deltaDirection="down"
                sparklineData={[98, 97, 96, 98, 95, 97, 96]}
              />
              <StatCard
                icon={Layers}
                colorTheme="purple"
                label="Total Submissions"
                value={1240}
                delta={14.8}
                deltaDirection="up"
                sparklineData={[800, 920, 1010, 1080, 1150, 1200, 1240]}
              />
            </div>
          </div>

          {/* Profile Card & Result Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                2. Profile Card (Avatar Ring, 3 Circular Rings, Role)
              </h3>
              <ProfileCard
                name="Ahmad Faris"
                cicNo="CIC-24018"
                className="Class 3"
                sectionName="Thamheediyya"
                role="leader"
                marksPct={94}
                attendancePct={98}
                rank={1}
                onViewProfile={() => {}}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                3. Result Card / Winner Card (Medal, Accent Strip, Confetti)
              </h3>
              <ResultCard
                rank={1}
                studentName="Muhammed Sinan"
                cicNo="CIC-22934"
                programName="Elocution (English)"
                wingName="Literary"
                className="Class 4"
                teamName="Team B"
                points={10}
                date="2026-11-20"
                onShare={() => {}}
              />
            </div>
          </div>

          {/* Program Card & Wing Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                4. Program Card (Date Block, Wing Tag, Status, Avatars)
              </h3>
              <ProgramCard
                title="Master Arts Presentation &amp; Exhibition"
                date="2026-11-28"
                time="10:00 AM"
                venue="Main Auditorium"
                wingName="Fine Arts"
                status="published"
                participantsCount={32}
                participantAvatars={['', '', '']}
                actionLabel="Register"
                onAction={() => {}}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                5. Wing Card (4px Accent Strip, Member &amp; Event Counts)
              </h3>
              <WingCard
                name="Fine Arts Wing"
                code="FA"
                color="#0E7C86"
                description="Visual arts, stage design, calligraphic expressions"
                memberCount={18}
                programsCount={6}
                conveners={[{ name: 'Sinan' }, { name: 'Ammar' }]}
                onOpen={() => {}}
              />
            </div>
          </div>

          {/* Leader Card, Notice Card, Attendance Card, Report Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                6. Leader Card
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <LeaderCard name="Rashid Hashmi" position="Chairman" />
                <LeaderCard name="Ammar" position="Secretary" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                7. Notice Card
              </h3>
              <NoticeCard
                title="Annual Summit Schedule"
                content="Official notice regarding the upcoming schedule of summit programs..."
                wingName="Executive"
                timeAgo="3h ago"
                isPinned={true}
                isUnread={true}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                8. Attendance Card
              </h3>
              <AttendanceCard
                summitName="Nov Summit"
                attendancePct={85}
                marksObtained={45}
                marksMax={50}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                9. Report Card
              </h3>
              <ReportCard
                title="Monthly Academic Report"
                period="Nov 2026"
                formats={['pdf', 'excel']}
                onGenerate={() => {}}
              />
            </div>
          </div>

          {/* Card States: Skeleton & Empty */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              10. Card States (Loading Skeleton, Empty State, List Row)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CardSkeleton />
              <EmptyState
                title="No programs scheduled"
                description="Select another wing or click below to schedule a new program."
                actionLabel="Create Program"
                onAction={() => {}}
              />
              <div className="space-y-2">
                <ListRow
                  primaryText="Ahmad Faris"
                  secondaryText="CIC-24018 • Class 1"
                  metaText="95% Score"
                  status="completed"
                  onClick={() => {}}
                />
                <ListRow
                  primaryText="Muhammed Sinan"
                  secondaryText="CIC-22934 • Class 2"
                  metaText="88% Score"
                  status="pending"
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
         SECTION 3: MOTION PLAYGROUND
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'motion') && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Motion System &amp; Accessibility
            </h2>
            <p className="text-xs text-slate-500">
              Spring dynamics, smooth count-up counters, canvas-confetti bursts, and prefers-reduced-motion compliance.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2B] shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Confetti Trigger */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-center">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Prize / Winner Confetti Burst
                </div>
                <p className="text-[11px] text-slate-500">
                  Fires 40 canvas particles for 1.2s on prize unboxing or publishing results.
                </p>
                <button
                  type="button"
                  onClick={() => triggerPrizeConfetti()}
                  className="py-2 px-4 rounded-xl bg-[#C9A227] hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-xs transition active:scale-95"
                >
                  🎉 Fire Confetti Burst
                </button>
              </div>

              {/* CountUp Interactive */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-center">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Count-Up Numbers (600ms Ease-Out)
                </div>
                <div className="text-3xl font-extrabold text-[#0E7C86] dark:text-teal-400 py-1 font-mono">
                  <CountUp to={2540} prefix="" suffix=" pts" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Smooth animation with automatic reduced-motion bypass.
                </p>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-center">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Accessibility Compliance
                </div>
                <p className="text-[11px] text-slate-500">
                  Status: <strong>{reduceMotion ? 'Reduced Motion (Active)' : 'Standard Motion (Active)'}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => toggleReduceMotion()}
                  className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-xs shadow-xs transition active:scale-95"
                >
                  Toggle Reduced Motion
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
