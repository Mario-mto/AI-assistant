import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Exercise } from '../../types'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface ExerciseFormProps {
  exercise?: Exercise
  onSave: (data: { name: string; goal: number }) => void
  onCancel: () => void
}

export default function ExerciseForm({
  exercise,
  onSave,
  onCancel,
}: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '')
  const [goal, setGoal] = useState(exercise?.goal?.toString() || '')
  const [errors, setErrors] = useState<{ name?: string; goal?: string }>({})

  const validate = (): boolean => {
    const newErrors: { name?: string; goal?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    const goalNum = parseInt(goal)
    if (!goal || isNaN(goalNum) || goalNum <= 0) {
      newErrors.goal = 'L\'objectif doit être un nombre supérieur à 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (validate()) {
      onSave({
        name: name.trim(),
        goal: parseInt(goal),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nom de l'exercice"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Ex: Tractions"
        autoFocus
      />

      <Input
        label="Objectif (reps)"
        type="number"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        error={errors.goal}
        placeholder="Ex: 10"
        min="1"
      />

      <div className="flex gap-3 justify-end mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {exercise ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
