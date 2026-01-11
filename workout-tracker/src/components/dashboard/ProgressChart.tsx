import { memo, useMemo } from 'react'
import type { Session } from '../../types'
import Card from '../ui/Card'
import { formatDateShort } from '../../utils/date'

interface ProgressChartProps {
  sessions: Session[]
  exerciseName?: string
}

function ProgressChart({
  sessions,
  exerciseName = 'Toutes les séances',
}: ProgressChartProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-4">Progression</h3>
        <div className="text-center py-8 text-gray-500">
          Aucune donnée à afficher. Commence par faire une séance !
        </div>
      </Card>
    )
  }

  // Memoize all expensive chart calculations
  const chartData = useMemo(() => {
    // Prendre les 10 dernières séances pour le graphique
    const recentSessions = sessions.slice(0, 10).reverse()

    // Calculer le total de reps par séance
    const data = recentSessions.map((session) => ({
      date: session.date,
      totalReps: session.sets.reduce((sum, reps) => sum + reps, 0),
    }))

    // Dimensions du graphique
    const width = 800
    const height = 300
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Trouver min/max pour l'échelle
    const maxReps = Math.max(...data.map((d) => d.totalReps))
    const minReps = Math.min(...data.map((d) => d.totalReps))
    const range = maxReps - minReps || 1

    // Fonction pour calculer la position Y (inversée car SVG part du haut)
    const getY = (reps: number) => {
      return padding + chartHeight - ((reps - minReps) / range) * chartHeight
    }

    // Fonction pour calculer la position X
    const getX = (index: number) => {
      const step = chartWidth / (data.length - 1 || 1)
      return padding + index * step
    }

    // Générer les points pour la ligne
    const linePoints = data
      .map((d, i) => `${getX(i)},${getY(d.totalReps)}`)
      .join(' ')

    // Générer le path pour l'aire sous la courbe
    const areaPath = `
      M ${getX(0)},${getY(data[0].totalReps)}
      ${data.map((d, i) => `L ${getX(i)},${getY(d.totalReps)}`).join(' ')}
      L ${getX(data.length - 1)},${padding + chartHeight}
      L ${getX(0)},${padding + chartHeight}
      Z
    `

    return {
      data,
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      maxReps,
      minReps,
      range,
      getY,
      getX,
      linePoints,
      areaPath
    }
  }, [sessions])

  const { data, width, height, padding, chartHeight, range, minReps, getY, getX, linePoints, areaPath } = chartData

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Progression - {exerciseName}</h3>
      <p className="text-sm text-gray-600 mb-4">Total de répétitions par séance</p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: '300px' }}
        >
          {/* Grille horizontale */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + chartHeight * (1 - ratio)
            const value = Math.round(minReps + range * ratio)
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {value}
                </text>
              </g>
            )
          })}

          {/* Aire sous la courbe */}
          <path d={areaPath} fill="#3b82f6" fillOpacity="0.1" />

          {/* Ligne de progression */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points sur la ligne */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(d.totalReps)}
                r="5"
                fill="#3b82f6"
                className="cursor-pointer hover:r-6 transition-all"
              />
              {/* Tooltip au survol */}
              <title>
                {formatDateShort(d.date)}: {d.totalReps} reps
              </title>
            </g>
          ))}

          {/* Labels de dates */}
          {data.map((d, i) => {
            // Afficher seulement quelques labels pour éviter le chevauchement
            if (data.length > 5 && i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) {
              return null
            }
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {formatDateShort(d.date).split('/')[0]}/{formatDateShort(d.date).split('/')[1]}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Légende */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
          <span className="text-gray-600">Total reps par séance</span>
        </div>
        <div className="text-gray-500">
          {data.length} séance{data.length > 1 ? 's' : ''} affichée{data.length > 1 ? 's' : ''}
        </div>
      </div>
    </Card>
  )
}

export default memo(ProgressChart)
