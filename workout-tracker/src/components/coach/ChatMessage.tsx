import type { ChatMessage as ChatMessageType } from '../../types/coach'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 dark:bg-blue-500 text-white ml-8'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-8'
        }`}
        style={{ maxWidth: 'none', overflow: 'visible' }}
      >
        {/* Icône du rôle */}
        <div className="flex items-start gap-2">
          <span className="text-lg flex-shrink-0">
            {isUser ? '👤' : '🤖'}
          </span>
          <div className="flex-1 min-w-0">
            {/* Message content - tout le texte visible, pas de limite */}
            <div
              className="whitespace-pre-wrap break-words text-sm leading-relaxed"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {message.content}
            </div>

            {/* Timestamp */}
            <div
              className={`text-xs mt-2 ${
                isUser
                  ? 'text-blue-200'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
