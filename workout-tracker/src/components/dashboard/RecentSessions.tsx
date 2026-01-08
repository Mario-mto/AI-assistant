import type { Session, Exercise, Program } from '../../types'
import Card from '../ui/Card'
import { formatDate, isToday } from '../../utils/date'

interface RecentSessionsProps {
  sessions: Session[]
  exercises: Exercise[]
  programs: Program[]
  limit?: number
}

export default function RecentSessions({
  sessions,
  exercises,
  programs,
  limit = 5,
}: RecentSessionsProps) {
  const recentSessions = sessions.slice(0, limit)

  const getExerciseName = (exerciseId: string) => {
    return exercises.find((ex) => ex.id === exerciseId)?.name || 'Exercice supprimé'
  }

  const getProgramName = (programId: string) => {
    return programs.find((prog) => prog.id === programId)?.name || 'Programme supprimé'
  }

  const getTotalReps = (sets: number[]) => {
    return sets.reduce((sum, reps) => sum + reps, 0)
  }

  if (recentSessions.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-4">Dernières séances</h3>
        <div className="text-center py-8 text-gray-500">
          Aucune séance enregistrée. Commence ta première séance !
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Dernières séances</h3>
      <div className="space-y-3">
        {recentSessions.map((session) => {
          const totalReps = getTotalReps(session.sets)
          const avgReps = (totalReps / session.sets.length).toFixed(1)

          return (
            <div
              key={session.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {getExerciseName(session.exerciseId)}
                    </h4>
                    {isToday(session.date) && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getProgramName(session.programId)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(session.date)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalReps}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {session.sets.length} série{session.sets.length > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    moy: {avgReps}
                  </div>
                </div>
              </div>

              {/* Détail des séries */}
              <div className="mt-3 flex flex-wrap gap-2">
                {session.sets.map((reps, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  >
                    #{idx + 1}: {reps}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
