import { createContext, useContext, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Exercise, Program, Session, CardioSession } from '../types'
import { generateId } from '../utils/id'
import { getCurrentDate } from '../utils/date'

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

  // Helpers
  getSessionsByExercise: (exerciseId: string) => Session[]
  getLastSession: (exerciseId: string, programId: string) => Session | undefined
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

  const value = useMemo<WorkoutContextType>(() => ({
    exercises,
    programs,
    sessions,
    cardioSessions,
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
    getSessionsByExercise,
    getLastSession,
  }), [
    exercises,
    programs,
    sessions,
    cardioSessions,
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
    getSessionsByExercise,
    getLastSession,
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
