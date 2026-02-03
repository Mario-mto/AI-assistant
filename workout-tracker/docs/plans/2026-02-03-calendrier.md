# Calendrier Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a calendar to plan future workout sessions and view past sessions visually, with recurring session support.

**Architecture:** New PlannedSession type stored in localStorage, recurrence utility generates occurrences dynamically, Calendar page with month/week views, modal for session details/editing.

**Tech Stack:** React, TypeScript, localStorage, react-router-dom

---

## Task 1: Add PlannedSession Types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add types at end of file**

```typescript
/**
 * Type de recurrence pour seances planifiees
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

/**
 * Seance planifiee
 */
export type PlannedSession = {
  id: string
  exerciseId: string
  programId: string
  date: string           // ISO format YYYY-MM-DD
  time?: string          // HH:mm (optionnel)
  notes?: string
  recurrenceType: RecurrenceType
  recurrenceEndDate?: string  // Date de fin si recurrent
  parentId?: string      // Si exception d'une serie recurrente
  excludedDates?: string[] // Dates exclues de la recurrence
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add PlannedSession and RecurrenceType types"
```

---

## Task 2: Create Recurrence Utilities

**Files:**
- Create: `src/utils/recurrence.ts`
- Create: `src/utils/__tests__/recurrence.test.ts`

**Step 1: Write failing tests**

```typescript
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
    expect(result).toHaveLength(2) // Feb 15 only in range? No: Feb 8 and 15
    expect(result.map(s => s.date)).toEqual(['2026-02-15'])
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
```

**Step 2: Run tests to verify they fail**

```bash
npm test
```

**Step 3: Implement recurrence utilities**

```typescript
import type { PlannedSession, RecurrenceType } from '../types'

/**
 * Add days to a date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Add months to a date string
 */
function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
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
          // Mark as occurrence (keep original id for reference)
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
```

**Step 4: Run tests**

```bash
npm test
```

**Step 5: Commit**

```bash
git add src/utils/recurrence.ts src/utils/__tests__/recurrence.test.ts
git commit -m "feat: add recurrence utility functions with tests"
```

---

## Task 3: Update WorkoutContext with PlannedSessions

**Files:**
- Modify: `src/context/WorkoutContext.tsx`

**Step 1: Add imports and state**

Add to imports:
```typescript
import type { Exercise, Program, Session, CardioSession, PlannedSession } from '../types'
```

Add state in WorkoutProvider:
```typescript
const [plannedSessions, setPlannedSessions] = useLocalStorage<PlannedSession[]>('plannedSessions', [])
```

**Step 2: Add type definitions to WorkoutContextType**

```typescript
// Planned Sessions
plannedSessions: PlannedSession[]
addPlannedSession: (session: Omit<PlannedSession, 'id'>) => void
updatePlannedSession: (id: string, updates: Partial<Omit<PlannedSession, 'id'>>) => void
deletePlannedSession: (id: string, deleteAll?: boolean) => void
excludeDateFromRecurrence: (id: string, date: string) => void
getPlannedSessionsForRange: (startDate: string, endDate: string) => PlannedSession[]
```

**Step 3: Implement CRUD functions**

```typescript
// ========== PLANNED SESSIONS ==========

const addPlannedSession = useCallback((session: Omit<PlannedSession, 'id'>) => {
  const newSession: PlannedSession = {
    ...session,
    id: generateId(),
  }
  setPlannedSessions((prev) => [...prev, newSession])
}, [setPlannedSessions])

const updatePlannedSession = useCallback((id: string, updates: Partial<Omit<PlannedSession, 'id'>>) => {
  setPlannedSessions((prev) =>
    prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
  )
}, [setPlannedSessions])

const deletePlannedSession = useCallback((id: string, deleteAll = true) => {
  if (deleteAll) {
    setPlannedSessions((prev) => prev.filter((s) => s.id !== id && s.parentId !== id))
  } else {
    // Just delete this specific session (for exceptions)
    setPlannedSessions((prev) => prev.filter((s) => s.id !== id))
  }
}, [setPlannedSessions])

const excludeDateFromRecurrence = useCallback((id: string, date: string) => {
  setPlannedSessions((prev) =>
    prev.map((s) => {
      if (s.id === id) {
        const excludedDates = [...(s.excludedDates || []), date]
        return { ...s, excludedDates }
      }
      return s
    })
  )
}, [setPlannedSessions])

const getPlannedSessionsForRange = useCallback((startDate: string, endDate: string): PlannedSession[] => {
  // Import at top: import { expandRecurringSessions } from '../utils/recurrence'
  return expandRecurringSessions(plannedSessions, startDate, endDate)
}, [plannedSessions])
```

