import { useState, useEffect } from 'react'

interface TimerProps {
  seconds: number
  onComplete?: () => void
  autoStart?: boolean
}

export default function Timer({ seconds, onComplete, autoStart = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [isRunning, setIsRunning] = useState(autoStart)

  // Reset timer quand les secondes changent
  useEffect(() => {
    setTimeLeft(seconds)
    if (autoStart) {
      setIsRunning(true)
    }
  }, [seconds, autoStart])

  // Countdown logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, onComplete])

  const minutes = Math.floor(timeLeft / 60)
  const remainingSeconds = timeLeft % 60
  const percentage = (timeLeft / seconds) * 100

  const toggleTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(!isRunning)
    } else {
      // Reset
      setTimeLeft(seconds)
      setIsRunning(true)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress circle */}
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke={timeLeft === 0 ? '#10b981' : '#3b82f6'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {minutes}:{remainingSeconds.toString().padStart(2, '0')}
            </div>
            {timeLeft === 0 && <div className="text-green-600 text-sm">Repos terminé!</div>}
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={toggleTimer}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {timeLeft === 0 ? 'Recommencer' : isRunning ? 'Pause' : 'Démarrer'}
      </button>
    </div>
  )
}
