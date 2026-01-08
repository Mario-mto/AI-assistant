import { useState } from 'react'
import Button from '../ui/Button'

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Série #{setNumber}
      </h2>

      {/* Gros boutons +1/-1 */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <button
          onClick={handleDecrement}
          className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full text-4xl font-bold transition-colors active:scale-95"
        >
          -
        </button>

        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600">{reps}</div>
          <div className="text-sm text-gray-500 mt-2">répétitions</div>
        </div>

        <button
          onClick={handleIncrement}
          className="w-20 h-20 bg-green-500 hover:bg-green-600 text-white rounded-full text-4xl font-bold transition-colors active:scale-95"
        >
          +
        </button>
      </div>

      {/* Bouton valider */}
      <Button onClick={handleValidate} fullWidth className="text-lg py-4">
        Valider la série
      </Button>
    </div>
  )
}
