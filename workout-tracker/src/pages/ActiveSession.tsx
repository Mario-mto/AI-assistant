import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../context/WorkoutContext'
import { getDefaultReps, generatePyramidPattern, getPyramidTotalSets } from '../utils/defaultReps'
import type { PyramidDirection } from '../types'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import SetLogger from '../components/session/SetLogger'
import Timer from '../components/ui/Timer'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useEmomTimer } from '../hooks/useEmomTimer'
import EmomTimer from '../components/session/EmomTimer'
import PyramidProgress from '../components/session/PyramidProgress'
import { isPyramidComplete } from '../utils/defaultReps'

type SessionState = 'setup' | 'active' | 'resting'

export default function ActiveSession() {
  const navigate = useNavigate()
  const { exercises, programs, addSession, getLastSession } = useWorkout()

  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [sessionState, setSessionState] = useState<SessionState>('setup')
  const [completedSets, setCompletedSets] = useState<number[]>([])
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showNoSetsAlert, setShowNoSetsAlert] = useState(false)

  // Local pyramid config (can override program defaults)
  const [sessionPyramidDirection, setSessionPyramidDirection] = useState<PyramidDirection>('both')
  const [sessionPyramidStartRep, setSessionPyramidStartRep] = useState(1)

  const selectedExercise = exercises.find((ex) => ex.id === selectedExerciseId)
  const selectedProgram = programs.find((prog) => prog.id === selectedProgramId)
  const canStart = selectedExerciseId && selectedProgramId

  const handleStartSession = () => {
    if (!canStart) return
    setSessionState('active')
    setCompletedSets([])
    setCurrentSetIndex(0)

    // Start EMOM timer if in EMOM mode
    if (isEmomMode) {
      emomTimer.reset()
      emomTimer.start()
    }
  }

  const handleValidateSet = (reps: number) => {
    const newCompletedSets = [...completedSets, reps]
    setCompletedSets(newCompletedSets)

    // Check if pyramid is complete
    if (isPyramidMode && selectedExercise && isPyramidComplete(
      newCompletedSets.length,
      selectedExercise.goal,
      sessionPyramidDirection,
      sessionPyramidStartRep
    )) {
      setShowPyramidComplete(true)
    }

    if (isEmomMode) {
      // EMOM: mark work done, wait for minute to complete
      emomTimer.markSetComplete()
      setSessionState('resting')
    } else if (selectedProgram?.restSeconds) {
      // Standard rest timer
      setSessionState('resting')
    } else {
      // No timer - immediate next set
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

  const handleConfirmEnd = () => {
    if (!selectedExerciseId || !selectedProgramId) return
    setShowEndConfirm(false)
    addSession({
      exerciseId: selectedExerciseId,
      programId: selectedProgramId,
      sets: completedSets,
    })
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

  const getDefaultRepsForCurrentSet = (): number => {
    if (!selectedProgram || !selectedExercise) return 0
    const lastSession = getLastSession(selectedExerciseId, selectedProgramId)

    // Use session-local pyramid config
    const programWithSessionConfig = isPyramidMode
      ? { ...selectedProgram, pyramidDirection: sessionPyramidDirection, pyramidStartRep: sessionPyramidStartRep }
      : selectedProgram

    return getDefaultReps(programWithSessionConfig, currentSetIndex, selectedExercise.goal, lastSession)
  }

  const restSeconds = selectedProgram?.restSeconds || selectedProgram?.emomSeconds || 60

  // EMOM mode detection
  const isEmomMode = !!selectedProgram?.emomSeconds
  const emomSeconds = selectedProgram?.emomSeconds || 60

  // Pyramid mode detection
  const isPyramidMode = selectedProgram?.defaultRepsPattern === 'pyramid'
  const [showPyramidComplete, setShowPyramidComplete] = useState(false)

  const handleEmomMinuteComplete = () => {
    // Auto-advance to next set when minute completes
    setCurrentSetIndex((prev) => prev + 1)
    if (sessionState === 'resting') {
      setSessionState('active')
    }
  }

  const emomTimer = useEmomTimer(emomSeconds, handleEmomMinuteComplete)

  const exerciseOptions = exercises.map((ex) => ({
    value: ex.id,
    label: `${ex.name} (objectif: ${ex.goal})`,
  }))

  const programOptions = programs.map((prog) => ({
    value: prog.id,
    label: prog.name,
  }))

  // Sync pyramid config when program changes
  const programPyramidDirection = selectedProgram?.pyramidDirection ?? 'both'
  const programPyramidStartRep = selectedProgram?.pyramidStartRep ?? 1

  // Reset local state when program changes (using useEffect pattern inline)
  if (selectedProgram && sessionState === 'setup') {
    if (sessionPyramidDirection !== programPyramidDirection && selectedProgram.defaultRepsPattern === 'pyramid') {
      setSessionPyramidDirection(programPyramidDirection)
    }
    if (sessionPyramidStartRep !== programPyramidStartRep && selectedProgram.defaultRepsPattern === 'pyramid') {
      setSessionPyramidStartRep(programPyramidStartRep)
    }
  }

  // Pyramid preview for setup
  const getPyramidPreview = () => {
    if (!selectedExercise || !isPyramidMode) return null
    const total = getPyramidTotalSets(selectedExercise.goal, sessionPyramidDirection, sessionPyramidStartRep)
    const pattern = generatePyramidPattern(selectedExercise.goal, sessionPyramidDirection, sessionPyramidStartRep)
    const first = pattern[0]
    const last = pattern[pattern.length - 1]
    const max = Math.max(...pattern)
    return { total, first, last, max }
  }

  // SETUP STATE
  if (sessionState === 'setup') {
    return (
      <div className="animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold">
            <span className="gradient-text">Nouvelle Seance</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Configure ton entrainement
          </p>
        </header>

        {exercises.length === 0 || programs.length === 0 ? (
          <Card variant="glass" className="animate-scale-in">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-energy-400 to-volt-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {exercises.length === 0 && 'Aucun exercice configure. '}
                {programs.length === 0 && 'Aucun programme configure. '}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Va dans Config pour en creer.
              </p>
              <Button onClick={() => navigate('/config')} size="sm">
                Configurer
              </Button>
            </div>
          </Card>
        ) : (
          <Card variant="glass" className="animate-slide-up">
            <h2 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-energy-400 to-energy-600 flex items-center justify-center text-white text-sm">
                1
              </span>
              Selection
            </h2>

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
              <div className="mt-4 p-4 bg-volt-500/10 dark:bg-volt-500/20 rounded-xl border border-volt-500/20">
                <p className="font-semibold text-volt-700 dark:text-volt-300 text-sm uppercase tracking-wide mb-2">
                  Details du programme
                </p>
                {selectedProgram.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {selectedProgram.description}
                  </p>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  {selectedProgram.restSeconds && (
                    <p>Repos: {selectedProgram.restSeconds}s</p>
                  )}
                  {selectedProgram.emomSeconds && (
                    <p>EMOM: {selectedProgram.emomSeconds}s</p>
                  )}
                  <p>Pattern: {selectedProgram.defaultRepsPattern}</p>
                </div>
              </div>
            )}

            {selectedProgram?.defaultRepsPattern === 'pyramid' && selectedExercise && (
              <div className="mt-4 p-4 bg-energy-500/10 dark:bg-energy-500/20 rounded-xl border border-energy-500/20">
                <p className="font-semibold text-energy-700 dark:text-energy-300 text-sm uppercase tracking-wide mb-3">
                  Configuration Pyramide
                </p>
                <Select
                  label="Direction"
                  options={[
                    { value: 'both', label: 'Montee + Descente' },
                    { value: 'ascending', label: 'Montee seulement' },
                    { value: 'descending', label: 'Descente seulement' },
                  ]}
                  value={sessionPyramidDirection}
                  onChange={(e) => setSessionPyramidDirection(e.target.value as PyramidDirection)}
                />
                <Input
                  label="Repetition de depart"
                  type="number"
                  value={sessionPyramidStartRep.toString()}
                  onChange={(e) => setSessionPyramidStartRep(Math.max(1, Math.min(Number(e.target.value) || 1, selectedExercise.goal)))}
                  min="1"
                />
                {(() => {
                  const preview = getPyramidPreview()
                  if (!preview) return null
                  return (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">{preview.total} series</span>
                      {' : '}
                      {preview.first} → {preview.max}
                      {sessionPyramidDirection === 'both' && ` → ${preview.last}`}
                      {' (max: '}{preview.max}{' reps)'}
                    </div>
                  )
                })()}
              </div>
            )}

            <Button
              onClick={handleStartSession}
              disabled={!canStart}
              fullWidth
              className="mt-6"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Commencer
            </Button>
          </Card>
        )}
      </div>
    )
  }

  // RESTING STATE
  if (sessionState === 'resting') {
    return (
      <div className="animate-fade-in">
        <header className="mb-6">
          <h1 className="text-2xl font-display font-bold gradient-text">
            {selectedExercise?.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{selectedProgram?.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-semibold">
              {completedSets.length} serie{completedSets.length > 1 ? 's' : ''}
            </span>
          </div>
        </header>

        <Card variant="glass" className="mb-6">
          {isEmomMode ? (
            <>
              <h2 className="text-lg font-display font-bold text-center mb-2">EMOM</h2>
              <EmomTimer
                timeLeft={emomTimer.timeLeft}
                totalSeconds={emomSeconds}
                isWorkPhase={emomTimer.isWorkPhase}
                isRunning={emomTimer.isRunning}
              />
            </>
          ) : (
            <>
              <h2 className="text-lg font-display font-bold text-center mb-2">Temps de repos</h2>
              <Timer seconds={restSeconds} onComplete={handleRestComplete} autoStart={true} />
            </>
          )}
        </Card>

        <div className="flex gap-3 mb-6">
          {!isEmomMode && (
            <Button variant="secondary" onClick={handleRestComplete} fullWidth>
              Passer
            </Button>
          )}
          <Button variant="danger" onClick={handleEndSession} fullWidth>
            Terminer
          </Button>
        </div>

        {/* Completed sets */}
        <Card variant="glass">
          <h3 className="font-display font-bold mb-3">Series completees</h3>
          <div className="flex flex-wrap gap-2">
            {completedSets.map((reps, idx) => (
              <div
                key={idx}
                className="px-3 py-2 bg-gradient-to-r from-energy-500/20 to-volt-500/20 text-energy-700 dark:text-energy-300 rounded-xl font-bold text-sm"
              >
                #{idx + 1}: {reps}
              </div>
            ))}
          </div>
        </Card>

        <ConfirmModal
          isOpen={showEndConfirm}
          onClose={() => setShowEndConfirm(false)}
          onConfirm={handleConfirmEnd}
          title="Terminer la seance"
          message={`Tu as complete ${completedSets.length} serie(s). Enregistrer ?`}
          confirmText="Enregistrer"
        />

        <ConfirmModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleConfirmCancel}
          title="Abandonner"
          message="Abandonner la seance ? Les donnees seront perdues."
          confirmText="Abandonner"
          cancelText="Continuer"
        />
      </div>
    )
  }

  // ACTIVE STATE
  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold gradient-text">
          {selectedExercise?.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{selectedProgram?.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 bg-energy-500/20 text-energy-600 dark:text-energy-400 rounded-lg text-sm font-semibold">
            Serie {currentSetIndex + 1}
          </span>
          {completedSets.length > 0 && (
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-semibold">
              {completedSets.length} faite{completedSets.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {isPyramidMode && selectedExercise && (
        <Card variant="glass" className="mb-4">
          <PyramidProgress
            currentSetIndex={currentSetIndex}
            goal={selectedExercise.goal}
          />
        </Card>
      )}

      <SetLogger
        setNumber={currentSetIndex + 1}
        defaultReps={getDefaultRepsForCurrentSet()}
        onValidate={handleValidateSet}
      />

      {isEmomMode && (
        <Card variant="glass" className="mt-4">
          <EmomTimer
            timeLeft={emomTimer.timeLeft}
            totalSeconds={emomSeconds}
            isWorkPhase={emomTimer.isWorkPhase}
            isRunning={emomTimer.isRunning}
          />
        </Card>
      )}

      <div className="mt-4 flex gap-3">
        <Button variant="secondary" onClick={handleCancelSession} fullWidth>
          Annuler
        </Button>
        <Button variant="danger" onClick={handleEndSession} fullWidth>
          Terminer
        </Button>
      </div>

      {completedSets.length > 0 && (
        <Card variant="glass" className="mt-6">
          <h3 className="font-display font-bold mb-3">Series completees</h3>
          <div className="flex flex-wrap gap-2">
            {completedSets.map((reps, idx) => (
              <div
                key={idx}
                className="px-3 py-2 bg-gradient-to-r from-energy-500/20 to-volt-500/20 text-energy-700 dark:text-energy-300 rounded-xl font-bold text-sm"
              >
                #{idx + 1}: {reps}
              </div>
            ))}
          </div>
        </Card>
      )}

      <ConfirmModal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={handleConfirmEnd}
        title="Terminer la seance"
        message={`Tu as complete ${completedSets.length} serie(s). Enregistrer ?`}
        confirmText="Enregistrer"
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmCancel}
        title="Abandonner"
        message="Abandonner la seance ? Les donnees seront perdues."
        confirmText="Abandonner"
        cancelText="Continuer"
      />

      <ConfirmModal
        isOpen={showNoSetsAlert}
        onClose={() => setShowNoSetsAlert(false)}
        onConfirm={() => setShowNoSetsAlert(false)}
        title="Aucune serie"
        message="Fais au moins une serie avant de terminer."
        confirmText="Compris"
        cancelText="Fermer"
      />

      <ConfirmModal
        isOpen={showPyramidComplete}
        onClose={() => setShowPyramidComplete(false)}
        onConfirm={handleConfirmEnd}
        title="Pyramide terminee!"
        message={`Bravo! Tu as complete la pyramide (${completedSets.length} series). Enregistrer la seance?`}
        confirmText="Enregistrer"
        cancelText="Continuer"
      />
    </div>
  )
}
