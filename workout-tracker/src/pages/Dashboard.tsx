import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../context/WorkoutContext'
import { formatDate } from '../utils/date'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import StatsCard from '../components/dashboard/StatsCard'
import ProgressChart from '../components/dashboard/ProgressChart'
import RecentSessions from '../components/dashboard/RecentSessions'

export default function Dashboard() {
  const navigate = useNavigate()
  const { sessions, exercises, programs, cardioSessions } = useWorkout()

  // Navigation callbacks memoized
  const goToSession = useCallback(() => navigate('/session'), [navigate])
  const goToCardio = useCallback(() => navigate('/cardio'), [navigate])
  const goToConfig = useCallback(() => navigate('/config'), [navigate])

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.date.localeCompare(a.date))
  }, [sessions])

  const sortedCardioSessions = useMemo(() => {
    return [...cardioSessions].sort((a, b) => b.date.localeCompare(a.date))
  }, [cardioSessions])

  const muscuStats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalSets: 0,
        totalReps: 0,
        lastSessionDate: '-',
        lastSessionExercise: '-',
        lastSessionReps: 0,
      }
    }

    let totalSets = 0
    let totalReps = 0

    for (const session of sessions) {
      totalSets += session.sets.length
      for (const reps of session.sets) {
        totalReps += reps
      }
    }

    const lastSession = sortedSessions[0]
    const lastSessionExercise = exercises.find((ex) => ex.id === lastSession.exerciseId)?.name || '-'
    const lastSessionReps = lastSession.sets.reduce((sum, reps) => sum + reps, 0)

    return {
      totalSessions: sessions.length,
      totalSets,
      totalReps,
      lastSessionDate: formatDate(lastSession.date),
      lastSessionExercise,
      lastSessionReps,
    }
  }, [sessions, sortedSessions, exercises])

  const cardioStats = useMemo(() => {
    if (cardioSessions.length === 0) {
      return { totalSessions: 0, totalDistance: 0, totalDuration: 0 }
    }

    let totalDistance = 0
    let totalDuration = 0

    for (const session of cardioSessions) {
      totalDistance += session.distance
      totalDuration += session.duration
    }

    return {
      totalSessions: cardioSessions.length,
      totalDistance,
      totalDuration
    }
  }, [cardioSessions])

  const weeklyCount = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    let count = 0

    for (const session of sessions) {
      if (session.date >= weekAgo) count++
    }
    for (const session of cardioSessions) {
      if (session.date >= weekAgo) count++
    }

    return count
  }, [sessions, cardioSessions])

  const hasData = sessions.length > 0 || cardioSessions.length > 0
  const hasMuscuData = sessions.length > 0
  const hasCardioData = cardioSessions.length > 0
  const totalAllSessions = sessions.length + cardioSessions.length

  return (
    <div className="relative min-h-screen">
      {/* Mesh background */}
      <div className="mesh-bg" />

      <div className="relative z-10 pb-24">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight">
                <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Ta progression en un coup d'oeil
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3 mt-6">
            <Button onClick={goToSession} className="flex-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5c1.5 0 3 .5 3 2s-1.5 2-3 2-3-.5-3-2 1.5-2 3-2z" />
                <path d="M17.5 6.5c1.5 0 3 .5 3 2s-1.5 2-3 2-3-.5-3-2 1.5-2 3-2z" />
                <path d="M6.5 10.5v4c0 1.5 1 3 3 3h5c2 0 3-1.5 3-3v-4" />
              </svg>
              Musculation
            </Button>
            <Button onClick={goToCardio} variant="secondary" className="flex-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="2" />
                <path d="M4 17l3-3 2 2 4-4 3 3" />
              </svg>
              Cardio
            </Button>
          </div>
        </header>

        {/* Welcome message if no data */}
        {!hasData && (
          <Card variant="gradient" className="mb-8 animate-scale-in border-2 border-dashed border-energy-300 dark:border-energy-700">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-energy-400 to-volt-500 flex items-center justify-center animate-float">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold gradient-text mb-2">
                Bienvenue !
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Configure tes exercices et programmes, puis lance ta premiere seance.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={goToConfig} variant="secondary" size="sm">
                  Configurer
                </Button>
                <Button onClick={goToSession} size="sm">
                  Commencer
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        {hasData && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatsCard
              title="Total seances"
              value={totalAllSessions}
              icon="📅"
              color="energy"
              subtitle={`${sessions.length} muscu • ${cardioSessions.length} cardio`}
              delay={100}
            />
            <StatsCard
              title="Total reps"
              value={muscuStats.totalReps.toLocaleString()}
              icon="💪"
              color="success"
              subtitle={hasMuscuData ? `${muscuStats.totalSets} series` : undefined}
              delay={200}
            />
            <StatsCard
              title="Distance"
              value={`${cardioStats.totalDistance.toFixed(1)} km`}
              icon="🏃"
              color="pulse"
              subtitle={hasCardioData ? `${cardioStats.totalDuration} min` : undefined}
              delay={300}
            />
            <StatsCard
              title="Cette semaine"
              value={weeklyCount}
              icon="⚡"
              color="volt"
              subtitle="seances"
              delay={400}
            />
          </div>
        )}

        {/* Cardio Recent Section */}
        {hasCardioData && (
          <Card variant="glass" className="mb-6 animate-slide-up opacity-0" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-400 to-pulse-600 flex items-center justify-center text-white text-sm">
                  🏃
                </span>
                Cardio recent
              </h2>
              <Button variant="ghost" size="sm" onClick={goToCardio}>
                + Ajouter
              </Button>
            </div>

            {/* Cardio mini-stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-pulse-400/10 dark:bg-pulse-400/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-pulse-600 dark:text-pulse-400">
                  {cardioStats.totalDistance.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">km total</p>
              </div>
              <div className="bg-pulse-400/10 dark:bg-pulse-400/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-pulse-600 dark:text-pulse-400">
                  {cardioStats.totalSessions}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">seances</p>
              </div>
              <div className="bg-pulse-400/10 dark:bg-pulse-400/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-pulse-600 dark:text-pulse-400">
                  {Math.floor(cardioStats.totalDuration / 60)}h{cardioStats.totalDuration % 60}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">temps total</p>
              </div>
            </div>

            {/* Recent cardio sessions */}
            <div className="space-y-2">
              {sortedCardioSessions.slice(0, 3).map((session, index) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center bg-white/50 dark:bg-white/5 rounded-xl px-4 py-3 transition-all hover:bg-white/80 dark:hover:bg-white/10"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {session.type === 'running' ? '🏃' : session.type === 'cycling' ? '🚴' : '🚶'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <span className="font-display font-bold text-gray-700 dark:text-gray-200">
                    {session.distance} km • {session.duration} min
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Progress Chart */}
        {hasMuscuData && (
          <div className="mb-6 animate-slide-up opacity-0" style={{ animationDelay: '600ms' }}>
            <ProgressChart sessions={sortedSessions} />
          </div>
        )}

        {/* Recent Sessions */}
        {hasMuscuData && (
          <div className="mb-6 animate-slide-up opacity-0" style={{ animationDelay: '700ms' }}>
            <RecentSessions
              sessions={sortedSessions}
              exercises={exercises}
              programs={programs}
              limit={5}
            />
          </div>
        )}

        {/* Additional Stats */}
        {hasMuscuData && sessions.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up opacity-0" style={{ animationDelay: '800ms' }}>
            <Card variant="gradient" className="text-center">
              <p className="text-sm font-medium text-volt-600 dark:text-volt-400 uppercase tracking-wide">
                Exercice favori
              </p>
              <p className="text-2xl font-display font-bold mt-2 text-gray-800 dark:text-white">
                {(() => {
                  const counts = sessions.reduce((acc, s) => {
                    acc[s.exerciseId] = (acc[s.exerciseId] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  const topId = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0]
                  return exercises.find((ex) => ex.id === topId)?.name || '-'
                })()}
              </p>
            </Card>

            <Card variant="gradient" className="text-center">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Record reps/seance
              </p>
              <p className="text-2xl font-display font-bold mt-2 text-gray-800 dark:text-white">
                {Math.max(...sessions.map((s) => s.sets.reduce((sum, r) => sum + r, 0)))}
              </p>
            </Card>

            <Card variant="gradient" className="text-center">
              <p className="text-sm font-medium text-energy-600 dark:text-energy-400 uppercase tracking-wide">
                Meilleure serie
              </p>
              <p className="text-2xl font-display font-bold mt-2 text-gray-800 dark:text-white">
                {Math.max(...sessions.flatMap((s) => s.sets))} reps
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
