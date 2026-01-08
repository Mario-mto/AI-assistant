import type { Exercise } from '../../types'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ExerciseListProps {
  exercises: Exercise[]
  onEdit: (exercise: Exercise) => void
  onDelete: (exercise: Exercise) => void
}

export default function ExerciseList({
  exercises,
  onEdit,
  onDelete,
}: ExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Aucun exercice. Commence par en ajouter un !
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {exercises.map((exercise) => (
        <Card key={exercise.id} className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{exercise.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Objectif : {exercise.goal} reps</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => onEdit(exercise)}
              className="text-sm px-3 py-1"
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              onClick={() => onDelete(exercise)}
              className="text-sm px-3 py-1"
            >
              Supprimer
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
