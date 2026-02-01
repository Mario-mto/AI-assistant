import { useState, useEffect, useRef, useCallback } from 'react'

interface UseEmomTimerReturn {
  timeLeft: number
  isRunning: boolean
  isWorkPhase: boolean
  start: () => void
  pause: () => void
  markSetComplete: () => void
  reset: () => void
}

export function useEmomTimer(
  emomSeconds: number,
  onMinuteComplete?: () => void
): UseEmomTimerReturn {
  const [timeLeft, setTimeLeft] = useState(emomSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isWorkPhase, setIsWorkPhase] = useState(true)
  const onMinuteCompleteRef = useRef(onMinuteComplete)

  useEffect(() => {
    onMinuteCompleteRef.current = onMinuteComplete
  }, [onMinuteComplete])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsWorkPhase(true)
          onMinuteCompleteRef.current?.()
          return emomSeconds
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, emomSeconds])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const markSetComplete = useCallback(() => {
    setIsWorkPhase(false)
  }, [])

  const reset = useCallback(() => {
    setTimeLeft(emomSeconds)
    setIsWorkPhase(true)
    setIsRunning(false)
  }, [emomSeconds])

  return {
    timeLeft,
    isRunning,
    isWorkPhase,
    start,
    pause,
    markSetComplete,
    reset
  }
}
