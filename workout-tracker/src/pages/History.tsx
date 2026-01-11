import { useState, useMemo } from 'react'
import { useWorkout } from '../context/WorkoutContext'
import type { Session, CardioSession } from '../types'
import { formatDate, isToday } from '../utils/date'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import SessionDetailModal from '../components/history/SessionDetailModal'
import ExerciseStats from '../components/history/ExerciseStats'
import ConfirmModal from '../components/ui/ConfirmModal'

type ViewType = 'all' | 'muscu' | 'cardio'
type SortOrder = 'DESC' | 'ASC'
type PeriodFilter = 'all' | '7d' | '30d'

export default function History() {
  const { sessions, exercises, programs, deleteSession, cardioSessions, deleteCardioSession } = useWorkout()

  // Vue (toutes, muscu, cardio)
  const [viewType, setViewType] = useState<ViewType>('all')

  // États des filtres
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('all')
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC')

  // Modal détail musculation
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Modal suppression cardio
  const [cardioToDelete, setCardioToDelete] = useState<CardioSession | null>(null)

  // Affichage des stats
  const [showStats, setShowStats] = useState(false)

  // Sessions unifiées pour l'affichage
  const allSessions = useMemo(() => {
    const muscu = sessions.map(s => ({ ...s, workoutType: 'muscu' as const }))
    const cardio = cardioSessions.map(s => ({ ...s, workoutType: 'cardio' as const }))

    let all = [...muscu, ...cardio]

    // Filtre par type de vue
    if (viewType === 'muscu') {
      all = all.filter(s => s.workoutType === 'muscu')
    } else if (viewType === 'cardio') {
      all = all.filter(s => s.workoutType === 'cardio')
    }

    // Filtre par période
    if (periodFilter !== 'all') {
      const now = new Date()
      const days = periodFilter === '7d' ? 7 : 30
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      all = all.filter((s) => s.date >= cutoffDate)
    }

    // Filtre par exercice (uniquement pour muscu)
    if (selectedExerciseId !== 'all' && viewType !== 'cardio') {
      all = all.filter(s => s.workoutType === 'cardio' || (s.workoutType === 'muscu' && s.exerciseId === selectedExerciseId))
    }

    // Filtre par programme (uniquement pour muscu)
    if (selectedProgramId !== 'all' && viewType !== 'cardio') {
      all = all.filter(s => s.workoutType === 'cardio' || (s.workoutType === 'muscu' && s.programId === selectedProgramId))
    }

    // Tri par date
    all.sort((a, b) => {
      if (sortOrder === 'DESC') {
        return b.date.localeCompare(a.date)
      } else {
        return a.date.localeCompare(b.date)
      }
    })

    return all
  }, [sessions, cardioSessions, viewType, selectedExerciseId, selectedProgramId, periodFilter, sortOrder])

  const getExerciseName = (exerciseId: string) => {
    return exercises.find((ex) => ex.id === exerciseId)?.name || 'Exercice supprimé'
  }

  const getProgramName = (programId: string) => {
    return programs.find((prog) => prog.id === programId)?.name || 'Programme supprimé'
  }

  const getTotalReps = (sets: number[]) => {
    return sets.reduce((sum, reps) => sum + reps, 0)
  }

  const getCardioTypeLabel = (type: string) => {
    switch (type) {
      case 'running': return 'Course'
      case 'cycling': return 'Vélo'
      case 'walking': return 'Marche'
      default: return type
    }
  }

  const getCardioIcon = (type: string) => {
    switch (type) {
      case 'running': return '🏃'
      case 'cycling': return '🚴'
      case 'walking': return '🚶'
      default: return '🏃'
    }
  }

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
  }

  const handleDeleteCardio = () => {
    if (cardioToDelete) {
      deleteCardioSession(cardioToDelete.id)
      setCardioToDelete(null)
    }
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

  const totalSessions = sessions.length + cardioSessions.length

  if (totalSessions === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Historique</h1>
        <Card>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucune séance enregistrée. Commence ta première séance pour voir ton historique !
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Historique</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {allSessions.length} séance{allSessions.length > 1 ? 's' : ''}
          </p>
        </div>
        {viewType === 'muscu' && (
          <Button
            variant="secondary"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            {showStats ? '📋 Liste' : '📊 Stats'}
          </Button>
        )}
      </div>

      {/* Onglets Muscu / Cardio / Toutes */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewType('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Toutes ({totalSessions})
        </button>
        <button
          onClick={() => setViewType('muscu')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
            viewType === 'muscu'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          💪 Muscu ({sessions.length})
        </button>
        <button
          onClick={() => setViewType('cardio')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
            viewType === 'cardio'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          🏃 Cardio ({cardioSessions.length})
        </button>
      </div>

      {/* Statistiques par exercice (musculation uniquement) */}
      {showStats && viewType === 'muscu' && (
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
              {viewType !== 'cardio' && (
                <>
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
                </>
              )}
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
          {allSessions.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aucune séance ne correspond aux filtres sélectionnés.
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {allSessions.map((session) => {
                if (session.workoutType === 'muscu') {
                  const muscuSession = session as Session & { workoutType: 'muscu' }
                  const totalReps = getTotalReps(muscuSession.sets)
                  const avgReps = (totalReps / muscuSession.sets.length).toFixed(1)
                  const exercise = exercises.find((ex) => ex.id === muscuSession.exerciseId)

                  return (
                    <Card
                      key={muscuSession.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleSessionClick(muscuSession)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💪</span>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {getExerciseName(muscuSession.exerciseId)}
                            </h4>
                            {isToday(muscuSession.date) && (
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {getProgramName(muscuSession.programId)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(muscuSession.date)}
                          </p>

                          {/* Progression vers le goal */}
                          {exercise && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Max série : {Math.max(...muscuSession.sets)} / {exercise.goal} reps
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    Math.max(...muscuSession.sets) >= exercise.goal
                                      ? 'bg-green-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      (Math.max(...muscuSession.sets) / exercise.goal) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalReps}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {muscuSession.sets.length} série{muscuSession.sets.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">moy: {avgReps}</div>
                        </div>
                      </div>

                      {/* Détail des séries */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {muscuSession.sets.map((reps, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                          >
                            #{idx + 1}: {reps}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )
                } else {
                  // Cardio session
                  const cardioSession = session as CardioSession & { workoutType: 'cardio' }

                  return (
                    <Card
                      key={cardioSession.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCardioIcon(cardioSession.type)}</span>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {getCardioTypeLabel(cardioSession.type)}
                            </h4>
                            {isToday(cardioSession.date) && (
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(cardioSession.date)}
                          </p>
                          {cardioSession.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              "{cardioSession.notes}"
                            </p>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-orange-500">{cardioSession.distance} km</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {cardioSession.duration} min
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCardioToDelete(cardioSession)
                            }}
                            className="text-xs text-red-500 hover:text-red-700 mt-2"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                }
              })}
            </div>
          )}
        </>
      )}

      {/* Modal détail musculation */}
      <SessionDetailModal
        session={selectedSession}
        exercise={exercises.find((ex) => ex.id === selectedSession?.exerciseId)}
        program={programs.find((prog) => prog.id === selectedSession?.programId)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDeleteSession}
      />

      {/* Modal confirmation suppression cardio */}
      <ConfirmModal
        isOpen={!!cardioToDelete}
        onClose={() => setCardioToDelete(null)}
        onConfirm={handleDeleteCardio}
        title="Supprimer la séance"
        message={cardioToDelete ? `Supprimer cette séance de ${getCardioTypeLabel(cardioToDelete.type)} (${cardioToDelete.distance} km) ?` : ''}
        confirmText="Supprimer"
      />
    </div>
  )
}
