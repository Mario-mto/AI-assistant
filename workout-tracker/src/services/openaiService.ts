import type { ChatMessage, PerformanceAnalysis, ProgramSuggestion, QuestionnaireAnswers, LiveCoachMessage } from '../types/coach'
import type { Session, Exercise, Program } from '../types'
import { generateId } from '../utils/id'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `Tu es un coach sportif expert en musculation et fitness.
Tu analyses les performances d'entraînement et donnes des conseils personnalisés.
Sois encourageant, précis et adapte tes conseils au niveau de l'utilisateur.
Utilise des emojis pour rendre tes messages plus vivants et motivants.
Réponds en français de manière claire et concise.`

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  error?: {
    message: string
  }
}

/**
 * Envoie un message à l'API OpenAI et retourne la réponse
 */
export async function sendMessage(
  messages: ChatMessage[],
  apiKey: string,
  model: string = 'gpt-4o'
): Promise<string> {
  if (!apiKey) {
    throw new Error('Clé API OpenAI manquante. Configure-la dans les paramètres.')
  }

  const openaiMessages: OpenAIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ]

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.error?.message || `Erreur API: ${response.statusText}`
      )
    }

    const data: OpenAIResponse = await response.json()
    return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.'
  } catch (error) {
    console.error('OpenAI API Error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erreur de communication avec l\'API OpenAI')
  }
}

/**
 * Analyse les performances d'un exercice
 */
export async function analyzePerformance(
  sessions: Session[],
  exercises: Exercise[],
  programs: Program[],
  apiKey: string,
  exerciseId?: string
): Promise<PerformanceAnalysis> {
  const filteredSessions = exerciseId
    ? sessions.filter((s) => s.exerciseId === exerciseId)
    : sessions

  if (filteredSessions.length === 0) {
    throw new Error('Aucune donnée à analyser')
  }

  // Préparer le contexte pour l'IA
  const sessionSummary = filteredSessions.slice(0, 20).map((session) => {
    const exercise = exercises.find((e) => e.id === session.exerciseId)
    const program = programs.find((p) => p.id === session.programId)
    const totalReps = session.sets.reduce((sum, reps) => sum + reps, 0)
    const avgReps = totalReps / session.sets.length

    return {
      date: session.date,
      exercise: exercise?.name || 'Inconnu',
      program: program?.name || 'Inconnu',
      sets: session.sets.length,
      totalReps,
      avgReps: avgReps.toFixed(1),
      goal: exercise?.goal || 0,
    }
  })

  const prompt = `Analyse ces ${filteredSessions.length} dernières séances d'entraînement :

${JSON.stringify(sessionSummary, null, 2)}

Fournis une analyse avec :
1. 3-5 insights clés sur la progression
2. 3-5 suggestions d'amélioration concrètes
3. 2-3 tendances observées (progression, stagnation, régression)

Réponds au format JSON suivant :
{
  "insights": ["insight1", "insight2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "trends": [{"metric": "nom", "direction": "up/down/stable", "value": "description"}]
}`

  const response = await sendMessage(
    [{ id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() }],
    apiKey
  )

  try {
    const parsed = JSON.parse(response)
    const dates = filteredSessions.map((s) => s.date).sort()

    return {
      id: generateId(),
      exerciseId,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1],
      },
      insights: parsed.insights || [],
      suggestions: parsed.suggestions || [],
      trends: parsed.trends || [],
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    // Fallback si le JSON n'est pas valide
    return {
      id: generateId(),
      exerciseId,
      dateRange: {
        start: filteredSessions[0].date,
        end: filteredSessions[filteredSessions.length - 1].date,
      },
      insights: [response],
      suggestions: [],
      trends: [],
      generatedAt: new Date().toISOString(),
    }
  }
}

/**
 * Génère une suggestion de programme basée sur un questionnaire
 */