**Step 4: Add to value and useMemo deps**

Add to value object:
```typescript
plannedSessions,
addPlannedSession,
updatePlannedSession,
deletePlannedSession,
excludeDateFromRecurrence,
getPlannedSessionsForRange,
```

Add to useMemo dependency array the same items.

**Step 5: Update exportData/importData**

In exportData:
```typescript
const data = {
  version: 1,
  exportDate: new Date().toISOString(),
  exercises,
  programs,
  sessions,
  cardioSessions,
  plannedSessions, // Add this
}
```

In importData:
```typescript
if (data.plannedSessions) setPlannedSessions(data.plannedSessions)
```

**Step 6: Commit**

```bash
git add src/context/WorkoutContext.tsx
git commit -m "feat: add PlannedSession CRUD to WorkoutContext"
```

---

## Task 4: Create Calendar Page and Add to Routes

**Files:**
- Create: `src/pages/Calendar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Navigation.tsx`

**Step 1: Create basic Calendar page**

```typescript
import { useState } from 'react'
import Card from '../components/ui/Card'

type ViewMode = 'month' | 'week'

export default function Calendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">
          <span className="gradient-text">Calendrier</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Planifie tes seances
        </p>
      </header>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'month'
              ? 'bg-energy-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Mois
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'week'
              ? 'bg-energy-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Semaine
        </button>
      </div>

      <Card variant="glass">
        <p className="text-center text-gray-500">
          {viewMode === 'month' ? 'Vue mensuelle' : 'Vue hebdomadaire'}
        </p>
        <p className="text-center text-gray-400 text-sm mt-2">
          {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
      </Card>
    </div>
  )
}
```

**Step 2: Add route in App.tsx**

Add import:
```typescript
const Calendar = lazy(() => import('./pages/Calendar'))
```

Add route inside Routes:
```typescript
<Route path="calendar" element={<Calendar />} />
```

**Step 3: Add to Navigation**

Update navItems array:
```typescript
const navItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/session', label: 'Muscu', icon: 'muscle' },
  { to: '/calendar', label: 'Plan', icon: 'calendar' },
  { to: '/cardio', label: 'Cardio', icon: 'run' },
  { to: '/history', label: 'Stats', icon: 'chart' },
  { to: '/config', label: 'Config', icon: 'settings' },
]
```

Add calendar icon:
```typescript
calendar: (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
),
```

**Step 4: Commit**

```bash
git add src/pages/Calendar.tsx src/App.tsx src/components/layout/Navigation.tsx
git commit -m "feat: add Calendar page with route and navigation"
```

---

## Task 5: Create MonthView Component

**Files:**
- Create: `src/components/calendar/MonthView.tsx`
- Modify: `src/pages/Calendar.tsx`

**Step 1: Create MonthView**

