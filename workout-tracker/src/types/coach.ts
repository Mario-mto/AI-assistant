export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface PerformanceAnalysis {
  id: string
  exerciseId?: string
  dateRange: {
    start: string
    end: string
  }
  insights: string[]
  suggestions: string[]
  trends: Array<{
    metric: string
    direction: 'up' | 'down' | 'stable'
    value?: string
  }>
  generatedAt: string
}

export interface ProgramSuggestion {
  id: string
  name: string
  description: string
  exercises: Array<{
    exerciseName: string
    goal: number
  }>
  program: {
    name: string
    description: string
    restSeconds?: number
    emomSeconds?: number
    defaultRepsPattern: 'pyramid' | 'fixed' | 'lastPerf'
    fixedReps?: number
  }
  reason: string
  status: 'pending' | 'accepted' | 'rejected'
}

export interface QuestionnaireAnswers {
  objective: 'strength' | 'endurance' | 'hypertrophy' | 'mixed'
  level: 'beginner' | 'intermediate' | 'advanced'
  equipment: string[]
  duration: number // en minutes
  frequency: number // fois par semaine
  targetMuscles: string[]
}

export interface CoachSettings {
  apiKey: string
  enabled: boolean
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-3-flash-preview' | 'gemini-flash-latest'
  liveCoachingEnabled: boolean
}

export interface LiveCoachMessage {
  id: string
  content: string
  type: 'encouragement' | 'advice' | 'warning'
  timestamp: string
}
