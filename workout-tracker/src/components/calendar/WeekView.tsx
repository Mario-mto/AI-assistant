import { useMemo } from 'react'
import { useWorkout } from '../../context/WorkoutContext'

interface WeekViewProps {
  currentDate: Date
  onDateClick: (date: string) => void
}

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function WeekView({ currentDate, onDateClick }: WeekViewProps) {
  const { sessions, getPlannedSessionsForRange, exercises } = useWorkout()

  const { days, startDate, endDate } = useMemo(() => {
    // Get Monday of the current week
    const start = new Date(currentDate)
    const dayOfWeek = (start.getDay() + 6) % 7 // Monday = 0
    start.setDate(start.getDate() - dayOfWeek)

    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const days: Date[] = []
    const current = new Date(start)
    for (let i = 0; i < 7; i++) {
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

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    return exercise?.name || 'Exercice inconnu'
  }

  return (
    <div className="space-y-2">
      {days.map((date, idx) => {
        const { completed, planned } = getSessionsForDay(date)
        const dateStr = date.toISOString().split('T')[0]
        const dayIsToday = isToday(date)

        return (
          <button
            key={idx}
            onClick={() => onDateClick(dateStr)}
            className={`
              w-full p-3 rounded-lg text-left transition-colors
              ${dayIsToday
                ? 'ring-2 ring-energy-500 bg-energy-50 dark:bg-energy-900/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${dayIsToday ? 'text-energy-600 dark:text-energy-400' : ''}`}>
                  {DAYS_OF_WEEK[idx]}
                </span>
                <span className="text-sm text-gray-500">
                  {date.getDate()}/{date.getMonth() + 1}
                </span>
              </div>
              {(completed.length > 0 || planned.length > 0) && (
                <div className="flex gap-1">
                  {completed.length > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {completed.length} fait{completed.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {planned.length > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      dayIsToday
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {planned.length} planifie{planned.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Show first few sessions */}
            {(completed.length > 0 || planned.length > 0) && (
              <div className="space-y-1">
                {completed.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{getExerciseName(session.exerciseId)}</span>
                    <span className="text-gray-400">- {session.sets.reduce((a, b) => a + b, 0)} reps</span>
                  </div>
                ))}
                {planned.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${dayIsToday ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <span>{getExerciseName(session.exerciseId)}</span>
                    {session.time && <span className="text-gray-400">a {session.time}</span>}
                  </div>
                ))}
                {(completed.length + planned.length) > 4 && (
                  <span className="text-xs text-gray-400">
                    +{completed.length + planned.length - 4} autres...
                  </span>
                )}
              </div>
            )}

            {completed.length === 0 && planned.length === 0 && (
              <span className="text-sm text-gray-400">Aucune seance</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
