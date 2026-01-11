import { useState } from 'react'
import { useWorkout } from '../context/WorkoutContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../hooks/useNotifications'
import type { Exercise, Program } from '../types'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Card from '../components/ui/Card'
import ExerciseForm from '../components/config/ExerciseForm'
import ExerciseList from '../components/config/ExerciseList'
import ProgramForm from '../components/config/ProgramForm'
import ProgramList from '../components/config/ProgramList'

type Tab = 'exercises' | 'programs'

export default function Config() {
  const {
    exercises,
    programs,
    addExercise,
    updateExercise,
    deleteExercise,
    addProgram,
    updateProgram,
    deleteProgram,
  } = useWorkout()

  const { theme, toggleTheme } = useTheme()
  const { isEnabled, enableNotifications, disableNotifications } = useNotifications()

  const [activeTab, setActiveTab] = useState<Tab>('exercises')

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      disableNotifications()
    } else {
      const enabled = await enableNotifications()
      if (!enabled) {
        alert('Impossible d\'activer les notifications. Vérifiez les paramètres de votre navigateur.')
      }
    }
  }

  // États pour les modals exercices
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>()

  // États pour les modals programmes
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | undefined>()

  // États pour le modal de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // === HANDLERS EXERCICES ===

  const handleAddExercise = () => {
    setEditingExercise(undefined)
    setIsExerciseModalOpen(true)
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setIsExerciseModalOpen(true)
  }

  const handleSaveExercise = (data: { name: string; goal: number }) => {
    if (editingExercise) {
      updateExercise(editingExercise.id, data)
    } else {
      addExercise(data)
    }
    setIsExerciseModalOpen(false)
    setEditingExercise(undefined)
  }

  const handleDeleteExercise = (exercise: Exercise) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer l\'exercice',
      message: `Êtes-vous sûr de vouloir supprimer "${exercise.name}" ? Cette action est irréversible.`,
      onConfirm: () => deleteExercise(exercise.id),
    })
  }

  // === HANDLERS PROGRAMMES ===

  const handleAddProgram = () => {
    setEditingProgram(undefined)
    setIsProgramModalOpen(true)
  }

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program)
    setIsProgramModalOpen(true)
  }

  const handleSaveProgram = (data: {
    name: string
    description?: string
    restSeconds?: number
    emomSeconds?: number
    defaultRepsPattern: Program['defaultRepsPattern']
    fixedReps?: number
  }) => {
    if (editingProgram) {
      updateProgram(editingProgram.id, data)
    } else {
      addProgram(data)
    }
    setIsProgramModalOpen(false)
    setEditingProgram(undefined)
  }

  const handleDeleteProgram = (program: Program) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le programme',
      message: `Êtes-vous sûr de vouloir supprimer "${program.name}" ? Cette action est irréversible.`,
      onConfirm: () => deleteProgram(program.id),
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configuration</h1>

      {/* Paramètres */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Paramètres</h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium">Thème sombre</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Activer le mode sombre pour réduire la fatigue oculaire
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Rappels de séances</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recevoir une notification quotidienne à 18h
            </p>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'exercises'
              ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Exercices ({exercises.length})
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'programs'
              ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Programmes ({programs.length})
        </button>
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'exercises' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mes exercices</h2>
            <Button onClick={handleAddExercise}>Ajouter un exercice</Button>
          </div>
          <ExerciseList
            exercises={exercises}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
          />
        </div>
      )}

      {activeTab === 'programs' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mes programmes</h2>
            <Button onClick={handleAddProgram}>Ajouter un programme</Button>
          </div>
          <ProgramList
            programs={programs}
            onEdit={handleEditProgram}
            onDelete={handleDeleteProgram}
          />
        </div>
      )}

      {/* Modal exercice */}
      <Modal
        isOpen={isExerciseModalOpen}
        onClose={() => {
          setIsExerciseModalOpen(false)
          setEditingExercise(undefined)
        }}
        title={editingExercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
      >
        <ExerciseForm
          exercise={editingExercise}
          onSave={handleSaveExercise}
          onCancel={() => {
            setIsExerciseModalOpen(false)
            setEditingExercise(undefined)
          }}
        />
      </Modal>

      {/* Modal programme */}
      <Modal
        isOpen={isProgramModalOpen}
        onClose={() => {
          setIsProgramModalOpen(false)
          setEditingProgram(undefined)
        }}
        title={editingProgram ? 'Modifier le programme' : 'Nouveau programme'}
      >
        <ProgramForm
          program={editingProgram}
          onSave={handleSaveProgram}
          onCancel={() => {
            setIsProgramModalOpen(false)
            setEditingProgram(undefined)
          }}
        />
      </Modal>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Supprimer"
      />
    </div>
  )
}
