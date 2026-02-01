import { generatePyramidPattern, getPyramidPosition } from '../../utils/defaultReps'
import type { PyramidPhase } from '../../utils/defaultReps'

interface PyramidProgressProps {
  currentSetIndex: number
  goal: number
}

const phaseLabels: Record<PyramidPhase, string> = {
  ascending: 'Montee',
  peak: 'Sommet',
  descending: 'Descente',
  complete: 'Termine'
}

const phaseColors: Record<PyramidPhase, string> = {
  ascending: 'text-energy-600 dark:text-energy-400',
  peak: 'text-volt-600 dark:text-volt-400',
  descending: 'text-emerald-600 dark:text-emerald-400',
  complete: 'text-gray-500'
}

export default function PyramidProgress({ currentSetIndex, goal }: PyramidProgressProps) {
  const position = getPyramidPosition(currentSetIndex, goal)
  const pattern = generatePyramidPattern(goal)

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
      {/* Phase indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className={`font-bold ${phaseColors[position.phase]}`}>
          {phaseLabels[position.phase]}
        </span>
        <span className="text-sm text-gray-500">
          {position.currentSet} / {position.totalSets}
        </span>
      </div>

      {/* Visual pyramid */}
      <div className="flex items-end justify-center gap-1 h-16">
        {pattern.map((reps, idx) => {
          const isCompleted = idx < currentSetIndex
          const isCurrent = idx === currentSetIndex
          const height = (reps / goal) * 100

          return (
            <div
              key={idx}
              className={`
                w-3 rounded-t transition-all duration-300
                ${isCompleted
                  ? 'bg-emerald-500'
                  : isCurrent
                    ? 'bg-energy-500 animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
              style={{ height: `${height}%` }}
              title={`Set ${idx + 1}: ${reps} reps`}
            />
          )
        })}
      </div>

      {/* Reps remaining info */}
      {position.phase !== 'complete' && (
        <div className="mt-3 text-center text-sm text-gray-500">
          {position.setsRemaining} serie{position.setsRemaining > 1 ? 's' : ''} restante{position.setsRemaining > 1 ? 's' : ''}
        </div>
      )}

      {position.phase === 'complete' && (
        <div className="mt-3 text-center text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
          Pyramide complete!
        </div>
      )}
    </div>
  )
}
