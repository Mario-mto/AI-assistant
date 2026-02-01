import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEmomTimer } from '../useEmomTimer'

describe('useEmomTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct values', () => {
    const { result } = renderHook(() => useEmomTimer(60))

    expect(result.current.timeLeft).toBe(60)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isWorkPhase).toBe(true)
  })

  it('starts countdown when start() called', () => {
    const { result } = renderHook(() => useEmomTimer(60))

    act(() => {
      result.current.start()
    })

    expect(result.current.isRunning).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.timeLeft).toBe(59)
  })

  it('switches to rest phase when markSetComplete() called', () => {
    const { result } = renderHook(() => useEmomTimer(60))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(15000)
    })

    act(() => {
      result.current.markSetComplete()
    })

    expect(result.current.isWorkPhase).toBe(false)
    expect(result.current.timeLeft).toBe(45)
  })

  it('calls onMinuteComplete when minute ends', () => {
    const onMinuteComplete = vi.fn()
    const { result } = renderHook(() => useEmomTimer(60, onMinuteComplete))

    act(() => {
      result.current.start()
      result.current.markSetComplete()
    })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(onMinuteComplete).toHaveBeenCalledTimes(1)
  })

  it('resets for next minute automatically', () => {
    const onMinuteComplete = vi.fn()
    const { result } = renderHook(() => useEmomTimer(60, onMinuteComplete))

    act(() => {
      result.current.start()
      result.current.markSetComplete()
    })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.timeLeft).toBe(60)
    expect(result.current.isWorkPhase).toBe(true)
  })
})
