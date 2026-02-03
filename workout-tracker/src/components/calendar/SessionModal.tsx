import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlannedSession, Session } from '../../types'
import { useWorkout } from '../../context/WorkoutContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ConfirmModal from '../ui/ConfirmModal'
import PlanSessionForm from './PlanSessionForm'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  completedSessions: Session[]
  plannedSessions: PlannedSession[]
}

type ModalView = 'list' | 'create' | 'edit'

export default function SessionModal({
  isOpen,
  onClose,
  date,
  completedSessions,
  plannedSessions,
}: SessionModalProps) {
  const navigate = useNavigate()
  const {
    exercises,
    programs,
    addPlannedSession,
    updatePlannedSession,
    deletePlannedSession,
    excludeDateFromRecurrence,
  } = useWorkout()

  const [view, setView] = useState<ModalView>('list')
  const [editingSession, setEditingSession] = useState<PlannedSession | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ session: PlannedSession; showOptions: boolean } | null>(null)

  const getExerciseName = (exerciseId: string) => {
    return exercises.find(e => e.id === exerciseId)?.name || 'Exercice inconnu'
  }

  const getProgramName = (programId: string) => {
    return programs.find(p => p.id === programId)?.name || 'Programme inconnu'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const handleCreateSession = (data: Omit<PlannedSession, 'id'>) => {
    addPlannedSession(data)
    setView('list')
  }

  const handleEditSession = (data: Omit<PlannedSession, 'id'>) => {
    if (editingSession) {
      updatePlannedSession(editingSession.id, data)
      setEditingSession(null)
      setView('list')
    }
  }

  const handleDeleteClick = (session: PlannedSession) => {
    const isRecurring = session.recurrenceType !== 'none'
    setDeleteConfirm({ session, showOptions: isRecurring })
  }

  const handleDeleteConfirm = (deleteAll: boolean) => {
    if (deleteConfirm) {
      if (deleteAll) {
        deletePlannedSession(deleteConfirm.session.id, true)
      } else {
        // Only this occurrence - exclude the date
        excludeDateFromRecurrence(deleteConfirm.session.id, date)
      }
      setDeleteConfirm(null)
    }
  }

  const handleLaunchSession = (session: PlannedSession) => {
    navigate(`/session?exerciseId=${session.exerciseId}&programId=${session.programId}`)
    onClose()
  }

  const handleClose = () => {
    setView('list')
    setEditingSession(null)
    setDeleteConfirm(null)
    onClose()
  }

  const getTitle = () => {
    if (view === 'create') return 'Planifier une seance'
    if (view === 'edit') return 'Modifier la seance'
    return formatDate(date)
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
        {view === 'list' && (
          <div className="space-y-4">
            {/* Completed sessions */}
            {completedSessions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Seances completees
                </h3>
                <div className="space-y-2">
                  {completedSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-medium">{getExerciseName(session.exerciseId)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {getProgramName(session.programId)} - {session.sets.reduce((a, b) => a + b, 0)} reps ({session.sets.length} series)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Planned sessions */}
            {plannedSessions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Seances planifiees
                </h3>
                <div className="space-y-2">
                  {plannedSessions.map((session) => {
                    const isToday = date === new Date().toISOString().split('T')[0]
                    return (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg border ${
                          isToday
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-orange-500' : 'bg-blue-500'}`} />
                            <span className="font-medium">{getExerciseName(session.exerciseId)}</span>
                          </div>
                          {session.time && (
                            <span className="text-sm text-gray-500">{session.time}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {getProgramName(session.programId)}
                          {session.recurrenceType !== 'none' && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                              {session.recurrenceType === 'daily' && 'Quotidien'}
                              {session.recurrenceType === 'weekly' && 'Hebdo'}
                              {session.recurrenceType === 'monthly' && 'Mensuel'}
                            </span>
                          )}
                        </p>
                        {session.notes && (
                          <p className="text-sm text-gray-400 mt-1 italic">{session.notes}</p>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleLaunchSession(session)}
                            className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-energy-500 text-white hover:bg-energy-600 transition-colors"
                          >
                            Lancer
                          </button>
                          <button
                            onClick={() => {
                              setEditingSession(session)
                              setView('edit')
                            }}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteClick(session)}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {completedSessions.length === 0 && plannedSessions.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Aucune seance pour cette date
              </p>
            )}

            {/* Add button */}
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setView('create')}
            >
              + Planifier une seance
            </Button>
          </div>
        )}

        {view === 'create' && (
          <PlanSessionForm
            date={date}
            onSave={handleCreateSession}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'edit' && editingSession && (
          <PlanSessionForm
            date={date}
            session={editingSession}
            onSave={handleEditSession}
            onCancel={() => {
              setEditingSession(null)
              setView('list')
            }}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      {deleteConfirm && !deleteConfirm.showOptions && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteConfirm(false)}
          title="Supprimer la seance"
          message="Etes-vous sur de vouloir supprimer cette seance planifiee?"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}

      {/* Delete confirmation for recurring sessions with options */}
      {deleteConfirm && deleteConfirm.showOptions && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title="Supprimer la seance"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Cette seance est recurrente. Que voulez-vous supprimer?
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleDeleteConfirm(false)}
              className="w-full px-4 py-3 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cette occurrence seulement
            </button>
            <button
              onClick={() => handleDeleteConfirm(true)}
              className="w-full px-4 py-3 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Toutes les occurrences
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="w-full px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
