import { describe, it, expect } from 'vitest'
import {
  generatePyramidPattern,
  getPyramidTotalSets,
  isPyramidComplete,
  getPyramidPosition
} from '../defaultReps'

describe('generatePyramidPattern', () => {
  it('generates correct pattern for goal 5', () => {
    expect(generatePyramidPattern(5)).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1])
  })

  it('generates correct pattern for goal 3', () => {
    expect(generatePyramidPattern(3)).toEqual([1, 2, 3, 2, 1])
  })

  it('generates ascending pattern with startRep', () => {
    expect(generatePyramidPattern(8, 'ascending', 3)).toEqual([3, 4, 5, 6, 7, 8])
  })

  it('generates descending pattern with startRep', () => {
    expect(generatePyramidPattern(8, 'descending', 3)).toEqual([8, 7, 6, 5, 4, 3])
  })

  it('generates both pattern with startRep', () => {
    expect(generatePyramidPattern(8, 'both', 3)).toEqual([3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3])
  })

  it('defaults to both direction starting at 1', () => {
    expect(generatePyramidPattern(5)).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1])
  })
})

describe('getPyramidTotalSets', () => {
  it('returns correct total for goal 5', () => {
    expect(getPyramidTotalSets(5)).toBe(9)
  })
})

describe('isPyramidComplete', () => {
  it('returns false when not all sets done', () => {
    expect(isPyramidComplete(4, 5)).toBe(false)
  })

  it('returns true when all sets done', () => {
    expect(isPyramidComplete(9, 5)).toBe(true)
  })

  it('returns true when exceeded', () => {
    expect(isPyramidComplete(10, 5)).toBe(true)
  })
})

describe('getPyramidPosition', () => {
  it('returns ascending phase info', () => {
    const pos = getPyramidPosition(2, 5)
    expect(pos.phase).toBe('ascending')
    expect(pos.currentReps).toBe(3)
    expect(pos.totalSets).toBe(9)
    expect(pos.currentSet).toBe(3)
  })

  it('returns peak info', () => {
    const pos = getPyramidPosition(4, 5)
    expect(pos.phase).toBe('peak')
    expect(pos.currentReps).toBe(5)
  })

  it('returns descending phase info', () => {
    const pos = getPyramidPosition(6, 5)
    expect(pos.phase).toBe('descending')
    expect(pos.currentReps).toBe(3)
  })

  it('returns complete when past pattern', () => {
    const pos = getPyramidPosition(9, 5)
    expect(pos.phase).toBe('complete')
  })
})
