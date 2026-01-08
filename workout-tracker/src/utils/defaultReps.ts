import type { Program, Session } from '../types'

/**
 * Génère un pattern pyramidal basé sur un goal
 * Ex: goal=5 -> [1, 2, 3, 4, 5, 4, 3, 2, 1]
 *
 * @param goal - Valeur max du pattern
 * @returns number[] - Pattern pyramidal
 */
export function generatePyramidPattern(goal: number): number[] {
  const ascending = Array.from({ length: goal }, (_, i) => i + 1)
  const descending = Array.from({ length: goal - 1 }, (_, i) => goal - i - 1)
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
 * @returns number - Nombre de séries dans le pattern complet
 */
export function getPyramidTotalSets(goal: number): number {
  return goal * 2 - 1
}
