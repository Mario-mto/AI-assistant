import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'glass' | 'gradient' | 'elevated'
  animate?: boolean
  delay?: number
  style?: React.CSSProperties
}

export default function Card({
  children,
  className = '',
  onClick,
  variant = 'default',
  animate = false,
  delay = 0,
  style,
}: CardProps) {
  const baseStyles = `
    rounded-2xl p-5 transition-all duration-300
    ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
  `

  const variantStyles = {
    default: `
      bg-white/80 dark:bg-gray-800/60
      backdrop-blur-sm
      border border-gray-100/50 dark:border-white/5
      shadow-lg shadow-gray-200/50 dark:shadow-black/20
      hover:shadow-xl hover:shadow-gray-300/50 dark:hover:shadow-black/30
    `,
    glass: `
      glass-card
      hover:shadow-xl
    `,
    gradient: `
      bg-gradient-to-br from-white/90 to-gray-50/90
      dark:from-gray-800/80 dark:to-gray-900/80
      backdrop-blur-md
      border border-white/20 dark:border-white/5
      shadow-xl
    `,
    elevated: `
      bg-white dark:bg-gray-800
      shadow-lift
      hover:shadow-2xl hover:-translate-y-1
    `,
  }

  const animationStyles = animate
    ? `animate-slide-up opacity-0`
    : ''

  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {}
  const combinedStyle = { ...delayStyle, ...style }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles} ${className}`}
      onClick={onClick}
      style={combinedStyle}
    >
      {children}
    </div>
  )
}
