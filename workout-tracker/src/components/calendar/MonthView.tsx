import { useMemo } from 'react'
import { useWorkout } from '../../context/WorkoutContext'
import DayCell from './DayCell'

interface MonthViewProps {
  currentDate: Date
  onDateClick: (date: string) => void
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function MonthView({ currentDate, onDateClick }: MonthViewProps) {
  const { sessions, getPlannedSessionsForRange } = useWorkout()

  const { days, startDate, endDate } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of month
    const firstDay = new Date(year, month, 1)
    // Last day of month
    const lastDay = new Date(year, month + 1, 0)

    // Start from Monday of the week containing the first day
    const startOffset = (firstDay.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
    const start = new Date(firstDay)
    start.setDate(start.getDate() - startOffset)

    // End on Sunday of the week containing the last day
    const endOffset = (7 - lastDay.getDay()) % 7
    const end = new Date(lastDay)
    if (endOffset > 0) {
      end.setDate(end.getDate() + endOffset)
    }

    const days: Date[] = []
    const current = new Date(start)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return {
      days,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }, [currentDate])

  const plannedSessions = useMemo(() => {
    return getPlannedSessionsForRange(startDate, endDate)
  }, [getPlannedSessionsForRange, startDate, endDate])

  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const completed = sessions.filter(s => s.date === dateStr)
    const planned = plannedSessions.filter(s => s.date === dateStr)
    return { completed, planned }
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          const { completed, planned } = getSessionsForDay(date)
          return (
            <DayCell
              key={idx}
              date={date}
              isCurrentMonth={isCurrentMonth(date)}
              isToday={isToday(date)}
              completedCount={completed.length}
              plannedCount={planned.length}
              onClick={() => onDateClick(date.toISOString().split('T')[0])}
            />
          )
        })}
      </div>
    </div>
  )
}
