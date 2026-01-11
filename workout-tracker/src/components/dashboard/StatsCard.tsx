import { memo } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: 'energy' | 'success' | 'volt' | 'pulse'
  delay?: number
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'energy',
  delay = 0,
}: StatsCardProps) {
  const colorConfig = {
    energy: {
      gradient: 'from-energy-500 to-energy-600',
      glow: 'shadow-energy',
      bg: 'bg-energy-500/10 dark:bg-energy-500/20',
      text: 'text-energy-600 dark:text-energy-400',
      iconBg: 'bg-gradient-to-br from-energy-400 to-energy-600',
    },
    success: {
      gradient: 'from-emerald-500 to-green-600',
      glow: 'shadow-[0_10px_40px_-10px_rgba(34,197,94,0.5)]',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600',
    },
    volt: {
      gradient: 'from-volt-500 to-volt-700',
      glow: 'shadow-volt',
      bg: 'bg-volt-500/10 dark:bg-volt-500/20',
      text: 'text-volt-600 dark:text-volt-400',
      iconBg: 'bg-gradient-to-br from-volt-400 to-volt-600',
    },
    pulse: {
      gradient: 'from-pulse-400 to-pulse-600',
      glow: 'shadow-[0_10px_40px_-10px_rgba(34,211,238,0.5)]',
      bg: 'bg-pulse-400/10 dark:bg-pulse-400/20',
      text: 'text-pulse-600 dark:text-pulse-400',
      iconBg: 'bg-gradient-to-br from-pulse-400 to-pulse-600',
    },
  }

  const config = colorConfig[color]

  return (
    <div
      className={`
        stat-card ${color}
        animate-slide-up opacity-0
        group
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background glow effect */}
      <div
        className={`
          absolute -top-10 -right-10 w-32 h-32 rounded-full
          ${config.bg} blur-2xl opacity-50
          group-hover:opacity-80 transition-opacity duration-500
        `}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-3xl font-display font-bold mt-2 ${config.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`
              ${config.iconBg}
              w-12 h-12 rounded-xl flex items-center justify-center
              text-2xl shadow-lg
              transform group-hover:scale-110 group-hover:rotate-3
              transition-transform duration-300
            `}
          >
            <span className="drop-shadow-sm">{icon}</span>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl
          bg-gradient-to-r ${config.gradient}
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
        `}
      />
    </div>
  )
}

export default memo(StatsCard)
