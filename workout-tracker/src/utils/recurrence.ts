import type { PlannedSession, RecurrenceType } from '../types'

/**
 * Add days to a date string
 */
function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Add months to a date string
 */
function addMonths(dateStr: string, months: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setMonth(date.getMonth() + months)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Get the next occurrence date based on recurrence type
 */
export function getNextOccurrence(dateStr: string, recurrenceType: RecurrenceType): string | null {
  switch (recurrenceType) {
    case 'daily':
      return addDays(dateStr, 1)
    case 'weekly':
      return addDays(dateStr, 7)
    case 'monthly':
      return addMonths(dateStr, 1)
    default:
      return null
  }
}

/**
 * Expand recurring sessions into individual occurrences within a date range
 */
export function expandRecurringSessions(
  sessions: PlannedSession[],
  startDate: string,
  endDate: string
): PlannedSession[] {
  const expanded: PlannedSession[] = []

  for (const session of sessions) {
    if (session.recurrenceType === 'none') {
      // Non-recurring: include if within range
      if (session.date >= startDate && session.date <= endDate) {
        expanded.push(session)
      }
      continue
    }

    // Recurring session: generate occurrences
    let currentDate = session.date
    const recurrenceEnd = session.recurrenceEndDate || endDate
    const excludedSet = new Set(session.excludedDates || [])

    while (currentDate <= endDate && currentDate <= recurrenceEnd) {
      if (currentDate >= startDate && !excludedSet.has(currentDate)) {
        expanded.push({
          ...session,
          date: currentDate,
        })
      }

      const next = getNextOccurrence(currentDate, session.recurrenceType)
      if (!next) break
      currentDate = next
    }
  }

  return expanded.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get sessions for a specific date
 */
export function getSessionsForDate(
  sessions: PlannedSession[],
  date: string
): PlannedSession[] {
  return expandRecurringSessions(sessions, date, date)
}
