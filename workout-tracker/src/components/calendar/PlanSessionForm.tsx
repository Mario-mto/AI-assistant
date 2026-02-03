import { useState } from 'react'
import type { FormEvent } from 'react'
import type { PlannedSession, RecurrenceType } from '../../types'
import { useWorkout } from '../../context/WorkoutContext'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface PlanSessionFormProps {
  date: string
  session?: PlannedSession
  onSave: (data: Omit<PlannedSession, 'id'>) => void
  onCancel: () => void
}

export default function PlanSessionForm({
  date,
  session,
  onSave,
  onCancel,
}: PlanSessionFormProps) {
  const { exercises, programs } = useWorkout()

  const [exerciseId, setExerciseId] = useState(session?.exerciseId || exercises[0]?.id || '')
  const [programId, setProgramId] = useState(session?.programId || programs[0]?.id || '')
  const [time, setTime] = useState(session?.time || '')
  const [notes, setNotes] = useState(session?.notes || '')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(session?.recurrenceType || 'none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(session?.recurrenceEndDate || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!exerciseId) {
      newErrors.exerciseId = 'Selectionne un exercice'
    }

    if (!programId) {
      newErrors.programId = 'Selectionne un programme'
    }

    if (recurrenceType !== 'none' && recurrenceEndDate) {
      if (recurrenceEndDate < date) {
        newErrors.recurrenceEndDate = 'La date de fin doit etre apres la date de debut'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (validate()) {
      onSave({
        exerciseId,
        programId,
        date,
        time: time || undefined,
        notes: notes.trim() || undefined,
        recurrenceType,
        recurrenceEndDate: recurrenceType !== 'none' && recurrenceEndDate ? recurrenceEndDate : undefined,
        parentId: session?.parentId,
        excludedDates: session?.excludedDates,
      })
    }
  }

  const exerciseOptions = exercises.map(e => ({
    value: e.id,
    label: e.name,
  }))

  const programOptions = programs.map(p => ({
    value: p.id,
    label: p.name,
  }))

  const recurrenceOptions = [
    { value: 'none', label: 'Pas de recurrence' },
    { value: 'daily', label: 'Tous les jours' },
    { value: 'weekly', label: 'Toutes les semaines' },
    { value: 'monthly', label: 'Tous les mois' },
  ]

  if (exercises.length === 0 || programs.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 mb-4">
          {exercises.length === 0 && programs.length === 0
            ? 'Cree d\'abord des exercices et programmes dans la configuration.'
            : exercises.length === 0
            ? 'Cree d\'abord un exercice dans la configuration.'
            : 'Cree d\'abord un programme dans la configuration.'}
        </p>
        <Button variant="secondary" onClick={onCancel}>
          Fermer
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
          Date
        </label>
        <p className="text-lg font-medium">
          {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <Select
        label="Exercice"
        options={exerciseOptions}
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        error={errors.exerciseId}
      />

      <Select
        label="Programme"
        options={programOptions}
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
        error={errors.programId}
      />

      <Input
        label="Heure (optionnel)"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="HH:MM"
      />

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
          Notes (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Augmenter le poids..."
          className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-white/10 focus:border-energy-500 dark:focus:border-energy-400 focus:outline-none focus:ring-0 transition-all duration-200 text-gray-900 dark:text-gray-100"
          rows={2}
        />
      </div>

      <Select
        label="Recurrence"
        options={recurrenceOptions}
        value={recurrenceType}
        onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
      />

      {recurrenceType !== 'none' && (
        <Input
          label="Date de fin (optionnel)"
          type="date"
          value={recurrenceEndDate}
          onChange={(e) => setRecurrenceEndDate(e.target.value)}
          error={errors.recurrenceEndDate}
          min={date}
        />
      )}

      <div className="flex gap-3 justify-end mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {session ? 'Modifier' : 'Planifier'}
        </Button>
      </div>
    </form>
  )
}
