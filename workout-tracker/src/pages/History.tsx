import { useState, useMemo } from 'react'
import { useWorkout } from '../context/WorkoutContext'
import type { Session } from '../types'
import { formatDate, isToday } from '../utils/date'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import SessionDetailModal from '../components/history/SessionDetailModal'
import ExerciseStats from '../components/history/ExerciseStats'

type SortOrder = 'DESC' | 'ASC'
type PeriodFilter = 'all' | '7d' | '30d'

export default function History() {
  const { sessions, exercises, programs, deleteSession } = useWorkout()

  // États des filtres
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('all')
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC')

  // Modal détail
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Affichage des stats
  const [showStats, setShowStats] = useState(false)

  // Filtrage et tri des séances
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions]

    // Filtre par exercice
    if (selectedExerciseId !== 'all') {
      filtered = filtered.filter((s) => s.exerciseId === selectedExerciseId)
    }

    // Filtre par programme
    if (selectedProgramId !== 'all') {
      filtered = filtered.filter((s) => s.programId === selectedProgramId)
    }

    // Filtre par période
    if (periodFilter !== 'all') {
      const now = new Date()
      const days = periodFilter === '7d' ? 7 : 30
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      filtered = filtered.filter((s) => s.date >= cutoffDate)
    }

    // Tri par date
    filtered.sort((a, b) => {
      if (sortOrder === 'DESC') {
        return b.date.localeCompare(a.date)
      } else {
        return a.date.localeCompare(b.date)
      }
    })

    return filtered
  }, [sessions, selectedExerciseId, selectedProgramId, periodFilter, sortOrder])

  const getExerciseName = (exerciseId: string) => {
    return exercises.find((ex) => ex.id === exerciseId)?.name || 'Exercice supprimé'
  }

  const getProgramName = (programId: string) => {
    return programs.find((prog) => prog.id === programId)?.name || 'Programme supprimé'
  }

  const getTotalReps = (sets: number[]) => {
    return sets.reduce((sum, reps) => sum + reps, 0)
  }

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))
  }

  const resetFilters = () => {
    setSelectedExerciseId('all')
    setSelectedProgramId('all')
    setPeriodFilter('all')
  }

  const hasActiveFilters =
    selectedExerciseId !== 'all' || selectedProgramId !== 'all' || periodFilter !== 'all'

  // Options pour les selects
  const exerciseOptions = [
    { value: 'all', label: 'Tous les exercices' },
    ...exercises.map((ex) => ({ value: ex.id, label: ex.name })),
  ]

  const programOptions = [
    { value: 'all', label: 'Tous les programmes' },
    ...programs.map((prog) => ({ value: prog.id, label: prog.name })),
  ]

  const periodOptions = [
    { value: 'all', label: 'Toute la période' },
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
  ]

  if (sessions.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Historique</h1>
        <Card>
          <div className="text-center py-8 text-gray-500">
            Aucune séance enregistrée. Commence ta première séance pour voir ton historique !
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Historique</h1>
          <p className="text-gray-600 mt-1">
            {filteredSessions.length} séance{filteredSessions.length > 1 ? 's' : ''} affichée
            {filteredSessions.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2"
        >
          {showStats ? '📋 Liste' : '📊 Stats'}
        </Button>
      </div>

      {/* Statistiques par exercice */}
      {showStats && (
        <div className="mb-6">
          <ExerciseStats sessions={sessions} exercises={exercises} />
        </div>
      )}

      {!showStats && (
        <>
          {/* Filtres */}
          <Card className="mb-6">
            <h3 className="font-semibold mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Exercice"
                options={exerciseOptions}
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
              />
              <Select
                label="Programme"
                options={programOptions}
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
              />
              <Select
                label="Période"
                options={periodOptions}
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button variant="secondary" onClick={toggleSortOrder} className="flex items-center gap-2">
                {sortOrder === 'DESC' ? '↓ Plus récent' : '↑ Plus ancien'}
              </Button>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </Card>

          {/* Liste des séances */}
          {filteredSessions.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500">
                Aucune séance ne correspond aux filtres sélectionnés.
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => {
                const totalReps = getTotalReps(session.sets)
                const avgReps = (totalReps / session.sets.length).toFixed(1)
                const exercise = exercises.find((ex) => ex.id === session.exerciseId)

                return (
                  <Card
                    key={session.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {getExerciseName(session.exerciseId)}
                          </h4>
                          {isToday(session.date) && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Aujourd'hui
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getProgramName(session.programId)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(session.date)}
                        </p>

                        {/* Progression vers le goal */}
                        {exercise && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">
                              Max série : {Math.max(...session.sets)} / {exercise.goal} reps
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  Math.max(...session.sets) >= exercise.goal
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (Math.max(...session.sets) / exercise.goal) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">{totalReps}</div>
                        <div className="text-xs text-gray-500">
                          {session.sets.length} série{session.sets.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">moy: {avgReps}</div>
                      </div>
                    </div>

                    {/* Détail des séries */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {session.sets.map((reps, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          #{idx + 1}: {reps}
                        </span>
                      ))}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Modal détail */}
      <SessionDetailModal
        session={selectedSession}
        exercise={exercises.find((ex) => ex.id === selectedSession?.exerciseId)}
        program={programs.find((prog) => prog.id === selectedSession?.programId)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDeleteSession}
      />
    </div>
  )
}
