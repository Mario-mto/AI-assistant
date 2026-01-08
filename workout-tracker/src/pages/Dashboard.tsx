import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../context/WorkoutContext'
import { formatDate } from '../utils/date'
import Button from '../components/ui/Button'
import StatsCard from '../components/dashboard/StatsCard'
import ProgressChart from '../components/dashboard/ProgressChart'
import RecentSessions from '../components/dashboard/RecentSessions'

export default function Dashboard() {
  const navigate = useNavigate()
  const { sessions, exercises, programs } = useWorkout()

  // Trier les sessions par date (plus récentes en premier)
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.date.localeCompare(a.date))
  }, [sessions])

  // Calculer les stats globales
  const stats = useMemo(() => {
    const totalSessions = sessions.length
    const totalSets = sessions.reduce((sum, s) => sum + s.sets.length, 0)
    const totalReps = sessions.reduce(
      (sum, s) => sum + s.sets.reduce((repsSum, reps) => repsSum + reps, 0),
      0
    )

    const lastSession = sortedSessions[0]
    const lastSessionDate = lastSession ? formatDate(lastSession.date) : '-'

    const lastSessionExercise = lastSession
      ? exercises.find((ex) => ex.id === lastSession.exerciseId)?.name
      : '-'

    const lastSessionReps = lastSession
      ? lastSession.sets.reduce((sum, reps) => sum + reps, 0)
      : 0

    const avgRepsPerSession = totalSessions > 0 ? (totalReps / totalSessions).toFixed(0) : 0
    const avgSetsPerSession = totalSessions > 0 ? (totalSets / totalSessions).toFixed(1) : 0

    return {
      totalSessions,
      totalSets,
      totalReps,
      lastSessionDate,
      lastSessionExercise,
      lastSessionReps,
      avgRepsPerSession,
      avgSetsPerSession,
    }
  }, [sessions, sortedSessions, exercises])

  const handleNewSession = () => {
    navigate('/session')
  }

  const hasData = sessions.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de ta progression</p>
        </div>
        <Button onClick={handleNewSession} className="flex items-center gap-2">
          <span className="text-xl">💪</span>
          Nouvelle séance
        </Button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total séances"
          value={stats.totalSessions}
          icon="🏋️"
          color="blue"
          subtitle={hasData ? `${stats.avgSetsPerSession} séries/séance moy` : undefined}
        />
        <StatsCard
          title="Total répétitions"
          value={stats.totalReps.toLocaleString()}
          icon="💯"
          color="green"
          subtitle={hasData ? `${stats.avgRepsPerSession} reps/séance moy` : undefined}
        />
        <StatsCard
          title="Total séries"
          value={stats.totalSets}
          icon="📊"
          color="purple"
        />
        <StatsCard
          title="Dernière séance"
          value={stats.lastSessionReps || '-'}
          icon="⚡"
          color="orange"
          subtitle={stats.lastSessionExercise || undefined}
        />
      </div>

      {/* Message si pas de données */}
      {!hasData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
          <p className="text-lg font-semibold text-blue-900 mb-2">
            Bienvenue dans ton Workout Tracker ! 🎉
          </p>
          <p className="text-blue-700 mb-4">
            Commence par configurer tes exercices et programmes, puis lance ta première séance.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/config')} variant="secondary">
              Configurer
            </Button>
            <Button onClick={handleNewSession}>
              Commencer une séance
            </Button>
          </div>
        </div>
      )}

      {/* Graphique de progression */}
      {hasData && (
        <div className="mb-6">
          <ProgressChart sessions={sortedSessions} />
        </div>
      )}

      {/* Dernières séances */}
      {hasData && (
        <div className="mb-6">
          <RecentSessions
            sessions={sortedSessions}
            exercises={exercises}
            programs={programs}
            limit={5}
          />
        </div>
      )}

      {/* Stats additionnelles */}
      {hasData && sessions.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700 font-medium">Exercice le plus pratiqué</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {(() => {
                const exerciseCounts = sessions.reduce((acc, s) => {
                  acc[s.exerciseId] = (acc[s.exerciseId] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
                const topExerciseId = Object.entries(exerciseCounts).sort(
                  ([, a], [, b]) => b - a
                )[0]?.[0]
                return exercises.find((ex) => ex.id === topExerciseId)?.name || '-'
              })()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">Record de reps (séance)</p>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {Math.max(
                ...sessions.map((s) => s.sets.reduce((sum, r) => sum + r, 0))
              )}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-700 font-medium">Série la plus longue</p>
            <p className="text-2xl font-bold text-purple-900 mt-2">
              {Math.max(...sessions.flatMap((s) => s.sets))} reps
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
