import { describe, it, expect } from 'vitest'
import { expandRecurringSessions, getNextOccurrence } from '../recurrence'
import type { PlannedSession } from '../../types'

describe('expandRecurringSessions', () => {
  const baseSession: PlannedSession = {
    id: '1',
    exerciseId: 'ex1',
    programId: 'prog1',
    date: '2026-02-01',
    recurrenceType: 'none',
  }

  it('returns single session for non-recurring', () => {
    const sessions = [baseSession]
    const result = expandRecurringSessions(sessions, '2026-02-01', '2026-02-28')
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2026-02-01')
  })

  it('expands weekly recurrence', () => {
    const recurring: PlannedSession = {
      ...baseSession,
      recurrenceType: 'weekly',
      recurrenceEndDate: '2026-02-28',
    }
    const result = expandRecurringSessions([recurring], '2026-02-01', '2026-02-28')
    expect(result).toHaveLength(4) // Feb 1, 8, 15, 22
    expect(result.map(s => s.date)).toEqual(['2026-02-01', '2026-02-08', '2026-02-15', '2026-02-22'])
  })

  it('expands daily recurrence', () => {
    const recurring: PlannedSession = {
      ...baseSession,
      recurrenceType: 'daily',
      recurrenceEndDate: '2026-02-05',
    }
    const result = expandRecurringSessions([recurring], '2026-02-01', '2026-02-10')
    expect(result).toHaveLength(5) // Feb 1-5
  })

  it('expands monthly recurrence', () => {
    const recurring: PlannedSession = {
      ...baseSession,
      date: '2026-01-15',
      recurrenceType: 'monthly',
      recurrenceEndDate: '2026-04-15',
    }
    const result = expandRecurringSessions([recurring], '2026-01-01', '2026-04-30')
    expect(result).toHaveLength(4) // Jan 15, Feb 15, Mar 15, Apr 15
  })

  it('respects excluded dates', () => {
    const recurring: PlannedSession = {
      ...baseSession,
      recurrenceType: 'weekly',
      recurrenceEndDate: '2026-02-28',
      excludedDates: ['2026-02-08'],
    }
    const result = expandRecurringSessions([recurring], '2026-02-01', '2026-02-28')
    expect(result).toHaveLength(3) // Feb 1, 15, 22 (8 excluded)
  })

  it('only returns sessions within range', () => {
    const recurring: PlannedSession = {
      ...baseSession,
      recurrenceType: 'weekly',
      recurrenceEndDate: '2026-03-31',
    }
    const result = expandRecurringSessions([recurring], '2026-02-10', '2026-02-20')
    expect(result).toHaveLength(1) // Only Feb 15 in range
    expect(result[0].date).toBe('2026-02-15')
  })
})

describe('getNextOccurrence', () => {
  it('returns next day for daily', () => {
    expect(getNextOccurrence('2026-02-01', 'daily')).toBe('2026-02-02')
  })

  it('returns next week for weekly', () => {
    expect(getNextOccurrence('2026-02-01', 'weekly')).toBe('2026-02-08')
  })

  it('returns next month for monthly', () => {
    expect(getNextOccurrence('2026-02-15', 'monthly')).toBe('2026-03-15')
  })

  it('returns null for none', () => {
    expect(getNextOccurrence('2026-02-01', 'none')).toBeNull()
  })
})
