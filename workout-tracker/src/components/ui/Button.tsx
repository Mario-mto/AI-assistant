import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    relative overflow-hidden font-semibold rounded-xl
    transition-all duration-300 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98] touch-feedback
    inline-flex items-center justify-center gap-2
  `

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const variantStyles = {
    primary: `
      btn-energy text-white font-bold
      before:absolute before:inset-0 before:bg-white/0
      hover:before:bg-white/10
    `,
    secondary: `
      glass border border-gray-200/50 dark:border-white/10
      text-gray-700 dark:text-gray-200
      hover:bg-gray-100/80 dark:hover:bg-white/10
      hover:shadow-lg hover:-translate-y-0.5
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold
      shadow-[0_4px_15px_-3px_rgba(239,68,68,0.4)]
      hover:shadow-[0_8px_25px_-5px_rgba(239,68,68,0.5)]
      hover:-translate-y-0.5
    `,
    ghost: `
      text-gray-600 dark:text-gray-300
      hover:bg-gray-100/80 dark:hover:bg-white/5
      hover:text-gray-900 dark:hover:text-white
    `,
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {/* Shimmer effect on primary */}
      {variant === 'primary' && !disabled && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}
