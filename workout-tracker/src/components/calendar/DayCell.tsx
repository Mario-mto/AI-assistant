interface DayCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  completedCount: number
  plannedCount: number
  onClick: () => void
}

export default function DayCell({
  date,
  isCurrentMonth,
  isToday,
  completedCount,
  plannedCount,
  onClick,
}: DayCellProps) {
  const day = date.getDate()
  const hasCompleted = completedCount > 0
  const hasPlanned = plannedCount > 0

  return (
    <button
      onClick={onClick}
      className={`
        aspect-square p-1 rounded-lg flex flex-col items-center justify-center
        transition-colors
        ${isCurrentMonth ? '' : 'opacity-40'}
        ${isToday ? 'ring-2 ring-energy-500' : ''}
        hover:bg-gray-100 dark:hover:bg-gray-700
      `}
    >
      <span className={`text-sm ${isToday ? 'font-bold text-energy-600 dark:text-energy-400' : ''}`}>
        {day}
      </span>
      {(hasCompleted || hasPlanned) && (
        <div className="flex gap-0.5 mt-1">
          {hasCompleted && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          {hasPlanned && (
            <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-orange-500' : 'bg-blue-500'}`} />
          )}
        </div>
      )}
    </button>
  )
}
