import type { Program, Session, PyramidDirection } from '../types'

/**
 * Generates a pyramid pattern based on goal, direction, and start rep
 */
export function generatePyramidPattern(
  goal: number,
  direction: PyramidDirection = 'both',
  startRep: number = 1
): number[] {
  const clampedStart = Math.max(1, Math.min(startRep, goal))

  if (direction === 'ascending') {
    return Array.from({ length: goal - clampedStart + 1 }, (_, i) => clampedStart + i)
  }

  if (direction === 'descending') {
    return Array.from({ length: goal - clampedStart + 1 }, (_, i) => goal - i)
  }

  // 'both' - ascending then descending back to start
  const ascending = Array.from({ length: goal - clampedStart + 1 }, (_, i) => clampedStart + i)
  const descending = Array.from({ length: goal - clampedStart }, (_, i) => goal - i - 1)
  return [...ascending, ...descending]
}

/**
 * Calcule les reps par défaut pour une série donnée
 *
 * @param program - Programme utilisé
 * @param setIndex - Index de la série (0-based)
 * @param exerciseGoal - Objectif de l'exercice
 * @param lastSession - Dernière session de l'exercice (optionnel, pour pattern 'lastPerf')
 * @returns number - Nombre de reps suggéré
 */
export function getDefaultReps(
  program: Program,
  setIndex: number,
  exerciseGoal: number,
  lastSession?: Session
): number {
  switch (program.defaultRepsPattern) {
    case 'pyramid': {
      const pattern = generatePyramidPattern(exerciseGoal)
      // Si l'index dépasse le pattern, on boucle
      return pattern[setIndex % pattern.length]
    }

    case 'fixed': {
      return program.fixedReps ?? exerciseGoal
    }

    case 'lastPerf': {
      // Si pas de dernière session, on utilise le goal
      if (!lastSession || !lastSession.sets[setIndex]) {
        return exerciseGoal
      }
      return lastSession.sets[setIndex]
    }

    default:
      return exerciseGoal
  }
}

/**
 * Calcule le nombre total de séries pour un pattern pyramidal
 *
 * @param goal - Valeur max du pattern
 * @param direction - Direction of the pyramid (ascending, descending, both)
 * @param startRep - Starting rep count (default 1)
 * @returns number - Nombre de séries dans le pattern complet
 */
export function getPyramidTotalSets(
  goal: number,
  direction: PyramidDirection = 'both',
  startRep: number = 1
): number {
  const clampedStart = Math.max(1, Math.min(startRep, goal))
  const steps = goal - clampedStart + 1

  if (direction === 'ascending' || direction === 'descending') {
    return steps
  }

  // 'both': up + down - 1 (don't count peak twice)
  return steps * 2 - 1
}

export type PyramidPhase = 'ascending' | 'peak' | 'descending' | 'complete'

export interface PyramidPosition {
  phase: PyramidPhase
  currentReps: number
  currentSet: number
  totalSets: number
  setsRemaining: number
}

/**
 * Check if a pyramid pattern is complete
 */
export function isPyramidComplete(
  completedSets: number,
  goal: number,
  direction: PyramidDirection = 'both',
  startRep: number = 1
): boolean {
  return completedSets >= getPyramidTotalSets(goal, direction, startRep)
}

/**
 * Get current position in pyramid pattern
 */
export function getPyramidPosition(setIndex: number, goal: number): PyramidPosition {
  const totalSets = getPyramidTotalSets(goal)
  const pattern = generatePyramidPattern(goal)

  if (setIndex >= totalSets) {
    return {
      phase: 'complete',
      currentReps: 0,
      currentSet: totalSets + 1,
      totalSets,
      setsRemaining: 0
    }
  }

  const currentReps = pattern[setIndex]
  const peakIndex = goal - 1

  let phase: PyramidPhase
  if (setIndex < peakIndex) {
    phase = 'ascending'
  } else if (setIndex === peakIndex) {
    phase = 'peak'
  } else {
    phase = 'descending'
  }

  return {
    phase,
    currentReps,
    currentSet: setIndex + 1,
    totalSets,
    setsRemaining: totalSets - setIndex - 1
  }
}
