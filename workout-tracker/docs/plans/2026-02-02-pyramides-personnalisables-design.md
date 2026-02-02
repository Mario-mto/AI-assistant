# Design : Pyramides Personnalisables

## Objectif

Permettre de configurer les pyramides avec :
- Direction : montée, descente, ou les deux
- Répétition de départ personnalisable
- Configuration par défaut dans le programme, modifiable au lancement

## Modèle de données

Nouveaux champs optionnels dans `Program` (`src/types/index.ts`) :

```typescript
interface Program {
  // ... champs existants

  pyramidDirection?: 'ascending' | 'descending' | 'both'
  pyramidStartRep?: number  // 1 par défaut
}
```

**Comportement :**
- Champs actifs uniquement si `defaultRepsPattern === 'pyramid'`
- `pyramidDirection` : défaut = `'both'` (comportement actuel)
- `pyramidStartRep` : défaut = `1` (comportement actuel)
- Le goal de l'exercice reste la valeur max

**Exemples de patterns (goal=8, start=3) :**

| Direction | Pattern | Séries | Rep max |
|-----------|---------|--------|---------|
| ascending | 3,4,5,6,7,8 | 6 | 8 |
| descending | 8,7,6,5,4,3 | 6 | 8 |
| both | 3,4,5,6,7,8,7,6,5,4,3 | 11 | 8 |

## Modifications UI

### 1. Formulaire Programme (`ProgramForm.tsx`)

Quand `defaultRepsPattern === 'pyramid'`, afficher :

- **Direction** : Select avec 3 options
  - "Montée" (ascending)
  - "Descente" (descending)
  - "Montée + Descente" (both) - défaut

- **Répétition de départ** : Input number (min=1)

### 2. Lancement séance (`ActiveSession.tsx`)

Quand programme pyramide sélectionné, afficher :

- Direction (select, pré-rempli depuis programme)
- Rep de départ (input, pré-rempli depuis programme)
- Aperçu dynamique : "8 séries : 3→8→3 (max: 8 reps)"

Ces valeurs sont locales à la séance (ne modifient pas le programme).

## Modifications Code

### 1. Utilitaires (`src/utils/defaultReps.ts`)

Adapter les signatures :

```typescript
function generatePyramidPattern(
  goal: number,
  direction: 'ascending' | 'descending' | 'both' = 'both',
  startRep: number = 1
): number[]

function getPyramidTotalSets(
  goal: number,
  direction: 'ascending' | 'descending' | 'both' = 'both',
  startRep: number = 1
): number

function getPyramidPosition(
  setIndex: number,
  goal: number,
  direction: 'ascending' | 'descending' | 'both' = 'both',
  startRep: number = 1
): PyramidPosition

function isPyramidComplete(
  completedSets: number,
  goal: number,
  direction: 'ascending' | 'descending' | 'both' = 'both',
  startRep: number = 1
): boolean
```

### 2. Fichiers à modifier

| Fichier | Changement |
|---------|------------|
| `src/types/index.ts` | Ajouter `pyramidDirection`, `pyramidStartRep` à Program |
| `src/utils/defaultReps.ts` | Adapter toutes les fonctions pyramide |
| `src/components/config/ProgramForm.tsx` | Champs direction + startRep |
| `src/pages/ActiveSession.tsx` | État local pyramide, UI au setup |
| `src/components/session/PyramidProgress.tsx` | Props direction + startRep |

### 3. Tests

Ajouter dans `src/utils/__tests__/defaultReps.test.ts` :

- `generatePyramidPattern` avec chaque direction
- Différentes valeurs de startRep
- Cas limites : startRep = goal, startRep = 1
- `getPyramidTotalSets` pour chaque combinaison
- `isPyramidComplete` avec nouveaux params

## Rétrocompatibilité

Les valeurs par défaut (`direction='both'`, `startRep=1`) reproduisent le comportement actuel. Les programmes existants fonctionnent sans modification.
