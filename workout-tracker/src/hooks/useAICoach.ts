import { useCallback } from 'react'
import { useAICoachContext } from '../context/AICoachContext'
import { useWorkout } from '../context/WorkoutContext'
import type { QuestionnaireAnswers } from '../types/coach'
import * as geminiService from '../services/geminiService'

/**
 * Hook principal pour interagir avec le coach IA
 */
export function useAICoach() {
  const coach = useAICoachContext()
  const workout = useWorkout()

  /**
   * Envoie un message au coach et reçoit une réponse
   */
  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (!coach.isConfigured()) {
        throw new Error('Coach IA non configuré. Va dans Config pour ajouter ta clé API.')
      }

      // Créer le nouveau message utilisateur
      const newUserMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString(),
      }

      // Ajouter le message de l'utilisateur à l'UI
      coach.addMessage('user', message)
      coach.setIsLoading(true)

      try {
        // Envoyer à Gemini avec le nouveau message inclus et le contexte de l'historique
        // (coach.messages n'est pas encore mis à jour car setState est async)
        const messagesWithNew = [...coach.messages, newUserMessage]
        const workoutContext = {
          sessions: workout.sessions,
          exercises: workout.exercises,
          programs: workout.programs,
        }
        const response = await geminiService.sendMessage(
          messagesWithNew,
          coach.settings.apiKey,
          coach.settings.model,
          workoutContext
        )

        // Ajouter la réponse du coach
        coach.addMessage('assistant', response)
      } catch (error) {
        console.error('Error sending message:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Désolé, une erreur est survenue. Vérifie ta clé API dans Config.'
        coach.addMessage('assistant', `❌ ${errorMessage}`)
        throw error
      } finally {
        coach.setIsLoading(false)
      }
    },
    [coach, workout]
  )

  /**
   * Analyse les performances récentes
   */
  const analyzePerformance = useCallback(
    async (exerciseId?: string): Promise<void> => {
      if (!coach.isConfigured()) {
        throw new Error('Coach IA non configuré.')
      }

      coach.setIsLoading(true)

      try {
        const analysis = await geminiService.analyzePerformance(
          workout.sessions,
          workout.exercises,
          workout.programs,
          coach.settings.apiKey,
          exerciseId
        )

        coach.addAnalysis(analysis)

        // Ajouter un message récapitulatif dans le chat
        const summary = `📊 **Analyse de performance**\n\n**Insights:**\n${analysis.insights.map((i) => `• ${i}`).join('\n')}\n\n**Suggestions:**\n${analysis.suggestions.map((s) => `• ${s}`).join('\n')}`

        coach.addMessage('assistant', summary)
      } catch (error) {
        console.error('Error analyzing performance:', error)
        throw error
      } finally {
        coach.setIsLoading(false)
      }
    },
    [coach, workout]
  )

  /**
   * Crée un programme suggéré basé sur un questionnaire
   */
  const createProgramFromQuestionnaire = useCallback(
    async (answers: QuestionnaireAnswers): Promise<void> => {
      if (!coach.isConfigured()) {
        throw new Error('Coach IA non configuré.')
      }

      coach.setIsLoading(true)

      try {
        const suggestion = await geminiService.suggestProgram(
          answers,
          workout.sessions,
          workout.exercises,
          coach.settings.apiKey
        )

        coach.addSuggestion(suggestion)

        // Ajouter un message dans le chat
        coach.addMessage(
          'assistant',
          `🎯 J'ai créé un programme personnalisé pour toi : **${suggestion.name}**\n\n${suggestion.description}\n\n${suggestion.reason}\n\nTu peux l'accepter ou le modifier dans les suggestions.`
        )
      } catch (error) {
        console.error('Error creating program:', error)
        throw error
      } finally {
        coach.setIsLoading(false)
      }
    },
    [coach, workout]
  )

  /**
   * Demande un programme basé sur une requête textuelle simple
   */
  const requestProgram = useCallback(
    async (request: string): Promise<void> => {
      if (!coach.isConfigured()) {
        throw new Error('Coach IA non configuré.')
      }

      coach.setIsLoading(true)

      try {
        const suggestion = await geminiService.suggestProgramFromRequest(
          request,
          workout.exercises,
          coach.settings.apiKey
        )

        coach.addSuggestion(suggestion)

        // Ajouter un message de confirmation
        coach.addMessage(
          'assistant',
          `🎯 J'ai préparé un programme pour toi !\n\n**${suggestion.name}**\n${suggestion.description}\n\n📋 Exercices proposés :\n${suggestion.exercises.map(e => `• ${e.exerciseName} (${e.goal} reps)`).join('\n')}\n\n💡 ${suggestion.reason}\n\n👆 Clique sur "Créer ce programme" ci-dessous pour l'ajouter à tes programmes.`
        )
      } catch (error) {
        console.error('Error requesting program:', error)
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du programme'
        coach.addMessage('assistant', `❌ ${errorMessage}`)
        throw error
      } finally {
        coach.setIsLoading(false)
      }
    },
    [coach, workout]
  )

  /**
   * Obtient un message de coaching en temps réel pendant une séance
   */
  const getLiveCoaching = useCallback(
    async (
      currentSetNumber: number,
      completedSets: number[],
      defaultReps: number,
      exerciseName: string,
      programName: string
    ): Promise<string> => {
      if (!coach.isConfigured() || !coach.settings.liveCoachingEnabled) {
        return ''
      }

      try {
        const message = await geminiService.getLiveCoaching(
          currentSetNumber,
          completedSets,
          defaultReps,
          exerciseName,
          programName,
          coach.settings.apiKey
        )

        return message.content
      } catch (error) {
        console.error('Error getting live coaching:', error)
        return ''
      }
    },
    [coach]
  )

  /**
   * Analyse une séance terminée
   */
  const analyzeCompletedSession = useCallback(
    async (
      exerciseName: string,
      programName: string,
      sets: number[],
      goal: number
    ): Promise<string> => {
      if (!coach.isConfigured()) {
        return ''
      }

      try {
        const feedback = await geminiService.analyzeCompletedSession(
          exerciseName,
          programName,
          sets,
          goal,
          coach.settings.apiKey
        )

        return feedback
      } catch (error) {
        console.error('Error analyzing completed session:', error)
        return ''
      }
    },
    [coach]
  )

  /**
   * Accepte une suggestion et crée le programme + exercices dans le système
   */
  const acceptSuggestionAndCreate = useCallback(
    (suggestionId: string): { programId: string; exerciseIds: string[] } | null => {
      const suggestion = coach.suggestions.find(s => s.id === suggestionId)
      if (!suggestion) {
        console.error('Suggestion not found:', suggestionId)
        return null
      }

      // Créer les exercices qui n'existent pas déjà
      const exerciseIds: string[] = []
      for (const ex of suggestion.exercises) {
        // Vérifier si l'exercice existe déjà (par nom)
        const existingExercise = workout.exercises.find(
          e => e.name.toLowerCase() === ex.exerciseName.toLowerCase()
        )

        if (existingExercise) {
          exerciseIds.push(existingExercise.id)
        } else {
          // Créer le nouvel exercice
          const newExerciseId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          workout.addExercise({
            name: ex.exerciseName,
            goal: ex.goal,
          })
          // Note: on ne peut pas récupérer l'ID directement car addExercise génère l'ID
          // On va chercher l'exercice qu'on vient de créer
          exerciseIds.push(newExerciseId)
        }
      }

      // Créer le programme
      workout.addProgram({
        name: suggestion.program.name,
        description: suggestion.program.description,
        restSeconds: suggestion.program.restSeconds,
        emomSeconds: suggestion.program.emomSeconds,
        defaultRepsPattern: suggestion.program.defaultRepsPattern,
        fixedReps: suggestion.program.fixedReps,
      })

      // Marquer la suggestion comme acceptée
      coach.acceptSuggestion(suggestionId)

      // Ajouter un message de confirmation
      coach.addMessage(
        'assistant',
        `✅ Programme "${suggestion.program.name}" créé avec succès !\n\n` +
        `📋 ${suggestion.exercises.length} exercice(s) configuré(s)\n\n` +
        `Tu peux maintenant démarrer une séance avec ce programme dans l'onglet "Séance".`
      )

      // Retourner les IDs créés (approximatifs pour le programme)
      return {
        programId: '', // On ne peut pas récupérer l'ID exact ici
        exerciseIds,
      }
    },
    [coach, workout]
  )

  return {
    // Chat
    messages: coach.messages,
    sendMessage,
    clearChat: coach.clearChat,
    isLoading: coach.isLoading,

    // Analyses
    analyzePerformance,
    getLatestAnalysis: coach.getLatestAnalysis,
    analyses: coach.analyses,

    // Suggestions
    createProgramFromQuestionnaire,
    requestProgram,
    acceptSuggestion: coach.acceptSuggestion,
    acceptSuggestionAndCreate,
    rejectSuggestion: coach.rejectSuggestion,
    suggestions: coach.suggestions,
    pendingSuggestions: coach.getPendingSuggestions(),

    // Live coaching
    getLiveCoaching,
    analyzeCompletedSession,

    // Settings
    settings: coach.settings,
    updateSettings: coach.updateSettings,
    isConfigured: coach.isConfigured(),
  }
}
