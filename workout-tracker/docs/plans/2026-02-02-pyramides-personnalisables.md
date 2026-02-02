# Pyramides Personnalisables - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to customize pyramid workouts with direction (ascending/descending/both) and start rep.

**Architecture:** Add pyramid config fields to Program type, update utility functions to accept direction and startRep params with backwards-compatible defaults, add UI controls in ProgramForm and ActiveSession.

**Tech Stack:** React, TypeScript, Vitest

---

## Task 1: Add PyramidDirection Type

**Files:**
- Modify: `src/types/index.ts:7`

**Step 1: Add the type**

Add after `RepsPattern` type (line 7):

```typescript
export type PyramidDirection = 'ascending' | 'descending' | 'both'
```

**Step 2: Add fields to Program**

Update `Program` type to add optional pyramid fields:

```typescript
export type Program = {
  id: string
  name: string
  description?: string
  restSeconds?: number
  emomSeconds?: number
  defaultRepsPattern: RepsPattern
  fixedReps?: number
  pyramidDirection?: PyramidDirection
  pyramidStartRep?: number
}
```

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add PyramidDirection type and Program fields"
```

---

## Task 2: Update generatePyramidPattern

**Files:**
- Modify: `src/utils/defaultReps.ts:10-14`
- Test: `src/utils/__tests__/defaultReps.test.ts`

**Step 1: Write failing tests**

Add to `defaultReps.test.ts` after existing `generatePyramidPattern` tests:

```typescript
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
```

**Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL - function signature mismatch

**Step 3: Update implementation**

Replace `generatePyramidPattern` function:

```typescript
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
```

**Step 4: Run tests**

```bash
npm test
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/defaultReps.ts src/utils/__tests__/defaultReps.test.ts
git commit -m "feat: add direction and startRep to generatePyramidPattern"
```

---

## Task 3: Update getPyramidTotalSets

**Files:**
- Modify: `src/utils/defaultReps.ts:61-63`
- Test: `src/utils/__tests__/defaultReps.test.ts`

**Step 1: Write failing tests**

Add to `getPyramidTotalSets` describe block:

```typescript
  it('returns correct total for ascending (goal=8, start=3)', () => {
    expect(getPyramidTotalSets(8, 'ascending', 3)).toBe(6)
  })

  it('returns correct total for descending (goal=8, start=3)', () => {
    expect(getPyramidTotalSets(8, 'descending', 3)).toBe(6)
  })

  it('returns correct total for both (goal=8, start=3)', () => {
    expect(getPyramidTotalSets(8, 'both', 3)).toBe(11)
  })

  it('defaults to both with start=1', () => {
    expect(getPyramidTotalSets(5)).toBe(9)
  })
```

**Step 2: Run tests to verify they fail**

```bash
npm test
```

**Step 3: Update implementation**

Replace `getPyramidTotalSets`:

```typescript
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
```

**Step 4: Run tests**

```bash
npm test
```

**Step 5: Commit**

```bash
git add src/utils/defaultReps.ts src/utils/__tests__/defaultReps.test.ts
git commit -m "feat: add direction and startRep to getPyramidTotalSets"
```

---

## Task 4: Update isPyramidComplete

**Files:**
- Modify: `src/utils/defaultReps.ts:78-80`
- Test: `src/utils/__tests__/defaultReps.test.ts`

**Step 1: Write failing tests**

Add to `isPyramidComplete` describe block:

```typescript
  it('works with ascending direction', () => {
    expect(isPyramidComplete(5, 8, 'ascending', 3)).toBe(false)
    expect(isPyramidComplete(6, 8, 'ascending', 3)).toBe(true)
  })

  it('works with descending direction', () => {
    expect(isPyramidComplete(6, 8, 'descending', 3)).toBe(true)
  })

  it('works with both direction', () => {
    expect(isPyramidComplete(10, 8, 'both', 3)).toBe(false)
    expect(isPyramidComplete(11, 8, 'both', 3)).toBe(true)
  })
