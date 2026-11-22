import React, { useId } from 'react';
import {
  Crown,
  PenTool,
  Star,
  Shield,
  Scale,
  Flag,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';

/**
 * 1. StatusBadge
 * Soft tint pill, 24px high, 12px medium text, 8px colored dot or 14px icon, never uppercase.
 * Status values:
 * - 'published', 'completed', 'active', 'attended', 'approved' -> Success
 * - 'pending', 'draft', 'scheduled', 'in_progress' -> Warning
 * - 'rejected', 'cancelled', 'overdue', 'absent' -> Danger
 * - 'info', 'open', 'registered' -> Info
 * - 'archived', 'neutral', 'closed' -> Neutral
 */
export const StatusBadge = ({
  status = 'neutral',
  label,
  showDot = true,
  icon: CustomIcon,
  className = '',
  size = 'md'
}) => {
  const norm = String(status || '').toLowerCase().trim();

  let variant = 'neutral';
  let defaultLabel = label;

  if (['published', 'completed', 'active', 'attended', 'approved', 'success'].includes(norm)) {
    variant = 'success';
    defaultLabel = defaultLabel || (norm === 'attended' ? 'Attended' : norm === 'published' ? 'Published' : 'Completed');
  } else if (['pending', 'draft', 'scheduled', 'in_progress', 'warning'].includes(norm)) {
    variant = 'warning';
    defaultLabel = defaultLabel || (norm === 'draft' ? 'Draft' : 'Pending');
  } else if (['rejected', 'cancelled', 'overdue', 'absent', 'danger', 'error'].includes(norm)) {
    variant = 'danger';
    defaultLabel = defaultLabel || (norm === 'absent' ? 'Absent' : norm === 'rejected' ? 'Rejected' : 'Cancelled');
  } else if (['info', 'open', 'registered', 'upcoming'].includes(norm)) {
    variant = 'info';
    defaultLabel = defaultLabel || (norm === 'open' ? 'Open' : norm === 'registered' ? 'Registered' : 'Active');
  } else {
    variant = 'neutral';
    defaultLabel = defaultLabel || 'Archived';
  }

  const isPulsing = ['published', 'active', 'in_progress', 'open'].includes(norm);

  const styles = {
    success: {
      container: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs',
      dot: 'bg-emerald-500 dark:bg-emerald-400'
    },
    warning: {
      container: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs',
      dot: 'bg-amber-500 dark:bg-amber-400'
    },
    danger: {
      container: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60 shadow-2xs',
      dot: 'bg-rose-500 dark:bg-rose-400'
    },
    info: {
      container: 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-300 dark:border-teal-700/60 shadow-2xs',
      dot: 'bg-teal-500 dark:bg-teal-400'
    },
    neutral: {
      container: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-500 dark:bg-slate-400'
    }
  }[variant];

  return (
    <span
      role="status"
      aria-label={`Status: ${defaultLabel}`}
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-bold leading-none whitespace-nowrap select-none ${styles.container} ${className}`}
    >
      {CustomIcon ? (
        <CustomIcon className="w-3.5 h-3.5 shrink-0" />
      ) : showDot ? (
        <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot} ${isPulsing ? 'animate-live-pulse' : ''}`} aria-hidden="true" />
      ) : null}
      <span>{defaultLabel}</span>
    </span>
  );
};

/**
 * 2. RoleBadge
 * Distinct color identity for each governance & council role
 */
export const RoleBadge = ({
  role = 'official',
  label,
  className = ''
}) => {
  const norm = String(role || '').toLowerCase().trim();

  let Icon = UserCheck;
  let defaultLabel = label;
  let roleStyle = 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300';
  let iconColor = 'text-indigo-600 dark:text-indigo-400';

  if (norm.includes('chairman') || norm === 'general_secretary') {
    Icon = Crown;
    defaultLabel = defaultLabel || (norm.includes('general') ? 'General Secretary' : 'Chairman');
    roleStyle = 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-2xs';
    iconColor = 'text-amber-600 dark:text-amber-400';
  } else if (norm.includes('secretary') || norm.includes('joint')) {
    Icon = PenTool;
    defaultLabel = defaultLabel || 'Secretary';
    roleStyle = 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 shadow-2xs';
    iconColor = 'text-blue-600 dark:text-blue-400';
  } else if (norm.includes('president') || norm.includes('vice')) {
    Icon = Star;
    defaultLabel = defaultLabel || 'President';
    roleStyle = 'border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 shadow-2xs';
    iconColor = 'text-purple-600 dark:text-purple-400';
  } else if (norm.includes('convener') || norm.includes('wing')) {
    Icon = Shield;
    defaultLabel = defaultLabel || 'Wing Convener';
    roleStyle = 'border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-2xs';
    iconColor = 'text-teal-600 dark:text-teal-400';
  } else if (norm.includes('judge')) {
    Icon = Scale;
    defaultLabel = defaultLabel || 'Judge';
    roleStyle = 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 shadow-2xs';
    iconColor = 'text-rose-600 dark:text-rose-400';
  } else if (norm.includes('leader') || norm.includes('captain')) {
    Icon = Flag;
    defaultLabel = defaultLabel || 'Team Leader';
    roleStyle = 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-2xs';
    iconColor = 'text-emerald-600 dark:text-emerald-400';
  } else {
    Icon = UserCheck;
    defaultLabel = defaultLabel || 'Official';
    roleStyle = 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-2xs';
    iconColor = 'text-indigo-600 dark:text-indigo-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[12px] font-bold leading-none select-none ${roleStyle} ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
      <span>{defaultLabel}</span>
    </span>
  );
};

