import { useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface SetLoggerProps {
  setNumber: number
  defaultReps: number
  onValidate: (reps: number) => void
}

export default function SetLogger({
  setNumber,
  defaultReps,
  onValidate,
}: SetLoggerProps) {
  const [reps, setReps] = useState(defaultReps)

  const handleIncrement = () => setReps((prev) => prev + 1)
  const handleDecrement = () => setReps((prev) => Math.max(0, prev - 1))

  const handleValidate = () => {
    onValidate(reps)
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      {/* Header with set number */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-energy-400 to-volt-500 text-white font-display font-bold text-xl shadow-lg mb-2">
          {setNumber}
        </span>
        <h2 className="text-xl font-display font-bold text-gray-800 dark:text-white">
          Serie #{setNumber}
        </h2>
      </div>

      {/* Counter controls */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <button
          onClick={handleDecrement}
          className="
            w-18 h-18 flex items-center justify-center
            bg-gradient-to-br from-red-500 to-rose-600
            text-white rounded-2xl text-4xl font-bold
            shadow-[0_4px_15px_-3px_rgba(239,68,68,0.4)]
            transition-all duration-200
            hover:shadow-[0_8px_25px_-5px_rgba(239,68,68,0.5)]
            hover:-translate-y-0.5
            active:scale-95 active:translate-y-0
            touch-feedback
          "
          style={{ width: '72px', height: '72px' }}
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="text-center min-w-[100px]">
          <div className="text-6xl font-display font-bold gradient-text">{reps}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium uppercase tracking-wide">
            repetitions
          </div>
        </div>

        <button
          onClick={handleIncrement}
          className="
            w-18 h-18 flex items-center justify-center
            bg-gradient-to-br from-emerald-500 to-green-600
            text-white rounded-2xl text-4xl font-bold
            shadow-[0_4px_15px_-3px_rgba(34,197,94,0.4)]
            transition-all duration-200
            hover:shadow-[0_8px_25px_-5px_rgba(34,197,94,0.5)]
            hover:-translate-y-0.5
            active:scale-95 active:translate-y-0
            touch-feedback
          "
          style={{ width: '72px', height: '72px' }}
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Validate button */}
      <Button onClick={handleValidate} fullWidth size="lg">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20,6 9,17 4,12" />
        </svg>
        Valider la serie
      </Button>
    </Card>
  )
}