```

**Step 2: Run tests**

```bash
npm test
```

**Step 3: Update implementation**

Replace `isPyramidComplete`:

```typescript
export function isPyramidComplete(
  completedSets: number,
  goal: number,
  direction: PyramidDirection = 'both',
  startRep: number = 1
): boolean {
  return completedSets >= getPyramidTotalSets(goal, direction, startRep)
}
```

**Step 4: Run tests**

```bash
npm test
```

**Step 5: Commit**

```bash
git add src/utils/defaultReps.ts src/utils/__tests__/defaultReps.test.ts
git commit -m "feat: add direction and startRep to isPyramidComplete"
```

---

## Task 5: Update getPyramidPosition

**Files:**
- Modify: `src/utils/defaultReps.ts:85-118`
- Test: `src/utils/__tests__/defaultReps.test.ts`

**Step 1: Write failing tests**

Add to `getPyramidPosition` describe block:

```typescript
  it('handles ascending direction', () => {
    const pos = getPyramidPosition(2, 8, 'ascending', 3)
    expect(pos.phase).toBe('ascending')
    expect(pos.currentReps).toBe(5)
    expect(pos.totalSets).toBe(6)
  })

  it('handles descending direction at start', () => {
    const pos = getPyramidPosition(0, 8, 'descending', 3)
    expect(pos.phase).toBe('descending')
    expect(pos.currentReps).toBe(8)
  })

  it('handles both direction with startRep', () => {
    const pos = getPyramidPosition(5, 8, 'both', 3)
    expect(pos.phase).toBe('peak')
    expect(pos.currentReps).toBe(8)
    expect(pos.totalSets).toBe(11)
  })

  it('handles both direction descending phase', () => {
    const pos = getPyramidPosition(8, 8, 'both', 3)
    expect(pos.phase).toBe('descending')
    expect(pos.currentReps).toBe(5)
  })
```

**Step 2: Run tests**

```bash
npm test
```

**Step 3: Update implementation**

Replace `getPyramidPosition`:

```typescript
export function getPyramidPosition(
  setIndex: number,
  goal: number,
  direction: PyramidDirection = 'both',
  startRep: number = 1
): PyramidPosition {
  const totalSets = getPyramidTotalSets(goal, direction, startRep)
  const pattern = generatePyramidPattern(goal, direction, startRep)

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

  let phase: PyramidPhase
  if (direction === 'ascending') {
    phase = setIndex === totalSets - 1 ? 'peak' : 'ascending'
  } else if (direction === 'descending') {
    phase = setIndex === 0 ? 'peak' : 'descending'
  } else {
    // 'both'
    const peakIndex = goal - startRep
    if (setIndex < peakIndex) {
      phase = 'ascending'
    } else if (setIndex === peakIndex) {
      phase = 'peak'
    } else {
      phase = 'descending'
    }
  }

  return {
    phase,
    currentReps,
    currentSet: setIndex + 1,
    totalSets,
    setsRemaining: totalSets - setIndex - 1
  }
}
```

**Step 4: Run tests**

```bash
npm test
```

**Step 5: Commit**

```bash
git add src/utils/defaultReps.ts src/utils/__tests__/defaultReps.test.ts
git commit -m "feat: add direction and startRep to getPyramidPosition"
```

---

## Task 6: Update getDefaultReps

**Files:**
- Modify: `src/utils/defaultReps.ts:25-53`

**Step 1: Update implementation**

Update the `getDefaultReps` function pyramid case:

```typescript
export function getDefaultReps(
  program: Program,
  setIndex: number,
  exerciseGoal: number,
  lastSession?: Session
): number {
  switch (program.defaultRepsPattern) {
    case 'pyramid': {
      const direction = program.pyramidDirection ?? 'both'
      const startRep = program.pyramidStartRep ?? 1
      const pattern = generatePyramidPattern(exerciseGoal, direction, startRep)
      return pattern[setIndex % pattern.length]
    }

    case 'fixed': {
      return program.fixedReps ?? exerciseGoal
    }

    case 'lastPerf': {
      if (!lastSession || !lastSession.sets[setIndex]) {
        return exerciseGoal
      }
      return lastSession.sets[setIndex]
    }

    default:
      return exerciseGoal
  }
}
```

**Step 2: Run tests**

```bash
npm test
```

**Step 3: Commit**

```bash
git add src/utils/defaultReps.ts
git commit -m "feat: use pyramid config in getDefaultReps"
```

---

## Task 7: Update ProgramForm

**Files:**
- Modify: `src/components/config/ProgramForm.tsx`

**Step 1: Add imports and state**

Update imports at top:

```typescript
import type { Program, RepsPattern, PyramidDirection } from '../../types'
```

Add state after `fixedReps` state (around line 33):

```typescript
const [pyramidDirection, setPyramidDirection] = useState<PyramidDirection>(
  program?.pyramidDirection || 'both'
)
const [pyramidStartRep, setPyramidStartRep] = useState(
  program?.pyramidStartRep?.toString() || '1'
)
```

**Step 2: Update onSave interface and handleSubmit**

Update `ProgramFormProps` interface:

```typescript
interface ProgramFormProps {
  program?: Program
  onSave: (data: {
    name: string
    description?: string
    restSeconds?: number
    emomSeconds?: number
    defaultRepsPattern: RepsPattern
    fixedReps?: number
    pyramidDirection?: PyramidDirection
    pyramidStartRep?: number
  }) => void
  onCancel: () => void
}
```

Update `handleSubmit` onSave call:

```typescript
onSave({
  name: name.trim(),
  description: description.trim() || undefined,
  restSeconds: restSeconds ? Number(restSeconds) : undefined,
  emomSeconds: emomSeconds ? Number(emomSeconds) : undefined,
  defaultRepsPattern,
  fixedReps:
    defaultRepsPattern === 'fixed' && fixedReps
      ? Number(fixedReps)
      : undefined,
  pyramidDirection:
    defaultRepsPattern === 'pyramid' ? pyramidDirection : undefined,
  pyramidStartRep:
    defaultRepsPattern === 'pyramid' && pyramidStartRep
      ? Number(pyramidStartRep)
      : undefined,
})
```

**Step 3: Add UI fields**

Add after the `fixedReps` conditional block (after line 126), before `restSeconds` Input:

```typescript
{defaultRepsPattern === 'pyramid' && (
  <>
    <Select
      label="Direction de la pyramide"
      options={[
        { value: 'both', label: 'Montee + Descente' },
        { value: 'ascending', label: 'Montee seulement' },
        { value: 'descending', label: 'Descente seulement' },
      ]}
      value={pyramidDirection}
      onChange={(e) => setPyramidDirection(e.target.value as PyramidDirection)}
    />
    <Input
      label="Repetition de depart"
      type="number"
      value={pyramidStartRep}
      onChange={(e) => setPyramidStartRep(e.target.value)}
      placeholder="1"
      min="1"
    />
  </>
)}
```

**Step 4: Run lint and build**

```bash
npm run lint
npm run build
```

**Step 5: Commit**

```bash
git add src/components/config/ProgramForm.tsx
git commit -m "feat: add pyramid direction and startRep to ProgramForm"
```

---

## Task 8: Update ActiveSession Setup

**Files:**
- Modify: `src/pages/ActiveSession.tsx`

**Step 1: Add imports**

Update imports to include:

```typescript
import { getDefaultReps, generatePyramidPattern, getPyramidTotalSets } from '../utils/defaultReps'
import type { PyramidDirection } from '../types'
```

**Step 2: Add local pyramid state**

Add after `showNoSetsAlert` state (around line 29):

```typescript
// Local pyramid config (can override program defaults)
const [sessionPyramidDirection, setSessionPyramidDirection] = useState<PyramidDirection>('both')
const [sessionPyramidStartRep, setSessionPyramidStartRep] = useState(1)
```

**Step 3: Sync state when program changes**

Add effect after state declarations:

```typescript
// Sync pyramid config when program changes
const pyramidDirection = selectedProgram?.pyramidDirection ?? 'both'
const pyramidStartRep = selectedProgram?.pyramidStartRep ?? 1

