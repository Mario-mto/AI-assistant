import { useState, useRef } from 'react'
import { useWorkout } from '../context/WorkoutContext'
import { useTheme } from '../context/ThemeContext'
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
    exportData,
    importData,
  } = useWorkout()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { theme, toggleTheme } = useTheme()

  const [activeTab, setActiveTab] = useState<Tab>('exercises')

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

  // État pour le feedback import/export
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')

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
      message: `Etes-vous sur de vouloir supprimer "${exercise.name}" ? Cette action est irreversible.`,
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
      message: `Etes-vous sur de vouloir supprimer "${program.name}" ? Cette action est irreversible.`,
      onConfirm: () => deleteProgram(program.id),
    })
  }

  // === HANDLERS IMPORT/EXPORT ===

  const handleExport = () => {
    const jsonData = exportData()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const success = importData(content)
      setImportStatus(success ? 'success' : 'error')
      setTimeout(() => setImportStatus('idle'), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold">
          <span className="gradient-text">Configuration</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Gere tes exercices et programmes
        </p>
      </header>

      {/* Parametres */}
      <Card variant="glass" className="mb-6">
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-volt-400 to-volt-600 flex items-center justify-center text-white text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </span>
          Parametres
        </h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">Theme sombre</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reduire la fatigue oculaire
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`
              relative w-14 h-8 rounded-full transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-volt-500 to-volt-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-gray-300 dark:bg-gray-600'
              }
            `}
          >
            <span
              className={`
                absolute top-1 w-6 h-6 rounded-full bg-white shadow-md
                transition-all duration-300 ease-out
                ${theme === 'dark' ? 'left-7' : 'left-1'}
              `}
            />
          </button>
        </div>

        {/* Sauvegarde des donnees */}
        <div className="mt-4 p-4 bg-white/50 dark:bg-white/5 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">Sauvegarde</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Exporter ou importer tes donnees
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-energy-500 to-energy-600 text-white shadow-energy hover:shadow-lg transition-all duration-300"
            >
              Exporter JSON
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 px-4 py-2 rounded-xl font-semibold text-sm glass text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
            >
              Importer JSON
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {importStatus === 'success' && (
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              Donnees importees avec succes !
            </p>
          )}
          {importStatus === 'error' && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
              Erreur lors de l'import. Verifiez le fichier.
            </p>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`
            flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300
            ${activeTab === 'exercises'
              ? 'bg-gradient-to-r from-energy-500 to-energy-600 text-white shadow-energy'
              : 'glass text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10'
            }
          `}
        >
          Exercices ({exercises.length})
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`
            flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300
            ${activeTab === 'programs'
              ? 'bg-gradient-to-r from-energy-500 to-energy-600 text-white shadow-energy'
              : 'glass text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10'
            }
          `}
        >
          Programmes ({programs.length})
        </button>
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'exercises' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold">Mes exercices</h2>
            <Button onClick={handleAddExercise} size="sm">
              + Ajouter
            </Button>
          </div>
          <ExerciseList
            exercises={exercises}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
          />
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold">Mes programmes</h2>
            <Button onClick={handleAddProgram} size="sm">
              + Ajouter
            </Button>
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
