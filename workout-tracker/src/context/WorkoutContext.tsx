import { createContext, useContext, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Exercise, Program, Session, CardioSession, PlannedSession } from '../types'
import { generateId } from '../utils/id'
import { getCurrentDate } from '../utils/date'
import { expandRecurringSessions } from '../utils/recurrence'

/**
 * Shape du contexte Workout
 */
type WorkoutContextType = {
  // État
  exercises: Exercise[]
  programs: Program[]
  sessions: Session[]
  cardioSessions: CardioSession[]

  // CRUD Exercises
  addExercise: (exercise: Omit<Exercise, 'id'>) => void
  updateExercise: (id: string, exercise: Partial<Omit<Exercise, 'id'>>) => void
  deleteExercise: (id: string) => void
  getExercise: (id: string) => Exercise | undefined

  // CRUD Programs
  addProgram: (program: Omit<Program, 'id'>) => void
  updateProgram: (id: string, program: Partial<Omit<Program, 'id'>>) => void
  deleteProgram: (id: string) => void
  getProgram: (id: string) => Program | undefined

  // CRUD Sessions (musculation)
  addSession: (session: Omit<Session, 'id' | 'date'>) => void
  deleteSession: (id: string) => void
  getSession: (id: string) => Session | undefined

  // CRUD Cardio Sessions
  addCardioSession: (session: Omit<CardioSession, 'id' | 'date'>) => void
  deleteCardioSession: (id: string) => void

  // Planned Sessions
  plannedSessions: PlannedSession[]
  addPlannedSession: (session: Omit<PlannedSession, 'id'>) => void
  updatePlannedSession: (id: string, updates: Partial<Omit<PlannedSession, 'id'>>) => void
  deletePlannedSession: (id: string, deleteAll?: boolean) => void
  excludeDateFromRecurrence: (id: string, date: string) => void
  getPlannedSessionsForRange: (startDate: string, endDate: string) => PlannedSession[]

  // Helpers
  getSessionsByExercise: (exerciseId: string) => Session[]
  getLastSession: (exerciseId: string, programId: string) => Session | undefined

  // Import/Export
  exportData: () => string
  importData: (jsonString: string) => boolean
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

/**
 * Provider du contexte Workout
 */
export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('exercises', [])
  const [programs, setPrograms] = useLocalStorage<Program[]>('programs', [])
  const [sessions, setSessions] = useLocalStorage<Session[]>('sessions', [])
  const [cardioSessions, setCardioSessions] = useLocalStorage<CardioSession[]>('cardioSessions', [])
  const [plannedSessions, setPlannedSessions] = useLocalStorage<PlannedSession[]>('plannedSessions', [])

  // ========== EXERCISES ==========

  const addExercise = useCallback((exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: generateId(),
    }
    setExercises((prev) => [...prev, newExercise])
  }, [setExercises])

  const updateExercise = useCallback((id: string, updates: Partial<Omit<Exercise, 'id'>>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    )
  }, [setExercises])

  const deleteExercise = useCallback((id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }, [setExercises])

  const getExercise = useCallback((id: string) => {
    return exercises.find((ex) => ex.id === id)
  }, [exercises])

  // ========== PROGRAMS ==========

  const addProgram = useCallback((program: Omit<Program, 'id'>) => {
    const newProgram: Program = {
      ...program,
      id: generateId(),
    }
    setPrograms((prev) => [...prev, newProgram])
  }, [setPrograms])

  const updateProgram = useCallback((id: string, updates: Partial<Omit<Program, 'id'>>) => {
    setPrograms((prev) =>
      prev.map((prog) => (prog.id === id ? { ...prog, ...updates } : prog))
    )
  }, [setPrograms])

  const deleteProgram = useCallback((id: string) => {
    setPrograms((prev) => prev.filter((prog) => prog.id !== id))
  }, [setPrograms])

  const getProgram = useCallback((id: string) => {
    return programs.find((prog) => prog.id === id)
  }, [programs])

  // ========== SESSIONS ==========

  const addSession = useCallback((session: Omit<Session, 'id' | 'date'>) => {
    const newSession: Session = {
      ...session,
      id: generateId(),
      date: getCurrentDate(),
    }
    setSessions((prev) => [...prev, newSession])
  }, [setSessions])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [setSessions])

  const getSession = useCallback((id: string) => {
    return sessions.find((s) => s.id === id)
  }, [sessions])

  // ========== CARDIO SESSIONS ==========

  const addCardioSession = useCallback((session: Omit<CardioSession, 'id' | 'date'>) => {
    const newSession: CardioSession = {
      ...session,
      id: generateId(),
      date: getCurrentDate(),
    }
    setCardioSessions((prev) => [...prev, newSession])
  }, [setCardioSessions])

  const deleteCardioSession = useCallback((id: string) => {
    setCardioSessions((prev) => prev.filter((s) => s.id !== id))
  }, [setCardioSessions])

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
    return expandRecurringSessions(plannedSessions, startDate, endDate)
  }, [plannedSessions])

  // ========== HELPERS ==========

  const getSessionsByExercise = useCallback((exerciseId: string): Session[] => {
    return sessions
      .filter((s) => s.exerciseId === exerciseId)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [sessions])

  const getLastSession = useCallback((
    exerciseId: string,
    programId: string
  ): Session | undefined => {
    return sessions
      .filter((s) => s.exerciseId === exerciseId && s.programId === programId)
      .sort((a, b) => b.date.localeCompare(a.date))[0]
  }, [sessions])

  // ========== IMPORT/EXPORT ==========

  const exportData = useCallback((): string => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      exercises,
      programs,
      sessions,
      cardioSessions,
      plannedSessions,
    }
    return JSON.stringify(data, null, 2)
  }, [exercises, programs, sessions, cardioSessions, plannedSessions])

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString)
      if (data.exercises) setExercises(data.exercises)
      if (data.programs) setPrograms(data.programs)
      if (data.sessions) setSessions(data.sessions)
      if (data.cardioSessions) setCardioSessions(data.cardioSessions)
      if (data.plannedSessions) setPlannedSessions(data.plannedSessions)
      return true
    } catch {
      return false
    }
  }, [setExercises, setPrograms, setSessions, setCardioSessions, setPlannedSessions])

  const value = useMemo<WorkoutContextType>(() => ({
    exercises,
    programs,
    sessions,
    cardioSessions,
    plannedSessions,
    addExercise,
    updateExercise,
    deleteExercise,
    getExercise,
    addProgram,
    updateProgram,
    deleteProgram,
    getProgram,
    addSession,
    deleteSession,
    getSession,
    addCardioSession,
    deleteCardioSession,
    addPlannedSession,
    updatePlannedSession,
    deletePlannedSession,
    excludeDateFromRecurrence,
    getPlannedSessionsForRange,
    getSessionsByExercise,
    getLastSession,
    exportData,
    importData,
  }), [
    exercises,
    programs,
    sessions,
    cardioSessions,
    plannedSessions,
    addExercise,
    updateExercise,
    deleteExercise,
    getExercise,
    addProgram,
    updateProgram,
    deleteProgram,
    getProgram,
    addSession,
    deleteSession,
    getSession,
    addCardioSession,
    deleteCardioSession,
    addPlannedSession,
    updatePlannedSession,
    deletePlannedSession,
    excludeDateFromRecurrence,
    getPlannedSessionsForRange,
    getSessionsByExercise,
    getLastSession,
    exportData,
    importData,
  ])

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
}

/**
 * Hook pour utiliser le contexte Workout
 * @throws Error si utilisé hors du WorkoutProvider
 */
export function useWorkout() {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}
