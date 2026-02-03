import { useState } from 'react'
import Card from '../components/ui/Card'

type ViewMode = 'month' | 'week'

export default function Calendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, _setCurrentDate] = useState(new Date())

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

      <Card variant="glass">
        <p className="text-center text-gray-500">
          {viewMode === 'month' ? 'Vue mensuelle' : 'Vue hebdomadaire'}
        </p>
        <p className="text-center text-gray-400 text-sm mt-2">
          {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
      </Card>
    </div>
  )
}