export async function suggestProgram(
  answers: QuestionnaireAnswers,
  _sessions: Session[],
  exercises: Exercise[],
  apiKey: string
): Promise<ProgramSuggestion> {
  const prompt = `Crée un programme d'entraînement personnalisé basé sur ces informations :

Objectif : ${answers.objective}
Niveau : ${answers.level}
Équipement : ${answers.equipment.join(', ')}
Durée par séance : ${answers.duration} minutes
Fréquence : ${answers.frequency} fois/semaine
Muscles ciblés : ${answers.targetMuscles.join(', ')}

Historique des exercices déjà pratiqués :
${exercises.map((e) => `- ${e.name} (objectif: ${e.goal} reps)`).join('\n')}

Réponds au format JSON suivant :
{
  "programName": "Nom du programme",
  "programDescription": "Description courte",
  "restSeconds": 60,
  "defaultRepsPattern": "pyramid",
  "exercises": [
    {"exerciseName": "Nom exercice", "goal": 10}
  ],
  "reason": "Explication du choix de ce programme"
}`

  const response = await sendMessage(
    [{ id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() }],
    apiKey
  )

  try {
    const parsed = JSON.parse(response)

    return {
      id: generateId(),
      name: parsed.programName,
      description: parsed.programDescription,
      exercises: parsed.exercises || [],
      program: {
        name: parsed.programName,
        description: parsed.programDescription,
        restSeconds: parsed.restSeconds || 60,
        emomSeconds: parsed.emomSeconds,
        defaultRepsPattern: parsed.defaultRepsPattern || 'pyramid',
        fixedReps: parsed.fixedReps,
      },
      reason: parsed.reason || 'Programme personnalisé basé sur tes réponses',
      status: 'pending',
    }
  } catch (error) {
    console.error('Error parsing program suggestion:', error)
    throw new Error('Erreur lors de la génération du programme')
  }
}

/**
 * Génère un message de coaching en temps réel pendant une séance
 */
export async function getLiveCoaching(
  currentSetNumber: number,
  completedSets: number[],
  defaultReps: number,
  exerciseName: string,
  programName: string,
  apiKey: string
): Promise<LiveCoachMessage> {
  const totalReps = completedSets.reduce((sum, reps) => sum + reps, 0)
  const avgReps = completedSets.length > 0 ? totalReps / completedSets.length : 0

  const prompt = `Tu es un coach sportif qui encourage un athlète PENDANT sa séance.

Contexte :
- Exercice : ${exerciseName}
- Programme : ${programName}
- Série actuelle : #${currentSetNumber}
- Séries complétées : ${completedSets.join(', ')} (${completedSets.length} séries)
- Moyenne : ${avgReps.toFixed(1)} reps
- Objectif suggéré : ${defaultReps} reps

Donne UN SEUL message court et motivant (15-30 mots max) pour :
- Encourager avant la prochaine série
- Donner un conseil technique rapide si pertinent
- Féliciter si la progression est bonne

Réponds UNIQUEMENT avec le message, sans formatage JSON.`

  const response = await sendMessage(
    [{ id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() }],
    apiKey
  )

  return {
    id: generateId(),
    content: response,
    type: 'encouragement',
    timestamp: new Date().toISOString(),
  }
}

/**
 * Analyse une séance terminée et donne un feedback
 */
export async function analyzeCompletedSession(
  exerciseName: string,
  programName: string,
  sets: number[],
  goal: number,
  apiKey: string
): Promise<string> {
  const totalReps = sets.reduce((sum, reps) => sum + reps, 0)
  const avgReps = totalReps / sets.length
  const bestSet = Math.max(...sets)

  const prompt = `Analyse cette séance terminée et donne un feedback bref :

Exercice : ${exerciseName}
Programme : ${programName}
Séries : ${sets.join(', ')}
Total : ${totalReps} reps en ${sets.length} séries
Moyenne : ${avgReps.toFixed(1)} reps
Meilleure série : ${bestSet} reps
Objectif : ${goal} reps

Fournis :
1. Un bref félicitations (2-3 phrases)
2. Un conseil pour la prochaine fois
3. Un objectif pour la prochaine séance

Réponds de manière motivante et concise (max 100 mots).`

  return sendMessage(
    [{ id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() }],
    apiKey
  )
}
