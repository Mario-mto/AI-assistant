import type { Session, Exercise, Program } from '../../types'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { formatDate, isToday } from '../../utils/date'

interface SessionDetailModalProps {
  session: Session | null
  exercise?: Exercise
  program?: Program
  isOpen: boolean
  onClose: () => void
  onDelete: (sessionId: string) => void
}

export default function SessionDetailModal({
  session,
  exercise,
  program,
  isOpen,
  onClose,
  onDelete,
}: SessionDetailModalProps) {
  if (!session) return null

  const totalReps = session.sets.reduce((sum, reps) => sum + reps, 0)
  const avgReps = (totalReps / session.sets.length).toFixed(1)
  const maxReps = Math.max(...session.sets)
  const minReps = Math.min(...session.sets)

  const handleDelete = () => {
    if (
      confirm(
        `Supprimer cette séance définitivement ? Cette action est irréversible.`
      )
    ) {
      onDelete(session.id)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détail de la séance">
      <div className="space-y-4">
        {/* Infos générales */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{exercise?.name || 'Exercice supprimé'}</h3>
            {isToday(session.date) && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Aujourd'hui
              </span>
            )}
          </div>
          <p className="text-gray-600">{program?.name || 'Programme supprimé'}</p>
          <p className="text-sm text-gray-500 mt-1">{formatDate(session.date)}</p>
        </div>

        {/* Stats de la séance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-700 font-medium">Total reps</p>
            <p className="text-2xl font-bold text-blue-900">{totalReps}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-sm text-green-700 font-medium">Séries</p>
            <p className="text-2xl font-bold text-green-900">{session.sets.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-sm text-purple-700 font-medium">Moyenne</p>
            <p className="text-2xl font-bold text-purple-900">{avgReps}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-sm text-orange-700 font-medium">Min / Max</p>
            <p className="text-2xl font-bold text-orange-900">
              {minReps} / {maxReps}
            </p>
          </div>
        </div>

        {/* Détail des séries */}
        <div>
          <h4 className="font-semibold mb-2">Détail des séries</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-2">
              {session.sets.map((reps, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-3 text-center border border-gray-200"
                >
                  <div className="text-xs text-gray-500">#{idx + 1}</div>
                  <div className="text-xl font-bold text-blue-600">{reps}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progression par rapport au goal */}
        {exercise && (
          <div>
            <h4 className="font-semibold mb-2">Progression</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Objectif : {exercise.goal} reps</span>
                <span className="text-sm font-medium">
                  {maxReps >= exercise.goal ? '✅ Atteint' : '🎯 En progression'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    maxReps >= exercise.goal ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((maxReps / exercise.goal) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {((maxReps / exercise.goal) * 100).toFixed(0)}% de l'objectif
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Fermer
          </Button>
          <Button variant="danger" onClick={handleDelete} fullWidth>
            Supprimer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
