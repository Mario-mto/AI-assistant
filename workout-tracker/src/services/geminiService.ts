import type { ChatMessage, PerformanceAnalysis, ProgramSuggestion, QuestionnaireAnswers, LiveCoachMessage } from '../types/coach'
import type { Session, Exercise, Program } from '../types'
import { generateId } from '../utils/id'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const BASE_SYSTEM_PROMPT = `Tu es un coach sportif expert en musculation et fitness.
Tu analyses les performances d'entraînement et donnes des conseils personnalisés.
Sois encourageant, précis et adapte tes conseils au niveau de l'utilisateur.
Utilise des emojis pour rendre tes messages plus vivants et motivants.
Réponds en français de manière claire et concise.`

interface WorkoutContext {
  sessions: Session[]
  exercises: Exercise[]
  programs: Program[]
}

function buildSystemPrompt(context?: WorkoutContext): string {
  let prompt = BASE_SYSTEM_PROMPT

  if (!context || context.sessions.length === 0) {
    return prompt
  }

  // Ajouter un résumé de l'historique
  const recentSessions = context.sessions.slice(0, 10)
  const exerciseMap = new Map(context.exercises.map(e => [e.id, e]))
  const programMap = new Map(context.programs.map(p => [p.id, p]))

  const sessionsSummary = recentSessions.map(s => {
    const exercise = exerciseMap.get(s.exerciseId)
    const program = programMap.get(s.programId)
    const totalReps = s.sets.reduce((a, b) => a + b, 0)
    return `- ${s.date}: ${exercise?.name || 'Exercice inconnu'} (${program?.name || 'Programme inconnu'}) - ${s.sets.length} séries, ${totalReps} reps total`
  }).join('\n')

  // Stats globales
  const totalSessions = context.sessions.length
  const totalReps = context.sessions.reduce((sum, s) => sum + s.sets.reduce((a, b) => a + b, 0), 0)
  const exercisesUsed = [...new Set(context.sessions.map(s => s.exerciseId))].length

  prompt += `

=== CONTEXTE DE L'UTILISATEUR ===
Statistiques globales:
- ${totalSessions} séances enregistrées
- ${totalReps} répétitions au total
- ${exercisesUsed} exercices différents pratiqués
- ${context.exercises.length} exercices configurés
- ${context.programs.length} programmes configurés

Exercices disponibles:
${context.exercises.map(e => `- ${e.name} (objectif: ${e.goal} reps)`).join('\n')}

Programmes disponibles:
${context.programs.map(p => `- ${p.name}: ${p.description || 'Pas de description'} (pattern: ${p.defaultRepsPattern})`).join('\n')}

10 dernières séances:
${sessionsSummary || 'Aucune séance enregistrée'}

Utilise ces informations pour personnaliser tes conseils et créer des programmes adaptés.`

  return prompt
}

interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>
    }
  }>
  error?: {
    message: string
  }
}

/**
 * Envoie un message à l'API Gemini et retourne la réponse
 */
