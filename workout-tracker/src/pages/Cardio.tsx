import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../context/WorkoutContext'
import type { CardioType } from '../types'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const cardioTypes: { value: CardioType; label: string; icon: string }[] = [
  { value: 'running', label: 'Course', icon: '🏃' },
  { value: 'cycling', label: 'Velo', icon: '🚴' },
  { value: 'walking', label: 'Marche', icon: '🚶' },
]

export default function Cardio() {
  const navigate = useNavigate()
  const { addCardioSession, cardioSessions } = useWorkout()

  const [selectedType, setSelectedType] = useState<CardioType>('running')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [notes, setNotes] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const canSave = duration && parseFloat(duration) > 0 && distance && parseFloat(distance) > 0

  const handleSave = () => {
    if (!canSave) return

    addCardioSession({
      type: selectedType,
      duration: parseFloat(duration),
      distance: parseFloat(distance),
      notes: notes || undefined,
    })

    setShowSuccess(true)
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  const handleReset = () => {
    setDuration('')
    setDistance('')
    setNotes('')
  }

  const recentCardio = cardioSessions
    .filter((s) => s.type === selectedType)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const totalDistance = cardioSessions
    .filter((s) => s.type === selectedType)
    .reduce((acc, s) => acc + s.distance, 0)

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <Card variant="gradient" className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center animate-scale-in">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold mb-2 text-emerald-600 dark:text-emerald-400">
            Seance enregistree !
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {distance} km en {duration} min
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold">
          <span className="gradient-text">Cardio</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Enregistre ta seance
        </p>
      </header>

      {/* Type selection */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {cardioTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`
              p-4 rounded-2xl text-center transition-all duration-300
              ${selectedType === type.value
                ? 'bg-gradient-to-br from-pulse-400 to-pulse-600 text-white shadow-lg shadow-pulse-500/30 scale-105'
                : 'glass hover:scale-102 text-gray-700 dark:text-gray-300'
              }
              active:scale-95 touch-feedback
            `}
          >
            <span className="text-3xl block mb-1">{type.icon}</span>
            <span className="text-sm font-semibold">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <Card variant="glass" className="mb-6">
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-400 to-pulse-600 flex items-center justify-center text-white text-sm">
            {cardioTypes.find((t) => t.value === selectedType)?.icon}
          </span>
          Nouvelle seance
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Duree (minutes)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 30"
              className="
                w-full px-4 py-3 text-lg rounded-xl
                bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm
                border-2 border-gray-200/50 dark:border-white/10
                text-gray-900 dark:text-white font-medium
                placeholder:text-gray-400
                focus:outline-none focus:border-pulse-500 dark:focus:border-pulse-400
                transition-all duration-200
              "
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Distance (km)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Ex: 5.5"
              className="
                w-full px-4 py-3 text-lg rounded-xl
                bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm
                border-2 border-gray-200/50 dark:border-white/10
                text-gray-900 dark:text-white font-medium
                placeholder:text-gray-400
                focus:outline-none focus:border-pulse-500 dark:focus:border-pulse-400
                transition-all duration-200
              "
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Bonne seance, meteo parfaite..."
              rows={2}
              className="
                w-full px-4 py-3 rounded-xl
                bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm
                border-2 border-gray-200/50 dark:border-white/10
                text-gray-900 dark:text-white font-medium
                placeholder:text-gray-400
                focus:outline-none focus:border-pulse-500 dark:focus:border-pulse-400
                transition-all duration-200 resize-none
              "
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={handleReset} fullWidth>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!canSave} fullWidth>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            Enregistrer
          </Button>
        </div>
      </Card>

      {/* Stats */}
      {totalDistance > 0 && (
        <Card variant="glass" className="animate-slide-up">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <span>{cardioTypes.find((t) => t.value === selectedType)?.icon}</span>
            Stats {cardioTypes.find((t) => t.value === selectedType)?.label}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-pulse-400/10 dark:bg-pulse-400/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-pulse-600 dark:text-pulse-400">
                {totalDistance.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">km total</p>
            </div>
            <div className="bg-pulse-400/10 dark:bg-pulse-400/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-pulse-600 dark:text-pulse-400">
                {cardioSessions.filter((s) => s.type === selectedType).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">seances</p>
            </div>
          </div>

          {recentCardio.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Recentes :</p>
              <div className="space-y-2">
                {recentCardio.map((session) => (
                  <div
                    key={session.id}
                    className="flex justify-between items-center bg-white/50 dark:bg-white/5 rounded-xl px-4 py-3"
                  >
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{session.date}</span>
                    <span className="font-display font-bold text-gray-700 dark:text-gray-200">
                      {session.distance} km • {session.duration} min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
