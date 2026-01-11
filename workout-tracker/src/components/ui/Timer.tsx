import { useState, useEffect, useRef } from 'react'

interface TimerProps {
  seconds: number
  onComplete?: () => void
  autoStart?: boolean
}

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    setTimeout(() => {
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()

      osc2.connect(gain2)
      gain2.connect(audioContext.destination)

      osc2.frequency.setValueAtTime(1320, audioContext.currentTime)
      osc2.type = 'sine'

      gain2.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      osc2.start(audioContext.currentTime)
      osc2.stop(audioContext.currentTime + 0.5)
    }, 150)
  } catch (error) {
    console.log('Audio non supporte:', error)
  }
}

const vibrateDevice = () => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  } catch (error) {
    console.log('Vibration non supportee:', error)
  }
}

export default function Timer({ seconds, onComplete, autoStart = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const hasNotified = useRef(false)

  useEffect(() => {
    setTimeLeft(seconds)
    hasNotified.current = false
    if (autoStart) {
      setIsRunning(true)
    }
  }, [seconds, autoStart])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          if (!hasNotified.current) {
            hasNotified.current = true
            playNotificationSound()
            vibrateDevice()
          }
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
  const isComplete = timeLeft === 0
  const circumference = 2 * Math.PI * 58

  const toggleTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(!isRunning)
    } else {
      setTimeLeft(seconds)
      setIsRunning(true)
    }
  }

  return (
    <div className="flex flex-col items-center py-6">
      {/* Progress circle with glow */}
      <div className="relative w-40 h-40">
        {/* Glow effect */}
        <div
          className={`
            absolute inset-0 rounded-full blur-xl transition-opacity duration-500
            ${isComplete ? 'bg-emerald-500/30' : 'bg-energy-500/20'}
            ${isRunning ? 'opacity-100 animate-pulse-glow' : 'opacity-50'}
          `}
        />

        {/* SVG Ring */}
        <svg className="relative w-40 h-40 progress-ring" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r="58"
            fill="none"
            strokeWidth="4"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r="58"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={`
              progress-ring-circle
              ${isComplete ? 'stroke-emerald-500' : 'stroke-energy-500'}
            `}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference * (1 - percentage / 100),
            }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className={`
                text-4xl font-display font-bold tracking-tight
                ${isComplete ? 'text-emerald-500' : 'text-gray-800 dark:text-white'}
              `}
            >
              {minutes}:{remainingSeconds.toString().padStart(2, '0')}
            </div>
            {isComplete && (
              <div className="text-emerald-500 text-sm font-semibold mt-1 animate-fade-in">
                Repos termine!
              </div>
            )}
            {!isComplete && !isRunning && timeLeft < seconds && (
              <div className="text-gray-400 text-xs font-medium mt-1">
                En pause
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control button */}
      <button
        onClick={toggleTimer}
        className={`
          mt-6 px-8 py-3 rounded-xl font-bold text-white
          transition-all duration-300 transform
          active:scale-95 touch-feedback
          ${isComplete
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_4px_15px_-3px_rgba(34,197,94,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(34,197,94,0.5)]'
            : 'btn-energy'
          }
          hover:-translate-y-0.5
        `}
      >
        <span className="flex items-center gap-2">
          {isComplete ? (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Recommencer
            </>
          ) : isRunning ? (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Demarrer
            </>
          )}
        </span>
      </button>
    </div>
  )
}
