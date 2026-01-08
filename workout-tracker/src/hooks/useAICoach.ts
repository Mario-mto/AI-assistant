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

      // Ajouter le message de l'utilisateur
      coach.addMessage('user', message)
      coach.setIsLoading(true)

      try {
        // Envoyer à Gemini et recevoir la réponse
        const response = await geminiService.sendMessage(
          coach.messages,
          coach.settings.apiKey,
          coach.settings.model
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
    [coach]
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
    acceptSuggestion: coach.acceptSuggestion,
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
