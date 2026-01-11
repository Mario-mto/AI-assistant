import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
}

export default function Select({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="mb-4">
      <label
        htmlFor={selectId}
        className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full px-4 py-3 rounded-xl
            appearance-none cursor-pointer
            bg-white/80 dark:bg-gray-800/60
            backdrop-blur-sm
            border-2 transition-all duration-200
            text-gray-900 dark:text-gray-100
            font-medium
            focus:outline-none focus:ring-0
            ${error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200/50 dark:border-white/10 focus:border-energy-500 dark:focus:border-energy-400'
            }
            hover:border-gray-300 dark:hover:border-white/20
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
