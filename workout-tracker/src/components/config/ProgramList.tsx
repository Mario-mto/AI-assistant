import type { Program } from '../../types'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ProgramListProps {
  programs: Program[]
  onEdit: (program: Program) => void
  onDelete: (program: Program) => void
}

const patternLabels: Record<string, string> = {
  pyramid: 'Pyramidal',
  fixed: 'Fixe',
  lastPerf: 'Dernière perf',
}

export default function ProgramList({
  programs,
  onEdit,
  onDelete,
}: ProgramListProps) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Aucun programme. Commence par en ajouter un !
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {programs.map((program) => (
        <Card key={program.id} className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{program.name}</h3>
            {program.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{program.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Pattern: {patternLabels[program.defaultRepsPattern]}</span>
              {program.restSeconds && <span>Repos: {program.restSeconds}s</span>}
              {program.emomSeconds && <span>EMOM: {program.emomSeconds}s</span>}
              {program.fixedReps && <span>Reps: {program.fixedReps}</span>}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="secondary"
              onClick={() => onEdit(program)}
              className="text-sm px-3 py-1"
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              onClick={() => onDelete(program)}
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
