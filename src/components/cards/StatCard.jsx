import React, { useId } from 'react';
import { CardSkeleton } from './CardSkeleton';
import { TrendChip } from '../common/Badge';
import { CountUp } from '../../utils/motion';
import { AlertCircle } from 'lucide-react';

const THEME_STYLES = {
  teal: {
    bar: 'bg-gradient-to-r from-teal-500 to-emerald-400',
    iconBg: 'bg-gradient-to-br from-[#0E7C86] to-[#14919D]',
    iconColor: '#FFFFFF',
    iconShadow: 'shadow-md shadow-teal-500/25',
    cardBg: 'bg-gradient-to-br from-white via-white to-teal-50/35 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-teal-950/25',
    borderHover: 'hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10',
    sparklineColor: '#0E7C86',
    sparklineGradient: ['rgba(14, 124, 134, 0.35)', 'rgba(14, 124, 134, 0.0)']
  },
  indigo: {
    bar: 'bg-gradient-to-r from-indigo-500 to-blue-400',
    iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-600',
    iconColor: '#FFFFFF',
    iconShadow: 'shadow-md shadow-indigo-500/25',
    cardBg: 'bg-gradient-to-br from-white via-white to-indigo-50/35 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-indigo-950/25',
    borderHover: 'hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/10',
    sparklineColor: '#4F46E5',
    sparklineGradient: ['rgba(79, 70, 229, 0.35)', 'rgba(79, 70, 229, 0.0)']
  },
  amber: {
    bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    iconColor: '#FFFFFF',
    iconShadow: 'shadow-md shadow-amber-500/25',
    cardBg: 'bg-gradient-to-br from-white via-white to-amber-50/35 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-amber-950/25',
    borderHover: 'hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10',
    sparklineColor: '#D97706',
    sparklineGradient: ['rgba(217, 119, 6, 0.35)', 'rgba(217, 119, 6, 0.0)']
  },
  emerald: {
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
    iconColor: '#FFFFFF',
    iconShadow: 'shadow-md shadow-emerald-500/25',
    cardBg: 'bg-gradient-to-br from-white via-white to-emerald-50/35 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-emerald-950/25',
    borderHover: 'hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10',
    sparklineColor: '#10B981',
    sparklineGradient: ['rgba(16, 185, 129, 0.35)', 'rgba(16, 185, 129, 0.0)']
  },
  rose: {
    bar: 'bg-gradient-to-r from-rose-500 to-pink-400',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    iconColor: '#FFFFFF',
    iconShadow: 'shadow-md shadow-rose-500/25',
    cardBg: 'bg-gradient-to-br from-white via-white to-rose-50/35 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-rose-950/25',
    borderHover: 'hover:border-rose-400/50 hover:shadow-lg hover:shadow-rose-500/10',
    sparklineColor: '#F43F5E',
    sparklineGradient: ['rgba(244, 63, 94, 0.35)', 'rgba(244, 63, 94, 0.0)']
  },
  purple: {
    bar: 'bg-gradient-to-r from-purple-500 to-indigo-400',
    iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600',
    iconColor: '#FFFFFF',
    iconShadow: 'shadow-md shadow-purple-500/25',
    cardBg: 'bg-gradient-to-br from-white via-white to-purple-50/35 dark:from-[#111B2B] dark:via-[#111B2B] dark:to-purple-950/25',
    borderHover: 'hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10',
    sparklineColor: '#9333EA',
    sparklineGradient: ['rgba(147, 51, 234, 0.35)', 'rgba(147, 51, 234, 0.0)']
  }
};

export const StatCard = ({
  icon: Icon,
  iconColor,
  iconBg,
  colorTheme,
  label,
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  delta,
  deltaDirection,
  deltaLabel,
  sparklineData = [12, 19, 14, 25, 22, 30, 28],
  onClick,
  isLoading = false,
  error = null,
  className = ''
}) => {
  const gradientId = useId();

  if (isLoading) {
    return <CardSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={`p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 ${className}`}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Failed to load {label}</span>
      </div>
    );
  }

  // Determine vibrant theme: explicit colorTheme or infer from label / iconColor
  let themeKey = colorTheme;
  if (!themeKey) {
    const l = String(label || '').toLowerCase();
    if (l.includes('student') || l.includes('member') || l.includes('registered')) {
      themeKey = 'indigo';
    } else if (l.includes('event') || l.includes('program') || l.includes('activity')) {
      themeKey = 'amber';
    } else if (l.includes('attendance') || l.includes('present') || l.includes('ratio')) {
      themeKey = 'emerald';
    } else if (l.includes('prize') || l.includes('award') || l.includes('points') || l.includes('score')) {
      themeKey = 'purple';
    } else if (l.includes('attention') || l.includes('pending') || l.includes('vacant')) {
      themeKey = 'rose';
    } else {
      themeKey = 'teal';
    }
  }

  const theme = THEME_STYLES[themeKey] || THEME_STYLES.teal;

  // Calculate SVG sparkline path
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData) || 1;
  const range = maxVal - minVal || 1;
  const width = 84;
  const height = 28;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative text-left w-full overflow-hidden p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 ${theme.cardBg} shadow-xs ${theme.borderHover} hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0E7C86] focus:ring-offset-2 dark:focus:ring-offset-[#0B1320] active:scale-[0.98] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* 3px Top Gradient Accent Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bar} opacity-90`} />

      <div className="flex items-start justify-between gap-3 pt-0.5">
        {/* Vibrant Gradient Leading Icon Tile */}
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconBg || theme.iconBg} ${theme.iconShadow}`}
          >
            <Icon className={`w-5 h-5 ${iconColor || 'text-white'}`} strokeWidth={2} />
          </div>
        )}

        {/* Delta Chip top-right */}
        {delta !== undefined && (
          <div className="shrink-0">
            <TrendChip
              value={delta}
              direction={deltaDirection}
              label={deltaLabel}
            />
          </div>
        )}
      </div>

      {/* Label and Big Number */}
      <div className="mt-3.5 space-y-1">
        <div className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 truncate">
          {label}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-[28px] sm:text-[30px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            <CountUp
              to={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          </div>

          {/* Sparkline Graphic with Gradient Fill */}
          {sparklineData && sparklineData.length > 1 && (
            <svg
              className="w-22 h-7 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
              viewBox={`0 0 ${width} ${height}`}
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.sparklineGradient[0]} />
                  <stop offset="100%" stopColor={theme.sparklineGradient[1]} />
                </linearGradient>
              </defs>
              <path
                d={areaD}
                fill={`url(#${gradientId})`}
              />
              <path
                d={pathD}
                stroke={theme.sparklineColor}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </Comp>
  );
};
