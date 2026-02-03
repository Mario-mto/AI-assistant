import { useState, useMemo } from 'react'
import Card from '../components/ui/Card'
import MonthView from '../components/calendar/MonthView'
import WeekView from '../components/calendar/WeekView'
import SessionModal from '../components/calendar/SessionModal'
import { useWorkout } from '../context/WorkoutContext'
import { getSessionsForDate } from '../utils/recurrence'

type ViewMode = 'month' | 'week'

export default function Calendar() {
  const { sessions, plannedSessions } = useWorkout()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const navigatePrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setDate(newDate.getDate() - 7)
      }
      return newDate
    })
  }

  const navigateNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return { completed: [], planned: [] }
    const completed = sessions.filter(s => s.date === selectedDate)
    const planned = getSessionsForDate(plannedSessions, selectedDate)
    return { completed, planned }
  }, [selectedDate, sessions, plannedSessions])

  const formatHeader = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }
    // For week view, show the week range
    const start = new Date(currentDate)
    const dayOfWeek = (start.getDay() + 6) % 7 // Monday = 0
    start.setDate(start.getDate() - dayOfWeek)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">
          <span className="gradient-text">Calendrier</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Planifie tes seances
        </p>
      </header>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'month'
              ? 'bg-energy-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Mois
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'week'
              ? 'bg-energy-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Semaine
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={navigatePrevious}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Précédent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold capitalize">
            {formatHeader()}
          </span>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
        <button
          onClick={navigateNext}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Suivant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <Card variant="glass">
        {viewMode === 'month' ? (
          <MonthView currentDate={currentDate} onDateClick={handleDateClick} />
        ) : (
          <WeekView currentDate={currentDate} onDateClick={handleDateClick} />
        )}
      </Card>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Completee</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Planifiee</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Aujourd'hui</span>
        </div>
      </div>

      {/* Session Modal */}
      {selectedDate && (
        <SessionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          completedSessions={selectedDateSessions.completed}
          plannedSessions={selectedDateSessions.planned}
        />
      )}
    </div>
  )
}
