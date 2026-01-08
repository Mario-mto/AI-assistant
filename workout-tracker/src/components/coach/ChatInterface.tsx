import { useEffect, useRef } from 'react'
import { useAICoach } from '../../hooks/useAICoach'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function ChatInterface() {
  const {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    isConfigured,
    pendingSuggestions,
    acceptSuggestionAndCreate,
    rejectSuggestion,
    requestProgram,
  } = useAICoach()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas quand nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (message: string) => {
    try {
      await sendMessage(message)
    } catch (error) {
      console.error('Erreur envoi message:', error)
    }
  }

  const handleClearChat = () => {
    if (confirm('Effacer tout l\'historique du chat ?')) {
      clearChat()
    }
  }

  const handleRequestProgram = async (request: string) => {
    try {
      await requestProgram(request)
    } catch (error) {
      console.error('Erreur création programme:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>🤖</span>
              <span>Coach IA</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isConfigured
                ? 'Pose-moi des questions sur ton entraînement !'
                : '⚠️ Configure ta clé API dans Config pour commencer'}
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleClearChat}
              className="text-sm px-3 py-1"
            >
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">
              Salut ! Je suis ton coach IA
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Je peux t'aider à analyser tes performances, créer des programmes
              personnalisés et te donner des conseils d'entraînement.
            </p>

            {isConfigured && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💡 Suggestions :
                </p>
                <button
                  onClick={() => handleSend('Analyse mes dernières séances')}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  📊 Analyse mes dernières séances
                </button>
                <button
                  onClick={() => handleRequestProgram('Programme de musculation complet pour progresser')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors text-sm font-medium"
                >
                  🎯 Créer un programme personnalisé
                </button>
                <button
                  onClick={() => handleSend('Donne-moi des conseils pour progresser')}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  💪 Donne-moi des conseils pour progresser
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Suggestions en attente */}
            {pendingSuggestions.length > 0 && (
              <div className="mt-4 space-y-3">
                {pendingSuggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                          {suggestion.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {suggestion.description}
                        </p>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <p>• {suggestion.exercises.length} exercice(s)</p>
                          <p>• Pattern: {suggestion.program.defaultRepsPattern}</p>
                          {suggestion.program.restSeconds && (
                            <p>• Repos: {suggestion.program.restSeconds}s</p>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            onClick={() => acceptSuggestionAndCreate(suggestion.id)}
                            className="text-sm px-3 py-1"
                          >
                            ✓ Créer ce programme
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => rejectSuggestion(suggestion.id)}
                            className="text-sm px-3 py-1"
                          >
                            ✗ Refuser
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          disabled={!isConfigured}
        />
      </div>
    </div>
  )
}
