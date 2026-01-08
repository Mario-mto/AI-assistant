import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../context/WorkoutContext'
import { useAICoach } from '../hooks/useAICoach'
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
  const { getLiveCoaching, analyzeCompletedSession, isConfigured, settings } = useAICoach()

  // Setup
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')

  // Session active
  const [sessionState, setSessionState] = useState<SessionState>('setup')
  const [completedSets, setCompletedSets] = useState<number[]>([])
  const [currentSetIndex, setCurrentSetIndex] = useState(0)

  // Modals de confirmation
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showNoSetsAlert, setShowNoSetsAlert] = useState(false)

  // Coach IA - encouragements
  const [coachMessage, setCoachMessage] = useState('')
  const [isLoadingCoach, setIsLoadingCoach] = useState(false)
  const [sessionFeedback, setSessionFeedback] = useState('')

  const selectedExercise = exercises.find((ex) => ex.id === selectedExerciseId)
  const selectedProgram = programs.find((prog) => prog.id === selectedProgramId)

  const canStart = selectedExerciseId && selectedProgramId

  // Récupérer un message d'encouragement du coach pendant le repos
  useEffect(() => {
    if (sessionState !== 'resting') return
    if (!isConfigured || !settings.liveCoachingEnabled) return
    if (!selectedExercise || !selectedProgram) return

    const fetchCoachMessage = async () => {
      setIsLoadingCoach(true)
      try {
        const message = await getLiveCoaching(
          currentSetIndex + 1,
          completedSets,
          selectedExercise.goal,
          selectedExercise.name,
          selectedProgram.name
        )
        if (message) {
          setCoachMessage(message)
        }
      } catch (error) {
        console.error('Erreur coaching live:', error)
      } finally {
        setIsLoadingCoach(false)
      }
    }

    fetchCoachMessage()
  }, [sessionState, completedSets.length])

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
      setShowNoSetsAlert(true)
      return
    }
    setShowEndConfirm(true)
  }

  const handleConfirmEnd = async () => {
    if (!selectedExerciseId || !selectedProgramId) return

    // Fermer la modal immédiatement
    setShowEndConfirm(false)

    // Sauvegarder la séance
    addSession({
      exerciseId: selectedExerciseId,
      programId: selectedProgramId,
      sets: completedSets,
    })

    // Récupérer le feedback du coach si activé
    if (isConfigured && selectedExercise && selectedProgram) {
      try {
        const feedback = await analyzeCompletedSession(
          selectedExercise.name,
          selectedProgram.name,
          completedSets,
          selectedExercise.goal
        )
        if (feedback) {
          setSessionFeedback(feedback)
          // Afficher le feedback pendant 5 secondes avant redirection
          setTimeout(() => navigate('/'), 5000)
          return
        }
      } catch (error) {
        console.error('Erreur feedback séance:', error)
      }
    }

    // Redirection vers dashboard
    navigate('/')
  }

  const handleCancelSession = () => {
    if (completedSets.length > 0) {
      setShowCancelConfirm(true)
      return
    }
    resetSession()
  }

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false)
    resetSession()
  }

  const resetSession = () => {
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

  // Écran de feedback de fin de séance
  if (sessionFeedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">
            Séance terminée !
          </h2>
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {completedSets.length} série{completedSets.length > 1 ? 's' : ''} • {completedSets.reduce((a, b) => a + b, 0)} reps au total
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <p className="font-medium text-blue-700 dark:text-blue-300 text-sm mb-1">Feedback du coach</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{sessionFeedback}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Redirection vers le dashboard dans quelques secondes...
          </p>
        </Card>
      </div>
    )
  }

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

        {/* Message du coach IA */}
        {isConfigured && settings.liveCoachingEnabled && (
          <Card className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">Coach IA</p>
                {isLoadingCoach ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">
                    Analyse en cours...
                  </p>
                ) : coachMessage ? (
                  <p className="text-gray-700 dark:text-gray-300">{coachMessage}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    Continue comme ça !
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

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

        {/* Modal de confirmation fin de séance */}
        <ConfirmModal
          isOpen={showEndConfirm}
          onClose={() => setShowEndConfirm(false)}
          onConfirm={handleConfirmEnd}
          title="Terminer la séance"
          message={`Tu as complété ${completedSets.length} série(s). Veux-tu enregistrer cette séance ?`}
          confirmText="Enregistrer"
        />

        {/* Modal de confirmation annulation */}
        <ConfirmModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleConfirmCancel}
          title="Abandonner la séance"
          message="Tu as des séries en cours. Abandonner la séance ? Les données seront perdues."
          confirmText="Abandonner"
          cancelText="Continuer"
        />
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

      {/* Modal de confirmation annulation */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmCancel}
        title="Abandonner la séance"
        message="Tu as des séries en cours. Abandonner la séance ? Les données seront perdues."
        confirmText="Abandonner"
        cancelText="Continuer"
      />

      {/* Modal alerte aucune série */}
      <ConfirmModal
        isOpen={showNoSetsAlert}
        onClose={() => setShowNoSetsAlert(false)}
        onConfirm={() => setShowNoSetsAlert(false)}
        title="Aucune série"
        message="Tu n'as complété aucune série. Fais au moins une série avant de terminer la séance."
        confirmText="Compris"
        cancelText="Fermer"
      />
    </div>
  )
}