// Reset local state when program changes
if (selectedProgram && sessionState === 'setup') {
  if (sessionPyramidDirection !== pyramidDirection) {
    setSessionPyramidDirection(pyramidDirection)
  }
  if (sessionPyramidStartRep !== pyramidStartRep) {
    setSessionPyramidStartRep(pyramidStartRep)
  }
}
```

**Step 4: Add pyramid preview helper**

Add after exerciseOptions:

```typescript
// Pyramid preview for setup
const getPyramidPreview = () => {
  if (!selectedExercise || !isPyramidMode) return null
  const total = getPyramidTotalSets(selectedExercise.goal, sessionPyramidDirection, sessionPyramidStartRep)
  const pattern = generatePyramidPattern(selectedExercise.goal, sessionPyramidDirection, sessionPyramidStartRep)
  const first = pattern[0]
  const last = pattern[pattern.length - 1]
  const max = Math.max(...pattern)
  return { total, first, last, max }
}
```

**Step 5: Add pyramid config UI in setup state**

In the setup state JSX, after the program details div (around line 214), add:

```typescript
{selectedProgram?.defaultRepsPattern === 'pyramid' && selectedExercise && (
  <div className="mt-4 p-4 bg-energy-500/10 dark:bg-energy-500/20 rounded-xl border border-energy-500/20">
    <p className="font-semibold text-energy-700 dark:text-energy-300 text-sm uppercase tracking-wide mb-3">
      Configuration Pyramide
    </p>
    <Select
      label="Direction"
      options={[
        { value: 'both', label: 'Montee + Descente' },
        { value: 'ascending', label: 'Montee seulement' },
        { value: 'descending', label: 'Descente seulement' },
      ]}
      value={sessionPyramidDirection}
      onChange={(e) => setSessionPyramidDirection(e.target.value as PyramidDirection)}
    />
    <Input
      label="Repetition de depart"
      type="number"
      value={sessionPyramidStartRep.toString()}
      onChange={(e) => setSessionPyramidStartRep(Math.max(1, Math.min(Number(e.target.value) || 1, selectedExercise.goal)))}
      min="1"
      max={selectedExercise.goal.toString()}
    />
    {(() => {
      const preview = getPyramidPreview()
      if (!preview) return null
      return (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold">{preview.total} series</span>
          {' : '}
          {preview.first} → {preview.max}
          {sessionPyramidDirection === 'both' && ` → ${preview.last}`}
          {' (max: '}{preview.max}{' reps)'}
        </div>
      )
    })()}
  </div>
)}
```

**Step 6: Add Input import**

Add Input to imports if not present:

```typescript
import Input from '../components/ui/Input'
```

**Step 7: Run build**

```bash
npm run build
```

**Step 8: Commit**

```bash
git add src/pages/ActiveSession.tsx
git commit -m "feat: add pyramid config UI to ActiveSession setup"
```

---

## Task 9: Wire Pyramid Config to Session Logic

**Files:**
- Modify: `src/pages/ActiveSession.tsx`

**Step 1: Update isPyramidComplete call**

Update `handleValidateSet` to use session pyramid config:

```typescript
if (isPyramidMode && selectedExercise && isPyramidComplete(
  newCompletedSets.length,
  selectedExercise.goal,
  sessionPyramidDirection,
  sessionPyramidStartRep
)) {
  setShowPyramidComplete(true)
}
```

**Step 2: Update getDefaultRepsForCurrentSet**

Create a modified program for pyramid calculations:

```typescript
const getDefaultRepsForCurrentSet = (): number => {
  if (!selectedProgram || !selectedExercise) return 0
  const lastSession = getLastSession(selectedExerciseId, selectedProgramId)

  // Use session-local pyramid config
  const programWithSessionConfig = isPyramidMode
    ? { ...selectedProgram, pyramidDirection: sessionPyramidDirection, pyramidStartRep: sessionPyramidStartRep }
    : selectedProgram

  return getDefaultReps(programWithSessionConfig, currentSetIndex, selectedExercise.goal, lastSession)
}
```

**Step 3: Run tests and build**

```bash
npm test
npm run build
```

**Step 4: Commit**

```bash
git add src/pages/ActiveSession.tsx
git commit -m "feat: wire pyramid session config to workout logic"
```

---

## Task 10: Update PyramidProgress Component

**Files:**
- Modify: `src/components/session/PyramidProgress.tsx`

**Step 1: Update props interface**

```typescript
import type { PyramidDirection, PyramidPhase } from '../../utils/defaultReps'

