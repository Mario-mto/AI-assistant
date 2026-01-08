import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Exercise, Program, Session } from '../types'
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

  // CRUD Sessions
  addSession: (session: Omit<Session, 'id' | 'date'>) => void
  deleteSession: (id: string) => void
  getSession: (id: string) => Session | undefined

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

  // ========== EXERCISES ==========

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: generateId(),
    }
    setExercises((prev) => [...prev, newExercise])
  }

  const updateExercise = (id: string, updates: Partial<Omit<Exercise, 'id'>>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    )
  }

  const deleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
    // Note: on pourrait aussi supprimer les sessions liées
  }

  const getExercise = (id: string) => {
    return exercises.find((ex) => ex.id === id)
  }

  // ========== PROGRAMS ==========

  const addProgram = (program: Omit<Program, 'id'>) => {
    const newProgram: Program = {
      ...program,
      id: generateId(),
    }
    setPrograms((prev) => [...prev, newProgram])
  }

  const updateProgram = (id: string, updates: Partial<Omit<Program, 'id'>>) => {
    setPrograms((prev) =>
      prev.map((prog) => (prog.id === id ? { ...prog, ...updates } : prog))
    )
  }

  const deleteProgram = (id: string) => {
    setPrograms((prev) => prev.filter((prog) => prog.id !== id))
  }

  const getProgram = (id: string) => {
    return programs.find((prog) => prog.id === id)
  }

  // ========== SESSIONS ==========

  const addSession = (session: Omit<Session, 'id' | 'date'>) => {
    const newSession: Session = {
      ...session,
      id: generateId(),
      date: getCurrentDate(),
    }
    setSessions((prev) => [...prev, newSession])
  }

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const getSession = (id: string) => {
    return sessions.find((s) => s.id === id)
  }

  // ========== HELPERS ==========

  const getSessionsByExercise = (exerciseId: string): Session[] => {
    return sessions
      .filter((s) => s.exerciseId === exerciseId)
      .sort((a, b) => b.date.localeCompare(a.date)) // Plus récentes en premier
  }

  const getLastSession = (
    exerciseId: string,
    programId: string
  ): Session | undefined => {
    return sessions
      .filter((s) => s.exerciseId === exerciseId && s.programId === programId)
      .sort((a, b) => b.date.localeCompare(a.date))[0]
  }

  const value: WorkoutContextType = {
    exercises,
    programs,
    sessions,
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
    getSessionsByExercise,
    getLastSession,
  }

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
