import { useEffect, useRef } from 'react'

interface EmomTimerProps {
  timeLeft: number
  totalSeconds: number
  isWorkPhase: boolean
  isRunning: boolean
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

export default function EmomTimer({
  timeLeft,
  totalSeconds,
  isWorkPhase,
  isRunning
}: EmomTimerProps) {
  const hasNotifiedRef = useRef(false)
  const prevTimeLeftRef = useRef(timeLeft)

  // Notify when minute resets (timeLeft jumps back up)
  useEffect(() => {
    if (timeLeft > prevTimeLeftRef.current && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true
      playNotificationSound()
      vibrateDevice()
      setTimeout(() => {
        hasNotifiedRef.current = false
      }, 1000)
    }
    prevTimeLeftRef.current = timeLeft
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const percentage = (timeLeft / totalSeconds) * 100
  const circumference = 2 * Math.PI * 58

  return (
    <div className="flex flex-col items-center py-4">
      {/* Phase indicator */}
      <div className={`
        px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-4
        ${isWorkPhase
          ? 'bg-energy-500/20 text-energy-600 dark:text-energy-400'
          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }
      `}>
        {isWorkPhase ? 'GO! Fais tes reps' : 'Repos'}
      </div>

      {/* Progress circle */}
      <div className="relative w-36 h-36">
        {/* Glow effect */}
        <div
          className={`
            absolute inset-0 rounded-full blur-xl transition-all duration-500
            ${isWorkPhase ? 'bg-energy-500/30' : 'bg-emerald-500/30'}
            ${isRunning ? 'opacity-100 animate-pulse-glow' : 'opacity-50'}
          `}
        />

        {/* SVG Ring */}
        <svg className="relative w-36 h-36 progress-ring" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="58"
            fill="none"
            strokeWidth="4"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <circle
            cx="60"
            cy="60"
            r="58"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={`
              progress-ring-circle transition-colors duration-300
              ${isWorkPhase ? 'stroke-energy-500' : 'stroke-emerald-500'}
            `}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference * (1 - percentage / 100),
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`
              text-3xl font-display font-bold tracking-tight
              ${isWorkPhase ? 'text-energy-600 dark:text-energy-400' : 'text-emerald-600 dark:text-emerald-400'}
            `}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              EMOM
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