interface PyramidProgressProps {
  currentSetIndex: number
  goal: number
  direction?: PyramidDirection
  startRep?: number
}
```

**Step 2: Update component**

```typescript
export default function PyramidProgress({
  currentSetIndex,
  goal,
  direction = 'both',
  startRep = 1
}: PyramidProgressProps) {
  const position = getPyramidPosition(currentSetIndex, goal, direction, startRep)
  const pattern = generatePyramidPattern(goal, direction, startRep)
  // ... rest unchanged
}
```

**Step 3: Export PyramidDirection from defaultReps**

In `src/utils/defaultReps.ts`, the type is imported from types, so re-export it:

```typescript
export type { PyramidDirection } from '../types'
```

**Step 4: Update ActiveSession PyramidProgress usage**

In ActiveSession active state, update the PyramidProgress call:

```typescript
{isPyramidMode && selectedExercise && (
  <Card variant="glass" className="mb-4">
    <PyramidProgress
      currentSetIndex={currentSetIndex}
      goal={selectedExercise.goal}
      direction={sessionPyramidDirection}
      startRep={sessionPyramidStartRep}
    />
  </Card>
)}
```

**Step 5: Run build**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add src/components/session/PyramidProgress.tsx src/utils/defaultReps.ts src/pages/ActiveSession.tsx
git commit -m "feat: pass pyramid config to PyramidProgress component"
```

---

## Task 11: Final Verification

**Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Run build**

```bash
npm run build
```

**Step 4: Manual testing checklist**

- [ ] Create program with pyramid pattern, set direction to "Montee seulement", startRep=3
- [ ] Start session, verify preview shows correct series count
- [ ] Verify PyramidProgress displays correct pattern
- [ ] Change direction at session start, verify it updates
- [ ] Complete pyramid, verify completion modal appears

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address any issues from manual testing"
```