```typescript
import { useMemo } from 'react'
import { useWorkout } from '../../context/WorkoutContext'
import DayCell from './DayCell'

interface MonthViewProps {
  currentDate: Date
  onDateClick: (date: string) => void
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function MonthView({ currentDate, onDateClick }: MonthViewProps) {
  const { sessions, getPlannedSessionsForRange } = useWorkout()

  const { days, startDate, endDate } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of month
    const firstDay = new Date(year, month, 1)
    // Last day of month
    const lastDay = new Date(year, month + 1, 0)

    // Start from Monday of the week containing the first day
    const startOffset = (firstDay.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
    const start = new Date(firstDay)
    start.setDate(start.getDate() - startOffset)

    // End on Sunday of the week containing the last day
    const endOffset = (7 - lastDay.getDay()) % 7
    const end = new Date(lastDay)
    end.setDate(end.getDate() + endOffset)

    const days: Date[] = []
    const current = new Date(start)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return {
      days,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }, [currentDate])

  const plannedSessions = useMemo(() => {
    return getPlannedSessionsForRange(startDate, endDate)
  }, [getPlannedSessionsForRange, startDate, endDate])

  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const completed = sessions.filter(s => s.date === dateStr)
    const planned = plannedSessions.filter(s => s.date === dateStr)
    return { completed, planned }
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          const { completed, planned } = getSessionsForDay(date)
          return (
            <DayCell
              key={idx}
              date={date}
              isCurrentMonth={isCurrentMonth(date)}
              isToday={isToday(date)}
              completedCount={completed.length}
              plannedCount={planned.length}
              onClick={() => onDateClick(date.toISOString().split('T')[0])}
            />
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Create DayCell component**

Create `src/components/calendar/DayCell.tsx`:

```typescript
interface DayCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  completedCount: number
  plannedCount: number
  onClick: () => void
}

