import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/80 dark:bg-gray-800/60
          backdrop-blur-sm
          border-2 transition-all duration-200
          text-gray-900 dark:text-gray-100
          font-medium
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-0
          ${error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-200/50 dark:border-white/10 focus:border-energy-500 dark:focus:border-energy-400'
          }
          hover:border-gray-300 dark:hover:border-white/20
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
