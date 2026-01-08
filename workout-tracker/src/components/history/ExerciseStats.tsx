import { useMemo } from 'react'
import type { Session, Exercise } from '../../types'
import Card from '../ui/Card'

interface ExerciseStatsProps {
  sessions: Session[]
  exercises: Exercise[]
}

export default function ExerciseStats({ sessions, exercises }: ExerciseStatsProps) {
  const stats = useMemo(() => {
    if (sessions.length === 0) return []

    // Grouper les séances par exercice
    const byExercise = sessions.reduce((acc, session) => {
      if (!acc[session.exerciseId]) {
        acc[session.exerciseId] = []
      }
      acc[session.exerciseId].push(session)
      return acc
    }, {} as Record<string, Session[]>)

    // Calculer les stats pour chaque exercice
    return Object.entries(byExercise).map(([exerciseId, exerciseSessions]) => {
      const exercise = exercises.find((ex) => ex.id === exerciseId)

      const totalSessions = exerciseSessions.length
      const allSets = exerciseSessions.flatMap((s) => s.sets)
      const totalReps = allSets.reduce((sum, reps) => sum + reps, 0)
      const avgRepsPerSet = (totalReps / allSets.length).toFixed(1)
      const maxReps = Math.max(...allSets)
      const bestSession = exerciseSessions.reduce((best, current) => {
        const currentTotal = current.sets.reduce((sum, r) => sum + r, 0)
        const bestTotal = best.sets.reduce((sum, r) => sum + r, 0)
        return currentTotal > bestTotal ? current : best
      })
      const bestSessionTotal = bestSession.sets.reduce((sum, r) => sum + r, 0)

      // Calcul de progression (dernière vs première séance)
      const firstSession = exerciseSessions[exerciseSessions.length - 1]
      const lastSession = exerciseSessions[0]
      const firstTotal = firstSession.sets.reduce((sum, r) => sum + r, 0)
      const lastTotal = lastSession.sets.reduce((sum, r) => sum + r, 0)
      const progression = firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : 0

      return {
        exerciseId,
        exerciseName: exercise?.name || 'Exercice supprimé',
        exerciseGoal: exercise?.goal || 0,
        totalSessions,
        totalReps,
        avgRepsPerSet: parseFloat(avgRepsPerSet),
        maxReps,
        bestSessionTotal,
        progression: Math.round(progression),
      }
    }).sort((a, b) => b.totalSessions - a.totalSessions) // Trier par nombre de séances
  }, [sessions, exercises])

  if (stats.length === 0) {
    return null
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Statistiques par exercice</h3>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.exerciseId}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{stat.exerciseName}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Objectif : {stat.exerciseGoal} reps
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {stat.totalSessions}
                </div>
                <div className="text-xs text-gray-500">séances</div>
              </div>
            </div>

            {/* Stats en grille */}
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="text-gray-500 text-xs">Total reps</div>
                <div className="font-semibold">{stat.totalReps}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Moy/série</div>
                <div className="font-semibold">{stat.avgRepsPerSet}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Max série</div>
                <div className="font-semibold">{stat.maxReps}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Record</div>
                <div className="font-semibold">{stat.bestSessionTotal}</div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progression</span>
                <span
                  className={`font-medium ${
                    stat.progression > 0
                      ? 'text-green-600'
                      : stat.progression < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {stat.progression > 0 ? '+' : ''}
                  {stat.progression}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    stat.progression > 0
                      ? 'bg-green-500'
                      : stat.progression < 0
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                  style={{
                    width: `${Math.min(Math.abs(stat.progression), 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
