import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  ChatMessage,
  PerformanceAnalysis,
  ProgramSuggestion,
  CoachSettings,
} from '../types/coach'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/id'

interface AICoachContextType {
  // Chat
  messages: ChatMessage[]
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearChat: () => void

  // Analyses
  analyses: PerformanceAnalysis[]
  addAnalysis: (analysis: PerformanceAnalysis) => void
  getLatestAnalysis: (exerciseId?: string) => PerformanceAnalysis | undefined

  // Suggestions
  suggestions: ProgramSuggestion[]
  addSuggestion: (suggestion: ProgramSuggestion) => void
  acceptSuggestion: (id: string) => void
  rejectSuggestion: (id: string) => void
  getPendingSuggestions: () => ProgramSuggestion[]

  // Settings
  settings: CoachSettings
  updateSettings: (settings: Partial<CoachSettings>) => void
  isConfigured: () => boolean

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AICoachContext = createContext<AICoachContextType | undefined>(undefined)

const DEFAULT_SETTINGS: CoachSettings = {
  apiKey: '',
  enabled: false,
  model: 'gemini-2.5-flash',
  liveCoachingEnabled: true,
}

export function AICoachProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('coach-chat-history', [])
  const [analyses, setAnalyses] = useLocalStorage<PerformanceAnalysis[]>('coach-analyses', [])
  const [suggestions, setSuggestions] = useLocalStorage<ProgramSuggestion[]>('coach-suggestions', [])
  const [settings, setSettings] = useLocalStorage<CoachSettings>('coach-settings', DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)

  // === CHAT ===

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date().toISOString(),
    }
    // Utiliser la forme fonctionnelle pour éviter les références stale
    setMessages((prev) => [...prev, newMessage])
  }

  const clearChat = () => {
    setMessages([])
  }

  // === ANALYSES ===

  const addAnalysis = (analysis: PerformanceAnalysis) => {
    // Garder max 10 dernières analyses
    const updatedAnalyses = [analysis, ...analyses].slice(0, 10)
    setAnalyses(updatedAnalyses)
  }

  const getLatestAnalysis = (exerciseId?: string): PerformanceAnalysis | undefined => {
    if (exerciseId) {
      return analyses.find((a) => a.exerciseId === exerciseId)
    }
    return analyses[0]
  }

  // === SUGGESTIONS ===

  const addSuggestion = (suggestion: ProgramSuggestion) => {
    setSuggestions([suggestion, ...suggestions])
  }

  const acceptSuggestion = (id: string) => {
    setSuggestions(
      suggestions.map((s) => (s.id === id ? { ...s, status: 'accepted' } : s))
    )
  }

  const rejectSuggestion = (id: string) => {
    setSuggestions(
      suggestions.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
    )
  }

  const getPendingSuggestions = (): ProgramSuggestion[] => {
    return suggestions.filter((s) => s.status === 'pending')
  }

  // === SETTINGS ===

  const updateSettings = (newSettings: Partial<CoachSettings>) => {
    setSettings({ ...settings, ...newSettings })
  }

  const isConfigured = (): boolean => {
    return settings.enabled && settings.apiKey.length > 0
  }

  return (
    <AICoachContext.Provider
      value={{
        messages,
        addMessage,
        clearChat,
        analyses,
        addAnalysis,
        getLatestAnalysis,
        suggestions,
        addSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        getPendingSuggestions,
        settings,
        updateSettings,
        isConfigured,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AICoachContext.Provider>
  )
}

export function useAICoachContext() {
  const context = useContext(AICoachContext)
  if (context === undefined) {
    throw new Error('useAICoachContext must be used within an AICoachProvider')
  }
  return context
}