export default function DayCell({
  date,
  isCurrentMonth,
  isToday,
  completedCount,
  plannedCount,
  onClick,
}: DayCellProps) {
  const day = date.getDate()
  const hasCompleted = completedCount > 0
  const hasPlanned = plannedCount > 0

  return (
    <button
      onClick={onClick}
      className={`
        aspect-square p-1 rounded-lg flex flex-col items-center justify-center
        transition-colors
        ${isCurrentMonth ? '' : 'opacity-40'}
        ${isToday ? 'ring-2 ring-energy-500' : ''}
        hover:bg-gray-100 dark:hover:bg-gray-700
      `}
    >
      <span className={`text-sm ${isToday ? 'font-bold text-energy-600 dark:text-energy-400' : ''}`}>
        {day}
      </span>
      {(hasCompleted || hasPlanned) && (
        <div className="flex gap-0.5 mt-1">
          {hasCompleted && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          {hasPlanned && (
            <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-orange-500' : 'bg-blue-500'}`} />
          )}
        </div>
      )}
    </button>
  )
}
```

**Step 3: Update Calendar.tsx to use MonthView**

Add import:
```typescript
import MonthView from '../components/calendar/MonthView'
```

Replace Card content:
```typescript
{viewMode === 'month' && (
  <MonthView
    currentDate={currentDate}
    onDateClick={(date) => console.log('clicked', date)}
  />
)}
```

**Step 4: Commit**

```bash
git add src/components/calendar/MonthView.tsx src/components/calendar/DayCell.tsx src/pages/Calendar.tsx
git commit -m "feat: add MonthView and DayCell calendar components"
```

---

## Task 6: Create WeekView Component

**Files:**
- Create: `src/components/calendar/WeekView.tsx`
- Modify: `src/pages/Calendar.tsx`

**Step 1: Create WeekView**

```typescript
import { useMemo } from 'react'
import { useWorkout } from '../../context/WorkoutContext'

interface WeekViewProps {
  currentDate: Date
  onDateClick: (date: string) => void
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function WeekView({ currentDate, onDateClick }: WeekViewProps) {
  const { sessions, getPlannedSessionsForRange, getExercise } = useWorkout()

  const { days, startDate, endDate } = useMemo(() => {
    // Get Monday of current week
    const day = currentDate.getDay()
    const diff = (day + 6) % 7 // Days since Monday
    const monday = new Date(currentDate)
    monday.setDate(currentDate.getDate() - diff)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      days.push(d)
    }

    return {
      days,
      startDate: days[0].toISOString().split('T')[0],
      endDate: days[6].toISOString().split('T')[0],
    }
  }, [currentDate])

  const plannedSessions = useMemo(() => {
    return getPlannedSessionsForRange(startDate, endDate)
  }, [getPlannedSessionsForRange, startDate, endDate])

  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const completed = sessions.filter(s => s.date === dateStr)
    const planned = plannedSessions.filter(s => s.date === dateStr)
    return { completed, planned }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-2">
      {days.map((date, idx) => {
        const { completed, planned } = getSessionsForDay(date)
        const dateStr = date.toISOString().split('T')[0]
        const today = isToday(date)

        return (
          <div
            key={idx}
            onClick={() => onDateClick(dateStr)}
            className={`
              p-3 rounded-xl cursor-pointer transition-colors
              ${today ? 'bg-energy-500/10 border border-energy-500/30' : 'bg-gray-100 dark:bg-gray-800'}
              hover:bg-gray-200 dark:hover:bg-gray-700
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {DAYS_OF_WEEK[idx]}
                </span>
                <span className={`text-lg font-bold ${today ? 'text-energy-600 dark:text-energy-400' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
              {today && (
                <span className="text-xs font-semibold text-energy-600 dark:text-energy-400">
                  Aujourd'hui
                </span>
              )}
            </div>

            {/* Sessions list */}
            <div className="space-y-1">
              {completed.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {getExercise(s.exerciseId)?.name || 'Exercice'}
                  </span>
                  <span className="text-xs text-gray-400">({s.sets.length} series)</span>
                </div>
              ))}
              {planned.map((s, i) => (
                <div key={`${s.id}-${i}`} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${today ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <span className="text-gray-600 dark:text-gray-300">
                    {getExercise(s.exerciseId)?.name || 'Exercice'}
                  </span>
                  {s.time && <span className="text-xs text-gray-400">{s.time}</span>}
                </div>
              ))}
              {completed.length === 0 && planned.length === 0 && (
                <p className="text-xs text-gray-400">Aucune seance</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

**Step 2: Update Calendar.tsx**

Add import:
```typescript
import WeekView from '../components/calendar/WeekView'
```

Add WeekView in render:
```typescript
{viewMode === 'week' && (
  <WeekView
    currentDate={currentDate}
    onDateClick={(date) => console.log('clicked', date)}
  />
)}
```

**Step 3: Commit**

```bash
git add src/components/calendar/WeekView.tsx src/pages/Calendar.tsx
git commit -m "feat: add WeekView calendar component"
```

---

## Task 7: Add Navigation Controls to Calendar

**Files:**
- Modify: `src/pages/Calendar.tsx`

**Step 1: Add navigation functions and UI**

```typescript
import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import MonthView from '../components/calendar/MonthView'
import WeekView from '../components/calendar/WeekView'

type ViewMode = 'month' | 'week'

export default function Calendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const navigatePrev = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setDate(newDate.getDate() - 7)
      }
      return newDate
    })
  }

  const navigateNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }
    // Week view: show week range
    const day = currentDate.getDay()
    const diff = (day + 6) % 7
    const monday = new Date(currentDate)
    monday.setDate(currentDate.getDate() - diff)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return `${monday.getDate()} - ${sunday.getDate()} ${sunday.toLocaleDateString('fr-FR', { month: 'long' })}`
  }

  const handleDateClick = (date: string) => {
    console.log('Selected date:', date)
    // TODO: Open modal
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">
          <span className="gradient-text">Calendrier</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Planifie tes seances
        </p>
      </header>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'month'
              ? 'bg-energy-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Mois
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            viewMode === 'week'
              ? 'bg-energy-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Semaine
        </button>
        <button
          onClick={goToToday}
          className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ml-auto"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={navigatePrev}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold capitalize">{formatTitle()}</h2>
        <button
          onClick={navigateNext}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <Card variant="glass">
        {viewMode === 'month' && (
          <MonthView currentDate={currentDate} onDateClick={handleDateClick} />
        )}
        {viewMode === 'week' && (
          <WeekView currentDate={currentDate} onDateClick={handleDateClick} />
        )}
      </Card>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Calendar.tsx
git commit -m "feat: add calendar navigation controls"
```

---

## Task 8: Create PlanSessionForm Component

**Files:**
- Create: `src/components/calendar/PlanSessionForm.tsx`

**Step 1: Create the form**

```typescript
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { PlannedSession, RecurrenceType } from '../../types'
import { useWorkout } from '../../context/WorkoutContext'
import Select from '../ui/Select'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface PlanSessionFormProps {
  date: string
  session?: PlannedSession
  onSave: (data: Omit<PlannedSession, 'id'>) => void
  onCancel: () => void
}

export default function PlanSessionForm({ date, session, onSave, onCancel }: PlanSessionFormProps) {
  const { exercises, programs } = useWorkout()

  const [exerciseId, setExerciseId] = useState(session?.exerciseId || '')
  const [programId, setProgramId] = useState(session?.programId || '')
  const [time, setTime] = useState(session?.time || '')
  const [notes, setNotes] = useState(session?.notes || '')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(session?.recurrenceType || 'none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(session?.recurrenceEndDate || '')

  const exerciseOptions = exercises.map(ex => ({ value: ex.id, label: ex.name }))
  const programOptions = programs.map(p => ({ value: p.id, label: p.name }))
  const recurrenceOptions = [
    { value: 'none', label: 'Pas de recurrence' },
    { value: 'daily', label: 'Tous les jours' },
    { value: 'weekly', label: 'Toutes les semaines' },
    { value: 'monthly', label: 'Tous les mois' },
  ]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!exerciseId || !programId) return

    onSave({
      exerciseId,
      programId,
      date,
      time: time || undefined,
      notes: notes || undefined,
      recurrenceType,
      recurrenceEndDate: recurrenceType !== 'none' ? recurrenceEndDate || undefined : undefined,
    })
  }

  const canSubmit = exerciseId && programId

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-gray-500 mb-4">
        Date: <span className="font-semibold">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </p>

      <Select
        label="Exercice"
        options={[{ value: '', label: 'Choisir un exercice' }, ...exerciseOptions]}
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
      />

      <Select
        label="Programme"
        options={[{ value: '', label: 'Choisir un programme' }, ...programOptions]}
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
      />

      <Input
        label="Heure (optionnel)"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-energy-500"
          rows={2}
          placeholder="Objectif, rappel..."
        />
      </div>

      <Select
        label="Recurrence"
        options={recurrenceOptions}
        value={recurrenceType}
        onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
      />

      {recurrenceType !== 'none' && (
        <Input
          label="Date de fin (optionnel)"
          type="date"
          value={recurrenceEndDate}
          onChange={(e) => setRecurrenceEndDate(e.target.value)}
          min={date}
        />
      )}

      <div className="flex gap-3 justify-end mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {session ? 'Modifier' : 'Planifier'}
        </Button>
      </div>
    </form>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/calendar/PlanSessionForm.tsx
git commit -m "feat: add PlanSessionForm component"
```

---

## Task 9: Create SessionModal Component

**Files:**
- Create: `src/components/calendar/SessionModal.tsx`

**Step 1: Create the modal**

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlannedSession, Session } from '../../types'
import { useWorkout } from '../../context/WorkoutContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import PlanSessionForm from './PlanSessionForm'
import ConfirmModal from '../ui/ConfirmModal'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  completedSessions: Session[]
  plannedSessions: PlannedSession[]
}

type ModalMode = 'view' | 'create' | 'edit'

export default function SessionModal({
  isOpen,
  onClose,
  date,
  completedSessions,
  plannedSessions,
}: SessionModalProps) {
  const navigate = useNavigate()
  const {
    getExercise,
    getProgram,
    addPlannedSession,
    updatePlannedSession,
    deletePlannedSession,
    excludeDateFromRecurrence,
  } = useWorkout()

  const [mode, setMode] = useState<ModalMode>('view')
  const [editingSession, setEditingSession] = useState<PlannedSession | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PlannedSession | null>(null)

  const handleClose = () => {
    setMode('view')
    setEditingSession(null)
    onClose()
  }

  const handleCreate = () => {
    setEditingSession(null)
    setMode('create')
  }

  const handleEdit = (session: PlannedSession) => {
    setEditingSession(session)
    setMode('edit')
  }

  const handleSave = (data: Omit<PlannedSession, 'id'>) => {
    if (editingSession) {
      updatePlannedSession(editingSession.id, data)
    } else {
      addPlannedSession(data)
    }
    setMode('view')
    setEditingSession(null)
  }

  const handleDeleteClick = (session: PlannedSession) => {
    setDeleteTarget(session)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = (deleteAll: boolean) => {
    if (!deleteTarget) return

    if (deleteTarget.recurrenceType !== 'none' && !deleteAll) {
      // Delete only this occurrence
      excludeDateFromRecurrence(deleteTarget.id, date)
    } else {
      // Delete all
      deletePlannedSession(deleteTarget.id, true)
    }

    setShowDeleteConfirm(false)
    setDeleteTarget(null)
  }

  const handleLaunch = (session: PlannedSession) => {
    navigate(`/session?exerciseId=${session.exerciseId}&programId=${session.programId}`)
    handleClose()
  }

  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  if (mode === 'create' || mode === 'edit') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'create' ? 'Planifier une seance' : 'Modifier la seance'}>
        <PlanSessionForm
          date={date}
          session={editingSession || undefined}
          onSave={handleSave}
          onCancel={() => setMode('view')}
        />
      </Modal>
    )
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={formattedDate}>
        {/* Completed sessions */}
        {completedSessions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Completees</h3>
            {completedSessions.map(s => (
              <div key={s.id} className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">{getExercise(s.exerciseId)?.name}</span>
                <span className="text-sm text-gray-500">{s.sets.length} series</span>
              </div>
            ))}
          </div>
        )}

        {/* Planned sessions */}
        {plannedSessions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Planifiees</h3>
            {plannedSessions.map((s, idx) => (
              <div key={`${s.id}-${idx}`} className="p-3 bg-blue-500/10 rounded-lg mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-medium">{getExercise(s.exerciseId)?.name}</span>
                  </div>
                  {s.time && <span className="text-sm text-gray-500">{s.time}</span>}
                </div>
                <p className="text-sm text-gray-500 mb-2">{getProgram(s.programId)?.name}</p>
                {s.notes && <p className="text-sm text-gray-400 italic mb-2">{s.notes}</p>}
                {s.recurrenceType !== 'none' && (
                  <p className="text-xs text-gray-400 mb-2">
                    Recurrence: {s.recurrenceType === 'daily' ? 'quotidienne' : s.recurrenceType === 'weekly' ? 'hebdomadaire' : 'mensuelle'}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleLaunch(s)}>Lancer</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(s)}>Modifier</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteClick(s)}>Supprimer</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {completedSessions.length === 0 && plannedSessions.length === 0 && (
          <p className="text-gray-500 text-center py-4">Aucune seance ce jour</p>
        )}

        <Button fullWidth onClick={handleCreate} className="mt-4">
          + Planifier une seance
        </Button>
      </Modal>

      {/* Delete confirmation for recurring */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleDeleteConfirm(true)}
        title="Supprimer la seance"
        message={
          deleteTarget?.recurrenceType !== 'none'
            ? "Supprimer cette seance recurrente ?"
            : "Supprimer cette seance ?"
        }
        confirmText={deleteTarget?.recurrenceType !== 'none' ? "Toutes les occurrences" : "Supprimer"}
        cancelText={deleteTarget?.recurrenceType !== 'none' ? "Cette occurrence seulement" : "Annuler"}
        onCancelAction={deleteTarget?.recurrenceType !== 'none' ? () => handleDeleteConfirm(false) : undefined}
      />
    </>
  )
}
```

**Step 2: Update ConfirmModal to support custom cancel action**

In `src/components/ui/ConfirmModal.tsx`, add optional `onCancelAction` prop:

```typescript
interface ConfirmModalProps {
  // ... existing props
  onCancelAction?: () => void  // Optional separate action for cancel button
}

// In the cancel button onClick:
onClick={onCancelAction || onClose}
```

**Step 3: Commit**

```bash
git add src/components/calendar/SessionModal.tsx src/components/ui/ConfirmModal.tsx
git commit -m "feat: add SessionModal for viewing/editing planned sessions"
```

---

## Task 10: Integrate SessionModal into Calendar

**Files:**
- Modify: `src/pages/Calendar.tsx`

**Step 1: Add state and modal**

Add imports:
```typescript
import SessionModal from '../components/calendar/SessionModal'
import { useWorkout } from '../context/WorkoutContext'
```

Add state and handler:
```typescript
const { sessions, getPlannedSessionsForRange } = useWorkout()
const [selectedDate, setSelectedDate] = useState<string | null>(null)

const handleDateClick = (date: string) => {
  setSelectedDate(date)
}

const getSessionsForSelectedDate = () => {
  if (!selectedDate) return { completed: [], planned: [] }
  const completed = sessions.filter(s => s.date === selectedDate)
  const planned = getPlannedSessionsForRange(selectedDate, selectedDate)
  return { completed, planned }
}
```

Add modal at end of component:
```typescript
{selectedDate && (() => {
  const { completed, planned } = getSessionsForSelectedDate()
  return (
    <SessionModal
      isOpen={!!selectedDate}
      onClose={() => setSelectedDate(null)}
      date={selectedDate}
      completedSessions={completed}
      plannedSessions={planned}
    />
  )
})()}
```

**Step 2: Commit**

```bash
git add src/pages/Calendar.tsx
git commit -m "feat: integrate SessionModal into Calendar page"
```

---

## Task 11: Update ActiveSession to Read Query Params

**Files:**
- Modify: `src/pages/ActiveSession.tsx`

**Step 1: Add useSearchParams**

Add import:
```typescript
import { useNavigate, useSearchParams } from 'react-router-dom'
```

Add hook and effect:
```typescript
const [searchParams] = useSearchParams()

// Pre-fill from query params (when launched from calendar)
useState(() => {
  const exerciseId = searchParams.get('exerciseId')
  const programId = searchParams.get('programId')
  if (exerciseId) setSelectedExerciseId(exerciseId)
  if (programId) setSelectedProgramId(programId)
})
```

Actually, better approach - use useEffect:

```typescript
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// Inside component, after state declarations:
const [searchParams] = useSearchParams()

useEffect(() => {
  const exerciseId = searchParams.get('exerciseId')
  const programId = searchParams.get('programId')
  if (exerciseId && !selectedExerciseId) setSelectedExerciseId(exerciseId)
  if (programId && !selectedProgramId) setSelectedProgramId(programId)
}, [searchParams])
```

**Step 2: Commit**

```bash
git add src/pages/ActiveSession.tsx
git commit -m "feat: ActiveSession reads query params from calendar launch"
```

---

## Task 12: Final Verification

**Step 1: Run all tests**

```bash
npm test
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Run build**

```bash
npm run build
```

**Step 4: Manual testing checklist**

- [ ] Navigate to Calendar page via navbar
- [ ] Switch between month and week views
- [ ] Navigate prev/next month/week
- [ ] Click on empty day → create planned session
- [ ] Set recurrence (weekly) and save
- [ ] See recurring sessions appear on calendar
- [ ] Click on day with session → see modal
- [ ] Edit a planned session
- [ ] Delete single occurrence of recurring session
- [ ] Delete all occurrences of recurring session
- [ ] Click "Lancer" → goes to ActiveSession with pre-filled values
- [ ] Completed sessions show in green on calendar

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues from manual testing"
```