export async function sendMessage(
  messages: ChatMessage[],
  apiKey: string,
  model: string = 'gemini-2.5-flash',
  context?: WorkoutContext
): Promise<string> {
  if (!apiKey) {
    throw new Error('Clé API Google manquante. Configure-la dans les paramètres.')
  }

  // Convertir les messages au format Gemini
  let geminiMessages: GeminiMessage[] = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  // Gemini exige que la conversation alterne user/model et finisse par 'user'
  // Fusionner les messages consécutifs du même rôle
  geminiMessages = geminiMessages.reduce<GeminiMessage[]>((acc, msg) => {
    const lastMsg = acc[acc.length - 1]
    if (lastMsg && lastMsg.role === msg.role) {
      // Fusionner avec le message précédent
      lastMsg.parts[0].text += '\n' + msg.parts[0].text
    } else {
      acc.push(msg)
    }
    return acc
  }, [])

  // S'assurer que le premier message est 'user'
  if (geminiMessages.length > 0 && geminiMessages[0].role !== 'user') {
    geminiMessages.shift()
  }

  // S'assurer que le dernier message est 'user' (requis par Gemini)
  if (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role !== 'user') {
    // Supprimer les messages 'model' à la fin
    while (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role !== 'user') {
      geminiMessages.pop()
    }
  }

  // Vérifier qu'il reste au moins un message user
  if (geminiMessages.length === 0) {
    throw new Error('Aucun message utilisateur à envoyer')
  }

  // Ajouter le system prompt enrichi avec le contexte au premier message user
  const systemPrompt = buildSystemPrompt(context)
  if (geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
    geminiMessages[0].parts[0].text = `${systemPrompt}\n\n${geminiMessages[0].parts[0].text}`
  }

  const endpoint = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.error?.message || `Erreur API: ${response.statusText}`
      )
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('Aucune réponse générée par Gemini')
    }

    return text
  } catch (error) {
    console.error('Gemini API Error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erreur de communication avec l\'API Gemini')
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
    // Nettoyer la réponse (Gemini peut ajouter des balises markdown)
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanedResponse)
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
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleanedResponse)

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
 * Génère une suggestion de programme basée sur une demande textuelle simple
 */
export async function suggestProgramFromRequest(
  userRequest: string,
  exercises: Exercise[],
  apiKey: string
): Promise<ProgramSuggestion> {
  const exercisesList = exercises.length > 0
    ? `Exercices déjà configurés par l'utilisateur :\n${exercises.map((e) => `- ${e.name} (objectif: ${e.goal} reps)`).join('\n')}`
    : 'Aucun exercice configuré pour le moment.'

  const prompt = `L'utilisateur demande : "${userRequest}"

${exercisesList}

Crée un programme d'entraînement adapté à cette demande.

IMPORTANT : Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, au format suivant :
{
  "programName": "Nom du programme",
  "programDescription": "Description courte du programme",
  "restSeconds": 60,
  "defaultRepsPattern": "pyramid",
  "exercises": [
    {"exerciseName": "Nom exercice 1", "goal": 10},
    {"exerciseName": "Nom exercice 2", "goal": 12}
  ],
  "reason": "Pourquoi ce programme est adapté à la demande"
}

Notes :
- defaultRepsPattern peut être "pyramid", "fixed" ou "lastPerf"
- restSeconds est le temps de repos en secondes entre les séries
- goal est le nombre de répétitions objectif par série
- Propose 2 à 5 exercices pertinents`

  const response = await sendMessage(
    [{ id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() }],
    apiKey
  )

  try {
    // Nettoyer la réponse et extraire le JSON
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Essayer de trouver un objet JSON dans la réponse
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0]
    }

    const parsed = JSON.parse(cleanedResponse)

    return {
      id: generateId(),
      name: parsed.programName || 'Programme personnalisé',
      description: parsed.programDescription || 'Programme créé par le coach IA',
      exercises: parsed.exercises || [],
      program: {
        name: parsed.programName || 'Programme personnalisé',
        description: parsed.programDescription || 'Programme créé par le coach IA',
        restSeconds: parsed.restSeconds || 60,
        emomSeconds: parsed.emomSeconds,
        defaultRepsPattern: parsed.defaultRepsPattern || 'pyramid',
        fixedReps: parsed.fixedReps,
      },
      reason: parsed.reason || 'Programme personnalisé basé sur ta demande',
      status: 'pending',
    }
  } catch (error) {
    console.error('Error parsing program suggestion:', error, 'Response:', response)
    // Fallback : créer un programme par défaut basé sur la demande
    return {
      id: generateId(),
      name: 'Programme personnalisé',
      description: userRequest,
      exercises: [
        { exerciseName: 'Pompes', goal: 15 },
        { exerciseName: 'Squats', goal: 20 },
        { exerciseName: 'Gainage', goal: 30 },
      ],
      program: {
        name: 'Programme personnalisé',
        description: userRequest,
        restSeconds: 60,
        defaultRepsPattern: 'pyramid' as const,
      },
      reason: 'Programme de base créé automatiquement. Tu peux le modifier dans Config.',
      status: 'pending',
    }
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
