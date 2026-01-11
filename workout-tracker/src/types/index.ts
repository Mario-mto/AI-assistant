/**
 * Pattern de répétitions pour un programme
 * - pyramid: pattern pyramidal (ex: 1,2,3,4,5,4,3,2,1)
 * - fixed: nombre fixe de reps par série
 * - lastPerf: basé sur la dernière performance de l'exercice
 */
export type RepsPattern = 'pyramid' | 'fixed' | 'lastPerf'

/**
 * Programme d'entraînement
 */
export type Program = {
  id: string
  name: string
  description?: string
  restSeconds?: number
  emomSeconds?: number
  defaultRepsPattern: RepsPattern
  fixedReps?: number
}

/**
 * Exercice de musculation
 */
export type Exercise = {
  id: string
  name: string
  goal: number
}

/**
 * Séance d'entraînement musculation
 */
export type Session = {
  id: string
  date: string // ISO format: YYYY-MM-DD
  exerciseId: string
  programId: string
  sets: number[] // tableau des reps par série
}

/**
 * Type de cardio
 */
export type CardioType = 'running' | 'cycling' | 'walking'

/**
 * Séance cardio (course, vélo, marche)
 */
export type CardioSession = {
  id: string
  date: string // ISO format: YYYY-MM-DD
  type: CardioType
  duration: number // minutes
  distance: number // kilomètres
  notes?: string
}
