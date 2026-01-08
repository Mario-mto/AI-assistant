import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../context/WorkoutContext'
import { getDefaultReps } from '../utils/defaultReps'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Card from '../components/ui/Card'
import SetLogger from '../components/session/SetLogger'
import Timer from '../components/ui/Timer'
import ConfirmModal from '../components/ui/ConfirmModal'

type SessionState = 'setup' | 'active' | 'resting'

export default function ActiveSession() {
  const navigate = useNavigate()
  const {
    exercises,
    programs,
    addSession,
    getLastSession,
  } = useWorkout()

  // Setup
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')

  // Session active
  const [sessionState, setSessionState] = useState<SessionState>('setup')
  const [completedSets, setCompletedSets] = useState<number[]>([])
  const [currentSetIndex, setCurrentSetIndex] = useState(0)

  // Modal de fin
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const selectedExercise = exercises.find((ex) => ex.id === selectedExerciseId)
  const selectedProgram = programs.find((prog) => prog.id === selectedProgramId)

  const canStart = selectedExerciseId && selectedProgramId

  const handleStartSession = () => {
    if (!canStart) return
    setSessionState('active')
    setCompletedSets([])
    setCurrentSetIndex(0)
  }

  const handleValidateSet = (reps: number) => {
    setCompletedSets([...completedSets, reps])

    // Si le programme a un temps de repos, passer en mode repos
    if (selectedProgram?.restSeconds || selectedProgram?.emomSeconds) {
      setSessionState('resting')
    } else {
      // Sinon, série suivante directement
      setCurrentSetIndex((prev) => prev + 1)
    }
  }

  const handleRestComplete = () => {
    setSessionState('active')
    setCurrentSetIndex((prev) => prev + 1)
  }

  const handleEndSession = () => {
    if (completedSets.length === 0) {
      alert('Aucune série complétée. Impossible de terminer la séance.')
      return
    }
    setShowEndConfirm(true)
  }

  const handleConfirmEnd = () => {
    if (!selectedExerciseId || !selectedProgramId) return

    addSession({
      exerciseId: selectedExerciseId,
      programId: selectedProgramId,
      sets: completedSets,
    })

    // Redirection vers dashboard
    navigate('/')
  }

  const handleCancelSession = () => {
    if (completedSets.length > 0) {
      if (!confirm('Abandonner la séance en cours ? Les données seront perdues.')) {
        return
      }
    }
    setSessionState('setup')
    setCompletedSets([])
    setCurrentSetIndex(0)
  }

  // Calcul de la valeur par défaut pour la série courante
  const getDefaultRepsForCurrentSet = (): number => {
    if (!selectedProgram || !selectedExercise) return 0

    const lastSession = getLastSession(selectedExerciseId, selectedProgramId)

    return getDefaultReps(
      selectedProgram,
      currentSetIndex,
      selectedExercise.goal,
      lastSession
    )
  }

  const restSeconds = selectedProgram?.restSeconds || selectedProgram?.emomSeconds || 60

  // Options pour les selects
  const exerciseOptions = exercises.map((ex) => ({
    value: ex.id,
    label: `${ex.name} (objectif: ${ex.goal})`,
  }))

  const programOptions = programs.map((prog) => ({
    value: prog.id,
    label: prog.name,
  }))

  // Affichage conditionnel selon l'état
  if (sessionState === 'setup') {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Nouvelle Séance</h1>

        {exercises.length === 0 || programs.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600">
              {exercises.length === 0 && 'Aucun exercice configuré. '}
              {programs.length === 0 && 'Aucun programme configuré. '}
            </p>
            <p className="text-center text-gray-600 mt-2">
              Va dans l'onglet <span className="font-bold">Config</span> pour en créer.
            </p>
          </Card>
        ) : (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Sélectionne ton exercice et programme</h2>

            <Select
              label="Exercice"
              options={[{ value: '', label: 'Choisir un exercice' }, ...exerciseOptions]}
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            />

            <Select
              label="Programme"
              options={[{ value: '', label: 'Choisir un programme' }, ...programOptions]}
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            />

            {selectedProgram && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">Détails du programme :</p>
                {selectedProgram.description && (
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{selectedProgram.description}</p>
                )}
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                  {selectedProgram.restSeconds && (
                    <p>• Repos entre séries : {selectedProgram.restSeconds}s</p>
                  )}
                  {selectedProgram.emomSeconds && (
                    <p>• EMOM : {selectedProgram.emomSeconds}s</p>
                  )}
                  <p>• Pattern : {selectedProgram.defaultRepsPattern}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleStartSession}
              disabled={!canStart}
              fullWidth
              className="mt-6"
            >
              Commencer la séance
            </Button>
          </Card>
        )}
      </div>
    )
  }

  if (sessionState === 'resting') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{selectedExercise?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{selectedProgram?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {completedSets.length} série{completedSets.length > 1 ? 's' : ''} complétée{completedSets.length > 1 ? 's' : ''}
          </p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-center mb-6">Temps de repos</h2>
          <Timer
            seconds={restSeconds}
            onComplete={handleRestComplete}
            autoStart={true}
          />
        </Card>

        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={handleRestComplete} fullWidth>
            Passer le repos
          </Button>
          <Button variant="danger" onClick={handleEndSession} fullWidth>
            Terminer la séance
          </Button>
        </div>

        {/* Résumé des séries */}
        <Card className="mt-6">
          <h3 className="font-semibold mb-3">Séries complétées :</h3>
          <div className="flex flex-wrap gap-2">
            {completedSets.map((reps, idx) => (
              <div
                key={idx}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium"
              >
                #{idx + 1}: {reps} reps
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // sessionState === 'active'
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{selectedExercise?.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{selectedProgram?.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {completedSets.length} série{completedSets.length > 1 ? 's' : ''} complétée{completedSets.length > 1 ? 's' : ''}
        </p>
      </div>

      <SetLogger
        setNumber={currentSetIndex + 1}
        defaultReps={getDefaultRepsForCurrentSet()}
        onValidate={handleValidateSet}
      />

      <div className="mt-4 flex gap-3">
        <Button variant="secondary" onClick={handleCancelSession} fullWidth>
          Annuler
        </Button>
        <Button variant="danger" onClick={handleEndSession} fullWidth>
          Terminer
        </Button>
      </div>

      {/* Résumé des séries */}
      {completedSets.length > 0 && (
        <Card className="mt-6">
          <h3 className="font-semibold mb-3">Séries complétées :</h3>
          <div className="flex flex-wrap gap-2">
            {completedSets.map((reps, idx) => (
              <div
                key={idx}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium"
              >
                #{idx + 1}: {reps} reps
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal de confirmation fin de séance */}
      <ConfirmModal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={handleConfirmEnd}
        title="Terminer la séance"
        message={`Tu as complété ${completedSets.length} série(s). Veux-tu enregistrer cette séance ?`}
        confirmText="Enregistrer"
      />
    </div>
  )
}