/**
 * 3. MedalBadge
 * Circular 28px medal badge for 1st/2nd/3rd with gold, silver, bronze gradients,
 * inner rank number, and a subtle single shine sweep on appearance.
 * Ranks 4+ use a neutral numbered circle.
 */
export const MedalBadge = ({
  rank = 1,
  size = 28,
  className = '',
  title = ''
}) => {
  const num = Number(rank);

  if (num === 1) {
    return (
      <div
        title={title || '1st Place (Gold)'}
        aria-label="1st Place (Gold)"
        className={`relative inline-flex items-center justify-center rounded-full font-black text-slate-900 overflow-hidden shadow-md shadow-amber-500/20 ring-1 ring-white/80 shrink-0 select-none ${className}`}
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #B45309 100%)',
          fontSize: size <= 28 ? 13 : 15
        }}
      >
        <span className="relative z-10 font-black">1</span>
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-medal-shine"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (num === 2) {
    return (
      <div
        title={title || '2nd Place (Silver)'}
        aria-label="2nd Place (Silver)"
        className={`relative inline-flex items-center justify-center rounded-full font-black text-slate-900 overflow-hidden shadow-md shadow-slate-500/20 ring-1 ring-white/80 shrink-0 select-none ${className}`}
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 45%, #94A3B8 100%)',
          fontSize: size <= 28 ? 13 : 15
        }}
      >
        <span className="relative z-10 font-black">2</span>
      </div>
    );
  }

  if (num === 3) {
    return (
      <div
        title={title || '3rd Place (Bronze)'}
        aria-label="3rd Place (Bronze)"
        className={`relative inline-flex items-center justify-center rounded-full font-black text-white overflow-hidden shadow-md shadow-orange-500/20 ring-1 ring-white/80 shrink-0 select-none ${className}`}
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #FDBA74 0%, #EA580C 55%, #9A3412 100%)',
          fontSize: size <= 28 ? 13 : 15
        }}
      >
        <span className="relative z-10 font-black">3</span>
      </div>
    );
  }

  // Ranks 4+
  return (
    <div
      title={title || `Rank ${num}`}
      aria-label={`Rank ${num}`}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size <= 28 ? 12 : 13
      }}
    >
      <span>{num || '-'}</span>
    </div>
  );
};

/**
 * 4. CountBadge
 * Red pill, min 18px, 11px bold white, 99+ cap, hidden at zero.
 */
export const CountBadge = ({
  count = 0,
  max = 99,
  className = ''
}) => {
  const num = Number(count) || 0;
  if (num <= 0) return null;

  const display = num > max ? `${max}+` : String(num);

  return (
    <span
      role="status"
      aria-label={`${num} unread items`}
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[11px] font-bold leading-none shrink-0 shadow-xs select-none tabular-nums ${className}`}
    >
      {display}
    </span>
  );
};

/**
 * 5. CategoryTag
 * Neutral grey chip with a small icon, 12px, for filtering and metadata.
 * At most 2 per card, grouped on one line, never colorful.
 */
export const CategoryTag = ({
  label,
  icon: Icon,
  className = '',
  onClick
}) => {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-[12px] font-medium leading-none select-none transition ${
        onClick ? 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-97' : ''
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />}
      <span className="truncate max-w-[120px]">{label}</span>
    </Comp>
  );
};

/**
 * 6. TrendChip
 * Tiny arrow + percentage (green up, red down, grey flat) for stat cards only.
 */
export const TrendChip = ({
  value = 0,
  direction = 'neutral', // 'up' | 'down' | 'neutral'
  label,
  className = ''
}) => {
  const isUp = direction === 'up' || Number(value) > 0;
  const isDown = direction === 'down' || Number(value) < 0;

  const colorClasses = isUp
    ? 'text-[#16A34A] dark:text-emerald-400 bg-[#E8F6EE] dark:bg-emerald-950/40'
    : isDown
      ? 'text-[#DC2626] dark:text-rose-400 bg-[#FDECEC] dark:bg-rose-950/40'
      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';

  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const displayVal = typeof value === 'number' ? `${Math.abs(value)}%` : String(value);

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${colorClasses} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{displayVal}</span>
      {label && <span className="font-normal text-slate-400 ml-0.5">{label}</span>}
    </span>
  );
};

/**
 * 7. NewDot
 * Plain 8px dot, only for items created in the last 24 hours.
 */
export const NewDot = ({
  isNew = false,
  createdAt,
  className = ''
}) => {
  let show = isNew;

  if (!show && createdAt) {
    try {
      const createdTime = new Date(createdAt).getTime();
      const now = Date.now();
      show = now - createdTime < 24 * 60 * 60 * 1000;
    } catch {
      show = false;
    }
  }

  if (!show) return null;

  return (
    <span
      title="New (last 24 hours)"
      aria-label="New item"
      className={`inline-block w-2 h-2 rounded-full bg-[#0E7C86] dark:bg-teal-400 shrink-0 shadow-xs ${className}`}
    />
  );
};
