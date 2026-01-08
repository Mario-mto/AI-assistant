import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Program, RepsPattern } from '../../types'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface ProgramFormProps {
  program?: Program
  onSave: (data: {
    name: string
    description?: string
    restSeconds?: number
    emomSeconds?: number
    defaultRepsPattern: RepsPattern
    fixedReps?: number
  }) => void
  onCancel: () => void
}

export default function ProgramForm({
  program,
  onSave,
  onCancel,
}: ProgramFormProps) {
  const [name, setName] = useState(program?.name || '')
  const [description, setDescription] = useState(program?.description || '')
  const [restSeconds, setRestSeconds] = useState(program?.restSeconds?.toString() || '')
  const [emomSeconds, setEmomSeconds] = useState(program?.emomSeconds?.toString() || '')
  const [defaultRepsPattern, setDefaultRepsPattern] = useState<RepsPattern>(
    program?.defaultRepsPattern || 'pyramid'
  )
  const [fixedReps, setFixedReps] = useState(program?.fixedReps?.toString() || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    if (restSeconds && (isNaN(Number(restSeconds)) || Number(restSeconds) < 0)) {
      newErrors.restSeconds = 'Le repos doit être un nombre positif'
    }

    if (emomSeconds && (isNaN(Number(emomSeconds)) || Number(emomSeconds) <= 0)) {
      newErrors.emomSeconds = 'L\'EMOM doit être un nombre supérieur à 0'
    }

    if (defaultRepsPattern === 'fixed') {
      if (!fixedReps || isNaN(Number(fixedReps)) || Number(fixedReps) <= 0) {
        newErrors.fixedReps = 'Le nombre de reps fixe est requis et doit être supérieur à 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (validate()) {
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
      })
    }
  }

  const patternOptions = [
    { value: 'pyramid', label: 'Pyramidal (1,2,3...3,2,1)' },
    { value: 'fixed', label: 'Fixe (même nombre)' },
    { value: 'lastPerf', label: 'Dernière performance' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nom du programme"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Ex: Pyramidal"
        autoFocus
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Programme pyramidal pour progresser..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <Select
        label="Pattern de répétitions"
        options={patternOptions}
        value={defaultRepsPattern}
        onChange={(e) => setDefaultRepsPattern(e.target.value as RepsPattern)}
      />

      {defaultRepsPattern === 'fixed' && (
        <Input
          label="Nombre de reps par série"
          type="number"
          value={fixedReps}
          onChange={(e) => setFixedReps(e.target.value)}
          error={errors.fixedReps}
          placeholder="Ex: 10"
          min="1"
        />
      )}

      <Input
        label="Repos entre séries (secondes, optionnel)"
        type="number"
        value={restSeconds}
        onChange={(e) => setRestSeconds(e.target.value)}
        error={errors.restSeconds}
        placeholder="Ex: 60"
        min="0"
      />

      <Input
        label="EMOM (secondes, optionnel)"
        type="number"
        value={emomSeconds}
        onChange={(e) => setEmomSeconds(e.target.value)}
        error={errors.emomSeconds}
        placeholder="Ex: 120"
        min="1"
      />

      <div className="flex gap-3 justify-end mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {program ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
